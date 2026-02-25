# La posta cine

La posta cine is a minimal Astro + GitHub Pages movie review site focused on short, honest, manually curated reviews.

Live production URL:

- `https://clovhis.github.io/sucuplecuc/`

## Features

- Static movie catalog (JSON-based content, no CMS required)
- Movie detail pages by slug (`/peliculas/<slug>/`)
- Embedded YouTube trailer (via `trailerYoutubeId`)
- Verdict badges + optional colloquial `verdictLabel`
- Platform label (`releasePlatform`: Cinema, Netflix, etc.)
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
│  │  └─ movies.ts
│  ├─ pages/
│  │  ├─ index.astro
│  │  └─ peliculas/[slug].astro
│  ├─ styles/
│  │  └─ global.css
│  └─ types/
│     └─ movie.ts
├─ scripts/
│  └─ new-movie.mjs
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
	"year": 2026,
	"poster": "https://... or /posters/local.svg",
	"screenshots": ["https://.../shot-1.jpg", "https://.../shot-2.jpg"],
	"trailerYoutubeId": "abc123",
	"releasePlatform": "Cinema|Netflix|HBO Max|Disney+",
	"verdict": "recomendada|zafa|no_recomendada|basura_atomica",
	"verdictLabel": "Optional display override",
	"review": "Short review (max ~5 lines)"
}
```

### Content notes

- `slug` is the routing key and also the Supabase rating key (`movie_slug`).
- `trailerYoutubeId` stores only the YouTube ID, never full URLs.
- `screenshots` is optional:
  - if at least 2 URLs exist, detail page shows a two-shot gallery
  - otherwise poster fallback is used
- `releasePlatform` is optional but recommended.

## Community rating system (Supabase)

The detail page includes a "Puntuacion de la gente" block with:

- global average (1..5)
- total votes count
- user vote status
- 5 clickable stars
- upsert behavior (user can change vote)

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

### 2) SQL setup

Run this SQL file in Supabase SQL Editor:

- `supabase/sql/movie_ratings.sql`

It creates:

- `public.movie_ratings` table
- unique constraint (`movie_slug`, `visitor_token`)
- indexes
- `updated_at` trigger
- RLS + anon/authenticated SELECT/INSERT/UPDATE policies
- `public.movie_rating_stats` view (avg + vote count)

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

## Deployment

GitHub Pages deploy workflow:

- `.github/workflows/deploy.yml`

Requirements:

1. Pages source set to `GitHub Actions`
2. Push to `main`

Astro base config (`astro.config.mjs`) is set for this repository path:

- `site: "https://clovhis.github.io"`
- `base: "/sucuplecuc"`

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

### Build fails

Run:

```bash
npm run build
```

Common causes:

- invalid JSON movie file
- malformed field types
- accidental syntax issues in content/components

## Security notes (rating)

- No service-role key is used in frontend.
- Frontend uses only Supabase anon/public key.
- Without login, anti-abuse is intentionally basic.

