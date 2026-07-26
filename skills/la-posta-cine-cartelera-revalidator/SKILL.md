---
name: la-posta-cine-cartelera-revalidator
description: "Revalidate La Posta Cine entries claiming `releasePlatform: \"Cine\"` against current Argentine theatrical and legal AR availability. Use for stale cinema badges or after a movie load resolves to Cine; make content-only platform changes, refresh the catalog, and hand affected files to the auditor."
---

# la-posta-cine-cartelera-revalidator

Work quietly and edit only movie JSON plus `docs/movie-catalog-reference.md` (or already-linked people changes). Never touch site code.

1. Capture the candidate set and both Argentine theatrical sources in structured form:

```bash
node skills/la-posta-cine-cartelera-revalidator/scripts/list_cine_entries.mjs --json
node skills/la-posta-cine-cartelera-revalidator/scripts/fetch_cartelera_titles.mjs --json
```

Use those outputs before opening any movie files. Keep `Cine` only if the title is currently shown by Cines Argentinos or Cinemark Argentina; allow a clearly equivalent local title. An old detail page is not evidence.

2. For each title no longer in cartelera, consult JustWatch AR once. Use the official Argentine provider page only to resolve ambiguity. Prefer `FLATRATE`; a clearly legal AR rental/purchase is acceptable but must be reported as transactional.

3. Resolve to one allowed label: `Netflix`, `HBO Max`, `Paramount Plus`, `Apple TV`, `Prime Video`, `Disney Plus`, `Crunchyroll`, `Mercado Play`, `CINE.AR`, `Cine`, or `Otras plataformas`. A second verified AR offer may go in `releasePlatforms` (two labels total). `Otras plataformas` is exclusive. On ambiguous evidence, prefer it over a stale `Cine` claim.

4. Modify only changed entries, then regenerate and audit the affected paths:

```bash
npm run catalog:movies
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <changed-path> --skip-youtube
```

Report the exact audit date, unchanged/current titles, changes, evidence URLs, catalog result, and auditor handoff. Keep only `URL → AR fact` evidence notes; do not paste source pages.
