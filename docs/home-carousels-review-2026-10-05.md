# Carruseles de la home

Rama: `redesign/home-carousels`, creada desde `06b96848`. Se revisaron los commits `06b96848`, `74c14331` y `77212a7b`, los componentes de los tres carruseles, sus scripts, selección de datos, estilos responsive y pruebas existentes antes de editar.

## Criterio y cambios

Se mantiene la paleta, tipografía Archivo y separación editorial de la nueva home. Cartelera y Streaming presentan afiches completos, títulos con hasta dos líneas, scores sin marcos ni resplandores y controles discretos. El acceso al trailer tiene una etiqueta visible y los títulos ahora enlazan directamente a la ficha.

La selección semanal usa una columna introductoria junto a una tira numerada de afiches; en mobile la introducción pasa arriba. Año y tipo de selección permanecen visibles debajo del afiche. Se retiran del componente los personajes y las capas decorativas. Los assets originales se conservan.

Consulta de las páginas públicas de [Letterboxd](https://letterboxd.com/films/) y [Rotten Tomatoes](https://www.rottentomatoes.com/browse/movies_in_theaters) como referencias de organización por afiches y selección de películas. IMDb no respondió a la consulta. La referencia principal son los tres commits aprobados del sitio.

No se usaron skills de diseño web. `web-design-mastery` y `web-design-guidelines` se retiraron de las carpetas activas globales `.agents/skills` y `.codex/skills`; sus originales y junctions quedaron respaldados fuera del descubrimiento de skills, en `.codex/disabled-skills/2026-10-05-carousel-redesign`. No había copias ni referencias activas de esas skills en el repositorio o su plugin. No se modificaron otras skills.

## Comportamiento conservado

La selección y orden de películas, fechas, plataformas, scores y enlaces se siguen derivando de las fuentes existentes. No se editaron datos del catálogo, manifiestos de recomendaciones, dependencias ni SEO. Cartelera y Streaming crean el iframe al abrir el dialog; al cerrarlo se elimina. Las recomendaciones enlazan a las fichas y siguen sin trailers.

Los scripts calculan el salto con el ancho y separación reales, respetan la preferencia de movimiento reducido y actualizan las flechas en los extremos y al redimensionar. Los carruseles admiten foco y navegación de teclado, scroll horizontal y desplazamiento vertical táctil. Los estilos nuevos de estrenos están limitados a `.home-release-rail`.

## Validación

- `npm run check`: 251 archivos; cero errores, warnings o hints.
- `npm run build`: 7.540 páginas generadas correctamente.
- `npm run validate:public-output`: aprobado.
- Playwright: 194 pruebas aprobadas, 16 omisiones esperadas por tipo de dispositivo, cero fallos. Proyectos: `desktop-chromium`, `mobile-chromium` y `mobile-webkit`. Suites: carruseles de estrenos, recomendaciones, regresiones nuevas de carruseles, smoke, mobile UX, rendimiento de búsqueda y combinaciones de filtros.
- Revisión visual final del build: desktop Chromium (1.440 px) y mobile WebKit / iPhone 13 (390 px), sin errores de JavaScript ni desborde del documento. El servidor E2E existente adapta `upgrade-insecure-requests` para HTTP local; la política de producción se conserva.
- En esa revisión: 43 películas en Cartelera, 12 en Streaming, 6 recomendaciones; scores completos y controles de 44 px.
- Capturas locales de los tres carruseles: `test-results/carousel-review/desktop-*.png` e `iphone-*.png`.

Durante la validación inicial se detectó un desborde causado por las etiquetas absolutas de accesibilidad de las plataformas. Al retirar el overflow del panel, esas etiquetas podían ampliar el documento fuera del carrusel. Se agregó `position: relative` al viewport de ambos componentes para contenerlas correctamente, conservando su lectura accesible. La comprobación en navegador corrigió el ancho del documento de 2.325 a 1.440 px, y pasaron las pruebas afectadas de filtros en desktop y de navegación de los tres carruseles. Se agregó una regresión que cubre 768, 1.024, 1.280 y 1.440 px.

La repetición de navegación en WebKit encontró otra diferencia: el ancho intrínseco de los afiches podía ampliar la lista con `max-content` cuando las tarjetas tenían sólo `flex-basis`. Se fijó el ancho de cada tarjeta, con `flex: 0 0 auto`, en ambos componentes. La comprobación en iPhone WebKit estabilizó las tiras y permitió llegar al final de Cartelera, Streaming y recomendaciones, con la flecha siguiente desactivada. Las tarjetas de estrenos miden entre 152 y 176 px en desktop y 152 px en mobile; las semanales, 176 y 152 px respectivamente.

La prueba de recorrido también espera el frame de scroll antes de volver a consultar las flechas y asegura que la primera y última tarjeta estén dentro de la pantalla. Esto evita pulsar un botón que acababa de desactivarse o confundir el scroll horizontal con la posición vertical del documento.

La suite final usa dos workers, sin grabación de video y con 60 segundos por prueba; mantiene las aserciones existentes y las capturas de fallos. La configuración temporal vive fuera del repositorio y no modifica la configuración de CI.

`git diff --check` también pasó. El DEV responde HTTP 200 con los componentes nuevos en `http://127.0.0.1:4321/`.

Después de esta validación, el usuario autorizó integrar la rama en `main`, publicar y dejar el checkout limpio. La publicación debe comprobar el SHA del deploy y el funcionamiento de los carruseles en el sitio público.
