import type { Movie } from '../types/movie';
import { getMoviePath, getPosterUrl } from './movies';

export const SITE_URL = 'https://www.cineposta.com.ar';
export const SITE_NAME = 'Cine Posta';
export const SITE_ALTERNATE_NAME = 'cineposta';
export const SITE_LOCALE = 'es_AR';
export const SITE_LANGUAGE = 'es-AR';
export const CONTACT_EMAIL = 'yosoyvargas@hotmail.com';
export const SITE_DESCRIPTION =
	'Cine Posta es un sitio argentino de reseñas cortas, honestas y directas sobre películas, con veredictos claros para decidir rápido qué ver.';
export const SITE_LOGO_PATH = '/brand/cineposta-logo-full.png';
export const ABOUT_PATH = '/sobre-cine-posta/';

type StructuredDataValue = Record<string, unknown>;

function asAbsoluteUrl(value: string): string {
	return new URL(value, SITE_URL).toString();
}

function getOrganizationId(): string {
	return `${SITE_URL}/#organization`;
}

function getWebsiteId(): string {
	return `${SITE_URL}/#website`;
}

function getCollectionPageId(): string {
	return `${SITE_URL}/#webpage`;
}

function createOrganizationSchema(): StructuredDataValue {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': getOrganizationId(),
		name: SITE_NAME,
		alternateName: SITE_ALTERNATE_NAME,
		url: `${SITE_URL}/`,
		description: SITE_DESCRIPTION,
		email: `mailto:${CONTACT_EMAIL}`,
		logo: {
			'@type': 'ImageObject',
			url: asAbsoluteUrl(SITE_LOGO_PATH),
		},
		sameAs: ['https://cafecito.app/cineposta'],
	};
}

function createWebsiteSchema(): StructuredDataValue {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': getWebsiteId(),
		url: `${SITE_URL}/`,
		name: SITE_NAME,
		alternateName: SITE_ALTERNATE_NAME,
		description: SITE_DESCRIPTION,
		inLanguage: SITE_LANGUAGE,
		publisher: {
			'@id': getOrganizationId(),
		},
	};
}

export function createHomeStructuredData(
	movies: Pick<Movie, 'slug' | 'title'>[],
	pageTitle: string,
	pageDescription: string,
): StructuredDataValue[] {
	const homepageUrl = `${SITE_URL}/`;
	const itemListId = `${SITE_URL}/#itemlist`;
	const listItems = movies.slice(0, 24).map((movie, index) => ({
		'@type': 'ListItem',
		position: index + 1,
		url: asAbsoluteUrl(getMoviePath(movie.slug)),
		name: movie.title,
	}));

	return [
		createOrganizationSchema(),
		createWebsiteSchema(),
		{
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			'@id': getCollectionPageId(),
			url: homepageUrl,
			name: pageTitle,
			description: pageDescription,
			inLanguage: SITE_LANGUAGE,
			isPartOf: {
				'@id': getWebsiteId(),
			},
			about: {
				'@id': getOrganizationId(),
			},
			mainEntity: {
				'@id': itemListId,
			},
		},
		{
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			'@id': itemListId,
			name: `${SITE_NAME} catálogo de películas`,
			url: homepageUrl,
			numberOfItems: listItems.length,
			itemListOrder: 'https://schema.org/ItemListOrderDescending',
			itemListElement: listItems,
		},
	];
}

export function createAboutPageStructuredData(
	pageTitle: string,
	pageDescription: string,
): StructuredDataValue[] {
	const aboutUrl = asAbsoluteUrl(ABOUT_PATH);

	return [
		createOrganizationSchema(),
		createWebsiteSchema(),
		{
			'@context': 'https://schema.org',
			'@type': 'AboutPage',
			'@id': `${aboutUrl}#webpage`,
			url: aboutUrl,
			name: pageTitle,
			description: pageDescription,
			inLanguage: SITE_LANGUAGE,
			isPartOf: {
				'@id': getWebsiteId(),
			},
			about: {
				'@id': getOrganizationId(),
			},
		},
	];
}

export function createMovieStructuredData(
	movie: Pick<
		Movie,
		| 'slug'
		| 'title'
		| 'originalTitle'
		| 'year'
		| 'releaseDate'
		| 'category'
		| 'genres'
		| 'poster'
		| 'screenshots'
		| 'director'
		| 'mainCast'
		| 'productionCompany'
		| 'review'
	>,
	pageTitle: string,
	pageDescription: string,
): StructuredDataValue[] {
	const movieUrl = asAbsoluteUrl(getMoviePath(movie.slug));
	const imageUrls = [
		getPosterUrl(movie.poster),
		...(movie.screenshots ?? []).slice(0, 2).map((value) => getPosterUrl(value)),
	].filter(Boolean);

	const movieSchema: StructuredDataValue = {
		'@context': 'https://schema.org',
		'@type': 'Movie',
		'@id': `${movieUrl}#movie`,
		url: movieUrl,
		name: movie.title,
		description: pageDescription,
		image: imageUrls,
		director: {
			'@type': 'Person',
			name: movie.director,
		},
		actor: movie.mainCast.map((actor) => ({
			'@type': 'Person',
			name: actor,
		})),
		genre: movie.genres?.length ? movie.genres : [movie.category],
		productionCompany: {
			'@type': 'Organization',
			name: movie.productionCompany,
		},
		review: {
			'@type': 'Review',
			author: {
				'@type': 'Organization',
				'@id': getOrganizationId(),
				name: SITE_NAME,
			},
			publisher: {
				'@type': 'Organization',
				'@id': getOrganizationId(),
				name: SITE_NAME,
			},
			inLanguage: SITE_LANGUAGE,
			name: `${movie.title} (${movie.year})`,
			reviewBody: movie.review,
		},
	};

	if (movie.originalTitle && movie.originalTitle !== movie.title) {
		movieSchema.alternateName = movie.originalTitle;
	}

	if (movie.releaseDate) {
		movieSchema.datePublished = movie.releaseDate;
	}

	return [
		movieSchema,
		{
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			'@id': `${movieUrl}#webpage`,
			url: movieUrl,
			name: pageTitle,
			description: pageDescription,
			inLanguage: SITE_LANGUAGE,
			isPartOf: {
				'@id': getWebsiteId(),
			},
			about: {
				'@id': `${movieUrl}#movie`,
			},
			mainEntity: {
				'@id': `${movieUrl}#movie`,
			},
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			'@id': `${movieUrl}#breadcrumb`,
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: SITE_NAME,
					item: `${SITE_URL}/`,
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: movie.title,
					item: movieUrl,
				},
			],
		},
	];
}
