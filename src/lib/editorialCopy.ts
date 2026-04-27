import type { Movie, MovieVerdict } from '../types/movie';
import type { PersonFilmographyEntry, PersonProfile } from '../types/person';
import type { MovieEditorialSummary } from './movies';
import { getMoviePlatformLabel } from './platforms';

export interface EditorialBlock {
	title: string;
	paragraphs: string[];
}

export interface EditorialFact {
	label: string;
	value: string;
}

export interface MovieValueGuide {
	blocks: EditorialBlock[];
	facts: EditorialFact[];
}

const verdictCopy: Record<MovieVerdict, string> = {
	recomendada:
		'La recomendacion sale cuando la pelicula tiene una razon clara para ocupar tiempo de pantalla: ritmo, oficio, ideas o una energia que compensa sus tropiezos.',
	zafa:
		'El zafa marca una zona intermedia: no es una prioridad absoluta, pero puede servir si el genero, el elenco o el plan de la noche coinciden con lo que buscas.',
	no_recomendada:
		'La no recomendacion apunta a una advertencia practica. Puede tener algun detalle rescatable, pero la experiencia completa queda por debajo de lo que promete.',
	basura_atomica:
		'La basura atomica queda reservada para casos donde la falla no es solo de gusto: el problema esta en ritmo, decisiones narrativas o una ejecucion que vuelve dificil defenderla.',
};

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

function getRuntimeValue(summary: MovieEditorialSummary): string | undefined {
	if (!summary.runtime) return undefined;
	return summary.runtime.comment ? `${summary.runtime.formatted}: ${summary.runtime.comment}.` : summary.runtime.formatted;
}

export function getMovieValueGuide(movie: Movie, summary: MovieEditorialSummary): MovieValueGuide {
	const platformLabel = getMoviePlatformLabel(movie);
	const castLabel = joinNames(movie.mainCast, 'su elenco principal');
	const relatedLabel = summary.related.length
		? joinNames(
				summary.related.map((entry) => entry.title),
				'otras peliculas del catalogo',
			)
		: 'otras peliculas del catalogo';
	const bridgeLabel = summary.bridge.length
		? joinNames(
				summary.bridge.map((entry) => entry.title),
				'peliculas cercanas del catalogo',
			)
		: relatedLabel;

	return {
		blocks: [
			{
				title: 'Lectura editorial',
				paragraphs: [
					`${movie.title} entra en el catalogo como una propuesta de ${movie.category.toLowerCase()} de ${movie.year}, dirigida por ${movie.director}. La ficha no se limita a repetir datos: separa premisa, veredicto y contexto para que la decision de verla sea rapida y concreta.`,
					`El punto de partida es el cruce entre ${castLabel}, la marca de ${movie.productionCompany} y el lugar que ocupa frente a ${bridgeLabel}. Esa comparacion interna ayuda a entender si conviene verla por tono, por reparto o por simple curiosidad de genero.`,
				],
			},
			{
				title: 'Como leer el veredicto',
				paragraphs: [
					`${getVerdictLabelForSentence(movie)}. ${verdictCopy[movie.verdict]}`,
					`Tambien miramos si ${movie.title} sostiene su promesa basica: que la sinopsis, el trailer, la duracion y el resultado final apunten hacia la misma experiencia. Cuando esos elementos se contradicen, el veredicto lo dice sin disfrazarlo.`,
				],
			},
		],
		facts: [
			{ label: 'Plan sugerido', value: getPlanSuggestion(movie, platformLabel) },
			{ label: 'Punto fuerte a revisar', value: `El cruce entre ${castLabel} y el tono de ${movie.category.toLowerCase()}.` },
			{ label: 'Antes de verla', value: getRuntimeValue(summary) ?? 'Revisa sinopsis, trailer y clasificacion antes de decidir.' },
			{ label: 'Si te interesa', value: `Segui por ${relatedLabel} para comparar el mismo pulso dentro del sitio.` },
		],
	};
}

function getVerdictLabelForSentence(movie: Pick<Movie, 'title' | 'verdict' | 'verdictLabel'>): string {
	const label = movie.verdictLabel?.trim();
	if (label) {
		return `El veredicto de Cine Posta para ${movie.title} es "${label}"`;
	}
	return `El veredicto de Cine Posta para ${movie.title} esta marcado como ${movie.verdict.replace(/_/g, ' ')}`;
}

function getPlanSuggestion(movie: Pick<Movie, 'title' | 'category' | 'verdict'>, platformLabel: string): string {
	const platformCopy = platformLabel ? ` en ${platformLabel}` : '';
	if (movie.verdict === 'recomendada') {
		return `Va bien como eleccion principal${platformCopy} si buscas ${movie.category.toLowerCase()} sin dar tantas vueltas.`;
	}
	if (movie.verdict === 'zafa') {
		return `Rinde mejor como opcion de genero${platformCopy}, con expectativas medidas.`;
	}
	return `Conviene entrar solo si ya te interesa mucho ${movie.category.toLowerCase()} o queres completar una filmografia.`;
}

export function getPersonEditorialBlocks(
	profile: PersonProfile,
	filmography: PersonFilmographyEntry[],
): EditorialBlock[] {
	const filmTitles = joinNames(
		filmography.slice(0, 4).map((entry) => entry.title),
		'las peliculas conectadas',
	);
	const roleLabel = profile.roles.join(', ').toLowerCase();
	const award = profile.awards[0];
	const awardCopy = award
		? `La ficha tambien registra ${award.label}${award.category ? ` en ${award.category}` : ''}${award.work ? ` por ${award.work}` : ''}${award.year ? ` (${award.year})` : ''}.`
		: 'La ficha prioriza peliculas, roles y contexto antes que una lista larga de datos sueltos.';

	return [
		{
			title: 'Contexto dentro del catalogo',
			paragraphs: [
				`${profile.name} aparece en Cine Posta como ${roleLabel}, con una filmografia interna que permite saltar de la biografia a ${filmTitles}. La pagina esta pensada para conectar datos basicos, premios y peliculas sin depender de una ficha externa.`,
				`${profile.spotlight} ${awardCopy}`,
			],
		},
	];
}
