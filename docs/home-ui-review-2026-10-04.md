# Revisión del catálogo del home

Rama de trabajo: `feature/home-revista-cine`. Diseño revisado en DEV y aprobado
para publicar en `main` el 5 de octubre de 2026.

## Evaluación

Se revisaron las plantillas y los componentes del home, fichas de películas,
editoriales, personas, selector de recomendaciones, comunidad y páginas
institucionales. La inspección visual inicial incluyó el home, el índice
editorial y una ficha de película. La validación posterior cubre las plantillas
representativas con la suite de navegación y la auditoría mobile del sitio.

El bloque del catálogo acumulaba paneles dentro de paneles, degradados,
decoraciones de película y botones ilustrados. La sección editorial ya usaba
separadores y fotografías con una jerarquía más clara. Los afiches y el logo
del anteojo 3D aportan identidad suficiente para simplificar los controles.

Referencias consultadas el 4 de octubre de 2026:

- [Letterboxd home](https://letterboxd.com/): protagonismo de imágenes y jerarquía editorial.
- [Letterboxd films](https://letterboxd.com/films/): encabezados breves y controles discretos en el catálogo.
- [Criterion Channel](https://www.criterionchannel.com/): navegación y organización por colecciones de cine.

## Implementación

- Cabecera sin recuadros decorativos; se conserva el logo original del anteojo 3D.
- Título «Películas» en Archivo, 25,6 px en desktop y 21,6 px en mobile;
  sin «Catálogo argentino» ni bajada redundante. Contador en segundo plano.
- Accesos rápidos sin ilustraciones y presets de score con etiquetas completas.
- Fondo uniforme, separadores finos y tarjetas sin panel exterior ni elevación.
- Afiches, scores, géneros, clasificación, plataformas y stickers siguen visibles.
- Márgenes laterales de 16 px y controles de al menos 44 px; en mobile, 48 px.
- Los estados seleccionados incluyen borde y subrayado; el foco de teclado tiene contorno visible.
- Estilos limitados al home; las fichas y tarjetas compartidas mantienen sus estilos.

No se modifica el catálogo, la búsqueda, los filtros, los parámetros de URL,
los datos SEO ni la paginación. Las tarjetas iniciales y las creadas al filtrar
reciben la misma presentación. No se agregan dependencias ni fuentes remotas.

## Validación

- `npm run check`: 248 archivos, sin errores, warnings ni hints.
- `npm run build`: 7.540 páginas generadas correctamente con el último ajuste.
- Playwright: se ejecutaron las cinco suites de filtros, UX mobile, búsqueda,
  navegación y auditoría del sitio en Chromium, Firefox y WebKit desktop,
  Chromium mobile y WebKit con emulación de iPhone.
- Las cinco ejecuciones finales terminaron con salida 0: 49 aprobados y
  8 omisiones en cada navegador desktop; 53 aprobados y 4 omisiones en cada
  navegador mobile. Total: **253 aprobados y 32 omisiones por dispositivo**.
- Firefox usa una tolerancia de 0,01 px para medir separaciones fraccionarias.
  El helper de filtros espera la carga completa tras recargar antes de tocar
  el desplegable; el caso de URL compartida pasó tres repeticiones en WebKit.
- La ejecución final de WebKit mobile usa una configuración temporal sin
  video para evitar una espera al cerrar la grabación. Conserva las mismas
  pruebas, capturas ante fallos y métricas; no cambia la configuración del repo.
- Auditoría mobile: 21 escenarios por navegador, 42 en total, sin desborde
  horizontal, errores de consola ni respuestas HTTP fallidas. Incluye 320 px,
  390 px y orientación horizontal, sobre 14 rutas representativas.
- Inspección manual en DEV: logo original, títulos y etiquetas legibles,
  selección de score, retorno al inicio y foco visible de teclado.

La emulación de iPhone con WebKit permite probar layout e interacción;
la revisión en un dispositivo iOS físico queda fuera de esta validación local.
