import type { Page } from '@playwright/test';

/** Match preview-e2e.mjs when running these specs against Astro DEV over local HTTP. */
export async function triviaLocalPreview(page: Page, baseURL?: string) {
	if (!baseURL) return;
	const url = new URL('/juegos/trivia/', baseURL);
	if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname)) return;
	await page.route(url.href, async route => {
		const response = await route.fetch();
		await route.fulfill({ response, body: (await response.text()).replace('; upgrade-insecure-requests', '') });
	});
}
