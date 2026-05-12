import type { Movie } from '../types/movie';
import type { PersonFilmographyEntry, PersonProfile } from '../types/person';
import { getVerdictLabel } from './movies';

export interface EditorialBlock {
	title: string;
	paragraphs: string[];
}

export interface MovieTenSecondTake {
	verdict: string;
	lane: string;
	subgenres: string;
	plan: string;
	intensity: string;
}

function cleanList(values: string[]): string[] {
	return values.map((value) => value.trim()).filter(Boolean);
}

function joinNames(values: string[], fallback: string): string {
	const names = cleanList(values).slice(0, 3);
	if (names.length === 0) return fallback;
	if (names.length === 1) return names[0];
	if (names.length === 2) return `${names[0]} y ${names[1]}`;
	return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

function normalizeText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function getPrimaryGenre(movie: Movie): string {
	return movie.category?.trim() || cleanList(movie.genres ?? [movie.category])[0] || 'Sin categoría';
}

function getIntensityLabel(movie: Movie): string {
	const haystack = normalizeText([movie.category, ...(movie.genres ?? []), movie.review, movie.synopsis].join(' '));

	if (/\bterror\b|\bhorror\b|\bthriller\b|\bcrimen\b|\bguerra\b|\bbelic/.test(haystack)) {
		return 'Alta: pide atención y algo de estómago.';
	}

	if (/\bdrama\b|\boscura\b|\bintensa\b|\bpolitic/.test(haystack)) {
		return 'Media alta: mejor verla con ganas de meterse.';
	}

	if (/\bcomedia\b|\banimacion\b|\banime\b|\baventura\b|\bfamiliar\b/.test(haystack)) {
		return 'Media: va sin manual, pero no siempre en piloto automático.';
	}

	return 'Media: tranqui, pero con la cabeza prendida.';
}

function formatGenreLabel(value: string): string {
	const label = String(value ?? '').trim();
	return label || 'Sin categoría';
}

function getSecondaryGenres(movie: Movie): string[] {
	const primaryGenre = normalizeText(getPrimaryGenre(movie));
	return cleanList(movie.genres ?? [])
		.map((genre) => genre.trim())
		.filter((genre) => normalizeText(genre) !== primaryGenre);
}

function getPlanLabel(movie: Movie): string {
	const parts = [];
	const runtimeMinutes = movie.runtimeMinutes;

	if (typeof runtimeMinutes === 'number' && Number.isInteger(runtimeMinutes) && runtimeMinutes > 0) {
		parts.push(`${runtimeMinutes} min`);
	}

	const platform = String(movie.releasePlatform ?? '').trim();
	if (platform) {
		parts.push(platform);
	}

	const audienceRating = String(movie.audienceRating ?? '').trim();
	if (audienceRating) {
		parts.push(audienceRating);
	}

	return parts.join(' · ') || 'Plan sin datos extra';
}

export function getMovieTenSecondTake(movie: Movie): MovieTenSecondTake {
	const verdictLabel = getVerdictLabel(movie);
	const lane = formatGenreLabel(getPrimaryGenre(movie));
	const secondaryGenres = getSecondaryGenres(movie);
	const subgenres =
		secondaryGenres.length > 0 ? secondaryGenres.slice(0, 3).join(' · ') : 'Sin subgéneros cargados';
	const plan = getPlanLabel(movie);
	const overrides = movie.editorial?.tenSecondTake;

	return {
		verdict: overrides?.verdict?.trim() || verdictLabel,
		lane: overrides?.lane?.trim() || lane,
		subgenres: overrides?.subgenres?.trim() || subgenres,
		plan: overrides?.plan?.trim() || plan,
		intensity: overrides?.intensity?.trim() || getIntensityLabel(movie),
	};
}

export function getPersonEditorialBlocks(
	profile: PersonProfile,
	filmography: PersonFilmographyEntry[],
): EditorialBlock[] {
	const filmTitles = joinNames(
		filmography.slice(0, 4).map((entry) => entry.title),
		'las películas conectadas',
	);
	const roleLabel = profile.roles.join(', ').toLowerCase();
	const award = profile.awards[0];
	const awardCopy = award
		? `La ficha también registra ${award.label}${award.category ? ` en ${award.category}` : ''}${award.work ? ` por ${award.work}` : ''}${award.year ? ` (${award.year})` : ''}.`
		: 'La ficha prioriza películas, roles y contexto antes que una lista larga de datos sueltos.';

	return [
		{
			title: '',
			paragraphs: [
				`${profile.name} aparece en Cine Posta como ${roleLabel}, con una filmografía interna que permite saltar de la biografía a ${filmTitles}. La página está pensada para conectar datos básicos, premios y películas sin depender de una ficha externa.`,
				`${profile.spotlight} ${awardCopy}`,
			],
		},
	];
}
