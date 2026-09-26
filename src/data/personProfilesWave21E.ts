import type { PersonProfileRecord } from '../types/person';
import { buildArgentineCatalogProfile, type ArgentineCatalogProfileSeed } from './personProfileArgentineBatchBuilder.ts';

const seeds: ArgentineCatalogProfileSeed[] = [
	{
		slug: 'alberto-ajaka', name: 'Alberto Ajaka', roles: ['Actor'],
		headline: 'Actor argentino de cine, teatro y televisión, con una carrera que enlaza el cine independiente y las producciones populares.',
		spotlight: 'Su recorrido alterna personajes de gran intensidad con papeles secundarios que sostienen el pulso de un elenco.',
		editorialBiography: [
			'Ajaka construyó una trayectoria amplia entre el teatro, la televisión y el cine. En la pantalla pasó por Historias extraordinarias, Juan y Eva, Viola y La extorsión, películas muy distintas que muestran su facilidad para integrarse a universos narrativos variados. También trabajó en comedias de elenco como Mazel Tov, donde su presencia se apoya en el ritmo y la escucha de sus compañeros.',
			'Su actuación suele partir de gestos precisos y una energía que puede cambiar de registro sin llamar la atención sobre el cambio. Esa cualidad le permitió moverse entre el cine de autor y títulos de mayor circulación, con personajes que no necesitan ocupar el centro para quedar en la memoria. Ajaka es una de esas figuras cuya continuidad ayuda a reconocer distintas etapas del audiovisual argentino reciente.',
		],
	},
	{
		slug: 'daniel-valenzuela', name: 'Daniel Valenzuela', roles: ['Actor', 'Guionista'],
		headline: 'Actor argentino de extensa trayectoria cinematográfica, asociado a personajes de carácter en dramas, policiales y comedias.',
		spotlight: 'Su presencia áspera y directa le da peso a personajes atravesados por el trabajo, la autoridad y la vida cotidiana.',
		editorialBiography: [
			'Valenzuela acumula décadas de trabajo en cine y teatro, con una filmografía que atraviesa generaciones de realizadores argentinos. Participó en La ciénaga y Tiempo de valientes, y más tarde sumó títulos como Kryptonita, Gilda: no me arrepiento de este amor y Carbón. En cada uno cambia de entorno y escala, pero mantiene una presencia inmediata, sin pulir los bordes de sus personajes.',
			'Su recorrido también incluye papeles en Respira, Pistolero y Hombre muerto, además de trabajos como guionista. Valenzuela suele aportar una tensión terrenal: incluso cuando interpreta a una figura de autoridad, deja asomar las dudas y contradicciones que la vuelven concreta. Esa naturalidad lo convirtió en un intérprete habitual de historias que miran de cerca los vínculos y los conflictos sociales.',
		],
	},
	{
		slug: 'camila-peralta', name: 'Camila Peralta', roles: ['Actriz'],
		headline: 'Actriz argentina de cine y televisión, con papeles que cruzan la comedia contemporánea y el drama íntimo.',
		spotlight: 'Su trabajo acompaña relatos muy diferentes sin perder una expresión cercana y reconocible.',
		editorialBiography: [
			'Peralta se abrió paso en el cine reciente con personajes de registros variados. En Puán participa de una comedia sobre la vida universitaria; en Hoy se arregla el mundo forma parte de una historia familiar, y en Clara se pierde en el bosque ocupa el centro de una búsqueda personal. También trabajó en Emilia y Vieja loca, dentro de una producción constante que incluye largometrajes y cortos.',
			'Su carrera todavía está en expansión, pero ya muestra una intérprete atenta a los tonos de cada película. Peralta puede integrarse a un conjunto coral o sostener un personaje que organiza el relato, y en ambos casos evita apoyarse en una sola marca expresiva. Esa flexibilidad la acerca a una nueva generación de actrices que circula entre cine de autor, comedia y producciones de alcance masivo.',
		],
	},
	{
		slug: 'luis-margani', name: 'Luis Margani', roles: ['Actor'],
		headline: 'Actor argentino de carácter, recordado por una composición popular que encontró su emblema en Mundo grúa.',
		spotlight: 'Su rostro y su cadencia aportaron una textura cotidiana a personajes que parecían llegar de la vida real.',
		editorialBiography: [
			'Margani quedó ligado para siempre a Mundo grúa, donde interpretó a Rulo, un trabajador que enfrenta la incertidumbre laboral y el paso del tiempo. La película de Pablo Trapero encontró en su actuación una mezcla de humor seco, cansancio y dignidad que acercó el relato a la experiencia diaria de muchos espectadores. Después volvió a cruzarse con personajes de la vida común en Una noche con Sabrina Love y La fuga.',
			'Su filmografía incluye también El cielo del centauro, El cazador y Doble discurso. Margani aportaba una forma de actuar sin adornos: una pausa, una mirada o una frase dicha al pasar podían definir el clima de una escena. Esa economía expresiva dejó una huella singular en el cine argentino y convirtió sus papeles en parte de la memoria del nuevo cine de los años noventa.',
		],
	},
	{
		slug: 'carlos-echevarria', name: 'Carlos Echevarría', roles: ['Actor', 'Productor'],
		headline: 'Actor y productor argentino, parte de películas que exploran la memoria, la identidad y los vínculos personales.',
		spotlight: 'Sus personajes suelen concentrar conflictos íntimos dentro de relatos de gran peso histórico o emocional.',
		editorialBiography: [
			'Echevarría debutó en el cine con Garage Olimpo, una película central sobre la última dictadura, y continuó trabajando en historias de búsquedas personales como Un año sin amor y Ausente. En estas producciones interpreta personajes que cargan con tensiones privadas y sociales, sin reducirlos a una sola explicación. Su trayectoria también incluye trabajos detrás de cámara y participación en la producción de proyectos independientes.',
			'Como actor puede moverse de un drama íntimo a un relato de género, como muestran El tercero y Lo siniestro. Sus papeles no se apoyan en una gestualidad expansiva: observa, escucha y deja que la escena revele lo que el personaje no formula. Esa sobriedad hizo que su presencia resultara especialmente eficaz en películas donde la identidad y el deseo están en disputa.',
		],
	},
	{
		slug: 'juan-barberini', name: 'Juan Barberini', roles: ['Actor', 'Guionista'], skipCineNacional: true,
		headline: 'Actor argentino ligado al cine independiente, con personajes que atraviesan deseo, amistad y cambios de identidad.',
		spotlight: 'Su interpretación trabaja desde la intimidad y encuentra matices en los silencios y las conversaciones cotidianas.',
		editorialBiography: [
			'Barberini construyó una carrera reconocida dentro del cine argentino independiente. Fue parte de El estudiante, La flor y Fin de siglo, películas que lo acercaron a formas narrativas muy distintas, desde la observación política hasta el juego con el tiempo y la memoria. En El incendio, Sangre y El cazador sostuvo personajes atravesados por vínculos intensos y decisiones que cambian el rumbo de sus vidas.',
			'Además de actuar, escribió y participó en tareas de producción y asistencia de dirección. Esa circulación por distintas áreas se refleja en un trabajo atento a la estructura de cada película y a la relación entre los intérpretes. Barberini suele evitar las respuestas obvias: sus personajes dejan ver contradicciones, y esa ambigüedad es parte de la cercanía que genera en pantalla.',
		],
		sourceUrls: ['https://cinenacional.com/persona/juan-barberini-1'],
	},
	{
		slug: 'lautaro-delgado-tymruk', name: 'Lautaro Delgado Tymruk', roles: ['Actor', 'Director', 'Dramaturgo'], skipCineNacional: true,
		headline: 'Actor, director y dramaturgo argentino de cine, teatro y televisión, reconocido por su amplitud de registros.',
		spotlight: 'Puede pasar del realismo histórico a personajes de género sin perder la complejidad de cada cuerpo y cada época.',
		editorialBiography: [
			'Delgado Tymruk trabaja desde joven en teatro, cine y televisión. En la pantalla participó en Crónica de una fuga, Revolución: el cruce de los Andes, Kryptonita y Pistolero, un recorrido que va del drama histórico al policial y al cine de género. Su transformación física y vocal le permite construir figuras muy diferentes, siempre con atención a los códigos del mundo en que se mueven.',
			'También dirige, escribe y sostiene proyectos teatrales propios, como El corazón del mundo. Esa experiencia detrás de escena convive con una actuación abierta al riesgo y a los cambios de tono. Delgado Tymruk no se fija en una sola imagen pública: cada papel vuelve a poner en juego su relación con el cuerpo, la palabra y la época que le toca representar.',
		],
		sourceUrls: [
			'https://cinenacional.com/persona/lautaro-delgado',
			'https://www.lanacion.com.ar/espectaculos/personajes/el-imparable-lautaro-delgado-tymruk-hombre-del-cine-el-teatro-y-la-tv-nid2340921/',
			'https://www.alternativateatral.com/persona406214-lautaro-delgado-tymruk',
		],
	},
	{
		slug: 'matias-mayer', name: 'Matías Mayer', roles: ['Actor', 'Cantante'],
		headline: 'Actor argentino de cine, televisión y teatro, con un recorrido que combina drama, comedia y música.',
		spotlight: 'Su formación musical suma ritmo y presencia escénica a personajes de registros muy diferentes.',
		editorialBiography: [
			'Mayer ganó visibilidad en televisión con Historia de un clan y siguió ampliando su recorrido en ficciones como Argentina, tierra de amor y venganza, Iosi, el espía arrepentido y Barrabrava. En cine participó en Un crimen argentino y El último gigante, mientras que el teatro y la música mantienen un lugar importante en su trabajo. Ese tránsito entre formatos le dio una práctica escénica versátil.',
			'Sus personajes suelen moverse entre la seguridad y la vulnerabilidad, y la actuación conserva una energía directa incluso en historias de época o de suspenso. Mayer también se formó como cantante, una faceta que afina su relación con el ritmo y la voz. En lugar de quedar asociado a un único papel televisivo, continúa construyendo una carrera con cambios de género y de escala.',
		],
		sourceUrls: ['https://www.lanacion.com.ar/espectaculos/el-lado-desconocido-de-matias-mayer-su-pasion-por-la-astrologia-y-la-biopic-del-idolo-de-boca-que-nid31032026/'],
	},
	{
		slug: 'melina-petriella', name: 'Melina Petriella', roles: ['Actriz', 'Productora'],
		headline: 'Actriz argentina de cine, televisión y teatro, con una carrera que se extiende desde la ficción juvenil hasta el drama.',
		spotlight: 'Su experiencia en distintos formatos le permite dar naturalidad a personajes que cambian de tono y generación.',
		editorialBiography: [
			'Petriella empezó a trabajar en televisión durante la década de 1990 y participó en ficciones populares como Gasoleros y Verano del 98. En cine formó parte de Esperando al Mesías, El abrazo partido y Miss Tacuarembó, películas que muestran la diversidad de su registro. También trabajó en teatro y asumió tareas de producción para proyectos audiovisuales.',
			'Su recorrido combina personajes protagónicos y apariciones que aportan textura a un elenco. En cada formato conserva una actuación cercana, capaz de transmitir una historia compartida sin forzar la emoción. Esa continuidad la convirtió en una intérprete reconocible para distintas generaciones de espectadores y le permitió seguir activa mientras la industria argentina cambiaba de canales, duraciones y modos de producción.',
		],
	},
	{
		slug: 'miriam-odorico', name: 'Miriam Odorico', roles: ['Actriz'],
		headline: 'Actriz argentina de teatro y cine, con personajes que combinan humor, calidez y una firme atención a los detalles.',
		spotlight: 'Su trabajo puede volver entrañable una figura cotidiana sin convertirla en caricatura.',
		editorialBiography: [
			'Odorico lleva décadas trabajando en teatro y cine. En la pantalla participó en Cómo funcionan casi todas las cosas, Mamá se fue de viaje, Permitidos, Kóblic y La corazonada, pasando con soltura por dramas y comedias. Sus personajes suelen tener una presencia concreta dentro del relato: hablan, observan y reaccionan como personas con una vida propia más allá de la escena.',
			'La experiencia teatral aparece en su manejo de la palabra y en la precisión con que construye pequeños gestos. Puede aportar humor sin quitarle espesor al personaje, o acompañar un momento dramático con una sobriedad que evita subrayados. Odorico forma parte de una generación de intérpretes cuyo oficio sostiene tanto el cine independiente como producciones de gran llegada popular.',
		],
	},
	{
		slug: 'cumelen-sanz', name: 'Cumelén Sanz', roles: ['Actriz', 'Productora'],
		headline: 'Actriz argentina de cine y televisión, con un recorrido que alterna dramas íntimos, comedias y relatos de género.',
		spotlight: 'Su presencia sostiene personajes jóvenes con una mezcla de vulnerabilidad y decisión.',
		editorialBiography: [
			'Sanz empezó a destacarse con Penélope, una película independiente que la puso al frente de un relato sobre deseo, arte y desencanto. Después participó en El encanto, Auxilio, Una flor en el barro y Nicaragua y Uriarte, además de sumar trabajos como productora. Su filmografía cruza la comedia y el drama con producciones de suspenso y terror.',
			'En sus interpretaciones, la intensidad suele convivir con una observación fina de los vínculos. Sanz no convierte la fragilidad de sus personajes en pasividad: aun en situaciones de incertidumbre, conserva una iniciativa propia. La variedad de sus papeles abre una carrera en expansión y la conecta con un cine argentino que renueva sus protagonistas y sus formas de contar.',
		],
	},
	{
		slug: 'sergio-boris', name: 'Sergio Boris', roles: ['Actor', 'Director', 'Dramaturgo'],
		headline: 'Actor, director y dramaturgo argentino con una obra que cruza el cine, el teatro independiente y la escritura.',
		spotlight: 'Su actuación encuentra humanidad en personajes incómodos, contradictorios y difíciles de encasillar.',
		editorialBiography: [
			'Boris construyó una extensa carrera entre el cine y el teatro. En películas como Diarios de motocicleta, El abrazo partido, Barrefondo y Sinfonía para Ana interpretó personajes de carácter que podían inclinar una escena hacia la tensión o el humor. En paralelo desarrolló una labor sostenida como director y dramaturgo, con una relación cercana a la escena independiente porteña.',
			'Como intérprete suele trabajar desde lo concreto: una forma de ocupar el espacio, una mirada sostenida o un cambio en el tono de voz alcanzan para abrir otra lectura del personaje. Esa precisión atraviesa tanto sus papeles en pantalla como el trabajo con actores en teatro. Boris mantiene una trayectoria propia dentro de un medio donde la actuación, la escritura y la dirección se alimentan entre sí.',
		],
	},
	{
		slug: 'enrique-pineyro', name: 'Enrique Piñeyro', roles: ['Director', 'Actor', 'Productor', 'Guionista'],
		headline: 'Cineasta y piloto argentino que convirtió la aviación, la seguridad y las instituciones en materia para el cine.',
		spotlight: 'Su cine de investigación transforma documentos y experiencias profesionales en relatos de tensión pública.',
		editorialBiography: [
			'Piñeyro unió su experiencia como piloto y médico con una obra cinematográfica enfocada en la aviación y sus sistemas de seguridad. Whisky Romeo Zulu dramatiza un accidente aéreo desde la mirada de quien conoce el funcionamiento interno de la industria; después, Fuerza Aérea Sociedad Anónima y El Rati Horror Show combinaron investigación, archivo y denuncia.',
			'También actuó y produjo películas como Garage Olimpo, además de participar en obras de otros realizadores. Su cine suele exponer mecanismos institucionales y dejar que los datos acumulados construyan el suspenso. Piñeyro trabaja en un territorio singular entre documental, ficción y ensayo, donde el conocimiento técnico se vuelve una herramienta narrativa y una invitación a discutir responsabilidades públicas.',
		],
	},
	{
		slug: 'gonzalo-calzada', name: 'Gonzalo Calzada', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino dedicado al cine fantástico y de terror, con una filmografía centrada en lo sobrenatural.',
		spotlight: 'Sus películas usan el género para explorar la fe, el miedo y las zonas oscuras de la experiencia cotidiana.',
		editorialBiography: [
			'Calzada se convirtió en una de las voces persistentes del cine argentino de terror. Dirigió Luisa, Resurrección y Luciferina, relatos donde el horror se enlaza con la religión, los secretos familiares y la violencia. Más tarde volvió al género con Nocturna y continuó explorando sus recursos en Lipán. Además de dirigir, escribe y produce buena parte de sus proyectos.',
			'Su trabajo aprovecha espacios reconocibles y los vuelve amenazantes de manera gradual. En lugar de depender sólo del sobresalto, construye atmósferas y deja que las dudas de los personajes se contagien al espectador. Calzada también participa de conversaciones y espacios de formación sobre cine fantástico, una actividad que acompaña el crecimiento de una comunidad argentina dedicada a esos géneros.',
		],
		sourceUrls: ['https://cineargentinohoy.com.ar/gonzalo-calzada-hay-un-apogeo-del-cine-de-genero-de-terror-en-argentina/'],
	},
	{
		slug: 'martin-hodara', name: 'Martín Hodara', roles: ['Director', 'Guionista'],
		headline: 'Director y guionista argentino de policiales y thrillers, formado en el trabajo colaborativo del cine.',
		spotlight: 'Sus relatos combinan escenarios cerrados, secretos y personajes que dudan de lo que creen saber.',
		editorialBiography: [
			'Hodara trabajó como asistente de dirección en películas de Fabián Bielinsky antes de construir su propio recorrido. Codirigió La señal junto a Ricardo Darín y más tarde dirigió Nieve negra, un thriller familiar ambientado en la Patagonia. En esos relatos, los paisajes y las casas aisladas funcionan como parte activa del conflicto, no sólo como fondo para la acción.',
			'Su cine se apoya en la información que se dosifica y en las alianzas cambiantes entre los personajes. También dirigió El hombre que amaba los platos voladores, una ficción inspirada en una historia de medios y creencias, que amplía su interés por las versiones enfrentadas de un mismo hecho. Hodara trabaja con géneros populares y los usa para organizar misterios morales y familiares.',
		],
		sourceUrls: ['https://www.radionacional.com.ar/martin-hodara-director-de-nieve-negra-habla-de-su-mas-reciente-estreno/'],
	},
	{
		slug: 'cristian-bernard', name: 'Cristian Bernard', roles: ['Director', 'Guionista', 'Productor'],
		headline: 'Director argentino que llevó el terror y el suspenso a producciones independientes de distintas escalas.',
		spotlight: 'Su filmografía sostiene una búsqueda persistente por el cine de género hecho en Argentina.',
		editorialBiography: [
			'Bernard empezó a llamar la atención con 76 89 03, codirigida con Flavio Nardini, una comedia de humor ácido que circuló como película de culto. Después se volcó al terror y al suspenso con títulos como Mala carne, El día trajo la oscuridad y Naturaleza muerta. Su carrera enlaza proyectos de bajo presupuesto con películas pensadas para un público amplio.',
			'En cada etapa aparece el interés por situaciones extremas y personajes que ponen a prueba sus propias convicciones. Bernard suele trabajar con recursos directos, buscando que la tensión surja del conflicto y no sólo del efecto visual. Su continuidad dentro del género también refleja las dificultades y la perseverancia necesarias para sostener un cine fantástico argentino con producción local.',
		],
		sourceUrls: ['https://www.infobae.com/teleshow/2026/04/27/cristian-bernard-hacer-una-pelicula-de-terror-en-argentina-es-una-epopeya/'],
	},
	{
		slug: 'natalia-meta', name: 'Natalia Meta', roles: ['Directora', 'Guionista', 'Productora'],
		headline: 'Directora, guionista y productora argentina interesada en los límites entre la realidad, la percepción y el deseo.',
		spotlight: 'Sus películas transforman preguntas íntimas en relatos abiertos a la extrañeza.',
		editorialBiography: [
			'Meta desarrolló una carrera detrás de cámara que cruza producción, escritura y dirección. Después de producir Las acacias y participar en proyectos de otros cineastas, dirigió Muerte en Buenos Aires y El prófugo. Esta última sigue a una cantante de ópera que comienza a desconfiar de la frontera entre su experiencia diaria y las historias que interpreta.',
			'Su formación en filosofía acompaña una obra atenta a la percepción, la identidad y las reglas que ordenan lo real. Meta no explica cada giro: deja que las imágenes, los sonidos y el trabajo de sus intérpretes mantengan la incertidumbre. También produjo proyectos de cine argentino contemporáneo, una tarea que amplía su influencia más allá de las películas que firma como directora.',
		],
	},
	{
		slug: 'nicolas-galvagno', name: 'Nicolás Galvagno', roles: ['Director', 'Guionista', 'Actor', 'Productor'],
		headline: 'Cineasta argentino que alterna la dirección, la actuación y la producción en películas de género.',
		spotlight: 'Su trabajo conecta el terror y el policial con una energía independiente y de bajo presupuesto.',
		editorialBiography: [
			'Galvagno se mueve entre distintas tareas del cine: dirige, escribe, produce y también actúa. En Pistolero reunió el western con una historia de violencia rural; en Legiones, el terror se mezcla con la memoria de la dictadura y la experiencia de un exorcista. Como intérprete participó en Kryptonita, Bruno Motoneta y Socios por accidente, en registros muy diferentes.',
			'Su filmografía muestra una inclinación por el cine de género y por los equipos de producción independientes. Ese modo de trabajo le permite ocupar varios lugares en una misma película y llevar una idea desde el guion hasta el montaje. Galvagno representa una generación de realizadores que usa las convenciones del terror, la acción y el fantástico para contar historias ligadas a la Argentina.',
		],
	},
	{
		slug: 'patricia-saran', name: 'Patricia Sarán', roles: ['Actriz', 'Modelo'],
		headline: 'Actriz y modelo argentina que se volvió una figura reconocible de la cultura popular de los años ochenta.',
		spotlight: 'Su imagen pública nació en la publicidad y encontró continuidad en la comedia y el cine popular.',
		editorialBiography: [
			'Sarán alcanzó una gran visibilidad en los años ochenta a partir de una campaña de jeans que quedó asociada a la publicidad televisiva de la época. Ese reconocimiento abrió una etapa de trabajo como actriz en cine, teatro y televisión. Participó en comedias populares como Los Extermineitors, donde compartió pantalla con figuras centrales del humor argentino.',
			'Su carrera permite mirar cómo la publicidad, la música y el cine se cruzaban en la cultura masiva de aquellos años. Sarán no quedó ligada únicamente a una imagen promocional: siguió construyendo una trayectoria artística y volvió a hablar públicamente de los cambios de su vida profesional. Su recorrido conserva el registro de una época y de sus formas de convertir rostros televisivos en protagonistas.',
		],
		sourceUrls: ['https://www.lanacion.com.ar/lifestyle/patricia-saran-habla-de-todo-sus-candidatos-famosos-la-imagen-de-mujer-fatal-y-el-chip-sexual-que-no-nid06042022/'],
	},
	{
		slug: 'brian-buley', name: 'Brian Buley', roles: ['Actor'],
		headline: 'Actor argentino que construyó una voz propia dentro del cine independiente y las ficciones populares.',
		spotlight: 'Su expresividad directa vuelve singulares personajes que suelen aparecer en los márgenes del relato.',
		editorialBiography: [
			'Buley empezó a trabajar en cine con Los santos sucios y Dromómanos, películas de Luis Ortega que lo acercaron a un universo de personajes desplazados y conductas imprevisibles. Luego participó en Bruno Motoneta, El amor es más fácil y producciones recientes como Sin ley. Su trayectoria se apoya en una presencia frontal, que no busca suavizar las asperezas de cada figura.',
			'Su trabajo en pantalla se reconoce por la mezcla de energía, humor y fragilidad con la que ocupa la escena. Buley pasó de proyectos independientes a ficciones de mayor alcance sin perder esa identidad interpretativa. Cada nuevo papel amplía un recorrido que todavía está en desarrollo y que aporta otras experiencias sociales al centro de las historias argentinas.',
		],
	},
];

export const argentineCatalogPerformersAndDirectorsProfilesWave21E: Record<string, PersonProfileRecord> = Object.fromEntries(
	seeds.map((seed) => [seed.slug, buildArgentineCatalogProfile(seed)]),
);
