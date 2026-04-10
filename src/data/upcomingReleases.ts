export interface UpcomingReleaseFallback {
	slug: string;
	title: string;
	releaseDate: string;
	trailerUrl: string;
	thumbnailUrl: string;
}

export const UPCOMING_RELEASE_FALLBACKS: UpcomingReleaseFallback[] = [
	{
		slug: 'the-devil-wears-prada-2',
		title: 'The Devil Wears Prada 2',
		releaseDate: '2026-05-01',
		trailerUrl: 'https://www.youtube.com/watch?v=e9HXmMnUEdE',
		thumbnailUrl: 'https://i.ytimg.com/vi/e9HXmMnUEdE/hqdefault.jpg',
	},
	{
		slug: 'the-mandalorian-and-grogu',
		title: 'The Mandalorian and Grogu',
		releaseDate: '2026-05-22',
		trailerUrl: 'https://www.youtube.com/watch?v=_pa1KLXuW0Y',
		thumbnailUrl: 'https://i.ytimg.com/vi/_pa1KLXuW0Y/hqdefault.jpg',
	},
	{
		slug: 'toy-story-5',
		title: 'Toy Story 5',
		releaseDate: '2026-06-19',
		trailerUrl: 'https://www.youtube.com/watch?v=c51ND9Hdbw0',
		thumbnailUrl: 'https://i.ytimg.com/vi/c51ND9Hdbw0/hqdefault.jpg',
	},
	{
		slug: 'moana-2026',
		title: 'Moana',
		releaseDate: '2026-07-10',
		trailerUrl: 'https://www.youtube.com/watch?v=n7f6hlKsxxo',
		thumbnailUrl: 'https://i.ytimg.com/vi/n7f6hlKsxxo/hqdefault.jpg',
	},
	{
		slug: 'avengers-doomsday',
		title: 'Avengers: Doomsday',
		releaseDate: '2026-12-18',
		trailerUrl: 'https://www.youtube.com/watch?v=399Ez7WHK5s',
		thumbnailUrl: 'https://i.ytimg.com/vi/399Ez7WHK5s/hqdefault.jpg',
	},
];
