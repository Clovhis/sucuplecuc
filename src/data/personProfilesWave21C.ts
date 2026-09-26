import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'albertina-carri', name: 'Albertina Carri', roles: ['Directora', 'Guionista', 'Productora'],
		headline: 'Directora y guionista argentina que desafía las formas del documental, la ficción y la autobiografía.',
		spotlight: 'Su cine discute quién puede narrar la memoria y qué imágenes quedan afuera de una historia familiar.',
		editorialBiography: [
			'Carri se convirtió en una de las cineastas más inquietas del cine argentino con Los rubios, ensayo sobre la memoria de sus padres desaparecidos que mezcla documental, actuación y archivo. Desde entonces su obra siguió cruzando registros, del drama rural de La rabia al juego de géneros y cuerpos de Las hijas del fuego.',
			'Cuatreros volvió sobre la historia familiar a través de materiales dispersos y una narración deliberadamente fragmentada. Como directora y productora, Carri suele poner en cuestión las convenciones con las que el cine organiza la realidad. Su trabajo abrió discusiones estéticas y políticas que todavía influyen en nuevas generaciones de realizadores.',
		],
	},
	{
		slug: 'marcos-carnevale', name: 'Marcos Carnevale', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director y guionista argentino de comedias dramáticas que combinan emoción, humor y temas sociales.',
		spotlight: 'Sus películas parten de conflictos reconocibles y los convierten en relatos accesibles sin ocultar su dimensión afectiva.',
		editorialBiography: [
			'Carnevale desarrolló una carrera de amplia llegada con películas como Elsa y Fred, Corazón de león e Inseparables. Sus historias suelen reunir personajes que empiezan en posiciones muy distintas y deben revisar sus prejuicios al compartir una experiencia. La comedia funciona como puerta de entrada a temas de edad, discapacidad, clase y soledad.',
			'También trabajó como guionista y productor, y dirigió episodios y series para televisión. El último gigante suma un título reciente a una filmografía que circuló por distintos países y públicos. Su cine privilegia la claridad narrativa y el vínculo emocional, una combinación que lo volvió uno de los directores populares más constantes de la Argentina.',
		],
	},
	{
		slug: 'ana-katz', name: 'Ana Katz', roles: ['Directora', 'Actriz', 'Guionista', 'Productora'],
		headline: 'Directora, guionista y actriz argentina que encuentra comedia y extrañeza en los vínculos cotidianos.',
		spotlight: 'Sus películas miran con humor a personajes que intentan cumplir con expectativas familiares, sociales o propias.',
		editorialBiography: [
			'Katz construyó una filmografía reconocible desde El juego de la silla y Una novia errante, películas donde el humor nace de las pequeñas incomodidades de una reunión o un viaje. También actuó en sus propios proyectos y en obras de otros cineastas, como La estrella roja y El perro que no calla.',
			'Sueño Florianópolis amplió su mirada hacia una familia en vacaciones, mientras que El perro que no calla observó varios años de vida a través de cambios mínimos. Como directora, guionista y actriz, trabaja con ritmos propios y personajes que no siempre saben explicar lo que quieren. Esa incertidumbre vuelve cercana su comedia.',
		],
	},
	{
		slug: 'alejandro-agresti', name: 'Alejandro Agresti', roles: ['Director', 'Guionista'],
		headline: 'Director y guionista argentino que construyó una obra entre la independencia local y las producciones internacionales.',
		spotlight: 'Su cine cambia de escala y género, pero conserva una atención constante a los vínculos y a la memoria.',
		editorialBiography: [
			'Agresti comenzó a filmar en la Argentina con proyectos de bajo presupuesto y una voz formal muy personal. Buenos Aires viceversa, El acto en cuestión y El viento se llevó lo que lo ubicaron entre los directores que renovaron el cine local en los años noventa; Valentín llevó esa mirada a un relato de infancia y familia.',
			'Más tarde trabajó en producciones internacionales, entre ellas La casa del lago, sin abandonar la escritura y la dirección de películas argentinas. Su carrera alterna comedia, drama y experimentación, y no se ordena alrededor de un solo éxito. Esa amplitud ayuda a entender el paso de un cineasta independiente a proyectos de alcance global.',
		],
	},
	{
		slug: 'diego-lerman', name: 'Diego Lerman', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director y guionista argentino atento a las instituciones y a las personas que intentan encontrar un lugar dentro de ellas.',
		spotlight: 'Sus historias observan cómo la escuela, la familia y la ley pueden proteger o dejar expuestos a sus protagonistas.',
		editorialBiography: [
			'Lerman se dio a conocer con Tan de repente y continuó explorando personajes en los márgenes de su entorno. El abrazo partido, Refugiado y Una especie de familia cruzan historias íntimas con conflictos de clase, pertenencia y cuidado, mientras El suplente lleva esa atención a una escuela pública del conurbano.',
			'Su puesta combina observación realista con decisiones narrativas que desplazan el punto de vista. También produjo obras de otros realizadores y participó en debates sobre cine y política cultural. La continuidad entre sus películas muestra una preocupación por cómo las instituciones afectan la vida concreta, sin convertir a los personajes en ejemplos abstractos.',
		],
	},
	{
		slug: 'lucia-puenzo', name: 'Lucía Puenzo', roles: ['Directora', 'Guionista', 'Productora'],
		headline: 'Directora y escritora argentina que combina relatos de identidad con géneros como el drama, el suspenso y la aventura.',
		spotlight: 'Sus personajes suelen vivir transformaciones íntimas dentro de entornos sociales que buscan definirlos desde afuera.',
		editorialBiography: [
			'Puenzo pasó de la literatura al cine con XXY, una película que abrió una conversación sobre identidad corporal y autonomía desde la experiencia de una adolescente. Volvió sobre esos temas en El niño pez y Wakolda, aunque cada historia se mueve en un mundo distinto, del thriller íntimo a la memoria de posguerra.',
			'También escribió series y dirigió proyectos fuera de la Argentina. Pepita, la pistolera la conecta con un caso real de Mar del Plata y con una ficción criminal de época. Su trabajo combina investigación, tensión narrativa y personajes que resisten ser reducidos a una sola definición.',
		],
	},
	{
		slug: 'gaston-duprat', name: 'Gastón Duprat', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director y guionista argentino que usa la sátira para observar el prestigio, el dinero y las jerarquías culturales.',
		spotlight: 'Sus relatos suelen seguir a personajes convencidos de que controlan el mundo, hasta que sus propias reglas los exponen.',
		editorialBiography: [
			'Duprat trabaja con frecuencia junto a Mariano Cohn, con quien dirigió El hombre de al lado y El ciudadano ilustre. La primera convierte una disputa entre vecinos en una observación de clase; la segunda se burla de la relación entre el reconocimiento internacional y la comunidad que un escritor dejó atrás.',
			'Mi obra maestra y Competencia oficial llevaron esa mirada a otros mundos del arte y el cine, siempre con humor incómodo y personajes que se toman muy en serio. Además de dirigir, Duprat escribe y produce. Su obra examina cómo se construye el prestigio y qué intereses aparecen detrás de una imagen pública.',
		],
	},
	{
		slug: 'ariel-rotter', name: 'Ariel Rotter', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino de relatos íntimos y precisos, atento a las vidas que cambian después de una pérdida.',
		spotlight: 'Su puesta deja espacio al silencio y a los gestos, para que el duelo aparezca como una experiencia cotidiana.',
		editorialBiography: [
			'Rotter comenzó con Solo por hoy y obtuvo reconocimiento internacional con El otro, una película sobre un hombre que toma temporalmente la identidad de otra persona. En lugar de explicar cada decisión, deja que los espacios y la espera revelen la crisis del protagonista.',
			'La luz incidente llevó esa atención a una mujer que intenta reconstruir su vida después de enviudar. Sus películas trabajan con actuaciones contenidas y un tiempo narrativo que acompaña a los personajes, no que los apura hacia una conclusión. Como director, guionista y productor, mantiene una obra breve pero coherente.',
		],
	},
	{
		slug: 'gustavo-taretto', name: 'Gustavo Taretto', roles: ['Director', 'Guionista'],
		headline: 'Director y guionista argentino que convirtió la arquitectura de Buenos Aires en parte de una historia de amor.',
		spotlight: 'Su cine encuentra conexiones y desencuentros en la forma de habitar la ciudad.',
		editorialBiography: [
			'Taretto llegó al largometraje con Medianeras, expandiendo un corto previo sobre dos personas que viven cerca en Buenos Aires sin llegar a encontrarse. La película toma edificios, ventanas y medianeras como parte de su relato sentimental, y transforma la forma urbana en una imagen del aislamiento contemporáneo.',
			'Antes había trabajado en publicidad y cortometrajes, lo que se nota en una puesta visual ordenada y concisa. Medianeras circuló internacionalmente y conectó con públicos que reconocieron sus observaciones sobre las aplicaciones, la soledad y la vida en departamentos. Su filmografía ofrece una mirada singular sobre la ciudad y sus habitantes.',
		],
	},
	{
		slug: 'paula-hernandez', name: 'Paula Hernández', roles: ['Directora', 'Guionista'],
		headline: 'Directora y guionista argentina de dramas familiares donde los afectos conviven con secretos y diferencias.',
		spotlight: 'Su mirada se acerca a los personajes sin absolverlos, y encuentra tensión en lo que una familia no dice.',
		editorialBiography: [
			'Hernández comenzó a dirigir largometrajes con Herencia y amplió su recorrido con Un amor y Los sonámbulos. Sus películas suelen organizarse alrededor de familias o parejas que llegan a un punto de quiebre; la tensión aparece tanto en la conversación como en lo que cada persona decide callar.',
			'Las siamesas concentra ese interés en un viaje de madre e hija, donde la cercanía puede sentirse como cuidado y como encierro. Hernández trabaja con actuaciones precisas y espacios que reflejan las relaciones sin explicarlas de manera mecánica. Su cine combina intimidad y observación social con una voz sostenida a lo largo de varias décadas.',
		],
	},
	{
		slug: 'milagros-mumenthaler', name: 'Milagros Mumenthaler', roles: ['Directora', 'Guionista'],
		headline: 'Directora argentina de sensibilidad observacional, interesada en la intimidad y en las formas de habitar una casa.',
		spotlight: 'Sus películas confían en los silencios y en las rutinas para mostrar cómo cambia una relación.',
		editorialBiography: [
			'Mumenthaler llamó la atención con Abrir puertas y ventanas, centrada en tres hermanas que intentan reorganizarse después de la muerte de su abuela. La película observa la convivencia desde los objetos, los espacios y las tareas cotidianas, sin apurar una resolución emocional.',
			'La idea de un lago continuó su interés por la memoria familiar, mientras que Las corrientes se acerca a una mujer que atraviesa una crisis silenciosa durante un viaje. Su puesta es precisa y paciente, y deja que el espectador complete lo que los personajes no expresan. Ese modo de mirar distingue una obra pequeña en cantidad y amplia en resonancias.',
		],
	},
	{
		slug: 'martin-rejtman', name: 'Martín Rejtman', roles: ['Director', 'Guionista', 'Escritor'],
		headline: 'Director y escritor argentino cuya comedia seca observa hábitos, trabajos y vínculos sin buscar moralejas.',
		spotlight: 'La repetición y el azar organizan sus películas, donde cada desvío cotidiano puede cambiarlo todo.',
		editorialBiography: [
			'Rejtman abrió una nueva etapa del cine argentino con Rapado, una película de formas austeras que observa a un joven en una Buenos Aires indiferente. Silvia Prieto llevó ese método a una cadena de encuentros, empleos y casualidades narrados con humor seco y distancia precisa.',
			'Los guantes mágicos y Dos disparos continuaron su interés por personajes que no siempre entienden lo que les pasa. También publicó narrativa y trabajó en edición y docencia. Su cine influyó en varias generaciones por demostrar que una historia podía avanzar con acciones mínimas y aun así sostener una mirada muy propia.',
		],
	},
	{
		slug: 'raul-perrone', name: 'Raúl Perrone', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino independiente que filmó durante décadas en Ituzaingó y al margen de los circuitos industriales.',
		spotlight: 'Su método de trabajo convirtió el barrio, los vecinos y los recursos limitados en parte de una estética reconocible.',
		editorialBiography: [
			'Perrone desarrolló una obra prolífica desde Ituzaingó, con equipos pequeños, actores no profesionales y una relación directa con el territorio. Películas como Labios de churrasco y Graciadió ayudaron a instalar una forma de producción independiente que no esperaba permiso de la industria para filmar.',
			'Con el tiempo fue cambiando de soporte, ritmo y lenguaje, desde el registro cotidiano hasta composiciones más radicales como Samuray. Su cine vuelve una y otra vez sobre jóvenes, amistades y espacios suburbanos, pero evita convertirlos en estampas. La continuidad de su trabajo influyó en realizadores que valoran la libertad formal y la producción de bajo presupuesto.',
		],
	},
	{
		slug: 'rodrigo-moreno', name: 'Rodrigo Moreno', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino que mezcla observación social, humor y experimentación en relatos de ritmo libre.',
		spotlight: 'Sus películas pueden empezar como una historia reconocible y desplazarse hacia preguntas más abiertas sobre el trabajo y el tiempo.',
		editorialBiography: [
			'Moreno formó parte del colectivo El Pampero Cine y dirigió películas como El custodio, Reimon y Los delincuentes. En esta última, dos empleados de un banco imaginan escapar de la rutina mediante un robo; la trama se expande hasta convertirse en una reflexión lúdica sobre el tiempo y el trabajo.',
			'Su cine no se apresura a resolver los géneros que pone en marcha. Observa tareas, trayectos y conversaciones, y deja que la duración transforme la expectativa del espectador. También escribe y produce sus proyectos, con una práctica colaborativa ligada a una de las experiencias más singulares del cine argentino contemporáneo.',
		],
	},
	{
		slug: 'hernan-goldfrid', name: 'Hernán Goldfrid', roles: ['Director', 'Guionista'],
		headline: 'Director argentino de thrillers y dramas que usa la tensión para examinar culpa, poder y ambición.',
		spotlight: 'Sus películas enfrentan a personajes seguros de su inteligencia con situaciones que no pueden controlar.',
		editorialBiography: [
			'Goldfrid se hizo conocido con Música en espera, una comedia romántica de encuentros inesperados, y luego pasó al thriller con Tesis sobre un homicidio. La adaptación de la novela de Diego Paszkowski construye un duelo entre un profesor y un estudiante alrededor de una investigación que no deja de complicarse.',
			'El director también trabajó en televisión y siguió explorando relatos de suspenso y personajes bajo presión. Su puesta es clara y orientada al género, pero suele dejar abierta la pregunta por la responsabilidad moral. Esa combinación le permitió transitar entre la comedia, el drama y el policial sin perder una identidad narrativa.',
		],
	},
	{
		slug: 'sebastian-schindel', name: 'Sebastián Schindel', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino que combina documental y ficción para contar historias de desigualdad y violencia.',
		spotlight: 'Su cine parte de hechos reconocibles y mira cómo las estructuras sociales condicionan las decisiones individuales.',
		editorialBiography: [
			'Schindel empezó en el documental y llevó esa atención a la ficción con El patrón: radiografía de un crimen, basada en el caso de un trabajador explotado. El relato evita separar el delito de las condiciones laborales que lo hicieron posible, y utiliza una actuación central de gran intensidad.',
			'Después dirigió El hijo y Crímenes de familia, películas que recorren conflictos domésticos y judiciales desde perspectivas distintas. También produjo documentales y series. La investigación es una parte visible de su método, pero el objetivo no es solo reconstruir hechos: busca que el espectador observe las relaciones de poder detrás de ellos.',
		],
	},
	{
		slug: 'nestor-montalbano', name: 'Néstor Montalbano', roles: ['Director', 'Guionista'],
		headline: 'Director argentino de comedias excéntricas que mezclan música, cultura popular y personajes desbordados.',
		spotlight: 'Su humor celebra lo raro y lo barrial, con una lógica propia que no busca parecerse a la comedia convencional.',
		editorialBiography: [
			'Montalbano construyó un universo cómico junto a actores y músicos que luego serían parte de la televisión de culto argentina. Soy tu aventura y Pájaros volando cruzan la música, el delirio y la amistad en relatos donde la extravagancia es una manera de mirar el país.',
			'También dirigió a Diego Capusotto en proyectos de cine y televisión, compartiendo un gusto por los personajes que exageran hasta revelar algo reconocible. Las corredoras lo ubica en una comedia más reciente, pero su sello sigue ligado al absurdo y a una sensibilidad popular que prefiere la invención a la fórmula.',
		],
	},
	{
		slug: 'nicanor-loreti', name: 'Nicanor Loreti', roles: ['Director', 'Guionista'],
		headline: 'Director argentino de cine de género, con una obra que cruza terror, acción y cultura popular.',
		spotlight: 'Sus películas usan códigos conocidos para abrir espacio a personajes y ambientes del cine argentino.',
		editorialBiography: [
			'Loreti ganó reconocimiento con Diablo, un policial de acción que mezcla humor negro y referencias al cine de explotación. Después dirigió Kryptonita, que trasladó figuras de superhéroes a un hospital del conurbano, y continuó trabajando en terror y relatos de ritmo acelerado.',
			'Lu & Pau y Hot Line forman parte de una filmografía que presta atención a los códigos del género sin imitarlos de manera automática. Loreti también escribe y participa en la producción de proyectos independientes. Su trabajo muestra que el cine argentino puede explorar el fantástico y la acción desde escenarios y voces locales.',
		],
	},
	{
		slug: 'nicolas-onetti', name: 'Nicolás Onetti', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director y productor argentino que trabaja el terror y el fantástico con vocación de circulación internacional.',
		spotlight: 'Sus proyectos conectan escenarios locales con los códigos del cine de horror clásico y contemporáneo.',
		editorialBiography: [
			'Onetti trabaja junto a su hermano Luciano en películas de género que circularon por festivales y plataformas internacionales. Los olvidados y Abrakadabra exploran el terror con referencias al giallo y al cine de explotación; la saga What the Waters Left Behind llevó esa apuesta a una comunidad aislada y violenta.',
			'Además de dirigir, produce y distribuye proyectos independientes, una tarea importante para un cine que suele tener menos acceso a salas. Los olvidados: cicatrices amplía su relación con el género y con públicos especializados. Su carrera muestra una vía de producción argentina orientada a conectar autores locales con circuitos globales de horror.',
		],
	},
	{
		slug: 'miguel-cohan', name: 'Miguel Cohan', roles: ['Director', 'Guionista'],
		headline: 'Director y guionista argentino de policiales y dramas familiares construidos alrededor de secretos y sospechas.',
		spotlight: 'Sus relatos convierten la información incompleta en una fuente de tensión entre personas cercanas.',
		editorialBiography: [
			'Cohan debutó en el largometraje con Sin retorno, un thriller moral sobre las consecuencias de un accidente y las versiones que cada involucrado construye. Después dirigió Betibú, una intriga periodística con un elenco amplio, y La misma sangre, donde un conflicto familiar toma forma de policial.',
			'Su cine trabaja con géneros reconocibles y los usa para observar la culpa, la ambición y las lealtades. También realizó documentales y colaboró como guionista. La variedad de sus proyectos muestra una atención sostenida a los mecanismos del suspenso y a la manera en que una comunidad administra aquello que prefiere no saber.',
		],
	},
	{
		slug: 'carlos-galettini', name: 'Carlos Galettini', roles: ['Director', 'Guionista'],
		headline: 'Director argentino ligado a la comedia comercial y a varias de las sagas populares del cine de los ochenta.',
		spotlight: 'Su trabajo entendió el ritmo del entretenimiento de sala y el atractivo de los elencos cómicos recurrentes.',
		editorialBiography: [
			'Galettini fue una figura importante de la comedia comercial argentina de los años ochenta y noventa. Dirigió Bañeros II: la playa loca y varias entregas de Extermineitors, películas que mezclaban aventura, humor físico y estrellas populares en relatos pensados para convocar a familias y jóvenes.',
			'La continuidad de esas sagas permitió que actores como Emilio Disi, Gino Renni y Guillermo Francella trabajaran juntos en un registro de grupo. Su cine no buscaba el realismo: apostaba por el gag, la acción y un tono de historieta. Esa obra forma parte de la memoria de un período central del entretenimiento argentino.',
		],
	},
	{
		slug: 'juan-cabral', name: 'Juan Cabral', roles: ['Director', 'Guionista'],
		headline: 'Director argentino que pasó de la publicidad internacional al largometraje y a relatos de imaginación fantástica.',
		spotlight: 'Su experiencia en formatos breves se percibe en una puesta visual precisa y en ideas narrativas de gran claridad.',
		editorialBiography: [
			'Cabral se hizo conocido como director de publicidad antes de realizar su primer largometraje. En Risa y la cabina del viento se acercó a una niña que busca comunicarse con una persona ausente, y construyó una historia fantástica alrededor del duelo y la imaginación.',
			'Su trabajo para marcas internacionales le dio experiencia en narrar con pocas imágenes y una idea central nítida. El paso al cine permitió extender ese lenguaje hacia personajes y emociones de mayor duración. Su recorrido enlaza la industria publicitaria global con una producción argentina de tono íntimo y fantástico.',
		],
	},
	{
		slug: 'juan-taratuto', name: 'Juan Taratuto', roles: ['Director', 'Guionista'],
		headline: 'Director y guionista argentino de comedias sobre pareja, amistad y las pequeñas crisis de la vida urbana.',
		spotlight: 'Su humor toma los desencuentros cotidianos y los transforma en situaciones de ritmo rápido y gran identificación.',
		editorialBiography: [
			'Taratuto alcanzó popularidad con No sos vos, soy yo, una comedia sobre una separación que conectó con espectadores de distintos países. Después dirigió Un novio para mi mujer, que convirtió la crisis de una pareja en una cadena de planes disparatados, y Me casé con un boludo.',
			'Su cine trabaja con personajes reconocibles y conflictos que nacen de la comunicación fallida, la inseguridad y las expectativas románticas. También escribió series y proyectos para televisión. Nada entre los dos suma una producción reciente a una carrera que ayudó a consolidar la comedia argentina de gran público en el siglo XXI.',
		],
	},
	{
		slug: 'diego-rafecas', name: 'Diego Rafecas', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino que cruza drama, música y preguntas espirituales en películas de producción independiente.',
		spotlight: 'Sus historias buscan una dimensión ética y filosófica dentro de conflictos familiares y sociales.',
		editorialBiography: [
			'Rafecas debutó con Un buda, una película que introduce la meditación y la búsqueda espiritual en una historia de hermanos y violencia. Después dirigió Rodney, Paco y Cruzadas, proyectos que se acercan a personajes enfrentados con adicciones, pérdidas y decisiones difíciles.',
			'También trabajó como guionista y productor, manteniendo una filmografía personal por fuera de las grandes estructuras industriales. Su cine suele combinar drama social con inquietudes filosóficas y una relación visible con la música. Las películas conectadas al catálogo muestran parte de esa búsqueda sostenida.',
		],
	},
	{
		slug: 'pablo-giorgelli', name: 'Pablo Giorgelli', roles: ['Director', 'Guionista'],
		headline: 'Director argentino de películas contenidas que siguen a personajes comunes en tránsito y en busca de compañía.',
		spotlight: 'Su puesta confía en los trayectos, las miradas y los silencios para desarrollar relaciones sin apurarlas.',
		editorialBiography: [
			'Giorgelli debutó con Las acacias, una película de viaje en la que un camionero y una mujer con una niña comparten la ruta entre Paraguay y Buenos Aires. Con muy pocos personajes y diálogos, el relato construye confianza a partir de pequeñas acciones y cambios de atención.',
			'El director recibió reconocimiento internacional por esa primera película y continuó trabajando en proyectos como Invisible y La encomienda. Su cine privilegia la observación y los vínculos que nacen en circunstancias provisionales. La sencillez formal no reduce el mundo: permite que cada gesto tenga tiempo para modificarlo.',
		],
	},
];

export const argentineDirectorsProfilesWave21C: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
