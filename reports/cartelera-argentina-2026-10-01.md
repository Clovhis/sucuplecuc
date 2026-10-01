# Cartelera argentina — 1 de octubre de 2026

Branch: `feature/movie-cartelera-ar-2026-10-01`. Base: `b4159cc4` de `main`. Alcance: películas exhibidas en Argentina, de cualquier origen. No se hizo un barrido de estrenos de plataformas. Trabajo local, sin publicación. Las sinopsis y reseñas de las altas fueron escritas desde cero por IA. No cambiaron archivos de código del sitio, Share, Comunidad ni reacciones.

Se cruzaron Cines Argentinos, Cinemark y excepciones de Cinemacenter, Atlas, Gaumont, Lugones y El Cairo. Se cargaron 13 fichas ausentes del catálogo, incluyendo estrenos recientes de septiembre pendientes. Doce tienen Cine vigente. Islandia queda registrada con Otras plataformas porque no se pudo confirmar una función actual. Dos fichas existentes pierden Cine: Colony: Zona Cero y Madoka: La Rebelión. El carrusel resultante contiene 43 películas.

Las 46 fichas involucradas tienen score investigado en fuentes públicas. Cambian 25 scores existentes; ocho mantienen el score y las trece altas se valoran con evidencia. Encantador también corrige el crédito de Alejo Garcia Pintos para coincidir con su perfil canónico.

## Altas

| Película | Año original / estreno AR | Estado | Score | Evidencia de estreno |
| --- | --- | --- | --- | --- |
| [Relajadas y muy peligrosas](../src/data/movies/relajadas-y-muy-peligrosas-2026.json) | 2026 / 2026-10-01 | Cine | 7 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10614-relajadas-y-muy-peligrosas/) |
| [Vértigo 2: Punto muerto](../src/data/movies/vertigo-2-punto-muerto-2026.json) | 2026 / 2026-10-01 | Cine | 6 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10526-vertigo-2/) |
| [Verity: La sombra de un engaño](../src/data/movies/verity-la-sombra-de-un-engano-2026.json) | 2026 / 2026-10-01 | Cine | 6 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10613-verity-la-sombra-de-un-engano/) |
| [Digger](../src/data/movies/digger-2026.json) | 2026 / 2026-10-01 | Cine | 7 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10364-digger/) |
| [Guardianes del museo 2](../src/data/movies/guardianes-del-museo-2-2026.json) | 2026 / 2026-10-01 | Cine | 5 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10408-guardianes-del-museo-2/) |
| [Cuentos del jardín mágico](../src/data/movies/cuentos-del-jardin-magico-2025.json) | 2025 / 2026-10-01 | Cine | 7 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10594-cuentos-del-jardin-magico/) |
| [Linkin Park: Unshatter](../src/data/movies/linkin-park-unshatter-2026.json) | 2026 / 2026-09-30 | Cine | 10 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10600-linkin-park-unshatter/) |
| [Puella Magi Madoka Magica: Walpurgisnacht Rising](../src/data/movies/puella-magi-madoka-magica-walpurgisnacht-rising-2026.json) | 2026 / 2026-10-01 | Cine | 8 | [Ficha AR](https://www.cinemark.com.ar/elegi-pelicula) |
| [Hangar Rojo](../src/data/movies/hangar-rojo-2026.json) | 2026 / 2026-10-01 | Cine | 7 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10615-hangar-rojo/) |
| [Escondida en mi cabeza](../src/data/movies/escondida-en-mi-cabeza-2026.json) | 2026 / 2026-10-01 | Cine | 5 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10612-escondida-en-mi-cabeza/) |
| [Romeo y Ofelia](../src/data/movies/romeo-y-ofelia-2024.json) | 2024 / 2026-09-10 | Cine | 7 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10586-romeo-y-ofelia/) |
| [Islandia](../src/data/movies/islandia-2025.json) | 2025 / 2026-09-11 | Otras plataformas | 6 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10584-islandia/) |
| [Una quinta en Portugal](../src/data/movies/una-quinta-en-portugal-2025.json) | 2025 / 2026-09-03 | Cine | 7 | [Ficha AR](https://m.cinesargentinos.com.ar/pelicula/10569-una-quinta-en-portugal/) |

## Puntajes: fuente, escala y conversión

Consulta: 01/10/2026. Se prioriza audiencia numérica de Rotten Tomatoes y luego otra audiencia verificable. No se mezcla audiencia con críticos ni se promedian fuentes. Porcentajes: redondeo del porcentaje / 10; escala de 5: ×2 y redondeo; escala de 10: redondeo. Las etiquetas las deriva el sitio de `cinepostaScore`.

IMDb se verificó por identidad de título/ID y por su [dataset oficial de ratings](https://datasets.imdbws.com/title.ratings.tsv.gz), cuya última actualización declarada es 30/09/2026; sus páginas de ficha respondieron 403. El dataset permite distinguir rating de usuarios y cantidad de votos. Rotten Tomatoes sin número de audiencia, incluso con Tomatometer disponible, no se trató como puntaje de público.

| Película | Antes → ahora | Valor original | Tipo / cantidad | Conversión | Fuente |
| --- | --- | --- | --- | --- | --- |
| La invitación | 7 → 9 | 89/100 | Audiencia; 1,000+ Verified Ratings | round(89 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/the_invite) |
| Avengers: Endgame | 8 → 10 | 96/100 | Audiencia; 2,500+ Verified Ratings | round(96 * 10 / 100) = 10 | [Fuente](https://www.rottentomatoes.com/m/avengers_endgame) |
| La Odisea | 8 → 10 | 96/100 | Audiencia; 25,000+ Verified Ratings | round(96 * 10 / 100) = 10 | [Fuente](https://www.rottentomatoes.com/m/the_odyssey_2026) |
| El final de la calle Oak | 7 → 8 | 76/100 | Audiencia; 2,500+ Verified Ratings | round(76 * 10 / 100) = 8 | [Fuente](https://www.rottentomatoes.com/m/the_end_of_oak_street) |
| Toy Story 5 | 8 → 9 | 94/100 | Audiencia; 10,000+ Verified Ratings | round(94 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/toy_story_5) |
| Spider-Man: Un Nuevo Día | 8 → 10 | 97/100 | Audiencia; 25,000+ Verified Ratings | round(97 * 10 / 100) = 10 | [Fuente](https://www.rottentomatoes.com/m/spider_man_brand_new_day) |
| Pepita la pistolera | 8 → 6 | 5.9/10 | Audiencia; 74 | round(5.9 * 10 / 10) = 6 | [Fuente](https://www.imdb.com/title/tt29943166/) |
| PAW Patrol: La Dino Película | 5 → 10 | 95/100 | Audiencia; 500+ Verified Ratings | round(95 * 10 / 100) = 10 | [Fuente](https://www.rottentomatoes.com/m/paw_patrol_the_dino_movie) |
| Colony: Zona Cero | 8 → 9 | 93/100 | Audiencia; 250+ Verified Ratings | round(93 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/colony) |
| La noche del demonio: Están entre nosotros | 5 → 7 | 69/100 | Audiencia; 1,000+ Verified Ratings | round(69 * 10 / 100) = 7 | [Fuente](https://www.rottentomatoes.com/m/insidious_out_of_the_further) |
| Coyote vs. Acme | 8 → 9 | 94/100 | Audiencia; 2,500+ Verified Ratings | round(94 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/coyote_vs_acme) |
| Yo, Narciso | 5 → 6 | 5.6/10 | Audiencia; 187 | round(5.6 * 10 / 10) = 6 | [Fuente](https://www.imdb.com/title/tt38573778/) |
| Tadeo El Explorador y la Lámpara Maravillosa | 8 → 7 | 6.5/10 | Audiencia; 229 | round(6.5 * 10 / 10) = 7 | [Fuente](https://www.imdb.com/title/tt36164852/) |
| Código: Venganza | 5 → 9 | 85/100 | Audiencia; 1,000+ Verified Ratings | round(85 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/mutiny_2026) |
| Oasis: Don't Look Back in Anger | 8 → 10 | 98/100 | Audiencia; 250+ Verified Ratings | round(98 * 10 / 100) = 10 | [Fuente](https://www.rottentomatoes.com/m/oasis_dont_look_back_in_anger) |
| El heladero | 5 → 5 | 46/100 | Audiencia; 100+ Verified Ratings | round(46 * 10 / 100) = 5 | [Fuente](https://www.rottentomatoes.com/m/ice_cream_man_2026) |
| Hechizo de Amor: La magia continúa | 8 → 9 | 91/100 | Audiencia; 2,500+ Verified Ratings | round(91 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/practical_magic_2) |
| El árbol mágico | 7 → 8 | 81/100 | Audiencia; 250+ Verified Ratings | round(81 * 10 / 100) = 8 | [Fuente](https://www.rottentomatoes.com/m/the_magic_faraway_tree) |
| Bajo tus pies | 4 → 4 | 4/10 | Audiencia; 271 | round(4 * 10 / 10) = 4 | [Fuente](https://www.imdb.com/title/tt6215522/) |
| Resident Evil: Noche Cero | 8 → 9 | 91/100 | Audiencia; 5,000+ Verified Ratings | round(91 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/resident_evil_2026) |
| One Piece: La película | 5 → 7 | 6.8/10 | Audiencia; 10181 | round(6.8 * 10 / 10) = 7 | [Fuente](https://www.imdb.com/title/tt0814243/) |
| Puella Magi Madoka Magica: La Rebelión | 8 → 9 | 89/100 | Audiencia; 250+ Ratings | round(89 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/puella_magi_madoka_magica_the_movie_rebellion) |
| Tres adioses | 7 → 7 | 7.1/10 | Audiencia; 1388 | round(7.1 * 10 / 10) = 7 | [Fuente](https://www.imdb.com/title/tt35705184/) |
| Panda Plan 2: La tribu mágica | 5 → 4 | 4.4/10 | Audiencia; 687 | round(4.4 * 10 / 10) = 4 | [Fuente](https://www.imdb.com/title/tt35514520/) |
| Hospital Británico | 7 → 7 | 7/10 | Crítica individual: Juan Pablo Russo; 1 | round(7 * 10 / 10) = 7 | [Fuente](https://www.escribiendocine.com/noticias/2026/09/22/25345-critica-de-hospital-britanico-una-pelicula-de-gloria-peirano-y-gustavo-fontan-sobre-el-poeta-hector-viel-temperley) |
| El corazón de la bestia | 8 → 9 | 94/100 | Audiencia; 1,000+ Verified Ratings | round(94 * 10 / 100) = 9 | [Fuente](https://www.rottentomatoes.com/m/heart_of_the_beast) |
| El último gran golpe | 5 → 5 | 50/100 | Audiencia; 50+ Ratings | round(50 * 10 / 100) = 5 | [Fuente](https://www.rottentomatoes.com/m/the_get_out) |
| Los calvos | 5 → 5 | 4.8/10 | Audiencia; 12 | round(4.8 * 10 / 10) = 5 | [Fuente](https://www.filmweb.pl/film/Łysi-2024-10062259) |
| La isla olvidada | 8 → 10 | 96/100 | Audiencia; 500+ Verified Ratings | round(96 * 10 / 100) = 10 | [Fuente](https://www.rottentomatoes.com/m/forgotten_island) |
| Encantador | 5 → 5 | 5.3/10 | Audiencia; 62 | round(5.3 * 10 / 10) = 5 | [Fuente](https://www.imdb.com/title/tt27673624/) |
| Relajadas y muy peligrosas | Alta → 7 | 73/100 | Audiencia; 250+ Verified Ratings | round(73 * 10 / 100) = 7 | [Fuente](https://www.rottentomatoes.com/m/spa_weekend) |
| Vértigo 2: Punto muerto | Alta → 6 | 63/100 | Audiencia; 250+ Verified Ratings | round(63 * 10 / 100) = 6 | [Fuente](https://www.rottentomatoes.com/m/fall_2_deadpoint) |
| Verity: La sombra de un engaño | Alta → 6 | 2.82/5 | Audiencia; 15547 | round(2.82 * 10 / 5) = 6 | [Fuente](https://letterboxd.com/film/verity-2026/) |
| Digger | Alta → 7 | 3.66/5 | Audiencia; 9631 | round(3.66 * 10 / 5) = 7 | [Fuente](https://letterboxd.com/film/digger-2026/) |
| Su propio infierno | 4 → 4 | 35/100 | Audiencia; 100+ Verified Ratings | round(35 * 10 / 100) = 4 | [Fuente](https://www.rottentomatoes.com/m/her_private_hell) |
| Guardianes del museo 2 | Alta → 5 | 5.2/10 | Audiencia; 74 | round(5.2 * 10 / 10) = 5 | [Fuente](https://www.imdb.com/title/tt30224625/) |
| Cuentos del jardín mágico | Alta → 7 | 6.7/10 | Audiencia; 150 | round(6.7 * 10 / 10) = 7 | [Fuente](https://www.imdb.com/title/tt10312938/) |
| Linkin Park: Unshatter | Alta → 10 | 98/100 | Audiencia; 100+ Ratings | round(98 * 10 / 100) = 10 | [Fuente](https://www.rottentomatoes.com/m/linkin_park_unshatter) |
| Puella Magi Madoka Magica: Walpurgisnacht Rising | Alta → 8 | 7.7/10 | Audiencia; 185 | round(7.7 * 10 / 10) = 8 | [Fuente](https://www.imdb.com/title/tt14521412/) |
| Hangar Rojo | Alta → 7 | 7.3/10 | Audiencia; 219 | round(7.3 * 10 / 10) = 7 | [Fuente](https://www.imdb.com/title/tt37664358/) |
| Escondida en mi cabeza | Alta → 5 | 5/10 | Crítica individual: Laia Cabuli; 1 | round(5 * 10 / 10) = 5 | [Fuente](https://www.escribiendocine.com/noticias/2026/09/29/25546-critica-de-escondida-en-mi-cabeza-nicolas-furtado-entre-las-segundas-oportunidades-y-el-paso-a-la-adultez) |
| Romeo y Ofelia | Alta → 7 | 7/10 | Crítica individual: Maximiliano Curcio; 1 | round(7 * 10 / 10) = 7 | [Fuente](https://cinefreaks.net/2026/09/10/romeo-y-ofelia-los-colores-de-la-maldad/) |
| Islandia | Alta → 6 | 6/10 | Crítica individual: Juan Pablo Russo; 1 | round(6 * 10 / 10) = 6 | [Fuente](https://www.escribiendocine.com/noticias/2026/09/10/25007-critica-de-islandia-el-lugar-donde-la-musica-se-vuelve-paisaje) |
| Canelones | 5 → 6 | 6/10 | Audiencia; 179 | round(6 * 10 / 10) = 6 | [Fuente](https://www.imdb.com/title/tt16155872/) |
| Los domingos | 9 → 7 | 7.3/10 | Audiencia; 5422 | round(7.3 * 10 / 10) = 7 | [Fuente](https://www.imdb.com/title/tt35513027/) |
| Una quinta en Portugal | Alta → 7 | 6.9/10 | Audiencia; 1681 | round(6.9 * 10 / 10) = 7 | [Fuente](https://www.imdb.com/title/tt28090350/) |

Hospital Británico, Escondida en mi cabeza, Romeo y Ofelia e Islandia usan una crítica individual numérica, identificada en la tabla: no representan un consenso de audiencia. Se revisaron RT, IMDb, Letterboxd y búsquedas de Filmweb/Metacritic sin hallar otro agregado de público numérico para esas obras. TMDB no pudo verificarse (IDs 1711401, 1760646 y 1287904 para las tres primeras); no se inventó un valor a partir de comentarios ni de estrellas sin escala legible. Las muestras pequeñas de audiencia quedan visibles en la tabla.

## Disponibilidad argentina y bajas

La prueba de exhibición es una programación local vigente, no el país de producción ni el estudio. Los listados amplios pueden retener estrenos ya terminados: se cruzaron con funciones de salas. Para las bajas se consultó primero JustWatch AR y luego las cadenas/salas argentinas. Otras plataformas significa que no hay proveedor legal AR verificable en este relevamiento; no se asignaron ofertas extranjeras ni series homónimas.

- **Toy Story 5:** Cartelera oficial de Cinemacenter al 01/10; conserva Cine y Disney+ ya existentes. [Fuente 1](https://www.cinemacenter.com.ar/), [Fuente 2](https://www.justwatch.com/ar/pelicula/toy-story-5).
- **El final de la calle Oak:** Cartelera oficial de Atlas y tickets AR de Cinemacenter/Showcase. [Fuente 1](https://atlascines.com/cartelera/cartelera), [Fuente 2](https://www.justwatch.com/ar/pelicula/the-end-of-oak-street).
- **Pepita la pistolera:** Cartelera oficial de Cinemacenter vigente; conserva Cine. [Fuente 1](https://www.cinemacenter.com.ar/), [Fuente 2](https://m.cinesargentinos.com.ar/cartelera/).
- **Hospital Británico:** Sala Leopoldo Lugones, función del 01/10 a las 18:00. [Fuente 1](https://complejoteatral.gob.ar/ver/Hospital-Brit%C3%A1nico).
- **Los calvos:** Título presente en la programación vigente de Gaumont, verificada en la respuesta de la página oficial. [Fuente 1](https://www.cinegaumont.ar/).
- **Romeo y Ofelia:** El Cairo, Rosario: funciones programadas entre el 01 y el 04/10. [Fuente 1](https://elcairocinepublico.gob.ar/pelicula-de-sala/romeo-y-ofelia/2026-10-01/).
- **Linkin Park: Unshatter:** Evento de estreno del 30/09 con función vigente hasta el 03/10 en Abasto. [Fuente 1](https://www.cinemark.com.ar/elegi-pelicula), [Fuente 2](https://www.cineya.com.ar/cines/cinemark-hoyts-abasto/).
- **Colony: Zona Cero:** Tickets de JustWatch desactualizados al 24/09. Showcase sin funciones; ausente de carteleras oficiales actuales. Última función observada en Abasto: 30/09. Sin oferta streaming AR comprobada: Otras plataformas. [Fuente 1](https://www.justwatch.com/ar/pelicula/colony), [Fuente 2](https://entradas.todoshowcase.com/showcase/pelicula?filmid=6000), [Fuente 3](https://www.cinemark.com.ar/elegi-pelicula), [Fuente 4](https://www.cinemacenter.com.ar/).
- **Puella Magi Madoka Magica: La Rebelión:** La exhibición anterior termina el 30/09. Cinemark anuncia Walpurgisnacht Rising, otra película. Sin oferta legal AR comprobada para La Rebelión: Otras plataformas. [Fuente 1](https://www.cinemark.com.ar/elegi-pelicula), [Fuente 2](https://www.justwatch.com/ar/pelicula/puella-magi-madoka-magica-the-movie-part-iii-rebellion).
- **Islandia:** Estreno limitado de septiembre; el listado amplio de Cines Argentinos todavía la incluye. No se confirmó función vigente de octubre ni streaming AR: Otras plataformas, excluida del carrusel. Esto no prueba ausencia absoluta en todo el país. [Fuente 1](https://www.justwatch.com/ar/pelicula/islandia), [Fuente 2](https://cineartecacodelphia.com.ar/), [Fuente 3](https://cartelera.ar/cine/cinearte-cacodelphia).

Para las restantes películas, la presencia localizada se registra título por título en el [anexo de evidencia](cartelera-argentina-2026-10-01.evidence.json), con las URLs de [Cines Argentinos](https://m.cinesargentinos.com.ar/cartelera/) y [Cinemark Argentina](https://www.cinemark.com.ar/elegi-pelicula). La cartelera es nacional: se conservaron proyecciones de salas regionales y eventos musicales.

## Identidad, imágenes y créditos

Las 13 altas pasaron primero por intake de duplicados (`new-movie --dry-run --json`) antes de crear archivos. Reseñas, sinopsis y tomas de diez segundos originales, con puentes a fichas existentes. Se conservaron 52 personas distintas en los nuevos créditos, con retratos verificados; 30 retratos nuevos y seis retratos existentes actualizados (cinco originales pequeños reemplazados y Manolo Solo refrescado por el enriquecedor). El anexo registra cada fuente de identidad y fotografía, cada póster de origen y sus dimensiones. Se usaron el localizador WebP y el optimizador de personas del repositorio. Se inspeccionaron visualmente los originales, los pósters locales y las planchas de retratos. No se usaron pósters de Cines Argentinos.

Créditos omitidos tras búsqueda acotada sin retrato individual seguro: Patrik Pašš Jr., Leon Vidmar y Jean-Claude Rozec (codirectores de Cuentos del jardín mágico); Mark Ritchie (codirector de Linkin Park: Unshatter). La ficha conserva al menos un director y dos intérpretes con imagen. Se evitó confundir a Patrik Pašš Jr. con el productor homónimo mayor. Se verificó a David Súkup en Cannes/Film Center y el reparto checo en el presskit oficial. Scott Moore figura como director de Spa Weekend; Jon Lucas es guionista, pese a la atribución ambigua de una ficha local. Joe Hahn se vincula por la clave y alias Joseph Hahn del catálogo.

Años originales: Romeo y Ofelia corresponde a 2024 (festival de Mar del Plata), Islandia a 2025 (Trento) y Cuentos del jardín mágico a 2025 (presskit/festivales); las fechas argentinas de exhibición son independientes. Países SK y SI requerían nuevas banderas, descargadas con `flags:sync`. Digger usa ATP a partir de la clasificación SP mostrada por Cinemark, normalizada según el esquema de la skill; hubo discrepancia con una sala regional que indica +13. Cuentos usa ATP confirmado en Nuevo Cine Rex de Punta Alta, sin importar una clasificación de otro país.

Advertencias no bloqueantes: los pósters locales de Verity, Hangar rojo y Romeo y Ofelia pesan menos que el umbral preferido de 40 KiB; son imágenes verticales originales, decodificables y sin fallback. Los campos opcionales de nacimiento/nacionalidad faltantes no se rellenaron sin fuente. Los avisos de medidores por género secundario son informativos según la política, y no justifican cambiar la categoría. El aviso heredado sobre el perfil de Marcos Mossello en Los calvos no corresponde a un crédito agregado en esta tarea.

## Pendientes de carga por el requisito de retratos

El relevamiento detectó dos títulos adicionales con función vigente en Gaumont, pero no se crearon fichas incompletas:

- **Retrato de un pianista (2025):** estreno argentino 01/10/2026, función Gaumont 20:00. Dirección José Luis Nacci y Elena Konieczny; participantes confirmados por [Cine Nacional](https://cinenacional.com/pelicula/retrato-de-un-pianista-2025) y [prensa de estreno](https://forodebaires.com.ar/retaro-de-un-pianista-una-pelicula-escrita-y-dirigida-por-jose-luis-nacci-y-elena-konieczny/). No se obtuvo un retrato individual seguro de ninguno de los directores; no confundir José Luis con su hijo Luciano Nacci. La búsqueda de imágenes devolvió homónimos ajenos. No se guardó un score sin completar la verificación numérica; hay una [crítica pública de EscribiendoCine](https://www.escribiendocine.com/noticias/2026/09/30/25575-critica-de-retrato-de-un-pianista-documental-sobre-el-musico-antonio-formaro), pero el HTML descargado no expone un rating estructurado.
- **La noche está marchándose ya (2025):** película de Ezequiel Salinas y Ramiro Sonzini, estreno argentino 05/03/2026 según [Cine Nacional](https://cinenacional.com/pelicula/la-noche-esta-marchandose-ya-2025); función Gaumont 14:00. IMDb tt38689439: audiencia 7.3/10, 80 votos en dataset oficial consultado 01/10, conversión 7. RT sin audiencia numérica. Hay un retrato individual seguro de Octavio Bertone en [Seminci](https://www.seminci.com/2025/notas-de-prensa/los-directores-ezequiel-salinas-y-ramiro-sonzini-llaman-a-la-resistencia-del-cine-argentino-con-la-noche-esta-marchandose-ya/), pero la supuesta foto de Juana Oviedo en Abandomoviez enlaza a `nofoto.jpg`; no sirve. Las otras búsquedas de reparto no completaron el mínimo de dos intérpretes con retrato seguro.

La [skill de carga](../skills/la-posta-cine-add-movie/SKILL.md:81) exige: “Keep at least one full-name director and two distinct full-name principal actors/performers with portraits” y “If the floor cannot be met, block the title.” Este requisito explícito bloquea esas dos altas y su incorporación al carrusel; no bloquea las otras fichas validadas. Los tres candidatos del Gaumont pasaron intake de duplicados antes de crear únicamente Una quinta en Portugal. Por tanto, el carrusel de 43 fichas cubre todos los títulos cargables de este relevamiento, pero no se afirma completitud absoluta de cartelera mientras estos dos estén pendientes.

Soy ella y Rocambole aparecen en los metadatos de la API de Gaumont sin horarios para el 01/10 y no se trataron como exhibición vigente. Canelones y Los domingos sí tienen horarios y recuperan Cine. JustWatch para Canelones remite al corto de Nicolás Mayer, no al largometraje 2026: se descartó esa identidad.

## Validación

- Intake y auditoría previa sobre las 46 fichas, con verificación YouTube habilitada. Los oEmbed/IDs corresponden a las películas; las búsquedas YouTube devolvieron redirecciones HTTP 302 no bloqueantes. Se reemplazó el trailer japonés de Madoka por el oficial de Aniplex con título inequívoco y se volvió a auditar.
- Auditoría de personas de las trece altas y Encantador; imágenes de personas globales, política de pósters y verificación local de los trece WebP.
- Catálogos de películas/personas regenerados y verificados; próximos estrenos regenerados con el script oficial. Astro check y pruebas de medidores editoriales.
- npm run validate:content final: exit 0. Build serial completo de 7.500 páginas; salida pública sin referencias de plataforma prohibidas, sitemap con 5.258 páginas canónicas y originalidad de perfiles aprobada.
- Auditor previo sobre 46 candidatos: PASS WITH WARNINGS, 108 avisos (incluidas búsquedas YouTube 302). Auditor posterior, con Comunidad y ambos carruseles: PASS WITH WARNINGS, 75 avisos, cero errores.
- La ejecución con --verify-reaction-build marca 44 errores heredados del validador: busca las etiquetas retiradas Mirala/Zafa y trata el score 6 como meh. El componente vigente publica la etiqueta canónica del score y usa pass para 6. Se comprobó la salida de las 46 rutas contra ese contrato actual y las trece altas además en navegador. No se modificó el auditor ni se cambió el score para satisfacer el contrato antiguo.
- Playwright: ocho pruebas existentes aprobadas en desktop-chromium y mobile-chromium, incluyendo equivalencia entre catálogo y carrusel, apertura/cierre de trailers y regresión del carrusel de streaming.
- Revisión de las trece rutas nuevas en escritorio y móvil: total 26, loaded 26, bad 0; póster completo, URL almacenada exacta y dimensiones verticales correctas, sin fallback. Carrusel: 43 fichas, las doce altas con Cine y las dos reactivadas presentes; Colony, La Rebelión e Islandia ausentes. Capturas de escritorio/móvil revisadas.
- Astro check: cero errores, advertencias y hints. Imágenes de personas: 5.426 retratos aprobados. git diff --check sin errores; cambios restringidos a contenido, imágenes, banderas, derivados y este reporte.

La invitación (2026) y La invitación (2015) son obras distintas, no duplicados. Para Una quinta en Portugal se verificó producción/año con [Instituto Cervantes](https://cultura.cervantes.es/manila/es/una-quinta-portuguesa/184065) y se mantuvo el nombre localizado AR. El alias Avelina Prat queda vinculado al nombre completo Avelina Prat García. El fallecimiento de Manolo Solo del 30/07/2026 fue corroborado en prensa pública, no inferido de la película.

Presskit de Cuentos del jardín mágico: [distribuidor oficial](https://neweuropefilmsales.com/wp-content/uploads/2026/03/TALES-FROM-THE-MAGIC-GARDEN.pdf), con año, países y voces originales. La evidencia de programación del Gaumont incluye la respuesta pública de su API y sus horarios para el 01/10 en el anexo JSON.
