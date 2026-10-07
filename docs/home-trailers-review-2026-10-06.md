# Próximos estrenos: integración con la edición revista

Rama local: `redesign/upcoming-trailers-magazine`, desde `2d064b90`.

## Inspección previa

Se revisaron los tres commits más recientes: `2d064b90` (criterio de obras maestras y scores), `de29b1af` (registro de publicación de Buffer) y `81fc6f33` (fichas de películas). Para reconocer el sistema visual de la home también se consultaron `c7d796d3` (carruseles), `06b96848` (Radar), `74c14331` (descubrimiento) y `77212a7b` (catálogo), junto con sus estilos actuales.

`scripts/update-upcoming-releases.mjs` obtiene títulos, fechas argentinas, imágenes y trailers y escribe `src/data/upcomingReleases.generated.ts`. El workflow diario `refresh-upcoming-releases.yml` valida y versiona ese archivo; `deploy.yml` reconstruye el sitio después de una actualización exitosa. `getUpcomingMovieReleases()` filtra fechas futuras, prioriza los datos generados, agrega candidatos del catálogo sin duplicar y aplica el límite solicitado de cinco.

`src/pages/index.astro` prepara las URLs con `autoplay=1`, `mute=1`, `playsinline=1`, `rel=0` y `modestbranding=1`. Renderiza un único iframe y el JSON de la agenda. `src/scripts/upcoming-suggestions.ts` usa cuatro entradas en pantallas táctiles compactas y cinco en escritorio. «Otro estreno» cambia el iframe, título, fecha, sinopsis, estado activo y contador, y vuelve al principio al completar el recorrido. No existe un avance automático al terminar el video: el autoplay inicia el trailer seleccionado. Antes de esta intervención la lista era informativa.

Se revisaron las reglas del bloque en `global.css` y `mobile.css`, incluyendo la altura forzada de escritorio, la presentación táctil y la quinta entrada oculta. Los estilos nuevos están limitados a `.home-trailers`.

## Referencias visuales

Consultadas para esta tarea:

- [BFI](https://www.bfi.org.uk/): se inspeccionó en navegador la integración del trailer del festival con su título, descripción y enlace. La imagen y el video reciben el protagonismo; el texto tiene una jerarquía clara.
- [Rotten Tomatoes, Other Mommy](https://www.rottentomatoes.com/m/other_mommy): sección Videos, con miniaturas y títulos debajo. El navegador mostró también un aviso publicitario superpuesto; la estructura de videos se corroboró con el contenido de la página.
- Empire e IMDb no estuvieron disponibles para una inspección completa; no se usaron como evidencia visual.

## Resultado

Cabecera de sección con separador fino y contexto argentino. Video en 16:9, sin altura forzada por la agenda. Nombre, fecha y sinopsis debajo del reproductor. Agenda lateral con miniaturas existentes, títulos completos que pueden ocupar varias líneas, fechas legibles y filas separadas por líneas. En pantallas angostas, la agenda se ubica debajo del video y su texto. Se reutilizan Archivo, fondo uniforme, blanco cálido, grises y acento durazno de la home.

Cada fila tiene un botón nativo que selecciona ese trailer usando la misma función de actualización. Elegir la fila activa conserva la reproducción. «Otro estreno» continúa desde la última selección y conserva el recorrido circular. El iframe, sus permisos, URLs, autoplay silenciado y controles de YouTube permanecen en el circuito existente. Los anuncios accesibles de título, fecha y sinopsis se limitan al pie del video.

El cambio no requiere regenerar datos ni modificar los workflows. El catálogo, fechas, scores, reseñas y configuración de Astro conservan sus fuentes actuales.

## Validación

El primer `npm run check` detectó un import roto en el archivo temporal preexistente `test-results/movie-detail-review/temp/movie-detail.config.ts`. Un chequeo con configuración temporal excluyendo artefactos verificó 253 archivos sin errores. Después de regenerar los artefactos de pruebas, la pasada final del comando estándar `npm run check` verificó 255 archivos: cero errores, warnings o hints. No se modificó el tsconfig del repositorio.

- `npm run build`: 7.540 páginas, completado en 4 minutos y 57 segundos.
- `npm run validate:public-output`: aprobado.
- Nueva suite `upcoming-trailers.spec.ts`: ocho pruebas aprobadas en desktop Chromium/WebKit y mobile Chromium/WebKit. Verifica selección, Enter, datos sincronizados, vuelta al inicio, un solo iframe y parámetros de autoplay; además, proporción 16:9, pie debajo del video, contención entre 320 y 1.440 px y controles de al menos 44 px.
- Revisión con YouTube real en los cuatro escenarios: el tiempo del video avanzó, con `paused=false` y `muted=true`. Las miniaturas visibles cargaron; la quinta miniatura permanece oculta y sin descargar en móvil. Cero desbordes y cero errores de JavaScript propios del sitio. WebKit reportó errores de acceso de telemetría de YouTube al cambiar el video, sin interrumpir la reproducción comprobada.
- Capturas de escritorio y móvil: `test-results/trailers-review/`. Evidencia de reproducción: `visual-proof.json` dentro de esa carpeta. Las capturas móviles respetan el espacio ocupado por la navegación fija y usan `scale: 'css'`.
- `git diff --check`: aprobado.

La matriz amplia de regresiones terminó con 133 aprobadas, 14 omisiones por dispositivo, cuatro fallos de la expectativa antigua de Ant-Man y una intermitencia de búsqueda en WebKit móvil. También registró dos errores al cerrar un worker, sin cambios de producto asociados. El commit previo `2d064b90` había bajado Ant-Man a 8, pero la prueba aún lo usaba como ejemplo de 9; se cambió exclusivamente ese ejemplo por Alien (9), preservando los cinco niveles de valoración verificados. La prueba corregida pasó en los cuatro navegadores. La suite completa de búsqueda en WebKit móvil pasó después de forma aislada: seis pruebas, incluyendo 5.000 y 10.000 registros. No se cambió el buscador.

El caso de búsqueda intermitente pasó otras tres veces consecutivas con un solo worker, sin cambiar el código ni sus expectativas.

La pasada de regresiones usa una configuración temporal con salida exclusiva en `test-results/trailers-e2e/` y video desactivado; la configuración versionada de Playwright y GitHub Actions se conserva.

Las pruebas de navegación de la agenda simulan la respuesta del iframe para verificar nuestro contrato sin depender del servicio externo. La revisión visual y la comprobación de reproducción usan YouTube real por separado.
