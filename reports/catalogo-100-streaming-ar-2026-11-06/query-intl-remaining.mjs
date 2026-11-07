import fs from 'node:fs/promises';

const query = `query SearchTitles($searchQuery: String!, $country: Country!, $language: Language!) { popularTitles(country: $country, first: 12, filter: {searchQuery: $searchQuery, objectTypes: [MOVIE]}) { edges { node { ... on Movie { content(country: $country, language: $language) { title originalReleaseYear fullPath } offers(country: $country, platform: WEB) { monetizationType package { id clearName technicalName shortName } } } } } } }`;
const candidates = [
  { title: 'Volver', originalTitle: 'Volver', year: 2006, aliases: ['Volver'] },
  { title: 'Cronos', originalTitle: 'Cronos', year: 1993, aliases: ['Cronos'] },
  { title: 'Encontré al diablo', originalTitle: 'I Saw the Devil', year: 2010, aliases: ['I Saw the Devil', 'Encontré al diablo'] },
  { title: 'El arte de la guerra', originalTitle: 'The Grandmaster', year: 2013, aliases: ['The Grandmaster', 'El arte de la guerra'] },
  { title: 'Copia certificada', originalTitle: 'Copie conforme', year: 2010, aliases: ['Copie conforme', 'Copia certificada', 'Certified Copy'] },
];

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const results = [];
for (const candidate of candidates) {
  const response = await fetch('https://apis.justwatch.com/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { searchQuery: candidate.originalTitle, country: 'AR', language: 'es' } }),
  });
  if (!response.ok) throw new Error(`JustWatch HTTP ${response.status} for ${candidate.originalTitle}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(JSON.stringify(payload.errors));
  const accepted = new Set(candidate.aliases.map(normalize));
  const nodes = (payload.data?.popularTitles?.edges ?? []).map(edge => edge.node).filter(node => node?.content).map(node => {
    const title = node.content.title;
    const year = Number(node.content.originalReleaseYear);
    const offers = (node.offers ?? []).map(offer => ({
      type: offer.monetizationType,
      provider: offer.package?.clearName,
      technicalName: offer.package?.technicalName,
    }));
    return {
      matchedTitle: title,
      matchedYear: year,
      titleMatch: accepted.has(normalize(title)),
      url: node.content.fullPath ? `https://www.justwatch.com${node.content.fullPath}` : null,
      offers,
    };
  });
  const exact = nodes.find(node => node.titleMatch && node.matchedYear === candidate.year) ?? null;
  results.push({
    ...candidate,
    matched: Boolean(exact),
    checkedAt: new Date().toISOString(),
    exact,
    candidates: nodes.slice(0, 6),
  });
}

await fs.writeFile(new URL('./international-remaining-justwatch.json', import.meta.url), `${JSON.stringify({ country: 'AR', language: 'es', source: 'https://apis.justwatch.com/graphql', checkedDate: '2026-11-06', results }, null, 2)}\n`);
console.log(JSON.stringify(results.map(result => ({ title: result.title, year: result.year, matched: result.matched, url: result.exact?.url, flatRate: result.exact?.offers.filter(offer => offer.type === 'FLATRATE') ?? [] })), null, 2));
