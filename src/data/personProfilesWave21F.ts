import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'romina-ricci', name: 'Romina Ricci', roles: ['Actriz', 'Directora', 'Guionista', 'Productora'],
		headline: 'Actriz, directora y guionista argentina que pasó de la televisión juvenil a una carrera de cine y teatro.',
		spotlight: 'Su trabajo alterna la exposición popular con proyectos personales detrás de cámara.',
		editorialBiography: [
			'Ricci llegó al público en la televisión de los años noventa y después construyó una trayectoria propia en cine y teatro. Participó en Paco, No somos animales, El cuaderno de Tomy y La dicha en movimiento, con personajes que se desplazan entre el drama y la comedia. También estudió dirección de ópera y amplió su actividad a la escritura, la producción y la dirección.',
			'En Fantarias y Las chinas asumió tareas de dirección y guion, además de participar en la creación de sus proyectos. Esa experiencia detrás de cámara convive con su trabajo actoral y le permite intervenir en distintas etapas de una historia. Ricci mantiene una carrera abierta a los cambios de formato y escala, sin quedar fijada a sus primeros éxitos televisivos.',
		],
		sourceUrls: ['https://www.lacapital.com.ar/zoom/romina-ricci-la-militancia-genero-al-rol-actriz-y-directora-n1732912.html'],
	},
	{
		slug: 'mario-alarcon', name: 'Mario Alarcón', roles: ['Actor'],
		headline: 'Actor argentino de cine, teatro y televisión, distinguido por una carrera sostenida entre Rosario y Buenos Aires.',
		spotlight: 'Su oficio convierte a personajes secundarios en figuras humanas y memorables.',
		editorialBiography: [
			'Alarcón desarrolló una carrera extensa en teatro y cine, con papeles en Un lugar en el mundo, El secreto de sus ojos y El robo del siglo. Su presencia puede dar autoridad a una escena o abrir un espacio para el humor, siempre con una actuación medida. También trabajó en las principales salas públicas de Buenos Aires y obtuvo el Konex de Platino por su labor como actor.',
			'Su filmografía reciente muestra que el oficio no quedó atado a una etapa: sigue participando en películas y obras teatrales con personajes de edades, clases y temperamentos diversos. Alarcón construye desde la escucha y el detalle, y por eso sus intervenciones suelen sentirse integradas al mundo de cada relato. Es una de las caras que conectan varias generaciones del cine argentino.',
		],
		sourceUrls: ['https://www.lanacion.com.ar/espectaculos/teatro/mario-alarcon-ganador-del-konex-de-platino-y-una-de-las-figuras-del-cine-el-teatro-y-la-tv-con-mas-nid01012022/'],
	},
	{
		slug: 'alejandro-fiore', name: 'Alejandro Fiore', roles: ['Actor', 'Productor'],
		headline: 'Actor argentino de cine y televisión, popular por Los Simuladores y presente en películas de varias generaciones.',
		spotlight: 'Su voz grave y su presencia física le permitieron pasar del policial a la comedia sin perder identidad.',
		editorialBiography: [
			'Fiore se volvió ampliamente reconocible como Pablo Lamponne en Los Simuladores, una serie que quedó instalada en la memoria televisiva argentina. Antes y después de ese éxito participó en películas como Tango feroz, Caballos salvajes y El fondo del mar, y continuó trabajando en cine con títulos como 8 tiros, Los bastardos e Instante. Su recorrido alterna papeles de acción, drama y comedia.',
			'También produjo proyectos y sostiene una actividad vinculada a la formación actoral. En pantalla suele transmitir decisión y carácter, aunque sus personajes de reparto puedan esconder humor o fragilidad. La continuidad de su carrera, desde la televisión de los noventa hasta producciones recientes, muestra cómo una figura popular puede seguir encontrando lugares nuevos en el audiovisual argentino.',
		],
		sourceUrls: ['https://www.diariopopular.com.ar/futbolfans/alejandro-fiore-palermo-fue-el-jugador-que-mas-me-emociono-n255716'],
	},
	{
		slug: 'edgardo-castro', name: 'Edgardo Castro', roles: ['Actor', 'Director', 'Guionista', 'Productor'],
		headline: 'Actor y cineasta argentino cuya obra cruza la actuación, el documental y la observación de los márgenes sociales.',
		spotlight: 'Su trabajo independiente lleva al primer plano cuerpos y vidas que el cine suele dejar fuera de campo.',
		editorialBiography: [
			'Castro combina la actuación con la dirección, la escritura y la producción. Como intérprete pasó por La flor, Abzurdah, La sudestada y Belén; como realizador construyó una obra personal con La noche, Familia y Las ranas. También es integrante fundador del Grupo Krapp, colectivo de danza y teatro que influyó en su forma de pensar el cuerpo y la escena.',
			'Sus películas se acercan a personajes y espacios con una mirada frontal, pero evitan convertirlos en ejemplos abstractos. Castro trabaja con tiempos extensos y con la presencia física de sus intérpretes para que la experiencia cotidiana sostenga el relato. Su carrera muestra una continuidad entre cine y artes escénicas, y una búsqueda independiente que amplía los límites de la representación argentina.',
		],
	},
	{
		slug: 'carlos-weber', name: 'Carlos Weber', roles: ['Actor'],
		headline: 'Actor argentino de cine, con personajes recordados en películas sobre la historia reciente y sus consecuencias.',
		spotlight: 'Su presencia grave aportó autoridad y tensión a relatos de distintas épocas.',
		editorialBiography: [
			'Weber participó en películas centrales del cine argentino, entre ellas La historia oficial, La noche de los lápices y No habrá más penas ni olvido. En cada una aparece dentro de relatos donde las decisiones individuales están atravesadas por la política y la violencia. Décadas más tarde volvió a la pantalla en Carancho, Las manos y Refugiado, con personajes muy distintos entre sí.',
			'Su actuación tiende a la sobriedad y al control del gesto, una cualidad que vuelve más intensa la tensión cuando el personaje toma una posición de poder. El paso por el cine de los ochenta y por producciones contemporáneas permite reconocer cómo cambia la mirada del país sin perder de vista las historias concretas. Weber dejó una huella firme en ese recorrido.',
		],
	},
	{
		slug: 'mara-bestelli', name: 'Mara Bestelli', roles: ['Actriz'],
		headline: 'Actriz argentina de cine independiente, habitual en relatos que observan vínculos familiares y comunidades pequeñas.',
		spotlight: 'Su interpretación combina calidez y reserva, y deja espacio para que cada personaje conserve su misterio.',
		editorialBiography: [
			'Bestelli sostiene una filmografía amplia dentro del cine argentino. Participó en Rojo, Familia sumergida, Una escuela en Cerro Hueso, Trenque Lauquen y Puán, películas que exploran épocas, vínculos y espacios muy diferentes. En cada una aporta una presencia concreta, capaz de integrarse a un conjunto coral o de cargar una escena con una emoción contenida.',
			'Su trabajo suele apoyarse en una escucha precisa y en gestos que no explican todo de inmediato. Por eso encaja con relatos que confían en los silencios y en las relaciones entre personajes. Bestelli forma parte de una generación de actrices que circula entre el cine independiente y producciones más amplias, manteniendo una voz propia en ambas escalas.',
		],
	},
	{
		slug: 'margarita-molfino', name: 'Margarita Molfino', roles: ['Actriz', 'Coreógrafa'],
		headline: 'Actriz y coreógrafa argentina vinculada a películas que combinan observación cotidiana y experimentación formal.',
		spotlight: 'Su experiencia con el movimiento aporta una dimensión física particular a sus personajes.',
		editorialBiography: [
			'Molfino participó en películas de realizadores argentinos con búsquedas muy distintas, como Relatos salvajes, La flor, Acusada y Los delincuentes. Su aparición en el episodio “Hasta que la muerte nos separe” de Relatos salvajes aprovecha su precisión corporal, una herramienta que también viene de su trabajo como coreógrafa. Más tarde volvió a colaborar con Mariano Llinás y otros equipos independientes.',
			'En pantalla puede resultar enigmática o completamente cotidiana, según el mundo que le propone cada película. Molfino no separa el movimiento de la interpretación: el cuerpo es parte del pensamiento y del modo en que el personaje se relaciona con su entorno. Ese enfoque la conecta con un cine que busca formas nuevas de narrar la intimidad, el trabajo y la vida en común.',
		],
	},
	{
		slug: 'maria-merlino', name: 'María Merlino', roles: ['Actriz', 'Cantante'],
		headline: 'Actriz argentina de teatro y cine, reconocida por convertir la canción y la memoria popular en relatos íntimos.',
		spotlight: 'Su trabajo escénico transforma pequeños gestos y objetos cotidianos en una presencia de gran fuerza.',
		editorialBiography: [
			'Merlino desarrolló una trayectoria central en el teatro independiente y se volvió especialmente reconocida por el unipersonal Nada del amor me produce envidia. Allí interpreta a una costurera que debe decidir si entregar un vestido a Eva Perón o a Libertad Lamarque, mientras el tango y la memoria de los años treinta acompañan la escena. La obra tuvo una larga vida y viajó por distintos escenarios.',
			'En cine participó en Tan de repente, Esteros, El suplente y El hombre que amaba los platos voladores, con personajes alejados entre sí. Su actuación combina precisión física, humor y una escucha cuidadosa de la palabra. Merlino también canta y trabaja en espectáculos musicales, pero conserva una mirada teatral que vuelve singular cada aparición en pantalla.',
		],
		sourceUrls: [
			'https://cinenacional.com/persona/maria-merlino',
			'https://uchile.cl/noticias/221366/maria-merlino-el-teatro-es-un-refugio-una-forma-de-resistencia',
			'https://www.pagina12.com.ar/diario/suplementos/espectaculos/10-29107-2013-07-01.html',
		],
	},
	{
		slug: 'victoria-almeida', name: 'Victoria Almeida', roles: ['Actriz'],
		headline: 'Actriz argentina de cine y televisión, con papeles que van del drama histórico al fantástico contemporáneo.',
		spotlight: 'Su trabajo combina una presencia frontal con matices íntimos y una escucha muy precisa del elenco.',
		editorialBiography: [
			'Almeida construyó una carrera de cine con personajes como Libertad Lamarque en Juan y Eva, Ana en Días de pesca y Cecilia en Joel. Después participó en Malditos sean!, El último hereje y La burbuja, recorriendo relatos históricos, fantásticos y dramáticos. Esa variedad muestra una actriz capaz de ajustarse a tonos muy distintos sin perder naturalidad.',
			'También trabajó en televisión y en el teatro, donde la palabra y la relación directa con el público tienen otro peso. En pantalla suele mantener una intensidad contenida, con gestos que permiten ver tanto la decisión como la incertidumbre del personaje. Almeida sigue sumando proyectos y forma parte de un cine argentino que renueva sus historias y sus protagonistas.',
		],
	},
	{
		slug: 'katia-szechtman', name: 'Katia Szechtman', roles: ['Actriz', 'Directora de casting', 'Productora'],
		headline: 'Actriz y directora de casting argentina que participa en películas tanto delante como detrás de cámara.',
		spotlight: 'Su trabajo de casting ayuda a construir elencos reconocibles y diversos para el cine argentino reciente.',
		editorialBiography: [
			'Szechtman combina la actuación con una extensa labor como directora de casting y asistente de dirección. Trabajó en películas como Relatos salvajes, El ángel, Argentina, 1985, Blondi y Belén, y también tuvo papeles en Puán y 27 noches. Esa doble experiencia le permite conocer de cerca tanto la construcción de un personaje como la elección de los intérpretes que forman un elenco.',
			'En sus proyectos como actriz mantiene una presencia natural, mientras que detrás de cámara colabora con cineastas de distintas generaciones y estilos. Szechtman representa una profesión fundamental que suele quedar menos visible en las conversaciones sobre cine, aunque define buena parte de lo que vemos en pantalla. Su recorrido conecta el trabajo creativo individual con la construcción colectiva de una película.',
		],
	},
	{
		slug: 'pablo-razuk', name: 'Pablo Razuk', roles: ['Actor'],
		headline: 'Actor argentino de cine y teatro, con papeles en relatos de memoria, justicia y conflictos cotidianos.',
		spotlight: 'Su actuación encuentra tensión en personajes que deben tomar decisiones bajo presión.',
		editorialBiography: [
			'Razuk participó en películas de fuerte presencia dentro del cine argentino, como Garage Olimpo, Whisky Romeo Zulu y Derecho de familia. Más adelante sumó Ojos de arena y Hacer la vida, además de trabajos en cortometrajes y teatro. Sus personajes suelen entrar en situaciones límite, pero mantienen una escala humana que evita convertirlos en simples símbolos.',
			'El teatro ocupa un lugar importante en su recorrido y se percibe en la precisión con que organiza la palabra y el movimiento. En cine trabaja con una energía contenida, que deja que el conflicto aparezca en las acciones y no sólo en los diálogos. Razuk sostiene una carrera entre distintas disciplinas y acompaña historias que observan de cerca la vida social argentina.',
		],
	},
	{
		slug: 'pablo-yotich', name: 'Pablo Yotich', roles: ['Actor', 'Director', 'Guionista', 'Productor'],
		headline: 'Actor y cineasta argentino que reúne dirección, escritura y producción en proyectos de ficción.',
		spotlight: 'Su recorrido independiente le permite participar en sus películas desde el desarrollo hasta la interpretación.',
		editorialBiography: [
			'Yotich combina varios oficios del cine y suele ocupar más de un crédito en una misma producción. Dirigió y actuó en El abismo... todavía estamos, Cuatro de copas y Los bastardos; también participó en Instante y Esa semana juntos. Sus proyectos atraviesan el drama, la comedia y relatos corales donde los vínculos familiares y sociales tienen un lugar central.',
			'Esta forma de trabajo conecta la escritura con la presencia frente a cámara y con la organización de cada producción. Yotich sigue desarrollando películas en un circuito independiente, aunque también colabora con figuras de amplia llegada popular. Su trayectoria muestra cómo los equipos pequeños pueden sostener una voz propia y ampliar las oportunidades para contar historias locales.',
		],
	},
	{
		slug: 'gabriel-arbos', name: 'Gabriel Arbós', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino con una larga trayectoria detrás de cámara y una obra reciente dedicada a conversar sobre cine.',
		spotlight: 'Su experiencia como asistente de dirección atraviesa clásicos populares y películas de autor.',
		editorialBiography: [
			'Arbós trabajó como asistente de dirección en películas como Tango feroz, Caballos salvajes y Cenizas del paraíso antes de dirigir sus propios largometrajes. Entre ellos están Campo de sangre, Los esclavos felices y No me mates. En 2025 estrenó Mi mejor escena, un documental donde varios directores argentinos comparten la secuencia que mejor expresa su manera de filmar.',
			'Su recorrido permite ver el cine desde dos lugares: el de quien coordina un rodaje y el de quien decide qué historia contar. La experiencia técnica no desplaza su interés por los personajes y las ideas; le da herramientas para escuchar a otros realizadores y ordenar sus recuerdos. Arbós es parte de una generación que enlaza los grandes rodajes comerciales con la producción independiente.',
		],
		sourceUrls: ['https://www.escribiendocine.com/noticias/2025/08/12/20217-mi-mejor-escena-gabriel-arbos-se-sumerge-en-el-universo-creativo-del-cine-argentino-contemporaneo'],
	},
	{
		slug: 'matias-gueilburt', name: 'Matías Gueilburt', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino de documentales sobre figuras deportivas, episodios históricos y casos que ocuparon la agenda pública.',
		spotlight: 'Sus películas combinan investigación, archivo y testimonios para reconstruir historias recientes.',
		editorialBiography: [
			'Gueilburt encontró en el documental una forma de recorrer historias que mezclan deporte, política y actualidad. Dirigió Vilas: serás lo que debas ser o no serás nada, Los ladrones: la verdadera historia del robo del siglo y El vendedor de ilusiones: el caso Generación Zoe. Sus películas reúnen entrevistas y material de archivo para ordenar relatos que el público ya conoce parcialmente.',
			'También trabajó como productor, guionista, montajista y asistente de dirección. Esa experiencia múltiple se nota en películas que avanzan por capas y organizan la información con un ritmo cercano al thriller. Gueilburt continúa ampliando su filmografía con temas contemporáneos y personajes de alcance popular, dentro de una tradición argentina de documental narrativo.',
		],
	},
	{
		slug: 'agustin-adba', name: 'Agustín Adba', roles: ['Director', 'Guionista', 'Productor', 'Montajista'],
		headline: 'Director argentino de cine independiente, interesado en las relaciones y las decisiones de la vida cotidiana.',
		spotlight: 'Su cine construye observaciones íntimas con atención al ritmo y a los gestos pequeños.',
		editorialBiography: [
			'Adba se formó en la Universidad del Cine y comenzó a desarrollar películas propias desde sus primeros cortometrajes. Dirigió Penélope, un largometraje sobre el deseo y la vida en el mundo del arte, y más tarde realizó Los perros y Recuerdos de un naufragio. También participó en tareas de montaje, producción y dirección de otros proyectos independientes.',
			'Su trabajo suele partir de situaciones personales y observar cómo cambian cuando los personajes se relacionan con otros. En lugar de buscar grandes giros, presta atención a las pausas, las conversaciones y la manera en que un espacio modifica el estado de ánimo. Adba representa una camada de realizadores que sostiene su obra dentro de equipos pequeños y colaborativos.',
		],
	},
	{
		slug: 'sergio-pangaro', name: 'Sergio Pángaro', roles: ['Actor', 'Músico', 'Compositor'],
		headline: 'Músico, compositor y actor argentino que llevó su estética de crooner a la música, el cine y el teatro.',
		spotlight: 'Su elegancia irónica mezcla bolero, pop y una teatralidad que vuelve reconocible cada aparición.',
		editorialBiography: [
			'Pángaro desarrolló una carrera musical al frente de Baccarat y construyó un estilo que cruza el bolero, el pop y la canción de salón. Esa identidad pasó también al cine: actuó en El hombre de al lado, Vaquero, Penélope y Belén, y aportó música a documentales como Moacir. Su presencia suele ocupar un espacio entre el personaje, el cantante y el intérprete.',
			'Además de componer, escribe y trabaja en escena, con una imagen pública cuidadosamente construida y a la vez lúdica. Pángaro usa la nostalgia como material creativo, pero la desarma con humor y referencias contemporáneas. Su trayectoria conecta distintas tradiciones musicales argentinas con un cine que busca figuras capaces de alterar el tono de una historia.',
		],
		sourceUrls: ['https://www.infobae.com/cultura/2025/01/21/sergio-pangaro-contar-el-desencuentro-amoroso-con-las-palabras-del-castellano-nos-vuelve-romanticos/'],
	},
];

export const argentineCatalogActorsAndDirectorsProfilesWave21F: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
