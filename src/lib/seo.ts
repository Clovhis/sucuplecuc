import type { Movie, MovieVerdict } from '../types/movie';
import type { PersonFilmographyEntry, PersonProfile } from '../types/person';
import { getMoviePath, getPosterUrl } from './movies';
import { getPersonPath } from './people';

export const SITE_URL = 'https://www.cineposta.com.ar';
export const SITE_NAME = 'Cine Posta';
export const SITE_ALTERNATE_NAMES = ['Cineposta', 'cineposta', 'cineposta.com.ar'] as const;
export const SITE_LOCALE = 'es_AR';
export const SITE_LANGUAGE = 'es-AR';
export const CONTACT_EMAIL = 'yosoyvargas@hotmail.com';
export const EDITOR_NAME = 'Leonardo Vargas';
export const SITE_DESCRIPTION =
	'Cine Posta, también conocido como Cineposta, es un sitio argentino con reseñas cortas y al hueso sobre películas, veredictos claros y fichas de actores y directores para decidir rápido qué mirar.';
export const SITE_LOGO_PATH = '/brand/cineposta-logo-mark.png';
export const SITE_IMAGE_PATH = '/brand/cineposta-logo-full.png';
export const ABOUT_PATH = '/sobre-cine-posta/';
export const METHODOLOGY_PATH = '/como-funciona/';
export const PRIVACY_PATH = '/politica-de-privacidad/';
export const EDITORIAL_POLICY_PATH = '/politica-editorial/';
export const SOURCES_AND_DATA_PATH = '/fuentes-y-datos/';
export const COPYRIGHT_PATH = '/copyright-y-uso-de-material/';
export const CONTACT_PATH = '/contacto/';
export const EDITOR_PATH = '/editor/leonardo-vargas/';
export const QUE_MIRO_HOY_PATH = '/que-miro-hoy/';
export const PEOPLE_PATH = '/personas/';
export { COMMUNITY_PATH } from './community';

type StructuredDataValue = Record<string, unknown>;

function asAbsoluteUrl(value: string): string {
	return new URL(value, SITE_URL).toString();
}

function normalizeStructuredDate(value?: string): string | undefined {
	const trimmedValue = String(value ?? '').trim();
	if (!trimmedValue) {
		return undefined;
	}

	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
		return `${trimmedValue}T00:00:00Z`;
	}

	if (/^\d{4}-\d{2}$/.test(trimmedValue)) {
		return `${trimmedValue}-01T00:00:00Z`;
	}

	if (/^\d{4}$/.test(trimmedValue)) {
		return `${trimmedValue}-01-01T00:00:00Z`;
	}

	const parsedDate = new Date(trimmedValue);
	return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
}

export function getBestKnownMoviePublicationDate(
	movie: Pick<Movie, 'releaseDate' | 'reviewPublishedAt' | 'year'>,
): string {
	return (
		normalizeStructuredDate(movie.reviewPublishedAt) ??
		normalizeStructuredDate(movie.releaseDate) ??
		`${movie.year}-01-01T00:00:00Z`
	);
}

function getOrganizationId(): string {
	return `${SITE_URL}/#organization`;
}

function getWebsiteId(): string {
	return `${SITE_URL}/#website`;
}

function getEditorId(): string {
	return `${asAbsoluteUrl(EDITOR_PATH)}#person`;
}

function getCollectionPageId(): string {
	return `${SITE_URL}/#webpage`;
}

function createBreadcrumbListItem(position: number, name: string, itemUrl: string): StructuredDataValue {
	return {
		'@type': 'ListItem',
		position,
		name,
		item: {
			'@id': itemUrl,
			name,
		},
	};
}

function uniqueUrls(values: Array<string | undefined>): string[] {
	return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

function getReviewRatingValue(verdict: MovieVerdict): number {
	switch (verdict) {
		case 'recomendada':
			return 4;
		case 'zafa':
			return 3;
		case 'no_recomendada':
			return 2;
		case 'basura_atomica':
			return 1;
		default:
			return 3;
	}
}

function createOrganizationSchema(): StructuredDataValue {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': getOrganizationId(),
		name: SITE_NAME,
		alternateName: SITE_ALTERNATE_NAMES,
		url: `${SITE_URL}/`,
		description: SITE_DESCRIPTION,
		email: `mailto:${CONTACT_EMAIL}`,
		logo: {
			'@type': 'ImageObject',
			url: asAbsoluteUrl(SITE_LOGO_PATH),
			width: 512,
			height: 512,
		},
		image: asAbsoluteUrl(SITE_IMAGE_PATH),
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
		alternateName: SITE_ALTERNATE_NAMES,
		description: SITE_DESCRIPTION,
		inLanguage: SITE_LANGUAGE,
		publisher: {
			'@id': getOrganizationId(),
		},
	};
}

function createEditorSchema(): StructuredDataValue {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': getEditorId(),
		url: asAbsoluteUrl(EDITOR_PATH),
		name: EDITOR_NAME,
		jobTitle: 'Editor responsable',
		worksFor: {
			'@type': 'Organization',
			'@id': getOrganizationId(),
			name: SITE_NAME,
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

export function createSimplePageStructuredData(
	pagePath: string,
	pageTitle: string,
	pageDescription: string,
	pageType: 'WebPage' | 'ContactPage' = 'WebPage',
): StructuredDataValue[] {
	const pageUrl = asAbsoluteUrl(pagePath);

	return [
		createOrganizationSchema(),
		createWebsiteSchema(),
		{
			'@context': 'https://schema.org',
			'@type': pageType,
			'@id': `${pageUrl}#webpage`,
			url: pageUrl,
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

export function createEditorPageStructuredData(
	pageTitle: string,
	pageDescription: string,
): StructuredDataValue[] {
	const editorUrl = asAbsoluteUrl(EDITOR_PATH);

	return [
		createOrganizationSchema(),
		createWebsiteSchema(),
		createEditorSchema(),
		{
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			'@id': `${editorUrl}#webpage`,
			url: editorUrl,
			name: pageTitle,
			description: pageDescription,
			inLanguage: SITE_LANGUAGE,
			isPartOf: {
				'@id': getWebsiteId(),
			},
			mainEntity: {
				'@id': getEditorId(),
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
		| 'synopsis'
		| 'year'
		| 'releaseDate'
		| 'audienceRating'
		| 'category'
		| 'genres'
		| 'subgenres'
		| 'poster'
		| 'screenshots'
		| 'director'
		| 'mainCast'
		| 'productionCompany'
		| 'verdict'
		| 'review'
		| 'reviewPublishedAt'
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
		description: movie.synopsis,
		image: imageUrls,
		director: {
			'@type': 'Person',
			name: movie.director,
		},
		actor: movie.mainCast.map((actor) => ({
			'@type': 'Person',
			name: actor,
		})),
		genre: [...(movie.genres ?? []), ...(movie.subgenres ?? [])].length
			? [...(movie.genres ?? []), ...(movie.subgenres ?? [])]
			: [movie.category],
		productionCompany: {
			'@type': 'Organization',
			name: movie.productionCompany,
		},
	};

	const reviewSchema =
		typeof movie.review === 'string' && movie.review.trim().length > 0
			? {
				'@type': 'Review',
				name: `Reseña de ${movie.title} (${movie.year})`,
				inLanguage: SITE_LANGUAGE,
				reviewBody: movie.review,
				datePublished: getBestKnownMoviePublicationDate(movie),
				author: {
					'@type': 'Person',
					'@id': getEditorId(),
					name: EDITOR_NAME,
					url: asAbsoluteUrl(EDITOR_PATH),
				},
				editor: {
					'@type': 'Person',
					'@id': getEditorId(),
					name: EDITOR_NAME,
					url: asAbsoluteUrl(EDITOR_PATH),
				},
				publisher: {
					'@type': 'Organization',
					'@id': getOrganizationId(),
					name: SITE_NAME,
					url: `${SITE_URL}/`,
				},
				reviewRating: {
					'@type': 'Rating',
					ratingValue: getReviewRatingValue(movie.verdict),
					bestRating: 4,
					worstRating: 1,
				},
			}
			: undefined;

	if (reviewSchema) {
		movieSchema.review = reviewSchema;
	}

	if (movie.originalTitle && movie.originalTitle !== movie.title) {
		movieSchema.alternateName = movie.originalTitle;
	}

	if (movie.releaseDate) {
		movieSchema.datePublished = movie.releaseDate;
	}

	if (movie.audienceRating) {
		movieSchema.contentRating = movie.audienceRating;
	}

	return [
		movieSchema,
		createEditorSchema(),
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
				createBreadcrumbListItem(1, SITE_NAME, `${SITE_URL}/`),
				createBreadcrumbListItem(2, movie.title, movieUrl),
			],
		},
	];
}

export function createPersonStructuredData(
	person: Pick<
		PersonProfile,
		| 'slug'
		| 'name'
		| 'headline'
		| 'roles'
		| 'profileImage'
		| 'image'
		| 'remoteImageUrl'
		| 'birthDate'
		| 'deathDate'
		| 'birthPlace'
		| 'nationalityPrimary'
		| 'imdbUrl'
		| 'referenceUrls'
	>,
	filmography: Pick<PersonFilmographyEntry, 'title'>[],
	pageTitle: string,
	pageDescription: string,
): StructuredDataValue[] {
	const personUrl = asAbsoluteUrl(getPersonPath(person.slug));
	const imageUrl = person.profileImage
		? person.profileImage
		: person.image
		? asAbsoluteUrl(person.image)
		: person.remoteImageUrl ?? asAbsoluteUrl(SITE_IMAGE_PATH);

	return [
		{
			'@context': 'https://schema.org',
			'@type': 'Person',
			'@id': `${personUrl}#person`,
			url: personUrl,
			name: person.name,
			description: pageDescription,
			image: imageUrl,
			jobTitle: person.roles.join(', '),
			nationality: person.nationalityPrimary,
			birthDate: person.birthDate,
			deathDate: person.deathDate,
			birthPlace: person.birthPlace
				? {
						'@type': 'Place',
						name: person.birthPlace,
					}
				: undefined,
			// Reference URLs are citations, not claims that the person controls those pages.
			sameAs: uniqueUrls([person.imdbUrl]),
			knowsAbout: filmography.slice(0, 6).map((movie) => movie.title),
		},
		{
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			'@id': `${personUrl}#webpage`,
			url: personUrl,
			name: pageTitle,
			description: pageDescription,
			inLanguage: SITE_LANGUAGE,
			isPartOf: {
				'@id': getWebsiteId(),
			},
			about: {
				'@id': `${personUrl}#person`,
			},
			mainEntity: {
				'@id': `${personUrl}#person`,
			},
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			'@id': `${personUrl}#breadcrumb`,
			itemListElement: [
				createBreadcrumbListItem(1, SITE_NAME, `${SITE_URL}/`),
				createBreadcrumbListItem(2, 'Personas', asAbsoluteUrl(PEOPLE_PATH)),
				createBreadcrumbListItem(3, person.name, personUrl),
			],
		},
	];
}
