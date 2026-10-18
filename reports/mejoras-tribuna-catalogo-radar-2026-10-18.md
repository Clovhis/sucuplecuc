# Mejoras de tribuna, catálogo y Radar — 18/10/2026

Rama: `fix/tribuna-catalogo-radar-propio`. Este reporte documenta la preparación inicial para revisión. El usuario autorizó luego publicar todo y sumar El abogado del diablo; las dos migraciones ya se aplicaron y verificaron. Ver el cierre en `reports/carga-el-abogado-del-diablo-1997-2026-10-18.md`.

## Votos

La ficha y la tribuna comparten diez botones numéricos del 1 al 10, promedio sobre 10, voto seleccionado accesible y mensajes de estado. La grilla de dos filas conserva objetivos táctiles de al menos 44 px. Se desactiva ante una API ausente o caída.

Antes de publicar, aplicar **en la base existente** `supabase/sql/movie_ratings_1_to_10.sql`. El frontend necesita sus RPCs `get_movie_rating_v2`, `submit_movie_rating_v2` y la vista `movie_rating_stats_v2`. Aplicada posteriormente con autorización explícita; ver el reporte de cierre.

La migración agrega la escala de origen a cada voto: los anteriores siguen almacenados como 1–5 y se normalizan al leer (4/5 → 8/10). Los nuevos aceptan cada entero 1–10. Conserva la API antigua para pestañas cacheadas. Se puede repetir sin duplicar la conversión. En las fichas unificadas conserva el voto más reciente por visitante, sin contar dos veces a quien votó en ambas URLs. La instalación completa incorpora el mismo delta.

`npm run test:movie-ratings` ejecuta PostgreSQL local mediante PGlite: conversiones, valores 1/7/10, rechazos 0/11/null, token corto, permisos anon, promedio de escalas mezcladas, clientes antiguos, reintentos y unión de tribunas. No requiere credenciales ni red.

## Duplicados

Catálogo inicial: 2.375 JSON. Resultado: 2.373 películas.

| Ficha retirada | Ficha canónica | Decisión |
| --- | --- | --- |
| `seven-samurai-1954` | `los-siete-samurais-1954` | Título localizado; Acción principal, Drama/Aventura secundarias; conserva 10 y la recomendación de edad +13 que ya tenía la otra ficha, retirando ATP. |
| `paprika-detective-de-los-suenos-2006` | `paprika-2006` | Conserva la URL más antigua y referenciada, créditos, póster, clasificación Anime y score 9. Adopta el título localizado y original japonés. No arrastra la plataforma Apple TV de la ficha retirada sin evidencia AR. |

Se corrigieron recomendaciones internas, perfiles de Kurosawa/Mifune, créditos generados y pertenencia a De culto. La búsqueda reconoce Seven Samurai y Paprika. Las URLs retiradas, incluidas las de sus tribunas y trailers, tienen HTML mínimo con canonical a la ficha conservada y redirección inmediata. Quedan fuera del sitemap. **GitHub Pages sirve HTML estático: esto es meta refresh, no un HTTP 301.** [Contrato de Astro para sitios estáticos](https://v6.docs.astro.build/en/reference/configuration-reference/).

Para reunir mensajes existentes, aplicar también `supabase/sql/merge_duplicate_movie_threads.sql` antes del deploy. Conserva IDs de mensajes, respuestas y sus referencias de reacciones. Probada dos veces sobre PostgreSQL local, incluyendo una pareja con ambas tribunas y otra con sólo la retirada. Aplicada posteriormente con autorización explícita; ver el reporte de cierre.

La revisión cubrió todo el catálogo por título/original + año, director + año + duración y director + año + reparto compartido. Las otras coincidencias de director/reparto corresponden a películas distintas: *Bañeros II* / *Los extermineitors*, *Charlie y la fábrica de chocolate* / *El cadáver de la novia*, y las partes 1/2 de *Madoka Magica*. La coincidencia Tyler Perry/año/duración también corresponde a títulos distintos. Estas señales no garantizan detectar cualquier traducción desconocida. `audit:duplicates`, integrado en `validate:content`, bloquea coincidencias de títulos/originales del mismo año y la reintroducción de los dos alias retirados.

### Identidad y criterio de puntuación

Consulta: 18/10/2026. No se promediaron ni copiaron reseñas de fuentes.

- Los siete samuráis: [BFI, película de 1954](https://www.bfi.org.uk/film/01391b07-5940-5d02-aa47-1158142f2b64/seven-samurai), [BBFC, drama de acción](https://www.bbfc.co.uk/release/seven-samurai-q29sbgvjdglvbjpwwc00otg4ody). [RT](https://www.rottentomatoes.com/m/seven_samurai_1956): Popcornmeter 97%, 50.000+ votos → 10; su URL/año de distribución estadounidense no cambia la identidad japonesa de 1954. Muestra estable, sin tope por muestra pequeña. El 10 se conserva por la puesta espacial del combate, montaje y construcción del grupo como hitos del cine de acción, con reconocimiento duradero documentado por [BFI](https://www.bfi.org.uk/features/seven-samurai-akira-kurosawa-classic-status) y [Sight and Sound 2022](https://whatson.bfi.org.uk/imax/Online/default.asp?BOparam%3A%3AWScontent%3A%3AloadArticle%3A%3Apermalink=seven-samurai-70th-anniversary-imax). No se adopta una clasificación británica como certificado argentino; +13 se conserva de la ficha existente como recomendación del catálogo.
- Paprika: identidad, año y título original comprobados con [Sony Japón](https://www.sonypictures.jp/he/815804) y [Sony Pictures Classics](https://www.sonyclassics.com/paprika/). [RT](https://www.rottentomatoes.com/m/paprika): Popcornmeter 88%, 25.000+ votos → 9; muestra estable, sin tope por muestra pequeña. Conserva 9 por su excepcional montaje de transiciones entre sueño/vigilia y posibilidades expresivas de la animación, con reconocimiento sostenido en la selección [BFI de cine japonés](https://www.bfi.org.uk/lists/great-japanese-film-every-year-from-1925-now) y contextualización en [Sight and Sound](https://www.bfi.org.uk/sight-and-sound/lists/50-key-anime-films). No se eleva a 10.
- Masterplan: conserva el 5 expresamente indicado por el usuario. Se reescriben la reseña y los campos valorativos de la guía breve para reflejar previsibilidad, poca química y recursos visuales flojos. No se modifica la editorial ni se presenta como hecho la impresión del usuario sobre música generada con IA.

No se cambiaron plataformas de las fichas canónicas. Las consultas de JustWatch AR de Los siete samuráis y Paprika no fueron accesibles desde la herramienta; no justifican incorporar proveedores ni afirmar disponibilidad. Se conservó `Otras plataformas`.

## Radar propio

Lee todas las publicaciones de `src/data/editorials/*.json`, sin filtrar por tipo ni `featured`. Hoy hay 23 publicaciones. Selección: fecha descendente, slug para desempatar, hoy y los 29 días anteriores según Argentina, sin fechas futuras ni duplicados; máximo seis tarjetas. Usa portada local y enlaces internos en la misma pestaña. Sin notas recientes, se omite; `/editorial/` conserva el archivo completo.

Se retiraron el colector RSS, el snapshot externo y su script. Cada build incorpora notas nuevas. El workflow diario de las 10:00 AR valida y dispara el deploy existente para retirar notas vencidas, sin commits de datos. Recomendadas y trailers mantienen intactos sus snapshots, generadores y horarios. La fecha de corte se refleja al concluir el deploy, sujeto a demoras de Actions.

Se actualizaron AGENTS, README, arquitectura y pruebas para el nuevo contrato. Las skills no se modificaron.

## Auditorías y límites

El chequeo explícito de personas encontró problemas heredados: retratos de Akira Kurosawa (120×201), Toshirō Mifune (120×161), Takashi Shimura (120×152), Seiji Miyaguchi (120×174) y Tōru Furuya (120×167), por debajo del mínimo 200×250. No se cambiaron esos créditos ni sus imágenes en esta tarea. Masterplan no presenta este problema. Esto impide presentar los títulos clásicos como una revalidación integral de personas aprobada.

La validación editorial global también informa señales secundarias y diferencias históricas entre género principal y primer género, que no justifican reclasificaciones masivas. No se alteraron biografías, fuentes de posters, trailers, scores ajenos ni snapshots de recomendaciones/estrenos.


## Validación final

- `npm run validate:content -- --astro-check`: aprobado, incluidos catálogos, originalidad, auditorías de contenido, tipos, build, salida pública y sitemap. Astro: cero errores, advertencias o hints. Build: 7.972 rutas; sitemap: 5.592 páginas canónicas.
- `npm run test:home-automation`, `npm run test:movie-ratings`, `npm run test:editorial-meters`, `npm run test:movie-recommendations` y `npm run audit:duplicates`: aprobados.
- Ocho archivos E2E en Chromium y WebKit, escritorio y móvil: 120 casos cubiertos; 116 aprobados y cuatro omisiones intencionales por tipo de dispositivo. La ejecución conjunta registró 115 aprobados y cuatro omisiones, y quedó detenida con el caso del carrusel semanal en Chromium móvil sin terminar. Se interrumpió esa ejecución; el único caso pendiente pasó aislado en 1,6 s, sin cambios de código. No se presenta la ejecución conjunta interrumpida como un comando terminado exitosamente.
- Se verificaron votos 1/8/10, persistencia entre ficha y tribuna, promedio sobre 10, errores de lectura/escritura, búsqueda por alias, rutas retiradas de ficha/foro/trailer, canonical y sitemap, pósters cargados, sellos De culto, navegación del Radar, foco, movimiento reducido, anchuras 320–1440 y búsqueda hasta 10.000 registros. Se inspeccionaron las capturas del widget y del Radar en escritorio y móvil.
- `git diff --check`: aprobado. Los snapshots de recomendadas y próximos estrenos no tienen cambios. Ese era el estado de preparación inicial; la autorización posterior de publicación y sus resultados se documentan en el reporte de cierre.
