---
name: la-posta-cine-add-movie
description: Add one or more La Posta Cine movie entries safely from a plain-language request. Use for single loads and explicit batches; perform duplicate-first intake, evidence-led AR availability research, identity-safe bounded people enrichment, original AI-written copy, deterministic trailer/content audits, and content-only validation without modifying site code.
---

# la-posta-cine-add-movie

Create one movie entry or an explicitly requested batch. Work quietly; send one acknowledgement, then report only blockers, changed plans, or a final result.

## Scope

- Edit only `src/data/movies/**`, `src/data/people.json`, `public/people/**`, and generated catalog references. Never change UI, routes, styles, build config, workflow files, Share, Comunidad, or reaction assets for a movie load.
- Create a `feature/movie-<slug>` branch from an up-to-date `main`; never commit directly to `main`. Do not stash or overwrite unrelated changes.
- A correct slug automatically enables Share, Comunidad, ratings, recommendation blocks, and the verdict reaction. Do not create per-movie fields or external records for any of them.
- If title/year is ambiguous, ask one question before researching. Otherwise extract feedback, requested platform/premiere intent, and an explicit verdict label from the request.

## Editorial filter: Guerra

- The home button is `Guerra`, but its source signal is the exact `Bélica` label in `genres`. Add `Bélica` only when the war, front, military operation or combat experience is central to the film; keep `category` as the primary lane and do not put this broad signal in `subgenres`.
- `Guerra` by itself is an inherited broad/context tag and does not activate the home filter. Never add `Bélica` from a title or a passing mention of conflict. Validate the complete premise and editorial text first.
- Include world wars, Vietnam and other conflicts or operations such as *Black Hawk Down* when the military conflict is the actual subject. Leave the tag out of romances, espionage or political dramas, comedies, science-fiction/superhero stories, and films where war is only the backdrop or historical setting.
- For an existing movie revalidation, preserve an intentional omission and flag the decision in the evidence ledger when the conflict is incidental. For a new true war film, add `Bélica` to `genres`, run the auditor, and confirm that the Guerra result includes the title without pulling in context-only entries.

## Anti-regression gates

- Begin with `npm run new-movie -- --title "<title>" --year <year> --dry-run --json`; do not create a file before the duplicate check passes. For a batch, repeat the check for every title and keep a candidate list instead of trusting memory or a search result.
- Keep a compact evidence ledger per title: `field -> URL -> verified fact`. For streaming sweeps, check every relevant AR provider (Netflix, HBO Max, Prime Video, Disney Plus, Paramount Plus, Apple TV, Crunchyroll, Mercado Play and `Otras plataformas`) and distinguish subscription from rent/buy. A Spain/US result, a studio brand, or an empty JustWatch result is not AR availability.
- Lock people only after comparing the exact credited name with `docs/person-profile-catalog-reference.md` and `src/data/people.json`. Verify an `imdbId` with two independent identity signals (name plus title/filmography, country or official profile); never persist the first search suggestion blindly.
- Before publication, visually inspect every new local portrait. It must be an identifiable individual, not a poster, logo, still, placeholder or ambiguous group photo. A cropped event/production photo is acceptable only when the source identifies the person and the crop/order is unambiguous; otherwise stop and report the missing portrait. Do not add children or incidental minors to `mainCast` merely to fill a quota or create a public profile for them.
- Run enrichment with the bounded strict mode, then run the people audit. The enrichment process has a 15-second request timeout by default and `--strict` fails on unresolved people, missing nationality, references or portraits; do not wait indefinitely or publish a partially enriched cache:

  ```bash
  npm run enrich-people -- --movie <slug> --strict
  npm run audit:movie-people -- --movie <slug>
  ```

- Missing birth data is a reported, verified gap when no trustworthy public source exposes it; never invent it to make the audit green. Missing identity, nationality, traceable reference or local portrait remains a hard stop.
- If the load also creates/updates a person profile, chain `la-posta-cine-add-person-profile` and apply its two-paragraph/originality/build gates before signing off the movie.

## Batch mode contract

Activate this section whenever the request says `batch`, `bulk`, `mínimo N`, `al menos N`, or asks for several movies.

- Freeze an explicit candidate manifest before writing. For every title, record `title`, `year`, `slug`, duplicate-check result, and the source URLs for AR availability, poster, trailer, awards, and people identity. Do not rely on a generated list, memory, or a search result as the final candidate set.
- Run `npm run new-movie -- --title "…" --original-title "…" --year YYYY --dry-run --json` for every candidate before creating any JSON; pass `--original-title` whenever the Argentine title differs from the source title. Stop the whole batch if any slug or normalized title/original-title + year already exists in the catalog or source files. A same title with a different year is not a duplicate, but record it explicitly for review.
- Create each starter with `npm run new-movie`; do not use an ad-hoc bulk generator that bypasses the repository template. If automation is used for repetitive fields, it must still leave every candidate auditable individually and must not invent metadata or copy editorial text.
- Resolve director and `mainCast` from verified billing before freezing the JSON. Never filter, delete, rename, or replace an unresolved credit merely to make strict enrichment pass. Replace a credit only after confirming a different principal credit from a source and record the decision; otherwise stop that candidate.
- Run strict people enrichment and `npm run audit:movie-people -- --movie <slug>` for every candidate in bounded chunks. Collect every failure and do not sign off a partial batch because another candidate passed.
- Run the candidate auditor **without** `--skip-youtube` before the build and again after every trailer change. A `youtube-title-mismatch`, `youtube-year-mismatch`, `youtube-search-mismatch`, or oEmbed error is a hard stop: replace the ID with a verified official/authoritative trailer and rerun. Use `--skip-youtube` only for the post-build route/reaction check, never as the first or only trailer validation.
- Distinguish external YouTube 3xx/timeouts from content errors: retry with the bounded auditor, keep the exact warning and source evidence in the ledger, and never convert a title/year mismatch into a warning just because search is blocked.
- Check every stored poster URL directly for HTTP success, image content type, usable dimensions, and vertical orientation; visually inspect any ambiguous source. A static URL pattern check alone is insufficient for a bulk load.
- Run the editorial audit over the complete manifest and perform a sentence-level duplicate pass across all reviews and synopses. A short, generic, recycled, or structurally interchangeable entry blocks the batch.
- Before commit, compare the manifest count with the number of files actually added, run the duplicate scan again against both `docs/movie-catalog-reference.md` and `src/data/movies`, and retain the exact candidate paths for the final auditor command.

## Low-token intake

Do not read catalog tables or batches of JSON into chat. Start with the dry run, which checks the source-of-truth files and returns a compact result:

```bash
npm run new-movie -- --title "<title>" --year <year> --dry-run --json
```

Stop with `La pelicula ya existe` if it reports a duplicate. When it passes, research in two bounded passes:

1. Open one official/distributor or authoritative metadata page and the official original-language trailer. Capture all film facts possible from those pages.
2. Open JustWatch AR for title + year. Open one official Argentina platform page only if the AR offer is unclear or conflicts. Open one specialized review source for editorial support.

Do not reopen sources merely to reconfirm facts. Keep an evidence ledger of compact `field → URL → fact` notes; pass only that ledger to chained skills. Read [movie-load-contract.md](references/movie-load-contract.md) only for the relevant unresolved area (platform, people, taxonomy, or editorial rules), not wholesale.

## Create and enrich

Create the starter only after the intake passes:

```bash
npm run new-movie -- --title "<title>" --year <year> --slug <slug>
```

Fill the template with verified data. Follow the contract for field semantics, Argentine naming/platforms, taxonomy, people, awards, recommendations, posters, trailers, and meters.

Mandatory editorial rule: write `synopsis` and `review` 100% from scratch with AI for this exact movie. Sources may establish facts and reception but are never draft material: do not copy, translate, close-paraphrase, synonym-swap, or reshape source copy. Do not use reusable scaffolds, sentence skeletons, verdict-led openings/closings, or recycled paragraphs. If it could fit another title after changing a name, rewrite it.

Before person research, consult the compact person-profile catalog and `people.json`; preserve existing canonical names and data. Then run:

```bash
npm run enrich-people -- --movie <slug> --strict
npm run audit:movie-people -- --movie <slug>
```

If the final label is `Cine`, invoke `la-posta-cine-cartelera-revalidator` before the audit. For any final platform, invoke `la-posta-cine-auditor` with the candidate path and compact evidence ledger.

## Gate

Run the candidate checks; they enforce schema, originality, people, taxonomy, generated route/reaction, carousel eligibility, and forbidden content fields:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate src/data/movies/<slug>.json
npm run catalog:movies
npm run catalog:movies:check
npm run update-upcoming-releases
npm run check
npm run audit:movie-people -- --movie <slug>
npm run validate:content
npm run build
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate src/data/movies/<slug>.json --skip-youtube --verify-community-build --verify-reaction-build --verify-cinema-carousel-build --verify-streaming-carousel-build
npm run validate:public-output
npm run validate:sitemap-indexability
git diff --check
git diff --name-only
```

Abort rather than repair site code when a check fails. Confirm every changed file is in scope, inspect the focused diff, then stage only the allowed change set. Commit/push only if the user requested publishing; otherwise leave the validated branch ready for review.

## Final response

Report the branch, file or batch count, explicit candidate paths, validation results, the per-title platform evidence ledger with AR offer type, editorial source URLs, trailer oEmbed/search status, people/catalog changes, meter applicability, and warnings that remain. State explicitly that both editorial texts were written from scratch by AI and that no site-code/Share/Comunidad/reaction files changed. For a batch, distinguish files added in this run from inherited files and report any same-title/different-year neighbor. When publishing is explicitly requested, verify the pushed SHA, the workflow result and the live slugs before claiming success; then leave `main` clean and aligned with `origin/main`.

For an explicit request to publish to `main`, also wait for the matching GitHub Actions success and confirm the slug is present on the live site before claiming publication succeeded.
