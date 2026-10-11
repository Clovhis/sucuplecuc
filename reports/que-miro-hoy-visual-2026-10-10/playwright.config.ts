import { defineConfig } from '@playwright/test';
import config from '../../playwright.config';

// Keep the repository's browser matrix and checks. Screenshot evidence is
// captured separately; disable video recording for this Windows QA run.
export default defineConfig({
	...config,
	testDir: '../../tests/e2e',
	outputDir: '../../test-results/que-miro-hoy-visual-final',
	use: { ...config.use, video: 'off' },
});
