import type { Movie } from '../types/movie';

export type PlatformVariant =
	| 'default'
	| 'cine'
	| 'cine-ar'
	| 'netflix'
	| 'hbo-max'
	| 'disney-plus'
	| 'prime-video'
	| 'apple-tv'
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
	'disney-plus': 'Disney+',
	'prime-video': 'Prime Video',
	'apple-tv': 'Apple TV+',
	crunchyroll: 'Crunchyroll',
	stremio: 'Stremio',
};

const PLATFORM_VARIANTS_BY_LABEL: Record<string, PlatformVariant> = {
	cine: 'cine',
	'cine.ar': 'cine-ar',
	netflix: 'netflix',
	'hbo max': 'hbo-max',
	'disney plus': 'disney-plus',
	'prime video': 'prime-video',
	'apple tv': 'apple-tv',
	crunchyroll: 'crunchyroll',
	stremio: 'stremio',
};

const PLATFORM_FILTER_ORDER = [
	'netflix',
	'disney plus',
	'hbo max',
	'prime video',
	'apple tv',
	'crunchyroll',
	'stremio',
	'cine',
	'cine.ar',
] as const;

const PLATFORM_FILTER_ORDER_INDEX = new Map(
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

export function getPlatformFilterOptions(
	movies: Array<Pick<Movie, 'releasePlatform'>>,
): PlatformFilterOption[] {
	const optionsByLabel = new Map<string, PlatformFilterOption>();

	for (const movie of movies) {
		const presentation = getPlatformPresentation(movie.releasePlatform);
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
