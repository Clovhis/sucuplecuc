---
name: la-posta-cine-auditor
description: Audit recently added La Posta Cine movie entries after `la-posta-cine-add-movie` or any bulk/backfill load. Use when Codex needs to verify newly added `src/data/movies/*.json` files in Clovhis/sucuplecuc for schema correctness, trailer validity, review quality, awards structure, platform labels, catalog sync, and safe diff scope before or after publishing.
---

# la-posta-cine-auditor

Audit a recent movie batch without touching site code.

This skill must always execute the bundled audit script. Manual eyeballing is not enough, even if the only requested check is verdict labels or score/badge tone.

## Scope

Use this skill after a movie add/backfill workflow, especially when the branch contains new files under `src/data/movies`.

Allowed fix paths:

- `src/data/movies/**`
- `src/data/people.json`
- `public/people/**`
- `docs/movie-catalog-reference.md`

Forbidden fix paths:

- `src/pages/**`
- `src/components/**`
- `src/layouts/**`
- `src/styles/**`
- `public/**`
- `.github/**`
- `package*.json`
- `astro.config.*`
- `tsconfig.json`

Never auto-fix project code if the audit fails.

## Workflow

### 1. Resolve candidates

Prefer the current branch diff against `main`.

Default audit command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --base-ref main --recent
```

Full catalog command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --all
```

Explicit batch command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs \
  --candidate src/data/movies/foo-2024.json \
  --candidate src/data/movies/bar-2025.json
```

### 2. Run deterministic checks

The bundled script checks:

- recent candidate detection from `git diff <base>...HEAD`
- required fields and JSON shape
- people pool coverage in `src/data/people.json` for every credited director/main cast member
- local cached portrait existence under `public/people/**`
- portrait source sanity so cached portraits are real headshots and not logos, posters, favicons or generic site assets
- birth year presence for every credited director/main cast member
- death year sanity for deceased people and implausibly old profiles
- primary nationality presence for every credited director/main cast member
- IMDb trace URL presence for every credited director/main cast member
- editorial recommendation completeness for `becauseYouLiked` and `related`
- editorial recommendation slugs that resolve to real movie entries
- raw HTML entities or scrape artifacts accidentally persisted into JSON fields
- `awards.wins` structure and supported award types
- `verdictLabel` sanity so the badge reads like a quality signal instead of metadata
- `verdictLabel` hard cap of `21` visible characters so the card badge never clips
- `verdictLabel` readability so the badge says clearly if the movie is buena, pasable o mala
- platform labels against the site allowlist
- catalog sync in `docs/movie-catalog-reference.md`
- trailer format, YouTube oEmbed reachability, title/year sanity, and YouTube search alignment for ambiguous titles
- raw numeric score leakage in reviews
- forbidden third-party site mentions inside reviews (`Rotten`, `Metacritic`, `IMDb`, etc.)
- editorial duplication by delegating to `skills/la-posta-cine-add-movie/scripts/review_audit.js`

### 3. Interpret findings

- `ERROR`: fix before considering the batch valid
- `WARN`: inspect and fix if confidence is high

The `verdictLabel` readability check is mandatory:

- treat confusing or cryptic labels as a hard stop
- repetition is allowed when the wording is clear and useful
- prefer short direct labels like `RECOMENDADA`, `ESTA BUENA`, `PASABLE`, `NO LA MIRES`, `MALA`, `MALISIMA`, `BASURA TOTAL`
- legendary all-timer movies should be recognized with labels like `LEGENDARIA`, `OBRA MAESTRA` or `CLASICO TOTAL`, not downgraded to a generic `ESTA BUENA`

The third-party mention check is also mandatory:

- treat any explicit site/brand mention inside `review` as a hard error
- rewrite the sentence into generic editorial language (`la crítica`, `la recepción`, `el consenso`) instead of naming the source
- sources may still be cited in the audit report/output evidence, but never inside the published review copy

If a finding depends on external truth, verify it with primary or trustworthy sources before editing:

- official YouTube channels for trailers
- official movie/distributor pages, JustWatch AR, IMDb, Rotten Tomatoes, Metacritic
- official award pages or reliable databases for Oscar/Cannes/Grammy wins

Do not invent trailers, awards, or platform data.

### 4. Safe fix loop

If the script reports fixable issues:

1. Edit only affected movie JSON files, `src/data/people.json`, local `public/people/**` files and, if needed, `docs/movie-catalog-reference.md`
2. Re-run the auditor without skipping the mandatory batch score/badge check
3. Run `npm run build`
4. Confirm no forbidden path changed

### 5. Output

Report:

- audited candidate list
- errors and warnings
- fixes applied, if any
- final revalidation status
- explicit statement that no forbidden path was modified
- explicit confirmation that the people pool is complete for every credited director/main cast member in the audited batch, including birth year, nationality, IMDb trace, and local portrait
- explicit confirmation that deceased people do not render as living ages and that animation/anime titles use original voice cast in `mainCast`
