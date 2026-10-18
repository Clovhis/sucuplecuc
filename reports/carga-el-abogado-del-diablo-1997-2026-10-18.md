# El abogado del diablo (1997) y publicación del conjunto

Pedido: agregar la película de Keanu Reeves y Al Pacino, publicar las mejoras anteriores y terminar en `main` limpio y sincronizado. Se conserva la rama `fix/tribuna-catalogo-radar-propio` para integrar todo el alcance autorizado, sin crear otra rama ni descartar los cambios anteriores.

## Manifiesto

Una película nueva: `src/data/movies/el-abogado-del-diablo-1997.json`. Dry-run por título localizado, título original y año: sin duplicados. Identidad: *The Devil's Advocate*, 1997, Taylor Hackford, IMDb `tt0118971`, TMDb `1813`. Catálogo resultante: 2.374 películas, después de unificar los dos pares duplicados de la tarea anterior.

## Evidencia del 18/10/2026

| Campo | Fuente y comprobación | Decisión |
| --- | --- | --- |
| Título argentino, reparto, director y edad | [Apple TV Argentina](https://tv.apple.com/ar/movie/el-abogado-del-diablo/umc.cmc.6xlnc88ukwbgt8lxv6hwn24eh): título localizado, Reeves/Pacino/Theron, Hackford, SAM 18. | El abogado del diablo; +18. |
| Plataforma | [JustWatch AR](https://www.justwatch.com/ar/pelicula/pactar-con-el-diablo): HBO Max por suscripción; Apple TV Store para alquilar/comprar, con precios ARS y territorio AR. El enlace oficial de la oferta es `https://play.hbomax.com/show/05e74132-dfa7-40ef-963c-20338f3e1624`; no pudo abrirse con la herramienta web. | `HBO Max`, oferta `FLATRATE`. Se prioriza la suscripción y no se añade la alternativa transaccional como otra suscripción. |
| Score | [RT](https://www.rottentomatoes.com/m/devils_advocate): Popcornmeter 80%, 100.000+ votos; año 1997. | `round(80 / 10) = 8`. Muestra estable; sin tope por incertidumbre. El resultado no requiere elegibilidad de obra maestra ni se eleva por fama del reparto. |
| País y duración | [JustWatch AR](https://www.justwatch.com/ar/pelicula/pactar-con-el-diablo): Alemania/Estados Unidos, 144 min. [RT](https://www.rottentomatoes.com/m/devils_advocate) coincide con 144 min. Apple muestra una duración distinta para su edición, que no sustituye la duración de referencia del largometraje. | `US, DE`; 144 min. No se inventa una fecha argentina de estreno histórica. |
| Género | Apple AR: Terror; RT: terror, fantasía y thriller. El núcleo es una tentación sobrenatural dentro de un estudio jurídico. | Terror principal; Thriller/Drama/Fantasía secundarias; Sobrenatural/Psicológico. No es musical ni bélica. Activa Cagazómetro automáticamente; no se cambia género para forzar otro medidor. |
| Tráiler | [Warner Bros. Rewind, canal verificado](https://www.youtube.com/watch?v=etrZJJC4ox8): tráiler oficial en inglés. Auditoría primaria con YouTube habilitado: aprobada, sin advertencias de oEmbed ni identidad. | `etrZJJC4ox8`. |
| Póster | [IMP Awards, cartel original de 1997](https://www.impawards.com/1997/devils_advocate_ver1.html), con variante grande identificada en la página. [Archivo fuente](https://www.impawards.com/1997/posters/devils_advocate_ver1_xxlg.jpg): HTTP 200, JPEG, 1347×2000, 590.639 bytes. | Arte original en inglés, sin logos ajenos, badges o marcas geográficas. Inspeccionado antes/después de localizar. WebP final 480×713, 46.212 bytes, calidad 84: `public/assets/posters/1997/el-abogado-del-diablo-1997.webp`. |

Recepción consultada como contexto crítico: RT, sin copiar sus reseñas ni consenso. Sinopsis, reseña y los siete campos de `tenSecondTake` escritos desde cero por IA, en español rioplatense, específicos de esta película y sin convertir el score en una plantilla de crítica. No se copiaron ni tradujeron textos publicados.

## Personas y recuperación de media

Se reutilizan cuatro identidades existentes con referencias IMDb/Wikidata y créditos coincidentes con Apple AR/JustWatch: Taylor Hackford (`nm0000431`), Keanu Reeves (`nm0000206`), Al Pacino (`nm0000199`) y Charlize Theron (`nm0000234`). Sus retratos fueron inspeccionados visualmente. Hay director y tres intérpretes principales con nombres completos, fuentes trazables y retratos válidos. No se omitió ningún crédito central por falta de foto; no se crearon personas nuevas.

El enriquecedor actualizó los cuatro registros y descargó nuevamente las imágenes de Hackford/Reeves/Theron desde las mismas fotos identificadas en Wikimedia. Se preservaron expresamente los campos de sexo y sus fuentes ya verificados que el enriquecedor omitía al reconstruir esos registros. La normalización canónica de retratos se ejecutó sin cambios adicionales; el chequeo global aprobó 5.766 retratos. No se modificaron las biografías.

El primer póster de JustWatch AR decía “Pactar con el diablo” y se descartó para evitar el título de España. El arte original de JustWatch US tenía 718×1024 y fue rechazado por el mínimo técnico de 720×1000; el perfil `s1440` respondió HTTP 400. La contingencia consultó TMDb (inaccesible), corrigió la URL de IMP Awards a la variante `ver1` y recuperó la fuente de 1347×2000. No se subió ni amplió artificialmente una miniatura, ni se dejó el fallback. No se usó Watchmode para imágenes, plataformas o texto.

## Supabase: migraciones aplicadas

Se comprobó el proyecto `bftcrexcwktyiqsermni`, esquema de ratings, restricciones, funciones v1, tablas de comunidad e historial de migraciones. Había 207 votos con escala 1–5, una tribuna y ninguna fila de votos/tribunas asociada a los slugs duplicados. Se guardó un respaldo local fuera del repositorio; no se versionan tokens de visitantes, datos personales ni credenciales.

Aplicación mediante la [Management API oficial](https://supabase.com/docs/reference/api/v1-run-a-query), autenticada con la variable segura existente `SUPABASE_ACCESS_TOKEN`, sin imprimirla ni persistirla en el repo:

- `20261018230500` — `movie_ratings_1_to_10`.
- `20261018230501` — `merge_duplicate_movie_threads`.

Cada delta y su registro en `supabase_migrations.schema_migrations` se aplicaron en una misma transacción; se notificó a PostgREST para recargar el esquema. Los archivos SQL versionados son los mismos probados en PostgreSQL local.

Comprobación posterior: los 207 registros anteriores permanecen idénticos en todos sus campos previos y tienen `rating_scale = 5`. Suma almacenada 744; equivalente sobre diez 1.488. La tribuna existente permanece. La serialización JSON se mantuvo igual al comparar timestamps, evitando confundir el formato de respuesta del API con un cambio de datos.

La escritura/lectura v2 con rol `anon` se probó dentro de una transacción revertida: no quedó voto sintético. Las RPCs públicas `get_movie_rating_v2` y `get_movie_rating`, junto con ambas vistas de estadísticas, respondieron HTTP 200 con la clave pública de la aplicación. Se conserva la API 1–5 para clientes antiguos y la nueva interfaz usa v2 sobre diez.

## Validación y publicación

La auditoría explícita de la película, con YouTube habilitado y catálogos ya regenerados, aprobó sin errores ni advertencias. Sólo informa que Drama secundario no activa Lagrimómetro, lo cual es correcto para la categoría Terror. La validación del conjunto conserva los snapshots de recomendadas y próximos estrenos; el Radar propio usa el contrato autorizado en la tarea anterior.

Validación completa del conjunto: `npm run validate:content -- --astro-check` aprobada. Build: 7.975 rutas; sitemap: 5.594 páginas canónicas; originalidad: 759 perfiles aprobados; salida pública sin referencias prohibidas. El chequeo final de tipos, incluyendo las nuevas pruebas, dio cero errores, advertencias y hints.

Pasaron `test:home-automation`, `test:movie-ratings`, `test:editorial-meters`, `test:movie-recommendations`, el control global de retratos y el auditor post-build explícito de la película con comprobaciones de Comunidad, reacción y elegibilidad en carruseles. El póster final fue inspeccionado visualmente a 480 px.

Pruebas de navegador finales sobre los seis archivos pertinentes, separadas en procesos para evitar un bloqueo local al alternar proyectos: escritorio Chromium/WebKit, 28 aprobadas y dos omisiones de pruebas exclusivas de móvil; Chromium móvil, 14 aprobadas y una omisión de autoplay de escritorio; WebKit móvil, 14 aprobadas y una omisión equivalente. Total: 56 aprobadas, cuatro omisiones intencionales, cero fallos funcionales. Las primeras ejecuciones combinadas quedaron sin cerrar y se interrumpieron. La ejecución separada de WebKit móvil también registró los 14 casos aprobados y una omisión, pero requirió interrumpir el cierre del proceso después de finalizar los casos. No se presentan esos procesos interrumpidos como comandos terminados exitosamente; escritorio y Chromium móvil sí terminaron con exit code 0.

Se verifican los cuatro cambios anteriores además del alta nueva: votos 1–10 y errores, restauración entre ficha/tribuna, Radar propio reciente, búsqueda por alias y ficha única, canonical/redirecciones/sitemap, póster y sello De culto de las películas unificadas. La nueva ficha tiene póster cargado con `currentSrc` exacto, reparto y score esperados, una sola coincidencia en búsqueda y tribuna indexable.

La publicación ejecuta el hook obligatorio `pre-push`, que vuelve a validar contenido y build; no se omite. Después del push se comprueban el SHA remoto, el workflow Pages correspondiente, rutas y assets públicos, API de votos y el estado final limpio/sincronizado de `main`. Esa evidencia posterior al commit se informa al cerrar la tarea, evitando insertar el hash de un commit dentro de sí mismo.


El primer `pre-push` detuvo la publicación antes de enviar cambios: la guía de Paprika conservaba el título abreviado y, tras adoptar el título localizado completo, el auditor sólo reconocía una referencia específica de las dos requeridas. Se corrigió el veredicto para nombrar “Paprika, detective de los sueños” junto a Satoshi Kon, sin cambiar la valoración ni otros datos. La auditoría explícita de Paprika aprobó; la auditoría de los siete JSON modificados también quedó sin errores. Sus advertencias incluyen el alcance mixto de UI/rutas autorizado por el usuario y datos/media históricos no modificados, ya diferenciados del alta nueva. Se vuelve a ejecutar el hook completo antes de publicar.
