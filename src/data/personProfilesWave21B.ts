import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'marcelo-subiotto', name: 'Marcelo Subiotto', roles: ['Actor'],
		headline: 'Actor argentino de amplia experiencia teatral, convertido en una de las presencias más sólidas del cine reciente.',
		spotlight: 'Su precisión puede volver decisivo un gesto mínimo, tanto en una comedia intelectual como en un drama áspero.',
		editorialBiography: [
			'Subiotto trabajó durante años en teatro antes de convertirse en un rostro cada vez más visible del cine argentino. Puán lo puso en el centro de una comedia sobre la universidad, la amistad y las jerarquías laborales; Los delincuentes lo llevó a un relato de ritmo más oblicuo, donde cada silencio pesa tanto como la acción.',
			'En películas como Esteros, Animal y Crímenes de familia muestra una notable capacidad para cambiar de registro sin llamar la atención sobre el cambio. Su actuación suele ser precisa y poco enfática: deja que la escena revele las contradicciones del personaje. El reconocimiento reciente acompaña una trayectoria larga de trabajo, no una aparición repentina.',
		],
	},
	{
		slug: 'esteban-bigliardi', name: 'Esteban Bigliardi', roles: ['Actor'],
		headline: 'Actor argentino que pasó de ejercer como abogado a una carrera intensa en cine, teatro y televisión.',
		spotlight: 'Su formación tardía en la actuación le dio una mirada singular sobre personajes que intentan cambiar de vida.',
		editorialBiography: [
			'Bigliardi estudió abogacía y trabajó en ese campo antes de dedicarse a la actuación. Esa experiencia aparece, sin convertirse en anécdota explicativa, en la atención que presta a personajes atrapados entre una vida ordenada y el deseo de otra cosa. Los delincuentes y Las corrientes muestran su naturalidad para habitar esa tensión.',
			'También formó parte de Puán, Esteros y diversas obras teatrales y series. Su presencia no depende del protagonismo: suele crear personajes completos con una economía de gestos que sostiene el tono de la película. La variedad de sus colaboraciones lo conecta con algunas de las voces más distintivas del cine argentino actual.',
		],
	},
	{
		slug: 'cesar-bordon', name: 'César Bordón', roles: ['Actor'],
		headline: 'Actor argentino de carrera extensa, con trabajos en producciones locales e internacionales.',
		spotlight: 'Su rostro puede transmitir autoridad o fragilidad, y esa ambigüedad le abre lugar en relatos muy distintos.',
		editorialBiography: [
			'Bordón trabajó en cine, teatro y televisión antes de que un público internacional lo reconociera por Luis Miguel: la serie. En la ficción interpretó a Hugo López, un representante que combina cercanía y control; el papel aprovechó su capacidad para sostener una autoridad que también deja ver desgaste.',
			'En el cine argentino pasó por Fragmentada y Canelones, entre otros títulos, y construyó una carrera hecha de registros variados. Puede entrar en un thriller o en una comedia sin imponer una personalidad fija por encima del personaje. Su recorrido muestra cómo un actor formado localmente puede moverse entre producciones de escalas muy diferentes.',
		],
	},
	{
		slug: 'clara-kovacic', name: 'Clara Kovacic', roles: ['Actriz'],
		headline: 'Actriz argentina que se abrió camino en el cine de terror y fantástico, también como guionista y directora.',
		spotlight: 'Su vínculo con el género combina actuación, producción independiente y una relación activa con la cultura del horror.',
		editorialBiography: [
			'Kovacic encontró un espacio propio en el cine fantástico y de terror argentino, un terreno donde suele alternar actuación con tareas creativas detrás de cámara. Los olvidados: cicatrices y sus proyectos independientes la acercan a historias que usan lo sobrenatural para trabajar miedos y conflictos más reconocibles.',
			'También participa en encuentros y actividades dedicadas al género, lo que amplía su trabajo más allá de la pantalla. Su aparición en Homo Argentum muestra otra escala de producción, mientras que el cine de terror sigue siendo el lugar donde su perfil resulta más singular. La actriz conecta una tradición local con circuitos internacionales de género.',
		],
	},
	{
		slug: 'demian-salomon', name: 'Demián Salomón', roles: ['Actor'],
		headline: 'Actor argentino que encontró un lugar destacado en el nuevo cine de terror, además de trabajar en comedias y dramas.',
		spotlight: 'Su interpretación de Jimi en Cuando acecha la maldad combina una presencia cotidiana con una transformación inquietante.',
		editorialBiography: [
			'Salomón lleva más de una década trabajando en cine argentino, con un recorrido que cruza terror, drama y comedia. Aterrados y Cuando acecha la maldad, ambas dirigidas por Demián Rugna, lo conectaron con un público amplio del género; en la segunda interpreta a Jimi, uno de los hermanos que intenta frenar una amenaza sobrenatural.',
			'También actuó en Bienvenidos al infierno, Punto rojo y Lu & Pau, y sumó tareas de guion, montaje y producción en otros proyectos. Esa continuidad importa: no es una cara asociada a un único éxito, sino un intérprete activo dentro del cine independiente argentino. Su trabajo aporta intensidad sin perder el anclaje cotidiano del personaje.',
		],
	},
	{
		slug: 'jazmin-stuart', name: 'Jazmín Stuart', roles: ['Actriz', 'Directora', 'Guionista'],
		headline: 'Actriz, directora y guionista argentina con una carrera que une ficciones populares y cine independiente.',
		spotlight: 'Su trabajo detrás de cámara suele mirar la adolescencia y la vida familiar desde una cercanía poco complaciente.',
		editorialBiography: [
			'Stuart empezó a actuar en televisión siendo joven y fue ampliando su recorrido con películas como Los paranoicos y títulos posteriores de tonos muy distintos. Frente a cámara puede moverse entre el drama y la comedia; detrás de ella encontró un espacio propio para escribir y dirigir historias centradas en vínculos y experiencias cotidianas.',
			'Las motitos y Desmadre muestran esa mirada autoral, atenta a la adolescencia y a los cambios que atraviesan una familia o un grupo. También trabaja como guionista y directora en televisión. Su trayectoria evita separar tajantemente el cine de autor del entretenimiento popular: circula entre ambos y conserva una voz reconocible.',
		],
	},
	{
		slug: 'antonella-costa', name: 'Antonella Costa', roles: ['Actriz'],
		headline: 'Actriz argentina reconocida por personajes intensos en películas sobre memoria, identidad y vida cotidiana.',
		spotlight: 'Su actuación directa vuelve visibles las marcas que la violencia histórica deja en la intimidad.',
		editorialBiography: [
			'Costa se hizo notar internacionalmente con Garage Olimpo, de Marco Bechis, donde interpretó a una joven secuestrada durante la dictadura. El papel exigía sostener una experiencia extrema sin convertirla en una figura abstracta, y fijó una relación fuerte entre su trabajo y los relatos de memoria.',
			'Después alternó producciones argentinas y europeas, desde El campo hasta películas filmadas en Italia. Su carrera no se reduce al drama político: también buscó personajes atravesados por conflictos personales y cambios de entorno. Esa movilidad entre países y registros amplió una filmografía marcada por decisiones expresivas y por una presencia intensa.',
		],
	},
	{
		slug: 'ines-efron', name: 'Inés Efrón', roles: ['Actriz'],
		headline: 'Actriz argentina de registro singular, asociada a películas que exploran identidades y vínculos fuera de lo convencional.',
		spotlight: 'Su actuación combina reserva y extrañeza, y puede hacer que un personaje parezca estar descubriendo el mundo en tiempo real.',
		editorialBiography: [
			'Efrón llamó la atención con XXY, de Lucía Puenzo, y volvió a trabajar con la directora en El niño pez. En ambas películas su actuación encontró una forma de expresar preguntas sobre el cuerpo, el deseo y la identidad sin reducirlas a una explicación sencilla.',
			'Medianeras y El pasado ampliaron sus registros hacia la comedia urbana y el drama. Su presencia conserva una cualidad particular: parece moverse con una lógica propia incluso dentro de historias reconocibles. Esa libertad la acercó a cineastas argentinos y latinoamericanos interesados en personajes que desacomodan las expectativas.',
		],
	},
	{
		slug: 'ines-estevez', name: 'Inés Estévez', roles: ['Actriz'],
		headline: 'Actriz argentina de cine, teatro y televisión, con personajes que combinan inteligencia, intensidad y humor.',
		spotlight: 'Su trayectoria atraviesa varias generaciones sin quedar fijada a una época o a un solo tipo de papel.',
		editorialBiography: [
			'Estévez se formó en teatro y trabajó en cine y televisión desde los años ochenta. La historia oficial y Un lugar en el mundo la vinculan con películas centrales del cine argentino, pero su carrera también incluye comedias, ficciones televisivas y proyectos escénicos donde pudo explorar otros tonos.',
			'Después de una pausa dedicada a la vida familiar, retomó la actuación y volvió a sumar papeles en pantalla, entre ellos El último gigante. Su trabajo conserva una intensidad que no necesita elevar la voz: suele apoyarse en la mirada y el ritmo de respuesta. La continuidad de su carrera muestra una intérprete dispuesta a cambiar con cada etapa.',
		],
	},
	{
		slug: 'muriel-santa-ana', name: 'Muriel Santa Ana', roles: ['Actriz'],
		headline: 'Actriz argentina de teatro, cine y televisión, reconocida por su versatilidad y su precisión para la comedia.',
		spotlight: 'Puede hacer que una personalidad excéntrica parezca cercana, y que una escena cotidiana descubra una tensión inesperada.',
		editorialBiography: [
			'Santa Ana se formó en la escena teatral y encontró una audiencia amplia con la serie Ciega a citas. Ese trabajo mostró su facilidad para la comedia de personaje, pero su carrera incluye dramas y películas como Un cuento chino y Los justos, donde el humor aparece de forma más discreta.',
			'La televisión, el cine y el teatro le permitieron sostener ritmos distintos sin perder una identidad expresiva. Su actuación suele combinar observación y energía, con personajes que revelan sus contradicciones a través de la conversación. Esa amplitud la volvió una presencia constante en la ficción argentina contemporánea.',
		],
	},
	{
		slug: 'susana-pampin', name: 'Susana Pampín', roles: ['Actriz'],
		headline: 'Actriz argentina de teatro y cine, con una presencia precisa en relatos cotidianos y de observación social.',
		spotlight: 'Sus personajes suelen modificar el clima de una escena sin necesidad de ocupar el centro del relato.',
		editorialBiography: [
			'Pampín desarrolló una extensa carrera teatral y cinematográfica, a menudo en películas que observan la vida diaria sin grandes subrayados. Silvia Prieto y La luz incidente muestran su afinidad con relatos donde una conversación, una visita o un gesto pueden cambiar el sentido de la escena.',
			'También trabajó con directoras y directores de distintas generaciones, desde Lucrecia Martel hasta Ariel Rotter. Su actuación se integra al conjunto y, al mismo tiempo, deja una marca reconocible: una mezcla de reserva, humor y atención al detalle. Es una figura importante del cine argentino de autor, aunque su trabajo exceda esa clasificación.',
		],
	},
	{
		slug: 'javier-drolas', name: 'Javier Drolas', roles: ['Actor'],
		headline: 'Actor argentino de tono naturalista, asociado a comedias y dramas urbanos sobre vínculos y vida cotidiana.',
		spotlight: 'Su presencia convierte la charla común y el pequeño tropiezo en motores de humor y reconocimiento.',
		editorialBiography: [
			'Drolas es una cara característica del cine urbano argentino. En Medianeras acompañó una comedia romántica construida alrededor de la arquitectura y la soledad porteña; Las buenas intenciones lo ubicó en una familia que intenta sostenerse mientras sus integrantes empiezan a separarse.',
			'Su actuación evita el énfasis y trabaja con pausas, respuestas laterales y una comicidad discreta. Además del cine, tiene una trayectoria teatral y televisiva que amplía su registro. Los personajes que interpreta suelen parecer conocidos desde el primer momento, pero dejan ver pequeñas contradicciones que los vuelven menos previsibles.',
		],
	},
	{
		slug: 'laura-paredes', name: 'Laura Paredes', roles: ['Actriz', 'Dramaturga'],
		headline: 'Actriz y dramaturga argentina vinculada a un cine colectivo, experimental y atento a las voces cotidianas.',
		spotlight: 'Su trabajo combina actuación y escritura, y suele abrir espacio a personajes que el cine tradicional deja en los márgenes.',
		editorialBiography: [
			'Paredes forma parte de El Pampero Cine, colectivo que produjo algunas de las obras más singulares del cine argentino reciente. Actuó en La flor y Trenque Lauquen, de Laura Citarella, y en Los delincuentes, de Rodrigo Moreno; también escribió y trabajó en teatro con otros integrantes del grupo.',
			'En Belén se sumó a una película de gran circulación basada en un caso judicial real. Esa participación convive con proyectos de producción independiente donde el tiempo, la escucha y el trabajo colectivo ocupan un lugar central. Su carrera cruza disciplinas y modelos de hacer cine sin perder de vista las experiencias concretas de los personajes.',
		],
	},
	{
		slug: 'diego-cremonesi', name: 'Diego Cremonesi', roles: ['Actor'],
		headline: 'Actor argentino de gran versatilidad, con una carrera sostenida entre el teatro, el cine y las series.',
		spotlight: 'Puede construir tipos duros sin convertirlos en caricaturas y encuentra humanidad en personajes marcados por la violencia.',
		editorialBiography: [
			'Cremonesi se formó en el teatro y ganó visibilidad en televisión antes de consolidarse en el cine. En Pistolero protagonizó un western argentino de tono áspero; también participó en El marginal y en películas como La noche de 12 años, donde la tensión política y personal exige una actuación de gran concentración.',
			'Su presencia suele asociarse a personajes de fuerte carácter, pero el trabajo no descansa en la dureza: deja aparecer la vulnerabilidad y las contradicciones que el género podría ocultar. La variedad de sus proyectos lo convirtió en uno de los actores argentinos más activos de su generación.',
		],
	},
	{
		slug: 'guillermo-pfening', name: 'Guillermo Pfening', roles: ['Actor', 'Director'],
		headline: 'Actor y director argentino que alterna producciones locales, cine independiente y proyectos internacionales.',
		spotlight: 'Su trabajo suele sostener una tensión entre el deseo de pertenecer y la necesidad de inventarse otra vida.',
		editorialBiography: [
			'Pfening se destacó en cine argentino con papeles que cruzan conflictos íntimos y sociales. En El patrón: radiografía de un crimen se integró a un relato sobre explotación laboral; en Nadie nos mira interpretó a un actor que intenta abrirse camino en Nueva York, lejos de las redes que lo sostenían en Buenos Aires.',
			'También dirigió películas y participó en producciones de Europa y Estados Unidos, manteniendo vínculos con el cine nacional. Su carrera no responde a una sola escala: puede trabajar en una película pequeña y luego en un proyecto de alcance internacional. Esa circulación amplió su perfil como intérprete y realizador.',
		],
	},
	{
		slug: 'german-de-silva', name: 'Germán de Silva', roles: ['Actor'],
		headline: 'Actor argentino de extensa trayectoria, asociado a personajes de clase trabajadora y relatos de tensión social.',
		spotlight: 'Su naturalismo hace que incluso una aparición breve lleve consigo un mundo y una historia propios.',
		editorialBiography: [
			'De Silva trabajó durante décadas en teatro y televisión antes de recibir mayor reconocimiento cinematográfico. El patrón: radiografía de un crimen lo puso en el centro de un drama sobre explotación, y también participó en películas como El estudiante, Un oso rojo y Las acacias.',
			'Su actuación suele apoyarse en una economía de recursos que vuelve creíbles los entornos y las relaciones de poder. No representa a sus personajes desde afuera: construye una presencia física y verbal que parece pertenecer al mundo narrado. Esa forma de trabajo lo convirtió en un intérprete importante para el cine argentino contemporáneo.',
		],
	},
	{
		slug: 'daniel-araoz', name: 'Daniel Aráoz', roles: ['Actor', 'Comediante'],
		headline: 'Actor y humorista argentino que combina una formación teatral con personajes cinematográficos de gran energía.',
		spotlight: 'Su comicidad puede ser expansiva, pero también deja ver zonas de ternura, miedo y violencia.',
		editorialBiography: [
			'Aráoz construyó una carrera entre el teatro, la televisión y el cine, con una comicidad de fuerte presencia física. En El hombre de al lado integró una comedia incómoda sobre vecindad, clase y límites; Relatos salvajes lo mostró en un registro más extremo, dentro de un elenco coral.',
			'La actuación le permite pasar del remate humorístico a la tensión dramática con rapidez. También trabajó en Córdoba y Buenos Aires en proyectos escénicos que alimentaron su relación con el público. Su recorrido demuestra que el humorista puede ocupar el centro de una historia sin dejar atrás la complejidad del actor.',
		],
	},
	{
		slug: 'carola-reyna', name: 'Carola Reyna', roles: ['Actriz'],
		headline: 'Actriz argentina de teatro, televisión y cine, con una larga trayectoria en personajes de gran sensibilidad.',
		spotlight: 'Su interpretación se apoya en la inteligencia y la escucha, con un humor que nunca le quita espesor al personaje.',
		editorialBiography: [
			'Reyna desarrolló una carrera extensa en teatro y televisión, desde las ficciones de los años noventa hasta proyectos recientes. Su trabajo combina precisión cómica con una mirada íntima sobre los vínculos; esa capacidad se reconoce tanto en series populares como en películas de elencos corales.',
			'En Las corredoras volvió al cine junto a un grupo de intérpretes de distintas generaciones. También participó en obras y ficciones que le permitieron explorar personajes de edades y experiencias variadas. Su trayectoria se sostiene en la continuidad del oficio y en una forma de actuar que privilegia la relación entre quienes comparten la escena.',
		],
		sourceUrls: ['https://mubi.com/en/cast/carola-reyna'],
	},
	{
		slug: 'rosario-blefari', name: 'Rosario Bléfari', roles: ['Actriz', 'Cantante', 'Escritora'],
		headline: 'Artista argentina que cruzó música, actuación y escritura con independencia y sensibilidad generacional.',
		spotlight: 'Su voz y su forma de actuar compartían una franqueza poco solemne, capaz de volver íntima una escena mínima.',
		editorialBiography: [
			'Bléfari fue una figura central del rock independiente argentino como cantante de Suárez, y sostuvo en paralelo una carrera de actriz y escritora. En Silvia Prieto, de Martín Rejtman, su trabajo encaja con una comedia de observación que encuentra humor en la repetición y el desconcierto.',
			'También actuó en películas como La idea de un lago y La mujer de los perros, y publicó libros de poesía y narrativa. Su trayectoria no separó las disciplinas: la música, el cine y la escritura compartían una atención a los gestos ordinarios. Falleció en 2020 y dejó una obra influyente en varias escenas culturales.',
		],
	},
	{
		slug: 'alejo-garcia-pintos', name: 'Alejo Garcia Pintos', roles: ['Actor'],
		headline: 'Actor argentino recordado por personajes juveniles en películas que abordaron la memoria y la historia reciente.',
		spotlight: 'Su trabajo en La noche de los lápices permanece ligado a una de las películas argentinas más vistas sobre la dictadura.',
		editorialBiography: [
			'García Pintos quedó asociado para muchos espectadores a La noche de los lápices, donde interpretó a uno de los estudiantes secuestrados durante la última dictadura. La película llevó a una audiencia amplia una historia real de violencia estatal y convirtió el trabajo de su joven elenco en parte de la memoria audiovisual del país.',
			'Después continuó en televisión, teatro y cine, con papeles en comedias, dramas y producciones familiares. Su carrera se extendió más allá de aquel título emblemático, aunque el vínculo con la memoria histórica sigue siendo una referencia importante de su filmografía. También trabajó como docente y director teatral.',
		],
	},
	{
		slug: 'ignacio-huang', name: 'Ignacio Huang', roles: ['Actor'],
		headline: 'Actor argentino de origen taiwanés, conocido por acercar una experiencia migrante al centro de la comedia local.',
		spotlight: 'Su personaje en Un cuento chino transformó el idioma y la distancia cultural en parte de una amistad improbable.',
		editorialBiography: [
			'Huang nació en Taiwán y se radicó en la Argentina, donde desarrolló su trabajo como actor. Un cuento chino lo hizo conocido por su interpretación de Jun, un joven que llega a Buenos Aires sin hablar español y queda unido a un hombre solitario por una serie de azares.',
			'El personaje podría haber sido una figura anecdótica, pero la película le da una experiencia y un deseo propios. Huang sostuvo esa dimensión con sensibilidad y humor, y luego continuó trabajando en cine, televisión y teatro. Su trayectoria conecta comunidades y lenguas que rara vez ocupaban ese lugar en la comedia argentina.',
		],
	},
	{
		slug: 'dario-levy', name: 'Darío Levy', roles: ['Actor'],
		headline: 'Actor argentino de trabajo sostenido en cine, televisión y teatro, presente en películas clave del realismo local.',
		spotlight: 'Su actuación de carácter encuentra densidad en personajes que podrían pasar inadvertidos en otra película.',
		editorialBiography: [
			'Levy integró el elenco de El bonaerense, de Pablo Trapero, una película que observa con distancia crítica el ingreso de un hombre común a la policía provincial. Su presencia acompaña el tono austero del relato, donde los gestos cotidianos revelan relaciones de poder y aprendizaje.',
			'A lo largo de su carrera trabajó en numerosas producciones argentinas y en teatro, con personajes de reparto que sostienen la textura de los mundos narrados. Su labor no depende de la fama de un protagonista: forma parte de una tradición de actores que construyen credibilidad y espesor en cada escena.',
		],
	},
	{
		slug: 'hector-echavarria', name: 'Héctor Echavarría', roles: ['Actor', 'Productor'],
		headline: 'Actor y artista marcial argentino que llevó su formación en artes de combate a películas de acción.',
		spotlight: 'Su trayectoria conecta el cine popular argentino de los noventa con producciones internacionales de acción.',
		editorialBiography: [
			'Echavarría comenzó en las artes marciales y trasladó esa disciplina a la actuación y la producción cinematográfica. En la Argentina participó en Extermineitors III, una comedia de acción que mezclaba el humor local con el repertorio de las películas de combate.',
			'Más tarde trabajó en producciones independientes filmadas en Estados Unidos y otros países, donde pudo ocupar el centro de relatos de acción. Su carrera pertenece a un circuito distinto del cine de autor argentino, pero muestra otra forma de circulación internacional para un artista formado en el país.',
		],
	},
	{
		slug: 'alejandro-hartmann', name: 'Alejandro Hartmann', roles: ['Director', 'Guionista'],
		headline: 'Director argentino de documentales y series que reconstruyen crímenes a partir de archivos, testimonios y contexto.',
		spotlight: 'Su método documental pone el foco en cómo se construye una versión pública de los hechos.',
		editorialBiography: [
			'Hartmann se destacó en el documental y la serie de investigación con producciones como Carmel: ¿Quién mató a María Marta? y El fotógrafo y el cartero: el crimen de Cabezas. Sus trabajos reconstruyen casos conocidos sin limitarse al enigma policial: observan las instituciones, los medios y las relaciones sociales que los rodean.',
			'En Yiya Murano: muerte a la hora del té volvió sobre un episodio de la crónica argentina desde testimonios y materiales de archivo. La investigación, el montaje y la escritura cumplen un papel central en su forma de dirigir. Su cine muestra cómo el documental puede revisar una historia popular y preguntar quién tiene autoridad para contarla.',
		],
	},
	{
		slug: 'ezequiel-rodriguez', name: 'Ezequiel Rodríguez', roles: ['Actor'],
		headline: 'Actor argentino que pasó de las ficciones juveniles al papel protagónico de uno de los grandes éxitos recientes del terror local.',
		spotlight: 'Su transformación en Cuando acecha la maldad llevó su experiencia televisiva a un registro físico y desesperado.',
		editorialBiography: [
			'Rodríguez trabajó desde joven en televisión y participó en ficciones como Violetta antes de convertirse en Pedro, el padre que intenta proteger a sus hijos en Cuando acecha la maldad. El papel lo acercó a un público internacional y exigió sostener una tensión que crece desde la vida rural cotidiana hasta el horror extremo.',
			'También participó en películas como Días de vinilo, La flor y 27: el club de los malditos, además de continuar en series y teatro. Su carrera muestra un cambio de registro marcado, pero no una ruptura: el oficio televisivo y la actuación de género conviven en un intérprete que sigue explorando nuevos proyectos.',
		],
		skipCineNacional: true,
		sourceUrls: [
			'https://tn.com.ar/show/cine-series/2023/11/18/la-impactante-transformacion-fisica-de-ezequiel-rodriguez-de-galan-en-violetta-a-referente-del-terror/',
			'https://www.cinesrenoir.com/media/hojas_pdf/237123-cuando-acecha-la-maldad.pdf',
		],
	},
];

export const argentineContemporaryPerformersProfilesWave21B: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
