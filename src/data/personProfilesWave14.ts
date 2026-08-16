import type { PersonProfileRecord, PersonRecord } from '../types/person';
import peopleCatalog from './people.json' with { type: 'json' };

type RequestedProfileSeed = {
	slug: string;
	name: string;
	roles: string[];
	headline: string;
	spotlight: string;
	birthPlace: string;
	awards: PersonProfileRecord['awards'];
	knownFor: string[];
	editorialBiography: string[];
	sourceUrls?: string[];
};

const people = peopleCatalog as Record<string, PersonRecord>;

function optimizeProfileImage(person: PersonRecord): string {
	if (!person.remoteImageUrl) return person.image ?? '';

	return person.remoteImageUrl.replace(/([?&]width=)\d+/u, (_match: string, prefix: string) => `${prefix}640`);
}

function buildLegacyBiography(seed: RequestedProfileSeed): string[] {
	return [
		`${seed.name} figura en el archivo factual del catálogo como ${seed.roles.join(' y ').toLowerCase()}, con una trayectoria conectada a ${seed.knownFor.join(', ')}.`,
		`El registro de Cine Posta conserva esta entrada para ordenar la filmografía de ${seed.name} y distinguirla de otras personas con nombres parecidos.`,
		`La información histórica asociada a ${seed.name} queda separada del texto editorial público y sirve como respaldo de trabajo para la ficha.`,
	];
}

function buildRequestedProfile(seed: RequestedProfileSeed): PersonProfileRecord {
	const person = people[seed.name];
	if (!person?.image) throw new Error(`Falta el registro factual o el retrato local de ${seed.name}.`);

	const referenceUrls = Array.from(new Set([...(person.referenceUrls ?? []), ...(seed.sourceUrls ?? [])]));
	if (referenceUrls.length === 0) throw new Error(`Falta una fuente visible para ${seed.name}.`);

	return {
		slug: seed.slug,
		name: seed.name,
		profileImage: optimizeProfileImage(person),
		headline: seed.headline,
		roles: seed.roles,
		birthPlace: seed.birthPlace,
		spotlight: seed.spotlight,
		biography: buildLegacyBiography(seed),
		editorialBiography: seed.editorialBiography,
		editorialStatus: 'approved',
		stats: [],
		awards: seed.awards,
		knownFor: seed.knownFor,
		referenceUrls,
	};
}

const requestedProfileSeeds: RequestedProfileSeed[] = [
	{
		slug: 'charlie-sheen',
		name: 'Charlie Sheen',
		roles: ['Actor'],
		birthPlace: 'Nueva York, Nueva York, Estados Unidos',
		headline: 'Actor de presencia filosa que pasó del drama bélico y el thriller financiero a la comedia televisiva de gran popularidad.',
		spotlight: 'Su mejor registro mezcla arrogancia, velocidad verbal y una vulnerabilidad que aparece justo cuando el personaje cree tener todo bajo control.',
		awards: [],
		knownFor: ['platoon-1986'],
		editorialBiography: [
			'Charlie Sheen se hizo notar muy joven en Pelotón, donde la mirada de Chris Taylor funciona como entrada humana al caos de Vietnam. Después encadenó personajes de nervio distinto: el corredor ambicioso de Wall Street, el jugador de Major League y el protagonista de comedias televisivas como Spin City y Two and a Half Men. Esa mezcla explica por qué su figura puede moverse del drama áspero al remate cómico sin perder una energía bastante peligrosa.',
			'Sheen suele actuar como si sus personajes estuvieran improvisando una salida mientras sostienen una seguridad exagerada. Cuando el material acompaña, esa tensión produce humor, ansiedad o empatía en la misma escena. Pelotón conserva su conexión más fuerte con el catálogo y también el papel que mejor muestra el contraste entre la juventud del actor, la brutalidad del mundo que lo rodea y la necesidad de seguir avanzando.',
		],
		sourceUrls: ['https://www.simonandschuster.com/authors/Charlie-Sheen/245005403'],
	},
	{
		slug: 'oliver-stone',
		name: 'Oliver Stone',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Nueva York, Nueva York, Estados Unidos',
		headline: 'Guionista y director estadounidense que convirtió la historia política, la guerra y el poder en un territorio de conflicto cinematográfico.',
		spotlight: 'Su cine trabaja con imágenes nerviosas y personajes atrapados entre la versión oficial de los hechos y aquello que una sociedad preferiría no mirar.',
		awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Pelotón', year: 1987 }],
		knownFor: ['platoon-1986'],
		editorialBiography: [
			'Oliver Stone llegó al cine como guionista antes de convertirse en uno de los directores estadounidenses más insistentes a la hora de discutir el poder. Pelotón llevó su experiencia de Vietnam a una película áspera, nerviosa y profundamente personal, y le valió el Oscar a mejor director. JFK, Nacido el 4 de julio y Wall Street ampliaron esa conversación hacia la política, la memoria y el dinero.',
			'Su cine no busca la neutralidad prolija: prefiere la fricción, la sospecha y el montaje como herramientas para discutir quién cuenta la historia. Incluso cuando provoca o exagera, Stone pone en escena una pregunta concreta sobre las instituciones y sus relatos. En el catálogo, Pelotón concentra su costado bélico y también el punto donde su biografía, su escritura y su puesta en escena se vuelven inseparables.',
		],
		sourceUrls: ['https://www.oscars.org/oscars/ceremonies/1987'],
	},
	{
		slug: 'forest-whitaker',
		name: 'Forest Whitaker',
		roles: ['Actor'],
		birthPlace: 'Longview, Texas, Estados Unidos',
		headline: 'Actor de enorme concentración, capaz de encontrar fragilidad, autoridad y amenaza en personajes de muy distinta escala.',
		spotlight: 'Su trabajo parece escuchar antes de responder: una pausa, una mirada desviada o una quietud repentina pueden cambiar el centro de una escena.',
		awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'El último rey de Escocia', year: 2007 }],
		knownFor: ['arrival-2016', 'platoon-1986'],
		editorialBiography: [
			'Forest Whitaker construyó una carrera donde la intensidad nunca depende de levantar la voz. En Pelotón aparece dentro de un grupo atravesado por la violencia; en Arrival aporta una calidez cansada que ayuda a sostener el misterio y la emoción de la historia. Su Oscar por El último rey de Escocia confirmó una capacidad central de su trabajo: hacer que el poder, la ternura y el peligro convivan en un mismo cuerpo.',
			'Whitaker no necesita subrayar la transformación de un personaje para que el público la perciba. Su presencia puede ser protectora, enigmática o directamente aterradora, pero siempre conserva una humanidad concreta. Las dos películas del catálogo muestran esa amplitud desde extremos distintos: una guerra que desarma vínculos y una ciencia ficción que usa la escucha como forma de encuentro.',
		],
		sourceUrls: ['https://www.oscars.org/oscars/ceremonies/2007'],
	},
	{
		slug: 'tom-berenger',
		name: 'Tom Berenger',
		roles: ['Actor'],
		birthPlace: 'Chicago, Illinois, Estados Unidos',
		headline: 'Actor de carácter que hizo de la autoridad, el desgaste y la amenaza contenida una marca reconocible del cine estadounidense.',
		spotlight: 'Su presencia puede ordenar una escena o volverla incómoda: parece conocer las reglas del mundo incluso cuando está a punto de romperlas.',
		awards: [],
		knownFor: ['platoon-1986'],
		editorialBiography: [
			'Tom Berenger encontró uno de sus papeles decisivos en Pelotón, donde el sargento Barnes convierte la experiencia de combate en una lógica brutal y cada vez más difícil de justificar. Antes y después de esa película trabajó con igual soltura en dramas, thrillers, bélicos y comedias como The Big Chill, Major League y Sniper. Su especialidad no es sólo interpretar hombres duros: es mostrar el precio de esa dureza.',
			'Hay una tensión interesante en su manera de ocupar la pantalla. Berenger puede transmitir mando, cansancio o violencia sin apurarse, como si el personaje ya hubiera atravesado demasiadas discusiones. Pelotón concentra esa cualidad en un antagonista memorable y también deja ver por qué el actor funciona tan bien cuando la autoridad deja de ser una virtud y empieza a convertirse en una amenaza para todos.',
		],
		sourceUrls: ['https://www.televisionacademy.com/bios/tom-berenger'],
	},
];

export const requestedPersonProfilesWave14: Record<string, PersonProfileRecord> = Object.fromEntries(
	requestedProfileSeeds.map((seed) => [seed.slug, buildRequestedProfile(seed)]),
) as Record<string, PersonProfileRecord>;
