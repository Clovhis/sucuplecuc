import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { personProfiles } from '../src/data/personProfiles.ts';

// Only existing, identity-linked Wikidata records can supply this filter.
// Keep unknown or conflicting statements unclassified; never infer from copy.
const file = new URL('../src/data/people.json', import.meta.url);
const people = JSON.parse(await readFile(file, 'utf8'));
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
// Match getPersonProfileBySlug/findPersonRecord: prefer the exact catalog key,
// then its normalized key. A display name can be shared by alias records.
const records = new Map(Object.entries(people).map(([key, person]) => [normalize(key), { key, person }]));
const candidates = Object.values(personProfiles).map(profile => {
  const record = people[profile.name] ? { key: profile.name, person: people[profile.name] } : records.get(normalize(profile.name));
  const ids = [...new Set([...(record?.person.referenceUrls ?? []), ...(profile.referenceUrls ?? [])]
    .map(url => url.match(/^https:\/\/www\.wikidata\.org\/wiki\/(Q\d+)$/)?.[1]).filter(Boolean))];
  return { profile, record, id: ids.length === 1 ? ids[0] : undefined };
});
const ids = [...new Set(candidates.map(entry => entry.id).filter(Boolean))];
const entities = {};
for (let offset = 0; offset < ids.length; offset += 40) {
  const url = new URL('https://www.wikidata.org/w/api.php');
  url.search = new URLSearchParams({ action: 'wbgetentities', ids: ids.slice(offset, offset + 40).join('|'), props: 'claims', format: 'json' });
  const response = await fetch(url, { headers: { 'User-Agent': 'CinePosta/1.0 (https://www.cineposta.com.ar; catalog verification)' } });
  if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  Object.assign(entities, data.entities);
  console.log(`Verified ${Math.min(offset + 40, ids.length)}/${ids.length} records`);
}
const values = claims => {
  const usable = (claims ?? []).filter(claim => claim.rank !== 'deprecated');
  const preferred = usable.filter(claim => claim.rank === 'preferred');
  return (preferred.length ? preferred : usable).map(claim => claim.mainsnak?.datavalue?.value).filter(Boolean);
};
const evidence = candidates.map(({ profile, record, id }) => {
  const entity = entities[id];
  const imdbIds = values(entity?.claims?.P345);
  const linked = Boolean(record?.person.imdbId && imdbIds.includes(record.person.imdbId));
  const statements = [...new Set(values(entity?.claims?.P21).map(value => value.id))];
  const sex = linked && statements.length === 1 ? ({ Q6581097: 'masculino', Q6581072: 'femenino' })[statements[0]] : undefined;
  const sourceUrl = id ? `https://www.wikidata.org/wiki/${id}` : undefined;
  if (record) {
    delete record.person.sex;
    delete record.person.sexSourceUrl;
    delete record.person.sexVerifiedAt;
  }
  if (sex) Object.assign(record.person, { sex, sexSourceUrl: sourceUrl, sexVerifiedAt: '2026-10-11' });
  return { slug: profile.slug, name: profile.name, imdbId: record?.person.imdbId, sourceUrl, statements, identityMatched: linked, sex: sex ?? null };
});
const summary = { profiles: evidence.length, masculino: evidence.filter(e => e.sex === 'masculino').length, femenino: evidence.filter(e => e.sex === 'femenino').length, unclassified: evidence.filter(e => !e.sex).length };
await mkdir('reports/personas-dark-2026-10-11', { recursive: true });
await writeFile('reports/personas-dark-2026-10-11/sex-evidence.json', JSON.stringify({ date: '2026-10-11', summary, evidence }, null, 2) + '\n');
if (process.argv.includes('--write')) await writeFile(file, JSON.stringify(people, null, '\t') + '\n');
console.log(summary);
