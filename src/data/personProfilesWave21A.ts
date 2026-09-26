import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'luisana-lopilato', name: 'Luisana Lopilato', roles: ['Actriz', 'Productora'],
		headline: 'Actriz argentina que pasó de los grandes fenómenos televisivos a conducir películas de géneros muy distintos.',
		spotlight: 'Su popularidad juvenil abrió una carrera que hoy combina policiales, comedias y participación en la producción de sus proyectos.',
		editorialBiography: [
			'Su carrera empezó de chica en la televisión y encontró una marca generacional con Chiquititas y Rebelde Way. Esa popularidad no quedó encerrada en la nostalgia: el paso a Casados con hijos le dio ritmo de comedia, mientras que Pipa la llevó al policial contemporáneo con una protagonista que volvió en más de una película.',
			'En cine fue alternando comedia romántica, policial y producciones internacionales. Perdida, La corazonada, Matrimillas y La caja azul muestran esa búsqueda entre géneros; en Pepita, la pistolera suma además la producción ejecutiva. La actriz que empezó como fenómeno juvenil hoy elige papeles donde puede conducir el relato y participar de su construcción.',
		],
		sourceUrls: [
			'https://luisanalopilato.com/es/cine/',
			'https://elpais.com/television/2025-10-01/luisana-lopilato-hay-un-monton-de-cosas-que-quizas-no-haria-otra-vez.html',
		],
	},
	{
		slug: 'diego-capusotto', name: 'Diego Capusotto', roles: ['Actor', 'Comediante', 'Guionista'],
		headline: 'Actor y humorista argentino que convirtió la parodia musical y televisiva en un lenguaje propio.',
		spotlight: 'Sus personajes exagerados no son solo chistes: suelen revelar los códigos, prejuicios y poses que organizan la cultura popular.',
		editorialBiography: [
			'Capusotto se formó en el humor de sketches y encontró una voz inconfundible en Cha Cha Cha y Todo por dos pesos. Peter Capusotto y sus videos amplió ese trabajo con figuras como Bombita Rodríguez, Micky Vainilla y Violencia Rivas: personajes que se apropian de una máscara reconocible para llevarla hasta el absurdo.',
			'En cine pasó por registros diversos, desde Pájaros volando y Kryptonita hasta Las corredoras. La actuación conserva algo de su raíz televisiva —el cambio veloz, la voz y el cuerpo como remate—, pero también puede sostener personajes menos caricaturescos. Su recorrido muestra cómo el humor argentino convirtió la parodia en una forma persistente de comentario social.',
		],
	},
	{
		slug: 'emilio-disi', name: 'Emilio Disi', roles: ['Actor', 'Comediante'],
		headline: 'Actor argentino central para la comedia popular de los ochenta y noventa, con una presencia ligada al cine y la televisión.',
		spotlight: 'Su timing directo y su complicidad con el elenco hicieron de sus personajes parte de una memoria compartida del humor local.',
		editorialBiography: [
			'Disi construyó una carrera extensa entre el teatro, la televisión y el cine, con una facilidad especial para la comedia de equipo. Los bañeros más locos del mundo y la serie de los Extermineitors lo cruzaron con el humor físico, las réplicas rápidas y un público que reconocía enseguida su forma de ocupar la escena.',
			'No quedó atado a un único personaje: también trabajó en televisión, comedia teatral y películas de otros tonos, entre ellas Muerte en Buenos Aires. Los títulos del catálogo permiten seguir un tramo de aquella etapa popular, pero su alcance fue más amplio. Disi supo hacer del oficio y la complicidad con sus compañeros una marca duradera.',
		],
	},
	{
		slug: 'gino-renni', name: 'Gino Renni', roles: ['Actor', 'Comediante'],
		headline: 'Actor y cantante argentino de origen italiano, figura habitual de la comedia popular en cine y televisión.',
		spotlight: 'Su trayectoria mezcló humor, música y personajes de reparto capaces de dejar una impresión inmediata.',
		editorialBiography: [
			'Renni llegó al público argentino desde la música y la televisión, y con el tiempo se volvió una cara familiar de la comedia cinematográfica. Los bañeros más locos del mundo y Bañeros II: la playa loca lo reunieron con Emilio Disi y Guillermo Francella en relatos apoyados en el grupo, el gag físico y el desparpajo.',
			'Los Extermineitors prolongaron ese vínculo con el cine popular de los años ochenta y noventa. Su actuación tenía una calidez particular: podía entrar en el chiste sin convertir al personaje en una simple función cómica. Cine, teatro y televisión formaron un recorrido amplio, cuya familiaridad todavía conecta varias generaciones de espectadores.',
		],
	},
	{
		slug: 'dady-brieva', name: 'Dady Brieva', roles: ['Actor', 'Comediante'],
		headline: 'Actor y humorista argentino que pasó del éxito de Midachi a papeles de cine y televisión.',
		spotlight: 'Su trabajo combina una cadencia cómica muy reconocible con una cercanía de actor formado ante públicos masivos.',
		editorialBiography: [
			'Brieva se hizo conocido como parte de Midachi, el trío que convirtió la imitación, el personaje y la interacción con el público en un espectáculo de enorme llegada. Esa experiencia escénica marcó su actuación: trabaja con el ritmo de la voz y una expresividad que puede hacer convivir el humor y la vulnerabilidad.',
			'En cine participó de El ciudadano ilustre, donde su presencia se integra a una comedia que mira con ironía las disputas entre prestigio y vida cotidiana. También construyó una extensa carrera televisiva y teatral. Su recorrido muestra el pasaje de una figura popular del escenario a intérprete de relatos que usan esa misma familiaridad con otros matices.',
		],
	},
	{
		slug: 'enrique-pinti', name: 'Enrique Pinti', roles: ['Actor', 'Comediante', 'Dramaturgo'],
		headline: 'Actor, dramaturgo y monologuista argentino cuya velocidad verbal convirtió la sátira en un espectáculo masivo.',
		spotlight: 'Su humor enlazó historia, política y costumbres con una energía escénica difícil de separar de su voz.',
		editorialBiography: [
			'Pinti desarrolló una forma de humor basada en el monólogo veloz, la memoria histórica y la observación de las costumbres. Salsa criolla condensó ese estilo: una sucesión de referencias, cambios de tono y asociaciones que podía pasar de la risa a la crítica sin frenar el ritmo. En teatro y televisión construyó una presencia inconfundible.',
			'El cine fue una parte de una trayectoria más amplia, que incluyó títulos como Esperando la carroza, Perdido por perdido y Cruzadas. En pantalla conservaba la contundencia del intérprete teatral, pero sabía ajustar el gesto al tamaño del plano. Su obra dejó un registro singular de cómo el humor argentino discutió su propia historia mientras buscaba hacer reír.',
		],
	},
	{
		slug: 'nacha-guevara', name: 'Nacha Guevara', roles: ['Actriz', 'Cantante', 'Directora'],
		headline: 'Artista argentina de teatro, música y cine, con una identidad escénica construida a lo largo de varias décadas.',
		spotlight: 'Su presencia puede pasar del musical a la sátira y el drama sin perder una fuerte conciencia del espectáculo.',
		editorialBiography: [
			'Guevara desarrolló una carrera que cruza la canción, el teatro musical, la actuación y la dirección. Su trabajo escénico la llevó por repertorios y formatos muy distintos, siempre con una interpretación consciente del gesto, la voz y la relación con el público. Esa amplitud hizo que su figura excediera cualquier disciplina por separado.',
			'En cine, Cruzadas ofrece un punto de entrada a una trayectoria más extensa, mientras que sus espectáculos y grabaciones muestran otras facetas de la misma artista. Guevara suele manejar el artificio con intención: puede volverlo humor, comentario o emoción. Su recorrido permite leer cambios de época en la cultura popular argentina y en sus formas de representación.',
		],
	},
	{
		slug: 'veronica-llinas', name: 'Verónica Llinás', roles: ['Actriz', 'Directora', 'Guionista'],
		headline: 'Actriz, directora y guionista argentina de una expresividad capaz de torcer la comedia y el drama.',
		spotlight: 'Su trabajo vuelve imprevisible a cada personaje: el humor puede abrir una grieta incómoda o revelar una ternura inesperada.',
		editorialBiography: [
			'Llinás ganó visibilidad con el humor de Gambas al ajillo y luego construyó una carrera que se mueve entre la televisión, el teatro y el cine. Su actuación no depende de un solo registro: puede llevar una escena al absurdo y, un instante después, dejar a la vista la fragilidad que sostenía el chiste.',
			'Además de actuar, dirigió y escribió proyectos propios, entre ellos La mujer de los perros, codirigida con Laura Citarella. Sus trabajos en La flor y en producciones populares muestran esa libertad para cambiar de escala y tono. En Canelones vuelve a una comedia de elenco, pero su recorrido excede cualquier etiqueta de humorista.',
		],
	},
	{
		slug: 'valeria-bertuccelli', name: 'Valeria Bertuccelli', roles: ['Actriz', 'Directora', 'Guionista'],
		headline: 'Actriz argentina que combinó comedia, drama y dirección con una mirada atenta a las relaciones cotidianas.',
		spotlight: 'Su humor suele nacer de una incomodidad reconocible, y por eso puede convivir con momentos de gran fragilidad.',
		editorialBiography: [
			'Bertuccelli se hizo notar en el cine de Martín Rejtman y amplió su recorrido con comedias como Un novio para mi mujer y Me casé con un boludo. Su actuación encuentra matices en los silencios y las reacciones, de modo que un personaje gracioso también puede sentirse contradictorio y cercano.',
			'Con La reina del miedo pasó a la dirección y la escritura, además de protagonizar una historia sobre la ansiedad, la exposición y el control. Ese cambio no fue una ruptura con sus papeles anteriores: llevó a otro lugar una sensibilidad que ya aparecía en ellos. Su carrera enlaza el cine independiente y la comedia de gran público sin borrar las diferencias entre ambos.',
		],
	},
	{
		slug: 'tomas-fonzi', name: 'Tomás Fonzi', roles: ['Actor'],
		headline: 'Actor argentino que pasó de los éxitos juveniles de televisión a una carrera sostenida en cine y teatro.',
		spotlight: 'Su recorrido muestra cómo una figura asociada a una generación puede encontrar registros nuevos al crecer con sus personajes.',
		editorialBiography: [
			'Fonzi llegó al reconocimiento masivo con Verano del 98 y creció ante el público en una etapa donde la televisión juvenil marcaba conversaciones y estilos. Después buscó papeles en cine, teatro y series que lo alejaron de aquella imagen inicial. Kamchatka permite verlo dentro de un drama familiar y político de otra escala.',
			'En sus trabajos posteriores alternó comedia y drama, con una actuación que suele apoyarse en la naturalidad y en la escucha del elenco. Su trayectoria no depende de un regreso nostálgico a la televisión que lo hizo conocido; se construyó a partir de nuevas colaboraciones y formatos. El resultado es una carrera más amplia que su primer gran papel.',
		],
	},
	{
		slug: 'eva-de-dominici', name: 'Eva De Dominici', roles: ['Actriz'],
		headline: 'Actriz argentina que construyó una carrera internacional entre la televisión, el cine y las producciones en inglés.',
		spotlight: 'Su paso de ficciones juveniles a dramas y thrillers muestra una búsqueda sostenida de papeles con más capas.',
		editorialBiography: [
			'De Dominici empezó a trabajar en televisión siendo adolescente y se hizo conocida en ficciones juveniles antes de pasar a personajes más complejos. El hilo rojo y La última fiesta acompañaron ese cambio de registro; después amplió su carrera con producciones rodadas fuera de la Argentina y papeles en inglés.',
			'En la televisión estadounidense participó de The Cleaning Lady, mientras que en el cine argentino volvió a integrar elencos locales, como en Homo Argentum. Su recorrido combina visibilidad internacional con vínculos persistentes con la producción nacional. La transición no borró sus primeros trabajos: los usó como base para buscar personajes adultos y proyectos de otra escala.',
		],
	},
	{
		slug: 'agustin-aristaran', name: 'Agustín Aristarán', roles: ['Actor', 'Comediante'],
		headline: 'Actor y comediante argentino conocido como Soy Rada, con oficio de escena y una energía física muy marcada.',
		spotlight: 'El humor, la música y la actuación se mezclan en su trabajo sin que una disciplina quede reducida a adorno.',
		editorialBiography: [
			'Aristarán se formó en el espectáculo en vivo como comediante, músico y mago, y trasladó esa mezcla a la televisión y el cine. Bajo el nombre Soy Rada armó una relación directa con el público, apoyada en la improvisación, el ritmo y la transformación de personajes. Ese recorrido le dio herramientas para moverse entre formatos.',
			'En películas recientes como Canelones y Parque Lezama se suma a historias de tono distinto, sin dejar atrás su experiencia escénica. Su trabajo combina humor físico y precisión musical con una actuación que puede correrse del remate fácil. La pantalla amplía un repertorio que ya estaba hecho para el encuentro en vivo.',
		],
	},
	{
		slug: 'juan-diego-botto', name: 'Juan Diego Botto', roles: ['Actor', 'Director', 'Guionista'],
		headline: 'Actor argentino-español formado entre dos industrias, con trabajos en cine, teatro y televisión.',
		spotlight: 'Su trayectoria internacional convive con personajes que vuelven sobre la migración, la identidad y los lazos familiares.',
		editorialBiography: [
			'Botto nació en Buenos Aires y desarrolló su carrera principalmente en España, donde trabajó desde chico en cine, televisión y teatro. La experiencia de moverse entre países forma parte de su perspectiva artística, aunque sus papeles no se limitan a temas de exilio. Puede pasar del drama íntimo a historias de género con una presencia contenida.',
			'En cine argentino se lo puede encontrar en La habitación de al lado y en producciones de distintas etapas; también dirigió y escribió proyectos propios, como En los márgenes. Los aitas y sus trabajos teatrales muestran la continuidad de una carrera que conecta escenas iberoamericanas. Su identidad profesional se construyó precisamente en ese cruce.',
		],
	},
	{
		slug: 'gaspar-noe', name: 'Gaspar Noé', roles: ['Director', 'Guionista'],
		headline: 'Director argentino-francés de cine provocador, conocido por llevar el cuerpo y la percepción al límite.',
		spotlight: 'Sus películas convierten las decisiones formales —cámara, montaje y sonido— en parte del impacto físico del relato.',
		editorialBiography: [
			'Nacido en Buenos Aires y formado en Francia, Noé desarrolló una obra asociada a relatos sensoriales y deliberadamente incómodos. Irreversible organizó el tiempo de manera inversa para alterar la experiencia del espectador; Enter the Void llevó esa exploración a una deriva urbana atravesada por la muerte y la memoria.',
			'Climax condensó su interés por el movimiento, la música y la pérdida de control en una fiesta que se descompone. Sus películas suelen dividir al público, pero comparten una apuesta clara: la forma no ilustra la historia, la vuelve corporal. Ese trabajo de riesgo lo convirtió en una figura reconocida del cine contemporáneo internacional.',
		],
	},
	{
		slug: 'adriana-salgueiro', name: 'Adriana Salgueiro', roles: ['Actriz', 'Conductora'],
		headline: 'Actriz y conductora argentina con una trayectoria extendida entre la televisión, el teatro y el cine popular.',
		spotlight: 'Su presencia combina oficio de comedia y una familiaridad televisiva que atraviesa distintas generaciones.',
		editorialBiography: [
			'Salgueiro se hizo conocida en la televisión argentina y sostuvo una carrera que pasó por la actuación, la conducción y el teatro. Su trabajo en la comedia se apoya en la rapidez de respuesta y en una presencia abierta, capaz de integrarse a elencos numerosos sin perder personalidad.',
			'En cine quedó ligada a la saga Extermineitors, donde participó del humor y la aventura que marcaron una etapa del entretenimiento local. Ese crédito representa solo una parte de un recorrido más largo, desarrollado también en programas y espectáculos en vivo. Su perfil reúne la llegada popular y el trabajo constante de una actriz de oficio.',
		],
	},
	{
		slug: 'dario-barassi', name: 'Darío Barassi', roles: ['Actor', 'Comediante', 'Conductor'],
		headline: 'Actor, comediante y conductor argentino que convirtió su espontaneidad en una marca televisiva reconocible.',
		spotlight: 'Su humor funciona por el intercambio y la improvisación, pero también deja espacio para personajes de ficción.',
		editorialBiography: [
			'Barassi se formó como actor antes de volverse una figura cotidiana de la televisión. Su trabajo como conductor amplió una comicidad basada en el diálogo, la improvisación y una energía física que se adapta rápido a lo que ocurre en el estudio. Esa facilidad para el contacto directo se volvió parte central de su imagen pública.',
			'En cine se sumó a Canelones, una comedia que lo acerca a un elenco y un ritmo distintos de los televisivos. También actuó en ficciones y teatro, donde puede trabajar personajes con más continuidad narrativa. Su carrera sigue en movimiento entre entretenimiento en vivo y actuación, sin que una faceta anule la otra.',
		],
	},
	{
		slug: 'pablo-echarri', name: 'Pablo Echarri', roles: ['Actor', 'Productor'],
		headline: 'Actor y productor argentino que pasó de los galanes televisivos a papeles de cine atravesados por conflictos políticos y morales.',
		spotlight: 'Su carrera enlaza popularidad televisiva con personajes que cargan decisiones y tensiones de época.',
		editorialBiography: [
			'Echarri se volvió una figura conocida en la televisión de los años noventa y extendió esa popularidad al cine. En Plata quemada formó parte de un relato criminal de gran intensidad, mientras que otras películas y series le permitieron explorar el drama, la acción y la comedia romántica.',
			'Con el tiempo sumó trabajo como productor y participó en proyectos que buscaron combinar alcance masivo y temas locales. Su perfil no se reduce al galán que lo hizo popular: también ha sostenido personajes más ásperos y decisiones de producción. Esa amplitud ayuda a entender su lugar en varias etapas recientes del entretenimiento argentino.',
		],
	},
	{
		slug: 'leonor-benedetto', name: 'Leonor Benedetto', roles: ['Actriz', 'Directora'],
		headline: 'Actriz argentina de larga trayectoria en cine, teatro y televisión, también dedicada a la dirección.',
		spotlight: 'Su presencia combina autoridad dramática y una sensibilidad que puede desplazarse de la intimidad al conflicto social.',
		editorialBiography: [
			'Benedetto construyó una carrera extensa en teatro y televisión antes de consolidarse en el cine. Un lugar en el mundo la ubicó en una historia de provincia atravesada por la solidaridad y el desencanto; su filmografía también incluye papeles en dramas históricos y relatos familiares.',
			'Además de actuar, dirigió películas y proyectos teatrales, ampliando su relación con el trabajo narrativo. Esa experiencia le permite mirar a los personajes desde más de un lugar: como intérprete y como responsable de organizar una escena. Su recorrido conecta distintas generaciones del audiovisual argentino y conserva una presencia reconocible en cada formato.',
		],
	},
	{
		slug: 'susu-pecoraro', name: 'Susú Pecoraro', roles: ['Actriz'],
		headline: 'Actriz argentina reconocida por personajes de gran intensidad emocional en el cine y el teatro.',
		spotlight: 'Su interpretación de Camila convirtió un drama histórico en una referencia popular y crítica del cine local.',
		editorialBiography: [
			'Pecoraro alcanzó reconocimiento internacional con Camila, el drama de María Luisa Bemberg nominado al Oscar. Su actuación sostuvo una historia de amor y persecución política con una mezcla de valentía, ternura y decisión que la volvió inseparable del personaje para muchos espectadores.',
			'En las décadas siguientes alternó cine, teatro y televisión, desde Tango feroz hasta proyectos más recientes. No quedó confinada a la figura histórica que la hizo célebre: buscó papeles contemporáneos y registros distintos. Su carrera muestra una continuidad poco común entre el éxito popular, el cine de autor y el trabajo sostenido sobre el escenario.',
		],
	},
	{
		slug: 'rita-cortese', name: 'Rita Cortese', roles: ['Actriz', 'Cantante'],
		headline: 'Actriz y cantante argentina cuya presencia intensa puede sostener tanto el humor seco como el drama.',
		spotlight: 'Su trabajo evita los personajes decorativos: aun en un papel breve, suele introducir una historia y una tensión propias.',
		editorialBiography: [
			'Cortese desarrolló una carrera entre la actuación y el canto, con una formación teatral que se percibe en la precisión de sus personajes. En Las siamesas lleva el conflicto de una relación madre-hija a un terreno incómodo y cotidiano; en Relatos salvajes y Carancho apareció en relatos de energía muy distinta.',
			'La variedad de esos papeles habla de una intérprete que no necesita ocupar el centro para ser memorable. Puede imponer humor, dureza o afecto con pocos gestos, y el trabajo musical amplía su registro escénico. Su recorrido ayuda a reconocer la fuerza de los actores de carácter en el cine argentino.',
		],
	},
	{
		slug: 'hugo-arana', name: 'Hugo Arana', roles: ['Actor', 'Comediante'],
		headline: 'Actor argentino de cine, televisión y teatro, recordado por una mezcla de calidez, ironía y sensibilidad dramática.',
		spotlight: 'Podía pasar de la comedia cotidiana a un papel doloroso sin perder naturalidad ni cercanía.',
		editorialBiography: [
			'Arana atravesó décadas de cine y televisión argentinos, primero con trabajos humorísticos y luego con personajes dramáticos de gran repercusión. La historia oficial forma parte de una filmografía que incluyó tanto películas centrales como ficciones populares, donde su tono amable podía ocultar conflictos más duros.',
			'En teatro y televisión sostuvo una presencia familiar para distintas generaciones, sin quedar encerrado en un único tipo de papel. Su actuación se apoyaba en la escucha y en una forma de hablar que hacía creíbles las contradicciones del personaje. Falleció en 2020; su trabajo sigue apareciendo en obras muy distintas del cine nacional.',
		],
	},
	{
		slug: 'leticia-bredice', name: 'Leticia Brédice', roles: ['Actriz'],
		headline: 'Actriz argentina de energía imprevisible, asociada a personajes que combinan fragilidad, humor y desborde.',
		spotlight: 'Su actuación cambia de temperatura con rapidez y vuelve difícil anticipar qué va a hacer el personaje.',
		editorialBiography: [
			'Brédice se destacó desde temprano en el cine argentino de los noventa y formó parte de películas como Cenizas del paraíso, Nueve reinas y Felicidades. Su trabajo puede ser frontal o desconcertante, con una intensidad que encuentra humor incluso cuando el relato se vuelve oscuro.',
			'Con el paso del tiempo alternó cine, televisión y teatro, y siguió eligiendo personajes lejos de una imagen estable. En Nueve reinas su presencia aporta un contrapunto dentro de una historia de engaños y alianzas cambiantes. Esa amplitud de registros sostiene una trayectoria reconocible sin volverla previsible.',
		],
	},
	{
		slug: 'julieta-cardinali', name: 'Julieta Cardinali', roles: ['Actriz'],
		headline: 'Actriz argentina que transitó de la televisión juvenil a dramas, comedias y proyectos de cine contemporáneo.',
		spotlight: 'Su carrera reúne la familiaridad de la ficción televisiva con personajes cinematográficos de distintos tonos.',
		editorialBiography: [
			'Cardinali empezó a trabajar muy joven y se hizo conocida con ficciones televisivas que marcaron los años noventa. Después extendió su recorrido por cine, teatro y series, construyendo papeles adultos que no dependían de aquella primera imagen. Su trabajo en Belén suma un nuevo capítulo a una filmografía que sigue activa.',
			'En pantalla suele combinar una actuación directa con matices que aparecen en la escucha y las reacciones. Esa cualidad funciona en historias íntimas y en relatos corales, donde el personaje necesita encontrar su lugar entre varias voces. Su trayectoria refleja los cambios de una actriz que creció junto con su público.',
		],
	},
	{
		slug: 'julieta-zylberberg', name: 'Julieta Zylberberg', roles: ['Actriz'],
		headline: 'Actriz argentina de notable elasticidad, capaz de moverse entre el drama intimista, la comedia y el cine de autor.',
		spotlight: 'Su registro encuentra humor en la incomodidad y emoción en personajes que no necesitan explicarse de más.',
		editorialBiography: [
			'Zylberberg construyó una carrera que cruza televisión, teatro y películas de estilos distintos. La niña santa, Relatos salvajes y El rey del Once muestran cuánto puede cambiar de tono sin perder una presencia natural y atenta a los detalles del personaje.',
			'En El perro que no calla, de Ana Katz, se integra a un relato que avanza por saltos de tiempo y observaciones mínimas. También fue parte de numerosas ficciones populares, donde la comedia le permite explorar otros ritmos. Su trabajo evita la actuación enfática y confía en gestos pequeños para hacer visible lo que el personaje no dice.',
		],
	},
	{
		slug: 'raul-de-la-torre', name: 'Raúl de la Torre', roles: ['Director', 'Guionista'],
		headline: 'Director y guionista argentino que enlazó melodrama, música y personajes enfrentados a su propio deseo.',
		spotlight: 'Su cine combina una puesta elegante con relatos que observan la intimidad y sus zonas de conflicto.',
		editorialBiography: [
			'De la Torre desarrolló una obra que pasó del drama social a la adaptación literaria y el musical. Heroína, Pubis angelical y Funes, un gran amor muestran su interés por personajes que buscan afirmarse en un entorno que los limita. El tango, la ciudad y la vida privada aparecen como partes de una misma sensibilidad.',
			'En Funes, un gran amor convirtió la música y el artificio en motor de un melodrama con un elenco destacado. Su estilo no respondía a una sola escuela: podía ser clásico en la composición y arriesgado en el tema. Su filmografía ocupa un lugar singular en la historia del cine argentino de la segunda mitad del siglo XX.',
		],
	},
];

export const argentinePublicFiguresProfilesWave21A: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
