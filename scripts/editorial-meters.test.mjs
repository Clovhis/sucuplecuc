import assert from 'node:assert/strict';

import { getCagazometroLabel } from '../src/lib/cagazometro.ts';
import { getExplosiometroLabel } from '../src/lib/explosiometro.ts';
import { getJajametroLabel } from '../src/lib/jajametro.ts';
import { getLagrimometroLabel } from '../src/lib/lagrimometro.ts';
import { getSangrometroLabel } from '../src/lib/sangrometro.ts';

const meterCases = [
	{
		name: 'Lagrimómetro',
		getLabel: getLagrimometroLabel,
		labels: [
			[39, 'Te deja seco: no hay lagrimón'],
			[40, 'No llega a emocionarte'],
			[59, 'No llega a emocionarte'],
			[60, 'Alguna escena te puede tocar'],
			[74, 'Alguna escena te puede tocar'],
			[75, 'Se te arma un nudo en la garganta'],
			[89, 'Se te arma un nudo en la garganta'],
			[90, 'Pañuelos obligatorios: te pega fuerte'],
		],
	},
	{
		name: 'Cagazómetro',
		getLabel: getCagazometroLabel,
		labels: [
			[39, 'Casi no asusta'],
			[40, 'Algún sustito y nada más'],
			[59, 'Algún sustito y nada más'],
			[60, 'Te mantiene alerta'],
			[74, 'Te mantiene alerta'],
			[75, 'Te deja bastante perseguido'],
			[89, 'Te deja bastante perseguido'],
			[90, 'Te cagás en las patas mal'],
		],
	},
	{
		name: 'Jajámetro',
		getLabel: getJajametroLabel,
		labels: [
			[39, 'No le encontrás la gracia'],
			[40, 'Algún jaja te saca'],
			[59, 'Algún jaja te saca'],
			[60, 'Te hace reír, pero tranqui'],
			[74, 'Te hace reír, pero tranqui'],
			[75, 'Viene cargada de jajás'],
			[89, 'Viene cargada de jajás'],
			[90, 'Te meás de risa'],
		],
	},
	{
		name: 'Sangrómetro',
		getLabel: getSangrometroLabel,
		labels: [
			[39, 'Casi no hay sangre'],
			[40, 'Sangre medida'],
			[59, 'Sangre medida'],
			[60, 'Hay sangre, pero se controla'],
			[74, 'Hay sangre, pero se controla'],
			[75, 'Salpica fuerte y sin pedir permiso'],
			[89, 'Salpica fuerte y sin pedir permiso'],
			[90, 'Festival de achuras: mirala con estómago'],
		],
	},
	{
		name: 'Explosiómetro',
		getLabel: getExplosiometroLabel,
		labels: [
			[39, 'Acción con el freno puesto'],
			[40, 'Trae algo de acción, sin pasarse'],
			[59, 'Trae algo de acción, sin pasarse'],
			[60, 'Hay movimiento, pero tranqui'],
			[74, 'Hay movimiento, pero tranqui'],
			[75, 'Hay quilombo del lindo'],
			[89, 'Hay quilombo del lindo'],
			[90, 'Revienta todo: agarrate del sillón'],
		],
	},
];

for (const { name, getLabel, labels } of meterCases) {
	for (const [score, expected] of labels) {
		assert.equal(getLabel(score), expected, `${name} ${score}%`);
	}
}

console.log('Editorial meter label self-tests passed.');
