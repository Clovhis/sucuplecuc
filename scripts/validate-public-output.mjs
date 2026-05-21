import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const TEXT_FILE_EXTENSIONS = new Set(['.html', '.xml', '.txt', '.json', '.js', '.css', '.webmanifest']);
const FORBIDDEN_PATTERN = new RegExp(
	String.fromCharCode(115, 116, 114, 101, 109, 105, 111),
	'i',
);

async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(absolutePath)));
			continue;
		}

		files.push(absolutePath);
	}

	return files;
}

async function main() {
	const files = await walk(DIST_DIR);
	const textFiles = files.filter((filePath) => TEXT_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
	const hits = [];

	for (const filePath of textFiles) {
		const content = await readFile(filePath, 'utf8');
		if (!FORBIDDEN_PATTERN.test(content)) {
			continue;
		}

		hits.push(path.relative(DIST_DIR, filePath).replace(/\\/g, '/'));
	}

	if (hits.length > 0) {
		console.error('Forbidden legacy platform reference found in dist output:');
		for (const hit of hits.slice(0, 20)) {
			console.error(`- ${hit}`);
		}
		if (hits.length > 20) {
			console.error(`- ...and ${hits.length - 20} more file(s)`);
		}
		process.exit(1);
	}

	console.log('Public output validation passed: no forbidden legacy platform references found in dist.');
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
