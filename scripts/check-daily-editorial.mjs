import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { draftContractIssues, reviewContractIssues } from './lib/editorial-review-tools.mjs';

const mode = process.argv[2], root = process.cwd(), directory = resolve(root, '.tmp/cineposta-daily');
const read = name => JSON.parse(readFileSync(resolve(directory, name), 'utf8'));
let issues;
if (mode === '--draft' && process.argv.length === 3) {
  const draft = read('draft.json');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug || '')) throw new Error('Slug inválido.');
  issues = draftContractIssues(JSON.parse(readFileSync(resolve(root, 'src/data/editorials', draft.slug + '.json'), 'utf8')), draft);
} else if (mode === '--review' && process.argv.length === 3) {
  const packet = existsSync(resolve(directory, 'review-packet.json')) ? read('review-packet.json') : null;
  const input = read(packet ? (packet.phase === 'candidate' ? 'candidate-input.json' : 'review-input.json') : (existsSync(resolve(directory, 'review-input.json')) ? 'review-input.json' : 'candidate-input.json'));
  issues = reviewContractIssues(input, read('factual-review.json'), existsSync(resolve(directory, 'review-history.json')) ? read('review-history.json') : []);
} else throw new Error('Desde el worktree: node scripts/check-daily-editorial.mjs --draft o --review. No congela, aprueba ni publica.');
console.log(JSON.stringify({ valid: issues.length === 0, issues, scope: 'Local contract check only; native completion and publication gates remain mandatory.' }, null, 2));
if (issues.length) process.exitCode = 1;
