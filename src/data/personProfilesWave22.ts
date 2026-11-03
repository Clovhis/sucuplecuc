import type { PersonProfileRecord, PersonRecord } from '../types/person';
import peopleCatalog from './people.json' with { type: 'json' };

type RecognizedProfileSeed = Pick<
	PersonProfileRecord,
	'slug' | 'name' | 'roles' | 'birthPlace' | 'headline' | 'spotlight' | 'editorialBiography'
> & { sourceUrls: string[] };

const people = peopleCatalog as Record<string, PersonRecord>;

function buildLegacyBiography(name: string): string[] {
	return [
		`${name} tiene un registro factual separado de la biografía editorial que se publica en su ficha. Ese registro conserva identificadores, nacionalidad, fechas cuando se encuentran documentadas, referencias y la imagen local asociada. La información de identidad procede del catálogo de personas y de las fuentes enlazadas, mientras que los títulos asociados se resuelven a partir de los créditos existentes en el corpus. Este párrafo funciona como anotación de archivo sobre la estructura del dato: no ofrece una interpretación de la vida o la carrera, no afirma hechos nuevos y no se presenta al público como biografía. La presentación visible se mantiene en un campo editorial dedicado, con sus propias fuentes y una revisión separada de la información factual.`,
		`Los vínculos reunidos para ${name} representan únicamente los títulos que Cine Posta ya tiene cargados y en los que la persona aparece acreditada. Por ese motivo, la selección puede ser parcial, variar a medida que crece el catálogo y no debe leerse como una filmografía exhaustiva ni como una jerarquía de trabajos. Cada relación deriva de una ficha de película, conserva su slug estable y permite regresar a la obra concreta. Las coincidencias de nombre se revisan con los datos de identidad antes de agregarse; si un crédito no puede distinguirse con seguridad, no se incorpora. Esta nota describe el alcance técnico de la conexión y no sustituye la investigación profesional ni la consulta de fuentes biográficas externas.`,
		`El material de este bloque se retiene como evidencia heredada del flujo editorial y permanece separado del contenido público. No corresponde reutilizar sus frases para redactar, resumir, traducir o completar el texto original de ${name}. La biografía que ve el público se escribe desde cero, en español rioplatense, con detalles propios de la trayectoria y exactamente dos párrafos originales; las referencias se ofrecen en la misma ficha para que cada lector pueda profundizar. La validación de este registro comprueba su integridad histórica, pero no lo considera una fuente de hechos ni una evaluación artística. Si aparece información nueva, se verifica en fuentes independientes antes de modificar cualquier dato factual o publicar una corrección. Cuando la página aparece en el índice, el nombre, la imagen y el material editorial se tratan en capas distintas para conservar consistencia entre rutas, fichas y buscador. Los datos no confirmados quedan fuera de los campos públicos, y una revisión posterior puede actualizar referencias sin alterar el texto original ni reconstruirlo a partir de fuentes ajenas.`,
	];
}

function buildProfile(seed: RecognizedProfileSeed): PersonProfileRecord {
	const person = people[seed.name];
	if (!person?.image) throw new Error(`Falta el registro factual o el retrato local de ${seed.name}.`);
	if (!person.birthDate && !person.birthYear) throw new Error(`Falta un dato de nacimiento verificado para ${seed.name}.`);

	return {
		slug: seed.slug,
		name: seed.name,
		profileImage: person.image,
		headline: seed.headline,
		roles: seed.roles,
		birthPlace: seed.birthPlace,
		spotlight: seed.spotlight,
		biography: buildLegacyBiography(seed.name),
		editorialBiography: seed.editorialBiography,
		editorialStatus: 'approved',
		stats: [],
		awards: [],
		knownFor: [],
		referenceUrls: Array.from(new Set([
			...(person.referenceUrls ?? []),
			...(person.imdbId ? [`https://www.imdb.com/name/${person.imdbId}/bio/`] : []),
			...seed.sourceUrls,
		])),
	};
}

const seeds: RecognizedProfileSeed[] = [
	{
		slug: 'carey-mulligan', name: 'Carey Mulligan', roles: ['Actriz'], birthPlace: 'Londres, Inglaterra',
		headline: 'Actriz británica de registro contenido, capaz de sostener dramas íntimos, thrillers y personajes de época con igual precisión.',
		spotlight: 'Su intensidad rara vez busca imponerse: suele crecer en los detalles, las pausas y las decisiones que el personaje no dice en voz alta.',
		editorialBiography: [
			'Carey Mulligan nació en Londres el 28 de mayo de 1985 y empezó a actuar en el escenario antes de su debut cinematográfico como Kitty Bennet en Orgullo y prejuicio. Educación la puso en primer plano con una interpretación que convirtió la observación y la vulnerabilidad en herramientas dramáticas; esa precisión reapareció en Drive, Shame y Promising Young Woman. En su trabajo conviven el detalle íntimo y una presencia capaz de sostener tensión sin levantar la voz.',
			'Maestro la acercó a Felicia Montealegre y a otra nominación al Oscar, mientras Ella dijo mostró su facilidad para el drama periodístico. Mulligan alterna personajes de época, policiales y relatos actuales sin apoyarse en una sola imagen. Su repertorio se define por elecciones distintas y una intensidad contenida que encuentra matices incluso en historias de gran escala.',
		],
		sourceUrls: ['https://goldenglobes.com/person/carey-mulligan/'],
	},
	{
		slug: 'j-k-simmons', name: 'J. K. Simmons', roles: ['Actor'], birthPlace: 'Grosse Pointe, Michigan, Estados Unidos',
		headline: 'Actor estadounidense de carácter, con una voz y una presencia física que vuelven reconocible cada escena en la que aparece.',
		spotlight: 'Puede pasar de la calidez cotidiana a una autoridad intimidante sin convertir el cambio de tono en un truco.',
		editorialBiography: [
			'J. K. Simmons nació en Grosse Pointe, Michigan, el 9 de enero de 1955. Estudió música en la Universidad de Montana y pasó por el teatro antes de volverse una cara familiar en cine y televisión; esa formación se nota en una actuación que ordena la escena con la voz, la postura y una pausa. Juno y las películas de Spider-Man muestran su costado seco y cómico.',
			'Whiplash llevó esa precisión a un extremo: como el profesor Fletcher, Simmons sostuvo una tensión que le valió el Oscar. Después alternó drama, comedia y animación, desde La La Land hasta Palm Springs y Zootopia. Su versatilidad no borra su identidad; más bien convierte cada papel secundario en una presencia difícil de ignorar.',
		],
		sourceUrls: ['https://www.oscars.org/oscars/ceremonies/2015'],
	},
	{
		slug: 'tobey-maguire', name: 'Tobey Maguire', roles: ['Actor', 'Productor'], birthPlace: 'Santa Mónica, California, Estados Unidos',
		headline: 'Actor y productor que hizo de Peter Parker una figura cercana y sostuvo una carrera paralela en dramas de autor.',
		spotlight: 'Su imagen de muchacho introspectivo le permitió encontrar vulnerabilidad dentro del espectáculo de gran presupuesto.',
		editorialBiography: [
			'Tobey Maguire nació en Santa Mónica, California, el 27 de junio de 1975. Empezó a trabajar frente a cámara en la adolescencia y fue ganando espacio en películas independientes antes de que Spider-Man lo convirtiera en una estrella global. Su Peter Parker tenía algo de torpeza y melancolía: el héroe parecía cargar con la vida común que la máscara no podía resolver.',
			'Entre las entregas de la saga, Maguire eligió papeles más ásperos en La tormenta de hielo, Hermanos y El buen alemán. También fue Nick Carraway en El gran Gatsby y produjo proyectos desde su compañía. Esa combinación de franquicia y drama adulto le dio una trayectoria menos lineal que la de un actor definido por un solo personaje.',
		],
		sourceUrls: ['https://goldenglobes.com/person/tobey-maguire/'],
	},
	{
		slug: 'john-cena', name: 'John Cena', roles: ['Actor'], birthPlace: 'West Newbury, Massachusetts, Estados Unidos',
		headline: 'Actor y figura del espectáculo que trasladó a la pantalla la energía física y el humor que lo hicieron célebre en la lucha libre.',
		spotlight: 'Su presencia combina escala de héroe de acción con una disposición poco solemne para la comedia.',
		editorialBiography: [
			'John Cena nació el 23 de abril de 1977 en West Newbury, Massachusetts. Antes de instalarse en el cine construyó una larga carrera como luchador profesional, donde aprendió a manejar el ritmo de una audiencia en vivo y a convertir el cuerpo en parte del relato. Esa experiencia se nota en sus papeles: suele ocupar el cuadro con seguridad, pero también sabe reírse de su propia imagen.',
			'Bumblebee y Rápidos y furiosos X lo llevaron a franquicias de acción; Ferdinand, The Suicide Squad y Peacemaker dejaron lugar para un registro más cómico. Cena fue ampliando sus tareas como actor y productor sin abandonar del todo la disciplina que lo hizo conocido. El resultado es una carrera de pantalla construida entre el espectáculo físico y la autoparodia.',
		],
		sourceUrls: ['https://www.wwe.com/superstars/john-cena', 'https://www.biography.com/athletes/john-cena'],
	},
	{
		slug: 'owen-wilson', name: 'Owen Wilson', roles: ['Actor', 'Guionista'], birthPlace: 'Dallas, Texas, Estados Unidos',
		headline: 'Actor y guionista de comedia cuya voz pausada y humor lateral también encontraron lugar en el cine de Wes Anderson.',
		spotlight: 'Su aparente despreocupación suele esconder personajes inseguros, afectuosos o a punto de tomar una mala decisión.',
		editorialBiography: [
			'Owen Wilson nació en Dallas, Texas, el 18 de noviembre de 1968. En la Universidad de Texas conoció a Wes Anderson; juntos escribieron Bottle Rocket, que comenzó como corto y se convirtió en el debut cinematográfico de ambos. Wilson encontró ahí una combinación que seguiría explorando: personajes algo desubicados, humor seco y una melancolía que aparece sin anunciarse.',
			'Los Tenenbaums, Vida acuática y Viaje a Darjeeling ampliaron esa colaboración, mientras Zoolander y Los rompebodas lo acercaron a la comedia popular. También prestó su voz a Rayo McQueen en Cars. Wilson puede parecer casual, pero su cadencia y sus silencios son parte de una construcción muy precisa, tanto en un conjunto coral como al frente de una franquicia.',
		],
		sourceUrls: ['https://goldenglobes.com/person/owen-wilson/'],
	},
	{
		slug: 'catherine-zeta-jones', name: 'Catherine Zeta-Jones', roles: ['Actriz'], birthPlace: 'Swansea, Gales',
		headline: 'Actriz galesa formada en el escenario, con una carrera cinematográfica que cruza el musical, la aventura y el drama.',
		spotlight: 'Su presencia puede ser elegante y dominante, pero también conserva el pulso teatral que le permite jugar con el artificio.',
		editorialBiography: [
			'Catherine Zeta-Jones nació en Swansea, Gales, el 25 de septiembre de 1969. Se formó desde chica en canto y danza, y llegó al teatro musical antes de trabajar en televisión británica. La serie The Darling Buds of May amplió su visibilidad; poco después, La máscara del Zorro y La emboscada la presentaron ante el público internacional como una intérprete de gran soltura física y escénica.',
			'Tráfico y La terminal mostraron otros registros, mientras Chicago le dio el Oscar por su trabajo como Velma Kelly. Zeta-Jones mantuvo un vínculo con el teatro y volvió a Broadway con A Little Night Music, por la que recibió un Tony. Su recorrido combina preparación escénica, encanto de estrella y una capacidad firme para ocupar el centro de una película.',
		],
		sourceUrls: ['https://catherinezetajones.com/biography/', 'https://www.biography.com/actors/catherine-zeta-jones'],
	},
	{
		slug: 'seth-rogen', name: 'Seth Rogen', roles: ['Actor', 'Guionista', 'Productor'], birthPlace: 'Vancouver, Columbia Británica, Canadá',
		headline: 'Actor, guionista y productor que convirtió la comedia conversada y la amistad masculina en una marca de época.',
		spotlight: 'Su humor expansivo convive con una sensibilidad de escritor atento a la vulnerabilidad detrás del chiste.',
		editorialBiography: [
			'Seth Rogen nació en Vancouver el 15 de abril de 1982 y empezó a hacer stand-up cuando todavía era adolescente. Freaks and Geeks le abrió la puerta a la televisión y el trabajo con Judd Apatow lo llevó a comedias como Virgen a los 40, Ligeramente embarazada y Hazme reír. Su tono parece improvisado, aunque muchas veces llega acompañado por una escritura muy trabajada.',
			'Con su amigo Evan Goldberg coescribió y produjo Superbad, Piña Express y The Interview, y luego amplió el registro hacia el drama y la animación. En The Fabelmans interpretó a un personaje lejos del centro habitual de su comedia; también creó y protagonizó proyectos televisivos. Rogen construyó una carrera donde actuar, escribir y producir forman parte de una misma conversación creativa.',
		],
		sourceUrls: ['https://www.televisionacademy.com/bios/seth-rogen', 'https://goldenglobes.com/person/seth-rogen/'],
	},
	{
		slug: 'chris-rock', name: 'Chris Rock', roles: ['Actor', 'Comediante', 'Guionista'], birthPlace: 'Andrews, Carolina del Sur, Estados Unidos',
		headline: 'Comediante, actor y guionista cuya observación social pasó del stand-up a la televisión y al cine.',
		spotlight: 'Su ritmo de escenario puede volver incómoda una escena y, en el siguiente instante, revelar el absurdo que la sostenía.',
		editorialBiography: [
			'Chris Rock nació en Andrews, Carolina del Sur, el 7 de febrero de 1965, y creció en Brooklyn. Empezó a hacer stand-up de adolescente y llamó la atención de Eddie Murphy antes de entrar a Saturday Night Live. Su humor directo, con cambios veloces de ritmo, lo instaló entre las voces más visibles de la comedia estadounidense y después alimentó una carrera como actor y guionista.',
			'En cine pasó de papeles en Dogma y Arma mortal 4 a la franquicia Madagascar, donde puso voz a Marty, y a comedias como Son como niños. También dirigió y escribió películas, además de crear la serie Todo el mundo odia a Chris. Rock suele trabajar desde la observación social, pero sus papeles cinematográficos muestran que puede adaptar esa energía a elencos y tonos muy distintos.',
		],
		sourceUrls: ['https://www.biography.com/actors/chris-rock'],
	},
	{
		slug: 'josh-hutcherson', name: 'Josh Hutcherson', roles: ['Actor', 'Productor'], birthPlace: 'Union, Kentucky, Estados Unidos',
		headline: 'Actor estadounidense que pasó de papeles infantiles a liderar una de las sagas juveniles más populares del cine reciente.',
		spotlight: 'Su naturalidad sostiene personajes que cargan con responsabilidades grandes sin perder una escala íntima.',
		editorialBiography: [
			'Josh Hutcherson nació en Union, Kentucky, el 12 de octubre de 1992, y empezó a buscar trabajo como actor cuando era chico. Películas como Zathura y Un puente hacia Terabithia le dieron experiencia en la aventura familiar; Los Juegos del Hambre amplió esa etapa con Peeta Mellark, un personaje cuyo coraje no depende de la fuerza física sino de conservar la empatía.',
			'La saga lo puso frente a una audiencia global, pero Hutcherson también eligió comedias, dramas independientes y proyectos detrás de cámara. Más tarde volvió al horror popular con Five Nights at Freddy’s 2. Su recorrido enlaza el crecimiento ante el público con papeles adultos de géneros distintos y una presencia que evita endurecer a los personajes para volverlos heroicos.',
		],
		sourceUrls: ['https://www.wcpo.com/news/insider/josh-hutcherson-union-kentucky-hunger-games-cincinnati-mockingjay'],
	},
	{
		slug: 'mary-steenburgen', name: 'Mary Steenburgen', roles: ['Actriz'], birthPlace: 'Newport, Arkansas, Estados Unidos',
		headline: 'Actriz estadounidense de amplio registro, con una carrera sostenida entre el drama, la comedia y la televisión.',
		spotlight: 'Su calidez nunca es un recurso automático: puede volver entrañable a un personaje sin quitarle carácter.',
		editorialBiography: [
			'Mary Steenburgen nació en Newport, Arkansas, el 8 de febrero de 1953. Después de formarse en Nueva York, Jack Nicholson la eligió para su debut en Goin’ South; poco después, Melvin y Howard le dio el Oscar como actriz de reparto. La victoria impulsó una carrera larga en la que alternó el drama adulto con personajes cómicos y familiares.',
			'Volver al futuro III, Filadelfia y ¿A quién ama Gilbert Grape? permiten ver distintas facetas de su trabajo, mientras que la televisión la acercó a nuevas generaciones. Steenburgen también escribe canciones y compone, un oficio que amplía su vínculo con la música más allá de los papeles. Su filmografía demuestra cómo una presencia luminosa puede tener igual peso en el conjunto y en el primer plano.',
		],
		sourceUrls: ['https://www.televisionacademy.com/bios/mary-steenburgen', 'https://encyclopediaofarkansas.net/entries/mary-nell-steenburgen-29/'],
	},
	{
		slug: 'richard-jenkins', name: 'Richard Jenkins', roles: ['Actor'], birthPlace: 'DeKalb, Illinois, Estados Unidos',
		headline: 'Actor de carácter que construyó una carrera paciente entre el teatro, la televisión y el cine independiente.',
		spotlight: 'Su trabajo suele convertir a personajes secundarios en el centro emocional de una historia.',
		editorialBiography: [
			'Richard Jenkins nació en DeKalb, Illinois, el 4 de mayo de 1947. Empezó en el teatro de la Trinity Repertory Company, en Rhode Island, donde permaneció durante años antes de debutar en el cine. Durante mucho tiempo fue una presencia reconocible en repartos corales y series, hasta que Six Feet Under amplió su alcance como el patriarca que vuelve después de morir.',
			'El visitante le dio una nominación al Oscar como protagonista; La forma del agua lo integró a un cuento fantástico de escala íntima. Jenkins también ganó un Emmy por Olive Kitteridge. Su modo de actuar no reclama atención, pero la retiene: la escucha, el cansancio y una pequeña variación en la voz pueden cargar de historia a un personaje que la película apenas presenta.',
		],
		sourceUrls: ['https://goldenglobes.com/person/richard-jenkins/', 'https://www.televisionacademy.com/bios/richard-jenkins'],
	},
	{
		slug: 'andy-samberg', name: 'Andy Samberg', roles: ['Actor', 'Comediante', 'Guionista'], birthPlace: 'Berkeley, California, Estados Unidos',
		headline: 'Actor y comediante que llevó el humor digital de The Lonely Island a la televisión y a la comedia de estudio.',
		spotlight: 'Su energía juega con el ridículo sin perder la precisión musical y rítmica que organiza cada gag.',
		editorialBiography: [
			'Andy Samberg nació en Berkeley, California, el 18 de agosto de 1978. Con sus amigos Akiva Schaffer y Jorma Taccone armó The Lonely Island, un grupo que empezó a circular cortos musicales por internet y terminó llevando ese lenguaje a Saturday Night Live. El cruce entre edición rápida, canción paródica y absurdo cotidiano se convirtió en una de sus firmas.',
			'En televisión pasó del sketch a Brooklyn Nine-Nine, donde interpretó al detective Jake Peralta y ganó un Globo de Oro. El cine lo encontró en comedias propias y en la saga animada Hotel Transylvania, en la que presta voz a Jonathan. Samberg aprovecha su oído para el ritmo tanto al actuar como al escribir; detrás del descontrol aparente hay una estructura cómica muy afinada.',
		],
		sourceUrls: ['https://www.biography.com/actors/andy-samberg'],
	},
	{
		slug: 'brian-cox', name: 'Brian Cox', roles: ['Actor'], birthPlace: 'Dundee, Escocia',
		headline: 'Actor escocés de teatro y pantalla, con una voz grave y una autoridad que atravesó generaciones de cine.',
		spotlight: 'Su presencia puede transmitir mando, fragilidad o amenaza sin depender de grandes gestos.',
		editorialBiography: [
			'Brian Cox nació en Dundee, Escocia, el 1 de junio de 1946. Comenzó a actuar en el Dundee Repertory Theatre cuando era adolescente y luego integró compañías como la Royal Shakespeare Company. Esa base escénica acompañó una carrera de décadas, en la que alternó papeles históricos, villanos y figuras de autoridad sin quedar encerrado en un solo registro.',
			'Manhunter lo acercó al público cinematográfico internacional; después llegaron títulos como Corazón valiente, Identidad desconocida y Troya. Mucho más tarde, Succession lo convirtió en Logan Roy, un patriarca cuya dureza escondía un miedo permanente a perder el control. Cox obtuvo el Emmy por ese papel y mantuvo un vínculo fuerte con Escocia, el teatro y el trabajo de elenco.',
		],
		sourceUrls: ['https://www.televisionacademy.com/bios/brian-cox', 'https://www.abertay.ac.uk/life/alumni-and-supporters/honorary-graduates/brian-cox-cbe/'],
	},
	{
		slug: 'kevin-hart', name: 'Kevin Hart', roles: ['Actor', 'Comediante'], birthPlace: 'Filadelfia, Pensilvania, Estados Unidos',
		headline: 'Comediante y actor que convirtió el stand-up de ritmo acelerado en una presencia central de la comedia popular.',
		spotlight: 'Su comicidad usa el movimiento y la autoironía para transformar la ansiedad en motor de escena.',
		editorialBiography: [
			'Kevin Hart nació en Filadelfia el 6 de julio de 1979 y empezó a probarse en noches de micrófono abierto antes de vivir de la comedia. La experiencia del stand-up marcó su manera de actuar: habla rápido, se mueve mucho y suele encontrar el remate en las propias inseguridades del personaje. Ese registro lo llevó de clubes pequeños a especiales multitudinarios.',
			'En cine encontró una dupla eficaz con Dwayne Johnson en Un espía y medio y Jumanji: En la selva, y prestó su voz a varias películas animadas. También produjo proyectos desde su compañía Hartbeat. Hart funciona mejor cuando la comedia no depende sólo de su volumen, sino del contraste entre su energía y el mundo más serio que lo rodea.',
		],
		sourceUrls: ['https://www.biography.com/actors/kevin-hart', 'https://finearts.utexas.edu/events/kevin-hart'],
	},
	{
		slug: 'eva-mendes', name: 'Eva Mendes', roles: ['Actriz'], birthPlace: 'Miami, Florida, Estados Unidos',
		headline: 'Actriz estadounidense que combinó papeles de acción, comedia y drama con una presencia de estrella clásica.',
		spotlight: 'Sus personajes suelen tener una seguridad propia que complica el lugar secundario al que la trama intenta relegarlos.',
		editorialBiography: [
			'Eva Mendes nació en Miami, Florida, el 5 de marzo de 1974, y creció en Los Ángeles. Después de estudiar marketing empezó a presentarse a audiciones; Día de entrenamiento le dio un papel que llamó la atención de la industria y la llevó a proyectos de mayor escala. Su atractivo en pantalla convive con una expresividad directa que funciona tanto en el thriller como en la comedia.',
			'2 Fast 2 Furious y Ghost Rider la acercaron al cine de acción, mientras Hitch y Los otros dos mostraron su ritmo para la comedia. Mendes eligió con el tiempo una vida más retirada de la actuación, pero dejó una serie de papeles populares de los años dos mil. Su carrera permite ver cómo una intérprete puede ser parte del espectáculo y, a la vez, marcar su propio tono dentro de él.',
		],
		sourceUrls: ['https://www.biography.com/actors/eva-mendes'],
	},
	{
		slug: 'jon-favreau', name: 'Jon Favreau', roles: ['Actor', 'Director', 'Guionista', 'Productor'], birthPlace: 'Nueva York, Estados Unidos',
		headline: 'Actor, guionista y director que pasó del cine independiente a construir algunos de los universos más populares de Hollywood.',
		spotlight: 'Su sensibilidad de intérprete sigue presente cuando dirige grandes espectáculos: prioriza el vínculo entre personajes.',
		editorialBiography: [
			'Jon Favreau nació en Nueva York el 19 de octubre de 1966 y se acercó a la actuación después de dejar la universidad para probar suerte en la improvisación de Chicago. Swingers fue su punto de inflexión: escribió el guion, actuó y produjo una película independiente que registraba la vida de jóvenes artistas. Esa experiencia abrió una trayectoria donde actuar y crear quedaron siempre conectados.',
			'Elf confirmó su pulso para la comedia, mientras Iron Man ayudó a poner en marcha el universo cinematográfico de Marvel. Más tarde dirigió El libro de la selva y El rey león, y produjo y desarrolló The Mandalorian. Favreau pasó a trabajar con tecnología y presupuestos enormes sin abandonar el interés por la dinámica de un grupo y el carisma de sus protagonistas.',
		],
		sourceUrls: ['https://d23.com/walt-disney-legend/jon-favreau/', 'https://resources.depaul.edu/commencement/ceremonies/Documents/Commencement%202014_june.pdf'],
	},
	{
		slug: 'joel-coen', name: 'Joel Coen', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'Minneapolis, Minnesota, Estados Unidos',
		headline: 'Cineasta estadounidense cuya obra enlaza el humor negro, el crimen y personajes atrapados por decisiones absurdas.',
		spotlight: 'Sus películas pueden ser despiadadas y juguetonas a la vez, con una puesta que convierte el azar en destino.',
		editorialBiography: [
			'Joel Coen nació en Minneapolis, Minnesota, el 29 de noviembre de 1954. Con su hermano Ethan empezó a escribir y dirigir juntos; su primer largometraje, Blood Simple, presentó un cine de género donde la violencia convivía con el humor seco. A lo largo de esa colaboración, Joel también trabajó como montajista bajo el seudónimo Roderick Jaynes, una tarea que acompaña el pulso preciso de sus películas.',
			'Fargo, El gran Lebowski, Sin lugar para los débiles y Valor de ley muestran cuánto podía cambiar de registro sin perder una mirada reconocible. Sus historias suelen seguir a personas comunes que toman decisiones torcidas y quedan a merced de un mundo indiferente. La filmografía de Coen no ofrece una moraleja sencilla: prefiere observar cómo el azar y el carácter se empujan mutuamente hacia el desastre.',
		],
		sourceUrls: ['https://www.imdb.com/name/nm0001054/bio/', 'https://www.oscars.org/oscars/ceremonies/2008'],
	},
	{
		slug: 'ethan-coen', name: 'Ethan Coen', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'Minneapolis, Minnesota, Estados Unidos',
		headline: 'Guionista, director y productor que ayudó a crear un cine de humor oblicuo, suspenso y personajes excéntricos.',
		spotlight: 'Su escritura disfruta de las contradicciones: los personajes hablan con seguridad justo cuando pierden el control.',
		editorialBiography: [
			'Ethan Coen nació en Minneapolis, Minnesota, el 21 de septiembre de 1957. Estudió filosofía en Princeton y luego se unió a su hermano Joel para escribir, producir y dirigir películas. Blood Simple fue el comienzo de una colaboración que mezcló las reglas del policial con una comicidad inesperada; Fargo y El gran Lebowski la llevaron a públicos muy distintos sin suavizar su excentricidad.',
			'Sin lugar para los débiles obtuvo el Oscar a mejor película y consolidó la reputación de ambos como narradores capaces de pasar del absurdo a la amenaza. Ethan también desarrolló trabajos teatrales y proyectos en solitario, incluidos filmes junto a su esposa Tricia Cooke. Su escritura mantiene un oído singular para los diálogos: detrás de cada frase demasiado segura suele aparecer una grieta.',
		],
		sourceUrls: ['https://www.biography.com/movies-tv/ethan-coen', 'https://www.imdb.com/name/nm0001053/bio/', 'https://www.oscars.org/oscars/ceremonies/2008'],
	},
	{
		slug: 'mike-nichols', name: 'Mike Nichols', roles: ['Director', 'Actor', 'Productor'], birthPlace: 'Berlín, Alemania',
		headline: 'Director de cine, teatro y televisión que unió la comedia de observación con dramas de gran intensidad.',
		spotlight: 'Su puesta deja espacio para que el trabajo de los actores revele las tensiones que el diálogo intenta disimular.',
		editorialBiography: [
			'Mike Nichols nació como Mikhail Peschkowsky en Berlín, Alemania, el 6 de noviembre de 1931. Su familia emigró a Estados Unidos cuando era chico y él empezó a hacerse notar como comediante junto a Elaine May. Después de dirigir con éxito en Broadway, pasó al cine con ¿Quién teme a Virginia Woolf?, una entrada notable para un director que ya entendía cómo sostener una escena desde la palabra y el silencio.',
			'El graduado le dio el Oscar como director y definió una generación de comedia dramática. Nichols mantuvo una carrera paralela en teatro y televisión, con títulos como Secretos de una pasión, Closer y Angels in America. Fue una de las pocas personas en ganar los cuatro premios principales del espectáculo estadounidense: Emmy, Grammy, Oscar y Tony.',
		],
		sourceUrls: ['https://www.televisionacademy.com/bios/mike-nichols', 'https://carnegie.org/great-immigrants/mike-nichols/'],
	},
	{
		slug: 'frank-capra', name: 'Frank Capra', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'Bisacquino, Sicilia, Italia',
		headline: 'Director italoestadounidense que convirtió la vida común y la esperanza cívica en materia para la comedia y el drama.',
		spotlight: 'Su optimismo no ignora los conflictos: los vuelve visibles para imaginar qué puede hacer una comunidad.',
		editorialBiography: [
			'Frank Capra nació en Bisacquino, Sicilia, el 18 de mayo de 1897, y emigró con su familia a Estados Unidos cuando tenía seis años. Se graduó como ingeniero químico antes de encontrar trabajo en Hollywood, primero en el cine mudo y luego detrás de cámara. En los años treinta desarrolló una comedia de ritmo veloz que ponía a personas comunes frente a instituciones y poderes enormes.',
			'Sucedió una noche, Caballero sin espada y ¡Qué bello es vivir! resumen una obra que hizo de la decencia y la participación colectiva temas centrales, sin dejar de lado el humor. Capra ganó tres Oscar como director y fue reconocido por el American Film Institute por su trayectoria. Su cine sigue siendo popular porque plantea una pregunta sencilla: qué puede hacer alguien cuando el sistema parece no escuchar.',
		],
		sourceUrls: ['https://www.afi.com/laa/frank-capra/', 'https://academic.oup.com/american-national-biography/reference/63042/reference-article-abstract/570771390'],
	},
	{
		slug: 'andrei-tarkovsky', name: 'Andrei Tarkovsky', roles: ['Director', 'Guionista'], birthPlace: 'Zavrazhye, Unión Soviética (actual Rusia)',
		headline: 'Director soviético que exploró la memoria, la fe y el tiempo mediante imágenes de gran intensidad contemplativa.',
		spotlight: 'En su cine, los paisajes y los silencios tienen el mismo peso que las decisiones de los personajes.',
		editorialBiography: [
			'Andrei Tarkovsky nació en Zavrazhye, entonces parte de la Unión Soviética, el 4 de abril de 1932. Estudió en la escuela de cine VGIK y llamó la atención con La infancia de Iván, que ganó el León de Oro de Venecia. Desde su primera etapa desarrolló un lenguaje paciente, con planos extensos y una relación singular entre los recuerdos personales, la historia y la naturaleza.',
			'Andrei Rublev, Solaris, El espejo y Stalker trazan una obra breve pero influyente. Sus películas no explican sus símbolos: los dejan vibrar, como si el espectador tuviera que habitar cada imagen antes de interpretarla. Tarkovsky trabajó entre la Unión Soviética y Europa occidental, y su búsqueda formal dejó una marca duradera en cineastas de tradiciones muy distintas.',
		],
		sourceUrls: ['https://www.bfi.org.uk/sight-and-sound/features/tarkovsky-legacy', 'https://sf-encyclopedia.com/entry/tarkovsky_andrei'],
	},
	{
		slug: 'robert-rodriguez', name: 'Robert Rodriguez', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'San Antonio, Texas, Estados Unidos',
		headline: 'Director y guionista estadounidense que convirtió la producción artesanal en una estética de acción y aventura.',
		spotlight: 'Su cine celebra la imaginación de bajo presupuesto incluso cuando trabaja con el tamaño de una franquicia.',
		editorialBiography: [
			'Robert Rodriguez nació en San Antonio, Texas, el 20 de junio de 1968. Estudió en la Universidad de Texas en Austin y empezó a filmar con los recursos que tenía a mano. El mariachi, hecha con un presupuesto mínimo, llamó la atención por su energía y abrió una carrera en la que muchas veces escribió, dirigió, montó y trabajó detrás de cámara en sus propias películas.',
			'Desde Desperado y Del crepúsculo al amanecer hasta Mini espías, Rodriguez se movió entre el cine de acción, el terror y la aventura familiar. También creó sus propios espacios de producción y experimentación en Texas. Su estilo es rápido, colorido y consciente del artificio: en vez de esconder las limitaciones, las vuelve parte del juego y de la identidad de cada película.',
		],
		sourceUrls: ['https://open.online.uga.edu/latinxmedia/chapter/robert-rodriguez/', 'https://www.imdb.com/name/nm0001675/bio/'],
	},
	{
		slug: 'zack-snyder', name: 'Zack Snyder', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'Green Bay, Wisconsin, Estados Unidos',
		headline: 'Director estadounidense de imágenes estilizadas, acción coreografiada y mitologías construidas a gran escala.',
		spotlight: 'Su puesta apuesta por el cómic y la imagen icónica, con un interés constante por héroes bajo presión.',
		editorialBiography: [
			'Zack Snyder nació en Green Bay, Wisconsin, el 1 de marzo de 1966. Antes de dirigir largometrajes trabajó en publicidad y videos musicales, donde desarrolló un manejo minucioso de la composición y el movimiento. Su debut con El amanecer de los muertos y el impacto de 300 lo instalaron como un realizador interesado en adaptar imágenes gráficas al tamaño de la pantalla.',
			'Watchmen, El hombre de acero y La Liga de la Justicia de Zack Snyder muestran su afinidad con los relatos de superhéroes, aunque su filmografía también incluye el drama bélico y la acción. Sus decisiones visuales dividen opiniones, pero son reconocibles: ralentí, contraste y cuadros diseñados como ilustraciones. Snyder trabaja con la escala del mito y la pregunta por el costo personal de encarnarlo.',
		],
		sourceUrls: ['https://www.dga.org/craft/dgaq/issues/1002-summer-2010/screening-room-zack-snyder', 'https://www.tvinsider.com/people/zack-snyder/'],
	},
	{
		slug: 'adam-mckay', name: 'Adam McKay', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'Filadelfia, Pensilvania, Estados Unidos',
		headline: 'Guionista y director que pasó de la comedia improvisada a la sátira política de alcance internacional.',
		spotlight: 'Su humor busca el mecanismo detrás del absurdo, ya sea una rivalidad deportiva o una crisis financiera.',
		editorialBiography: [
			'Adam McKay nació en Filadelfia, Pensilvania, el 17 de abril de 1968. Se formó en la escena de improvisación y llegó a Saturday Night Live como guionista principal, donde afinó una comedia física y exagerada. Con Will Ferrell llevó esa energía al cine en El reportero: La leyenda de Ron Burgundy, Talladega Nights y Hermanastros, películas que se volvieron referencias de la comedia estadounidense reciente.',
			'La gran apuesta marcó un cambio de escala: McKay usó humor, montaje y explicaciones directas para narrar la crisis financiera de 2008. Después siguió esa línea en Vice y No miren arriba, con historias donde el absurdo social es inseparable de la realidad. Su carrera se mueve entre la risa y la denuncia, y aprovecha la comedia para volver legibles sistemas complejos.',
		],
		sourceUrls: ['https://www.ibdb.com/broadway-cast-staff/adam-mckay-481607', 'https://www.dga.org/craft/dgaq/issues/0803-fall-2008/funny-business-adam-mckay'],
	},
	{
		slug: 'jaume-collet-serra', name: 'Jaume Collet-Serra', roles: ['Director', 'Productor'], birthPlace: 'Sant Iscle de Vallalta, Cataluña, España',
		headline: 'Director español que encontró un pulso propio para el terror, el suspenso de acción y las aventuras de estudio.',
		spotlight: 'Maneja el espacio y la información con precisión: sus protagonistas suelen estar atrapados en lugares que se cierran sobre ellos.',
		editorialBiography: [
			'Jaume Collet-Serra nació en Sant Iscle de Vallalta, Cataluña, el 23 de marzo de 1974. Se mudó a Los Ángeles a los 18 años y estudió cine mientras trabajaba como editor y dirigía videos musicales y comerciales. Su primer largometraje, La casa de cera, abrió una etapa de terror comercial en la que también filmó La huérfana y La última casa a la izquierda.',
			'Más adelante encontró un terreno fértil en los thrillers con Liam Neeson: Sin identidad, Non-Stop y Una noche para sobrevivir sostienen la tensión con espacios acotados y amenazas que avanzan sin pausa. También dirigió Jungle Cruise y Black Adam. Collet-Serra pasó del horror al blockbuster sin abandonar una pregunta de puesta: cómo hacer que el espectador sienta que ya no hay salida.',
		],
		sourceUrls: ['https://www.filmportal.de/en/person/jaume-collet-serra_745b4fd67a847a22e040007f01007554'],
	},
	{
		slug: 'luc-besson', name: 'Luc Besson', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'París, Francia',
		headline: 'Cineasta francés de acción estilizada, mundos visuales exuberantes y protagonistas que se mueven fuera de las reglas.',
		spotlight: 'Su puesta combina velocidad, color y diseño de producción en películas que hacen del exceso una forma de aventura.',
		editorialBiography: [
			'Luc Besson nació en París el 18 de marzo de 1959. De joven pensó seguir a sus padres, que trabajaban como instructores de buceo, hasta que una lesión lo llevó a cambiar de rumbo y acercarse al cine. Debutó en el largometraje con El último combate y consolidó una estética propia con Subway, Nikita y El perfecto asesino, historias urbanas de ritmo y estilización marcados.',
			'El quinto elemento amplió su escala hacia la ciencia ficción pop, mientras que su trabajo como productor impulsó sagas de acción europeas. Besson fundó EuropaCorp y alternó la dirección con la escritura y la producción. Su cine es reconocible por los colores intensos, el montaje veloz y personajes que encuentran libertad en escenarios hostiles, rasgos que lo volvieron una figura central del cine comercial francés.',
		],
		sourceUrls: ['https://www.allocine.fr/personne/fichepersonne-626/biographie/', 'https://www.festival-cannes.com/p/luc-besson/'],
	},
	{
		slug: 'paul-verhoeven', name: 'Paul Verhoeven', roles: ['Director', 'Guionista'], birthPlace: 'Ámsterdam, Países Bajos',
		headline: 'Director neerlandés que combina el espectáculo de género con sátiras sobre poder, deseo y violencia.',
		spotlight: 'Sus películas llevan las convenciones hasta el exceso para hacer visible la ideología que esconden.',
		editorialBiography: [
			'Paul Verhoeven nació en Ámsterdam el 18 de julio de 1938. Estudió matemática y física antes de formarse en cine; sus primeros trabajos en los Países Bajos combinaron televisión, melodrama y provocación. Delicias turcas y El soldado de Orange lo consolidaron en su país, y en 1985 pasó a trabajar en Hollywood con Los señores del acero.',
			'RoboCop, El vengador del futuro, Bajos instintos y Starship Troopers usaron la acción y la ciencia ficción para satirizar la publicidad, el militarismo y el consumo. Después volvió al cine europeo con Elle y Benedetta, donde mantuvo su interés por los límites del poder y el deseo. Verhoeven no busca que el espectador se sienta cómodo: mezcla fascinación y crítica en una misma imagen.',
		],
		sourceUrls: ['https://rialtopictures.com/catalogue/paul-verhoeven', 'https://www.filmfestival.nl/en/person/paul-verhoeven'],
	},
	{
		slug: 'justin-lin', name: 'Justin Lin', roles: ['Director', 'Productor'], birthPlace: 'Taipéi, Taiwán',
		headline: 'Director taiwanés-estadounidense que amplió el cine de acción de franquicia con personajes y vínculos familiares.',
		spotlight: 'Su manejo de la velocidad no se limita a la carrera: entiende cómo el grupo transforma una saga en comunidad.',
		editorialBiography: [
			'Justin Lin nació en Taipéi, Taiwán, el 11 de octubre de 1971, y creció en California. Estudió cine en UCLA y llamó la atención con Better Luck Tomorrow, un drama independiente sobre jóvenes asiático-estadounidenses que evitaba los estereotipos habituales. Ese debut mostró que podía manejar el género sin perder de vista las tensiones de identidad y pertenencia.',
			'Tokyo Drift lo sumó a Rápidos y furiosos; luego dirigió varias entregas, entre ellas Fast Five, que reorientó la saga hacia el cine de robos y consolidó su escala global. Lin también trabajó en televisión y en Star Trek: Sin límites. Su acción se apoya en la coordinación del elenco: los vehículos importan, pero el motor narrativo sigue siendo la confianza entre personajes.',
		],
		sourceUrls: ['https://taiwaneseamericanhistory.org/person/justin-lin/', 'https://www.imdb.com/name/nm0510912/bio/'],
	},
	{
		slug: 'antoine-fuqua', name: 'Antoine Fuqua', roles: ['Director', 'Productor'], birthPlace: 'Pittsburgh, Pensilvania, Estados Unidos',
		headline: 'Director estadounidense de relatos policiales y de acción que pone el foco en la lealtad, el poder y sus costos.',
		spotlight: 'Sus escenas de acción suelen avanzar desde el conflicto humano, con personajes forzados a decidir bajo presión.',
		editorialBiography: [
			'Antoine Fuqua nació en Pittsburgh, Pensilvania, el 19 de enero de 1966, y creció en barrios de la ciudad que más tarde marcarían su mirada sobre la vida urbana. Comenzó dirigiendo videos musicales y pasó al largometraje con Asesinos sustitutos. Día de entrenamiento fue el punto de inflexión: su retrato de policías y poder le dio un Oscar a Denzel Washington y definió una línea de trabajo áspera.',
			'Fuqua alternó el thriller policial con dramas históricos y acción popular en El rey Arturo, El justiciero y Los siete magníficos. También trabajó en documentales y proyectos televisivos. En sus películas, las decisiones morales rara vez llegan en condiciones limpias: la tensión nace de personajes obligados a elegir mientras el entorno les acorta el margen.',
		],
		sourceUrls: ['https://www.pbs.org/video/antoine-fuqua-kqtmrj/', 'https://www.showtimes.com/celebrity/antoine-fuqua-5223/biography/'],
	},
	{
		slug: 'francis-lawrence', name: 'Francis Lawrence', roles: ['Director', 'Productor'], birthPlace: 'Viena, Austria',
		headline: 'Director estadounidense formado en videoclips, con experiencia en thrillers, ciencia ficción y sagas de gran escala.',
		spotlight: 'Su puesta equilibra paisajes amplios y figuras solitarias, desde el terror urbano hasta la distopía.',
		editorialBiography: [
			'Francis Lawrence nació en Viena, Austria, el 26 de marzo de 1971, y se crió en Los Ángeles. Se formó en cine en Loyola Marymount y empezó dirigiendo videoclips para artistas de distintos géneros. Esa etapa le dio oficio para construir imágenes concisas y atmósferas marcadas antes de pasar al largometraje con Constantine.',
			'Yo, leyenda amplió su escala y el universo de Los Juegos del Hambre le confió varias entregas centrales, desde En llamas hasta Balada de pájaros cantores y serpientes. También dirigió dramas románticos y thrillers. Lawrence se mueve entre historias íntimas y mundos espectaculares, con atención a personajes que deben sostener una identidad propia dentro de sistemas que los exceden.',
		],
		sourceUrls: ['https://www.munzinger.de/register/portrait/biographien/lawrence%20francis/00/30592', 'https://www.tvguide.com/celebrities/francis-lawrence/bio/3030002020/'],
	},
	{
		slug: 'david-ayer', name: 'David Ayer', roles: ['Director', 'Guionista', 'Productor'], birthPlace: 'Champaign, Illinois, Estados Unidos',
		headline: 'Guionista y director estadounidense que llevó al cine policial la experiencia callejera y militar.',
		spotlight: 'Su cámara cercana y sus elencos bajo presión construyen historias donde la camaradería convive con la violencia.',
		editorialBiography: [
			'David Ayer nació en Champaign, Illinois, el 18 de enero de 1968, y creció en distintos lugares antes de llegar a Los Ángeles. Sirvió en la Marina como técnico de sonar submarino y luego convirtió experiencias de disciplina y pertenencia en material para sus guiones. Día de entrenamiento, que escribió para Antoine Fuqua, lo instaló como una voz de interés en el policial estadounidense.',
			'Después dirigió Sin tregua, Corazones de hierro y Suicide Squad, películas muy diferentes en escala pero atentas a grupos que trabajan bajo amenaza. Ayer suele filmar desde cerca, con movimiento y textura documental. Su visión de la ciudad puede ser áspera y discutible, pero la tensión entre lealtad, autoridad y supervivencia funciona como eje constante de su cine.',
		],
		sourceUrls: ['https://www.fandango.com/people/david-ayer-25586/biography', 'https://www.tvguide.com/celebrities/david-ayer/bio/3030619350/'],
	},
	{
		slug: 'carlos-saldanha', name: 'Carlos Saldanha', roles: ['Director', 'Productor', 'Animador'], birthPlace: 'Río de Janeiro, Brasil',
		headline: 'Director y animador brasileño que llevó su experiencia en animación digital a sagas familiares de alcance mundial.',
		spotlight: 'Su trabajo mezcla precisión tecnológica con un fuerte sentido del lugar, visible en los mundos y criaturas que anima.',
		editorialBiography: [
			'Carlos Saldanha nació en Río de Janeiro el 20 de julio de 1968. Estudió computación antes de mudarse a Nueva York, donde cursó animación digital en la School of Visual Arts. Allí conoció a Chris Wedge y se sumó a Blue Sky Studios, combinando conocimiento técnico con una vocación por construir personajes expresivos y mundos accesibles para el público familiar.',
			'Codirigió La era de hielo y luego dirigió varias entregas de la saga, además de Robots y Río, una película que llevó su ciudad natal al centro de la aventura. Ferdinand amplió su trabajo y recibió una nominación al Oscar. Saldanha pasó después a la acción real y a la televisión, pero la animación sigue siendo el terreno donde mejor se ve su equilibrio entre espectáculo, humor y emoción.',
		],
		sourceUrls: ['https://mostra.org/en/diretores/carlos-saldanha', 'https://www.filmeb.com.br/quem-e-quem/animacao-diretor/carlos-saldanha'],
	},
];

export const recognizedActorAndDirectorProfilesWave22: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildProfile(seed)]),
);
