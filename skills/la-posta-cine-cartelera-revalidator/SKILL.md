---
name: la-posta-cine-cartelera-revalidator
description: "Revalidate La Posta Cine movie entries that still claim `releasePlatform: \"Cine\"` against live Argentine theatrical availability and legal AR platform data, then downgrade stale entries to a mapped platform, an optional 2-label multi-platform combination, or `Stremio` and refresh `docs/movie-catalog-reference.md`. Use when the user asks to audit cartelera, stale \"En cines\" badges, current theatrical status, or after `la-posta-cine-add-movie` / `la-posta-cine-recent-scout` when a new or edited title ends in `Cine`."
---

# la-posta-cine-cartelera-revalidator

Revalidate only movie-content data. Do not touch site code.

## Token budget

- Keep user-facing progress updates to the minimum: revalidation start, ambiguous evidence/blockers, platform changes, validation failures, and final result.
- Do not narrate each source lookup or unchanged title; summarize unchanged titles in one grouped result.
- Use local scripts and catalog files before opening individual movie JSON files.
- For web evidence, keep only URLs and the specific fact extracted from each source; do not quote or paste page content unless needed for ambiguity.
- When handing off to the auditor, pass only affected movie paths, final platform labels, and key evidence URLs.

Allowed edit paths:

- `src/data/movies/**`
- `docs/movie-catalog-reference.md`

Conditionally allowed when a linked load/audit flow already changed them:

- `src/data/people.json`
- `public/people/**`

Forbidden paths:

- `src/pages/**`
- `src/components/**`
- `src/layouts/**`
- `src/styles/**`
- `.github/**`
- `package*.json`
- `astro.config.*`
- `tsconfig.json`

## Inputs and workspace

Always work inside `C:\WebsitePeliculas`.

Use these local artifacts first:

- `skills/la-posta-cine-cartelera-revalidator/scripts/list_cine_entries.mjs`
- `skills/la-posta-cine-cartelera-revalidator/scripts/fetch_cartelera_titles.mjs`
- `skills/la-posta-cine-cartelera-revalidator/scripts/refresh_movie_catalog.mjs`
- `docs/movie-catalog-reference.md`
- `src/data/movies/*.json`

## Mandatory live-data rule

This skill must browse the web. Cartelera and platform data are time-sensitive.

State the exact audit date being used. For example: `3 de abril de 2026`.

## Workflow

### 1. Enumerate local `Cine` entries

Run:

```bash
node skills/la-posta-cine-cartelera-revalidator/scripts/list_cine_entries.mjs
```

Use `--json` when structured output helps:

```bash
node skills/la-posta-cine-cartelera-revalidator/scripts/list_cine_entries.mjs --json
```

This is the local candidate set to revalidate.

### 2. Capture the current Argentine cartelera

Run:

```bash
node skills/la-posta-cine-cartelera-revalidator/scripts/fetch_cartelera_titles.mjs
```

Primary theatrical truth source:

- `https://m.cinesargentinos.com.ar/cartelera/`

Keep `releasePlatform: "Cine"` only when the title is clearly present in the current Argentine cartelera or a directly equivalent AR theatrical listing is confirmed.

Allow title equivalence when marketing names differ slightly, for example:

- subtitle added in Argentina
- punctuation differences
- translated local title vs original title

Do not keep `Cine` just because an old ficha still exists somewhere.

### 3. Resolve stale titles

If the title is no longer in current cartelera, resolve AR availability in this order:

1. `JustWatch AR`
2. official AR platform page
3. official/local distributor page for Argentina
4. `CINE.AR` official page when applicable

Platform resolver rules:

- If current AR theatrical availability is confirmed, keep `Cine`.
- If a legal AR platform exists in the site allowlist, map it to one of:
  - `Netflix`
  - `HBO Max`
  - `Paramount Plus`
  - `Apple TV`
  - `Prime Video`
  - `Disney Plus`
  - `Crunchyroll`
  - `Mercado Play`
  - `CINE.AR`
- Prefer `FLATRATE` subscription offers first.
- Keep `releasePlatform` as the primary label. If a second legal AR provider is also clearly confirmed, persist both in `releasePlatforms` with a hard cap of `2` total labels.
- Never combine `Stremio` with another provider.
- If no `FLATRATE` offer exists but AR still has a clearly legal transactional offer on an allowlisted provider, use that provider label as primary and add a second verified legal provider only if it is also well supported.
- If no legal AR platform can be verified, set `releasePlatform: "Stremio"` and omit `releasePlatforms`.

Never leave `releasePlatform` empty after this skill runs.

### 4. Edit only the affected movie JSON files

Update only titles whose platform changes.

Common outcomes:

- `Cine` -> `Stremio`
- `Cine` -> `Apple TV`
- `Cine` -> `Prime Video`
- `Cine` -> `Netflix + Mercado Play`
- `Cine` -> `CINE.AR`

Do not rewrite reviews or editorial copy unless the user explicitly asked for that too.

### 5. Refresh the catalog

After all movie JSON edits, regenerate the catalog:

```bash
node skills/la-posta-cine-cartelera-revalidator/scripts/refresh_movie_catalog.mjs
```

The catalog must stay aligned with `src/data/movies/*.json` in the same change set.

### 6. Chain into the movie auditor

After the platform revalidation pass, immediately use `la-posta-cine-auditor`.

Recommended handoff:

```text
Usa $la-posta-cine-auditor para auditar las fichas cuyo releasePlatform cambie en esta rama despues de la revalidacion de cartelera.
```

If the user reached this skill from `la-posta-cine-add-movie` or `la-posta-cine-recent-scout`, keep the order:

1. add/scout movie
2. revalidate any affected `Cine` claims with this skill
3. audit the resulting batch

## Failure handling

If a title has ambiguous evidence:

- prefer `Stremio` over leaving a stale `Cine`
- explain which live sources were checked
- include the exact title/date mismatch that made theatrical status unreliable

If Cines Argentinos is unreachable, fall back to JustWatch AR plus one additional trustworthy AR-facing source before preserving `Cine`.

## Output

Return:

1. exact audit date
2. full list of local titles that started in `Cine`
3. titles that remain in `Cine`
4. titles moved to another legal platform
5. titles moved to a legal AR multi-platform combination
6. titles moved to `Stremio`
7. source URLs used for the key decisions
8. confirmation that `docs/movie-catalog-reference.md` was refreshed
9. confirmation that `la-posta-cine-auditor` was triggered or executed next
