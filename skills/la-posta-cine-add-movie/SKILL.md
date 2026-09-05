---
name: la-posta-cine-add-movie
description: Add one or more La Posta Cine movie entries safely from a plain-language request. Use for single loads and explicit batches; perform duplicate-first intake, evidence-led AR availability research, identity-safe bounded people enrichment, original AI-written copy, deterministic trailer/content audits, and content-only validation without modifying site code.
---

# la-posta-cine-add-movie

Create one movie entry or an explicitly requested batch. Work quietly; send one acknowledgement, then report only blockers, changed plans, or a final result.

## Scope

- Edit only `src/data/movies/**`, `src/data/people.json`, `public/people/**`, and generated catalog references. Never change UI, routes, styles, build config, workflow files, Share, Comunidad, or reaction assets for a movie load. A title-specific meter score explicitly requested by the user is the sole code exception: update only the central `src/lib/*metro.ts` override map and its regression test, never a per-movie meter field.
- Create a `feature/movie-<slug>` branch from an up-to-date `main`; never commit directly to `main`. Do not stash or overwrite unrelated changes.
- A correct slug automatically enables Share, Comunidad, ratings, recommendation blocks, and the verdict reaction. Do not create per-movie fields or external records for any of them.
- If title/year is ambiguous, ask one question before researching. Otherwise extract feedback, requested platform/premiere intent, and an explicit verdict label from the request.

## Política canónica para retratos locales

Esta política aplica a toda alta o reemplazo bajo `public/people/**`: retratos descargados por `enrich-people`, correcciones manuales del caché `people.json` y retratos que también vayan a usarse como `profileImage` en un perfil extendido.

- `enrich-people` ya invoca el optimizador canónico para cada descarga. No lances otra pasada global sólo porque se ejecutó el enriquecimiento: primero revisá `git status --short -- public/people`. Si hay una alta o reemplazo (`A`, `M` o `??`) corré la pasada canónica para cubrir también copias/manuales y actualizar referencias si cambia una extensión:

  ```bash
  npm run images:people:optimize
  ```

- No reimplementes conversiones, límites, compresión, limpieza de metadata ni actualización de referencias con scripts ad hoc o llamadas directas a `sharp`: `images:people:optimize` es la única fuente de verdad. `npm run images:people:check` se corre siempre al final como hard gate global; un exit code distinto de cero impide dar por terminada la carga, incluso si el auditor de personas pasó.
- Esta regla sólo abarca archivos locales de personas. La política de posters externos de películas no cambia: no los descargues, conviertas ni optimices como parte de este paso; seguí usando `verify_posters.cjs` con la URL externa guardada.

## Editorial filter: Guerra

- The home button is `Guerra`, but its source signal is the exact `Bélica` label in `genres`. Add `Bélica` only when the war, front, military operation or combat experience is central to the film; keep `category` as the primary lane and do not put this broad signal in `subgenres`.
- `Guerra` by itself is an inherited broad/context tag and does not activate the home filter. Never add `Bélica` from a title or a passing mention of conflict. Validate the complete premise and editorial text first.
- Include world wars, Vietnam and other conflicts or operations such as *Black Hawk Down* when the military conflict is the actual subject. Leave the tag out of romances, espionage or political dramas, comedies, science-fiction/superhero stories, and films where war is only the backdrop or historical setting.
- For an existing movie revalidation, preserve an intentional omission and flag the decision in the evidence ledger when the conflict is incidental. For a new true war film, add `Bélica` to `genres`, run the auditor, and confirm that the Guerra result includes the title without pulling in context-only entries.

## Editorial filter: De culto and mandatory sticker

- The `De culto` facet is a curated editorial classification backed by exact slug membership in `CULT_MOVIE_SLUGS` / `isCultMovie` from `src/lib/movies.ts`; do not infer it from a broad genre, a title, or a passing cult reference.
- Every movie included in that curated source must render the transparent `public/DeCulto.png` sticker in both movie cards and the movie detail poster. It must remain the same size as `Absolute Cinema`, stay straight, sit on the right side, and have its base 10% above the `Absolute Cinema` sticker so the two never overlap.
- Never add `sticker`, `cultSticker`, `isCult`, an image path, or an equivalent per-movie field to JSON. Sticker rendering is derived from the shared curated source and must use the readable `De culto` alt label.
- When a requested cult title is not in the curated source, treat it as a taxonomy/site-code gap: do not publish it as a complete cult load until the curated source is explicitly updated, then rerun the auditor and browser route checks. A non-cult title must not receive the sticker.
- For every cult candidate, after the build verify the actual card/detail route in a browser: `/DeCulto.png` loads, `alt="De culto"` is present, the sticker is right-aligned and straight, its readable label is visible, and it does not overlap `Absolute Cinema` at desktop or mobile widths.

## Primary genre semantics

- Treat `category` as the primary editorial lane. It is not automatically the first `genres` value, and it must never be selected only to make Lagrimómetro, Jajámetro, Cagazómetro or Explosiómetro appear.
- Before creating or revalidating a title, record `category`, supporting `genres`, the synopsis/review signals, and one trustworthy source for the film's framing. Use the source plus the film's actual narrative and medium to decide the primary lane.
- Correct high-confidence contradictions such as live action classified as `Animacion`/`Anime`, a documentary or making-of special classified as fiction, or a source-and-copy consensus that clearly identifies another primary lane. Preserve ambiguous but defensible choices; do not mass-fill optional `genres` or normalize every title to the first external genre.
- When a correction is approved, change `category` and supporting `genres` together, preserve intentional `subgenres` blanks, and rerun the full candidate audit. Secondary genres can improve precision but never activate a meter.
- For a request to review the complete catalog, freeze an all-files manifest, run `audit_recent_movies.cjs --all`, and keep a semantic evidence matrix instead of treating the structural auditor's pass as proof of genre correctness.

## Anti-regression gates

- Begin with `npm run new-movie -- --title "<title>" --year <year> --dry-run --json`; do not create a file before the duplicate check passes. For a batch, repeat the check for every title and keep a candidate list instead of trusting memory or a search result.
- Keep a compact evidence ledger per title: `field -> URL -> verified fact`. For streaming sweeps, check every relevant AR provider (Netflix, HBO Max, Prime Video, Disney Plus, Paramount Plus, Apple TV, Crunchyroll, Mercado Play and `Otras plataformas`) and distinguish subscription from rent/buy. A Spain/US result, a studio brand, or an empty JustWatch result is not AR availability.
- Lock people only after comparing the exact credited name with `docs/person-profile-catalog-reference.md` and `src/data/people.json`. Verify an `imdbId` with two independent identity signals (name plus title/filmography, country or official profile); never persist the first search suggestion blindly.
- Resolve credits in two passes: first freeze the trustworthy billing, then try bounded identity and portrait enrichment. The publication minimum is exactly a count threshold of one verified director plus at least two verified principal performers in `mainCast`; three performers is not a hard requirement. Aim for four or five when the remaining credits can be resolved safely. For animation/anime, those performers are original-language voice credits.
- A low-billing, incidental or very obscure performer may be omitted from the final `mainCast` when bounded research cannot establish a safe identity or a clearly identifiable portrait. Do not create/update a `people.json` entry solely for that omitted credit, do not use a placeholder, and record `credit -> reason -> evidence searched` in the evidence ledger. Never delete an existing global person record used by another movie.
- Do not omit the director, a lead/co-lead, a central marketing face, an acting-award recipient, or any omission that would leave fewer than two principal performers. If one of those required credits cannot be resolved, stop the candidate instead of thinning the cast to make the audit pass. Do not add children or incidental minors to `mainCast` merely to fill a quota or create a public profile for them.
- Every person retained in the movie JSON must have a visually inspected local portrait showing that individual, not a poster, logo, still, placeholder or ambiguous group photo. A cropped event/production photo is acceptable only when the source identifies the person and the crop/order is unambiguous.
- Run enrichment with the bounded strict mode only after the final credit list is frozen, then run the people audit. The enrichment process has a 15-second request timeout by default and `--strict` fails on unresolved retained people, missing nationality, references or portraits; do not wait indefinitely or publish a partially enriched cache:

  ```bash
  npm run enrich-people -- --movie <slug> --strict
  npm run audit:movie-people -- --movie <slug>
  ```

- Missing birth data is a reported, verified gap when no trustworthy public source exposes it; never invent it to make the audit green. In every person card or profile surface, omit the birth/age line entirely when the data is absent; never write a generic missing-birth placeholder into that UI row or person data. Missing identity, nationality, traceable reference or local portrait remains a hard stop for the director, the two-person minimum and every retained credit. An unresolved optional credit is omitted and reported, never waived while still published. The two-performer minimum is a floor, not a hidden three-person gate.
- If the load also creates/updates a person profile, chain `la-posta-cine-add-person-profile` and apply its two-paragraph/originality/build gates before signing off the movie.

## Batch mode contract

Activate this section whenever the request says `batch`, `bulk`, `mínimo N`, `al menos N`, or asks for several movies.

- Freeze an explicit candidate manifest before writing. For every title, record `title`, `year`, `slug`, duplicate-check result, and the source URLs for AR availability, poster, trailer, awards, and people identity. Do not rely on a generated list, memory, or a search result as the final candidate set.
- Run `npm run new-movie -- --title "…" --original-title "…" --year YYYY --dry-run --json` for every candidate before creating any JSON; pass `--original-title` whenever the Argentine title differs from the source title. Stop the whole batch if any slug or normalized title/original-title + year already exists in the catalog or source files. A same title with a different year is not a duplicate, but record it explicitly for review.
- Create each starter with `npm run new-movie`; do not use an ad-hoc bulk generator that bypasses the repository template. If automation is used for repetitive fields, it must still leave every candidate auditable individually and must not invent metadata or copy editorial text.
- Resolve the complete director and principal-cast billing before freezing the JSON. Then create the final credit list with one verified director and at least two verified performers; this remains publishable even when only those two performers pass the retained-credit gate. Optional credits that fail the bounded identity/portrait gate may be omitted only when they are not central, award-winning or required for the minimum; record each omission and never silently replace it with another name.
- Run strict people enrichment and `npm run audit:movie-people -- --movie <slug>` for every candidate in bounded chunks against that final list. Collect every failure; a retained-credit failure blocks the candidate, while an omitted optional-credit gap is reported as an intentional exclusion rather than converted into a fake person record.
- Run the candidate auditor **without** `--skip-youtube` before the build and again after every trailer change. A `youtube-title-mismatch`, `youtube-year-mismatch`, `youtube-search-mismatch`, or oEmbed error is a hard stop: replace the ID with a verified official/authoritative trailer and rerun. Use `--skip-youtube` only for the post-build route/reaction check, never as the first or only trailer validation.
- Distinguish external YouTube 3xx/timeouts from content errors: retry with the bounded auditor, keep the exact warning and source evidence in the ledger, and never convert a title/year mismatch into a warning just because search is blocked.
- Check every stored poster URL directly with the exact URL saved in JSON. Run `node skills/la-posta-cine-auditor/scripts/verify_posters.cjs --candidate <path>` before the candidate auditor; it follows redirects, reads the final response, requires `2xx + image/*`, parses raster dimensions, and rejects `401/403/404`, invalid image bodies, and horizontal assets. The verifier retries `429/5xx` and timeouts with bounded backoff, then reports them as external warnings rather than silently treating them as broken or valid.
- Poster identity is a separate editorial gate: a filename, slug, first image-search result, or successful HTTP response does not prove the film, year, language, or market. Record a canonical source page that names the movie and year, compare the artwork visually, and reject badges, backdrops, stills, cropped title cards, wrong films, and Spain/LatAm-localized art when Argentine evidence does not support it. Keep the original/neutral poster when title localization is uncertain; never auto-replace every Spanish-looking asset.
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

For a poster, the ledger must contain `poster URL → final HTTP status/content-type/dimensions → canonical identity/year source → visual identity and Argentina-market decision`. Do not use a platform page, an image filename, or a search-result thumbnail as the only identity evidence.

## Create and enrich

Create the starter only after the intake passes:

```bash
npm run new-movie -- --title "<title>" --year <year> --slug <slug>
```

Fill the template with verified data. Follow the contract for field semantics, Argentine naming/platforms, taxonomy, people, awards, recommendations, posters, trailers, and meters.

Mandatory editorial rule: write `synopsis` and `review` 100% from scratch with AI for this exact movie. Sources may establish facts and reception but are never draft material: do not copy, translate, close-paraphrase, synonym-swap, or reshape source copy. Do not use reusable scaffolds, sentence skeletons, verdict-led openings/closings, or recycled paragraphs. If it could fit another title after changing a name, rewrite it.

Treat `verdict` and `verdictLabel` as UI metadata, never as prose. A review must not contain an all-caps or mechanical label such as `RECOMENDADA:`, `NO RECOMENDADA:`, `ZAFA:` or `<verdictLabel> porque`; it must arrive at its judgement through a film-specific argument. Before drafting, choose a fresh critical angle grounded in this title's particular direction, performances, structure, imagery, sound, genre use or cultural context. Write in natural Argentine Rioplatense Spanish, with varied rhythm and vocabulary; do not finish with a generic consumption recommendation. Run the editorial auditor against the explicit candidate and rewrite every marker finding before proceeding. There is no authorized automatic review generator: each review must be drafted uniquely for its film.

Before person research, consult the compact person-profile catalog and `people.json`; preserve existing canonical names and data. Then run:

```bash
npm run enrich-people -- --movie <slug> --strict
npm run audit:movie-people -- --movie <slug>
```

If enrichment cannot safely resolve an optional, obscure cast credit, remove that credit from the movie JSON before running the strict commands, leave the global people pool untouched for that person, and keep the omission in the evidence ledger. The strict commands are intentionally strict for every credit that remains published.

If the final label is `Cine`, invoke `la-posta-cine-cartelera-revalidator` before the audit. For any final platform, invoke `la-posta-cine-auditor` with the candidate path and compact evidence ledger.

## Gate

Run the candidate checks; they enforce schema, originality, people, taxonomy, generated route/reaction, carousel eligibility, and forbidden content fields:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate src/data/movies/<slug>.json
node skills/la-posta-cine-auditor/scripts/verify_posters.cjs --candidate src/data/movies/<slug>.json
npm run catalog:movies
npm run catalog:movies:check
npm run update-upcoming-releases
npm run check
npm run test:editorial-meters
npm run audit:movie-people -- --movie <slug>
npm run images:people:check
npm run validate:content
npm run build
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate src/data/movies/<slug>.json --skip-youtube --verify-community-build --verify-reaction-build --verify-cinema-carousel-build --verify-streaming-carousel-build
npm run validate:public-output
npm run validate:sitemap-indexability
git diff --check
git diff --name-only
```

After the build, use Playwright against the actual movie route(s), not only the source JSON or an HTTP `HEAD`: scroll the poster into view and assert `complete === true`, `currentSrc` equals the stored URL (or its expected redirect), and `naturalWidth > 0` / `naturalHeight > naturalWidth`. For a bulk, keep the same explicit manifest and report `total`, `loaded`, and `bad` counts.

When the candidate files are still uncommitted, pass them explicitly. `npm run validate:content` compares `origin/main...HEAD` and can report zero changed movie files while the working tree contains the real candidate set; never use that base diff as the only batch-count check. If a full auditor exposes pre-existing trailer/content errors, compare the baseline findings with the candidate findings and block only new regressions for a poster-only revalidation while reporting inherited defects unchanged.

Abort rather than repair site code when a check fails. Confirm every changed file is in scope, inspect the focused diff, then stage only the allowed change set. Commit/push only if the user requested publishing; otherwise leave the validated branch ready for review.

If the user explicitly supplies a score for a named movie during a revalidation, verify the primary category first. Keep the score bounded and slug-specific in the central meter override map, add a regression assertion to `scripts/editorial-meters.test.mjs`, and rerun `npm run test:editorial-meters`; never put `lagrimometroScore` or an equivalent field in the movie JSON.

## Final response

Report the branch, file or batch count, explicit candidate paths, validation results, the per-title platform evidence ledger with AR offer type, editorial source URLs, trailer oEmbed/search status, retained people/catalog changes, intentionally omitted optional credits with the reason/evidence, meter applicability, and warnings that remain. State explicitly that both editorial texts were written from scratch by AI and that no site-code/Share/Comunidad/reaction files changed. For a batch, distinguish files added in this run from inherited files and report any same-title/different-year neighbor. When publishing is explicitly requested, verify the pushed SHA, the workflow result and the live slugs before claiming success; then leave `main` clean and aligned with `origin/main`.

For an explicit request to publish to `main`, also wait for the matching GitHub Actions success and confirm the slug is present on the live site before claiming publication succeeded.
