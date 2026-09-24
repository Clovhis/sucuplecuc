# Relevamiento de cartelera argentina — jueves 24/09/2026

Fecha de consulta: 24/09/2026 (Argentina). Branch: `feature/cartelera-argentina-watchmode-2026-09-24`. Base: `origin/main` en `7fe6c103`.

## Método

Se consultó primero Watchmode API para metadatos y reparto de los estrenos. Para cada título se usó el detalle del título con reparto (`/v1/title/{id}/details/?append_to_response=cast-crew&language=es`), sin guardar ni exponer la clave de API. Watchmode aportó el registro principal cuando hubo coincidencia exacta; se completaron o contrastaron título argentino, estreno local, clasificación, duración y funciones con exhibidores argentinos, Cines Argentinos, Cinenacional y fuentes de distribución. El Get Out no tuvo coincidencia exacta en Watchmode, por lo que sus datos se verificaron con fuentes locales.

Fuentes generales de la fecha:

- [Cartelera de Cines Argentinos, estrenos del 24/09](https://m.cinesargentinos.com.ar/cartelera/)
- [Selector de películas de Cinemark Argentina](https://www.cinemark.com.ar/elegi-pelicula)
- [Cartelera del jueves 24/09 en ¿Hay Lugar?](https://haylugarcine.com.ar/?fecha=2026-09-24)
- [Próximos estrenos de Cinenacional](https://cinenacional.com/listados/estrenos/proximos)

## Películas que ya figuraban en Cine

En la base de `origin/main` había 26 películas con `releasePlatform: "Cine"`. El contraste de funciones del día dejó 24 en Cine y dos fuera de cartelera. *Avengers: Endgame* es un reestreno separado, confirmado para el 24/09, y se mantiene como Cine con Disney Plus como disponibilidad adicional.

| Película | Estado para el 24/09 | Comprobación |
| --- | --- | --- |
| Volver al futuro (1985) | Cine | [LA NACION: funciones en complejos argentinos](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/volver-al-futuro-1985-pe19110) |
| Volver al futuro: Parte II | Salió de cartelera → Prime Video (también Disney Plus) | [LA NACION: últimas funciones listadas el miércoles 23/09](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/volver-al-futuro-parte-ii-pe20359); [JustWatch Argentina: plataformas actuales](https://www.justwatch.com/ar/pelicula/regreso-al-futuro-ii) |
| Volver al futuro: Parte III | Salió de cartelera → Disney Plus (también HBO Max) | [LA NACION: sin funciones disponibles](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/volver-al-futuro-parte-iii-pe20360); [JustWatch Argentina: plataformas actuales](https://www.justwatch.com/ar/pelicula/regreso-al-futuro-iii) |
| Código: Venganza | Cine | [Funciones en salas argentinas](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/codigo-venganza-pe20354) |
| Colony: Zona Cero | Cine | [Cartelera actual de Hoyts Abasto](https://www.lanacion.com.ar/cartelera-de-cine/sala/hoyts-abasto-de-buenos-aires-sa95) |
| Coyote vs. Acme | Cine | [Selector de Cinemark](https://www.cinemark.com.ar/elegi-pelicula) |
| El árbol mágico | Cine | [Cartelera actual de Cinemark Palermo](https://www.lanacion.com.ar/cartelera-de-cine/sala/cinemark-palermo-sa223) |
| El final de la calle Oak | Cine | [Cartelera del jueves 24/09](https://haylugarcine.com.ar/?fecha=2026-09-24) |
| El heladero | Cine | [Funciones en salas argentinas](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/el-heladero-dulce-sabor-a-muerte-pe20355) |
| Hechizo de Amor: La magia continúa | Cine | [Cartelera actual de Cinemark Palermo](https://www.lanacion.com.ar/cartelera-de-cine/sala/cinemark-palermo-sa223) |
| La invitación | Cine | [Cartelera actual de Cinemark Palermo](https://www.lanacion.com.ar/cartelera-de-cine/sala/cinemark-palermo-sa223) |
| La noche del demonio: Están entre nosotros | Cine | [Cartelera actual de Hoyts Abasto](https://www.lanacion.com.ar/cartelera-de-cine/sala/hoyts-abasto-de-buenos-aires-sa95) |
| La Odisea | Cine | [Selector de Cinemark](https://www.cinemark.com.ar/elegi-pelicula) |
| Los mundos de Coraline | Cine; Apple TV Store para alquiler/compra | [LA NACION: funciones del día en Cinemark Palmares (16:00) y San Justo (18:20)](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/coraline-pe10932); [PlayPilot Argentina: Apple TV Store transaccional](https://www.playpilot.com/ar/movie/los-mundos-de-coraline-pptiuWn/) |
| Oasis: Don't Look Back in Anger | Cine | [Funciones en salas argentinas](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/oasis-don-t-look-back-in-anger-pe20357) |
| One Piece: La película | Cine | [Funciones en salas argentinas](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/one-piece-la-pelicula-pe20368) |
| Panda Plan 2: La tribu mágica | Cine | [Funciones en Cinépolis Avellaneda](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/panda-plan-la-tribu-magica-pe20386) |
| PAW Patrol: La Dino Película | Cine | [Cartelera del jueves 24/09](https://haylugarcine.com.ar/?fecha=2026-09-24) |
| Pepita la pistolera | Cine | [Cartelera actual de Cinemark Palermo](https://www.lanacion.com.ar/cartelera-de-cine/sala/cinemark-palermo-sa223) |
| Puella Magi Madoka Magica: La Rebelión | Cine | [Cartelera actual de Hoyts Abasto](https://www.lanacion.com.ar/cartelera-de-cine/sala/hoyts-abasto-de-buenos-aires-sa95) |
| Resident Evil: Noche Cero | Cine | [Selector de Cinemark](https://www.cinemark.com.ar/elegi-pelicula) |
| Spider-Man: Un Nuevo Día | Cine | [Selector de Cinemark](https://www.cinemark.com.ar/elegi-pelicula) |
| Tadeo El Explorador y la Lámpara Maravillosa | Cine | [Cartelera actual de Cinemark Palermo](https://www.lanacion.com.ar/cartelera-de-cine/sala/cinemark-palermo-sa223) |
| Toy Story 5 | Cine | [Cartelera del jueves 24/09](https://haylugarcine.com.ar/?fecha=2026-09-24) |
| Tres adioses | Cine | [Funciones en salas argentinas](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/tres-adioses-pe20334) |
| Yo, Narciso | Cine | [Funciones en salas argentinas](https://www.lanacion.com.ar/cartelera-de-cine/pelicula/yo-narciso-pe20293) |

El reestreno de *Avengers: Endgame* figura para el 24/09 en [Cinemark Argentina](https://www.cinemark.com.ar/pelicula/avengers-endgame-re-estreno) y en la cartelera de [Cines Argentinos](https://m.cinesargentinos.com.ar/cartelera/). Se registró `releasePlatform: "Cine"` y `releasePlatforms: ["Cine", "Disney Plus"]`.

## Estrenos incorporados

| Título cargado | Watchmode | Confirmación argentina / datos locales |
| --- | --- | --- |
| El corazón de la bestia | ID 1927112 | [Cinemark Argentina](https://www.cinemark.com.ar/pelicula/el-corazon-de-la-bestia): estreno 24/09, 1 h 41 min, clasificación INCAA SP. |
| La isla olvidada | ID 1982660 | [Cinemark Argentina](https://www.cinemark.com.ar/pelicula/la-isla-olvidada): estreno 24/09, G, 1 h 49 min. |
| El último gran golpe | Sin coincidencia exacta | [Cinemark Argentina](https://www.cinemark.com.ar/pelicula/el-ultimo-gran-golpe): estreno 24/09, R-13, 1 h 51 min. |
| Bajo tus pies | ID 1747073 | [Cinemark Argentina](https://www.cinemark.com.ar/pelicula/bajo-tus-pies), [ICAA](https://sede.mcu.gob.es/CatalogoICAA/Peliculas/Detalle?pelicula=57618), [RTVE](https://www.rtve.es/play/videos/telediario-2/maribel-verdu-se-estrena-cine-terror-bajo-tus-pies/17061045/). El ICAA y RTVE corroboran producción, créditos y papel principal de Ibai Atanes. |
| Su propio infierno | ID 1985567 | [Cinemark Argentina](https://www.cinemark.com.ar/elegi-pelicula) y [anuncio de distribución local](https://filo.news/noticia/2026/09/08/su-propio-infierno-llega-a-los-cines-argentinos-en-septiembre): funciones/estreno argentino del 24/09. |
| Encantador | ID 1755820 | [Cinemark Argentina](https://www.cinemark.com.ar/pelicula/encantador) y [Cine Gaumont](https://www.cinegaumont.ar/): estreno argentino del 24/09. |
| Hospital Británico | ID 11191286 | [Complejo Teatral de Buenos Aires](https://complejoteatral.gob.ar/ver/Hospital-Brit%C3%A1nico): funciones desde el 24/09; duración 68 min. |
| Los calvos | ID 1803271 | [Cinenacional](https://cinenacional.com/listados/estrenos/proximos) y [Cine Gaumont](https://www.cinegaumont.ar/): estreno del 24/09; [ficha de la película](https://cinenacional.com/pelicula/los-calvos-2024). |

*Éramos tan flacos* se identificó en la cartelera del Gaumont del 24/09 y se dejó afuera de esta carga: los créditos públicos consultados no alcanzaron para cumplir el mínimo de personas identificadas y enriquecidas que requiere la auditoría. *Relajadas y muy peligrosas* tampoco se cargó: no apareció confirmación coincidente en cartelera de exhibidor y fuentes locales para el 24/09.

## Resultado de auditoría — 24/09/2026

La auditoría sin omitir YouTube se ejecutó sobre los ocho estrenos explícitos y terminó con código 0. La revisión editorial pasó para los ocho; la verificación de pósteres locales informó 0 errores, seis aprobados y dos avisos de tamaño por debajo del rango preferido (*Su propio infierno*: 25.274 bytes; *Los calvos*: 35.164 bytes). El control de retratos pasó para 5.355 imágenes.

- Las ocho fichas cumplen el mínimo de créditos verificados: un director y dos intérpretes principales como mínimo. En *Bajo tus pies*, se cargó `nationalityPrimary: "Español"` para Ibai Atanes siguiendo la indicación directa del usuario; no se presenta como una nacionalidad verificada por las fuentes citadas en esta investigación.
- *Los calvos* conserva el crédito verificado de Marcos Mossello como codirector y protagonista. No se encontró un retrato profesional suyo atribuible con seguridad: Cinenacional indica que su foto no está disponible; las imágenes de prensa/festival localizadas son afiches o fotogramas del documental. El retrato de la nota de UNVM corresponde a Krzysztof Kieślowski, no a Mossello. Según la regla actualizada, se omite su ficha de `people.json` sin bloquear la película.
- El retrato de Elías Gismondi se incorporó desde su perfil público de Linktree; su año de nacimiento (1987) y nacionalidad argentina se contrastaron con la nota de Culturamas. El retrato de Ibai Atanes proviene de su agencia Trauko. `images:people:check` pasó.
- La auditoría de películas no detectó errores editoriales, de créditos ni de póster. La nacionalidad y los datos de nacimiento faltantes, y la omisión de un perfil personal insuficientemente sustentado, se informan como advertencias; no bloquean una ficha que cumple el mínimo de créditos. También hubo avisos no bloqueantes por fuentes de retrato fuera de la lista automática de hosts confiables y por las rutas locales de póster, que el verificador local confirmó.
- El tráiler de *Encantador* se cambió al [video oficial en español de 3C Films](https://www.youtube.com/watch?v=KcmipMabP-U), cuyo título coincide con la película; pertenece al canal oficial [3C Films](https://www.youtube.com/@3CFilms-n2h). La auditoría de YouTube ya no marca errores.
- El tráiler de *Bajo tus pies* se actualizó al [enlace compartido por el usuario](https://www.youtube.com/watch?v=GmcHFOS2pPI), identificado en YouTube como “BAJO TUS PIES - TRÁILER OFICIAL (HD)” del canal Cine con Ñ; la descripción menciona a Maribel Verdú, Ibai Atanes y Sofía Otero.

## Validaciones de publicación

- `npm run validate:content -- --all --astro-check --skip-build`: pasó con código 0. Los catálogos derivados, auditorías globales de calidad editorial y perfiles, y `astro check` pasaron; el auditor global recorrió 2.221 películas y reportó advertencias informativas/de catálogo, sin errores.
- La auditoría explícita sin omitir YouTube recorrió los ocho estrenos: 0 errores. `audit:movie-people` pasó para los ocho; las advertencias restantes son datos de nacimiento no publicados para Ibai Atanes y Gloria Peirano, y la omisión deliberada del perfil de Marcos Mossello por falta de datos/portrait seguro.
- `npm run check`: pasó (222 archivos, 0 errores, advertencias o sugerencias).
- `npm run build`: pasó; generó 7.247 páginas estáticas, incluidas las páginas de las ocho películas y sus rutas de trailers.
- `npm run validate:public-output` y `npm run validate:sitemap-indexability`: pasaron; el sitemap contiene 5.025 páginas canónicas.
- `npm run catalog:movies:check`, `npm run catalog:people:check` y `npm run catalog:people:reference:check`: pasaron dentro de la validación integral.
- `npm run posters:check`: verificó 2.221 pósteres locales; 0 errores (1.497 aprobados y 724 advertencias de tamaño, todas dentro de límites válidos).
- `npm run images:people:check`: pasó para 5.355 imágenes.
- Skills de carga, auditoría y perfiles: fuente, plugin y copia local comparados por SHA-256; sin diferencias.
- `git diff --check`: pasó.

## Actualización de puntajes públicos — 24/09/2026

Se ajustaron las skills de carga y auditoría para investigar fuentes públicas en cada alta o revalidación y agotar las calificaciones de audiencia antes de pasar a la crítica: RT Popcornmeter, otros agregadores de audiencia (IMDb, TMDb, Letterboxd, Filmweb y Metacritic User Score) y, sólo sin datos de audiencia numéricos, RT Tomatometer y otros agregados o notas críticas. Se registran tipo de métrica, votos, URL, fecha de consulta y conversión. Escalas: porcentaje/0–100 → `clamp(1, 10, round(valor / 10))`; 0–5 → `clamp(1, 10, round(valor × 2))`; 0–10 → `clamp(1, 10, round(valor))`. Los datos siguientes se consultaron el 24/09/2026 y se registraron en `cinepostaScore`:

| Película | Fuente pública y valor observado | Conversión | Score |
| --- | --- | --- | ---: |
| El corazón de la bestia | [IMDb](https://www.imdb.com/title/tt7526136/): audiencia 7,8/10 (36 votos); [Rotten Tomatoes](https://www.rottentomatoes.com/m/heart_of_the_beast): Popcornmeter con 0 valoraciones verificadas al consultar. Se usa IMDb antes de RT Tomatometer 89% (61 críticas). | 7,8 → 8 | 8 |
| La isla olvidada | [IMDb](https://www.imdb.com/title/tt36583977/ratings/): audiencia 7,6/10 (427 votos); [Rotten Tomatoes](https://www.rottentomatoes.com/m/forgotten_island): Popcornmeter aún sin porcentaje (menos de 50 valoraciones verificadas). Se usa IMDb antes del Tomatometer de RT. | 7,6 → 8 | 8 |
| El último gran golpe | [Rotten Tomatoes](https://www.rottentomatoes.com/m/the_get_out): Popcornmeter 52% (más de 50 valoraciones); Tomatometer 45% (29 críticas) | 52/10 = 5,2 → 5 | 5 |
| Bajo tus pies | [IMDb](https://www.imdb.com/title/tt6215522/): audiencia 4,1/10 (168 votos); no se encontró un puntaje numérico de RT para esta ficha | 4,1 → 4 | 4 |
| Su propio infierno | [Rotten Tomatoes](https://www.rottentomatoes.com/m/her_private_hell): Popcornmeter 35% (más de 100 valoraciones verificadas); Tomatometer 42% (117 críticas) | 35/10 = 3,5 → 4 | 4 |
| Encantador | [IMDb](https://www.imdb.com/es-es/title/tt27673624/): 5,3/10 (62 votos); no se encontró un puntaje numérico de RT para esta ficha | 5,3 → 5 | 5 |
| Hospital Británico | No se encontró agregado numérico de audiencia en [RT](https://www.rottentomatoes.com/search?search=Hospital%20Brit%C3%A1nico), [IMDb](https://www.imdb.com/title/tt44789087/ratings/), [Letterboxd](https://letterboxd.com/film/hospital-britanico-2026/), [TMDb](https://www.themoviedb.org/movie/1711401), Metacritic o Filmweb. Como último recurso se usa la nota explícita 7,0/10 del crítico Juan Pablo Russo en [EscribiendoCine](https://www.escribiendocine.com/noticias/2026/09/22/25345-critica-de-hospital-britanico-una-pelicula-de-gloria-peirano-y-gustavo-fontan-sobre-el-poeta-hector-viel-temperley). | 7,0 → 7 | 7 |
| Los calvos | [Filmweb](https://www.filmweb.pl/film/%C5%81ysi-2024-10062259): audiencia 4,8/10 (12 votos); IMDb y Letterboxd no mostraron un promedio numérico. Muestra pequeña. | 4,8 → 5 | 5 |

Las fuentes RT muestran un porcentaje de aprobación, no un promedio de estrellas; el número aplicado corresponde a la normalización acordada, no a una nota editorial independiente. Las métricas pueden cambiar con nuevas valoraciones y quedan fechadas en este reporte.
