import type { PersonProfileRecord, PersonRecord } from '../types/person';
import peopleCatalog from './people.json' with { type: 'json' };

type ArgentineProfileSeed = Pick<
	PersonProfileRecord,
	'slug' | 'name' | 'headline' | 'roles' | 'birthPlace' | 'spotlight' | 'biography' | 'editorialBiography' | 'stats' | 'awards' | 'knownFor'
> & {
	sourceUrls: string[];
};

const people = peopleCatalog as Record<string, PersonRecord>;

function optimizeProfileImage(person: PersonRecord): string {
	if (!person.remoteImageUrl) return person.image ?? '';
	return person.remoteImageUrl.replace(/([?&]width=)\d+/u, '$1640');
}

function buildArgentineProfile(seed: ArgentineProfileSeed): PersonProfileRecord {
	const person = people[seed.name];
	if (!person?.image) throw new Error(`Falta el registro factual o el retrato local de ${seed.name}.`);

	return {
		...seed,
		profileImage: optimizeProfileImage(person),
		editorialStatus: 'approved',
		referenceUrls: Array.from(
			new Set([
				...(person.referenceUrls ?? []),
				...(person.imdbId ? [`https://www.imdb.com/name/${person.imdbId}/bio/`] : []),
				...seed.sourceUrls,
			]),
		),
	};
}

const suarProfile: ArgentineProfileSeed = {
	slug: 'adrian-suar',
	name: 'Adrián Suar',
	headline: 'Actor, productor y director argentino que convirtió la televisión popular en una usina de ficción y también llevó esa mirada al cine.',
	roles: ['Actor', 'Director', 'Productor'],
	birthPlace: 'Queens, Nueva York, Estados Unidos',
	spotlight: 'Su recorrido une actuación, producción y dirección: entiende el espectáculo masivo desde la escena, la cocina industrial y el vínculo con el público.',
	biography: [
		'Adrián Kirzner Schwartz, conocido artísticamente como Adrián Suar, nació en Queens, Nueva York, el 25 de marzo de 1968 y desarrolló en Argentina la mayor parte de su carrera profesional. Su primer acercamiento sostenido a la pantalla ocurrió durante la adolescencia, cuando quedó seleccionado en un casting televisivo y empezó a trabajar en ficciones destinadas a públicos jóvenes. El paso por El papá garrón de los domingos y Pelito lo ubicó temprano como intérprete reconocible, pero ese comienzo no determinó el único lugar que ocuparía dentro del espectáculo. A medida que creció, Suar fue pasando de los papeles juveniles a personajes adultos y a una tarea menos visible: imaginar, conseguir y producir proyectos capaces de sostener una relación regular con la audiencia argentina. Esa transición explica por qué su nombre quedó unido tanto a la actuación como a las decisiones de producción.',
		'En 1994 se asoció con Fernando Blanco para poner en marcha Pol-Ka Producciones. El proyecto nació alrededor de Poliladron y se convirtió en una productora con presencia sostenida en televisión, teatro y cine, además de establecer una relación de trabajo con Artear y Canal 13. Desde esa estructura se impulsaron ficciones de géneros variados, con policiales, comedias, dramas familiares y relatos corales que ampliaron el espacio para intérpretes y equipos locales. Suar no quedó apartado de la pantalla durante ese proceso: continuó protagonizando, participando en la escritura de ideas y acompañando el desarrollo de proyectos en los que la producción y la actuación se pensaban como partes de una misma operación. El crecimiento de Pol-Ka lo volvió una figura de referencia para entender la transformación de la ficción televisiva argentina de los años noventa y dos mil, cuando las productoras privadas empezaron a asumir un papel central en la creación de contenidos nacionales.',
		'En cine, su recorrido como actor incluye Charly, días de sangre, Comodines, Cohen vs. Rosi, Apariencias, El hijo de la novia, Un novio para mi mujer, Igualita a mí, Dos más dos, Me casé con un boludo y El fútbol o yo, entre otros títulos registrados por el Catálogo de Cine Argentino. También escribió ideas originales para varias películas y asumió tareas de producción, una continuidad de su trabajo detrás de cámara. Como director realizó 30 noches con mi ex, comedia dramática estrenada en 2022 y presentada por la Academia de Cine Argentina entre las candidatas a sus premios; en 2026 dirigió Yo, Narciso, donde además integra el elenco. El Instituto Nacional de Cine y Artes Audiovisuales registra reconocimientos de su trayectoria en los Premios Martín Fierro, Tato y Estrella de Mar. Su lugar en la cultura audiovisual argentina se construyó justamente en ese cruce: una figura popular que actúa, produce y dirige, y que puede leer una película desde el personaje que interpreta y desde la maquinaria que permite que ese personaje llegue a la pantalla.',
	],
	editorialBiography: [
		'Adrián Suar nació en Queens en 1968 y creció en la televisión argentina. Pasó de los papeles juveniles a convertirse en una figura de la ficción popular, sin quedarse frente a cámara: en 1994 fundó Pol-Ka junto a Fernando Blanco, una productora que expandió su trabajo hacia la televisión, el teatro y el cine. Desde ahí desarrolló una mirada de productor que combina alcance masivo, ritmo industrial y sensibilidad local.',
		'En cine pasó por la comedia, el romance y el drama como actor, y también se puso detrás de cámara: participó en El hijo de la novia, Un novio para mi mujer y Dos más dos, y dirigió 30 noches con mi ex. En Yo, Narciso vuelve a ocupar los dos lugares, como realizador y protagonista. Su carrera queda definida por la convivencia entre intérprete, productor y director, atenta a cómo una historia se vuelve conversación popular.',
	],
	stats: [
		{ label: 'Pol-Ka', value: 'Fundador desde 1994' },
		{ label: 'Martín Fierro', value: '2 premios reportados' },
		{ label: 'Oficio', value: 'Actor, director y productor' },
	],
	awards: [],
	knownFor: ['yo-narciso-2026'],
	sourceUrls: [
		'https://cinenacional.com/persona/adrian-suar',
		'https://catalogocineargentino.incaa.gob.ar/realizador/adrian-suar/',
		'https://www.lanacion.com.ar/espectaculos/television/los-25-anos-polka-historia-nid2262308/',
		'https://www.infobae.com/2014/11/07/1607161-los-20-anos-de-pol-ka-la-primera-gran-productora-de-ficcion-en-tv-de-la-argentina/',
		'https://academiadecine.org.ar/2023/08/03/nominaciones-premios-sur-edicion-2022/',
		'https://academiadecine.org.ar/premio-sur-2012/nominaciones/',
		'https://commons.wikimedia.org/wiki/File%3AMalaga_Film_Festival_2025_-_Adri%C3%A1n_Suar_%28cropped%29.jpg',
	],
};

export const requestedArgentinePersonProfilesWave17: Record<string, PersonProfileRecord> = {
	[suarProfile.slug]: buildArgentineProfile(suarProfile),
};
