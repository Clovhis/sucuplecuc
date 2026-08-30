import type { Movie } from '../types/movie';

export const WEEKLY_RECOMMENDATION_LIMIT = 6;

export type WeeklyRecommendationEra = 'nueva' | 'clasica' | 'para-descubrir';

export interface WeeklyRecommendationSelection {
	slug: string;
	era: WeeklyRecommendationEra;
}

export interface WeeklyRecommendationManifest {
	generatedAt: string;
	weekKey: string;
	recommendations: WeeklyRecommendationSelection[];
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RECENT_YEAR_WINDOW = 3;
const CLASSIC_YEAR_GAP = 15;
const PREMIUM_LABELS = new Set([
	'buenisima',
	'buenisimo',
	'clasico total',
	'imperdible',
	'legendaria',
	'muy recomendada',
	'obra maestra',
	'recontra garpa',
]);

export const WEEKLY_RECOMMENDATION_ERA_LABELS: Record<WeeklyRecommendationEra, string> = {
	nueva: 'Novedad',
	clasica: 'Clásica',
	'para-descubrir': 'Para descubrir',
};

function normalizeSearchText(value: string | null | undefined): string {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ');
}

function normalizePlatformLabel(value: string | null | undefined): string {
	return normalizeSearchText(value);
}

function getRawMoviePlatforms(movie: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>): string[] {
	const values =
		Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0
			? movie.releasePlatforms
			: [movie.releasePlatform];

	return values.map((value) => String(value ?? '').trim()).filter(Boolean);
}

/**
 * Returns only confirmed platform labels. A title that is also classified as
 * Cine is intentionally rejected so this rail remains streaming-only.
 */
export function getConfirmedStreamingPlatforms(
	movie: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>,
): string[] {
	const platforms = getRawMoviePlatforms(movie);
	const normalizedPlatforms = platforms.map(normalizePlatformLabel);

	if (normalizedPlatforms.includes('cine')) {
		return [];
	}

	return platforms.filter((platform) => {
		const normalizedPlatform = normalizePlatformLabel(platform);
		return normalizedPlatform !== 'otras plataformas' && normalizedPlatform !== 'a confirmar';
	});
}

function getUtcDayStart(value: Date): number {
	return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function getMovieReleaseTimestamp(movie: Pick<Movie, 'year' | 'releaseDate'>): number {
	if (movie.releaseDate?.trim()) {
		const timestamp = Date.parse(`${movie.releaseDate}T00:00:00Z`);
		if (!Number.isNaN(timestamp)) {
			return timestamp;
		}
	}

	return Date.UTC(movie.year, 0, 1);
}

export function isReleasedForWeeklyRecommendations(movie: Pick<Movie, 'year' | 'releaseDate'>, referenceDate: Date): boolean {
	const referenceYear = referenceDate.getUTCFullYear();
	if (movie.releaseDate?.trim()) {
		const releaseTimestamp = getMovieReleaseTimestamp(movie);
		return releaseTimestamp <= getUtcDayStart(referenceDate);
	}

	return movie.year < referenceYear;
}

export function getWeeklyRecommendationEra(
	movie: Pick<Movie, 'year'>,
	referenceDate: Date,
): WeeklyRecommendationEra {
	const referenceYear = referenceDate.getUTCFullYear();
	const age = referenceYear - movie.year;

	if (age <= RECENT_YEAR_WINDOW) {
		return 'nueva';
	}
	if (age >= CLASSIC_YEAR_GAP) {
		return 'clasica';
	}
	return 'para-descubrir';
}

function isHighQualityMovie(movie: Movie): boolean {
	return movie.verdict === 'recomendada' && getConfirmedStreamingPlatforms(movie).length > 0;
}

function getQualityScore(movie: Movie): number {
	const normalizedLabel = normalizeSearchText(movie.verdictLabel);
	let score = 100;

	if (movie.absoluteCinema || PREMIUM_LABELS.has(normalizedLabel)) {
		score += 30;
	}
	if (normalizedLabel.includes('imperdible') || normalizedLabel.includes('obra maestra')) {
		score += 12;
	}
	if (normalizedLabel.includes('buenis')) {
		score += 10;
	}
	if (normalizedLabel.includes('recomend')) {
		score += 8;
	}

	const awardCount = movie.awards?.wins?.length ?? 0;
	return score + Math.min(12, awardCount * 2);
}

function hashString(value: string): number {
	let hash = 2166136261;

	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}

function getWeekKey(referenceDate: Date): string {
	const referenceTimestamp = getUtcDayStart(referenceDate);
	const sundayTimestamp = referenceTimestamp - referenceDate.getUTCDay() * DAY_IN_MS;
	return new Date(sundayTimestamp).toISOString().slice(0, 10);
}

function getReferenceDateKey(referenceDate: Date): string {
	return new Date(getUtcDayStart(referenceDate)).toISOString().slice(0, 10);
}

interface Candidate {
	movie: Movie;
	era: WeeklyRecommendationEra;
	qualityScore: number;
}

function rankCandidates(candidates: Candidate[], weekKey: string): Candidate[] {
	return [...candidates].sort((left, right) => {
		const qualityDelta = right.qualityScore - left.qualityScore;
		if (qualityDelta !== 0) {
			return qualityDelta;
		}

		const rotationDelta = hashString(`${weekKey}:${right.movie.slug}`) - hashString(`${weekKey}:${left.movie.slug}`);
		if (rotationDelta !== 0) {
			return rotationDelta;
		}

		return (
			getMovieReleaseTimestamp(right.movie) - getMovieReleaseTimestamp(left.movie) ||
			left.movie.title.localeCompare(right.movie.title, 'es')
		);
	});
}

function selectCandidates(candidates: Candidate[], limit: number): Candidate[] {
	const selectedByEra: Record<WeeklyRecommendationEra, Candidate[]> = {
		nueva: [],
		clasica: [],
		'para-descubrir': [],
	};
	const selectedSlugs = new Set<string>();

	const pickFromEra = (era: WeeklyRecommendationEra, targetCount: number) => {
		for (const candidate of candidates) {
			if (selectedByEra[era].length >= targetCount || selectedSlugs.has(candidate.movie.slug)) {
				continue;
			}
			if (candidate.era !== era) {
				continue;
			}

			selectedByEra[era].push(candidate);
			selectedSlugs.add(candidate.movie.slug);
		}
	};

	const targetEraCount = Math.min(2, Math.ceil(limit / 3));
	pickFromEra('nueva', targetEraCount);
	pickFromEra('clasica', targetEraCount);

	for (const candidate of candidates) {
		if (selectedSlugs.size >= limit || selectedSlugs.has(candidate.movie.slug)) {
			continue;
		}

		selectedByEra[candidate.era].push(candidate);
		selectedSlugs.add(candidate.movie.slug);
	}

	const selected: Candidate[] = [];
	for (let index = 0; selected.length < limit; index += 1) {
		let addedAtThisIndex = false;
		for (const era of ['nueva', 'clasica', 'para-descubrir'] as WeeklyRecommendationEra[]) {
			const candidate = selectedByEra[era][index];
			if (!candidate) {
				continue;
			}

			selected.push(candidate);
			addedAtThisIndex = true;
			if (selected.length >= limit) {
				break;
			}
		}

		if (!addedAtThisIndex) {
			break;
		}
	}

	return selected;
}

export function getWeeklyRecommendationManifest(
	movies: Movie[],
	referenceDate = new Date(),
	limit = WEEKLY_RECOMMENDATION_LIMIT,
	excludedSlugs: ReadonlySet<string> = new Set(),
): WeeklyRecommendationManifest {
	const normalizedLimit = Math.max(0, Math.floor(limit));
	const weekKey = getWeekKey(referenceDate);
	const rankedCandidates = rankCandidates(
		movies
			.filter(
				(movie) =>
					isReleasedForWeeklyRecommendations(movie, referenceDate) && isHighQualityMovie(movie),
			)
			.map((movie) => ({
				movie,
				era: getWeeklyRecommendationEra(movie, referenceDate),
				qualityScore: getQualityScore(movie),
			})),
		weekKey,
	);
	const freshCandidates = rankedCandidates.filter((candidate) => !excludedSlugs.has(candidate.movie.slug));
	const selected = selectCandidates(freshCandidates, normalizedLimit);

	if (selected.length < normalizedLimit) {
		const selectedSlugs = new Set(selected.map((candidate) => candidate.movie.slug));
		const fallbackCandidates = rankedCandidates.filter((candidate) => !selectedSlugs.has(candidate.movie.slug));
		selected.push(...selectCandidates(fallbackCandidates, normalizedLimit - selected.length));
	}

	return {
		generatedAt: getReferenceDateKey(referenceDate),
		weekKey,
		recommendations: selected.map((candidate) => ({
			slug: candidate.movie.slug,
			era: candidate.era,
		})),
	};
}

export function getWeeklyRecommendationPlatform(movie: Movie): string | null {
	return getConfirmedStreamingPlatforms(movie)[0] ?? null;
}
