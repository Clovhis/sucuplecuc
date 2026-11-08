import type { Page } from '@playwright/test';

// Firefox's debugger can report a handled rejection from a Web Locks callback
// as pageerror. Observe the browser's actual uncaught-error events instead.
// The companion spec verifies both genuine failures and handled contention.
export async function captureUnhandledErrors(page: Page): Promise<string[]> {
	const errors: string[] = [];
	await page.exposeFunction('__cinepostaTestRuntimeError', (message: string) => { errors.push(message); });
	await page.addInitScript(() => {
		const report = (message: string): void => {
			const bridge = (window as unknown as { __cinepostaTestRuntimeError: (message: string) => Promise<void> }).__cinepostaTestRuntimeError;
			void bridge(message).catch(() => { /* The originating document may have navigated away. */ });
		};
		window.addEventListener('error', (event) => report(event.error instanceof Error ? event.error.message : event.message));
		window.addEventListener('unhandledrejection', (event) => report(event.reason instanceof Error ? event.reason.message : String(event.reason)));
	});
	return errors;
}
