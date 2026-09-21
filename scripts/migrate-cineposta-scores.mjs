import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const fromRefIndex = process.argv.indexOf('--from-ref');
const fromRef = fromRefIndex >= 0 ? process.argv[fromRefIndex + 1] : null;

if (fromRefIndex >= 0 && !fromRef) throw new Error('Missing Git ref after --from-ref.');

const SCORE_BY_LEGACY_LABEL = new Map(Object.entries({
	'basura total': 1,
	'malisima': 2,
	'flojísima': 2,
	'flojisima': 2,
	'todo mal': 2,
	'un garron': 2,
	'es una verga': 2,
	'plomazo': 2,
	'muy floja': 3,
	'no la mires': 3,
	'mala': 4,
	'no va': 4,
	'zafa': 5,
	'zafable': 5,
	'zafa pero rara': 5,
	'zafa una locura': 5,
	'mas o menos': 5,
	'se deja ver': 5,
	'pasable': 5,
	'cumple': 6,
	'cumple en la ruta': 6,
	'esta ok': 6,
	'buena': 6,
	'recomendada': 7,
	'esta buena': 7,
	'buena aventura': 7,
	'buena sci fi': 7,
	'esta buena bio': 7,
	're buena': 7,
	'buena y linda': 7,
	'rara y buena': 7,
	'dura y buena': 7,
	'muy buena': 8,
	'esta muy buena': 8,
	'esta muy bien': 8,
	'buenisima': 8,
	'buenisima rara': 8,
	'esta buenisima': 8,
	'muy recomendada': 8,
	'buena de verdad': 8,
	'buena y filosa': 8,
	'imperdible': 9,
	'clasico imperdible': 9,
	'obra maestra': 10,
	'clasico total': 10,
	'legendaria': 10,
}));

function normalize(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/\s+/g, ' ');
}

function inferScore(movie) {
	if (Number.isInteger(movie.cinepostaScore) && movie.cinepostaScore >= 1 && movie.cinepostaScore <= 10) return movie.cinepostaScore;
	if (!movie.verdict && !movie.verdictLabel && movie.absoluteCinema !== true) return null;
	if (movie.absoluteCinema === true) return 10;

	const normalizedLabel = normalize(movie.verdictLabel);
	const mapped = SCORE_BY_LEGACY_LABEL.get(normalizedLabel);
	if (mapped) return mapped;

	throw new Error(`${movie.slug}: no score mapping for legacy label "${String(movie.verdictLabel)}".`);
}

function topLevelPropertyRanges(source, names) {
	const ranges = [];
	let depth = 0;
	let inString = false;
	let escaped = false;

	for (let index = 0; index < source.length; index += 1) {
		const character = source[index];
		if (inString) {
			if (escaped) escaped = false;
			else if (character === '\\') escaped = true;
			else if (character === '"') inString = false;
			continue;
		}

		if (character === '{' || character === '[') {
			depth += 1;
			continue;
		}
		if (character === '}' || character === ']') {
			depth -= 1;
			continue;
		}
		if (character !== '"') continue;

		let endQuote = index + 1;
		let keyEscaped = false;
		for (; endQuote < source.length; endQuote += 1) {
			const keyCharacter = source[endQuote];
			if (keyEscaped) keyEscaped = false;
			else if (keyCharacter === '\\') keyEscaped = true;
			else if (keyCharacter === '"') break;
		}

		if (depth === 1) {
			let colonIndex = endQuote + 1;
			while (/\s/u.test(source[colonIndex] ?? '')) colonIndex += 1;
			if (source[colonIndex] === ':') {
				const key = JSON.parse(source.slice(index, endQuote + 1));
				if (names.has(key)) {
					let valueIndex = colonIndex + 1;
					let valueInString = false;
					let valueEscaped = false;
					let nestedDepth = 0;
					for (; valueIndex < source.length; valueIndex += 1) {
						const valueCharacter = source[valueIndex];
						if (valueInString) {
							if (valueEscaped) valueEscaped = false;
							else if (valueCharacter === '\\') valueEscaped = true;
							else if (valueCharacter === '"') valueInString = false;
							continue;
						}
						if (valueCharacter === '"') valueInString = true;
						else if (valueCharacter === '{' || valueCharacter === '[') nestedDepth += 1;
						else if (valueCharacter === '}' || valueCharacter === ']') nestedDepth -= 1;
						else if (valueCharacter === ',' && nestedDepth === 0) break;
					}
					let end = valueIndex + 1;
					while (source[end] === ' ' || source[end] === '\t') end += 1;
					const lineStart = source.lastIndexOf('\n', index - 1) + 1;
					const indentation = source.slice(lineStart, index);
					if (/^[ \t]*$/u.test(indentation)) {
						let lineEnding = '';
						if (source.slice(end, end + 2) === '\r\n') {
							lineEnding = '\r\n';
							end += 2;
						} else if (source[end] === '\n') {
							lineEnding = '\n';
							end += 1;
						}
						ranges.push({ start: lineStart, end, indentation, lineEnding });
					} else {
						ranges.push({ start: index, end, indentation: '', lineEnding: '' });
					}
				}
			}
		}

		index = endQuote;
	}

	return ranges;
}

function migrateSource(source, score, slug) {
	const ranges = topLevelPropertyRanges(source, new Set(['verdict', 'verdictLabel', 'absoluteCinema']));
	if (ranges.length === 0) {
		const movie = JSON.parse(source);
		if (movie.cinepostaScore === score) return source;
		throw new Error(`${slug}: cannot locate legacy rating fields to migrate.`);
	}

	const insertionIndex = ranges[0].start;
	const replacement = ranges[0].lineEnding
		? `${ranges[0].indentation}"cinepostaScore": ${String(score)},${ranges[0].lineEnding}`
		: `"cinepostaScore": ${String(score)}, `;
	let withoutLegacy = source;
	for (const range of [...ranges].reverse()) {
		withoutLegacy = `${withoutLegacy.slice(0, range.start)}${withoutLegacy.slice(range.end)}`;
	}
	return `${withoutLegacy.slice(0, insertionIndex)}${replacement}${withoutLegacy.slice(insertionIndex)}`;
}

const files = (await readdir(MOVIES_DIR)).filter((file) => file.endsWith('.json')).sort();
const distribution = new Map();

for (const file of files) {
	const filePath = path.join(MOVIES_DIR, file);
	const currentSource = await readFile(filePath, 'utf8');
	const currentMovie = JSON.parse(currentSource);
	const source = fromRef
		? execFileSync('git', ['show', `${fromRef}:src/data/movies/${file}`], { encoding: 'utf8' })
		: currentSource;
	const sourceMovie = JSON.parse(source);
	const score = inferScore(sourceMovie) ?? inferScore(currentMovie);
	if (score === null) continue;
	if (currentMovie.cinepostaScore !== undefined && currentMovie.cinepostaScore !== score) {
		throw new Error(`${currentMovie.slug}: existing cinepostaScore ${String(currentMovie.cinepostaScore)} conflicts with ${String(score)}.`);
	}

	const migratedSource = migrateSource(source, score, currentMovie.slug);
	if (migratedSource !== currentSource) await writeFile(filePath, migratedSource, 'utf8');
	distribution.set(score, (distribution.get(score) ?? 0) + 1);
}

console.log(JSON.stringify({ migrated: [...distribution.values()].reduce((sum, count) => sum + count, 0), distribution: Object.fromEntries([...distribution].sort((a, b) => a[0] - b[0])) }, null, 2));
