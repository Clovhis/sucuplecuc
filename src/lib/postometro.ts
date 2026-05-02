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

function inferMoods(movie: Movie, normalizedText: string, recommendationGenres: string[]): PostometroMoodId[] {
	void movie;
	const moods = new Set<PostometroMoodId>();
	const genreSet = new Set(recommendationGenres);

	if (genreSet.has('comedia') || hasAny(normalizedText, [/\bgracios/i, /\bhumor/i, /\bdivertid/i, /\babsurd/i])) {
		moods.add('risas');
	}

	if (
		genreSet.has('thriller') ||
		genreSet.has('crimen') ||
		hasAny(normalizedText, [
			/\btension/i,
			/\bsuspens/i,
			/\bthriller/i,
			/\bnervio/i,
			/\bparano/i,
			/\bamenaza/i,
			/\bpersec/i,
			/\binvestig/i,
			/\bconspir/i,
			/\basesin/i,
			/\bcrimen/i,
			/\bpolicial/i,
		])
	) {
		moods.add('tension');
	}

	if (
		genreSet.has('accion') ||
		genreSet.has('aventura') ||
		genreSet.has('superheroes') ||
		genreSet.has('sci-fi') ||
		hasAny(normalizedText, [/\bblockbuster/i, /\bespectac/i, /\bpulp/i, /\bfierros/i, /\bfranquicia/i, /\btanque/i])
	) {
		moods.add('pochoclo');
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
		moods.add('corazon');
	}

	if (
		genreSet.has('documental') ||
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
		moods.add('cabeza');
	}

	if (
		genreSet.has('terror') ||
		hasAny(normalizedText, [/\bsusto/i, /\bmal viaje/i, /\bslasher/i, /\bsobrenatural/i, /\bhorror/i])
	) {
		moods.add('sustos');
	}

	if (moods.size === 0) {
		moods.add('corazon');
	}

	return [...moods];
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
	return movies.map((movie) => {
		const normalizedText = buildNormalizedText(movie);
		const recommendationGenres = getRecommendationGenres(movie);
		const moods = inferMoods(movie, normalizedText, recommendationGenres);
		const intensities = inferIntensities(movie, normalizedText, recommendationGenres, moods);
		const isFamilyReady = inferFamilyReadiness(movie, normalizedText, recommendationGenres, moods, intensities);
		const groupFits = inferGroupFits(moods, intensities, isFamilyReady);

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
			intensities,
			groupFits,
			isFamilyReady,
			isArgentinian: isArgentinianMovie(movie),
		};
	});
}
