export type AwardVisualKey =
	| 'oscar'
	| 'oscar-nomination'
	| 'golden-globe'
	| 'bafta'
	| 'emmy'
	| 'cannes'
	| 'grammy'
	| 'goya'
	| 'sag'
	| 'sur'
	| 'condor'
	| 'platino'
	| 'saturn'
	| 'peoples-choice'
	| 'mtv'
	| 'independent-spirit'
	| 'critics-choice'
	| 'volpi'
	| 'tony'
	| 'golden-lion'
	| 'silver-lion'
	| 'gotham'
	| 'berlinale'
	| 'cesar'
	| 'naacp'
	| 'aacta'
	| 'disney-legends'
	| 'imagen'
	| 'olivier'
	| 'logie'
	| 'martin-fierro'
	| 'walk-of-fame'
	| 'black-reel'
	| 'teen-choice'
	| 'national-movie'
	| 'family-film'
	| 'young-artist'
	| 'mark-twain'
	| 'bfi'
	| 'hasty-pudding'
	| 'generic';

type AwardVisualMeta = {
	label: string;
	assetPath?: string;
	alt: string;
	accent: string;
};

function illustrated(label: string, assetName: string, alt: string, accent = '#d5ba6d'): AwardVisualMeta {
	return {
		label,
		assetPath: `/brand/awards/illustrated/${assetName}.webp`,
		alt,
		accent,
	};
}

export const awardVisuals: Record<AwardVisualKey, AwardVisualMeta> = {
	oscar: illustrated(
		'Oscar',
		'oscar',
		'Ilustración editorial de una estatuilla cinematográfica dorada sobre un pedestal, inspirada en el Oscar',
		'#d5ba6d',
	),
	'oscar-nomination': illustrated(
		'Nominación al Oscar',
		'oscar-nomination',
		'Ilustración editorial de una carta de nominación con una firma y un pequeño dibujo dorado de una estatuilla cinematográfica, inspirada en una nominación al Oscar',
		'#cdb77c',
	),
	'golden-globe': illustrated(
		'Golden Globe',
		'golden-globe',
		'Ilustración editorial de un globo dorado sobre un pedestal, inspirado en el Golden Globe',
		'#e7b84a',
	),
	bafta: illustrated(
		'BAFTA',
		'bafta',
		'Ilustración editorial de una máscara dorada sobre un pedestal, inspirada en el BAFTA',
		'#d4a54c',
	),
	emmy: illustrated(
		'Emmy',
		'emmy',
		'Ilustración editorial de una figura alada dorada sobre un pedestal, inspirada en el Emmy',
		'#d9b35d',
	),
	cannes: illustrated(
		'Festival de Cannes',
		'cannes',
		'Ilustración editorial de una palma dorada sobre un pedestal, inspirada en el Festival de Cannes',
		'#d7bd70',
	),
	grammy: illustrated(
		'Grammy',
		'grammy',
		'Ilustración editorial de un gramófono dorado sobre un pedestal, inspirado en el Grammy',
		'#d6af54',
	),
	goya: illustrated(
		'Goya',
		'goya',
		'Ilustración editorial de un busto dorado sobre un pedestal, inspirado en el Premio Goya',
		'#d2a34b',
	),
	sag: illustrated(
		'Screen Actors Guild',
		'sag',
		'Ilustración editorial de una figura de actor con máscaras de comedia y tragedia, inspirada en el premio del sindicato de actores',
		'#c99b4a',
	),
	sur: illustrated(
		'Premios Sur',
		'sur',
		'Ilustración editorial de una copa alta de plata inspirada en los Premios Sur',
		'#b9c3c9',
	),
	condor: illustrated(
		'Cóndor de Plata',
		'condor',
		'Ilustración editorial de un cóndor plateado con las alas desplegadas sobre un pedestal, inspirada en el Cóndor de Plata',
		'#9eabb6',
	),
	platino: illustrated(
		'Premios Platino',
		'platino',
		'Ilustración editorial de una figura femenina plateada que sostiene un globo, inspirada en los Premios Platino',
		'#c7cbd0',
	),
	saturn: illustrated(
		'Saturn Award',
		'saturn',
		'Ilustración editorial de un planeta con anillos rodeado por una tira de película, inspirada en el Saturn Award',
		'#b17e42',
	),
	'peoples-choice': illustrated(
		"People's Choice",
		'peoples-choice',
		'Ilustración editorial de una llama de cristal sobre una base, inspirada en el People\'s Choice Award',
		'#c6d3dc',
	),
	mtv: illustrated(
		'MTV Movie & TV Award',
		'mtv',
		'Ilustración editorial de un balde de pochoclos dorado inspirado en el MTV Movie & TV Award',
		'#d0a447',
	),
	'independent-spirit': illustrated(
		'Independent Spirit Award',
		'independent-spirit',
		'Ilustración editorial de un ave plateada alada sobre una columna, inspirada en el Independent Spirit Award',
		'#aab9bc',
	),
	'critics-choice': illustrated(
		"Critics' Choice",
		'critics-choice',
		'Ilustración editorial de tres estrellas doradas sobre columnas, inspirada en el Critics\' Choice Award',
		'#d2aa4f',
	),
	volpi: illustrated(
		'Copa Volpi',
		'volpi',
		'Ilustración editorial de una copa plateada de asas curvas inspirada en la Copa Volpi',
		'#b6c4ca',
	),
	tony: illustrated(
		'Tony Award',
		'tony',
		'Ilustración editorial de una medalla con máscaras de comedia y tragedia sobre una base, inspirada en el Tony Award',
		'#b8a1bd',
	),
	'golden-lion': illustrated(
		'León de Oro',
		'golden-lion',
		'Ilustración editorial de un león alado dorado sobre una base, inspirada en el León de Oro',
		'#d6a84e',
	),
	'silver-lion': illustrated(
		'León de Plata',
		'silver-lion',
		'Ilustración editorial de un león alado plateado sobre una base, inspirada en el León de Plata',
		'#b4c0c8',
	),
	gotham: illustrated(
		'Gotham Awards',
		'gotham',
		'Ilustración editorial de una estatuilla geométrica de cine inspirada en los Gotham Awards',
		'#a997c6',
	),
	berlinale: illustrated(
		'Festival de Berlinale',
		'berlinale',
		'Ilustración editorial de un oso erguido sobre un pedestal, inspirada en el Oso de Berlinale',
		'#bd8878',
	),
	cesar: illustrated(
		'Premio César',
		'cesar',
		'Ilustración editorial de un trofeo escultórico rectangular y ornamentado inspirado en el Premio César',
		'#c1a16b',
	),
	naacp: illustrated(
		'NAACP Image Awards',
		'naacp',
		'Ilustración editorial de una figura plateada sosteniendo un globo, inspirada en los NAACP Image Awards',
		'#a38bbd',
	),
	aacta: illustrated(
		'AACTA Award',
		'aacta',
		'Ilustración editorial de una figura dorada estilizada sobre una base, inspirada en el AACTA Award',
		'#d1ae53',
	),
	'disney-legends': illustrated(
		'Disney Legends',
		'disney-legends',
		'Ilustración editorial de una figura con varita y estrella junto a un castillo, inspirada en Disney Legends',
		'#8da4d4',
	),
	imagen: illustrated(
		'Imagen Award',
		'imagen',
		'Ilustración editorial de un trofeo de cristal con forma de obelisco inspirado en el Imagen Award',
		'#c6a17c',
	),
	olivier: illustrated(
		'Olivier Award',
		'olivier',
		'Ilustración editorial de un busto coronado de Laurence Olivier inspirado en el Olivier Award',
		'#9eb89e',
	),
	logie: illustrated(
		'Logie Award',
		'logie',
		'Ilustración editorial de una figura dorada sosteniendo una placa de televisión, inspirada en el Logie Award',
		'#d38d8d',
	),
	'martin-fierro': illustrated(
		'Martín Fierro',
		'martin-fierro',
		'Ilustración editorial de una figura gauchesca dorada junto a una guitarra, inspirada en el Martín Fierro',
		'#c4a06b',
	),
	'walk-of-fame': illustrated(
		'Hollywood Walk of Fame',
		'walk-of-fame',
		'Ilustración editorial de una estrella rosada de terrazo con una cámara dorada, inspirada en el Hollywood Walk of Fame',
		'#d59b8f',
	),
	'black-reel': illustrated(
		'Black Reel Award',
		'black-reel',
		'Ilustración editorial de un trofeo con silueta de relámpago inspirado en el Black Reel Award',
		'#a998c7',
	),
	'teen-choice': illustrated(
		'Teen Choice Award',
		'teen-choice',
		'Ilustración editorial de un trofeo con forma de tabla de surf inspirado en el Teen Choice Award',
		'#8db9d3',
	),
	'national-movie': illustrated(
		'National Movie Award',
		'national-movie',
		'Ilustración editorial de una figura plateada que sostiene una estrella, inspirada en el National Movie Award',
		'#c0b0a0',
	),
	'family-film': illustrated(
		'Family Film Award',
		'family-film',
		'Ilustración editorial de una estatuilla familiar y cinematográfica inspirada en el Family Film Award',
		'#a5c598',
	),
	'young-artist': illustrated(
		'Young Artist Award',
		'young-artist',
		'Ilustración editorial de una figura dorada con una estrella y laureles, inspirada en el Young Artist Award',
		'#cba1bf',
	),
	'mark-twain': illustrated(
		'Mark Twain Prize',
		'mark-twain',
		'Ilustración editorial de un busto de Mark Twain en bronce sobre un pedestal, inspirada en el Mark Twain Prize',
		'#b49c78',
	),
	bfi: illustrated(
		'BFI Fellowship',
		'bfi',
		'Ilustración editorial de una medalla dorada con cruz azul y cinta roja, inspirada en el BFI Fellowship',
		'#5d7e7c',
	),
	'hasty-pudding': illustrated(
		'Hasty Pudding',
		'hasty-pudding',
		'Ilustración editorial de una olla dorada de pudding sobre un pedestal, inspirada en el Hasty Pudding Award',
		'#c99a68',
	),
	generic: illustrated(
		'Galardón',
		'generic',
		'Ilustración editorial de una estrella dorada con laureles y detalles de cine',
		'#9b8155',
	),
};

function normalizeAwardName(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[’']/g, '')
		.replace(/[-_/]+/g, ' ')
		.toLowerCase()
		.trim();
}

function isNominationText(value?: string): boolean {
	const normalized = normalizeAwardName(String(value ?? ''));
	return /\b(nominacion(?:es)?|nomination(?:s)?|nominad[oa]s?|nominated|nominee(?:s)?)\b/.test(normalized);
}

export function getAwardVisualKey(value?: string, category?: string): AwardVisualKey {
	const normalized = normalizeAwardName(String(value ?? ''));

	if (!normalized) return 'generic';
	if (normalized.includes('oscar')) {
		return isNominationText(`${value ?? ''} ${category ?? ''}`) ? 'oscar-nomination' : 'oscar';
	}
	if (normalized.includes('golden globe')) return 'golden-globe';
	if (normalized.includes('bafta')) return 'bafta';
	if (normalized.includes('emmy')) return 'emmy';
	if (normalized.includes('cannes') || normalized.includes('palma de oro')) return 'cannes';
	if (normalized.includes('grammy')) return 'grammy';
	if (normalized.includes('goya')) return 'goya';
	if (normalized.includes('sag') || normalized.includes('screen actors guild')) return 'sag';
	if (normalized.includes('premios sur') || normalized === 'sur' || normalized.includes('premio sur')) return 'sur';
	if (normalized.includes('condor')) return 'condor';
	if (normalized.includes('platino')) return 'platino';
	if (normalized.includes('saturn')) return 'saturn';
	if (normalized.includes('people') && normalized.includes('choice')) return 'peoples-choice';
	if (normalized.includes('mtv')) return 'mtv';
	if (normalized.includes('independent spirit')) return 'independent-spirit';
	if (normalized.includes('critics choice')) return 'critics-choice';
	if (normalized.includes('volpi')) return 'volpi';
	if (normalized.includes('tony')) return 'tony';
	if (normalized.includes('golden lion')) return 'golden-lion';
	if (normalized.includes('silver lion')) return 'silver-lion';
	if (normalized.includes('gotham')) return 'gotham';
	if (normalized.includes('berlinale')) return 'berlinale';
	if (normalized.includes('cesar')) return 'cesar';
	if (normalized.includes('naacp')) return 'naacp';
	if (normalized.includes('aacta')) return 'aacta';
	if (normalized.includes('disney legends')) return 'disney-legends';
	if (normalized.includes('imagen award')) return 'imagen';
	if (normalized.includes('olivier')) return 'olivier';
	if (normalized.includes('logie')) return 'logie';
	if (normalized.includes('martin fierro')) return 'martin-fierro';
	if (normalized.includes('walk of fame')) return 'walk-of-fame';
	if (normalized.includes('black reel')) return 'black-reel';
	if (normalized.includes('teen choice')) return 'teen-choice';
	if (normalized.includes('national movie')) return 'national-movie';
	if (normalized.includes('family film')) return 'family-film';
	if (normalized.includes('young artist')) return 'young-artist';
	if (normalized.includes('mark twain')) return 'mark-twain';
	if (normalized.includes('bfi fellowship')) return 'bfi';
	if (normalized.includes('hasty pudding')) return 'hasty-pudding';

	return 'generic';
}

export function getAwardDisplayLabel(value?: string, category?: string): string {
	return getAwardVisualKey(value, category) === 'oscar-nomination' ? 'Nominación al Oscar' : String(value ?? '');
}

export function getAwardVisualMeta(value?: string): AwardVisualMeta {
	const directKey = String(value ?? '') as AwardVisualKey;
	if (Object.prototype.hasOwnProperty.call(awardVisuals, directKey)) {
		return awardVisuals[directKey];
	}

	return awardVisuals[getAwardVisualKey(value)];
}
