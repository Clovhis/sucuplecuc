# Halloween: actualidad del sábado 24 de octubre de 2026

## Enfoque y alcance

Nota original: **Halloween ya arrancó: salí a pasarla mal**. Agenda cultural de CABA y Olivos desde el 24 hasta el 31 de octubre, con humor rioplatense y sin inventar un visionado o experiencias personales del usuario. Publicación autorizada directamente a main. No se crean películas ni se modifican reseñas, scores, plataformas, cartelera o las ediciones independientes del home.

1067 palabras de cuerpo, lectura calculada de cinco minutos, doce párrafos y cuatro imágenes intercaladas. Firma CinePosta, `type: nota`, fecha argentina 2026-10-24, spoilers desactivados. Al tratar varios programas no se fuerza un `movieSlug` único. Integración mediante el modelo existente: archivo editorial, hasta seis tarjetas del home y Radar propio.

## Datos comprobados en fuentes primarias

Consultados el 24/10/2026. No se trasladan horarios de otra ciudad ni se presentan estas reposiciones como estrenos originales.

| Función | Fecha y hora AR | Sede | Evidencia |
|---|---|---|---|
| Psicosis (1960), Alfred Hitchcock | Sábado 24, 24:00; madrugada del domingo 25 | Malba, Av. Figueroa Alcorta 3415, CABA | https://malba.org.ar/evento/psicosis/ |
| Vampiros (1998), John Carpenter, 35 mm | Domingo 25, 18:00 | Cine York, Juan Bautista Alberdi 895, Olivos | https://lumiton.ar/evento/vampiros-en-35-mm/ |
| Drácula, de Bram Stoker (1992), Francis Ford Coppola | Domingo 25, 20:30 | Cine York | https://lumiton.ar/evento/dracula-de-bram-stoker/ |
| Nosferatu (1922), F. W. Murnau, con El Juego Infinito en vivo | Viernes 30, 20:30 | Cine York | https://lumiton.ar/evento/nosferatu-musicalizada-por-el-juego-infinito/ |
| Espantitos; Hotel Transylvania (2012) | Sábado 31, 16:00 y 17:30, respectivamente | Cine York | https://lumiton.ar/evento/hotel-transylvania/ |
| El exorcista (1973), William Friedkin, 35 mm | Sábado 31, 21:00 | Cine York | https://lumiton.ar/evento/el-exorcista-en-35-mm/ |
| Noche de brujas / Halloween (1978), John Carpenter | Sábado 31, 24:00; madrugada del domingo 1/11 | Malba | https://malba.org.ar/evento/noche-de-brujas/ |

El ciclo Maestros del Terror confirma ingreso no arancelado, por orden de llegada y capacidad limitada: https://lumiton.ar/grupo_de_eventos/maestros-del-terror/ . Hotel Transylvania también anuncia entrada sin arancel. Malba enlaza la venta de entradas desde cada ficha; no se inventa precio ni disponibilidad de butacas. La nota conserva las fuentes visibles y recomienda consultar las condiciones vigentes antes de salir.

La ficha oficial de Nosferatu identifica a Jerónimo Naranjo, Hernán Kerlleñevich y Sami Abadi y sus instrumentos. La de Hotel Transylvania documenta los cortos y el taller de afiches con Gustavo Sala. Se omiten horarios del York ya transcurridos el 24 al momento de preparar la publicación.

## Imágenes: procedencia e inspección visual

Se conservaron proporciones, color y contenido. WebP de 1280 y 640 px, sin ampliación, con medidas reales, alt descriptivo y enlace visible de procedencia. No se afirma una licencia de reutilización no comprobada. Los originales descargados y capturas de trabajo quedan fuera del repositorio, en la carpeta temporal específica de la tarea.

| Archivo | Imagen verificada | Original | Dimensión final |
|---|---|---|---|
| psicosis.webp | Janet Leigh gritando, azulejos, blanco y negro | https://malba.org.ar/wp-content/uploads/2026/02/22.-psicosis.jpeg | 1280 x 720 |
| dracula.webp | Gary Oldman con lámpara y túnica roja | https://lumiton.ar/wp-content/uploads/2026/09/Dracula-e1790358065890.jpg | 1280 x 461 |
| nosferatu.webp | Sombra de Orlok en una escalera; también portada | https://lumiton.ar/wp-content/uploads/2026/09/Nosferatu-e1790358283463.jpg | 1280 x 459 |
| hotel-transylvania.webp | Mavis, Drácula y monstruos frente al hotel, promoción de la película de 2012 | https://www.sonypictures.com/sites/default/files/banner-images/2019-06/hoteltransylvania_banner_2572x1100_copyright.png | 1280 x 547 |

La página de Sony que identifica el material es https://www.sonypictures.com/movies/hoteltransylvania . Se rechazó la imagen ofrecida por Lumiton para Hotel Transylvania porque muestra a Dennis y corresponde a una secuela. También se descartó el fotograma de levitación de El exorcista para evitar anticipar una escena avanzada. No se usan imágenes generadas, afiches repetidos ni fotogramas de adaptaciones distintas.

## Validación y publicación

- `npm run check`: 307 archivos, cero errores, advertencias e indicaciones.
- `npm run build`: aprobado, 8051 páginas, ejecutado sin otros builds en paralelo.
- Suite completa `tests/e2e/editorial.spec.ts` en desktop-chromium y mobile-chromium: **56/56 aprobadas**, sin reintentos (44,6 segundos). La nueva nota entra en el recorrido existente de fuentes, SEO, home/archivo, navegación y medios.
- Inspección visual de portada en las tarjetas del home, encabezado de escritorio, columna completa y vista de 320 px. Sin overflow, imágenes decodificadas y recorte reconocible de Orlok.
- Dimensiones reales comprobadas de los ocho WebP. Los doce párrafos del HTML generado coinciden exactamente con el JSON; aparecen la ruta en home, archivo y sitemap, y `timeRequired: PT5M`.
- Se conserva el contenido anterior de `test-results/` y `playwright-report/`; las nuevas capturas y logs se guardan fuera del repositorio en la carpeta temporal de la tarea.

Se autoriza el push directo a main conservando el hook de validación. URL de la publicación: https://www.cineposta.com.ar/editorial/halloween-2026-sali-a-pasarla-mal/ . El cierre de la tarea debe comprobar éxito de Pages para el SHA publicado, nota y ocho medios públicos, y main limpio y sincronizado; esos resultados remotos se informan en la entrega.
