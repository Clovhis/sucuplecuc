import { expect, test } from '@playwright/test';

const agenda = '[data-upcoming-2027-root]';
const items = '[data-upcoming-2027-item]';

test('2027 agenda is visible as text without links on every viewport', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const section = page.locator(agenda);
	await expect(section).toBeVisible();
	await expect(section.getByRole('heading', { name: 'Las grandes que vienen' })).toBeVisible();
	await expect(section.locator(items)).toHaveCount(10);
	await expect(page.locator('main [data-upcoming-2027-root]')).toHaveCount(1);
	await expect(page.locator('footer [data-upcoming-2027-root]')).toHaveCount(0);
	const placement = await page.evaluate(() => {
		const community = document.querySelector('#comunidad-home');
		const agenda = document.querySelector('[data-upcoming-2027-root]');
		const footer = document.querySelector('footer.site-footer');
		if (!community || !agenda || !footer) return false;
		return Boolean(
			community.compareDocumentPosition(agenda) & Node.DOCUMENT_POSITION_FOLLOWING &&
			agenda.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
		);
	});
	expect(placement).toBeTruthy();
	await expect(section.locator('a')).toHaveCount(0);
	await expect(section).toContainText('Avengers: Secret Wars');
	await expect(section).toContainText('The Lord of the Rings: The Hunt for Gollum');
	await expect(section.locator('time[datetime="2027-12-17"]')).toHaveCount(2);
});

test('2027 agenda filters titles and semesters without changing the page URL', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const section = page.locator(agenda);
	const search = section.locator('[data-upcoming-2027-search]');
	const period = section.locator('[data-upcoming-2027-period]');

	await search.fill('avengers');
	await expect(section.locator(`${items}:visible`)).toHaveCount(1);
	await expect(section.locator('[data-upcoming-2027-status]')).toHaveText('1 de 10 títulos visibles');
	await expect(section.locator('[data-upcoming-2027-item]:visible')).toContainText('Avengers: Secret Wars');

	await search.fill('');
	await period.selectOption('first');
	await expect(section.locator(`${items}:visible`)).toHaveCount(4);
	await expect(section.locator('[data-upcoming-2027-status]')).toHaveText('4 de 10 títulos visibles');
	await expect(page).toHaveURL(/\/$/);
});

test('mobile 2027 agenda opens from its disclosure and stays contained', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.startsWith('mobile-'), 'This interaction is intentionally mobile-only.');
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const section = page.locator(agenda);
	const disclosure = section.locator('[data-upcoming-2027-disclosure]');
	await expect(section.locator('summary')).toBeVisible();
	await expect(disclosure).not.toHaveAttribute('open', '');

	await section.locator('summary').click();
	await expect(section.locator(`${items}:visible`)).toHaveCount(10);

	const metrics = await page.evaluate(() => ({
		contentFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
		searchHeight: document.querySelector<HTMLElement>('[data-upcoming-2027-search]')?.getBoundingClientRect().height ?? 0,
		selectHeight: document.querySelector<HTMLElement>('[data-upcoming-2027-period]')?.getBoundingClientRect().height ?? 0,
	}));

	expect(metrics.contentFits).toBeTruthy();
	expect(metrics.searchHeight).toBeGreaterThanOrEqual(44);
	expect(metrics.selectHeight).toBeGreaterThanOrEqual(44);
});
