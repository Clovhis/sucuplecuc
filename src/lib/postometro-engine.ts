import type { MovieVerdict } from '../types/movie';

export type PostometroMoodId =
	| 'risas'
	| 'tension'
	| 'pochoclo'
	| 'corazon'
	| 'cabeza'
	| 'sustos';

export type PostometroCompanyId = 'solo' | 'pareja' | 'amigos' | 'familia';
export type PostometroTimeId = 'flash' | 'normal' | 'larga' | 'sin-reloj';
export type PostometroIntensityId = 'liviana' | 'equilibrada' | 'intensa' | 'densa';
export type PostometroPlatformId = 'cualquiera' | string;
export type PostometroEraId = 'cualquiera' | 'clasicos' | 'modernas' | 'recientes';
export type PostometroResultMode = 'strict' | 'no-match';

export interface PostometroAnswers {
	mood: PostometroMoodId;
	time: PostometroTimeId;
	company: PostometroCompanyId;
	platform: PostometroPlatformId;
	intensity: PostometroIntensityId;
	era: PostometroEraId;
}

export interface PostometroOption<T extends string> {
	id: T;
	label: string;
	description: string;
}

export interface PostometroPreset {
	id: string;
	label: string;
	description: string;
	answers: PostometroAnswers;
}

export interface PostometroPlatformOption {
	id: PostometroPlatformId;
	label: string;
	description: string;
}

export interface PostometroCatalogEntry {
	slug: string;
	title: string;
	url: string;
	posterUrl: string;
	year: number;
	category: string;
	review: string;
	platformLabel: string;
	platforms: string[];
	verdict: MovieVerdict;
	verdictLabel: string;
	runtimeMinutes: number | null;
	runtimeLabel: string;
	recommendationGenres: string[];
	moods: PostometroMoodId[];
	primaryMood: PostometroMoodId;
	intensities: PostometroIntensityId[];
	groupFits: PostometroCompanyId[];
	isFamilyReady: boolean;
	isArgentinian: boolean;
	firstInstallment?: PostometroFirstInstallment;
}

export interface PostometroFirstInstallment {
	title: string;
	year?: number;
	url?: string;
}

export interface PostometroResultCard {
	slug: string;
	title: string;
	url: string;
	posterUrl: string;
	year: number;
	category: string;
	review: string;
	platformLabel: string;
	runtimeLabel: string;
	verdictLabel: string;
	reasons: string[];
	badges: string[];
	matchLabel: string;
	score: number;
	firstInstallment?: PostometroFirstInstallment;
}

export interface PostometroResultSet {
	mode: PostometroResultMode;
	diagnosis: string;
	headline: string;
	subheadline: string;
	note: string;
	results: PostometroResultCard[];
}

const moodOptionDescriptions: Record<PostometroMoodId, string> = {
	risas: 'Para cortar el día con algo gracioso o con buena onda.',
	tension: 'Querés nervio, suspenso o una peli que te agarre del cuello.',
	pochoclo: 'Buscás espectáculo, ritmo y cero culpa.',
	corazon: 'Te copa algo cálido, sensible o con humanidad.',
	cabeza: 'Querés una peli que deje algo para masticar después.',
	sustos: 'Hoy pinta terror, mal viaje o sobresalto.',
};

const companyOptionDescriptions: Record<PostometroCompanyId, string> = {
	solo: 'Podés bancarte algo más raro, intenso o personal.',
	pareja: 'Conviene que tenga química, ritmo o algo para comentar.',
	amigos: 'Necesita energía, ganchos rápidos o buenos momentos compartibles.',
	familia: 'Hace falta algo bastante amable y no demasiado áspero.',
};

const timeOptionDescriptions: Record<PostometroTimeId, string> = {
	flash: 'Ideal si no querés pasar de la hora y media larga.',
	normal: 'Te bancás una duración estándar sin irte al épico.',
	larga: 'No te jode pasar un buen rato largo en el sillón.',
	'sin-reloj': 'La duración hoy no manda.',
};

const intensityOptionDescriptions: Record<PostometroIntensityId, string> = {
	liviana: 'Que entre fácil y no se ponga densa al pedo.',
	equilibrada: 'Algo con sustancia, pero sin castigo.',
	intensa: 'Querés una peli que apriete fuerte.',
	densa: 'Hoy querés algo más profundo, cargado o exigente.',
};

const eraOptionDescriptions: Record<PostometroEraId, string> = {
	cualquiera: 'No filtramos por época: manda el mood de hoy.',
	clasicos: 'Querés ir a algo con olor a clásico, no a estreno de algoritmo.',
	modernas: 'Preferís una peli de este siglo para acá.',
	recientes: 'Querés algo bien nuevo, más cerca del catálogo fresco.',
};

export const POSTOMETRO_MOOD_OPTIONS: PostometroOption<PostometroMoodId>[] = [
	{ id: 'risas', label: 'Reírme', description: moodOptionDescriptions.risas },
	{ id: 'tension', label: 'Tensión', description: moodOptionDescriptions.tension },
	{ id: 'pochoclo', label: 'Pochoclo', description: moodOptionDescriptions.pochoclo },
	{ id: 'corazon', label: 'Con corazón', description: moodOptionDescriptions.corazon },
	{ id: 'cabeza', label: 'Para pensar', description: moodOptionDescriptions.cabeza },
	{ id: 'sustos', label: 'Sustos', description: moodOptionDescriptions.sustos },
];

export const POSTOMETRO_COMPANY_OPTIONS: PostometroOption<PostometroCompanyId>[] = [
	{ id: 'solo', label: 'Solo', description: companyOptionDescriptions.solo },
	{ id: 'pareja', label: 'En pareja', description: companyOptionDescriptions.pareja },
	{ id: 'amigos', label: 'Con amigos', description: companyOptionDescriptions.amigos },
	{ id: 'familia', label: 'En familia', description: companyOptionDescriptions.familia },
];

export const POSTOMETRO_TIME_OPTIONS: PostometroOption<PostometroTimeId>[] = [
	{ id: 'flash', label: 'Hasta 95 min', description: timeOptionDescriptions.flash },
	{ id: 'normal', label: 'Hasta 2 horas', description: timeOptionDescriptions.normal },
	{ id: 'larga', label: 'Me banco algo largo', description: timeOptionDescriptions.larga },
	{ id: 'sin-reloj', label: 'Sin reloj', description: timeOptionDescriptions['sin-reloj'] },
];

export const POSTOMETRO_INTENSITY_OPTIONS: PostometroOption<PostometroIntensityId>[] = [
	{ id: 'liviana', label: 'Liviana', description: intensityOptionDescriptions.liviana },
	{ id: 'equilibrada', label: 'Con peso justo', description: intensityOptionDescriptions.equilibrada },
	{ id: 'intensa', label: 'Intensa', description: intensityOptionDescriptions.intensa },
	{ id: 'densa', label: 'Profunda', description: intensityOptionDescriptions.densa },
];

export const POSTOMETRO_ERA_OPTIONS: PostometroOption<PostometroEraId>[] = [
	{ id: 'cualquiera', label: 'Cualquier época', description: eraOptionDescriptions.cualquiera },
	{ id: 'clasicos', label: 'Clásicos', description: eraOptionDescriptions.clasicos },
	{ id: 'modernas', label: '2000 para acá', description: eraOptionDescriptions.modernas },
	{ id: 'recientes', label: 'Bien nuevas', description: eraOptionDescriptions.recientes },
];

export const DEFAULT_POSTOMETRO_ANSWERS: PostometroAnswers = {
	mood: 'pochoclo',
	time: 'normal',
	company: 'amigos',
	platform: 'cualquiera',
	intensity: 'equilibrada',
	era: 'cualquiera',
};

export const POSTOMETRO_PRESETS: PostometroPreset[] = [
	{
		id: 'quemado',
		label: 'Vengo quemado',
		description: 'Poca paciencia y ganas de algo que entre solo.',
		answers: {
			mood: 'risas',
			time: 'flash',
			company: 'solo',
			platform: 'cualquiera',
			intensity: 'liviana',
			era: 'cualquiera',
		},
	},
	{
		id: 'cita',
		label: 'Plan cita',
		description: 'Algo que tenga química y deje tema de charla.',
		answers: {
			mood: 'corazon',
			time: 'normal',
			company: 'pareja',
			platform: 'cualquiera',
			intensity: 'equilibrada',
			era: 'cualquiera',
		},
	},
	{
		id: 'juntada',
		label: 'Hay juntada',
		description: 'Querés ritmo, ganchos rápidos y cero solemnidad.',
		answers: {
			mood: 'pochoclo',
			time: 'normal',
			company: 'amigos',
			platform: 'cualquiera',
			intensity: 'equilibrada',
			era: 'cualquiera',
		},
	},
	{
		id: 'sacudime',
		label: 'Sacudime',
		description: 'Una que meta presión de verdad.',
		answers: {
			mood: 'tension',
			time: 'normal',
			company: 'solo',
			platform: 'cualquiera',
			intensity: 'intensa',
			era: 'cualquiera',
		},
	},
	{
		id: 'cerebral',
		label: 'Quiero algo pesado',
		description: 'Hoy te bancás una peli más cargada.',
		answers: {
			mood: 'cabeza',
			time: 'larga',
			company: 'solo',
			platform: 'cualquiera',
			intensity: 'densa',
			era: 'cualquiera',
		},
	},
	{
		id: 'familia',
		label: 'Hay familia',
		description: 'Tiene que ser amable y no tirar cualquiera.',
		answers: {
			mood: 'corazon',
			time: 'normal',
			company: 'familia',
			platform: 'cualquiera',
			intensity: 'liviana',
			era: 'cualquiera',
		},
	},
];

const moodAdjacency: Record<PostometroMoodId, PostometroMoodId[]> = {
	risas: ['corazon', 'pochoclo'],
	tension: ['sustos'],
	pochoclo: ['risas', 'tension'],
	corazon: ['risas', 'cabeza'],
	cabeza: ['corazon', 'tension'],
	sustos: ['tension'],
};

const moodOpposition: Record<PostometroMoodId, PostometroMoodId[]> = {
	risas: ['sustos', 'tension'],
	tension: ['risas', 'corazon'],
	pochoclo: ['cabeza'],
	corazon: ['sustos', 'tension'],
	cabeza: ['pochoclo'],
	sustos: ['risas', 'corazon'],
};

const intensityAdjacency: Record<PostometroIntensityId, PostometroIntensityId[]> = {
	liviana: ['equilibrada'],
	equilibrada: ['liviana', 'intensa'],
	intensa: ['equilibrada', 'densa'],
	densa: ['intensa'],
};

const verdictBaseScore: Record<MovieVerdict, number> = {
	recomendada: 100,
	zafa: 72,
	no_recomendada: 18,
	basura_atomica: -50,
};

const moodPrimaryReasons: Record<PostometroMoodId, string> = {
	risas: 'Tiene pulso para levantar la noche sin hacerse la importante.',
	tension: 'Va bien si hoy querés una peli con nervio y presión.',
	pochoclo: 'Entrega espectáculo, ritmo y cero culpa.',
	corazon: 'Tiene humanidad y deja algo cálido más allá del género.',
	cabeza: 'No termina cuando aparecen los créditos: deja ideas dando vueltas.',
	sustos: 'Sirve si querés sustos, clima o mal viaje.',
};

const companyReasons: Record<PostometroCompanyId, string> = {
	solo: 'Para verla solo funciona porque se banca bien su propio clima.',
	pareja: 'En pareja tiene más chances de rendir porque da charla o química.',
	amigos: 'Con amigos debería entrar bien porque tiene energía compartible.',
	familia: 'No es una bomba de incomodidad: para familia va bastante segura.',
};

const intensityReasons: Record<PostometroIntensityId, string> = {
	liviana: 'No se pone densa al pedo y entra bastante fácil.',
	equilibrada: 'Tiene sustancia, pero no exige fumársela con manual.',
	intensa: 'Aprieta bastante y no juega a media máquina.',
	densa: 'Tiene más capas y pide un poco más de cabeza, justo lo que buscaste.',
};

const companyRotationOffset: Record<PostometroCompanyId, number> = {
	solo: 0,
	pareja: 1,
	amigos: 2,
	familia: 3,
};

function uniqueValues<T extends string>(values: T[]): T[] {
	return [...new Set(values)];
}

function getTimeScore(runtimeMinutes: number | null, wanted: PostometroTimeId): number {
	if (!runtimeMinutes || wanted === 'sin-reloj') {
		return 6;
	}

	if (wanted === 'flash') {
		if (runtimeMinutes <= 95) return 24;
		if (runtimeMinutes <= 108) return 13;
		if (runtimeMinutes <= 120) return 2;
		return -12;
	}

	if (wanted === 'normal') {
		if (runtimeMinutes <= 112) return 24;
		if (runtimeMinutes <= 128) return 14;
		if (runtimeMinutes <= 140) return 4;
		return -7;
	}

	if (wanted === 'larga') {
		if (runtimeMinutes >= 125) return 22;
		if (runtimeMinutes >= 108) return 10;
		return 0;
	}

	return 0;
}

function getMoodFitTier(entry: PostometroCatalogEntry, wanted: PostometroMoodId): number {
	if (entry.primaryMood === wanted) {
		return 0;
	}

	if (entry.moods.includes(wanted)) {
		return 1;
	}

	if (moodAdjacency[wanted].some((adjacent) => entry.moods.includes(adjacent))) {
		return 2;
	}

	if (moodOpposition[wanted].some((opposite) => entry.primaryMood === opposite)) {
		return 3;
	}

	return 4;
}

function hasMoodConflict(entry: PostometroCatalogEntry, wanted: PostometroMoodId): boolean {
	return moodOpposition[wanted].some((opposite) => entry.primaryMood === opposite);
}

function getMoodScore(entry: PostometroCatalogEntry, wanted: PostometroMoodId): number {
	const tier = getMoodFitTier(entry, wanted);
	const conflict = hasMoodConflict(entry, wanted);

	if (tier === 0) {
		return conflict ? 24 : 54;
	}

	if (tier === 1) {
		return conflict ? 10 : 34;
	}

	if (tier === 2) {
		return conflict ? -6 : 12;
	}

	if (tier === 3) {
		return -34;
	}

	return -22;
}

function getIntensityScore(entry: PostometroCatalogEntry, wanted: PostometroIntensityId): number {
	if (entry.intensities.includes(wanted)) {
		return 20;
	}

	if (intensityAdjacency[wanted].some((adjacent) => entry.intensities.includes(adjacent))) {
		return 8;
	}

	if (wanted === 'densa' && entry.runtimeMinutes !== null && entry.runtimeMinutes >= 135) {
		return 8;
	}

	return -5;
}

function getCompanyScore(entry: PostometroCatalogEntry, wanted: PostometroCompanyId): number {
	let score = 0;

	if (entry.groupFits.includes(wanted)) {
		score += 22;
	} else if (wanted === 'familia') {
		score -= 25;
	} else {
		score += 2;
	}

	if (wanted === 'pareja' && entry.moods.includes('corazon')) {
		score += 12;
	}

	if (wanted === 'amigos' && (entry.moods.includes('pochoclo') || entry.moods.includes('risas'))) {
		score += 12;
	}

	if (wanted === 'solo') {
		if (entry.moods.includes('cabeza')) score += 10;
		if (entry.moods.includes('tension')) score += 8;
		if (entry.intensities.includes('densa')) score += 8;
		if (entry.isFamilyReady && entry.moods.includes('risas')) score -= 5;
	}

	if (wanted === 'pareja') {
		if (entry.moods.includes('risas')) score += 8;
		if (entry.recommendationGenres.includes('romance')) score += 10;
		if (entry.runtimeMinutes !== null && entry.runtimeMinutes <= 125) score += 4;
		if (entry.intensities.includes('densa')) score -= 8;
	}

	if (wanted === 'amigos') {
		if (entry.moods.includes('pochoclo')) score += 14;
		if (entry.moods.includes('sustos')) score += 7;
		if (entry.intensities.includes('densa')) score -= 10;
		if (entry.moods.includes('cabeza')) score -= 6;
	}

	if (wanted === 'familia') {
		if (entry.isFamilyReady) score += 18;
		if (entry.moods.includes('corazon')) score += 8;
		if (entry.moods.includes('risas')) score += 8;
		if (
			entry.recommendationGenres.includes('animacion') ||
			entry.recommendationGenres.includes('aventura')
		) {
			score += 10;
		}
		if (entry.intensities.includes('intensa') || entry.intensities.includes('densa')) score -= 18;
		if (entry.moods.includes('sustos') || entry.moods.includes('tension')) score -= 14;
	}

	return score;
}

function matchesEra(year: number, wanted: PostometroEraId): boolean {
	if (wanted === 'cualquiera') {
		return true;
	}

	if (wanted === 'clasicos') {
		return year < 2000;
	}

	if (wanted === 'modernas') {
		return year >= 2000 && year < 2020;
	}

	return year >= 2020;
}

function getEraScore(entry: PostometroCatalogEntry, wanted: PostometroEraId): number {
	if (wanted === 'cualquiera') {
		return 0;
	}

	return matchesEra(entry.year, wanted) ? 16 : -30;
}

function getExtraScore(entry: PostometroCatalogEntry, answers: PostometroAnswers): number {
	let score = 0;

	if (answers.company === 'solo' && (entry.moods.includes('cabeza') || entry.intensities.includes('densa'))) {
		score += 6;
	}

	if (answers.company === 'pareja' && (entry.moods.includes('corazon') || entry.moods.includes('risas'))) {
		score += 6;
	}

	if (
		answers.company === 'amigos' &&
		(entry.moods.includes('pochoclo') || entry.moods.includes('sustos') || entry.moods.includes('risas'))
	) {
		score += 6;
	}

	if (answers.company === 'familia' && entry.isFamilyReady) {
		score += 8;
	}

	if (answers.mood === 'cabeza' && entry.recommendationGenres.includes('oscar-mejor-pelicula')) {
		score += 5;
	}

	if (answers.mood === 'corazon' && entry.isArgentinian) {
		score += 3;
	}

	if (answers.era === 'clasicos' && entry.year < 1985) {
		score += 4;
	}

	if (answers.era === 'recientes' && entry.year >= 2023) {
		score += 4;
	}

	if (entry.primaryMood === answers.mood) {
		score += 8;
	}

	if (entry.moods.includes(answers.mood) && entry.primaryMood !== answers.mood) {
		score += 3;
	}

	return score;
}

function scoreMovie(entry: PostometroCatalogEntry, answers: PostometroAnswers): number {
	let score = verdictBaseScore[entry.verdict] ?? 0;

	score += getMoodScore(entry, answers.mood);
	score += getIntensityScore(entry, answers.intensity);
	score += getCompanyScore(entry, answers.company);
	score += getTimeScore(entry.runtimeMinutes, answers.time);
	score += getEraScore(entry, answers.era);
	score += getExtraScore(entry, answers);

	if (answers.platform !== 'cualquiera') {
		score += 12;
	}

	return score;
}

function getMatchLabel(score: number): string {
	if (score >= 165) return 'Ideal para hoy';
	if (score >= 145) return 'Muy buena chance';
	if (score >= 120) return 'Te puede rendir mucho';
	return 'Plan B bastante digno';
}

function getTimeReason(runtimeLabel: string, answers: PostometroAnswers): string | null {
	if (!runtimeLabel) {
		return null;
	}

	if (answers.time === 'sin-reloj') {
		return `La duración hoy no te condiciona, así que ${runtimeLabel} no molesta.`;
	}

	if (answers.time === 'flash') {
		return `Dura ${runtimeLabel}, así que entra bastante bien para una noche corta.`;
	}

	if (answers.time === 'normal') {
		return `Con ${runtimeLabel} queda en una zona muy razonable para hoy.`;
	}

	return `Dura ${runtimeLabel}, así que se banca bien una noche larga.`;
}

function buildReasons(entry: PostometroCatalogEntry, answers: PostometroAnswers): string[] {
	const reasons: string[] = [];

	if (entry.moods.includes(answers.mood)) {
		reasons.push(moodPrimaryReasons[answers.mood]);
	}

	if (entry.groupFits.includes(answers.company)) {
		reasons.push(companyReasons[answers.company]);
	}

	if (entry.intensities.includes(answers.intensity)) {
		reasons.push(intensityReasons[answers.intensity]);
	}

	const timeReason = getTimeReason(entry.runtimeLabel, answers);
	if (timeReason) {
		reasons.push(timeReason);
	}

	if (answers.platform !== 'cualquiera') {
		reasons.push(`Encima ya está en ${entry.platformLabel}, así que no tenés que salir a cazarla.`);
	}

	reasons.push(`Dentro de Cine Posta queda marcada como ${entry.verdictLabel.toLowerCase()}.`);

	return uniqueValues(reasons).slice(0, 4);
}

function buildBadges(entry: PostometroCatalogEntry): string[] {
	return [entry.platformLabel, entry.runtimeLabel, entry.category, entry.verdictLabel].filter(Boolean).slice(0, 4);
}

function buildResultCard(entry: PostometroCatalogEntry, answers: PostometroAnswers, score: number): PostometroResultCard {
	return {
		slug: entry.slug,
		title: entry.title,
		url: entry.url,
		posterUrl: entry.posterUrl,
		year: entry.year,
		category: entry.category,
		review: entry.review,
		platformLabel: entry.platformLabel,
		runtimeLabel: entry.runtimeLabel,
		verdictLabel: entry.verdictLabel,
		reasons: buildReasons(entry, answers),
		badges: buildBadges(entry),
		matchLabel: getMatchLabel(score),
		score,
		...(entry.firstInstallment ? { firstInstallment: entry.firstInstallment } : {}),
	};
}

function humanizePlatformId(platform: PostometroPlatformId): string {
	return String(platform)
		.replace(/-/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function resolvePostometroPlatformLabel(
	platform: PostometroPlatformId,
	platformOptions: PostometroPlatformOption[] = [],
): string {
	if (platform === 'cualquiera') {
		return 'cualquier plataforma';
	}

	return platformOptions.find((option) => option.id === platform)?.label ?? humanizePlatformId(platform);
}

export function buildPostometroDiagnosis(answers: PostometroAnswers): string {
	const moodPart = {
		risas: 'te haga reír',
		tension: 'te tenga agarrado del cuello',
		pochoclo: 'te entretenga con oficio y ritmo',
		corazon: 'te deje algo cálido',
		cabeza: 'te deje pensando un rato',
		sustos: 'te pegue un buen mal viaje',
	}[answers.mood];

	const intensityPart = {
		liviana: 'sin ponerse intensa al pedo',
		equilibrada: 'con peso justo',
		intensa: 'apretando fuerte',
		densa: 'con bastante más profundidad',
	}[answers.intensity];

	const companyPart = {
		solo: 'para verla solo',
		pareja: 'para compartir en pareja',
		amigos: 'para aguantar bien una juntada',
		familia: 'que no incomode a media casa',
	}[answers.company];

	const timePart = {
		flash: 'y que no se vaya de mambo con la duración',
		normal: 'sin irse demasiado larga',
		larga: 'y no te molesta bancarte metraje',
		'sin-reloj': 'y hoy la duración te da igual',
	}[answers.time];

	const eraPart = {
		cualquiera: '',
		clasicos: ' Si encima es un clásico, mejor.',
		modernas: ' Mejor si es una peli de este siglo.',
		recientes: ' Y hoy preferís algo bien reciente.',
	}[answers.era];

	return `Hoy estás para una peli que ${moodPart}, ${intensityPart}, ${companyPart} ${timePart}.${eraPart}`;
}

function getEligibleCatalog(entries: PostometroCatalogEntry[], answers: PostometroAnswers, strictPlatform: boolean): PostometroCatalogEntry[] {
	return entries.filter((entry) => {
		if (entry.verdict === 'basura_atomica' || entry.verdict === 'no_recomendada') {
			return false;
		}

		if (answers.company === 'familia' && !entry.isFamilyReady) {
			return false;
		}

		if (strictPlatform && answers.platform !== 'cualquiera' && !entry.platforms.includes(answers.platform)) {
			return false;
		}

		if (!matchesEra(entry.year, answers.era)) {
			return false;
		}

		return true;
	});
}

function narrowCatalogByMood(entries: PostometroCatalogEntry[], wanted: PostometroMoodId): PostometroCatalogEntry[] {
	const primaryMatches = entries.filter((entry) => entry.primaryMood === wanted);
	if (primaryMatches.length >= 8) {
		return primaryMatches;
	}

	const exactMatches = entries.filter((entry) => entry.moods.includes(wanted));
	if (exactMatches.length > 0) {
		return exactMatches;
	}

	const adjacentMatches = entries.filter((entry) => getMoodFitTier(entry, wanted) <= 2);
	return wanted !== 'sustos' ? adjacentMatches : [];
}

function hashString(value: string): number {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
	}

	return hash;
}

function buildAnswerSignature(answers: PostometroAnswers): string {
	return [answers.mood, answers.time, answers.company, answers.platform, answers.intensity, answers.era].join('|');
}

function getDiversityKey(entry: PostometroCatalogEntry): string {
	const decade = Math.floor(entry.year / 10) * 10;
	const genre = entry.recommendationGenres.find((genreId) => genreId !== 'drama') ?? entry.category;
	const platform = entry.platforms[0] ?? entry.platformLabel;

	return [platform, decade, genre].join('|');
}

function reorderRankedEntriesForVariety(
	rankedEntries: Array<{ entry: PostometroCatalogEntry; score: number }>,
	answers: PostometroAnswers,
): Array<{ entry: PostometroCatalogEntry; score: number }> {
	if (rankedEntries.length < 2) {
		return rankedEntries;
	}

	const topScore = rankedEntries[0]?.score ?? 0;
	const primary = rankedEntries[0];
	if (!primary) {
		return rankedEntries;
	}

	const strongPool = rankedEntries.filter((item) => item.score >= topScore - 26);
	if (strongPool.length < 4) {
		return rankedEntries;
	}

	const signature = buildAnswerSignature(answers);
	const offset = (hashString(signature) + (companyRotationOffset[answers.company] ?? 0)) % strongPool.length;
	const rotatedPool = [...strongPool.slice(offset), ...strongPool.slice(0, offset)];
	const usedSlugs = new Set([primary.entry.slug]);
	const usedKeys = new Set([getDiversityKey(primary.entry)]);
	const diverseTail: Array<{ entry: PostometroCatalogEntry; score: number }> = [];

	for (const item of rotatedPool) {
		if (usedSlugs.has(item.entry.slug)) {
			continue;
		}

		const diversityKey = getDiversityKey(item.entry);
		if (usedKeys.has(diversityKey)) {
			continue;
		}

		usedSlugs.add(item.entry.slug);
		usedKeys.add(diversityKey);
		diverseTail.push(item);
	}

	return [
		primary,
		...diverseTail,
		...rankedEntries.filter((item) => !usedSlugs.has(item.entry.slug)),
	];
}

export function getPostometroResultSet(
	entries: PostometroCatalogEntry[],
	answers: PostometroAnswers,
	platformOptions: PostometroPlatformOption[] = [],
	limit = 12,
): PostometroResultSet {
	const strictEntries = getEligibleCatalog(entries, answers, true);
	const moodScopedEntries = narrowCatalogByMood(strictEntries, answers.mood);
	const platformLabel = resolvePostometroPlatformLabel(answers.platform, platformOptions);
	const moodLabel = POSTOMETRO_MOOD_OPTIONS.find((option) => option.id === answers.mood)?.label ?? answers.mood;

	if (moodScopedEntries.length === 0) {
		const platformContext =
			answers.platform === 'cualquiera'
				? 'para ese combo'
				: platformLabel.toLowerCase() === 'en cines'
					? 'en cines'
					: `en ${platformLabel}`;
		const platformNoteContext =
			answers.platform === 'cualquiera'
				? 'ese combo'
				: platformLabel.toLowerCase() === 'en cines'
					? 'en cines'
					: `en ${platformLabel}`;

		return {
			mode: 'no-match',
			diagnosis:
				answers.platform === 'cualquiera'
					? 'Con esa combinación no hay nada realmente compatible en el catálogo actual.'
					: `Con ese mood y esa plataforma, hoy no hay nada que cierre de verdad ${platformContext}.`,
			headline:
				answers.platform === 'cualquiera'
					? 'No hay una opción realmente redonda para ese combo'
					: `No hay una opción para "${moodLabel}" ahora mismo ${platformContext}`,
			subheadline: 'Mejor decirlo antes que chamuyarte una película que no corresponde.',
			note:
				answers.platform === 'cualquiera'
					? 'Probá aflojar un filtro o cambiar el mood para abrir opciones reales.'
					: `Probá otra plataforma o cambiá el mood. Hoy ${platformNoteContext} no da para vender humo.`,
			results: [],
		};
	}

	const rankedEntries = reorderRankedEntriesForVariety(
		moodScopedEntries
		.map((entry) => ({
			entry,
			score: scoreMovie(entry, answers),
		}))
		.sort(
			(left, right) =>
				right.score - left.score ||
				verdictBaseScore[right.entry.verdict] - verdictBaseScore[left.entry.verdict] ||
				right.entry.year - left.entry.year ||
				left.entry.title.localeCompare(right.entry.title, 'es'),
		)
		.slice(0, limit),
		answers,
	);

	const results = rankedEntries.map(({ entry, score }) => buildResultCard(entry, answers, score));

	return {
		mode: 'strict',
		diagnosis: buildPostometroDiagnosis(answers),
		headline: 'La mejor chance para esta noche',
		subheadline: 'La elección sale de tu combo de hoy y del catálogo editorial del sitio.',
		note: 'Qué vemos hoy sale del catálogo editorial de Cine Posta.',
		results,
	};
}
