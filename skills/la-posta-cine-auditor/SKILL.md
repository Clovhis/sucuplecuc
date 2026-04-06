---
name: la-posta-cine-auditor
description: Audit recently added or revalidated La Posta Cine movie entries after `la-posta-cine-add-movie`, `la-posta-cine-cartelera-revalidator`, or any bulk/backfill load. Use when Codex needs to verify newly added or platform-adjusted `src/data/movies/*.json` files in Clovhis/sucuplecuc for schema correctness, trailer validity, review quality, awards structure, single or multi-platform labels, catalog sync, and safe diff scope before or after publishing.
---

# la-posta-cine-auditor

Audit a recent movie batch without touching site code.

This skill must always execute the bundled audit script. Manual eyeballing is not enough, even if the only requested check is verdict labels or score/badge tone.

If the branch still contains fresh `Cine` claims that have not yet been checked against current cartelera, invoke `la-posta-cine-cartelera-revalidator` first and then return to this skill.

## Scope

Use this skill after a movie add/backfill/revalidation workflow, especially when the branch contains new files under `src/data/movies`, platform changes from `Cine` to another label, or provider adjustments that add/remove `releasePlatforms`.

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
- `mainCast` sanity: enough credited principal performers for the title type, no duplicate names, and no obvious omission of award-winning acting recipients from the credited cast
- people pool coverage in `src/data/people.json` for every credited director/main cast member
- local cached portrait existence under `public/people/**`
- portrait source sanity so cached portraits are real headshots and not logos, posters, favicons or generic site assets
- birth date/year presence when it can be verified from public sources
- death year sanity for deceased people and implausibly old profiles
- primary nationality presence for every credited director/main cast member
- traceable profile presence for every credited director/main cast member (`IMDb`, `Wikidata`, `TMDb`, `Plex`, `Anime-Planet`, etc.)
- editorial recommendation completeness for `becauseYouLiked` and `related`
- editorial recommendation slugs that resolve to real movie entries
- raw HTML entities or scrape artifacts accidentally persisted into JSON fields
- `awards.wins` structure and supported award types
- `verdictLabel` sanity so the badge reads like a quality signal instead of metadata
- `verdictLabel` hard cap of `21` visible characters so the card badge never clips
- `verdictLabel` readability so the badge says clearly if the movie is buena, pasable o mala
- platform labels against the site allowlist
- `releasePlatform` / `releasePlatforms` consistency: no duplicates, max `2` labels total, `releasePlatform` preserved as primary, and `Stremio` kept exclusive
- Argentine audience title drift: `title` should reflect the name used in Argentina, while `originalTitle` keeps the source/original title
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
- official movie/distributor pages, JustWatch AR, official AR platform pages (including Mercado Play), IMDb, Rotten Tomatoes, Metacritic
- Argentine platform pages / IMDb Argentina release info when validating localized titles
- official award pages or reliable databases for Oscar/Cannes/Grammy wins

Do not invent trailers, awards, or platform data.
Do not invent birth dates, portraits, or IMDb links either.

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
- explicit confirmation that the people pool is complete for every credited director/main cast member in the audited batch, including nationality plus a traceable profile, and that any missing birth date or portrait is an explicit verified gap rather than fabricated data
- explicit confirmation that deceased people do not render as living ages and that animation/anime titles use original voice cast in `mainCast`
