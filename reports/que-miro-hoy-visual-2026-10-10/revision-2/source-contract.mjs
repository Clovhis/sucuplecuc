import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = 'reports/que-miro-hoy-visual-2026-10-10';
const baselineRef = 'b9283f70';
const normalize = text => text.replaceAll('\r\n', '\n');
const now = normalize(readFileSync('src/pages/que-miro-hoy.astro', 'utf8'))
  .replace("import '../styles/postometro.css';\n", '')
  .replace('bodyClass="postometro-edition" ', '');
const original = normalize(execFileSync('git', ['show', `${baselineRef}:src/pages/que-miro-hoy.astro`], { encoding: 'utf8' }))
  .replace(/const (mood|company|time|intensity)OptionIcons: Record<string, string> = \{[\s\S]*?\};\n/g, '')
  .replace(/<span class="postometro-label-icon" aria-hidden="true">[^<]+<\/span> /g, '')
  .replace(/^\s*<span class="postometro-choice-card__icon" aria-hidden="true">[^\n]+<\/span>\n/gm, '')
  .replace(/<span class="postometro-chip-option__icon" aria-hidden="true">[^<]+<\/span>/g, '');
const assertSame = (label, current, baseline) => {
  if (JSON.stringify(current) !== JSON.stringify(baseline)) throw new Error(`${label} changed unexpectedly`);
};
assertSame('Frontmatter, catalog payload and metadata', now.split('---')[1], original.split('---')[1]);
for (const [label, expression] of [
  ['Radio controls and defaults', /<input\s[\s\S]*?\/>/g],
  ['Select controls, options and defaults', /<select\s[\s\S]*?<\/select>/g],
  ['Option labels and descriptions', /<span class="postometro-choice-card__body">[\s\S]*?<\/span>\s*<\/label>/g],
  ['Original illustration markup', /<figure\s[\s\S]*?<\/figure>/g],
  ['Buttons and form hooks', /<button\s[\s\S]*?<\/button>/g],
]) assertSame(label, now.match(expression), original.match(expression));
let expectedScript = normalize(execFileSync('git', ['show', `${baselineRef}:src/scripts/postometro.ts`], { encoding: 'utf8' }));
for (const text of [
  'La recomendación anterior ya no corresponde a estos ajustes.',
  'Volvé a buscar para recibir una nueva opción.',
  'Completá las opciones y te mostramos la que mejor calza con esta noche.',
  'Podés cambiar cualquier ajuste y volver a buscar.',
  'Estamos cruzando tu combo para sacar una recomendación que tenga sentido.',
  'Ánimo, compañía, tiempo, plataforma y época. Todo entra en la mezcla.',
]) expectedScript = expectedScript.replace(`'${text}'`, "''");
for (const line of [
  '<p>Con esta selección, la nueva recomendación aparece cuando toques <strong>Recomendame una película</strong>.</p>',
  '<p>Cuando termines de ajustar la noche, tocá <strong>Recomendame una película</strong> y la buscamos.</p>',
  '<p class="postometro-loading__eyebrow">Buscando película</p>',
]) expectedScript = expectedScript.replace(new RegExp(`^\\s*${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n`, 'm'), '');
expectedScript = expectedScript
  .replace('diagnosis.textContent = resultSet.diagnosis;', "diagnosis.textContent = '';")
  .replace('subheadline.textContent = resultSet.subheadline;', "subheadline.textContent = '';");
assertSame('Script logic outside the explicit copy removals', normalize(readFileSync('src/scripts/postometro.ts', 'utf8')), expectedScript);
const engineCopyChanges = [
  ['Tiene pulso para levantarte la noche sin sobreactuarla.', 'Para reírte un rato.'],
  ['Va bien si hoy querés una peli con nervio y presión.', 'Te mantiene en suspenso.'],
  ['Entrega show, ritmo y un plan sin vueltas.', 'Para pasarla bien y desconectar.'],
  ['Tiene humanidad y deja algo cálido más allá del género.', 'Para engancharte con los personajes.'],
  ['No termina cuando aparecen los créditos: deja ideas dando vueltas.', 'De esas que te dejan pensando.'],
  ['Sirve si querés sustos, clima o un mal viaje lindo.', 'Para cagarte un poco de miedo.'],
  ['Para verla solo funciona porque se banca bien su propio clima.', 'Para verla tranquilo, a tu ritmo.'],
  ['En pareja suele rendir porque deja charla o química.', 'Para ver juntos y comentarla después.'],
  ['Con amigos entra bien porque tiene energía para compartir.', 'Va bien para una noche con amigos.'],
  ['No es una bomba de incomodidad: para familia va bastante segura.', 'Una para ver en familia.'],
  ['No se pone pesada porque sí y entra bastante fácil.', 'Liviana, para despejarte un rato.'],
  ['Tiene sustancia, pero no exige fumársela con manual.', 'Te engancha sin hacerse pesada.'],
  ['Aprieta bastante y no juega a media máquina.', 'Para meterte de lleno en la historia.'],
  ['Tiene más capas y pide un poco más de cabeza, justo lo que buscaste.', 'Para verla con atención y darle unas vueltas.'],
  ['La duración hoy no te condiciona, así que ${runtimeLabel} no molesta.', 'Dura ${runtimeLabel}; hoy tenés tiempo.'],
  ['Dura ${runtimeLabel}, así que entra bastante bien para una noche corta.', 'Dura ${runtimeLabel}: no te lleva toda la noche.'],
  ['Con ${runtimeLabel} queda en una zona muy razonable para hoy.', 'Dura ${runtimeLabel}: va con el tiempo que tenés.'],
  ['Dura ${runtimeLabel}, así que se banca bien una noche larga.', 'Dura ${runtimeLabel}: para verla sin apuro.'],
  ['Encima ya está en ${entry.platformLabel}, así que no tenés que salir a buscarla por todos lados.', 'La encontrás en ${entry.platformLabel}.'],
  ['Dentro de Cine Posta queda marcada como ${entry.verdictLabel.toLowerCase()}.', 'En Cine Posta: ${entry.verdictLabel.toLowerCase()}.'],
];
let expectedEngine = normalize(execFileSync('git', ['show', `${baselineRef}:src/lib/postometro-engine.ts`], { encoding: 'utf8' }));
for (const [beforeText, afterText] of engineCopyChanges) {
  if (!expectedEngine.includes(beforeText)) throw new Error(`Missing source copy: ${beforeText}`);
  expectedEngine = expectedEngine.replace(beforeText, afterText);
}
assertSame('Engine outside the explicit reason text replacements', normalize(readFileSync('src/lib/postometro-engine.ts', 'utf8')), expectedEngine);
const before = JSON.parse(readFileSync(`${root}/source-before.json`, 'utf8'));
const stable = Object.entries(before).filter(([file]) => !file.endsWith('.astro') && !['src/scripts/postometro.ts', 'src/lib/postometro-engine.ts'].includes(file)).map(([file, hash]) => ({
  path: file,
  unchanged: createHash('sha256').update(readFileSync(file)).digest('hex') === hash,
}));
if (stable.some(entry => !entry.unchanged)) throw new Error('Protected source or artwork changed');
writeFileSync(`${root}/revision-2/source-contract.json`, JSON.stringify({
  baselineRef,
  pageOnlyChanges: ['CSS import', 'scoped body class', 'decorative emoji removal', 'redundant form and idle copy removed as requested'],
  controlsPayloadMetadataAndIllustrationsUnchanged: true,
  scriptLogicUnchangedBeyondAllowlistedCopyRemovals: true,
  engineLogicUnchangedBeyondAllowlistedReasonCopy: true,
  engineCopyChanges,
  stable,
}, null, 2));
console.log('Controls, payload, metadata and original illustrations unchanged; script and engine changes limited to the explicit copy edits.');
