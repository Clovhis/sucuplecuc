import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { optimizePersonImage } from './optimize-people-images.mjs';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'cineposta-people-image-'));

function sha256(buffer) {
	return createHash('sha256').update(buffer).digest('hex');
}

async function assertSecondRunIsUnchanged(filePath) {
	const before = await readFile(filePath);
	const result = await optimizePersonImage(filePath);
	const after = await readFile(filePath);
	assert.equal(result.changed, false);
	assert.equal(result.outputPath, filePath);
	assert.equal(sha256(after), sha256(before));
}

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
	await assertSecondRunIsUnchanged(result.outputPath);

	const transparentPath = path.join(tempDir, 'transparent-portrait.png');
	await sharp({
		create: { width: 1200, height: 1600, channels: 4, background: { r: 30, g: 40, b: 50, alpha: 0 } },
	})
		.composite([{ input: await sharp({ create: { width: 640, height: 960, channels: 4, background: { r: 200, g: 140, b: 90, alpha: 1 } } }).png().toBuffer(), left: 280, top: 320 }])
		.withMetadata({ exif: { IFD0: { Artist: 'Cine Posta test' } } })
		.png()
		.toFile(transparentPath);
	const transparentResult = await optimizePersonImage(transparentPath);
	assert.equal(path.extname(transparentResult.outputPath), '.png');
	const transparentMetadata = await sharp(await readFile(transparentResult.outputPath)).metadata();
	assert.equal(transparentMetadata.format, 'png');
	assert.equal(transparentMetadata.width, 900);
	assert.equal(transparentMetadata.height, 1200);
	assert.equal(Boolean(transparentMetadata.exif), false);
	await assertSecondRunIsUnchanged(transparentResult.outputPath);

	const landscapePath = path.join(tempDir, 'landscape.png');
	await sharp({
		create: { width: 2400, height: 1800, channels: 3, background: { r: 65, g: 110, b: 150 } },
	})
		.withMetadata({ exif: { IFD0: { Artist: 'Cine Posta test' } } })
		.png()
		.toFile(landscapePath);
	const landscapeResult = await optimizePersonImage(landscapePath);
	assert.equal(path.extname(landscapeResult.outputPath), '.jpg');
	const landscapeMetadata = await sharp(await readFile(landscapeResult.outputPath)).metadata();
	assert.equal(landscapeMetadata.format, 'jpeg');
	assert.equal(landscapeMetadata.width, 1600);
	assert.equal(landscapeMetadata.height, 1200);
	assert.equal(landscapeMetadata.isProgressive, true);
	assert.equal(landscapeMetadata.chromaSubsampling, '4:4:4');
	assert.equal(Boolean(landscapeMetadata.exif), false);
	await assertSecondRunIsUnchanged(landscapeResult.outputPath);
	console.log('People image optimizer test passed.');
} finally {
	await rm(tempDir, { recursive: true, force: true });
}
