#!/usr/bin/env node

import https from 'node:https';

const CARTELERA_URL = 'https://m.cinesargentinos.com.ar/cartelera/';
const asJson = process.argv.includes('--json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; LaPostaCineCarteleraRevalidator/1.0)',
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

const html = await fetch(CARTELERA_URL);
const matches = [...html.matchAll(/<h3 class="movie-item__title">([\s\S]*?)<\/h3>/g)];
const titles = [...new Set(matches.map((match) => decodeEntities(match[1])).filter(Boolean))];

if (asJson) {
  console.log(JSON.stringify({ sourceUrl: CARTELERA_URL, titles }, null, 2));
  process.exit(0);
}

console.log(`# ${CARTELERA_URL}`);
for (const title of titles) {
  console.log(title);
}
