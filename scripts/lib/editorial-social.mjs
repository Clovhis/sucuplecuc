import { validateEditorialTweet } from '../publish-buffer-editorial-x.mjs';

export const SOCIAL_REVIEW_CHECKS = ['subjectClear', 'newsAndAngle', 'invitesReading', 'naturalArgentineSpanish', 'creditsSecondary'];
const normalize = value => String(value || '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es-AR').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const contains = (text, phrase) => (' ' + normalize(text) + ' ').includes(' ' + normalize(phrase) + ' ');
const plain = text => text.replace(/https?:\/\/[^\s]+/gu, '').replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/gu, ' ').trim();

// This is a presentation guard, not a semantic fact/tone detector. The native
// independent reviewer must separately approve the five editorial judgments.
export function validateDailySocial(note, draft, report) {
  const url = `https://www.cineposta.com.ar/editorial/${note.slug}/`;
  validateEditorialTweet(draft.tweet, url);
  const subject = draft.social?.subject;
  if (draft.social?.version !== 1 || typeof subject !== 'string' || !normalize(subject) || /^(el|la|los|las|un|una|cine|nota|noticia|pelicula|ojo|mas|nueva|nuevo)$/u.test(normalize(subject))) throw Error('Tweet: registrar social.version=1 y un sujeto cinematográfico concreto en social.subject.');
  const aliases = (draft.candidate?.entities || []).flatMap(entity => typeof entity === 'object' ? entity.aliases || [] : []);
  if (!contains(note.title, subject) && !aliases.some(alias => normalize(alias) === normalize(subject))) throw Error('Tweet: el sujeto debe corresponder al título o a un alias del candidato aprobado.');
  const creditStart = draft.tweet.search(/\b(?:portada|foto|fotograf[ií]a|imagen|cr[eé]ditos?|licencia|fuente)\s*:/iu);
  const core = plain(creditStart < 0 ? draft.tweet : draft.tweet.slice(0, creditStart));
  const credits = creditStart < 0 ? '' : plain(draft.tweet.slice(creditStart));
  if (!contains(core, subject)) throw Error('Tweet: nombrar la película, evento o protagonista en el mensaje principal, no sólo en URL, hashtags o créditos.');
  if (core.length < 40) throw Error('Tweet: falta una presentación con noticia y comentario propio; los créditos no cuentan como comentario editorial.');
  if (credits.length > core.length) throw Error('Tweet: los créditos dominan el mensaje. Reescribir sin omitir obligaciones o elegir otra portada con permiso compatible.');
  if (report !== undefined && (!SOCIAL_REVIEW_CHECKS.every(key => report.social?.[key] === true) || typeof report.social?.basis !== 'string' || report.social.basis.trim().length < 20)) throw Error('Tweet: falta aprobación editorial independiente de sujeto, noticia/ángulo, invitación, tono argentino y créditos secundarios.');
  return { subject, core };
}
