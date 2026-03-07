---
name: la-posta-cine-auditor
description: Audit recently added La Posta Cine movie entries after `la-posta-cine-add-movie` or any bulk/backfill load. Use when Codex needs to verify newly added `src/data/movies/*.json` files in Clovhis/sucuplecuc for schema correctness, trailer validity, review quality, awards structure, platform labels, catalog sync, and safe diff scope before or after publishing.
---

# la-posta-cine-auditor

Audit a recent movie batch without touching site code.

## Scope

Use this skill after a movie add/backfill workflow, especially when the branch contains new files under `src/data/movies`.

Allowed fix paths:

- `src/data/movies/**`
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
- `awards.wins` structure and supported award types
- platform labels against the site allowlist
- catalog sync in `docs/movie-catalog-reference.md`
- trailer format and YouTube oEmbed reachability
- raw numeric score leakage in reviews
- editorial duplication by delegating to `skills/la-posta-cine-add-movie/scripts/review_audit.js`

### 3. Interpret findings

- `ERROR`: fix before considering the batch valid
- `WARN`: inspect and fix if confidence is high

If a finding depends on external truth, verify it with primary or trustworthy sources before editing:

- official YouTube channels for trailers
- official movie/distributor pages, JustWatch AR, IMDb, Rotten Tomatoes, Metacritic
- official award pages or reliable databases for Oscar/Cannes/Grammy wins

Do not invent trailers, awards, or platform data.

### 4. Safe fix loop

If the script reports fixable issues:

1. Edit only affected movie JSON files and, if needed, `docs/movie-catalog-reference.md`
2. Re-run the auditor
3. Run `npm run build`
4. Confirm no forbidden path changed

### 5. Output

Report:

- audited candidate list
- errors and warnings
- fixes applied, if any
- final revalidation status
- explicit statement that no forbidden path was modified
