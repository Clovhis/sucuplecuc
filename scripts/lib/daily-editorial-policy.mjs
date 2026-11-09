import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';

export const argentinaDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export const normalizeTopic = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export const canonicalSource = value => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Se requieren fuentes HTTPS sin credenciales.');
  url.hash = '';
  url.search = '';
  return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`;
};
export function validateDraft(note, draft, previous, receipts, date) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(note.slug)) throw new Error('Slug inválido.');
  if (note.date !== date || draft.date !== date) throw new Error('La nota debe usar la fecha real de Argentina.');
  if (note.author !== 'CinePosta' || note.type !== 'nota' || note.spoilers) throw new Error('Se requiere nota informativa CinePosta sin spoilers fuertes.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.topicKey || '')) throw new Error('Falta topicKey estable.');
  if (draft.slug !== note.slug || !draft.decision || draft.decision.length > 1800) throw new Error('Selección ausente o demasiado extensa.');
  if (receipts.some(item => item.date === date || item.topicKey === draft.topicKey)) throw new Error('Día o tema ya publicado.');
  if (previous.some(item => item.slug === note.slug || normalizeTopic(item.title) === normalizeTopic(note.title))) throw new Error('Nota duplicada.');
  const sources = note.sources || [];
  if (new Set(sources.map(source => new URL(source.url).hostname.replace(/^www\./, ''))).size < 2) throw new Error('Se requieren dos fuentes de distintos dominios.');
  const canonical = new Set(sources.map(source => canonicalSource(source.url)));
  for (const old of previous) {
    const overlap = (old.sources || []).filter(source => canonical.has(canonicalSource(source.url))).length;
    if (overlap >= 2) throw new Error(`Tema posiblemente repetido con ${old.slug}; elegir un acontecimiento distinto.`);
  }
  const checks = draft.sourceChecks || [];
  if (!checks.some(check => check.role === 'primary')) throw new Error('Falta fuente primaria verificada.');
  for (const source of sources) {
    const check = checks.find(item => item.url === source.url);
    if (!check || check.checkedOn !== date || typeof check.facts !== 'string' || check.facts.length < 30) throw new Error(`Falta evidencia de fuente: ${source.url}`);
  }
  const words = note.content.filter(block => block.type === 'paragraph').flatMap(block => block.text.split(/\s+/u)).length;
  if (words < 850 || words > 1200) throw new Error(`Extensión fuera del rango editorial: ${words} palabras.`);
  const images = note.content.filter(block => block.type === 'image');
  if (images.length < 4 || images.length > 6 || new Set(images.map(image => image.src)).size !== images.length) throw new Error('Se requieren 4–6 imágenes narrativas distintas.');
  for (const image of [note.cover, ...images]) {
    if (!image.src.startsWith(`assets/editorial/${note.slug}/`) || !image.srcSmall || !image.source) throw new Error('Las imágenes deben ser locales, responsive y con procedencia.');
    const check = (draft.imageChecks || []).find(item => item.src === image.src);
    if (!check || check.sourceUrl !== image.source || check.checkedOn !== date || !check.description || check.description.length < 20) throw new Error(`Falta inspección visual: ${image.src}`);
  }
  return { words, images: images.length };
}
export function readJsonDirectory(directory) {
  return readdirSync(directory).filter(name => name.endsWith('.json')).map(name => JSON.parse(readFileSync(`${directory}/${name}`, 'utf8')));
}
export function assertPublicationScope(statuses, slug, date) {
  const notePath = `src/data/editorials/${slug}.json`;
  const receiptPath = `reports/daily-editorial/${date}.json`;
  for (const { status, path } of statuses) {
    if (!['A', '??'].includes(status) || !(path === notePath || path === receiptPath || new RegExp(`^public/assets/editorial/${slug}/[a-z0-9-]+\\.webp$`).test(path))) {
      throw new Error(`Cambio fuera del alcance diario: ${status} ${path}`);
    }
  }
  if (!statuses.some(item => item.path === notePath)) throw new Error('Debe agregarse exactamente una nota nueva.');
}
