---
name: la-posta-cine-recent-scout
description: Find one relevant recent movie for La Posta Cine by using the current date, browsing recent theatrical and streaming releases, verifying the movie is not already in `docs/movie-catalog-reference.md` or `src/data/movies`, and then chaining the existing add + cartelera revalidation + audit workflows. Use when Codex needs to scout a fresh movie to publish from cinema or streaming catalogs, especially for prompts like "busca una pelicula reciente para subir", "releva estrenos", "fijate si hay alguna pelicula nueva para cargar", or "encontra algo reciente que no este en el sitio". The downstream add flow may resolve the movie as single-platform or multi-platform in AR.
---

# la-posta-cine-recent-scout

Scout exactly one publishable recent movie at a time unless the user explicitly asks for a batch.

This skill does not replace the existing load and audit skills. Its job is to:

1. detect a recent candidate using live web research
2. reject stale or duplicate titles
3. hand off the winner to `la-posta-cine-add-movie`
4. if the resulting movie ends in `Cine`, hand off to `la-posta-cine-cartelera-revalidator`
5. hand off the resulting candidate file(s) to `la-posta-cine-auditor`

## Quiet mode and token budget

- Run in quiet mode by default. Send no progress updates for routine successful steps.
- Allowed user-facing messages before the final response: one required initial acknowledgment, no viable candidate, ambiguity that needs user input, downstream failure, or a long-run heartbeat only after several minutes of silence.
- Do not send updates for scout start, each source lookup, shortlist growth, rejected candidates, selected candidate before handoff, duplicate check success, add-workflow handoff, audit handoff, audit success, build start, or build success.
- Keep rejection reasons for the final shortlist summary.
- Build a shortlist from source result pages, then read only the pages needed to verify the strongest candidates.
- Pass downstream skills only the selected title, year, release date, likely AR platform context, source URLs, and the instruction to preserve quiet mode.
- Summarize evidence as facts plus URLs in the final response; do not paste long release articles or catalog excerpts into chat.

## Workspace rule

Always work inside `C:\WebsitePeliculas`.

Use these repo artifacts first:

- `docs/movie-catalog-reference.md`
- `src/data/movies/*.json`
- `skills/la-posta-cine-add-movie/SKILL.md`
- `skills/la-posta-cine-cartelera-revalidator/SKILL.md`
- `skills/la-posta-cine-auditor/SKILL.md`
- `skills/la-posta-cine-recent-scout/scripts/check_recent_candidate.mjs`

## Mandatory live-data rule

This skill must browse the web. Recent-release scouting is time-sensitive.

Rules:

- Use the actual current date from the session/environment. Never assume a stale "today".
- State exact dates when comparing release timing.
- Prefer primary or trustworthy sources for release timing and platform availability.
- If the source disagrees on dates, keep the movie only if you can explain which date you are using and why.

## Recency policy

Treat a movie as "recent" only if it has already been released and passes one of these windows relative to today:

- theatrical release date between `today - 7 days` and `today`
- first streaming/platform release date between `today - 7 days` and `today`

Hard rules:

- Do not pick unreleased titles.
- Do not pick "coming soon" or "proximamente" pages.
- Do not pick older library titles that merely became trendy again.
- Do not pick titles with only year-level evidence when an exact release date should be discoverable.
- If exact day cannot be confirmed but the title is clearly a current-year release, keep it only as a fallback and say that the date still needs manual confirmation before handoff.

## Candidate discovery workflow

### 1. Build a shortlist

Research recent titles from both cinema and streaming.

Preferred source types:

- official platform release/news pages: Netflix, Max/HBO Max, Paramount Plus, Disney Plus, Prime Video, Apple TV, Crunchyroll, Mercado Play
- official studio/distributor pages and official trailers
- JustWatch AR pages for current Argentine availability
- trustworthy trade/industry or release references such as Variety, The Hollywood Reporter, IndieWire, IMDb release info, Box Office Mojo, Cines Argentinos

Aim for a shortlist of `3` to `5` candidates, then narrow to one.

### 2. Relevance filter

Prefer movies that are easier to justify editorially and easier to publish cleanly:

- major studio/platform releases
- wide theatrical releases or clearly marketed streaming premieres
- strong trade coverage
- notable director, cast, franchise, festival presence, or awards conversation

Avoid candidates that are too obscure to verify well, or that lack enough metadata to satisfy the add workflow.

### 3. Duplicate + freshness gate

For each shortlisted title, run:

```bash
node skills/la-posta-cine-recent-scout/scripts/check_recent_candidate.mjs --title "<title>" --year <year> --release-date <YYYY-MM-DD>
```

If needed, also pass explicit values:

```bash
node skills/la-posta-cine-recent-scout/scripts/check_recent_candidate.mjs --title "<title>" --year <year> --release-date <YYYY-MM-DD> --slug "<slug>" --today <YYYY-MM-DD>
```

The script checks:

- current-date recency window
- already-released status
- duplicate hit in `docs/movie-catalog-reference.md`
- duplicate hit in `src/data/movies/*.json`
- suggested slug

Reject the candidate immediately if the script says:

- duplicate
- not recent
- unreleased

If the first candidate fails deeper verification later, go back to the shortlist and try the next one before declaring that nothing is available.

### 4. Final pre-handoff evidence

Before triggering the add skill, collect:

- exact movie title
- original title when different
- year
- exact release date used for recency
- release context: `Cine`, likely streaming platform, or likely multi-platform AR combination when the evidence is strong
- at least `2` source URLs proving the movie is recent/relevant
- a short note explaining why this was chosen over the other shortlisted titles

## Handoff to add workflow

Once a candidate passes the gate, immediately use `la-posta-cine-add-movie`.

Recommended handoff shape:

```text
Usa $la-posta-cine-add-movie para agregar <Title> (<Year>). Es una pelicula reciente confirmada al <today>, con estreno/availability fechado el <release-date>. Contexto: <Cine|platform|multi-platform>. Fuentes para metadata y fecha: <url-1>, <url-2>, <url-3>. Si no hay opinion del usuario, inferi verdict y review desde recepcion critica verificada sin inventar datos, escribiendo la review desde cero en voz del sitio y sin meter el `verdictLabel` dentro del texto.
```

Rules:

- Do not ask the user for permission between scout and add unless the candidate is ambiguous.
- Do not pass a duplicate candidate into the add workflow.
- Do not hand off without exact release-date evidence unless every trustworthy source is still year-only.
- The downstream review must still be handwritten from scratch by the AI for that exact title: no templates, no recycled paragraphs, no batch scaffolds.

## Handoff to cartelera revalidation workflow

If the chosen candidate is theatrical or the add step leaves `releasePlatform: "Cine"`, immediately use `la-posta-cine-cartelera-revalidator` before the auditor.

Preferred form:

```text
Usa $la-posta-cine-cartelera-revalidator para confirmar la vigencia de cartelera de la pelicula recien agregada y corregir la plataforma si ya no sigue en cines argentinos.
```

If the add step resolves the movie directly to a non-theatrical platform, skip this handoff.
If the add step resolves the movie to a legal AR multi-platform combination, keep going directly to the auditor unless the primary label is still `Cine`.

## Handoff to audit workflow

After the add workflow creates or updates candidate movie files, immediately use `la-posta-cine-auditor`.

Preferred form:

```text
Usa $la-posta-cine-auditor para auditar la pelicula recien agregada en esta rama y revalidar el lote reciente contra main.
```

If the add step produced an explicit file path, prefer an explicit batch audit.
Otherwise use the recent-branch audit flow from the auditor skill.

## Failure modes

If no candidate survives the pipeline, stop and report:

- the exact sentence: `No hay nada digno para subir a cineposta`
- the exact date window you used
- sources checked
- why each rejected candidate failed: stale, duplicate, weak evidence, or insufficient metadata

Do not fabricate a "recent" option just to keep the workflow moving.

## Output

Return:

1. the chosen movie with exact release date and source URLs
2. the shortlist you considered
3. duplicate/freshness guard result for the chosen title
4. confirmation that `la-posta-cine-add-movie` was triggered
5. confirmation that `la-posta-cine-cartelera-revalidator` was triggered when applicable
6. confirmation that `la-posta-cine-auditor` was triggered
6. final status: added and audited, or `No hay nada digno para subir a cineposta`
