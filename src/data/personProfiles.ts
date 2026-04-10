import type { PersonProfileRecord } from '../types/person';

export const personProfiles: Record<string, PersonProfileRecord> = {
	'brad-pitt': {
		slug: 'brad-pitt',
		name: 'Brad Pitt',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Brad%20Pitt%202019%20by%20Glenn%20Francis.jpg?width=640',
		headline:
			'Actor y productor que supo combinar carisma de estrella con proyectos de autor y un olfato muy fino para producir cine premiado.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Shawnee, Oklahoma, Estados Unidos',
		spotlight:
			'Arrancó como sex symbol noventoso, pero terminó armando una carrera mucho más amplia: thriller, comedia negra, cine bélico, prestige drama y producción pesada desde Plan B.',
		biography: [
			'William Bradley Pitt nació el 18 de diciembre de 1963 en Shawnee, Oklahoma, y creció en Springfield, Missouri. Después de estudiar periodismo en la Universidad de Missouri, dejó la carrera a muy poco de recibirse y se fue a Los Ángeles para probar suerte como actor.',
			'Su irrupción fuerte llegó a comienzos de los 90 con Thelma & Louise, y desde ahí se volvió una cara central del cine comercial. En paralelo fue armando una filmografía menos obvia, con títulos como Se7en, Fight Club, The Assassination of Jesse James by the Coward Robert Ford, Inglourious Basterds y Once Upon a Time in Hollywood.',
			'Como productor también construyó peso propio. A través de Plan B Entertainment impulsó películas como The Departed y 12 Years a Slave, dos títulos que terminaron ganando el Oscar a mejor película y consolidaron su perfil detrás de cámara.',
		],
		stats: [
			{ label: 'Oscar como actor', value: '2020' },
			{ label: 'Oscar como productor', value: '2014' },
			{ label: 'Pulso', value: 'Taquilla + autor' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Once Upon a Time in Hollywood', year: 2020 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: '12 Years a Slave', year: 2014 },
			{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: '12 Monkeys', year: 1996 },
			{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: 'Once Upon a Time in Hollywood', year: 2020 },
		],
		knownFor: [
			'fight-club-1999',
			'se7en-1995',
			'inglourious-basterds-2009',
			'once-upon-a-time-in-hollywood-2019',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Brad-Pitt',
			'https://www.oscars.org/oscars/ceremonies/2014',
			'https://www.oscars.org/oscars/ceremonies/2020',
			'https://www.goldenglobes.com/person/brad-pitt',
		],
	},
	'al-pacino': {
		slug: 'al-pacino',
		name: 'Al Pacino',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/ALPACINO%200234e%20(30401875260)%20(cropped).jpg?width=640',
		headline:
			'Uno de los rostros centrales del Nuevo Hollywood, capaz de pasar del gangster épico al policial neurótico sin perder intensidad.',
		roles: ['Actor'],
		birthPlace: 'East Harlem, Nueva York, Estados Unidos',
		spotlight:
			'Su modo de actuar mezcla vulnerabilidad, furia y una presencia eléctrica que lo volvió inconfundible durante más de cinco décadas.',
		biography: [
			'Alfredo James Pacino nació el 25 de abril de 1940 en Nueva York y se formó en la escena teatral antes de llegar al cine. La disciplina del Actors Studio y el peso de la escuela neoyorquina marcaron para siempre su forma de construir personajes.',
			'El salto masivo llegó con The Godfather, donde su Michael Corleone pasó de heredero reacio a figura trágica del crimen organizado. Después consolidó una carrera de enorme prestigio con títulos como Serpico, Dog Day Afternoon, Scarface, Heat y The Insider.',
			'Pacino se volvió un símbolo del actor total: puede ser explosivo, mínimo o teatral según el material, pero siempre deja una temperatura muy particular en pantalla. Incluso cuando el proyecto es irregular, su presencia suele ordenar la escena.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Huella', value: 'Nuevo Hollywood' },
			{ label: 'Pulso', value: 'Intensidad pura' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Scent of a Woman', year: 1993 },
		],
		knownFor: ['the-godfather-1972', 'the-godfather-part-ii-1974'],
		referenceUrls: [
			'https://www.britannica.com/biography/Al-Pacino',
			'https://www.oscars.org/oscars/ceremonies/1975',
			'https://www.oscars.org/oscars/ceremonies/1993',
		],
	},
	'leonardo-dicaprio': {
		slug: 'leonardo-dicaprio',
		name: 'Leonardo DiCaprio',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20DiCaprio%20-%20BFI%20Southbank%203%20(crop).jpg?width=640',
		headline:
			'De ídolo global noventoso a actor fetiche del cine de prestigio, siempre eligiendo proyectos grandes sin quedar preso de la comodidad.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Los Ángeles, California, Estados Unidos',
		spotlight:
			'Encontró un equilibrio rarísimo entre estrella de estudio, cuerpo de blockbuster y filmografía obsesionada con directores pesados.',
		biography: [
			'Leonardo DiCaprio nació el 11 de noviembre de 1974 en Los Ángeles y empezó a trabajar desde chico en televisión y publicidades. Muy rápido mostró algo más que fotogenia: una intensidad juvenil que lo distinguía incluso dentro del Hollywood industrial.',
			'Con Titanic se convirtió en un fenómeno global, pero en vez de repetir el molde buscó una carrera más ambiciosa. Ahí entran sus asociaciones con Martin Scorsese, Christopher Nolan y Quentin Tarantino, además de películas como Catch Me If You Can, The Departed, Inception, Django Unchained y Once Upon a Time in Hollywood.',
			'Su Oscar por The Revenant terminó de cerrar una narrativa que ya estaba instalada hacía años: la de un actor que nunca dejó de empujar hacia adelante y que suele elegir personajes al borde del derrumbe, la obsesión o la culpa.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Autor + taquilla' },
			{ label: 'Pulso', value: 'Riesgo constante' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'The Revenant', year: 2016 },
		],
		knownFor: ['titanic-1997', 'inception-2010', 'the-departed-2006', 'once-upon-a-time-in-hollywood-2019'],
		referenceUrls: [
			'https://www.britannica.com/biography/Leonardo-DiCaprio',
			'https://www.oscars.org/oscars/ceremonies/2005',
			'https://www.oscars.org/oscars/ceremonies/2016',
		],
	},
	'tom-hanks': {
		slug: 'tom-hanks',
		name: 'Tom Hanks',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Tom%20Hanks%20at%20the%20Elvis%20Premiere%202022.jpg?width=640',
		headline:
			'Figura bisagra entre la comedia popular de los 80 y el drama prestigioso de los 90, con una pantalla que transmite confianza al instante.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Concord, California, Estados Unidos',
		spotlight:
			'Pocos actores pueden ser tan masivos y a la vez tan efectivos para encarnar tipos comunes puestos ante situaciones extraordinarias.',
		biography: [
			'Tom Hanks nació el 9 de julio de 1956 en California y construyó primero una carrera de comedia con energía simpática y timing muy fino. Esa base le dio un oficio enorme antes de pasar a materiales más dramáticos.',
			'La década del 90 lo convirtió en uno de los nombres más respetados del cine estadounidense. Philadelphia, Forrest Gump, Apollo 13, Saving Private Ryan y Toy Story lo consolidaron como actor popular, serio y extremadamente confiable para estudios y directores.',
			'Su perfil público siempre tuvo algo de “americano clásico”, pero su carrera muestra más elasticidad de la que parece: puede ir del melodrama al cine bélico, del thriller histórico a la animación, sin perder identidad.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Clásico moderno' },
			{ label: 'Pulso', value: 'Humanidad total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Philadelphia', year: 1994 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'Forrest Gump', year: 1995 },
		],
		knownFor: ['forrest-gump-1994', 'saving-private-ryan-1998', 'toy-story-1995', 'atrapame-si-puedes-2002'],
		referenceUrls: [
			'https://www.britannica.com/biography/Tom-Hanks',
			'https://www.oscars.org/oscars/ceremonies/1994',
			'https://www.oscars.org/oscars/ceremonies/1995',
		],
	},
	'robert-de-niro': {
		slug: 'robert-de-niro',
		name: 'Robert De Niro',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Robert%20De%20Niro%20Cannes%202016.jpg?width=640',
		headline:
			'Uno de los actores más influyentes del cine estadounidense, con una combinación letal de naturalismo, amenaza y control interno.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Manhattan, Nueva York, Estados Unidos',
		spotlight:
			'Su alianza con Martin Scorsese redefinió el criminal moderno en pantalla y dejó una escuela entera de actuación.',
		biography: [
			'Robert De Niro nació el 17 de agosto de 1943 en Nueva York y se formó dentro de una tradición actoral profundamente ligada al trabajo de observación y composición. Desde muy temprano mostró una capacidad rarísima para desaparecer dentro del personaje.',
			'Con Mean Streets, Taxi Driver, Raging Bull y Goodfellas quedó asociado para siempre al cine de Scorsese, pero su filmografía es mucho más amplia. También fue central en The Godfather Part II, The Deer Hunter, Heat, Jackie Brown y una buena parte del cine criminal de prestigio.',
			'De Niro domina algo que pocos logran: transmitir violencia o fragilidad sin subrayar nada. Incluso en roles secundarios, suele funcionar como un eje gravitatorio alrededor del cual se ordena la película.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Huella', value: 'Método feroz' },
			{ label: 'Pulso', value: 'Poder contenido' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'The Godfather Part II', year: 1975 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'Raging Bull', year: 1981 },
		],
		knownFor: ['goodfellas-1990', 'taxi-driver-1976', 'the-deer-hunter-1978', 'killers-of-the-flower-moon-2023'],
		referenceUrls: [
			'https://www.britannica.com/biography/Robert-De-Niro',
			'https://www.oscars.org/oscars/ceremonies/1975',
			'https://www.oscars.org/oscars/ceremonies/1981',
		],
	},
	'denzel-washington': {
		slug: 'denzel-washington',
		name: 'Denzel Washington',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Denzel%20Washington%20at%20the%202025%20Cannes%20Film%20Festival.jpg?width=640',
		headline:
			'Presencia gigantesca del drama estadounidense, con una mezcla de autoridad, carisma y precisión que sostiene cualquier plano.',
		roles: ['Actor', 'Director'],
		birthPlace: 'Mount Vernon, Nueva York, Estados Unidos',
		spotlight:
			'Se mueve con naturalidad entre el héroe noble, el líder roto y el personaje moralmente ambiguo sin perder magnetismo.',
		biography: [
			'Denzel Washington nació el 28 de diciembre de 1954 en Mount Vernon, Nueva York, y primero encontró reconocimiento en televisión antes de dominar el cine. Su formación teatral siempre se nota en la dicción, el control corporal y el peso específico que les da a los diálogos.',
			'Películas como Glory, Malcolm X, Philadelphia, Training Day, Flight y Fences lo instalaron como uno de los intérpretes más sólidos de su generación. Incluso cuando el proyecto no es brillante, suele elevar el material con pura presencia.',
			'Washington también construyó carrera como director y productor, pero su gran rasgo sigue siendo otro: esa sensación de que cuando entra en escena todo el relato gana densidad de inmediato.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Pulso', value: 'Autoridad total' },
			{ label: 'Marca', value: 'Drama de alto nivel' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Glory', year: 1990 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'Training Day', year: 2002 },
		],
		knownFor: ['gladiator-ii-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Denzel-Washington',
			'https://www.oscars.org/oscars/ceremonies/1990',
			'https://www.oscars.org/oscars/ceremonies/2002',
		],
	},
	'morgan-freeman': {
		slug: 'morgan-freeman',
		name: 'Morgan Freeman',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Academy%20Award-winning%20actor%20Morgan%20Freeman%20narrates%20for%20the%20opening%20ceremony%20(26904746425)%20(cropped)%203.jpg?width=640',
		headline:
			'Actor de voz legendaria y presencia serena, siempre listo para dar autoridad, calidez o gravedad a una película.',
		roles: ['Actor'],
		birthPlace: 'Memphis, Tennessee, Estados Unidos',
		spotlight:
			'Tiene una calma casi magnética que funciona tanto para el mentor sabio como para el personaje cansado que ya vio demasiado.',
		biography: [
			'Morgan Freeman nació el 1 de junio de 1937 en Memphis, Tennessee, y tardó más que otros en convertirse en figura de cine, pero cuando lo hizo ya llegaba con una madurez de oficio muy difícil de igualar. Su carrera tiene algo de combustión lenta: fue creciendo hasta volverse indispensable.',
			'Driving Miss Daisy, The Shawshank Redemption, Se7en, Million Dollar Baby y Unforgiven muestran bien su rango. Puede ser cálido, irónico o profundamente melancólico, y casi siempre transmite la idea de que su personaje tiene una vida entera fuera de cuadro.',
			'Freeman es una de esas figuras cuya sola presencia ordena el relato. Incluso en roles chicos, aporta tono, estabilidad y una autoridad que no necesita gestos ampulosos.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Pulso', value: 'Calma imponente' },
			{ label: 'Marca', value: 'Voz icónica' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Million Dollar Baby', year: 2005 },
		],
		knownFor: ['the-shawshank-redemption-1994', 'se7en-1995', 'million-dollar-baby-2004', 'unforgiven-1992'],
		referenceUrls: [
			'https://www.britannica.com/biography/Morgan-Freeman',
			'https://www.oscars.org/oscars/ceremonies/1990',
			'https://www.oscars.org/oscars/ceremonies/2005',
		],
	},
	'jack-nicholson': {
		slug: 'jack-nicholson',
		name: 'Jack Nicholson',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Jack%20Nicholson%202001.jpg?width=640',
		headline:
			'Carisma, peligro y sarcasmo en dosis únicas: una de las grandes caras del cine estadounidense del último medio siglo.',
		roles: ['Actor'],
		birthPlace: 'Neptune City, Nueva Jersey, Estados Unidos',
		spotlight:
			'Su sonrisa torcida y su energía impredecible alcanzaron para volverlo una presencia irrepetible en dramas, comedias negras y cine de terror.',
		biography: [
			'Jack Nicholson nació el 22 de abril de 1937 en Nueva Jersey y encontró primero su espacio en películas pequeñas, antes de convertirse en una de las figuras fundamentales del Nuevo Hollywood. Five Easy Pieces y Chinatown ya lo mostraban como un actor distinto, lleno de filo e inteligencia.',
			'Después llegaron One Flew Over the Cuckoo’s Nest, The Shining, Terms of Endearment, Batman y As Good as It Gets, donde su capacidad para mezclar ironía, fragilidad y amenaza quedó cristalizada. Pocos intérpretes dominaron tan bien la idea de personaje incómodo pero fascinante.',
			'Nicholson no necesita llenar la pantalla a los gritos. Muchas veces le alcanza con una mirada apenas torcida para desacomodar toda la escena.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Huella', value: 'Icono total' },
			{ label: 'Pulso', value: 'Ironía + filo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'One Flew Over the Cuckoo’s Nest', year: 1976 },
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Terms of Endearment', year: 1984 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'As Good as It Gets', year: 1998 },
		],
		knownFor: ['one-flew-over-the-cuckoo-s-nest-1975', 'the-shining-1980', 'batman-1989', 'terms-of-endearment-1983'],
		referenceUrls: [
			'https://www.britannica.com/biography/Jack-Nicholson',
			'https://www.oscars.org/oscars/ceremonies/1976',
			'https://www.oscars.org/oscars/ceremonies/1984',
			'https://www.oscars.org/oscars/ceremonies/1998',
		],
	},
	'christian-bale': {
		slug: 'christian-bale',
		name: 'Christian Bale',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Christian%20Bale-7837.jpg?width=640',
		headline:
			'Actor camaleónico, obsesivo con la transformación física y siempre dispuesto a llevar el personaje hasta el extremo.',
		roles: ['Actor'],
		birthPlace: 'Haverfordwest, Gales, Reino Unido',
		spotlight:
			'Puede pasar del héroe de estudio al tipo quebrado y hostil sin que se note el cambio de marcha: para él todo parece parte del mismo rigor.',
		biography: [
			'Christian Bale nació el 30 de enero de 1974 en Gales y empezó a actuar desde muy chico. Empire of the Sun ya lo dejaba ver como un intérprete intensísimo, mucho antes de convertirse en figura mainstream.',
			'Con American Psycho, The Machinist, la trilogía de Batman de Christopher Nolan, The Prestige y The Fighter construyó una carrera muy marcada por la transformación y el compromiso físico. Bale suele meterse de lleno en la mecánica interna del personaje, incluso cuando eso vuelve su trabajo incómodo o áspero.',
			'Su prestigio no viene solo del esfuerzo visible, sino de algo más difícil: logra que cada transformación tenga sentido dramático y no quede en mero truco.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Pulso', value: 'Transformación total' },
			{ label: 'Marca', value: 'Rigor feroz' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'The Fighter', year: 2011 },
		],
		knownFor: ['batman-begins-2005', 'the-dark-knight-2008', 'the-dark-knight-rises-2012', 'the-prestige-2006'],
		referenceUrls: [
			'https://www.britannica.com/biography/Christian-Bale',
			'https://www.oscars.org/oscars/ceremonies/2011',
			'https://www.oscars.org/oscars/ceremonies/2019',
		],
	},
	'joaquin-phoenix': {
		slug: 'joaquin-phoenix',
		name: 'Joaquin Phoenix',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Joaquin%20Phoenix%20in%202018.jpg?width=640',
		headline:
			'Actor de nervio raro y sensibilidad desacomodada, ideal para personajes al borde del colapso o la obsesión.',
		roles: ['Actor'],
		birthPlace: 'San Juan, Puerto Rico',
		spotlight:
			'Su trabajo suele tener algo imprevisible: parece siempre a punto de romper la escena, y eso le da una tensión muy particular.',
		biography: [
			'Joaquin Phoenix nació el 28 de octubre de 1974 en Puerto Rico y pasó parte de su infancia dentro de una familia itinerante antes de asentarse en Estados Unidos. Empezó de chico en televisión, pero con el tiempo fue corrigiendo cualquier gesto de actor precoz para encontrar una voz muy propia.',
			'The Master, Walk the Line, Her, Gladiator y Joker lo terminaron de instalar como uno de los intérpretes más singulares de su generación. Phoenix trabaja desde la incomodidad: no busca caer simpático, sino hacer visible el temblor interno del personaje.',
			'Cuando el material lo acompaña, esa forma de actuar genera algo potentísimo: la sensación de estar viendo a alguien desarmarse en tiempo real sin que parezca un truco calculado.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Pulso', value: 'Incomodidad filosa' },
			{ label: 'Marca', value: 'Riesgo permanente' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Joker', year: 2020 },
		],
		knownFor: ['joker-2019', 'gladiator-2000', 'napoleon-2023', 'joker-folie-a-deux-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Joaquin-Phoenix',
			'https://www.oscars.org/oscars/ceremonies/2006',
			'https://www.oscars.org/oscars/ceremonies/2020',
		],
	},
	'russell-crowe': {
		slug: 'russell-crowe',
		name: 'Russell Crowe',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Russell%20Crowe%20on%20the%20Green%20Carpet%20at%20the%202025%20Zurich%20Film%20Festival%2006%20(cropped).jpg?width=640',
		headline:
			'Figura de enorme presencia física y dramática, especialista en tipos tensos, orgullosos o atravesados por una épica muy terrenal.',
		roles: ['Actor'],
		birthPlace: 'Wellington, Nueva Zelanda',
		spotlight:
			'Durante años fue la cara perfecta del protagonista adulto de estudio: intensidad, oficio y una gravedad que se sentía corpórea.',
		biography: [
			'Russell Crowe nació el 7 de abril de 1964 en Wellington y desarrolló gran parte de su carrera entre Australia y Hollywood. Su salto internacional fue rápido porque tenía algo que el cine industrial valora muchísimo: presencia inmediata y una energía muy física.',
			'Gladiator, The Insider, A Beautiful Mind, Master and Commander y L.A. Confidential lo consolidaron como una de las estrellas adultas más potentes de fines de los 90 y principios de los 2000. Crowe puede ir al melodrama, al thriller o a la épica histórica sin perder espesor.',
			'Aun cuando su filmografía se volvió más irregular, sigue teniendo un recurso muy efectivo: la sensación de que cada personaje tiene orgullo, cansancio y rabia acumulada bajo la piel.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Épica adulta' },
			{ label: 'Pulso', value: 'Peso escénico' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Gladiator', year: 2001 },
		],
		knownFor: ['gladiator-2000', 'a-beautiful-mind-2001', 'man-of-steel-2013', 'nuremberg-2025'],
		referenceUrls: [
			'https://www.britannica.com/biography/Russell-Crowe',
			'https://www.oscars.org/oscars/ceremonies/2001',
			'https://www.oscars.org/oscars/ceremonies/2002',
		],
	},
	'meryl-streep': {
		slug: 'meryl-streep',
		name: 'Meryl Streep',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Meryl%20Streep%20interview%20at%20Festival%20de%20Cannes%202024%20(cropped%202).jpg?width=640',
		headline:
			'Referencia absoluta de la actuación contemporánea, con una técnica tan precisa que casi siempre parece invisible.',
		roles: ['Actriz'],
		birthPlace: 'Summit, Nueva Jersey, Estados Unidos',
		spotlight:
			'Puede cambiar acento, registro, edad o tono sin que se note el esfuerzo: su versatilidad quedó como estándar para varias generaciones.',
		biography: [
			'Meryl Streep nació el 22 de junio de 1949 en Nueva Jersey y pasó del teatro y la formación clásica al cine con una facilidad asombrosa. Ya desde sus primeros trabajos se percibía una combinación infrecuente de inteligencia técnica y emoción limpia.',
			'Kramer vs. Kramer, Sophie’s Choice, Out of Africa, The Devil Wears Prada, Doubt y The Iron Lady forman apenas una parte de una carrera larguísima y casi siempre al máximo nivel. Streep no se repite tanto como parece: más bien adapta su instrumento al material con una precisión quirúrgica.',
			'Su prestigio es tan grande que a veces tapa lo más importante: la enorme capacidad que tiene para volver humanos incluso a personajes escritos desde el artificio o el gesto grandilocuente.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Versatilidad total' },
			{ label: 'Pulso', value: 'Técnica invisible' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Kramer vs. Kramer', year: 1980 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Sophie’s Choice', year: 1983 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Iron Lady', year: 2012 },
		],
		knownFor: ['kramer-vs-kramer-1979', 'out-of-africa-1985', 'dont-look-up-2021'],
		referenceUrls: [
			'https://www.britannica.com/biography/Meryl-Streep',
			'https://www.oscars.org/oscars/ceremonies/1980',
			'https://www.oscars.org/oscars/ceremonies/1983',
			'https://www.oscars.org/oscars/ceremonies/2012',
		],
	},
	'kate-winslet': {
		slug: 'kate-winslet',
		name: 'Kate Winslet',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/KateWinslet%20(cropped).jpg?width=640',
		headline:
			'Actriz británica de enorme intensidad emocional, capaz de sostener tanto romance clásico como drama áspero sin perder verdad.',
		roles: ['Actriz'],
		birthPlace: 'Reading, Berkshire, Inglaterra',
		spotlight:
			'Siempre transmite una mezcla de inteligencia, vulnerabilidad y fuerza que vuelve muy difícil despegar la mirada de sus personajes.',
		biography: [
			'Kate Winslet nació el 5 de octubre de 1975 en Reading y se formó en una familia ligada al teatro. Desde joven mostró una potencia dramática muy por encima del promedio, con una presencia que escapaba a cualquier idea de ingenuidad decorativa.',
			'Sense and Sensibility la puso en el radar, pero Titanic la volvió una figura global. Después construyó una carrera menos obvia y más rica, combinando cine de autor, melodrama, trabajos de época y personajes emocionalmente complejos.',
			'Winslet tiene algo muy valioso: una sensación de entrega total sin caer en la sobreactuación. Incluso en escenas grandilocuentes, suele encontrar una verdad concreta y terrenal.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Drama frontal' },
			{ label: 'Pulso', value: 'Emoción nítida' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Reader', year: 2009 },
		],
		knownFor: ['titanic-1997'],
		referenceUrls: [
			'https://www.britannica.com/biography/Kate-Winslet',
			'https://www.oscars.org/oscars/ceremonies/1998',
			'https://www.oscars.org/oscars/ceremonies/2009',
		],
	},
	'cate-blanchett': {
		slug: 'cate-blanchett',
		name: 'Cate Blanchett',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Cate%20Blanchett%20Cannes%202018%202%20(cropped).jpg?width=640',
		headline:
			'Actriz de una precisión notable, capaz de pasar del cine industrial al trabajo más sofisticado con la misma autoridad.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Ivanhoe, Victoria, Australia',
		spotlight:
			'Su elasticidad interpretativa le permite ser regia, monstruosa, cómica o fría sin que ninguna de esas capas parezca impostada.',
		biography: [
			'Cate Blanchett nació el 14 de mayo de 1969 en Australia y construyó una carrera muy asociada al teatro, la literatura y el cine de autor, aunque nunca se quedó encerrada ahí. Desde Elizabeth quedó claro que tenía presencia, voz y control para dominar personajes complejos.',
			'Con el tiempo logró una filmografía rarísima por amplitud: The Aviator, Blue Jasmine, Carol, Tár, los filmes de Peter Jackson, el Marvel de Thor y hasta trabajos de voz para animación. Blanchett parece sentirse cómoda tanto en el artificio más alto como en el naturalismo más seco.',
			'Es una actriz que no teme a la incomodidad ni al exceso cuando el material lo pide. Y cuando el personaje requiere apenas un desplazamiento mínimo, también sabe hacerlo pesar muchísimo.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Prestigio total' },
			{ label: 'Pulso', value: 'Precisión quirúrgica' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'The Aviator', year: 2005 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Blue Jasmine', year: 2014 },
		],
		knownFor: ['tar-2022', 'nightmare-alley-2021', 'thor-ragnarok-2017', 'indiana-jones-and-the-kingdom-of-the-crystal-skull-2008'],
		referenceUrls: [
			'https://www.britannica.com/biography/Cate-Blanchett',
			'https://www.oscars.org/oscars/ceremonies/2005',
			'https://www.oscars.org/oscars/ceremonies/2014',
		],
	},
	'angelina-jolie': {
		slug: 'angelina-jolie',
		name: 'Angelina Jolie',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Angelina%20Jolie-643531%20(cropped).jpg?width=640',
		headline:
			'Una de las últimas grandes estrellas globales de Hollywood, con mezcla de glamour, intensidad y una carrera más diversa de lo que suele recordarse.',
		roles: ['Actriz', 'Directora'],
		birthPlace: 'Los Ángeles, California, Estados Unidos',
		spotlight:
			'Pasó del drama áspero al cine de acción y después a la dirección sin dejar de sostener una imagen pública potentísima.',
		biography: [
			'Angelina Jolie nació el 4 de junio de 1975 en Los Ángeles y creció dentro de una familia muy ligada a la actuación. Su irrupción fuerte se dio en los 90, cuando ya mostraba una mezcla poco frecuente de vulnerabilidad, extrañeza y magnetismo inmediato.',
			'Girl, Interrupted le dio su Oscar y luego afianzó una imagen de superestrella con títulos como Lara Croft: Tomb Raider, Mr. & Mrs. Smith, Changeling, Salt y Maleficent. En paralelo armó una faceta como directora con películas como In the Land of Blood and Honey, Unbroken y First They Killed My Father.',
			'Jolie funciona bien tanto desde la fragilidad dramática como desde la presencia icónica. No es casual que haya sido durante años un nombre central del star system global.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Estrella global' },
			{ label: 'Pulso', value: 'Glamour + riesgo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Girl, Interrupted', year: 2000 },
			{ label: 'Oscar', category: 'Premio humanitario Jean Hersholt', work: 'Trayectoria humanitaria', year: 2014 },
		],
		knownFor: ['eternals-2021', 'kung-fu-panda-2008', 'kung-fu-panda-2-2011'],
		referenceUrls: [
			'https://www.britannica.com/biography/Angelina-Jolie',
			'https://www.oscars.org/oscars/ceremonies/2000',
			'https://www.oscars.org/oscars/ceremonies/2014',
		],
	},
	'jodie-foster': {
		slug: 'jodie-foster',
		name: 'Jodie Foster',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Jodie%20Foster%20in%20Baltimore%20(cropped).jpg?width=640',
		headline:
			'Actriz de enorme inteligencia y control, capaz de cargar con material psicológico muy complejo sin volverse aparatosa.',
		roles: ['Actriz', 'Directora'],
		birthPlace: 'Los Ángeles, California, Estados Unidos',
		spotlight:
			'Su trayectoria va desde la niña prodigio hasta la intérprete adulta de dramas intensos, siempre con una mirada muy lúcida sobre el personaje.',
		biography: [
			'Jodie Foster nació el 19 de noviembre de 1962 en Los Ángeles y empezó a trabajar desde muy chica. Lo notable es que logró salir del lugar de niña prodigio sin perder rigor ni curiosidad como actriz.',
			'Taxi Driver la puso en el centro de la conversación desde temprano, y años después The Accused y The Silence of the Lambs confirmaron una capacidad extraordinaria para sostener personajes vulnerables y al mismo tiempo durísimos. Foster siempre transmite inteligencia, concentración y una tensión interior muy precisa.',
			'Además de actuar, dirigió cine y televisión. Esa doble condición se percibe en pantalla: suele dar la impresión de entender la escena no solo desde su personaje, sino desde toda la arquitectura del relato.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Inteligencia feroz' },
			{ label: 'Pulso', value: 'Control total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Accused', year: 1989 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Silence of the Lambs', year: 1992 },
		],
		knownFor: ['the-silence-of-the-lambs-1991', 'taxi-driver-1976'],
		referenceUrls: [
			'https://www.britannica.com/biography/Jodie-Foster',
			'https://www.oscars.org/oscars/ceremonies/1989',
			'https://www.oscars.org/oscars/ceremonies/1992',
		],
	},
	'emma-stone': {
		slug: 'emma-stone',
		name: 'Emma Stone',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Emma%20Stone%20at%20the%202025%20Cannes%20Film%20Festival%2004.jpg?width=640',
		headline:
			'Actriz con timing afilado y una expresividad rarísima: puede ser luminosa, incómoda o devastadora sin dejar de sentirse contemporánea.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Scottsdale, Arizona, Estados Unidos',
		spotlight:
			'Su carrera fue de la comedia juvenil al cine de autor más desatado sin perder frescura ni precisión.',
		biography: [
			'Emma Stone nació el 6 de noviembre de 1988 en Arizona y se hizo conocida primero por su carisma en comedias y películas adolescentes. Lo que parecía un perfil de starlet simpática se transformó bastante rápido en algo más serio.',
			'Birdman, La La Land, The Favourite y Poor Things mostraron una evolución clarísima: Stone tiene timing, presencia cómica y una enorme capacidad para sostener vulnerabilidad o extrañeza. Puede resultar cercana incluso en personajes muy desviados o estilizados.',
			'En una industria donde muchas carreras se enfrían rápido, la suya hizo lo contrario: fue creciendo en riesgo y en nivel de exigencia sin perder atractivo popular.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Riesgo elegante' },
			{ label: 'Pulso', value: 'Frescura filosa' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'La La Land', year: 2017 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Poor Things', year: 2024 },
		],
		knownFor: ['poor-things-2023', 'birdman-or-the-unexpected-virtue-of-ignorance-2014', 'cruella-2021', 'the-amazing-spider-man-2012'],
		referenceUrls: [
			'https://www.britannica.com/biography/Emma-Stone',
			'https://www.oscars.org/oscars/ceremonies/2017',
			'https://www.oscars.org/oscars/ceremonies/2024',
		],
	},
	'natalie-portman': {
		slug: 'natalie-portman',
		name: 'Natalie Portman',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/NataliePortman.jpg?width=640',
		headline:
			'Actriz de gran delicadeza técnica, siempre efectiva para personajes introspectivos, frágiles o intensamente racionales.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Jerusalén, Israel',
		spotlight:
			'Construyó una carrera muy singular: de niña prodigio a estrella global sin dejar de buscar materiales complejos y directores fuertes.',
		biography: [
			'Natalie Portman nació el 9 de junio de 1981 en Jerusalén y se trasladó de chica a Estados Unidos. Desde Léon: The Professional se volvió evidente que no era una presencia infantil pasajera, sino una actriz con recursos poco comunes para su edad.',
			'Su recorrido va de Star Wars a Closer, de Black Swan a Jackie, y también incluye trabajos comerciales donde mantiene una gravitación tranquila pero firme. Portman suele actuar desde la interioridad, incluso cuando el personaje está al borde del estallido.',
			'Su mejor registro aparece cuando el relato le permite combinar control, vulnerabilidad y una inteligencia muy visible en pantalla. Ahí se vuelve una intérprete de enorme precisión.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Fragilidad + control' },
			{ label: 'Pulso', value: 'Prestigio sereno' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Black Swan', year: 2011 },
		],
		knownFor: ['star-wars-episode-i-the-phantom-menace-1999', 'star-wars-episode-ii-attack-of-the-clones-2002', 'star-wars-episode-iii-revenge-of-the-sith-2005', 'thor-2011'],
		referenceUrls: [
			'https://www.britannica.com/biography/Natalie-Portman',
			'https://www.oscars.org/oscars/ceremonies/2005',
			'https://www.oscars.org/oscars/ceremonies/2011',
		],
	},
	'charlize-theron': {
		slug: 'charlize-theron',
		name: 'Charlize Theron',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Charlize-theron-IMG%206045.jpg?width=640',
		headline:
			'Presencia imponente y muy dúctil, capaz de moverse entre el drama oscuro, el cine físico de acción y el blockbuster sin perder filo.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Benoni, Gauteng, Sudáfrica',
		spotlight:
			'Tiene glamour de estrella clásica, pero su carrera está llena de decisiones incómodas, físicas o directamente ásperas.',
		biography: [
			'Charlize Theron nació el 7 de agosto de 1975 en Sudáfrica y llegó al cine después de una formación ligada al modelaje y a la danza. Su irrupción no fue solo por presencia física: muy rápido mostró una disposición total para el trabajo duro.',
			'Monster marcó un antes y un después porque dejó en claro que podía desarmar cualquier expectativa de glamour para construir algo incómodo y profundamente humano. Después reforzó esa amplitud con Mad Max: Fury Road, Young Adult, Atomic Blonde y varias producciones de acción de alto voltaje.',
			'Theron suele funcionar especialmente bien cuando la película le pide dureza, ironía y un fondo de tristeza o agotamiento. Ahí aparece toda su potencia.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Dureza elegante' },
			{ label: 'Pulso', value: 'Fisicidad total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Monster', year: 2004 },
		],
		knownFor: ['mad-max-fury-road-2015', 'prometheus-2012'],
		referenceUrls: [
			'https://www.britannica.com/biography/Charlize-Theron',
			'https://www.oscars.org/oscars/ceremonies/2004',
			'https://www.oscars.org/oscars/ceremonies/2006',
		],
	},
	'anne-hathaway': {
		slug: 'anne-hathaway',
		name: 'Anne Hathaway',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Anne%20Hathaway%20at%20The%20Apprentice%20in%20NYC%2003%20(cropped).jpg?width=640',
		headline:
			'Actriz de enorme claridad expresiva, capaz de pasar del romanticismo luminoso al drama intenso con muchísima naturalidad.',
		roles: ['Actriz'],
		birthPlace: 'Brooklyn, Nueva York, Estados Unidos',
		spotlight:
			'Su carrera supo correrse del molde de estrella amable para buscar papeles más filosos, vulnerables o directamente oscuros.',
		biography: [
			'Anne Hathaway nació el 12 de noviembre de 1982 en Brooklyn y se volvió muy conocida con películas de tono juvenil y romántico. Pero esa primera imagen de actriz accesible y encantadora fue apenas una parte de su recorrido.',
			'Brokeback Mountain, Rachel Getting Married, Les Misérables, Interstellar y The Devil Wears Prada muestran cómo fue ampliando su rango. Hathaway puede ser muy luminosa, pero también sabe trabajar la ansiedad, el agotamiento o la herida emocional cuando el material lo pide.',
			'Con el tiempo armó una carrera bastante más rica de lo que sugería su arranque. Su virtud principal está en la transparencia: transmite rápido lo que le pasa al personaje sin forzarlo.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Versatilidad limpia' },
			{ label: 'Pulso', value: 'Emoción franca' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Les Misérables', year: 2013 },
		],
		knownFor: ['interstellar-2014', 'the-idea-of-you-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Anne-Hathaway',
			'https://www.oscars.org/oscars/ceremonies/2009',
			'https://www.oscars.org/oscars/ceremonies/2013',
		],
	},
	'jennifer-lawrence': {
		slug: 'jennifer-lawrence',
		name: 'Jennifer Lawrence',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Jennifer%20Lawrence%2C%20Cannes%20Film%20Festival%202025.jpg?width=640',
		headline:
			'Star contemporánea de enorme naturalidad, con una presencia frontal que le permite ser cercana, sarcástica o devastadora sin esfuerzo aparente.',
		roles: ['Actriz'],
		birthPlace: 'Indian Hills, Kentucky, Estados Unidos',
		spotlight:
			'Su combinación de carisma popular y timing seco la volvió una de las caras más fuertes de Hollywood en la década pasada.',
		biography: [
			'Jennifer Lawrence nació el 15 de agosto de 1990 en Kentucky y tuvo un ascenso velocísimo. En muy pocos años pasó de promesa televisiva a protagonista de franquicias gigantes y dramas de prestigio.',
			'Winter’s Bone la reveló como una actriz con una intensidad inhabitual para su edad. Después sumó The Hunger Games, Silver Linings Playbook, American Hustle, Mother! y Don’t Look Up, consolidando una carrera donde conviven lo popular y lo imprevisible.',
			'Lawrence trabaja muy bien desde la espontaneidad. Tiene algo directo, casi desprolijo en el mejor sentido, que hace que muchos de sus personajes se sientan vivos de una manera poco calculada.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Star millennial' },
			{ label: 'Pulso', value: 'Naturalidad filosa' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Silver Linings Playbook', year: 2013 },
		],
		knownFor: ['dont-look-up-2021', 'x-men-first-class-2011', 'x-men-apocalypse-2016'],
		referenceUrls: [
			'https://www.britannica.com/biography/Jennifer-Lawrence',
			'https://www.oscars.org/oscars/ceremonies/2013',
			'https://www.oscars.org/oscars/ceremonies/2014',
		],
	},
	'steven-spielberg': {
		slug: 'steven-spielberg',
		name: 'Steven Spielberg',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Steven%20Spielberg%202025.jpg?width=640',
		headline:
			'Director clave del blockbuster moderno y al mismo tiempo un narrador clásico capaz de pasar de la aventura pura al drama histórico con una fluidez rarísima.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Cincinnati, Ohio, Estados Unidos',
		spotlight:
			'Pocos cineastas moldearon tanto la imaginación popular: tiburones, extraterrestres, dinosaurios, guerras y memoria histórica, todo dentro de una misma carrera.',
		biography: [
			'Steven Spielberg nació el 18 de diciembre de 1946 en Cincinnati y desde muy chico filmó cortos caseros, armado con esa mezcla de curiosidad técnica y entusiasmo infantil que después se volvería una marca de estilo. Su ingreso a Hollywood se dio a través de la televisión, pero el salto real llegó con Duel y, sobre todo, con Jaws.',
			'Ahí empezó una etapa histórica. Spielberg ayudó a definir el blockbuster moderno con E.T., Indiana Jones y Jurassic Park, sin perder nunca claridad narrativa ni sentido del espectáculo. Pero su carrera no quedó encerrada en la aventura: también dirigió Schindler’s List, Saving Private Ryan, Munich, Lincoln y The Fabelmans, mostrando una veta dramática cada vez más fuerte.',
			'Su gran rasgo es la precisión con la que organiza emoción, espacio y ritmo. Puede filmar maravilla, terror, guerra o intimidad familiar sin perder legibilidad ni pulso popular. Por eso sigue siendo una referencia inevitable tanto para el cine industrial como para el más prestigioso.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Huella', value: 'Padre del blockbuster' },
			{ label: 'Pulso', value: 'Emoción + espectáculo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: "Schindler's List", year: 1994 },
			{ label: 'Oscar', category: 'Mejor director', work: 'Saving Private Ryan', year: 1999 },
			{ label: 'Oscar', category: 'Premio Irving G. Thalberg', work: 'Trayectoria como productor', year: 1986 },
		],
		knownFor: ['jaws-1975', 'e-t-the-extra-terrestrial-1982', 'jurassic-park-1993', 'schindler-s-list-1993'],
		referenceUrls: [
			'https://www.britannica.com/biography/Steven-Spielberg',
			'https://www.oscars.org/oscars/ceremonies/1994',
			'https://www.oscars.org/oscars/ceremonies/1999',
		],
	},
	'christopher-nolan': {
		slug: 'christopher-nolan',
		name: 'Christopher Nolan',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/ChrisNolanBFI150224%20(10%20of%2012)%20(53532289710)%20(cropped2).jpg?width=640',
		headline:
			'Director británico que convirtió las estructuras complejas, el gran formato y la obsesión por el tiempo en cine masivo de primer nivel.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Londres, Inglaterra, Reino Unido',
		spotlight:
			'Consiguió algo muy difícil: hacer películas conceptuales, formales y largamente ambiciosas sin abandonar la escala industrial ni el impacto popular.',
		biography: [
			'Christopher Nolan nació el 30 de julio de 1970 en Londres y creció entre Inglaterra y Estados Unidos. Desde sus primeros trabajos se notó una fascinación por la percepción, la memoria y las estructuras narrativas quebradas, algo que explotó del todo con Memento.',
			'Después convirtió esa obsesión en un lenguaje mainstream. Batman Begins, The Dark Knight, Inception, Interstellar, Dunkirk y Oppenheimer muestran a un director que piensa el espectáculo desde la forma, el montaje y la escala. Incluso cuando trabaja con ideas enormes, suele mantener una tensión narrativa muy concreta.',
			'Nolan filma como si cada película fuera un mecanismo de relojería. Su prestigio no viene solo de la grandilocuencia, sino de haber logrado que el cine-evento contemporáneo vuelva a sentirse como una experiencia de autor.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Gran formato autoral' },
			{ label: 'Pulso', value: 'Concepto + tensión' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'Oppenheimer', year: 2024 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'Oppenheimer', year: 2024 },
			{ label: 'BFI Fellowship', category: 'Máximo honor del BFI', work: 'Trayectoria', year: 2024 },
		],
		knownFor: ['memento-2000', 'inception-2010', 'interstellar-2014', 'oppenheimer-2023'],
		referenceUrls: [
			'https://www.britannica.com/biography/Christopher-Nolan-British-director',
			'https://www.oscars.org/oscars/ceremonies/2024',
			'https://www.bfi.org.uk/news/programme-announced-february-2024-bfi-southbank-bfi-imax',
		],
	},
	'quentin-tarantino': {
		slug: 'quentin-tarantino',
		name: 'Quentin Tarantino',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Quentin%20Tarantino%20by%20Gage%20Skidmore.jpg?width=640',
		headline:
			'Director y guionista que volvió pop la cita cinéfila, la violencia estilizada y el diálogo como motor puro de tensión y placer.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Knoxville, Tennessee, Estados Unidos',
		spotlight:
			'Su cine mezcla exploitation, western, kung fu, noir y comedia negra con una seguridad tonal tan extrema que terminó inventando un adjetivo propio.',
		biography: [
			'Quentin Tarantino nació el 27 de marzo de 1963 en Knoxville y se formó más en videoclubs y salas que en escuelas de cine. Esa educación cinéfila, desordenada y apasionada terminó siendo parte central de su identidad como autor.',
			'Reservoir Dogs y Pulp Fiction lo instalaron de inmediato como una voz singular. Después siguió expandiendo un universo reconocible con Jackie Brown, Kill Bill, Inglourious Basterds, Django Unchained, The Hateful Eight y Once Upon a Time in Hollywood. Cada película suya parece conversar con medio siglo de cine popular.',
			'Tarantino filma desde el exceso controlado: música, actuación, encuadre y texto trabajan para crear escenas larguísimas que siempre están a punto de explotar. Es un estilista total, pero también un narrador que entiende perfectamente el placer físico del cine.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Autor pop absoluto' },
			{ label: 'Pulso', value: 'Diálogo + pólvora' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor guion original', work: 'Pulp Fiction', year: 1995 },
			{ label: 'Oscar', category: 'Mejor guion original', work: 'Django Unchained', year: 2013 },
		],
		knownFor: [
			'pulp-fiction-1994',
			'kill-bill-vol-1-2003',
			'inglourious-basterds-2009',
			'once-upon-a-time-in-hollywood-2019',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Quentin-Tarantino',
			'https://www.oscars.org/oscars/ceremonies/1995',
			'https://www.oscars.org/oscars/ceremonies/2013',
		],
	},
	'hayao-miyazaki': {
		slug: 'hayao-miyazaki',
		name: 'Hayao Miyazaki',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/HayaoMiyazakiCCJuly09.jpg?width=640',
		headline:
			'Maestro absoluto de la animación japonesa, creador de mundos sensibles, melancólicos y visualmente deslumbrantes que marcaron generaciones enteras.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Tokio, Japón',
		spotlight:
			'Su cine puede ser tierno, ecológico, bélico, fantástico y político al mismo tiempo, siempre con una humanidad enorme en el centro.',
		biography: [
			'Hayao Miyazaki nació el 5 de enero de 1941 en Tokio y se formó dentro de la industria de la animación japonesa antes de convertirse en uno de sus grandes renovadores. Su imaginación visual siempre convivió con una mirada crítica sobre la guerra, la modernidad y el vínculo entre humanidad y naturaleza.',
			'Con Nausicaä, My Neighbor Totoro, Princess Mononoke, Spirited Away, Howl’s Moving Castle y The Boy and the Heron armó una filmografía que atraviesa décadas sin perder delicadeza ni poder de asombro. Sus películas están llenas de vuelo, de criaturas extrañas y de personajes femeninos complejos y memorables.',
			'Miyazaki tiene algo raro incluso entre los gigantes: cada plano suyo parece dibujado desde una ética, no solo desde una estética. Por eso su cine emociona tanto a chicos como a adultos sin caer nunca en el subrayado fácil.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios competitivos' },
			{ label: 'Huella', value: 'Leyenda de la animación' },
			{ label: 'Pulso', value: 'Poesía + aventura' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor película animada', work: 'Spirited Away', year: 2003 },
			{ label: 'Oscar', category: 'Mejor película animada', work: 'The Boy and the Heron', year: 2024 },
		],
		knownFor: [
			'nausicaa-of-the-valley-of-the-wind-1984',
			'my-neighbor-totoro-1988',
			'spirited-away-2001',
			'the-boy-and-the-heron-2023',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Miyazaki-Hayao',
			'https://www.oscars.org/oscars/ceremonies/2003',
			'https://www.oscars.org/oscars/ceremonies/2024',
		],
	},
	'james-cameron': {
		slug: 'james-cameron',
		name: 'James Cameron',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/James%20Cameron%20at%2053rd%20Saturn%20Awards%202026-01.jpg?width=640',
		headline:
			'Director que convirtió la ambición tecnológica en espectáculo planetario sin resignar una vocación clarísima por el cine de aventura.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Kapuskasing, Ontario, Canadá',
		spotlight:
			'Su carrera está hecha de hitos industriales: secuelas superiores al original, ciencia ficción musculosa, récords de taquilla y obsesión real por la imagen.',
		biography: [
			'James Cameron nació el 16 de agosto de 1954 en Kapuskasing, Ontario, y llegó al cine por una mezcla de curiosidad técnica, trabajo duro y fascinación por la ciencia ficción. Su crecimiento fue veloz: de Piranha II a The Terminator hay un salto brutal de control y personalidad.',
			'Con Aliens, Terminator 2, Titanic y Avatar construyó una carrera ligada a la escala, la invención técnica y el espectáculo físico. Pero su cine no es puro aparato: suele apoyarse en conflictos simples y muy claros para que la dimensión industrial nunca tape del todo lo emocional.',
			'Cameron empuja cada proyecto como si quisiera probar un límite nuevo del medio. Esa obsesión, que a veces roza la demencia productiva, es parte de lo que lo volvió una figura central del cine mundial.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Espectáculo tecnológico' },
			{ label: 'Pulso', value: 'Ambición total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'Titanic', year: 1998 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'Titanic', year: 1998 },
			{ label: 'Golden Globe', category: 'Mejor director', work: 'Avatar', year: 2010 },
		],
		knownFor: ['the-terminator-1984', 'aliens-1986', 'titanic-1997', 'avatar-2009'],
		referenceUrls: [
			'https://www.britannica.com/biography/James-Cameron',
			'https://www.oscars.org/oscars/ceremonies/1998',
			'https://www.goldenglobes.com/person/james-cameron',
		],
	},
	'martin-scorsese': {
		slug: 'martin-scorsese',
		name: 'Martin Scorsese',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Martin%20Scorsese%20MFF%202023.jpg?width=640',
		headline:
			'Uno de los grandes autores del cine estadounidense, dueño de una energía visual y moral que sigue marcando el estándar del drama adulto.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Queens, Nueva York, Estados Unidos',
		spotlight:
			'Pocos filmaron con tanta intensidad la culpa, la violencia, la fe, la ambición y el derrumbe de los hombres modernos.',
		biography: [
			'Martin Scorsese nació el 17 de noviembre de 1942 en Queens y creció en Little Italy, un universo que impregnó buena parte de su cine. Su formación mezcla cinefilia extrema, educación católica y una sensibilidad urbana que hizo de sus primeras películas algo inconfundible.',
			'Mean Streets, Taxi Driver, Raging Bull, Goodfellas, Casino, The Departed, The Wolf of Wall Street y Killers of the Flower Moon forman parte de una filmografía monumental. También fue central como historiador, restaurador y defensor del cine, tanto en documentales como en tareas de preservación.',
			'Scorsese filma con nervio, música, cámara móvil y montaje vivo, pero detrás de esa superficie siempre hay preguntas morales profundas. No es solo un estilista feroz: es un observador implacable de la violencia y de la culpa.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Huella', value: 'Autor total' },
			{ label: 'Pulso', value: 'Furia moral' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Departed', year: 2007 },
			{ label: 'Palma de Oro', category: 'Mejor película', work: 'Taxi Driver', year: 1976 },
		],
		knownFor: ['taxi-driver-1976', 'goodfellas-1990', 'the-departed-2006', 'killers-of-the-flower-moon-2023'],
		referenceUrls: [
			'https://www.britannica.com/biography/Martin-Scorsese',
			'https://www.oscars.org/oscars/ceremonies/2007',
			'https://www.festival-cannes.com/en/p/taxi-driver/',
		],
	},
	'francis-ford-coppola': {
		slug: 'francis-ford-coppola',
		name: 'Francis Ford Coppola',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Francis%20Ford%20Coppola%20on%20December%208%2C%202024%20in%20the%20White%20House%20Oval%20Office%20(cropped).jpg?width=640',
		headline:
			'Figura fundacional del Nuevo Hollywood, capaz de levantar epopeyas monumentales y al mismo tiempo pelear por una idea radical de independencia creativa.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Detroit, Michigan, Estados Unidos',
		spotlight:
			'Entre The Godfather, The Conversation y Apocalypse Now dejó una de las décadas más impresionantes que haya firmado un director en la historia del cine.',
		biography: [
			'Francis Ford Coppola nació el 7 de abril de 1939 en Detroit y se formó primero en teatro y después en cine. Su paso por el circuito de Roger Corman le dio oficio industrial, pero muy rápido apuntó a algo más ambicioso y personal.',
			'En los 70 dirigió una seguidilla imposible: The Godfather, The Conversation, The Godfather Part II y Apocalypse Now. Esas películas no solo lo volvieron central en el Nuevo Hollywood, también redefinieron la escala posible del cine de estudio cuando un autor toma el control.',
			'Coppola siempre fue más que un director prestigioso: también funcionó como productor, impulsor tecnológico y figura de referencia para generaciones enteras. Su carrera tiene altibajos, sí, pero su peso histórico es inmenso.',
		],
		stats: [
			{ label: 'Oscar', value: '6 premios personales' },
			{ label: 'Huella', value: 'Nuevo Hollywood' },
			{ label: 'Pulso', value: 'Épica + riesgo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Godfather Part II', year: 1975 },
			{ label: 'Oscar', category: 'Mejor guion adaptado', work: 'The Godfather', year: 1973 },
		],
		knownFor: ['the-godfather-1972', 'the-godfather-part-ii-1974', 'apocalypse-now-1979', 'megalopolis-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Francis-Ford-Coppola',
			'https://www.oscars.org/oscars/ceremonies/1973',
			'https://www.oscars.org/oscars/ceremonies/1975',
		],
	},
	'george-lucas': {
		slug: 'george-lucas',
		name: 'George Lucas',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/George%20Lucas.jpg?width=640',
		headline:
			'Arquitecto de franquicias modernas, productor visionario y director que cambió para siempre la relación entre cine, tecnología y cultura popular.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Modesto, California, Estados Unidos',
		spotlight:
			'No filmó demasiado como director, pero lo que hizo alcanzó para redefinir los efectos visuales, el merchandising y la idea misma de universo cinematográfico.',
		biography: [
			'George Lucas nació el 14 de mayo de 1944 en Modesto y llegó al cine después de una adolescencia marcada por los autos, la velocidad y un accidente que casi le cambia la vida. Ya en la USC empezó a combinar fascinación visual, ciencia ficción y una mirada muy precisa sobre la cultura estadounidense.',
			'THX 1138 y American Graffiti mostraban dos facetas distintas, pero fue Star Wars la obra que reorganizó su carrera y buena parte de la industria. Lucas no solo dirigió la película original y la trilogía precuela: también construyó Lucasfilm, ILM y una infraestructura tecnológica decisiva para el cine moderno.',
			'Su importancia excede largamente la dirección. Lucas pensó el cine como sistema, como mitología global y como laboratorio técnico. Por eso su figura es indispensable incluso cuando no estaba detrás de cámara.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio honorífico de producción' },
			{ label: 'Huella', value: 'Revolución industrial' },
			{ label: 'Pulso', value: 'Mito pop global' },
		],
		awards: [
			{ label: 'Oscar', category: 'Premio Irving G. Thalberg', work: 'Trayectoria como productor', year: 1991 },
		],
		knownFor: [
			'star-wars-episode-iv-a-new-hope-1977',
			'star-wars-episode-i-the-phantom-menace-1999',
			'star-wars-episode-ii-attack-of-the-clones-2002',
			'star-wars-episode-iii-revenge-of-the-sith-2005',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/George-Lucas',
			'https://www.lucasfilm.com/who-we-are/george-lucas/',
			'https://www.oscars.org/oscars/ceremonies/1992',
		],
	},
	'peter-jackson': {
		slug: 'peter-jackson',
		name: 'Peter Jackson',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Peter%20Jackson%20ONZ%20(cropped).jpg?width=640',
		headline:
			'Director neozelandés que llevó la fantasía épica a una escala pocas veces vista y convirtió una sensibilidad geek en cine masivo del más alto nivel.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Pukerua Bay, Isla Norte, Nueva Zelanda',
		spotlight:
			'Pasó del gore artesanal a una de las trilogías más influyentes del siglo XXI sin perder el gusto por el detalle, el mundo construido y la aventura física.',
		biography: [
			'Peter Jackson nació el 31 de octubre de 1961 en Pukerua Bay y arrancó filmando de manera completamente autodidacta. Sus primeras películas ya mostraban una imaginación visual desaforada y una energía artesanal que después iba a escalar de forma impensada.',
			'El salto definitivo llegó con The Lord of the Rings, una apuesta gigantesca que redefinió el cine fantástico contemporáneo. La trilogía combinó ambición épica, trabajo técnico monumental y una convicción emocional que la volvió un fenómeno crítico y popular a nivel mundial.',
			'Jackson tiene un don especial para hacer tangible lo imposible. Sus películas pueden ser enormes, pero casi siempre conservan algo físico, táctil y lúdico. Esa mezcla es una parte grande de su encanto como director.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Fantasía épica' },
			{ label: 'Pulso', value: 'Aventura gigantesca' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Lord of the Rings: The Return of the King', year: 2004 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'The Lord of the Rings: The Return of the King', year: 2004 },
			{ label: 'Oscar', category: 'Mejor guion adaptado', work: 'The Lord of the Rings: The Return of the King', year: 2004 },
		],
		knownFor: [
			'the-lord-of-the-rings-the-fellowship-of-the-ring-2001',
			'the-lord-of-the-rings-the-two-towers-2002',
			'the-lord-of-the-rings-the-return-of-the-king-2003',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Peter-Jackson-New-Zealand-director',
			'https://www.oscars.org/oscars/ceremonies/2004',
			'https://www.nzonscreen.com/profile/peter-jackson/biography',
		],
	},
	'guillermo-del-toro': {
		slug: 'guillermo-del-toro',
		name: 'Guillermo del Toro',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Guillermo%20del%20Toro%20at%20the%202026%20Sundance%20Film%20Festival%2001%20(cropped).jpg?width=640',
		headline:
			'Director mexicano que volvió prestigioso al cine de monstruos sin domesticarlo, siempre mezclando imaginación visual con melancolía y política.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Guadalajara, Jalisco, México',
		spotlight:
			'Su filmografía une terror, fantasía, catolicismo, guerra y criaturas heridas en un universo visual que nadie más filma igual.',
		biography: [
			'Guillermo del Toro nació el 9 de octubre de 1964 en Guadalajara y desde muy joven estuvo obsesionado con los monstruos, el maquillaje, la imaginería católica y los cuentos oscuros. Esa mezcla se convirtió en el corazón de toda su obra.',
			'Cronos, The Devil’s Backbone, Pan’s Labyrinth, Hellboy, Pacific Rim, The Shape of Water, Nightmare Alley y Pinocchio muestran una carrera muy poco domesticable. Del Toro puede trabajar dentro de Hollywood sin perder nunca del todo su sensibilidad gótica, afectiva y monstruosa.',
			'Lo mejor de su cine aparece cuando hace convivir ternura y espanto. Sus criaturas no suelen ser simples amenazas: son cuerpos heridos, exiliados o incomprendidos. Ahí aparece toda su humanidad como autor.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Poeta de monstruos' },
			{ label: 'Pulso', value: 'Fantasía + dolor' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Shape of Water', year: 2018 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'The Shape of Water', year: 2018 },
			{ label: 'Oscar', category: 'Mejor película animada', work: "Guillermo del Toro's Pinocchio", year: 2023 },
		],
		knownFor: ['blade-ii-2002', 'the-shape-of-water-2017', 'nightmare-alley-2021', 'frankenstein-2025'],
		referenceUrls: [
			'https://www.britannica.com/biography/Guillermo-del-Toro',
			'https://www.oscars.org/oscars/ceremonies/2018',
			'https://www.oscars.org/oscars/ceremonies/2023',
		],
	},
};
