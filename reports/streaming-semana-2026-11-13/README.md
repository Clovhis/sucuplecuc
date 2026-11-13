# Estrenos de streaming: 9 al 15 de noviembre de 2026

Corte: viernes 13/11/2026, Argentina (UTC-3). Se usaron las skills de alta, auditoría, editorial, redes sociales y publicación GitHub. No se usaron skills cineposta-cloud- ni subagentes. El usuario autorizó commit y push directos a main.

## Alcance y criterio

- Barrido JustWatch AR, MOVIE, lunes a domingo: 345 registros diarios, paginación agotada; 14 y 15 todavía sin registros. El valor 445 adelantado durante la investigación fue corregido a 345.
- La fecha del feed es detección de incorporación/pase, no prueba de estreno mundial ni garantía de primera exhibición histórica en AR. Se conserva el año original/festival y se evita anunciar futuras ofertas como vigentes.
- 75 candidatos recientes con ofertas no cinematográficas; 33 altas, 14 fichas ya existentes (8 efectivamente modificadas), 11 proveedores exclusivos fuera de los servicios destacados y 17 pendientes/excluidos. Los especiales breves Snoopy y Músicas se agregan como referencia oficial de la guía, sin ficha.
- Se revisaron Netflix, Prime Video, Disney+, HBO Max, Paramount+, Apple TV, MUBI, Crunchyroll, Mercado Play, Flow, CINE.AR y el grupo Otras plataformas. No se confunden canales Amazon adicionales con Prime base.
- Las 11 ofertas exclusivas en Plex/Bloodstream/Sun Nxt/Filmelier/Looke/Adrenalina no se convirtieron en una etiqueta falsa de Prime. Permanecen en manifest.json para revisión fuera de los proveedores destacados del pedido.
- Netflix/Paramount/Disney/Apple/MUBI/HBO/Prime: ver matriz y URLs por título. Cine queda excluido de las altas. CINE.AR Play es streaming argentino y sí entra.

## Plataformas que requieren cautela

- Mercado Play: veamos.tv anuncia Cementerio de mascotas (1989), Terminator 2 (1991) y Psicópata americano (2000) para el 9/11. JustWatch AR no devuelve Mercado Play para esos títulos. La página argentina de Terminator 2 muestra prueba de suscripción con cobro posterior, y la de Cementerio maldito tiene el mismo film pero lectura directa 403. No se confirma nueva disponibilidad gratuita sólo con ese calendario; no se cambian etiquetas.
  - https://veamos.tv/ar/mercado-play/estrenos/
  - https://play.mercadolibre.com.ar/ver/terminator-2-el-juicio-final/843c701539fbde027bc0d0c857d20778
  - https://play.mercadolibre.com.ar/ver/cementerio-maldito/21e4fd14edc34c63bfa35153ba8fb326
- Flow: se revisó la comunicación argentina de noviembre; se distinguieron servicios integrados, señales lineales y alquileres. No se agregó Flow por inclusión de Paramount+/HBO. La muerte de Robin Hood conserva su dato previo, sin presentar el pase del 15/10 como estreno nuevo de noviembre. La bonificación de Coyote vs. Acme vencía el 12/11 y no se anunció como vigente el día 13.
  - https://www.cineteca.com.ar/estrenos-de-flow-noviembre-2026/
  - https://www.micropsiacine.com/2026/10/estrenos-online-critica-de-la-muerte-de-robin-hood-the-death-of-robin-hood-de-michael-sarnoski-flow/
- Crunchyroll: se distinguió el doblaje latino anunciado para Madoka de la incorporación de películas ya disponibles el 8/11. Series/episodios no entran al catálogo de películas. No se encontró una alta cinematográfica nueva inequívoca de esta semana.
- Calendarios complementarios: https://www.cineteca.com.ar/estrenos-streaming-semana-9-al-15-noviembre-2026/ ; anuncios futuros de HBO y Nine no se marcan vigentes antes de que lo confirme AR. Noche de paz figura como serie en el calendario oficial distribuido, por lo que no se usó la película homónima como sustituto.

## Scores

Audiencia RT primero; si no hay porcentaje numérico, IMDb mostrado en JustWatch AR, TMDB API oficial u otros agregados de público. Sin promediar servicios ni seleccionar crítica cuando hay público. Cada fuente y cálculo está en scores.json. Valores inciertos/incipientes y la ausencia de reconocimiento perdurable aplican techo 8; no se crean 9/10 para un estreno por entusiasmo inicial.

| Película | Fuente numérica de público | Normalizado | Final |
|---|---|---:|---:|
| Un buen abogado | [6.4/10 · 447 votos/ratings](https://www.justwatch.com/ar/pelicula/the-good-lawyer) | 6 | 6 |
| Portrait of an Artist: Stephen Curry | [6.5/10 · 60 votos/ratings](https://www.justwatch.com/ar/pelicula/portrait-of-an-artist-stephen-curry) | 7 | 7 |
| Drive Back Home | [6.9/10 · 497 votos/ratings](https://www.justwatch.com/ar/pelicula/drive-back-home) | 7 | 7 |
| Ajuste de Cuentas | [91/100 · 50+ Ratings votos/ratings](https://www.rottentomatoes.com/m/reckless_2026) | 9 | 8 |
| Casa Grande | [69/100 · 100+ Ratings votos/ratings](https://www.rottentomatoes.com/m/casa_grande) | 7 | 7 |
| Avedon | [7.7/10 · 91 votos/ratings](https://www.justwatch.com/ar/pelicula/avedon) | 8 | 8 |
| Psycho Therapy | [58/100 · 50+ Ratings votos/ratings](https://www.rottentomatoes.com/m/psycho_therapy_the_shallow_tale_of_a_writer_who_decided_to_write_about_a_serial_killer) | 6 | 6 |
| Góspel de Navidad | [6.4/10 · 83 votos/ratings](https://www.justwatch.com/ar/pelicula/tyler-perrys-the-gospel-of-christmas) | 6 | 6 |
| Kijsada Paradise | [4.2/10 · 4 votos/ratings](https://www.themoviedb.org/movie/1419036) | 4 | 4 |
| Invocación | [46/100 · 100+ Ratings votos/ratings](https://www.rottentomatoes.com/m/the_surrender) | 5 | 5 |
| Allen | [6.4/10 · 7 votos/ratings](https://www.themoviedb.org/movie/1518204) | 6 | 6 |
| No nos rendimos | [6.9/10 · 8 votos/ratings](https://www.themoviedb.org/movie/1616687) | 7 | 7 |
| El intercambio navideño | [7.4/10 · 8 votos/ratings](https://www.themoviedb.org/movie/1757174) | 7 | 7 |
| La desaparición de Josef Mengele | [6.9/10 · 2172 votos/ratings](https://www.justwatch.com/ar/pelicula/la-desaparicion-de-josef-mengele) | 7 | 7 |
| El vestido | [4.3/10 · 193 votos/ratings](https://www.justwatch.com/ar/pelicula/el-vestido) | 4 | 4 |
| Un Toque de Otro Mundo | [5.1/10 · 1740 votos/ratings](https://www.justwatch.com/ar/pelicula/un-toque-de-otro-mundo) | 5 | 5 |
| Vibe | [7.1/10 · 1524 votos/ratings](https://www.justwatch.com/ar/pelicula/vibe) | 7 | 7 |
| Blue Film | [67/100 · 100+ Ratings votos/ratings](https://www.rottentomatoes.com/m/blue_film) | 7 | 7 |
| Good Night, and Good Luck | [7.9/10 · 661 votos/ratings](https://www.justwatch.com/ar/pelicula/good-night-and-good-luck) | 8 | 8 |
| Ladrones con clase 2 | [73/100 · 250+ Ratings votos/ratings](https://www.rottentomatoes.com/m/high_rollers) | 7 | 7 |
| Resurrection Road | [4.3/10 · 460 votos/ratings](https://www.justwatch.com/ar/pelicula/resurrection-road) | 4 | 4 |
| Heartland | [6.5/10 · 2 votos/ratings](https://www.filmweb.pl/film/Heartland-2026-10134052) | 7 | 7 |
| Siendo Heumann | [7.1/10 · 267 votos/ratings](https://www.justwatch.com/ar/pelicula/siendo-heumann) | 7 | 7 |
| Todos te están mintiendo por dinero | [85/100 · 50+ Ratings votos/ratings](https://www.rottentomatoes.com/m/everyone_is_lying_to_you_for_money) | 9 | 8 |
| Spinal Tap II: El final continúa | [89/100 · 250+ Verified Ratings votos/ratings](https://www.rottentomatoes.com/m/spinal_tap_ii_the_end_continues) | 9 | 8 |
| Pruebas de amor | [6.8/10 · 964 votos/ratings](https://www.justwatch.com/ar/pelicula/15-pruebas-de-amor) | 7 | 7 |
| Más allá del muro | [73/100 · 100+ Ratings votos/ratings](https://www.rottentomatoes.com/m/east_of_wall) | 7 | 7 |
| Daniela Forever | [5.4/10 · 833 votos/ratings](https://www.justwatch.com/ar/pelicula/daniela-forever) | 5 | 5 |
| 300 cartas | [6/10 · 135 votos/ratings](https://www.justwatch.com/ar/pelicula/300cartas) | 6 | 6 |
| El deshielo | [6.7/10 · 275 votos/ratings](https://www.justwatch.com/ar/pelicula/el-deshielo) | 7 | 7 |
| La Venganza de Sweeney Todd | [4/10 · 267 votos/ratings](https://www.justwatch.com/ar/pelicula/la-venganza-de-sweeney-todd) | 4 | 4 |
| Todos los tonos del placer | [3.7/10 · 194 votos/ratings](https://www.justwatch.com/ar/pelicula/todos-los-tonos-del-placer) | 4 | 4 |
| A.J y su extraño colegio | [5.5/10 · 84 votos/ratings](https://www.justwatch.com/ar/pelicula/a-j-y-su-extrano-colegio) | 6 | 6 |
| Turbulencias | [4.9/10 · 3242 votos/ratings](https://www.justwatch.com/ar/pelicula/turbulence) | 5 | 5 |
| La negociación | [77/100 · 250+ Verified Ratings votos/ratings](https://www.rottentomatoes.com/m/dead_mans_wire) | 8 | 8 |
| El corazón de la bestia | [94/100 · 2,500+ Verified Ratings votos/ratings](https://www.rottentomatoes.com/m/heart_of_the_beast) | 9 | 8 |
| Los Archivos Perdidos Del Dr. Romanoski | [8.3/10 · 21 votos/ratings](https://www.justwatch.com/ar/pelicula/los-archivos-perdidos-del-dr-romanoski) | 8 | 8 |
| Jackass: La última y nos vamos | [81/100 · 1,000+ Verified Ratings votos/ratings](https://www.rottentomatoes.com/m/jackass_best_and_last) | 8 | 8 |
| Relajadas y muy peligrosas | [74/100 · 250+ Verified Ratings votos/ratings](https://www.rottentomatoes.com/m/spa_weekend) | 7 | 7 |
| El heladero | [44/100 · 2,500+ Ratings votos/ratings](https://www.rottentomatoes.com/m/ice_cream_man) | 4 | 4 |
| El final de la calle Oak | [76/100 · 2,500+ Verified Ratings votos/ratings](https://www.rottentomatoes.com/m/the_end_of_oak_street) | 8 | 8 |

- Heartland: Filmweb 6.5/10 de 2 votos, 13/11. Se usa público tras agotar RT/IMDb/TMDB/Watchmode; no se usó la reseña profesional 5/10. La muestra minúscula se conserva expresamente, no se presenta como consenso consolidado.
- Psycho Therapy: RT correcto 58% (50+ ratings), normalizado 6. El año 2024 remite a su primera presentación; la distribución comercial 2025 no identifica otra película.
- Todos los tonos del placer: IMDb 3.7/10 mostrado por JustWatch AR (194 votos), 4. El original se conserva transliterado como Vsi vidtinky spokusy, contrastado con el trailer del Festival Cottbus y con el productor Solar Media.

## Identidad, personas y contenido

- No hubo duplicados creados. Dead Man’s Wire / Prime Crime: A True Story se resolvió a la-negociacion-2025; Flowervale Street / The End of Oak Street se resolvió a el-final-de-la-calle-oak-2026. Se preservaron slugs y catalogAddedAt de las fichas históricas.
- Avedon: se revisaron dirección y 23 participantes de Cannes; la selección pasó a seis voces y no confunde el registro parcial de archivo TMDB con el conjunto de entrevistas. El ledger detalla todas las omisiones, sin afirmar menor presencia a partir del orden de una base. https://www.festival-cannes.com/en/f/avedon/
- Good Night, and Good Luck es la captura de Broadway de 2025; el texto y la nota lo distinguen de la película de 2005. A.J. es la película Nickelodeon de 2025, aunque su pase AR sea 2026.
- Annie Chen: identidad nm5573454, actriz taiwanesa-canadiense de Lego Friends y My Weird School, separada de la actriz/modelo taiwanesa nm4174247. Fuente adicional: https://www.onthemictraining.com/vancouver/annie-chen y https://www.imdb.com/name/nm5573454/bio/
- Maya O’Rourke: excepción específica de privacidad infantil; no se usó un recorte de una foto escolar grupal. Se conserva crédito con Inés verificado y sin URI de imagen. El piso de dos intérpretes con foto se cumple con otros integrantes. Las fuentes y búsquedas están en su sidecar.
- Se reemplazaron retratos pequeños de personas efectivamente usadas; se conservaron identidades y datos ajenos. La optimización se hizo sólo con el comando canónico. Fechas de nacimiento y nacionalidades opcionales no verificadas quedan ausentes; sus avisos no se ocultan ni se inventan para limpiar el auditor.
- Las sinopsis, reseñas y siete campos de orientación se escribieron desde cero por IA, con texto específico y voz rioplatense. No se reutilizó texto de las fuentes ni un generador de reseñas. Recomendaciones editoriales: tres conexiones existentes por alta, sin regenerar ediciones semanales.
- Categorías mantenidas por el conflicto principal; señales secundarias no activan medidores por sí solas. La matriz final documenta categoría, géneros y pertenencia a Guerra.
- Las clasificaciones etarias tienen fuente por título en age-evidence.json. Las externas (por ejemplo 14A de Canadá -> +14, +14 chileno y 16+ ucraniano) son referencias de edad, no afirmaciones de certificado legal argentino.

## Solapamiento con salas y carrusel

- El corazón de la bestia recibió oferta de alquiler Prime y conserva Cine. Se corroboró continuidad de funciones en Hoyts Morón (PBA), 13/11 12:30, 14:50 y 19:50, con distribuidor oficial y cartelera por sede. No se le quita Cine para forzar su aparición en streaming.
  - https://uip.com.ar/peliculas/el-corazon-de-la-bestia/
  - https://www.carteleraargentina.com.ar/peliculas/en-el-corazon-de-la-bestia/
- La fila de plataformas se calcula desde las fichas, no desde un snapshot. Máximo 12, ventana de 42 días, cupos de cargas/reseñas recientes y piso con fallback. Exige fecha no futura, plataforma confirmada y trailer; excluye Otras y cualquier ficha que también tenga Cine. Por eso una ficha actualizada no necesariamente aparece en los 12 lugares.
- La marquesina de incorporaciones usa catalogAddedAt. Las altas conservan 13/11; no se retocan fechas de las históricas para empujarlas al carrusel.
- No se cambiaron código de sitio, componentes, Share/Comunidad, reacciones, workflows, automatizaciones X/Instagram, secretos, recomendaciones ni próximos estrenos. El build usó las ediciones versionadas.

## Editorial y redes

- Nota: /editorial/estrenos-streaming-9-al-15-noviembre-2026/. 1.279 palabras, cinco imágenes únicas de obra, cuatro interiores con variantes de 640 y portada sin ampliación, 41 enlaces a fichas y enlaces oficiales de MUBI, Apple/JustWatch. Fotos y fuentes: editorial-images.json. La atribución no se presenta como licencia comercial.
- X: arte propio horizontal. Instagram: Reel de 20 segundos, cuatro escenas con movimiento, gráfica original y música procedural original, sin muestras de películas ni canciones comerciales. Se usan Buffer oficial, My organization, @cineposta y @cineposta.ar; recibos independientes en el informe social. No se mezcla el historial de la automatización diaria.

## Validación y publicación

- Alta y auditoría completas sobre 41 fichas: cero errores. Se comprobaron trailers con YouTube/oEmbed; advertencias de búsqueda y metadatos opcionales no se convirtieron en datos inventados.
- 33 altas con 215/215 personajes principales verificados. 211 personas nuevas; la excepción de retrato de la menor Maya O’Rourke se documenta por privacidad. Los tres personajes heredados de Romanoski se preservaron sin adjudicar IDs por homonimia (inherited-character-gap.json).
- npm run check: cero errores y advertencias, tres hints. validate:content, build (8.761 páginas), catálogos, duplicados, política de pósters, retratos, medidores, salida pública, sitemap y personajes: aprobados. validation.json conserva los resultados.
- Auditoría posterior al build: 41 fichas para Comunidad, reacciones y cartelera; 12 seleccionadas para streaming, ambas sin errores. El verificador auxiliar aplicado a las 41 esperaba que todas las elegibles aparecieran en la home y dio nueve falsos positivos: la selección real tiene máximo 12. Se corrigió el alcance de la comprobación, sin cambiar código ni fechas.
- Playwright Chromium escritorio/móvil: 93 aprobadas, una omitida. QA específica: 41/41 pósters locales decodificados, nota y navegación a 320/1365 px sin desborde y 41 enlaces a fichas. Las 12 imágenes del carrusel se decodificaron en una comprobación adicional (carousel-images.json).
- El puntaje de Heartland usa evidencia pública de audiencia de muestra muy chica, explicitada en scores.json; su duración se corrigió a 114 minutos desde la ficha oficial de Netflix. Snoopy (33 minutos) y Músicas (33 minutos) se mencionan con enlaces oficiales como extras, sin forzar fichas incompatibles con el catálogo.
- El corte es viernes 13: no se anuncian novedades de sábado o domingo sin evidencia vigente. Las 18 exclusiones/pendientes (incluido el corto de MUBI) están en pending.json.
- Los assets sociales finales, con 33 altas y 8 actualizaciones, tienen URL inmutable y hash comprobados en social-hosting.json. Los recibos efectivos de Buffer se guardan en la rama operativa, media/2026-11-13-streaming-social-receipts.json, después de la entrega a main. La música y gráfica son originales.
- Publicación autorizada: se conserva la edición del bot 09f3b278; el cierre exige SHA remoto coincidente y job build de Pages iniciado. No equivale a comprobación de producción.
