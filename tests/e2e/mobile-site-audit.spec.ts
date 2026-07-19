import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const routes = [
	{ id: 'home', path: '/' },
	{ id: 'movie', path: '/peliculas/12-angry-men-1957/' },
	{ id: 'trailer', path: '/trailers/12-angry-men-1957/' },
	{ id: 'people', path: '/personas/' },
	{ id: 'person', path: '/personas/al-pacino/' },
	{ id: 'recommendation', path: '/que-miro-hoy/' },
	{ id: 'community', path: '/comunidad/' },
	{ id: 'discussion', path: '/comunidad/peliculas/12-angry-men-1957/' },
	{ id: 'methodology', path: '/como-funciona/' },
	{ id: 'about', path: '/sobre-cine-posta/' },
	{ id: 'editorial', path: '/politica-editorial/' },
	{ id: 'sources', path: '/fuentes-y-datos/' },
	{ id: 'contact', path: '/contacto/' },
	{ id: 'privacy', path: '/politica-de-privacidad/' },
] as const;

const compactRoutes = routes.filter(({ id }) => ['home', 'movie', 'people', 'recommendation'].includes(id));
const landscapeRoutes = routes.filter(({ id }) => ['home', 'movie', 'person'].includes(id));

const scenarios = [
	...routes.map((route) => ({ ...route, viewport: { width: 390, height: 844 }, size: '390x844' })),
	...compactRoutes.map((route) => ({ ...route, viewport: { width: 320, height: 568 }, size: '320x568' })),
	...landscapeRoutes.map((route) => ({ ...route, viewport: { width: 844, height: 390 }, size: '844x390' })),
];

test.describe('mobile-only whole-site audit', () => {
	test('captures representative route templates and mobile UX metrics', async ({ page }, testInfo) => {
		test.skip(!testInfo.project.name.startsWith('mobile-'), 'This audit is intentionally mobile-only.');
		test.setTimeout(120_000);
		const projectName = testInfo.project.name;
		const outputDirectory = join(process.cwd(), 'test-results', 'mobile-site-audit', projectName);
		mkdirSync(outputDirectory, { recursive: true });
		const results: unknown[] = [];

		await page.route(/pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net/, (route) =>
			route.fulfill({ status: 204, contentType: 'text/javascript', body: '' }),
		);

		for (const scenario of scenarios) {
			await page.setViewportSize(scenario.viewport);
			const consoleErrors: string[] = [];
			const onConsole = (message: { type(): string; text(): string }) => {
				if (message.type() === 'error') consoleErrors.push(message.text());
			};
			page.on('console', onConsole);

			const response = await page.goto(scenario.path, { waitUntil: 'domcontentloaded' });
			await page.evaluate(() => window.scrollTo(0, 0));
			await page.waitForTimeout(350);

			const metrics = await page.evaluate(() => {
				const visible = (element: Element) => {
					const htmlElement = element as HTMLElement;
					const style = getComputedStyle(htmlElement);
					const rect = htmlElement.getBoundingClientRect();
					return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
				};

				const targetSelector = 'button, input, select, textarea, summary, a';
				const undersizedTargets = [...document.querySelectorAll<HTMLElement>(targetSelector)]
					.filter(visible)
					.filter((element) => {
						const style = getComputedStyle(element);
						const isUnboxedTextLink =
							element.tagName === 'A' &&
							style.backgroundColor === 'rgba(0, 0, 0, 0)' &&
							['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].every(
								(property) => Number.parseFloat(style.getPropertyValue(property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`))) === 0,
							);
						if (isUnboxedTextLink) return false;
						if (element instanceof HTMLInputElement && ['radio', 'checkbox'].includes(element.type)) {
							const explicitLabel = element.id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`) : null;
							const label = element.closest<HTMLLabelElement>('label') ?? explicitLabel;
							if (label) {
								const labelRect = label.getBoundingClientRect();
								if (labelRect.width >= 48 && labelRect.height >= 48) return false;
							}
						}
						const rect = element.getBoundingClientRect();
						// Browsers can report a nominal 48 CSS px target as 47.99 due to subpixel layout.
						return rect.width < 47.5 || rect.height < 47.5;
					})
					.slice(0, 30)
					.map((element) => {
						const rect = element.getBoundingClientRect();
						return {
							tag: element.tagName.toLowerCase(),
							selector: element.className || element.id || element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 50),
							width: Math.round(rect.width),
							height: Math.round(rect.height),
						};
					});

				const smallText = [...document.querySelectorAll<HTMLElement>('body *')]
					.filter(visible)
					.filter((element) => element.childNodes.length === 1 && element.childNodes[0]?.nodeType === Node.TEXT_NODE)
					.map((element) => ({
						selector: element.className || element.tagName.toLowerCase(),
						text: element.textContent?.trim().slice(0, 60),
						size: Number.parseFloat(getComputedStyle(element).fontSize),
					}))
					.filter((entry) => entry.text && entry.size < 12)
					.slice(0, 30);

				const fixedOrSticky = [...document.querySelectorAll<HTMLElement>('body *')]
					.filter(visible)
					.filter((element) => ['fixed', 'sticky'].includes(getComputedStyle(element).position))
					.map((element) => {
						const rect = element.getBoundingClientRect();
						return {
							selector: element.className || element.id || element.tagName.toLowerCase(),
							position: getComputedStyle(element).position,
							top: Math.round(rect.top),
							bottom: Math.round(rect.bottom),
							height: Math.round(rect.height),
						};
					});

				const imagesMissingDimensions = [...document.querySelectorAll<HTMLImageElement>('img')]
					.filter(visible)
					.filter((image) => !image.hasAttribute('width') || !image.hasAttribute('height'))
					.map((image) => image.className || image.getAttribute('src'))
					.slice(0, 30);

				return {
					title: document.title,
					h1Count: document.querySelectorAll('h1').length,
					mainCount: document.querySelectorAll('main').length,
					hasViewportMeta: Boolean(document.querySelector('meta[name="viewport"]')),
					hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
					documentWidth: document.documentElement.scrollWidth,
					viewportWidth: window.innerWidth,
					documentHeight: document.documentElement.scrollHeight,
					undersizedTargets,
					smallText,
					fixedOrSticky,
					imagesMissingDimensions,
				};
			});

			await page.screenshot({
				path: join(outputDirectory, `${scenario.id}-${scenario.size}-top.png`),
				animations: 'disabled',
			});
			await page.evaluate(() => window.scrollTo(0, Math.min(window.innerHeight * 1.5, document.documentElement.scrollHeight - window.innerHeight)));
			await page.waitForTimeout(100);
			await page.screenshot({
				path: join(outputDirectory, `${scenario.id}-${scenario.size}-mid.png`),
				animations: 'disabled',
			});

			page.off('console', onConsole);
			results.push({
				id: scenario.id,
				path: scenario.path,
				size: scenario.size,
				status: response?.status(),
				consoleErrors,
				...metrics,
			});
		}

		writeFileSync(join(outputDirectory, 'results.json'), JSON.stringify(results, null, 2));
		expect(results).toHaveLength(scenarios.length);
	});
});
