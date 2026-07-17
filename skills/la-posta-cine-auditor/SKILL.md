---
name: la-posta-cine-auditor
description: Audit recently added or revalidated La Posta Cine movie entries after `la-posta-cine-add-movie`, `la-posta-cine-cartelera-revalidator`, or any bulk/backfill load. Use when Codex needs to verify newly added or platform-adjusted `src/data/movies/*.json` files in Clovhis/sucuplecuc for schema correctness, trailer validity, review quality, awards structure, category/genres/subgenres coherence, single or multi-platform labels, catalog sync, and safe diff scope before or after publishing.
---

# la-posta-cine-auditor

Audit a recent movie batch without touching site code.

This skill must always execute the bundled audit script. Manual eyeballing is not enough, even if the only requested check is verdict labels or score/badge tone.

If the branch still contains fresh `Cine` claims that have not yet been checked against current cartelera, invoke `la-posta-cine-cartelera-revalidator` first and then return to this skill.

## Quiet mode and token budget

- Run in quiet mode by default. Send no progress updates for routine successful steps.
- Allowed user-facing messages before the final response: one required initial acknowledgment, a blocker that needs user input, a validation failure that requires edits, or a long-run heartbeat only after several minutes of silence.
- Do not send updates for audit start, passing checks, candidate discovery, fixes that are obvious and local, build start, or build success.
- Use the bundled auditor output as the primary signal; do not manually restate every passing check.
- Prefer candidate-specific audit commands over full-catalog commands unless the task explicitly requires a full audit.
- Summarize errors/warnings by candidate and severity in the final response; paste long logs only when they are needed to explain a fix.
- When chaining from another skill, carry forward only the candidate paths, changed platform labels, and relevant evidence URLs. Preserve quiet mode.

## Scope

Use this skill after a movie add/backfill/revalidation workflow, especially when the branch contains new files under `src/data/movies`, platform changes from `Cine` to another label, or provider adjustments that add/remove `releasePlatforms`.

Movie detail pages have a global Share panel. This auditor treats Share code/assets (`src/pages/peliculas/[slug].astro`, `src/scripts/movie-detail.ts`, `src/styles/global.css`, `public/brand/social/**`) as site-code surface, not movie-content data. For normal movie audits, any diff touching those paths is out of scope unless the user explicitly requested Share/site UI work.

Movie detail pages also have a global illustrated reaction panel (“El equipo dice”) below the review and the featured cast. It is derived exclusively from `verdict` and the movie slug; normal content audits must not add reaction fields, per-movie reaction images or reaction copy to JSON. Expected output mapping is `recomendada` → `Mirala`, `zafa` → `Zafa`, `no_recomendada` → `Mejor pasá`, and `basura_atomica` → `Ni te gastes`.

Allowed fix paths:

- `src/data/movies/**`
- `src/data/people.json`
- `public/people/**`
- `docs/movie-catalog-reference.md`
- `docs/person-profile-catalog-reference.md`

Forbidden fix paths:

- `src/pages/**`
- `src/components/**`
- `src/layouts/**`
- `src/styles/**`
- `public/**`
- `public/brand/social/**` (Share/social logo assets)
- `.github/**`
- `package*.json`
- `astro.config.*`
- `tsconfig.json`

Never auto-fix project code if the audit fails.

If the branch also edits `src/data/personProfiles.ts` through an add/update profile workflow, do not sign off on that part from movie checks alone. Defer to `skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs` and preserve its current mandatory biography floor of `2508` normalized characters, derived from tripling the historical `836`-character Brad Pitt baseline.

## Workflow

### 1. Resolve candidates

Prefer the current branch diff against `main`.

Default audit command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --base-ref main --recent
```

Full catalog command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --all
```

Explicit batch command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs \
  --candidate src/data/movies/foo-2024.json \
  --candidate src/data/movies/bar-2025.json
```

### 2. Run deterministic checks

Before interpreting people findings, read `docs/person-profile-catalog-reference.md` as the reference list of exclusive dynamic profiles.

The bundled script checks:

- recent candidate detection from `git diff <base>...HEAD`
- required fields and JSON shape
- `releaseDate` presence for current-year / future titles so Astro 7 does not leave them hidden from home/search
- `reviewPublishedAt` format/presence on recent review loads so the homepage block `Últimas reseñas` sorts by publication freshness instead of movie release chronology
- `mainCast` sanity: enough credited principal performers for the title type, no duplicate names, and no obvious omission of award-winning acting recipients from the credited cast
- people pool coverage in `src/data/people.json` for every credited director/main cast member
- reconciliation against `docs/person-profile-catalog-reference.md` so any credited person with an exclusive profile keeps the canonical catalog name and can still resolve to `/personas/<slug>/`
- local cached portrait existence under `public/people/**`
- local portrait presence as a hard requirement: director/main cast cards must not ship with initials-only placeholders
- portrait source sanity so cached portraits are real headshots and not logos, posters, favicons or generic site assets
- birth date/year presence when it can be verified from public sources
- death year sanity for deceased people and implausibly old profiles
- primary nationality presence for every credited director/main cast member
- traceable profile presence for every credited director/main cast member (`IMDb`, `Wikidata`, `TMDb`, `Plex`, `Anime-Planet`, etc.)
- editorial recommendation completeness for `becauseYouLiked` and `related`
- editorial recommendation slugs that resolve to real movie entries
- `subgenres` shape and hygiene: non-empty array strings when present, no broad-genre duplicates, canonical-label preference, and no accidental alias drift
- explicit subgenre carry-over: if a supported site subgenre is detectable in `category` or `genres`, it must also be mirrored deliberately in `subgenres`
- manual Share/social fields in movie JSON; Share links derive globally from slug/canonical URL and must not live in movie data
- automatic meter eligibility, matching the movie detail page priority: primary `Drama`/`Romance`/`Romántica` shows Lagrimómetro; if not, primary laugh-first `Comedia` shows Jajámetro; if neither, primary `Terror` shows Cagazómetro; if none of those, primary `Accion`/`Acción` shows Explosiómetro. Secondary genres alone do not trigger any meter, and movie JSON must not include manual meter fields
- `postCreditsScenes` coverage for live-action Marvel/DC superhero movies: required as `0` or a verified non-negative count; forbidden on unrelated movies
- raw HTML entities or scrape artifacts accidentally persisted into JSON fields
- `awards.wins` structure and supported award types
- `verdictLabel` sanity so the badge reads like a quality signal instead of metadata
- `verdictLabel` hard cap of `21` visible characters so the card badge never clips
- `verdictLabel` readability so the badge says clearly if the movie is buena, pasable o mala
- reaction-panel compatibility: the `verdict` must be one of the supported editorial states, no manual `reaction`, `reactionSlug`, `reactionImage`, `teamReaction` or equivalent reaction fields may exist in movie JSON, and the built detail route must contain the global `movie-reaction` panel with the matching verdict copy
- platform labels against the site allowlist
- `releasePlatform` / `releasePlatforms` consistency: no duplicates, max `2` labels total, `releasePlatform` preserved as primary, and `Otras plataformas` kept exclusive
- Argentine audience title drift: `title` should reflect the name used in Argentina, while `originalTitle` keeps the source/original title
- catalog sync in `docs/movie-catalog-reference.md`
- post-build Comunidad route verification: every audited movie must generate `dist/comunidad/peliculas/<slug>/index.html`; the discussion/thread is automatic and must not be represented by manual movie JSON fields or a pre-created Supabase thread
- poster source sanity: `poster` must be a real vertical poster/key art and must not be a YouTube trailer thumbnail, backdrop, still, logo, screenshot, or horizontal platform tile
- current-cartelera carousel eligibility: a `Cine` entry released in the last 42 days must have its existing `releaseDate`, vertical `poster`, and `trailerYoutubeId` rendered in the homepage Cartelera carousel after build; no separate carousel data is allowed
- current-streaming carousel eligibility: a confirmed non-theatrical platform entry released in the last 42 days must render in the homepage `Streaming` carousel after build, with its existing poster, official trailer and editorial verdict; `Otras plataformas` and dual `Cine` titles must not be added as duplicate streaming cards
- trailer format, YouTube oEmbed reachability, title/year sanity, and YouTube search alignment for ambiguous titles
- raw numeric score leakage in reviews
- forbidden third-party site mentions inside reviews (`Rotten`, `Metacritic`, `IMDb`, etc.)
- review length / underdeveloped copy / template-shaped wording / repeated sentence skeletons by delegating to `skills/la-posta-cine-add-movie/scripts/review_audit.cjs`
- synopsis presence, useful 28-90 word range, duplicate-copy detection and generic source/template-shaped openers through the same editorial audit

### 3. Interpret findings

- `ERROR`: fix before considering the batch valid
- `WARN`: inspect and fix if confidence is high

The `verdictLabel` readability check is mandatory:

- treat confusing or cryptic labels as a hard stop
- repetition is allowed when the wording is clear and useful
- prefer short direct labels like `RECOMENDADA`, `ESTA BUENA`, `PASABLE`, `NO LA MIRES`, `MALA`, `MALISIMA`, `BASURA TOTAL`
- legendary all-timer movies should be recognized with labels like `LEGENDARIA`, `OBRA MAESTRA` or `CLASICO TOTAL`, not downgraded to a generic `ESTA BUENA`

The reaction-panel check is mandatory too:

- treat an unsupported or missing `verdict` as a hard stop because the detail page cannot communicate the editorial signal correctly
- treat any manual reaction JSON field (`reaction`, `reactionSlug`, `reactionImage`, `teamReaction`, or equivalent) as a hard stop; the panel is global and derives its content from `verdict`
- after a successful build, inspect each audited `dist/peliculas/<slug>/index.html` and require `movie-reaction` plus the matching copy: `Mirala` for `recomendada`, `Zafa` for `zafa`, `Mejor pasá` for `no_recomendada`, `Ni te gastes` for `basura_atomica`
- do not alter the verdict merely to select a different illustration; the review and editorial criteria remain the source of truth

The third-party mention check is also mandatory:

- treat any explicit site/brand mention inside `review` as a hard error
- rewrite the sentence into generic editorial language (`la crítica`, `la recepción`, `el consenso`) instead of naming the source
- sources may still be cited in the audit report/output evidence, but never inside the published review copy

The short-or-robotized review check is mandatory too:

- treat a review that is too short, underdeveloped, or obviously reusable as a hard stop
- treat template scaffolds and fill-in-the-blank sentences as a hard stop even if the copy is grammatically correct
- treat "AI sounding but technically acceptable" copy as a hard stop too when it leans on inherited cadence, generic paragraph arcs, or interchangeable phrasing
- examples of forbidden reviewer shortcuts: generic closings that only restate the verdict, verdict-led stock lines like `ZAFA y...` / `PASABLE para...`, `ESTA MUY BIEN porque...`, `Lo que la vuelve RECOMENDADA...`, `El veredicto de NO LA MIRES...`, reusable structures with title/cast swapped in, or copy that could describe another movie unchanged
- if the published review repeats `verdictLabel` verbatim inside the prose, treat it as templated copy and rewrite it
- if two reviews in the same batch could trade paragraph structure with only noun swaps, treat both as templated and rewrite at least one before sign-off
- if the audit reports `short-review`, `underdeveloped-review`, `duplicate-long-sentence`, `reused-opener-pattern`, `generated-review-marker`, or equivalent robotized signals, rewrite the review before signing off

The synopsis quality check is mandatory too:

- treat a missing, copied, underdeveloped, overlong or template-shaped synopsis as a hard stop
- require a concise, title-specific and spoiler-free description of the premise, character/group and initial conflict; it must be written from scratch in rioplatense Spanish
- never publish copied distributor/database copy, generic source-style openers (`La película sigue...`, `La trama relata...`, `El filme cuenta...`) or verdict/review language in `synopsis`

The exclusive profile reconciliation check is mandatory too:

- treat canonical-name drift as a hard stop when a credited director or cast member already has an exclusive profile in `docs/person-profile-catalog-reference.md`
- rewrite the credited name in movie JSON to the canonical catalog name instead of leaving an alias or alternate spelling
- the objective is to preserve the dynamic person-page link from the movie detail page

The current-year `releaseDate` check is mandatory too:

- treat a missing `releaseDate` on any current-year or future entry as a hard stop
- fill it with an exact `YYYY-MM-DD` date from trustworthy AR-facing release evidence before republishing
- do not trust `npm run build` as proof here: Astro 7 can still pass build while the movie stays filtered out of home/search

The `reviewPublishedAt` check is mandatory for new review loads too:

- treat malformed `reviewPublishedAt` values as a hard stop
- for a newly published movie review, require `reviewPublishedAt` in exact `YYYY-MM-DD` format
- this field tracks when Cine Posta published the review and controls the homepage block `Últimas reseñas`; it is not a substitute for `releaseDate`

The poster source check is mandatory too:

- treat any `poster` URL from `i.ytimg.com`, `img.youtube.com`, or containing YouTube thumbnail filenames such as `hqdefault`, `mqdefault`, `sddefault`, or `maxresdefault` as a hard error
- treat JustWatch `/backdrop/...` and other obviously horizontal still/backdrop paths as a hard error for movie-card posters
- prefer replacement poster URLs from official platform/distributor press art, JustWatch `/poster/.../s718/...`, TMDb `/t/p/w780/...` (or `/t/p/w500/...` only if needed), IMDb poster media, or Wikimedia official poster art; use CinesArgentinos only as a last resort
- reject CinesArgentinos poster derivatives or any other asset with a country flag, badge, watermark, logo overlay, player control, or third-party UI treatment
- do not approve a batch when the card would display a cropped trailer frame, title card, screenshot, horizontal still, low-resolution derivative, or branded/badged poster

The people portrait/info check is mandatory too:

- treat a missing `image` for any credited director or `mainCast` person as a hard error, not a warning
- require `nationalityPrimary` and at least one traceable IMDb, TMDb, Wikidata, Plex, JustWatch, official, university/theatre, festival, or reputable press profile/reference URL
- cached portraits must be real human photos/headshots or a tightly cropped verified press/role image of the credited person; reject posters, logos, favicons, generic site assets, and unclear group images
- require `birthDate` or `birthYear` only when a trustworthy public source verifies it; do not fabricate private birth data just to silence the UI

The automatic meter check is mandatory too:

- treat any manual `jajametro`, `jajametroScore`, `lagrimometro`, `lagrimometroScore`, `cagazometro`, `cagazometroScore`, `explosiometro`, or `explosiometroScore` field as a hard stop
- verify the primary `category` is intentional because meters do not activate from secondary `genres`
- remember that `subgenres` help homepage/detail taxonomy, but they do not replace `category` for automatic meter eligibility
- apply the same priority as the page: `Drama`/`Romance`/`Romántica` wins first, then laugh-first `Comedia`, then `Terror`, then `Accion`/`Acción`
- for primary `Drama`, `Romance`, `Romántica`, or `Comedia romántica`, expect only Lagrimómetro; for primary laugh-first `Comedia` with no drama/romance token, expect only Jajámetro; for primary `Terror` with no drama/romance/comedy token, expect only Cagazómetro; for primary `Accion`/`Acción` with no drama/romance/comedy/terror token, expect only Explosiómetro
- when a meter score seems tonally wrong, verify reception through trustworthy sources such as Rotten Tomatoes, Metacritic, IMDb, reputable critics, or official materials before changing review/category data

The post-credit information check is mandatory too:

- require `postCreditsScenes` on every live-action Marvel/DC superhero movie; `0` explicitly means there are no scenes during or after credits
- accept only a non-negative integer: `null`, `pending`, and unconfirmed values are invalid; never infer a count from franchise convention
- reject the field on non-superhero, animation, and anime entries
- verify a non-zero count with trustworthy evidence or direct viewing before sign-off

The Share field check is mandatory too:

- treat any manual `share`, `shareUrl`, `shareText`, `shareLinks`, `social`, `socialLinks`, `whatsapp`, `whatsappUrl`, `xShare`, `xShareUrl`, `twitter`, `twitterUrl`, `instagram`, `instagramUrl`, `tiktok`, `tiktokUrl`, `copyUrl`, or `canonicalUrl` field as a hard stop
- remove manual Share/social fields from movie JSON because the site-level Share panel is automatic
- in a content-only audit, treat changes to Share UI/assets as forbidden site-code changes unless explicitly requested by the user

The subgenre check is mandatory too:

- treat malformed `subgenres` values as a hard stop
- treat broad labels such as `Terror`, `Drama`, `Comedia`, `Acción`, `Thriller`, etc. inside `subgenres` as a hard stop
- prefer the current canonical labels used by the site filters: `Gore`, `Found Footage`, `Slasher`, `RomCom`, `Body Horror`, `Psicológico`, `Sobrenatural`, `Heist`, `Road Movie`, `Coming of Age`, `Mockumentary`, `Exploitation`
- if a supported subgenre is only buried in `genres` or `category` (for example `Terror corporal`) and missing from `subgenres`, treat it as a hard stop for new/revalidated loads and mirror it explicitly (`Body Horror` in that example)
- custom subgenres are allowed only when intentional; if they are outside the canonical list, verify they should ship as custom chips instead of accidental taxonomy noise

If a finding depends on external truth, verify it with primary or trustworthy sources before editing:

- official YouTube channels for trailers
- official movie/distributor pages, JustWatch AR, official AR platform pages (including Mercado Play), IMDb, Rotten Tomatoes, Metacritic
- Argentine platform pages / IMDb Argentina release info when validating localized titles
- official award pages or reliable databases for Oscar/Cannes/Grammy wins

Do not invent trailers, awards, or platform data.
Do not invent birth dates, portraits, or IMDb links either.

### 4. Safe fix loop

If the script reports fixable issues:

1. Edit only affected movie JSON files, `src/data/people.json`, local `public/people/**` files and, if needed, `docs/movie-catalog-reference.md`
2. Re-run the auditor without skipping the mandatory batch score/badge check
3. Run `npm run build`
4. Re-run the candidate audit with `--skip-youtube --verify-community-build --verify-reaction-build --verify-cinema-carousel-build --verify-streaming-carousel-build` to confirm the built `/comunidad/peliculas/<slug>/` route, verdict-derived reaction panel, and any eligible current Cine or confirmed streaming entry in the homepage carousels
5. Confirm no forbidden path changed

### 5. Output

Report:

- audited candidate list
- errors and warnings
- fixes applied, if any
- final revalidation status
- explicit statement that no forbidden path was modified
- explicit confirmation that the people pool is complete for every credited director/main cast member in the audited batch, including nationality plus a traceable profile, and that any missing birth date or portrait is an explicit verified gap rather than fabricated data
- explicit confirmation that deceased people do not render as living ages and that animation/anime titles use original voice cast in `mainCast`
- explicit confirmation that credited people with exclusive profiles still resolve to their dynamic `/personas/<slug>/` pages
- explicit confirmation that no audited movie JSON contains manual Share/social fields and no Share UI/assets were changed in a content-only audit
- explicit confirmation that every audited movie has its built `/comunidad/peliculas/<slug>/` route, without a manual Supabase thread, custom Comunidad field, or Comunidad UI/code change
- explicit confirmation that any supported subgenre signal now lives in `subgenres` with deliberate labeling instead of being hidden only in `genres`/`category`
- explicit confirmation that every audited built detail route renders the verdict-derived reaction panel and that no movie JSON contains manual reaction data

