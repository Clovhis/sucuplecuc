export interface UpcomingReleaseFallback {
	slug: string;
	title: string;
	releaseDate: string;
	trailerUrl: string;
	thumbnailUrl: string;
	synopsis?: string;
	sourceUrl?: string;
}

export const UPCOMING_RELEASE_FALLBACKS: UpcomingReleaseFallback[] = [
	{
		slug: 'masters-of-the-universe',
		title: 'Masters of the Universe',
		releaseDate: '2026-06-04',
		trailerUrl: 'https://www.youtube.com/watch?v=rJSmz-zhDxE',
		thumbnailUrl: 'https://media.themoviedb.org/t/p/w780/piV2OnzTZCyGBP9JCjlHIgKGlfo.jpg',
		synopsis:
			'Prince Adam vuelve a Eternia para enfrentar a Skeletor y asumir su destino como He-Man.',
		sourceUrl: 'https://www.themoviedb.org/movie/454639-masters-of-the-universe',
	},
	{
		slug: 'toy-story-5',
		title: 'Toy Story 5',
		releaseDate: '2026-06-19',
		trailerUrl: 'https://www.youtube.com/watch?v=c51ND9Hdbw0',
		thumbnailUrl: 'https://i.ytimg.com/vi/c51ND9Hdbw0/hqdefault.jpg',
		synopsis:
			'Woody, Buzz, Jessie y el resto de los juguetes chocan con una nueva amenaza tecnológica.',
		sourceUrl: 'https://www.pixar.com/toy-story-5',
	},
	{
		slug: 'supergirl',
		title: 'Supergirl',
		releaseDate: '2026-06-24',
		trailerUrl: 'https://www.youtube.com/watch?v=YqdAEdkHrwo',
		thumbnailUrl: 'https://i.ytimg.com/vi/YqdAEdkHrwo/hqdefault.jpg',
		synopsis:
			'Kara Zor-El cruza el espacio junto a una aliada inesperada en una historia de venganza y justicia.',
		sourceUrl: 'https://www.supergirlmovie.com/',
	},
	{
		slug: 'moana-2026',
		title: 'Moana',
		releaseDate: '2026-07-10',
		trailerUrl: 'https://www.youtube.com/watch?v=n7f6hlKsxxo',
		thumbnailUrl: 'https://i.ytimg.com/vi/n7f6hlKsxxo/hqdefault.jpg',
		synopsis:
			'La remake live action vuelve a navegar por la mitologia polinesia con Moana y Maui.',
		sourceUrl: 'https://www.themoviedb.org/movie/1108427-moana',
	},
	{
		slug: 'the-odyssey-2026',
		title: 'La Odisea',
		releaseDate: '2026-07-16',
		trailerUrl: 'https://www.youtube.com/watch?v=Mzw2ttJD2qQ',
		thumbnailUrl: 'https://i.ytimg.com/vi/Mzw2ttJD2qQ/hqdefault.jpg',
		synopsis:
			'Christopher Nolan lleva el viaje de Odiseo a una escala epica de aventura, mito y regreso imposible.',
	},
	{
		slug: 'star-wars-the-mandalorian-and-grogu',
		title: 'Star Wars: The Mandalorian and Grogu',
		releaseDate: '2026-05-20',
		trailerUrl: 'https://www.youtube.com/watch?v=efFD0ZjyUn8',
		thumbnailUrl: 'https://media.themoviedb.org/t/p/w780/MJcERawyqGqJdPsOBc0C449hQ9.jpg',
		synopsis:
			'El Mandaloriano y Grogu saltan al cine con una nueva aventura del universo Star Wars.',
	},
	{
		slug: 'the-devil-wears-prada-2',
		title: 'The Devil Wears Prada 2',
		releaseDate: '2026-05-01',
		trailerUrl: 'https://www.youtube.com/watch?v=e9HXmMnUEdE',
		thumbnailUrl: 'https://i.ytimg.com/vi/e9HXmMnUEdE/hqdefault.jpg',
		synopsis:
			'Miranda Priestly vuelve a moverse entre moda, poder y una industria editorial que ya no es la misma.',
	},
	{
		slug: 'avengers-doomsday',
		title: 'Avengers: Doomsday',
		releaseDate: '2026-12-18',
		trailerUrl: 'https://www.youtube.com/watch?v=399Ez7WHK5s',
		thumbnailUrl: 'https://i.ytimg.com/vi/399Ez7WHK5s/hqdefault.jpg',
		synopsis:
			'Los Avengers vuelven a reunirse para abrir una nueva escala de amenaza en el universo Marvel.',
	},
];
