---
name: la-posta-cine-cartelera-revalidator
description: "Revalidate La Posta Cine entries claiming `Cine` in `releasePlatform` or `releasePlatforms` against current theatrical runs in CABA and Buenos Aires Province, and legal AR streaming availability. Use for stale cinema badges or after a movie load resolves to Cine; preserve scores, refresh the catalog, and hand affected files to the auditor."
---

# la-posta-cine-cartelera-revalidator

For a content revalidation, edit only movie JSON plus `docs/movie-catalog-reference.md` (or already-linked people changes). A confirmed site behavior bug belongs to `la-posta-cine-full-site-fix`; the content-only scope here does not block an explicitly requested UI repair.

## Geographic scope and evidence

`Cine` and the site's theatrical carousel cover **CABA plus the entire Province of Buenos Aires**, including provincial cities outside AMBA. Other provinces are outside this theatrical scope, even when the film still has a legal Argentine screening there. Streaming availability remains Argentina-wide.

For every retained or added `Cine` claim, record `movie → official venue → locality/jurisdiction → current or upcoming run date → URL`. A national chain's title list or `SHOWING_NOW` flag is discovery evidence only until an eligible venue is established. A multi-venue source is sufficient when every listed complex is demonstrably inside the territory; otherwise filter its actual venues/showtimes. Do not assume the whole province is represented by CABA, or drop a title solely because it left major chains: check relevant independent, municipal, INCAA and provincial venues when needed.

The bundled national title fetcher does not validate venue geography or showtimes. Cines Argentinos also keeps historical weekly premiere blocks under its cartelera page: an archive entry, premiere date or detail page alone cannot establish a current run. Functions only in Córdoba, Mendoza, Santa Fe, Entre Ríos, Corrientes or any other province do not justify retaining `Cine`. When the last qualifying Buenos Aires run ends, remove `Cine` even if a tour continues elsewhere, then resolve legal AR streaming below.

1. Capture every movie that claims `Cine` in either `releasePlatform` or `releasePlatforms`, then fetch the current Argentine listings in structured form:

```bash
node skills/la-posta-cine-cartelera-revalidator/scripts/list_cine_entries.mjs --json
node skills/la-posta-cine-cartelera-revalidator/scripts/fetch_cartelera_titles.mjs --json
```

Use those outputs before opening any movie files. `list_cine_entries.mjs` must include both platform fields. The Cines Argentinos parser must collect both `news-item__head-title` and `movie-item__title` cards; the older selector omitted most of the current release list. Match the local and original titles, including a clearly equivalent local title.

Keep `Cine` only when current venue-level evidence confirms a run inside CABA or Buenos Aires Province under the geographic rule above. Cines Argentinos and Cinemark are the broad discovery pass; check JustWatch AR once and an official eligible exhibitor/venue schedule to settle an unconfirmed title. A premiere date, movie detail page, old review, or expired special event is not current-showing evidence. A current run with upcoming showtimes later in the same week still counts.

2. For each title no longer in cartelera, consult JustWatch AR once. Use the official Argentine provider page only to resolve ambiguity. Prefer `FLATRATE`; a clearly legal AR rental/purchase is acceptable but must be reported as transactional.

3. Resolve to one allowed label: `Netflix`, `HBO Max`, `Paramount Plus`, `Apple TV`, `Prime Video`, `Disney Plus`, `Crunchyroll`, `Mercado Play`, `CINE.AR`, `Cine`, or `Otras plataformas`. A second verified AR offer may go in `releasePlatforms` (two labels total). `Otras plataformas` is exclusive. On ambiguous evidence, prefer it over a stale `Cine` claim.

4. Modify only changed entries. Preserve `cinepostaScore` exactly unless the user separately authorized an editorial rerating; never add `verdict`, `verdictLabel`, `absoluteCinema`, or a custom score label during a platform revalidation. Then regenerate and audit the affected paths:

```bash
npm run catalog:movies
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <changed-path> --skip-youtube
```

The home `Cartelera` renders every published movie whose effective platform list contains `Cine`, including titles where `Cine` appears only in `releasePlatforms`. It has no fixed 42-day window, 12-card ceiling, release-date requirement, or trailer requirement. Exclude only a known future release; a missing date or an older original release date must not hide a currently confirmed theatrical run or re-release. A movie without a trailer still needs a poster card that links to its Cine Posta page.

Report the exact audit date, unchanged/current titles, changes, evidence URLs, eligible venue/locality and function date, catalog result, and auditor handoff. Distinguish a Buenos Aires departure from a nationwide departure; do not describe an ongoing run elsewhere as finished throughout Argentina. Keep only `field → URL → fact` evidence notes; do not paste source pages.
