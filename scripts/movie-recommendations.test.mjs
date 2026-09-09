import assert from 'node:assert/strict';

import {
	generateMovieEditorialRecommendations,
	getMovieRecommendationAffinity,
} from '../src/lib/recommendation-engine.ts';

function movie(overrides = {}) {
	return {
		slug: 'source',
		title: 'Superman',
		originalTitle: 'Superman',
		synopsis: 'Un héroe llegado de otro planeta protege a una ciudad de un criminal.',
		year: 1978,
		audienceRating: 'ATP',
		category: 'Ciencia ficcion',
		genres: ['Ciencia ficcion', 'Accion'],
		subgenres: [],
		country: 'US',
		poster: 'assets/posters/1978/source.webp',
		trailerYoutubeId: 'abcdefghijk',
		director: 'Richard Donner',
		mainCast: ['Christopher Reeve'],
		productionCompany: 'Test',
		verdict: 'recomendada',
		review: 'Una aventura de superhéroes con esperanza y corazón.',
		...overrides,
	};
}

const source = movie();
const sequel = movie({
	slug: 'superman-ii',
	title: 'Superman II',
	originalTitle: 'Superman II',
	year: 1980,
	director: 'Richard Donner',
	mainCast: ['Christopher Reeve'],
});
const batman = movie({
	slug: 'batman-begins',
	title: 'Batman Begins',
	originalTitle: 'Batman Begins',
	year: 2005,
	director: 'Christopher Nolan',
	mainCast: ['Christian Bale'],
	category: 'Accion',
	genres: ['Accion', 'Thriller'],
	review: 'Un héroe enfrenta el crimen y el miedo en una ciudad corrupta.',
});
const wonderWoman = movie({
	slug: 'wonder-woman',
	title: 'Wonder Woman',
	originalTitle: 'Wonder Woman',
	year: 2017,
	director: 'Patty Jenkins',
	mainCast: ['Gal Gadot'],
	category: 'Accion',
	genres: ['Accion', 'Aventura'],
	review: 'Una heroína descubre el mundo y pelea contra una guerra imposible.',
});
const rejected = movie({
	slug: 'bad-superhero',
	title: 'Another Hero',
	originalTitle: 'Another Hero',
	verdict: 'no_recomendada',
});

assert.equal(
	getMovieRecommendationAffinity(source, sequel),
	null,
	'Las continuaciones de la misma franquicia no deben ocupar una recomendación editorial.',
);
assert.equal(
	getMovieRecommendationAffinity(source, rejected),
	null,
	'Una película no recomendada no debe entrar como sugerencia.',
);

const recommendations = generateMovieEditorialRecommendations(source, [source, sequel, batman, wonderWoman, rejected]);
const selected = [...recommendations.becauseYouLiked, ...recommendations.related];
assert.equal(selected.includes(sequel.slug), false);
assert.equal(selected.includes(rejected.slug), false);
assert.equal(selected.includes(batman.slug), true);
assert.equal(selected.includes(wonderWoman.slug), true);

console.log('movie recommendations: ok');
