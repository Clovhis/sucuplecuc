import { expect, test } from '@playwright/test';
import { captureUnhandledErrors } from './runtime-errors';

test('runtime error capture distinguishes handled native lock contention from real failures', async ({ page }) => {
	const errors = await captureUnhandledErrors(page);
	await page.route('**/runtime-errors-fixture*', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><main>Runtime diagnostics</main>' }));
	await page.goto('/runtime-errors-fixture');
	const handled = await page.evaluate(async () => {
		let release!: () => void;
		let notifyAcquired!: () => void;
		const held = new Promise<void>((resolve) => { release = resolve; });
		const acquired = new Promise<void>((resolve) => { notifyAcquired = resolve; });
		const holder = navigator.locks.request('cineposta-test-contention', async () => { notifyAcquired(); await held; });
		await acquired;
		let caught = false;
		try {
			await navigator.locks.request('cineposta-test-contention', { ifAvailable: true }, async (lock) => {
				if (!lock) throw new Error('Handled native contention');
			});
		} catch { caught = true; }
		release();
		await holder;
		return caught;
	});
	expect(handled).toBe(true);
	expect(errors).toEqual([]);
	await page.evaluate(() => { setTimeout(() => { throw new Error('Actual uncaught exception'); }, 0); });
	await expect.poll(() => errors).toContain('Actual uncaught exception');
	await page.goto('/runtime-errors-fixture?second-document');
	await page.evaluate(() => { void Promise.reject(new Error('Actual unhandled rejection')); });
	await expect.poll(() => errors).toEqual(['Actual uncaught exception', 'Actual unhandled rejection']);
});
