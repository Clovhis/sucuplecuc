import { readFile, writeFile } from 'node:fs/promises';
import { collectCinemaNews } from '../src/lib/cinemaNews.ts';

const output = new URL('../src/data/cinemaNews.generated.json', import.meta.url);
const previous = JSON.parse(await readFile(output, 'utf8'));
const snapshot = await collectCinemaNews(previous);
await writeFile(output, `${JSON.stringify(snapshot, null, '\t')}\n`);
console.log(JSON.stringify({ updatedAt: snapshot.updatedAt, count: snapshot.items.length, sources: snapshot.sources }, null, 2));
