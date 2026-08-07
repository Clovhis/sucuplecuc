import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const PROFILE_SOURCE = path.join(ROOT, 'src', 'data', 'personProfiles.ts');
const PERSON_PAGE_SOURCE = path.join(ROOT, 'src', 'pages', 'personas', '[slug].astro');
const PEOPLE_HELPER_SOURCE = path.join(ROOT, 'src', 'lib', 'people.ts');
const DIST_PERSONAS = path.join(ROOT, 'dist', 'personas');
const DIST_SITEMAP = path.join(ROOT, 'dist', 'sitemap.xml');
const REQUIRE_DIST = process.argv.includes('--require-dist');
const CANDIDATES = process.argv
	.filter((_argument, index, argumentsList) => argumentsList[index - 1] === '--candidate')
	.map((slug) => slug.trim())
	.filter(Boolean);

function normalize(value) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

function getSixWordNgrams(value) {
	const words = normalize(value).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(Boolean);
	return new Set(Array.from({ length: Math.max(0, words.length - 5) }, (_, index) => words.slice(index, index + 6).join(' ')));
}

function legacyBiographyFragments(source) {
	const fragments = [];
	const blocks = source.matchAll(/^\s*biography:\s*\[([\s\S]*?)^\s*\],/gm);
	for (const block of blocks) {
		const strings = block[1].matchAll(/(['"])((?:\\.|(?!\1)[\s\S])*)\1/g);
		for (const entry of strings) {
			const value = entry[2].replace(/\\([\\'"nrt])/g, (_, token) => ({ n: '\n', r: '\r', t: '\t' }[token] ?? token));
			const normalized = normalize(value);
			if (normalized.length >= 160) fragments.push(normalized.slice(0, 160));
		}
	}
	return [...new Set(fragments)];
}

function fail(messages) {
	console.error('Person-profile originality validation failed:');
	for (const message of messages) console.error(`- ${message}`);
	process.exit(1);
}

async function exists(filePath) {
	try {
		await stat(filePath);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	const [profileSource, personPageSource, peopleHelperSource] = await Promise.all([
		readFile(PROFILE_SOURCE, 'utf8'),
		readFile(PERSON_PAGE_SOURCE, 'utf8'),
		readFile(PEOPLE_HELPER_SOURCE, 'utf8'),
	]);
	const failures = [];
	const { personProfiles } = await import(pathToFileURL(PROFILE_SOURCE).href);
	const allProfiles = Object.values(personProfiles);
	const candidateSet = new Set(CANDIDATES);
	const missingCandidates = CANDIDATES.filter((slug) => !personProfiles[slug]);
	if (missingCandidates.length > 0) fail(missingCandidates.map((slug) => `${slug}: no existe en personProfiles.`));
	const profiles = CANDIDATES.length > 0
		? allProfiles.filter((profile) => candidateSet.has(profile.slug))
		: allProfiles;
	const legacyFragments = legacyBiographyFragments(profileSource);
	const editorialParagraphs = new Set();
	const editorialNgrams = profiles.map((profile) => getSixWordNgrams((profile.editorialBiography ?? []).join(' ')));
	const similarPairs = [];

	for (const profile of profiles) {
		const paragraphs = profile.editorialBiography ?? [];
		const wordCount = paragraphs.join(' ').match(/\S+/g)?.length ?? 0;
		if (paragraphs.length !== 2 || wordCount < 70 || wordCount > 150) {
			failures.push(`${profile.slug}: editorialBiography debe tener dos párrafos y entre 70 y 150 palabras.`);
		}
		if ((profile.referenceUrls ?? []).length === 0) {
			failures.push(`${profile.slug}: falta al menos una fuente para el borrador editorial.`);
		}
		for (const paragraph of paragraphs) {
			const normalizedParagraph = normalize(paragraph);
			if (editorialParagraphs.has(normalizedParagraph)) {
				failures.push(`${profile.slug}: repite un párrafo editorial de otro perfil.`);
			}
			editorialParagraphs.add(normalizedParagraph);
			if (legacyFragments.some((fragment) => normalizedParagraph.includes(fragment))) {
				failures.push(`${profile.slug}: editorialBiography reutiliza un fragmento de biography.`);
			}
		}
	}
	for (let left = 0; left < profiles.length; left += 1) {
		for (let right = left + 1; right < profiles.length; right += 1) {
			const leftNgrams = editorialNgrams[left];
			const rightNgrams = editorialNgrams[right];
			const shared = [...leftNgrams].filter((ngram) => rightNgrams.has(ngram)).length;
			const union = leftNgrams.size + rightNgrams.size - shared;
			const similarity = union > 0 ? shared / union : 0;
			if (similarity >= 0.18) {
				similarPairs.push({ left: profiles[left].slug, right: profiles[right].slug, similarity });
			}
		}
	}
	if (similarPairs.length > 0) {
		const examples = similarPairs
			.sort((left, right) => right.similarity - left.similarity)
			.slice(0, 8)
			.map((pair) => `${pair.left}/${pair.right} (${Math.round(pair.similarity * 100)}%)`)
			.join(', ');
		failures.push(`Se detectaron ${similarPairs.length} pares con similitud editorial alta: ${examples}.`);
	}

	if (/profile\.biography\b/.test(personPageSource)) {
		failures.push('La ruta pública de personas no puede renderizar profile.biography (material heredado).');
	}
	if (/profile\.biography\b/.test(peopleHelperSource)) {
		failures.push('El buscador de personas no puede indexar profile.biography (material heredado).');
	}
	if (!/editorialStatus/.test(profileSource) || !/editorialBiography/.test(personPageSource)) {
		failures.push('Falta la separación entre estado editorial y biografía editorial pública.');
	}

	if (!REQUIRE_DIST) {
		if (failures.length) fail(failures);
		console.log('Person-profile originality source validation passed.');
		return;
	}

	if (!(await exists(DIST_PERSONAS)) || !(await exists(DIST_SITEMAP))) {
		failures.push('Falta dist; ejecutá npm run build antes de --require-dist.');
		fail(failures);
	}

	const entries = await readdir(DIST_PERSONAS, { withFileTypes: true });
	const pages = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
		const slug = entry.name;
		const html = await readFile(path.join(DIST_PERSONAS, slug, 'index.html'), 'utf8');
		const status = html.match(/data-person-editorial-status="(approved|pending|informational)"/)?.[1];
		return { slug, html: normalize(html), rawHtml: html, status };
	}));
	const approvedPaths = [];

	for (const page of pages) {
		if (!page.status) {
			failures.push(`${page.slug}: falta data-person-editorial-status en la salida.`);
			continue;
		}
		const hasNoindex = /name="robots" content="noindex, follow/.test(page.rawHtml);
		if (page.status === 'approved') {
			approvedPaths.push(`/personas/${page.slug}/`);
			if (hasNoindex) failures.push(`${page.slug}: un perfil aprobado no debe usar noindex.`);
		} else {
			if (!hasNoindex) failures.push(`${page.slug}: ${page.status} debe usar noindex, follow.`);
		}
		if (!page.rawHtml.includes('Fuentes consultables')) {
			failures.push(`${page.slug}: faltan fuentes visibles para el visitante.`);
		}
		for (const fragment of legacyFragments) {
			if (page.html.includes(fragment)) {
				failures.push(`${page.slug}: un fragmento heredado de biography llegó al HTML público.`);
				break;
			}
		}
	}

	const sitemap = await readFile(DIST_SITEMAP, 'utf8');
	for (const page of pages) {
		const appearsInSitemap = sitemap.includes(`/personas/${page.slug}/`);
		const shouldAppear = approvedPaths.includes(`/personas/${page.slug}/`);
		if (appearsInSitemap !== shouldAppear) {
			failures.push(`${page.slug}: sitemap incompatible con su estado editorial (${page.status}).`);
		}
	}

	if (failures.length) fail(failures);
	console.log(`Person-profile originality validation passed: ${approvedPaths.length} approved, ${pages.length - approvedPaths.length} non-indexable.`);
}

main().catch((error) => fail([error instanceof Error ? error.message : String(error)]));
