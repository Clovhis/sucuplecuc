# CordobeCes: La película — carga del 17/10/2026

Una alta en `feature/movie-cordobeces-2026`, desde `323cf332`. Candidato explícito: `src/data/movies/cordobeces-la-pelicula-2026.json`. El dry-run no encontró duplicados por título, título original, año o slug. Fecha original y estreno argentino: 2026 y 15/10/2026; fecha de reseña: 17/10/2026.

## Score final: 5 · Regular, por indicación del usuario

Se encontró una nota numérica que no estaba disponible en el relevamiento anterior: [Emiliano Basile en EscribiendoCine, publicada el 15/10/2026](https://www.escribiendocine.com/noticias/2026/10/15/25994-critica-de-cordobeces-la-pelicula-entre-la-pasion-y-el-video-turistico/), **6,0/10**. Es la valoración de un crítico individual, no un promedio ni un consenso de audiencia. Consulta: 17/10/2026. Conversión: `round(6,0) = 6`; tope de confianza por crítico individual: 8. El usuario luego pidió expresamente «no le pongas buena, ponele regular, un 5»: se aplica ese tope editorial particular de 5 después de normalizar. Resultado final: `min(6, 8, 5) = 5`. La fuente sigue siendo 6; el 5 es la decisión editorial del usuario, no una supuesta cifra del crítico. No cumple ni requiere elegibilidad para 9/10.

La instrucción inicial fue buscar score y, sólo si no se conseguía, asignar «Mala» (4). Esa alternativa no se aplicó porque se consiguió una fuente numérica verificable; la indicación posterior explícita fija **5 · Regular** como valoración final.

Antes de recurrir a crítica se buscaron RT audiencia, IMDb, TMDb, Letterboxd, Filmweb y Metacritic User Score por título/año. No se verificó un agregado de audiencia: los resultados dirigidos de RT/IMDb/Filmweb no dieron una ficha exacta con cifra; [Letterboxd](https://letterboxd.com/film/cordobeces-la-pelicula/) identifica la obra pero su JSON-LD no publica `aggregateRating`; [TMDb 1792634](https://www.themoviedb.org/movie/1792634) y Metacritic bloquearon acceso. El helper canónico de Watchmode, con ese TMDb ID y `--include-ratings`, no devolvió coincidencia inequívoca. No se confundió acceso bloqueado con inexistencia del dato, ni null con cero. La crítica de [Ricardo De Luca](https://cineargentinohoy.com.ar/critica-de-cordobeces/) es cualitativa y no se convirtió artificialmente en puntaje.

## Disponibilidad y metadatos argentinos

| Campo | Fuente | Hecho y decisión |
|---|---|---|
| Plataforma | [JustWatch AR](https://www.justwatch.com/ar/pelicula/cordobeces-la-pelicula) | No ofrece streaming confirmado; anuncia llegada a salas el 15/10. |
| Cine vigente | [Cartelera actual Cinemark](https://www.cinemark.com.ar/elegi-pelicula) | Incluye `HO00013235`, estado `SHOWING_NOW`; disponibilidad argentina actual verificada el 17/10. |
| Exhibidor | [Ficha oficial Cinemark](https://www.cinemark.com.ar/pelicula/cordobeses-la-pelicula) | Nombre con variante «Cordobeses», 90 minutos, G, comedia y estreno 15/10/2026. El usuario aporta además una captura de la misma película y señala el complejo DOT. No se afirma un horario específico del DOT que la página pública no haya mostrado. |
| País, año, créditos | [Cine Nacional](https://cinenacional.com/pelicula/cordobeces-la-pelicula) | Producción argentina de 2026, dirigida por Lucía Palacio; protagonistas Kaitlin Nelson y Eddie Frari. `country: AR`, `isArgentinian: true`. |
| Producción | [Comunicación de prensa con ficha técnica](https://labancada.com.ar/Paginas.php?Id=2260&Seccion=4) | UMA Films y Murga. No se confundieron apoyos o distribuidor con productora. |
| Fecha AR | [Sitio oficial](https://cordobeces.com.ar/) y Cinemark | 15/10/2026. |
| Género | Cinemark y Cine Nacional | Comedia como carril principal; Documental secundario por el registro de costumbres y entrevistas mezclado con ficción. |
| Musical / Guerra / Culto | Premisa, tráiler y fuentes de la obra | Las actuaciones musicales y el cuarteto forman parte del contexto, no sostienen la narración como musical. No hay guerra central ni clasificación curada De culto. No se añadieron etiquetas para activar medidores. |
| Clasificación | Cinemark G; JustWatch ATP | Normalización canónica `ATP`. |

`releasePlatform: Cine`. No se agregó una plataforma digital sin evidencia AR ni se inferió una futura ventana por el distribuidor.

## Póster y tráiler

- Arte: [Cine Nacional, original identificado en la ficha](https://img.cinenacional.com/insecure/rs%3Afill%3A1920%3A%3A1/g%3Asm/q%3A78/plain/local%3A%2F%2F%2Fcinenacional%2Fposters%2F198547%2Fdc4f32fd-d648-48a9-9462-1708164c0062.png). HTTP 200, PNG, 1430×2048, 4.539.471 bytes. Revisado visualmente antes de localizar; es el mismo cartel de la captura aportada por el usuario. El crédito Bezza presenta y los apoyos inferiores pertenecen al arte oficial; no son marcas agregadas por un sitio de carteles. No hay banderas, mapas ni sellos de un país ajeno.
- Salida canónica mediante `new-movie --poster-url` / localizador: `public/assets/posters/2026/cordobeces-la-pelicula-2026.webp`, 480×687, 78.352 bytes, sin fallback. No se usaron imágenes de Cines Argentinos. El arte de Cinemark era demasiado pequeño (415×593) y JustWatch s718 quedaba por debajo del mínimo de ancho: se descartaron como fuentes finales.
- Tráiler: [Cordobeces La Pelicula | Trailer Oficial - HD](https://www.youtube.com/watch?v=PT99q10v6fA), canal oficial `@Somoscordobeces`. oEmbed confirma título, autor y reproducción. Auditor inicial sin omitir YouTube: aprobado.

## Personas

Se conservaron la directora y los dos protagonistas. Otros invitados y participaciones especiales no se incorporaron al elenco principal; no se reemplazaron protagonistas para completar un mínimo.

- **Lucía Palacio**: [perfil y crédito](https://cinenacional.com/persona/lucia-palacio), contrastado con [la comunicación de prensa](https://labancada.com.ar/Paginas.php?Id=2260&Seccion=4) y Córdoba Ahora. Retrato derivado de una fotografía de rodaje identificada por Cine Nacional, con Lucía a la izquierda junto al equipo de cámara. Se eligió un recorte del servidor alrededor de la directora; no se usó un fotograma de su película ni se generó una cara. [Imagen original](https://img.cinenacional.com/insecure/rs%3Afill%3A1920%3A%3A1/g%3Asm/q%3A78/plain/local%3A%2F%2F%2Fcinenacional%2Fgallery%2F198547%2Fae478aab-985d-4a19-8ae8-72b2157d5331.jpg); recorte y URL exacta en `people.json`; archivo `public/people/lucia-palacio.jpg`.
- **Kaitlin Nelson**: [perfil de Cine Nacional](https://cinenacional.com/persona/kaitlin-nelson), [identificación como actriz estadounidense](https://cordobaahora.com/cordoba-llega-a-la-pantalla-grande-con-cordobeces/) y [entrevista personal](https://entretenimientoscordoba.com.ar/2026/10/16/kaitlin-nelson-la-estadounidense-que-se-enamoro-de-un-coscoino-mi-mama-vio-cordobeces-y-me-pregunto-que-significa-culiao/). Retrato individual de su perfil, 1538×2048 antes de optimizar. Archivo `public/people/kaitlin-nelson.jpg`. El enriquecedor automático cruzó por nombre con una identidad de Wikidata canadiense: se rechazó esa referencia y se repuso la nacionalidad estadounidense respaldada por las fuentes de esta película. No se conservó un IMDb ID dudoso.
- **Eddie Frari**: [perfil y fotografía individual](https://cinenacional.com/persona/eddie-frari), contrastado con [Córdoba Ahora](https://cordobaahora.com/cordoba-llega-a-la-pantalla-grande-con-cordobeces/). Retrato original 1536×2048. Archivo `public/people/eddie-frari.jpg`.

Las tres imágenes se inspeccionaron visualmente y pasaron el optimizador canónico. No hay fechas de nacimiento verificadas; se omitieron. No se infirió nacionalidad de Lucía o Eddie por su residencia, su habla ni el país de la película. Los avisos del auditor sobre host poco frecuente y referencias ajenas a su lista corta de dominios se contrastaron manualmente con los perfiles nominales de Cine Nacional; son fuentes trazables, no identidades sin respaldo. No se crearon biografías extensas.

## Textos y alcance

Sinopsis, reseña y siete campos de lectura rápida escritos desde cero por IA para esta película, en español rioplatense. No se copió ni parafraseó de cerca la crítica usada para el score. La reseña desarrolla el intercambio entre las dos miradas y el efecto de mezclar ficción, conversación y registro de lugares; no reproduce un argumento numérico ni una etiqueta de valoración.

La carga de CordobeCes comprende la película, tres registros/retratos, póster y catálogos derivados. El usuario agregó una revisión completa de cartelera con alcance CABA + Provincia de Buenos Aires y la actualización de las skills; sus ocho bajas y nueve candidatos finales están en `cartelera-argentina-2026-10-17.md`. La continuidad de CordobeCes dentro del territorio quedó verificada en la API de Gaumont, CABA, funciones 17–21/10. No cambian código, UI, Share, Comunidad, reacciones ni las ediciones versionadas de Radar, recomendadas o próximos estrenos.

## Validación

Auditor explícito de contenido y YouTube sin errores. Auditor de personas aprobado; faltantes opcionales de nacimiento/nacionalidad documentados. `images:people:check` aprobado sobre 5.766 retratos. Política de pósters y medidores editoriales aprobados. `npm run check`: cero errores, avisos o hints. `validate:content` completo aprobado, build y sitemap de 5.595 páginas canónicas incluidos. Auditor posterior con Comunidad, reacción de score 5 y carruseles aprobado sobre los nueve candidatos finales. Chromium escritorio y WebKit móvil verifican `5 · Regular`, póster local 480×687 cargado, personas y ausencia de placeholders; las nueve imágenes del manifiesto cargan en cada perfil. Cartelera final: 43 tarjetas; ocho bajas excluidas. Suite existente de carruseles: ocho pruebas aprobadas.
