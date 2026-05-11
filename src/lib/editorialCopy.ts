import type { Movie, MovieVerdict } from '../types/movie';
import type { PersonFilmographyEntry, PersonProfile } from '../types/person';
import { getVerdictLabel } from './movies';

export interface EditorialBlock {
	title: string;
	paragraphs: string[];
}

export interface MovieTenSecondTake {
	quickVerdict: string;
	watchIf: string;
	skipIf: string;
	idealFor: string;
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
	return cleanList(movie.genres ?? [movie.category])[0] ?? movie.category;
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

export function getMovieTenSecondTake(movie: Movie): MovieTenSecondTake {
	const genre = getPrimaryGenre(movie).toLowerCase();
	const castLabel = joinNames(movie.mainCast, 'el elenco');
	const verdictLabel = getVerdictLabel(movie);

	const quickVerdicts: Record<MovieVerdict, string> = {
		recomendada: `${verdictLabel}. Entra por ${genre} y deja una razón clara para verla.`,
		zafa: `${verdictLabel}. No es prioridad absoluta, pero puede rendir con el plan justo.`,
		no_recomendada: `${verdictLabel}. Tiene alguna punta, pero no termina de pagar el tiempo que pide.`,
		basura_atomica: `${verdictLabel}. Acá la advertencia va en serio: cuesta defenderla.`,
	};

	const watchIfByVerdict: Record<MovieVerdict, string> = {
		recomendada: `Mirala si querés una de ${genre} con oficio y algo para comentar después.`,
		zafa: `Mirala si hoy te sirve una de ${genre} sin exigirle que te cambie la vida.`,
		no_recomendada: `Mirala si te interesa ${castLabel} o venís completando este tipo de cine.`,
		basura_atomica: `Mirala solo si te divierte discutir por qué algo salió tan torcido.`,
	};

	const skipIfByVerdict: Record<MovieVerdict, string> = {
		recomendada: 'No la mires si hoy querés apagar el cerebro y nada más.',
		zafa: 'No la mires si estás buscando una apuesta segura, redonda y sin baches.',
		no_recomendada: 'No la mires si tenés poco tiempo y querés ir a lo seguro.',
		basura_atomica: 'No la mires si tu paciencia anda corta o necesitás algo que fluya.',
	};

	const idealByVerdict: Record<MovieVerdict, string> = {
		recomendada: 'Ideal para una noche con ganas de ver algo que deje tema.',
		zafa: 'Ideal para plan liviano, pochoclos y expectativas bien ubicadas.',
		no_recomendada: 'Ideal solo para completistas, curiosos o fans del equipo involucrado.',
		basura_atomica: 'Ideal para verla con gente y comentar el derrumbe en vivo.',
	};

	return {
		quickVerdict: quickVerdicts[movie.verdict],
		watchIf: watchIfByVerdict[movie.verdict],
		skipIf: skipIfByVerdict[movie.verdict],
		idealFor: idealByVerdict[movie.verdict],
		intensity: getIntensityLabel(movie),
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
