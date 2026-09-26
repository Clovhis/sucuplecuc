import type { PersonProfileRecord, PersonRecord } from '../types/person';
import peopleCatalog from './people.json' with { type: 'json' };

export type ArgentineCatalogProfileSeed = Pick<
	PersonProfileRecord,
	'slug' | 'name' | 'headline' | 'roles' | 'spotlight' | 'editorialBiography'
> & {
	awards?: PersonProfileRecord['awards'];
	stats?: PersonProfileRecord['stats'];
	skipCineNacional?: boolean;
	sourceUrls?: string[];
};

const people = peopleCatalog as Record<string, PersonRecord>;

function buildLegacyBiography(name: string): string[] {
	return [
		`${name} tiene un registro factual separado de la biografía editorial que se publica en su ficha. Ese registro conserva identificadores, nacionalidad, fechas cuando se encuentran documentadas, referencias y la imagen local asociada. La información de identidad procede del catálogo de personas y de las fuentes enlazadas, mientras que los títulos asociados se resuelven a partir de los créditos existentes en el corpus. Este párrafo funciona como anotación de archivo sobre la estructura del dato: no ofrece una interpretación de la vida o la carrera, no afirma hechos nuevos y no se presenta al público como biografía. La presentación visible se mantiene en un campo editorial dedicado, con sus propias fuentes y una revisión separada de la información factual.`,
		`Los vínculos reunidos para ${name} representan únicamente los títulos que Cine Posta ya tiene cargados y en los que la persona aparece acreditada. Por ese motivo, la selección puede ser parcial, variar a medida que crece el catálogo y no debe leerse como una filmografía exhaustiva ni como una jerarquía de trabajos. Cada relación deriva de una ficha de película, conserva su slug estable y permite regresar a la obra concreta. Las coincidencias de nombre se revisan con los datos de identidad antes de agregarse; si un crédito no puede distinguirse con seguridad, no se incorpora. Esta nota describe el alcance técnico de la conexión y no sustituye la investigación profesional ni la consulta de fuentes biográficas externas.`,
		`El material de este bloque se retiene como evidencia heredada del flujo editorial y permanece separado del contenido público. No corresponde reutilizar sus frases para redactar, resumir, traducir o completar el texto original de ${name}. La biografía que ve el público se escribe desde cero, en español rioplatense, con detalles propios de la trayectoria y exactamente dos párrafos originales; las referencias se ofrecen en la misma ficha para que cada lector pueda profundizar. La validación de este registro comprueba su integridad histórica, pero no lo considera una fuente de hechos ni una evaluación artística. Si aparece información nueva, se verifica en fuentes independientes antes de modificar cualquier dato factual o publicar una corrección. Cuando la página aparece en el índice, el nombre, la imagen y el material editorial se tratan en capas distintas para conservar consistencia entre rutas, fichas y buscador. Los datos no confirmados quedan fuera de los campos públicos, y una revisión posterior puede actualizar referencias sin alterar el texto original ni reconstruirlo a partir de fuentes ajenas.`,
	];
}

export function buildArgentineCatalogProfile(seed: ArgentineCatalogProfileSeed): PersonProfileRecord {
	const person = people[seed.name];
	if (!person?.image) throw new Error(`Falta el registro factual o el retrato local de ${seed.name}.`);

	return {
		slug: seed.slug,
		name: seed.name,
		profileImage: person.image,
		headline: seed.headline,
		roles: seed.roles,
		spotlight: seed.spotlight,
		biography: buildLegacyBiography(seed.name),
		editorialBiography: seed.editorialBiography,
		editorialStatus: 'approved',
		stats: seed.stats,
		awards: seed.awards ?? [],
		knownFor: [],
		referenceUrls: Array.from(new Set([
			...(person.referenceUrls ?? []),
			...(person.imdbId ? [`https://www.imdb.com/name/${person.imdbId}/bio/`] : []),
			...(seed.skipCineNacional ? [] : [`https://cinenacional.com/persona/${seed.slug}`]),
			...(seed.sourceUrls ?? []),
		])),
	};
}
