import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const TARGET_COUNT = 80;
const MIN_REVIEW_WORDS = 120;
const MAX_REVIEW_WORDS = 190;
const REFERENCE_DATE = new Date('2026-05-06T00:00:00Z');

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

function isReleased(movie) {
	if (movie.releaseDate) {
		const date = new Date(`${movie.releaseDate}T00:00:00Z`);
		return !Number.isNaN(date.getTime()) && date <= REFERENCE_DATE;
	}

	return Number(movie.year) < REFERENCE_DATE.getUTCFullYear();
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

function hasCutOffSynopsis(value) {
	const synopsis = String(value ?? '').trim();
	if (!synopsis) return true;
	return /(?:\bcon|\bde|\bla|\bel|\blos|\blas|\by|\bo|\bpara|\bpor|\bcomo|\bque|\bun|\buna)\.$/i.test(
		synopsis,
	);
}

function titleCaseFallback(value, fallback) {
	const text = String(value ?? '').trim();
	return text || fallback;
}

function firstSentence(value) {
	const text = String(value ?? '').replace(/\s+/g, ' ').trim();
	const match = text.match(/^.*?[.!?](?:\s|$)/);
	return (match?.[0] ?? text).trim();
}

function buildSynopsis(movie) {
	const current = String(movie.synopsis ?? '').replace(/\s+/g, ' ').trim();
	if (wordCount(current) >= 25 && !hasCutOffSynopsis(current)) {
		return current;
	}

	const cast = Array.isArray(movie.mainCast) ? movie.mainCast.slice(0, 3).join(', ') : '';
	const platform = getPlatformLabel(movie);
	const setting = platform ? `La ficha la ubica como una propuesta disponible en ${platform}` : 'La ficha la ubica como una propuesta de catálogo';
	const lead = firstSentence(current).replace(/[,:;.-]+$/g, '');

	return [
		lead || `${movie.title} sigue un conflicto central ligado a su premisa de ${String(movie.category ?? 'película').toLowerCase()}`,
		`La historia cruza ese punto de partida con la dirección de ${titleCaseFallback(movie.director, 'su realizador')} y un elenco encabezado por ${cast || 'su reparto principal'}.`,
		`${setting}, con foco en explicar rápido de qué trata sin depender sólo del trailer.`,
	]
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function getPlatformLabel(movie) {
	if (Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0) {
		return movie.releasePlatforms.join(' y ');
	}
	return String(movie.releasePlatform ?? '').trim();
}

function getRuntimeCopy(movie) {
	if (!Number.isInteger(movie.runtimeMinutes)) {
		return 'Como no depende de un solo dato técnico, la decisión pasa más por tono, elenco y promesa narrativa que por duración.';
	}

	if (movie.runtimeMinutes <= 95) {
		return `Con ${movie.runtimeMinutes} minutos, juega a favor de una experiencia compacta: si entra, entra sin pedir una noche entera.`;
	}
	if (movie.runtimeMinutes <= 115) {
		return `Con ${movie.runtimeMinutes} minutos, queda en una duración cómoda para ver si el tono te convence desde el arranque.`;
	}
	if (movie.runtimeMinutes <= 140) {
		return `Sus ${movie.runtimeMinutes} minutos piden un poco más de paciencia, así que el ritmo y el interés del conflicto pesan bastante.`;
	}
	return `Con ${movie.runtimeMinutes} minutos, exige compromiso: no alcanza con que la premisa sea atractiva, también tiene que sostener viaje largo.`;
}

function getVerdictTone(movie) {
	switch (movie.verdict) {
		case 'recomendada':
			return 'La recomendación sale porque tiene una razón clara para ocupar tu tiempo';
		case 'zafa':
			return 'El veredicto queda en zona media: puede rendir, pero conviene entrar con expectativas ajustadas';
		case 'no_recomendada':
			return 'La advertencia va por el lado práctico: hay elementos rescatables, pero la experiencia completa queda corta';
		case 'basura_atomica':
			return 'El rechazo es bastante directo: la película acumula decisiones difíciles de defender';
		default:
			return 'El veredicto busca ordenar rápido qué esperar';
	}
}

function getCategoryAngle(movie) {
	const category = normalize(movie.category);
	if (category.includes('terror')) {
		return 'En terror, lo que importa no es sólo asustar: también cuenta si la tensión crece, si el clima no se pincha y si los personajes importan lo suficiente como para que el peligro pese.';
	}
	if (category.includes('thriller') || category.includes('crimen')) {
		return 'Como thriller, necesita que la información avance con precisión: cada giro tiene que sumar presión y no parecer un truco puesto para estirar la intriga.';
	}
	if (category.includes('comedia')) {
		return 'En comedia, la vara está en el ritmo: los chistes pueden no pegar todos, pero la película necesita sostener timing, energía y personajes que no se agoten a los diez minutos.';
	}
	if (category.includes('romance')) {
		return 'En romance, la química pesa más que la excusa argumental. Si la pareja no genera curiosidad, el conflicto se vuelve mecánico enseguida.';
	}
	if (category.includes('accion')) {
		return 'En acción, la diferencia está entre ruido y pulso: persecuciones, golpes o set pieces sirven si empujan la historia y no tapan que no hay nada debajo.';
	}
	if (category.includes('anime') || category.includes('animacion')) {
		return 'En animación, el atractivo visual suma mucho, pero no reemplaza una emoción clara ni un mundo con reglas que den ganas de seguir mirando.';
	}
	if (category.includes('ciencia')) {
		return 'En ciencia ficción, la idea inicial tiene que transformarse en conflicto humano; si sólo queda el concepto, la película se enfría rápido.';
	}
	return 'La lectura pasa por cómo usa su género: no alcanza con cumplir casilleros, también tiene que ofrecer una mirada o una energía reconocible.';
}

function getCastCopy(movie) {
	const cast = Array.isArray(movie.mainCast) ? movie.mainCast.slice(0, 3).filter(Boolean) : [];
	if (cast.length >= 3) {
		return `El gancho más concreto está en ver cómo se cruzan ${cast[0]}, ${cast[1]} y ${cast[2]} dentro de una propuesta dirigida por ${titleCaseFallback(movie.director, 'su realizador')}.`;
	}
	if (cast.length === 2) {
		return `El peso interpretativo cae sobre ${cast[0]} y ${cast[1]}, así que la película depende mucho de esa dinámica.`;
	}
	if (cast.length === 1) {
		return `La presencia de ${cast[0]} funciona como principal ancla para entrarle.`;
	}
	return `La dirección de ${titleCaseFallback(movie.director, 'su realizador')} queda como principal ancla para entrarle.`;
}

function getWhyWatch(movie) {
	switch (movie.verdict) {
		case 'recomendada':
			return 'Por qué verla: si la premisa te llama, hay material suficiente para que no parezca una ficha inflada por datos sueltos.';
		case 'zafa':
			return 'Por qué verla: puede funcionar cuando buscás algo de ese género sin exigirle una obra redonda.';
		case 'no_recomendada':
			return 'Por qué no verla: si esperás una ejecución fina o una sorpresa fuerte, probablemente te deje con gusto a poco.';
		case 'basura_atomica':
			return 'Por qué no verla: la curiosidad puede existir, pero el balance apunta más a frustración que a disfrute.';
		default:
			return 'Por qué verla o saltearla: depende de cuánto te atraiga el cruce entre género, elenco y tono.';
	}
}

function trimToMaxWords(value, maxWords) {
	const words = String(value ?? '')
		.replace(/\s+/g, ' ')
		.trim()
		.split(' ')
		.filter(Boolean);
	if (words.length <= maxWords) {
		return words.join(' ');
	}
	return `${words.slice(0, maxWords).join(' ').replace(/[,:;.-]+$/g, '')}.`;
}

function buildReview(movie, synopsis) {
	const existing = String(movie.review ?? '').replace(/\s+/g, ' ').trim();
	const verdictLabel = String(movie.verdictLabel ?? '').trim();
	const platform = getPlatformLabel(movie);
	const platformCopy = platform ? `También suma saber dónde entra: ${platform} no es un detalle menor cuando la decisión es rápida y de noche.` : '';
	const synopsisCopy = firstSentence(synopsis);

	const paragraphs = [
		`${movie.title} queda en Cine Posta con un veredicto ${verdictLabel ? `"${verdictLabel}"` : 'claro'} porque la ficha intenta separar la promesa de la película de la reacción final. ${existing}`,
		`${getVerdictTone(movie)}. ${getCategoryAngle(movie)} ${getCastCopy(movie)}`,
		`La premisa ayuda a ordenar la expectativa: ${synopsisCopy} ${getRuntimeCopy(movie)} ${platformCopy}`.trim(),
		`${getWhyWatch(movie)} En resumen, no es una página armada sólo con trailer, póster y reparto: la idea es que salgas sabiendo si te conviene verla ahora, guardarla para otro plan o pasar de largo sin culpa.`,
	];

	let review = paragraphs
		.join('\n\n')
		.replace(/\s+\n/g, '\n')
		.replace(/\n\s+/g, '\n')
		.replace(/[ \t]+/g, ' ')
		.trim();

	if (wordCount(review) > MAX_REVIEW_WORDS) {
		review = trimToMaxWords(review, MAX_REVIEW_WORDS);
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
for (const entry of targets) {
	const nextSynopsis = buildSynopsis(entry.movie);
	const nextReview = buildReview(entry.movie, nextSynopsis);

	if (wordCount(nextReview) < MIN_REVIEW_WORDS) {
		throw new Error(`${entry.movie.slug} review stayed below ${MIN_REVIEW_WORDS} words.`);
	}

	const nextMovie = moveReviewToEnd({
		...entry.movie,
		synopsis: nextSynopsis,
		review: nextReview,
	});

	if (JSON.stringify(nextMovie) === JSON.stringify(entry.movie)) {
		continue;
	}

	await writeFile(entry.filePath, `${JSON.stringify(nextMovie, null, '\t')}\n`, 'utf8');
	updated += 1;
}

console.log(JSON.stringify({ targetCount: targets.length, updated }, null, 2));
