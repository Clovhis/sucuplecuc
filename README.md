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
- `postCreditsScenes`
- `editorial`
- `awards`
- `country`
- `isArgentinian`

Notas de taxonomía:

- `category` es el carril principal de la película.
- `genres` agrupa señales amplias o secundarias.
- `subgenres` guarda chips editoriales finos y canónicos como `Gore`, `Found Footage`, `Slasher`, `RomCom`, `Body Horror`, `Psicológico`, `Sobrenatural`, `Heist`, `Road Movie`, `Coming of Age`, `Mockumentary` y `Exploitation`.
- En películas de superhéroes Marvel/DC, `postCreditsScenes` es obligatorio: guarda el total verificado de escenas durante o después de créditos; `0` significa que no hay ninguna. No se permiten valores pendientes o sin confirmar.

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
npm run new-movie -- --title "Titulo de la pelicula" --year 2026 --dry-run --json
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

1. Para una alta, ejecutar primero `npm run new-movie -- --title "Titulo de la pelicula" --year 2026 --dry-run --json`: propone un slug y detecta duplicados por slug o título+año sin escribir archivos. Luego crear la entrada con el mismo comando sin `--dry-run`.
2. Editar o completar películas en `src/data/movies`.
3. Regenerar o chequear el catálogo derivado con `npm run catalog:movies` o `npm run catalog:movies:check`.
4. Auditar contenido con `npm run audit:movies:recent` o `npm run audit:movies:all`.
5. Validar salida final con `npm run validate:content`.

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

## Comunidad y MCP de Supabase

La comunidad usa Supabase Anonymous Auth para identificar al navegador sin pedir una cuenta. Los mensajes, respuestas, cambios de apodo, spoilers, reacciones y el listado de actividad se sirven mediante RPCs con `security definer`; el navegador no tiene acceso directo a las tablas.

Los esquemas fuente están en `supabase/sql/`:

- `community_messages.sql`: instalación completa de la comunidad.
- `community_message_reactions.sql`: migración incremental de spoilers, 👍/👎 y autor del último posteo.
- `community_message_limit_300.sql`: baja el máximo de los mensajes a 300 caracteres.
- `movie_ratings.sql`: votos de 1 a 5 estrellas compartidos entre ficha y comunidad.

### Conexión MCP para futuras iteraciones

El proyecto de Supabase es `bftcrexcwktyiqsermni`. En Codex, el servidor MCP se configura fuera del repositorio, en `C:\Users\yosoy\.codex\config.toml`:

```toml
[mcp_servers.supabase]
command = "npx"
args = ["-y", "@supabase/mcp-server-supabase", "--project-ref", "bftcrexcwktyiqsermni"]
startup_timeout_sec = 60
tool_timeout_sec = 180
```

El proceso necesita un PAT de Supabase en la variable de entorno `SUPABASE_ACCESS_TOKEN`. Nunca lo agregues al repo, a `.env`, ni a documentación. Si el MCP no aparece entre las herramientas de la conversación, verificá primero que esa variable exista en el proceso de Codex y reiniciá la sesión; el servidor puede luego listar migraciones, ejecutar SQL de lectura y aplicar una migración incremental.

Antes de aplicar cambios de base en producción:

1. Consultá las migraciones existentes y el esquema afectado.
2. Guardá el delta como un nuevo archivo en `supabase/sql/`; no reejecutes la instalación completa sobre una base existente.
3. Aplicá esa migración con el MCP y verificá las RPCs/campos públicos que consume el cliente.
4. Versioná el archivo SQL junto con el cambio de frontend.

## Deploy

El sitio genera salida estática en `dist/`.

Los próximos estrenos se generan en `src/data/upcomingReleases.generated.ts`. El workflow diario abre un PR cuando la fuente cambia; el deploy publica únicamente el contenido ya versionado en `main`, por lo que la salida es reproducible desde el commit desplegado.

El workflow de publicación actual vive en:

- `.github/workflows/deploy.yml`

## Seguridad

- Mirá `SECURITY.md` para reporte responsable.
- No guardes credenciales administrativas, service-role keys ni archivos de credenciales en este repo.
- Las claves públicas o publishable no se tratan como secretos, pero igual conviene limitar su uso al mínimo necesario.
