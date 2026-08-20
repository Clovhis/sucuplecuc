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

2. Treat these as hard stops: malformed schema; unverified/missing AR platform; invalid poster/trailer; missing current-year release date; bad people provenance; incorrect broad/subgenre taxonomy; an invalid `Bélica` war-filter tag; unsupported awards; manual Share/reaction/meter fields; bad recommendation slugs; stale catalog; and any forbidden diff.

   The bundled audit now verifies the exact stored `poster` URL at the byte level. It follows redirects, requires an accepted `2xx` response and `image/*` content type, parses dimensions, and rejects unavailable (`401/403/404`), non-image, unparseable, or horizontal assets. It uses bounded retries/backoff, per-host concurrency and host spacing; exhausted `429/5xx` or timeout failures remain explicit external warnings. A URL-pattern check alone is not a poster audit.

   For the home `Guerra` filter, `Bélica` must be an exact value in `genres`, never a `subgenres` value. A broad `Guerra` tag without `Bélica` produces a deliberate-review finding: decide from the premise and copy whether the conflict is central (add `Bélica`) or only contextual (leave it out and retain the evidence-led omission). Do not approve a `Bélica` tag that is supported only by a title or an incidental war reference; do not use it for *El planeta de los simios*-style non-war stories.

   Before interpreting the bundled output, run `npm run audit:movie-people -- --movie <slug>`. Missing local portrait, nationality, traceable reference or an unresolved identity is an error. Missing public birth data is a warning only when the gap is real and is not filled with an invented date.

3. Editorial originality is a hard stop. Every `synopsis` and `review` must be 100% AI-written from scratch for its movie: source material can establish facts, never supply prose. Reject copied, translated, close-paraphrased, template-shaped, verdict-led, recycled, or interchangeable copy. The audit script's duplicate and marker findings require a rewrite, not a waiver.

4. If a candidate claims `Cine` without same-run live verification, invoke `la-posta-cine-cartelera-revalidator` before sign-off. For external evidence retain only `field → URL → fact`, with JustWatch AR first and official AR source only when needed.

   For a platform batch, require an evidence matrix covering every relevant AR provider and the offer type (`FLATRATE`, `RENT` or `BUY`). Never accept a provider inferred from a global page, another country, a studio, a franchise or an empty search result.

   For a batch, require an explicit candidate manifest and compare it with the actual added/modified movie files. Run the duplicate check against both the generated catalog reference and all source JSON files; same normalized title plus year or same slug is an error, while same title with a different year must be reported as a deliberate neighbor.

   Do not accept a cast filtered down after enrichment failures. Audit the verified billing choice, resolve every retained director/main-cast name, and stop the affected candidate when an identity is unresolved instead of deleting the credit to make the people audit green.

   The first trailer audit must run with YouTube checks enabled. `--skip-youtube` is allowed only after a successful no-skip audit and build, for route/reaction validation. Title/year mismatch, wrong-title match, or oEmbed failure remains an error; transient 3xx/timeouts may be reported as external warnings only after bounded retry.

   Poster identity and market are manual evidence gates in addition to byte validation: a successful URL, filename, search-result position, or Spanish text does not prove the film, year, language, or Argentina suitability. Require a canonical page naming the movie/year plus visual comparison. Keep neutral/original art when the Argentine localization is uncertain, and do not replace every Spanish-looking poster automatically.

5. After safe fixes, run:

```bash
node skills/la-posta-cine-auditor/scripts/verify_posters.cjs --candidate <path>
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

After `npm run build`, use Playwright on the actual movie route(s), scrolling each poster into view and asserting `complete`, exact `currentSrc` (or the expected final redirect), `naturalWidth > 0`, and `naturalHeight > naturalWidth`. For a batch, report the explicit manifest count and the browser `total/loaded/bad` result; source inspection or an HTTP status alone is not sufficient.

The same candidate list must also be checked for the `Guerra` filter. Confirm that every intentional `Bélica` inclusion is rendered by the `guerra` catalog facet and that context-only titles remain excluded; do not fix a taxonomy finding by editing site code.

Report candidate paths, failures/fixes, platform evidence matrix, people-audit result, validations, and explicit confirmation that source copy was not reused and no forbidden paths changed. Do not hide nonblocking birth-date or image-host warnings: classify them and link them to the evidence ledger. If publication was requested, verify the remote SHA/workflow/live slug and finish on a clean synchronized `main`.

For a batch, pass every candidate explicitly; do not let an untracked-file glob silently decide the audit set. Keep the same list for the pre-build no-skip audit and the post-build route audit, and report agreement between manifest count, source-file count, and audited candidate count.

When candidates are uncommitted, do not rely on `npm run validate:content` or `git diff <base>...HEAD` to discover them: those checks can see zero changed movie files until a commit exists. Preserve the explicit working-tree manifest. For poster-only revalidation, capture the baseline auditor findings first and distinguish inherited trailer/content errors from regressions introduced by the candidate; inherited errors remain visible but do not get silently “fixed” by changing unrelated fields.
