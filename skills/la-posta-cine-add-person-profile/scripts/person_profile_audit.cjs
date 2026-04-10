#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function usage() {
	console.log(
		[
			'Usage:',
			'  node person_profile_audit.cjs --candidate <slug>',
			'  node person_profile_audit.cjs --candidate <slug-a> --candidate <slug-b>',
			'  node person_profile_audit.cjs --all',
			'',
			'Options:',
			'  --candidate <slug>   Candidate profile slug to audit. Repeat for batch mode.',
			'  --all                Audit every profile in src/data/personProfiles.ts.',
			'  --repo <path>        Repo root. Defaults to current working directory.',
			'  --require-dist       Also require dist/personas/<slug>/index.html to exist.',
		].join('\n'),
	);
}

function parseArgs(argv) {
	const args = {
		candidates: [],
		repo: process.cwd(),
		requireDist: false,
		all: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		switch (token) {
			case '--candidate': {
				const value = argv[index + 1];
				if (!value) {
					throw new Error('Missing value for --candidate');
				}
				args.candidates.push(value);
				index += 1;
				break;
			}
			case '--repo': {
				const value = argv[index + 1];
				if (!value) {
					throw new Error('Missing value for --repo');
				}
				args.repo = path.resolve(value);
				index += 1;
				break;
			}
			case '--require-dist':
				args.requireDist = true;
				break;
			case '--all':
				args.all = true;
				break;
			case '--help':
			case '-h':
				usage();
				process.exit(0);
			default:
				throw new Error(`Unknown argument: ${token}`);
		}
	}

	if (!args.all && args.candidates.length === 0) {
		throw new Error('Provide at least one --candidate or use --all');
	}

	return args;
}

function normalizeWhitespace(value) {
	return String(value || '')
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizePersonName(value) {
	return normalizeWhitespace(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function splitCreditNames(value) {
	return normalizeWhitespace(value)
		.split(/\s*,\s*|\s+y\s+/i)
		.map((entry) => normalizeWhitespace(entry))
		.filter(Boolean);
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadPersonProfiles(filePath) {
	const source = fs.readFileSync(filePath, 'utf8');
	const transformed = source
		.replace(/^import\s+type\s+.+?;\s*$/gm, '')
		.replace(
			/export\s+const\s+personProfiles\s*:\s*Record<string,\s*PersonProfileRecord>\s*=/,
			'module.exports.personProfiles =',
		);

	const sandbox = {
		module: { exports: {} },
		exports: {},
		require,
		console,
	};

	vm.runInNewContext(transformed, sandbox, { filename: filePath });
	return sandbox.module.exports.personProfiles || {};
}

function getMovies(repoRoot) {
	const moviesDir = path.join(repoRoot, 'src', 'data', 'movies');
	return fs
		.readdirSync(moviesDir)
		.filter((entry) => entry.endsWith('.json'))
		.map((entry) => readJson(path.join(moviesDir, entry)));
}

function getConnectedMovieSlugs(profileName, movies) {
	const normalizedName = normalizePersonName(profileName);
	return movies
		.filter((movie) => {
			const directorNames = splitCreditNames(movie.director || '');
			const castNames = (movie.mainCast || []).flatMap((entry) => splitCreditNames(entry));
			const awardRecipients = ((movie.awards && movie.awards.wins) || [])
				.flatMap((entry) => splitCreditNames(entry.recipient || ''));
			return [...directorNames, ...castNames, ...awardRecipients].some(
				(entry) => normalizePersonName(entry) === normalizedName,
			);
		})
		.map((movie) => movie.slug);
}

function addFinding(findings, severity, scope, message) {
	findings.push({ severity, scope, message });
}

function isHttpsUrl(value) {
	return /^https:\/\/.+/i.test(String(value || ''));
}

function auditProfile({ slug, profile, peopleByName, moviesBySlug, allMovies, requireDist, repoRoot, duplicateNameCounts }) {
	const findings = [];
	const scope = slug;
	const personRecord = peopleByName.get(normalizePersonName(profile.name));
	const connectedMovieSlugs = new Set(getConnectedMovieSlugs(profile.name, allMovies));

	if (!profile.slug || profile.slug !== slug) {
		addFinding(findings, 'error', scope, 'slug faltante o inconsistente con la clave del record.');
	}

	if (!normalizeWhitespace(profile.name)) {
		addFinding(findings, 'error', scope, 'name faltante.');
	}

	if (!normalizeWhitespace(profile.headline)) {
		addFinding(findings, 'error', scope, 'headline faltante.');
	}

	if (!Array.isArray(profile.roles) || profile.roles.length === 0) {
		addFinding(findings, 'error', scope, 'roles debe tener al menos un valor.');
	}

	if (!normalizeWhitespace(profile.spotlight)) {
		addFinding(findings, 'error', scope, 'spotlight faltante.');
	}

	if (!Array.isArray(profile.biography) || profile.biography.length < 2 || profile.biography.length > 4) {
		addFinding(findings, 'error', scope, 'biography debe tener entre 2 y 4 parrafos.');
	} else if (profile.biography.some((entry) => !normalizeWhitespace(entry))) {
		addFinding(findings, 'error', scope, 'biography contiene parrafos vacios.');
	}

	if (!Array.isArray(profile.stats) || profile.stats.length === 0) {
		addFinding(findings, 'error', scope, 'stats debe tener al menos un milestone.');
	}

	if (!Array.isArray(profile.awards) || profile.awards.length === 0) {
		addFinding(findings, 'error', scope, 'awards debe incluir al menos un galardon verificado.');
	}

	if (!Array.isArray(profile.knownFor) || profile.knownFor.length === 0) {
		addFinding(findings, 'error', scope, 'knownFor debe tener al menos una pelicula.');
	}

	if (!Array.isArray(profile.referenceUrls) || profile.referenceUrls.length === 0) {
		addFinding(findings, 'error', scope, 'referenceUrls faltante.');
	} else {
		for (const url of profile.referenceUrls) {
			if (!isHttpsUrl(url)) {
				addFinding(findings, 'error', scope, `referenceUrl invalida: ${url}`);
			}
		}
		if (profile.referenceUrls.length < 2) {
			addFinding(findings, 'warn', scope, 'referenceUrls tiene muy poca cobertura; idealmente usar 2 o mas fuentes.');
		}
	}

	if (!personRecord) {
		addFinding(findings, 'error', scope, 'No existe entrada correspondiente en src/data/people.json.');
	} else {
		if (!profile.profileImage && !personRecord.image && !personRecord.remoteImageUrl) {
			addFinding(findings, 'error', scope, 'La ficha no tiene cobertura de imagen.');
		}

		if (!profile.profileImage) {
			addFinding(findings, 'warn', scope, 'La ficha exclusiva depende de la imagen compacta de people.json; conviene definir profileImage.');
		}
	}

	if (duplicateNameCounts.get(normalizePersonName(profile.name)) > 1) {
		addFinding(findings, 'error', scope, 'Hay mas de un profile con el mismo nombre normalizado.');
	}

	if (connectedMovieSlugs.size === 0) {
		addFinding(findings, 'error', scope, 'La persona no tiene filmografia conectada dentro del catalogo actual.');
	}

	for (const movieSlug of profile.knownFor || []) {
		if (!moviesBySlug.has(movieSlug)) {
			addFinding(findings, 'error', scope, `knownFor referencia una pelicula inexistente: ${movieSlug}`);
			continue;
		}
		if (!connectedMovieSlugs.has(movieSlug)) {
			addFinding(findings, 'error', scope, `knownFor incluye ${movieSlug} pero esa pelicula no esta conectada a la persona en el catalogo.`);
		}
	}

	if (profile.profileImage && !isHttpsUrl(profile.profileImage)) {
		addFinding(findings, 'warn', scope, 'profileImage no es https; revisar estrategia de imagen.');
	}

	if (requireDist) {
		const distPath = path.join(repoRoot, 'dist', 'personas', slug, 'index.html');
		if (!fs.existsSync(distPath)) {
			addFinding(findings, 'error', scope, `No existe salida compilada esperada en ${path.relative(repoRoot, distPath)}`);
		}
	}

	return findings;
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	const repoRoot = args.repo;
	const profilesPath = path.join(repoRoot, 'src', 'data', 'personProfiles.ts');
	const peoplePath = path.join(repoRoot, 'src', 'data', 'people.json');

	if (!fs.existsSync(profilesPath)) {
		throw new Error(`No existe ${profilesPath}`);
	}

	if (!fs.existsSync(peoplePath)) {
		throw new Error(`No existe ${peoplePath}`);
	}

	const profiles = loadPersonProfiles(profilesPath);
	const peopleCatalog = readJson(peoplePath);
	const allMovies = getMovies(repoRoot);
	const moviesBySlug = new Map(allMovies.map((movie) => [movie.slug, movie]));
	const peopleByName = new Map(
		Object.entries(peopleCatalog).map(([key, value]) => [
			normalizePersonName((value && value.name) || key),
			value,
		]),
	);
	const duplicateNameCounts = new Map();

	for (const profile of Object.values(profiles)) {
		const normalizedName = normalizePersonName(profile.name);
		duplicateNameCounts.set(normalizedName, (duplicateNameCounts.get(normalizedName) || 0) + 1);
	}

	const candidateSlugs = args.all ? Object.keys(profiles) : args.candidates;
	const findings = [];

	for (const slug of candidateSlugs) {
		const profile = profiles[slug];
		if (!profile) {
			addFinding(findings, 'error', slug, 'No existe ese slug en src/data/personProfiles.ts.');
			continue;
		}

		findings.push(
			...auditProfile({
				slug,
				profile,
				peopleByName,
				moviesBySlug,
				allMovies,
				requireDist: args.requireDist,
				repoRoot,
				duplicateNameCounts,
			}),
		);
	}

	const errors = findings.filter((entry) => entry.severity === 'error');
	const warnings = findings.filter((entry) => entry.severity === 'warn');

	if (findings.length === 0) {
		console.log(`Person profile audit passed for ${candidateSlugs.length} candidate(s).`);
		return;
	}

	for (const finding of findings) {
		const label = finding.severity.toUpperCase();
		console.log(`[${label}] ${finding.scope}: ${finding.message}`);
	}

	if (errors.length > 0) {
		console.error(
			`Person profile audit failed with ${errors.length} error(s) and ${warnings.length} warning(s).`,
		);
		process.exit(1);
	}

	console.log(`Person profile audit passed with ${warnings.length} warning(s).`);
}

try {
	main();
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
