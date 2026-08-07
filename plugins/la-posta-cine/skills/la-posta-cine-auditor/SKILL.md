---
name: la-posta-cine-auditor
description: Audit recent or revalidated La Posta Cine movie JSON files for deterministic content integrity, original AI-written editorial copy, people completeness, taxonomy, Argentine platforms, generated output, catalog sync, and safe diff scope. Use after movie adds, backfills, or platform changes without modifying site code.
---

# la-posta-cine-auditor

Use the bundled audit as the primary signal. Work quietly and edit only movie data, people cache/portraits, and generated catalogs; never auto-fix site code.

## Compact flow

1. Prefer explicit candidates. Use branch-recent discovery only when paths are unavailable:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <path> --format json
```

Do not read whole catalogs or manually repeat passing checks. For each failure, open only the target JSON and the source needed to fix it.

2. Treat these as hard stops: malformed schema; unverified/missing AR platform; invalid poster/trailer; missing current-year release date; bad people provenance; incorrect broad/subgenre taxonomy; unsupported awards; manual Share/reaction/meter fields; bad recommendation slugs; stale catalog; and any forbidden diff.

3. Editorial originality is a hard stop. Every `synopsis` and `review` must be 100% AI-written from scratch for its movie: source material can establish facts, never supply prose. Reject copied, translated, close-paraphrased, template-shaped, verdict-led, recycled, or interchangeable copy. The audit script's duplicate and marker findings require a rewrite, not a waiver.

4. If a candidate claims `Cine` without same-run live verification, invoke `la-posta-cine-cartelera-revalidator` before sign-off. For external evidence retain only `field → URL → fact`, with JustWatch AR first and official AR source only when needed.

5. After safe fixes, run:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <path>
npm run catalog:movies
npm run validate:content
npm run build
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <path> --skip-youtube --verify-community-build --verify-reaction-build --verify-cinema-carousel-build --verify-streaming-carousel-build
git diff --name-only
```

Report candidate paths, failures/fixes, platform evidence, validations, and explicit confirmation that source copy was not reused and no forbidden paths changed.
