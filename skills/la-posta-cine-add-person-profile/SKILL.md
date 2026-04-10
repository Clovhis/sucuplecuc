---
name: la-posta-cine-add-person-profile
description: Add or update an exclusive actor/actress profile page for Cine Posta from a plain-language request (for example "hacé la ficha de Al Pacino"). Use when the user wants a dedicated bio page reachable from search and movie cast portraits, aligned with Astro 6 and the existing Cine Posta actor-profile implementation.
---

# la-posta-cine-add-person-profile

Use this workflow when the request is to create or expand a ficha exclusiva de actor o actriz in this repo.

This skill must always finish with the bundled auditor. Manual eyeballing is not enough.

## Install and use

Install:

```bash
mkdir -p "$CODEX_HOME/skills/la-posta-cine-add-person-profile"
cp -R skills/la-posta-cine-add-person-profile/* "$CODEX_HOME/skills/la-posta-cine-add-person-profile/"
```

Typical triggers:

- `Hacé la ficha de Al Pacino`
- `Quiero perfil exclusivo para Leonardo DiCaprio`
- `Agregá página de actriz y conectala con buscador`

## Scope

Default allowed paths:

- `docs/person-profile-catalog-reference.md`
- `src/data/personProfiles.ts`
- `src/data/people.json`
- `src/types/person.ts`
- `src/lib/people.ts`
- `src/lib/seo.ts`
- `src/pages/personas/**`
- `src/pages/index.astro`
- `src/pages/peliculas/**`
- `src/pages/sitemap.xml.ts`
- `src/scripts/home-catalog.ts`
- `src/styles/global.css`
- `public/people/**` only when adding or replacing small local portraits

Do not modify unrelated movie content or global project config unless the request explicitly requires it.

## Catalog reference file (mandatory)

Use `docs/person-profile-catalog-reference.md` as the editorial inventory before any add or batch load.

Rules:

- Read `docs/person-profile-catalog-reference.md` first to know which people already have an exclusive profile.
- Do not trust the catalog blindly: confirm against `src/data/personProfiles.ts`, which remains the source of truth.
- When adding or updating one or more exclusive profiles, update `docs/person-profile-catalog-reference.md` in the same task before finishing.
- Keep the catalog sorted alphabetically by person name.
- At minimum, keep these columns aligned with the current profile data:
  - `Nombre`
  - `Slug`
  - `Ruta`
  - `Roles`
  - `Pelis conectadas (knownFor)`
  - `Fuentes`
- If a name is not in the catalog, it should be treated as not having an exclusive profile yet unless `src/data/personProfiles.ts` proves otherwise.

## Audit chain

The load is not complete until the profile auditor passes.

Mandatory commands:

```bash
node skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs --candidate <slug>
npm run build
node skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs --candidate <slug> --require-dist
```

Batch example:

```bash
node skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs --candidate brad-pitt --candidate al-pacino --candidate meryl-streep
npm run build
node skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs --candidate brad-pitt --candidate al-pacino --candidate meryl-streep --require-dist
```

If the auditor fails, stop and fix the profile data before finishing.

## Astro 6 rules

Keep the implementation aligned with Astro 6:

- Use file-based routing under `src/pages/personas/[slug].astro`
- Use typed `GetStaticPaths` for static profile generation
- Keep browser logic in `src/scripts/*.ts`, referenced with `<script src="...">`
- Do not introduce deprecated route or client-script patterns
- Validate with `npm run build`

If there is any doubt about Astro 6 behavior, check the official docs before finishing.

## Repository pattern to preserve

Match the existing Cine Posta actor-profile architecture:

1. Editorial inventory lives in `docs/person-profile-catalog-reference.md`
2. Editorial profile data lives in `src/data/personProfiles.ts`
3. Generic person cache stays in `src/data/people.json`
4. Helper logic lives in `src/lib/people.ts`
5. Structured data lives in `src/lib/seo.ts`
6. Search suggestions are wired from `src/pages/index.astro` + `src/scripts/home-catalog.ts`
7. Cast/director links are exposed from `src/pages/peliculas/[slug].astro`
8. Styles are added to `src/styles/global.css`

Prefer extending those files over inventing parallel systems.

## Input extraction

From the user request, extract:

- Person name
- Whether this is a new profile or an update
- Any style references or emphasis requested
- Any specific movies, awards, or copy notes the user wants highlighted

If the name is ambiguous, ask one concise clarification question.

## Data workflow

1. Read `docs/person-profile-catalog-reference.md`
2. Check whether the person already exists in `src/data/people.json`
3. Check whether the person already has a profile in `src/data/personProfiles.ts`
4. Inspect current connected movies in `src/data/movies/**` through existing helpers, not by manually rebuilding the graph
5. Collect trustworthy biography and awards sources
6. Write editorial profile copy in Spanish matching the site tone
7. Update `docs/person-profile-catalog-reference.md` to reflect the new total and the affected rows
8. Run the person-profile auditor on the candidate slug or batch
9. Keep the profile reusable so future profiles follow the same schema

## Profile content requirements

Every new profile should include:

- `slug`
- `name`
- short `headline`
- `roles`
- `birthPlace` when available
- `spotlight`
- `biography` with 2-4 paragraphs
- `stats` with quick milestones
- `awards` with only verified highlights
- `knownFor` pointing to existing movie slugs in the catalog
- `referenceUrls`

Do not invent filmography outside the repo. The profile page should show movies connected through the existing catalog.

## Auditor coverage

The bundled auditor checks, at minimum:

- required profile fields are present and non-empty
- no duplicate slugs or duplicate normalized names exist
- every candidate resolves to a person entry in `src/data/people.json`
- image coverage exists through `profileImage`, local portrait, or remote fallback
- `knownFor` only references real movie slugs from the catalog
- `knownFor` is actually connected to that person in the current catalog
- the connected filmography is not empty
- biography, stats, awards, and references meet minimum completeness
- built output exists in `dist/personas/<slug>/index.html` when `--require-dist` is used

Do not treat warnings as a successful editorial review if they reveal weak source coverage or a blurry-image fallback.

## Image policy

Quality matters, but keep the site light.

Preferred order:

1. Use an existing local portrait in `public/people/**` for compact surfaces like search or cast cards
2. For the exclusive profile page, prefer a higher-resolution `profileImage` URL when the cached local portrait is too small
3. Use resized remote sources when possible, ideally width `480` to `720`
4. If storing locally, prefer compressed WebP or optimized JPG and keep the file roughly under `160 KB`

Rules:

- Never use giant originals when a resized version exists
- Never use posters, screenshots, or character art as portraits
- Keep the exclusive page visually crisp without bloating the repository

## Search and navigation requirements

The person must be discoverable in two ways:

1. Search by name from the homepage search bar
2. Click on portrait or name from movie detail cast/director cards when the profile exists

Do not ship a profile page that is orphaned from those entry points.

## SEO requirements

Update structured data for the profile page.

Minimum:

- `Person`
- `ProfilePage`
- `BreadcrumbList`

Avoid breadcrumb items pointing at pages that do not exist.

## Validation

Before finishing:

1. Run `node skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs --candidate <slug>`
2. Run `npm run build`
3. Run `node skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs --candidate <slug> --require-dist`
4. Confirm the generated route exists in `dist/personas/<slug>/index.html`
5. Check that homepage search still builds and that movie detail pages still compile
6. Confirm `docs/person-profile-catalog-reference.md` was updated when the profile set changed
7. Review diff to confirm only intended files changed

## Output to user

Report:

- the new/updated profile slug
- whether search integration was added
- whether movie portrait linking was added
- what image strategy was used (`local`, `remote resized`, or `optimized local`)
- whether the person catalog was updated
- auditor result
- build result
