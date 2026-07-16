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

function checkUnique(values, label, failures) {
	const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
	if (duplicates.length > 0) {
		failures.push(`${label} contains duplicate URLs, e.g. ${duplicates[0]}`);
	}
}

async function main() {
	const [sitemap, videoSitemap] = await Promise.all([
		readFile(path.join(DIST_DIR, 'sitemap.xml'), 'utf8'),
		readFile(path.join(DIST_DIR, 'video-sitemap.xml'), 'utf8'),
	]);
	const sitemapUrls = getLocs(sitemap);
	const videoSitemapUrls = getLocs(videoSitemap);
	const sitemapUrlSet = new Set(sitemapUrls);
	const failures = [];

	if (sitemapUrls.length === 0) failures.push('sitemap.xml has no URLs.');
	if (/<lastmod>/i.test(sitemap)) {
		failures.push('sitemap.xml must not use build filesystem mtimes as lastmod values.');
	}
	checkUnique(sitemapUrls, 'sitemap.xml', failures);
	checkUnique(videoSitemapUrls, 'video-sitemap.xml', failures);

	for (const url of sitemapUrls) {
		try {
			const html = await readHtmlForUrl(url);
			if (isNoindex(html)) failures.push(`Noindex page present in sitemap.xml: ${url}`);
			if (getCanonical(html) !== url) {
				failures.push(`Sitemap canonical mismatch for ${url}; found ${getCanonical(html) ?? 'none'}.`);
			}
		} catch (error) {
			failures.push(`Could not validate sitemap URL ${url}: ${error.message}`);
		}
	}

	for (const url of videoSitemapUrls) {
		if (!sitemapUrlSet.has(url)) {
			failures.push(`Video sitemap URL is absent from sitemap.xml: ${url}`);
		}
	}

	if (failures.length > 0) {
		console.error('Sitemap indexability validation failed:');
		for (const failure of failures) console.error(`- ${failure}`);
		process.exit(1);
	}

	console.log(
		`Sitemap indexability validation passed: ${sitemapUrls.length} canonical pages and ${videoSitemapUrls.length} video entries.`,
	);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
