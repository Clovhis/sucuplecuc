import type { APIRoute } from 'astro';
import { getMoviePath, getMovies } from '../lib/movies';
import { getPersonPath, getPersonProfiles, isPersonProfileIndexable } from '../lib/people';
import {
	ABOUT_PATH,
	COMMUNITY_PATH,
	CONTACT_PATH,
	COPYRIGHT_PATH,
	EDITORIAL_POLICY_PATH,
	EDITOR_PATH,
	METHODOLOGY_PATH,
	PEOPLE_PATH,
	PRIVACY_PATH,
	QUE_MIRO_HOY_PATH,
	SITE_URL,
	SOURCES_AND_DATA_PATH,
} from '../lib/seo';

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

export const GET: APIRoute = async () => {
	const movies = getMovies();
	const people = getPersonProfiles().filter(isPersonProfileIndexable);
	const entries = [
		{ pathname: '/' },
		{ pathname: QUE_MIRO_HOY_PATH },
		{ pathname: PEOPLE_PATH },
		{ pathname: ABOUT_PATH },
		{ pathname: METHODOLOGY_PATH },
		{ pathname: EDITORIAL_POLICY_PATH },
		{ pathname: SOURCES_AND_DATA_PATH },
		{ pathname: COPYRIGHT_PATH },
		{ pathname: CONTACT_PATH },
		{ pathname: EDITOR_PATH },
		{ pathname: COMMUNITY_PATH },
		{ pathname: PRIVACY_PATH },
		...people.map((person) => ({ pathname: getPersonPath(person.slug) })),
		...movies.map((movie) => ({ pathname: getMoviePath(movie.slug) })),
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
		.map((entry) => {
			const loc = `  <url><loc>${escapeXml(toAbsoluteUrl(entry.pathname))}</loc>`;
			return `${loc}</url>`;
		})
		.join('\n')}\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
