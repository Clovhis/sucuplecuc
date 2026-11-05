# Estrenos en cadenas grandes: 5 al 11 de noviembre de 2026

Consulta: 5/11/2026, Argentina, UTC−3. Ventana: jueves 5 a miércoles 11 inclusive. Se excluyen los estrenos exclusivos de plataformas.

## Alcance actualizado por el usuario

Durante el relevamiento el usuario pidió usar siempre cadenas grandes, Cinemark/Hoyts, IMAX y equivalentes, y dejar de lado los microcines provinciales. La selección final aplica ese criterio a altas, revalidación de Cine y carrusel en CABA y Provincia de Buenos Aires. Se verifican Atlas, Cinemark/Hoyts, Cinemacenter, Showcase, Cinépolis y Multiplex; IMAX requiere identificar la sede. Las salas independientes, INCAA, museos, cineclubes y microcines no sostienen Cine. Se conservan sedes de cadenas grandes fuera del AMBA: la restricción es de exhibidor, no de ciudad.

Las skills de alta, auditoría, cartelera y editorial incorporan la regla. Se sincronizaron repositorio, plugin e instalación global, con validación UTF-8 de las doce copias. AGENTS.md refleja la misma decisión para evitar instrucciones contradictorias.

## Altas y scores

Cinco altas, todas con duplicate-first mediante new-movie, catalogAddedAt real 2026-11-05, sinopsis, reseña y guía originales, póster WebP local y créditos verificados. La lista reproducible está en [new-slugs.json](cine-semana-2026-11-05/new-slugs.json). Los puntajes son normalizaciones de evidencia pública, no notas inventadas ni promedios entre agregadores.

| Película | Fuente consultada el 5/11 | Métrica y muestra | Cálculo | Score |
|---|---|---|---|---:|
| Godzilla Minus Zero (2026) | [IMDb ratings](https://www.imdb.com/title/tt34384661/ratings/); [RT](https://www.rottentomatoes.com/m/godzilla_minus_zero) | IMDb público 8.0/10, 936 votos en la página consultada. RT sin porcentaje de público, 0 verified ratings. | round(8.0)=8; muestra inicial. Watchmode 7.8/10, votos desconocidos, sólo corroboración. No se usa el 89% de crítica. | 8 |
| Entrega al límite / Runner (2026) | [RT](https://www.rottentomatoes.com/m/runner_2026); [productora/distribuidora](https://www.angel.com/movies/runner) | Popcornmeter 89/100, 500+ verified. | round(89/10)=9; tope editorial 8: estreno reciente sin reconocimiento perdurable suficiente para obra maestra. No se usa Tomatometer 78. | 8 |
| Sacrificio: Los elegidos / Sacrifice (2025) | [RT](https://www.rottentomatoes.com/m/sacrifice_2025) | Popcornmeter 35/100, 250+ ratings. | round(35/10)=4. No se sustituye por el 34% de crítica ni Watchmode 5.2. | 4 |
| El gato con sombrero (2026) | [JustWatch AR](https://www.justwatch.com/ar/pelicula/the-cat-in-the-hat); [RT](https://www.rottentomatoes.com/m/the_cat_in_the_hat_2026) | TMDb público 7.2/10 vía JustWatch AR; votos no publicados por esa respuesta. RT sin cifras, IMDb sin nota en la respuesta AR y Watchmode null. | round(7.2)=7; tope de confianza 8 por fuente indirecta/muestra desconocida, sin elevar. No se usa la película de 2003. | 7 |
| Babystar (2025) | [IMDb](https://www.imdb.com/title/tt34998116/); [RT](https://www.rottentomatoes.com/m/babystar) | IMDb público 6.3/10, 141 votos en la página consultada; RT sin cifra de público. | round(6.3)=6; muestra pequeña, tope 8. Watchmode 5.9 y JW 6.1 también redondean a 6, sin promediarlos. | 6 |

Los 9 y 10 se reservaron a obras maestras según la política. El entusiasmo inicial o el nombre de una franquicia no justifican subir una normalización. Los scores de las fichas modificadas sólo por disponibilidad se conservaron; no se reescribieron sus críticas.

## Fechas, metadatos y fuentes

Los cinco estrenan en Argentina el 5/11: [Cinemark](https://www.cinemark.com.ar/elegi-pelicula), [calendario argentino](https://www.cinesargentinos.com.ar/estrenos/2026/11/) y funciones nominales de [chain-cartelera.json](cine-semana-2026-11-05/chain-cartelera.json). El arte internacional de Godzilla anuncia 6/11; la ficha y el texto conservan 5/11 AR y la imagen explicita esa diferencia.

Se consultó Watchmode API, detalles y cast-crew para los cinco, con recuperación por TMDb cuando la búsqueda nominal no fue inequívoca: Godzilla 1877491/tt34384661/TMDb1381071; Runner 1875027/tt31349844/1377237; Sacrifice 1818771/tt32268992/1284186; Cat 1881180/tt2321555/1117898; Babystar 1861372/tt34998116/1356474. Las respuestas sin claves están en [intake.json](cine-semana-2026-11-05/intake.json). La fecha global nunca reemplazó la argentina. Un assistant director o director of photography nunca se convirtió en director de la película.

Países: Godzilla JP, Toho/GKIDS; Runner US según [The Numbers, Production Countries](https://www.the-numbers.com/movie/Runner-%282026-Dir-Scott-Waugh%29), distinguiendo rodaje australiano de nacionalidad; Sacrifice GB, GR, US según [British Council](https://filmsandfestivals.britishcouncil.org/projects/sacrifice1); Cat US según [Warner](https://www.catinthehatmovie.net/); Babystar DE, 2025, según [Mostra](https://mostra.org/en/filmes/babystar) y [sitio oficial](https://www.babystar-film.de/de). Sacrifice y Babystar conservan 2025 por sus estrenos de festival aunque JustWatch las presente como 2026. Se rechazó el homónimo australiano Sacrifice tt28704258 que devolvía la primera búsqueda AR.

Clasificación: Godzilla, ciencia ficción con acción/terror; Runner, acción con thriller/comedia; Sacrifice, comedia negra con acción/aventura; Cat, animación con aventura/fantasía/comedia/Musical; Babystar, drama con comedia. Musical se sostiene en el [booking de exhibición](https://wearespark.com/app/uploads/sites/2/2025/10/Next-on-the-Big-Screen-2025-26.pdf), que describe esta adaptación como musical animado, no en la mera existencia de una banda sonora; se preserva animación como carril. Ninguna alta es Bélica: la posguerra de Godzilla es contexto del desastre, no un relato centrado en combate militar. No se cambió el carril para activar medidores. Terror y acción secundarios de Godzilla, y comedia secundaria de Runner, no activan sus medidores primarios.

Se retienen créditos principales seleccionados: Yamazaki/Kamiki/Hamabe; Waugh/Ritchson/Wilson; Gavras/Evans/Taylor-Joy; Rivinoja/Carloni/Hader/Gomez; Bongard/Bons/Brocks/Lewald. [people.json](cine-semana-2026-11-05/people.json) conserva las fuentes de identidad y retratos. Se inspeccionaron las imágenes y se contrastaron créditos con Watchmode y fuentes independientes. Se corrigieron tamaños heredados de Ritchson y Evans con sus mismos originales atribuibles de Commons; se optimizaron con el comando canónico. No se inventaron nacimiento de Rivinoja ni nacionalidades de Bongard/Lewald: son ausencias opcionales. No se crean perfiles extensos. Los demás créditos de reparto no forman parte de esta selección abreviada, sin pretender un reparto completo.

## Cartelera y carrusel

La matriz final verifica 75 títulos: 70 previamente marcados Cine y las cinco altas. Cada permanencia tiene cadena, sala, localidad, fecha y URL. El inventario anterior con independientes se preservó sólo como descubrimiento y se descartó como criterio de publicación tras la instrucción del usuario.

No se asume que una función fuera de Buenos Aires, una ficha histórica o un resultado CINEMA de JustWatch acrediten una función de una cadena elegible. Las fichas sin función elegible dejan el carrusel; eso no afirma que desaparezcan de todas las salas del país. Las que no tienen oferta AR verificable quedan Otras plataformas, exclusivamente, sin inventar un pase a streaming.

JustWatch AR se consultó en esta ejecución para las fichas revalidadas; [justwatch.json](cine-semana-2026-11-05/justwatch.json) y [justwatch-recovery.json](cine-semana-2026-11-05/justwatch-recovery.json) registran coincidencias y rechazos por identidad. FLATRATE tiene prioridad. Amazon Video y Apple TV Store con RENT/BUY son ofertas transaccionales, no suscripciones. MUBI directo para Campamento Miasma se distingue de MUBI Amazon Channel; no se infiere Flow desde paquetes ni desde otros proveedores. Los enlaces y tipos por título están en la matriz final.

El carrusel se actualiza desde los JSON; no se cambió su componente ni se regeneraron Recomendadas o Próximos estrenos. Radar incorpora la nueva nota en el build a partir del contenido versionado.

## Agenda excluida y recuperación

El baño del Papa, Museo de la subversión, El fantasma y Biografía de Jorge Luis Borges fueron descubiertos y contrastados inicialmente, pero sus funciones en Gaumont/Lugones/MALBA quedan fuera del alcance final de cadenas grandes pedido por el usuario. No se cargaron ni se anunciaron como altas de esta selección. Desentierros empieza en Rosario el 7/11 y en Gaumont el 12/11: tampoco califica.

Stray Kids World Tour RUN IT Live Viewing (7/11) y EXO PLANET #6 EXhOrizon dot in cinemas (8/11) tienen funciones de cadenas dentro del territorio y aparecen como eventos en la nota. No se crean fichas incompletas. Se buscaron las proyecciones exactas en RT/Fandango, IMDb, TMDb, Letterboxd, Filmweb y Metacritic, además de Watchmode con ratings: Stray Kids 11232290/tt48391060/TMDb1795555 devuelve ambos scores null y créditos vacíos; EXO por TMDb1802770 no produce coincidencia inequívoca de Watchmode. No se encontró una valoración numérica utilizable del evento; quedan pendientes por score y créditos mínimos verificados. Se rechazaron explícitamente la nota de un single RUN IT, el videoclip tt43623629 y puntuaciones de conciertos anteriores. Una clasificación de edad PG no es una valoración de calidad.

## Nota e imágenes

La [nota semanal](../src/data/editorials/estrenos-cines-5-noviembre-2026.json) tiene 1099 palabras, cinco minutos, cinco enlaces a fichas, fecha 5/11 y cuatro imágenes locales con variantes de 640 px. Home, archivo y Radar reutilizan el loader existente. Godzilla usa arte oficial atribuido; Runner usa promoción de Angel; Babystar una escena de la mesa familiar publicada por su sitio oficial; Sacrifice una imagen oficial de Joan publicada por Netflix Tudum. Esta última fuente no acredita Netflix AR: Tudum anuncia Estados Unidos y Francia y no se trasladó esa disponibilidad a Argentina. [Procedencia y dimensiones](cine-semana-2026-11-05/editorial-images.json). La atribución no se presenta como una licencia.

Sinopsis, reseñas, guías y nota fueron redactadas desde cero por IA en español rioplatense; no se inventó una experiencia de haber visto las películas ni se copiaron críticas de fuentes. Share, Comunidad, reacciones y código de medidores permanecen intactos.

El publicador editorial de Buffer se amplió únicamente para aceptar guías `estrenos-cines-*` además de `estrenos-streaming-*`, manteniendo cuenta X @cineposta, antiduplicados, imagen local, dos enlaces y límite de 250 caracteres ponderados. El texto de cine tiene 226. La publicación social real se ejecuta después de verificar el deploy y se informa con recibo de Buffer y enlace de X, nunca a partir del dry-run.

## Validación

Auditoría editorial y estructural de las 50 fichas afectadas: cero errores. Las cinco altas pasaron además la auditoría con YouTube activo y la auditoría de personas; los 17 créditos retenidos tienen imágenes decodificables y referencias. Las fichas existentes sólo modificaron plataformas: se compararon todos los demás campos con HEAD y se conservó su formato original. [Auditoría final de Cine/Comunidad/reacción](cine-semana-2026-11-05/audit-cinema-final.json).

Check Astro: 334 archivos, cero errores, advertencias o hints. validate:content aprobado; build final 8257 páginas; salida pública aprobada y sitemap con 5799 canónicas. Política de pósters, medidores, optimización/control global de personas y pruebas de Buffer aprobadas. Las cuatro skills pasaron quick_validate en las tres ubicaciones, con paridad de sus SKILL.md.

Playwright: 114 pruebas aprobadas de editoriales y carruseles, en Chromium escritorio, Chromium móvil y WebKit móvil. Navegador local: 50/50 pósters cargados, cero incorrectos, 35 tarjetas exactas de Cine, cinco enlaces de la nota, imágenes decodificadas, presencia en home/archivo y ausencia de desborde a 320 y 1440 px. El gato con sombrero aparece en Musical. No hay placeholders de nacionalidad/nacimiento en las cinco rutas nuevas. [Resultado](cine-semana-2026-11-05/local-browser.json) y capturas en la misma carpeta. No se modificó UI para alcanzar estos resultados.

Se ejecutó también el control opcional del carrusel de streaming. Su comprobador exige que cada ficha reciente aparezca en home, mientras el selector real tiene un máximo de 12 y reserva plazas para cargas recientes. Por eso señaló cuatro reestrenos históricos (Estación zombie, La bruja, Mamá y Poltergeist) fuera de esa selección. Se contrastó `validateStreamingCarouselBuild` con `getCurrentStreamingMovieReleases`: es una limitación del comprobador frente al límite real, no una ausencia de Cine ni una falla de rutas. Se conserva [el diagnóstico](cine-semana-2026-11-05/audit-built.json); el control pertinente de Cine pasa completo y la suite de carruseles comprueba el contrato real de streaming. No se alteró su selección para forzar la inclusión de esas cuatro películas.

El resultado final es de cinco altas, cuarenta bajas de Cine y 35 películas en el carrusel. Las bajas también reflejan la nueva curaduría de cadenas, no sólo cierres de exhibición. Las ofertas transaccionales se distinguen en la matriz. El manifiesto explícito incluye altas sin commit; no se tomó un diff vacío de main como prueba de cero candidatos. El SHA, Pages y recibo de Buffer se verifican tras publicar.
