#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const DEFAULT_ROOT = 'src/data/movies';
const DEFAULT_BASE_REF = 'main';
const ALLOWED_PLATFORMS = new Set([
	'Netflix',
	'HBO Max',
	'Apple TV',
	'Cine',
	'Prime Video',
	'Disney Plus',
	'Crunchyroll',
	'Stremio',
]);
const ALLOWED_VERDICTS = new Set(['recomendada', 'zafa', 'no_recomendada', 'basura_atomica']);
const ALLOWED_AWARDS = new Set(['oscar', 'grammy', 'cannes']);
const ALLOWED_IDEAL_FOR_TAGS = new Set(['solo', 'en pareja', 'con amigos', 'domingo', 'trasnoche']);
const HTML_ENTITY_PATTERN = /&(?:#x?[0-9a-f]+|amp|quot|lt|gt|nbsp);/i;
const SCRAPE_ARTIFACT_PATTERN = /\[\s*,?\s*[0-9a-z]+\s*,?\s*\]/i;

function parseArgs(argv) {
	const args = {
		root: DEFAULT_ROOT,
		baseRef: DEFAULT_BASE_REF,
		candidates: [],
		recent: false,
		format: 'text',
		skipYoutube: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--root') {
			args.root = argv[++index];
		} else if (arg === '--base-ref') {
			args.baseRef = argv[++index];
		} else if (arg === '--candidate') {
			args.candidates.push(argv[++index]);
		} else if (arg === '--recent') {
			args.recent = true;
		} else if (arg === '--format') {
			args.format = argv[++index];
		} else if (arg === '--skip-youtube') {
			args.skipYoutube = true;
		} else if (arg === '--help' || arg === '-h') {
			args.help = true;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}

	return args;
}

function usage() {
	console.log(
		[
			'Usage:',
			'  node audit_recent_movies.cjs --base-ref main --recent',
			'  node audit_recent_movies.cjs --candidate src/data/movies/foo-2024.json --candidate src/data/movies/bar-2025.json',
			'',
			'Options:',
			'  --root <dir>         Movie directory. Default: src/data/movies',
			'  --base-ref <ref>     Git base ref for recent diff. Default: main',
			'  --candidate <path>   Explicit candidate movie file. Repeat for batch mode.',
			'  --recent             Audit files added/modified in <base-ref>...HEAD under movie root.',
			'  --format <type>      text | json. Default: text',
			'  --skip-youtube       Skip YouTube oEmbed checks.',
		].join('\n'),
	);
}

function normalizeText(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function runGit(args, options = {}) {
	const result = spawnSync('git', args, {
		cwd: options.cwd || process.cwd(),
		encoding: 'utf8',
	});

	if (result.status !== 0) {
		const stderr = result.stderr?.trim();
		throw new Error(stderr || `git ${args.join(' ')} failed`);
	}

	return result.stdout.trim();
}

function listRecentCandidates(rootDir, baseRef) {
	const output = runGit(['diff', '--name-status', '--diff-filter=AM', '--relative', `${baseRef}...HEAD`, '--', rootDir]);
	if (!output) {
		return [];
	}

	return output
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [, filePath] = line.split(/\s+/, 2);
			return filePath;
		})
		.filter(Boolean);
}

function listCommittedChanges(baseRef) {
	const output = runGit(['diff', '--name-only', '--relative', `${baseRef}...HEAD`]);
	if (!output) {
		return [];
	}

	return output
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function addFinding(findings, severity, code, file, message) {
	findings.push({ severity, code, file, message });
}

function collectStringFields(value, currentPath, output) {
	if (typeof value === 'string') {
		output.push({ path: currentPath, value });
		return;
	}

	if (Array.isArray(value)) {
		for (const [index, entry] of value.entries()) {
			collectStringFields(entry, `${currentPath}[${index}]`, output);
		}
		return;
	}

	if (value && typeof value === 'object') {
		for (const [key, entry] of Object.entries(value)) {
			collectStringFields(entry, currentPath ? `${currentPath}.${key}` : key, output);
		}
	}
}

function validateEditorialSlugList({
	movieSlug,
	candidatePath,
	fieldName,
	value,
	findings,
	knownMovieSlugs,
	requiredMinimum,
	recommendedMaximum,
}) {
	if (!Array.isArray(value) || value.length < requiredMinimum) {
		addFinding(
			findings,
			'error',
			fieldName === 'becauseYouLiked' ? 'missing-editorial-bridge' : 'missing-editorial-related',
			candidatePath,
			`editorial.${fieldName} must include at least ${requiredMinimum} existing movie slug${requiredMinimum === 1 ? '' : 's'}.`,
		);
		return;
	}

	if (value.length > recommendedMaximum) {
		addFinding(
			findings,
			'warn',
			'editorial-list-too-long',
			candidatePath,
			`editorial.${fieldName} has ${value.length} entries, but the UI only uses up to ${recommendedMaximum}.`,
		);
	}

	const seen = new Set();
	for (const [index, item] of value.entries()) {
		if (typeof item !== 'string' || item.trim().length === 0) {
			addFinding(findings, 'error', 'invalid-editorial-slug', candidatePath, `editorial.${fieldName}[${index}] must be a non-empty slug string.`);
			continue;
		}

		const slug = item.trim();
		if (slug === movieSlug) {
			addFinding(findings, 'error', 'self-editorial-slug', candidatePath, `editorial.${fieldName}[${index}] points back to the same movie.`);
		}
		if (seen.has(slug)) {
			addFinding(findings, 'error', 'duplicate-editorial-slug', candidatePath, `editorial.${fieldName} repeats slug "${slug}".`);
		}
		seen.add(slug);

		if (!knownMovieSlugs.has(slug)) {
			addFinding(findings, 'error', 'unknown-editorial-slug', candidatePath, `editorial.${fieldName}[${index}] references unknown slug "${slug}".`);
		}
	}
}

function validateMovieShape(movie, candidatePath, catalogText, findings, knownMovieSlugs) {
	const requiredStrings = [
		'slug',
		'title',
		'originalTitle',
		'category',
		'poster',
		'director',
		'productionCompany',
		'verdict',
		'verdictLabel',
		'review',
		'releasePlatform',
	];

	for (const field of requiredStrings) {
		if (typeof movie[field] !== 'string' || movie[field].trim().length === 0) {
			addFinding(findings, 'error', 'missing-field', candidatePath, `Missing or empty string field "${field}".`);
		}
	}

	if (!Number.isInteger(movie.year) || movie.year < 1888 || movie.year > 2100) {
		addFinding(findings, 'error', 'invalid-year', candidatePath, `Invalid year "${String(movie.year)}".`);
	}

	if (!Array.isArray(movie.mainCast) || movie.mainCast.length < 2) {
		addFinding(findings, 'error', 'invalid-cast', candidatePath, 'mainCast must contain at least two credited performers.');
	}

	if (!Array.isArray(movie.screenshots)) {
		addFinding(findings, 'error', 'invalid-screenshots', candidatePath, 'screenshots must be an array.');
	}

	if (movie.editorial === undefined || movie.editorial === null || typeof movie.editorial !== 'object' || Array.isArray(movie.editorial)) {
		addFinding(findings, 'error', 'missing-editorial', candidatePath, 'editorial must exist as an object so the recommendation blocks can render with curated links.');
	} else {
		if (
			movie.editorial.idealFor !== undefined &&
			(!Array.isArray(movie.editorial.idealFor) ||
				movie.editorial.idealFor.some((tag) => typeof tag !== 'string' || !ALLOWED_IDEAL_FOR_TAGS.has(tag)))
		) {
			addFinding(findings, 'error', 'invalid-ideal-for', candidatePath, 'editorial.idealFor contains unsupported tags.');
		}

		validateEditorialSlugList({
			movieSlug: String(movie.slug || ''),
			candidatePath,
			fieldName: 'becauseYouLiked',
			value: movie.editorial.becauseYouLiked,
			findings,
			knownMovieSlugs,
			requiredMinimum: 1,
			recommendedMaximum: 2,
		});

		validateEditorialSlugList({
			movieSlug: String(movie.slug || ''),
			candidatePath,
			fieldName: 'related',
			value: movie.editorial.related,
			findings,
			knownMovieSlugs,
			requiredMinimum: 3,
			recommendedMaximum: 4,
		});

		if (Array.isArray(movie.editorial.becauseYouLiked) && Array.isArray(movie.editorial.related)) {
			const overlap = movie.editorial.becauseYouLiked.filter((slug) => movie.editorial.related.includes(slug));
			if (overlap.length > 0) {
				addFinding(findings, 'warn', 'editorial-overlap', candidatePath, `editorial.becauseYouLiked and editorial.related repeat: ${overlap.join(', ')}.`);
			}
		}
	}

	if (!movie.awards || !Array.isArray(movie.awards.wins)) {
		addFinding(findings, 'error', 'invalid-awards', candidatePath, 'awards.wins must exist and be an array.');
	} else {
		for (const [index, win] of movie.awards.wins.entries()) {
			if (!win || typeof win !== 'object') {
				addFinding(findings, 'error', 'invalid-award-entry', candidatePath, `Award entry #${index + 1} is not an object.`);
				continue;
			}

			if (!ALLOWED_AWARDS.has(win.award)) {
				addFinding(findings, 'error', 'unsupported-award', candidatePath, `Unsupported award type "${String(win.award)}".`);
			}

			if (typeof win.category !== 'string' || win.category.trim().length === 0) {
				addFinding(findings, 'error', 'award-missing-category', candidatePath, `Award entry #${index + 1} is missing category.`);
			}

			if (win.year !== undefined && (!Number.isInteger(win.year) || win.year < 1900 || win.year > 2100)) {
				addFinding(findings, 'error', 'award-invalid-year', candidatePath, `Award entry #${index + 1} has invalid year "${String(win.year)}".`);
			}

			const normalizedCategory = normalizeText(win.category);
			if (win.award === 'oscar' && normalizedCategory.includes('mejor pelicula')) {
				if (typeof win.recipient !== 'string' || win.recipient.trim().length === 0) {
					addFinding(findings, 'error', 'award-missing-recipient', candidatePath, 'Oscar wins for "Mejor película" require recipient.');
				}
			}
		}
	}

	if (!ALLOWED_VERDICTS.has(movie.verdict)) {
		addFinding(findings, 'error', 'invalid-verdict', candidatePath, `Unsupported verdict "${String(movie.verdict)}".`);
	}

	const normalizedVerdictLabel = normalizeText(movie.verdictLabel);
	const normalizedMovieTitle = normalizeText(movie.title);
	const recommendedLabelPatterns = ['muy buena', 'recomendada', 'vale la pena', 'clasico', 'imperdible'];
	if (/\b(19|20)\d{2}\b/.test(movie.verdictLabel) || movie.verdictLabel.length > 24) {
		addFinding(findings, 'warn', 'verdict-label-noisy', candidatePath, 'verdictLabel should read like a short user-facing quality signal, not metadata.');
	}

	if (
		normalizedMovieTitle &&
		normalizedMovieTitle
			.split(' ')
			.some((token) => token.length >= 4 && normalizedVerdictLabel.includes(token))
	) {
		addFinding(findings, 'warn', 'verdict-label-title-leak', candidatePath, 'verdictLabel should not repeat the movie title.');
	}

	if (movie.verdict === 'recomendada' && !recommendedLabelPatterns.some((pattern) => normalizedVerdictLabel.includes(pattern))) {
		addFinding(findings, 'warn', 'verdict-label-tone', candidatePath, 'recomendada entries should use a clearly positive verdictLabel.');
	}

	if (!ALLOWED_PLATFORMS.has(movie.releasePlatform)) {
		addFinding(findings, 'error', 'invalid-platform', candidatePath, `Unsupported releasePlatform "${String(movie.releasePlatform)}".`);
	}

	if (typeof movie.poster !== 'string' || !/^https?:\/\//.test(movie.poster)) {
		addFinding(findings, 'warn', 'poster-url', candidatePath, 'poster should use an absolute http(s) URL.');
	}

	if (movie.country === 'AR' && movie.isArgentinian !== true) {
		addFinding(findings, 'warn', 'argentina-flag', candidatePath, 'country is AR but isArgentinian is not true.');
	}

	if (movie.isArgentinian === true && movie.country !== 'AR') {
		addFinding(findings, 'warn', 'argentina-country', candidatePath, 'isArgentinian is true but country is not AR.');
	}

	const sentences = String(movie.review || '')
		.split(/(?<=[.!?])\s+/)
		.map((part) => part.trim())
		.filter(Boolean);

	if (movie.review.trim().length < 140) {
		addFinding(findings, 'warn', 'short-review', candidatePath, 'review is unusually short.');
	}

	if (sentences.length < 2) {
		addFinding(findings, 'warn', 'review-sentences', candidatePath, 'review should usually have at least two sentences.');
	}

	if (/\b\d+(?:[.,]\d+)?\s*\/\s*(?:10|100)\b/.test(movie.review) || /\b\d{1,3}\s*%\b/.test(movie.review)) {
		addFinding(findings, 'warn', 'numeric-score-review', candidatePath, 'review leaks raw numeric score(s).');
	}

	if (!catalogText.includes(`| ${movie.year} | ${movie.title} | ${movie.slug} |`)) {
		addFinding(findings, 'warn', 'catalog-sync', candidatePath, 'Movie row was not found in docs/movie-catalog-reference.md.');
	}

	const stringFields = [];
	collectStringFields(movie, '', stringFields);
	for (const field of stringFields) {
		if (HTML_ENTITY_PATTERN.test(field.value)) {
			addFinding(findings, 'error', 'html-entity-artifact', candidatePath, `Field "${field.path}" still contains HTML entities.`);
		}

		if (SCRAPE_ARTIFACT_PATTERN.test(field.value)) {
			addFinding(findings, 'error', 'scrape-artifact', candidatePath, `Field "${field.path}" still contains citation or scrape artifacts.`);
		}
	}
}

function validateTrailerId(movie, candidatePath, findings) {
	const value = String(movie.trailerYoutubeId || '').trim();
	if (!value) {
		addFinding(findings, 'error', 'missing-trailer', candidatePath, 'trailerYoutubeId is empty.');
		return null;
	}

	if (!/^[A-Za-z0-9_-]{11}$/.test(value)) {
		addFinding(findings, 'error', 'invalid-trailer-id', candidatePath, `trailerYoutubeId "${value}" does not look like a YouTube video id.`);
		return null;
	}

	return value;
}

function fetchText(url, redirectsLeft = 3) {
	return new Promise((resolve) => {
		const request = https.get(
			url,
			{
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; la-posta-cine-auditor/1.0)',
				},
			},
			(response) => {
				let body = '';
				if (
					response.statusCode >= 300 &&
					response.statusCode < 400 &&
					response.headers.location &&
					redirectsLeft > 0
				) {
					response.resume();
					resolve(fetchText(response.headers.location, redirectsLeft - 1));
					return;
				}

				response.on('data', (chunk) => {
					body += chunk;
				});
				response.on('end', () => {
					resolve({
						ok: response.statusCode === 200,
						statusCode: response.statusCode,
						body,
					});
				});
			},
		);

		request.setTimeout(8000, () => {
			request.destroy(new Error('timeout'));
		});

		request.on('error', (error) => {
			resolve({
				ok: false,
				reason: error.message,
				body: '',
			});
		});
	});
}

function extractYoutubeResultIds(html) {
	return [...new Set((html.match(/watch\?v=([A-Za-z0-9_-]{11})/g) || []).map((match) => match.slice(8)))];
}

function analyzeYoutubeTitle(movieTitle, movieYear, embedTitle) {
	const expectedTitle = normalizeText(movieTitle);
	const normalizedEmbedTitle = normalizeText(embedTitle);
	const expectedTokens = expectedTitle.split(' ').filter(Boolean);
	const titlePhraseMatch = expectedTitle.length > 0 && normalizedEmbedTitle.includes(expectedTitle);
	const longTokenMatch = expectedTokens.some((token) => token.length >= 5 && normalizedEmbedTitle.includes(token));
	const mentionedYears = [...String(embedTitle || '').matchAll(/\b(19|20)\d{2}\b/g)].map((match) => Number(match[0]));
	const yearMentioned = mentionedYears.length > 0;
	const yearMatches = mentionedYears.includes(movieYear);
	const isShortOrAmbiguousTitle = expectedTokens.length <= 2 || expectedTitle.length <= 12;

	return {
		titlePhraseMatch,
		longTokenMatch,
		yearMentioned,
		yearMatches,
		isShortOrAmbiguousTitle,
		titleLooksRelated: titlePhraseMatch || (!isShortOrAmbiguousTitle && longTokenMatch),
	};
}

function checkYoutubeOEmbed(videoId) {
	const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

	return new Promise((resolve) => {
		const request = https.get(url, (response) => {
			let body = '';
			response.on('data', (chunk) => {
				body += chunk;
			});
			response.on('end', () => {
				if (response.statusCode !== 200) {
					resolve({
						ok: false,
						statusCode: response.statusCode,
						reason: `YouTube oEmbed returned HTTP ${response.statusCode}.`,
					});
					return;
				}

				try {
					const data = JSON.parse(body);
					resolve({
						ok: true,
						title: data.title || '',
						authorName: data.author_name || '',
					});
				} catch (error) {
					resolve({
						ok: false,
						reason: `YouTube oEmbed JSON parse failed: ${error.message}`,
					});
				}
			});
		});

		request.setTimeout(8000, () => {
			request.destroy(new Error('timeout'));
		});

		request.on('error', (error) => {
			resolve({
				ok: false,
				reason: `YouTube oEmbed request failed: ${error.message}`,
			});
		});
	});
}

async function searchYoutubeResults(movieTitle, movieYear) {
	const query = encodeURIComponent(`${movieTitle} ${movieYear} trailer`);
	const result = await fetchText(`https://www.youtube.com/results?search_query=${query}`);
	if (!result.ok) {
		return {
			ok: false,
			reason: result.reason || `YouTube search returned HTTP ${result.statusCode}.`,
			videoIds: [],
		};
	}

	return {
		ok: true,
		videoIds: extractYoutubeResultIds(result.body).slice(0, 10),
	};
}

function runEditorialAudit(rootDir, candidates) {
	const fallbackPaths = [
		path.resolve(__dirname, '../../la-posta-cine-add-movie/scripts/review_audit.js'),
		path.resolve(process.env.USERPROFILE || '', '.codex/skills/la-posta-cine-add-movie/scripts/review_audit.js'),
	];
	const reviewAuditPath = fallbackPaths.find((candidatePath) => candidatePath && fs.existsSync(candidatePath));
	if (!reviewAuditPath) {
		return {
			status: 'warn',
			message: `review_audit.js not found in expected repo or global skill locations.`,
		};
	}

	const args = [reviewAuditPath, '--root', rootDir];
	for (const candidate of candidates) {
		args.push('--candidate', candidate);
	}

	const result = spawnSync(process.execPath, args, {
		cwd: process.cwd(),
		encoding: 'utf8',
	});

	if (result.status !== 0) {
		return {
			status: 'error',
			message: (result.stderr || result.stdout || 'review audit failed').trim(),
		};
	}

	return {
		status: 'ok',
		message: (result.stdout || 'review audit passed').trim(),
	};
}

function loadKnownMovieSlugs(rootDir) {
	const knownMovieSlugs = new Set();
	for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.json')) {
			continue;
		}

		try {
			const movie = readJson(path.join(rootDir, entry.name));
			if (typeof movie.slug === 'string' && movie.slug.trim().length > 0) {
				knownMovieSlugs.add(movie.slug.trim());
			}
		} catch {
			// Ignore malformed files here; they are handled later when audited directly.
		}
	}

	return knownMovieSlugs;
}

async function auditCandidates(args) {
	const rootDir = path.resolve(args.root);
	if (!fs.existsSync(rootDir)) {
		throw new Error(`Movies directory not found: ${rootDir}`);
	}

	const candidatePaths = args.candidates.length > 0
		? args.candidates
		: listRecentCandidates(args.root, args.baseRef);

	if (candidatePaths.length === 0) {
		throw new Error('No candidate movie files found to audit.');
	}

	const catalogPath = path.resolve('docs/movie-catalog-reference.md');
	const catalogText = fs.existsSync(catalogPath) ? fs.readFileSync(catalogPath, 'utf8') : '';
	const knownMovieSlugs = loadKnownMovieSlugs(rootDir);
	const findings = [];

	const committedChanges = listCommittedChanges(args.baseRef);
	const normalizedRoot = args.root.replace(/\\/g, '/').replace(/\/+$/, '');
	const unexpectedCommittedChanges = committedChanges.filter((filePath) => {
		const normalizedPath = filePath.replace(/\\/g, '/');
		if (normalizedPath.startsWith(`${normalizedRoot}/`)) {
			return false;
		}
		return normalizedPath !== 'docs/movie-catalog-reference.md';
	});

	for (const filePath of unexpectedCommittedChanges) {
		addFinding(findings, 'warn', 'unexpected-committed-change', filePath, 'Committed diff vs base includes a non-movie path.');
	}

	for (const candidate of candidatePaths) {
		const absolutePath = path.resolve(candidate);
		if (!fs.existsSync(absolutePath)) {
			addFinding(findings, 'error', 'missing-file', candidate, 'Candidate file does not exist on disk.');
			continue;
		}

		let movie;
		try {
			movie = readJson(absolutePath);
		} catch (error) {
			addFinding(findings, 'error', 'invalid-json', candidate, `Failed to parse JSON: ${error.message}`);
			continue;
		}

		validateMovieShape(movie, candidate, catalogText, findings, knownMovieSlugs);
		const trailerId = validateTrailerId(movie, candidate, findings);

		if (trailerId && !args.skipYoutube) {
			const trailerResult = await checkYoutubeOEmbed(trailerId);
			if (!trailerResult.ok) {
				addFinding(findings, 'error', 'youtube-oembed', candidate, trailerResult.reason);
				continue;
			}

			const trailerTitleAnalysis = analyzeYoutubeTitle(movie.title, movie.year, trailerResult.title);
			let youtubeSearch = null;
			if (trailerTitleAnalysis.isShortOrAmbiguousTitle || !trailerTitleAnalysis.titleLooksRelated || !trailerTitleAnalysis.yearMentioned) {
				youtubeSearch = await searchYoutubeResults(movie.title, movie.year);
				if (!youtubeSearch.ok) {
					addFinding(findings, 'warn', 'youtube-search-unavailable', candidate, youtubeSearch.reason);
				}
			}

			if (trailerTitleAnalysis.yearMentioned && !trailerTitleAnalysis.yearMatches) {
				addFinding(findings, 'error', 'youtube-year-mismatch', candidate, `YouTube title "${trailerResult.title}" mentions a different year than ${movie.year}.`);
			}

			if (!trailerTitleAnalysis.titleLooksRelated) {
				if (youtubeSearch?.ok && youtubeSearch.videoIds.includes(trailerId)) {
					addFinding(findings, 'warn', 'youtube-title-mismatch', candidate, `YouTube title "${trailerResult.title}" does not text-match "${movie.title}", but the video does appear in YouTube search results for the movie.`);
				} else {
					addFinding(
						findings,
						'error',
						'youtube-title-mismatch',
						candidate,
						`YouTube title "${trailerResult.title}" does not look related enough to "${movie.title}".`,
					);
				}
			}

			if ((trailerTitleAnalysis.isShortOrAmbiguousTitle || !trailerTitleAnalysis.yearMentioned) && youtubeSearch?.ok && !youtubeSearch.videoIds.includes(trailerId)) {
				addFinding(
					findings,
					'error',
					'youtube-search-mismatch',
					candidate,
					`trailerYoutubeId "${trailerId}" was not found in YouTube search results for "${movie.title} ${movie.year} trailer".`,
				);
			}
		}
	}

	const editorialAudit = runEditorialAudit(args.root, candidatePaths);
	if (editorialAudit.status === 'error') {
		addFinding(findings, 'error', 'review-audit', 'batch', editorialAudit.message);
	} else if (editorialAudit.status === 'warn') {
		addFinding(findings, 'warn', 'review-audit-missing', 'batch', editorialAudit.message);
	}

	return {
		baseRef: args.baseRef,
		root: args.root,
		candidates: candidatePaths,
		editorialAudit,
		findings,
	};
}

function printTextReport(report) {
	const errors = report.findings.filter((finding) => finding.severity === 'error');
	const warnings = report.findings.filter((finding) => finding.severity === 'warn');

	console.log(`Audited ${report.candidates.length} candidate file(s) from ${report.baseRef} against ${report.root}.`);
	console.log(`Editorial audit: ${report.editorialAudit.message}`);

	if (report.findings.length === 0) {
		console.log('Result: PASS');
		return;
	}

	console.log(`Result: FAIL (${errors.length} error(s), ${warnings.length} warning(s))`);
	for (const finding of report.findings) {
		console.log(`[${finding.severity.toUpperCase()}] ${finding.code} :: ${finding.file} :: ${finding.message}`);
	}
}

async function main() {
	let args;
	try {
		args = parseArgs(process.argv.slice(2));
	} catch (error) {
		console.error(error.message);
		usage();
		process.exit(1);
	}

	if (args.help) {
		usage();
		process.exit(0);
	}

	if (!args.recent && args.candidates.length === 0) {
		args.recent = true;
	}

	try {
		const report = await auditCandidates(args);
		if (args.format === 'json') {
			console.log(JSON.stringify(report, null, 2));
		} else {
			printTextReport(report);
		}

		const hasErrors = report.findings.some((finding) => finding.severity === 'error');
		process.exit(hasErrors ? 1 : 0);
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}

main();
