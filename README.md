# Cine Posta

Sitio estático de reseñas cortas sobre películas, construido con Astro y alimentado por contenido versionado en JSON.

## Qué incluye

- catálogo estático en `src/data/movies/*.json`
- páginas individuales de películas y personas
- búsqueda, filtros y subgéneros en cliente
- trailers de YouTube
- medidores editoriales automáticos según taxonomía (`Lagrimómetro`, `Jajámetro`, `Cagazómetro`, `Explosiómetro`, `Sangrómetro`)
- rating público `1..5` con Supabase

## Stack

- Astro 7
- TypeScript
- CSS plano
- Supabase para rating público
- Playwright para smoke tests e2e

## Estructura

```text
.
├─ src/
│  ├─ data/
│  │  ├─ movies/*.json
│  │  ├─ people.json
│  │  └─ personProfiles.ts
│  ├─ components/
│  ├─ lib/
│  ├─ pages/
│  └─ scripts/
├─ public/
├─ docs/
├─ scripts/
├─ skills/
├─ supabase/sql/
└─ tests/
```

## Modelo de contenido

Las películas viven en `src/data/movies/*.json`.

Campos base:

- `slug`
- `title`
- `originalTitle`
- `synopsis`
- `year`
- `category`
- `poster`
- `director`
- `mainCast`
- `productionCompany`
- `audienceRating`
- `verdict`
- `verdictLabel`
- `review`

Campos frecuentes:

- `genres`
- `subgenres`
- `releaseDate`
- `reviewPublishedAt`
- `releasePlatform`
- `releasePlatforms`
- `runtimeMinutes`
- `screenshots`
- `trailerYoutubeId`
- `editorial`
- `awards`
- `country`
- `isArgentinian`

Notas de taxonomía:

- `category` es el carril principal de la película.
- `genres` agrupa señales amplias o secundarias.
- `subgenres` guarda chips editoriales finos y canónicos como `Gore`, `Found Footage`, `Slasher`, `RomCom`, `Body Horror`, `Psicológico`, `Sobrenatural`, `Heist`, `Road Movie`, `Coming of Age`, `Mockumentary` y `Exploitation`.

## Scripts útiles

Desarrollo:

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

Catálogo y contenido:

```bash
npm run catalog:movies
npm run catalog:movies:check
npm run validate:content
npm run validate:public-output
npm run audit:movies:recent
npm run audit:movies:all
npm run audit:movie-people
npm run audit:profiles
```

Playwright:

```bash
npm run playwright:install
npm run playwright:verify
npm run test:e2e
npm run test:e2e:desktop
npm run test:e2e:mobile
```

Otros:

```bash
npm run hooks:install
npm run update-upcoming-releases
npm run enrich-synopsis
npm run enrich-editorial
npm run enrich-people
```

## Flujo recomendado para contenido

1. Editar o agregar películas en `src/data/movies`.
2. Regenerar o chequear el catálogo derivado con `npm run catalog:movies` o `npm run catalog:movies:check`.
3. Auditar contenido con `npm run audit:movies:recent` o `npm run audit:movies:all`.
4. Validar salida final con `npm run validate:content`.

El hook `pre-push`, una vez instalado con `npm run hooks:install`, corre chequeos de catálogo, auditoría de contenido y build antes de empujar.

## Personas y assets

- `src/data/people.json` centraliza metadatos de directores y elenco principal.
- `src/data/personProfiles.ts` contiene perfiles largos para las páginas de personas.
- `public/people/**` guarda retratos cacheados usados por el sitio.
- `docs/movie-catalog-reference.md` y `docs/person-profile-catalog-reference.md` son referencias derivadas y chequeadas por scripts.

## Rating con Supabase

Variables públicas esperadas en `.env`:

```bash
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

No subas secretos reales al repositorio.

Para preparar la base, ejecutá:

- `supabase/sql/movie_ratings.sql`

Ese script:

- crea la tabla `movie_ratings`
- mantiene el agregado `movie_rating_stats`
- expone RPCs para leer y votar
- revoca acceso directo de `anon` a la tabla base

## Deploy

El sitio genera salida estática en `dist/`.

El workflow de publicación actual vive en:

- `.github/workflows/deploy.yml`

## Seguridad

- Mirá `SECURITY.md` para reporte responsable.
- No guardes credenciales administrativas, service-role keys ni archivos de credenciales en este repo.
- Las claves públicas o publishable no se tratan como secretos, pero igual conviene limitar su uso al mínimo necesario.
