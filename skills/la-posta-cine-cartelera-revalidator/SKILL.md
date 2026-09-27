---
name: la-posta-cine-cartelera-revalidator
description: "Revalidate La Posta Cine entries claiming `Cine` in `releasePlatform` or `releasePlatforms` against current Argentine theatrical and legal AR availability. Use for stale cinema badges or after a movie load resolves to Cine; preserve the canonical 1–10 score, make content-only platform changes, refresh the catalog, and hand affected files to the auditor."
---

# la-posta-cine-cartelera-revalidator

For a content revalidation, edit only movie JSON plus `docs/movie-catalog-reference.md` (or already-linked people changes). A confirmed site behavior bug belongs to `la-posta-cine-full-site-fix`; the content-only scope here does not block an explicitly requested UI repair.

1. Capture every movie that claims `Cine` in either `releasePlatform` or `releasePlatforms`, then fetch the current Argentine listings in structured form:

```bash
node skills/la-posta-cine-cartelera-revalidator/scripts/list_cine_entries.mjs --json
node skills/la-posta-cine-cartelera-revalidator/scripts/fetch_cartelera_titles.mjs --json
```

Use those outputs before opening any movie files. `list_cine_entries.mjs` must include both platform fields. The Cines Argentinos parser must collect both `news-item__head-title` and `movie-item__title` cards; the older selector omitted most of the current release list. Match the local and original titles, including a clearly equivalent local title.

Keep `Cine` only when a current listing or dated showtime confirms an Argentine theatrical run. Cines Argentinos and Cinemark are the broad first pass; when a catalog title is absent there, check JustWatch AR once and then an official Argentine exhibitor or venue schedule (for example Showcase, Atlas, Hoyts, Cinemacenter, Complejo Teatral, or a local cinema). A premiere date, movie detail page, old review, or expired special event is not current-showing evidence. A current run with upcoming showtimes later in the same week still counts.

2. For each title no longer in cartelera, consult JustWatch AR once. Use the official Argentine provider page only to resolve ambiguity. Prefer `FLATRATE`; a clearly legal AR rental/purchase is acceptable but must be reported as transactional.

3. Resolve to one allowed label: `Netflix`, `HBO Max`, `Paramount Plus`, `Apple TV`, `Prime Video`, `Disney Plus`, `Crunchyroll`, `Mercado Play`, `CINE.AR`, `Cine`, or `Otras plataformas`. A second verified AR offer may go in `releasePlatforms` (two labels total). `Otras plataformas` is exclusive. On ambiguous evidence, prefer it over a stale `Cine` claim.

4. Modify only changed entries. Preserve `cinepostaScore` exactly unless the user separately authorized an editorial rerating; never add `verdict`, `verdictLabel`, `absoluteCinema`, or a custom score label during a platform revalidation. Then regenerate and audit the affected paths:

```bash
npm run catalog:movies
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <changed-path> --skip-youtube
```

The home `Cartelera` renders every published movie whose effective platform list contains `Cine`, including titles where `Cine` appears only in `releasePlatforms`. It has no fixed 42-day window, 12-card ceiling, release-date requirement, or trailer requirement. Exclude only a known future release; a missing date or an older original release date must not hide a currently confirmed theatrical run or re-release. A movie without a trailer still needs a poster card that links to its Cine Posta page.

Report the exact audit date, unchanged/current titles, changes, evidence URLs, catalog result, and auditor handoff. Keep only `field → URL → AR fact` evidence notes; do not paste source pages.
