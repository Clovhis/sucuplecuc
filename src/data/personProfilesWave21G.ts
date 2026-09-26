import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'luly-drozdek', name: 'Luly Drozdek', roles: ['Actriz', 'Productora ejecutiva'],
		headline: 'Actriz argentina que construyó una carrera entre la televisión, el teatro y el cine.',
		spotlight: 'Su recorrido pasó de las ficciones televisivas a los protagónicos cinematográficos y la escritura.',
		editorialBiography: [
			'Drozdek empezó a formarse en actuación durante la infancia y fue sumando trabajos en televisión, teatro y cine. Integró los elencos de Sos mi hombre, Quiero vivir a tu lado, Golpe al corazón y Millennials, y también actuó en películas como Igualita a mí y El retiro. En los últimos años amplió su presencia en la pantalla grande con Instante y Esa semana juntos, mientras asumía nuevas responsabilidades en producciones audiovisuales.',
			'En 2026 llegó a su primer protagónico cinematográfico con Hasta que la verdad los separe, un paso que acompañó con una búsqueda como dramaturga. Drozdek mantiene así una carrera que combina comedia, melodrama y proyectos para públicos distintos, además de su trabajo escénico. Su recorrido muestra una transición gradual desde los papeles televisivos de elenco hacia historias donde puede sostener un arco central y explorar también la escritura.',
		],
		sourceUrls: [
			'https://tpagencia.com/talentos/luly-drozdek/',
			'https://www.infobae.com/teleshow/2026/04/26/luly-drozdek-estrena-su-primer-papel-protagonico-en-el-cine-me-encanta-ser-la-heroina/',
			'https://www.ciudad.com.ar/espectaculos/2026/04/28/luly-drozdek-debuta-como-protagonista-en-cine-y-se-lanza-como-dramaturga-siento-que-creci/',
		],
	},
	{
		slug: 'vita-escardo', name: 'Vita Escardó', roles: ['Actriz', 'Autora', 'Directora'],
		headline: 'Actriz, autora y directora argentina de cine y teatro, formada en la escena independiente porteña.',
		spotlight: 'Su trayectoria cruza el cine de los ochenta y los noventa con una sostenida investigación teatral.',
		editorialBiography: [
			'Escardó, cuyo nombre real es Eva, se formó en actuación en Buenos Aires y debutó en el cine con La noche de los lápices. Después participó en Un muro de silencio y en I love you... Torito, además de trabajar en televisión y teatro. Su recorrido reúne proyectos de épocas y formatos distintos, con personajes que la vincularon tanto al cine político como a comedias y ficciones televisivas de amplia circulación.',
			'En el teatro amplió su trabajo como autora y directora. En 1999 fundó junto con Victoria Egea La Loca, un equipo de investigación artística desde el que desarrollaron obras y experiencias escénicas. Esa práctica colectiva le permitió sostener una búsqueda propia más allá de sus papeles frente a cámara. Escardó combina la interpretación con la escritura y la puesta en escena, y mantiene un vínculo activo con proyectos teatrales independientes.',
		],
		sourceUrls: [
			'https://www.pagina12.com.ar/95054-el-rio-es-aquello-que-nos-identifica/',
			'https://www.alternativateatral.com/persona4119-vita-escardo',
		],
	},
	{
		slug: 'martin-adjemian', name: 'Martín Adjemián', roles: ['Actor', 'Director de casting', 'Coach actoral'],
		headline: 'Actor argentino de larga trayectoria, presente en películas fundacionales y en el Nuevo Cine Argentino.',
		spotlight: 'Su trabajo de reparto enlazó clásicos de fines de los sesenta con algunas de las películas más influyentes de los noventa.',
		editorialBiography: [
			'Adjemián trabajó durante décadas en el cine argentino, desde Invasión hasta La ciénaga, Pizza, birra, faso y Tiempo de valientes. Su presencia aparece en películas muy distintas, casi siempre dentro de elencos corales donde un gesto o una intervención breve ayuda a definir el clima de la historia. También se desempeñó como director de casting y coach actoral, oficios que conectaban su experiencia frente a cámara con la preparación de otros intérpretes.',
			'En los años noventa volvió a ocupar un lugar destacado en la renovación del cine nacional, con más de veinte películas en poco más de una década. Su filmografía incluye trabajos de Pablo Trapero y Lucrecia Martel, además de títulos de generaciones anteriores. Adjemián dejó un registro singular como actor de carácter: versátil, austero y capaz de moverse entre el drama social, el policial y la comedia sin perder naturalidad.',
		],
		sourceUrls: [
			'https://ahira.com.ar/wp-content/uploads/2019/12/El-Amante-164.pdf',
		],
	},
];

export const argentineCatalogActorsAndDirectorsProfilesWave21G: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
