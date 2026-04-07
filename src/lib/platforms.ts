import type { Movie } from '../types/movie';

export type PlatformVariant =
	| 'default'
	| 'cine'
	| 'cine-ar'
	| 'netflix'
	| 'hbo-max'
	| 'paramount-plus'
	| 'disney-plus'
	| 'prime-video'
	| 'apple-tv'
	| 'mercado-play'
	| 'crunchyroll'
	| 'stremio';

export interface PlatformAsset {
	src: string;
	wide?: boolean;
}

export interface PlatformPresentation {
	normalizedLabel: string;
	displayLabel: string;
	variant: PlatformVariant;
	asset: PlatformAsset | null;
	isKnownPlatform: boolean;
}

export interface PlatformFilterOption extends PlatformPresentation {
	count: number;
}

const PLATFORM_DISPLAY_LABELS: Partial<Record<PlatformVariant, string>> = {
	cine: 'En cines',
	'cine-ar': 'CINE.AR',
	netflix: 'Netflix',
	'hbo-max': 'HBO Max',
	'paramount-plus': 'Paramount+',
	'disney-plus': 'Disney+',
	'prime-video': 'Prime Video',
	'apple-tv': 'Apple TV+',
	'mercado-play': 'Mercado Play',
	crunchyroll: 'Crunchyroll',
	stremio: 'Stremio',
};

const PLATFORM_VARIANTS_BY_LABEL: Record<string, PlatformVariant> = {
	cine: 'cine',
	'cine.ar': 'cine-ar',
	netflix: 'netflix',
	'hbo max': 'hbo-max',
	paramount: 'paramount-plus',
	'paramount+': 'paramount-plus',
	'paramount plus': 'paramount-plus',
	'disney plus': 'disney-plus',
	'prime video': 'prime-video',
	'apple tv': 'apple-tv',
	'apple tv+': 'apple-tv',
	'mercado play': 'mercado-play',
	crunchyroll: 'crunchyroll',
	stremio: 'stremio',
};

const PLATFORM_FILTER_ORDER = [
	'netflix',
	'disney plus',
	'hbo max',
	'paramount plus',
	'prime video',
	'mercado play',
	'apple tv',
	'crunchyroll',
	'stremio',
	'cine',
	'cine.ar',
] as const;

const PLATFORM_FILTER_ORDER_INDEX = new Map<string, number>(
	PLATFORM_FILTER_ORDER.map((platformLabel, index) => [platformLabel, index]),
);

export const PLATFORM_ASSETS: Partial<Record<Exclude<PlatformVariant, 'default' | 'cine'>, PlatformAsset>> = {
	'cine-ar': {
		src: '/brand/platforms/cine-ar.svg',
		wide: true,
	},
	netflix: {
		src: '/brand/platforms/netflix.svg',
		wide: true,
	},
	'hbo-max': {
		src: '/brand/platforms/hbo-max.svg',
		wide: true,
	},
	'paramount-plus': {
		src: '/brand/platforms/paramount-plus.png',
		wide: true,
	},
	'disney-plus': {
		src: '/brand/platforms/disney-plus.svg',
		wide: true,
	},
	'prime-video': {
		src: '/brand/platforms/prime-video.svg',
		wide: true,
	},
	'apple-tv': {
		src: '/brand/platforms/apple-tv.svg',
		wide: true,
	},
	'mercado-play': {
		src: '/brand/platforms/mercado-play.svg',
		wide: true,
	},
	crunchyroll: {
		src: '/brand/platforms/crunchyroll.svg',
		wide: true,
	},
	stremio: {
		src: '/brand/platforms/stremio-wordmark.png',
		wide: true,
	},
};

export function normalizePlatformLabel(value: string | null | undefined): string {
	return String(value ?? '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

export function normalizePlatformList(values: Array<string | null | undefined>): string[] {
	const deduped = new Set<string>();

	for (const value of values) {
		const normalized = String(value ?? '').trim();
		if (!normalized) continue;
		deduped.add(normalized);
	}

	return [...deduped];
}

export function getPlatformVariant(value: string | null | undefined): PlatformVariant {
	return PLATFORM_VARIANTS_BY_LABEL[normalizePlatformLabel(value)] ?? 'default';
}

export function getPlatformPresentation(value: string | null | undefined): PlatformPresentation {
	const rawLabel = String(value ?? '').trim();
	const normalizedLabel = normalizePlatformLabel(rawLabel);
	const variant = getPlatformVariant(rawLabel);
	const asset = variant !== 'default' && variant !== 'cine' ? PLATFORM_ASSETS[variant] ?? null : null;
	const displayLabel = PLATFORM_DISPLAY_LABELS[variant] ?? rawLabel;

	return {
		normalizedLabel,
		displayLabel,
		variant,
		asset,
		isKnownPlatform: variant !== 'default',
	};
}

export function getPlatformPresentations(values: Array<string | null | undefined>): PlatformPresentation[] {
	return normalizePlatformList(values).map((value) => getPlatformPresentation(value));
}

export function getMoviePlatforms(movie: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>): string[] {
	const primaryPlatforms =
		Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0
			? movie.releasePlatforms
			: [movie.releasePlatform];

	return normalizePlatformList(primaryPlatforms).slice(0, 2);
}

export function getNormalizedMoviePlatforms(movie: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>): string[] {
	return getMoviePlatforms(movie)
		.map((platform) => normalizePlatformLabel(platform))
		.filter(Boolean);
}

export function getMoviePlatformLabel(movie: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>): string {
	return getPlatformPresentations(getMoviePlatforms(movie))
		.map((presentation) => presentation.displayLabel)
		.join(' + ');
}

export function moviesSharePlatform(
	left: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>,
	right: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>,
): boolean {
	const leftPlatforms = new Set(getNormalizedMoviePlatforms(left));
	return getNormalizedMoviePlatforms(right).some((platform) => leftPlatforms.has(platform));
}

export function getPlatformFilterOptions(
	movies: Array<Pick<Movie, 'releasePlatform' | 'releasePlatforms'>>,
): PlatformFilterOption[] {
	const optionsByLabel = new Map<string, PlatformFilterOption>();

	for (const platformLabel of PLATFORM_FILTER_ORDER) {
		const presentation = getPlatformPresentation(platformLabel);
		if (!presentation.normalizedLabel) continue;

		optionsByLabel.set(presentation.normalizedLabel, {
			...presentation,
			count: 0,
		});
	}

	for (const movie of movies) {
		for (const presentation of getPlatformPresentations(getMoviePlatforms(movie))) {
			if (!presentation.normalizedLabel) continue;

			const existing = optionsByLabel.get(presentation.normalizedLabel);
			if (existing) {
				existing.count += 1;
				continue;
			}

			optionsByLabel.set(presentation.normalizedLabel, {
				...presentation,
				count: 1,
			});
		}
	}

	return [...optionsByLabel.values()].sort((left, right) => {
		const normalizedLeftOrder = PLATFORM_FILTER_ORDER_INDEX.get(left.normalizedLabel) ?? Number.MAX_SAFE_INTEGER;
		const normalizedRightOrder = PLATFORM_FILTER_ORDER_INDEX.get(right.normalizedLabel) ?? Number.MAX_SAFE_INTEGER;

		return (
			normalizedLeftOrder - normalizedRightOrder ||
			right.count - left.count ||
			left.displayLabel.localeCompare(right.displayLabel, 'es')
		);
	});
}
