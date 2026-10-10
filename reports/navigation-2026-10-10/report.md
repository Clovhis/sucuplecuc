# Navegación superior de CinePosta — 10 de octubre de 2026

## Cambio

Se reemplazó la invitación superior de Cafecito por una navegación compartida en `BaseLayout.astro`. Se eliminó el componente que dibujaba esa franja. El enlace de apoyo del pie permanece disponible.

La barra usa el fondo de la home, líneas finas, Archivo, íconos SVG de trazo uniforme y el acento durazno existente. No incorpora dependencias, imágenes ni fuentes adicionales. El acceso **Noticias y notas** lleva al archivo editorial existente, que incluye las noticias publicadas hoy.

Durante la revisión se distinguieron los íconos: En cines usa una entrada de cine; Streaming conserva la pantalla con reproducción.

Accesos principales: Películas, Noticias y notas, En cines, Streaming, Recomendadas, Personas y Qué ver. **Más** reúne Próximos estrenos, Radar de cine, Juego de cine y Comunidad. En pantallas de hasta 1000px, Películas y Noticias y notas quedan visibles y **Secciones** despliega el resto en dos columnas.

Los fragmentos de la home conservan la consulta y los filtros actuales. Desde las páginas interiores apuntan a la sección de la home. Los menús permiten teclado, Escape y cierre al seleccionar un destino o pulsar fuera. La navegación marca la página o sección actual y mantiene visible el enlace para saltar al contenido al recibir foco.

Se corrigió el problema observado durante la revisión: el encabezado tenía una capa superior a la del menú. El desplegable ahora tiene fondo sólido y se dibuja por encima del encabezado; una prueba comprueba con `elementFromPoint` que los controles inferiores no quedan al frente.

## Referencias consultadas

- [Sight and Sound, BFI](https://www.bfi.org.uk/sight-and-sound): inspección visual de la navegación, jerarquía tipográfica y subrayado discreto. La paleta y los íconos se adaptaron al sitio existente.
- [Current, Criterion](https://www.criterion.com/current/posts): organización de la navegación editorial y sus categorías. La visita visual recibió el control de Cloudflare; se consultó su contenido público mediante búsqueda web.
- [Notebook, MUBI](https://mubi.com/en/notebook): referencia de publicación de cine; la visita automatizada no produjo una captura visual útil.

## Validación

- Revisión visual y medición en Chromium DEV: 320, 390, 768, 1000, 1024 y 1440 px; sin desborde y con todos los enlaces visibles de al menos 44 px de alto.
- `npm run check`: 0 errores, 0 advertencias y 0 sugerencias.
- `npm run build`: 7.816 páginas, sin errores, con los íconos finales. Los seis destinos por fragmento están presentes en la home generada.
- Playwright: 108 casos previstos en `site-navigation`, `smoke`, `site-chrome` y `mobile-ux`, en desktop/mobile Chromium y WebKit. Resultado final por caso: **91 aprobados y 17 omitidos por las condiciones de navegador/dispositivo ya previstas en la suite**.
- La primera pasada aprobó 85 casos y detectó cuatro expectativas antiguas del título del catálogo y dos expectativas de teclado que no respetaban la configuración de Tab de WebKit. Se actualizó el título esperado a «Catálogo de películas», se comprobó Escape desde un enlace enfocado en WebKit y se esperó la sincronización de `matchMedia` al cambiar de ancho. Las repeticiones dirigidas aprobaron los seis casos pendientes; no fue necesario cambiar el código de la aplicación.
- La navegación mantiene búsquedas y filtros, todos los enlaces permanecen accesibles entre 320 y 1440 px, Enter/Escape abren y cierran los desplegables con foco correcto, y `elementFromPoint` confirma que la superficie opaca del menú tapa el encabezado inferior.
- Capturas del resultado generado: [escritorio](desktop-menu.png), [móvil WebKit](mobile-menu.png). [Detalle de los íconos en DEV](icons-preview.png).
- `git diff --check`: aprobado.
- Para el build local se limita a 15 segundos cada petición externa con un preloader de Node: las consultas del Radar no tienen un plazo propio y bloquearon la primera ejecución. El preloader sólo se aplica al proceso de validación; no modifica el recolector, las páginas ni GitHub Actions.

Los logs de build/check, las tres pasadas de Playwright y el preloader quedan como evidencia local en `test-results/navigation-review/` (ignorado por Git).

## Estado

El usuario aprobó el diseño y autorizó su publicación en `main`, condicionada a la validación de escritorio y móvil, y la limpieza del entorno local.

Verificación previa a publicación: `npm run check` volvió a aprobar sin errores, advertencias ni sugerencias. La suite final `site-navigation.spec.ts` aprobó sus **20 casos** en desktop/mobile Chromium y WebKit, sin fallos ni omisiones. La rama de revisión es `design/navegacion-superior-2026-10-10`.

La prueba del SHA publicado, del workflow de Pages, de los assets desplegados y del estado limpio final se conserva en `test-results/navigation-review/release-proof.json` como evidencia local, después de completar la publicación.
