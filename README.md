# Cine Posta

Sitio estático de reseñas cortas y directas sobre películas, construido con Astro.

## Qué hace

- catálogo estático basado en JSON
- fichas individuales por película
- búsqueda y filtros en cliente
- trailers de YouTube
- rating comunitario 1..5 con Supabase
- bloque de noticias de cine curado desde feeds externos

## Stack

- Astro
- CSS plano
- Supabase para rating público

## Estructura básica

```text
.
├─ src/
├─ public/
├─ supabase/sql/
├─ scripts/
└─ .github/workflows/
```

## Contenido

Las películas viven en `src/data/movies/*.json`.

Campos principales:

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
- `verdict`
- `review`

Campos opcionales frecuentes:

- `releaseDate`
- `releasePlatform`
- `runtimeMinutes`
- `screenshots`
- `trailerYoutubeId`
- `genres`
- `editorial`
- `awards`

## Desarrollo local

Instalación:

```bash
npm install
```

Desarrollo:

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

Playwright desktop/mobile:

```bash
npm run playwright:install
npm run playwright:verify
npm run test:e2e
```

`playwright:install` instala Chromium, Firefox y WebKit en la cache local de Playwright. `test:e2e` corre smoke tests en desktop Chromium/Firefox/WebKit y mobile Chromium/WebKit contra el preview estático en un puerto aislado (`43210` por defecto) para no reutilizar un dev server viejo por accidente.

Validación de contenido:

```bash
npm run validate:content
```

Para activar los hooks locales de Git en este clon:

```bash
npm run hooks:install
```

El hook `pre-push` valida el catálogo generado, audita contenido modificado y corre el build antes de empujar.

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

El sitio genera salida estática. El workflow actual de publicación vive en:

- `.github/workflows/deploy.yml`

## Seguridad

- Mirá `SECURITY.md` para reporte responsable.
- No guardes credenciales administrativas, service-role keys ni archivos de credenciales en este repo.
- Las claves marcadas como públicas o publishable no deben tratarse como secretos, pero igual conviene limitar su uso al mínimo necesario.
