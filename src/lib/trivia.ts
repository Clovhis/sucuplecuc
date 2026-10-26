/** Catalog facts only: no inferred plot, streaming availability or unrecorded credits. */
export interface TriviaSource {
	slug: string;
	title: string;
	year: number;
	poster: string;
	director: string;
	mainCast: string[];
	postCreditsScenes?: number;
	awards?: { wins: { award: string; category: string }[] };
}

export const TRIVIA_ROUNDS = 20;
export const TRIVIA_SECONDS = 20;
export const TRIVIA_HINTS = 3;
export const TRIVIA_HINT_BONUS = 250;
export const TRIVIA_MAX_POINTS = 24000 + TRIVIA_HINTS * TRIVIA_HINT_BONUS;
export const TRIVIA_KINDS = ['Reparto', 'Duplas', 'Dirección', 'Año de estreno', 'Postcréditos', 'Premios'] as const;
export type TriviaKind = typeof TRIVIA_KINDS[number];
export interface TriviaPerson { name: string; role: 'Reparto' | 'Dirección'; image?: string }
export interface TriviaQuestion {
	id: string;
	kind: TriviaKind;
	prompt: string;
	fact: string;
	answer: number;
	options: number[];
	people?: TriviaPerson[];
}
export interface TriviaMovie { slug: string; title: string; year: number; poster: string }
export interface TriviaBank { version: 1; movies: TriviaMovie[]; questions: TriviaQuestion[] }

const clean = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const person = (value: string) => value.trim().length > 4 && !/desconocid|confirmar|no (?:disponible|informad)|sin datos|n\/a|^varios$/i.test(value);
const hash = (value: string) => { let result = 2166136261; for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619); return result >>> 0; };

export function buildTriviaBank(input: TriviaSource[], year: number, resolvePeople?: (name: string, role: TriviaPerson['role']) => TriviaPerson[]): TriviaBank {
	const sources = input.filter((movie) => movie.year <= year && movie.poster && movie.title && movie.mainCast.length)
		.toSorted((a, b) => a.slug.localeCompare(b.slug));
	const movies = sources.map(({ slug, title, year, poster }) => ({ slug, title, year, poster }));
	const questions: TriviaQuestion[] = [];
	const prompts = new Set<string>();
	const casts = sources.map((movie) => new Set(movie.mainCast.map(clean)));
	const directors = sources.map((movie) => clean(movie.director));
	const neighborCache = new Map<number, number[]>();
	const titles = sources.map((movie) => clean(movie.title));

	function add(index: number, key: string, kind: TriviaKind, prompt: string, fact: string, matches: (other: number) => boolean) {
		if (prompts.has(prompt)) return;
		const movie = sources[index];
		const id = `${movie.slug}:${key}`;
		// Every distractor must fail the entire clue, including people shared by remakes/sequels.
		let neighbors = neighborCache.get(index);
		if (!neighbors) {
			const affinities = sources.map((other, j) => Math.abs(other.year - movie.year) + (directors[j] === directors[index] ? -10 : 0));
			neighbors = sources.map((_, j) => j).sort((a, b) => affinities[a] - affinities[b] || a - b);
			neighborCache.set(index, neighbors);
		}
		const candidates: number[] = [];
		for (const j of neighbors) {
			if (j !== index && titles[j] !== titles[index] && !matches(j)) candidates.push(j);
			if (candidates.length === 60) break;
		}
		// Rotate a plausible shortlist instead of always choosing the same two films.
		const shortlist = candidates.slice(0, 60).sort((a, b) => hash(`${id}/${a}`) - hash(`${id}/${b}`));
		const wrong = shortlist.slice(0, 2);
		if (wrong.length !== 2 || clean(sources[wrong[0]].title) === clean(sources[wrong[1]].title)) return;
		const options = [index, ...wrong].sort((a, b) => hash(`${id}|${a}`) - hash(`${id}|${b}`));
		const cast = movie.mainCast.filter(person);
		const clues: { name: string; role: TriviaPerson['role'] }[] = key === 'director-year' ? [{ name: movie.director, role: 'Dirección' }]
			: key === 'cast-director' ? [{ name: cast[0], role: 'Reparto' }, { name: movie.director, role: 'Dirección' }]
			: (key === 'pair' ? cast.slice(0, 2) : cast.slice(0, 1)).map((name) => ({ name, role: 'Reparto' }));
		const people = clues.flatMap(({ name, role }) => resolvePeople?.(name, role) ?? [{ name, role }]);
		questions.push({ id, kind, prompt, fact, answer: index, options, people });
		prompts.add(prompt);
	}

	for (const [i, movie] of sources.entries()) {
		const cast = movie.mainCast.filter(person);
		const lead = cast[0];
		const second = cast[1];
		if (lead) {
			add(i, 'cast-year', 'Reparto', `¿Qué película de ${movie.year} tiene a ${lead} en su reparto?`, `${lead} integra el reparto de ${movie.title} (${movie.year}).`, (j) => sources[j].year === movie.year && casts[j].has(clean(lead)));
			if (person(movie.director)) add(i, 'cast-director', 'Dirección', `¿En qué película se cruzan ${lead} en el reparto y ${movie.director} en la dirección?`, `${movie.title} reúne a ${lead} en el elenco y a ${movie.director} en la dirección.`, (j) => casts[j].has(clean(lead)) && directors[j] === directors[i]);
		}
		if (lead && second && clean(lead) !== clean(second)) {
			add(i, 'pair', 'Duplas', `¿En qué película comparten elenco ${lead} y ${second}?`, `${lead} y ${second} aparecen en ${movie.title} (${movie.year}).`, (j) => casts[j].has(clean(lead)) && casts[j].has(clean(second)));
		}
		if (person(movie.director)) {
			add(i, 'director-year', 'Año de estreno', `¿Cuál de estas películas dirigió ${movie.director} y se estrenó en ${movie.year}?`, `${movie.title} es una película de ${movie.director} de ${movie.year}.`, (j) => directors[j] === directors[i] && sources[j].year === movie.year);
		}
		if (lead && Number.isInteger(movie.postCreditsScenes) && movie.postCreditsScenes! > 0) {
			add(i, 'credits', 'Postcréditos', `¿Qué película con ${lead} tiene escenas durante o después de los créditos?`, `${movie.title} tiene ${movie.postCreditsScenes} ${movie.postCreditsScenes === 1 ? 'escena registrada' : 'escenas registradas'} durante o después de los créditos.`, (j) => casts[j].has(clean(lead)) && (sources[j].postCreditsScenes === undefined || sources[j].postCreditsScenes! > 0));
		}
		const award = movie.awards?.wins.find((win) => win.award === 'oscar' && /^mejor pel[ií]cula$/i.test(win.category));
		if (award && lead) {
			add(i, 'oscar', 'Premios', `¿Qué película con ${lead} ganó el Oscar a Mejor película?`, `${movie.title} ganó el Oscar a Mejor película y tiene a ${lead} en el reparto.`, (j) => casts[j].has(clean(lead)) && Boolean(sources[j].awards?.wins.some((win) => win.award === 'oscar' && /^mejor pel[ií]cula$/i.test(win.category))));
		}
	}
	return { version: 1, movies, questions };
}

export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/** Unseen questions first, recent films last, rotating categories; one film per session. */
export function selectTriviaSession(bank: TriviaBank, seen: string[] = [], recentMovies: string[] = [], random = Math.random): TriviaQuestion[] {
	const seenSet = new Set(seen);
	const recent = new Set(recentMovies);
	const queues = TRIVIA_KINDS.map((kind) => shuffled(bank.questions.filter((q) => q.kind === kind), random)
		.sort((a, b) => Number(seenSet.has(a.id)) - Number(seenSet.has(b.id)) || Number(recent.has(bank.movies[a.answer].slug)) - Number(recent.has(bank.movies[b.answer].slug))));
	const used = new Set<number>();
	const selected: TriviaQuestion[] = [];
	while (selected.length < TRIVIA_ROUNDS) {
		let added = false;
		for (const queue of shuffled(queues, random)) {
			// Don't repeat a seen question while another category still has unseen films.
			const unseenAvailable = queues.some((items) => items.some((q) => !used.has(q.answer) && !seenSet.has(q.id)));
			const next = queue.find((q) => !used.has(q.answer) && (!unseenAvailable || !seenSet.has(q.id)));
			if (!next) continue;
			used.add(next.answer);
			selected.push({ ...next, options: shuffled(next.options, random) });
			added = true;
			if (selected.length === TRIVIA_ROUNDS) break;
		}
		if (!added) break;
	}
	return selected;
}

export function resolveTriviaAnswer(question: TriviaQuestion, choice: number | null, deadline: number, now: number) {
	const expired = now >= deadline;
	return { choice: expired ? null : choice, correct: !expired && choice === question.answer, remainingMs: expired ? 0 : Math.min(TRIVIA_SECONDS * 1000, Math.max(0, deadline - now)) };
}

export function triviaPoints(correct: boolean, remainingMs: number): number {
	return correct ? 1000 + Math.floor(Math.min(20000, Math.max(0, remainingMs)) / 100) : 0;
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
