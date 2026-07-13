#!/usr/bin/env node

/**
 * Compatibility entrypoint for the person-profile skill.
 *
 * The canonical policy lives in scripts/validate-person-profile-originality.mjs.
 * Keeping this wrapper deliberately small prevents a second, stale definition of
 * what a publishable profile is. That validator audits every profile together,
 * because legacy-copy detection, publication state and cross-profile similarity
 * are corpus-level rules.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function usage() {
	console.log([
		'Usage:',
		'  node person_profile_audit.cjs --all [--require-dist] [--repo <path>]',
		'  node person_profile_audit.cjs --candidate <slug> [--require-dist] [--repo <path>]',
		'',
		'The canonical audit always evaluates the complete profile corpus.',
	].join('\n'));
}

function parseArgs(argv) {
	const args = { repo: process.cwd(), requireDist: false, all: false, candidates: [] };
	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		switch (token) {
			case '--all': args.all = true; break;
			case '--candidate': {
				const slug = argv[index + 1];
				if (!slug) throw new Error('Missing value for --candidate');
				args.candidates.push(slug); index += 1; break;
			}
			case '--repo': {
				const repo = argv[index + 1];
				if (!repo) throw new Error('Missing value for --repo');
				args.repo = path.resolve(repo); index += 1; break;
			}
			case '--require-dist': args.requireDist = true; break;
			case '--help': case '-h': usage(); process.exit(0);
			default: throw new Error(`Unknown argument: ${token}`);
		}
	}
	if (!args.all && args.candidates.length === 0) throw new Error('Provide --all or at least one --candidate');
	return args;
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	const canonicalAudit = path.join(args.repo, 'scripts', 'validate-person-profile-originality.mjs');
	if (!fs.existsSync(canonicalAudit)) throw new Error(`No existe el auditor canónico ${canonicalAudit}`);
	const result = spawnSync(process.execPath, ['--experimental-strip-types', canonicalAudit, ...(args.requireDist ? ['--require-dist'] : [])], { cwd: args.repo, encoding: 'utf8' });
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
	console.log('Person-profile audit passed using the canonical editorial policy.');
}

try { main(); } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); }
