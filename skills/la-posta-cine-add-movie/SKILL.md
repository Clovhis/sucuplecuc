---
name: la-posta-cine-add-movie
description: Add a single movie entry to La posta cine safely from a plain-language request (for example "Agrega X, es malisima"). Use when the user wants to publish a new movie review entry in Clovhis/sucuplecuc. Enforce add-only content edits, create a feature branch from main, fetch trustworthy movie metadata, write one content file, support legal AR multi-platform data (`releasePlatform` + optional `releasePlatforms`), verify automatic lagrimometro eligibility for primary Drama/Romance/Romántica, verify automatic jajametro eligibility for primary laugh-first Comedia, verify automatic cagazometro eligibility for primary Terror, verify automatic explosiometro eligibility for primary Accion/Acción, revalidate any final `Cine` claim through `la-posta-cine-cartelera-revalidator`, run audit/build validation, show diff, and push the new branch without modifying site code.
---

# la-posta-cine-add-movie

Execute this workflow when the user asks to add a movie entry.

## Quiet mode and token budget

- Run in quiet mode by default. Send no progress updates for routine successful steps.
- Allowed user-facing messages before the final response: one required initial acknowledgment, a blocker that needs user input, a validation failure that changes the plan, or a long-run heartbeat only after several minutes of silence.
- Do not send updates for branch creation, source lookup progress, metadata findings, duplicate checks, JSON creation, enrichment success, audit success, build start, or build success.
- Do not narrate searches, file reads, metadata lookups, or script runs unless they fail or force a decision.
- Prefer catalog files and bundled scripts before loading many raw movie/person files into context.
- When chaining another skill, pass only the candidate slug/path, key decision needed, and relevant evidence URLs. Tell the downstream skill to keep quiet mode.
- Summarize command output and sources in the final response; paste full diffs only where this workflow explicitly requires showing a diff.

## Install and use

Install (copy this folder into Codex skills path):

```bash
mkdir -p "$CODEX_HOME/skills/la-posta-cine-add-movie"
cp -R skills/la-posta-cine-add-movie/* "$CODEX_HOME/skills/la-posta-cine-add-movie/"
```

Typical trigger prompts:

- `Agrega Terminator 7, es malisima`
- `Agrega X, zafa, estreno en Netflix`
- `Agrega X con este feedback: ...`

Run only when the request is about creating a new movie-content entry in La posta cine.

## Scope and safety

Apply add-only mode by default.

Movie detail pages already include a global Share panel for every `/peliculas/<slug>/` page. The panel is rendered from site code (`src/pages/peliculas/[slug].astro`, `src/scripts/movie-detail.ts`, `src/styles/global.css`) and uses the movie slug/canonical URL plus local social logos under `public/brand/social/`. A normal movie load must not add share/social fields to movie JSON, must not add per-movie share links, and must not modify the Share UI/assets. Correct slug creation is enough for the Share panel to work.

Allowed paths:

- `src/data/movies/**`
- `src/data/people.json`
- `public/people/**`
- `content/movies/**` (only if this repo variant uses it)
- `docs/movie-catalog-reference.md`
- `docs/person-profile-catalog-reference.md`

Conditionally allowed only with explicit user approval in the same request:

- `templates/movie.template.json`
- `README.md`

Forbidden paths:

- `src/pages/**`
- `src/components/**`
- `src/layouts/**`
- `src/styles/**`
- `public/**`
- `.github/workflows/**`
- `astro.config.*`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- Any file outside movie-content folders unless explicitly approved

Never commit directly to `main`.
Never auto-fix project code if build fails.

If a diff includes Share implementation files (`src/pages/peliculas/[slug].astro`, `src/scripts/movie-detail.ts`, `src/styles/global.css`, or `public/brand/social/**`) during a movie-content load, treat it as out of scope and abort unless the user explicitly requested a site-code/share change in that same task.

## Inputs to extract from user message

Extract:

- Movie title (required)
- Year (optional but preferred for disambiguation)
- User feedback sentence(s) for review tone and verdict mapping
- Optional premiere intent (`estreno`, `cine`, `streaming`, platform)
- Optional explicit verdict label request (for example `UNA VERGA`)

If title is ambiguous and no year/franchise context exists, ask a single clarification question before continuing.

## Repository preflight

Run:

```bash
git checkout main
git pull origin main
```

Create branch:

```bash
git checkout -b feature/movie-<slug>
```

If branch already exists, create:

```bash
git checkout -b feature/movie-<slug>-2
```

## Commands executed (reference)

```bash
git checkout main
git pull origin main
git checkout -b feature/movie-<slug>
npm run enrich-people -- --movie <slug>
npm run build
git diff --name-only
git diff -- src/data/movies/<slug>.json
git diff -- src/data/people.json
git add src/data/movies/<slug>.json src/data/people.json public/people docs/movie-catalog-reference.md
git commit -m "Add movie entry: <title> (<year>)"
git push -u origin feature/movie-<slug>
```

## Catalog reference file (mandatory)

Use `docs/movie-catalog-reference.md` as the first quick inventory reference before any add/bulk task.

Rules:

- Read `docs/movie-catalog-reference.md` first to identify already loaded movies and current gaps by year/platform/category.
- Treat this catalog as the default planning source to reduce token usage. Do not start by reading many files from `src/data/movies`.
- If candidate `slug` or normalized `title + year` already appears in the catalog, stop and report duplicate before doing deeper checks.
- Do not trust the catalog blindly: perform a final targeted duplicate verification in `src/data/movies` (exact slug/title-year check) before writing.
- After creating or updating movie entries (single or bulk), always refresh `docs/movie-catalog-reference.md` in the same change set.
- Keep the catalog sorted and include at least: `year`, `title`, `slug`, `category`, `releasePlatform`; include `releasePlatforms` too when the movie is multi-platform.

## Person profile catalog (mandatory)

Use `docs/person-profile-catalog-reference.md` before finalizing `director` and `mainCast`.

Rules:

- Read `docs/person-profile-catalog-reference.md` after the movie catalog check and before locking credited names.
- If a credited director or cast member already appears there, reuse the exact canonical `Nombre` from that catalog in the movie JSON.
- Do not invent aliases, nicknames, shortened names, alternate spellings, or accented/unaccented variants when an exclusive profile already exists.
- The goal is that movie detail pages keep linking to the existing dynamic profile under `/personas/<slug>/`.
- Treat `docs/person-profile-catalog-reference.md` as the editorial reference, but if there is any conflict, confirm against `src/data/personProfiles.ts` / current site behavior before writing.
- When a new movie includes people who already have an exclusive profile, the movie load must preserve that linkage. Do not leave it to chance.

## Workflow chaining

This skill is not the last step when a movie ends in `Cine`.

Mandatory chain:

1. add/update the movie file
2. if the final `releasePlatform` is `Cine`, immediately use `la-posta-cine-cartelera-revalidator`
3. after that, use `la-posta-cine-auditor`

If the movie resolves to a non-theatrical platform from the start, skip the cartelera revalidation and go straight to the auditor.

## Metadata lookup rules

Find trustworthy metadata:

- `title`
- `originalTitle`
- `year`
- `releaseDate` in exact `YYYY-MM-DD` format for any current-year/future title, or any add framed as `reciente` / `estreno`
- `category`
- `poster`
- official YouTube trailer id in original language (store only `trailerYoutubeId`)
- `audienceRating` normalized as `ATP` or `+<edad>`
- `director`
- `mainCast` (ordered by principal billing; for live-action default to 4-5 core performers unless reliable billing clearly supports fewer)
- `productionCompany`
- IMDb profile trace for the credited director and main cast
- birth year for each credited director and main cast member
- primary nationality label in Spanish for each credited director and main cast member (for example `Argentino`, `Britanica`, `Mexicano`)
- one local cached portrait per credited director and main cast member under `public/people/**`
- death year when the person is deceased, so UI can show `Fallecio en <anio>` instead of a fake living age

Use primary/trustworthy sources (official studio channels, official movie pages, major databases).

Release date policy for Astro 6 (mandatory):

- Any movie whose `year` is the current calendar year or in the future must include `releaseDate`.
- Use an exact `YYYY-MM-DD` date verified from AR-facing evidence when possible: official distributor/platform page, exhibitor/cartelera source, `JustWatch AR`, or equivalent trustworthy source.
- If the title is being loaded as `reciente`, `estreno`, `Cine`, or `isPremiere: true`, do not leave `releaseDate` blank.
- Do not treat `npm run build` as enough validation here: Astro 6 can build successfully while `getMovies()` still hides a current-year movie that lacks `releaseDate`.
- If the exact date cannot be verified, stop before commit instead of publishing a hidden entry.

Main cast policy (mandatory):

- `mainCast` must be ordered from most principal/top-billed to less principal names, based on trustworthy billing order.
- For live-action titles, default to `4` or `5` credited performers in `mainCast`, not just `2` or `3`, unless reliable official billing clearly exposes fewer names.
- For animation/anime, still prioritize the principal original voice cast and keep the most central billed voices first.
- Never drop a clearly major performer just to keep the list short. If someone is top-billed, a central marketing face, or wins an acting Oscar/major prize for that movie, include them in `mainCast`.
- When two sources disagree on cast ordering, prefer the official poster/trailer billing block, then the studio/distributor page, then a major database.
- When in doubt between omitting a big name or keeping one extra principal credit, keep the extra principal credit.

Argentine title policy (mandatory):

- `title` must always be the name used for Argentine audiences, not the raw original title by default.
- `originalTitle` must keep the source-language/original-market title.
- Verify `title` against Argentine-facing sources in this order when available:
  1. Argentine platform page (`Disney Plus AR`, `Netflix AR`, `HBO Max AR`, `Paramount Plus AR`, `Prime Video AR`, etc.)
  2. `JustWatch AR`
  3. `IMDb` release info for `Argentina`
  4. local distributor/exhibitor material for Argentina
- If AR sources consistently keep the original title in English or another language, keep it.
- If Spain/LatAm marketing disagrees with Argentina, prefer Argentina.
- Never copy a Spain-only title into `title` just because the poster or one indexer uses it.

External review enrichment policy (mandatory):

- For every new movie, fetch at least one opinion/review signal from a specialized North American movie site.
- Preferred sources order:
  1. `Variety`, `The Hollywood Reporter`, `IndieWire`, `RogerEbert.com`
  2. `Rotten Tomatoes` (critics consensus/review snippets) or `Metacritic` (critic excerpts/scores)
  3. `IMDb` (user/critic rating and/or review snippets) as fallback when no formal critic review is available
- Extract only verifiable points (for example: general reception, pacing comments, acting comments, critics consensus).
- Use scores/signals as internal support, but write them in natural language for the review.
- External sources are support material only. Never mention or name third-party sites/brands inside the user-facing `review` text (`Rotten`, `Metacritic`, `IMDb`, etc.).
- Do not dump raw numeric strings in the review body (examples to avoid: `59/100`, `6.8/10`, `Numeros: ...`) unless the user explicitly asks for numeric detail.
- Do not fabricate criticism details that are not present in the consulted source.
- If no source from the list can be verified, stop and ask the user for a reference link before committing.

Awards enrichment policy (mandatory):

- Always verify premios/galardones for every movie before commit.
- Always include `awards` in movie JSON, even when no wins are found:
  - if wins exist -> populate `awards.wins`
  - if no wins exist -> set `awards.wins: []`
- Evaluate verified wins in: `Oscar`, `Grammy`, and/or `Festival de Cannes`.
- If there are verified wins in those awards, include them in `awards.wins` with:
  - `award`: `oscar` | `grammy` | `cannes`
  - `category`: exact category/prize name in Spanish
  - `recipient`: person/team/pais/produccion ganadora cuando aplique (por ejemplo actor, directora, productores, etc.)
  - `year`: ceremony year
- For `Oscar` category `Mejor película`, always include `recipient` and mark it as top priority in UI output logic.
- If there are verified galardones outside those three awards, report them in output evidence and/or review context, but do not invent unsupported `award` types.
- Never invent award wins or categories.
Trailer policy is strict:

- Always set `trailerYoutubeId` for the movie entry.
- Prefer official trailer in original language.
- For anime and other non-Latin originals, prefer the official native-script `originalTitle` when it is clearly available in official marketing/trailers. Do not downgrade it to pure romaji if that breaks traceability.
- If user provides a YouTube URL, extract and use that video id directly.
- If no reliable official trailer is found, stop and ask user for a trailer link before commit.
- Do not finalize an entry with empty `trailerYoutubeId` unless user explicitly authorizes that exception.

Do not invent data.
Do not store full YouTube URL when schema uses id.

Audience rating policy for Argentina (mandatory):

- Always resolve `audienceRating` for Argentine users before commit.
- Store only normalized values:
  - `ATP` when the title is apta para todo público
  - `+13`, `+16`, `+18`, etc. when the source exposes a minimum age
- Preferred source order:
  1. `TMDb` movie page using AR certification shown in the header (`ATP`, `+13`, `R`, etc.)
  2. `JustWatch AR` when the page exposes `contentRating`
  3. official local distributor/platform page if the age label is explicit
- Normalization rules:
  - `ATP`, `TP`, `G`, `U`, `PG`, `L` -> `ATP`
  - numeric certifications stay numeric with `+` prefix (`13` -> `+13`)
  - `PG-13` -> `+13`
  - `R` -> `+17`
  - `NC-17`, `TV-MA`, `X` -> `+18`
- Never leave `audienceRating` empty in a published movie file.
- After creating or updating a movie entry, prefer running:
  - `node scripts/enrich-movie-age-ratings.mjs --movie <slug>`
  - this should also keep `docs/movie-catalog-reference.md` synced

People pool policy (mandatory):

- Every new movie must also update `src/data/people.json`.
- The people catalog is keyed by the exact credited name string used in movie JSON.
- Before freezing `director` and `mainCast`, consult `docs/person-profile-catalog-reference.md` and detect whether any credited name already has an exclusive profile.
- If a credited person already has an exclusive profile, use that exact canonical name in movie JSON and preserve the same person record lineage in `src/data/people.json`.
- Do not create near-duplicate people entries for someone who already has an exclusive profile page.
- Before searching the internet, consult `src/data/people.json` first and reuse any existing person entry/image/info cache already present.
- Only enrich missing or stale person fields. Do not redownload portraits or rewrite entries that are already complete without a reason.
- Each credited director and each actor in `mainCast` must end with:
  - `birthDate` when an exact public date exists, or `birthYear` when only the year is verifiable
  - `deathYear` when applicable
  - `nationalityPrimary` written in Spanish as a short demonym/identity label ready for UI display (for example `Argentino`, `Estadounidense`, `Espanola`)
  - `image` pointing to a local cached file under `public/people/` only when you can verify it is a real individual portrait
  - `imdbUrl` when IMDb exists, or another traceable profile inside `referenceUrls`
- For titles whose `category` is `Anime`, `Animacion`, or `Animación`, `mainCast` must list the principal original voice cast, not dub/localized voice actors and not character names.
- If a trustworthy portrait cannot be verified, leave `image` empty and allow initials fallback in UI. Never use posters, screenshots, logos, group photos, or character art as a fake portrait.
- If a birth date/year or IMDb profile cannot be verified from trustworthy sources, do not invent it. Keep `referenceUrls` and a short `notes` explanation instead.
- Preferred flow:
  1. write the movie JSON
  2. consult `src/data/people.json` and keep any already-complete records untouched
  3. run `npm run enrich-people -- --movie <slug>`
  4. inspect unresolved names manually only if the script misses someone
- Do not leave a new movie with unresolved people provenance. Missing portrait or birth date is acceptable only when the entry is still traceable and the gap is explicitly documented.
- Do not publish animation/anime entries with ambiguous cast provenance; if you cannot verify the original voice cast, stop and verify before commit.

Platform policy for Argentina (mandatory):

- Always resolve `releasePlatform` for Argentine audience (`AR`) using trustworthy availability sources (prefer JustWatch `ar` pages and/or official platform pages).
- `releasePlatform` remains the primary/platform badge leader. When a second verified legal AR platform also exists, store both in `releasePlatforms` with a hard cap of `2` total labels.
- Allowed platform labels for AR are only: `Netflix`, `HBO Max`, `Paramount Plus`, `Apple TV`, `Cine`, `CINE.AR`, `Prime Video`, `Disney Plus`, `Crunchyroll`, `Mercado Play`, `Otras plataformas`.
- `Otras plataformas` is exclusive: if the movie resolves to `Otras plataformas`, do not also create `releasePlatforms` and do not combine it with any other provider.
- Mandatory resolver flow (do not skip):
  1. Search availability for exact movie + year in AR.
  2. Read only AR offers and identify `FLATRATE` subscription availability first.
  3. Map provider name to allowed labels:
     - `Max` or `HBO Max` -> `HBO Max`
     - `Disney Plus` or `Disney+` -> `Disney Plus`
     - `Paramount`, `Paramount Plus` or `Paramount+` -> `Paramount Plus`
     - `Amazon Prime Video` or `Prime Video` -> `Prime Video`
     - `Apple TV Plus` or `Apple TV+` -> `Apple TV`
     - `Netflix` -> `Netflix`
     - `Crunchyroll` -> `Crunchyroll`
     - `Mercado Play` -> `Mercado Play`
  4. If at least one mapped legal AR provider exists, use the best verified provider as `releasePlatform`.
  5. If a second mapped legal AR provider is also verified, persist both in `releasePlatforms`, preserving `releasePlatform` as the first label and never exceeding `2` total labels.
  6. If more than `2` legal AR providers are verified, keep only the primary `releasePlatform` plus one secondary label that is also clearly confirmed for AR.
  7. If `releasePlatform` is already `Otras plataformas`, keep it single-platform even if a weaker or conflicting source suggests another service.
  8. If there is no mapped legal AR provider but AR indicates cinema-only availability, set `releasePlatform: "Cine"` and omit `releasePlatforms`.
  9. If AR availability exists only in providers outside allowlist, or AR has no confirmed availability, set `releasePlatform: "Otras plataformas"` and omit `releasePlatforms`.
- If `releasePlatform` ends in `Cine`, do not trust that label as final until `la-posta-cine-cartelera-revalidator` confirms the movie is still in current Argentine cartelera.
- Forbidden shortcuts:
  - Do not assign `Otras plataformas` by default without AR lookup attempt.
  - Do not copy platform from another movie without validating title/year.
  - Do not use non-AR market data to override AR result.
- Never leave `releasePlatform` empty.
- Never persist duplicated labels across `releasePlatform` / `releasePlatforms`.

## Content schema

Create one JSON file in `src/data/movies/<slug>.json` using project schema:

Do not add any share/social/link-copy fields. The movie detail Share card is automatic and derives its URL from `getMoviePath(movie.slug)` plus `SITE_URL`.

```json
{
  "slug": "movie-slug-2026",
  "title": "Movie Title",
  "originalTitle": "Original title",
  "year": 2026,
  "releaseDate": "2026-04-09",
  "audienceRating": "+13",
  "category": "Drama",
  "poster": "",
  "screenshots": [],
  "trailerYoutubeId": "",
  "director": "",
  "mainCast": [],
  "productionCompany": "",
  "verdict": "zafa",
  "verdictLabel": "ZAFA",
  "runtimeMinutes": 118,
  "editorial": {
    "becauseYouLiked": ["otra-peli-del-catalogo-2024"],
    "related": ["peli-relacionada-1-2023", "peli-relacionada-2-2022", "peli-relacionada-3-2021"]
  },
  "awards": {
    "wins": []
  },
  "review": "Resena breve en castellano rioplatense",
  "isPremiere": false,
  "premiereLabel": "",
  "releasePlatform": "Netflix",
  "releasePlatforms": ["Netflix", "Mercado Play"]
}
```

If optional fields are not used by current project schema, keep only supported fields.
If `screenshots` are not confirmed, keep `[]`.
The director/cast portraits are not stored inside the movie JSON; they must live in `src/data/people.json` plus local files in `public/people/`.
If the movie is single-platform, omit `releasePlatforms`.
If the movie resolves to `Otras plataformas`, keep only `releasePlatform: "Otras plataformas"`.

## Editorial metadata (mandatory)

Every new movie entry must leave the recommendation blocks ready for the detail page.

Rules:

- Always include an `editorial` object in the movie JSON.
- `editorial.becauseYouLiked` is mandatory:
  - add 1 or 2 existing movie slugs from the catalog
  - these power the `Si te gustó/gustaron...` bridge block
  - pick titles that really help orient the user by tone, genre, director, cast, or overall vibe
- `editorial.related` is mandatory:
  - add 3 or 4 existing movie slugs from the catalog
  - these power the `Si ya la viste...` follow-up block
  - prioritize strong next-click suggestions instead of obvious filler
- Slugs used in `becauseYouLiked` and `related` must already exist in `src/data/movies`, must not equal the current movie slug, and should not repeat within the same list.
- `runtimeMinutes` is strongly recommended whenever it can be verified, so the `Duración` block does not stay empty.

## Rating compatibility by slug (mandatory)

La posta cine now has a global 1..5 star rating widget powered by Supabase.
Every new movie entry must be automatically compatible through its `slug`.

Rules:

- Always provide a stable `slug` (do not change slug after publishing).
- Keep slug unique across all movies.
- Do not add special rating fields to movie content files.
- The site binds ratings by `movie_slug`, so normal content creation is enough when slug is correct.

## Lagrimometro compatibility (mandatory)

La posta cine shows an automatic `Lagrimómetro` on movie detail pages when the primary `category` is a tear-jerker lane.
Every new movie entry must be compatible through its primary `category`; do not add a manual lagrimometro field to movie JSON.

Rules:

- If the movie's primary `category` is `Drama`, `Romance`, `Romántica`, or `Comedia romántica`, set that category accurately so the automatic lagrimometro appears.
- Automatic meter priority follows the movie detail page exactly: `Drama`/`Romance`/`Romántica` shows Lagrimómetro first; if not, laugh-first `Comedia` shows Jajámetro; if neither, `Terror` shows Cagazómetro; if none of those, `Accion`/`Acción` shows Explosiómetro.
- `Comedia romántica` is a romance/lagrimómetro lane, not a Jajámetro lane. Only comedy built to make you laugh should trigger Jajámetro.
- Secondary `genres` such as `Drama`, `Romance`, or `Romántica` do not activate the lagrimometro by themselves. Use them for precision, not for meter eligibility.
- The review/verdict should support the likely automatic score with concrete reception or tone evidence from trustworthy sources (Rotten Tomatoes, Metacritic, IMDb, reputable critics, official materials), but never paste raw scores or third-party site names into the published review.
- After writing the movie file, mentally verify whether `getLagrimometroScore(movie)` should return a score or `undefined`.
- In final output, include one line: `Lagrimómetro: aplica/no aplica` and the reason based on primary `category`.

## Jajametro compatibility (mandatory)

La posta cine shows an automatic `Jajámetro` on movie detail pages when the primary `category` is laugh-first comedy.
Every new movie entry must be compatible through its primary `category`; do not add a manual jajametro field to movie JSON.

Rules:

- If the movie's primary `category` is laugh-first `Comedia`/`Comedy`, set it accurately so the automatic jajametro appears.
- Automatic meter priority follows the movie detail page exactly: `Drama`/`Romance`/`Romántica` shows Lagrimómetro first; if not, laugh-first `Comedia` shows Jajámetro; if neither, `Terror` shows Cagazómetro; if none of those, `Accion`/`Acción` shows Explosiómetro.
- If the movie is `Comedia romántica`, `Drama`, `Romance`, or not primary laugh comedy, keep `category` accurate so `getJajametroScore(movie)` returns `undefined`; secondary comedy genres do not activate it.
- The review/verdict should support the likely automatic score with concrete reception or tone evidence from trustworthy sources (Rotten Tomatoes, Metacritic, IMDb, reputable critics, official materials), but never paste raw scores or third-party site names into the published review.
- After writing the movie file, mentally verify whether `getJajametroScore(movie)` should return a score or `undefined`.
- In final output, include one line: `Jajámetro: aplica/no aplica` and the reason based on primary `category` plus the mutual-exclusion rule.

## Cagazometro compatibility (mandatory)

La posta cine shows an automatic `Cagazómetro` on movie detail pages when the primary `category` is `Terror`.
Every new movie entry must be compatible through its primary `category`; do not add a manual cagazometro field to movie JSON.

Rules:

- If the movie's primary `category` is `Terror`, set that category accurately so the automatic cagazometro appears.
- Automatic meter priority follows the movie detail page exactly: `Drama`/`Romance`/`Romántica` shows Lagrimómetro first; if not, laugh-first `Comedia` shows Jajámetro; if neither, `Terror` shows Cagazómetro; if none of those, `Accion`/`Acción` shows Explosiómetro.
- If the movie is not primary horror, keep `category` accurate so `getCagazometroScore(movie)` returns `undefined`; secondary horror genres do not activate it.
- The review/verdict should support the likely automatic score with concrete reception or tone evidence from trustworthy sources (Rotten Tomatoes, Metacritic, IMDb, reputable critics, official materials), but never paste raw scores or third-party site names into the published review.
- After writing the movie file, mentally verify whether `getCagazometroScore(movie)` should return a score or `undefined`.
- In final output, include one line: `Cagazómetro: aplica/no aplica` and the reason based on primary `category` plus the mutual-exclusion rule.

## Explosiometro compatibility (mandatory)

La posta cine shows an automatic `Explosiómetro` on movie detail pages when the primary `category` is `Accion`/`Acción`.
Every new movie entry must be compatible through its primary `category`; do not add a manual explosiometro field to movie JSON.

Rules:

- If the movie's primary `category` is `Accion` or `Acción`, set that category accurately so the automatic explosiometro appears.
- Automatic meter priority follows the movie detail page exactly: `Drama`/`Romance`/`Romántica` shows Lagrimómetro first; if not, laugh-first `Comedia` shows Jajámetro; if neither, `Terror` shows Cagazómetro; if none of those, `Accion`/`Acción` shows Explosiómetro.
- If the movie is not primary action, keep `category` accurate so `getExplosiometroScore(movie)` returns `undefined`; secondary action genres do not activate it.
- For primary action movies, gather trustworthy evidence for action intensity when available: published kill/body counts, official production notes, stunt/action-sequence coverage, reputable critics, or official materials. Use that evidence to support the review/verdict, but never add a raw meter score or third-party site names to the published review.
- After writing the movie file, mentally verify whether `getExplosiometroScore(movie)` should return a score or `undefined`.
- In final output, include one line: `Explosiómetro: aplica/no aplica` and the reason based on primary `category` plus the mutual-exclusion rule.

## Duplicate protection (mandatory)

Before writing, abort if duplicate by:

- same `slug`, or
- same normalized `title` + `year`

Suggested order:

1. Mandatory first pass in `docs/movie-catalog-reference.md` (primary, token-saving)
2. Mandatory targeted final check in `src/data/movies/*.json` (source of truth) for the same `slug` and normalized `title + year`
3. Full scan of all movie files only if catalog is missing/stale/corrupt

On duplicate, stop and report: `La pelicula ya existe`.
Do not overwrite existing entries without explicit user authorization.

## Editorial rules (mandatory)

Write `review` by combining user feedback + external review enrichment:

- Castellano rioplatense
- Honest, colloquial tone
- Write it manually from scratch for that movie. Do not use templates, fill-in-the-blank structures, or recycled sentence skeletons from previous loads.
- Never arm the review around reusable verdict scaffolds like `ZAFA y ...`, `PASABLE para ...`, `RECOMENDADA si ...` or any closing that could be pasted onto another title with one noun swap.
- Max 5 lines when user provides clear feedback
- If user provides little/no feedback, you may expand to 6-8 lines to add useful context from verified sources
- No spoilers
- No invented opinions
- Include at least one concrete detail grounded in the external source (for example reception cue, critic consensus, repeated strengths/weaknesses).
- Translate critic reception into rioplatense wording (for example: `funciona muy bien`, `quedo medio pelo`, `la destrozaron bastante`) instead of exposing raw score formats.
- Never write phrases like `en Rotten`, `segun Metacritic`, `IMDb la dejo...` or any other explicit third-party attribution inside the review.
- Never start the review with labels like `Numeros:` or any score dump template.
- Every movie review must be unique in wording and structure.
- Treat any template-shaped wording as forbidden, including reusable scaffolds like `A <titulo> le conviene entrarla por...`, `Hay una version buena de...`, `Lo mejor aparece cuando...`, `La contra suele aparecer cuando...`, `PASABLE porque...`, or equivalent fill-in-the-blank formulas.
- Avoid repeated openings across a batch (for example reusing `En la critica especializada...` in multiple entries).
- In multi-movie batches, vary sentence rhythm and vocabulary so entries do not read like a template.
- Do not reuse stock closing lines across different movies in the same batch (for example repeating `Queda en ese punto medio que no molesta.`).
- In batch mode, run a final anti-duplication pass at sentence level: no full sentence may appear verbatim in more than one review.
- If a review sounds too generic, rewrite it with movie-specific angle (tone, pacing, performances, direction, genre execution) without spoilers.
- Do not sign off on a review that could be copy-pasted onto another movie by changing only title, cast, or verdict.
- Reviews that are too short to carry a movie-specific angle are not acceptable. If the first draft sounds like a card note instead of editorial copy, rewrite it before validation.
- Enforce proper Spanish orthography in review text: use `ñ` and accent marks when applicable (for example `reseñas`, not `resenas`).
- Do not degrade Spanish words to ASCII-only variants in user-facing review copy.

If user feedback is too short, prioritize clear rioplatense interpretation of verified critic reception over listing metrics.

## Verdict mapping

Map user language to internal verdict:

- `zafa`, `safa`, `esta ok`, `zafarola` -> `verdict: zafa`
- `recomendada`, `muy buena`, `me encanto`, `entretenida` -> `verdict: recomendada`
- `malisima`, `una verga`, `es una poronga`, `no la recomiendo` ->
  `verdict: no_recomendada`

Keep internal `verdict` stable.
Use `verdictLabel` for colloquial display override.

Score-driven mapping policy (mandatory when a numeric reception score is used in batch updates):

- Normalize external reception score to a `0..10` scale.
- If score is `>= 6.0`, force `verdict: recomendada` (green / buena).
- If score is `>= 5.0` and `< 6.0`, use `verdict: zafa`.
- If score is `< 5.0`, use `verdict: no_recomendada`.
- Do not place a movie with score `>= 6.0` in `zafa` or `no_recomendada`.
- Example guardrail: a movie with `6.3` must be `recomendada`.

`verdictLabel` style policy (mandatory):

- Clarity beats creativity: the label must tell the user at a glance if the movie is good, passable, or bad.
- Repetition is allowed. Do not force artificial variety if the alternative sounds confusing.
- If user provides an explicit label/phrase, preserve it as `verdictLabel` (normalized only for casing/spacing).
- If user does not provide label, infer one with plain colloquial wording that reads instantly on the card.
- Hard cap: `verdictLabel` must be `<= 21` visible characters, including spaces, so the movie card badge never clips.
- Keep labels consistent with `verdict`:
  - `recomendada`: examples `RECOMENDADA`, `ESTA BUENA`, `MUY BUENA`, `IMPERDIBLE`, `ESTA MUY BIEN`, `BUENISIMA`
  - `zafa`: examples `PASABLE`, `ZAFA`, `ESTA OK`, `SE DEJA VER`, `CUMPLE`, `MAS O MENOS`
  - `no_recomendada`: examples `NO LA MIRES`, `MALA`, `MALISIMA`, `ES UNA VERGA`, `UN GARRON`, `MUY FLOJA`
  - `basura_atomica`: examples `BASURA TOTAL`, `NI LA PONGAS`, `HORRIBLE`, `DESASTRE`, `TODO MAL`
- If the movie is a universally recognized all-timer or canonical classic, prefer a legendary-style `verdictLabel`.
  Examples: `LEGENDARIA`, `OBRA MAESTRA`, `CLASICO TOTAL`.
  This applies to cases like `The Godfather`, `The Godfather Part II`, `Casablanca`, `Schindler's List`, `The Lord of the Rings: The Return of the King`, `Spirited Away`, and similar consensus classics.
- Prefer uppercase display labels unless user explicitly asks for another style.
- Never assign a positive-sounding label to `no_recomendada` (or vice versa).
- Do not invent cryptic combinations like `NO VA SALVAJE`, `PAPELON NOBLE`, `PASABLE SUELTA` or any badge that needs interpretation.

## Premiere badge rules

Set premiere fields only when requested or confidently confirmed:

- `isPremiere: true`
- `premiereLabel: "ESTRENO"`
- `releasePlatform`: primary AR label
- `releasePlatforms`: optional array with max `2` total legal AR labels when the title is truly multi-platform
- Allowed labels are only: `Netflix`, `HBO Max`, `Paramount Plus`, `Apple TV`, `Cine`, `CINE.AR`, `Prime Video`, `Disney Plus`, `Crunchyroll`, `Mercado Play`, `Otras plataformas`
- Never combine `Otras plataformas` with another provider in premiere metadata

If not confirmed, keep:

- `isPremiere: false`
- `premiereLabel: ""`
- `releasePlatform: "Otras plataformas"`

## Validation and commit gate

Run these checks in order:

1. Build validation:

```bash
npm run enrich-people -- --movie <slug>
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate src/data/movies/<slug>.json
npm run build
```

If build fails, abort. Do not edit site code.

If the movie still claims `Cine`, run the chained revalidation step before final diff/commit:

```text
Usa $la-posta-cine-cartelera-revalidator para confirmar si <title> sigue realmente en cartelera argentina o si corresponde otra plataforma / Otras plataformas.
```

2. File-scope validation:

```bash
git diff --name-only
```

Confirm every changed file is inside allowlist.
If any forbidden path appears, abort and report conflicting files.

3. Show diff (mandatory):

```bash
git diff -- src/data/movies/<slug>.json
git diff -- src/data/people.json
git diff -- public/people
```

If catalog was refreshed:

```bash
git diff -- docs/movie-catalog-reference.md
```

After the required revalidation/audit chain, only then commit and push:

```bash
git add src/data/movies/<slug>.json src/data/people.json public/people docs/movie-catalog-reference.md
git commit -m "Add movie entry: <title> (<year>)"
git push -u origin feature/movie-<slug>
```

## Output format (always return)

Return all of the following:

1. Branch created
2. New file path
3. Field summary (`title/originalTitle/year/category/poster/trailer/director/mainCast/productionCompany/verdict/review/isPremiere/releasePlatform/releasePlatforms`)
4. `npm run build` result
5. `git diff --name-only` output
6. Explicit confirmation: `No se modifico ningun archivo fuera de peliculas, people pool y catalogo`
7. Optional PR link or exact command to open PR
8. External review source used (site + URL) and what was extracted from it
9. Platform source used for AR (site + URL) and why chosen `releasePlatform` / optional `releasePlatforms` match resolver flow
10. Awards source used (site + URL), verified premios/galardones found, and exact final `awards.wins` content (including empty array when no wins apply)
11. Catalog update confirmation with changed total count in `docs/movie-catalog-reference.md`
12. People pool confirmation with exact credited names added/updated in `src/data/people.json` and cached image paths in `public/people/`
13. Exclusive profile linkage confirmation for any credited person already present in `docs/person-profile-catalog-reference.md`
14. Lagrimómetro confirmation: `aplica` or `no aplica`, with primary-category reason
15. Jajámetro confirmation: `aplica` or `no aplica`, with primary-category reason and mutual-exclusion status
16. Cagazómetro confirmation: `aplica` or `no aplica`, with primary-category reason and mutual-exclusion status
17. Explosiómetro confirmation: `aplica` or `no aplica`, with primary-category reason and mutual-exclusion status

## Validation checklist

- [ ] Branch created from updated `main`
- [ ] Exactly one new movie file added (unless user explicitly authorized otherwise)
- [ ] `docs/movie-catalog-reference.md` refreshed and includes new movie slug(s)
- [ ] No modified files outside allowlist
- [ ] No Share UI/assets modified during a content-only load; movie share links derive automatically from slug/canonical URL
- [ ] Review length rule respected (<=5 with user feedback, or 6-8 without meaningful user feedback), no spoilers
- [ ] Review grounded on user feedback + external source, without fabricated data and without raw score dump format
- [ ] Review written manually from scratch, without template scaffolds, stock closings, or robotized phrasing that could fit another movie unchanged
- [ ] Review does not lean on verdict-led stock lines (`ZAFA y...`, `PASABLE para...`, `SE DEJA VER si...`) as opener or closer
- [ ] Current-year / future titles include verified `releaseDate` in `YYYY-MM-DD` so Astro 6 home/search visibility is preserved
- [ ] Poster/trailer fields from trustworthy sources
- [ ] Original title and category from trustworthy sources
- [ ] Director/main cast/production company from trustworthy sources
- [ ] `trailerYoutubeId` set to official trailer in original language (or explicit user exception recorded)
- [ ] External review enrichment from specialized North American source (or explicit fallback/user-provided link)
- [ ] Awards enrichment completed: premios/galardones verified and `awards.wins` always present (wins list or `[]`)
- [ ] `releasePlatform` / optional `releasePlatforms` resolved with AR evidence and mapping flow (not defaulted blindly)
- [ ] Multi-platform titles keep max `2` labels total and never combine another provider with `Otras plataformas`
- [ ] Slug is unique and stable (required for Supabase rating linkage)
- [ ] Lagrimómetro eligibility checked from primary `category`; no manual lagrimometro field added
- [ ] Jajámetro eligibility checked from primary `category`; no manual jajametro field added; never shown together with lagrimómetro
- [ ] Cagazómetro eligibility checked from primary `category`; no manual cagazometro field added; never shown together with lagrimómetro or jajámetro
- [ ] Explosiómetro eligibility checked from primary `category`; no manual explosiometro field added; never shown together with lagrimómetro, jajámetro or cagazómetro
- [ ] `docs/movie-catalog-reference.md` consulted before adding movies
- [ ] `docs/movie-catalog-reference.md` updated after adding movies (single or bulk)
- [ ] `docs/person-profile-catalog-reference.md` consulted before locking credited names
- [ ] Any credited person with an exclusive profile keeps the canonical catalog name so the dynamic `/personas/<slug>/` link resolves
- [ ] `npm run build` passed
- [ ] Diff shown before commit
- [ ] Commit and push done on feature branch
- [ ] Output includes required safety confirmation

## Optional PR step

If gh CLI is available:

```bash
gh pr create --base main --head feature/movie-<slug> --title "Add movie: <title> (<year>)" --body "Nueva entrada de pelicula"
```

If not available, provide compare URL:

`https://github.com/Clovhis/sucuplecuc/compare/main...feature/movie-<slug>?expand=1`

## Publish verification (mandatory when user asks "push a main/publica")

When the user explicitly asks to merge/push to `main` and publish, do not stop at "deploy triggered".

Required flow:

1. Merge branch into `main` and push.
2. Poll GitHub Actions runs for the pushed `head_sha` until terminal status:
   - `completed + success` -> continue
   - `completed + failure/cancelled/timed_out` -> report failure with run URL
3. Fetch `https://www.cineposta.com.ar/` and verify the expected slug(s) from this change exist in HTML.
4. Only then send final success message.

Minimum evidence to include in final response:

- Actions run URL
- Actions conclusion (`success` required)
- Web verification result (slug present on live site)

## Example usage: Cumbres Borrascosas

User input example:

`Agrega Cumbres Borrascosas (1939). Zafa, medio lenta por momentos, pero tiene clima.`

Expected behavior summary:

1. Create branch `feature/movie-cumbres-borrascosas-1939`
2. Fetch metadata from trustworthy sources
3. Create `src/data/movies/cumbres-borrascosas-1939.json`
4. Write rioplatense review (<=5 lines if user feedback is clear), translating critic reception to words (no raw score dump)
5. Set `verdict: zafa`, `verdictLabel: ZAFA`
6. Run `npm run build`, show `git diff --name-only`, commit, push
7. Return pending fields if poster/trailer cannot be confirmed reliably
