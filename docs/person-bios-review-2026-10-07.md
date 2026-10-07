# Biografías extendidas: diseño de revista

Rama: `design/extended-bios-2026-10-07`. Base: `d018e244`.

Se revisaron los últimos cuatro commits: `d018e244` (retiro del bloque de
comunidad del home), `b28953fc` (imagen del simulador), `38961526` (promos y
agenda) y `89416bfe` (trailers). También se inspeccionó la presentación actual
de las fichas de películas, incorporada en `81fc6f33`.

## Alcance

La plantilla compartida `src/pages/personas/[slug].astro` aplica el diseño a
todas las biografías de actores, directores y productores. Los estilos viven
en `src/styles/person-detail.css`, limitados a `body.person-edition`.

El retrato se acota a 200 × 250 px en escritorio y 96 × 120 px en teléfonos.
El nombre, los roles, la presentación y los datos encabezan la ficha. Hay
enlaces internos a biografía, filmografía y premios, según el contenido real.
La lectura y la filmografía comparten una columna principal, acompañada por
una lateral con títulos destacados, premios y referencias. Así las bios
cortas no dejan un gran hueco a la espera de que termine la lista de premios.
En móvil, la biografía y las películas aparecen antes de la información
complementaria, en una sola columna. Se reutilizan
la paleta, la tipografía sans, las líneas y los radios discretos del sitio.

Se conservan los textos, las personas, los créditos reales, el orden por año,
las referencias, los premios y las imágenes existentes. Tampoco se cambia la
lógica de retorno, las URLs, los metadatos o la política de indexación.
Los bloques vacíos de premios se omiten, junto con su enlace de navegación.

## Películas acotadas

La grilla anterior usaba `auto-fit` con columnas que crecían hasta ocupar todo
el ancho. Diego Cremonesi, con una sola película, mostraba una tarjeta de
1.139,625 × 1.681,563 px en una ventana de 1.440 px.

La nueva grilla mantiene columnas de 180 px usando `auto-fill`, incluidas las
vacías. En teléfonos tiene dos columnas de hasta 180 px, que se ajustan al
ancho disponible. Una película conserva el mismo tamaño que una filmografía
larga. Los posters mantienen proporción 2:3 y `object-fit: contain`.

## Validación

La comprobación de contratos compara la salida de las 759 fichas con los
datos fuente: párrafos editoriales completos, enlaces y orden de créditos,
canonical e indexabilidad. Los datos fuente permanecen idénticos a la base.

Resultados finales:

- `npm run check`: cero errores, warnings o hints.
- `npm run build`: correcto; 7.540 páginas generadas.
- `npm run validate:public-output`: correcto.
- `npm run validate:sitemap-indexability`: correcto; 5.286 páginas canónicas.
- Comprobación de contratos: las 759 fichas coinciden con sus párrafos,
  enlaces y orden de filmografía, canonical e indexabilidad de origen.
- Playwright: 118 casos aprobados entre la suite y la repetición focalizada;
  dos omisiones previstas para una prueba exclusiva de móvil en escritorio.
  Se ejecutaron `person-detail-design`, `person-profile-originality`,
  `people-image-quality`, `person-birth-data`, `award-assets`, `person-index`
  y `movie-detail-design`, con dos workers y los proyectos desktop/mobile
  de Chromium y WebKit. El diseño recorre 320, 390, 600, 768, 1.024 y 1.440 px.
- Capturas inspeccionadas de Diego Cremonesi, Brad Pitt y Steven Spielberg
  en escritorio y móvil de ambos motores, con posters cargados. Las métricas
  registran 180 × 270 px en escritorio y 171 × 256,5 px en móvil de 390 px,
  tanto con una película como con 21 o 36. Se verifica también el caso de
  dos películas (Adria Arjona), el retorno al directorio filtrado, los enlaces
  a secciones y la ausencia de bloques vacíos de premios.

La suite detectó una expectativa antigua en `movie-detail-design`: esperaba
un 9 para Ant-Man aunque `2d064b90` ya lo había cambiado a 8. La prueba ahora
lee `cinepostaScore` del JSON de origen. Los cuatro fallos correspondían a
esa única expectativa en los cuatro proyectos y pasaron al repetirla tras
el ajuste. No se modificaron películas ni scores.

La evidencia local se guarda en `test-results/bios-review/`;
Playwright usa su propia salida en `test-results/bios-e2e/` para conservar
las capturas y los registros de la revisión. La repetición focalizada usa
`test-results/bios-e2e-score/` y `e2e-score-fix.log`.

Preview local: `http://127.0.0.1:43211/personas/diego-cremonesi/`.
La tarea se mantiene en la rama de revisión, sin publicar en `main`.
