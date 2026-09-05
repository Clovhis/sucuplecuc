# Contrato de carga de película

Leé sólo la sección que corresponda al dato que estás resolviendo. El auditor es la autoridad para validación mecánica; esta referencia explica decisiones editoriales que no puede inferir.

## Campos y contenido

- Crear `src/data/movies/<slug>.json` con `npm run new-movie -- --title "…" --year YYYY`; usar `--dry-run --json` antes de investigar para obtener slug y detectar duplicados sin escribir.
- `title` es el nombre vigente en Argentina; `originalTitle` conserva el título de origen. Si difieren, comprobar primero plataforma AR, después JustWatch AR, IMDb Argentina y distribuidor/exhibidor local.
- Toda ficha nueva lleva `reviewPublishedAt` con la fecha local de publicación (`YYYY-MM-DD`). Las películas del año actual/futuro, recientes, estrenos o con `isPremiere` necesitan también `releaseDate` exacta AR; no publicar si no se puede confirmar.
- Resolver `audienceRating`: `ATP` o `+edad`. Normalizar TP/G/U/PG/L como `ATP`, PG-13 como `+13`, R como `+17` y TV-MA/NC-17/X como `+18`.
- Usar cartel vertical limpio (nunca thumbnail de YouTube, backdrop, fotograma, logo ni arte con badges). Prioridad: prensa oficial, JustWatch `/poster/.../s718/`, TMDb `w780`, IMDb/Wikimedia. Verificar visualmente antes de cerrar y luego correr `npm run posters:localize -- --movie <slug>`: `poster` debe terminar como `assets/posters/<año>/<slug>.webp`, no como URL externa. El archivo local es WebP, mantiene proporción dentro de 480x720, apunta a 40–80 KiB y nunca puede superar 100 KiB.
- Guardar sólo el ID de un tráiler oficial en idioma original en `trailerYoutubeId`; si no se encuentra, pedir excepción antes de publicar.
- Incluir `awards: { "wins": [] }`. Registrar únicamente victorias verificadas de Oscar, Grammy o Cannes con `award`, `category`, `recipient` y `year`.

## Taxonomía, medidores y veredicto

- `category` es el carril principal; `genres` agrega géneros amplios; `subgenres` agrega chips finos. No cambiar `category` para forzar un medidor.
- Chips canónicos: `Gore`, `Found Footage`, `Slasher`, `RomCom`, `Body Horror`, `Psicológico`, `Sobrenatural`, `Heist`, `Road Movie`, `Coming of Age`, `Mockumentary`, `Exploitation`. Nunca duplicar etiquetas amplias (`Terror`, `Drama`, `Comedia`, `Acción`, `Thriller`) en `subgenres`.
- Filtro editorial `Guerra`: usar la etiqueta exacta `Bélica` dentro de `genres` sólo cuando la guerra, el frente, la operación militar o la experiencia de combate sea el núcleo de la película. `Guerra` sola no activa el filtro porque también aparece en películas donde el conflicto es contexto; no inferir `Bélica` por una mención, el título o una invasión de ciencia ficción. No poner `Bélica` en `subgenres`.
- La cobertura esperada incluye Primera/Segunda Guerra Mundial, Vietnam y otros conflictos u operaciones cuando son el tema central (por ejemplo, *Black Hawk Down*). Excluir romances, espionaje, sátira, dramas políticos, comedias, superhéroes o ciencia ficción donde la guerra sólo funciona como telón de fondo. La auditoría debe verificar tanto inclusiones como omisiones intencionales.
- Medidor automático por `category`, en este orden excluyente: Drama/Romance/Romántica/Comedia romántica → Lagrimómetro; Comedia de risa → Jajámetro; Terror → Cagazómetro; Acción/Accion → Explosiómetro. Nunca agregar campos de medidor.
- `verdict` permitido: `recomendada`, `zafa`, `no_recomendada`, `basura_atomica`. El panel de reacción es automático; no agregar `reaction` ni campos sociales/share. `verdictLabel` debe ser claro, coherente, en mayúsculas salvo indicación y de 21 caracteres o menos.
- Usar `postCreditsScenes` sólo en películas live-action de superhéroes Marvel/DC; debe ser un entero verificado, incluso `0`.

## Plataforma Argentina

1. Consultar JustWatch AR para título + año. Leer sólo las ofertas AR y preferir `FLATRATE`; registrar aparte `RENT`/`BUY` porque una oferta transaccional no equivale a una suscripción.
2. En una carga de estrenos o barrido semanal, construir una matriz con todos los proveedores relevantes para AR: Netflix, HBO Max, Prime Video, Disney Plus, Paramount Plus, Apple TV, Crunchyroll, Mercado Play y `Otras plataformas`. Una ausencia en un proveedor no prueba presencia en otro.
3. Si es ambiguo o contradictorio, confirmar con la página oficial argentina del proveedor. Para cine, usar el revalidador de cartelera.
4. Etiquetas permitidas: `Netflix`, `HBO Max`, `Paramount Plus`, `Apple TV`, `Prime Video`, `Disney Plus`, `Crunchyroll`, `Mercado Play`, `CINE.AR`, `Cine`, `Otras plataformas`.
5. `releasePlatform` es la principal; `releasePlatforms` sólo contiene una segunda oferta AR confirmada (máximo dos en total). `Otras plataformas` es exclusiva y no lleva arreglo.
6. Una oferta legal sólo transaccional puede usarse, pero indicarla como tal en el informe. Sin evidencia AR vigente: `Otras plataformas`.

No inferir un proveedor por el estudio, la franquicia, el país de producción, una ficha global, una fecha de España/Estados Unidos o una redirección internacional. Conservá en el ledger `título + año -> proveedor AR -> tipo de oferta -> URL -> fecha verificada` para que el auditor pueda reproducir la decisión.

## Contrato de batch

- Crear antes de escribir un manifiesto explícito de candidatos con `title`, `year`, `slug`, resultado del dry-run y URLs de evidencia. El manifiesto debe ser la fuente de la lista final, no un glob de archivos ni la memoria del agente.
- Para cada candidato, ejecutar `new-movie --dry-run --json` pasando también `--original-title` cuando difiera del título argentino; confirmar slug y cualquier variante normalizada de título/original-title+año contra catálogo y JSON fuente, y recién después crear el starter. Un título igual con otro año debe quedar anotado como vecino, no descartarse como duplicado.
- No usar filtros automáticos para borrar créditos centrales ni para reemplazarlos con nombres no verificados. Primero congelar el billing confiable y después construir la lista final publicable: un director verificado y al menos dos intérpretes principales con identidad, nacionalidad, referencia trazable y retrato seguro. Ese umbral exacto alcanza para publicar; no existe un requisito oculto de tres intérpretes. Si un crédito opcional, incidental o muy desconocido no pasa el intento acotado de identidad/retrato, omitirlo del `mainCast`, no crearle una entrada nueva en `people.json` y dejar `crédito -> motivo -> evidencia buscada` en el ledger. Si es director, protagonista, ganador de un premio actoral o deja menos de dos intérpretes, la ficha se detiene.
- La secuencia de trailers es obligatoria: auditoría con YouTube habilitado antes del build, corrección de cualquier error de título/año/oEmbed, nueva auditoría habilitada, build y recién entonces auditoría post-build con `--skip-youtube` para Comunidad/Reacciones. `--skip-youtube` no es una validación primaria.
- Las respuestas HTTP 3xx, timeouts o bloqueos regionales son advertencias de evidencia externa y deben quedar reportadas; nunca justifican aceptar un ID que el auditor marca como trailer equivocado.
- En batches, verificar cada URL fuente por HTTP, `Content-Type`, dimensiones y orientación vertical, además del control visual de fuentes ambiguas. Luego localizar cada título con `npm run posters:localize -- --movie <slug>` y correr el verificador local; el patrón de URL no demuestra que la imagen exista ni que el WebP local sea un poster usable.
- Ejecutar el auditor con todos los candidatos explícitos, comparar el conteo del manifiesto con los archivos nuevos reales y repetir el chequeo de duplicados antes del commit.

## Personas y relaciones

- Consultar `docs/person-profile-catalog-reference.md` y `src/data/people.json` antes de crear nombres: reutilizar exactamente los nombres con perfil exclusivo.
- Para cada crédito que queda en director o elenco principal, preservar o completar en `people.json`: nacionalidad breve en español, URL trazable y retrato local verificable en `public/people/`; agregar nacimiento/muerte sólo cuando esté comprobado. Verificar cada identidad con dos señales independientes antes de fijar `imdbId` o mezclar datos de homónimos.
- Inspeccionar visualmente cada retrato nuevo. No usar posters, logos, fotogramas, placeholders ni fotos grupales ambiguas. Una imagen de evento/producción sólo vale si la fuente identifica a la persona y la posición/crop es inequívoca. Los retratos no resueltos de créditos opcionales no se fuerzan: se omite el crédito y se documenta la exclusión.
- En live action se pueden usar 4–5 intérpretes centrales cuando el billing lo permita, sin incluir menores o secundarios incidentales sólo para completar el número; esos créditos adicionales no son obligatorios para pasar. Si un menor es realmente central, incluirlo sólo con fuente pública suficiente y sin forzar un perfil propio. En animación/anime usar voces originales, no doblaje ni personajes.
- Congelar el listado final antes de ejecutar `npm run enrich-people -- --movie <slug> --strict`: el proceso tiene timeout de red acotado, reintentos y modo estricto. Después ejecutar `npm run audit:movie-people -- --movie <slug>`. Missing birth data puede quedar como warning si no existe fuente pública confiable; en las tarjetas y fichas de personas se omite por completo la línea de nacimiento/edad cuando falta el dato y nunca se carga un placeholder textual de ausencia. Falta de retrato, nacionalidad, referencia o identidad es error para cualquier crédito retenido y para el mínimo director + dos intérpretes.
- Completar `editorial.becauseYouLiked` con 1–2 slugs reales y `editorial.related` con 3–4, sin repetir ni enlazar al propio slug. Agregar `runtimeMinutes` cuando se pueda verificar.

## Voz y evidencia

- Investigar en dos tandas: primero ficha oficial/base confiable para metadata, tráiler, elenco y arte; después una única búsqueda dirigida para recepción y otra para AR. No abrir más páginas si la evidencia ya es suficiente.
- Reunir una señal crítica de Variety, THR, IndieWire, RogerEbert, Rotten Tomatoes, Metacritic o IMDb. Es soporte interno: nunca citar la marca ni volcar números en la reseña publicada.
- Escribir sin copiar: sinopsis de 28–90 palabras, específica y sin spoilers; reseña en español rioplatense, al menos 70 palabras y dos oraciones. Con feedback claro del usuario, mantenerla en hasta 5 líneas; sin feedback, 6–8. No usar plantillas, etiquetas de veredicto, menciones a agregadores ni frases intercambiables.

## Derivados y cierre

- Después de altas o cambios, ejecutar `npm run catalog:movies` y `npm run update-upcoming-releases`; comprobar con `npm run catalog:movies:check` que las referencias versionadas coincidan con las fuentes.
- Antes de commit, ejecutar el auditor candidato con YouTube habilitado, `npm run validate:content -- --all --astro-check`, `npm run check`, `npm run build`, el auditor candidato con `--skip-youtube --verify-community-build --verify-reaction-build` y sus verificaciones de rutas/carousels, `npm run validate:public-output` y `npm run validate:sitemap-indexability`. Un build verde no reemplaza la evidencia AR, el audit de personas ni la validación primaria del trailer.
- Ejecutar `git diff --check` y confirmar que la diff queda limitada a películas, people/portraits, perfiles y derivados explícitamente autorizados. Nunca arreglar un fallo de contenido tocando UI, rutas o configuración.
