import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { buildTriviaBank, selectTriviaSession, resolveTriviaAnswer, triviaPoints, triviaGrade, triviaHintBonus, chooseTriviaHint, storyClue } from '../src/lib/trivia.ts';
import { isTriviaPlayer, TRIVIA_COUNTRY_CODES } from '../src/lib/trivia-player.ts';
import { isTriviaNicknameAllowed } from '../src/lib/trivia-nickname.ts';
import { syncPolicy } from './sync-trivia-nickname-policy.mjs';

const blockedNicknames = ['Hitler','Pija','Concha','Pelotudo','hitler123','H1tl3r','h!tl€r','H I T L E R','Hiiiitlller','Нitler','Ｈｉｔｌｅｒ','Hіtler','P!j@','p i j a','P.I.J.A','xXPija123','C0NCH4','Cónchá','p3l0tud0','ElPelotudo','Boludo','b0lud0','La concha de tu madre','hijo de puta','put0','puta123','ElPutoPro','Forro','Forrro','Pajero','SiegHeil','Nazi','Nazi123','ChupaPija','Ｐｉｊａ'];
const allowedNicknames = ['Cinéfilo','Juan Pérez','Mati_1990','Hitchcock','Computadora','Pijamas','Reputación','Disputa','Amputado','Foro','ElForo','Nazir','Tarantino','Conchita','Guille','Nico','Cine🍿','Robert Mitchum','F. W. Murnau'];

const source = readdirSync(new URL('../src/data/movies/', import.meta.url)).filter((file) => file.endsWith('.json')).map((file) => JSON.parse(readFileSync(new URL(`../src/data/movies/${file}`, import.meta.url), 'utf8')));
const bank = buildTriviaBank(source, 2026);
const bySlug = new Map(source.map((movie) => [movie.slug, movie]));
const clean = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

test('banco real: más de 1000 preguntas únicas, exactamente tres opciones y una sola respuesta válida', () => {
 assert.ok(bank.questions.length >= 1000);
 assert.equal(new Set(bank.questions.map((q) => q.id)).size, bank.questions.length);
 assert.equal(new Set(bank.questions.map((q) => q.prompt)).size, bank.questions.length);
 for (const question of bank.questions) {
  assert.equal(/\b(?:18|19|20)\d{2}\b/.test(question.prompt), false, question.id);
  assert.ok(question.family === 'story' || question.people.length > 0);
  assert.ok(question.people.every((person) => question.prompt.includes(person.name)), `La foto debe pertenecer a una persona nombrada: ${question.id}`);
  assert.equal(question.options.length, 3);
  assert.equal(new Set(question.options).size, 3);
  assert.ok(question.options.includes(question.answer));
  const correct = bySlug.get(bank.movies[question.answer].slug);
  const cast = correct.mainCast.filter((name) => name.trim().length > 4 && !/desconocid|confirmar|no (?:disponible|informad)|sin datos|n\/a|^varios$/i.test(name));
  const has = (movie, name) => movie.mainCast.some((value) => clean(value) === clean(name));
  const win = (movie) => movie.awards?.wins.some((award) => award.award === 'oscar' && /^mejor pel[ií]cula$/i.test(award.category));
  const matches = (movie) => {
   if (question.id.endsWith(':story-v2')) return storyClue(movie) === storyClue(correct);
   if (question.id.endsWith(':cast-director')) return clean(movie.director) === clean(correct.director) && has(movie, cast[0]);
   if (question.id.endsWith(':pair')) return has(movie, cast[0]) && has(movie, cast[1]);
   if (question.id.endsWith(':credits')) return has(movie, cast[0]) && (movie.postCreditsScenes === undefined || movie.postCreditsScenes > 0);
   if (question.id.endsWith(':oscar')) return has(movie, cast[0]) && win(movie);
   throw new Error(`Unknown question ${question.id}`);
  };
  assert.deepEqual(question.options.filter((index) => matches(bySlug.get(bank.movies[index].slug))), [question.answer], question.id);
  for (const index of question.options) assert.ok(bySlug.has(bank.movies[index].slug));
 }
 assert.ok(bank.questions.filter(q=>q.family==='story').length >= 1000);
 console.log(`Trivia: ${bank.questions.length} preguntas, ${bank.movies.length} películas.`);
});

test('regresiones de dificultad: sin héroe regalado ni dos alternativas de la misma franquicia', () => {
 assert.ok(!bank.questions.some(q=>q.family==='story' && /superman|clark kent|krypton/i.test(q.prompt)));
 assert.ok(!bank.movies.some(m=>['spider-man-2002','shelter-2026'].includes(m.slug)));
 for(const q of bank.questions) {
  const options=q.options.map(i=>bySlug.get(bank.movies[i].slug));
  const isAR=m=>m.isArgentinian||m.country.split(',').map(s=>s.trim()).includes('AR');
  assert.equal(new Set(options.map(isAR)).size,1,q.id);
  const answer=bank.movies[q.answer].slug;
  const wrong=options.filter(m=>m.slug!==answer);
  assert.ok(!(wrong.every(m=>/^(?:x-men|matrix-|avatar)/.test(m.slug)) && wrong[0].slug.split('-')[0]===wrong[1].slug.split('-')[0]),q.id);
 }
});

test('codirecciones: una lista parcial o reordenada nunca genera una segunda respuesta correcta', () => {
 const key=name=>clean(name);
 const dirs=m=>m.director.split(/\s*,\s*|\s+y\s+|\s*&\s*/).map(key);
 for(const q of bank.questions.filter(q=>q.kind==='Dirección')) {
  const a=bySlug.get(bank.movies[q.answer].slug);
  for(const option of q.options.filter(index=>index!==q.answer)) {
   const b=bySlug.get(bank.movies[option].slug);
   assert.ok(!(b.mainCast.map(key).includes(key(a.mainCast[0])) && dirs(a).some(name=>dirs(b).includes(name))),q.id);
  }
 }
});

test('consignas narrativas: sin título regalado, fechas ni fragmentos huérfanos', () => {
 const movie={slug:'fixture',title:'Un título secreto',originalTitle:'Secret Title',synopsis:'Una familia encuentra una puerta que conduce a un mundo donde todos sus deseos tienen un precio inesperado.'};
 assert.ok(storyClue(movie));
 for(const synopsis of ['En 1984, una familia encuentra una puerta que conduce a un mundo donde todos sus deseos tienen un precio inesperado.', 'Un título secreto sigue a una familia que encuentra una puerta a otro mundo y debe descubrir cómo volver.', 'Un título secreto. Después de ese momento descubre una puerta que conduce a otro mundo donde sus deseos tienen un precio.']) assert.equal(storyClue({...movie,synopsis}),undefined);
 for(const q of bank.questions.filter(q=>q.family==='story')) {
  const movie=bySlug.get(bank.movies[q.answer].slug);
  for(const title of [movie.title,movie.originalTitle].filter(Boolean)) if(clean(title).length>=4) assert.ok(!clean(q.prompt).includes(clean(title)),q.id);
 }
});

test('partidas de 20 películas diferentes, variedad y preguntas nuevas entre sesiones', () => {
 const seen = [];
 const recent = [];
 for (let i = 0; i < 30; i++) {
  const deck = selectTriviaSession(bank, seen, recent);
  assert.equal(deck.length, 20);
  assert.equal(new Set(deck.map((q) => q.answer)).size, 20);
  assert.ok(new Set(deck.map((q) => q.kind)).size >= 3);
  assert.ok(deck.filter(q=>q.family==='story').length >= 12);
  assert.ok(deck.filter(q=>q.family==='credits').length <= 6);
  assert.ok(deck.filter(q=>q.kind==='Duplas').length <= 3);
  assert.ok(deck.filter(q=>q.kind==='Dirección').length <= 3);
  assert.ok(deck.every((q) => !seen.includes(q.id)));
  seen.push(...deck.map((q) => q.id));
  recent.push(...deck.map((q) => bank.movies[q.answer].slug));
 }
 const exhausted = selectTriviaSession(bank, bank.questions.map((q) => q.id));
 assert.equal(exhausted.length, 20);
 assert.equal(new Set(exhausted.map((q) => q.answer)).size, 20);
});

test('deadline estricto, bonus de velocidad y nota de 1 a 10', () => {
 const question = bank.questions[0];
 assert.equal(resolveTriviaAnswer(question, question.answer, 20000, 20000).correct, false);
 assert.equal(resolveTriviaAnswer(question, question.answer, 20000, 20001).choice, null);
 assert.equal(resolveTriviaAnswer(question, question.answer, 20000, 19999).correct, true);
 assert.equal(triviaPoints(false, 20000), 0);
 assert.equal(triviaPoints(true, 20000), 1200);
 assert.equal(triviaPoints(true, 1), 1000);
 assert.ok(triviaPoints(true, 18000) > triviaPoints(true, 2000));
 assert.equal(triviaGrade(24750), '10.0');
 assert.equal(triviaGrade(0), '1.0');
});

test('tres pistas por sesión: nunca descartan la correcta, una por pregunta y bonus de las restantes', () => {
 const deck = selectTriviaSession(bank);
 const hints = {};
 for (const question of deck.slice(0,3)) {
  const discarded = chooseTriviaHint(question, hints, 20000, 5000);
  assert.ok(question.options.includes(discarded));
  assert.notEqual(discarded, question.answer);
  hints[question.id] = discarded;
  assert.equal(chooseTriviaHint(question, hints, 20000, 5000), null);
 }
 assert.equal(chooseTriviaHint(deck[3], hints, 20000, 5000), null);
 assert.equal(chooseTriviaHint(deck[3], {}, 20000, 20000), null);
 assert.equal(triviaHintBonus(0),750);
 assert.equal(triviaHintBonus(1),500);
 assert.equal(triviaHintBonus(2),250);
 assert.equal(triviaHintBonus(3),0);
 const recovered = JSON.parse(JSON.stringify(hints));
 assert.equal(chooseTriviaHint(deck[3], recovered, 20000, 5000), null);
});

test('perfil obligatorio: nombre, nacionalidad, edad entera e identidad de jugador', () => {
 const profile = { id:'00000000-0000-4000-8000-000000000011', name:'Cinéfilo',country:'AR',age:30 };
 assert.equal(isTriviaPlayer(profile), true);
 for (const patch of [{name:''},{name:'a'},{name:'<script>'},{name:'Apodo\u0085'},{country:''},{country:'ZZ'},{age:0},{age:121},{age:20.5},{age:NaN},{id:''}]) assert.equal(isTriviaPlayer({...profile,...patch}), false, JSON.stringify(patch));
 assert.equal(TRIVIA_COUNTRY_CODES.length, 249);
});

test('nicknames: bloquea insultos y evasiones comunes sin rechazar nombres y palabras inocentes', () => {
 syncPolicy(true);
 for (const name of blockedNicknames) assert.equal(isTriviaNicknameAllowed(name),false,name);
 for (const name of allowedNicknames) assert.equal(isTriviaNicknameAllowed(name),true,name);
});

test('Supabase SQL: perfil ligado al resultado, edad pública, cálculo, ranking y reintentos', async () => {
 const db = new PGlite();
 try {
  await db.exec('create role anon; create role authenticated;');
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_high_scores.sql', import.meta.url), 'utf8'));
  for (const name of [...blockedNicknames,...allowedNicknames]) {
   const result = await db.query('select public.is_trivia_nickname_allowed($1) as allowed',[name]);
   assert.equal(result.rows[0].allowed,isTriviaNicknameAllowed(name),`Paridad SQL/cliente: ${name}`);
  }
  const id = '00000000-0000-4000-8000-000000000001';
  const answers = Array.from({length:20}, (_,i) => ({correct:i<12, remaining_ms:12345-i*100}));
  const expected = answers.reduce((sum, a) => sum + triviaPoints(a.correct, a.remaining_ms), 0) + triviaHintBonus(0);
  const playerId = '00000000-0000-4000-8000-000000000011';
  const submit = (sessionId, name, list, country='AR', age=30, player=playerId, hints=0) => db.query('select * from public.submit_trivia_high_score($1,$2,$3,$4,$5,$6::jsonb,$7)', [sessionId,player,name,country,age,JSON.stringify(list),hints]);
  for (const name of blockedNicknames) await assert.rejects(submit(id,name,answers),/nickname not allowed/);
  await assert.rejects(db.query("insert into public.trivia_high_scores(session_id,player_name,score,correct_count) values (gen_random_uuid(),'Hitler',24000,20)"),/nickname_policy_check/);
  assert.equal((await submit(id, 'Prueba local', answers)).rows[0].score, expected);
  assert.equal((await submit(id, 'Reintento', answers)).rows[0].score, expected);
  assert.equal((await db.query('select count(*)::int as n from public.trivia_high_scores')).rows[0].n, 1);
  const saved = (await db.query('select player_id,player_name,country_code,age from public.trivia_high_scores')).rows[0];
  assert.deepEqual(saved, {player_id:playerId,player_name:'Prueba local',country_code:'AR',age:30});
  await assert.rejects(submit(id, 'Prueba', answers, '',30));
  await assert.rejects(submit(id, 'Prueba', answers, 'AR',0));
  await assert.rejects(submit(id, 'Prueba', answers, 'AR',121));
  await assert.rejects(submit(id, 'Prueba', answers, 'AR',null));
  await assert.rejects(submit(id, 'Prueba', answers, 'AR',30,null));
  await assert.rejects(submit(id, 'Otro jugador', answers, 'AR',30,'00000000-0000-4000-8000-000000000012'));
  const fast = answers.map((a) => ({...a, remaining_ms:20000}));
  await submit('00000000-0000-4000-8000-000000000002', 'Más rápido', fast);
  const list = (await db.query('select * from public.list_trivia_high_scores(100)')).rows;
  assert.equal(list[0].player_name, 'Más rápido');
  assert.equal(list[0].correct_count, 12);
  assert.equal(list[0].country_code, 'AR');
  assert.equal(list[0].age,30);
  assert.ok(!('player_id' in list[0]));
  const perfect = answers.map(() => ({correct:true,remaining_ms:20000}));
  assert.equal((await submit('00000000-0000-4000-8000-000000000004','Sin pistas',perfect)).rows[0].score,24750);
  assert.equal((await submit('00000000-0000-4000-8000-000000000005','Dos pistas',perfect,'AR',30,playerId,2)).rows[0].score,24250);
  assert.equal((await submit('00000000-0000-4000-8000-000000000006','Tres pistas',perfect,'AR',30,playerId,3)).rows[0].score,24000);
  await assert.rejects(submit(id,'Prueba',answers,'AR',30,playerId,4));
  await assert.rejects(submit(id,'Prueba',answers,'AR',30,playerId,-1));
  await assert.rejects(submit(id,'Prueba',answers,'AR',30,playerId,null));
  // The same migration may be applied again without losing existing scores.
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_high_scores.sql', import.meta.url), 'utf8'));
  assert.equal((await db.query('select count(*)::int as n from public.trivia_high_scores')).rows[0].n, 5);
  await assert.rejects(submit(id, '<script>', answers));
  await assert.rejects(submit(id, 'Prueba', answers.slice(1)));
  await assert.rejects(submit(id, 'Prueba', answers.map((a) => ({...a,remaining_ms:20001}))));
  await assert.rejects(submit(id, 'Prueba', answers.map((a) => ({...a,remaining_ms:1.5}))));
  await assert.rejects(submit(id, 'Prueba', answers.map((a) => ({...a,remaining_ms:0}))));
  await db.exec('set role anon;');
  await assert.rejects(db.query('select * from public.trivia_high_scores'));
  await assert.rejects(db.query("insert into public.trivia_high_scores(session_id,player_name,score,correct_count) values (gen_random_uuid(),'intruso',24000,20)"));
  assert.equal((await db.query('select * from public.list_trivia_high_scores(1)')).rows.length, 1);
  await assert.rejects(submit('00000000-0000-4000-8000-000000000003', 'Anon', answers), /permission denied/);
  await db.exec('reset role; alter table public.trivia_high_scores drop constraint trivia_high_scores_nickname_policy_check;');
  await db.query("insert into public.trivia_high_scores(session_id,player_name,score,correct_count) values (gen_random_uuid(),'H1tl3r',24750,20)");
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_high_scores.sql', import.meta.url), 'utf8'));
  const publicRows = (await db.query('select * from public.list_trivia_high_scores(10)')).rows;
  assert.ok(publicRows.every((row) => isTriviaNicknameAllowed(row.player_name)));
  assert.equal(publicRows[0].rank,1);
  assert.equal((await db.query("select count(*)::int as n from public.trivia_high_scores where player_name='H1tl3r'")).rows[0].n,1);
 } finally { await db.close(); }
});
