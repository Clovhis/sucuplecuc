import type { PersonProfileRecord, PersonRecord } from '../types/person';
import peopleCatalog from './people.json' with { type: 'json' };

type LotrProfileSeed = Pick<
	PersonProfileRecord,
	| 'slug'
	| 'name'
	| 'headline'
	| 'roles'
	| 'birthPlace'
	| 'spotlight'
	| 'biography'
	| 'editorialBiography'
	| 'stats'
	| 'awards'
	| 'knownFor'
> & {
	sourceUrls: string[];
};

const people = peopleCatalog as Record<string, PersonRecord>;

function optimizeProfileImage(person: PersonRecord): string {
	if (!person.remoteImageUrl) return person.image ?? '';
	return person.remoteImageUrl.replace(/([?&]width=)\d+/u, '$1640');
}

function buildLotrProfile(seed: LotrProfileSeed): PersonProfileRecord {
	const person = people[seed.name];
	if (!person?.image) throw new Error(`Falta el registro factual o el retrato local de ${seed.name}.`);

	return {
		...seed,
		profileImage: optimizeProfileImage(person),
		editorialStatus: 'approved',
		referenceUrls: Array.from(new Set([...(person.referenceUrls ?? []), ...seed.sourceUrls])),
	};
}

const lotrProfileSeeds: LotrProfileSeed[] = [
	{
		slug: 'sean-astin',
		name: 'Sean Astin',
		roles: ['Actor', 'Director', 'Productor'],
		birthPlace: 'Santa Mónica, California, Estados Unidos',
		headline: 'Actor estadounidense de calidez y tenacidad muy reconocible, capaz de volver heroico a un personaje sin quitarle humanidad.',
		spotlight: 'Astin encuentra la emoción en la lealtad y la perseverancia: sus personajes no necesitan imponerse para terminar sosteniendo el centro de la historia.',
		biography: [
			'Sean Astin empezó a trabajar frente a cámara siendo muy joven y pronto quedó asociado a personajes que convierten la aventura en una experiencia emocional. En Los Goonies fue Mikey Walsh, el chico que impulsa a un grupo de amigos a seguir una pista imposible cuando el barrio y la infancia parecen estar por desaparecer. Más tarde, Rudy lo colocó en otro tipo de relato de superación: el de un joven que persiste en el fútbol universitario pese a no encajar en la medida física ni en las expectativas de su entorno. Esos papeles no explican toda su carrera, pero sí fijaron una cualidad que vuelve a aparecer en su trabajo: Astin sabe hacer creíble el esfuerzo sin presentar a sus personajes como santos o estatuas motivacionales.',
			'La trilogía de El señor de los anillos llevó esa cualidad a una escala mundial. Como Samwise Gamgee, Astin acompaña a Frodo desde la amistad, el cansancio y una decisión práctica de no abandonarlo. La película necesita que la fantasía sea enorme, pero también que alguien cargue con el miedo, la comida, el cuerpo exhausto y el regreso a casa; Sam le da esa medida concreta al viaje. Su interpretación recibió reconocimientos de conjunto y un Saturn por El retorno del rey, pero la vigencia del personaje no depende sólo de los premios. Funciona porque el actor evita convertir la nobleza en discurso: la expresa en acciones pequeñas, en la terquedad y en una vulnerabilidad que no pierde humor.',
			'Además de actuar, Astin dirigió, produjo y trabajó en televisión, doblaje y teatro. Esa amplitud evita que su figura quede reducida a una sola franquicia y muestra un interés sostenido por distintos modos de contar historias. Su recorrido público también tomó una dimensión institucional cuando fue elegido presidente de SAG-AFTRA en 2025, después de años de participación gremial. En el catálogo, Los Goonies, Como si fuera la primera vez y la trilogía de Jackson muestran registros muy distintos: el líder infantil de aventura, la comedia popular y el compañero que vuelve épica una tarea cotidiana. El hilo común no es la grandilocuencia, sino una energía franca que hace que el espectador quiera seguir a sus personajes. Esa continuidad también explica por qué se lo convoca para relatos familiares, voces de animación y proyectos donde la empatía debe sostenerse durante muchos años: no trabaja la cercanía como una pose, sino como una respuesta concreta al conflicto que el personaje tiene delante. En ese sentido, su carrera ofrece una imagen poco ruidosa del oficio: avanzar entre formatos, escuchar a los compañeros y convertir el afecto en una fuerza narrativa que no necesita exhibirse para hacerse sentir.',
		],
		editorialBiography: [
			'Sean Astin convirtió la tenacidad en una de sus mejores herramientas. Los Goonies y Rudy ya mostraban su capacidad para hacer que la aventura o la superación tengan un costo humano; como Samwise Gamgee encontró el papel que condensó esa sensibilidad. En la trilogía, no juega la lealtad como una frase heroica: la vuelve cansancio, humor y una decisión concreta de no dejar solo a Frodo.',
			'Su trayectoria también incluye dirección, producción, doblaje y teatro, y en 2025 fue elegido presidente de SAG-AFTRA. En el catálogo, Los Goonies, Como si fuera la primera vez y las tres entregas de El señor de los anillos dibujan un actor de presencia cálida, muy eficaz cuando una historia necesita que alguien sostenga su corazón sin reclamar el centro de la escena.',
		],
		stats: [
			{ label: 'Personaje clave', value: 'Samwise Gamgee' },
			{ label: 'Oficio', value: 'Actor, director y productor' },
			{ label: 'Trayectoria gremial', value: 'Presidente de SAG-AFTRA desde 2025' },
		],
		awards: [{ label: 'Saturn Award', category: 'Mejor actor de reparto', work: 'The Lord of the Rings: The Return of the King', year: 2004 }],
		knownFor: ['los-goonies-1985', 'the-lord-of-the-rings-the-fellowship-of-the-ring-2001', 'the-lord-of-the-rings-the-return-of-the-king-2003'],
		sourceUrls: ['https://www.seanastin.com/biography', 'https://www.sagaftra.org/sean-astin-0'],
	},
	{
		slug: 'karl-urban',
		name: 'Karl Urban',
		roles: ['Actor'],
		birthPlace: 'Wellington, Nueva Zelanda',
		headline: 'Actor neozelandés de presencia física y precisión seca, muy sólido para la aventura, la ciencia ficción y el cine de acción.',
		spotlight: 'Urban puede entrar a una franquicia grande sin quedar reducido al uniforme: encuentra el humor, el cansancio y la lealtad que vuelven singular a cada personaje.',
		biography: [
			'Karl Urban construyó primero una carrera en Nueva Zelanda antes de convertirse en una presencia habitual del cine comercial internacional. Su recorrido combina personajes de acción, ciencia ficción, fantasía y thriller, pero no se apoya sólo en la imagen de dureza. Urban suele trabajar con una energía directa, de frases cortas y mirada atenta, que permite que un soldado, un policía o un aventurero parezcan estar pensando incluso en medio de una escena de combate. Esa cualidad le dio continuidad entre producciones de escalas muy distintas: puede pasar de una película neozelandesa a una superproducción sin que el cambio de tamaño borre el carácter del personaje.',
			'En Las dos torres y El retorno del rey interpreta a Éomer, guerrero de Rohan que llega a la historia cargando desconfianza, duelo y responsabilidad política. Urban no convierte al personaje en una simple figura de batalla: lo hace reaccionar a un reino debilitado, a la expulsión de su familia y a la necesidad de elegir aliados cuando todo parece perdido. Esa mezcla de autoridad y afecto explica por qué Éomer queda instalado aun dentro de un elenco enorme. El papel también abrió una serie de trabajos internacionales que incluyen La supremacía de Bourne, Star Trek, Dredd, Thor: Ragnarok y The Boys, siempre con una disposición particular para el género y para los personajes que deben sostener una ética bajo presión.',
			'La relación de Urban con las franquicias tiene algo más que eficacia física. Como Leonard McCoy en Star Trek, Judge Dredd o Billy Butcher en The Boys, encuentra lugar para una ironía seca que evita que la acción se vuelva mecánica. Su agencia también registra reconocimientos de conjunto por El retorno del rey, incluida la distinción del sindicato de actores, y su filmografía conserva vínculos con producciones neozelandesas aun después de la proyección global. En Cine Posta, Éomer dialoga con Kirill de La supremacía de Bourne y con el Johnny Cage de Mortal Kombat II: tres entradas distintas a un actor que entiende el espectáculo popular como un trabajo de carácter, ritmo y presencia. Esa variedad no borra una base común: Urban sabe usar el cuerpo para indicar peligro o experiencia, pero deja que una réplica breve, una reacción de compañero o un cambio en la mirada completen el temperamento del personaje. Su mejor versión no busca imponerse por volumen; administra información y deja que el contexto haga visible por qué sus hombres de acción tienen lealtades, pérdidas o una broma seca justo antes de pelear.',
		],
		editorialBiography: [
			'Karl Urban le dio a Éomer una autoridad que no depende sólo de la espada. En Las dos torres y El retorno del rey, el guerrero de Rohan carga duelo, desconfianza y deber político; Urban encuentra ahí una mezcla de fuerza y sensibilidad que lo vuelve memorable dentro de un elenco gigantesco. No es una aparición decorativa: ayuda a que la guerra tenga consecuencias humanas.',
			'Desde La supremacía de Bourne hasta Star Trek, Dredd, Thor: Ragnarok y The Boys, Urban se volvió una figura muy confiable del cine y la televisión de género. Su registro combina físico, humor seco y una atención concreta al personaje. Esa capacidad para entrar a una franquicia sin perder identidad explica por qué Éomer sigue siendo uno de sus papeles más queridos.',
		],
		stats: [
			{ label: 'Origen', value: 'Nueva Zelanda' },
			{ label: 'Personaje clave', value: 'Éomer' },
			{ label: 'Registro', value: 'Acción, ciencia ficción y fantasía' },
		],
		awards: [{ label: 'Screen Actors Guild Award', category: 'Mejor elenco', work: 'The Lord of the Rings: The Return of the King', year: 2004 }],
		knownFor: ['the-lord-of-the-rings-the-two-towers-2002', 'the-lord-of-the-rings-the-return-of-the-king-2003', 'la-supremacia-de-bourne-2004', 'mortal-kombat-ii-2026'],
		sourceUrls: ['https://johnsonlaird.com/our-actors/Karl-Urban'],
	},
	{
		slug: 'liv-tyler',
		name: 'Liv Tyler',
		roles: ['Actriz'],
		birthPlace: 'Nueva York, Nueva York, Estados Unidos',
		headline: 'Actriz estadounidense de presencia serena y voz reconocible, capaz de aportar intimidad a relatos románticos, fantásticos y de gran escala.',
		spotlight: 'Tyler trabaja desde la quietud y la escucha: una mirada sostenida puede volver decisiva una escena aun cuando el personaje no necesita ocuparla por completo.',
		biography: [
			'Liv Tyler encontró desde sus primeros trabajos una manera de actuar que privilegia la observación y la cercanía antes que el gesto enfático. Su presencia puede ser delicada, pero nunca es pasiva: suele dejar que el personaje piense, dude o escuche antes de responder. Esa cualidad le permitió circular entre historias de iniciación, dramas románticos y grandes producciones sin perder una identidad propia. En la pantalla, Tyler tiene una voz suave y una calma que pueden parecer frágiles al comienzo, aunque muchas veces terminan siendo el punto de equilibrio de la escena. Más que imponer una energía exterior, construye personajes que hacen visible la tensión a través de lo que eligen reservarse.',
			'El papel de Arwen en El señor de los anillos hizo mundial esa forma de presencia. La elfa no aparece en todas las batallas ni necesita competir con la espectacularidad de la Tierra Media: su peso está en las decisiones afectivas y políticas que conectan a Aragorn con la memoria, el futuro y la posibilidad de una vida distinta. Tyler le da a esa dimensión una mezcla de serenidad y urgencia, especialmente en La comunidad del anillo y El retorno del rey. El personaje funciona porque la actriz no lo trata como una aparición etérea: lo sostiene desde el deseo, la pérdida y una voluntad que no necesita levantar la voz para modificar el rumbo de otros personajes.',
			'Después de esa saga, Tyler siguió explorando registros de drama y cine de estudio. En La esperanza vive en mí trabaja una historia atravesada por duelo y salud mental desde un lugar de escucha, mientras que The Incredible Hulk la conecta con el universo de superhéroes como Betty Ross, una figura afectiva central para Bruce Banner. Esas películas no piden la misma escala que Arwen, pero muestran la continuidad de una intérprete que puede dar espesor a una relación sin sobreexplicarla. En el catálogo, sus cuatro títulos permiten seguir una carrera donde la intimidad no es lo opuesto a lo espectacular: es la herramienta que hace que lo fantástico o lo heroico tengan algo en juego. Su trayectoria deja ver que la economía expresiva puede ser una forma de amplitud: conserva la misma atención al vínculo cuando una película es pequeña, cuando una escena es romántica y cuando el relato exige una dimensión mítica. Esa elección de no forzar el gesto también permite que el público complete lo que ocurre entre personajes; Tyler sugiere una historia compartida y confía en que una pausa, una voz o una despedida puedan contener más que una explicación directa.',
		],
		editorialBiography: [
			'Liv Tyler le dio a Arwen una presencia serena, pero nunca pasiva. En La comunidad del anillo y El retorno del rey, su personaje concentra afecto, memoria y una decisión que cambia el destino de Aragorn. Tyler evita volverla una figura etérea: trabaja la quietud como una forma de voluntad y consigue que cada aparición tenga un peso emocional muy concreto.',
			'La esperanza vive en mí y The Incredible Hulk muestran otros registros de su carrera, más íntimos pero igualmente atentos a los vínculos. Tyler tiene una manera de escuchar en pantalla que vuelve decisiva una mirada o una pausa. Esa economía hace que pueda habitar un drama de duelo, una fantasía épica o una superproducción sin perder humanidad.',
		],
		stats: [
			{ label: 'Personaje clave', value: 'Arwen' },
			{ label: 'Registro', value: 'Drama, romance y fantasía' },
			{ label: 'Marca', value: 'Presencia íntima y serena' },
		],
		awards: [],
		knownFor: ['the-lord-of-the-rings-the-fellowship-of-the-ring-2001', 'the-lord-of-the-rings-the-return-of-the-king-2003', 'reign-over-me-2007', 'the-incredible-hulk-2008'],
		sourceUrls: ['https://www.marvel.com/articles/movies/the-incredible-hulk-disney-plus-now-streaming', 'https://www.marvel.com/watch/trailers-and-extras/mu-video-background'],
	},
];

export const requestedLotrPersonProfilesWave16: Record<string, PersonProfileRecord> = Object.fromEntries(
	lotrProfileSeeds.map((seed) => [seed.slug, buildLotrProfile(seed)]),
) as Record<string, PersonProfileRecord>;
