# Cine Posta

Cine Posta is a minimal Astro + GitHub Pages movie review site focused on short, honest, manually curated reviews.

## Features

- Static movie catalog (JSON-based content, no CMS required)
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

## Add a new movie

Recommended helper:

```bash
npm run new-movie -- --slug "my-movie-2026" --title "My Movie" --year 2026
```

Then edit generated JSON fields manually.

Alternative: copy `templates/movie.template.json`.

## Catalog reference for future bulks

The repository includes a snapshot catalog at:

- `docs/movie-catalog-reference.md`

Use it as a quick reference to:

- see all loaded movies (title/year/slug/category/platform)
- detect probable gaps before a bulk load
- avoid obvious duplicates in planning stage

Important:

- source of truth remains `src/data/movies/*.json`
- after bulk additions, update `docs/movie-catalog-reference.md` so future runs start from an up-to-date inventory

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
