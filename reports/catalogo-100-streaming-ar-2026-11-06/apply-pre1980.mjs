import fs from 'node:fs/promises';
import path from 'node:path';
const metadata = JSON.parse(await fs.readFile(new URL('./pre1980-metadata.json', import.meta.url), 'utf8'));
for (const entry of metadata.movies) {
  const moviePath = path.resolve('src/data/movies', `${entry.slug}.json`);
  const movie = JSON.parse(await fs.readFile(moviePath, 'utf8'));
  for (const field of ['synopsis','audienceRating','category','genres','country','isArgentinian','trailerYoutubeId','releasePlatform','director','mainCast','productionCompany','cinepostaScore','awards','review','runtimeMinutes']) {
    if (Object.hasOwn(entry, field)) movie[field] = entry[field];
  }
  if (Object.hasOwn(entry, 'releasePlatforms')) movie.releasePlatforms = entry.releasePlatforms;
  else delete movie.releasePlatforms;
  delete movie.releaseDate;
  movie.reviewPublishedAt = metadata.verifiedAt;
  movie.editorial = { ...(movie.editorial ?? {}), becauseYouLiked: [], related: [], tenSecondTake: entry.tenSecondTake };
  await fs.writeFile(moviePath, `${JSON.stringify(movie, null, '\t')}\n`, 'utf8');
}
console.log(`Applied original metadata to ${metadata.movies.length} starters; catalogAddedAt and localized posters were preserved.`);
