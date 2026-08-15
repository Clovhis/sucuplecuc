---
name: la-posta-cine-auditor
description: Audit recent, revalidated, or bulk-loaded La Posta Cine movie JSON files for deterministic duplicate/content integrity, identity-safe people enrichment, original AI-written editorial copy, Argentine platforms, trailer validity, generated output, catalog sync, and safe diff scope. Use after movie adds, backfills, or platform changes without modifying site code.
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

   Before interpreting the bundled output, run `npm run audit:movie-people -- --movie <slug>`. Missing local portrait, nationality, traceable reference or an unresolved identity is an error. Missing public birth data is a warning only when the gap is real and is not filled with an invented date.

3. Editorial originality is a hard stop. Every `synopsis` and `review` must be 100% AI-written from scratch for its movie: source material can establish facts, never supply prose. Reject copied, translated, close-paraphrased, template-shaped, verdict-led, recycled, or interchangeable copy. The audit script's duplicate and marker findings require a rewrite, not a waiver.

4. If a candidate claims `Cine` without same-run live verification, invoke `la-posta-cine-cartelera-revalidator` before sign-off. For external evidence retain only `field → URL → fact`, with JustWatch AR first and official AR source only when needed.

   For a platform batch, require an evidence matrix covering every relevant AR provider and the offer type (`FLATRATE`, `RENT` or `BUY`). Never accept a provider inferred from a global page, another country, a studio, a franchise or an empty search result.

   For a batch, require an explicit candidate manifest and compare it with the actual added/modified movie files. Run the duplicate check against both the generated catalog reference and all source JSON files; same normalized title plus year or same slug is an error, while same title with a different year must be reported as a deliberate neighbor.

   Do not accept a cast filtered down after enrichment failures. Audit the verified billing choice, resolve every retained director/main-cast name, and stop the affected candidate when an identity is unresolved instead of deleting the credit to make the people audit green.

   The first trailer audit must run with YouTube checks enabled. `--skip-youtube` is allowed only after a successful no-skip audit and build, for route/reaction validation. Title/year mismatch, wrong-title match, or oEmbed failure remains an error; transient 3xx/timeouts may be reported as external warnings only after bounded retry.

5. After safe fixes, run:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <path>
npm run check
npm run catalog:movies
npm run catalog:movies:check
npm run update-upcoming-releases
npm run validate:content
npm run build
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <path> --skip-youtube --verify-community-build --verify-reaction-build --verify-cinema-carousel-build --verify-streaming-carousel-build
npm run validate:public-output
npm run validate:sitemap-indexability
git diff --check
git diff --name-only
```

Report candidate paths, failures/fixes, platform evidence matrix, people-audit result, validations, and explicit confirmation that source copy was not reused and no forbidden paths changed. Do not hide nonblocking birth-date or image-host warnings: classify them and link them to the evidence ledger. If publication was requested, verify the remote SHA/workflow/live slug and finish on a clean synchronized `main`.

For a batch, pass every candidate explicitly; do not let an untracked-file glob silently decide the audit set. Keep the same list for the pre-build no-skip audit and the post-build route audit, and report agreement between manifest count, source-file count, and audited candidate count.
