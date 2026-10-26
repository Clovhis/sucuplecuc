import { readFile } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const SITE_ORIGIN = 'https://www.cineposta.com.ar';

function getLocs(xml) {
	return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), ([, value]) => value);
}

function getDistHtmlPath(url) {
	const parsed = new URL(url);
	if (parsed.origin !== SITE_ORIGIN || parsed.search || parsed.hash) {
		throw new Error(`Sitemap URL must be a canonical Cine Posta URL: ${url}`);
	}

	const pathname = decodeURIComponent(parsed.pathname);
	return pathname === '/'
		? path.join(DIST_DIR, 'index.html')
		: path.join(DIST_DIR, pathname, 'index.html');
}

async function readHtmlForUrl(url) {
	return readFile(getDistHtmlPath(url), 'utf8');
}

function getCanonical(html) {
	return html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
}

function isNoindex(html) {
	return /<meta name="robots" content="[^"]*\bnoindex\b/i.test(html);
}

function getInternalLinks(html, pageUrl) {
	return Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi), ([, rawHref]) => {
		const href = rawHref.replace(/&amp;/g, '&');
		try {
			const url = new URL(href, pageUrl);
			return url.origin === SITE_ORIGIN ? url : undefined;
		} catch {
			return undefined;
		}
	}).filter(Boolean);
}

function checkUnique(values, label, failures) {
	const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
	if (duplicates.length > 0) {
		failures.push(`${label} contains duplicate URLs, e.g. ${duplicates[0]}`);
	}
}

async function main() {
	const sitemap = await readFile(path.join(DIST_DIR, 'sitemap.xml'), 'utf8');
	const sitemapUrls = getLocs(sitemap);
	const failures = [];
	const internalPageUrls = new Set();
	const gameNavigation = new Map();

	if (sitemapUrls.length === 0) failures.push('sitemap.xml has no URLs.');
	if (/<lastmod>/i.test(sitemap)) {
		failures.push('sitemap.xml must not use build filesystem mtimes as lastmod values.');
	}
	checkUnique(sitemapUrls, 'sitemap.xml', failures);

	for (const url of sitemapUrls) {
		try {
			const html = await readHtmlForUrl(url);
			if (isNoindex(html)) failures.push(`Noindex page present in sitemap.xml: ${url}`);
			if (getCanonical(html) !== url) {
				failures.push(`Sitemap canonical mismatch for ${url}; found ${getCanonical(html) ?? 'none'}.`);
			}
			const isGameEntry = new URL(url).pathname === '/' || new URL(url).pathname.startsWith('/juegos/');
			if (isGameEntry) gameNavigation.set(url, new Set());
			for (const linkedUrl of getInternalLinks(html, url)) {
				if (linkedUrl.searchParams.has('backTo')) {
					failures.push(`Legacy backTo URL linked from ${url}: ${linkedUrl.toString()}`);
				}
				if (linkedUrl.pathname.startsWith('/trailers/')) {
					failures.push(`Legacy trailer URL linked from ${url}: ${linkedUrl.toString()}`);
				}
				linkedUrl.search = '';
				linkedUrl.hash = '';
				internalPageUrls.add(linkedUrl.toString());
				if (isGameEntry) gameNavigation.get(url).add(linkedUrl.toString());
			}
		} catch (error) {
			failures.push(`Could not validate sitemap URL ${url}: ${error.message}`);
		}
	}

	for (const url of internalPageUrls) {
		try {
			await readHtmlForUrl(url);
		} catch {
			failures.push(`Broken internal page link found in a sitemap page: ${url}`);
		}
	}

	// Games must be discoverable through normal HTML links from home, not just listed in XML.
	const reachableGames = new Set();
	const pendingGames = [`${SITE_ORIGIN}/`];
	while (pendingGames.length) {
		const url = pendingGames.pop();
		if (reachableGames.has(url)) continue;
		reachableGames.add(url);
		for (const target of gameNavigation.get(url) ?? []) if (gameNavigation.has(target)) pendingGames.push(target);
	}
	for (const url of sitemapUrls.filter(value => new URL(value).pathname.startsWith('/juegos/'))) {
		if (!reachableGames.has(url)) failures.push(`Game page is unreachable from home: ${url}`);
		if (url !== `${SITE_ORIGIN}/juegos/` && !gameNavigation.get(`${SITE_ORIGIN}/juegos/`)?.has(url)) failures.push(`Game page is missing from the games hub: ${url}`);
		if (![...gameNavigation].some(([source, targets]) => source !== url && targets.has(url))) failures.push(`Game page has no incoming internal link: ${url}`);
	}

	if (failures.length > 0) {
		console.error('Sitemap indexability validation failed:');
		for (const failure of failures) console.error(`- ${failure}`);
		process.exit(1);
	}

	console.log(
		`Sitemap indexability validation passed: ${sitemapUrls.length} canonical pages.`,
	);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
