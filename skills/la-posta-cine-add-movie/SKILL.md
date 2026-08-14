---
name: la-posta-cine-add-movie
description: Add one new La Posta Cine movie safely and efficiently from a plain-language request. Use for requests to publish a movie review in this repo; perform duplicate-first intake, evidence-led AR availability research, identity-safe bounded people enrichment, original AI-written copy, deterministic audit, and content-only validation without modifying site code.
---

# la-posta-cine-add-movie

Create one movie entry only. Work quietly; send one acknowledgement, then report only blockers, changed plans, or a final result.

## Scope

- Edit only `src/data/movies/**`, `src/data/people.json`, `public/people/**`, and generated catalog references. Never change UI, routes, styles, build config, workflow files, Share, Comunidad, or reaction assets for a movie load.
- Create a `feature/movie-<slug>` branch from an up-to-date `main`; never commit directly to `main`. Do not stash or overwrite unrelated changes.
- A correct slug automatically enables Share, Comunidad, ratings, recommendation blocks, and the verdict reaction. Do not create per-movie fields or external records for any of them.
- If title/year is ambiguous, ask one question before researching. Otherwise extract feedback, requested platform/premiere intent, and an explicit verdict label from the request.

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

Report the branch, file, validation results, the per-title platform evidence ledger with AR offer type, editorial source URLs, people/catalog changes, meter applicability, warnings that remain, and `git diff --name-only`. State explicitly that both editorial texts were written from scratch by AI and that no site-code/Share/Comunidad/reaction files changed. When publishing is explicitly requested, verify the pushed SHA, the workflow result and the live slugs before claiming success; then leave `main` clean and aligned with `origin/main`.

For an explicit request to publish to `main`, also wait for the matching GitHub Actions success and confirm the slug is present on the live site before claiming publication succeeded.
