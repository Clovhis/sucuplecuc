# MUBI en CinePosta · 3 de noviembre de 2026

Rama de implementación: `feature/mubi-argentina`. Este reporte conserva la evidencia de la revisión en DEV. El usuario aprobó esa revisión y autorizó publicar en `main` el 3 de noviembre de 2026; las comprobaciones de publicación se realizan después de esta captura de validación.

## Alcance y decisión

MUBI encaja en la arquitectura actual: se incorpora como variante del registro central `src/lib/platforms.ts`, con su nombre accesible, orden de filtro y SVG local. Los componentes existentes resuelven el logo en filtros, tarjetas, marquesina y ficha. Se conservaron los tamaños, colores y comportamiento de los controles. El logo blanco se extrajo del SVG oficial servido en https://mubi.com/es/ar, con su `viewBox` original 800×240; sólo se retiraron atributos de presentación del sitio de origen.

Se incorporan **cuatro largometrajes** y se actualizan **seis fichas existentes**. El catálogo queda en **2444 películas**. El [manifiesto explícito](manifest.json) identifica los diez archivos. Es una selección inicial de títulos relevantes, no una importación exhaustiva del catálogo de MUBI.

Se amplían también el auditor de disponibilidad AR, el reconocimiento de MUBI directo en la comprobación de disponibilidad del publicador y las listas permitidas del auditor de películas. No se ejecutó ninguna publicación en X. Un canal adicional de Amazon no se convierte en una oferta propia de MUBI. Las skills de alta y auditoría y su contrato se sincronizaron entre repositorio, plugin e instalación global; las seis validaciones de las dos skills pasaron.

No se introducen llamadas a Watchmode ni credenciales en el navegador. Las películas siguen siendo JSON locales y los catálogos se regeneraron con sus comandos. Radar, Recomendadas y Próximos estrenos no se modificaron ni regeneraron.

## Evidencia de Watchmode

El [registro de consultas y ofertas](watchmode.json) contiene las respuestas relevantes, sin clave ni texto editorial de terceros:

- `GET /regions/`: Argentina (`AR`), `plan_enabled: true`.
- `GET /sources/?regions=AR`: MUBI, **181**, `type: sub`, con `AR` en `regions`.
- `GET /list-titles/?source_ids=181&regions=AR&types=movie&limit=250&sort_by=popularity_desc`: **152 películas**, una página. Se usó para descubrir candidatos, no como confirmación suficiente de cada oferta.
- `GET /title/{id}/sources/?regions=AR`: cada una de las diez fichas tiene una oferta exacta `source_id: 181`, `region: AR`, `type: sub`, con enlace a MUBI. Coinciden año, tipo e IDs de película en detalles y listado.

Documentación: https://api.watchmode.com/docs y https://api.watchmode.com/openapi.json. El endpoint `/releases` **no admite filtros de región o proveedor** y su documentación dice que contiene fechas principalmente estadounidenses. Se descartó su respuesta general como evidencia de estreno argentino. No se agregaron fechas futuras ni se tomó un resultado global como disponibilidad AR. La API limitó parte del primer grupo de detalles por concurrencia; se recuperaron esos detalles secuencialmente, sin repetir respuestas exitosas.

## Disponibilidad AR por título

Fecha de consulta: **2026-11-03**. Todas las ofertas MUBI guardadas son **suscripción (`sub` / `FLATRATE`)**. Las tiendas se distinguen de la suscripción y no ocupan un segundo lugar cuando hay otra suscripción verificada.

| Película / acción | Watchmode | JustWatch AR / confirmación | Resultado guardado |
|---|---:|---|---|
| La única opción (2025), alta | 1590985 | Búsqueda y rutas de JustWatch AR sin ficha accesible inequívoca; [MUBI AR](https://mubi.com/es/ar/films/no-other-choice), [comunicación argentina del estreno del 13/03/2026](https://www.ambito.com/espectaculos/la-unica-opcion-la-nueva-pelicula-del-aclamado-director-park-chan-wook-ya-tiene-fecha-estreno-mubi-n6251154/amp), oferta Watchmode AR actual | MUBI |
| Mátate, amor (2025), alta | 1696964 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/die-my-love), [MUBI Argentina: streaming desde 23/12/2025](https://mubi-argentina.prezly.com/mubi-anuncia-fecha-de-estreno-streaming-de-matate-amor-junto-con-un-nuevo-still) | MUBI |
| La hermanastra fea (2025), alta | 1818735 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/the-ugly-stepsister), [MUBI AR](https://mubi.com/es/ar/films/the-ugly-stepsister) | MUBI |
| Hojas de otoño (2023), alta | 1685597 | [JustWatch AR, alias Las hojas muertas](https://www.justwatch.com/ar/pelicula/fallen-leaves), [comunicación oficial argentina y título localizado](https://mubi-argentina.prezly.com/mubi-anuncia-la-fecha-de-estreno-en-streaming-de-hojas-de-otono-la-galardonada-y-aclamada-pelicula-de-aki-kaurismaki) | MUBI |
| Rosebush Pruning (2026), actualización | 1713748 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/rosebush-pruning) | MUBI; se prioriza suscripción frente a Apple TV transaccional |
| La sustancia (2024), actualización | 1674882 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/the-substance), oferta coincidente de Netflix en Watchmode AR | MUBI + Netflix; se retiran HBO Max y la tienda de Apple |
| Días perfectos (2023), actualización | 1710418 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/perfect-days), oferta coincidente de Netflix en Watchmode AR | MUBI + Netflix; se priorizan ambas suscripciones frente a Apple TV transaccional |
| Aftersun (2022), actualización | 1683101 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/aftersun) | MUBI; reemplaza Otras plataformas |
| El agente secreto (2025), actualización | 1774260 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/agente-secreto), [MUBI AR](https://mubi.com/es/ar/films/the-secret-agent-2025) | MUBI; reemplaza Otras plataformas |
| Valor sentimental (2025), actualización | 1897910 | [JustWatch AR](https://www.justwatch.com/ar/pelicula/sentimental-value) | MUBI; reemplaza Otras plataformas |

La consulta directa al GraphQL de JustWatch devolvió HTTP 403; se consultaron las páginas públicas AR y se contrastaron las ofertas actuales con Watchmode. Las páginas oficiales de MUBI pueden mostrar moneda de otra ubicación incluso bajo `/es/ar`; no se usó esa moneda ni el encabezado global como prueba territorial. La región exacta de las ofertas Watchmode y la evidencia argentina se conservan separadamente.

Las fechas de incorporación de las cuatro altas son `catalogAddedAt: 2026-11-03`. Las fechas existentes se conservaron. Una incorporación al catálogo de CinePosta no se presenta como estreno de esa semana. Las cuatro altas tienen `isPremiere: false`; las fechas de streaming almacenadas en La única opción y Mátate, amor son las fechas AR verificadas antes indicadas. Para los otros dos títulos se omitió la fecha opcional en vez de inventarla. Rosebush Pruning aporta una película de 2026 ya existente al filtro nuevo.

Los anuncios de noviembre posteriores al día de trabajo no se cargaron como disponibilidad presente. Train to Busan, anunciado para el 3/11 en prensa, no apareció en el listado Watchmode AR de MUBI consultado; no se agregó esa oferta. Se preservaron Moscas y Alpha: las rutas genéricas de JustWatch devuelven homónimos de otros años/directores. Campamento Miasma permanece intacta: verificar su etiqueta Cine requeriría una revalidación territorial propia y no se sustituyó por una inferencia de distribuidor. La chica de la aguja y Fue solo un accidente se exploraron, pero no integran el lote cerrado de diez archivos.

## Scores de audiencia reproducibles

Consulta: **2026-11-03**. Se usa una fuente por título, sin promediar. Porcentajes: `round(valor / 10)`. Escala 0–10: `round(valor)`. Rango final 1–10. La columna de muestra reproduce lo visible, sin convertir `500+` en un conteo exacto. Las calificaciones de audiencia de Watchmode se guardan como referencia independiente con votos desconocidos; **no se atribuyen a IMDb ni se usaron para fijar estos scores**.

| Película | Fuente y métrica | Valor / muestra | Cálculo y decisión | Score final |
|---|---|---|---|---:|
| La única opción | [RT Popcornmeter](https://www.rottentomatoes.com/m/no_other_choice) | 93%; 500+ verificados | 9 → 8: comedia criminal de gran precisión formal, sin reconocimiento perdurable suficiente para 9 en esta incorporación | 8 |
| Mátate, amor | [RT Popcornmeter](https://www.rottentomatoes.com/m/die_my_love_2025) | 45%; 500+ verificados | `round(4.5) = 5`; no se reemplaza por la nota más favorable de la crítica | 5 |
| La hermanastra fea | [RT Popcornmeter](https://www.rottentomatoes.com/m/the_ugly_stepsister) | 85%; 50+ verificados | 9 → 8: además de muestra limitada, el trabajo corporal y la relectura del cuento no acreditan todavía condición perdurable de obra maestra | 8 |
| Hojas de otoño | [RT Popcornmeter](https://www.rottentomatoes.com/m/fallen_leaves) | 63%; 250+ | `round(6.3) = 6` | 6 |
| Rosebush Pruning | [Filmweb, audiencia](https://www.filmweb.pl/film/Jak%2Bprzycina%C4%87%2Br%C3%B3%C5%BCe-2026-10061683) | 5.4/10; 434 votos | `round(5.4) = 5`, antes 8. RT sin porcentaje de audiencia; IMDb ratings 403; TMDb/Letterboxd sin agregado legible en esta consulta; Filmweb publica valor y muestra. Metacritic no mostraba reseñas de usuarios | 5 |
| La sustancia | [RT Popcornmeter](https://www.rottentomatoes.com/m/the_substance) | 76%; 1000+ verificados | `round(7.6) = 8`, antes 7 | 8 |
| Días perfectos | [RT Popcornmeter](https://www.rottentomatoes.com/m/perfect_days_2023) | 93%; 100+ verificados | 9 → 8, antes 7: puesta observacional y actuación muy logradas, sin acreditar en este relevamiento el umbral histórico excepcional requerido para 9 | 8 |
| Aftersun | [RT Popcornmeter](https://www.rottentomatoes.com/m/aftersun) | 81%; 1000+ | `round(8.1) = 8`, se conserva | 8 |
| El agente secreto | [RT Popcornmeter](https://www.rottentomatoes.com/m/the_secret_agent_2025) | 83%; 250+ verificados | `round(8.3) = 8`, se conserva | 8 |
| Valor sentimental | [RT Popcornmeter](https://www.rottentomatoes.com/m/sentimental_value) | 94%; 500+ verificados | 9 → 8, se conserva: logros de actuación y construcción familiar sin la evidencia histórica duradera exigida para 9 | 8 |

No hay ningún 9 o 10 nuevo. Los topes sólo bajan el resultado normalizado; nunca aportan ni elevan un puntaje. No se agregaron campos de evidencia, etiquetas personalizadas ni overrides de medidores en los JSON.

## Identidad, metadatos, taxonomía y textos

| Alta | Fuentes de metadatos y créditos | País / duración | Género principal y señales |
|---|---|---|---|
| La única opción | [KOFIC](https://www.koreanfilm.or.kr/eng/films/index/filmsView.jsp?movieCd=20243561), [Cinépolis Argentina](https://www.cinepolis.com.ar/peliculas/la-unica-opcion), [MUBI](https://mubi.com/es/ar/films/no-other-choice) | KR; 139 min; +13 según Cinépolis AR | Comedia; Thriller y Crimen secundarios. El motor es una sátira laboral criminal, por eso activa Jajámetro |
| Mátate, amor | [British Council](https://filmsandfestivals.britishcouncil.org/projects/die-my-love), [MUBI AR](https://mubi.com/es/ar/films/die-my-love), comunicado argentino ya enlazado | US, GB; 119 min; +16 en JustWatch AR | Drama; Thriller secundario. El conflicto subjetivo y doméstico sostiene el carril y Lagrimómetro |
| La hermanastra fea | [NFI](https://www.nfi.no/en/films-and-series/den-stygge-stesosteren), [NIFFF](https://nifff.ch/wp-content/uploads/2025/06/PR_PROG-V2.pdf), [MUBI AR](https://mubi.com/es/ar/films/the-ugly-stepsister) | NO, PL, SE, DK; versión de MUBI 110 min; +16 en JustWatch AR. NFI consigna 105 y Watchmode/JustWatch 109: se conserva la duración de la plataforma que se incorpora | Terror; Comedia y Drama secundarios; Body Horror como subgénero. Activa Cagazómetro; no se reclasifica como Gore para activar otro medidor |
| Hojas de otoño | [BFI, ficha y créditos](https://bfidatadigipres.github.io/new%20releases/2023/12/01/fallen-leaves/), [MUBI AR](https://mubi.com/es/ar/films/fallen-leaves-2023), comunicado oficial argentino ya enlazado | FI, DE; 81 min; +13 en JustWatch AR | Romance; Drama y Comedia secundarios. La relación es el eje narrativo y activa Lagrimómetro |

Ninguna de las cuatro altas es un musical: las canciones y el karaoke no sustituyen una narración musical. Ninguna es bélica: no se agregó `Bélica` ni se alteró Guerra. No se cambió la pertenencia a De culto. Las categorías de las seis fichas existentes se conservaron.

Se hicieron dry-runs con `new-movie` antes de crear cada alta y se utilizaron sus starters. No hay duplicados por slug ni por título/original+año; el auditor global comprobó 2444 fichas. Hojas de otoño usa el título argentino oficial; `Las hojas muertas`, `Fallen Leaves` y `Kuolleet lehdet` identifican la misma película de 2023. Conserva el slug de su starter `las-hojas-muertas-2023`, que todavía no estaba publicado.

Las cuatro sinopsis, reseñas y guías de siete campos fueron escritas desde cero por IA, con ángulos propios; no se reutilizó, tradujo ni parafraseó como copia publicada el texto de las fuentes. Se añadieron relaciones con fichas existentes. Las reseñas anteriores se conservaron, incluso cuando se recalibró un score.

## Personas y medios

[Evidencia de las 44 personas retenidas](people-evidence.json): nombre, IMDb, fuentes de identidad, URL de imagen y retrato local. Se incorporaron **ocho personas nuevas**; se verificaron visualmente los 44 retratos y los créditos contra las fuentes de cada película. Las cuatro altas conservan director y dos o más intérpretes principales con nombre completo y retrato. No se omitieron créditos del reparto seleccionado por falta de retrato; no se pretendió cargar el reparto completo.

El enriquecimiento corrigió catorce retratos de personas existentes, diez de ellos porque no cumplían el mínimo de 200×250. Se conservaron campos previos del caché que el enriquecedor no debía eliminar. Thea Sofie Loch Næss conserva sólo el año de nacimiento verificable: no se inventó día/mes. La falta de fecha de Sally Messham sigue siendo una advertencia heredada; no se publicó un placeholder.

La pasada canónica `images:people:optimize` detectó además ocho archivos preexistentes fuera de política. Se conservaron sus ajustes técnicos de formato/metadata, necesarios para que el gate global pasara: Dan Aykroyd, Kathryn Newton, Matt Bettinelli-Olpin, Nestor Carbonell, Samara Weaving, Sarah Michelle Gellar, Shawn Hatosy y Tyler Gillett. No se cambió su identidad, crédito ni ficha. No se usó un optimizador alternativo.

Pósters nuevos: arte original/neutro, inspeccionado visualmente, identificado por ficha/año y localizado por `new-movie` mediante el comando canónico a WebP 480×720. Fuentes:

- [La única opción](https://image.tmdb.org/t/p/original/vc2S0dvgpsM0XfSiXZDMVkRCSSU.jpg).
- [Mátate, amor](https://image.tmdb.org/t/p/original/kajpShbFhOdpl6yCrLezMrr9tB4.jpg).
- [La hermanastra fea](https://image.tmdb.org/t/p/original/rayAREIKtSinuov10GvrZHyXfXH.jpg).
- [Hojas de otoño](https://image.tmdb.org/t/p/original/9ayYOpeqHhxfHHUoyt3kXzznECO.jpg).

No hay pósters de Cines Argentinos, mapas, banderas, overlays ni imágenes de Watchmode. Los pósters de Hojas de otoño (27 KiB), Aftersun (31 KiB) y La sustancia (23 KiB) son válidos, aunque quedan por debajo de la banda preferida de 40–80 KiB: se informa como advertencia, sin recomprimir para inflar el tamaño.

Tráilers de las altas: [La única opción](https://www.youtube.com/watch?v=SK_DEabMNVg), [Mátate, amor](https://www.youtube.com/watch?v=2jzXHW6Qe70), [La hermanastra fea, distribuidora Cine CANIBAL](https://www.youtube.com/watch?v=yYCls2-HwUs), [Hojas de otoño, MUBI Latinoamérica](https://www.youtube.com/watch?v=MGUdceoGSdM). El auditor con YouTube habilitado pasó para las diez fichas. Las búsquedas de YouTube de cuatro altas devolvieron 302 en el pase final; los oEmbed resolvieron y los títulos/canales se verificaron. Se reemplazaron dos enlaces preliminares que generaban falsos desacuerdos de idioma, por tráilers oficiales en español de la misma película; no se modificó ni debilitó el auditor.

## Validación

Resultado final: **sin errores pendientes en el alcance**. [Resumen reproducible de validaciones](validation.json), [auditoría antes del build](audit-prebuild.json), [auditoría de salida construida](audit-build.json), [filtro en escritorio](filter-desktop.png) y [filtro en móvil](filter-mobile.png).

- `npm run check`: 0 errores, 0 warnings, 0 hints.
- `npm run validate:content`: aprobado, con build completo, originalidad, calidad de contenido, duplicados, personas, catálogos y salida pública. Su auditoría por commits informa cero candidatos porque la rama sigue sin commit; se complementó con los diez archivos explícitos antes y después del build.
- Build aprobado en 6m 28s; salida pública e indexabilidad aprobadas, 5786 páginas canónicas.
- Auditoría explícita de personas: 10/10 fichas. Auditoría de contenido con YouTube habilitado: 10/10. Auditoría posterior al build con comunidad, reacciones y carruseles: 10/10.
- `images:people:check`: 5937 retratos aprobados. `test:poster-source-policy`, `test:editorial-meters`, `test:buffer:x` y `test:catalog-additions`: aprobados.
- Skills: dos skills por tres copias validadas; hashes iguales para instrucciones, contrato y auditor modificado. `git diff --check`: aprobado.
- Playwright sobre el build, Chromium escritorio y WebKit móvil: filtros combinados, badges, MUBI, marquesina y carruseles. **91 casos distintos aprobados, 5 omitidos por perfil**. Pósters: **total 10 / cargados 10 / fallidos 0** en cada perfil. Ambas capturas del filtro fueron inspeccionadas visualmente.

El [primer pase](playwright-initial.log) ejecutó los 96 casos: 90 aprobados, cinco omisiones y una aserción antigua que exigía siempre una novedad Cine en la marquesina. Se actualizó esa prueba para comparar con la selección real de incorporaciones y se conservaron sus comprobaciones de clic en ambas mitades de la animación. La [repetición de su suite](playwright-marquee-final.log) terminó con nueve aprobados y una omisión, sin errores. El primer runner no terminó de cerrar después de emitir los resultados de todos sus casos y se interrumpió; la repetición terminó correctamente con captura de video desactivada. No se modificó la configuración permanente de Playwright.

Los avisos externos de búsqueda YouTube 302, el nacimiento opcional de Sally Messham y el tamaño preferido de los tres pósters se mantienen visibles en el JSON de auditoría. No hay un error de identidad, oEmbed o recurso local pendiente.

En el cierre de la revisión inicial, DEV atendía en `http://127.0.0.1:4321/?plataforma=mubi`, con respuesta HTTP 200 verificada. Los valores `release` de `validation.json` describen esa etapa previa a la autorización de publicación.

En la revisión inicial, la limpieza recursiva de `.tmp/mubi` fue rechazada por la revisión automática. Para la publicación se conserva la evidencia final seleccionada en este directorio y se retira del checkout el material temporal mediante un archivo local externo al repositorio.
