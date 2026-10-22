# Estrenos en cines: nota del 22 de octubre de 2026

Nota creada con `skills/cineposta-editorial/SKILL.md` en la rama `feature/movie-cartelera-ba-2026-10-22`, junto con la carga de películas ya preparada en esta conversación. La creación de la nota no publica el sitio: sin commit, push, deploy ni envío a redes.

## Texto e integración

`src/data/editorials/estrenos-cines-22-octubre-2026.json`: **«Estrenos de la semana: Clayface, Wanda y el regreso de Los otros»**. Firma CinePosta, fecha 22/10/2026, tipo nota, destacada y sin spoilers fuertes. Texto original de 1096 palabras, 13 párrafos y cinco minutos calculados a 220 palabras/minuto. No reproduce reseñas ni inventa recuerdos o reacciones de un visionado.

Recorre las novedades de la semana 22–28 de octubre en CABA y Provincia de Buenos Aires: Clayface, El poder de la red, Terror en el Amazonas, Buenas vibraciones, Que Dios perdona a todos, ¿Querés ser mi hijo?, Heidi: El rescate del lince, Susana Rinaldi, libre y Militante, más el reestreno de Los otros (2001). Se presenta la propuesta de cada título para orientar una salida; no se agregan puntajes ni se promete exhibición uniforme en todas las localidades.

La nota colectiva no tiene un `movieSlug` arbitrario. Se integra mediante los componentes existentes en «Desde CinePosta», `/editorial/`, su propia ruta y Radar calculado durante el build. No cambia componentes, estilos, fichas, reseñas, personas ni ediciones automáticas. Se suma la publicación al recorrido parametrizado de la suite editorial existente, que comprueba navegación, SEO, fuentes e imágenes.

Militante tiene estreno y premisa documentados, por lo que puede formar parte de una nota de agenda aunque no tenga una ficha completa en el catálogo. No se inventan participantes ni se crea su ficha durante esta tarea.

## Investigación y fuentes

Consultadas el 22/10/2026. Fechas y funciones locales provienen del [relevamiento de cartelera de esta conversación](cartelera-ba-2026-10-22.md) y su [matriz de evidencia](cartelera-ba-2026-10-22/evidencia.json). Las fechas estadounidenses, francesas e italianas de las páginas promocionales no se trasladan a Argentina.

- [Clayface, sinopsis oficial](https://www.clayfacemovie.com/synopsis/) y [entrevista del estudio con imágenes](https://www.skydance.com/news/the-gnarly-new-face-of-dc-super-villains): Matt Hagen, Tom Rhys Harries, James Watkins, Naomi Ackie, tratamiento, identidad y terror corporal; guion de Mike Flanagan/Hossein Amini. Se evita describir escenas de horror no vistas o anticipar el desenlace.
- [Sony Pictures](https://www.sonypictures.com/movies/thesocialreckoning) y [Cinemark Argentina](https://www.cinemark.com.ar/pelicula/el-poder-de-la-red): Aaron Sorkin, Frances Haugen/Mikey Madison, Jeff Horwitz/Jeremy Allen White, Jeremy Strong y fecha AR 22/10.
- [Lionsgate, tráiler oficial de Beware Boiúna](https://www.youtube.com/watch?v=4fn4UcgzRhg) y [prensa Praesens](https://en.praesens.com/praesens-pro-presse/katalog/beware-boiuna/): Mike P. Nelson, reparto, misión médica, criatura y supervivencia. La fecha extranjera de noviembre no se usa como estreno argentino.
- [Buenas vibraciones, Agenda de Cine](https://agendadecine.com/pelicula/buenas-vibraciones), contrastado con la comunicación de Studio TF1: Reem Kherici, Lamy/Cluzet, matrimonio y confesión de Fanny. No se transforma una premisa promocional en una valoración propia.
- [PiperFilm, tráiler oficial de Que Dios perdona a todos](https://www.youtube.com/watch?v=3UWOx-Q_q_E): Pif, Giusy Buscemi, Arturo/Flora, pastelería y fe fingida. No se revela el giro o desenlace del vínculo.
- [Cine Nacional](https://cinenacional.com/pelicula/queres-ser-mi-hijo), [avant-première en Gente](https://www.revistagente.com/galerias/asi-fue-la-avant-premiere-dequeres-ser-mi-hijo-con-wanda-nara-toda-su-familia-y-martin-migueles-agustin-bernasconi-y-muchos-famosos-todas-las-fotos/) y [La Nación del 21/10](https://www.lanacion.com.ar/espectaculos/personajes/en-fotos-wanda-nara-presento-su-primera-pelicula-con-el-apoyo-incondicional-de-su-familia-y-amigos-nid21102026/): versión argentina de Hernán Guerschuny, Wanda Nara/Agustín Bernasconi; no se confunde con la película mexicana de 2023.
- [Studio 100 Film](https://www.studio100film.com/en/catalog/heidi-rescue-of-the-lynx/) y [Apollo Films](https://apollo-films.fr/heidi-et-le-lynx-des-montagnes-2/): animación, Tobias Schwarz, lince, Pedro y aserradero. Se conserva su año original 2025 y se distingue del estreno argentino de hoy.
- [CÍCLICO y la gacetilla de Cinetren](https://somosciclico.com/nota/susana-rinaldi-libre-el-documental-de-isabel-marcenaro-estrena-el-22-de-octubre/), [Funcinema](https://www.funcinema.com.ar/2026/10/anticipo-del-documental-susana-rinaldi-libre/) y Gaumont: Susana Rinaldi, libre, dirección de Isabel Marcenaro y estreno del 22. La ficha antigua de Cinetren acredita también a Alejandro Ollivier como director; la gacetilla vigente y BAFICI distinguen dirección de Marcenaro y coguion de Ollivier. Se usa esa atribución actual, sin modificar datos de películas en esta tarea.
- [El Nacional de Matanza](https://elnacionaldematanza.com.ar/2026/10/18/militante-el-nuevo-documental-de-federico-sosa-llega-al-espacio-incaa-de-ate-cultura/), [Agencia Paco Urondo](https://www.agenciapacourondo.com.ar/cultura/federico-sosa-presenta-su-documental-militante) y agenda local: Federico Sosa, Pablo Ayala, campañas 2019/2023 y estreno del 22 en Sala Norita Cortiñas. No se reproduce el domicilio porque las agendas discrepan.
- [Cinema La Plata, Los otros](https://www.cinemalaplata.com/Titulos/Index/8514): reestreno con funciones de la semana 22–28. Se preserva 2001 como año original; no se anuncia restauración o formato especial sin prueba.

## Imágenes

Cinco imágenes inspeccionadas visualmente antes y después de convertirlas a WebP, con variantes de 640 px y hasta 1280 px sin ampliar los originales. Procedencia y dimensiones exactas quedan en el manifiesto de imágenes del reporte. No se generan escenas con IA ni se sustituyen stills por pósters.

| Imagen | Principal | Idea que acompaña |
|---|---|---|
| Clayface | 1280 × 711 | Matt Hagen ante los flashes; carrera e identidad. Se reutiliza como portada. |
| El poder de la red | 1280 × 547 | Jeremy Strong con traje; elenco y poder empresarial. |
| Terror en el Amazonas | 1280 × 689 | Kiana Madeira/Lena cubierta de barro; supervivencia. |
| Heidi | 1280 × 536 | Heidi con el cachorro de lince; cuidado del animal. |
| Susana Rinaldi | 850 × 479 | Lectura frente al micrófono; palabras y música. Original sin ampliar. |

La foto de Boiúna conserva atribución «© 2026 Lionsgate» según los metadatos del material oficial. La imagen de Susana fue difundida como material de prensa por CÍCLICO. La procedencia está documentada; no se afirma una licencia que no se haya comprobado. Cada figura enlaza visiblemente su fuente.

Descartes: el video de fondo de clayfacemovie.com muestra «VIDEO COMING SOON»; no es una escena del film. Se reemplaza por una imagen nominalmente acreditada de la entrevista oficial. Se descarta una imagen de Heidi desayunando porque el vínculo con el lince es más específico para el párrafo. No se usan escenas con desenlaces ni la imagen hospitalaria de Clayface como portada.

## Validación

- `npm run check`: 302 archivos; cero errores, advertencias o hints.
- `npm run build`: aprobado; 8035 páginas, 10 min 30 s.
- `npm run validate:public-output`: aprobado.
- `npm run validate:sitemap-indexability`: aprobado; 5635 URLs canónicas.
- Recorrido directo en Chromium a 1440 y 320 px: nota primera en home (seis tarjetas) y archivo (26 publicaciones), orden completo contrastado con el loader; fecha 22/10, cinco minutos, 13 párrafos idénticos al JSON y cinco imágenes decodificadas, sin errores de página ni overflow en la nota.
- Revisión visual de cabecera, texto, fuentes, imágenes y tarjeta: aprobada a 1440 y 320 px. La portada mantiene visible el rostro de Matt Hagen en ambos tamaños. Se revisó también la sección completa de tarjetas de la home.
- Hashes de 2396 archivos (2393 películas, personas y dos snapshots) conservados respecto al inicio de la nota. Los cambios de la carga anterior permanecen intactos.
- Suite editorial Chromium escritorio/móvil: **54/54 aprobadas**, con un worker. 54 passed (3.1m).

Evidencia final: [validación](editorial-estrenos-2026-10-22/validacion.json), [imágenes y procedencia directa](editorial-estrenos-2026-10-22/images-evidence.json), [captura completa escritorio](editorial-estrenos-2026-10-22/article-full-1440.png), [captura completa 320 px](editorial-estrenos-2026-10-22/article-full-320.png) y [tarjeta móvil](editorial-estrenos-2026-10-22/card-320.png).

URL local de revisión: http://127.0.0.1:43224/editorial/estrenos-cines-22-octubre-2026/. El servidor de revisión permanece activo. Sin publicación ni envíos externos.

Los logs versionados omiten la enumeración repetida de rutas y normalizan espacios finales. Se conservan resultados, advertencias, errores y resúmenes; los registros originales quedan en el archivo temporal de investigación.
