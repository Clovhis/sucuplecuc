// Shared by the manual controls and natural-language query constraints.
export const matchesAnyFilterValue = (active: readonly string[], values: readonly string[]): boolean =>
	active.length === 0 || active.some((value) => values.includes(value));

export function matchesCatalogGenre(active: readonly string[], entry: { primaryGenre: string; genres: string[] }): boolean {
	return active.length === 0 || active.some((genre) =>
		genre === 'musical' ? entry.genres.includes(genre) : entry.primaryGenre === genre,
	);
}

export function isMovieYearMatch(year: string, active: readonly string[]): boolean {
	const numericYear = Number(year);
	return active.length === 0 || active.some((value) => {
		if (value.startsWith('year-')) return numericYear === Number(value.slice(5));
		if (value === 'before-1950') return numericYear < 1950;
		const decade = Number(value.slice(0, 4));
		return Number.isFinite(decade) && numericYear >= decade && numericYear <= decade + 9;
	});
}
