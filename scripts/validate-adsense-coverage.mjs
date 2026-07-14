import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const ADSENSE_LOADER = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const filePath = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(filePath)));
		else files.push(filePath);
	}
	return files;
}

async function getRoutePages(directory) {
	try {
		const files = (await walk(directory)).filter((filePath) => path.basename(filePath) === 'index.html');
		return Promise.all(files.map(async (filePath) => ({
			filePath,
			html: await readFile(filePath, 'utf8'),
		})));
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return [];
		throw error;
	}
}

function countLoaders(html) {
	return html.split(ADSENSE_LOADER).length - 1;
}

function isIndexable(html) {
	return /<meta name="robots" content="index, follow,/.test(html);
}

async function main() {
	const files = (await walk(DIST_DIR)).filter((filePath) => path.basename(filePath) === 'index.html');
	const pages = await Promise.all(files.map(async (filePath) => ({
		filePath,
		route: `/${path.relative(DIST_DIR, path.dirname(filePath)).replace(/\\/g, '/')}/`.replace(/\/index\/$/, '/'),
		html: await readFile(filePath, 'utf8'),
	})));
	const movies = await getRoutePages(path.join(DIST_DIR, 'peliculas'));
	const approvedProfiles = (await getRoutePages(path.join(DIST_DIR, 'personas')))
		.filter((page) => page.html.includes('data-person-editorial-status="approved"'));
	const legacyTrailers = await getRoutePages(path.join(DIST_DIR, 'trailers'));
	const invalid = [];

	for (const page of movies) {
		if (countLoaders(page.html) !== 1) invalid.push(`${page.route}: película debe cargar AdSense exactamente una vez.`);
	}
	for (const page of approvedProfiles) {
		if (countLoaders(page.html) !== 1) invalid.push(`${page.route}: perfil aprobado debe cargar AdSense exactamente una vez.`);
	}
	for (const page of legacyTrailers) {
		if (countLoaders(page.html) !== 0) invalid.push(`${page.route}: trailer legacy no puede cargar AdSense.`);
	}
	for (const page of pages) {
		if (!isIndexable(page.html) || page.route.startsWith('/trailers/') || page.route === '/comunidad/' || page.route.startsWith('/comunidad/')) continue;
		if (countLoaders(page.html) !== 1) invalid.push(`${page.route}: página editorial indexable debe cargar AdSense exactamente una vez.`);
	}

	if (invalid.length) {
		console.error('AdSense coverage validation failed:');
		for (const message of invalid) console.error(`- ${message}`);
		process.exit(1);
	}

	console.log(`AdSense coverage validation passed: ${movies.length}/${movies.length} películas, ${approvedProfiles.length}/${approvedProfiles.length} perfiles aprobados y 0 trailers legacy con AdSense (${legacyTrailers.length} verificados).`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
