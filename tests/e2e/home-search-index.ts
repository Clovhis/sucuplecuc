import type { Page } from '@playwright/test';
import { decodeHomeSearchIndex } from '../../src/lib/home-search-codec';
import type { HomeMovieRecord } from '../../src/types/home-catalog';
export function broadSearchQuery(records: HomeMovieRecord[]): string {
	const titles = new Set(records.flatMap((row) => [row.normalizedTitle, row.normalizedOriginalTitle, ...row.searchAliases.split(' | ')]));
	const query = ['ali', 'res', 'the', 'ent', 'sta'].find((value) => !titles.has(value) && records.filter((row) => row.searchable.includes(value)).length >= 73);
	if (!query) throw new Error('No broad fixture query in this catalog');
	return query;
}
export async function readHomeSearchRecords(page: Page) {
	const url = await page.locator('[data-home-movie-index]').getAttribute('data-home-movie-index-url');
	const response = await page.request.get(url!);
	return decodeHomeSearchIndex(await response.json());
}
