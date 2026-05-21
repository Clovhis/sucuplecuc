#!/usr/bin/env node

import https from 'node:https';

const CARTELERA_SOURCES = [
  {
    key: 'cinesargentinos',
    url: 'https://m.cinesargentinos.com.ar/cartelera/',
    extractTitles(html) {
      const matches = [...html.matchAll(/<h3 class="movie-item__title">([\s\S]*?)<\/h3>/g)];
      return matches.map((match) => decodeEntities(match[1])).filter(Boolean);
    },
  },
  {
    key: 'cinemark',
    url: 'https://www.cinemark.com.ar/elegi-pelicula',
    extractTitles(html) {
      const titles = [];
      for (const match of html.matchAll(/\\"status\\":\\"SHOWING_NOW\\"/g)) {
        const windowStart = Math.max(0, match.index - 800);
        const window = html.slice(windowStart, match.index + match[0].length);
        const titleMatches = [...window.matchAll(/\\"title\\":\\"((?:\\\\.|[^"\\])+)\\"/g)];
        const rawTitle = titleMatches.at(-1)?.[1];
        if (!rawTitle) continue;
        titles.push(decodeJsonString(rawTitle));
      }
      return titles.filter(Boolean);
    },
  },
];
const asJson = process.argv.includes('--json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; LaPostaCineCarteleraRevalidator/1.1)',
          },
        },
        (response) => {
          if (response.statusCode && response.statusCode >= 400) {
            reject(new Error(`Unexpected status ${response.statusCode} for ${url}`));
            response.resume();
            return;
          }
          response.setEncoding('utf8');
          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });
          response.on('end', () => resolve(body));
        },
      )
      .on('error', reject);
  });
}

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${value}"`).trim();
  } catch {
    return value.replace(/\\"/g, '"').trim();
  }
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function normalizeCarteleraTitle(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bla pelicula\b/g, '')
    .replace(/\bii\b/g, '2')
    .replace(/\biii\b/g, '3')
    .replace(/\biv\b/g, '4')
    .replace(/\bvi\b/g, '6')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const results = await Promise.all(
  CARTELERA_SOURCES.map(async (source) => ({
    key: source.key,
    url: source.url,
    titles: [...new Set(source.extractTitles(await fetch(source.url)))].sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' }),
    ),
  })),
);

const titleSources = {};
const displayTitles = {};
for (const result of results) {
  for (const title of result.titles) {
    const normalizedTitle = normalizeCarteleraTitle(title);
    if (!normalizedTitle) continue;
    if (!titleSources[normalizedTitle]) {
      titleSources[normalizedTitle] = [];
      displayTitles[normalizedTitle] = title;
    }
    if (!titleSources[normalizedTitle].includes(result.key)) {
      titleSources[normalizedTitle].push(result.key);
    }
  }
}

const titles = Object.keys(displayTitles)
  .map((key) => displayTitles[key])
  .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

const titleSourcesByDisplayTitle = Object.fromEntries(
  Object.entries(displayTitles).map(([normalizedTitle, displayTitle]) => [
    displayTitle,
    titleSources[normalizedTitle],
  ]),
);

if (asJson) {
  console.log(
    JSON.stringify(
      {
        sourceUrl: results[0]?.url ?? '',
        sourceUrls: results.map((result) => result.url),
        titleSources: titleSourcesByDisplayTitle,
        titles,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

for (const result of results) {
  console.log(`# ${result.url}`);
  for (const title of result.titles) {
    console.log(title);
  }
  console.log('');
}
