# Contrato de carga de película

Leé sólo la sección que corresponda al dato que estás resolviendo. El auditor es la autoridad para validación mecánica; esta referencia explica decisiones editoriales que no puede inferir.

## Campos y contenido

- Crear `src/data/movies/<slug>.json` con `npm run new-movie -- --title "…" --year YYYY`; usar `--dry-run --json` antes de investigar para obtener slug y detectar duplicados sin escribir.
- `title` es el nombre vigente en Argentina; `originalTitle` conserva el título de origen. Si difieren, comprobar primero plataforma AR, después JustWatch AR, IMDb Argentina y distribuidor/exhibidor local.
- Toda ficha nueva lleva `reviewPublishedAt` con la fecha local de publicación (`YYYY-MM-DD`). Las películas del año actual/futuro, recientes, estrenos o con `isPremiere` necesitan también `releaseDate` exacta AR; no publicar si no se puede confirmar.
- Resolver `audienceRating`: `ATP` o `+edad`. Normalizar TP/G/U/PG/L como `ATP`, PG-13 como `+13`, R como `+17` y TV-MA/NC-17/X como `+18`.
- Usar cartel vertical limpio (nunca thumbnail de YouTube, backdrop, fotograma, logo ni arte con badges). Prioridad: prensa oficial, JustWatch `/poster/.../s718/`, TMDb `w780`, IMDb/Wikimedia. Verificar visualmente antes de cerrar.
- Guardar sólo el ID de un tráiler oficial en idioma original en `trailerYoutubeId`; si no se encuentra, pedir excepción antes de publicar.
- Incluir `awards: { "wins": [] }`. Registrar únicamente victorias verificadas de Oscar, Grammy o Cannes con `award`, `category`, `recipient` y `year`.

## Taxonomía, medidores y veredicto

- `category` es el carril principal; `genres` agrega géneros amplios; `subgenres` agrega chips finos. No cambiar `category` para forzar un medidor.
- Chips canónicos: `Gore`, `Found Footage`, `Slasher`, `RomCom`, `Body Horror`, `Psicológico`, `Sobrenatural`, `Heist`, `Road Movie`, `Coming of Age`, `Mockumentary`, `Exploitation`. Nunca duplicar etiquetas amplias (`Terror`, `Drama`, `Comedia`, `Acción`, `Thriller`) en `subgenres`.
- Medidor automático por `category`, en este orden excluyente: Drama/Romance/Romántica/Comedia romántica → Lagrimómetro; Comedia de risa → Jajámetro; Terror → Cagazómetro; Acción/Accion → Explosiómetro. Nunca agregar campos de medidor.
- `verdict` permitido: `recomendada`, `zafa`, `no_recomendada`, `basura_atomica`. El panel de reacción es automático; no agregar `reaction` ni campos sociales/share. `verdictLabel` debe ser claro, coherente, en mayúsculas salvo indicación y de 21 caracteres o menos.
- Usar `postCreditsScenes` sólo en películas live-action de superhéroes Marvel/DC; debe ser un entero verificado, incluso `0`.

## Plataforma Argentina

1. Consultar JustWatch AR para título + año. Leer sólo las ofertas AR y preferir `FLATRATE`.
2. Si es ambiguo o contradictorio, confirmar con la página oficial argentina del proveedor. Para cine, usar el revalidador de cartelera.
3. Etiquetas permitidas: `Netflix`, `HBO Max`, `Paramount Plus`, `Apple TV`, `Prime Video`, `Disney Plus`, `Crunchyroll`, `Mercado Play`, `CINE.AR`, `Cine`, `Otras plataformas`.
4. `releasePlatform` es la principal; `releasePlatforms` sólo contiene una segunda oferta AR confirmada (máximo dos en total). `Otras plataformas` es exclusiva y no lleva arreglo.
5. Una oferta legal sólo transaccional puede usarse, pero indicarla como tal en el informe. Sin evidencia AR vigente: `Otras plataformas`.

## Personas y relaciones

- Consultar `docs/person-profile-catalog-reference.md` y `src/data/people.json` antes de crear nombres: reutilizar exactamente los nombres con perfil exclusivo.
- Para director y elenco principal, preservar o completar en `people.json`: nacionalidad breve en español, URL trazable y retrato local verificable en `public/people/`; agregar nacimiento/muerte sólo cuando esté comprobado. No usar posters, logos, fotogramas ni fotos grupales como retrato.
- En live action usar 4–5 intérpretes centrales cuando el billing lo permita. En animación/anime usar voces originales, no doblaje ni personajes.
- Completar `editorial.becauseYouLiked` con 1–2 slugs reales y `editorial.related` con 3–4, sin repetir ni enlazar al propio slug. Agregar `runtimeMinutes` cuando se pueda verificar.

## Voz y evidencia

- Investigar en dos tandas: primero ficha oficial/base confiable para metadata, tráiler, elenco y arte; después una única búsqueda dirigida para recepción y otra para AR. No abrir más páginas si la evidencia ya es suficiente.
- Reunir una señal crítica de Variety, THR, IndieWire, RogerEbert, Rotten Tomatoes, Metacritic o IMDb. Es soporte interno: nunca citar la marca ni volcar números en la reseña publicada.
- Escribir sin copiar: sinopsis de 28–90 palabras, específica y sin spoilers; reseña en español rioplatense, al menos 70 palabras y dos oraciones. Con feedback claro del usuario, mantenerla en hasta 5 líneas; sin feedback, 6–8. No usar plantillas, etiquetas de veredicto, menciones a agregadores ni frases intercambiables.
