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
const originalTenSecondTake = {
	verdict: 'La calle vacía encuentra emoción en los modales incómodos y las puertas que Ana Pérez no deja cerrar del todo.',
	whatToExpect: 'Vecinos atravesados por una herencia que vuelve tenso hasta el saludo de cada mañana.',
	pace: 'Camina con calma y deja que las discusiones familiares revelen su peso de a poco.',
	intensity: 'No busca golpes bajos, aunque el duelo y el rencor se sienten debajo de cada escena.',
	practicalContext: 'Funciona mejor en una noche sin apuro, cuando hay lugar para escuchar sus silencios.',
	forFansOf: 'Los dramas argentinos de observación, las actuaciones contenidas y los secretos que incomodan.',
	notForYouIf: 'Necesitás una trama de giros rápidos o personajes que expliquen todo lo que sienten.',
};
const templateTenSecondTake = {
	verdict: 'El planeta de vidrio desperdicia la colonia aislada porque Bruno Vega confunde urgencia con puro ruido.',
	whatToExpect: 'Una misión espacial que encadena alarmas mientras Lara Paz y Nico Ruiz quedan sin personajes para jugar.',
	pace: 'Corre desde el primer minuto, aunque cada giro agrega velocidad sin ordenar la amenaza central.',
	intensity: 'Tiene sobresaltos y estruendo, pero rara vez convierte ese volumen en una tensión que importe.',
	practicalContext: 'Dura poco y se mira sin esfuerzo, siempre que no le pidas una ciencia ficción con ideas desarrolladas.',
	forFansOf: 'Las aventuras espaciales de consumo rápido y las películas que privilegian movimiento sobre construcción.',
	notForYouIf: 'Esperás que el misterio del planeta cambie a sus protagonistas o deje una imagen con peso propio.',
};

try {
	writeMovie('original.json', {
		title: 'La calle vacía',
		originalTitle: 'La calle vacía',
		cinepostaScore: 7,
		director: 'Ana Pérez',
		mainCast: ['Lucía Díaz', 'Marta Sosa'],
		editorial: { tenSecondTake: originalTenSecondTake },
		synopsis: originalSynopsis,
		review:
			'La calle vacía encuentra su mejor idea en el modo en que una herencia vuelve incómodo hasta el saludo entre vecinos. Ana Pérez filma las veredas, las persianas y los silencios de sobremesa con una precisión que no necesita subrayar el duelo, mientras Lucía Díaz deja que la bronca de su personaje aparezca en gestos mínimos. Algunas escenas intermedias se demoran de más, pero el final recupera una tensión seca y muy propia.',
	});
	writeMovie('template.json', {
		title: 'El planeta de vidrio',
		originalTitle: 'El planeta de vidrio',
		cinepostaScore: 4,
		director: 'Bruno Vega',
		mainCast: ['Lara Paz', 'Nico Ruiz'],
		editorial: { tenSecondTake: templateTenSecondTake },
		synopsis: templateSynopsis,
		review:
			'El planeta de vidrio tiene una premisa que podría explorar la soledad de una colonia aislada, pero el guion la reduce a una sucesión de sobresaltos sin peso. Bruno Vega arma escenas prolijas y el elenco intenta sostener la tensión, aunque los personajes se vuelven cada vez más intercambiables. El desastre final llega sin modificar esa inercia y deja una sensación clara de oportunidad perdida. MALA: ciencia ficción de consumo rápido, con más ruido que imaginación y poco interés por sus propias ideas.',
	});

	const originalResult = runAudit(path.join(tempDir, 'original.json'));
	assert.equal(originalResult.status, 0, originalResult.stderr || originalResult.stdout);

	const templateResult = runAudit(path.join(tempDir, 'template.json'));
	assert.notEqual(templateResult.status, 0, 'A verdict-label template must fail the review audit.');
	assert.ok(
		templateResult.stderr.includes('verdict-label colon :: Mala'),
		templateResult.stderr,
	);

	writeMovie('missing-ten-second-take.json', {
		title: 'La casa quieta',
		originalTitle: 'La casa quieta',
		cinepostaScore: 7,
		director: 'Ana Pérez',
		mainCast: ['Lucía Díaz', 'Marta Sosa'],
		synopsis: originalSynopsis,
		review:
			'La casa quieta hace del regreso de una hermana mayor una amenaza doméstica antes que un misterio policial. Ana Pérez filma los pasillos como si cada puerta escondiera una versión distinta de la misma discusión, y Lucía Díaz sostiene la incomodidad con una mezcla muy precisa de cansancio y orgullo. Cuando la familia finalmente se sienta a hablar, la película evita resolverlo todo y gana espesor en esa decisión.',
	});
	const missingTakeResult = runAudit(path.join(tempDir, 'missing-ten-second-take.json'));
	assert.notEqual(missingTakeResult.status, 0, 'A candidate without its original ten-second take must fail.');
	assert.match(missingTakeResult.stderr, /missing ten-second take/);

	writeMovie('generic-ten-second-take.json', {
		title: 'El patio de Ana',
		originalTitle: 'El patio de Ana',
		cinepostaScore: 7,
		director: 'Ana Pérez',
		mainCast: ['Lucía Díaz', 'Marta Sosa'],
		editorial: {
			tenSecondTake: {
				verdict: 'El patio de Ana observa a Lucía Díaz con atención y Ana Pérez encuentra tensión en una casa mínima.',
				whatToExpect: 'Una reunión familiar donde Marta Sosa descubre que el patio guarda la discusión que todos prefieren esquivar.',
				pace: 'No vuela, pero tampoco se queda clavada.',
				intensity: 'La bronca entre las hermanas crece sin violencia explícita y deja un clima cada vez más espeso.',
				practicalContext: 'Conviene verla con tiempo para registrar sus silencios y las pequeñas incomodidades de la sobremesa.',
				forFansOf: 'Los dramas domésticos que convierten una casa conocida en un lugar difícil de habitar.',
				notForYouIf: 'Preferís que el conflicto se explique rápido o que cada escena empuje una trama policial.',
			},
		},
		synopsis: originalSynopsis,
		review:
			'El patio de Ana transforma una cena familiar en un mapa de lealtades viejas y puertas que nadie se anima a abrir. Ana Pérez trabaja el espacio doméstico con una paciencia incómoda, mientras Lucía Díaz y Marta Sosa dejan que la rivalidad aparezca en miradas que cambian de sentido a mitad de frase. La película puede resultar demasiado contenida para algunos espectadores, pero encuentra una forma muy precisa de hacer que cada silencio pese.',
	});
	const genericTakeResult = runAudit(path.join(tempDir, 'generic-ten-second-take.json'));
	assert.notEqual(genericTakeResult.status, 0, 'A generic ten-second phrase must fail.');
	assert.match(genericTakeResult.stderr, /generic ten-second marker :: pace/);

	console.log('Review-audit regression checks passed.');
} finally {
	fs.rmSync(tempDir, { recursive: true, force: true });
}
