import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { triviaLocalPreview } from './trivia-preview';

test.beforeEach(async ({ page, baseURL }) => { await triviaLocalPreview(page, baseURL); });

const movies = ['pulp-fiction-1994', 'reservoir-dogs-1992', 'fargo-secuestro-voluntario-1996'].map(slug => {
	const movie = JSON.parse(readFileSync(`src/data/movies/${slug}.json`, 'utf8'));
	return { slug, title: movie.title, year: movie.year, poster: `/${movie.poster}` };
});

async function mockGame(page: Page, seconds = 25) {
	await page.clock.install();
	await page.clock.pauseAt(new Date());
	const id = '11111111-1111-4111-8111-111111111111';
	await page.addInitScript(({ id }) => {
		const encode = (value: object) => btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
		const user = { id, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
		localStorage.setItem('cineposta-trivia-auth-v1', JSON.stringify({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test`, refresh_token: 'test', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: 'bearer', user }));
	}, { id });
	let round = 0, phase = 'question', hintsUsed = 0, discarded: string | null = null;
	let deadline = 0;
	const answers: object[] = [];
	let score = 0;
	const question = () => ({ id: `${id}:${round}`, kind: round % 2 ? 'Tres pistas' : 'Elegí el afiche', presentation: round % 2 ? undefined : 'posters', people: [], prompt: round % 2 ? 'Tres pistas: historias fuera de orden, un asesino a sueldo y una salida con la esposa de su jefe. ¿Qué película es?' : '¿Qué afiche corresponde a unas historias criminales entrelazadas y contadas fuera de orden?', options: movies });
	const state = () => ({ id, player: { id, name: 'Butaca de prueba', country: 'AR', age: 30 }, round, roundSeconds: seconds, phase, deadlineMs: deadline, serverNowMs: Date.now(), question: phase === 'finished' ? null : question(), answers, hintsUsed, discarded, score, bonus: phase === 'finished' ? (3 - hintsUsed) * 250 : 0 });
	await page.route('**/rest/v1/rpc/*', async route => {
		const name = route.request().url().split('/').pop();
		const params = route.request().postDataJSON();
		if (!deadline) deadline = Date.now() + seconds * 1000;
		if (name === 'list_trivia_high_scores') return route.fulfill({ json: [] });
		if (name === 'use_trivia_hint') { hintsUsed++; discarded = movies[2].slug; }
		if (name === 'answer_trivia_question' && phase === 'question') {
			const choice = movies.find(movie => movie.slug === params.p_choice) ?? null;
			const correct = choice?.slug === movies[0].slug;
			const points = correct ? 1100 : 0;
			answers.push({ questionId: `${id}:${round}`, prompt: question().prompt, fact: 'Historias criminales que se cruzan y cambian de orden.', movie: movies[0], choice, correct, remainingMs: choice ? 12500 : 0, points });
			score += points; phase = round === 19 ? 'finished' : 'review';
			if (phase === 'finished') score += (3 - hintsUsed) * 250;
		}
		if (name === 'next_trivia_question' && phase === 'review') { round++; phase = 'question'; discarded = null; deadline = Date.now() + seconds * 1000; }
		await route.fulfill({ json: state() });
	});
	await page.goto('/juegos/trivia/');
	await expect(page.locator('[data-game]')).toBeVisible();
}

test('afiches, teclado, pistas y partida completa hasta el resumen', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', error => errors.push(error.message));
	await mockGame(page);
	await expect(page.locator('[data-seconds]')).toHaveText(/2[345]/);
	const choices = page.locator('[data-choice]');
	await expect(choices).toHaveCount(3);
	for (const image of await choices.locator('img').all()) {
		await expect.poll(() => image.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
	}
	for (const width of [320, 390, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
		for (const button of await choices.all()) {
			expect(await button.evaluate(node => node.clientWidth >= 44 && node.clientHeight >= 44 && node.scrollWidth <= node.clientWidth)).toBe(true);
		}
	}
	await page.setViewportSize({ width: 390, height: 844 });
	await page.locator('[data-game]').screenshot({ path: `test-results/trivia-posters-${test.info().project.name}.png` });
	await page.locator('[data-use-hint]').click();
	await expect(choices.nth(2)).toBeDisabled();
	await expect(page.locator('[data-hints-count]')).toHaveText('2/3');
	await page.keyboard.press('1');
	await expect(page.locator('[data-feedback]')).toContainText('¡Esa es!');
	await expect(page.locator('[data-reveal] a').first()).toHaveAttribute('target', '_blank');
	await page.locator('[data-next]').click();
	await expect(page.locator('[data-kind]')).toHaveText('Tres pistas');
	await expect(choices.locator('img')).toHaveCount(0);
	await page.keyboard.press('2');
	await expect(page.locator('[data-feedback]')).toContainText('Esta se escapó');
	for (let round = 2; round < 20; round++) {
		await page.locator('[data-next]').click();
		await expect(page.locator('[data-round]')).toHaveText(`Pregunta ${String(round + 1).padStart(2, '0')} / 20`);
		await page.keyboard.press('1');
		if (round < 19) await expect(page.locator('[data-next]')).toBeVisible();
	}
	await expect(page.locator('[data-summary]')).toBeVisible();
	await expect(page.locator('.trivia-result')).toHaveCount(20);
	await expect(page.locator('[data-result-copy]')).toContainText('19 aciertos');
	await expect(page.locator('[data-save-status]')).toContainText('verificado y guardado');
	await expect(page.locator('[data-final-points]')).toHaveText('21.400');
	expect(errors).toEqual([]);
});

test('copia limitada a la pregunta activa, texto accesible y títulos si falla un afiche', async ({ page }) => {
	await mockGame(page);
	const protectedEvents = () => page.locator('[data-question]').evaluate(node => ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].map(type => {
		const event = new Event(type, { bubbles: true, cancelable: true }); node.dispatchEvent(event); return event.defaultPrevented;
	}));
	expect(await protectedEvents()).toEqual([true, true, true, true, true]);
	await expect(page.getByRole('heading', { name: /Qué afiche corresponde/ })).toBeVisible();
	expect(await page.locator('[data-current-player]').evaluate(node => { const event = new Event('copy', { bubbles: true, cancelable: true }); node.dispatchEvent(event); return event.defaultPrevented; })).toBe(false);
	await page.locator('[data-choice] img').first().evaluate(node => { (node as HTMLImageElement).src = '/missing-poster-test.webp'; });
	await expect(page.locator('[data-choice]').first()).toContainText(movies[0].title);
	await page.keyboard.press('1');
	await expect(page.locator('[data-next]')).toBeVisible();
	expect(await protectedEvents()).toEqual([false, false, false, false, false]);
});

test('una partida anterior conserva el reloj de 20 segundos', async ({ page }) => {
	await mockGame(page, 20);
	await expect(page.locator('[data-seconds]')).toHaveText(/(19|20)/);
	await expect(page.locator('[data-clock]')).toHaveAttribute('style', /--time: 0\.[89]|--time: 1/);
});

test('el reloj agota los 25 segundos y cierra la pregunta sin acierto', async ({ page }) => {
	await mockGame(page);
	await page.clock.runFor(25050);
	await expect(page.locator('[data-feedback]')).toContainText('Se terminó el tiempo');
	await expect(page.locator('[data-seconds]')).toHaveText('0');
	await expect(page.locator('[data-live-score]')).toHaveText('0 puntos');
	await expect(page.locator('[data-use-hint]')).toBeDisabled();
	await expect(page.locator('[data-next]')).toBeVisible();
});
