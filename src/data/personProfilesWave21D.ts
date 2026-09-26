import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'laura-citarella', name: 'Laura Citarella', roles: ['Directora', 'Guionista', 'Productora'],
		headline: 'Directora y productora argentina que explora el misterio, el tiempo y la vida cotidiana desde el cine independiente.',
		spotlight: 'Sus películas se expanden a partir de detalles mínimos y convierten la observación en una forma de intriga.',
		editorialBiography: [
			'Citarella es una de las impulsoras de El Pampero Cine, colectivo que produjo varias obras centrales del cine argentino reciente. Dirigió Ostende y La mujer de los perros, y codirigió Trenque Lauquen, una película extensa donde una investigación personal se abre hacia nuevas historias y formas de narrar.',
			'Su trabajo como productora también acompañó películas de otros realizadores, con un modelo basado en la colaboración y la independencia. Citarella confía en la duración, los desvíos y las voces de sus personajes para que el relato cambie de forma. Esa libertad convirtió su obra en una referencia internacional del cine contemporáneo argentino.',
		],
	},
	{
		slug: 'rafael-spregelburd', name: 'Rafael Spregelburd', roles: ['Actor', 'Dramaturgo', 'Director'],
		headline: 'Actor, dramaturgo y director argentino que cruza el teatro contemporáneo con el cine y la televisión.',
		spotlight: 'Su trabajo combina humor intelectual, juego verbal y una curiosidad constante por las reglas de cada escena.',
		editorialBiography: [
			'Spregelburd es una figura central del teatro argentino contemporáneo como dramaturgo, director e intérprete. Escribió y montó obras propias, entre ellas la extensa Heptalogía de Hieronymus Bosch, y desarrolló una actuación que encuentra humor en las contradicciones del lenguaje y las ideas.',
			'En cine participó en El hombre de al lado, Los Marziano y La flor, además de dirigir y escribir películas. Su trabajo cruza disciplinas sin que el teatro funcione como un simple antecedente del cine. Esa circulación explica una carrera singular, reconocida tanto en escenarios argentinos como en producciones internacionales.',
		],
	},
	{
		slug: 'cristina-banegas', name: 'Cristina Banegas', roles: ['Actriz', 'Directora', 'Docente'],
		headline: 'Actriz y directora argentina de teatro, cine y televisión, con una trayectoria decisiva en la escena independiente.',
		spotlight: 'Su trabajo combina formación teatral, rigor interpretativo y una voz capaz de pasar del susurro a la confrontación.',
		editorialBiography: [
			'Banegas construyó una carrera extensa como actriz y directora teatral, además de participar en películas como La ciénaga y Los dos papas. Su trabajo escénico abarca clásicos, dramaturgia contemporánea y proyectos experimentales, con una atención intensa a la palabra y al cuerpo del intérprete.',
			'También fundó y sostuvo espacios de formación y producción independiente, una tarea que extendió su influencia más allá de sus papeles. En cine puede aparecer en un registro íntimo o en relatos de gran circulación, pero siempre conserva una precisión muy propia. Su trayectoria conecta distintas generaciones de artistas argentinos.',
		],
	},
	{
		slug: 'claudia-lapaco', name: 'Claudia Lapacó', roles: ['Actriz', 'Cantante'],
		headline: 'Actriz y cantante argentina de larga carrera en televisión, teatro musical y cine.',
		spotlight: 'Su oficio le permite pasar de la comedia de elenco a papeles dramáticos con una naturalidad construida durante décadas.',
		editorialBiography: [
			'Lapacó se formó en teatro y canto y trabajó desde joven en televisión, cine y comedia musical. Su carrera atravesó distintas etapas de la ficción argentina, desde programas populares hasta películas recientes como Los justos, donde comparte escena con intérpretes de varias generaciones.',
			'El paso por el musical le dio una relación particular con el ritmo y la presencia escénica, mientras que el trabajo dramático amplió su registro. Lapacó no quedó ligada a una sola época televisiva: siguió sumando personajes y obras teatrales. Su recorrido muestra la continuidad del oficio en un medio que cambia de formatos.',
		],
	},
	{
		slug: 'beatriz-spelzini', name: 'Beatriz Spelzini', roles: ['Actriz'],
		headline: 'Actriz argentina de cine y teatro, reconocida por personajes contenidos que revelan su fuerza de a poco.',
		spotlight: 'Su actuación trabaja con silencios y pequeños cambios de expresión para mostrar lo que el personaje no dice.',
		editorialBiography: [
			'Spelzini desarrolló una extensa trayectoria teatral antes de ganar mayor visibilidad en el cine. Participó en películas como El secreto de sus ojos, Las viudas de los jueves y Fragmentada, con personajes que aportan gravedad y matices a relatos de géneros distintos.',
			'En teatro interpretó obras clásicas y contemporáneas, y ese trabajo se percibe en una actuación precisa y sin gestos de más. Su presencia suele modificar el tono de una escena sin imponerse sobre el conjunto. Es parte de una generación de intérpretes cuyo oficio sostiene buena parte del cine argentino reciente.',
		],
	},
	{
		slug: 'jean-pierre-noher', name: 'Jean Pierre Noher', roles: ['Actor'],
		headline: 'Actor argentino de cine, teatro y televisión con una carrera extendida por América Latina y Europa.',
		spotlight: 'Su versatilidad le permite encarnar personajes de distintas procedencias sin perder cercanía ni precisión.',
		editorialBiography: [
			'Noher trabajó durante décadas en cine, televisión y teatro, tanto en la Argentina como en producciones de otros países. Su repertorio incluye dramas históricos, comedias y series, con papeles que aprovechan su dominio de distintos acentos y su facilidad para cambiar de registro.',
			'En La caja azul se sumó a una producción argentina reciente, mientras que trabajos anteriores lo cruzaron con directores y elencos de varias cinematografías latinoamericanas. Esa circulación internacional no lo alejó de la escena local: sigue participando de proyectos argentinos y de historias que conectan distintas comunidades.',
		],
	},
	{
		slug: 'jorge-delia', name: "Jorge D'Elía", roles: ['Actor'],
		headline: 'Actor argentino de larga trayectoria, capaz de llevar autoridad, ironía y humanidad a personajes muy distintos.',
		spotlight: 'Su experiencia teatral y televisiva aparece en una actuación que domina el ritmo sin perder naturalidad.',
		editorialBiography: [
			"D'Elía trabajó en teatro, televisión y cine desde hace varias décadas, con papeles en ficciones populares y películas de autor. En El hombre de al lado formó parte de un relato que observa la convivencia y las diferencias de clase desde una situación aparentemente menor.",
			'Su carrera incluye comedias, dramas y series donde puede ocupar el centro de la historia o sostener el conjunto desde un papel secundario. Esa amplitud viene de un oficio teatral que le permite manejar tanto la pausa como la réplica. Es una presencia familiar del audiovisual argentino, pero difícil de reducir a un solo registro.',
		],
	},
	{
		slug: 'jorge-roman', name: 'Jorge Román', roles: ['Actor'],
		headline: 'Actor argentino de gran presencia física, ligado a películas que observan la marginalidad y la vida urbana.',
		spotlight: 'Su trabajo aporta una mezcla de dureza y vulnerabilidad a personajes que suelen ser juzgados desde afuera.',
		editorialBiography: [
			'Román llamó la atención con El bonaerense, de Pablo Trapero, donde interpretó a un cerrajero que ingresa a la policía provincial y aprende sus códigos. Más tarde protagonizó El polaquito, un drama urbano filmado en las calles de Buenos Aires con una energía muy distinta del cine de estudio.',
			'También trabajó en Historias extraordinarias y en películas de directores argentinos y latinoamericanos. Sus personajes suelen cargar con el peso del entorno sin quedar reducidos a una condición social. Esa combinación de intensidad y fragilidad convirtió su presencia en una referencia del cine argentino de los años dos mil.',
		],
	},
	{
		slug: 'lorena-vega', name: 'Lorena Vega', roles: ['Actriz', 'Directora', 'Dramaturga'],
		headline: 'Actriz, directora y dramaturga argentina de teatro y cine, atenta a las voces y experiencias de los márgenes.',
		spotlight: 'Su trabajo parte de una escucha cercana y construye personajes que resisten ser convertidos en símbolos.',
		editorialBiography: [
			'Vega se formó en teatro y se destacó como actriz, directora y dramaturga. La obra Imprenteros, creada junto a su hermano Sergio, llevó una historia familiar y laboral a escena con una mezcla de archivo, humor y memoria; el proyecto también tuvo una versión audiovisual.',
			'En cine participó en El suplente, Belén y Lu & Pau, entre otras producciones, con personajes muy diferentes entre sí. Su recorrido cruza actuación, escritura y dirección sin jerarquías fijas. Esa práctica le permite acercarse a relatos sociales desde la experiencia concreta de quienes los viven.',
		],
	},
	{
		slug: 'maria-alche', name: 'María Alché', roles: ['Actriz', 'Directora', 'Guionista'],
		headline: 'Actriz y cineasta argentina que se mueve entre la interpretación, la dirección y la exploración de la memoria familiar.',
		spotlight: 'Su trabajo busca formas nuevas de narrar la intimidad y los vínculos entre generaciones.',
		editorialBiography: [
			'Alché empezó a ser reconocida como actriz en La niña santa, de Lucrecia Martel, y continuó trabajando en cine y teatro antes de dirigir su primer largometraje. Familia sumergida observa a una mujer que, tras una muerte, siente que los límites entre el pasado y el presente se vuelven inestables.',
			'Con Puan codirigió junto a Benjamín Naishtat una comedia sobre la universidad, la amistad y la competencia profesional. Su recorrido reúne actuación, escritura y dirección, y presta atención a cómo las experiencias privadas se transforman en relatos compartidos. Alché trabaja con humor y extrañeza sin separarlos del afecto.',
		],
	},
	{
		slug: 'mimi-ardu', name: 'Mimí Ardú', roles: ['Actriz'],
		headline: 'Actriz argentina de cine, televisión y teatro, con personajes que combinan humor, calidez y carácter.',
		spotlight: 'Su presencia puede ser excéntrica o cotidiana, pero siempre deja un detalle propio en la escena.',
		editorialBiography: [
			'Ardú desarrolló una extensa carrera en teatro, cine y televisión, con papeles en películas como Un oso rojo, El cielito y Los delincuentes. Su actuación suele aportar humor y humanidad a personajes que acompañan el relato sin quedar en un segundo plano emocional.',
			'También participó en ficciones televisivas de gran audiencia y en obras teatrales, construyendo una familiaridad con públicos de varias generaciones. La variedad de sus trabajos muestra una intérprete abierta a tonos distintos, desde la comedia popular hasta el drama independiente. Su oficio se reconoce en la precisión con que entra y sale de cada personaje.',
		],
	},
	{
		slug: 'monica-lairana', name: 'Mónica Lairana', roles: ['Actriz', 'Directora', 'Guionista'],
		headline: 'Actriz y directora argentina que combina actuación intensa con películas sobre cuerpos, trabajo y autonomía.',
		spotlight: 'Su cine mira de frente experiencias difíciles sin convertir a sus protagonistas en casos ejemplares.',
		editorialBiography: [
			'Lairana trabajó como actriz en cine y teatro y después pasó a la dirección con una mirada propia. El cortometraje Rosa obtuvo reconocimiento internacional y anticipó temas que reaparecieron en Mujer conejo y La cama: el cuerpo, el trabajo, la edad y las formas de decidir sobre la propia vida.',
			'Sus películas evitan explicaciones fáciles y se apoyan en actuaciones de gran entrega. La cama observa una relación en su etapa final desde un espacio doméstico y un tiempo casi real. Como directora, guionista y actriz, Lairana construye relatos que acercan al espectador a experiencias poco representadas en el cine comercial.',
		],
	},
	{
		slug: 'oscar-ferreiro', name: 'Oscar Ferreiro', roles: ['Actor'],
		headline: 'Actor argentino de teatro, cine y televisión, recordado por personajes intensos y de marcada autoridad.',
		spotlight: 'Su presencia podía ser amenazante o afectuosa, siempre sostenida por una gran claridad de composición.',
		editorialBiography: [
			'Ferreiro tuvo una extensa carrera en teatro y televisión, con trabajos que lo volvieron una cara familiar de la ficción argentina. Participó en películas como La noche de los lápices y Cruzadas, y en series donde interpretó desde figuras de poder hasta personajes atravesados por conflictos íntimos.',
			'Su actuación se apoyaba en una voz y una presencia escénica muy reconocibles, pero podía modularlas con sutileza según el relato. El recorrido entre cine, teatro y televisión muestra la amplitud de un actor que trabajó durante décadas. Falleció en 2014; sus interpretaciones continúan circulando en reposiciones y archivos audiovisuales.',
		],
	},
	{
		slug: 'pablo-cedron', name: 'Pablo Cedrón', roles: ['Actor', 'Director', 'Guionista'],
		headline: 'Actor, director y guionista argentino de una obra personal que cruzó el cine independiente y la televisión.',
		spotlight: 'Sus personajes tienen una presencia austera y un humor seco, incluso cuando atraviesan situaciones extremas.',
		editorialBiography: [
			'Cedrón fue actor desde joven y desarrolló una carrera que pasó por películas como Felicidades, El aura e Historias extraordinarias. Su trabajo podía ser frontal o enigmático, con una manera de ocupar el encuadre que no buscaba simpatía inmediata y encontraba humor en los bordes del drama.',
			'También escribió y dirigió proyectos propios, además de participar en televisión y teatro. Su colaboración con cineastas argentinos de distintas generaciones lo conectó con estilos muy variados. Falleció en 2017, pero dejó una filmografía y una presencia actoral que siguen siendo reconocibles para el público local.',
		],
	},
	{
		slug: 'peto-menahem', name: 'Peto Menahem', roles: ['Actor', 'Comediante', 'Guionista'],
		headline: 'Actor, comediante y guionista argentino que llevó el humor de la improvisación a la televisión, el teatro y el cine.',
		spotlight: 'Su comicidad parte de una escucha rápida y de personajes que parecen desarmar el libreto mientras lo están diciendo.',
		editorialBiography: [
			'Menahem se formó en el humor y la improvisación, y se volvió una presencia reconocida en televisión y teatro. Integró el grupo Los Macocos y trabajó en comedias donde el ritmo verbal y la relación con el público ocupan un lugar central.',
			'En cine alternó papeles en historias corales y comedias, además de escribir para distintos formatos. Su trabajo en Los justos lo acerca a un elenco que explora las pequeñas tensiones de un grupo, mientras que sus proyectos teatrales muestran un costado más cercano al absurdo. La improvisación es una herramienta, no un reemplazo de la composición.',
		],
	},
	{
		slug: 'rodrigo-noya', name: 'Rodrigo Noya', roles: ['Actor'],
		headline: 'Actor argentino que pasó de la fama infantil a una carrera adulta en cine, televisión y teatro.',
		spotlight: 'Su trayectoria muestra el desafío de crecer frente a una audiencia que ya conoce al actor desde chico.',
		editorialBiography: [
			'Noya se hizo conocido de niño por sus participaciones en televisión y por películas como Valentín, de Alejandro Agresti. Su expresividad y su sentido del humor lo convirtieron rápidamente en un rostro popular, pero la carrera continuó después de aquella primera etapa de fama.',
			'Con el tiempo trabajó en comedias, dramas y teatro, construyendo personajes adultos que no dependen de la nostalgia por sus papeles iniciales. Su recorrido refleja una transición poco sencilla dentro de la industria: pasar de niño actor a intérprete con proyectos propios. Noya sigue activo en ficciones y producciones para distintos públicos.',
		],
	},
	{
		slug: 'valeria-lois', name: 'Valeria Lois', roles: ['Actriz'],
		headline: 'Actriz argentina de teatro y cine, reconocida por su capacidad para combinar humor, fragilidad y carácter.',
		spotlight: 'Su actuación transforma personajes cotidianos en personas imprevisibles y profundamente humanas.',
		editorialBiography: [
			'Lois desarrolló una carrera teatral destacada antes de ganar mayor visibilidad en el cine. Trabajó en La mujer de los perros, Los delincuentes y Las siamesas, películas que muestran su facilidad para pasar de la observación mínima al humor incómodo y al drama.',
			'Su presencia suele aportar una energía particular a los elencos, incluso cuando el papel ocupa poco tiempo de pantalla. En teatro recibió reconocimiento por trabajos de gran exigencia y continúa alternando escena y cámara. La trayectoria de Lois confirma la importancia de los actores que construyen personajes desde el detalle, no desde el protagonismo.',
		],
	},
	{
		slug: 'viviana-saccone', name: 'Viviana Saccone', roles: ['Actriz'],
		headline: 'Actriz argentina de televisión, cine y teatro, con papeles que van del melodrama al thriller.',
		spotlight: 'Su trabajo combina una presencia clásica de estrella televisiva con una atención precisa al conflicto del personaje.',
		editorialBiography: [
			'Saccone se hizo conocida en la televisión de los años noventa y sostuvo una carrera extensa en ficciones, teatro y cine. Participó en películas como El secreto de sus ojos y en numerosas series, alternando protagonistas y personajes de reparto con fuerte presencia dramática.',
			'El trabajo teatral le dio un registro amplio, mientras que la televisión la acercó a públicos masivos. Esa combinación le permitió permanecer activa a través de cambios en los formatos y las plataformas. Su carrera muestra una intérprete capaz de acompañar tanto relatos íntimos como historias de suspenso y melodrama.',
		],
	},
	{
		slug: 'silvia-kutika', name: 'Silvia Kutika', roles: ['Actriz'],
		headline: 'Actriz argentina de teatro, cine y televisión, con décadas de trabajo en ficciones populares.',
		spotlight: 'Su experiencia le permite cambiar de tono y generación sin perder la precisión de una actriz formada en escena.',
		editorialBiography: [
			'Kutika comenzó a actuar en teatro y se volvió conocida por sus papeles en televisión, donde participó en telenovelas y comedias de amplia audiencia. También trabajó en cine y sostuvo una trayectoria escénica que le permitió explorar personajes de registros muy diferentes.',
			'En sus proyectos más recientes alterna series, teatro y producciones cinematográficas. Su presencia suele aportar equilibrio al elenco y una experiencia visible en el manejo del ritmo dramático. La continuidad de su carrera muestra el trabajo de una intérprete que atravesó varias etapas de la ficción argentina sin quedar asociada a una sola época.',
		],
	},
	{
		slug: 'magui-bravi', name: 'Magui Bravi', roles: ['Actriz', 'Productora', 'Bailarina'],
		headline: 'Actriz, productora y bailarina argentina que pasó de la televisión y la danza al cine de género.',
		spotlight: 'Su experiencia corporal en la danza se convirtió en una herramienta expresiva para el terror y la acción.',
		editorialBiography: [
			'Bravi empezó a ser conocida por la danza y la televisión, y después buscó papeles en cine, sobre todo en producciones de terror. Los olvidados: cicatrices y Hot Line la acercaron a un género que exige presencia física y una relación intensa con el espacio.',
			'También participó como productora, ampliando su trabajo detrás de cámara y dentro de proyectos independientes. Ese recorrido combina espectáculo popular con una apuesta por el cine fantástico argentino. La actuación le permitió llevar el entrenamiento corporal a personajes y situaciones muy distintos de los formatos donde se hizo conocida.',
		],
	},
	{
		slug: 'fernanda-mistral', name: 'Fernanda Mistral', roles: ['Actriz'],
		headline: 'Actriz argentina de larga carrera en cine, teatro y televisión, reconocida por su presencia dramática.',
		spotlight: 'Su trabajo atraviesa clásicos del cine nacional y ficciones populares, con una voz y una presencia inconfundibles.',
		editorialBiography: [
			'Mistral comenzó a actuar en teatro y televisión en los años cincuenta y mantuvo una carrera extensa en cine. Participó en películas como La Patagonia rebelde y Kamchatka, dentro de historias que recorren épocas y conflictos muy distintos de la Argentina.',
			'También fue una figura habitual de las telenovelas y de la escena teatral. Su actuación combina intensidad y claridad, y puede sostener personajes de gran autoridad o momentos de intimidad. La continuidad de su trayectoria permite seguir cambios de estilo y de industria a través de varias generaciones.',
		],
	},
	{
		slug: 'pablo-novak', name: 'Pablo Novak', roles: ['Actor'],
		headline: 'Actor argentino de cine, teatro y televisión, recordado por personajes de comedia y ficción juvenil.',
		spotlight: 'Su recorrido alterna la familiaridad de la televisión con papeles de cine y teatro de otros registros.',
		editorialBiography: [
			'Novak empezó a trabajar en televisión desde joven y se hizo conocido por ficciones populares y programas familiares. Su carrera incluye comedia, drama y teatro, con personajes que lo conectaron con públicos de distintas edades.',
			'En cine participó en producciones argentinas de elencos numerosos, mientras continuó sumando trabajos en series y escenarios. Esa movilidad entre formatos caracteriza una trayectoria sostenida más allá de sus papeles iniciales. Su presencia aporta familiaridad y oficio a relatos que necesitan conectar rápido con el espectador.',
		],
	},
	{
		slug: 'eugenia-alonso', name: 'Eugenia Alonso', roles: ['Actriz'],
		headline: 'Actriz argentina de teatro y cine, asociada a películas de observación social y vínculos familiares.',
		spotlight: 'Su actuación precisa trabaja con silencios y reacciones, y deja espacio para que el espectador lea la escena.',
		editorialBiography: [
			'Alonso desarrolló una carrera teatral antes de participar en películas como El hombre de al lado, Los Marziano y El patrón: radiografía de un crimen. Sus personajes suelen formar parte de historias que miran de cerca las relaciones sociales y los conflictos domésticos.',
			'En cine aporta una presencia naturalista que sostiene los mundos narrados sin subrayar su función. También trabajó en televisión y continúa vinculada a la escena. Su recorrido muestra cómo una actriz puede dejar una marca fuerte desde personajes de reparto y una composición atenta al detalle.',
		],
	},
];

export const argentineEstablishedPerformersProfilesWave21D: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
