# Weekly CinePosta release guides

## Schedules and scope

Two native Codex Cloud tasks run in `America/Argentina/Buenos_Aires`: cinema on Thursday at 10:00, covering Thursday through Wednesday, and platforms on Friday at 10:00, reviewing Monday through Sunday of the current week. A Friday guide includes only releases or offers active by its Friday run date; Saturday/Sunday announcements stay pending until an AR offer is actually active. Their VEVENTs and bootstrap prompts live in `config/weekly-release-cine.json`, `config/weekly-release-cine-prompt.md`, `config/weekly-release-plataformas.json` and `config/weekly-release-plataformas-prompt.md`. The daily editorial automation in `config/daily-editorial.json` remains independent.

## Project map and source of truth

CinePosta is a static Astro site. `src/data/movies/*.json` is the movie catalog; `src/data/people.json` and `src/data/personProfiles*.ts` hold people; `src/data/editorials/*.json` holds original notes. `src/lib/movies.ts`, `people.ts`, `editorial.ts`, `platforms.ts`, catalog/search modules and the score/meter modules normalize those sources. `src/pages/` defines routes, `src/components/` owns reusable cards and carousels, and `src/scripts/` handles browser interactions. Local artwork lives under `public/assets/` and `public/people/`; generated movie/person catalog references are updated by their `scripts/update-*-reference.mjs` commands, never hand-edited.

`scripts/` contains content creation, audits, build validation, home-edition publishers and Buffer clients. `scripts/cineposta-weekly-release.mjs` validates the weekly manifest and creates its receipt/proof; `scripts/cineposta-weekly-supervisor.mjs` persists Pages status and bounded recovery. `scripts/lib/cineposta-luna.mjs` selects the latest compatible native Luna from the official runtime model descriptor. `.github/workflows/deploy.yml` builds and publishes `main`; separate workflows refresh upcoming releases/recommendations and send the established daily film post. `publish-buffer-editorial-x.yml` handles the separate editorial `shareNow` path only after Pages is verified.

`skills/` is the canonical repo copy of the nine existing source skills plus the weekly orchestration skills. `plugins/la-posta-cine/skills/` is generated from it with `node plugins/la-posta-cine/scripts/sync-from-repo.mjs --install`; verify plugin and local installed copies after changing a skill. `config/` stores daily/weekly prompts and schedules. `reports/` stores evidence and delivery receipts. `docs/movie-catalog-reference.md` and `docs/person-profile-catalog-reference.md` are generated indexes, not catalog data. `supabase/sql/` describes the separate ratings/community backend; movie notes and weekly receipts remain static repo content.

The existing Watchmode fallback is `skills/la-posta-cine-add-movie/scripts/watchmode-metadata.mjs`. It reads `WATCHMODE_API_KEY` from the process or ignored `.env.local`/`.env`, sends it only in the `X-API-Key` header and never puts it in query URLs or reports. A bounded `curl` fallback uses the environment proxy if Node fetch cannot reach the service. A setup smoke test reached Watchmode, matched an exact title/year/type and returned rating metadata; its audience-vote count stayed unknown. A prior test or local key does not prove that a future scheduled cloud task has the key: use it only when present in that task's runtime, never commit it, and record the unavailable-source contingency when missing. The unknown vote count cannot support a 9/10 confidence claim.

For actor-to-character credits, reuse `npm run enrich:characters -- --slug <slug> --apply`. It uses the existing `TMDB_API_KEY` runtime variable, resolves a movie by title/year, then checks the exact `/3/movie/{id}/credits` cast relation against the ficha's `mainCast`; it preserves verified prior credits and does not backfill the catalogue. A setup-only read of TMDb movie `120` (`The Lord of the Rings: The Fellowship of the Ring`, 2001) verified Orlando Bloom as Legolas and did not mutate any catalogue file. Future runs still need a successful lookup in their own runtime.

The cinema guide includes films incorporated or revalidated with a current/upcoming show at a named large commercial chain and venue in CABA or Buenos Aires Province, with locality and date inside its Thursday–Wednesday window. Use `la-posta-cine-cartelera-revalidator` for the whole pre-existing inventory; provincial microcinemas, independent, municipal, INCAA, museum and cineclub screenings do not qualify. A platform-only title does not enter the cinema guide. A simultaneous cinema and streaming release remains eligible when its cinema show is verified.

The platforms guide includes films whose Argentine release or legal availability became active Monday through Friday of the current week. Verify JustWatch AR on the run date and the provider's Argentina page when needed; record the named provider and `FLATRATE`, `RENT` or `BUY`. Flow needs title-specific Argentina evidence because JustWatch does not index it. MUBI needs a current Argentina offer. Do not infer territory or provider from a global page, studio, bundle, franchise or announcement. `Otras plataformas` does not identify a provider and is not a named offer for the guide. A movie can appear in the platform guide when it has a simultaneous cinema run; the home Streaming rail may omit it while `Cine` is active, so list only actually surfaced entries in `homeSlugs`.

If a Thursday revalidation finds no eligible cinema title, do not create an empty note or tweet. If it changed movie fichas, publish only those verified catalogue corrections through the existing add-movie/revalidator and GitHub workflow, then confirm the affected movie routes and home rails after Pages. Do not write a weekly editorial receipt or invoke Buffer for that branch.

## One native Luna run

The scheduled-task root is the orchestrator; the one spawned Luna is the worker. Root resumes the receipt/draft and prepares the checkout, captures the official runtime catalog, uses `scripts/lib/cineposta-luna.mjs` to choose the latest Luna with Max, then calls `collaboration.spawn_agent` once with `fork_turns: "none"` for a real one-line probe. It reuses that same returned agent ID for research, movie and code changes, audits, the editorial, the original tweet and the completed preparation. The worker does not spawn or claim its own completion. Its draft uses `execution.status: "awaiting-parent-attestation"`. After the worker returns successfully, the task root records the observed completion with `node scripts/cineposta-weekly-release.mjs attest-completion <kind> <date> --agent-id <same-id>` and follows up that same agent for validation, commit/push and SRE. Weekly validation rejects a self-asserted completion; the daily native execution contract remains unchanged. Root does no independent research or creative writing. Use only included Plus capacity; no API, model keys, inference CLI, exported sessions or extra credits.

The same Luna owns implementation and catalog changes as well as copy and SRE. It applies `la-posta-cine-add-movie`, `la-posta-cine-auditor`, `la-posta-cine-cartelera-revalidator`, `cineposta-editorial` and `la-posta-cine-github-mcp`. They remain the source for duplicate checks, credits, public score normalization, confidence/masterpiece limits, posters, images, original copy and safe Git publication. Watchmode is a supporting fallback when the run's environment has a key; its missing vote count stays unknown. Never guess a score, identity, availability, showtime, person or image. Preserve existing scores during availability-only revalidation. Keep unresolved candidates pending or excluded with searches and reason recorded.

Every Thursday run also revalidates the full existing `Cine` inventory before drafting the new-release guide. Run `node skills/la-posta-cine-cartelera-revalidator/scripts/list_cine_entries.mjs --json` and `node skills/la-posta-cine-cartelera-revalidator/scripts/fetch_cartelera_titles.mjs --json`; then apply the venue-level rule from that skill to every prior `Cine` claim. Keep the label only with a current/upcoming large-chain venue, date and locality in CABA/PBA. When none remains, remove `Cine`, check JustWatch AR once and the official Argentine provider when needed, and set a verified provider or the exclusive `Otras plataformas` fallback. Record every old Cine slug in the weekly candidate manifest, including unchanged revalidations and removals even when they are not in the guide. Put `changedFile` on every modified movie; the validator compares the complete old Cine inventory from `origin/main` with the manifest and audits all changed paths. Do not rerate these availability-only changes.

Keep the weekly research bounded to the date window and a compact per-title evidence ledger. Do not print or paste whole source pages. Audit every file in the explicit candidate manifest, including removed/stale Cine fichas not named in the guide, while leaving Recomendadas, Próximos estrenos, their snapshots, Radar's `getCinemaNews()` editorial carousel, Pages workflows and the existing movie Buffer schedule independent.

## Resume, evidence and validation

Before researching or creating files, run:

```bash
node scripts/cineposta-weekly-release.mjs resume cine YYYY-MM-DD
node scripts/cineposta-weekly-release.mjs resume plataformas YYYY-MM-DD
```

Use only the line for the active task. A receipt already on `origin/main` means resume its Pages or Buffer state and do not draft another guide. A saved draft means continue that exact preparation and agent. Otherwise the task root captures the native model catalog, probes once, and follows the same agent for the preparation. `window cine YYYY-MM-DD` and `window plataformas YYYY-MM-DD` print the canonical date window.

Store the same-run draft in `.tmp/cineposta-weekly/<kind>-<date>/draft.json`. It contains `kind`, `date`, `base`, `slug`, `modelCatalog`, `execution` and `report`. The report uses:

```json
{
  "kind": "cine",
  "date": "YYYY-MM-DD",
  "period": { "kind": "cine", "runDate": "YYYY-MM-DD", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "schedule": "jueves-10-art" },
  "slug": "estrenos-cines-semana-YYYY-MM-DD",
  "execution": { "provider": "codex-native", "model": "<runtime Luna>", "effort": "max", "agentId": "<real id>", "probe": "passed", "status": "completed", "parentCompletion": { "attestedBy": "native-task-root", "agentId": "<same real id>", "completedAt": "<observed completion time>" } },
  "tweet": "Comentario original, URL canónica directa y 1–3 hashtags",
  "social": { "tweet": "El mismo comentario original" },
  "includedSlugs": ["slug-de-ficha-real"],
  "homeSlugs": ["slug-que-aparece-en-el-carrusel-de-home"],
  "candidates": [
    {
      "slug": "slug-de-ficha-real",
      "status": "loaded|updated|revalidated|rerated|existing|pending|excluded",
      "include": true,
      "changedFile": "src/data/movies/slug-de-ficha-real.json",
      "evidence": { "showings": [{ "date": "YYYY-MM-DD", "chain": "Cinemark", "venue": "sede", "locality": "localidad", "jurisdiction": "CABA|PBA", "url": "https://..." }] },
      "cinemaRevalidation": { "decision": "retained|removed", "checkedOn": "YYYY-MM-DD", "showings": [], "venueChecks": [], "availability": {} },
      "score": { "source": "IMDb", "sourceUrl": "https://...", "metric": "audience", "rawValue": 7.1, "voteCount": 900, "retrievedOn": "YYYY-MM-DD", "conversion": "round(7.1)", "final": 7 },
      "reason": "Motivo concreto si queda pendiente o excluido"
    }
  ],
  "sources": [{ "url": "https://...", "role": "primary|secondary", "fact": "Dato comprobado" }],
  "imageChecks": [{ "sourceUrl": "https://...", "description": "Qué se inspeccionó y qué muestra" }]
}
```

For the platform guide, set `period.start` to Monday, `period.end` to Sunday and `period.schedule` to `viernes-10-art`. Put `checkedOn: <runDate>` and an `activeOn` between Monday and Friday in `evidence.availability`; include `justwatchUrl` under `/ar/`, `reason` (`new-release` or `new-availability`), and each offer's `provider`, `offerType`, `country: "AR"` and exact HTTPS URL. Do not include offers that begin after Friday. For a cinema run, every slug that claimed `Cine` on `origin/main` must also appear in `candidates` with `cinemaRevalidation`: `retained` requires current/upcoming CABA/PBA chain showings; `removed` requires two independently checked no-showing sources (including an official schedule), a same-day JustWatch AR check, and verified provider offers or the exclusive `Otras plataformas` fallback. The validator compares this full baseline inventory, preserves scores during availability-only changes and audits every changed movie, including removals outside the guide. The regular `evidence.showings` structure is also mandatory for every film included in the cinema guide. For an unrated new candidate, do not create a movie file or invent a value; leave it pending and record its score searches. A new film's score and all required movie/person metadata still pass the add-movie and auditor hard gates.

The guide is an original `nota` signed CinePosta, dated with today's Argentine date, and uses `/editorial/` and the existing editorial components. Apply `cineposta-editorial` for the complete copy and visual checks. Every included film must be an actual catalog entry and named in the guide. `homeSlugs` lists the subset actually visible in the matching home rail; it may be empty only when no included title appears, with a concrete `homeOmissionReason`. It need not contain every guide title because the Streaming rail is capped at 12 and omits films still in `Cine`. The regular desktop/mobile home-carousel tests still run for an empty subset. The same Luna writes a conversational, original tweet in that run: it names one or more featured films from the guide, mentions CinePosta, uses the direct canonical guide URL and 1–3 distinct hashtags, and passes Buffer's 250-character weighted limit. Buffer attaches the guide's real verified cover image. Keep the tweet in both report fields; no second model writes or edits it.

After the content worker returns, the task root records that observed completion with `node scripts/cineposta-weekly-release.mjs attest-completion <kind> <date> --agent-id <real-agent-id>`. Only then run `node scripts/cineposta-weekly-release.mjs validate <kind> <date>` with the same agent. It verifies parent-attested native execution, date window, explicit title manifest, full prior Cine inventory on Thursdays, real movie files, showtime/platform evidence, sources, original tweet, duplicate history and exact change allowlist; then it runs poster/movie auditors, content/Astro/build gates, post-build checks and editorial/home desktop and mobile Chromium suites. It writes the publishable receipt to `reports/weekly-releases/<kind>/<date>.json` and fingerprints the exact files and `origin/main` base in the local proof. Fix a failure with the same agent and rerun validation on the same preparation. Run `node scripts/cineposta-weekly-release.mjs check-proof <kind> <date>` immediately before staging; it fetches main and rejects any base, path or file change after the build.

## Main, Pages and bounded recovery

Read `la-posta-cine-github-mcp` before publishing. The user authorized direct publication to `main`: stage only the proof's paths, inspect the diff, commit, fetch/rebase if needed, revalidate a changed tree, and use a normal fast-forward `git push origin HEAD:main`. Never force-push or discard work. Confirm the exact pushed SHA with `git ls-remote`.

After the normal push and exact-SHA confirmation, make one compact Actions lookup for `deploy.yml` with that `head_sha`:

```bash
gh api "repos/Clovhis/sucuplecuc/actions/workflows/deploy.yml/runs?head_sha=<pushed-sha>&per_page=10"
```

If no run for that SHA exists yet, verify `git ls-remote origin refs/heads/main` equals the pushed SHA, then request `deploy.yml` with `gh api repos/Clovhis/sucuplecuc/actions/workflows/deploy.yml/dispatches --method POST --field ref=main`; continue only after GitHub accepts the dispatch. This confirms that the correct workflow has started or was requested before the quiet period. Then create the persisted state from the receipt's exact SHA, slug, title, cover asset, all included `movieSlugs` and the subset of surfaced `homeSlugs`:

```bash
node scripts/cineposta-weekly-supervisor.mjs start --kind <cine|plataformas> --date <YYYY-MM-DD> --sha <pushed-sha> --slug <receipt-slug> --title "<receipt-title>" --cover-path public/assets/editorial/<receipt-slug>/<cover>.webp --movie-slugs <all-included-slugs-comma-separated> --home-slugs <surfaced-slugs-comma-separated>
node scripts/cineposta-weekly-supervisor.mjs supervise --kind <cine|plataformas> --date <YYYY-MM-DD>
```

Run the supervisor in one awaited shell/tool call and resume that same process/session until it finishes. It saves its state before waiting; its first ten full minutes make no GitHub calls or other model work. Afterward it checks the Pages workflow and jobs for that exact SHA, the public guide canonical/title/date, the actual cover bytes against the validated local asset, visible home-card links and each movie route. If its post-wait lookup still finds no run, it verifies `origin/main` and requests `deploy.yml`, then observes a new ten-minute quiet interval before querying. The process and JSON state are local to the active cloud task; this is a persisted shell wait, not a claim that the scheduler provides a separate continuation service.

The same Luna reads a concrete job/step or access diagnosis and performs at most two recovery cycles. A code/dependency/configuration correction gets the smallest fix, the complete local checks, a new validated SHA and a normal push. Record the committed correction against the previous failure and reuse that cycle when starting the new SHA:

```bash
node scripts/cineposta-weekly-supervisor.mjs record-recovery --kind <cine|plataformas> --date <YYYY-MM-DD> --type <code|dependencies|configuration> --sha <new-validated-sha> --reason "<diagnosis and fix>"
node scripts/cineposta-weekly-supervisor.mjs start --kind <cine|plataformas> --date <YYYY-MM-DD> --sha <new-validated-sha> --slug <receipt-slug> --title "<receipt-title>" --cover-path public/assets/editorial/<receipt-slug>/<cover>.webp --movie-slugs <all-included-slugs-comma-separated> --home-slugs <surfaced-slugs-comma-separated>
node scripts/cineposta-weekly-supervisor.mjs supervise --kind <cine|plataformas> --date <YYYY-MM-DD>
```

`retry-infra --kind <kind> --date <date> --reason "..."` is only for an infrastructure failure; it dispatches the same SHA and rejects changed files. Every correction/retry increments the persisted cycle count, and the third is blocked. Missing GitHub credentials, a changed `main` base, or a finite supervisor timeout stops with its actual state; never fabricate an online result.

## Buffer after a real online note

Only after the same-SHA Pages build/deploy succeeds and the supervisor confirms the note, cover and routes online, dispatch the existing `publish-buffer-editorial-x.yml` workflow with the guide slug, `mode=publish-now`, a unique `request_id`, and `require_original_tweet=true`. The workflow requires the exact weekly receipt; no generic template can silently replace the same-run tweet. It uses the configured official Buffer account and `shareNow`, checks the note/cover and account, deduplicates by URL and persisted post ID, and records `sent` or the retryable receipt. Do not publish or schedule X before Pages. On an X failure, retry only that existing Buffer workflow and post ID; do not rewrite the note or create a duplicate post.

The native Thursday and Friday tasks are now enabled; official readback confirmed `exact_schedule`, the Argentina timezone and the saved `sucuplecuc` cloud environment for both. Their IDs, schedules, native preparation evidence and validation results are recorded in the weekly config files and `reports/weekly-release-automation-activation.json`. The real native preparation was completed by the same Luna Max worker after a passed probe. The real 600-second same-task wait proof is a preactivation runtime test; every published guide still requires its own post-push Pages supervision. The existing daily task remains independent.
