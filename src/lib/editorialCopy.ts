import type { Movie } from '../types/movie';
import type { PersonFilmographyEntry, PersonProfile } from '../types/person';
import { getVerdictLabel } from './movies';
import { getMoviePlatformLabel } from './platforms';

export interface EditorialBlock {
	title: string;
	paragraphs: string[];
}

export interface MovieTenSecondTake {
	verdict: MovieTenSecondTakeFact;
	identity: MovieTenSecondTakeFact;
	pace: MovieTenSecondTakeFact;
	plan: MovieTenSecondTakeFact;
	intensity: MovieTenSecondTakeFact;
}

export interface MovieTenSecondTakeFact {
	value: string;
	detail?: string;
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

	if (/\bterror\b|\bhorror\b|\bslasher\b|\bzombi\b|\bzombie\b|\bgore\b/.test(haystack)) {
		return 'Alta';
	}

	if (/\bthriller\b|\bcrimen\b|\bguerra\b|\bbelic\b|\bsuspenso\b|\boscura\b|\bintensa\b/.test(haystack)) {
		return 'Media alta';
	}

	if (/\bdrama\b|\bpolitic\b|\bjudicial\b|\bbiopic\b|\bdocumental\b/.test(haystack)) {
		return 'Media';
	}

	if (/\bcomedia\b|\banimacion\b|\banime\b|\baventura\b|\bfamiliar\b|\bmusical\b/.test(haystack)) {
		return 'Baja a media';
	}

	return 'Media';
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

	const platform = getMoviePlatformLabel(movie).trim();
	if (platform) {
		parts.push(platform);
	}

	const audienceRating = String(movie.audienceRating ?? '').trim();
	if (audienceRating) {
		parts.push(audienceRating);
	}

	return parts.join(' · ') || 'Plan sin datos extra';
}

function getAudienceRatingDescription(audienceRating: string): string {
	const normalized = String(audienceRating ?? '')
		.trim()
		.toUpperCase();

	if (!normalized) {
		return 'Clasificación no cargada';
	}

	if (normalized === 'ATP') {
		return 'Apta para todo público';
	}

	if (normalized.startsWith('+')) {
		return `Mayores de ${normalized.slice(1)} años`;
	}

	return normalized;
}

function getVerdictDetail(movie: Movie): string {
	switch (movie.verdict) {
		case 'recomendada':
			return 'Vale el tiempo sin demasiadas advertencias.';
		case 'zafa':
			return 'Tiene con qué defenderse, pero no entra entre las imprescindibles.';
		case 'no_recomendada':
			return 'Cuesta recomendarla salvo que ya vengas muy comprado.';
		case 'basura_atomica':
			return 'Sólo sirve si vas por morbo, completismo o curiosidad extrema.';
		default:
			return 'Sirve como corte rápido antes de darle play.';
	}
}

function getIdentityValue(movie: Movie): string {
	const genres = [getPrimaryGenre(movie), ...getSecondaryGenres(movie)].map(formatGenreLabel);
	const uniqueGenres = genres.filter((genre, index) => genres.indexOf(genre) === index);
	return uniqueGenres.slice(0, 3).join(' · ') || 'Sin categoría clara';
}

function getIdentityDetail(movie: Movie): string | undefined {
	const detailParts = [];
	const country = String(movie.country ?? '').trim();

	if (movie.isArgentinian) {
		detailParts.push(country ? `Cine argentino · ${country}` : 'Cine argentino');
	} else if (country) {
		detailParts.push(country);
	}

	if (movie.director?.trim()) {
		detailParts.push(`Dirige ${movie.director.trim()}`);
	}

	return detailParts.join(' · ') || undefined;
}

function getPaceSummary(movie: Movie): MovieTenSecondTakeFact {
	const runtimeMinutes = movie.runtimeMinutes;

	if (typeof runtimeMinutes === 'number' && Number.isInteger(runtimeMinutes) && runtimeMinutes > 0) {
		if (runtimeMinutes <= 95) {
			return {
				value: 'Va al hueso',
				detail: `${runtimeMinutes} min y pocas vueltas.`,
			};
		}

		if (runtimeMinutes <= 120) {
			return {
				value: 'Ritmo bastante directo',
				detail: `${runtimeMinutes} min sin pedir una tarde entera.`,
			};
		}

		if (runtimeMinutes <= 145) {
			return {
				value: 'Se toma su tiempo',
				detail: `${runtimeMinutes} min para entrar en su clima.`,
			};
		}

		return {
			value: 'Larga y de inmersión',
			detail: `${runtimeMinutes} min: mejor verla con tiempo de sobra.`,
		};
	}

	const haystack = normalizeText([movie.category, ...(movie.genres ?? [])].join(' '));
	if (/\bcomedia\b|\baventura\b|\banimacion\b|\banime\b/.test(haystack)) {
		return {
			value: 'Entra rápido',
			detail: 'La propuesta es bastante directa desde el arranque.',
		};
	}

	if (/\bdrama\b|\bdocumental\b|\bbiopic\b/.test(haystack)) {
		return {
			value: 'Más de clima que de apuro',
			detail: 'Le importa más desarrollar personajes e ideas que correr.',
		};
	}

	return {
		value: 'Ritmo intermedio',
		detail: 'No vuela, pero tampoco se queda clavada.',
	};
}

function getIntensityDetail(movie: Movie): string {
	const haystack = normalizeText([movie.category, ...(movie.genres ?? []), movie.review, movie.synopsis].join(' '));

	if (/\bterror\b|\bhorror\b|\bslasher\b|\bzombi\b|\bzombie\b|\bgore\b/.test(haystack)) {
		return 'Tensión fuerte, imágenes ásperas o violencia más frontal.';
	}

	if (/\bthriller\b|\bcrimen\b|\bguerra\b|\bbelic\b|\bsuspenso\b/.test(haystack)) {
		return 'Aprieta por clima, peligro o violencia sin irse siempre al extremo.';
	}

	if (/\bdrama\b|\bpolitic\b|\bjudicial\b|\bbiopic\b|\bdocumental\b/.test(haystack)) {
		return 'Pesa más la carga dramática, las ideas o la presión emocional.';
	}

	if (/\bcomedia\b|\banimacion\b|\banime\b|\baventura\b|\bfamiliar\b|\bmusical\b/.test(haystack)) {
		return 'Se deja ver fácil y no juega a desgastarte como espectador.';
	}

	return 'Tiene algunos picos, pero sigue siendo bastante llevadera.';
}

export function getMovieTenSecondTake(movie: Movie): MovieTenSecondTake {
	const overrides = movie.editorial?.tenSecondTake;
	const pace = getPaceSummary(movie);

	return {
		verdict: {
			value: overrides?.verdict?.trim() || getVerdictLabel(movie),
			detail: getVerdictDetail(movie),
		},
		identity: {
			value: overrides?.identity?.trim() || overrides?.lane?.trim() || getIdentityValue(movie),
			detail: getIdentityDetail(movie),
		},
		pace: {
			value: overrides?.pace?.trim() || overrides?.subgenres?.trim() || pace.value,
			detail: pace.detail,
		},
		plan: {
			value: overrides?.plan?.trim() || getPlanLabel(movie),
			detail: getAudienceRatingDescription(movie.audienceRating),
		},
		intensity: {
			value: overrides?.intensity?.trim() || getIntensityLabel(movie),
			detail: getIntensityDetail(movie),
		},
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
