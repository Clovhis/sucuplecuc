import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'docs/person-profile-catalog-reference.md');
const PROFILE_SOURCE_PATH = path.join(ROOT_DIR, 'src/data/personProfiles.ts');

function escapeCell(value) {
	return String(value ?? '').replace(/\|/g, '\\|');
}

async function loadProfiles() {
	const { personProfiles } = await import(pathToFileURL(PROFILE_SOURCE_PATH).href);
	return Object.values(personProfiles).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function buildPersonProfileCatalogReference() {
	const profiles = await loadProfiles();
	const totalKnownForLinks = profiles.reduce((total, profile) => total + profile.knownFor.length, 0);
	const lines = [
		'# Catalogo de personas con ficha exclusiva',
		'',
		`Generado automaticamente el ${new Date().toISOString().slice(0, 10)}. Fuente: src/data/personProfiles.ts y src/data/personProfileCatalogCredits.generated.ts`,
		'',
		`Total de personas con ficha exclusiva: ${profiles.length}`,
		`Total de vínculos de películas del catálogo: ${totalKnownForLinks}`,
		'',
		'Si un nombre no aparece en esta lista, todavía no tiene página propia en el sitio.',
		'',
		'| Nombre | Slug | Ruta | Roles | Pelis conectadas (`knownFor`) | Fuentes |',
		'| --- | --- | --- | --- | ---: | ---: |',
		...profiles.map(
			(profile) =>
				`| ${escapeCell(profile.name)} | \`${escapeCell(profile.slug)}\` | /personas/${escapeCell(profile.slug)}/ | ${escapeCell(profile.roles.join(' / '))} | ${profile.knownFor.length} | ${profile.referenceUrls?.length ?? 0} |`,
		),
		'',
		'## Criterio de auditoría',
		'',
		'- La lista incluye exclusivamente perfiles con `editorialStatus: approved` y `editorialBiography` extendida.',
		'- `knownFor` conserva el orden editorial existente y agrega, sin duplicar, todos los slugs donde la persona figura en `mainCast`, dirección o como destinataria de un premio del catálogo.',
		'- La filmografía completa visible en cada ficha se calcula desde `src/data/movies/*.json`; este documento no inventa créditos fuera del catálogo.',
		'- Las fechas, nacionalidades, estados vitales e identificadores se mantienen en `src/data/people.json` y se corrigen sólo con evidencia identificable.',
		'',
	];

	return lines.join('\n');
}

function normalizeForCheck(value) {
	return value
		.replace(/^Generado automaticamente el \d{4}-\d{2}-\d{2}\. Fuente:/m, 'Generado automaticamente el <date>. Fuente:')
		.replace(/\r\n/g, '\n')
		.trimEnd();
}

export async function updatePersonProfileCatalogReference() {
	await writeFile(OUTPUT_PATH, await buildPersonProfileCatalogReference(), 'utf8');
}

export async function checkPersonProfileCatalogReference() {
	const [current, expected] = await Promise.all([readFile(OUTPUT_PATH, 'utf8'), buildPersonProfileCatalogReference()]);

	if (normalizeForCheck(current) !== normalizeForCheck(expected)) {
		throw new Error(
			'docs/person-profile-catalog-reference.md is out of sync with src/data/personProfiles.ts. Run npm run catalog:people:reference.',
		);
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const task = process.argv[2] === '--check' ? checkPersonProfileCatalogReference : updatePersonProfileCatalogReference;

	task().catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}
