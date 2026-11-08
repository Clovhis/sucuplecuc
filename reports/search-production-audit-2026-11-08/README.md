# Auditoría de producción del buscador — 8 de noviembre de 2026

Resultado técnico: validaciones críticas aprobadas sobre el artefacto final. La publicación y el SHA remoto se informan en la entrega; este reporte no declara un deploy completado ni pruebas en teléfonos físicos.

## Problemas corregidos

- WebKit 26.4 / Playwright 1.60 aprobaba las aserciones, pero su launcher de Windows no completaba el cierre del proceso. Persistía sin video y con recursos externos bloqueados. Se actualizó la herramienta de desarrollo existente a Playwright 1.65 / WebKit 27.2: cierre normal, configuración habitual y cero errores globales. No se redujeron timeouts ni se contaron workers terminados manualmente como aprobados. El defecto nativo de bajo nivel no se afirma resuelto por código de CinePosta.
- El debugger de Firefox notificaba una excepción **capturada** dentro de un callback nativo de Web Locks como pageerror. El [reproductor mínimo](../../scripts/repro-firefox-web-locks.mjs) lo demuestra sin CinePosta ni Supabase. La prueba de navegación observa los eventos reales error/unhandledrejection, con controles que detectan una excepción y un rechazo sin capturar, incluso tras navegar. No se filtran mensajes ni se cambia autenticación o locks.
- Una segunda matriz encontró un click perdido en el desplegable del pie en WebKit mobile. Los [eventos del artefacto auditado](diagnostic-footer-events.json) y del [snapshot anterior](diagnostic-footer-events-baseline.json) reprodujeron la misma colisión: la galería de personas se inserta durante la carga y pointerdown/pointerup alcanzan elementos distintos. El smoke ahora espera el estado real de catálogo listo antes de desplazarse al pie; conserva el click y todas las aserciones. Pasó 20 repeticiones posteriores. No se cambió el pie ni se afirma eliminado el desplazamiento de la galería durante la carga; es una limitación preexistente.
- La primera matriz final detectó un click perdido en la recuperación de filtros de Firefox. La fila de carga desaparecía 120 ms después de mostrar el botón, desplazándolo. Se oculta sin demora si no quedan pósters pendientes. La [prueba previa](diagnostic-empty-loading-overlap.json) falla sobre el artefacto anterior; los dos casos de recuperación pasan 20 veces en total y la matriz final vuelve a pasar, sin reintentos ni clicks forzados.
- Los límites sucesivos de años y puntajes ahora se intersectan; no amplían condiciones anteriores. Las contradicciones devuelven cero con explicación visible.
- Se acotan también consultas de URL/sesión a 300 caracteres. Se verifica que texto con markup no pueda ejecutarse. Se actualizó qs transitivo dentro de su rango permitido; npm audit actual: cero vulnerabilidades conocidas.
- Se mejora el retorno al campo en Safari/WebKit al editar una búsqueda vacía. La pequeña leyenda **Búsqueda inteligente** respeta el diseño, el espacio de escritura y el nombre accesible. No hizo falta mover X.

## Títulos y crecimiento semanal

Se revisaron las 23 coincidencias pendientes: [decisiones y fuentes por título](title-resolutions.json), [candidatos originales](pending-title-candidates.json). Se incorporaron 16 nombres para 14 películas; nueve quedaron sin alias adicional verificado. El total es 137 alias en 129 películas. Se contrastaron año, dirección y reparto; se rechazaron homónimos y metadatos contradictorios. Apple AR y Cines Argentinos aportan nombres locales; los originales y nombres de otros mercados se identifican como tales. No se extrapoló disponibilidad argentina desde otra región.

Las 2.574 fichas canónicas, puntajes, créditos, plataformas y URLs mantienen [paridad](catalog-parity.json). Las altas semanales se incorporan automáticamente al generar el índice desde los JSON de películas; no necesitan alias para aparecer. El enriquecimiento de alias es opcional y validado por slug/año/fuente. El script admite auditorías recientes con --recent-days y no consulta servicios durante el build.

## Pruebas finales

- 13 pruebas unitarias, cero fallas.
- 107/107 consultas del catálogo: antes 68/107, después 107/107; [antes](queries-before.json) y [después](queries-after.json). Títulos exigen primer resultado; facetas comparan conjuntos completos con predicados independientes de la interpretación. No equivale a precisión universal.
- Astro/TypeScript: 363 archivos, cero errores, warnings e hints. Build completo: 8.635 páginas. Salida pública y sitemap: aprobados, 6.052 páginas canónicas. Validación de contenido y pruebas de automatización: aprobadas.
- Matriz final: **385 aprobadas, 35 omisiones explícitas por dispositivo, cero fallas, cero flaky y cero errores globales**, con retries=0. [Resultado completo](e2e-final.json) y [validación resumida](validation.json).

| Proyecto | Aprobadas | Omitidas | Fallas |
| --- | ---: | ---: | ---: |
| desktop-chromium | 76 | 8 | 0 |
| desktop-firefox | 75 | 9 | 0 |
| desktop-webkit | 75 | 9 | 0 |
| mobile-chromium | 80 | 4 | 0 |
| mobile-webkit | 79 | 5 | 0 |

La cobertura incluye filtros y combinaciones, paginación, historial, retorno desde fichas, URLs compartidas, índice nuevo/legacy, reintento de carga, 36 cards como máximo, catálogo estático sin JavaScript, SEO, navegación, posters, plataformas y seguridad del texto de consulta. Las capturas mobile cubren 320, 390 y 430 px en Chromium y WebKit; se revisaron también las capturas del detalle visual a 320/1280 px. Las omisiones se conservan con su motivo en validation.json; no son fallas convertidas en skip.

## Rendimiento antes/después

| Métrica | Antes | Después | Reducción |
| --- | ---: | ---: | ---: |
| JSON sin comprimir | 3.503.381 B | 2.390.869 B | 31,76% |
| JSON gzip | 764.201 B | 664.059 B | 13,1% |
| JSON Brotli | 532.224 B | 481.372 B | 9,55% |
| JavaScript recibido hasta buscador listo (Chromium) | 62.960 B | 68.566 B | -8,9% |
| Heap Node, datos + motor (2.574 películas) | 29.056.632 B | 16.198.704 B | 44,25% |
| Construcción Node (2.574) | 242,25 ms | 196,15 ms | 19,03% |
| Consulta Node, mediana (2.574) | 0,47 ms | 0,31 ms | 33,58% |
| Buscador listo, chromium mobile emulado | 432,7 ms | 357 ms | 17,49% |
| Heap Chromium post-GC | 18.489.996 B | 12.105.732 B | 34,53% |
| Buscador listo, webkit mobile emulado | 547 ms | 511 ms | 6,58% |
| Heap Node (10.000 documentos sintéticos) | 53.006.872 B | 25.211.592 B | 52,44% |
| Consulta Node (10.000 documentos sintéticos) | 1 ms | 1,09 ms | -9,34% |

La copia de JSON retenida en el DOM pasa de 3.483.884 caracteres a cero. [Comparación calculada](comparison.json), muestras [Node antes](engine-before.json)/[después](engine-after.json) y [navegador antes](browser-before.json)/[después](browser-after.json).

El JavaScript recibido hasta habilitar el buscador aumenta 5.606 B sin comprimir (62.960 → 68.566 B); se incluye ese costo junto a la reducción del JSON. Es el conjunto de scripts completados al punto de medición, no todo recurso eventual de la home.

Método: tres procesos/contextos nuevos por lado, mismo Node y navegadores; heap V8/CDP post-GC, no RAM total. WebKit no ofrece una medición de heap equivalente. HTTP local con imágenes y recursos externos bloqueados en ambos lados; no es LCP ni una red móvil. El snapshot histórico puede diferir en ediciones congeladas ajenas al buscador por actualizaciones del bot. Los 10.000 registros repiten documentos reales con IDs únicos, sin vocabulario adicional. La consulta sintética de 10.000 tiene un costo mediano algo mayor: se informa, no se oculta.

## Reproducción

Desde la raíz, con Node y dependencias del lockfile:

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run test:movie-search
npm run audit:search-titles -- --check
npm run check
npm run build
npm run test:search-acceptance
npm run validate:public-output
npm run validate:sitemap-indexability
npm run test:home-automation
npm audit
node scripts/repro-firefox-web-locks.mjs
npx playwright test tests/e2e/intelligent-search.spec.ts tests/e2e/search-performance.spec.ts tests/e2e/filter-combos.spec.ts tests/e2e/home-index-loading.spec.ts tests/e2e/mobile-ux.spec.ts tests/e2e/smoke.spec.ts tests/e2e/site-navigation.spec.ts tests/e2e/seo-catalog.spec.ts tests/e2e/platform-badge.spec.ts tests/e2e/poster-fallback.spec.ts tests/e2e/runtime-errors.spec.ts --workers=2 --retries=0
```

Los scripts de perfil aceptan rutas explícitas. La captura histórica .astro/search-baseline es local e ignorada por Git; se requiere conservarla para repetir ese antes exacto. Los hashes y muestras están versionados. Con el servidor estático local en 43218:

```powershell
node --expose-gc --experimental-strip-types scripts/profile-search-engine.mjs --engine .astro/search-baseline/src/lib/movie-search.ts --index .astro/search-baseline/search-index.json --output reports/search-production-audit-2026-11-08/engine-before.json
node --expose-gc --experimental-strip-types scripts/profile-search-engine.mjs --output reports/search-production-audit-2026-11-08/engine-after.json
node scripts/profile-search-browser.mjs --url http://127.0.0.1:43218 --snapshot .astro/search-baseline --output reports/search-production-audit-2026-11-08/browser-before.json
node scripts/profile-search-browser.mjs --url http://127.0.0.1:43218 --snapshot .astro/search-final --output reports/search-production-audit-2026-11-08/browser-after.json
node scripts/compare-search-reports.mjs reports/search-production-audit-2026-11-08
```

## Límites

No hubo pruebas en dispositivos físicos ni en Safari instalado en un Mac: WebKit de Playwright en Windows usa perfiles desktop/iPhone; Chromium usa Pixel 5. La gramática no comprende tramas ni intenciones subjetivas. El relevamiento de alias no cubre todo el catálogo; las plataformas reflejan la ficha argentina, sin consulta en vivo. Se conserva el índice completo en memoria: las mejoras reducen su costo, no eliminan su crecimiento. No se agrega IA, servicio pago, backend ni infraestructura.

La galería de personas se completa de forma asíncrona y puede desplazar contenido antes de terminar la carga inicial. El evento también se reprodujo en la versión anterior. Se conserva ese comportamiento de la home, sin presentarlo como una regresión ni una corrección del buscador.

Se conservan diagnósticos y ejecuciones históricas fallidas, claramente separados de la matriz final. Su presencia no se presenta como una validación aprobada.
