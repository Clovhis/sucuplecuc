#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const MOVIE_DIR = path.resolve('src/data/movies');
const CATALOG_PATH = path.resolve('docs/movie-catalog-reference.md');

const explicitDateIndex = process.argv.indexOf('--date');
const today = explicitDateIndex >= 0 ? process.argv[explicitDateIndex + 1] : new Date().toISOString().slice(0, 10);

const movies = fs
  .readdirSync(MOVIE_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(fs.readFileSync(path.join(MOVIE_DIR, file), 'utf8')))
  .sort((left, right) => (right.year - left.year) || left.title.localeCompare(right.title, 'es', { sensitivity: 'base' }));

const lines = [
  '# Catalogo de peliculas del sitio',
  '',
  `Generado automaticamente el ${today}. Fuente: src/data/movies/*.json`,
  '',
  `Total de peliculas: ${movies.length}`,
  '',
  '| Año | Titulo | Slug | Categoria | Plataforma | Clasificación |',
  '| --- | --- | --- | --- | --- | --- |',
];

for (const movie of movies) {
  lines.push(
    `| ${movie.year} | ${movie.title} | ${movie.slug} | ${movie.category} | ${movie.releasePlatform || ''} | ${movie.audienceRating || ''} |`,
  );
}

fs.writeFileSync(CATALOG_PATH, `${lines.join('\n')}\n`);
console.log(`Updated ${path.relative(process.cwd(), CATALOG_PATH)} with ${movies.length} movies`);
