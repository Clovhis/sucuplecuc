import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT_DIR = path.resolve('.');
const PEOPLE_DIR = path.join(ROOT_DIR, 'public', 'people');
const SOURCE_DIR = path.join(ROOT_DIR, 'src', 'data');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const JPEG_OPTIONS = {
	chromaSubsampling: '4:4:4',
	mozjpeg: true,
	progressive: true,
	quality: 86,
};
const PORTRAIT_LIMIT = { width: 960, height: 1200 };
const LANDSCAPE_LIMIT = { width: 1600, height: 1200 };

async function hasVisibleTransparency(input, metadata) {
	if (!metadata.hasAlpha) return false;
	const { channels } = await sharp(input, { animated: false, failOn: 'warning' }).stats();
	const alpha = channels.at(-1);
	return Boolean(alpha && alpha.min < 255);
}

function getOutputExtension(hasTransparency) {
	return hasTransparency ? '.png' : '.jpg';
}

function getDimensionLimit(metadata) {
	return metadata.width > metadata.height ? LANDSCAPE_LIMIT : PORTRAIT_LIMIT;
}

function getOutputPath(inputPath, hasTransparency) {
	return path.join(path.dirname(inputPath), `${path.basename(inputPath, path.extname(inputPath))}${getOutputExtension(hasTransparency)}`);
}

async function isOptimized(input, metadata, filePath) {
	const limit = getDimensionLimit(metadata);
	const expectedExtension = getOutputExtension(await hasVisibleTransparency(input, metadata));
	const hasEmbeddedMetadata = Boolean(metadata.exif || metadata.icc || metadata.iptc || metadata.xmp);
	return (
		path.extname(filePath).toLowerCase() === expectedExtension &&
		metadata.width <= limit.width &&
		metadata.height <= limit.height &&
		!hasEmbeddedMetadata
	);
}

export async function optimizePersonImage(inputPath, { dryRun = false } = {}) {
	// Read first so Windows does not keep the source file locked while replacing it in place.
	const input = await readFile(inputPath);
	const source = sharp(input, { animated: false, failOn: 'warning' }).rotate();
	const metadata = await source.metadata();
	if (!metadata.width || !metadata.height) {
		throw new Error(`No se pudieron leer las dimensiones de ${inputPath}`);
	}

	const hasTransparency = await hasVisibleTransparency(input, metadata);
	const outputPath = getOutputPath(inputPath, hasTransparency);
	const limit = getDimensionLimit(metadata);
	const pipeline = source.resize({
		...limit,
		fit: 'inside',
		withoutEnlargement: true,
	});
	const output = hasTransparency
		? await pipeline.png({ compressionLevel: 9, palette: false }).toBuffer()
		: await pipeline.jpeg(JPEG_OPTIONS).toBuffer();
	const sourceStats = await stat(inputPath);

	if (!dryRun) {
		await writeFile(outputPath, output);
		if (path.resolve(outputPath) !== path.resolve(inputPath)) {
			await rm(inputPath);
		}
	}

	return {
		inputPath,
		outputPath,
		inputBytes: sourceStats.size,
		outputBytes: output.length,
		width: metadata.width,
		height: metadata.height,
		outputExtension: path.extname(outputPath),
	};
}

async function getPeopleFiles(extensions = IMAGE_EXTENSIONS) {
	return (await readdir(PEOPLE_DIR, { withFileTypes: true }))
		.filter((entry) => entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase()))
		.map((entry) => path.join(PEOPLE_DIR, entry.name));
}

async function getDataSourceFiles() {
	return (await readdir(SOURCE_DIR, { withFileTypes: true }))
		.filter((entry) => entry.isFile() && ['.json', '.ts'].includes(path.extname(entry.name)))
		.map((entry) => path.join(SOURCE_DIR, entry.name));
}

async function updateImageReferences(results) {
	const replacements = results
		.filter((result) => path.resolve(result.inputPath) !== path.resolve(result.outputPath))
		.map((result) => [
			`/people/${path.basename(result.inputPath)}`,
			`/people/${path.basename(result.outputPath)}`,
		]);
	if (replacements.length === 0) return 0;

	let updatedFiles = 0;
	for (const filePath of await getDataSourceFiles()) {
		const source = await readFile(filePath, 'utf8');
		let updated = source;
		for (const [from, to] of replacements) {
			updated = updated.replaceAll(from, to);
		}
		if (updated !== source) {
			await writeFile(filePath, updated);
			updatedFiles += 1;
		}
	}
	return updatedFiles;
}

async function checkPeopleImages() {
	const files = await getPeopleFiles();
	const failures = [];
	for (const filePath of files) {
		const input = await readFile(filePath);
		const metadata = await sharp(input, { animated: false, failOn: 'warning' }).metadata();
		if (!(await isOptimized(input, metadata, filePath))) failures.push(path.basename(filePath));
	}
	console.log(`Retratos revisados: ${files.length}`);
	if (failures.length > 0) {
		console.error(`Retratos fuera de política: ${failures.length}`);
		console.error(failures.join('\n'));
		process.exitCode = 1;
		return;
	}
	console.log('Todos los retratos cumplen formato, resolución y limpieza de metadata.');
}

async function optimizePeopleImages({ dryRun, extensions }) {
	const files = await getPeopleFiles(extensions);
	const seenStems = new Set();
	for (const filePath of files) {
		const stem = path.basename(filePath, path.extname(filePath)).toLowerCase();
		if (seenStems.has(stem)) {
			throw new Error(`Hay más de una imagen con el mismo nombre base: ${stem}`);
		}
		seenStems.add(stem);
	}
	const results = [];
	for (const filePath of files) results.push(await optimizePersonImage(filePath, { dryRun }));
	const inputBytes = results.reduce((total, result) => total + result.inputBytes, 0);
	const outputBytes = results.reduce((total, result) => total + result.outputBytes, 0);
	const updatedReferences = dryRun ? 0 : await updateImageReferences(results);
	console.log(
		JSON.stringify(
			{
				files: results.length,
				inputBytes,
				outputBytes,
				savedBytes: inputBytes - outputBytes,
				updatedReferences,
			},
			null,
		),
	);
}

async function main() {
	const args = new Set(process.argv.slice(2));
	if (args.has('--check')) return checkPeopleImages();
	if (args.has('--write')) {
		return optimizePeopleImages({ dryRun: false, extensions: args.has('--only-png') ? new Set(['.png']) : IMAGE_EXTENSIONS });
	}
	console.error('Uso: node scripts/optimize-people-images.mjs --write [--only-png] | --check');
	process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	await main();
}
