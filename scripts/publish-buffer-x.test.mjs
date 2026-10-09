import assert from 'node:assert/strict';
import { chooseCopyStyle, movieHashtags, nextDueAt, postKind, renderPostText, selectMovie, weightedXLength } from './publish-buffer-x.mjs';

const movie = { slug: 'akira-1988', title: 'Akira', year: 1988, category: 'Ciencia ficción', releaseDate: '2026-09-05', releasePlatform: 'Netflix', poster: 'assets/posters/1988/akira-1988.webp', cinepostaScore: 8, review: 'Akira arranca con una pandilla de adolescentes en un Neo-Tokio explosivo y usa la transformación de Tetsuo para hablar de poder, violencia y una ciudad que no termina de curarse. Katsuhiro Otomo dirige con una energía desatada.' };
const text = renderPostText(movie);
assert.match(text, /Akira \(1988\)/u);
assert.match(text, /8 - Excelente/u);
assert.match(text, /https:\/\/www\.cineposta\.com\.ar\/peliculas\/akira-1988\//u);
assert.match(text, /#CienciaFiccion/u);
assert.ok(weightedXLength(text) <= 250);

const scoreLabels = ['Basura total', 'Pésima', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente', 'Obra maestra', 'Absolute Cinema'];
for (const [index, label] of scoreLabels.entries()) {
	const score = index + 1;
	for (let verdict = 0; verdict < 8; verdict += 1) {
		const scoreText = renderPostText(
			{ ...movie, slug: `score-${score}-${verdict}`, cinepostaScore: score },
			{ opening: 0, availability: 0, editorial: 0, verdict, link: 0 },
		);
		assert.ok(scoreText.includes(`${score} - ${label}`), `el score ${score} debe conservar número y nombre en la variante ${verdict}`);
		assert.ok(weightedXLength(scoreText) <= 250, `el score ${score} no debe superar el margen de X en la variante ${verdict}`);
	}
}

assert.deepEqual(movieHashtags({ category: 'Ciencia ficcion', genres: ['Cyberpunk', 'Anime'] }), ['#CienciaFiccion', '#Cyberpunk'], 'normaliza categorías sin tilde y suma una señal de género');
assert.deepEqual(movieHashtags({ category: 'Terror', genres: ['cine de terror', 'Slasher'], subgenres: ['Slasher'] }), ['#Terror', '#Slasher'], 'evita etiquetas duplicadas y prioriza el subtipo');
assert.deepEqual(movieHashtags({ category: 'Experimental' }), ['#Cine'], 'mantiene una etiqueta segura si una taxonomía aún no tiene mapeo');

const styles = Array.from({ length: 24 }, (_, index) => ({ opening: index, availability: index, editorial: index, verdict: index, link: index }));
const variants = styles.map((style, index) => renderPostText({ ...movie, slug: `akira-1988-${index}` }, style));
const endings = variants.map((variant) => variant.split('\n\n').at(-1).split('\n'));
assert.equal(new Set(variants.map((variant) => variant.split('\n\n')[0])).size, 12, 'los arranques deben rotar por toda la familia de estilos');
assert.equal(new Set(endings.map(([, link]) => link.replace(/https:\/\/[^\s]+/u, 'URL'))).size, 8, 'los cierres de enlace deben rotar');
assert.equal(new Set(endings.map(([verdict]) => verdict)).size, 8, 'los veredictos deben rotar');
for (const variant of variants) {
	assert.ok(weightedXLength(variant) <= 250);
	assert.doesNotMatch(variant, /Akira arranca con una pandilla/u, 'una oración que no cabe se omite entera');
	assert.doesNotMatch(variant, /…/u);
	assert.match(variant, /#CienciaFiccion/u);
}

const longTitleMovie = { ...movie, slug: 'adolescencia-sexo-y-muerte-en-campamento-miasma-2026', title: 'Adolescencia, sexo y muerte en campamento Miasma: una historia extraordinariamente larga', cinepostaScore: 9 };
const compactText = renderPostText(longTitleMovie, { opening: 10, availability: 3, editorial: 9, verdict: 7, link: 7 });
assert.ok(weightedXLength(compactText) <= 250, 'los títulos largos deben conservar el margen de X');
assert.match(compactText, /Adolescencia, sexo y muerte/u);
assert.doesNotMatch(compactText, /Akira arranca/u);
assert.doesNotMatch(compactText, /…/u);

const shortReview = 'Otomo convierte la ciudad en una pesadilla.';
const shortText = renderPostText({ ...movie, review: `${shortReview} Otra oración que no debe aparecer.` }, { opening: 0, availability: 0, editorial: 1, verdict: 0, link: 0 });
assert.ok(shortText.includes(`La posta: ${shortReview}`), 'conserva una oración completa y su introducción cuando caben');
assert.doesNotMatch(shortText, /Otra oración/u);

// Stable reproduction of the audience report, independent of catalog edits.
const ayMiPerro = { ...movie, slug: 'ay-mi-perro-2026', title: '¡Ay, mi perro!', year: 2026, category: 'Drama', genres: ['Aventura'], review: 'La búsqueda de un perro suele prometer un refugio amable, pero Amit Rai la lleva hacia un mundo donde la vulnerabilidad de los animales y la de los chicos están demasiado cerca. El cruce de recorridos amplía el conflicto.' };
const reportedStyle = { opening: 5, availability: 0, editorial: 4, verdict: 6, link: 5 };
const dogText = renderPostText(ayMiPerro, reportedStyle);
assert.match(dogText, /Atenti con ¡Ay, mi perro! \(2026\): ya está disponible en Netflix\./u);
assert.doesNotMatch(dogText, /Va por acá:|La búsqueda|Amit Rai|…|\.{3}/u);
assert.match(dogText, /La posta del equipo: 8 - Excelente\./u);
assert.match(dogText, /Pasá por la ficha: https:\/\/www\.cineposta\.com\.ar\/peliculas\/ay-mi-perro-2026\//u);
assert.match(dogText, /#Drama #Aventura/u);
assert.equal(dogText.split('\n\n').length, 2, 'no deja una introducción ni un párrafo vacío al omitir el adelanto');
assert.ok(weightedXLength(dogText) <= 250);

for (const review of ['Una reseña sin cierre', 'Un adelanto cortado…', 'Un adelanto cortado...', 'Un adelanto cortado… que luego termina.']) {
	const incompleteText = renderPostText({ ...movie, review }, reportedStyle);
	assert.doesNotMatch(incompleteText, /Va por acá:|Una reseña|Un adelanto|…|\.{3}/u, 'no publica fuentes incompletas ni deja su introducción');
}

const boundaryStyle = { opening: 0, availability: 0, editorial: 9, verdict: 0, link: 0 };
const noExcerpt = renderPostText({ ...movie, review: 'Sin cierre' }, boundaryStyle);
// The compact opening saves " (1988)"; the excerpt adds two newlines.
const sentenceBudget = 250 - weightedXLength(noExcerpt) + ' (1988)'.length - 2;
const withoutIntroSentence = `${'A'.repeat(sentenceBudget - ' (1988)'.length - 1)}.`;
const withoutIntroText = renderPostText({ ...movie, review: withoutIntroSentence }, boundaryStyle);
assert.match(withoutIntroText, /Akira \(1988\)/u, 'mantiene el arranque original si basta con quitar la introducción');
assert.ok(withoutIntroText.includes(withoutIntroSentence));
assert.doesNotMatch(withoutIntroText, /Un adelanto de nuestra reseña:/u);
const boundarySentence = `${'A'.repeat(sentenceBudget - 1)}.`;
const boundaryText = renderPostText({ ...movie, review: boundarySentence }, boundaryStyle);
assert.equal(weightedXLength(boundaryText), 250, 'una oración completa puede ocupar exactamente el margen');
assert.ok(boundaryText.includes(boundarySentence));
assert.doesNotMatch(boundaryText, /Un adelanto de nuestra reseña:/u, 'quita la introducción para conservar la oración');
const overBoundaryText = renderPostText({ ...movie, review: `A${boundarySentence}` }, boundaryStyle);
assert.equal(overBoundaryText, noExcerpt, 'un carácter de más omite la oración entera');
assert.throws(() => renderPostText({ ...movie, title: 'A'.repeat(300) }), /no deja espacio suficiente/u, 'nunca recorta el título para forzar una publicación');

const recommendationLanguage = /¿Qué mirar|Si buscás|¿Con ganas|Una para agendar|Para una noche|Si te pinta|Plan de peli|Para sumar a la lista|Para quienes vienen buscando|Anotá esta|¿La recomendamos\?/u;
for (let score = 1; score <= 10; score += 1) {
	assert.equal(postKind({ ...movie, cinepostaScore: score }), score >= 6 ? 'recommendation' : 'negative-review');
	for (let opening = 0; opening < 12; opening += 1) {
		for (let verdict = 0; verdict < 8; verdict += 1) {
			const variant = renderPostText({ ...movie, cinepostaScore: score }, { opening, availability: opening % 4, editorial: opening % 10, verdict, link: verdict });
			assert.ok(variant.includes(`${score} - ${scoreLabels[score - 1]}`));
			assert.ok(weightedXLength(variant) <= 250);
			if (score < 6) {
				assert.doesNotMatch(variant, recommendationLanguage);
				assert.match(variant.split('\n\n')[0], score === 5 ? /mediocre/u : score <= 3 ? /malísima/u : /mala/u);
			}
		}
	}
}
for (const invalidScore of [undefined, null, '6', 0, 11, 5.5, NaN]) {
	assert.throws(() => postKind({ ...movie, cinepostaScore: invalidScore }), /score válido/u);
	assert.throws(() => renderPostText({ ...movie, cinepostaScore: invalidScore }), /veredicto/u);
}
for (const score of [3, 4, 5]) {
	const negativeCompact = renderPostText({ ...longTitleMovie, cinepostaScore: score }, { opening: 10, availability: 3, editorial: 9, verdict: 4, link: 7 });
	assert.ok(weightedXLength(negativeCompact) <= 250);
	assert.doesNotMatch(negativeCompact, recommendationLanguage);
	assert.match(negativeCompact.split('\n\n')[0], score === 5 ? /mediocre/u : score === 3 ? /malísima/u : /mala/u);
	assert.match(negativeCompact, /No la recomendamos/u);
}

// Keep the reported regression stable if the live catalog changes its score.
const bajoTusPies = { ...movie, slug: 'bajo-tus-pies-2025', title: 'Bajo tus pies', year: 2025, category: 'Terror', releasePlatform: 'Cine', cinepostaScore: 4, review: 'Cristian Bernard usa el edificio como una presión que se filtra en la vida cotidiana de Isabel y sus hijos.' };
const correctedPost = renderPostText(bajoTusPies, { opening: 8, availability: 3, editorial: 1, verdict: 5, link: 4 });
assert.match(correctedPost.split('\n\n')[0], /Bajo tus pies.*mala/u);
assert.doesNotMatch(correctedPost, recommendationLanguage);
assert.match(correctedPost, /4 - Mala/u);

const historyWithRecentStyles = { version: 1, posts: styles.slice(0, 3).map((copyStyle, index) => ({ slug: `anterior-${index}`, copyStyle })) };
const freshStyle = chooseCopyStyle(movie, historyWithRecentStyles);
for (const previous of historyWithRecentStyles.posts) {
	assert.notEqual(freshStyle.opening % 12, previous.copyStyle.opening % 12, 'el arranque no debe repetir los últimos tres estilos');
	assert.notEqual(freshStyle.verdict % 8, previous.copyStyle.verdict % 8, 'el veredicto no debe repetir los últimos tres estilos');
	assert.notEqual(freshStyle.link % 8, previous.copyStyle.link % 8, 'el cierre no debe repetir los últimos tres estilos');
}

const selection = selectMovie([{ movie, posterUrl: 'https://www.cineposta.com.ar/assets/posters/1988/akira-1988.webp' }, { movie: { ...movie, slug: 'paprika-2006', title: 'Paprika' }, posterUrl: 'https://www.cineposta.com.ar/assets/posters/2006/paprika-2006.webp' }], { version: 1, posts: [{ slug: 'akira-1988' }] });
assert.equal(selection.movie.slug, 'paprika-2006');
const candidate = (slug, cinepostaScore, releaseDate) => ({ movie: { ...movie, slug, cinepostaScore, releaseDate }, posterUrl: 'https://www.cineposta.com.ar/poster.webp' });
const bad = candidate('bad', 4, '2026-10-01');
const mediocre = candidate('mediocre', 5, '2026-09-30');
const good = candidate('good', 6, '2026-09-01');
const excellent = candidate('excellent', 9, '2026-08-01');
const emptyHistory = { version: 1, posts: [] };
assert.equal(selectMovie([bad, mediocre, excellent, good], emptyHistory).movie.slug, 'good', 'un 6 debe tener prioridad sobre un 4 o 5 más reciente');
assert.equal(selectMovie([bad, mediocre, excellent, good], { posts: [{ slug: 'good' }] }).movie.slug, 'excellent', 'el historial se aplica antes de buscar recomendaciones');
assert.equal(selectMovie([bad, mediocre, good], emptyHistory, new Set(['good'])).movie.slug, 'bad', 'el fallback negativo respeta las exclusiones de Buffer');
assert.equal(selectMovie([bad, mediocre], { posts: [{ slug: 'bad' }] }).movie.slug, 'mediocre', 'un 5 sólo se usa como crítica cuando no quedan recomendaciones');
assert.throws(() => selectMovie([candidate('unrated', undefined, '2026-10-02')], emptyHistory), /No quedan películas elegibles/u);
assert.throws(() => selectMovie([good], emptyHistory, new Set(['good'])), /No quedan películas elegibles/u);
assert.equal(nextDueAt(new Date('2026-09-06T21:30:00.000Z')), '2026-09-06T22:00:00.000Z');
assert.equal(nextDueAt(new Date('2026-09-06T22:00:00.000Z')), '2026-09-07T22:00:00.000Z');
console.log('Buffer X publisher tests passed.');
