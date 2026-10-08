# Alta y auditoría: Recuerdos del mal

Fecha de investigación: 07/10/2026, Argentina. Rama: `feature/movie-recuerdos-del-mal-2022`. Alcance ampliado por el usuario: confirmar nacionalidad de Gabriel Musco, eliminar las leyendas públicas de nacionalidad ausente de todas las personas y ajustar las skills.

Manifiesto: una película, `src/data/movies/recuerdos-del-mal-2022.json`. El dry-run del alta devolvió `duplicates: []`; no hubo coincidencias en el catálogo derivado ni en los JSON de origen. El catálogo pasa de 2253 a 2254 películas. Publicación autorizada por el usuario: «si esta todo bien pushea a main y dejame limpio aca».

## Evidencia de la película

| Campo | Fuente | Dato y decisión |
| --- | --- | --- |
| Identidad, año y país | https://macabro.mx/2023/wp-content/uploads/2023/08/Macabro-catalogo-para-web-2023.pdf | Gabriel Musco, Argentina, 2022, horror/thriller, 84 minutos. |
| Año original | https://filmfreeway.com/gabriel.musco | Su filmografía identifica Memories of evil (2022), con selección en Buenos Aires Rojo Sangre 2022. |
| Fecha argentina, dirección y elenco | https://www.argentina.gob.ar/noticias/estrenos-y-novedades-en-las-pantallas-del-incaa-35 | Estreno comercial 02/11/2023; Gabriel Musco; Sofía Langoni, Marta Quarleri, Silvina Diez, Lucas Martínez Foresi y Juan Lucero. Clasificación SAM 13. |
| País y duración | https://www.imdb.com/es/title/tt22074082/ | La página confirma Argentina, 2022, fecha AR 02/11/2023; consigna 85 minutos. Se conserva duración 84 de Macabro y la ficha técnica de lanzamiento. |
| Ficha técnica y género | https://cinedegenerolatinoamericano.com/noticias/recuerdos-del-mal-presenta-su-poster-y-trailer-oficiales-2022-09-28 | Ficha de lanzamiento: 84 minutos, castellano, terror sobrenatural; productoras y créditos. |
| Contexto de dirección | https://blazingminds.co.uk/exclusive-horror-on-sea-interview-memories-of-evil-writer-director-gabriel-musco/ | Entrevista al realizador sobre memoria, vejez y construcción del terror. Uso factual, sin trasladar su prosa al sitio. |

Discrepancias resueltas: algunas fichas comerciales usan 2023 como año de estreno. El año original se fija en 2022, separado de la fecha comercial argentina. JustWatch atribuye erróneamente la dirección a Gabriele Muscas: ese dato se descartó frente a INCAA, IMDb y la filmografía del realizador. Ventana Sur 2022 menciona Argentina/USA; Macabro, INCAA e IMDb identifican Argentina y se conserva `AR`. No se etiqueta como estreno nuevo de 2026.

## Disponibilidad argentina

https://www.justwatch.com/ar/pelicula/recuerdos-del-mal → oferta Amazon Prime Video en Argentina, tipo `FLATRATE`, HD, incluida en suscripción. La oferta enlaza a https://www.primevideo.com/detail?gti=amzn1.dv.gti.b882ff74-de4f-494a-b52d-a50ff1f3285f y su contexto identifica país `AR`, moneda `ARS` y tipo `FLATRATE`. La página oficial no fue accesible con la herramienta web; JustWatch AR sí aporta la oferta suficiente. El sitio conserva únicamente `releasePlatform: Prime Video`.

No se infieren otros proveedores ni alquileres de una ficha extranjera. No se afirma disponibilidad vigente en cines ni en CINE.AR.

## Puntaje reproducible

1. https://static.rottentomatoes.com/m/memories_of_evil → 0 ratings de audiencia y 0 reseñas de crítica; no hay nota numérica utilizable.
2. https://www.imdb.com/es/title/tt22074082/ → verificación directa con navegador y JSON-LD el 07/10/2026: `ratingValue: 5.5`, escala 1–10, `ratingCount: 85`. Resultado: `round(5.5) = 6`.
3. El tope de confianza por muestra pequeña es 8; no altera el 6 normalizado. No hay evidencia de reconocimiento perdurable que justifique una categoría de obra maestra; el techo editorial de 8 tampoco altera el 6. Valor final: `cinepostaScore: 6`.

La captura indexada es antigua y muestra 5,4 con 73 votos; se prioriza la comprobación directa vigente de 5,5 con 85. JustWatch también presentó snapshots distintos de 5,4/84 y 5,5/85: no se usó como autoridad del score. No se promediaron servicios.

Contingencia Watchmode, consultada una sola vez por `tt22074082`: match inequívoco ID 11059969, año 2022, TMDb 1050001; `user_rating: null`, `critic_score: null`. Ambos permanecen sin valor: no se convirtieron en cero ni se utilizaron para puntuar. Al recuperarse IMDb directo, no fue necesario recurrir a una nota de crítico.

## Taxonomía y texto

`category: Terror`; géneros amplios Terror, Thriller y Misterio; subgéneros Sobrenatural y Psicológico. La enfermera, la medicación y la pérdida de memoria sostienen el misterio doméstico; las manifestaciones sobrenaturales sostienen el carril principal. Confianza alta, respaldada por la ficha técnica de lanzamiento.

Se revisó la elegibilidad de Musical y Guerra: no hay números musicales que lleven el relato ni conflicto bélico central. No se agregan Musical, Bélica ni Guerra. No pertenece a la lista curada de culto, y no recibe sticker de culto ni Absolute Cinema. El Cagazómetro se deriva de la categoría existente, sin override solicitado ni campos manuales.

Sinopsis, reseña y los siete campos de `editorial.tenSecondTake` fueron escritos desde cero por IA para esta película, con voz rioplatense; ninguna prosa de fuentes fue copiada, traducida o reutilizada. Ángulo crítico: la medicación como forma de controlar la memoria, y el cuidado como espacio de vulnerabilidad y amenaza. Recomendaciones: Babadook y El orfanato; relaciones: The Others, Hereditary y Cuando acecha la maldad, todos slugs existentes y distintos. El premio de guion de Montevideo Fantástico está respaldado por INCAA, pero no se introduce en `awards.wins`, reservado por el contrato a Oscar, Grammy o Cannes; arreglo vacío.

## Póster y tráiler

- Fuente de arte: https://lacentral24.com/wp-content/uploads/2026/10/recuerdos-del-mal-poster-oficial.jpg → HTTP 200, `image/jpeg`, 1000×1500. Identidad contrastada con el lanzamiento de póster oficial de Funcinema y el elenco impreso. Arte español compatible con Argentina, sin bandera, marca de terceros ni agregado promocional. Las marcas inferiores corresponden a las productoras del cartel oficial.
- Archivo localizado: `public/assets/posters/2022/recuerdos-del-mal-2022.webp`, 480×720, 44388 bytes. Inspección visual antes/después: título legible, proporción conservada, sin ampliación ni fallback.
- Tráiler: https://www.youtube.com/watch?v=WIZd-USKNSw → oEmbed HTTP 200, título `RECUERDOS DEL MAL (2022 ) TRAILER`, canal Sewati Audiovisual. Publicación enlazada por https://www.funcinema.com.ar/2022/10/lanzaron-el-trailer-del-film-de-terror-nacional-recuerdos-del-mal/ . Se utiliza la publicación original de 2022 para mantener correspondencia con el año de la ficha. También se comprobó el tráiler 2023 de Latitud, `4DrjrYyXt48`, y no se usa en el JSON.

## Personas retenidas

Se consultaron primero `people.json` y el catálogo de perfiles: ninguno de los tres nombres estaba registrado. Se agregan tres registros con nombre completo, IMDb verificado con crédito y señal independiente, referencias HTTP(S), atribución y foto local. No se crean perfiles extensos.

| Persona | Identidad independiente y retrato | Resultado |
| --- | --- | --- |
| Gabriel Musco, nm8759073 | https://filmfreeway.com/gabriel.musco y https://cinenacional.com/persona/gabriel-musco; avatar original de su perfil FilmFreeway: https://filmfreeway-production-storage-01-connector.filmfreeway.com/users/avatars/000/334/154/original/b5a9864b9f-avatar.jpg?1580687402 | Foto visualmente comprobada, 660×660, `/people/gabriel-musco-nm8759073.jpg`. Nacimiento 29/11/1977 respaldado por su autobiografía en https://filmfreeway.com/877286 . Nacionalidad `Argentino`, verificada explícitamente en el apartado LIFE 2.0 de https://www.ventana-sur.com/wp-content/uploads/2023/11/BW-Guide-2023_final.pdf, apartado de dirección de LIFE 2.0, con referencia a Recuerdos del Mal. |
| Marta Quarleri, nm13782122 | IMDb enlaza su Instagram oficial https://www.instagram.com/quarlerichiara/ ; su biografía menciona Recuerdos del mal y Ruletka. La filmografía de https://cinenacional.com/persona/marta-quarleri confirma Amalia. Retrato de su publicación https://www.instagram.com/quarlerichiara/p/DTX4eeDjvdT/ | Se contrastó visualmente con el rostro de su avatar y el material identificado de Amalia. Recorte del rostro y hombros, 440×510, de la foto original 1080×1080; excluye texto y mascota. `/people/marta-quarleri-nm13782122.jpg`. URL exacta de imagen atribuida guardada en `remoteImageUrl`; CDN con vencimiento, no dependencia de renderizado. Sin nacimiento ni nacionalidad individual verificables. |
| Lucas Martínez Foresi, nm9496461 | IMDb confirma el plomero; INCAA lo incluye en el elenco principal. https://elcafediariook.com/lucy-en-el-cielo-beatles-lennon-y-un-codigo-misterioso/ identifica al actor durante una entrevista tras el estreno, y enlaza su perfil oficial. Imagen: https://elcafediariook.com/wp-content/uploads/2025/08/65415222-76c3-4533-9d6f-27a0abd297ec.jpg | Se verificó su posición a la izquierda frente al entrevistador, contrastada con las fotografías identificadas de la misma nota. Recorte individual 275×510 del original 720×1280, `/people/lucas-martinez-foresi-nm9496461.jpg`. Sin nacimiento ni nacionalidad individual verificables. |

Los recortes sólo seleccionan las personas reales y conservan sus rasgos; no hay caras generadas, alteración creativa, fotogramas ni placeholders. Todos los archivos finales pasan por `images:people:optimize`, única política de formato y compresión.

## Contingencia y omisiones

- Sofía Langoni, nm13719695: identidad y rol de Laura verificados en IMDb, INCAA y https://cinenacional.com/persona/sofia-langoni/ . IMDb carece de retrato; búsquedas de agencia/perfil y la pista https://vimeo.com/601852637 sólo aportaron un reel, sin retrato individual atribuible y suficiente. No se usaron fotogramas ni perfiles de homónimas. Se omite de `mainCast`; permanece reconocida en la investigación y no se sustituye por otra actriz.
- Silvina Diez, nm2018507: crédito de la hija verificado; búsquedas complementarias en IMDb, https://www.alternativateatral.com/persona51314-silvina-diez y https://ifargentine.com.ar/agenda/extremofilo2 confirman trayectoria, pero no recuperan retrato individual seguro. Alternativa muestra explícitamente `no-photo-profile.jpg`. Se omite del campo de elenco.
- Juan Lucero: INCAA e IMDb respaldan su crédito; búsqueda dirigida no recupera un retrato atribuible del actor exacto. Se omite del campo de elenco.
- Bruno Giacobbe: participación especial respaldada por el lanzamiento; no es necesario para el billing principal y no se incorpora como reemplazo de un protagonista ni para completar el mínimo.
- No se borró ninguna persona del catálogo global. Se cumple exactamente el mínimo requerido: un director y dos intérpretes principales distintos, todos con nombre completo y retrato.
- FilmFreeway e IMDb tuvieron bloqueos HTTP en la herramienta web, resueltos con lectura normal del navegador. Instagram devolvió 429 al intento de consulta de perfil; no se insistió en el endpoint. Se utilizó la publicación visible y atribuida del perfil oficial.
- `enrich-people --strict` encontró cero entidades automáticas para este título y no alteró las tres identidades manuales. El audit independiente de personas pasó sin errores.
- `update-upcoming-releases` se ejecutó, pero TMDb devolvió HTTP 403; el script conservó el archivo generado existente y no se inventaron datos ni se modificó el colector.

## Validación

Resultados registrados en `check-*.log`, `audit-final-prebuild.log`, `build.log` y los artefactos de navegador de esta carpeta. La auditoría candidata con YouTube habilitado pasó sin errores. Quedan siete advertencias automáticas: dos nacionalidades individuales ausentes, dos nacimientos ausentes y tres hosts de retratos no incluidos en su lista habitual; las tres fotos se verificaron manualmente.

`flags:sync`: 58 banderas locales, sin nuevas descargas. `catalog:movies` y su check, catálogo de personas, `posters:localize`, política de fuentes, verificador del póster, medidores, `images:people:check` (5467 retratos), `npm run check` (0 errores/advertencias) y `validate:content --skip-build`: aprobados. El validador de personas detectó esta alta sin commit; el auditor por diff detectó cero commits, por lo que se usó además el candidato explícito. El primer build detectó sinopsis de más de 320 caracteres; se corrigió y se repitió la auditoría.

La compilación de la carga original pasó: 7545 páginas. Tras la ampliación del usuario se modificó la presentación de nacionalidades ausentes en cinco archivos compartidos: `src/lib/people.ts`, `src/scripts/home-catalog.ts`, ficha de películas, directorio y ficha de personas. El cambio elimina por completo la fila y su etiqueta cuando falta el dato; preserva nacionalidades confirmadas y lugares de nacimiento confirmados. No se rellenan nacionalidades por inferencia ni se modifican otras fichas de datos.

Se actualizaron las skills `la-posta-cine-add-movie`, `la-posta-cine-auditor`, `la-posta-cine-add-person-profile` y el contrato del alta, sincronizando repositorio, plugin e instalación global con el script canónico `sync-from-repo.mjs --install`. Los nueve entrypoints pasaron `quick_validate.py` en modo UTF-8; las copias se compararon normalizando saltos de línea. Se agrega regresión de navegador para desconocidos, dato verificado, directorio, ficha individual y construcción dinámica de home; se adapta la prueba existente de edad al carácter opcional de la nacionalidad.

La recompilación final pasó: 7545 páginas, y `npm run check` verificó 265 archivos sin errores, advertencias ni hints. El escaneo de 7546 HTML públicos (incluido 404) encontró cero leyendas `Nacionalidad no disponible` y cero filas vacías de nacionalidad. Pasaron la validación de salida pública, la indexabilidad del sitemap (5290 páginas canónicas), el check del catálogo y la validación de contenido posterior al build.

La auditoría candidata final, con YouTube y verificaciones de HTML de Comunidad, reacciones y carruseles, pasó sin errores y con las siete advertencias documentadas arriba. Se corrigió una expectativa obsoleta en el script de la skill auditora: buscaba las etiquetas antiguas `Mirala`/`Zafa` y asignaba a 6 la reacción de 5. Ahora verifica el label canónico de Score CinePosta y su reacción actual; no se cambió el componente público de reacciones. Las 15 piezas de las tres skills coinciden entre repositorio, plugin e instalación global; los nueve entrypoints se revalidaron correctamente.

La comprobación dedicada de la película pasó en Chromium y WebKit, escritorio (1440×900) y móvil (390×844): 4/4 pósters cargados, 12/12 retratos cargados, ninguna excepción JavaScript ni desborde horizontal, búsqueda de home con una coincidencia, exclusión correcta de Musical/Guerra, plataforma, año, duración, canonical y tráiler correspondientes. Se inspeccionaron las capturas de la ficha y del panel de personas, incluido el móvil con los tres retratos cargados. Artefactos: `browser-results.json`, `public-nationality-scan.json`, `chromium-desktop.png`, `webkit-mobile.png`, `people-desktop.png` y `people-mobile.png`.

La suite pertinente de Playwright pasó sus 48 casos (38,1 segundos) en `desktop-chromium`, `mobile-chromium`, `desktop-webkit` y `mobile-webkit`. Cubre edades/nacimientos, directorio y filtros, nacionalidades ausentes en créditos y home, preservación de nacionalidades/lugares de nacimiento verificados y la reacción canónica 6 · Buena. El atributo de filtro del directorio está normalizado en minúscula, mientras su texto visible conserva la nacionalidad. Las expectativas iniciales del nuevo caso de prueba se corrigieron para reflejar los datos reales y esa normalización, sin cambiar información existente. Log: `e2e-final.log`.

El alcance de UI está autorizado por la ampliación del usuario; no se modificaron URLs, estilos, workflows, Share, Comunidad ni archivos de reacciones. El usuario autorizó publicar en main y limpiar el checkout. Se publicará sólo este alcance validado; el cierre exige SHA remoto sincronizado, workflow exitoso y comprobación de la ficha y sus imágenes en producción. Los artefactos locales respaldan los resultados y se conservarán fuera del checkout al limpiarlo.
