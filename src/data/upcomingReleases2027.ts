export type Upcoming2027ReleaseStatus = 'anunciada' | 'prevista';

export interface Upcoming2027Release {
	id: string;
	title: string;
	releaseDate: string;
	status: Upcoming2027ReleaseStatus;
}

// Selección editorial revisada el 21/08/2026. Son fechas internacionales
// anunciadas o previstas: la llegada a salas argentinas puede variar.
export const UPCOMING_RELEASES_2027_UPDATED_AT = '2026-08-21';

export const UPCOMING_RELEASES_2027: Upcoming2027Release[] = [
	{
		id: 'godzilla-x-kong-supernova',
		title: 'Godzilla x Kong: Supernova',
		releaseDate: '2027-03-26',
		status: 'anunciada',
	},
	{
		id: 'the-legend-of-zelda',
		title: 'The Legend of Zelda',
		releaseDate: '2027-04-30',
		status: 'anunciada',
	},
	{
		id: 'star-wars-starfighter',
		title: 'Star Wars: Starfighter',
		releaseDate: '2027-05-28',
		status: 'anunciada',
	},
	{
		id: 'spider-man-beyond-the-spider-verse',
		title: 'Spider-Man: Beyond the Spider-Verse',
		releaseDate: '2027-06-18',
		status: 'anunciada',
	},
	{
		id: 'a-minecraft-movie-squared',
		title: 'A Minecraft Movie: Squared',
		releaseDate: '2027-07-23',
		status: 'anunciada',
	},
	{
		id: 'a-quiet-place-part-iii',
		title: 'A Quiet Place Part III',
		releaseDate: '2027-07-30',
		status: 'prevista',
	},
	{
		id: 'the-batman-part-ii',
		title: 'The Batman — Part II',
		releaseDate: '2027-10-01',
		status: 'prevista',
	},
	{
		id: 'frozen-3',
		title: 'Frozen 3',
		releaseDate: '2027-11-24',
		status: 'anunciada',
	},
	{
		id: 'the-lord-of-the-rings-the-hunt-for-gollum',
		title: 'The Lord of the Rings: The Hunt for Gollum',
		releaseDate: '2027-12-17',
		status: 'anunciada',
	},
	{
		id: 'avengers-secret-wars',
		title: 'Avengers: Secret Wars',
		releaseDate: '2027-12-17',
		status: 'anunciada',
	},
];
