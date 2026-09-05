import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { optimizePersonImage } from './optimize-people-images.mjs';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'cineposta-people-image-'));
try {
	const sourcePath = path.join(tempDir, 'portrait.png');
	const source = await sharp({
		create: { width: 1920, height: 2400, channels: 3, background: { r: 160, g: 110, b: 82 } },
	})
		.withMetadata({ exif: { IFD0: { Artist: 'Cine Posta test' } } })
		.png()
		.toBuffer();
	await writeFile(sourcePath, source);

	const result = await optimizePersonImage(sourcePath);
	assert.equal(path.extname(result.outputPath), '.jpg');
	const optimized = await sharp(await readFile(result.outputPath)).metadata();
	assert.equal(optimized.format, 'jpeg');
	assert.equal(optimized.width, 960);
	assert.equal(optimized.height, 1200);
	assert.equal(Boolean(optimized.exif), false);
	assert.ok(result.outputBytes < result.inputBytes);
	console.log('People image optimizer test passed.');
} finally {
	await rm(tempDir, { recursive: true, force: true });
}
