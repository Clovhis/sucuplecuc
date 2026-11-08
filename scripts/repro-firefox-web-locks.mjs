// Diagnostic only: no CinePosta page, Supabase client, server or credentials.
// Compare the automation protocol's pageerror with native unhandled events.
import { firefox } from '@playwright/test';

const browser = await firefox.launch();
try {
	const page = await browser.newPage();
	const automationErrors = [];
	page.on('pageerror', (error) => automationErrors.push(error.message));
	await page.addInitScript(() => {
		window.__nativeLockErrors = [];
		window.addEventListener('error', (event) => window.__nativeLockErrors.push(event.message));
		window.addEventListener('unhandledrejection', (event) => window.__nativeLockErrors.push(String(event.reason)));
	});
	await page.route('**/*', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><p>Isolated Web Locks diagnostic</p>' }));
	await page.goto('http://localhost/web-locks-diagnostic');
	const caught = await page.evaluate(async () => {
		let release, notifyAcquired;
		const held = new Promise((resolve) => { release = resolve; });
		const acquired = new Promise((resolve) => { notifyAcquired = resolve; });
		const holder = navigator.locks.request('isolated-diagnostic', async () => { notifyAcquired(); await held; });
		await acquired;
		let caught = false;
		try {
			await navigator.locks.request('isolated-diagnostic', { ifAvailable: true }, async (lock) => {
				if (!lock) throw new Error('Handled native lock contention');
			});
		} catch { caught = true; }
		release();
		await holder;
		return caught;
	});
	// Drain another browser task before checking the event queues.
	await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
	const nativeUnhandledErrors = await page.evaluate(() => window.__nativeLockErrors);
	console.log(JSON.stringify({ browser: browser.version(), caught, automationErrors, nativeUnhandledErrors }, null, 2));
	if (!caught || nativeUnhandledErrors.length) process.exitCode = 1;
} finally {
	await browser.close();
}
