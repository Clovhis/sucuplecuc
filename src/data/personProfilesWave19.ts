import type { PersonProfileRecord, PersonRecord } from '../types/person';
import peopleCatalog from './people.json' with { type: 'json' };

type DirectorProfileSeed = Pick<
	PersonProfileRecord,
	'slug' | 'name' | 'headline' | 'roles' | 'birthPlace' | 'spotlight' | 'editorialBiography' | 'stats' | 'awards' | 'knownFor'
> & {
	legacyFocus: string;
	legacyDetail: string;
	sourceUrls?: string[];
};

const people = peopleCatalog as Record<string, PersonRecord>;

function buildLegacyBiography(seed: DirectorProfileSeed): string[] {
	return [
		`${seed.name} desarrolló una trayectoria vinculada a ${seed.legacyFocus}. Su recorrido reúne decisiones de puesta, escritura y producción que fueron cambiando con cada etapa, y conviene leerlo a través de las películas antes que como una sucesión aislada de datos. La ficha factual conserva fechas, nacionalidad, identificadores y referencias contrastables; este bloque histórico queda únicamente como respaldo de investigación y no se publica como biografía editorial.`,
		`${seed.legacyDetail} Las obras conectadas pertenecen al catálogo real de Cine Posta y permiten observar recursos, temas y colaboraciones desde títulos concretos. No forman una filmografía completa ni buscan resumir una carrera extensa en unas pocas entradas: funcionan como puntos de acceso verificables a una obra reconocida por públicos, colegas e instituciones cinematográficas de distintos países.`,
		`La relevancia de ${seed.name} también surge de la continuidad entre oficio e identidad artística. Cambiaron las escalas, los géneros y las condiciones de producción, pero cada película volvió a poner en juego una manera singular de organizar el espacio, el tiempo y el trabajo con intérpretes. Este material heredado se conserva como evidencia interna de contexto; la presentación visible fue escrita desde cero en dos párrafos originales y acompañada por fuentes consultables.`,
	];
}

function buildProfile(seed: DirectorProfileSeed): PersonProfileRecord {
	const person = people[seed.name];
	if (!person?.image) throw new Error(`Falta el registro factual o el retrato local de ${seed.name}.`);

	return {
		slug: seed.slug,
		name: seed.name,
		profileImage: person.image,
		headline: seed.headline,
		roles: seed.roles,
		birthPlace: seed.birthPlace,
		spotlight: seed.spotlight,
		biography: buildLegacyBiography(seed),
		editorialBiography: seed.editorialBiography,
		editorialStatus: 'approved',
		stats: seed.stats,
		awards: seed.awards,
		knownFor: seed.knownFor,
		referenceUrls: Array.from(new Set([
			...(person.referenceUrls ?? []),
			...(person.imdbId ? [`https://www.imdb.com/name/${person.imdbId}/bio/`] : []),
			...(seed.sourceUrls ?? []),
		])),
	};
}

const seeds: DirectorProfileSeed[] = [
	{
		slug: 'm-night-shyamalan', name: 'M. Night Shyamalan', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Mahé, Puducherry, India',
		headline: 'Director, guionista y productor que convirtió el suspenso sobrenatural en una exploración íntima de la fe, el miedo y la familia.',
		spotlight: 'Sus mejores relatos esconden lo extraordinario dentro de casas, vínculos y rutinas reconocibles, hasta que una revelación obliga a mirar todo de nuevo.',
		legacyFocus: 'el thriller psicológico, el fantástico y una producción de fuerte impronta personal',
		legacyDetail: 'The Sixth Sense estableció su alcance internacional; El incidente, Glass y La trampa muestran cómo siguió revisando el peligro, la identidad y los lazos familiares desde escalas muy diferentes.',
		editorialBiography: [
			'M. Night Shyamalan irrumpió con The Sixth Sense, pero su cine nunca dependió solamente de un giro final. Le interesan las familias bajo presión, los chicos que perciben aquello que los adultos niegan y la irrupción de una amenaza imposible en espacios cotidianos. Esa combinación de clasicismo, extrañeza y emoción convirtió su nombre en una firma reconocible.',
			'Después de éxitos, rechazos y una recuperación construida con producciones más controladas, sostuvo una carrera muy personal dentro del cine de género. El incidente, Glass y La trampa permiten seguir distintas etapas de esa búsqueda. Incluso cuando el mecanismo divide opiniones, Shyamalan filma con una convicción poco habitual: cada encuadre debe alimentar el misterio y cada miedo esconder un conflicto afectivo.',
		],
		stats: [{ label: 'Pelis conectadas', value: '4' }, { label: 'Marca', value: 'Suspenso sobrenatural' }],
		awards: [],
		knownFor: ['the-sixth-sense-1999', 'el-incidente-2008', 'glass-cristal-2019', 'la-trampa-2024'],
		sourceUrls: ['https://www.dga.org/Events/2013/07-July-2013/LCC_EveW_Shyamalan', 'https://www.bfi.org.uk/interviews/m-night-shyamalan-advice-young-filmmakers-trap'],
	},
	{
		slug: 'david-cronenberg', name: 'David Cronenberg', roles: ['Director', 'Guionista'],
		birthPlace: 'Toronto, Ontario, Canadá',
		headline: 'Cineasta canadiense que hizo del cuerpo un territorio donde chocan deseo, tecnología, enfermedad e identidad.',
		spotlight: 'Su horror no llega desde afuera: nace cuando la carne y la mente revelan que siempre fueron menos estables de lo que parecían.',
		legacyFocus: 'el terror corporal, la ciencia ficción y el drama psicológico',
		legacyDetail: 'The Brood, Scanners, Videodrome y La mosca definieron una zona del horror moderno; Inseparables, Crash, El almuerzo desnudo y eXistenZ ampliaron esa obsesión hacia el deseo, la creación y la tecnología.',
		editorialBiography: [
			'David Cronenberg volvió visible una idea incómoda: el cuerpo no es una frontera segura. En The Brood, Scanners, Videodrome y La mosca, la transformación física expresa deseos, enfermedades y tecnologías que ya estaban modificando a los personajes. Su imaginación puede ser grotesca, pero nunca usa la carne como simple impacto; la convierte en pensamiento cinematográfico.',
			'Con Inseparables, Crash, El almuerzo desnudo y eXistenZ llevó esa pesquisa hacia gemelos, accidentes, literatura y mundos virtuales. La frialdad de su puesta no elimina la emoción: la vuelve más perturbadora. Cronenberg construyó desde Canadá una obra capaz de influir en el terror, la ciencia ficción y el drama adulto sin perder una curiosidad radical por aquello que una persona puede llegar a ser.',
		],
		stats: [{ label: 'Pelis conectadas', value: '9' }, { label: 'Marca', value: 'Terror corporal' }],
		awards: [],
		knownFor: ['videodrome-1983', 'la-mosca-1986', 'inseparables-1988', 'crash-extranos-placeres-1996', 'existenz-1999'],
		sourceUrls: ['https://cfe.tiff.net/content/bios/david-cronenberg', 'https://www.bfi.org.uk/sight-and-sound/interviews/cemetery-splendour-david-cronenberg-shrouds'],
	},
	{
		slug: 'rob-reiner', name: 'Rob Reiner', roles: ['Director', 'Actor', 'Productor'],
		birthPlace: 'El Bronx, Nueva York, Estados Unidos',
		headline: 'Director y actor estadounidense cuya filmografía popular atravesó la comedia, la aventura, el romance y el drama sin repetirse.',
		spotlight: 'Su talento estuvo en encontrar el tono justo para cada historia y hacer que el oficio desapareciera detrás de personajes inolvidables.',
		legacyFocus: 'la comedia, el drama y el cine popular estadounidense de géneros diversos',
		legacyDetail: 'This Is Spinal Tap, Stand by Me y La princesa prometida condensan una década de enorme inventiva; sus títulos posteriores conservaron el interés por los vínculos y el trabajo de elenco.',
		editorialBiography: [
			'Rob Reiner pasó de la actuación televisiva a una racha como director difícil de encasillar. This Is Spinal Tap inventó una sátira musical de precisión absurda; Stand by Me encontró melancolía en una aventura adolescente; La princesa prometida mezcló romance, humor y fantasía sin tratar ninguno de esos tonos con distancia. La variedad era, justamente, su estilo.',
			'Reiner confiaba en el guion y en los intérpretes, y por eso sus películas parecen menos preocupadas por exhibir una firma que por encontrar la forma exacta de cada relato. Los seis títulos conectados recorren desde aquel período decisivo hasta comedias dramáticas tardías. Su legado está en esa versatilidad generosa: dirigir para que una historia popular conserve personalidad, ritmo y corazón.',
		],
		stats: [{ label: 'Pelis conectadas', value: '6' }, { label: 'Registro', value: 'Comedia y drama' }],
		awards: [],
		knownFor: ['this-is-spinal-tap-1984', 'stand-by-me-1986', 'la-princesa-prometida-1987'],
		sourceUrls: ['https://www.dga.org/craft/visualhistory/interviews/rob-reiner'],
	},
	{
		slug: 'darren-aronofsky', name: 'Darren Aronofsky', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Brooklyn, Nueva York, Estados Unidos',
		headline: 'Director estadounidense atraído por personajes que llevan una obsesión física, espiritual o artística hasta el límite.',
		spotlight: 'Su cámara se pega a cuerpos y mentes en crisis para transformar la ambición, la fe y la culpa en experiencias sensoriales.',
		legacyFocus: 'el drama psicológico y un cine de intensidad formal centrado en la obsesión',
		legacyDetail: 'Pi y Réquiem por un sueño instalaron su pulso fragmentario; La fuente de la vida, Noé y The Whale desplazaron esa intensidad hacia el amor, la fe, la escala épica y el encierro.',
		editorialBiography: [
			'Darren Aronofsky debutó con Pi, una película pequeña y febril donde el cálculo se vuelve delirio. Réquiem por un sueño llevó ese montaje nervioso al terreno de la adicción y fijó una forma de entrar en la percepción de personajes consumidos por su deseo. Desde entonces, su cine persigue obsesiones más que géneros.',
			'La fuente de la vida y Noé muestran su ambición por trabajar mitos, fe e imágenes de gran escala; The Whale concentra el drama en una habitación y en un cuerpo observado sin descanso. Aronofsky puede ser excesivo porque busca experiencias extremas, no equilibrios tranquilizadores. En cada etapa pregunta cuánto está dispuesto a sacrificar alguien para sostener aquello que cree necesitar.',
		],
		stats: [{ label: 'Pelis conectadas', value: '5' }, { label: 'Pulso', value: 'Obsesión e intensidad' }],
		awards: [],
		knownFor: ['pi-fe-en-el-caos-1998', 'requiem-por-un-sueno-2000', 'la-fuente-de-la-vida-2006', 'the-whale-2022'],
		sourceUrls: ['https://www.dga.org/craft/dgaq/issues/1304-fall-2013/darren-aronofsky', 'https://www.bfi.org.uk/interviews/darren-aronofsky-whale-no-ones-seen-this-side-brendan'],
	},
	{
		slug: 'john-carpenter', name: 'John Carpenter', roles: ['Director', 'Guionista', 'Compositor'],
		birthPlace: 'Carthage, Nueva York, Estados Unidos',
		headline: 'Maestro del género que unió economía narrativa, encuadres precisos y música electrónica para renovar el terror y la ciencia ficción.',
		spotlight: 'Filma espacios sitiados y amenazas sin explicación con una claridad clásica que vuelve inolvidable hasta el movimiento más simple.',
		legacyFocus: 'el terror, la ciencia ficción, la acción y la composición musical para cine',
		legacyDetail: 'Halloween y La cosa cambiaron dos zonas del terror; Escape from New York, Golpe en la pequeña China y Están vivos exhiben su humor seco, su política y su amor por el cine de género.',
		editorialBiography: [
			'John Carpenter hizo de la precisión una forma de tensión. Halloween convierte calles y habitaciones comunes en un mapa de amenaza; La cosa encierra a un grupo en la paranoia de no saber quién sigue siendo humano. Sus planos anchos, el montaje paciente y las bandas sonoras que él mismo compuso prueban que el miedo puede nacer de recursos muy concretos.',
			'Escape from New York, Golpe en la pequeña China y Están vivos revelan otra cara: aventura, sátira y una desconfianza persistente hacia el poder. Carpenter trabaja con héroes cansados, comunidades sitiadas y monstruos que también son sistemas. Su cine parece directo, incluso modesto, pero debajo de esa superficie hay una puesta rigurosa que marcó a generaciones de realizadores.',
		],
		stats: [{ label: 'Pelis conectadas', value: '5' }, { label: 'Marca', value: 'Terror y synths' }],
		awards: [],
		knownFor: ['halloween-1978', '1997-rescate-en-nueva-york-1981', 'la-cosa-el-enigma-de-otro-mundo-1982', 'estan-vivos-1988'],
		sourceUrls: ['https://www.bfi.org.uk/sight-and-sound/interviews/john-carpenter-dark-star-assault-precinct-13'],
	},
	{
		slug: 'jonathan-demme', name: 'Jonathan Demme', roles: ['Director', 'Productor'],
		birthPlace: 'Baldwin, Nueva York, Estados Unidos',
		headline: 'Director estadounidense de mirada cálida y curiosa, capaz de pasar del thriller al melodrama y del concierto al retrato íntimo.',
		spotlight: 'Su cámara se acerca a los rostros con una empatía frontal que vuelve cada conversación intensa, extraña y profundamente humana.',
		legacyFocus: 'el thriller, el drama, la comedia y el documental musical',
		legacyDetail: 'Stop Making Sense reinventó el concierto filmado; The Silence of the Lambs y Filadelfia llevaron su atención por los rostros a relatos de enorme alcance, mientras La boda de Rachel recuperó una intimidad más áspera.',
		editorialBiography: [
			'Jonathan Demme tenía una curiosidad que atravesaba géneros. En Stop Making Sense observa cómo una banda y un escenario se construyen canción a canción. The Silence of the Lambs usa miradas directas a cámara para volver físico el vínculo entre Clarice y Lecter; Filadelfia lleva esa cercanía a un drama sobre discriminación, enfermedad y dignidad.',
			'La boda de Rachel y Ricki muestran cuánto le interesaban las familias imperfectas, la música y los momentos en que una celebración deja escapar un conflicto viejo. Demme no borraba la oscuridad de sus historias, pero buscaba a las personas dentro del mecanismo. Esa combinación de tensión, ritmo y empatía explica la amplitud de una filmografía que nunca quedó encerrada en su mayor éxito.',
		],
		stats: [{ label: 'Pelis conectadas', value: '5' }, { label: 'Rasgo', value: 'Empatía frontal' }],
		awards: [{ label: 'Oscar', category: 'Mejor dirección', work: 'The Silence of the Lambs', year: 1992 }],
		knownFor: ['stop-making-sense-1984', 'the-silence-of-the-lambs-1991', 'filadelfia-1993', 'la-boda-de-rachel-2008'],
		sourceUrls: ['https://www.dga.org/events/2018/jan2018/celebration_of_jonathandemme', 'https://www.oscars.org/oscars/ceremonies/1992'],
	},
	{
		slug: 'michael-mann', name: 'Michael Mann', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Chicago, Illinois, Estados Unidos',
		headline: 'Director estadounidense que convirtió el profesionalismo, la ciudad nocturna y el conflicto entre códigos personales en cine de alto voltaje.',
		spotlight: 'Sus personajes se definen por lo que saben hacer y por el precio que pagan cuando ese oficio ocupa toda su vida.',
		legacyFocus: 'el policial, el drama histórico y una investigación visual del trabajo profesional',
		legacyDetail: 'El último mohicano, Fuego contra fuego, El informante, Ali y Enemigos públicos llevan su rigor desde la frontera y el boxeo hasta el delito urbano y las estructuras corporativas.',
		editorialBiography: [
			'Michael Mann filma a personas que dominan un oficio y descubren que esa competencia no alcanza para ordenar la vida. Fuego contra fuego enfrenta a policía y ladrón como profesionales reflejados; El informante transforma procedimientos legales y periodísticos en una batalla moral. La precisión técnica nunca es decorativa: revela carácter, jerarquía y obsesión.',
			'El último mohicano, Ali y Enemigos públicos trasladan esa mirada a épocas y escalas distintas. Mann investiga armas, ciudades, instituciones y movimientos físicos porque necesita que el mundo tenga peso antes de estilizarlo. Sus noches digitales, su música y su arquitectura urbana son inconfundibles, pero el centro sigue siendo humano: hombres decididos que entienden demasiado tarde cuánto dejaron afuera de su código.',
		],
		stats: [{ label: 'Pelis conectadas', value: '5' }, { label: 'Marca', value: 'Oficio y ciudad' }],
		awards: [],
		knownFor: ['el-ultimo-mohicano-1992', 'fuego-contra-fuego-1995', 'el-informante-1999', 'ali-2001'],
		sourceUrls: ['https://www.dga.org/Craft/VisualHistory/Interviews/Michael-Mann', 'https://www.bfi.org.uk/features/where-begin-with-michael-mann'],
	},
	{
		slug: 'wes-anderson', name: 'Wes Anderson', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Houston, Texas, Estados Unidos',
		headline: 'Autor de mundos minuciosos donde la simetría, el color y el humor seco protegen a personajes heridos por la pérdida.',
		spotlight: 'Detrás de cada maqueta perfecta y cada movimiento calculado aparece una familia improvisada que todavía intenta aprender a quererse.',
		legacyFocus: 'la comedia, la animación y una puesta visual artesanal de identidad inmediata',
		legacyDetail: 'Life Aquatic y The Grand Budapest Hotel despliegan sus comunidades excéntricas en acción real; Fantástico Sr. Fox e Isla de perros trasladan esa sensibilidad al stop motion.',
		editorialBiography: [
			'Wes Anderson construyó una gramática reconocible con encuadres frontales, movimientos laterales, paletas precisas y objetos que parecen guardar una historia. Life Aquatic y The Grand Budapest Hotel muestran que ese control visual no elimina el caos: lo organiza para hablar de duelo, lealtad, fracaso y comunidades armadas por elección.',
			'Fantástico Sr. Fox e Isla de perros llevan su obsesión artesanal al stop motion, donde cada textura vuelve visible el trabajo manual. El humor seco convive con estallidos de aventura y una melancolía persistente. Anderson no filma casas de muñecas vacías; usa el artificio para acercarse a personajes que esconden su vulnerabilidad detrás de rituales, uniformes y planes demasiado prolijos.',
		],
		stats: [{ label: 'Pelis conectadas', value: '4' }, { label: 'Marca', value: 'Precisión artesanal' }],
		awards: [{ label: 'Oscar', category: 'Mejor cortometraje de acción real', work: 'The Wonderful Story of Henry Sugar', year: 2024 }],
		knownFor: ['life-aquatic-2004', 'fantastico-sr-fox-2009', 'the-grand-budapest-hotel-2014', 'isla-de-perros-2018'],
		sourceUrls: ['https://www.bfi.org.uk/sight-and-sound/interviews/into-lions-den-wes-anderson-phoenician-scheme', 'https://www.oscars.org/oscars/ceremonies/2024'],
	},
	{
		slug: 'ang-lee', name: 'Ang Lee', roles: ['Director', 'Productor'],
		birthPlace: 'Chaozhou, Pingtung, Taiwán',
		headline: 'Director taiwanés de versatilidad excepcional, atento a los deseos que chocan con la familia, la tradición y las reglas de cada género.',
		spotlight: 'Puede cambiar de época, idioma o escala sin perder una sensibilidad precisa para aquello que un personaje no se anima a decir.',
		legacyFocus: 'el drama íntimo, el cine de época, las artes marciales y la experimentación tecnológica',
		legacyDetail: 'Sentido y sensibilidad, Tigre y dragón, Hulk y Secreto en la montaña trazan un recorrido entre literatura, wuxia, superhéroes y romance contenido.',
		editorialBiography: [
			'Ang Lee hizo de la adaptación una forma de libertad. Sentido y sensibilidad conserva la observación social de Jane Austen y encuentra emoción en lo que sus personajes callan. Tigre y dragón convierte el movimiento de las artes marciales en deseo, disciplina y tragedia. En ambos casos, el espectáculo nace de conflictos íntimos.',
			'Hulk muestra su voluntad de experimentar incluso dentro del cine de superhéroes; Secreto en la montaña vuelve al paisaje una medida del tiempo perdido y del amor reprimido. Lee cambia de cultura y de género sin tratar ninguna tradición como disfraz. Su hilo conductor es la atención a personas divididas entre lo que sienten y el papel que el mundo les exige cumplir.',
		],
		stats: [{ label: 'Pelis conectadas', value: '4' }, { label: 'Rasgo', value: 'Versatilidad cultural' }],
		awards: [
			{ label: 'Oscar', category: 'Mejor dirección', work: 'Brokeback Mountain', year: 2006 },
			{ label: 'Oscar', category: 'Mejor dirección', work: 'Life of Pi', year: 2013 },
		],
		knownFor: ['sentido-y-sensibilidad-1995', 'tigre-y-dragon-2000', 'hulk-2003', 'secreto-en-la-montana-2005'],
		sourceUrls: ['https://www.oscars.org/oscars/ceremonies/2006', 'https://www.oscars.org/oscars/ceremonies/2013'],
	},
	{
		slug: 'alfonso-cuaron', name: 'Alfonso Cuarón', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Ciudad de México, México',
		headline: 'Director mexicano que combina virtuosismo técnico, emoción y una conciencia muy concreta del espacio social que rodea a sus personajes.',
		spotlight: 'Sus planos largos no son una exhibición: hacen que el peligro, el movimiento y la intimidad sucedan delante del espectador sin escapatoria.',
		legacyFocus: 'el drama, la ciencia ficción y una puesta de gran complejidad visual',
		legacyDetail: 'Harry Potter y el prisionero de Azkaban renovó una franquicia; Hijos de los hombres y Gravedad llevaron su dominio del espacio y la continuidad hacia futuros amenazantes y experiencias físicas extremas.',
		editorialBiography: [
			'Alfonso Cuarón transformó Harry Potter y el prisionero de Azkaban al darle clima, movimiento y una adolescencia más tangible. En Hijos de los hombres, la cámara acompaña un futuro quebrado con planos extensos que no permiten tomar distancia del peligro. La técnica está al servicio de una sensación: compartir el espacio con los personajes.',
			'Gravedad llevó esa búsqueda a la órbita y convirtió la supervivencia en una experiencia de orientación, sonido y respiración. Cuarón puede trabajar dentro de una franquicia o empujar una producción original de enorme escala sin perder intimidad. Su cine une precisión y emoción porque entiende que una proeza visual sólo importa cuando modifica la forma en que percibimos a alguien.',
		],
		stats: [{ label: 'Pelis conectadas', value: '3' }, { label: 'Marca', value: 'Inmersión visual' }],
		awards: [
			{ label: 'Oscar', category: 'Mejor dirección', work: 'Gravity', year: 2014 },
			{ label: 'Oscar', category: 'Mejor dirección', work: 'Roma', year: 2019 },
		],
		knownFor: ['harry-potter-and-the-prisoner-of-azkaban-2004', 'hijos-de-los-hombres-2006', 'gravedad-2013'],
		sourceUrls: ['https://www.oscars.org/oscars/ceremonies/2014', 'https://www.oscars.org/oscars/ceremonies/2019'],
	},
	{
		slug: 'alejandro-gonzalez-inarritu', name: 'Alejandro González Iñárritu', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Ciudad de México, México',
		headline: 'Director mexicano de relatos intensos sobre culpa, azar, supervivencia y la necesidad humana de encontrar conexión.',
		spotlight: 'Su cine lleva cuerpos, vínculos y equipos técnicos a situaciones límite para buscar una emoción de escala casi física.',
		legacyFocus: 'el drama coral, la experimentación formal y producciones de gran exigencia física',
		legacyDetail: 'Amores perros y 21 gramos enlazaron vidas quebradas mediante estructuras fragmentadas; Birdman y El renacido cambiaron el dispositivo sin abandonar la obsesión por el ego, el dolor y la supervivencia.',
		editorialBiography: [
			'Alejandro González Iñárritu debutó con Amores perros, donde un accidente conecta vidas atravesadas por deseo, violencia y desigualdad en Ciudad de México. 21 gramos retomó la estructura fragmentada y la llevó a otro paisaje emocional. En ambas, el montaje desordena el tiempo para acercarse a personajes que intentan vivir después de una ruptura.',
			'Birdman convierte el teatro y el ego artístico en un flujo nervioso; El renacido cambia hacia la intemperie, el frío y una supervivencia filmada como prueba física. Iñárritu trabaja con dispositivos ambiciosos, pero no para ocultar el drama. Busca que la forma exprese el estado de sus protagonistas y que cada colaboración técnica empuje una experiencia sensorial compartida.',
		],
		stats: [{ label: 'Pelis conectadas', value: '4' }, { label: 'Pulso', value: 'Intensidad física' }],
		awards: [
			{ label: 'Oscar', category: 'Mejor dirección', work: 'Birdman', year: 2015 },
			{ label: 'Oscar', category: 'Mejor dirección', work: 'The Revenant', year: 2016 },
		],
		knownFor: ['amores-perros-2000', '21-gramos-2003', 'birdman-or-the-unexpected-virtue-of-ignorance-2014', 'el-renacido-2015'],
		sourceUrls: ['https://www.dga.org/craft/dgaq/issues/1901-winter-2019/dga-interview-alejandro-gonzalez-inarritu', 'https://www.oscars.org/oscars/ceremonies/2015', 'https://www.oscars.org/oscars/ceremonies/2016'],
	},
	{
		slug: 'kathryn-bigelow', name: 'Kathryn Bigelow', roles: ['Directora', 'Productora'],
		birthPlace: 'San Carlos, California, Estados Unidos',
		headline: 'Directora estadounidense que usa el cine de acción para examinar poder, violencia, adicción al riesgo y sistemas bajo presión.',
		spotlight: 'Su puesta combina impacto físico y observación fría: primero hace sentir el peligro y después obliga a pensar qué produce en quienes lo atraviesan.',
		legacyFocus: 'el cine de acción, el thriller y los relatos de instituciones en conflicto',
		legacyDetail: 'Días extraños y K-19 trasladan tensiones políticas a mundos de alto riesgo; The Hurt Locker concentra esa búsqueda en soldados para quienes el peligro también se vuelve dependencia.',
		editorialBiography: [
			'Kathryn Bigelow trabaja la acción como una experiencia física y una pregunta moral. Días extraños mezcla tecnología, racismo y deseo en una ciudad al borde del estallido; K-19 encierra la autoridad y el miedo dentro de un submarino nuclear. La tensión nace tanto del peligro inmediato como de las estructuras que empujan a los personajes hacia él.',
			'The Hurt Locker depura esa búsqueda alrededor de un artificiero que parece sentirse más vivo frente a una bomba que lejos de la guerra. Bigelow filma con energía, pero nunca confunde velocidad con simple celebración. Su cine observa cuerpos entrenados, decisiones irreversibles y ambientes masculinos para entender cómo el poder y la violencia transforman a quienes creen controlarlos.',
		],
		stats: [{ label: 'Pelis conectadas', value: '3' }, { label: 'Marca', value: 'Acción bajo presión' }],
		awards: [{ label: 'Oscar', category: 'Mejor dirección', work: 'The Hurt Locker', year: 2010 }],
		knownFor: ['dias-extranos-1995', 'k-19-the-widowmaker-2002', 'the-hurt-locker-2008'],
		sourceUrls: ['https://www.dga.org/events/2009/09-september-2009/director-qas-in-los-angeles-new-york', 'https://www.oscars.org/oscars/ceremonies/2010'],
	},
	{
		slug: 'spike-lee', name: 'Spike Lee', roles: ['Director', 'Guionista', 'Productor', 'Actor'],
		birthPlace: 'Atlanta, Georgia, Estados Unidos',
		headline: 'Director, guionista, productor y actor que hizo del cine una conversación urgente sobre raza, ciudad, historia y cultura popular.',
		spotlight: 'Su energía visual y política no busca neutralidad: pone ideas, música y cuerpos en movimiento para discutir quién puede contar una comunidad.',
		legacyFocus: 'el cine político, la cultura afroestadounidense y la experimentación dentro de formas populares',
		legacyDetail: 'Do the Right Thing y Malcolm X articulan comunidad, memoria y conflicto racial; Plan oculto demuestra cómo esa mirada también puede tensar un policial de estudio.',
		editorialBiography: [
			'Spike Lee convirtió Brooklyn en escenario, argumento y comunidad cinematográfica. Do the Right Thing acumula calor, música, humor y resentimiento hasta que una cuadra revela tensiones raciales que nadie puede contener. Malcolm X expande esa mirada hacia la biografía histórica sin quitarle contradicción, energía ni una posición política definida.',
			'Plan oculto prueba que también puede apropiarse de un thriller de gran estudio y volverlo una discusión sobre dinero, memoria y poder. Lee aparece, escribe, produce, enseña y dirige con una voluntad sostenida de intervenir en el presente. Su cine no pide permiso para ser enfático: usa color, montaje y movimiento para que la conversación continúe fuera de la pantalla.',
		],
		stats: [{ label: 'Pelis conectadas', value: '3' }, { label: 'Pulso', value: 'Cine e intervención' }],
		awards: [{ label: 'DGA', category: 'Premio a la trayectoria en dirección', year: 2022 }],
		knownFor: ['do-the-right-thing-1989', 'malcolm-x-1992', 'plan-oculto-2006'],
		sourceUrls: ['https://www.dga.org/news/pressreleases/2022/012219_spike_lee_dga_lifetime_achievement_award', 'https://www.dga.org/craft/dgaq/issues/0801-spring-2008/dga-interview-spike-lee'],
	},
	{
		slug: 'sergio-leone', name: 'Sergio Leone', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Roma, Italia',
		headline: 'Director italiano que convirtió el western en una ópera de miradas, silencios, violencia y tiempo suspendido.',
		spotlight: 'Sus primeros planos extremos y sus paisajes enormes hacen que cada duelo parezca tanto un espectáculo como el final de un mundo.',
		legacyFocus: 'el western europeo, el cine épico y una puesta construida junto a la música',
		legacyDetail: 'El bueno, el feo y el malo y Hasta que llegó su hora llevaron el western hacia una escala operística; Érase una vez en América trasladó esa memoria amarga al relato criminal.',
		editorialBiography: [
			'Sergio Leone reinventó el western desde Europa al estirar el tiempo hasta volver cada espera insoportable. El bueno, el feo y el malo enfrenta rostros enormes con paisajes abiertos, humor cruel y la música de Ennio Morricone. Hasta que llegó su hora lleva esa lógica a una elegía donde el ferrocarril anuncia progreso y también destrucción.',
			'Érase una vez en América cambió el desierto por la memoria de un grupo de gánsteres y conservó el gusto por los rituales, las traiciones y los relatos que se vuelven mito. Leone no imitó el western clásico: lo desarmó y lo devolvió más lento, sucio y grandioso. Su influencia persiste en cualquier cineasta que entienda un duelo como coreografía de tiempo, sonido y mirada.',
		],
		stats: [{ label: 'Pelis conectadas', value: '3' }, { label: 'Marca', value: 'Western operístico' }],
		awards: [],
		knownFor: ['el-bueno-el-feo-y-el-malo-1966', 'hasta-que-llego-su-hora-1968', 'erase-una-vez-en-america-1984'],
		sourceUrls: ['https://www.bfi.org.uk/features/fistful-dynamite-duck-you-sucker-sergio-leone', 'https://www.bfi.org.uk/film/f3d8c1dc-2761-5fdc-ab54-9b054daec0ee/once-upon-a-time-in-the-west'],
	},
	{
		slug: 'pedro-almodovar', name: 'Pedro Almodóvar', roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Calzada de Calatrava, Ciudad Real, España',
		headline: 'Director español que hizo del melodrama, el deseo y la reinvención personal un universo de color, humor y emociones indóciles.',
		spotlight: 'Sus películas abrazan el artificio para llegar a verdades íntimas sobre cuerpos, secretos, cuidados y familias elegidas.',
		legacyFocus: 'el melodrama, la comedia y una autoría ligada a la cultura española posterior al franquismo',
		legacyDetail: 'La piel que habito lleva su interés por identidad y deseo hacia el thriller; La habitación de al lado y Amarga Navidad conectan etapas recientes de una obra que sigue cambiando de tono y escala.',
		editorialBiography: [
			'Pedro Almodóvar surgió junto a la efervescencia cultural de la Movida madrileña y convirtió esa libertad en una filmografía donde deseo, humor y dolor nunca se ordenan del todo. Sus personajes inventan familias, atraviesan secretos y buscan una identidad posible entre colores intensos, canciones, cuerpos y relatos que saben que están hechos de cine.',
			'La piel que habito empuja esas obsesiones hacia un thriller de control, transformación y venganza. La habitación de al lado y Amarga Navidad muestran una etapa tardía atenta al duelo y al cuidado sin abandonar el artificio. Almodóvar domina el melodrama porque no lo mira desde arriba: acepta su exceso y encuentra dentro de él emociones, contradicciones y una ética de los afectos.',
		],
		stats: [{ label: 'Pelis conectadas', value: '3' }, { label: 'Marca', value: 'Melodrama y deseo' }],
		awards: [{ label: 'Oscar', category: 'Mejor guion original', work: 'Hable con ella', year: 2003 }],
		knownFor: ['la-piel-que-habito-2011', 'la-habitacion-de-al-lado-2024', 'amarga-navidad-2026'],
		sourceUrls: ['https://www.festival-cannes.com/en/p/pedro-almodovar/', 'https://www.oscars.org/oscars/ceremonies/2003'],
	},
];

export const famousDirectorProfilesWave19: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildProfile(seed)]),
);
