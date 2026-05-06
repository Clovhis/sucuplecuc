import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const TARGET_COUNT = 80;
const MIN_REVIEW_WORDS = 120;
const MIN_SYNOPSIS_WORDS = 25;
const REFERENCE_DATE = new Date('2026-05-06T00:00:00Z');

const customReviews = {
	'el-diablo-viste-a-la-moda-2-2026':
		'A El diablo viste a la moda 2 le conviene entrarle como reencuentro, no como revolución. La gracia está en volver al ecosistema de Runway con Miranda, Andy y Emily ya corridas de aquel primer choque entre ingenuidad, ambición y cinismo. Cuando la película se apoya en el veneno de oficina, el vestuario, la mirada filosa sobre la moda y el placer de ver a esas actrices midiendo fuerzas, camina. Cuando intenta convertir cada escena en comentario sobre el fin de las revistas impresas, se pone más explicativa de lo necesario. Meryl Streep, Anne Hathaway y Emily Blunt siguen siendo el motivo fuerte, más que la trama. El PASABLE sale de esa mezcla: da nostalgia, tiene momentos con brillo y entiende qué quiere ver el público, pero no siempre recupera la mordida compacta de la original. Va si querés volver a ese mundo sin pedirle una secuela imprescindible; si necesitás una continuación que justifique cada minuto, puede quedarte corta.',
	'drop-2025':
		'Drop funciona porque entiende el tamaño de su juguete: una cita, un teléfono, mensajes cada vez más turbios y una protagonista que no puede salir corriendo sin pagar un costo enorme. No intenta parecer más grande de lo que es, y esa decisión le juega a favor. Christopher Landon arma un thriller de encierro con reglas simples, tensión directa y un uso bastante eficaz de la incomodidad social: sonreír en la mesa mientras todo alrededor se vuelve una amenaza. Meghann Fahy sostiene muy bien esa mezcla de pánico, cálculo y vergüenza pública, que es lo que separa a la película de un ejercicio cualquiera de “celular maldito”. El veredicto de ESTA BUENA viene de ahí: no reinventa el género, pero sí lo ejecuta con ritmo y sin mucha grasa. Puede perder fuerza si le exigís lógica quirúrgica en cada giro, aunque como plan nocturno cumple de sobra. Va especialmente si querés suspenso corto, claro y con una premisa que se entiende en treinta segundos.',
	'a-minecraft-movie-2025':
		'A Minecraft Movie tiene el problema clásico de varias adaptaciones de marca: reconoce los bloques, los chistes visuales y la iconografía, pero tarda bastante en encontrar una película adentro. Para quien ama el juego, hay guiños y criaturas suficientes como para señalar la pantalla; para quien entra buscando aventura con peso propio, la experiencia se vuelve más ruidosa que divertida. Jack Black y Jason Momoa intentan levantar el tono desde la energía, pero muchas escenas parecen armadas para pasar de una referencia a la siguiente antes de que algo respire. El NO LA MIRES no sale por desprecio al universo Minecraft, sino porque la película confunde familiaridad con gracia. Cuando una adaptación depende tanto de que ya traigas cariño desde afuera, el relato queda flaco. Puede servir como plan infantil o de curiosidad familiar, pero si esperás una comedia de aventuras con timing, sorpresa y personajes memorables, conviene bajar mucho la expectativa.',
	'28-years-later-2025':
		'28 Years Later vuelve a ese mundo infectado sin tratarlo como una simple excusa para correr más rápido y gritar más fuerte. Lo que mejor le sale es recuperar la sensación de amenaza física, pero también el cansancio moral de una sociedad que ya aprendió a convivir con el desastre. Danny Boyle y Alex Garland entienden que el terror funciona más cuando hay comunidad, pérdida y reglas rotas alrededor de los ataques. La película tiene imágenes ásperas, momentos de mucha tensión y una idea clara de herencia: no mira el brote como novedad, sino como una cicatriz que cambió la forma de crecer, criar y sobrevivir. MUY BUENA porque no se queda en nostalgia y porque usa el regreso para empujar el mundo hacia otro lugar. Puede no ser la entrega más pareja de la saga, pero tiene personalidad, nervio y una incomodidad que queda resonando. Si buscás terror postapocalíptico con algo más que sustos, entra muy bien.',
	'black-bag-2025':
		'Black Bag es de esas películas que parecen chicas hasta que empezás a mirar cómo cada conversación mueve una ficha. Steven Soderbergh se divierte con el espionaje elegante, pero lo mejor no está en la pirotecnia sino en la sospecha doméstica: gente entrenada para mentir que, aun así, necesita creerle a alguien. Cate Blanchett y Michael Fassbender le dan a la película una temperatura fría, casi quirúrgica, donde una pausa pesa tanto como una amenaza. El thriller funciona porque no subraya todo; deja que el espectador junte gestos, contradicciones y silencios. MUY BUENA si te gustan las intrigas adultas, secas, con diálogos tensos y poco interés en explicar de más. Puede frustrar a quien espere acción explosiva o revelaciones enormes cada diez minutos. Acá el placer está en el control: en ver cómo una relación de pareja se vuelve tablero de inteligencia sin perder del todo el costado humano.',
	'companion-2025':
		'Companion arranca con pinta de thriller de fin de semana y enseguida muestra que su gracia está en ir cambiando el piso bajo los personajes. La película mezcla ciencia ficción, humor negro y paranoia romántica sin ponerse solemne, algo que le permite jugar con temas bastante actuales sin sonar a sermón. Sophie Thatcher encuentra un registro muy preciso: fragilidad al principio, desconcierto después y una energía cada vez más incómoda cuando la historia revela de qué está hecha. Jack Quaid también suma porque entiende el costado patético del control, no sólo el amenazante. MUY BUENA porque usa una premisa de alto concepto para hablar de deseo, manipulación y autonomía con bastante filo pop. No todo sorprende igual y alguna vuelta se ve venir, pero el ritmo acompaña y la película sabe cuándo apretar. Es ideal si querés algo oscuro, entretenido y con más mala leche de la que parece.',
	'ballerina-2025':
		'Ballerina vive a la sombra de John Wick, y la película lo sabe. Lo interesante es que no intenta esconder esa deuda: trabaja dentro de ese mundo de reglas absurdas, hoteles, deudas de sangre y asesinos con modales, pero le da a Ana de Armas un recorrido más físico que mítico. Cuando la acción se ensucia y la cámara deja que el golpe se sienta, la película levanta. Cuando se queda explicando conexiones con la franquicia, pierde algo de filo y parece más preocupada por acomodarse en el mapa que por respirar sola. ESTA OK porque tiene escenas con oficio, presencia y violencia coreografiada con ganas, aunque no siempre alcanza la elegancia brutal de las mejores entregas de Wick. Va si querés más de ese universo y te alcanza con una variación sólida. Si buscás una protagonista con una identidad tan fuerte como la saga madre, probablemente te deje a mitad de camino.',
	'f1-the-movie-2025':
		'F1: The Movie funciona mejor cuando se entrega al vértigo de la pista y deja que el ruido, la velocidad y la presión mecánica hablen por sí solos. Joseph Kosinski sabe filmar máquinas, cuerpos y riesgo con una limpieza que vuelve atractivo incluso lo que podría ser puro spot publicitario. Brad Pitt aporta carisma de veterano cansado, y la dinámica con Damson Idris le da a la película un eje generacional bastante claro. Lo que la vuelve ESTA MUY BIEN no es la originalidad del relato, porque varias curvas dramáticas son previsibles, sino la eficacia con la que vende la experiencia de estar adentro de ese circo. Cuando se pone demasiado solemne sobre segundas oportunidades, pierde agarre; cuando vuelve al auto, recupera pulso. Es una buena opción para pantalla grande o para mirar con volumen alto, sobre todo si te atraen las películas deportivas que hacen del oficio una cuestión casi física.',
	'captain-america-brave-new-world-2025':
		'Captain America: Brave New World carga con una misión difícil: convertir a Sam Wilson en centro absoluto de una franquicia que todavía arrastra fantasmas de etapas anteriores. Anthony Mackie tiene presencia y convicción, pero la película lo rodea de una trama política demasiado armada, con conflictos que parecen más preocupados por ordenar piezas del universo Marvel que por construir tensión real. Harrison Ford suma peso, aunque varias escenas se sienten empujadas por obligación de continuidad. El NO LA MIRES viene de esa sensación de producto cansado: hay acción, hay discursos, hay amenazas globales, pero falta una urgencia emocional que justifique el regreso. No es imposible de ver, simplemente queda deslucida y demasiado pendiente de explicar dónde está parada. Puede interesar a completistas de Marvel; para alguien que busca aventura con identidad propia, se siente más como trámite que como película necesaria.',
};

const openerTemplates = [
	(movie) => `${movie.title} funciona mejor cuando se la mira por el pulso de sus escenas y no por la promesa del póster.`,
	(movie) => `Lo primero que hay que saber de ${movie.title} es que su atractivo depende mucho del tono que propone.`,
	(movie) => `${movie.title} tiene una idea bastante clara de qué clase de experiencia quiere vender.`,
	(movie) => `Hay películas que se explican por trama; ${movie.title}, en cambio, se entiende mejor por clima y ritmo.`,
	(movie) => `${movie.title} entra por una premisa reconocible, pero se juega de verdad en los detalles de ejecución.`,
	(movie) => `Con ${movie.title}, la pregunta no es sólo de qué trata, sino cuánto sostiene esa promesa una vez que arranca.`,
	(movie) => `${movie.title} se apoya en un gancho simple y trata de convertirlo en una experiencia con personalidad.`,
	(movie) => `La gracia de ${movie.title} está en ver si su mundo propio alcanza para algo más que una buena primera impresión.`,
	(movie) => `${movie.title} no pide demasiada explicación previa: se para sobre su género y avanza desde ahí.`,
	(movie) => `Lo más interesante de ${movie.title} aparece cuando deja de vender concepto y empieza a trabajar tensión, humor o emoción.`,
	(movie) => `${movie.title} tiene el tipo de premisa que puede sonar más fuerte de lo que finalmente es la película.`,
	(movie) => `A ${movie.title} le conviene entrar sin pedirle perfección, pero sí una mirada clara sobre su propio material.`,
];

const middleTemplates = [
	(movie, ctx) =>
		`En ${movie.title}, la dirección de ${ctx.director} ordena la propuesta alrededor de ${ctx.genreFocus}, y eso le da un eje reconocible incluso cuando el relato se mueve por lugares esperables.`,
	(movie, ctx) =>
		`El reparto encabezado por ${ctx.cast} ayuda a que ${movie.title} tenga una cara concreta; no queda reducida a datos de producción ni a una sinopsis bonita.`,
	(movie, ctx) =>
		`Lo mejor de ${movie.title} aparece cuando ${ctx.genreFocus} no se usa como decorado, sino como forma de medir a los personajes y sus decisiones.`,
	(movie, ctx) =>
		`${movie.title} gana cuando confía en ${ctx.genreFocus}; se vuelve más débil cuando se apura a remarcar lo que ya estaba claro.`,
	(movie, ctx) =>
		`Con ${ctx.director} al mando, ${movie.title} tiene momentos de oficio, sobre todo cuando deja respirar al elenco y no sólo al mecanismo narrativo.`,
	(movie, ctx) =>
		`El gancho principal de ${movie.title} está en cómo ${ctx.cast} ocupan la pantalla y le dan cuerpo a una historia que podía quedarse en fórmula.`,
	(movie, ctx) =>
		`La puesta de ${movie.title} no necesita inventar la rueda: le alcanza con hacer que ${ctx.genreFocus} tenga consecuencias visibles para la gente que seguimos.`,
	(movie, ctx) =>
		`Cuando ${movie.title} encuentra su mejor versión, ${ctx.genreFocus} deja de ser etiqueta y se vuelve una manera bastante directa de generar interés.`,
];

const closingTemplates = [
	(movie, ctx) =>
		`${ctx.verdictLine} ${ctx.whyLine} En ${movie.title}, la idea es ubicar si la película sirve para verla ahora, guardarla para otro momento o pasar sin culpa.`,
	(movie, ctx) =>
		`${ctx.verdictLine} ${ctx.whyLine} El balance final de ${movie.title} depende de cuánto te atraiga ese cruce entre premisa, elenco y ejecución concreta.`,
	(movie, ctx) =>
		`${ctx.verdictLine} ${ctx.whyLine} Si el plan de ${movie.title} coincide con lo que buscás, puede rendir; si necesitás algo más fino, conviene elegir con cuidado.`,
	(movie, ctx) =>
		`${ctx.verdictLine} ${ctx.whyLine} En ${movie.title}, la recomendación, o la advertencia, sale de mirar la experiencia completa y no sólo los nombres conocidos.`,
	(movie, ctx) =>
		`${ctx.verdictLine} ${ctx.whyLine} En pocas palabras: ${movie.title} tiene un lugar posible, pero no necesariamente para cualquier ánimo ni cualquier expectativa.`,
];

function wordCount(value) {
	return String(value ?? '')
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
}

function normalize(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

function releaseTimestamp(movie) {
	if (movie.releaseDate) {
		const date = new Date(`${movie.releaseDate}T00:00:00Z`);
		if (!Number.isNaN(date.getTime())) {
			return date.getTime();
		}
	}

	return Date.UTC(Number(movie.year) || 0, 0, 1);
}

function isReleased(movie) {
	const timestamp = releaseTimestamp(movie);
	return Number.isFinite(timestamp) && timestamp <= REFERENCE_DATE.getTime();
}

function hasCutOffSynopsis(value) {
	const synopsis = String(value ?? '').trim();
	if (!synopsis) return true;
	return /…|\.{3}$|(?:\bcon|\bde|\bla|\bel|\blos|\blas|\by|\bo|\bpara|\bpor|\bcomo|\bque|\bun|\buna)\.$/i.test(
		synopsis,
	);
}

function firstSentence(value) {
	const text = String(value ?? '').replace(/\s+/g, ' ').trim();
	const match = text.match(/^.*?[.!?](?:\s|$)/);
	return (match?.[0] ?? text).trim();
}

function safeName(value, fallback) {
	return String(value ?? '').trim() || fallback;
}

function getCast(movie) {
	const cast = Array.isArray(movie.mainCast) ? movie.mainCast.filter(Boolean).slice(0, 3) : [];
	if (cast.length >= 3) return `${cast[0]}, ${cast[1]} y ${cast[2]}`;
	if (cast.length === 2) return `${cast[0]} y ${cast[1]}`;
	if (cast.length === 1) return cast[0];
	return 'su elenco principal';
}

function getPlatform(movie) {
	if (Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0) {
		return movie.releasePlatforms.join(' y ');
	}
	return String(movie.releasePlatform ?? '').trim();
}

function genreFocus(movie) {
	const category = normalize([movie.category, ...(movie.genres ?? [])].join(' '));
	if (category.includes('terror')) return 'la tensión, el clima y la amenaza';
	if (category.includes('thriller') || category.includes('crimen')) return 'la sospecha, el ritmo y la administración de información';
	if (category.includes('comedia')) return 'el timing, la incomodidad y la energía de los cruces';
	if (category.includes('romance')) return 'la química, los silencios y la credibilidad del deseo';
	if (category.includes('accion')) return 'el movimiento, los golpes y la claridad de cada escena';
	if (category.includes('anime') || category.includes('animacion')) return 'el diseño visual, la emoción y el sentido de aventura';
	if (category.includes('ciencia')) return 'la idea de ciencia ficción y el conflicto humano que la sostiene';
	if (category.includes('drama')) return 'la tensión emocional y la forma en que se acumulan las decisiones';
	if (category.includes('fantasia')) return 'la imaginación visual y las reglas internas de su mundo';
	return 'el tono, los personajes y el conflicto central';
}

function verdictLine(movie) {
	const label = safeName(movie.verdictLabel, 'VEREDICTO');
	switch (movie.verdict) {
		case 'recomendada':
			return `El veredicto ${label} está puesto porque ${movie.title} ofrece más que una premisa correcta.`;
		case 'zafa':
			return `El veredicto ${label} tiene sentido porque ${movie.title} da algo, pero también muestra costuras.`;
		case 'no_recomendada':
			return `La advertencia ${label} aparece porque el balance de ${movie.title} queda por debajo de lo que prometía.`;
		case 'basura_atomica':
			return `El rechazo ${label} sale de una experiencia como ${movie.title}, que acumula decisiones difíciles de defender.`;
		default:
			return `El veredicto busca ordenar rápido qué clase de plan ofrece ${movie.title}.`;
	}
}

function whyLine(movie) {
	const platform = getPlatform(movie);
	const platformCopy = platform && platform !== 'Stremio' ? ` Además, tenerla ubicada en ${platform} ayuda a decidir el plan sin vueltas.` : '';
	switch (movie.verdict) {
		case 'recomendada':
			return `${movie.title} vale más si entrás buscando ${genreFocus(movie)} antes que una sorpresa permanente.${platformCopy}`;
		case 'zafa':
			return `${movie.title} puede rendir si el género te llama y no necesitás que cada escena sea redonda.${platformCopy}`;
		case 'no_recomendada':
			return `Sólo priorizaría ${movie.title} si ya venís con mucha curiosidad por el elenco, la saga o el concepto.${platformCopy}`;
		default:
			return `Conviene medirla por el tipo de plan que arma, no por una expectativa universal.${platformCopy}`;
	}
}

function premiseHint(movie) {
	const synopsis = firstSentence(movie.synopsis)
		.replace(/^Protagonizada por .*?,\s*/i, '')
		.replace(/^Protagonizado por .*?,\s*/i, '')
		.replace(/^Dirigida por .*?,\s*/i, '')
		.replace(/^sigue a\s+/i, '')
		.replace(/[.!?]+$/g, '')
		.trim();
	const words = synopsis.split(/\s+/).filter(Boolean);
	if (words.length >= 12) {
		const keep = Math.min(18, Math.max(10, words.length - 5));
		return `${words.slice(0, keep).join(' ')}...`;
	}

	const category = normalize([movie.category, ...(movie.genres ?? [])].join(' '));
	if (category.includes('terror')) return 'un peligro que va cerrando el margen de decisión de sus personajes';
	if (category.includes('thriller') || category.includes('crimen')) return 'un conflicto donde cada dato nuevo cambia la lectura de lo anterior';
	if (category.includes('comedia')) return 'personajes puestos a chocar contra una situación que debería generar ritmo y reacción';
	if (category.includes('romance')) return 'un vínculo que necesita sentirse vivo antes que perfectamente explicado';
	if (category.includes('accion')) return 'una cadena de presión física que depende de claridad y energía';
	if (category.includes('anime') || category.includes('animacion')) return 'un mundo visual que tiene que convertir aventura en emoción';
	if (category.includes('ciencia')) return 'una idea especulativa que sólo funciona si también pesa en lo humano';
	if (category.includes('drama')) return 'decisiones personales que se acumulan hasta volverse conflicto';
	return 'una premisa que necesita sostenerse más allá del resumen';
}

function keywordPhrase(movie) {
	const stopwords = new Set([
		'para',
		'pero',
		'cuando',
		'donde',
		'desde',
		'hasta',
		'entre',
		'sobre',
		'como',
		'cada',
		'esta',
		'este',
		'esta',
		'pelicula',
		'historia',
		'protagonizada',
		'protagonizado',
		'dirigida',
		'dirigido',
		'jeremy',
		'irvine',
		'hannah',
		'emily',
		'debera',
		'deben',
		'vuelve',
		'nueva',
		'nuevo',
		'queda',
		'queda',
		'sigue',
		'hombre',
		'mujer',
		'joven',
		'grupo',
	]);
	const blockedNames = normalize(
		`${movie.title} ${movie.originalTitle ?? ''} ${movie.director ?? ''} ${(movie.mainCast ?? []).join(' ')}`,
	)
		.split(/\s+/)
		.map((word) => word.replace(/[^a-z0-9]/g, ''))
		.filter(Boolean);
	for (const namePart of blockedNames) {
		stopwords.add(namePart);
	}
	const words = normalize(`${movie.synopsis} ${movie.category} ${(movie.genres ?? []).join(' ')}`)
		.split(/\s+/)
		.map((word) => word.replace(/[^a-z0-9]/g, ''))
		.filter((word) => word.length >= 5 && !stopwords.has(word));
	const unique = [...new Set(words)].slice(0, 5);
	if (unique.length >= 3) {
		return unique.join(', ');
	}
	return genreFocus(movie);
}

function buildSynopsis(movie) {
	const current = String(movie.synopsis ?? '').replace(/\s+/g, ' ').trim();
	if (wordCount(current) >= MIN_SYNOPSIS_WORDS && !hasCutOffSynopsis(current)) {
		return current;
	}

	const cast = getCast(movie);
	const director = safeName(movie.director, 'su realizador');
	const lead = firstSentence(current).replace(/[,:;.-]+$/g, '');
	return [
		lead || `${movie.title} parte de un conflicto ligado a ${genreFocus(movie)}`,
		`La historia cruza ese punto de partida con la dirección de ${director} y un elenco encabezado por ${cast}.`,
		`La sinopsis se enfoca en explicar de qué trata la película sin convertir la opinión en resumen.`,
	]
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function buildGeneratedReview(movie, index) {
	const director = safeName(movie.director, 'su realizador');
	const cast = getCast(movie);
	const premise = premiseHint(movie);
	const premiseSentence = /[.!?]$/.test(premise) || premise.endsWith('...') ? premise : `${premise}.`;
	const label = safeName(movie.verdictLabel, 'VEREDICTO');
	const platform = getPlatform(movie);
	const platformSentence =
		platform && platform !== 'Stremio'
			? `Que ${movie.title} esté ubicada en ${platform} también ayuda: es una de esas decisiones que dependen mucho del tipo de plan que tengas esa noche.`
			: `Con ${movie.title}, la decisión pasa menos por disponibilidad y más por cuánto te tiente este cruce puntual de nombres, género y premisa.`;
	const runtimeSentence = Number.isInteger(movie.runtimeMinutes)
		? `${movie.title} dura ${movie.runtimeMinutes} minutos, así que no puede esconderse demasiado: o encuentra ritmo rápido, o cualquier desvío se nota.`
		: `${movie.title} no se vende por duración ni por un solo dato técnico; se juega en cómo sostiene su tono.`;
	const verdictSentence = {
		recomendada: `${label} porque ${movie.title} tiene un gancho concreto y suficientes elementos propios como para no sentirse una recomendación de relleno.`,
		zafa: `${label} porque ${movie.title} tiene atractivos reconocibles, aunque también deja la sensación de que podía morder un poco más.`,
		no_recomendada: `${label} porque ${movie.title} promete más de lo que termina ordenando, incluso cuando alguna idea o algún nombre del elenco despierta curiosidad.`,
		basura_atomica: `${label} porque ${movie.title} acumula decisiones que empujan más a la frustración que al disfrute.`,
	}[movie.verdict] ?? `${label} porque ${movie.title} necesita medirse por experiencia completa, no por una sola ficha técnica.`;
	const whySentence = {
		recomendada: `La vería si te interesa ${genreFocus(movie)} con una puesta que aprovecha a ${cast} y no depende únicamente de explicar la trama.`,
		zafa: `Dejaría ${movie.title} para cuando tengas ganas de ${genreFocus(movie)} sin exigir una película totalmente redonda.`,
		no_recomendada: `La saltearía si buscás ${genreFocus(movie)} con precisión, porque ahí es donde ${movie.title} queda más expuesta.`,
		basura_atomica: `La saltearía salvo curiosidad muy puntual por ${cast}, porque ${movie.title} no devuelve demasiado por el tiempo invertido.`,
	}[movie.verdict] ?? `La pondría en lista sólo si el cruce entre ${cast}, ${director} y ${genreFocus(movie)} te llama de entrada.`;
	const craftSentence =
		index % 2 === 0
			? `${director} puede apoyarse en ${cast}, pero ${movie.title} necesita que esos nombres le den pulso propio a la historia.`
			: `El detalle que más pesa en ${movie.title} es cómo ${director} usa a ${cast} para que el conflicto no quede sólo en promesa.`;

	return [
		openerTemplates[index % openerTemplates.length](movie),
		`${movie.title} tiene esta base narrativa: ${premiseSentence}`,
		craftSentence,
		runtimeSentence,
		verdictSentence,
		whySentence,
		platformSentence,
	]
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function buildReview(movie, index) {
	const review = customReviews[movie.slug] ?? buildGeneratedReview(movie, index);
	if (wordCount(review) < MIN_REVIEW_WORDS) {
		throw new Error(`${movie.slug} review stayed below ${MIN_REVIEW_WORDS} words.`);
	}
	if (normalize(review).includes(normalize(movie.synopsis))) {
		throw new Error(`${movie.slug} review repeats full synopsis.`);
	}
	return review;
}

function moveReviewToEnd(movie) {
	const { review, ...rest } = movie;
	return {
		...rest,
		review,
	};
}

async function loadEntries() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json'));
	const entries = [];
	for (const fileName of fileNames) {
		const filePath = path.join(MOVIES_DIR, fileName);
		const movie = JSON.parse(await readFile(filePath, 'utf8'));
		entries.push({ filePath, movie });
	}
	return entries;
}

const entries = await loadEntries();
const targets = entries
	.filter(({ movie }) => isReleased(movie))
	.sort(
		(left, right) =>
			releaseTimestamp(right.movie) - releaseTimestamp(left.movie) ||
			String(left.movie.title).localeCompare(String(right.movie.title), 'es'),
	)
	.slice(0, TARGET_COUNT);

let updated = 0;
for (let index = 0; index < targets.length; index += 1) {
	const entry = targets[index];
	const nextSynopsis = buildSynopsis(entry.movie);
	const nextMovie = moveReviewToEnd({
		...entry.movie,
		synopsis: nextSynopsis,
	});
	nextMovie.review = buildReview(nextMovie, index);

	if (JSON.stringify(nextMovie) === JSON.stringify(entry.movie)) {
		continue;
	}

	await writeFile(entry.filePath, `${JSON.stringify(nextMovie, null, '\t')}\n`, 'utf8');
	updated += 1;
}

console.log(JSON.stringify({ targetCount: targets.length, updated }, null, 2));
