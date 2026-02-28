import type { Movie, MovieVerdict } from '../types/movie';

const movieModules = import.meta.glob('../data/movies/*.json', { eager: true }) as Record<
	string,
	{ default: Movie }
>;

const VERDICT_LABELS: Record<MovieVerdict, string> = {
	recomendada: 'Recomendada',
	zafa: 'Zafa',
	no_recomendada: 'Malisima',
	basura_atomica: 'Basura atomica',
};

function withTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

function joinWithBase(pathPart: string): string {
	const base = withTrailingSlash(import.meta.env.BASE_URL || '/');
	return `${base}${pathPart.replace(/^\/+/, '')}`;
}

function validateMovies(movies: Movie[]): void {
	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	const seen = new Set<string>();

	for (const movie of movies) {
		const slug = movie.slug?.trim();
		if (!slug) {
			throw new Error(`Movie entry "${movie.title}" is missing a slug.`);
		}
		if (!slugPattern.test(slug)) {
			throw new Error(
				`Movie slug "${slug}" is invalid. Use lowercase letters, numbers, and dashes only.`,
			);
		}
		if (seen.has(slug)) {
			throw new Error(`Duplicate movie slug detected: "${slug}".`);
		}
		seen.add(slug);

		if (!movie.originalTitle?.trim()) {
			throw new Error(`Movie "${slug}" is missing originalTitle.`);
		}
		if (!movie.category?.trim()) {
			throw new Error(`Movie "${slug}" is missing category.`);
		}
		if (!movie.director?.trim()) {
			throw new Error(`Movie "${slug}" is missing director.`);
		}
		if (!movie.productionCompany?.trim()) {
			throw new Error(`Movie "${slug}" is missing productionCompany.`);
		}
		if (!Array.isArray(movie.mainCast)) {
			throw new Error(`Movie "${slug}" has invalid mainCast.`);
		}

		const castMembers = movie.mainCast
			.map((actor) => (typeof actor === 'string' ? actor.trim() : ''))
			.filter(Boolean);
		if (castMembers.length === 0) {
			throw new Error(`Movie "${slug}" is missing mainCast entries.`);
		}

		if (movie.awards !== undefined) {
			if (!movie.awards || !Array.isArray(movie.awards.wins)) {
				throw new Error(`Movie "${slug}" has invalid awards format.`);
			}

			for (const win of movie.awards.wins) {
				if (!win || typeof win !== 'object') {
					throw new Error(`Movie "${slug}" has an invalid award entry.`);
				}

				if (!['oscar', 'grammy', 'cannes'].includes(win.award)) {
					throw new Error(`Movie "${slug}" has unsupported award type "${String(win.award)}".`);
				}

				if (typeof win.category !== 'string' || win.category.trim().length === 0) {
					throw new Error(`Movie "${slug}" has an award without category.`);
				}

				if (
					win.recipient !== undefined &&
					(typeof win.recipient !== 'string' || win.recipient.trim().length === 0)
				) {
					throw new Error(`Movie "${slug}" has an award with invalid recipient.`);
				}

				if (win.year !== undefined && (!Number.isInteger(win.year) || win.year < 1900)) {
					throw new Error(`Movie "${slug}" has invalid award year "${String(win.year)}".`);
				}
			}
		}
	}
}

export function getMovies(): Movie[] {
	const movies = Object.values(movieModules)
		.map((moduleItem) => moduleItem.default)
		.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'es'));

	validateMovies(movies);
	return movies;
}

export function getVerdictLabel(movie: Pick<Movie, 'verdict' | 'verdictLabel'>): string {
	if (movie.verdictLabel?.trim()) {
		return movie.verdictLabel.trim();
	}
	return VERDICT_LABELS[movie.verdict] ?? 'Sin definir';
}

function normalizeText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

export function getVerdictBadgeClass(movie: Pick<Movie, 'verdict' | 'verdictLabel'>): string {
	const normalizedLabel = normalizeText(getVerdictLabel(movie));
	if (normalizedLabel.includes('mediocre')) {
		return 'badge--zafa';
	}
	return `badge--${movie.verdict}`;
}

export function getPosterUrl(poster: string): string {
	if (!poster) {
		return joinWithBase('posters/poster-no-disponible.svg');
	}
	if (/^https?:\/\//i.test(poster)) {
		return poster;
	}
	return joinWithBase(poster);
}

export function getMoviePath(slug: string): string {
	return joinWithBase(`peliculas/${slug}/`);
}
