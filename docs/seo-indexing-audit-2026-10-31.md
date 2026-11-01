# Indexación de CinePosta: revisión y correcciones del 31/10/2026

**Corte de los datos: 31/10/2026.** La incorporación al repositorio del 01/11 conserva esta línea de base histórica; no representa una nueva consulta de indexación.

Se contrastó el análisis aportado con las exportaciones actuales de Search Console en Edge, la API de inspección, las respuestas públicas y el código. El resultado no justifica modificar en bloque robots, canonicals ni la indexación de Comunidad. Se corrigió la herramienta local de diagnóstico y se conserva una [línea de base verificable por URL](reports/seo-indexing-2026-10-31.json).

## Versión y alcance

Producción corresponde a `91547d4224cdcc189728d2d6b17be53f265deb47`: [Pages completó correctamente el despliegue](https://github.com/Clovhis/sucuplecuc/actions/runs/41205162168) el 31/10 a las 10:31 AR. El sitemap público tiene 5.743 URLs; la API conserva 5.698 de su lectura del 30/10, sin errores ni advertencias. Son inventarios de momentos diferentes.

La interfaz de Páginas sigue actualizada al 22/10: 3.813 indexadas y 2.977 excluidas. Se exportaron 1.000 ejemplos de «Descubierta», las 696 URLs de «noindex», las 213 de «Rastreada» y los 476 registros de la validación de redirecciones, incluidos sus 39 errores. La exportación de «Descubierta» tiene un límite de 1.000; no se conocen los otros 444 ejemplos por esa exportación.

`Last-Modified` identifica la actualización del artefacto servido; no demuestra por sí solo cuándo cambió el contenido de cada URL ni explica su exclusión. Para hablar de estados históricos se comparan también el último rastreo de Google, su canonical y el HTML público.

## Correcciones al diagnóstico inicial

### Las 1.444 descubiertas no son 1.444 páginas de catálogo

La exportación contiene:

| Sección | Ejemplos exportados |
| --- | ---: |
| Comunidad | 699 |
| Películas | 233 |
| Personas | 39 |
| Catálogo | 18 |
| Editoriales | 10 |
| Equipo | 1 |
| Total | 1.000 |

Se comprobaron las **1.000 URLs en producción**: todas responden HTTP 200, sin `noindex` en meta robots o cabecera X-Robots-Tag, y con canonical propio. No hubo errores de descarga finales. Esto descarta esos bloqueos técnicos en los ejemplos revisados, pero no garantiza su indexación ni identifica por sí solo la causa de la decisión de Google.

El catálogo completo tiene **51 páginas**. Sus enlaces HTML cubren las **2.440 fichas** una sola vez, sin omisiones ni duplicados; la navegación funciona sin JavaScript. Cada página tiene canonical propio y enlaces a las otras páginas. La API devuelve 26 indexadas, 23 descubiertas sin indexar y dos desconocidas. No hay evidencia para eliminar la paginación, canonizar todas sus páginas hacia la primera o agregarles noindex. El diseño actual sigue las [recomendaciones de paginación de Google](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).

La inspección dirigida adicional de 67 URLs incluye ejemplos distribuidos de cada sección y las URLs citadas por el análisis original. Sus resultados están en la evidencia; es una selección de diagnóstico con solapamiento respecto de las otras inspecciones, no una estimación estadística.

### Las 696 exclusiones noindex mezclan discusiones y trailers

La exportación completa incluye **344 discusiones y 352 trailers antiguos**. Las 696 responden HTTP 200 y actualmente no presentan noindex. Las 344 discusiones tienen canonical propio; los 352 trailers conservan una redirección HTML inmediata a su ficha.

Se inspeccionaron además 21 discusiones distribuidas en esa exportación. Google sigue mostrando noindex en las 21, pero sus rastreos van del 11/07 al 04/09, anteriores a la eliminación de la etiqueta del 13/09 documentada en la [auditoría previa](seo-coverage-exports-2026-10-12.md). La respuesta pública de hoy permite indexación. La validación iniciada continúa sin reiniciarse.

La intención actual de Comunidad se mantiene: páginas públicas indexables, con canonical propio y presentes en el sitemap. La API de rendimiento, con datos finales del **01/10 al 28/10**, registra 91 clics y 4.744 impresiones en 557 URLs de esa sección. No se elimina en bloque una sección con tráfico comprobado a partir de tres ejemplos históricos. Estas métricas se agregan por página, no equivalen al total de la propiedad ni prueban que todas las discusiones tengan la misma calidad.

### «Error de validación» no significa «redirección rota»

Se comprobaron **las 39 URLs marcadas Error**: 35 trailers y cuatro perfiles con `backTo`. Las URLs y sus destinos responden 200, los destinos tienen canonical propio y están en el sitemap. Las variantes excluidas no están en él. Los trailers mantienen su meta refresh; los perfiles con parámetros consolidan hacia el perfil limpio.

La validación falló porque el motivo de exclusión seguía presente. En alias intencionales eso es lo esperado; no corresponde volverlos indexables como páginas independientes ni reiniciar esa validación para intentar obtener un estado verde. La [guía de indexación de Google](https://support.google.com/webmasters/answer/7440203?hl=es) distingue estas exclusiones válidas de problemas que requieren reparación.

La variante de la home con parámetros de OnesVibe mantiene canonical a `/`. La API confirma que Google también elige `/`, con rastreo del 29/10. No se encontró un conflicto de canonical que corregir.

Los dos antiguos 404, `/trailers/the-fly-1986/` y `/peliculas/the-odyssey-2026/`, conservan sus alias HTML inmediatos hacia La mosca y La odisea. Ambos destinos están indexados según la API. Se preservan esos alias, sin incorporarlos al sitemap.

### Las 213 rastreadas requieren una lectura menos optimista

La exportación completa contiene 78 películas, 76 perfiles, seis discusiones y 53 trailers. Al separar los trailers y 13 variantes con parámetros quedan **147 URLs canónicas**, inspeccionadas todas mediante la API, sin errores finales:

| Estado actual de las canónicas | URLs |
| --- | ---: |
| Enviada e indexada | 15 |
| Rastreada: actualmente sin indexar | 128 |
| Descubierta: actualmente sin indexar | 4 |

Las 128 todavía rastreadas sin indexar son 69 películas, 56 perfiles y tres discusiones. **Sus 128 rastreos son anteriores al 12/10**: van del 11/04 al 23/09. Por lo tanto, aún no incorporan a su último rastreo las mejoras de descubrimiento publicadas en octubre. Eso es evidencia de antigüedad, no una garantía de que se indexarán en la siguiente visita.

Las 213 URLs responden 200 y no presentan noindex. Las 147 canónicas tienen canonical propio; los 53 trailers mantienen redirecciones HTML. Confirmar tres páginas indexadas, como hacía el análisis inicial, no resuelve las restantes: la evidencia deja identificadas las **132 canónicas pendientes** para seguimiento individual.

### Vídeos

Los trailers son contenido complementario de las fichas. El motivo «no está en una página de visualización» no equivale a una ficha excluida del índice web. No se crean miles de páginas nuevas de vídeo ni se transforma el diseño de las fichas para cambiar ese indicador: Google exige que el vídeo sea el contenido principal de una [página de visualización](https://developers.google.com/search/docs/appearance/video). El dato de 356 vídeos excluidos y 124 indexados pertenece a la revisión aportada; esta intervención no lo presenta como una nueva medición API.

## Mejora aplicada

En `scripts/gsc.mjs`:

- Se elimina `indexed=0` de la salida de sitemaps. Google declara `contents[].indexed` **obsoleto y no utilizable**; no es sólo un dato temporalmente ausente. Se muestra una explicación explícita y se conserva `submitted`, usando `N/D` si falta. [Referencia oficial](https://developers.google.com/webmaster-tools/v1/sitemaps).
- Se limita a 30 segundos la descarga del sitemap y cada petición de inspección del lote, para evitar esperas indefinidas.
- La salida normal de `inspect-sitemap` conserva todos los resultados, incluidos los indexados y sus fechas de rastreo. Antes sólo permitía comparar los pendientes.
- `--compact` sigue omitiendo los resultados completos, pero conserva los errores de API. Una consulta fallida no debe confundirse con una URL que Google desconoce.

No se modificaron las fichas, reseñas, puntajes, perfiles, metadatos públicos ni el sitemap. No se reenviaron sitemaps, solicitaron indexaciones ni reiniciaron validaciones en GSC.

## Verificación

- `npm run check`: 332 archivos; cero errores, advertencias o hints.
- `npm run build`: 8.192 páginas; completado correctamente.
- `validate:sitemap-indexability`: 5.743 páginas canónicas; sin noindex en sitemap, canonicals incorrectos ni enlaces internos rotos.
- `validate:public-output`: aprobado.
- Auditoría estructural del sitio: sin hallazgos; la auditoría completa inicial también terminó sin errores bloqueantes, con avisos de catálogo y pósters fuera del rango de peso preferido.
- Playwright: **18 aprobadas** en Chromium desktop, Chromium móvil y WebKit móvil; catálogo completo, navegación sin JavaScript, metadatos y Comunidad.
- `gsc.mjs sitemaps` y la inspección de las 51 páginas de catálogo se ejecutaron con la herramienta corregida; `node --check` y `git diff --check` aprobados.

Los cambios se prepararon en `codex/seo-indexacion-20261031`. La comprobación de producción corresponde al despliegue ya existente indicado arriba; esta reparación de herramientas internas no necesita un nuevo despliegue del sitio.

La incorporación a `main` conserva únicamente la herramienta, este informe y su evidencia. El push activa el workflow habitual de Pages, aunque estos tres archivos no cambian la configuración SEO ni las páginas públicas. Las editoriales y ediciones automáticas posteriores se conservan al actualizar la rama sobre `origin/main`.

## Seguimiento útil

Revisar el 07/11 las mismas URLs de la evidencia y comparar estado, último rastreo y canonical elegido. Priorizar fichas y notas con interés editorial real. En el catálogo, seguir especialmente las 25 páginas que todavía no figuran indexadas. En Comunidad, comparar las discusiones históricas noindex cuando Google vuelva a rastrearlas.

Las URLs con respuestas válidas que Google decide no indexar siguen pendientes de selección o de un nuevo rastreo. No se declaran «arregladas» por pasar una prueba HTTP. Tampoco se recomienda reescribir automáticamente cientos de textos, bloquear secciones o enviar repetidamente el sitemap sin nueva evidencia.
