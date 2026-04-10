export type AwardVisualKey = 'oscar' | 'golden-globe' | 'cannes' | 'grammy' | 'generic';

type AwardVisualMeta = {
	label: string;
	assetPath: string;
	alt: string;
};

export const awardVisuals: Record<AwardVisualKey, AwardVisualMeta> = {
	oscar: {
		label: 'Oscar',
		assetPath: '/brand/awards/oscar.svg',
		alt: 'Icono inspirado en la estatuilla del Oscar',
	},
	'golden-globe': {
		label: 'Golden Globe',
		assetPath: '/brand/awards/golden-globe.svg',
		alt: 'Icono inspirado en el trofeo del Golden Globe',
	},
	cannes: {
		label: 'Festival de Cannes',
		assetPath: '/brand/awards/cannes.svg',
		alt: 'Icono inspirado en la palma del Festival de Cannes',
	},
	grammy: {
		label: 'Grammy',
		assetPath: '/brand/awards/grammy.svg',
		alt: 'Icono inspirado en el gramofono del Grammy',
	},
	generic: {
		label: 'Galardon',
		assetPath: '/brand/awards/generic-award.svg',
		alt: 'Icono generico de galardon',
	},
};

function normalizeAwardName(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[-_/]+/g, ' ')
		.toLowerCase()
		.trim();
}

export function getAwardVisualKey(value?: string): AwardVisualKey {
	const normalized = normalizeAwardName(String(value ?? ''));

	if (!normalized) {
		return 'generic';
	}

	if (normalized.includes('oscar')) {
		return 'oscar';
	}

	if (normalized.includes('golden globe')) {
		return 'golden-globe';
	}

	if (normalized.includes('cannes') || normalized.includes('palma de oro')) {
		return 'cannes';
	}

	if (normalized.includes('grammy')) {
		return 'grammy';
	}

	return 'generic';
}

export function getAwardVisualMeta(value?: string): AwardVisualMeta {
	return awardVisuals[getAwardVisualKey(value)];
}
