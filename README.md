# Cine Posta

Cine Posta is a minimal Astro + GitHub Pages movie review site focused on short, honest, manually curated reviews.

## Features

- Static movie catalog (JSON-based content, no CMS required)
- Home catalog with client-side search by title/year/platform/rating
- Genre chips on home, including `Superheroes` (Marvel/DC live-action only)
- Visible loading/search status in home while posters and filtered results settle
- Faster initial catalog paint via poster prioritization + lighter card rendering
- Movie detail pages by slug (`/peliculas/<slug>/`)
- Embedded YouTube trailer (via `trailerYoutubeId`)
- Verdict badges + optional colloquial `verdictLabel`
- Platform label (`releasePlatform`: Cine, Netflix, HBO Max, Apple TV, Prime Video, Disney Plus, Crunchyroll, Stremio)
- Technical metadata in detail page (`originalTitle`, `category`, `director`, `mainCast`, `productionCompany`)
- Awards section in detail page (always present as `awards.wins`, including empty list when no wins apply)
- Optional screenshot gallery (2 images in detail page left column)
- Community star rating (1..5) backed by Supabase, no login

## Tech stack

- Astro (static output)
- Plain CSS
- Supabase (database for movie star ratings)
- GitHub Actions + GitHub Pages

## Repository structure

```text
.
├─ src/
│  ├─ components/
│  │  ├─ MovieCard.astro
│  │  └─ MovieRating.astro
│  ├─ data/
│  │  └─ movies/
│  ├─ layouts/
│  │  └─ BaseLayout.astro
│  ├─ lib/
│  │  ├─ movies.ts
│  │  └─ supabaseClient.ts
│  ├─ pages/
│  │  ├─ index.astro
│  │  └─ peliculas/[slug].astro
│  ├─ styles/
│  │  └─ global.css
│  └─ types/
│     └─ movie.ts
├─ scripts/
│  └─ new-movie.mjs
├─ docs/
│  └─ movie-catalog-reference.md
├─ skills/
│  ├─ la-posta-cine-add-movie/
│  │  └─ SKILL.md
│  └─ la-posta-cine-auditor/
│     ├─ SKILL.md
│     ├─ agents/openai.yaml
│     └─ scripts/audit_recent_movies.cjs
├─ templates/
│  └─ movie.template.json
├─ supabase/
│  └─ sql/movie_ratings.sql
└─ .github/workflows/
   └─ deploy.yml
```

## Movie content model

Movie entries live in `src/data/movies/*.json`.

Current schema:

```json
{
	"slug": "movie-title-2026",
	"title": "Movie Title",
	"originalTitle": "Original title",
	"year": 2026,
	"releaseDate": "2026-03-14",
	"category": "Action|Romance|Drama|Terror|Thriller|Sci-Fi",
	"poster": "https://... or /posters/local.svg",
	"screenshots": ["https://.../shot-1.jpg", "https://.../shot-2.jpg"],
	"trailerYoutubeId": "abc123",
	"releasePlatform": "Cine|Netflix|HBO Max|Apple TV|Prime Video|Disney Plus|Crunchyroll|Stremio",
	"director": "Director Name",
	"mainCast": ["Actor 1", "Actor 2", "Actor 3"],
	"productionCompany": "Studio / Production Company",
	"verdict": "recomendada|zafa|no_recomendada|basura_atomica",
	"verdictLabel": "Optional display override",
	"awards": {
		"wins": [
			{
				"award": "oscar|grammy|cannes",
				"category": "Mejor película",
				"recipient": "Winner name / team / country",
				"year": 2025
			}
		]
	},
	"review": "Short review (max ~5 lines)"
}
```

### Content notes

- `slug` is the routing key and also the Supabase rating key (`movie_slug`).
- `releaseDate` is optional (`YYYY-MM-DD`). If present, the site uses it to decide if the movie is already released.
- If `releaseDate` is missing, the site treats the movie as released only when `year` is less than the current year.
- `trailerYoutubeId` stores only the YouTube ID, never full URLs.
- `screenshots` is optional:
  - if at least 2 URLs exist, detail page shows a two-shot gallery
  - otherwise poster fallback is used
- `awards` is mandatory in content workflow:
  - always include `awards.wins` in JSON
  - if at least 1 Oscar/Grammy/Cannes win exists, include detailed entries
  - if no wins exist, keep `awards.wins` as an empty array (`[]`)
- `releasePlatform` is optional but recommended.
- `originalTitle`, `category`, `director`, `mainCast`, and `productionCompany` are required for publishing.

## Community rating system (Supabase)

The detail page includes a "Que opina la tribuna" block with:

- global average (1..5)
- total votes count
- user vote status
- 5 clickable stars
- upsert behavior (user can change vote)

### Client bundling note

- `@supabase/supabase-js` is imported only from `src/lib/supabaseClient.ts`.
- `MovieRating.astro` imports that local module in a processed client script (not `is:inline`).
- This ensures Vite bundles dependencies correctly for browser runtime.

### How anti-duplicate works (no login)

- Each browser gets a local `visitor_token` in `localStorage`.
- Votes are unique per `movie_slug + visitor_token`.
- This is basic anti-spam only (not bot-proof).

## Supabase setup

### 1) Environment variables

Create local `.env` from `.env.example`:

```bash
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Do not commit real secrets to git.

### 1.1) Autonomous MCP mode (Codex + VSCode)

To let Codex execute SQL automatically (without asking each time), configure the Supabase MCP server in local Codex config:

- File: `C:\Users\<your-user>\.codex\config.toml`
- Add:

```toml
[mcp_servers.supabase]
command = "npx"
args = ["-y", "@supabase/mcp-server-supabase", "--project-ref", "<your-project-ref>"]
startup_timeout_sec = 60
tool_timeout_sec = 180
```

Then set a local user environment variable (not in the repo):

```powershell
setx SUPABASE_ACCESS_TOKEN "<your-supabase-personal-access-token>"
```

Important:

- Restart VSCode/Codex session after changing MCP config or environment variables.
- Never store PAT/service-role keys in tracked files.

### 2) SQL setup

Run this SQL file (via SQL Editor, MCP, or management API):

- `supabase/sql/movie_ratings.sql`

It creates:

- `public.movie_ratings` table
- unique constraint (`movie_slug`, `visitor_token`)
- indexes
- `updated_at` trigger
- RLS + anon/authenticated SELECT/INSERT/UPDATE policies
- `public.movie_rating_stats` view (avg + vote count)

### 2.1) SQL automation endpoint (admin)

If you have a Supabase Personal Access Token (PAT), SQL can also be executed non-interactively against the project admin API:

- Endpoint: `POST https://api.supabase.com/v1/projects/<project-ref>/database/query`
- Header: `Authorization: Bearer <PAT>`
- Body: `{ "query": "<sql>" }`

This is useful for agent automation and CI-like administrative tasks.

### 3) GitHub Pages build secrets

In repository settings (`Settings > Secrets and variables > Actions`), define:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

The workflow injects these at build time so the static site can call Supabase in production.

## Local development

Install:

```bash
npm install
```

Run dev:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

### Home catalog behavior

- The home page renders all released movies statically and filters them client-side.
- Search matches normalized text from title, original title, year, category, platform, director, production company, cast, verdict label, and slug.
- Clicking an active genre chip again resets the home catalog back to the full list.
- Clicking the `Cine Posta` logo in the header also clears the current home search/filter state.
- The UI shows a loading/search status message while visible posters finish loading, so slow GitHub Pages image delivery does not look like an empty result set.
- First visible posters are prioritized more aggressively than off-screen cards to improve perceived speed on large catalogs.

## Add a new movie

Recommended helper:

```bash
npm run new-movie -- --slug "my-movie-2026" --title "My Movie" --year 2026
```

Then edit generated JSON fields manually.

Alternative: copy `templates/movie.template.json`.

## Agent movie workflows

The repo includes two Codex skills for movie-content operations:

- `skills/la-posta-cine-add-movie/`
- `skills/la-posta-cine-auditor/`

### `la-posta-cine-add-movie`

Use this skill when adding a single movie or a curated backfill batch.

Responsibilities:

- create a feature branch from `main`
- consult `docs/movie-catalog-reference.md` first
- avoid duplicates by `slug` or normalized `title + year`
- gather trustworthy metadata, AR platform availability, trailer, review support, and awards
- write only movie JSON files (plus catalog refresh when needed)
- run editorial review audit
- run `npm run build`
- push the feature branch

Example trigger prompts:

- `Agrega Terminator 7, es malisima`
- `Agrega las mejores peliculas nacionales que existan`

### `la-posta-cine-auditor`

Use this skill after a recent add/backfill run to audit the new batch before or after merging.

Default command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --base-ref main --recent
```

Explicit batch command:

```bash
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs \
  --candidate src/data/movies/foo-2024.json \
  --candidate src/data/movies/bar-2025.json
```

What it checks:

- candidate detection from `git diff main...HEAD`
- required JSON fields and basic schema
- `awards.wins` structure and supported award types
- allowed `releasePlatform` labels
- trailer presence, ID format, and YouTube oEmbed reachability
- review quality red flags (including numeric score leakage)
- catalog sync against `docs/movie-catalog-reference.md`
- editorial duplication by delegating to `review_audit.js`

Output model:

- `PASS` when no errors are found
- `FAIL` with `ERROR` and `WARN` findings when something needs review

Safe fix scope for the auditor:

- `src/data/movies/**`
- `docs/movie-catalog-reference.md`

It must not auto-fix site code.

## Catalog-first workflow (mandatory)

The repository includes a snapshot catalog at:

- `docs/movie-catalog-reference.md`

Use it as the first source in movie add/bulk workflows to:

- see all loaded movies (title/year/slug/category/platform)
- detect probable gaps before a bulk load
- avoid obvious duplicates in planning stage

Important:

- always consult `docs/movie-catalog-reference.md` before inspecting movie JSON files directly
- source of truth remains `src/data/movies/*.json`, but final duplicate verification should be targeted (same slug or normalized title+year), not an indiscriminate full read
- after every movie addition (single or bulk), update `docs/movie-catalog-reference.md` in the same commit so the catalog stays current
- this catalog-first approach is preferred to reduce unnecessary token usage during agent runs

## Recent curated batch

The repository now includes a curated Argentine canon backfill added through the movie workflow, including titles such as:

- `Camila`
- `Esperando la carroza`
- `Nueve reinas`
- `La ciénaga`
- `El aura`
- `El secreto de sus ojos`
- `Relatos salvajes`
- `Zama`

Use the catalog snapshot as the quick reference for the complete loaded list and current totals.

## Deployment

GitHub Pages deploy workflow:

- `.github/workflows/deploy.yml`

Requirements:

1. Pages source set to `GitHub Actions`
2. Push to `main`

Astro base config (`astro.config.mjs`) should match your actual deployment:

- `site: "https://your-domain.example"`
- `base: "/"`

## Troubleshooting

### Trailer is missing

Check:

- `trailerYoutubeId` exists
- YouTube video is embeddable
- no region/embed restrictions

### Rating block shows config error

Check:

- `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set locally
- GitHub Actions secrets are configured for production builds

### Browser error: Failed to resolve module specifier "@supabase/supabase-js"

If you see this in DevTools:

- verify `@supabase/supabase-js` exists in `dependencies` (not `devDependencies`)
- do not import `@supabase/supabase-js` from an inline Astro script
- import from `src/lib/supabaseClient.ts` instead
- restart dev server (`npm run dev`) after changes

### Build fails

Run:

```bash
npm run build
```

Common causes:

- invalid JSON movie file
- malformed field types
- accidental syntax issues in content/components

### Skill validator fails with `ModuleNotFoundError: yaml`

The official skill validator from the Codex `skill-creator` tool requires `PyYAML` in the local Python used by `python`.

Install:

```bash
python -m pip install PyYAML
```

Then validate:

```bash
python C:\Users\<your-user>\.codex\skills\.system\skill-creator\scripts\quick_validate.py skills\la-posta-cine-auditor
```

### MCP server does not appear in Codex

Check:

- `@supabase/mcp-server-supabase` is installed (or resolvable via `npx`)
- `mcp_servers.supabase` exists in `~/.codex/config.toml`
- `SUPABASE_ACCESS_TOKEN` is set in your OS user env
- VSCode/Codex was restarted after configuration changes

### Quick rating backend check

Minimal verification after SQL setup:

1. Confirm table and view exist in Supabase (`movie_ratings`, `movie_rating_stats`)
2. Insert one test vote through REST with anon key
3. Read `movie_rating_stats` for the same `movie_slug`
4. Remove the test vote

## Security notes (rating)

- No service-role key is used in frontend.
- Frontend uses only Supabase anon/public key.
- Without login, anti-abuse is intentionally basic.
