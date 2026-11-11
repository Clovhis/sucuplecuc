import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SOCIAL_REVIEW_CHECKS, validateDailySocial } from './lib/editorial-social.mjs';

const note = { slug: 'fixture-naza', title: 'NAZA y su estreno en 47 territorios' };
const url = 'https://www.cineposta.com.ar/editorial/fixture-naza/';
const core = 'NAZA y sus 47 territorios: también hay una historia de distribución para mirar. La contamos en la nota.';
const draft = () => ({ social: { version: 1, subject: 'NAZA' }, tweet: `${core} ${url} #Cine #Documental` });
const report = () => ({ social: { ...Object.fromEntries(SOCIAL_REVIEW_CHECKS.map(key => [key, true])), basis: 'Synthetic independent review of the specific news, angle and invitation, with secondary credits.' } });

test('the actual November 11 disclaimer/credits tweet cannot pass a new preparation', () => {
  const receipt = JSON.parse(readFileSync(new URL('../reports/daily-editorial/2026-11-11.json', import.meta.url), 'utf8'));
  assert.throws(() => validateDailySocial({ slug: receipt.slug, title: receipt.title }, { tweet: receipt.tweet, social: { version: 1, subject: 'NAZA' } }), /mensaje principal|presentación|créditos dominan/);
});

test('URL, hashtags and credits cannot substitute the name in the reader-facing message', () => {
  const value = draft();
  value.tweet = `Una novedad que invita a mirar cómo circulan las películas y qué cambia para sus espectadores. ${url} #NAZA`;
  assert.throws(() => validateDailySocial(note, value), /mensaje principal/);
  delete value.social;
  assert.throws(() => validateDailySocial(note, value), /social.version/);
});

test('a readable news invitation still needs every independent editorial judgment', () => {
  assert.doesNotThrow(() => validateDailySocial(note, draft(), report()));
  for (const field of SOCIAL_REVIEW_CHECKS) {
    const value = report(); value.social[field] = false;
    assert.throws(() => validateDailySocial(note, draft(), value), /aprobación editorial independiente/);
  }
  assert.throws(() => validateDailySocial(note, draft(), {}), /aprobación editorial independiente/);
});

test('concise required credits may accompany the story; a technical credits dump may not replace it', () => {
  const value = draft();
  value.tweet = `${core} ${url} #Cine Foto: Autor (CC BY-SA 4.0). Fuente: https://rights.example/photo Licencia: https://rights.example/license`;
  assert.doesNotThrow(() => validateDailySocial(note, value, report()));
  value.tweet = `NAZA: son admisiones reportadas, no personas únicas. ${url} #Cine Portada: Foto: Un autor con un crédito extenso y condiciones adicionales sobre transformación, reproducción, redimensionado y permisos.`;
  assert.throws(() => validateDailySocial(note, value), /presentación|créditos dominan/);
});

test('short and numeric film names remain valid subjects', () => {
  for (const subject of ['M', 'EO', '1917']) {
    const value = draft(); value.social.subject = subject; value.tweet = value.tweet.replace('NAZA', subject);
    assert.doesNotThrow(() => validateDailySocial({ ...note, title: `${subject}: una historia del cine` }, value));
  }
  const short = { social: { version: 1, subject: 'M' }, tweet: `M vuelve al cine restaurada. ¿La vemos de nuevo? ${url} #Cine` };
  assert.doesNotThrow(() => validateDailySocial({ ...note, title: 'M restaurada' }, short, report()), 'the existing 40-character comment margin does not force padding or a word quota');
});
