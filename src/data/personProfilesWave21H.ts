import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'jose-maria-monje', name: 'José María Monje', roles: ['Actor', 'Director'],
		headline: 'Actor y director argentino que comenzó de chico y construyó una extensa carrera en cine, teatro y televisión.',
		spotlight: 'De los primeros éxitos juveniles pasó a personajes dramáticos y papeles centrales en series y películas.',
		editorialBiography: [
			'Monje empezó a actuar durante la infancia y debutó en el Teatro San Martín antes de incorporarse a la televisión con Pelito, una ficción juvenil emblemática de los años ochenta. Después participó en Señorita maestra, Grande Pa!, Amor en custodia y Los únicos, mientras alternaba la pantalla con el teatro y el cine. Entre sus películas figura La noche de los lápices, donde formó parte de un elenco que reconstruyó la represión contra estudiantes secundarios.',
			'En Maradona: sueño bendito interpretó a Don Diego, el padre del futbolista, y acercó su trabajo a una audiencia internacional. Monje también desarrolló proyectos teatrales y audiovisuales detrás de cámara, y sostiene una trayectoria que va de la actuación infantil a personajes adultos de registros variados. Sus cambios de formato no borran el hilo que une toda su carrera: la formación escénica y un oficio que sigue activo después de más de cuatro décadas.',
		],
		skipCineNacional: true,
		sourceUrls: [
			'https://www.lanacion.com.ar/espectaculos/teatro/pepe-monje-el-cine-es-el-ritmo-cardiaco-que-hoy-maneja-la-actuacion-nid05112021/',
			'https://cdn.radionacional.com.ar/pepe-monje-converso-con-deja-vu-nacional/',
			'https://www.eldia.com/nota/2021-10-10-5-39-44-pepe-monje-con-la-serie-de-diego-vamos-a-ver-como-funciona-el-actor-argentino-en-el-extranjero--toda-la-semana/amp',
		],
	},
	{
		slug: 'juan-martin-hsu', name: 'Juan Martín Hsu', roles: ['Director', 'Guionista', 'Productor', 'Colorista', 'Montajista'],
		headline: 'Cineasta argentino de origen taiwanés cuya obra enlaza migración, identidad familiar y géneros populares.',
		spotlight: 'Entre la ficción y el documental, sus películas observan las huellas íntimas del desarraigo.',
		editorialBiography: [
			'Hsu estudió Diseño de Imagen y Sonido en la UBA y construyó una carrera que combina dirección, guion, producción y posproducción. Su primer largometraje, La Salada, reunió varias historias de migrantes en Buenos Aires y recorrió festivales internacionales, entre ellos Toronto y San Sebastián. Más tarde dirigió el documental La luna representa mi corazón, una búsqueda familiar filmada entre Argentina y Taiwán que transformó su propia historia en el eje del relato.',
			'La migración aparece como experiencia concreta, con diferencias generacionales, vínculos y recuerdos que alteran la vida diaria. Hsu volvió al policial con Los caminantes de la calle, mientras siguió trabajando como colorista y montajista en producciones argentinas de otros realizadores. Ese cruce entre oficios le da una perspectiva amplia del proceso cinematográfico: puede acompañar una película desde la escritura y el rodaje hasta su acabado visual, sin dejar de sostener una mirada autoral.',
		],
		sourceUrls: [
			'https://festivaldelima.com/2026/pelicula/los-caminantes-de-la-calle/',
			'https://www.latamcinema.com/entrevistas/juan-martin-hsu-director-y-coguionista-de-los-caminantes-de-la-calle/',
		],
	},
];

export const argentineCatalogActorsAndDirectorsProfilesWave21H: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
