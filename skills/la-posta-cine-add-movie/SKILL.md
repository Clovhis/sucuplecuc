---
name: la-posta-cine-add-movie
description: Add a single movie entry to La posta cine safely from a plain-language request (for example "Agrega X, es malisima"). Use when the user wants to publish a new movie review entry in Clovhis/sucuplecuc. Enforce add-only content edits, create a feature branch from main, fetch trustworthy movie metadata, write one content file, run build validation, show diff, and push the new branch without modifying site code.
---

# la-posta-cine-add-movie

Execute this workflow when the user asks to add a movie entry.

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

Allowed paths:

- `src/data/movies/**`
- `src/data/people.json`
- `public/people/**`
- `content/movies/**` (only if this repo variant uses it)
- `docs/movie-catalog-reference.md`

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
- Keep the catalog sorted and include at least: `year`, `title`, `slug`, `category`, `releasePlatform`.

## Metadata lookup rules

Find trustworthy metadata:

- `title`
- `originalTitle`
- `year`
- `category`
- `poster`
- official YouTube trailer id in original language (store only `trailerYoutubeId`)
- `director`
- `mainCast` (at least 2-3 principal actors)
- `productionCompany`
- IMDb profile trace for the credited director and main cast
- birth year for each credited director and main cast member
- primary nationality label in Spanish for each credited director and main cast member (for example `Argentino`, `Britanica`, `Mexicano`)
- one local cached portrait per credited director and main cast member under `public/people/**`
- death year when the person is deceased, so UI can show `Fallecio en <anio>` instead of a fake living age

Use primary/trustworthy sources (official studio channels, official movie pages, major databases).

Argentine title policy (mandatory):

- `title` must always be the name used for Argentine audiences, not the raw original title by default.
- `originalTitle` must keep the source-language/original-market title.
- Verify `title` against Argentine-facing sources in this order when available:
  1. Argentine platform page (`Disney Plus AR`, `Netflix AR`, `HBO Max AR`, `Prime Video AR`, etc.)
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

People pool policy (mandatory):

- Every new movie must also update `src/data/people.json`.
- The people catalog is keyed by the exact credited name string used in movie JSON.
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
- Allowed platform labels for AR are only: `Netflix`, `HBO Max`, `Apple TV`, `Cine`, `Prime Video`, `Disney Plus`, `Crunchyroll`.
- Mandatory resolver flow (do not skip):
  1. Search availability for exact movie + year in AR.
  2. Read only AR offers and identify `FLATRATE` subscription availability first.
  3. Map provider name to allowed labels:
     - `Max` or `HBO Max` -> `HBO Max`
     - `Disney Plus` or `Disney+` -> `Disney Plus`
     - `Amazon Prime Video` or `Prime Video` -> `Prime Video`
     - `Apple TV Plus` or `Apple TV+` -> `Apple TV`
     - `Netflix` -> `Netflix`
     - `Crunchyroll` -> `Crunchyroll`
  4. If at least one mapped `FLATRATE` provider exists, use that mapped label (never `Stremio` in this case).
  5. If there is no mapped `FLATRATE` but AR indicates cinema-only availability, set `releasePlatform: "Cine"`.
  6. If AR availability exists only in providers outside allowlist, or AR has no confirmed availability, set `releasePlatform: "Stremio"`.
- Forbidden shortcuts:
  - Do not assign `Stremio` by default without AR lookup attempt.
  - Do not copy platform from another movie without validating title/year.
  - Do not use non-AR market data to override AR result.
- Never leave `releasePlatform` empty.

## Content schema

Create one JSON file in `src/data/movies/<slug>.json` using project schema:

```json
{
  "slug": "movie-slug-2026",
  "title": "Movie Title",
  "originalTitle": "Original title",
  "year": 2026,
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
    "idealFor": ["solo", "domingo"],
    "becauseYouLiked": ["otra-peli-del-catalogo-2024"],
    "related": ["peli-relacionada-1-2023", "peli-relacionada-2-2022", "peli-relacionada-3-2021"]
  },
  "awards": {
    "wins": []
  },
  "review": "Resena breve en castellano rioplatense",
  "isPremiere": false,
  "premiereLabel": "",
  "releasePlatform": "Stremio"
}
```

If optional fields are not used by current project schema, keep only supported fields.
If `screenshots` are not confirmed, keep `[]`.
The director/cast portraits are not stored inside the movie JSON; they must live in `src/data/people.json` plus local files in `public/people/`.

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
- `editorial.idealFor` is optional but recommended when confidence is high (`solo`, `en pareja`, `con amigos`, `domingo`, `trasnoche`).
- `runtimeMinutes` is strongly recommended whenever it can be verified, so the `Duración` block does not stay empty.

## Rating compatibility by slug (mandatory)

La posta cine now has a global 1..5 star rating widget powered by Supabase.
Every new movie entry must be automatically compatible through its `slug`.

Rules:

- Always provide a stable `slug` (do not change slug after publishing).
- Keep slug unique across all movies.
- Do not add special rating fields to movie content files.
- The site binds ratings by `movie_slug`, so normal content creation is enough when slug is correct.

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
- Max 5 lines when user provides clear feedback
- If user provides little/no feedback, you may expand to 6-8 lines to add useful context from verified sources
- No spoilers
- No invented opinions
- Include at least one concrete detail grounded in the external source (for example reception cue, critic consensus, repeated strengths/weaknesses).
- Translate critic reception into rioplatense wording (for example: `funciona muy bien`, `quedo medio pelo`, `la destrozaron bastante`) instead of exposing raw score formats.
- Never write phrases like `en Rotten`, `segun Metacritic`, `IMDb la dejo...` or any other explicit third-party attribution inside the review.
- Never start the review with labels like `Numeros:` or any score dump template.
- Every movie review must be unique in wording and structure.
- Avoid repeated openings across a batch (for example reusing `En la critica especializada...` in multiple entries).
- In multi-movie batches, vary sentence rhythm and vocabulary so entries do not read like a template.
- Do not reuse stock closing lines across different movies in the same batch (for example repeating `Queda en ese punto medio que no molesta.`).
- In batch mode, run a final anti-duplication pass at sentence level: no full sentence may appear verbatim in more than one review.
- If a review sounds too generic, rewrite it with movie-specific angle (tone, pacing, performances, direction, genre execution) without spoilers.
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
- `releasePlatform`: only one allowed label (`Netflix`, `HBO Max`, `Apple TV`, `Cine`, `Prime Video`, `Disney Plus`, `Crunchyroll`) when reliable for AR

If not confirmed, keep:

- `isPremiere: false`
- `premiereLabel: ""`
- `releasePlatform: "Stremio"`

## Validation and commit gate

Run these checks in order:

1. Build validation:

```bash
npm run enrich-people -- --movie <slug>
npm run build
```

If build fails, abort. Do not edit site code.

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

Only then commit and push:

```bash
git add src/data/movies/<slug>.json src/data/people.json public/people docs/movie-catalog-reference.md
git commit -m "Add movie entry: <title> (<year>)"
git push -u origin feature/movie-<slug>
```

## Output format (always return)

Return all of the following:

1. Branch created
2. New file path
3. Field summary (`title/originalTitle/year/category/poster/trailer/director/mainCast/productionCompany/verdict/review/isPremiere`)
4. `npm run build` result
5. `git diff --name-only` output
6. Explicit confirmation: `No se modifico ningun archivo fuera de peliculas, people pool y catalogo`
7. Optional PR link or exact command to open PR
8. External review source used (site + URL) and what was extracted from it
9. Platform source used for AR (site + URL) and why chosen `releasePlatform` matches resolver flow
10. Awards source used (site + URL), verified premios/galardones found, and exact final `awards.wins` content (including empty array when no wins apply)
11. Catalog update confirmation with changed total count in `docs/movie-catalog-reference.md`
12. People pool confirmation with exact credited names added/updated in `src/data/people.json` and cached image paths in `public/people/`

## Validation checklist

- [ ] Branch created from updated `main`
- [ ] Exactly one new movie file added (unless user explicitly authorized otherwise)
- [ ] `docs/movie-catalog-reference.md` refreshed and includes new movie slug(s)
- [ ] No modified files outside allowlist
- [ ] Review length rule respected (<=5 with user feedback, or 6-8 without meaningful user feedback), no spoilers
- [ ] Review grounded on user feedback + external source, without fabricated data and without raw score dump format
- [ ] Poster/trailer fields from trustworthy sources
- [ ] Original title and category from trustworthy sources
- [ ] Director/main cast/production company from trustworthy sources
- [ ] `trailerYoutubeId` set to official trailer in original language (or explicit user exception recorded)
- [ ] External review enrichment from specialized North American source (or explicit fallback/user-provided link)
- [ ] Awards enrichment completed: premios/galardones verified and `awards.wins` always present (wins list or `[]`)
- [ ] `releasePlatform` resolved with AR evidence and mapping flow (not defaulted blindly)
- [ ] Slug is unique and stable (required for Supabase rating linkage)
- [ ] `docs/movie-catalog-reference.md` consulted before adding movies
- [ ] `docs/movie-catalog-reference.md` updated after adding movies (single or bulk)
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
