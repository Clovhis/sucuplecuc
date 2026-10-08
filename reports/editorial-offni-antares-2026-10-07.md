# Dos notas: OFFNI y La estrella que perdí

Fecha de verificación y redacción: **7 de octubre de 2026**, Argentina. Las dos notas se prepararon y validaron localmente sobre `main`. Tras revisarlas, el usuario autorizó su publicación en `main` y la limpieza del workspace. No se realizaron publicaciones sociales.

## Publicaciones

| Nota | Archivo | Ruta de revisión |
| --- | --- | --- |
| OFFNI Cine Fest 2026: octubre se pone raro y la entrada es gratis | `src/data/editorials/offni-cine-fest-2026-cine-fantastico-gratis-en-caba.json` | `/editorial/offni-cine-fest-2026-cine-fantastico-gratis-en-caba/` |
| La estrella que perdí ganó en Moscú y Mirta Busnelli también se llevó su premio | `src/data/editorials/la-estrella-que-perdi-premios-antares-2026-mirta-busnelli.json` | `/editorial/la-estrella-que-perdi-premios-antares-2026-mirta-busnelli/` |

Son dos noticias independientes, firmadas por CinePosta y fechadas el día de trabajo. Lectura calculada por el loader: cuatro minutos cada una. Se priorizó una extensión adecuada a las noticias sobre rellenar hasta los cinco minutos orientativos de la skill. No se atribuyen al usuario experiencias de visionado ni se presentan los textos como críticas de películas vistas.

## OFFNI: datos y discrepancias resueltas

- La [Casa Nacional del Bicentenario](https://casadelbicentenario.cultura.gob.ar/actividad/kino-cnb-offni-cine-fest-1/) anuncia la segunda edición del 9 de octubre al 1 de noviembre de 2026, entrada gratis y sede en Riobamba 985, CABA. La página fue obtenida directamente por HTTPS: el lector web inicial devolvía 403, pero la descarga pública devolvió el HTML completo.
- Su anuncio vigente dice **44 obras de 20 países**, dato coincidente con la [agenda de la Secretaría de Cultura](https://www.cultura.gob.ar/offni-test-17564/). Se corrigió la cifra de 43 del pedido y se explicó brevemente la diferencia en el cuerpo. No se presenta la cifra anunciada como un recuento independiente de películas.
- [EscribiendoCine, 10 de septiembre](https://www.escribiendocine.com/amp/noticias/2026/09/10/25013-offni-cine-fest-2026-presenta-su-programacion-en-la-casa-del-bicentenario), informa 43 obras de 21 países; [Agencia DAF, 5 de octubre](https://www.agenciadaf.com.ar/2026/10/la-nacional-del-bicentenario-alojara-el-festival-de-cine-fantastico-offni-2026.html), informa 43 de 20. Ambas sirven para contrastar la programación, pero se dio prioridad al anuncio actual de la sede para el total.
- **Horarios:** la programación detallada de la Casa dice viernes 19 h y sábados/domingo 18 h, corroborados por DAF y EscribiendoCine. El widget de horarios de la Casa muestra 18–21 h también los viernes; la agenda de Cultura invierte los horarios en su texto. La nota se refiere expresamente a la grilla por jornada y enlaza su consulta antes de salir.
- Verificadas apertura del 9/10, Día UFO del 10/10, Día Esotérico del 24/10, Halloween del 31/10 y cierre del 1/11, con los títulos y realizadores mencionados. **El caso Llanca corresponde al 17/10**, no al Día UFO del 10/10, error encontrado en otra cobertura y evitado.
- Las obras de años anteriores se describen como exhibiciones del festival; no se anuncian como estrenos comerciales. Los relatos ufológicos y criaturas no se presentan como hechos probados.

## Antares: verificación de ambos premios

La fuente decisiva es el [palmarés oficial en inglés](https://antares.film/en/winners), en el bloque **Winners of the III Antares International Film Festival 2026**, competencia de largometrajes de ficción. La página fue descargada completa por HTTPS y se contrastó con su [versión rusa](https://antares.film/winners). Las dos versiones son del mismo organizador, no dos confirmaciones independientes.

| Dato | Evidencia y tratamiento |
| --- | --- |
| Grand Prix | El palmarés identifica `The Star I Lost`, dirección Luz Orlando Brennan, Argentina. Se publica como Grand Prix de Antares 2026. |
| Actuación femenina | `Best Female Role` identifica a la intérprete de `The Star I Lost`, misma dirección y país. La página escribe erróneamente `Mirta Gusneli` y la versión rusa reproduce esa grafía. La identificación como **Mirta Busnelli** se contrastó con los [créditos de CineNacional](https://cinenacional.com/pelicula/la-estrella-que-perdi/ficha-tecnica/) y el [catálogo oficial Construir Cine 2024](https://festival.construircine.com/wp-content/uploads/2024/09/catalogo-construir-cine-2024-baja.pdf). Es una resolución de identidad por película y créditos, no una corrección del sitio del festival. |
| Nombre exacto del premio | Antares concede por separado `Best Feature-Length Fiction Film` a Steppe Gods, Oleg Asadulin. La nota conserva esa distinción; no transforma el Grand Prix en esa otra categoría. |
| Edición y sede | El [programa oficial 2026](https://antares.film/en/the-competition-program) ubica la tercera edición en Moscú e incluye The Star I Lost, profesión actriz, dirección Luz Orlando Brennan. |
| Sinopsis y ópera prima | Contrastadas con el [Centro Cultural 25 de Mayo](https://cc25.org/01-07-la-estrella-que-perdi/) y el catálogo Construir Cine. Se evita contar el giro de la trama. |
| Protagonistas y vínculo real | Construir Cine identifica a Mirta Busnelli y Anita Pauls como madre e hija dentro y fuera de la ficción. CineNacional usa Ana Pauls; la nota adopta ese nombre. |
| Trayectoria | [Film Fatales](https://www.filmfatales.org/directors/luzorlandobrennan/) y [Make Unit](https://makeunit.com/content-development.html) corroboran Cleveland, BAFICI, SANFIC y FAM; Film Fatales documenta formación y créditos previos. Se distingue su trayectoria profesional de su primer largo como directora. |

No se encontró una cobertura periodística independiente indexada de los premios en las búsquedas realizadas; la noticia se sustenta en el resultado publicado por el organizador. No se infiere disponibilidad actual en Argentina ni se agrega una plataforma o función vigente.

## Imágenes oficiales

Se descargó el [material de prensa OFFNI aportado por el usuario](https://drive.google.com/drive/folders/1ciA6Bxf0sgYsOBkeIv4NKy3ydcSaGBdn). Para La estrella que perdí se utilizó exclusivamente la galería del proyecto publicada por Make Unit. Cada imagen fue inspeccionada visualmente antes de redactar alt y epígrafes.

| Nota / imagen local | Original oficial | Original → WebP principal |
| --- | --- | --- |
| OFFNI / `cnxs.webp` | [9octCNXS (1).jpg](https://drive.google.com/file/d/1dCxvzVTWPXPc2va2rO72CP4A_j4loY1q/view) | 1920×1080 → 1280×720 |
| OFFNI / `la-cosa-en-la-niebla.webp` | [9OCTLACOSAENLANIEBLA.jpg](https://drive.google.com/file/d/1IoIXt1ip0fMpLATIuyy25sTFdfebQxvz/view) | 1920×804 → 1280×536 |
| OFFNI / `diario-de-un-alien.webp` | [10OCTDIARIODEUNALIENABANDONA (1).jpg](https://drive.google.com/file/d/1UOjPl5KEGXTd-22_DX1CKp1vz6Pw58hr/view) | 1920×1080 → 1280×720 |
| OFFNI / `el-caso-llanca.webp` | [17OCTLLANCA](https://drive.google.com/file/d/1WnrcDZr-0cY-f_AH-h3QVjj-qIA531FX/view) | 3840×2160 → 1280×720 |
| La estrella / `mirta-busnelli.webp` | [estrella_02.jpg](https://makeunit.com/assets/images/laestrellaqueperdi/estrella_02.jpg) | 2500×1407 → 1280×720 |
| La estrella / `madre-e-hija.webp` | [estrella_04.jpg](https://makeunit.com/assets/images/laestrellaqueperdi/estrella_04.jpg) | 2500×1407 → 1280×720 |
| La estrella / `norma-reyes.webp` | [estrella_08.jpg](https://makeunit.com/assets/images/laestrellaqueperdi/estrella_08.jpg) | 2500×1406 → 1280×720 |
| La estrella / `rodaje.webp` | [estrella_10.png](https://makeunit.com/assets/images/laestrellaqueperdi/estrella_10.png) | 1024×768 → 1024×768 |

Ocho imágenes originales, dieciséis WebP locales incluyendo variantes de 640 px. Conversión sin ampliación ni recortes; el recorte 16:9 de las tarjetas lo realiza el componente existente. Peso conjunto: 667.154 bytes; principal más grande: 123.866 bytes. Alt descriptivos sin inferir identidades en escenas dudosas. Fuentes visibles en cada imagen. Se conserva la procedencia; no se afirma una licencia que esas páginas no documenten.

## Integración y alcance

- Reutilizados `EditorialCard`, `EditorialHighlights`, `EditorialImage`, archivo, rutas y metadatos de Article. Las dos notas son destacadas, aparecen en las seis tarjetas de home y en el archivo por fecha; las anteriores siguen accesibles allí.
- Se agregó únicamente `sources` opcional al modelo editorial y su bloque de enlaces en el footer de las notas, con estilos ya existentes. Las publicaciones previas no necesitan ese campo.
- No existe ficha de La estrella que perdí ni perfiles extensos de Busnelli o Brennan en el catálogo revisado. Tampoco se encontraron fichas de las películas elegidas como imágenes de OFFNI. No se inventó un `movieSlug` ni una biografía. Se conservan los enlaces internos de home, archivo y navegación de las notas.
- No se cambiaron películas, reseñas, scores, plataformas, personas, CSS, automatizaciones ni catálogos derivados.
- La suite editorial agrega cobertura de estas noticias, fuentes, Article/SEO, navegación y variantes de imágenes a 320 px.

## Validación local

- `npm run check`: 261 archivos, **0 errores, 0 advertencias, 0 hints**.
- `npm run validate:content`: **aprobado**, incluyendo catálogos, auditorías de contenido y originalidad, build, HTML y sitemap.
- `npm run build`: compilación final independiente **aprobada**, **7.542 páginas**. Al inicio se detectó que validate:content incluía otro build y se detuvo el build separado que se había superpuesto. La evidencia final corresponde a una nueva compilación serial, terminada correctamente.
- `npm run validate:public-output`: **aprobado** sobre la compilación final.
- `npm run validate:sitemap-indexability`: **aprobado**, **5.288 páginas canónicas**. Se comprobó además la inclusión de ambas rutas nuevas en el sitemap.
- `npx playwright test tests/e2e/editorial.spec.ts --project=desktop-chromium --project=mobile-chromium --workers=2 --output=test-results/editorial-chromium`: **24/24 aprobadas**.
- `npx playwright test tests/e2e/editorial.spec.ts --project=desktop-webkit --project=mobile-webkit --grep 'news sources' --workers=2 --output=test-results/editorial-webkit`: **4/4 aprobadas**. Ambos comandos reutilizaron el preview local con `PLAYWRIGHT_REUSE_SERVER=1`.
- Inspección visual de tarjetas a 1280 px y notas a 320 px; fuentes visibles, fechas correctas, imágenes decodificadas y sin overflow horizontal. Capturas completas de las nuevas notas en ambos navegadores dentro de los directorios de resultados.
- Comprobación adicional del HTML: cada párrafo coincide exactamente con el JSON original; canonical, description y OG image coinciden con la publicación correspondiente.
- Comprobación adicional con Sharp: dimensiones de todas las imágenes y variantes de 640 px correctas.
- `git diff --check`: **aprobado**.

La revisión se realizó con el preview local en 127.0.0.1:43210. Rutas públicas de las notas: [OFFNI](https://www.cineposta.com.ar/editorial/offni-cine-fest-2026-cine-fantastico-gratis-en-caba/) y [La estrella que perdí](https://www.cineposta.com.ar/editorial/la-estrella-que-perdi-premios-antares-2026-mirta-busnelli/).

Evidencia local preservada, sin versionar: `test-results/editorial-research-2026-10-07/` contiene páginas oficiales consultadas, la comprobación visible de Antares, originales de imágenes, manifiesto de dimensiones, capturas y logs. [Vista del archivo en escritorio](../test-results/editorial-research-2026-10-07/archive-desktop.png).

La aprobación posterior del usuario habilita commit, push a `main`, comprobación del despliegue y cierre del preview. La evidencia del despliegue y del estado final se conserva localmente en `test-results/editorial-release-2026-10-07.json`.
