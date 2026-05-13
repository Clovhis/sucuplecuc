import type { Movie } from '../types/movie';
import type { PersonFilmographyEntry, PersonProfile } from '../types/person';
import { getVerdictLabel, isAbsoluteCinemaMovie } from './movies';
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
		return 'Re picante';
	}

	if (/\bthriller\b|\bcrimen\b|\bguerra\b|\bbelic\b|\bsuspenso\b|\boscura\b|\bintensa\b/.test(haystack)) {
		return 'Pica bastante';
	}

	if (/\bdrama\b|\bpolitic\b|\bjudicial\b|\bbiopic\b|\bdocumental\b/.test(haystack)) {
		return 'Pesadita';
	}

	if (/\bcomedia\b|\banimacion\b|\banime\b|\baventura\b|\bfamiliar\b|\bmusical\b/.test(haystack)) {
		return 'Tranqui';
	}

	return 'Tiene lo suyo';
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
	if (isAbsoluteCinemaMovie(movie)) {
		return 'Es el sello máximo: obra maestra, clásico total o de esas que hay que ver sí o sí.';
	}

	switch (movie.verdict) {
		case 'recomendada':
			return 'Está buena de verdad: si te llama aunque sea un poco, hay buenas chances de que te garpe.';
		case 'zafa':
			return 'Tiene con qué defenderse, pero depende bastante de tu onda y de lo que tengas ganas de ver hoy.';
		case 'no_recomendada':
			return 'Tiene más problemas que aciertos. Salvo que vengas muy comprado con el tema, hay mejores opciones.';
		case 'basura_atomica':
			return 'Solo entra si vas por morbo, completismo o curiosidad extrema. Para casi cualquiera, mejor otra cosa.';
		default:
			return 'Resumen rápido para decidir sin comerte una reseña eterna.';
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
		return 'Hay sustos, violencia o imágenes jodidas: no es para poner de fondo mientras mirás el celu.';
	}

	if (/\bthriller\b|\bcrimen\b|\bguerra\b|\bbelic\b|\bsuspenso\b/.test(haystack)) {
		return 'Te tiene agarrado por el suspenso, el peligro o la violencia, aunque no se vaya siempre al mango.';
	}

	if (/\bdrama\b|\bpolitic\b|\bjudicial\b|\bbiopic\b|\bdocumental\b/.test(haystack)) {
		return 'Carga bastante en lo emocional o en las ideas. Capaz no grita, pero pesa.';
	}

	if (/\bcomedia\b|\banimacion\b|\banime\b|\baventura\b|\bfamiliar\b|\bmusical\b/.test(haystack)) {
		return 'Se ve liviana: no busca dejarte tenso ni demolerte la cabeza.';
	}

	return 'Tiene momentos que pegan, pero en general se deja llevar bien.';
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
