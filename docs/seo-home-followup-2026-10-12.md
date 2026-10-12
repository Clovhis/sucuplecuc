# SEO: carga de portada y seguimiento de GSC — 12/10/2026

Continuación de la [auditoría y línea de base](seo-audit-2026-10-11.md). El catálogo HTML, los snippets y la medición ya se publicaron en `6f81724ea13ca8652cfc61a98639b9d0b2831dac`. GitHub Pages completó el run `38190710114`. Google descargó el sitemap actualizado el 12/10 a las 01:17:03 UTC, sin errores ni advertencias. Sus 5.522 URLs son canónicas e indexables; el contador agregado de indexación de la API no sustituye la inspección individual.

El usuario comprobó en la interfaz de GSC que **Acciones manuales** y **Problemas de seguridad** no muestran problemas. No se trata de una comprobación realizada por la API: esos informes no están disponibles en ella.

## Cambio comprobado

La portada enviaba el índice completo de 2.343 películas dentro del HTML. Se separó en un endpoint JSON estático generado con el mismo catálogo y una versión por contenido. La portada conserva sus películas iniciales y el enlace al catálogo HTML, mientras carga el índice. El buscador y los filtros se habilitan juntos cuando los datos están listos, restauran los parámetros de la URL y permiten reintentar si falla la descarga. Se mantiene el límite de tarjetas por página.

El script de recuperación de posters se ejecuta con `defer`. Su comprobación de imágenes que ya fallaron preserva la recuperación de errores anteriores al arranque del script; también se probaron imágenes agregadas después.

| Medición del HTML de portada | Antes, producción | Después, build |
| --- | ---: | ---: |
| Bytes sin compresión | 3.614.981 | 717.888 |
| Estimación gzip local | 774.064 | 132.401 |

El HTML se redujo **80,1%**; la estimación gzip local bajó 82,9%. El índice separado contiene los mismos 2.343 registros y ocupa 2.897.177 bytes sin compresión. La búsqueda sigue descargando esos datos: la mejora consiste en reducir el documento inicial y separar la descarga, no en eliminar el costo total del catálogo en una visita sin caché. Los bytes transferidos dependen de la compresión y caché del servidor.

Lighthouse 13.5.0 previo, móvil con throttling DevTools: rendimiento 54, SEO 100, FCP 4,55 s, LCP 6,55 s, TBT 112 ms, CLS 0,205. Es una medición de laboratorio en este equipo, no una evaluación de Core Web Vitals de usuarios reales ni una garantía de posiciones. El ensayo con simulación predeterminada emitió advertencias de Lantern; no se usa como comparación principal. Los informes JSON se conservan en `playwright-report/seo-followup/`.

## Validación

- `npm run check`: 284 archivos, sin errores, advertencias ni hints.
- `npm run build`: 7.866 páginas generadas; endpoint JSON publicado fuera del sitemap.
- `validate:sitemap-indexability` y `validate:public-output`: aprobados; 5.522 URLs canónicas.
- `npm run validate:content -- --skip-build`: aprobado. No hubo cambios en películas, plataformas, puntajes, reseñas ni biografías.
- Playwright en Chromium desktop, Chromium móvil y WebKit móvil: **202 aprobadas, 8 omisiones previstas, ninguna fallida**. Cubre descarga lenta, fallo y reintento, integridad del índice contra el sitemap, búsquedas de 5.000/10.000 registros, paginación, filtros combinados, personas, posters, trailers, catálogo SEO y navegación general. El runner cerró con código 0; se finalizaron dos workers propios retenidos durante el cierre, una vez concluidos todos los casos.
- Antes de cerrar la publicación: comprobar SHA de Pages, endpoint público, comportamiento del buscador y pruebas pertinentes en producción. Evidencia local en `playwright-report/seo-followup/`.

## Acciones manuales en GSC

1. En la propiedad `https://www.cineposta.com.ar/`, inspeccionar `https://www.cineposta.com.ar/catalogo/` y `https://www.cineposta.com.ar/editorial/`. Usar **Probar URL publicada** y luego **Solicitar indexación**. La API de Search Console no ofrece esa solicitud individual. [Ayuda oficial](https://support.google.com/webmasters/answer/10351509?hl=es).
2. Exportar los ejemplos de **Rastreada: actualmente sin indexar** y **Excluida por una etiqueta noindex** si se necesita ampliar el diagnóstico de cobertura. La muestra de 115 URLs ya comprobada no representa todas las exclusiones de las capturas. No iniciar validaciones masivas de redirecciones o canonicals alternativos que funcionan correctamente.
3. Revisar el informe móvil de **Métricas web principales** para obtener el estado de campo. La API de PageSpeed respondió 429; el laboratorio local no sustituye ese informe.

El sitemap ya está enviado y descargado correctamente. No requiere otro envío manual por este cambio de carga. Las solicitudes de indexación tampoco garantizan que Google incorpore una URL. El seguimiento de rastreo corresponde al 18/10 y 25/10; la comparación de 28 días posteriores a la publicación usa 12/10–08/11, una vez que haya datos finales, aproximadamente desde el 11/11.
