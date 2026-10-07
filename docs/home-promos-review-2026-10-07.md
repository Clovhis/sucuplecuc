# Home: simulador, comunidad y agenda

Branch: `redesign/home-promos-agenda-2026-10-07`.
Base: `89416bfe`.

Esta nota registra el diseño inicial de la branch. La revisión posterior de
la imagen del simulador usa una nueva escena de rodaje y está documentada en
[home-career-image-2026-10-07.md](home-career-image-2026-10-07.md).

## Criterio visual

Se revisaron los últimos cinco commits: `89416bfe`, `7703908b`,
`2d064b90`, `de29b1af` y `81fc6f33`. Los cambios visuales de trailers
y fichas continúan el sistema del home: fondo oscuro sobrio, líneas finas,
texto claro, acento durazno, tipografía sans y controles con radios discretos.
Los otros tres commits registran publicaciones sociales o ajustes de scores.

## Cambios

- Se retiró el bloque de Sugerencias rápidas, sus datos serializados, el
  módulo de selección aleatoria, su generador y sus reglas de presentación.
  Las sugerencias del buscador conservan su funcionamiento.
- Simulador y comunidad pasan a filas con texto y enlace a la izquierda e
  ilustración a la derecha. La agenda usa títulos, fechas y separadores del
  mismo sistema visual, con dos columnas en escritorio y una en móvil.
- Ambas ilustraciones originales se conservan. Se revisaron visualmente:
  simulador de 1536 × 1024 y comunidad de 1900 × 828 con transparencia.
  Ahora se muestran completas, con hasta 450 px de ancho, altura proporcional,
  sin máscaras ni desplazamientos negativos. En móvil van debajo del texto
  y de los enlaces, ocupando el ancho disponible.
- La proporción también se define en el contenedor para reservar la altura
  correcta. La prueba de cambio de ancho encontró que Safari podía conservar
  la altura de la imagen anterior y desbordar la fila; definir `aspect-ratio`
  en cada contenedor resuelve ese comportamiento sin recortar las imágenes.
- El enlace al foro está dentro de la columna de texto. La imagen tiene su
  propia columna y no se superpone a la acción ni a la descripción variable.
- No se modificaron películas, scores, fechas de agenda, disponibilidad,
  generación de estrenos ni automatizaciones.

## Validación

- `npm run check`: 0 errores, 0 warnings, 0 hints.
- `npm run build`: 7.540 páginas; build final completo.
- `npm run validate:public-output`: aprobado.
- Playwright sobre el build final: **69 aprobadas y 9 omisiones esperadas**,
  sin fallos, en escritorio Chromium, móvil Chromium y móvil WebKit.
  Suites: `home-promos`, `mobile-ux`, `smoke`, `upcoming-releases-2027`
  y `upcoming-trailers`. Las omisiones corresponden a pruebas destinadas
  exclusivamente a escritorio o móvil.
- Se verificaron carga y proporción de imágenes, ausencia de superposiciones,
  enlaces a juego y foro, ausencia de Sugerencias rápidas, búsqueda/filtros,
  agenda, navegación general y trailers. La prueba de imágenes cambia el
  ancho sin recargar entre 320, 390 y 844 px en móvil; cubre 768 y 1280 px
  en escritorio.
- Capturas locales: `test-results/home-promos-review/desktop-game.png`,
  `desktop-community.png`, `desktop-agenda.png` y las tres variantes `mobile-`.
  Se captura el viewport con `scale: 'css'`, sin redimensionar un elemento
  móvil más alto que la pantalla. Los logs y scripts de captura permanecen
  en esa carpeta local, excluida del versionado.

Comando de regresión:

```powershell
$env:PLAYWRIGHT_REUSE_SERVER='1'
npx playwright test tests/e2e/home-promos.spec.ts tests/e2e/upcoming-releases-2027.spec.ts tests/e2e/mobile-ux.spec.ts tests/e2e/upcoming-trailers.spec.ts tests/e2e/smoke.spec.ts --project=desktop-chromium --project=mobile-chromium --project=mobile-webkit --workers=2
```

Safari en el servidor DEV HTTP intentaba cargar recursos con HTTPS por la
directiva CSP `upgrade-insecure-requests`. Se identificó en las solicitudes
fallidas; la verificación final usa `scripts/preview-e2e.mjs`, que ya elimina
esa directiva solamente en la respuesta local de prueba. La política del
artefacto de producción conserva su configuración.

Los cambios quedan en la branch para revisión local.
