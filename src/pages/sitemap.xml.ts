import type { APIRoute } from 'astro';
import { stat } from 'node:fs/promises';
import { getMoviePath, getMovieTrailerPath, getMovies } from '../lib/movies';
import { getPersonPath, getPersonProfiles } from '../lib/people';
import { ABOUT_PATH, PEOPLE_PATH, PRIVACY_PATH, QUE_MIRO_HOY_PATH, SITE_URL } from '../lib/seo';

export const prerender = true;

function toAbsoluteUrl(pathname: string): string {
	return new URL(pathname, SITE_URL).toString();
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function toLastMod(value: Date): string {
	return value.toISOString();
}

async function getFileLastMod(pathname: string): Promise<string | undefined> {
	try {
		const fileStats = await stat(pathname);
		return toLastMod(fileStats.mtime);
	} catch {
		return undefined;
	}
}

export const GET: APIRoute = async () => {
	const movies = getMovies();
	const people = getPersonProfiles();
	const movieEntries = await Promise.all(
		movies.map(async (movie) => ({
			pathname: getMoviePath(movie.slug),
			lastmod: await getFileLastMod(`src/data/movies/${movie.slug}.json`),
		})),
	);
	const trailerEntries = await Promise.all(
		movies
			.filter((movie) => String(movie.trailerYoutubeId ?? '').trim().length > 0)
			.map(async (movie) => ({
				pathname: getMovieTrailerPath(movie.slug),
				lastmod: await getFileLastMod(`src/data/movies/${movie.slug}.json`),
			})),
	);
	const personEntries = await Promise.all(
		people.map(async (person) => ({
			pathname: getPersonPath(person.slug),
			lastmod: await getFileLastMod('src/data/personProfiles.ts'),
		})),
	);
	const homeLastMod =
		(await getFileLastMod('src/pages/index.astro')) ??
		movieEntries
			.map((entry) => entry.lastmod)
			.filter((value): value is string => Boolean(value))
			.sort()
			.at(-1);
	const aboutLastMod = await getFileLastMod('src/pages/sobre-cine-posta.astro');
	const peopleIndexLastMod = await getFileLastMod('src/pages/personas/index.astro');
	const privacyLastMod = await getFileLastMod('src/pages/politica-de-privacidad.astro');
	const postometroLastMod = await getFileLastMod('src/pages/que-miro-hoy.astro');
	const entries = [
		{ pathname: '/', lastmod: homeLastMod },
		{ pathname: QUE_MIRO_HOY_PATH, lastmod: postometroLastMod },
		{ pathname: PEOPLE_PATH, lastmod: peopleIndexLastMod },
		{ pathname: ABOUT_PATH, lastmod: aboutLastMod },
		{ pathname: PRIVACY_PATH, lastmod: privacyLastMod },
		...personEntries,
		...movieEntries,
		...trailerEntries,
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
		.map((entry) => {
			const loc = `  <url><loc>${escapeXml(toAbsoluteUrl(entry.pathname))}</loc>`;
			const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
			return `${loc}${lastmod}</url>`;
		})
		.join('\n')}\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
