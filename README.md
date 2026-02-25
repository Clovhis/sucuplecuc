# La posta cine

Minimal static movie review site built with Astro and published on GitHub Pages.

Live URL:

- `https://clovhis.github.io/sucuplecuc/`

## What this project is

La posta cine is a manually curated movie catalog.  
Each movie has:

- poster (or visual fallback)
- YouTube trailer embed (by `trailerYoutubeId`)
- short review in Rioplatense Spanish
- verdict badge
- viewing platform label (Cinema / Netflix / etc.)

There is no automatic scraping pipeline for reviews or opinions. Editorial tone and verdicts come from user feedback.

## Tech stack

- Astro (static output)
- Plain CSS (no heavy UI framework)
- JSON content files under `src/data/movies/`
- GitHub Actions for build + deploy to Pages

## Project structure

```text
.
├─ src/
│  ├─ components/
│  │  └─ MovieCard.astro
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
├─ templates/
│  └─ movie.template.json
├─ scripts/
│  └─ new-movie.mjs
└─ .github/workflows/
   └─ deploy.yml
```

## Content model

Movies are file-based JSON entries in:

- `src/data/movies/*.json`

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

Notes:

- `trailerYoutubeId` stores only the YouTube video id, not the full URL.
- `screenshots` is optional:
  - if at least 2 screenshots are available, detail page shows a 2-shot gallery (left column)
  - otherwise poster is used as fallback
- `releasePlatform` is optional but recommended to indicate where to watch.
- `verdictLabel` is optional and overrides the default display label.

## Verdict visual logic

Badge color strategy:

- green: good (`recomendada`)
- yellow: mixed/mediocre (`zafa`, or any label containing "mediocre")
- red: bad (`no_recomendada`)

This allows entries like:

- internal verdict: `no_recomendada`
- display label: `MEDIOCRE`
- visual color: yellow

## Current catalog

At the moment this branch includes:

- Cumbres Borrascosas (Cinema)
- AVATAR: FUEGO Y CENIZAS (Cinema)
- El Botin (The Rip) (Netflix)

## Local development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production output:

```bash
npm run build
```

Preview built site:

```bash
npm run preview
```

## Add a new movie entry

### Option A (recommended): helper script

```bash
npm run new-movie -- --slug "my-movie-2026" --title "My Movie" --year 2026
```

What it does:

- creates `src/data/movies/my-movie-2026.json`
- checks slug format
- validates year range
- prevents duplicate slug

Then manually complete:

- `poster`
- `screenshots`
- `trailerYoutubeId`
- `releasePlatform`
- `verdict` / `verdictLabel`
- `review`

### Option B: template copy

Use:

- `templates/movie.template.json`

Copy it to `src/data/movies/<slug>.json` and fill values manually.

## Editorial workflow

This project follows manual editorial curation:

- no auto-generated final opinions
- reviews must reflect user feedback
- short format, no spoilers
- colloquial Rioplatense tone

## GitHub Pages deployment

Deployment is handled by:

- `.github/workflows/deploy.yml`

Repository setup required:

1. GitHub repository settings
2. `Settings > Pages`
3. Source: `GitHub Actions`

Every push to `main` triggers build and deployment.

## Astro Pages configuration

`astro.config.mjs` should match repository host/path:

- `site: "https://clovhis.github.io"`
- `base: "/sucuplecuc"`

If owner/repo changes, update both values.

## Troubleshooting

### Card click opens 404 on Pages

Most common cause: wrong base-path URL composition.  
Verify links are generated under `/sucuplecuc/...` and not `/sucuplecuc...` (missing slash).

### Trailer not showing

Check:

- `trailerYoutubeId` exists
- id is valid and embeddable
- the video is not region/age/embed restricted

### Build fails

Run:

```bash
npm run build
```

Inspect content JSON for:

- invalid JSON syntax
- unsupported field types
- malformed URLs or missing required fields

## Optional skill-based workflow

The repo also contains a custom skill:

- `la-posta-cine-add-movie`

It can automate safe movie-entry creation with branch/diff/build checks and editorial guardrails.

