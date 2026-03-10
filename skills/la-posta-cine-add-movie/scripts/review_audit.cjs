#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = 'src/data/movies';
const MIN_DUPLICATE_SENTENCE_LENGTH = 55;

function parseArgs(argv) {
	const args = {
		root: DEFAULT_ROOT,
		candidates: [],
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--root') {
			args.root = argv[++index];
		} else if (arg === '--candidate') {
			args.candidates.push(argv[++index]);
		} else if (arg === '--help' || arg === '-h') {
			args.help = true;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}

	return args;
}

function usage() {
	console.log(
		[
			'Usage:',
			'  node review_audit.cjs --root src/data/movies',
			'  node review_audit.cjs --root src/data/movies --candidate src/data/movies/foo-2024.json',
		].join('\n'),
	);
}

function normalizeText(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^\w\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function listCandidates(rootDir, explicitCandidates) {
	if (explicitCandidates.length > 0) {
		return explicitCandidates.map((candidate) => path.resolve(candidate));
	}

	return fs
		.readdirSync(rootDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => path.join(rootDir, entry.name))
		.sort((left, right) => left.localeCompare(right));
}

function splitSentences(review) {
	return String(review || '')
		.split(/(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter((sentence) => sentence.length >= MIN_DUPLICATE_SENTENCE_LENGTH);
}

function main() {
	let args;
	try {
		args = parseArgs(process.argv.slice(2));
	} catch (error) {
		console.error(error.message);
		usage();
		process.exit(1);
	}

	if (args.help) {
		usage();
		process.exit(0);
	}

	const rootDir = path.resolve(args.root);
	if (!fs.existsSync(rootDir)) {
		console.error(`Movies directory not found: ${rootDir}`);
		process.exit(1);
	}

	const candidates = listCandidates(rootDir, args.candidates);
	const reviewMap = new Map();
	const sentenceMap = new Map();
	const errors = [];
	const warnings = [];

	for (const candidatePath of candidates) {
		const movie = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
		const review = String(movie.review || '').trim();
		const normalizedReview = normalizeText(review);

		if (!review) {
			errors.push(`missing review :: ${candidatePath}`);
			continue;
		}

		if (!reviewMap.has(normalizedReview)) {
			reviewMap.set(normalizedReview, []);
		}
		reviewMap.get(normalizedReview).push(candidatePath);

		for (const sentence of splitSentences(review)) {
			const normalizedSentence = normalizeText(sentence);
			if (!sentenceMap.has(normalizedSentence)) {
				sentenceMap.set(normalizedSentence, []);
			}
			sentenceMap.get(normalizedSentence).push(candidatePath);
		}
	}

	for (const [normalizedReview, files] of reviewMap.entries()) {
		if (normalizedReview && files.length > 1) {
			errors.push(`duplicate full review :: ${files.join(', ')}`);
		}
	}

	for (const [normalizedSentence, files] of sentenceMap.entries()) {
		if (normalizedSentence && files.length > 1) {
			const uniqueFiles = [...new Set(files)];
			if (uniqueFiles.length > 1) {
				warnings.push(`duplicate long sentence :: ${uniqueFiles.join(', ')}`);
			}
		}
	}

	if (errors.length > 0) {
		for (const error of errors) {
			console.error(error);
		}
		process.exit(1);
	}

	const summary = [`review audit passed for ${candidates.length} file(s)`];
	if (warnings.length > 0) {
		summary.push(`${warnings.length} warning(s) about repeated long sentences`);
	}
	console.log(summary.join(' | '));
}

main();
