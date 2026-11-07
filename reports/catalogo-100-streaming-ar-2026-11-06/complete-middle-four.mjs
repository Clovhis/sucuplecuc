import { readFile, writeFile } from 'node:fs/promises';

const entries = [
	{
		slug: 'ni-idea-1995',
		fields: {
			synopsis: 'Cher Horowitz, una adolescente de Beverly Hills que está convencida de saber qué le conviene a todo el mundo, se dedica a hacer de celestina entre sus docentes y a transformar a la recién llegada Tai. Cuando sus planes no salen como esperaba, empieza a revisar sus propias certezas.',
			releaseDate: '1995-12-07',
			reviewPublishedAt: '2026-11-06',
			audienceRating: '+13',
			category: 'Comedia',
			genres: ['Comedia', 'Romance', 'Coming of age'],
			subgenres: [],
			poster: 'https://www.impawards.com/1995/posters/clueless_xlg.jpg',
			trailerYoutubeId: 'Mgjwq1ZzdPQ',
			releasePlatform: 'Paramount Plus',
			director: 'Amy Heckerling',
			mainCast: ['Alicia Silverstone', 'Brittany Murphy', 'Paul Rudd'],
			productionCompany: 'Paramount Pictures, Robert Lawrence Productions, Scott Rudin Productions',
			cinepostaScore: 8,
			awards: { wins: [] },
			editorial: {
				tenSecondTake: {
					verdict: 'Amy Heckerling toma la seguridad de Cher y la vuelve un espejo amable para mirar el privilegio adolescente sin pinchar cada chiste.',
					whatToExpect: 'Un Beverly Hills de colores, agendas románticas, cambios de look y una Cher convencida de que puede ordenar la vida de todo el mundo.',
					pace: 'Salta de plan en plan con diálogos veloces y escenas que dejan respirar el chiste antes de seguir.',
					intensity: 'Los tropiezos son sociales y amorosos; la incomodidad queda dentro de un humor liviano, sin dramatismo pesado.',
					practicalContext: 'Conviene prestar atención al vocabulario y al vestuario: los dos envejecieron como parte del retrato de época, no como decoración.',
					forFansOf: 'Relecturas juveniles de Jane Austen, comedias de secundaria y protagonistas que tardan en descubrir sus propios puntos ciegos.',
					notForYouIf: 'Te cansan el slang noventoso, la moda como motor de trama o una heroína rica que aprende de a poco.'
				},
				becauseYouLiked: ['academia-rushmore-1998', 'princesa-por-sorpresa-2001'],
				related: ['algo-pasa-con-mary-1998', 'escuela-de-rock-2003', 'mujer-bonita-1990']
			},
			review: 'Amy Heckerling convierte Emma, de Jane Austen, en una comedia de Beverly Hills que entiende a Cher sin absolverla. Alicia Silverstone carga con la seguridad y la ingenuidad del personaje; Brittany Murphy y Stacey Dash arman el contrapeso que vuelve al grupo algo más que una vidriera de moda. La puesta, de colores limpios y cortes ágiles, usa los cambios de look como pequeñas decisiones de puesta en escena. A más de tres décadas, la sátira funciona porque también sabe cuidar el afecto entre sus personajes.'
		}
	},
	{
		slug: 'yo-robot-2004',
		fields: {
			synopsis: 'En el Chicago de 2035, el detective Del Spooner investiga la muerte de un científico vinculado con una compañía de robótica. Su desconfianza hacia las máquinas lo lleva a cuestionar las reglas que deberían mantenerlas bajo control.',
			releaseDate: '2004-07-29',
			reviewPublishedAt: '2026-11-06',
			audienceRating: 'ATP',
			category: 'Ciencia ficcion',
			genres: ['Ciencia ficcion', 'Accion', 'Thriller'],
			subgenres: [],
			poster: 'https://www.impawards.com/2004/posters/i_robot_xlg.jpg',
			trailerYoutubeId: '7Dlo-VB0-HI',
			releasePlatform: 'Disney Plus',
			director: 'Alex Proyas',
			mainCast: ['Will Smith', 'Bridget Moynahan', 'Bruce Greenwood'],
			productionCompany: 'Laurence Mark Productions, 20th Century Fox, Overbrook Entertainment, Davis Entertainment',
			cinepostaScore: 7,
			awards: { wins: [] },
			editorial: {
				tenSecondTake: {
					verdict: 'Proyas arma un thriller policial de futuro con ideas sobre obediencia y control; la acción tiene empuje, aunque el guion no conserva siempre la misma precisión.',
					whatToExpect: 'Un detective que desconfía de los robots, una muerte sospechosa y Sonny, un androide que se sale de las respuestas previsibles.',
					pace: 'Alterna investigación y persecuciones; una vez que aparece la conspiración, la trama acelera y deja menos espacio para la pregunta que abrió.',
					intensity: 'Incluye peleas, accidentes y amenaza tecnológica con tono de aventura de ciencia ficción para adolescentes y adultos.',
					practicalContext: 'La película toma mucha libertad con los relatos de Asimov; funciona mejor como policial de ciencia ficción que como adaptación directa.',
					forFansOf: 'Thrillers tecnológicos, policiales futuristas y el contraste entre un investigador escéptico y un personaje artificial curioso.',
					notForYouIf: 'Buscás una adaptación fiel a los cuentos de Asimov o una película que deje todas sus preguntas filosóficas abiertas.'
				},
				becauseYouLiked: ['minority-report-2002', 'a-i-artificial-intelligence-2001'],
				related: ['ex-machina-2014', 'los-mitchell-contra-las-maquinas-2021', 'the-truman-show-1998']
			},
			review: 'Alex Proyas filma el futuro de Yo, Robot con superficies pulidas que no alcanzan a borrar el costado de policial: el detective de Will Smith entra a una muerte sospechosa y empieza a desconfiar de las reglas que sostienen la ciudad. La película se despega bastante de Asimov, pero gana cuando Alan Tudyk vuelve a Sonny algo más que una proeza digital. Entre la intriga y el golpe de acción, el tramo final se acelera más de la cuenta.'
		}
	},
	{
		slug: 'maxima-velocidad-1994',
		fields: {
			synopsis: 'El policía Jack Traven intenta salvar a los pasajeros de un colectivo urbano que explotará si baja de velocidad. Annie, una pasajera que debe tomar el volante, queda en el centro de una carrera por Los Ángeles mientras Jack busca al responsable de la bomba.',
			releaseDate: '1994-06-16',
			reviewPublishedAt: '2026-11-06',
			audienceRating: '+13',
			category: 'Accion',
			genres: ['Accion', 'Thriller'],
			subgenres: [],
			poster: 'https://www.impawards.com/1994/posters/speed_ver2_xlg.jpg',
			trailerYoutubeId: '8piqd2BWeGI',
			releasePlatform: 'Disney Plus',
			director: 'Jan de Bont',
			mainCast: ['Keanu Reeves', 'Sandra Bullock', 'Dennis Hopper', 'Jeff Daniels'],
			productionCompany: '20th Century Fox',
			cinepostaScore: 8,
			awards: { wins: [] },
			editorial: {
				tenSecondTake: {
					verdict: 'Una premisa de una sola línea se convierte en un reloj de acción: Jan de Bont sostiene el suspenso con geografía clara y un elenco que hace creíble el apuro.',
					whatToExpect: 'Un colectivo con una bomba, un policía que intenta mantenerlo en marcha y Annie, una pasajera que termina al volante.',
					pace: 'La película casi no se detiene; cada tramo agrega un obstáculo concreto y la edición hace legible el espacio aun en plena carrera.',
					intensity: 'Amenazas, choques y peligro sostenido, con el pulso de un thriller de acción sin pausa larga.',
					practicalContext: 'El suspenso depende de entender dónde está cada persona y qué puede fallar; el montaje mantiene esa claridad incluso cuando todo se complica.',
					forFansOf: 'Acción de alto concepto, parejas protagonistas con química y películas donde una regla sencilla sostiene el peligro.',
					notForYouIf: 'Preferís un thriller contemplativo, una trama realista o un ritmo que reserve pausas largas entre escenas de tensión.'
				},
				becauseYouLiked: ['el-fugitivo-1993', 'la-roca-1996'],
				related: ['arma-letal-1987', 'busqueda-frenetica-1988', 'mission-impossible-1996']
			},
			review: 'Máxima velocidad arranca con una idea de una sola línea y la trata como un reloj: cada parada del colectivo suma un problema que la edición tiene que resolver antes de que la tensión afloje. Keanu Reeves lleva el pulso serio y Sandra Bullock aporta una humanidad torpe que evita que el viaje quede en pura mecánica; Dennis Hopper empuja la amenaza con una calma desagradable. Jan de Bont entiende que el espectáculo aquí es sostener el movimiento, no acumular explosiones.'
		}
	},
	{
		slug: 'riesgo-en-el-aire-1997',
		fields: {
			synopsis: 'El exsoldado Cameron Poe espera volver con su familia después de salir de prisión, pero queda a bordo de un avión de traslado cuando un grupo de reclusos toma el control. El agente Vince Larkin intenta coordinar una respuesta mientras Poe busca una manera de detener el secuestro desde adentro.',
			releaseDate: '1997-06-05',
			reviewPublishedAt: '2026-11-06',
			audienceRating: '+18',
			category: 'Accion',
			genres: ['Accion', 'Crimen', 'Thriller'],
			subgenres: [],
			poster: 'https://www.impawards.com/1997/posters/con_air_ver2_xlg.jpg',
			trailerYoutubeId: 'Olvpk5BXWCI',
			releasePlatform: 'Disney Plus',
			director: 'Simon West',
			mainCast: ['Nicolas Cage', 'John Cusack', 'John Malkovich', 'Ving Rhames'],
			productionCompany: 'Runway Pictures, Touchstone Pictures, Kouf/Bigelow Productions, Jerry Bruckheimer Films, Hiett Designs of Las Vegas',
			cinepostaScore: 8,
			awards: { wins: [] },
			editorial: {
				tenSecondTake: {
					verdict: 'Simon West convierte una premisa de fuga aérea en acción desatada y sabe que la gracia está en la exageración, con Cage como centro afectivo de un elenco de villanos memorables.',
					whatToExpect: 'Un vuelo lleno de reclusos peligrosos, un exsoldado que quiere volver a casa y una cadena de decisiones cada vez más disparatadas.',
					pace: 'Encadena conflictos a bordo y en tierra con pausas breves para que el reparto marque carácter antes del siguiente estallido.',
					intensity: 'Violencia de acción, armas y peligro constante; tiene un tono espectacular que no busca realismo estricto.',
					practicalContext: 'Funciona mejor como aventura de acción desmesurada; sus licencias de guion son parte del tono y no un intento de retrato realista.',
					forFansOf: 'El cine de acción noventoso, el elenco coral y las películas que mezclan peligro con humor negro.',
					notForYouIf: 'Necesitás que cada giro sea verosímil o que la violencia se mantenga fuera de cuadro.'
				},
				becauseYouLiked: ['la-roca-1996', 'cara-a-cara-1997'],
				related: ['arma-letal-1987', 'mission-impossible-1996', 'el-fugitivo-1993']
			},
			review: 'Riesgo en el aire reúne a Cage, Cusack y Malkovich en una película que entiende su propia exageración. Simon West encadena la fuga, el choque de personalidades y los aterrizajes imposibles con el pulso de una historieta de acción; el contraste de Cage como exsoldado que quiere volver a casa le da un centro afectivo a tanto metal y humo. Steve Buscemi se queda con uno de sus desvíos más memorables, sin convertirlo en otro villano de manual.'
		}
	}
];

for (const { slug, fields } of entries) {
	const file = `src/data/movies/${slug}.json`;
	const movie = JSON.parse(await readFile(file, 'utf8'));
	Object.assign(movie, fields);
	await writeFile(file, `${JSON.stringify(movie, null, '\t')}\n`, 'utf8');
	console.log(`${slug}: completed; catalogAddedAt=${movie.catalogAddedAt}`);
}
