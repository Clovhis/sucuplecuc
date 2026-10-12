import { expect, test } from '@playwright/test';
import radar from '../../src/data/cinemaNews.generated.json' with { type: 'json' };
import { WEEKLY_RECOMMENDATION_CARDS } from '../../src/data/weeklyRecommendations.generated';
import { GENERATED_UPCOMING_RELEASES } from '../../src/data/upcomingReleases.generated';

test('the published home reads the three saved editions without changing selection at runtime', async ({ page }) => {
	await page.clock.install({ time: new Date('2028-01-01T12:00:00Z') });
	await page.route('https://www.youtube.com/embed/**', (route) => route.fulfill({ contentType: 'text/html', body: '<html><body>Trailer</body></html>' }));
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	const newsLinks = await page.locator('[data-news-segment] a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
	expect(newsLinks).toEqual(radar.items.map(({ link }) => link));
	const cards = page.locator('[data-weekly-recommendation-card]');
	expect(await cards.count()).toBe(WEEKLY_RECOMMENDATION_CARDS.length);
	for (let index = 0; index < WEEKLY_RECOMMENDATION_CARDS.length; index++) {
		const saved = WEEKLY_RECOMMENDATION_CARDS[index];
		await expect(cards.nth(index)).toHaveAttribute('data-weekly-recommendation-platform', saved.platform);
		await expect(cards.nth(index)).toHaveAttribute('data-weekly-recommendation-verdict', saved.verdictLabel);
		await expect(cards.nth(index).locator('[data-weekly-recommendation-poster]')).toHaveAttribute('href', saved.movieUrl);
	}
	const trailers = JSON.parse(await page.locator('#upcoming-suggestion-data').textContent() ?? '[]') as { title: string; releaseDate: string; videoUrl: string }[];
	expect(trailers.map(({ title, releaseDate, videoUrl }) => ({ title, releaseDate, videoUrl }))).toEqual(
		GENERATED_UPCOMING_RELEASES.slice(0, 5).map(({ title, releaseDate, videoUrl }) => ({ title, releaseDate, videoUrl })),
	);
});
