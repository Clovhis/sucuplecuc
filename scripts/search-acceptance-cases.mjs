// Expected sets come from canonical metadata, independently of the parser.
const title = (query, slug) => ({ query, kind: 'title', top: slug });
const set = (query, where) => ({ query, kind: 'set', where });
export const SEARCH_ACCEPTANCE_CASES = [
	title('Андрей Рублёв', 'andrei-rublev-1966'), title('Batman la película', 'batman-1966'),
	title('Boyhood: Momentos de una Vida', 'boyhood-2014'), title('Cabalgata', 'cavalcade-1933'),
	title('Una pareja despareja', 'i-love-you-phillip-morris-2009'), title('Phillip Morris ¡Te quiero!', 'i-love-you-phillip-morris-2009'),
	title('La Atalante', 'latalante-1934'), title('The Earrings of Madame de...', 'madame-de-1953'),
	title('El camino de los sueños', 'mulholland-drive-2001'), title('Actividad paranormal', 'paranormal-activity-2007'),
	title('Rolling Stones: Shine a Light', 'shine-a-light-2008'), title('El dormilón', 'sleeper-1973'),
	title('Neon Genesis Evangelion: The End of Evangelion', 'the-end-of-evangelion-1997'),
	title('新世紀エヴァンゲリオン劇場版 Air／まごころを、君に', 'the-end-of-evangelion-1997'),
	title('WALL·E: Batallón de limpieza', 'wall-e-2008'), title('一一', 'yi-yi-2000'),
	set('de los 80 antes de 2000', { minYear: 1980, maxYear: 1989 }),
	set('antes de 2000 de los 80', { minYear: 1980, maxYear: 1989 }),
	set('más de 8 puntos y al menos 7 puntos', { minScore: 9 }),
	set('menos de 8 puntos y hasta 9 puntos', { maxScore: 7 }),
	set('antes de 1980 y después de 2000', { minYear: 2001, maxYear: 1979 }),
	set('más de 8 puntos y menos de 7 puntos', { minScore: 9, maxScore: 6 }),
	title('The Shining', 'the-shining-1980'), title('El resplandor', 'the-shining-1980'), title('resplndor', 'the-shining-1980'),
	title('El padrino', 'the-godfather-1972'), title('El padrino parte II', 'the-godfather-part-ii-1974'),
	title('Sueños de libertad', 'the-shawshank-redemption-1994'), title('Cadena perpetua', 'the-shawshank-redemption-1994'),
	title('Volver al futuro', 'back-to-the-future-1985'), title('Volver al futuro II', 'back-to-the-future-part-ii-1989'),
	title('El viaje de Chihiro', 'spirited-away-2001'), title('Buenos muchachos', 'goodfellas-1990'),
	title('Jaws', 'jaws-1975'), title('Tiburón', 'jaws-1975'), title('Psicosis', 'psycho-1960'),
	title('Psycho', 'psycho-1960'), title('Amélie', 'amelie-2001'), title('Amelie', 'amelie-2001'),
	title('Paprika detective de los sueños', 'paprika-2006'), title('shinnig', 'the-shining-1980'),
	title('Wonder Woman 1984', 'wonder-woman-1984-2020'), title('El club de la pelea', 'fight-club-1999'),
	title('Fight Club', 'fight-club-1999'), title('Matrix', 'the-matrix-1999'),
	title('Tiempos violentos', 'pulp-fiction-1994'), title('紅の豚', 'porco-rosso-1992'), title('パプリカ', 'paprika-2006'),
	title('"2001: Odisea del espacio"', '2001-a-space-odyssey-1968'), title('"El resplandor"', 'the-shining-1980'),
	title('"Paprika, detective de los sueños"', 'paprika-2006'),
	title('La leyenda del tesoro perdido', 'la-leyenda-del-tesoro-perdido-2004'),
	set('película vieja de Kubrick', { director: 'stanley kubrick', maxYear: 1999 }),
	set('película vieja de Kubrik', { director: 'stanley kubrick', maxYear: 1999 }),
	set('dirigidas por Stanley Kubrick', { director: 'stanley kubrick' }),
	set('director David Fincher', { director: 'david fincher' }),
	set('dirigida por Christopher Nolan', { director: 'christopher nolan' }),
	set('películas de Steven Spielberg', { director: 'steven spielberg' }),
	set('películas de Tom Hanks', { person: 'tom hanks' }),
	set('películas de Clint Eastwood', { person: 'clint eastwood' }),
	set('Brad Pitt en Netflix', { cast: 'brad pitt', platforms: ['netflix'] }),
	set('Bradd Pitt en Netflx', { cast: 'brad pitt', platforms: ['netflix'] }),
	set('con la actriz Kate Winslet', { cast: 'kate winslet' }),
	set('protagonizadas por Tom Hanks', { cast: 'tom hanks' }),
	set('actor Keanu Reeves', { cast: 'keanu reeves' }),
	set('Alien', { titlePrefix: 'alien' }), set('Psycho', { titlePrefix: 'psycho' }),
	set('actor Max von Sydow', { cast: 'max von sydow' }),
	set('actor Robert de Niro', { cast: 'robert de niro' }),
	set('dirigida por Guillermo del Toro', { director: 'guillermo del toro' }),
	set('terror de los 80', { genre: 'terror', minYear: 1980, maxYear: 1989 }),
	set('terror de la década del 80', { genre: 'terror', minYear: 1980, maxYear: 1989 }),
	set('terror 1980s', { genre: 'terror', minYear: 1980, maxYear: 1989 }),
	set('terror de los ochenta', { genre: 'terror', minYear: 1980, maxYear: 1989 }),
	set('películas del año 1984', { minYear: 1984, maxYear: 1984 }),
	set('año 1984', { minYear: 1984, maxYear: 1984 }),
	set('entre 1980 y 1989', { minYear: 1980, maxYear: 1989 }),
	set('antes de 1970', { maxYear: 1969 }), set('después de 2020', { minYear: 2021 }),
	set('ciencia ficción con más de 8 puntos', { genre: 'sci-fi', minScore: 9 }),
	set('sci-fi con al menos 8 puntos', { genre: 'sci-fi', minScore: 8 }),
	set('ciencia ficción con menos de 8 puntos', { genre: 'sci-fi', maxScore: 7 }),
	set('score >= 9', { minScore: 9 }), set('score <= 7', { maxScore: 7 }),
	set('entre 8 y 9 puntos', { minScore: 8, maxScore: 9 }),
	set('más de 8,5 puntos', { minScore: 9 }), set('hasta 5 puntos', { maxScore: 5 }),
	set('terror en Max', { genre: 'terror', platforms: ['hbo max'] }),
	set('terror en Disney+', { genre: 'terror', platforms: ['disney plus'] }),
	set('comedia en Prime Video', { genre: 'comedia', platforms: ['prime video'] }),
	set('documentales en MUBI', { genre: 'documental', platforms: ['mubi'] }),
	set('animación en Netflix', { genre: 'animacion', platforms: ['netflix'] }),
	set('suspenso en Flow', { genre: 'thriller', platforms: ['flow'] }),
	set('películas nacionales', { editorial: 'pelicula-nacional' }),
	set('terror de culto', { genre: 'terror', editorial: 'culto' }),
	set('musical de los 80', { genre: 'musical', minYear: 1980, maxYear: 1989 }),
	set('comedia romántica en Netflix', { subgenre: 'romcom', platforms: ['netflix'] }),
	set('terror sin gore', { genre: 'terror', excludeSubgenre: 'gore' }),
	set('terror sin Netflix', { genre: 'terror', excludePlatforms: ['netflix'] }),
	set('terror sin gore en Max', { genre: 'terror', excludeSubgenre: 'gore', platforms: ['hbo max'] }),
	set('actor Brad Pitt en Max', { cast: 'brad pitt', platforms: ['hbo max'] }),
	set('terror en Netflix o Max', { genre: 'terror', platforms: ['netflix', 'hbo max'] }),
	set('terror de los 80 en Max con al menos 7 puntos', { genre: 'terror', platforms: ['hbo max'], minYear: 1980, maxYear: 1989, minScore: 7 }),
	set('dirigida por Brad Pitt', { director: 'brad pitt' }),
	{ query: 'zzzzdesconocidoxxxx', kind: 'empty' }, { query: '東京物語ZZZZ', kind: 'empty' },
	{ query: '不存在的電影', kind: 'empty' },
];

export function expectedRecords(records, where) {
	return records.filter((r) => (!where.director || r.searchDirector.includes(where.director)) &&
		(!where.titlePrefix || [r.normalizedTitle,r.normalizedOriginalTitle,r.searchAliases].some((title)=>(title.match(/[\p{L}\p{N}]+/gu)??[]).some((word)=>word.startsWith(where.titlePrefix)))) &&
		(!where.person || r.searchDirector.includes(where.person) || r.searchCast.includes(where.person)) &&
		(!where.cast || r.searchCast.includes(where.cast)) &&
		(!where.genre || (where.genre === 'musical' ? r.genres.includes('musical') : r.primaryGenre === where.genre)) &&
		(!where.editorial || r.genres.includes(where.editorial)) &&
		(!where.subgenre || r.subgenres.includes(where.subgenre)) &&
		(!where.excludeSubgenre || !r.subgenres.includes(where.excludeSubgenre)) &&
		(!where.platforms || where.platforms.some((p) => r.platforms.includes(p))) &&
		(!where.excludePlatforms || !where.excludePlatforms.some((p) => r.platforms.includes(p))) &&
		(where.minYear == null || Number(r.year) >= where.minYear) && (where.maxYear == null || Number(r.year) <= where.maxYear) &&
		(where.minScore == null || (r.score !== null && r.score >= where.minScore)) &&
		(where.maxScore == null || (r.score !== null && r.score <= where.maxScore)));
}
