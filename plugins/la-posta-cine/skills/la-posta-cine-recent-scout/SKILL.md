---
name: la-posta-cine-recent-scout
description: Find one publishable La Posta Cine release from the last seven days and hand it to the movie-load workflow. Use when the user asks to find a recent movie not yet in the catalog; use compact live research, duplicate/recency gating, and the existing add, cartelera, and audit skills.
---

# la-posta-cine-recent-scout

Scout one title at a time, quietly. This is selection only; `la-posta-cine-add-movie` owns publication.

1. Take the session date as truth. A candidate must have already released in the inclusive window `today - 7 days` through `today`; reject coming-soon, older-library, year-only, duplicate, and weakly documented titles.
2. Query official platform/distributor release pages and Argentine cinema sources in parallel. Build at most three candidates, keeping title, year, exact date, likely AR context, and one source URL each. Do not open long articles until a candidate survives the gate.
3. Gate each candidate with the bundled script; it reads the catalog/source files without adding them to chat:

```bash
node skills/la-posta-cine-recent-scout/scripts/check_recent_candidate.mjs --title "<title>" --year <year> --release-date <YYYY-MM-DD> --json
```

4. For the first passing candidate, add one independent source confirming the date or relevance. Then hand off only title, year, release date, AR context, and the two URLs to `la-posta-cine-add-movie` in quiet mode. Do not pass a draft review or synopsis: that skill must write both from scratch with AI.
5. If the result still says `Cine`, run `la-posta-cine-cartelera-revalidator`; always finish with `la-posta-cine-auditor`.

If nothing survives, return exactly `No hay nada digno para subir a cineposta`, the date window, sources checked, and compact rejection reasons. Otherwise report the winner, shortlist, gate result, two URLs, and downstream status.
