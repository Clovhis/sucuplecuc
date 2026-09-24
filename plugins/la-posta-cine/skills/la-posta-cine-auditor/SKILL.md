---
name: la-posta-cine-auditor
description: Audit recent, revalidated, or bulk-loaded La Posta Cine movie JSON files, including public-source verification and normalization of each candidate's Cine Posta 1–10 score, duplicate/content integrity, local WebP posters, people provenance, original copy, Argentine platforms, trailers, generated output, catalog sync, and safe diff scope.
---

# la-posta-cine-auditor

Use the bundled audit as the primary signal. Work quietly and edit only movie data, people cache/portraits, and generated catalogs; never auto-fix site code. Verify every explicit candidate's `cinepostaScore` against current public rating evidence using the protocol below. The only code exception is an explicit user request for a title-specific editorial-meter score: keep that score in the central meter override map plus a regression test, never in movie JSON.

## Compact flow

1. Prefer explicit candidates. Use branch-recent discovery only when paths are unavailable:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <path> --format json
```

Do not read whole catalogs or manually repeat passing checks. For each failure, open only the target JSON and the source needed to fix it.

2. Treat these as hard stops: malformed schema; a required candidate without an integer `cinepostaScore` from 1 to 10 after score research, a score that conflicts with the highest-priority available source, or a custom score label; missing or non-canonical movie nationality; unverified/missing AR platform; invalid poster/trailer; missing current-year release date; unverified movie credits; fewer than one verified director plus two verified principal actors/performers; incorrect broad/subgenre taxonomy; an invalid `Bélica` war-filter tag; unsupported awards; manual Share/reaction/meter fields; bad recommendation slugs; stale catalog; and any forbidden diff. Nationality, birth data and a standalone people profile are not movie-level requirements. Exactly one director plus two retained principal actors/performers is sufficient; the auditor must not impose a hidden three-performer minimum.

## Public score evidence

For every explicit new, changed, or revalidated movie candidate, independently verify a current public rating for the exact film and year; do not treat the JSON value or a previous task's score as its own evidence. Search in this order:

1. Rotten Tomatoes Popcornmeter/Audience Score.
2. If RT has no usable numeric audience score, continue searching public audience aggregates such as IMDb, TMDb, Letterboxd, Filmweb and Metacritic User Score. Check for these before selecting any critics' metric, even when RT already shows a Tomatometer.
3. Only when no title-matched public audience aggregate has a numeric score, use Rotten Tomatoes Tomatometer, then Metacritic Metascore or another public critic aggregate.
4. If no public aggregate publishes a numeric score, use a named professional critic's explicit numerical review rating as the final fallback and label it as one critic's rating, not an audience consensus. Never calculate an average from a handful of visible reviews. Treat an RT audience status such as “Fewer than 50 Verified Ratings” without a displayed percentage as unavailable; continue through audience sources before checking critics.

Convert percentage/0–100 scores with `clamp(1, 10, round(value / 10))`, 0–5 scores with `clamp(1, 10, round(value × 2))`, and 0–10 scores with `clamp(1, 10, round(value))`. Store the resulting integer only in `cinepostaScore`; the canonical text label is derived by the site. Do not average sources, cherry-pick among sources, infer a number from Fresh/Rotten, a review's adjectives, or editorial opinion, or use the rating for another version/region/year. Record `source URL → exact raw score, rating type, vote count and scale → retrieval date → calculation → stored score` in the evidence ledger/report. The audit must be able to reproduce the stored integer from that entry. If the full sequence yields no verifiable numeric rating, keep the field unset and report it as unresolved; never fabricate a value or silently waive a required-score validation error.

   Movie `country` is required and represents verified production nationality: use a comma-and-space separated ISO 3166-1 alpha-2 list (`MY`; `AR, ES` for a coproduction), never free text. Keep `country → canonical source URL → verified production-country fact` in the evidence ledger. Reject an inferred country based on setting, language, cast/director citizenship, distributor or platform territory. The UI derives the Spanish label and small local SVG flag from the codes, so movie JSON must not carry flag URLs, emoji or presentation-only fields. Treat a missing `public/images/flags/<iso>.svg` asset as an error; run `npm run flags:sync` before sign-off.

   The bundled audit verifies the local `poster` asset at the byte level. It requires `assets/posters/<año>/<slug>.webp` (or the explicit local fallback), an existing regular file below `public/`, parseable WebP bytes, portrait dimensions no greater than 480x720 and no more than 100 KiB. The 40–80 KiB band is reported as an optimization warning. An external URL, missing file, non-WebP resource, traversal attempt or horizontal asset is a hard error. Before auditing a new title, run `npm run posters:localize -- --movie <slug>` after validating source artwork of at least 720x1000; the localizer rejects smaller sources instead of upscaling them.

   For the home `Guerra` filter, `Bélica` must be an exact value in `genres`, never a `subgenres` value. A broad `Guerra` tag without `Bélica` produces a deliberate-review finding: decide from the premise and copy whether the conflict is central (add `Bélica`) or only contextual (leave it out and retain the evidence-led omission). Do not approve a `Bélica` tag that is supported only by a title or an incidental war reference; do not use it for *El planeta de los simios*-style non-war stories.

   Before interpreting the bundled output, run `npm run audit:movie-people -- --movie <slug>`. The movie-level hard gate is one verified director and at least two verified principal actors/performers. The verified billing and public evidence must support those credits; person-profile availability is checked separately. If no safe `people.json` profile can be built because identity evidence, a traceable reference or a portrait is insufficient, keep the verified movie credit, do not create a placeholder/partial person entry, and report the profile omission as a warning. `nationalityPrimary` is optional: search for it, store it only when a public source explicitly supports it, otherwise leave the property absent and warn. Missing or unverified birth data is also a warning and must not be invented; the UI must omit the birth/age line entirely and must not render a generic missing-data fallback. If a person entry is present, still validate any supplied portrait path and sourced fields for integrity. Unverified central movie credits or fewer than two verified principal actors/performers remain hard stops.

## Full-catalog genre review

When the request says `total`, `todo el catálogo`, `full catalog` or equivalent, run `audit_recent_movies.cjs --all` and record the candidate count; do not substitute a recent-branch audit. The bundled auditor establishes structural coherence, but it cannot prove that the primary genre is semantically correct. Add a compact semantic matrix with `slug/title/year`, current `category`, `genres`, synopsis/review signals, trustworthy source URL and proposed category/confidence.

- Treat `category` as the primary editorial lane, not as the first item in `genres` and not as a value chosen to activate a meter. A category may coexist with secondary genres, but it must agree with the film's narrative/marketing framing and medium.
- Prioritize high-confidence contradictions: live action in `Animacion`/`Anime`, a documentary or making-of special in a fiction lane, or a title whose authoritative genre framing and own synopsis/review clearly point to another primary lane. Do not mass-fill optional `genres`, normalize every title to the first external genre, or rewrite an intentional ambiguous classification from a weak signal.
- For every accepted correction, update `category` and supporting `genres` coherently, preserve intentional `subgenres` blanks, and re-check meter priority. Secondary `genres` never activate a meter and a meter request never justifies a wrong category.
- If the user explicitly supplies a score for a named movie, verify the category first, then add only a bounded slug-based entry to the relevant central `src/lib/*metro.ts` override map and a regression assertion in `scripts/editorial-meters.test.mjs`. Never add a per-movie score field.

Large `--all` passes can spend most of their time on sequential third-party YouTube checks. After bounded retry, classify those timeouts as external findings and complete the deterministic catalog pass with `--all --skip-youtube`; retain the no-skip result for trailer evidence and do not downgrade title/year mismatches.

3. Editorial originality is a hard stop. Every `synopsis` and `review` must be 100% AI-written from scratch for its movie: source material can establish facts, never supply prose. Reject copied, translated, close-paraphrased, template-shaped, score-label-led, recycled, or interchangeable copy. A canonical score label rendered mechanically in review prose—especially forms like `MUY BUENA:`, `EXCELENTE:`, `OBRA MAESTRA:` or `<score label> porque`—is a template finding even if the preceding sentences are otherwise specific. The audit script's duplicate and marker findings require a rewrite, not a waiver.

`editorial.tenSecondTake` is a seven-field hard gate for every explicit candidate: `verdict`, `whatToExpect`, `pace`, `intensity`, `practicalContext`, `forFansOf`, and `notForYouIf`. Audit every field for presence, usable length, exact reuse across the catalog, repeated text inside the same movie, generic legacy markers, copied canonical score labels, and at least two title/director/cast anchors across the block. Read the block as criticism: reject a technically complete guide when it is interchangeable, merely converts metadata into prose, repeats a generic recommendation, or contradicts the film. Historical files lacking this new block are reported as migration gaps in a broad scan; do not auto-fill them. Use `--require-ten-second-take` only for an explicitly authorized backfill gate.

Audit the reasoning as well as the wording: the review needs a title-specific critical angle and a grounded judgment about its filmmaking, performances, construction, imagery, sound, genre use or context. It may use Argentine Rioplatense voice, but must not collapse into stock “plan” advice, an interchangeable genre adjective, or a metadata-shaped sign-off. There is no authorized automatic review generator: each review must be drafted uniquely for its film.

## De culto sticker integrity

- Treat `CULT_MOVIE_SLUGS` / `isCultMovie` in `src/lib/movies.ts` as the sole source of truth for the `De culto` facet and sticker eligibility. Do not accept a movie as cult from a broad genre or a manual JSON flag alone.
- Every curated cult movie is required to render `public/DeCulto.png` in the movie-card and detail-poster surfaces, with `alt="De culto"`, the same size as `Absolute Cinema`, no rotation, right alignment, and a base 10% above `Absolute Cinema`. This is an audit gate, not a cosmetic optional.
- After the build, use browser checks on at least one cult route in every affected responsive profile to prove the asset loads, “De culto” is readable, the sticker stays right/straight, and it does not overlap `Absolute Cinema`. Check the filtered home cards as well when the candidate is part of a load.
- A curated cult movie without the sticker is an `ERROR`; a non-curated movie with the sticker is also an `ERROR`. Do not repair this by adding per-movie sticker fields or image paths to JSON. If the curated membership is wrong or missing, report the taxonomy/site-code gap and require the source-list change before sign-off.

4. If a candidate claims `Cine` without same-run live verification, invoke `la-posta-cine-cartelera-revalidator` before sign-off. For external evidence retain only `field → URL → fact`, with JustWatch AR first and official AR source only when needed.

   For a platform batch, require an evidence matrix covering every relevant AR provider — including Flow — and the offer type (`FLATRATE`, `RENT` or `BUY`). Never accept a provider inferred from a global page, another country, a studio, a franchise or an empty search result. JustWatch Argentina does not expose Flow as an indexed provider, so the generic JustWatch audit cannot confirm or reject a Flow claim: require title-specific evidence from Flow/Personal Argentina or a current Argentina-specific Flow release communication, and record the URL and verification date. Do not treat HBO, Paramount+, Disney+ or Netflix content surfaced inside a Flow bundle as native Flow availability. If Flow is the only claimed provider, classify the generic JustWatch result as requiring manual Flow evidence rather than as a mismatch.

   For a batch, require an explicit candidate manifest and compare it with the actual added/modified movie files. Run the duplicate check against both the generated catalog reference and all source JSON files; same normalized title plus year or same slug is an error, while same title with a different year must be reported as a deliberate neighbor.

   Do not accept arbitrary cast thinning or silent credit replacement. Audit the complete verified billing choice, then keep at least two principal actors/performers in `mainCast`; the movie also needs one verified director. A director counts as a performer only when sources establish an on-screen acting/participant role. This exact floor is sufficient; no third performer or completed people profile is required. For optional obscure credits, omit an unverified movie credit; for a verified credit whose personal profile lacks sufficient public identity/portrait data, keep the credit and omit the person record. Record each omission/exclusion and evidence searched. Never omit a verified lead/co-lead, central marketing face, acting-award recipient or a required credit in a way that drops below the movie-level floor.

   The first trailer audit must run with YouTube checks enabled. `--skip-youtube` is allowed only after a successful no-skip audit and build, for route/reaction validation. Title/year mismatch, wrong-title match, or oEmbed failure remains an error; transient 3xx/timeouts may be reported as external warnings only after bounded retry.

   Poster identity, market and visual quality are manual evidence gates before localization: a successful source URL, filename, search-result position, or Spanish text does not prove the film, year, language, Argentina suitability, or usable quality. Require a canonical page naming the movie/year plus full-size visual comparison before and after localization. Reject blur, heavy compression, pixelation, upscales, watermarks, third-party logos, country flags/maps, promotional badges, corner overlays, stills and cropped title cards. The localized poster must remain sharp/readable at 480px width. Keep neutral/original art when Argentine localization is uncertain.

   `cinesargentinos.com.ar` and every subdomain are forbidden poster-image sources because their poster endpoints have baked an Argentine flag/map into the lower-right corner. Require `npm run test:poster-source-policy`; a `blocked-poster-source` or `low-resolution-poster-source` result is a hard stop. The domain may still be used for current Argentine theatrical evidence, never as artwork provenance.

5. After safe fixes, run:

```bash
npm run posters:localize -- --movie <slug>
npm run test:poster-source-policy
node skills/la-posta-cine-auditor/scripts/verify_posters.cjs --candidate <path>
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <path>
npm run check
npm run test:editorial-meters
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

After `npm run build`, use Playwright on the actual movie route(s), scrolling each poster into view and asserting `complete`, exact local `currentSrc`, `naturalWidth > 0`, and `naturalHeight > naturalWidth`. For a batch, report the explicit manifest count and the browser `total/loaded/bad` result; source inspection or an HTTP status alone is not sufficient.

The same candidate list must also be checked for the `Guerra` filter. Confirm that every intentional `Bélica` inclusion is rendered by the `guerra` catalog facet and that context-only titles remain excluded; do not fix a taxonomy finding by editing site code.

Report candidate paths, total-catalog count when applicable, the semantic genre matrix and confidence decisions, failures/fixes, platform evidence matrix, retained people-audit result, intentionally omitted optional credits with reasons/evidence, validations, and explicit confirmation that source copy was not reused and no forbidden paths changed. Do not hide nonblocking birth-date or image-host warnings: classify them and link them to the evidence ledger, while confirming that missing birth data produces no person-card/profile placeholder. If publication was requested, verify the remote SHA/workflow/live slug and finish on a clean synchronized `main`.

For a batch, pass every candidate explicitly; do not let an untracked-file glob silently decide the audit set. Keep the same list for the pre-build no-skip audit and the post-build route audit, and report agreement between manifest count, source-file count, and audited candidate count.

When candidates are uncommitted, do not rely on `npm run validate:content` or `git diff <base>...HEAD` to discover them: those checks can see zero changed movie files until a commit exists. Preserve the explicit working-tree manifest. For poster-only revalidation, capture the baseline auditor findings first and distinguish inherited trailer/content errors from regressions introduced by the candidate; inherited errors remain visible but do not get silently “fixed” by changing unrelated fields.
