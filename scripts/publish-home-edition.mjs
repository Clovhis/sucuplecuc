import { execFileSync } from 'node:child_process';

const allowed = process.argv.slice(2);
const owned = new Set(['src/data/cinemaNews.generated.json', 'src/data/weeklyRecommendations.generated.ts', 'src/data/upcomingReleases.generated.ts']);
if (allowed.length === 0 || allowed.some((file) => !owned.has(file))) throw new Error('Pass the exact generated files owned by this updater.');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const changed = [...new Set([...git('diff', '--name-only').split('\n'), ...git('diff', '--cached', '--name-only').split('\n'), ...git('ls-files', '--others', '--exclude-standard').split('\n')].filter(Boolean))];
const unexpected = changed.filter((file) => !allowed.includes(file));
if (unexpected.length) throw new Error(`The updater changed files outside its scope: ${unexpected.join(', ')}`);
if (changed.length === 0) { console.log('This edition is already current.'); process.exit(0); }
git('config', 'user.name', 'github-actions[bot]');
git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
git('add', '--', ...allowed);
git('commit', '-m', allowed.includes('src/data/cinemaNews.generated.json') ? 'chore(home): refresh daily cinema news' : 'chore(home): refresh weekly recommendations and trailers');
// Every publisher serializes this step. Rebase preserves movie loads and other
// editions published while the feeds and trailers were being collected.
git('fetch', 'origin', 'main');
git('rebase', 'origin/main');
git('push', 'origin', 'HEAD:main');
console.log(`Published edition: ${git('rev-parse', 'HEAD')}`);
