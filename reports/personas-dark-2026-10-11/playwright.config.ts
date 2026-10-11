import { defineConfig } from '@playwright/test';
import config from '../../playwright.config';

export default defineConfig({
	...config,
	testDir: '../../tests/e2e',
	outputDir: '../../test-results/personas-dark',
	globalTimeout: 300_000,
	// QA uses the already running static preview (or production). Do not
	// attach the Windows web-server plugin to a server owned by this session.
	webServer: undefined,
	use: { ...config.use, video: 'off' },
});
