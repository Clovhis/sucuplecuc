# Reconsulta de Watchmode del 9/10/2026

Publicación autorizada por el usuario para las fichas que superen las validaciones. Se repitió la consulta de los 16 pendientes mediante el helper canónico; primero por IMDb ID o TMDb ID y, cuando no hubo match, por título original y año. Las respuestas y comandos sin credenciales se conservan en esta carpeta. No se volvieron a consultar detalles ya obtenidos durante esta reconsulta.

Resultado: 11 coincidencias por ID y 5 sin coincidencia inequívoca, tampoco resueltas por el fallback de nombre. Los endpoints de personas devolvieron IDs y datos biográficos, sin retratos. No se convierte `null` en cero ni se utiliza Director of Photography, Assistant Director, Presenter o Producer como dirección o elenco.

| Candidato | Resultado y decisión |
|---|---|
| Project Baby | **Recuperada y cargada.** Watchmode por TMDb `1705390`, ID `11181506`: Eric Quizon, Sue Ramirez, Rico Blanco, 110 minutos, trailer `qg_LVWeG55M`. IMDb independiente `tt43279365` y Netflix AR `82695257` confirman identidad, créditos, país PH y +13. |
| Romanchakam | 30 créditos y trailer; audiencia Watchmode 4,6/10 sin votos conocidos. No hay un crédito Director ni retrato inequívoco del director conocido Venu Gopal Reddy. La búsqueda de persona por `nm7817992` devuelve lista vacía. Sigue pendiente. |
| Blood & Rust | 19 créditos y trailer. Jeremy Herbert, persona `79786734`, TMDb `2554598`, sin retrato ni biografía; no se reutilizan homónimos. Sigue pendiente. |
| Las redes sociales mataron a la estrella de cine | Match `11230411` con metadatos, créditos, score y trailer ausentes. Sigue pendiente por trailer oficial compatible. |
| May Contain: My Life | 15 créditos; Jennifer Greenstreet, persona `79474806`, TMDb `2091070`. Sin retrato ni trailer en Watchmode. Sigue pendiente. |
| Lo único que te pido | Match `11231988`, sin score, créditos o trailer. Sigue pendiente. |
| Volver a los 17 | 7 créditos: Gonzalo Badilla, Sebastián Badilla, Carolina Domenech y Manuela Viale. Sin score ni trailer. Sigue pendiente. |
| El viudo: Hasta que la muerte nos separe | 11 créditos, todos de equipo; ningún participante en Cast. Audiencia Watchmode 6,8/10, sin votos conocidos. El mínimo de participantes sigue sin verificarse. |
| En vivo desde el infierno | Match `1979177`, IMDb recuperado `tt43750202`, 27 créditos, trailer y audiencia 2,8/10 sin votos conocidos. Prime/IMDb confirman David Janoff como director, pero no se consiguió un retrato individual atribuible en esta pasada. Sigue pendiente por retrato de director; sí hay dos intérpretes con nombre completo (Kevin Hart, Kai Cenat). |
| Noches de fútbol americano con Miller | 15 créditos, trailer y director Jeff Cameron: persona `79760638`, IMDb `nm5789840`, TMDb `2531447`. IMDb identifica el título `tt46066368` como episodio de NFL Shorts; su nota 6,9/56 se registra como pista, sin trasladarla a una película de identidad/tipo no conciliados. Sigue pendiente por alcance e identidad editorial. |
| Crowyokan | Sin coincidencia inequívoca por ID ni por nombre/año. Sigue pendiente. |
| Jamie Foxx: Take Care of Yourself | Sin coincidencia inequívoca por ID ni por nombre/año. Sigue pendiente. |
| Mojo Brookzz: I Know You Lying | Sin coincidencia inequívoca por ID ni por nombre/año. Sigue pendiente. |
| Sam Morril: Incorrect | Sin coincidencia inequívoca por ID ni por nombre/año. Sigue pendiente. |
| Adili Idola Celebrity Roast: Reza Oktovian | 9 créditos de Cast, sin Director, score ni trailer; los nombres completos sí existen pero no alcanzan para completar la ficha. Sigue pendiente. |
| Disney+ Insider: Worlds Collide Concert Tour | Sin coincidencia inequívoca por ID ni por nombre/año. Sigue pendiente. |

## Evidencia de Project Baby

- Disponibilidad AR por suscripción desde 9/10: [JustWatch AR](https://www.justwatch.com/ar/pelicula/project-baby-2026), confirmado por [Netflix Argentina](https://www.netflix.com/ar/title/82695257). No se utiliza la fecha filipina/global de junio como estreno AR.
- País PH, año 2026, 110 minutos y créditos: [IMDb](https://www.imdb.com/title/tt43279365/) y [full credits](https://www.imdb.com/title/tt43279365/fullcredits/). Clasificación +13: Netflix AR. Productora y dirección también figuran en el arte original de Regal Entertainment.
- Taxonomía: Comedia principal, Comedia/Romance secundarios. Netflix AR la identifica como comedia romántica; el argumento desarrolla un acuerdo de maternidad que se transforma en romance. No tiene estructura narrativa de musical; no se confunde la profesión musical de Rico Blanco con ese género.
- Puntaje: tras no obtener agregado numérico de audiencia en RT/IMDb/TMDb/Letterboxd/Filmweb/Metacritic y Watchmode, se recuperó [Philbert Dy](https://letterboxd.com/philbertdy/film/project-baby-2026/). JSON-LD: `ratingValue: 1.5`, `bestRating: 5`; crítico profesional individual. `round(1.5 * 2) = 3`, tope de confianza 8, filtro editorial 8, **score final 3**. No se deduce la cifra del texto de la reseña ni se elige otra nota más favorable.
- Trailer original [Regal Entertainment](https://www.youtube.com/watch?v=qg_LVWeG55M): validado con el auditor y YouTube habilitado antes del build. Sus metadatos y autor se verifican por oEmbed.
- Póster original en inglés, sin marca territorial o sobreimpresión de terceros: [fuente de arte](https://pbs.twimg.com/media/HJX5uxRaAAAF1Ud.jpg?name=orig), [página que identifica el cartel](https://x.com/kowalerts/status/2059827017374470475); HTTP 200, image/jpeg, 1388x2048, identidad confirmada con IMDb/Netflix y créditos de Regal. Inspección visual antes de la localización; WebP final canónico 480x708, 39.034 bytes, sin fallback. La advertencia inferior a 40 KiB es de optimización, no un error.
- Eric Quizon: IMDb `nm0704479`, Wikidata Q5387313 y TMDb 585909; Sue Ramirez: IMDb `nm4212988`, Wikidata Q16239750 y TMDb 1496083; Rico Blanco: Wikidata Q7332251 y TMDb 1374319. Cada identidad/crédito se contrastó con IMDb/Netflix y cada retrato se abrió y verificó visualmente. Fuentes exactas en `people.json`; todos locales, individuales y >=200x250. Sin alias inventados ni perfiles parciales.
- Sinopsis, reseña y siete campos de la guía escritos desde cero en rioplatense. Las fuentes se usan para hechos, no como copia publicada. Sin cambios de UI, configuración, Share, Comunidad, reacciones o workflows.

Los 15 pendientes conservan el bloqueo establecido por la [skill de alta](../../../skills/la-posta-cine-add-movie/SKILL.md): “A genuinely unresolved field remains a publication blocker”.

## Validaciones finales

27 fichas auditadas después del build, cero errores; Project Baby también pasó el auditor primario con YouTube, personas y póster. Contenido y Astro: PASS, 260 archivos sin errores/advertencias/hints. Política global de retratos: 5.538 imágenes, PASS. Build: 7.621 páginas. Salida pública: PASS. Sitemap: 5.341 canónicas. Browser QA: 54/54 visitas aprobadas, 27 fichas por Chromium desktop/WebKit móvil. Suite final de carruseles y badges: 20/20 pruebas aprobadas. El lote inicial conserva sus 47 pruebas aprobadas y una omisión deliberada. Las 14 altas usan textos originales y pósteres locales; las 13 fichas existentes conservan sus scores y demás campos.
