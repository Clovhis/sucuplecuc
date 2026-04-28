---
name: la-posta-cine-add-person-profile
description: Add or update an exclusive actor, actress, or director profile page for Cine Posta from a plain-language request (for example "hacé la ficha de Al Pacino"). Use when the user wants a dedicated bio page reachable from search and movie cast portraits, aligned with Astro 6 and the existing Cine Posta person-profile implementation, with biographies based on real sourced facts instead of generic templates.
---

# la-posta-cine-add-person-profile

Use this workflow when the request is to create or expand a ficha exclusiva de actor, actriz, o director in this repo.

This skill must always finish with the bundled auditor. Manual eyeballing is not enough.

## Quiet mode and token budget

- Run in quiet mode by default. Send no progress updates for routine successful steps.
- Allowed user-facing messages before the final response: one required initial acknowledgment, a blocker that needs user input, a validation failure that changes the plan, or a long-run heartbeat only after several minutes of silence.
- Do not send updates for branch creation, source lookup progress, catalog checks, profile draft creation, image lookup success, auditor success, build start, or build success.
- Do not narrate searches, file reads, biography lookups, or script runs unless they fail or force a decision.
- Prefer `docs/person-profile-catalog-reference.md`, existing helpers, and targeted file reads before loading broad data sets into context.
- Summarize source strategy and command results in the final response; do not paste long source excerpts, generated HTML, or full command output unless needed to diagnose a failure.
- In batch profile work, report aggregate status and only call out profiles that changed, failed validation, or need user input.

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
5. Collect trustworthy biography and awards sources, starting from real biographical references and not from catalog-derived summaries
6. Write editorial profile copy in Spanish matching the site tone and grounded in sourced facts
7. Update `docs/person-profile-catalog-reference.md` to reflect the new total and the affected rows
8. Run the person-profile auditor on the candidate slug or batch
9. Keep the profile reusable so future profiles follow the same schema

## Biography sourcing standards

The biography is the main editorial asset. It must be built from real biographical information, not from sentence templates.

Required approach:

1. Start with Wikipedia as the baseline biography source:
   - Prefer the Spanish Wikipedia lead/extract when it exists and is solid
   - Fall back to English Wikipedia only when Spanish coverage is weak or missing
   - If English Wikipedia is used as fallback, the published copy still has to end in natural Spanish, but every factual claim must remain traceable to that Wikipedia page
   - Use Wikidata to confirm structured facts such as birth date, birth place, occupations, and aliases when needed
2. Verify awards from primary or clearly authoritative sources when the biography mentions them:
   - official award sites
   - Academy, BAFTA, Emmy, Golden Globe, Cannes, Venice, Berlinale, etc.
   - Britannica or official biographies when needed as secondary support
3. Paraphrase in original Spanish copy for the site; do not paste encyclopedia text verbatim
4. If the available material is too thin, keep researching before writing; do not fill the gap with generic editorial copy

Every biography should try to cover, when the sources support it:

- where and when the person was born
- how they entered acting or directing, including training, early work, or first professional steps
- the breakthrough role, early recognition, or career turning point
- the main line of their trajectory with concrete titles or collaborations
- notable awards or distinctions only when verified

Mandatory depth rule:

- Use the historical Brad Pitt baseline that existed in this repo on 2026-04-28: `836` characters
- Every biography must end with at least `2508` visible characters once whitespace is normalized
- That minimum is mandatory even for Brad Pitt himself; treat the old `836`-character text only as the benchmark to triple, never as the new target
- Do not pad with vague editorial filler just to hit the minimum; keep adding sourced facts from Wikipedia until the text clears the threshold honestly

Explicitly forbidden biography patterns:

- reusable paragraph skeletons with only names/titles swapped
- filler like `Su carrera quedó muy ligada a la actuación`
- filler like `Con el tiempo, X fue ganando lugar dentro de la industria`
- filler like `Dentro del catálogo del sitio su recorrido se puede seguir...`
- any paragraph whose main job is to sound complete while avoiding real facts

If you cannot source at least two concrete biographical facts beyond occupation and current fame, stop the write-up, gather better sources, and only then continue.

## Profile content requirements

Every new profile should include:

- `slug`
- `name`
- `profileImage` for the hero portrait on `/personas/[slug]`
- short `headline`
- `roles`
- `birthPlace` when available
- `spotlight`
- `biography` with 2-4 paragraphs built from concrete sourced facts, not templates
- `biography` with 2-4 paragraphs, at least `2508` visible characters after whitespace normalization, and enough sourced detail to exceed the old Brad Pitt baseline by `3x`
- `stats` only when there is a genuinely useful, factual milestone to show
- `awards` with only verified highlights
- `knownFor` pointing to existing movie slugs in the catalog
- `referenceUrls` including the biography source(s) actually used for the write-up
- `referenceUrls` must include the exact Wikipedia page actually used for the biography, not just Wikidata/IMDb support links

Do not invent filmography outside the repo. The profile page should show movies connected through the existing catalog.

Avoid generic editorial filler in `stats`. Labels or values in the line of `Momento`, `Marca`, `Pulso` or similar chamuyo should not be added just to occupy space. If there is nothing concrete to surface, omit `stats`.

Do not use `knownFor`, connected catalog titles, or existing site copy as a substitute for real biographical research. Those fields support the ficha, but they do not justify the biography on their own.

## Auditor coverage

The bundled auditor checks, at minimum:

- required profile fields are present and non-empty
- no duplicate slugs or duplicate normalized names exist
- every candidate resolves to a person entry in `src/data/people.json`
- the exclusive-page hero portrait has an explicit `profileImage`
- `profileImage` is not a blurry compact fallback from `people.json`
- `profileImage` uses a resized/optimized source that stays reasonably light
- `knownFor` only references real movie slugs from the catalog
- `knownFor` is actually connected to that person in the current catalog
- the connected filmography is not empty
- biography, stats, awards, and references meet minimum completeness
- biography reaches the mandatory `2508`-character floor derived from the pre-enrichment Brad Pitt baseline (`836 x 3`)
- biography copy is not a repeated template with swapped names or titles
- generic filler stats are not required and should be omitted when they do not add concrete value
- built output exists in `dist/personas/<slug>/index.html` when `--require-dist` is used

Do not treat warnings as a successful editorial review if they reveal weak source coverage or a blurry-image fallback.

## Image policy

Quality matters, but keep the site light.

Preferred order:

1. Use an existing local portrait in `public/people/**` for compact surfaces like search or cast cards
2. For the exclusive profile page, always define `profileImage`; do not rely on `image` or `remoteImageUrl` from `people.json`
3. For the hero portrait, prefer a resized `profileImage` around width `480` to `720`
4. If storing locally, prefer compressed WebP or optimized JPG and keep the file roughly under `160 KB`; only tolerate going above that when the visual gain is obvious
5. If using a remote portrait, prefer URLs that already expose a width hint such as `?width=640` or `/w500/`

Rules:

- Never use giant originals when a resized version exists
- Never use posters, screenshots, or character art as portraits
- The hero portrait in the left rail of `/personas/[slug]` must look crisp on desktop; blurry miniatures are not acceptable
- `people.json` can stay low-res for compact cards, but that compact asset is not enough for `profileImage`
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
8. In batch loads, spot-check multiple biographies together to confirm they do not share the same paragraph skeleton

## Output to user

Report:

- the new/updated profile slug
- whether search integration was added
- whether movie portrait linking was added
- what image strategy was used (`local`, `remote resized`, or `optimized local`)
- whether the person catalog was updated
- what source strategy was used for the biography (`Wikipedia ES`, `Wikipedia EN + Wikidata`, `Wikipedia + awards source`, etc.)
- auditor result
- build result
