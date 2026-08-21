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
	await expect(section.locator('input, select, [role="search"]')).toHaveCount(0);
	await expect(section.locator('summary, [data-upcoming-2027-disclosure]')).toHaveCount(0);
	await expect(section).not.toContainText('Una selección corta de películas que ya tienen fecha o ventana prevista para llegar a los cines.');
	await expect(section).not.toContainText('Agenda completa');
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
	await expect(section).toContainText('Fecha confirmada');
	await expect(section.locator('time[datetime="2027-12-17"]')).toHaveCount(2);
});

test('mobile 2027 agenda stays contained without a disclosure', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.startsWith('mobile-'), 'This interaction is intentionally mobile-only.');
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const section = page.locator(agenda);
	await expect(section.locator(`${items}:visible`)).toHaveCount(10);
	await expect(section.locator('summary, [data-upcoming-2027-disclosure]')).toHaveCount(0);

	const metrics = await page.evaluate(() => ({
		contentFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
	}));

	expect(metrics.contentFits).toBeTruthy();
});
