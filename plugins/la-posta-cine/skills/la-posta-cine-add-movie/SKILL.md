---
name: la-posta-cine-add-movie
description: Add one new La Posta Cine movie safely and efficiently from a plain-language request. Use for requests to publish a movie review in this repo; perform a compact duplicate-first intake, targeted AR availability research, original AI-written synopsis/review, people enrichment, deterministic audit, and content-only validation without modifying site code.
---

# la-posta-cine-add-movie

Create one movie entry only. Work quietly; send one acknowledgement, then report only blockers, changed plans, or a final result.

## Scope

- Edit only `src/data/movies/**`, `src/data/people.json`, `public/people/**`, and generated catalog references. Never change UI, routes, styles, build config, workflow files, Share, Comunidad, or reaction assets for a movie load.
- Create a `feature/movie-<slug>` branch from an up-to-date `main`; never commit directly to `main`. Do not stash or overwrite unrelated changes.
- A correct slug automatically enables Share, Comunidad, ratings, recommendation blocks, and the verdict reaction. Do not create per-movie fields or external records for any of them.
- If title/year is ambiguous, ask one question before researching. Otherwise extract feedback, requested platform/premiere intent, and an explicit verdict label from the request.

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
npm run enrich-people -- --movie <slug>
```

If the final label is `Cine`, invoke `la-posta-cine-cartelera-revalidator` before the audit. For any final platform, invoke `la-posta-cine-auditor` with the candidate path and compact evidence ledger.

## Gate

Run the candidate checks; they enforce schema, originality, people, taxonomy, generated route/reaction, carousel eligibility, and forbidden content fields:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate src/data/movies/<slug>.json
npm run catalog:movies
npm run validate:content
npm run build
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate src/data/movies/<slug>.json --skip-youtube --verify-community-build --verify-reaction-build --verify-cinema-carousel-build --verify-streaming-carousel-build
git diff --name-only
```

Abort rather than repair site code when a check fails. Confirm every changed file is in scope, inspect the focused diff, then stage only the allowed change set. Commit/push only if the user requested publishing; otherwise leave the validated branch ready for review.

## Final response

Report the branch, file, validation results, platform decision with AR evidence URL and offer type, editorial source URL, people/catalog changes, meter applicability, and `git diff --name-only`. State explicitly that both editorial texts were written from scratch by AI and that no site-code/Share/Comunidad/reaction files changed.

For an explicit request to publish to `main`, also wait for the matching GitHub Actions success and confirm the slug is present on the live site before claiming publication succeeded.
