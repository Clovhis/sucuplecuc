#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const auditPath = path.resolve('skills/la-posta-cine-add-movie/scripts/review_audit.cjs');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cineposta-review-audit-'));

function writeMovie(fileName, movie) {
	fs.writeFileSync(path.join(tempDir, fileName), `${JSON.stringify(movie, null, 2)}\n`);
}

function runAudit(candidate) {
	return spawnSync(process.execPath, [auditPath, '--root', tempDir, '--candidate', candidate], {
		encoding: 'utf8',
	});
}

const originalSynopsis =
	'Una mujer vuelve a la ciudad donde creció para cerrar una herencia familiar y descubre que el pasado de su madre todavía condiciona cada decisión del barrio durante años.';
const templateSynopsis =
	'Una tripulación viaja hacia un planeta cubierto de vidrio para investigar una señal desconocida antes de que la colonia pierda todo contacto con la Tierra de manera definitiva.';

try {
	writeMovie('original.json', {
		title: 'La calle vacía',
		originalTitle: 'La calle vacía',
		verdictLabel: 'RECOMENDADA',
		director: 'Ana Pérez',
		mainCast: ['Lucía Díaz', 'Marta Sosa'],
		synopsis: originalSynopsis,
		review:
			'La calle vacía encuentra su mejor idea en el modo en que una herencia vuelve incómodo hasta el saludo entre vecinos. Ana Pérez filma las veredas, las persianas y los silencios de sobremesa con una precisión que no necesita subrayar el duelo, mientras Lucía Díaz deja que la bronca de su personaje aparezca en gestos mínimos. Algunas escenas intermedias se demoran de más, pero el final recupera una tensión seca y muy propia.',
	});
	writeMovie('template.json', {
		title: 'El planeta de vidrio',
		originalTitle: 'El planeta de vidrio',
		verdictLabel: 'NO RECOMENDADA',
		director: 'Bruno Vega',
		mainCast: ['Lara Paz', 'Nico Ruiz'],
		synopsis: templateSynopsis,
		review:
			'El planeta de vidrio tiene una premisa que podría explorar la soledad de una colonia aislada, pero el guion la reduce a una sucesión de sobresaltos sin peso. Bruno Vega arma escenas prolijas y el elenco intenta sostener la tensión, aunque los personajes se vuelven cada vez más intercambiables. El desastre final llega sin modificar esa inercia y deja una sensación clara de oportunidad perdida. NO RECOMENDADA: ciencia ficción de consumo rápido, con más ruido que imaginación y poco interés por sus propias ideas.',
	});

	const originalResult = runAudit(path.join(tempDir, 'original.json'));
	assert.equal(originalResult.status, 0, originalResult.stderr || originalResult.stdout);

	const templateResult = runAudit(path.join(tempDir, 'template.json'));
	assert.notEqual(templateResult.status, 0, 'A verdict-label template must fail the review audit.');
	assert.ok(
		templateResult.stderr.includes('verdict-label colon :: NO RECOMENDADA'),
		templateResult.stderr,
	);

	console.log('Review-audit regression checks passed.');
} finally {
	fs.rmSync(tempDir, { recursive: true, force: true });
}
