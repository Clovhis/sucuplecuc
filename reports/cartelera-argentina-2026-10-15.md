# Cartelera argentina — jueves 15 de octubre de 2026

Rama: feature/movie-cartelera-ar-2026-10-15. Base: 6a5ec2c7. Contenido validado para publicación; publicación autorizada por el usuario en el seguimiento.

Alcance confirmado por el usuario: todos los estrenos en salas de Argentina del jueves 15, incluidas reposiciones. Se cruzaron Cines Argentinos, Cinemark, Showcase, Atlas, Cinemacenter, Gaumont y salas independientes. Resultado: diez altas, diez fichas existentes revalidadas (seis bajas y cuatro restituciones). Catálogo: 2.353 películas; carrusel Cine: 50. La carga NO es exhaustiva: hay dos estrenos confirmados pendientes por requisitos de evidencia. No se les fabricó puntaje.

## Fuentes de cartelera y fechas

- https://www.cinesargentinos.com.ar/estrenos/2026/10/ — agenda de estrenos, contrastada con funciones actuales.
- https://m.cinesargentinos.com.ar/cartelera/ — listado actual. No se usaron sus imágenes.
- https://www.cinemark.com.ar/elegi-pelicula — listado actual.
- https://entradas.todoshowcase.com/Default.aspx — películas con venta, incluidas cuatro reposiciones de Los juegos del hambre.
- https://www.atlascines.com/ — programación; GetFechasDisponibles confirmó fechas 15–21 para Paw Patrol.
- https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=372001&fecha=15/10/2026 — funciones de Gaumont. Se consultaron también los días 16–21. Se distinguió el catálogo de películas de la colección de funciones fechadas.
- https://cinenacional.com/listados/estrenos/proximos — estrenos nacionales; años originales contrastados por separado.

## Altas y puntajes

Consulta de todas las fuentes: 2026-10-15. Fecha de llegada/reseña local: 2026-10-15. Las reposiciones conservan su año original. Se buscó primero RT audiencia, después otras audiencias; no se eligió una métrica de críticos sobre una audiencia disponible. Ninguna alta se consideró elegible para 9/10: no hay fundamento de obra maestra excepcional y perdurable; la popularidad no basta. Ese filtro sólo reduce En llamas de 9 normalizado a 8. En las restantes no modifica la conversión. Los dos promedios con muestras pequeñas quedan expresamente sujetos a revisión futura.

| Ficha | Año original | Evidencia numérica de audiencia | Conversión y topes | Score | Plataforma AR |
|---|---:|---|---|---:|---|
| [Street Fighter](../src/data/movies/street-fighter-2026.json) | 2026 | [2,95/5; 3.870 votos](https://letterboxd.com/film/street-fighter-2026/) | round(2,95 × 2) = 6 | 6 | Cine |
| [Quiero tu sexo](../src/data/movies/quiero-tu-sexo-2026.json) | 2026 | [Popcornmeter 64%; 100+ votos](https://www.rottentomatoes.com/m/i_want_your_sex) | round(64/10) = 6 | 6 | Cine |
| [La caída de la ballena](../src/data/movies/la-caida-de-la-ballena-2026.json) | 2026 | [3,28/5; 4.420 votos](https://letterboxd.com/film/whalefall/) | round(3,28 × 2) = 7 | 7 | Cine |
| [Tiempos de ilusión](../src/data/movies/tiempos-de-ilusion-2026.json) | 2026 | [7,3/10; aproximadamente 1.400 votos](https://www.imdb.com/title/tt36842933/) | round(7,3) = 7 | 7 | Cine |
| [Los Juegos del Hambre](../src/data/movies/los-juegos-del-hambre-2012.json) | 2012 | [Popcornmeter 81%; 250.000+ votos](https://www.rottentomatoes.com/m/the_hunger_games) | round(81/10) = 8 | 8 | Cine; Apple TV (alquiler, no suscripción) |
| [Los Juegos del Hambre: En llamas](../src/data/movies/los-juegos-del-hambre-en-llamas-2013.json) | 2013 | [Popcornmeter 89%; 250.000+ votos](https://www.rottentomatoes.com/m/the_hunger_games_catching_fire) | round(89/10) = 9; tope editorial 8 | 8 | Cine; Apple TV (alquiler, no suscripción) |
| [Los Juegos del Hambre: Sinsajo Parte 1](../src/data/movies/los-juegos-del-hambre-sinsajo-parte-1-2014.json) | 2014 | [Popcornmeter 71%; 100.000+ votos](https://www.rottentomatoes.com/m/the_hunger_games_mockingjay_part_1) | round(71/10) = 7 | 7 | Cine; Apple TV (alquiler, no suscripción) |
| [Los Juegos del Hambre: Sinsajo Parte 2](../src/data/movies/los-juegos-del-hambre-sinsajo-parte-2-2015.json) | 2015 | [Popcornmeter 66%; 100.000+ votos](https://www.rottentomatoes.com/m/the_hunger_games_mockingjay_part_2) | round(66/10) = 7 | 7 | Cine; Apple TV (alquiler, no suscripción) |
| [Escuela de Monstruos](../src/data/movies/escuela-de-monstruos-2026.json) | 2026 | [8,3/10; 27 votos](https://www.imdb.com/title/tt38807889/) | round(8,3) = 8; tope de confianza 8 por muestra pequeña | 8 | Cine |
| [Lo que trajo la tormenta](../src/data/movies/lo-que-trajo-la-tormenta-2025.json) | 2025 | [8,0/10; 7 votos](https://www.imdb.com/title/tt37209454/) | round(8,0) = 8; tope de confianza 8 por muestra pequeña | 8 | Cine |

Apple TV transaccional para las reposiciones: JustWatch AR, fichas the-hunger-games, los-juegos-del-hambre-en-llamas, los-juegos-del-hambre-sinsajo-parte-1 y los-juegos-del-hambre-sinsajo-parte-2. Consultas y respuestas de ofertas conservadas en los archivos jw*.json de esta carpeta. La disponibilidad en salas surge de las funciones argentinas, no de los proveedores digitales ni de una fecha global.

## Cambios en películas existentes

Los únicos campos semánticos cambiados en estas diez fichas son releasePlatform/releasePlatforms. Se preservaron puntajes, fechas, reseñas, personas y medios.

| Película | Antes | Ahora | Evidencia AR / modalidad |
|---|---|---|---|
| Toy Story 5 | Disney Plus, Cine | Disney Plus | [FLATRATE](https://www.justwatch.com/ar/pelicula/toy-story-5) |
| Canelones | Cine | Flow | [FLATRATE](https://senalnews.com/es/digital/flow-estrena-en-exclusiva-canelones-la-nueva-pelicula-de-orsai-audiovisuales/news%40senalnews.com) |
| El heladero | Cine | Otras plataformas | [Sin oferta AR verificada](https://www.justwatch.com/ar/pelicula/ice-cream-man) |
| Hechizo de Amor: La magia continúa | Cine | Otras plataformas | [Sin oferta AR verificada; Showcase sin funciones](https://api.voyalcine.net/films/6041/tree/showcase) |
| Puella Magi Madoka Magica: Walpurgisnacht Rising | Cine | Otras plataformas | [Sin oferta AR verificada; sin funciones vigentes comprobables](https://www.justwatch.com/ar/pelicula/puella-magi-madoka-magica-walpurgisnacht-rising) |
| Una película de Parque Chas | Cine | Otras plataformas | [Funciones 4 y 11/10 finalizadas; sin oferta AR verificada](https://www.tiempoar.com.ar/ta_article/una-pelicula-de-parque-chas/) |
| Cuentos del jardín mágico | Otras plataformas | Cine | [Cartelera AR](https://m.cinesargentinos.com.ar/cartelera/) |
| El último gran golpe | Otras plataformas | Cine | [Cartelera AR](https://m.cinesargentinos.com.ar/cartelera/) |
| Relajadas y muy peligrosas | Otras plataformas | Cine | [Cartelera AR](https://m.cinesargentinos.com.ar/cartelera/) |
| Su propio infierno | Otras plataformas | Cine | [Cartelera AR](https://m.cinesargentinos.com.ar/cartelera/) |

Se consultó JustWatch AR primero. Canelones no tiene una oferta útil indexada allí: Flow se confirmó mediante comunicación identificada de Personal/Flow reproducida por Señal News y una referencia local de octubre. Toy Story 5 tiene oferta Disney+ de suscripción. Para las otras cuatro bajas no se probó una oferta digital AR: Otras plataformas significa disponibilidad sin confirmar, no un servicio de streaming descubierto.

Hechizo: https://api.voyalcine.net/films/6041/tree/showcase devolvió días vacíos; no se tomó el texto oculto de una plantilla como prueba. Madoka: no se encontraron funciones vigentes en las cadenas y listados consultados; una nota del 12/10 aún la mencionaba y Cinépolis devolvió 403. Su baja expresa falta de funciones comprobables, con esa incertidumbre, no una certificación de ausencia absoluta en cada sala del país. Parque Chas sólo tenía funciones especiales publicadas para el 4 y 11/10, ya pasadas.

## Películas conservadas aunque faltaban en las cadenas grandes

- Campamento Miasma: El Cairo, 15/10 a las 18. https://elcairocinepublico.gob.ar/cartelera-de-sala/
- Romeo y Julieta: El Cairo, 16/10 a las 22:30 y 17/10 a las 18, mismo calendario oficial.
- Paw Patrol: Atlas confirmó fechas 15–21. https://www.atlascines.com/Peliculas/GetFechasDisponibles?codComplejo=&codPelicula=528
- La noche del demonio: nueva función Gaumont 20/10 a las 22, aunque Showcase ya no tuviera funciones.
- Pepita, la pistolera: Gaumont durante la semana y Tandil Cine, 17/10 a las 20.
- Una quinta: Gaumont y Nave UNCUYO 16/10 a las 18:30. https://nave.uncuyo.edu.ar/evento/fecha/2026/10/16
- La desobediente: Gaumont 16/10 a las 20.
- Tres adioses: Nave UNCUYO, 15/10 a las 20:30 y 17/10 a las 18. https://nave.uncuyo.edu.ar/
- Retrato de un cierto oriente: Sala Lúcida, 15/10 a las 20. https://portal.salalucida.org/
- Lo dejamos acá: Gaumont, 15/10 a las 15:15 y días de la semana siguiente.
- Annemarie: MALBA, viernes a las 20 desde el 9/10. https://malba.org.ar/evento/annemarie/

## Pendientes y títulos descartados de las altas de hoy

- **CordobeCes: La película (2026)**: estreno y funciones confirmados; no se encontró puntaje público numérico verificable tras RT, IMDb, TMDb, Letterboxd, Filmweb/Metacritic, contingencia Watchmode e intento dirigido por ID. La crítica de Ricardo De Luca en https://cineargentinohoy.com.ar/critica-de-cordobeces/ es cualitativa: no permite calcular un score. https://cordobeces.com.ar/ y programación de Gaumont confirman identidad/estreno. No se creó JSON incompleto.
- **Autopista América 2000 (2025)**: funciones AR confirmadas y año original 2025 contrastado, aunque algunas agendas lo rotulan 2026. https://www.imdb.com/title/tt38895412/ y https://letterboxd.com/film/autopista-america-2000/ no dieron una cifra utilizable; Watchmode por IMDb identificó la obra y devolvió puntuaciones null. SIMKL 0 con cero votos no es una valoración. Tampoco se resolvieron retratos atribuibles suficientes de su equipo principal. No se creó JSON incompleto.
- **Diciembre (2025)**: discrepancia entre agenda de Cine Nacional y estreno argentino previo en julio; no se encontró función actual del 15 en MALBA. No se presentó como estreno confirmado de hoy.
- **Estación zombie (2016)**: el anuncio de reestreno y la venta de entradas lo ubican el 29/10; no se cargó anticipadamente como función de hoy.
- Always: Lalisa (12/10), Queen en Budapest (10/10) y Blue Lock (8/10) se revisaron como huecos de cartelera, pero no son estrenos del jueves 15. No se cargaron: faltan respectivamente segundo intérprete verificable con retrato; retrato seguro del director; y resolución de identidad/año y retrato del director. No se ocultaron como altas resueltas.

Regla aplicada: skills/la-posta-cine-auditor/SKILL.md: “If no verifiable numeric rating exists after the full sequence, keep the field unset and report the blocker; never fabricate a value or waive the required-score gate.”

## Personas e imágenes

Se agregaron trece registros de personas y trece retratos; se repararon cinco retratos heredados demasiado pequeños (Jennifer Lawrence, Josh Hutcherson, Greta Lee, Andrew Stanton y Tim Allen). Se verificaron visualmente las imágenes y se contrastó la identidad con créditos/filmografía independientes. No se inventaron nacionalidades ni nacimientos; los datos opcionales ausentes generan avisos internos y se omiten de la interfaz. No se crearon biografías extensas.

- **Andrew Koji**: /people/andrew-koji-nm4010671.jpg; imagen https://media.themoviedb.org/t/p/w500/oU53nWLQ6wFHzERwSi1fD53LxZB.jpg; identidad https://www.wikidata.org/wiki/Q72219204 ; https://www.imdb.com/name/nm4010671/ ; https://www.themoviedb.org/person/1658375-andrew-koji.
- **Brian Duffield**: /people/brian-duffield-nm3929259.jpg; imagen https://media.themoviedb.org/t/p/w500/sNFeU2PGn8FULqQcqf73sBiL34i.jpg; identidad https://www.wikidata.org/wiki/Q63940510 ; https://www.imdb.com/name/nm3929259/ ; https://www.themoviedb.org/person/1295292-brian-duffield.
- **Éric Toledano**: /people/eric-toledano-nm0865918.jpg; imagen https://commons.wikimedia.org/wiki/Special:FilePath/Eric%20Toledano%20d%C3%A9jeuner%20C%C3%A9sar%202018.jpg?width=1200; identidad https://www.wikidata.org/wiki/Q2778106 ; https://www.imdb.com/name/nm0865918/ ; https://www.themoviedb.org/person/84425-eric-toledano.
- **Gregg Araki**: /people/gregg-araki-nm0000777.jpg; imagen https://commons.wikimedia.org/wiki/Special:FilePath/Gregg%20Araki%20-%20Mysterious%20Skin.jpg?width=1200; identidad https://www.wikidata.org/wiki/Q708899 ; https://www.imdb.com/name/nm0000777/ ; https://www.themoviedb.org/person/19224-gregg-araki.
- **Kitao Sakurai**: /people/kitao-sakurai-nm0757318.jpg; imagen https://media.themoviedb.org/t/p/w500/9uaITTRb3OOdkV9ujcUTd9f9cp7.jpg; identidad https://www.wikidata.org/wiki/Q63546532 ; https://www.imdb.com/name/nm0757318/ ; https://www.themoviedb.org/person/922344-kitao-sakurai.
- **Noah Centineo**: /people/noah-centineo-nm3170207.jpg; imagen https://commons.wikimedia.org/wiki/Special:FilePath/Noah%20Centineo%20by%20Gage%20Skidmore.jpg?width=1200; identidad https://www.wikidata.org/wiki/Q3877574 ; https://www.imdb.com/name/nm3170207/ ; https://www.themoviedb.org/person/1253353-noah-centineo.
- **Olivier Nakache**: /people/olivier-nakache-nm0619923.jpg; imagen https://commons.wikimedia.org/wiki/Special:FilePath/Olivier%20Nakache%20d%C3%A9jeuner%20C%C3%A9sar%202018.jpg?width=1200; identidad https://www.wikidata.org/wiki/Q74428 ; https://www.imdb.com/name/nm0619923/ ; https://www.themoviedb.org/person/84426-olivier-nakache.
- **Verena Altenberger**: /people/verena-altenberger-nm5019500.jpg; imagen https://commons.wikimedia.org/wiki/Special:FilePath/Verena%20Altenberger%20Berlinale%202017.jpg?width=1200; identidad https://www.wikidata.org/wiki/Q25354295 ; https://www.imdb.com/name/nm5019500/ ; https://www.themoviedb.org/person/1497342-verena-altenberger.
- **Verena Fels**: /people/verena-fels-nm2746566.jpg; imagen https://nureintag.de/img/verenafels.jpg; identidad https://nureintag.de/ ; https://felsfilm.com/ ; https://www.imdb.com/name/nm2746566/.
- **Lilian Jane Gartner**: /people/lilian-jane-gartner.jpg; imagen https://imgproxy.filmmakers.eu/wPVqujBSYzhoQ-gc2C-TSVq5vmzcid9MTTsoTeoixDA/rt:fill/el:1/c:8736:8736:nowe:0:0/w:500/h:500/g:no/czM6Ly9maWxtbWFr/ZXJzLWV1LXdlc3Qt/MS9wcm9kdWN0aW9u/L2ZkMTI3Y2JiLWU3/OTYtNDY2Mi1hMzgy/LTQ4OTk1MDc3MzZm/Ny5qcGc.jpg; identidad https://austrian-actors.filmmakers.eu/en/actors/lilian-jane-gartner ; https://filminstitut.at/en/movies/monster-mia.
- **Miguel de Zuviría**: /people/miguel-de-zuviria.jpg; imagen https://estranhosencontros.com/programacao/competicao-internacional-longas/lo-que-trajo-la-tormenta/realizador.webp; identidad https://estranhosencontros.com/fr/programacao/competicao-internacional-longas/lo-que-trajo-la-tormenta ; https://bafici.org/pelicula/lo-que-trajo-la-tormenta/.
- **Carolina Saade**: /people/carolina-saade.jpg; imagen https://img.cinenacional.com/insecure/rs%3Afill%3A1920%3A%3A1/g%3Asm/q%3A78/plain/local%3A%2F%2F%2Fcinenacional%2Fpeople%2F190031%2Fgcdki1uuvbzglwrjl73u.jpg; identidad https://cinenacional.com/persona/carolina-saade ; https://alternativateatral.com.ar/persona111490-carolina-saade.
- **Irune Porcel**: /people/irune-porcel.jpg; imagen https://img.cinenacional.com/insecure/rs%3Afill%3A1920%3A%3A1/g%3Asm/q%3A78/plain/local%3A%2F%2F%2Fcinenacional%2Fpeople%2F200407%2Fportrait.jpg; identidad https://cinenacional.com/persona/irune-porcel ; https://cinenacional.com/pelicula/lo-que-trajo-la-tormenta-2025.

En Lo que trajo la tormenta se omitió Jesús Catalino Gómez: no se consiguió retrato individual atribuible después de las búsquedas. Se conservaron dos intérpretes principales con créditos y fotos verificados, Carolina Saade e Irune Porcel. En Escuela de Monstruos se usaron las voces originales austríacas, no un doblaje supuesto.

Diez pósters locales WebP, sin fallback ni imágenes de Cines Argentinos. Fuentes: IMP Awards para Street Fighter, Quiero tu sexo, Whalefall y las cuatro reposiciones; Gaumont oficial para Tiempos de ilusión; festival Estranhos Encontros para Lo que trajo la tormenta; cartel original alemán de Monster Mia identificado por la web oficial y obtenido a resolución 780×1104. Fuentes, dimensiones y resultados en poster-sources.json, storm-media.json y mia-final-poster.json. Originales y salida local revisados en las hojas de contacto. Escuela de Monstruos pesa 36 KB: aviso informativo, imagen válida y legible.

Clasificación de Lo que trajo la tormenta: fuente local SP. Se normalizó a ATP en el esquema limitado del sitio, como contenido para todas las edades con supervisión parental sugerida. La denominación oficial sigue siendo SP, no ATP sin reservas: https://www.incaa.gob.ar/tramites/solicitud-de-calificacion-de-contenidos-audiovisuales/ explica que SP admite todas las edades y aconseja orientación adulta. La normalización pierde ese matiz; no se cambió el esquema ni la UI durante esta carga.

## Textos, trailers y taxonomía

Las sinopsis y las reseñas de las diez altas fueron escritas desde cero por IA en español rioplatense; también los bloques de lectura rápida. Las fuentes se usaron para datos, identidad y contraste, sin copiar sus reseñas. Créditos y metadatos contrastados con IMDb, productoras/distribuidoras oficiales y Cine Nacional/festivales para las argentinas. Los trailers se verificaron con oEmbed y título, sin omitir YouTube en la auditoría previa; referencias oficiales Gaumont, Magnolia, Paramount, 20th Century, Lionsgate/The Hunger Games y TOBIS. Una búsqueda adicional de YouTube devolvió 302 en algunos títulos; se conservó el video identificado por la fuente oficial y oEmbed válido.

- Street Fighter: https://www.youtube.com/watch?v=Xt4X4FvXk2A; categoría Accion; géneros Acción, Aventura; archivo src/data/movies/street-fighter-2026.json.
- Quiero tu sexo: https://www.youtube.com/watch?v=kjkTmTmC1iA; categoría Comedia; géneros Comedia, Drama, Thriller; archivo src/data/movies/quiero-tu-sexo-2026.json.
- La caída de la ballena: https://www.youtube.com/watch?v=rN9F6-tbySY; categoría Thriller; géneros Thriller, Aventura, Drama; archivo src/data/movies/la-caida-de-la-ballena-2026.json.
- Tiempos de ilusión: https://www.youtube.com/watch?v=3NcTEeCZrY0; categoría Comedia; géneros Comedia, Drama; archivo src/data/movies/tiempos-de-ilusion-2026.json.
- Los Juegos del Hambre: https://www.youtube.com/watch?v=mfmrPu43DF8; categoría Ciencia ficcion; géneros Ciencia ficción, Acción, Aventura; archivo src/data/movies/los-juegos-del-hambre-2012.json.
- Los Juegos del Hambre: En llamas: https://www.youtube.com/watch?v=joPveEKnxaw; categoría Ciencia ficcion; géneros Ciencia ficción, Acción, Aventura; archivo src/data/movies/los-juegos-del-hambre-en-llamas-2013.json.
- Los Juegos del Hambre: Sinsajo Parte 1: https://www.youtube.com/watch?v=C_Tsj_wTJkQ; categoría Ciencia ficcion; géneros Ciencia ficción, Thriller, Drama; archivo src/data/movies/los-juegos-del-hambre-sinsajo-parte-1-2014.json.
- Los Juegos del Hambre: Sinsajo Parte 2: https://www.youtube.com/watch?v=n-7K_OjsDCQ; categoría Ciencia ficcion; géneros Ciencia ficción, Acción, Drama; archivo src/data/movies/los-juegos-del-hambre-sinsajo-parte-2-2015.json.
- Escuela de Monstruos: https://www.youtube.com/watch?v=RB10MT41GY0; categoría Animacion; géneros Animación, Fantasía, Aventura; archivo src/data/movies/escuela-de-monstruos-2026.json.
- Lo que trajo la tormenta: https://www.youtube.com/watch?v=NIJuMJHUYAY; categoría Drama; géneros Drama, Fantasía; archivo src/data/movies/lo-que-trajo-la-tormenta-2025.json.

Los juegos del hambre no se reclasificó como Bélica para activar medidores; su conflicto es de ciencia ficción/acción. Tiempos de ilusión y Escuela de Monstruos no se etiquetaron Musical sólo por sus canciones. Filtros Guerra y Musical comprobados en navegador: las diez altas quedan fuera, conforme a su clasificación. No hubo altas Culto ni cambios de overrides.

## Validación final

- validate:content: OK; incluye build de 7.902 páginas, originalidad de 759 perfiles, salida pública y 5.548 páginas canónicas indexables.
- npm run check: 287 archivos, cero errores/avisos/hints.
- Auditor explícito de veinte fichas: cero errores. Segunda pasada con verificación de Comunidad, reacciones, carrusel de cine y streaming: cero errores; 37 avisos documentados en audit-final.json.
- Auditor individual de personas para las veinte fichas: OK. images:people:check: 5.695 retratos válidos. Avisos opcionales de nacionalidad/nacimiento no se rellenaron sin evidencia.
- Pruebas de política de pósters y medidores editoriales: OK.
- Playwright de carruseles: ocho pruebas aprobadas en Chromium escritorio y WebKit móvil.
- Comprobación adicional en ambos navegadores: veinte rutas/pósters correctos por navegador, cincuenta tarjetas de cartelera con imágenes cargadas, filtros completos Guerra (61) y Musical (109). Resultados browser-final.json.
- Catálogos derivados regenerados con scripts: películas, créditos y referencia de personas.
- Avisos heredados de recomendaciones similares repetidas en Madoka, Cuentos del jardín mágico y Relajadas y muy peligrosas: conservados fuera del cambio de plataformas. Fuentes poco frecuentes y fechas opcionales se revisaron manualmente; no equivalen a errores de identidad.
- No se cambiaron código del sitio, Share, Comunidad, reacciones ni las tres ediciones generadas de la home. La publicación se ejecuta después de estos controles, con verificación del SHA, Actions y producción.

Evidencia seleccionada en reports/cartelera-2026-10-15; los logs completos se archivan fuera del repositorio al cerrar; candidate-manifest.json lista los veinte candidatos explícitos. loaded.json distingue las diez altas de las diez fichas heredadas. platform-changes.json conserva modalidades, fuentes y scores anteriores. No se detectaron duplicados de las altas por título/año; las otras adaptaciones de Street Fighter y la precuela de Los juegos del hambre son obras distintas.

## Consulta JustWatch AR por alta

- Street Fighter: https://www.justwatch.com/ar/pelicula/street-fighter; sin oferta digital AR identificada; Cine confirmado por funciones locales.
- Quiero tu sexo: https://www.justwatch.com/ar/buscar?q=I%20Want%20Your%20Sex; sin oferta digital AR identificada; Cine confirmado por funciones locales.
- La caída de la ballena: https://www.justwatch.com/ar/pelicula/whalefall; sin oferta digital AR identificada; Cine confirmado por funciones locales.
- Tiempos de ilusión: https://www.justwatch.com/ar/buscar?q=Juste%20une%20illusion; sin oferta digital AR identificada; Cine confirmado por funciones locales.
- Los Juegos del Hambre: https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre; Prime Video RENT, Apple TV RENT.
- Los Juegos del Hambre: En llamas: https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre-en-llamas; Apple TV RENT.
- Los Juegos del Hambre: Sinsajo Parte 1: https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre-sinsajo-parte-1; Apple TV RENT.
- Los Juegos del Hambre: Sinsajo Parte 2: https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre-sinsajo-parte-2; Apple TV RENT.
- Escuela de Monstruos: https://www.justwatch.com/ar/buscar?q=Monster%20Mia; sin oferta digital AR identificada; Cine confirmado por funciones locales.
- Lo que trajo la tormenta: https://www.justwatch.com/ar/buscar?q=Lo%20que%20trajo%20la%20tormenta; sin oferta digital AR identificada; Cine confirmado por funciones locales.

Verificación de alcance: los diez cambios heredados preservan todos los campos ajenos a plataformas; no se eliminaron personas; sólo se modificaron cinco registros heredados para reparar sus retratos; trece registros nuevos. Las tres ediciones de la home permanecen idénticas a HEAD. Verificación visual adicional: filas opcionales ausentes de Miguel de Zuviría omitidas; origen y nacimiento conocidos de Jennifer Lawrence presentes; directorio sin placeholders. Capturas de escritorio y móvil revisadas.

## Segunda revisión de scores antes de publicar

Revisión explícita solicitada por el usuario: veinte fichas; veinte scores confirmados, cero modificaciones. Se releyeron fuentes públicas y la política de confianza/obras maestras; cifras y conteos en [scores.json](cartelera-2026-10-15/scores.json). Street Fighter mantiene 2,95/5 con 4.077 votos y Whalefall 3,28/5 con 4.600 votos en esta nueva consulta. Algunas páginas de IMDb rechazaron la descarga directa (202/403); se verificaron sus páginas de ratings indexadas, con enlaces exactos. Cuentos muestra 6,7/10 (158) en la ficha y 6,8/10 (147) en ratings indexados: ambos normalizan a 7. La cifra 6 de Parque Chas se atribuye sólo a Emiliano Basile, no a audiencia, con el tope de confianza de 8. Toy Story 5 (94%) y Hechizo de Amor (91%) normalizan a 9 y quedan en 8 por el filtro editorial de obras maestras.
