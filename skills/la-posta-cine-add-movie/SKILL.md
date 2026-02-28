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
- `content/movies/**` (only if this repo variant uses it)

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
npm run build
git diff --name-only
git diff -- src/data/movies/<slug>.json
git add src/data/movies/<slug>.json
git commit -m "Add movie entry: <title> (<year>)"
git push -u origin feature/movie-<slug>
```

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

Use primary/trustworthy sources (official studio channels, official movie pages, major databases).

External review enrichment policy (mandatory):

- For every new movie, fetch at least one opinion/review signal from a specialized North American movie site.
- Preferred sources order:
  1. `Variety`, `The Hollywood Reporter`, `IndieWire`, `RogerEbert.com`
  2. `Rotten Tomatoes` (critics consensus/review snippets) or `Metacritic` (critic excerpts/scores)
  3. `IMDb` (user/critic rating and/or review snippets) as fallback when no formal critic review is available
- Extract only verifiable points (for example: general reception, pacing comments, acting comments, critics consensus).
- Use scores/signals as internal support, but write them in natural language for the review.
- Do not dump raw numeric strings in the review body (examples to avoid: `59/100`, `6.8/10`, `Numeros: ...`) unless the user explicitly asks for numeric detail.
- Do not fabricate criticism details that are not present in the consulted source.
- If no source from the list can be verified, stop and ask the user for a reference link before committing.

Awards enrichment policy (mandatory):

- Evaluate whether the movie has wins in: `Oscar`, `Grammy`, and/or `Festival de Cannes`.
- If there are verified wins, include them in `awards.wins` with:
  - `award`: `oscar` | `grammy` | `cannes`
  - `category`: exact category/prize name in Spanish
  - `recipient`: person/team/pais/produccion ganadora cuando aplique (por ejemplo actor, directora, productores, etc.)
  - `year`: ceremony year
- For `Oscar` category `Mejor película`, always include `recipient` and mark it as top priority in UI output logic.
- If there are no verified wins in those three awards, omit `awards` from the entry.
- Never invent award wins or categories.
Trailer policy is strict:

- Always set `trailerYoutubeId` for the movie entry.
- Prefer official trailer in original language.
- If user provides a YouTube URL, extract and use that video id directly.
- If no reliable official trailer is found, stop and ask user for a trailer link before commit.
- Do not finalize an entry with empty `trailerYoutubeId` unless user explicitly authorizes that exception.

Do not invent data.
Do not store full YouTube URL when schema uses id.

Platform policy for Argentina (mandatory):

- Always resolve `releasePlatform` for Argentine audience (`AR`) using trustworthy availability sources (prefer JustWatch `ar` pages and/or official platform pages).
- Allowed platform labels for AR are only: `Netflix`, `HBO Max`, `Apple TV`, `Cine`, `Prime Video`, `Disney Plus`.
- Mandatory resolver flow (do not skip):
  1. Search availability for exact movie + year in AR.
  2. Read only AR offers and identify `FLATRATE` subscription availability first.
  3. Map provider name to allowed labels:
     - `Max` or `HBO Max` -> `HBO Max`
     - `Disney Plus` or `Disney+` -> `Disney Plus`
     - `Amazon Prime Video` or `Prime Video` -> `Prime Video`
     - `Apple TV Plus` or `Apple TV+` -> `Apple TV`
     - `Netflix` -> `Netflix`
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
  "awards": {
    "wins": [
      { "award": "oscar", "category": "Mejor película", "recipient": "Productores ganadores", "year": 2025 }
    ]
  },
  "review": "Resena breve en castellano rioplatense",
  "isPremiere": false,
  "premiereLabel": "",
  "releasePlatform": "Stremio"
}
```

If optional fields are not used by current project schema, keep only supported fields.
If `screenshots` are not confirmed, keep `[]`.

## Rating compatibility by slug (mandatory)

La posta cine now has a global 1..5 star rating widget powered by Supabase.
Every new movie entry must be automatically compatible through its `slug`.

Rules:

- Always provide a stable `slug` (do not change slug after publishing).
- Keep slug unique across all movies.
- Do not add special rating fields to movie content files.
- The site binds ratings by `movie_slug`, so normal content creation is enough when slug is correct.

## Duplicate protection (mandatory)

Before writing, scan movie files and abort if duplicate by:

- same `slug`, or
- same normalized `title` + `year`

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

- Do not lock labels to a single default per verdict (avoid always using only `RECOMENDADA`, `ZAFA`, `MALISIMA`).
- If user provides an explicit label/phrase, preserve it as `verdictLabel` (normalized only for casing/spacing).
- If user does not provide label, infer one from critic reception intensity and tone.
- Rotate labels across multi-movie batches so they do not repeat mechanically.
- Keep labels consistent with `verdict`:
  - `recomendada`: examples `ESTA MUY BIEN`, `BRILLANTE`, `ASOMBROSA`, `MUY BUENA`, `PELICULON`, `SÓLIDA`
  - `zafa`: examples `MEH`, `MASOMENO`, `ZAFETTI`, `ZAFA`, `ZAFAROLA`, `PASABLE`
  - `no_recomendada`: examples `UNA VERGA`, `ABURRIDA`, `PLOMAZO`, `FLOJISIMA`, `NO VA`
- Prefer uppercase display labels unless user explicitly asks for another style.
- Never assign a positive-sounding label to `no_recomendada` (or vice versa).

## Premiere badge rules

Set premiere fields only when requested or confidently confirmed:

- `isPremiere: true`
- `premiereLabel: "ESTRENO"`
- `releasePlatform`: only one allowed label (`Netflix`, `HBO Max`, `Apple TV`, `Cine`, `Prime Video`, `Disney Plus`) when reliable for AR

If not confirmed, keep:

- `isPremiere: false`
- `premiereLabel: ""`
- `releasePlatform: "Stremio"`

## Validation and commit gate

Run these checks in order:

1. Build validation:

```bash
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
```

Only then commit and push:

```bash
git add src/data/movies/<slug>.json
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
6. Explicit confirmation: `No se modifico ningun archivo fuera del contenido de peliculas`
7. Optional PR link or exact command to open PR
8. External review source used (site + URL) and what was extracted from it
9. Platform source used for AR (site + URL) and why chosen `releasePlatform` matches resolver flow
10. Awards source used (site + URL) and exact `awards.wins` entries added (or explicit confirmation that there are no verified Oscar/Grammy/Cannes wins)

## Validation checklist

- [ ] Branch created from updated `main`
- [ ] Exactly one new movie file added (unless user explicitly authorized otherwise)
- [ ] No modified files outside allowlist
- [ ] Review length rule respected (<=5 with user feedback, or 6-8 without meaningful user feedback), no spoilers
- [ ] Review grounded on user feedback + external source, without fabricated data and without raw score dump format
- [ ] Poster/trailer fields from trustworthy sources
- [ ] Original title and category from trustworthy sources
- [ ] Director/main cast/production company from trustworthy sources
- [ ] `trailerYoutubeId` set to official trailer in original language (or explicit user exception recorded)
- [ ] External review enrichment from specialized North American source (or explicit fallback/user-provided link)
- [ ] Awards enrichment completed: verified Oscar/Grammy/Cannes wins loaded into `awards.wins` (or omitted with explicit no-wins confirmation)
- [ ] `releasePlatform` resolved with AR evidence and mapping flow (not defaulted blindly)
- [ ] Slug is unique and stable (required for Supabase rating linkage)
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
