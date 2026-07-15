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
		slug: 'spider-man-brand-new-day',
		title: 'Spider-Man: Brand New Day',
		releaseDate: '2026-07-31',
		trailerUrl: 'https://www.youtube.com/watch?v=62bIsvRcPv0',
		thumbnailUrl: 'https://i.ytimg.com/vi/62bIsvRcPv0/hqdefault.jpg',
		synopsis:
			'Peter Parker sigue peleando solo en una ciudad que ya no lo recuerda, mientras una amenaza nueva lo obliga a reinventarse otra vez.',
		sourceUrl: 'https://www.sonypictures.com/movies/spidermanbrandnewday',
	},
	{
		slug: 'insidious-out-of-the-further',
		title: 'Insidious: Out of the Further',
		releaseDate: '2026-08-21',
		trailerUrl: 'https://www.youtube.com/watch?v=jxU8FU3o75A',
		thumbnailUrl: 'https://i.ytimg.com/vi/jxU8FU3o75A/hqdefault.jpg',
		synopsis:
			'La saga vuelve al Further con una nueva pesadilla sobrenatural que reabre la puerta a otra posesion familiar.',
		sourceUrl: 'https://www.sonypictures.com/movies/insidiousoutofthefurther',
	},
	{
		slug: 'resident-evil-2026',
		title: 'Resident Evil',
		releaseDate: '2026-09-18',
		trailerUrl: 'https://www.youtube.com/watch?v=SJPu1spHqfk',
		thumbnailUrl: 'https://i.ytimg.com/vi/SJPu1spHqfk/hqdefault.jpg',
		synopsis:
			'Un nuevo reinicio lleva el horror biologico de Resident Evil otra vez al cine con una historia enfocada en supervivencia y contagio.',
		sourceUrl: 'https://www.sonypictures.com/movies/residentevil8',
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
