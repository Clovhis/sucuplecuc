import { triviaCompatible, triviaGiveaway, triviaWords, triviaThemes, triviaTitleFamily, triviaDirectors, triviaCoreThemes, triviaHasEnglishProse, TRIVIA_QUARANTINE } from './trivia-quality.ts';
import { STORY_QUESTIONS } from './trivia-stories.ts';
import { TRIVIA_CLUES } from './trivia-clues.ts';

/** Questions use recorded credits and the catalog's own plot summaries. */
export interface TriviaSource {
	slug: string;
	title: string;
	year: number;
	poster: string;
	director: string;
	mainCast: string[];
	synopsis?: string;
	originalTitle?: string;
	category?: string;
	genres?: string[];
	country?: string;
	isArgentinian?: boolean;
	postCreditsScenes?: number;
	awards?: { wins: { award: string; category: string }[] };
}

export const TRIVIA_ROUNDS = 20;
export const TRIVIA_SECONDS = 25;
export const TRIVIA_HINTS = 3;
export const TRIVIA_HINT_BONUS = 250;
export const TRIVIA_MAX_POINTS = 24000 + TRIVIA_HINTS * TRIVIA_HINT_BONUS;
export const TRIVIA_KINDS = ['La historia', 'Duplas', 'Reparto', 'Dirección', 'Postcréditos', 'Premios', 'Tres pistas', 'Objetos', 'Lugares', 'El conflicto', 'Elegí el afiche'] as const;
export type TriviaKind = typeof TRIVIA_KINDS[number];
export interface TriviaPerson { name: string; role: 'Reparto' | 'Dirección'; image?: string }
export interface TriviaQuestion {
	id: string;
	kind: TriviaKind;
	family: 'story' | 'credits' | 'extra';
	prompt: string;
	fact: string;
	answer: number;
	options: number[];
	people?: TriviaPerson[];
	presentation?: 'posters';
}
export interface TriviaMovie { slug: string; title: string; year: number; poster: string }
export interface TriviaBank { version: 1; movies: TriviaMovie[]; questions: TriviaQuestion[]; rejected: { id: string; reason: string }[] }

/** Private server payload: preserve presentation metadata and replace catalog indices with film records. */
export function triviaQuestionPayload(question: TriviaQuestion, movies: TriviaMovie[]) {
	return { ...question, options: question.options.map(index => movies[index]), answer: movies[question.answer] };
}

const clean = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const person = (value: string) => value.trim().length > 4 && !/desconocid|confirmar|no (?:disponible|informad)|sin datos|n\/a|^varios$/i.test(value);
const hash = (value: string) => { let result = 2166136261; for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619); return result >>> 0; };

/** Only the opening premise: no orphan second sentences, dates, title giveaways or cut phrases. */
export function storyClue(movie: TriviaSource): string | undefined {
	if (STORY_QUESTIONS[movie.slug]) return STORY_QUESTIONS[movie.slug];
	const synopsis = movie.synopsis?.replace(/\s+/g, ' ').trim();
	if (!synopsis) return;
	const sentences = [...new Intl.Segmenter('es', { granularity: 'sentence' }).segment(synopsis)].map(({ segment }) => segment.trim());
	let clue = sentences[0];
	if (clue?.length < 65 && sentences[1] && `${clue} ${sentences[1]}`.length <= 240) clue += ` ${sentences[1]}`;
	if (!clue || clue.length < 65 || clue.length > 240 || /\b(?:18|19|20)\d{2}\b/.test(clue)) return;
	if (triviaHasEnglishProse(clue)) return;
	if (/la pel[ií]cula (?:comienza|se centra)|el (?:viaje|relato) tambi[eé]n|en esta (?:pel[ií]cula|historia)/i.test(clue)) return;
	if ([movie.title, movie.originalTitle].some((title) => title && clean(title).length >= 4 && clean(clue).includes(clean(title)))) return;
	return clue;
}

export function buildTriviaBank(input: TriviaSource[], year: number, resolvePeople?: (name: string, role: TriviaPerson['role']) => TriviaPerson[]): TriviaBank {
	const sources = input.filter((movie) => !TRIVIA_QUARANTINE[movie.slug] && movie.year <= year && movie.poster && movie.title && movie.mainCast.length)
		.toSorted((a, b) => a.slug.localeCompare(b.slug));
	const movies = sources.map(({ slug, title, year, poster }) => ({ slug, title, year, poster }));
	const questions: TriviaQuestion[] = [];
	const prompts = new Set<string>();
	const rejected: TriviaBank['rejected'] = [];
	const titleFrequency = new Map<string, number>();
	for (const movie of sources) for (const word of new Set(triviaWords(`${movie.title} ${movie.originalTitle ?? ''}`))) titleFrequency.set(word, (titleFrequency.get(word) ?? 0) + 1);
	const casts = sources.map((movie) => new Set(movie.mainCast.map(clean)));
	const directors = sources.map((movie) => clean(movie.director));
	const directorSets = sources.map((movie) => triviaDirectors(movie.director));
	// Partial credit lists cannot prove that a named codirector was absent.
	const sharesDirection = (a: number, b: number) => directorSets[a].some((name) => directorSets[b].includes(name));
	const neighborCache = new Map<number, number[]>();
	const titles = sources.map((movie) => clean(movie.title));
	const families = sources.map(triviaTitleFamily);
	const familyFrequency = new Map<string, number>();
	for (const family of families) familyFrequency.set(family, (familyFrequency.get(family) ?? 0) + 1);
	const stories = sources.map(storyClue);
	const themes = sources.map(triviaThemes);
	const core = sources.map((movie) => triviaCoreThemes(movie.synopsis ?? ''));
	const words = sources.map((movie) => new Set((movie.synopsis ?? '').toLowerCase().match(/[a-záéíóúñ]{5,}/g) ?? []));
	const related = (a: number, b: number) => {
		if (families[a].length >= 4 && families[a] === families[b] && (familyFrequency.get(families[a]) ?? 0) <= 12) return true;
		const namesA = [sources[a].title, sources[a].originalTitle].filter(Boolean).map((title) => clean(title!));
		const namesB = [sources[b].title, sources[b].originalTitle].filter(Boolean).map((title) => clean(title!));
		// Exclude matching titles and obvious sequel prefixes: short plot clues can fit both.
		if (namesA.some((x) => namesB.some((y) => x.length >= 4 && y.length >= 4 && (x.startsWith(y) || y.startsWith(x))))) return true;
		const shared = [...words[a]].filter((word) => words[b].has(word)).length;
		return shared / Math.max(1, Math.min(words[a].size, words[b].size)) > 0.55;
	};

	function add(index: number, key: string, kind: TriviaKind, prompt: string, fact: string, matches: (other: number) => boolean, clues: { name: string; role: TriviaPerson['role'] }[] = [], plausible: (other: number) => boolean = () => true) {
		const movie = sources[index];
		const id = `${movie.slug}:${key}`;
		const reject = (reason: string) => { rejected.push({ id, reason }); };
		if (prompts.has(prompt)) return reject('duplicate-prompt');
		const isStory = !['Duplas', 'Reparto', 'Dirección', 'Postcréditos', 'Premios'].includes(kind);
		const clueThemes = triviaCoreThemes(prompt);
		if (triviaHasEnglishProse(prompt) || triviaHasEnglishProse(fact.replace(movie.title, ''))) return reject('english-prose');
		if (isStory && triviaGiveaway(movie, prompt, titleFrequency)) return reject('title-or-iconic-character-giveaway');
		// Every distractor must fail the entire clue, including people shared by remakes/sequels.
		let neighbors = neighborCache.get(index);
		if (!neighbors) {
			const affinities = sources.map((other, j) => Math.abs(other.year - movie.year) / 3 + (other.category === movie.category ? -20 : 0) + (other.genres?.some((genre) => movie.genres?.includes(genre)) ? -10 : 0) + (directors[j] === directors[index] ? -10 : 0) - themes[index].filter((theme) => themes[j].includes(theme)).length * 12);
			neighbors = sources.map((_, j) => j).sort((a, b) => affinities[a] - affinities[b] || a - b);
			neighborCache.set(index, neighbors);
		}
		const candidates: number[] = [];
		for (const j of neighbors) {
			if (j !== index && titles[j] !== titles[index] && triviaCompatible(movie, sources[j], isStory) && (!isStory || themes[index].length === 0 || themes[index].some((theme) => themes[j].includes(theme))) && !related(index, j) && (!isStory || !clueThemes.length || clueThemes.some((theme) => core[j].includes(theme))) && plausible(j) && !matches(j)) candidates.push(j);
			if (isStory && candidates.length === 6) break;
		}
		// Rotate a plausible shortlist instead of always choosing the same two films.
		const covers = (j: number, clue: { name: string; role: TriviaPerson['role'] }) => clue.role === 'Reparto' ? casts[j].has(clean(clue.name)) : triviaDirectors(clue.name).some((name) => directorSets[j].includes(name));
		const anchors = clues.map((clue) => candidates.find((j) => covers(j, clue))).filter((j): j is number => j !== undefined);
		const shortlist = [...new Set([...candidates.slice(0, 6), ...anchors])].sort((a, b) => hash(`${id}/${a}`) - hash(`${id}/${b}`));
		const wrong = shortlist.slice(0, 1);
		const alternatives = shortlist.filter((j) => j !== wrong[0] && titles[j] !== titles[wrong[0]] && !related(j, wrong[0]));
		// Prefer one distractor for each half of a two-person clue when both exist.
		const secondWrong = alternatives.find((j) => clues.every((clue) => covers(j, clue) || covers(wrong[0], clue))) ?? alternatives[0];
		if (secondWrong !== undefined) wrong.push(secondWrong);
		if (wrong.length !== 2 || clean(sources[wrong[0]].title) === clean(sources[wrong[1]].title)) return reject('fewer-than-two-credible-distractors');
		const options = [index, ...wrong].sort((a, b) => hash(`${id}|${a}`) - hash(`${id}|${b}`));
		const people = clues.flatMap(({ name, role }) => resolvePeople?.(name, role) ?? [{ name, role }]);
		questions.push({ id, kind, family: isStory ? 'story' : ['Duplas', 'Reparto', 'Dirección'].includes(kind) ? 'credits' : 'extra', prompt, fact, answer: index, options, people, ...(kind === 'Elegí el afiche' ? { presentation: 'posters' as const } : {}) });
		prompts.add(prompt);
	}

	for (const [i, movie] of sources.entries()) {
		const cast = movie.mainCast.filter(person);
		const lead = cast[0];
		const second = cast[1];
		const story = stories[i];
		if (story) {
			const posters = hash(movie.slug) % 4 === 0;
			add(i, 'story-v2', posters ? 'Elegí el afiche' : 'La historia', STORY_QUESTIONS[movie.slug] ?? `${posters ? '¿Qué afiche corresponde a esta historia?' : '¿Qué película cuenta esta historia?'} ${story}`, story.replace(/¿[^?]+\?/g, '').trim(), (j) => stories[j] === story);
		}
		const clue = TRIVIA_CLUES[movie.slug];
		if (clue) add(i, 'clue-v1', clue.kind, clue.prompt, clue.prompt.replace(/¿[^?]+\?/g, '').trim(), (j) => sources[j].slug === movie.slug);
		if (lead && person(movie.director)) add(i, 'cast-director', 'Dirección', `¿En qué película se cruzan ${lead} en el reparto y ${movie.director} en la dirección?`, `${movie.title} reúne a ${lead} en el elenco y a ${movie.director} en la dirección.`, (j) => casts[j].has(clean(lead)) && sharesDirection(j, i), [{ name: lead, role: 'Reparto' }, { name: movie.director, role: 'Dirección' }], (j) => casts[j].has(clean(lead)) || sharesDirection(j, i));
		if (lead && second && clean(lead) !== clean(second)) {
			add(i, 'pair', 'Duplas', `¿En qué película comparten elenco ${lead} y ${second}?`, `${lead} y ${second} aparecen en ${movie.title}.`, (j) => casts[j].has(clean(lead)) && casts[j].has(clean(second)), [{ name: lead, role: 'Reparto' }, { name: second, role: 'Reparto' }], (j) => casts[j].has(clean(lead)) || casts[j].has(clean(second)));
		}
		const third = cast[2];
		if (second && third && clean(second) !== clean(third)) {
			add(i, 'supporting-pair', 'Reparto', `Más allá del protagonista: ¿en qué película aparecen ${second} y ${third}?`, `${second} y ${third} integran el reparto de ${movie.title}.`, (j) => casts[j].has(clean(second)) && casts[j].has(clean(third)), [{ name: second, role: 'Reparto' }, { name: third, role: 'Reparto' }], (j) => casts[j].has(clean(second)) || casts[j].has(clean(third)));
		}
		if (lead && Number.isInteger(movie.postCreditsScenes) && movie.postCreditsScenes! > 0) {
			add(i, 'credits', 'Postcréditos', `¿Qué película con ${lead} tiene escenas durante o después de los créditos?`, `${movie.title} tiene ${movie.postCreditsScenes} ${movie.postCreditsScenes === 1 ? 'escena registrada' : 'escenas registradas'} durante o después de los créditos.`, (j) => casts[j].has(clean(lead)) && (sources[j].postCreditsScenes === undefined || sources[j].postCreditsScenes! > 0), [{ name: lead, role: 'Reparto' }], (j) => casts[j].has(clean(lead)));
		}
		const award = movie.awards?.wins.find((win) => win.award === 'oscar' && /^mejor pel[ií]cula$/i.test(win.category));
		if (award && lead) {
			add(i, 'oscar', 'Premios', `¿Qué película con ${lead} ganó el Oscar a Mejor película?`, `${movie.title} ganó el Oscar a Mejor película y tiene a ${lead} en el reparto.`, (j) => casts[j].has(clean(lead)) && Boolean(sources[j].awards?.wins.some((win) => win.award === 'oscar' && /^mejor pel[ií]cula$/i.test(win.category))), [{ name: lead, role: 'Reparto' }], (j) => casts[j].has(clean(lead)));
		}
	}
	return { version: 1, movies, questions, rejected };
}

export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/** A majority of story clues, at most six credit questions, and one film per session. */
export function selectTriviaSession(bank: TriviaBank, seen: string[] = [], recentMovies: string[] = [], random = Math.random): TriviaQuestion[] {
	const seenSet = new Set(seen), recent = new Set(recentMovies), used = new Set<number>();
	const selected: TriviaQuestion[] = [];
	const counts = new Map<string, number>();
	const pool = shuffled(bank.questions, random).sort((a, b) => Number(seenSet.has(a.id)) - Number(seenSet.has(b.id)) || Number(recent.has(bank.movies[a.answer].slug)) - Number(recent.has(bank.movies[b.answer].slug)));
	for (const family of [...Array(12).fill('story'), ...Array(6).fill('credits'), ...Array(2).fill('extra')]) {
		const available = pool.filter((q) => !used.has(q.answer));
		const eligible = available.filter((q) => q.family === family && (family === 'story' || (counts.get(q.kind) ?? 0) < 3)).sort((a, b) => (counts.get(a.kind) ?? 0) - (counts.get(b.kind) ?? 0));
		const next = eligible.find((q) => !seenSet.has(q.id)) ?? available.find((q) => q.family === 'story' && !seenSet.has(q.id)) ?? eligible[0] ?? available.find((q) => q.family === 'story') ?? available[0];
		if (!next) break;
		used.add(next.answer); counts.set(next.kind, (counts.get(next.kind) ?? 0) + 1);
		selected.push({ ...next, options: shuffled(next.options, random) });
	}
	return shuffled(selected, random);
}

export function resolveTriviaAnswer(question: TriviaQuestion, choice: number | null, deadline: number, now: number) {
	const expired = now >= deadline;
	return { choice: expired ? null : choice, correct: !expired && choice === question.answer, remainingMs: expired ? 0 : Math.min(TRIVIA_SECONDS * 1000, Math.max(0, deadline - now)) };
}

export function triviaPoints(correct: boolean, remainingMs: number, seconds = TRIVIA_SECONDS): number {
	return correct ? 1000 + Math.floor(Math.min(seconds * 1000, Math.max(0, remainingMs)) / (seconds * 5)) : 0;
}

export function triviaGrade(points: number): string {
	return Math.max(1, Math.min(10, points / (TRIVIA_MAX_POINTS / 10))).toFixed(1);
}

export function triviaHintBonus(used: number): number {
	return (TRIVIA_HINTS - Math.min(TRIVIA_HINTS, Math.max(0, used))) * TRIVIA_HINT_BONUS;
}

/** One discarded wrong choice per question; three hints across the whole session. */
export function chooseTriviaHint(question: TriviaQuestion, hints: Record<string, number>, deadline: number, now: number, random = Math.random): number | null {
	if (now >= deadline || Object.keys(hints).length >= TRIVIA_HINTS || Object.hasOwn(hints, question.id)) return null;
	const wrong = question.options.filter((option) => option !== question.answer);
	return wrong[Math.floor(random() * wrong.length)] ?? null;
}
