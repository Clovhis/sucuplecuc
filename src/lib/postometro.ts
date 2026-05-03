import type { Movie } from '../types/movie';
import {
	formatRuntimeMinutes,
	getMoviePath,
	getMoviePlatformLabel,
	getPosterUrl,
	getRecommendationGenres,
	getVerdictLabel,
	isArgentinianMovie,
	normalizeSearchText,
} from './movies';
import { getNormalizedMoviePlatforms, getPlatformFilterOptions } from './platforms';

export * from './postometro-engine';

import type {
	PostometroCatalogEntry,
	PostometroCompanyId,
	PostometroFirstInstallment,
	PostometroIntensityId,
	PostometroMoodId,
	PostometroPlatformOption,
} from './postometro-engine';

function buildNormalizedText(movie: Movie): string {
	return normalizeSearchText(
		[
			movie.title,
			movie.originalTitle,
			movie.category,
			...(movie.genres ?? []),
			movie.review,
			movie.synopsis,
			movie.director,
			...(movie.mainCast ?? []),
		].join(' '),
	);
}

function hasAny(text: string, patterns: RegExp[]): boolean {
	return patterns.some((pattern) => pattern.test(text));
}

function addMoodStrength(
	strengths: Map<PostometroMoodId, number>,
	mood: PostometroMoodId,
	value: number,
): void {
	strengths.set(mood, (strengths.get(mood) ?? 0) + value);
}

function inferMoods(movie: Movie, normalizedText: string, recommendationGenres: string[]): PostometroMoodId[] {
	const strengths = new Map<PostometroMoodId, number>();
	const genreSet = new Set(recommendationGenres);
	const normalizedCategory = normalizeSearchText(movie.category ?? '');
	const genreText = normalizeSearchText([movie.category ?? '', ...(movie.genres ?? [])].join(' '));
	const titleText = normalizeSearchText([movie.slug, movie.title, movie.originalTitle].join(' '));
	const isDocumentary = genreSet.has('documental');
	const hasAnimationOrAnimeGenre = genreSet.has('animacion') || genreSet.has('anime');
	const hasRomanceGenre = genreSet.has('romance');
	const hasAdventureWord = /\b(aventura|adventure)\b/.test(genreText);
	const hasPochocloGenre =
		genreSet.has('accion') ||
		genreSet.has('superheroes') ||
		genreSet.has('sci-fi') ||
		(genreSet.has('aventura') && (hasAdventureWord || (!hasAnimationOrAnimeGenre && !hasRomanceGenre)));
	const hasHorrorTitleSignal = hasAny(titleText, [
		/\ba quiet place\b/i,
		/\balien\b/i,
		/\bchucky\b/i,
		/\bconjuring\b/i,
		/\bexorcist\b/i,
		/\bfriday the 13th\b/i,
		/\bhalloween\b/i,
		/\blonglegs\b/i,
		/\bnightmare\b/i,
		/\bnosferatu\b/i,
		/\bomen\b/i,
		/\bsaw\b/i,
		/\bscream\b/i,
		/\bsilent hill\b/i,
		/\bsmile\b/i,
		/\bthe monkey\b/i,
		/\buntil dawn\b/i,
		/\bweapons\b/i,
		/\bwolf man\b/i,
	]);

	if (genreSet.has('comedia') || hasAny(normalizedText, [/\bgracios/i, /\bhumor/i, /\bdivertid/i, /\babsurd/i])) {
		addMoodStrength(strengths, 'risas', genreSet.has('comedia') ? 6 : 3);
	}

	if (
		(!isDocumentary && (genreSet.has('thriller') || genreSet.has('crimen'))) ||
		hasAny(normalizedText, [
			/\btension/i,
			/\bsuspens/i,
			/\bthriller/i,
			/\bparano/i,
			/\bamenaza/i,
			/\bpersec/i,
			/\bconspir/i,
			/\basesin/i,
			/\bcrimen/i,
			/\bpolicial/i,
		])
	) {
		addMoodStrength(strengths, 'tension', genreSet.has('thriller') || genreSet.has('crimen') ? 6 : 3);
	}

	if (
		hasPochocloGenre ||
		hasAny(normalizedText, [/\bblockbuster/i, /\bespectac/i, /\bpulp/i, /\bfierros/i, /\bfranquicia/i, /\btanque/i])
	) {
		addMoodStrength(strengths, 'pochoclo', hasPochocloGenre ? 6 : 3);
	}

	if (
		genreSet.has('romance') ||
		genreSet.has('animacion') ||
		genreSet.has('anime') ||
		hasAny(normalizedText, [
			/\bcalid/i,
			/\bternur/i,
			/\bsensible/i,
			/\bemocion/i,
			/\bacompan/i,
			/\bhumana/i,
			/\bvincul/i,
			/\bfamili/i,
			/\bafecto/i,
			/\bduelo/i,
		])
	) {
		addMoodStrength(
			strengths,
			'corazon',
			hasRomanceGenre || hasAnimationOrAnimeGenre ? 5 : 2,
		);
	}

	if (
		isDocumentary ||
		genreSet.has('oscar-mejor-pelicula') ||
		hasAny(normalizedText, [
			/\bdeja pensando/i,
			/\bexistencial/i,
			/\bmoral/i,
			/\bideas/i,
			/\bsensorial/i,
			/\bcomplej/i,
			/\bambigua/i,
			/\bdilema/i,
			/\bobservacion/i,
		])
	) {
		const oscarThinkingWeight =
			genreSet.has('oscar-mejor-pelicula') &&
			(genreSet.has('drama') || genreSet.has('thriller') || genreSet.has('crimen')) &&
			!hasRomanceGenre &&
			!genreSet.has('comedia')
				? 4
				: 2;
		addMoodStrength(strengths, 'cabeza', isDocumentary ? 6 : genreSet.has('oscar-mejor-pelicula') ? oscarThinkingWeight : 3);
	}

	if (
		genreSet.has('terror') ||
		hasHorrorTitleSignal ||
		hasAny(normalizedText, [/\bsusto/i, /\bmal viaje/i, /\bslasher/i, /\bsobrenatural/i, /\bhorror/i])
	) {
		addMoodStrength(strengths, 'sustos', genreSet.has('terror') || hasHorrorTitleSignal ? 7 : 4);
		if ((genreSet.has('terror') || hasHorrorTitleSignal) && !genreSet.has('thriller')) {
			addMoodStrength(strengths, 'tension', 2);
		}
	}

	if (isDocumentary && !genreText.includes('true crime') && !genreText.includes('policial')) {
		strengths.delete('tension');
	}

	if (normalizedCategory.includes('drama') && strengths.size === 0) {
		addMoodStrength(strengths, 'corazon', 2);
	}

	if (
		(genreSet.has('terror') || genreSet.has('thriller') || genreSet.has('crimen') || hasHorrorTitleSignal) &&
		!hasRomanceGenre &&
		!hasAnimationOrAnimeGenre &&
		(strengths.get('corazon') ?? 0) <= 2
	) {
		strengths.delete('corazon');
	}

	if (strengths.size === 0) {
		addMoodStrength(strengths, 'corazon', 2);
	}

	const moodPriority: PostometroMoodId[] = ['pochoclo', 'tension', 'sustos', 'risas', 'corazon', 'cabeza'];
	return [...strengths.entries()]
		.filter(([, score]) => score >= 2)
		.sort(
			([leftMood, leftScore], [rightMood, rightScore]) =>
				rightScore - leftScore || moodPriority.indexOf(leftMood) - moodPriority.indexOf(rightMood),
		)
		.map(([mood]) => mood);
}

function inferIntensities(
	movie: Movie,
	normalizedText: string,
	recommendationGenres: string[],
	moods: PostometroMoodId[],
): PostometroIntensityId[] {
	const intensities = new Set<PostometroIntensityId>(['equilibrada']);
	const genreSet = new Set(recommendationGenres);
	const moodSet = new Set(moods);

	if (
		genreSet.has('comedia') ||
		genreSet.has('animacion') ||
		genreSet.has('aventura') ||
		hasAny(normalizedText, [/\blivian/i, /\bentra facil/i, /\bentra sola/i, /\bencanto/i, /\bcarisma/i, /\bsimpat/i])
	) {
		intensities.add('liviana');
	}

	if (
		genreSet.has('terror') ||
		genreSet.has('thriller') ||
		genreSet.has('crimen') ||
		moodSet.has('sustos') ||
		hasAny(normalizedText, [/\bintens/i, /\bviolenc/i, /\bcrudeza/i, /\bseca\b/i, /\bobsesion/i, /\bgolpe/i])
	) {
		intensities.add('intensa');
	}

	if (
		genreSet.has('documental') ||
		hasAny(normalizedText, [/\bdensa/i, /\besquiva/i, /\bexistencial/i, /\bsensorial/i, /\bdelirante/i, /\bhabla mucho/i])
	) {
		intensities.add('densa');
	}

	if (movie.runtimeMinutes !== undefined && movie.runtimeMinutes >= 145 && !intensities.has('liviana')) {
		intensities.add('densa');
	}

	return [...intensities];
}

function inferFamilyReadiness(
	movie: Movie,
	normalizedText: string,
	recommendationGenres: string[],
	moods: PostometroMoodId[],
	intensities: PostometroIntensityId[],
): boolean {
	if (movie.verdict === 'no_recomendada' || movie.verdict === 'basura_atomica') {
		return false;
	}

	if (movie.audienceRating === 'ATP') {
		return !moods.includes('sustos') && !intensities.includes('densa');
	}

	const genreSet = new Set(recommendationGenres);
	const familyGenre =
		genreSet.has('animacion') ||
		genreSet.has('anime') ||
		genreSet.has('aventura') ||
		normalizeSearchText(movie.category).includes('fantasia');
	const hardEdge =
		moods.includes('sustos') ||
		intensities.includes('intensa') ||
		intensities.includes('densa') ||
		genreSet.has('terror') ||
		genreSet.has('crimen') ||
		hasAny(normalizedText, [/\bviolenc/i, /\bmal viaje/i, /\bcrudeza/i, /\bslasher/i]);

	return Boolean(movie.audienceRating === '+13' && familyGenre && !hardEdge);
}

function inferGroupFits(
	moods: PostometroMoodId[],
	intensities: PostometroIntensityId[],
	isFamilyReady: boolean,
): PostometroCompanyId[] {
	const fits = new Set<PostometroCompanyId>();
	fits.add('solo');

	if (moods.includes('corazon') || moods.includes('risas') || intensities.includes('liviana')) {
		fits.add('pareja');
	}

	if (moods.includes('pochoclo') || moods.includes('risas') || moods.includes('sustos') || moods.includes('tension')) {
		fits.add('amigos');
	}

	if (isFamilyReady) {
		fits.add('familia');
	}

	return [...fits];
}

function stripSequelMarker(value: string): string | null {
	const normalized = value.trim();
	const withoutMarker = normalized
		.replace(/\s*(?::|-|,)?\s*(?:part|parte|chapter|capitulo|capítulo|vol\.?|volume)\s*\b(?:2|two|ii|segunda parte)$/i, '')
		.replace(/\s*(?::|-|,)?\s*\b(?:2|two|ii)$/i, '')
		.trim();

	return withoutMarker && withoutMarker !== normalized ? withoutMarker : null;
}

function getFirstInstallmentFallback(movie: Movie): PostometroFirstInstallment | undefined {
	const firstTitle = stripSequelMarker(movie.title) ?? stripSequelMarker(movie.originalTitle);
	if (!firstTitle) {
		return undefined;
	}

	return {
		title: firstTitle,
	};
}

function getFirstInstallment(movie: Movie, moviesBySlug: Map<string, Movie>): PostometroFirstInstallment | undefined {
	const fallback = getFirstInstallmentFallback(movie);
	if (!fallback) {
		return undefined;
	}

	const normalizedFirstTitle = normalizeSearchText(fallback.title);
	const editorialCandidates = movie.editorial?.becauseYouLiked ?? [];
	const catalogMatch = editorialCandidates
		.map((slug) => moviesBySlug.get(slug))
		.find(
			(candidate) =>
				candidate !== undefined &&
				candidate.year < movie.year &&
				(normalizeSearchText(candidate.title) === normalizedFirstTitle ||
					normalizeSearchText(candidate.originalTitle) === normalizedFirstTitle),
		);

	if (catalogMatch) {
		return {
			title: catalogMatch.title,
			year: catalogMatch.year,
			url: getMoviePath(catalogMatch.slug),
		};
	}

	return fallback;
}

export function getPostometroPlatformOptions(movies: Movie[]): PostometroPlatformOption[] {
	return [
		{
			id: 'cualquiera',
			label: 'Cualquier plataforma',
			description: 'No filtramos por servicio y buscamos lo mejor para tu noche.',
		},
		...getPlatformFilterOptions(movies)
			.filter((option) => option.count > 0)
			.map((option) => ({
				id: option.normalizedLabel,
				label: option.displayLabel,
				description: `${option.count} títulos cargados en el catálogo actual.`,
			})),
	];
}

export function createPostometroCatalogEntries(movies: Movie[]): PostometroCatalogEntry[] {
	// The engine stays data-driven so new catalog entries start participating automatically
	// as soon as they expose the same base metadata the site already stores.
	const moviesBySlug = new Map(movies.map((movie) => [movie.slug, movie]));

	return movies.map((movie) => {
		const normalizedText = buildNormalizedText(movie);
		const recommendationGenres = getRecommendationGenres(movie);
		const moods = inferMoods(movie, normalizedText, recommendationGenres);
		const intensities = inferIntensities(movie, normalizedText, recommendationGenres, moods);
		const isFamilyReady = inferFamilyReadiness(movie, normalizedText, recommendationGenres, moods, intensities);
		const groupFits = inferGroupFits(moods, intensities, isFamilyReady);
		const firstInstallment = getFirstInstallment(movie, moviesBySlug);

		return {
			slug: movie.slug,
			title: movie.title,
			url: getMoviePath(movie.slug),
			posterUrl: getPosterUrl(movie.poster),
			year: movie.year,
			category: movie.category,
			review: movie.review,
			platformLabel: getMoviePlatformLabel(movie) || 'Plataforma no cargada',
			platforms: getNormalizedMoviePlatforms(movie),
			verdict: movie.verdict,
			verdictLabel: getVerdictLabel(movie),
			runtimeMinutes: movie.runtimeMinutes ?? null,
			runtimeLabel: movie.runtimeMinutes ? formatRuntimeMinutes(movie.runtimeMinutes) : 'Duración no cargada',
			recommendationGenres,
			moods,
			primaryMood: moods[0] ?? 'corazon',
			intensities,
			groupFits,
			isFamilyReady,
			isArgentinian: isArgentinianMovie(movie),
			...(firstInstallment ? { firstInstallment } : {}),
		};
	});
}
