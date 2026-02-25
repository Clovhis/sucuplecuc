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
- `year`
- `poster`
- official YouTube trailer id in original language (store only `trailerYoutubeId`)

Use primary/trustworthy sources (official studio channels, official movie pages, major databases).
Trailer policy is strict:

- Always set `trailerYoutubeId` for the movie entry.
- Prefer official trailer in original language.
- If user provides a YouTube URL, extract and use that video id directly.
- If no reliable official trailer is found, stop and ask user for a trailer link before commit.
- Do not finalize an entry with empty `trailerYoutubeId` unless user explicitly authorizes that exception.

Do not invent data.
Do not store full YouTube URL when schema uses id.

## Content schema

Create one JSON file in `src/data/movies/<slug>.json` using project schema:

```json
{
  "slug": "movie-slug-2026",
  "title": "Movie Title",
  "year": 2026,
  "poster": "",
  "screenshots": [],
  "trailerYoutubeId": "",
  "verdict": "zafa",
  "verdictLabel": "ZAFA",
  "review": "Resena breve en castellano rioplatense",
  "isPremiere": false,
  "premiereLabel": "",
  "releasePlatform": ""
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

Write `review` from user feedback only:

- Castellano rioplatense
- Honest, colloquial tone
- Max 5 lines
- No spoilers
- No invented opinions

If user feedback is too short, keep review concise and explicit (for example `Primera impresion`) instead of inventing details.

## Verdict mapping

Map user language to internal verdict:

- `zafa`, `safa`, `esta ok` -> `verdict: zafa`, `verdictLabel: ZAFA`
- `recomendada`, `muy buena`, `me encanto` -> `verdict: recomendada`, `verdictLabel: RECOMENDADA`
- `malisima`, `una verga`, `es una poronga`, `no la recomiendo` ->
  `verdict: no_recomendada`, `verdictLabel`: user phrase if clear, else default `MALISIMA`

Keep internal `verdict` stable.
Use `verdictLabel` for colloquial display override.

## Premiere badge rules

Set premiere fields only when requested or confidently confirmed:

- `isPremiere: true`
- `premiereLabel: "ESTRENO"`
- `releasePlatform`: `Cine`, `Netflix`, etc only if reliable

If not confirmed, keep:

- `isPremiere: false`
- `premiereLabel: ""`
- `releasePlatform: ""`

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
3. Field summary (`title/year/poster/trailer/verdict/review/isPremiere`)
4. `npm run build` result
5. `git diff --name-only` output
6. Explicit confirmation: `No se modifico ningun archivo fuera del contenido de peliculas`
7. Optional PR link or exact command to open PR

## Validation checklist

- [ ] Branch created from updated `main`
- [ ] Exactly one new movie file added (unless user explicitly authorized otherwise)
- [ ] No modified files outside allowlist
- [ ] Review <= 5 lines, no spoilers, based only on user feedback
- [ ] Poster/trailer fields from trustworthy sources
- [ ] `trailerYoutubeId` set to official trailer in original language (or explicit user exception recorded)
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

## Example usage: Cumbres Borrascosas

User input example:

`Agrega Cumbres Borrascosas (1939). Zafa, medio lenta por momentos, pero tiene clima.`

Expected behavior summary:

1. Create branch `feature/movie-cumbres-borrascosas-1939`
2. Fetch metadata from trustworthy sources
3. Create `src/data/movies/cumbres-borrascosas-1939.json`
4. Write rioplatense review (<=5 lines) based only on that feedback
5. Set `verdict: zafa`, `verdictLabel: ZAFA`
6. Run `npm run build`, show `git diff --name-only`, commit, push
7. Return pending fields if poster/trailer cannot be confirmed reliably
