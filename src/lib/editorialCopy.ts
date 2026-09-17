import type { Movie } from '../types/movie';
import type { PersonFilmographyEntry, PersonProfile } from '../types/person';

export interface EditorialBlock {
	title: string;
	paragraphs: string[];
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

export function getMovieTenSecondTake(movie: Movie): NonNullable<Movie['editorial']>['tenSecondTake'] | undefined {
	const take = movie.editorial?.tenSecondTake;
	if (!take) return undefined;

	const fields = [
		take.verdict,
		take.whatToExpect,
		take.pace,
		take.intensity,
		take.practicalContext,
		take.forFansOf,
		take.notForYouIf,
	];

	return fields.every((value) => typeof value === 'string' && value.trim().length > 0) ? take : undefined;
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
