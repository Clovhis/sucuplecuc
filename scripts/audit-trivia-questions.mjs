// Exhaustive policy audit. The JSON includes every accepted question and every rejected candidate.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { buildTriviaBank, storyClue } from '../src/lib/trivia.ts';
import { triviaArgentina, triviaCompatible, triviaGiveaway, triviaThemes, triviaWords, triviaDirectors, triviaCoreThemes, TRIVIA_QUARANTINE } from '../src/lib/trivia-quality.ts';

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const year = Number(today.slice(0, 4));
const source = readdirSync(new URL('../src/data/movies/', import.meta.url)).filter(file => file.endsWith('.json')).map(file => JSON.parse(readFileSync(new URL(`../src/data/movies/${file}`, import.meta.url), 'utf8')))
 .filter(movie => movie.releaseDate ? movie.releaseDate <= today : movie.year < year);
const bank = buildTriviaBank(source, year);
const bySlug = new Map(source.map(movie => [movie.slug, movie]));
const frequency = new Map();
for (const movie of source.filter(movie => !TRIVIA_QUARANTINE[movie.slug])) for (const word of new Set(triviaWords(`${movie.title} ${movie.originalTitle ?? ''}`))) frequency.set(word, (frequency.get(word) ?? 0) + 1);
const normalize = value => triviaWords(value).join('');
const count = (items, key) => Object.fromEntries(items.reduce((map, item) => map.set(item[key], (map.get(item[key]) ?? 0) + 1), new Map()));
const checked = [];
for (const q of bank.questions) {
 const answer = bySlug.get(bank.movies[q.answer].slug);
 const options = q.options.map(i => bySlug.get(bank.movies[i].slug));
 const wrong = options.filter(movie => movie.slug !== answer.slug);
 const cast = answer.mainCast;
 const has = (movie, name) => movie.mainCast.some(person => normalize(person) === normalize(name));
 const oscar = movie => movie.awards?.wins.some(win => win.award === 'oscar' && /^mejor pel[ií]cula$/i.test(win.category));
 const story = q.family === 'story';
 assert.equal(options.length, 3, q.id);
 assert.equal(new Set(options.map(movie => normalize(movie.title))).size, 3, q.id);
 assert.ok(!/\b(?:18|19|20)\d{2}\b/.test(q.prompt), q.id);
 assert.ok(!options.some(movie => TRIVIA_QUARANTINE[movie.slug]), q.id);
 assert.ok(wrong.every(movie => triviaCompatible(answer, movie, story)), q.id);
 if (story) {
  assert.ok(!triviaGiveaway(answer, q.prompt, frequency), q.id);
  const themes = triviaThemes(answer);
  assert.ok(wrong.every(movie => !themes.length || themes.some(theme => triviaThemes(movie).includes(theme))), q.id);
  const core = triviaCoreThemes(storyClue(answer));
  assert.ok(wrong.every(movie => !core.length || core.some(theme => triviaCoreThemes(movie.synopsis ?? '').includes(theme))), q.id);
  assert.ok(q.prompt.length <= 300, q.id);
 } else if (q.kind === 'Duplas') {
  assert.ok(wrong.every(movie => has(movie, cast[0]) !== has(movie, cast[1])), q.id);
 } else if (q.kind === 'Dirección') {
  assert.ok(wrong.every(movie => has(movie, cast[0]) !== (triviaDirectors(movie.director).some(name => triviaDirectors(answer.director).includes(name)))), q.id);
 } else {
  assert.ok(wrong.every(movie => has(movie, cast[0])), q.id);
  if (q.kind === 'Postcréditos') assert.ok(wrong.every(movie => movie.postCreditsScenes === 0), q.id);
  if (q.kind === 'Premios') assert.ok(wrong.every(movie => !oscar(movie)), q.id);
 }
 checked.push({ id: q.id, kind: q.kind, family: q.family, context: triviaArgentina(answer) ? 'Argentina' : 'Internacional', prompt: q.prompt, answer: answer.title, options: options.map(movie => ({ slug: movie.slug, title: movie.title, year: movie.year, category: movie.category })), checks: 'passed' });
}
const summary = { date: today, checked: checked.length, kinds: count(checked, 'kind'), contexts: count(checked, 'context'), rejected: bank.rejected.length, reasons: count(bank.rejected, 'reason'), quarantined: TRIVIA_QUARANTINE, failures: 0 };
assert.ok(summary.checked >= 1000);
mkdirSync(new URL('../test-results/', import.meta.url), { recursive: true });
writeFileSync(new URL('../test-results/trivia-question-audit.json', import.meta.url), JSON.stringify({ summary, questions: checked, rejected: bank.rejected }, null, 2));
console.log(JSON.stringify(summary, null, 2));
