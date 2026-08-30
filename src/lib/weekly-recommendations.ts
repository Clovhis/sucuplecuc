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

function getRotationScore(candidate: Candidate): number {
	return hashString(`weekly-recommendations:rotation-pool:${candidate.movie.slug}`);
}

function rankCandidates(candidates: Candidate[]): Candidate[] {
	return [...candidates].sort((left, right) => {
		// All candidates already passed the recommended verdict filter. Keep a
		// pseudo-random catalog order and rotate a different window through it each
		// week. That makes the same build reproducible while keeping consecutive
		// editions disjoint whenever the pool has enough titles.
		const rotationDelta = getRotationScore(right) - getRotationScore(left);
		if (rotationDelta !== 0) {
			return rotationDelta;
		}

		const qualityDelta = right.qualityScore - left.qualityScore;
		if (qualityDelta !== 0) {
			return qualityDelta;
		}

		return (
			getMovieReleaseTimestamp(right.movie) - getMovieReleaseTimestamp(left.movie) ||
			left.movie.title.localeCompare(right.movie.title, 'es')
		);
	});
}

function getWeekIndex(referenceDate: Date): number {
	const firstSunday = Date.UTC(1970, 0, 4);
	const weekStart = getUtcDayStart(referenceDate) - referenceDate.getUTCDay() * DAY_IN_MS;
	return Math.floor((weekStart - firstSunday) / (7 * DAY_IN_MS));
}

function getRotationStart(weekIndex: number, stride: number, poolSize: number): number {
	if (poolSize <= 0) {
		return 0;
	}

	return ((weekIndex * Math.max(1, stride)) % poolSize + poolSize) % poolSize;
}

function getEraTargets(
	limit: number,
	candidatesByEra: Record<WeeklyRecommendationEra, Candidate[]>,
): Record<WeeklyRecommendationEra, number> {
	const eras: WeeklyRecommendationEra[] = ['nueva', 'clasica', 'para-descubrir'];
	const targets = Object.fromEntries(eras.map((era) => [era, 0])) as Record<
		WeeklyRecommendationEra,
		number
	>;
	const availableEras = eras.filter((era) => candidatesByEra[era].length > 0);
	if (availableEras.length === 0) {
		return targets;
	}

	const baseTarget = Math.floor(limit / availableEras.length);
	let remainder = limit - baseTarget * availableEras.length;

	for (const era of availableEras) {
		if (remainder <= 0) {
			break;
		}

		targets[era] = baseTarget + 1;
		remainder -= 1;
	}

	for (const era of availableEras) {
		if (targets[era] === 0) {
			targets[era] = baseTarget;
		}
	}

	return targets;
}

function selectCandidates(candidates: Candidate[], limit: number, weekIndex: number): Candidate[] {
	const selectedByEra: Record<WeeklyRecommendationEra, Candidate[]> = {
		nueva: [],
		clasica: [],
		'para-descubrir': [],
	};
	const candidatesByEra: Record<WeeklyRecommendationEra, Candidate[]> = {
		nueva: candidates.filter((candidate) => candidate.era === 'nueva'),
		clasica: candidates.filter((candidate) => candidate.era === 'clasica'),
		'para-descubrir': candidates.filter((candidate) => candidate.era === 'para-descubrir'),
	};
	const selectedSlugs = new Set<string>();
	const targets = getEraTargets(limit, candidatesByEra);

	const pickFromEra = (era: WeeklyRecommendationEra, targetCount: number) => {
		const eraCandidates = candidatesByEra[era];
		const start = getRotationStart(weekIndex, targetCount, eraCandidates.length);

		for (let offset = 0; offset < eraCandidates.length && selectedByEra[era].length < targetCount; offset += 1) {
			const candidate = eraCandidates[(start + offset) % eraCandidates.length];
			if (selectedSlugs.has(candidate.movie.slug)) {
				continue;
			}

			selectedByEra[era].push(candidate);
			selectedSlugs.add(candidate.movie.slug);
		}
	};

	for (const era of ['nueva', 'clasica', 'para-descubrir'] as WeeklyRecommendationEra[]) {
		pickFromEra(era, targets[era]);
	}

	const fillStart = getRotationStart(weekIndex, Math.max(1, limit), candidates.length);
	for (let offset = 0; offset < candidates.length && selectedSlugs.size < limit; offset += 1) {
		const candidate = candidates[(fillStart + offset) % candidates.length];
		if (selectedSlugs.has(candidate.movie.slug)) {
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

function getRankedCandidates(movies: Movie[], referenceDate: Date): Candidate[] {
	return rankCandidates(
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
	);
}

function buildWeeklyRecommendationManifest(
	movies: Movie[],
	referenceDate: Date,
	limit: number,
	excludedSlugs: ReadonlySet<string>,
): WeeklyRecommendationManifest {
	const normalizedLimit = Math.max(0, Math.floor(limit));
	const weekKey = getWeekKey(referenceDate);
	const weekIndex = getWeekIndex(referenceDate);
	const rankedCandidates = getRankedCandidates(movies, referenceDate);
	const freshCandidates = rankedCandidates.filter((candidate) => !excludedSlugs.has(candidate.movie.slug));
	const selected = selectCandidates(freshCandidates, normalizedLimit, weekIndex);

	if (selected.length < normalizedLimit) {
		const selectedSlugs = new Set(selected.map((candidate) => candidate.movie.slug));
		const fallbackCandidates = rankedCandidates.filter(
			(candidate) => !selectedSlugs.has(candidate.movie.slug) && !excludedSlugs.has(candidate.movie.slug),
		);
		selected.push(...selectCandidates(fallbackCandidates, normalizedLimit - selected.length, weekIndex));
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

export function getWeeklyRecommendationManifest(
	movies: Movie[],
	referenceDate = new Date(),
	limit = WEEKLY_RECOMMENDATION_LIMIT,
	excludedSlugs: ReadonlySet<string> = new Set(),
): WeeklyRecommendationManifest {
	return buildWeeklyRecommendationManifest(movies, referenceDate, limit, excludedSlugs);
}

export function getWeeklyRecommendationPlatform(movie: Movie): string | null {
	return getConfirmedStreamingPlatforms(movie)[0] ?? null;
}
