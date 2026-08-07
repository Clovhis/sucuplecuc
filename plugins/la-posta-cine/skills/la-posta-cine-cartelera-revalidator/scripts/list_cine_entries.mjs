#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const MOVIE_DIR = path.resolve('src/data/movies');
const asJson = process.argv.includes('--json');

const entries = fs
  .readdirSync(MOVIE_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(fs.readFileSync(path.join(MOVIE_DIR, file), 'utf8')))
  .filter((movie) => movie.releasePlatform === 'Cine')
  .sort((left, right) => {
    const leftDate = left.releaseDate || '';
    const rightDate = right.releaseDate || '';
    return leftDate.localeCompare(rightDate) || left.title.localeCompare(right.title, 'es', { sensitivity: 'base' });
  })
  .map((movie) => ({
    title: movie.title,
    originalTitle: movie.originalTitle || '',
    slug: movie.slug,
    year: movie.year,
    releaseDate: movie.releaseDate || '',
    category: movie.category || '',
  }));

if (asJson) {
  console.log(JSON.stringify(entries, null, 2));
  process.exit(0);
}

for (const entry of entries) {
  console.log(
    [
      entry.releaseDate,
      entry.year,
      entry.title,
      entry.originalTitle,
      entry.slug,
      entry.category,
    ].join('\t'),
  );
}
