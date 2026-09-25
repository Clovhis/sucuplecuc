---
name: la-posta-cine-add-movie
description: Add one or more La Posta Cine movie entries safely from a plain-language request. Use for single loads and explicit batches; research and normalize public audience/critic ratings into the Cine Posta 1–10 score, and enforce duplicate-first intake, evidence-led AR availability, identity-safe people enrichment, original copy, and content-only validation.
---

# la-posta-cine-add-movie

Create one movie entry or an explicitly requested batch. Work quietly; send one acknowledgement, then report only blockers, changed plans, or a final result.

## Scope

- Edit only `src/data/movies/**`, `src/data/people.json`, `public/people/**`, `public/assets/posters/**`, and generated catalog references. Never change UI, routes, styles, build config, workflow files, Share, Comunidad, or reaction assets for a movie load. A title-specific meter score explicitly requested by the user is the sole code exception: update only the central `src/lib/*metro.ts` override map and its regression test, never a per-movie meter field.
- Create a `feature/movie-<slug>` branch from an up-to-date `main`; never commit directly to `main`. Do not stash or overwrite unrelated changes.
- A correct slug automatically enables Share, Comunidad, ratings, recommendation blocks, and the score-derived reaction. Do not create per-movie fields or external records for any of them.
- If title/year is ambiguous, ask one question before researching. Otherwise extract feedback and requested platform/premiere intent. For every new or explicitly revalidated movie, research a public rating and set `cinepostaScore` from the score protocol below; do not wait for the user to provide a number. Never infer a score from a vague adjective, genre, franchise reputation, or platform placement. If no reliable public rating is found after the full source sequence, leave the field unset and record the searches; do not invent a value. Omit it only when the user explicitly asks to leave that title unranked.

## Política canónica para retratos locales

Esta política aplica a toda alta o reemplazo bajo `public/people/**`: retratos descargados por `enrich-people`, correcciones manuales del caché `people.json` y retratos que también vayan a usarse como `profileImage` en un perfil extendido.

- `enrich-people` ya invoca el optimizador canónico para cada descarga. No lances otra pasada global sólo porque se ejecutó el enriquecimiento: primero revisá `git status --short -- public/people`. Si hay una alta o reemplazo (`A`, `M` o `??`) corré la pasada canónica para cubrir también copias/manuales y actualizar referencias si cambia una extensión:

  ```bash
  npm run images:people:optimize
  ```

- No reimplementes conversiones, límites, compresión, limpieza de metadata ni actualización de referencias con scripts ad hoc o llamadas directas a `sharp`: `images:people:optimize` es la única fuente de verdad. `npm run images:people:check` se corre siempre al final como hard gate global; un exit code distinto de cero impide dar por terminada la carga, incluso si el auditor de personas pasó.
- Esta regla sólo abarca archivos locales de personas. Todo póster de película es local: una vez verificada la URL fuente y antes del auditor, ejecutá `npm run posters:localize -- --movie <slug>`. El comando descarga, convierte a WebP, conserva la proporción dentro de 480x720, escribe `public/assets/posters/<año>/<slug>.webp` y reemplaza `poster` por la ruta local. Si devuelve código 2 dejó el fallback local por una fuente fallida: no publiques hasta conseguir un arte correcto y volver a ejecutarlo.

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
- Nationality is mandatory movie metadata. During the authoritative-metadata pass, verify the production country or countries, record `country → URL → fact` in the ledger, and store canonical ISO 3166-1 alpha-2 codes in `country` (`MY` for Malasia; `AR, ES` for a coproduction). Do not use a filming location, a performer/director nationality, distributor territory, language, or an inferred studio country. The detail page renders the localized name and a local SVG flag from these codes; never add a flag URL, emoji or presentation-only field to movie JSON. Run `npm run flags:sync` before the audit when the title introduces a country not already represented in the catalog.
- Keep a compact evidence ledger per title: `field -> URL -> verified fact`. For streaming sweeps, check every relevant AR provider (Netflix, HBO Max, Prime Video, Disney Plus, Paramount Plus, Apple TV, Crunchyroll, Mercado Play, Flow and `Otras plataformas`) and distinguish subscription from rent/buy. A Spain/US result, a studio brand, or an empty JustWatch result is not AR availability. JustWatch Argentina does not index Flow as a provider: a Flow claim requires title-specific evidence from the official Flow/Personal Argentina catalog or authenticated catalog view, or a current Argentina-specific Flow release communication when the catalog is not publicly accessible. Never infer Flow from a Flow bundle containing HBO, Paramount+, Disney+ or Netflix.
- Lock people only after comparing the exact credited name with `docs/person-profile-catalog-reference.md` and `src/data/people.json`. Verify an `imdbId` with two independent identity signals (name plus title/filmography, country or official profile); never persist the first search suggestion blindly.
- Resolve credits in two passes: first freeze the trustworthy billing, then find a traceable identity and portrait for every person who will appear in `director` or `mainCast`. Every retained director and every retained actor/performer must resolve to a `people.json` entry with a matching public display name (or a source-backed exact credit in `aliases`), at least one valid HTTP(S) reference, and a visually verified, decodable local portrait under `public/people` of at least 200x250 px. A movie's publication floor is one full-name director with portrait and at least two distinct, full-name principal actors/performers in `mainCast`, each with a portrait. Count a person toward the floor only when both the catalog display name and the movie's actual credited name contain a first and last name; aliases never turn a mononym into a full-name credit. A stage or mononym credit may remain only when its identity and portrait are verified; it does not count toward the two full-name actor minimum. A director counts toward the performer floor only when a source also confirms an on-screen performer/participant role. For documentaries, named central participants may count when their role is verified. For animation/anime, use original-language voice credits.
- Nationality is optional person data. Search public sources, enter `nationalityPrimary` only when a source explicitly supports it, and otherwise omit the field; never infer it from birthplace, language, accent, film country, agency location or collaborators. Birth data is also optional and must never be invented.
- If any retained credit has no verified portrait after bounded searches, remove that person's name from this movie's `mainCast` or `director` value, even when the credit is central, and record `credit -> reason -> sources searched`. Every actor or director left in those fields must have a portrait; no warning-only exception is allowed. Do not create a placeholder or partial person record. Never delete a global person record that another movie uses. If removing unpictured people leaves fewer than one director and two full-name principal actors with portraits, stop the movie load. Do not replace a missing portrait with a poster, character key art, film still, logo, group image, generated face, or unrelated photo.
- Do not retain an unpictured lead/co-lead, central marketing face, acting-award recipient or required performer as a movie credit. Search for a safe individual portrait; if none can be verified, omit that credit only when the movie still meets the publication floor. Do not add children or incidental minors to `mainCast` merely to fill the floor.
- Inspect every portrait selected for a person record beside an independent identity/filmography source. It must visibly depict that individual and match the credited identity; a URL, IMDb ID, existing file, filename, automated enrichment result, or image-search caption alone is not proof. Use an official/authoritative profile or an attributable event portrait, not a poster, logo, film still, placeholder or ambiguous group photo. A cropped event/production photo is acceptable only when the source identifies the person and the crop/order is unambiguous. Store the exact image source URL in `remoteImageUrl`, keep identity/credit sources in `referenceUrls`, and keep the optimized local portrait in `public/people`.
- Run bounded enrichment after freezing the final credit list, then run the people audit. The enrichment process has a 15-second request timeout by default. `--strict` fails on actual processing/network failures; unresolved portraits block the movie credit, while missing nationality or optional birth data remain warnings. Do not wait indefinitely or write a partial person record:

  ```bash
  npm run enrich-people -- --movie <slug> --strict
  npm run audit:movie-people -- --movie <slug>
  ```

- Missing public nationality or birth data is a reported gap, not a movie-level audit failure; omit the unsupported field and never use an empty-string or generic placeholder. In every person card or profile surface, omit the birth/age line when birth data is absent. Missing identity evidence, a matching display/credited name, a valid traceable reference, or a safe local portrait is a hard stop for that retained movie credit. `npm run audit:movie-people -- --movie <slug>` must pass with zero portrait/name/reference errors; optional age and nationality warnings are acceptable. `npm run validate:content` repeats this hard gate for every new movie file and every existing movie file whose `director` or `mainCast` changes, including local untracked additions.
- If the load also creates/updates a person profile, chain `la-posta-cine-add-person-profile` and apply its two-paragraph/originality/build gates before signing off the movie.

## Batch mode contract

Activate this section whenever the request says `batch`, `bulk`, `mínimo N`, `al menos N`, or asks for several movies.

- Freeze an explicit candidate manifest before writing. For every title, record `title`, `year`, `slug`, duplicate-check result, and the source URLs for AR availability, poster, trailer, awards, and people identity. Do not rely on a generated list, memory, or a search result as the final candidate set.
- Run `npm run new-movie -- --title "…" --original-title "…" --year YYYY --dry-run --json` for every candidate before creating any JSON; pass `--original-title` whenever the Argentine title differs from the source title. Stop the whole batch if any slug or normalized title/original-title + year already exists in the catalog or source files. A same title with a different year is not a duplicate, but record it explicitly for review.
- Create each starter with `npm run new-movie`; do not use an ad-hoc bulk generator that bypasses the repository template. If automation is used for repetitive fields, it must still leave every candidate auditable individually and must not invent metadata or copy editorial text.
- Resolve the trustworthy billing before freezing the JSON. Every person retained in the movie's `director` or `mainCast` fields must have a matching `people.json` name (or an exact source-backed alias), a valid HTTP(S) identity reference, and a visually verified, decodable local portrait of at least 200x250 px. Keep at least one full-name director and two distinct full-name principal actors/performers with portraits; both the billing and catalog display name must show first and last name. Remove any unpictured person from this movie's credits and record each omission; never delete a global person record used elsewhere. If the floor cannot be met, block the title.
- Run bounded people enrichment and `npm run audit:movie-people -- --movie <slug>` for every candidate. This is a hard gate for all retained directors and cast members, not a warning-only profile audit. Missing `birthDate`/`birthYear` and `nationalityPrimary` are optional warnings; missing name, identity reference, decodable local portrait, or portrait attribution blocks the retained credit. `validate:content` repeats the portrait gate for every new movie and every changed `director`/`mainCast` after commit, including new local files.
- Run the candidate auditor **without** `--skip-youtube` before the build and again after every trailer change. A `youtube-title-mismatch`, `youtube-year-mismatch`, `youtube-search-mismatch`, or oEmbed error is a hard stop: replace the ID with a verified official/authoritative trailer and rerun. Use `--skip-youtube` only for the post-build route/reaction check, never as the first or only trailer validation.
- Distinguish external YouTube 3xx/timeouts from content errors: retry with the bounded auditor, keep the exact warning and source evidence in the ledger, and never convert a title/year mismatch into a warning just because search is blocked.
- Después de verificar visualmente e identitariamente la URL fuente, localizá el póster con `npm run posters:localize -- --movie <slug>`. La ficha debe conservar sólo `assets/posters/<año>/<slug>.webp`; nunca guardes una URL externa. La fuente debe medir al menos 720x1000 para evitar ampliar miniaturas. El archivo final debe ser WebP vertical, quedar dentro de 480x720, pesar como máximo 100 KiB y apuntar a la ruta canónica; 40–80 KiB es la meta.
- Poster identity and visual quality are separate editorial gates: a filename, slug, first image-search result, or successful HTTP response does not prove the film, year, language, market, or image quality. Prefer official distributor/studio key art or a reputable high-resolution poster archive, then inspect the full-size source and the localized WebP. Reject blur, heavy compression, pixelation, upscales, watermarks, third-party logos, country flags/maps, promotional badges, backdrops, stills, cropped title cards, wrong films, and unsupported Spain/LatAm art. The result must remain sharp and readable at the site's 480px poster width, with no baked-in overlay in any corner. Keep neutral/original art when Argentine localization is uncertain.
- Never use `cinesargentinos.com.ar` or any of its subdomains as a poster image source. Its `/poster/` and `/static/archivos/` assets have introduced a baked-in Argentine flag/map in the lower-right corner. The localizer blocks that host deterministically. Cines Argentinos remains valid for Argentine theatrical evidence and title/date facts, never for artwork.
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

If a non-editorial metadata field remains unresolved after the primary source and TMDb, use Watchmode only as an optional, bounded fallback. Run `node skills/la-posta-cine-add-movie/scripts/watchmode-metadata.mjs --title "<title AR>" --original-title "<original title>" --year YYYY` when both title forms are known, and read the `Watchmode` section of [movie-load-contract.md](references/movie-load-contract.md) before using its output. Its absence, an API failure, or a mismatch never blocks the existing flow and never replaces an already verified source.

Do not reopen sources merely to reconfirm facts. Keep an evidence ledger of compact `field → URL → fact` notes; pass only that ledger to chained skills. Read [movie-load-contract.md](references/movie-load-contract.md) only for the relevant unresolved area (platform, people, taxonomy, or editorial rules), not wholesale.

For a poster, the ledger must contain `source URL → final HTTP status/content-type/dimensions → canonical identity/year source → visual identity and Argentina-market decision → local assets/posters/<year>/<slug>.webp`. Do not use a platform page, an image filename, or a search-result thumbnail as the only identity evidence.

## Create and enrich

Create the starter only after the intake passes:

```bash
npm run new-movie -- --title "<title>" --year <year> --slug <slug> --country <ISO[, ISO]>
npm run flags:sync
```

Si ya está verificada la fuente del arte, pasá `--poster-url "https://…"` al crear el starter: `new-movie` descarga y localiza el WebP antes de devolver el control. Si la fuente se conoce después, cargala y corré el localizador explícito antes del auditor.

Fill the template with verified data. Follow the contract for field semantics, Argentine naming/platforms, taxonomy, people, awards, recommendations, posters, trailers, and meters.

Cuando la URL fuente del póster ya fue verificada, corré `npm run posters:localize -- --movie <slug>` antes de cualquier auditoría. No cierres una carga con `assets/posters/poster-fallback.webp`: eso señala una fuente que no pudo convertirse y debe resolverse.

Mandatory editorial rule: write `synopsis` and `review` 100% from scratch with AI for this exact movie. Sources may establish facts and reception but are never draft material: do not copy, translate, close-paraphrase, synonym-swap, or reshape source copy. Do not use reusable scaffolds, sentence skeletons, verdict-led openings/closings, or recycled paragraphs. If it could fit another title after changing a name, rewrite it.

`editorial.tenSecondTake` is mandatory for every new or edited candidate. Write all seven fields specifically for that movie: `verdict`, `whatToExpect`, `pace`, `intensity`, `practicalContext`, `forFansOf`, and `notForYouIf`. This is a compact editorial guide, not metadata: never derive it from genre, runtime, platform, rating, `cinepostaScore`, or its label; do not use templates, parameterized phrases, generic “plan” advice, or recycled field text. The verdict must explain this film's conclusion in original prose, and the practical field must add viewing context rather than repeat a technical-facts row. A historical file without the block is a documented migration gap, never a license to auto-fill it.

### Public score protocol

For every new or explicitly revalidated candidate, search for a current, title-and-year-matched public rating and record `source URL → exact displayed value → rating type and vote count → retrieval date → conversion → cinepostaScore` in the task evidence ledger. Apply audience ratings before critic ratings across all services:

1. Rotten Tomatoes Popcornmeter/Audience Score.
2. If RT has no usable numeric audience score, continue searching public audience aggregates such as IMDb, TMDb, Letterboxd, Filmweb and Metacritic User Score. Check for these before selecting any critics' metric, even when RT already shows a Tomatometer.
3. Only when no title-matched public audience aggregate has a numeric score, use Rotten Tomatoes Tomatometer, then Metacritic Metascore or another public critic aggregate.
4. If no public aggregate publishes a numeric score, a named professional critic's explicit numerical review rating may be the final fallback; identify it as one critic's rating, not an audience consensus, and never calculate an average from a handful of visible reviews.

A title match must identify the same film and release year; do not use a franchise page, another adaptation, a series, a different country's movie, or a binary Fresh/Rotten label as a numeric rating. Treat an RT audience status such as “Fewer than 50 Verified Ratings” without a displayed percentage as unavailable. If a source is unavailable or has no numeric audience score, continue down the audience list before checking critics.

Normalize a percentage or 0–100 aggregate with `clamp(1, 10, round(value / 10))`, a 0–5 rating with `clamp(1, 10, round(value × 2))`, and a 0–10 rating with `clamp(1, 10, round(value))`. Store only the resulting integer in `cinepostaScore`; the label remains derived by the site. Do not average sources, choose whichever number looks better, or change the score based on the editorial review. Keep the raw value, rating type, vote count, URL, access date, and calculation in the report so the audit can reproduce it. If no numeric public rating can be verified after this sequence, leave `cinepostaScore` unset and report the unresolved score as a publication blocker wherever the content gate requires a score. Never fabricate a score to make validation pass.

Treat `cinepostaScore` and its canonical label as UI metadata, never as prose. Every scored movie must use the integer 1–10 scale and public-source method above; never persist `verdict`, `verdictLabel`, `absoluteCinema`, or a custom score label. A review must not open or close with a mechanical label such as `MUY BUENA:`, `EXCELENTE:`, `OBRA MAESTRA:` or `<score label> porque`; it must arrive at its judgement through a film-specific argument. Before drafting, choose a fresh critical angle grounded in this title's particular direction, performances, structure, imagery, sound, genre use or cultural context. Write in natural Argentine Rioplatense Spanish, with varied rhythm and vocabulary; do not finish with a generic consumption recommendation. Run the editorial auditor against the explicit candidate and rewrite every marker finding before proceeding. There is no authorized automatic review generator: each review must be drafted uniquely for its film.

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
npm run posters:localize -- --movie <slug>
npm run test:poster-source-policy
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

Include the per-title score evidence ledger with source URL, exact raw rating, retrieval date and conversion alongside the platform and editorial evidence.

Report the branch, file or batch count, explicit candidate paths, validation results, the per-title platform evidence ledger with AR offer type, editorial source URLs, trailer oEmbed/search status, retained people/catalog changes, intentionally omitted optional credits with the reason/evidence, meter applicability, and warnings that remain. State explicitly that both editorial texts were written from scratch by AI and that no site-code/Share/Comunidad/reaction files changed. For a batch, distinguish files added in this run from inherited files and report any same-title/different-year neighbor. When publishing is explicitly requested, verify the pushed SHA, the workflow result and the live slugs before claiming success; then leave `main` clean and aligned with `origin/main`.

For an explicit request to publish to `main`, also wait for the matching GitHub Actions success and confirm the slug is present on the live site before claiming publication succeeded.
