import test from 'node:test';
import assert from 'node:assert/strict';
import { createMovieCreditCoverageDraft, validateMovieCreditCoverage } from './movie-credit-coverage.mjs';

const reviewedOn = '2026-11-10';
const fullCreditsUrl = 'https://www.imdb.com/title/tt1234567/fullcredits/';
const movie = {
	slug: 'small-film-2026', title: 'Small Film', year: 2026,
	director: 'Director Person', mainCast: ['Lead Actor One', 'Lead Actor Two'],
};
const personCredit = (name, role, prominence = 'lead') => ({
	name, role, prominence, decision: 'include', creditSourceUrl: fullCreditsUrl,
	identitySources: [
		{ url: `https://www.imdb.com/name/${encodeURIComponent(name)}`, fact: `La filmografía confirma la identidad de ${name} en trabajos previos.` },
		{ url: `https://www.themoviedb.org/person/${encodeURIComponent(name)}`, fact: `El perfil independiente identifica a ${name} con el mismo crédito.` },
	],
	portrait: { sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(name)}`, visuallyVerified: true },
});
function reviewFor(film = movie) {
	return {
		...createMovieCreditCoverageDraft(film, reviewedOn),
		status: 'reviewed',
		reviewedOn,
		billingSources: [
			{ url: fullCreditsUrl, kind: 'IMDb full credits', fullCredits: true, relevantCreditCount: 3, checkedOn: reviewedOn },
			{ url: 'https://www.themoviedb.org/movie/123/cast', kind: 'TMDb cast cross-check', fullCredits: false, checkedOn: reviewedOn },
		],
		credits: [
			personCredit('Director Person', 'director'),
			personCredit('Lead Actor One', 'performer'),
			personCredit('Lead Actor Two', 'performer'),
		],
	};
}

test('un film pequeño pasa con el piso de director y dos intérpretes, sin mínimo extra', () => {
	const review = reviewFor();
	review.billingSources[1].url = 'https://www.imdb.com/title/tt1234567/cast/';
	for (const credit of review.credits) credit.identitySources[1].url = `https://www.imdb.com/name/${encodeURIComponent(credit.name)}/bio/`;
	const result = validateMovieCreditCoverage(movie, review);
	assert.deepEqual(result.errors, []);
	assert.equal(result.portraitExceptions.size, 0);
});

test('un billing amplio no pasa con dos actores y review genérico: cada omisión necesita fila y motivo', () => {
	const film = { ...movie, mainCast: ['Lead Actor One', 'Lead Actor Two'] };
	const review = reviewFor(film);
	review.billingSources[0].relevantCreditCount = 8;
	assert.ok(validateMovieCreditCoverage(film, review).errors.some(error => /declara 8 créditos relevantes/u.test(error)));
	for (const index of [1, 2, 3, 4, 5]) {
		review.credits.push({
			name: `Supporting Performer ${index}`, role: 'performer', prominence: 'supporting', decision: 'omit', creditSourceUrl: fullCreditsUrl,
		});
	}
	let result = validateMovieCreditCoverage(film, review);
	assert.ok(result.errors.some(error => /omisión de Supporting Performer 1 necesita un motivo específico/u.test(error)));
	for (const credit of review.credits.filter(item => item.decision === 'omit')) {
		credit.omissionReason = `${credit.name} figura en el billing secundario, pero su participación es menor y no integra el elenco principal de esta ficha.`;
		credit.omissionCategory = credit.name.endsWith('1') ? 'no-safe-portrait' : 'lesser-role';
		if (credit.omissionCategory === 'no-safe-portrait') {
			credit.omissionReason = `${credit.name} conserva un crédito secundario real, pero no se encontró un retrato individual seguro tras la contingencia.`;
			credit.portraitSearches = [
				{ url: 'https://www.imdb.com/name/nm7654321/photos/', result: 'La persona no tiene foto individual en su ficha pública.' },
				{ url: 'https://press.example/cast', result: 'El archivo de prensa consultado no atribuye un retrato individual.' },
			];
		}
	}
	result = validateMovieCreditCoverage(film, review);
	assert.ok(result.errors.some(error => /coverageReview con una razón y omisiones cotejadas explícitas/u.test(error)));
	review.coverageReview = {
		rationale: 'La guía mantiene los papeles centrales y revisó cada crédito secundario listado en la fuente completa antes de excluirlo.',
		omittedRelevantCredits: review.credits.filter(item => item.decision === 'omit').map(({ name, role }) => ({ name, role })),
	};
	result = validateMovieCreditCoverage(film, review);
	assert.deepEqual(result.errors, []);
});

test('no permite omitir un crédito protagonista sólo por falta de retrato para sostener el piso', () => {
	const film = { ...movie, mainCast: ['Lead Actor One', 'Lead Actor Two'] };
	const review = reviewFor(film);
	review.billingSources[0].relevantCreditCount = 4;
	review.credits.push({
		name: 'Third Lead', role: 'performer', prominence: 'lead', decision: 'omit', creditSourceUrl: fullCreditsUrl,
		omissionCategory: 'no-safe-portrait',
		omissionReason: 'La persona protagoniza la película, pero la contingencia no encontró un retrato individual seguro en las fuentes revisadas.',
		portraitSearches: [
			{ url: 'https://www.imdb.com/name/nm3456789/photos/', result: 'La ficha no ofrece retrato individual atribuible a esta persona.' },
			{ url: 'https://press.example/film', result: 'El material de prensa identifica el crédito, pero no ofrece una foto individual segura.' },
		],
	});
	review.coverageReview = {
		rationale: 'La revisión comparó la fuente completa y explica por qué cada crédito relevante queda dentro o fuera de esta ficha.',
		omittedRelevantCredits: [{ name: 'Third Lead', role: 'performer' }],
	};
	assert.ok(validateMovieCreditCoverage(film, review).errors.some(error => /no se puede omitir un crédito protagonista/u.test(error)));
});

test('la excepción de retrato exige un motivo permitido y búsquedas independientes', () => {
	const film = { ...movie, mainCast: [...movie.mainCast, 'Supporting Performer'] };
	const review = reviewFor(film);
	review.billingSources[0].relevantCreditCount = 4;
	const credit = personCredit('Supporting Performer', 'performer', 'supporting');
	credit.portrait = undefined;
	credit.portraitException = {
		category: 'obscure-no-reliable-image',
		recognition: 'obscure',
		recognitionBasis: { sourceUrl: 'https://filmdb.example/credit', fact: 'El crédito sólo aparece en la ficha de esta película y no muestra actividad pública adicional.' },
		reason: 'Intérprete secundario con crédito confirmado; las fuentes públicas consultadas no ofrecen una foto individual atribuible.',
		sourcesSearched: [
			{ url: 'https://www.imdb.com/name/nm7654321/', result: 'El perfil de filmografía no contiene imagen individual verificable.' },
			{ url: 'https://agencia.example/talento', result: 'La agencia no publica un retrato atribuible a esta persona.' },
		],
	};
	review.credits.push(credit);
	let result = validateMovieCreditCoverage(film, review);
	assert.deepEqual(result.errors, []);
	assert.ok(result.portraitExceptions.has('performer:supporting performer'));
	credit.portraitException.sourcesSearched[1].url = credit.portraitException.sourcesSearched[0].url + '?second-query=1';
	result = validateMovieCreditCoverage(film, review);
	assert.deepEqual(result.errors, []);
	credit.portraitException.sourcesSearched[1].url = credit.portraitException.sourcesSearched[0].url;
	result = validateMovieCreditCoverage(film, review);
	assert.ok(result.errors.some(error => /registrar fuentes consultadas/u.test(error)));
	credit.portraitException.sourcesSearched[1].url = 'https://agencia.example/talento';
	credit.prominence = 'lead';
	credit.portraitException.recognition = 'established';
	result = validateMovieCreditCoverage(film, review);
	assert.ok(result.errors.some(error => /perfil realmente poco conocido/u.test(error)));
});

test('el ledger ata identidad y año exactos y no acepta filas de extras como elenco incluido', () => {
	const review = reviewFor();
	assert.ok(validateMovieCreditCoverage(movie, { ...review, year: 2025 }).errors.some(error => /no corresponde exactamente/u.test(error)));
	const extra = personCredit('Extra Person', 'performer', 'incidental');
	review.credits.push(extra);
	review.billingSources[0].relevantCreditCount = 4;
	assert.ok(validateMovieCreditCoverage(movie, review).errors.some(error => /incidental\/crew y no puede rellenar/u.test(error)));
});
