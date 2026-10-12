# Auditoría de las exportaciones de cobertura — 12/10/2026

Se revisaron las dos carpetas aportadas en Downloads: 696 filas de «Excluida por una etiqueta noindex» y 225 de «Rastreada: actualmente sin indexar». Son 921 URLs distintas. Los gráficos exportados terminan el 03/10; las fechas de último rastreo de las tablas van del 08/04 al 05/10. Se conserva el hash SHA-256 de cada tabla y el diagnóstico por URL en la [evidencia](reports/seo-coverage-2026-10-12.json).

Esta revisión cubre **todas las URLs de esas dos exportaciones**. No equivale a auditar los demás motivos de cobertura ni todas las URLs del sitio. Google también advierte que los ejemplos de cobertura no necesariamente representan todas las URLs de un motivo. [Informe de indexación](https://support.google.com/webmasters/answer/7440203?hl=es).

## Resultado público actual

Las 921 URLs devolvieron HTTP 200, sin `noindex` en meta robots, Googlebot ni cabecera X-Robots-Tag. Robots permite el sitio. No se encontraron nuevos bloqueos técnicos de indexación en este conjunto.

| Grupo exportado | Tipo de URL | Cantidad | Situación actual |
| --- | --- | ---: | --- |
| Noindex | Discusiones de Comunidad | 344 | Canonical propio, indexables y presentes en sitemap |
| Noindex | Trailers antiguos | 352 | Redirección meta refresh inmediata y canonical a la ficha |
| Rastreada sin indexar | Películas | 83 | Canonical propio, indexables y presentes en sitemap |
| Rastreada sin indexar | Perfiles sin parámetros | 76 | Canonical propio, indexables y presentes en sitemap |
| Rastreada sin indexar | Perfiles con `backTo` | 9 | Canonical correcto hacia el perfil limpio |
| Rastreada sin indexar | Discusiones de Comunidad | 3 | Canonical propio, indexables y presentes en sitemap |
| Rastreada sin indexar | Trailers antiguos | 54 | Redirección meta refresh inmediata y canonical a la ficha |

En total hay 506 URLs canónicas indexables, 406 rutas antiguas de trailers y 9 variantes con parámetros. Se comprobaron también los destinos canónicos de trailers y variantes: HTTP 200, indexables y en el sitemap. Las rutas de trailers y las variantes no están en el sitemap. No corresponde solicitar que Google indexe cada duplicado ni reemplazar su canonical por uno autorreferente.

Las 344 exclusiones de Comunidad se rastrearon entre el 10/07 y el 03/09. La eliminación del `noindex` se publicó el **13/09**, en `d30e53ab6a04765a19966cd983c87c30e0ae37a7`. Todas las fechas exportadas de esas discusiones son anteriores a ese cambio. La atribución histórica explica el informe exportado; no afirma que Google ya haya vuelto a rastrear todas las páginas.

## Lectura actual de GSC

Se realizaron 225 inspecciones mediante la API, sobre 220 URLs distintas: las 171 filas sin ruta de trailer del grupo «Rastreada», 45 discusiones históricas de noindex y los 9 destinos limpios de `backTo` (5 ya estaban en el primer grupo). Ninguna consulta terminó con error. No se gastaron inspecciones individuales en los 406 duplicados de trailers, cuyo comportamiento y destinos se verificaron públicamente.

De las **162 URLs canónicas** del grupo «Rastreada»:

| Estado actual de inspección | Cantidad |
| --- | ---: |
| Enviada e indexada | 37 |
| Rastreada: actualmente sin indexar | 121 |
| Descubierta: actualmente sin indexar | 2 |
| Google no reconoce esta URL | 2 |

Las 37 indexadas son 30 películas y 7 perfiles. Las 121 aún rastreadas sin indexar son 53 películas, 65 perfiles y 3 discusiones. De las 125 canónicas pendientes, 73 conservan un último rastreo de abril/mayo, 28 de junio, 13 de julio, 6 de agosto, 1 de septiembre y 4 no muestran un rastreo actual. Eso limita lo que Google pudo haber visto de los cambios recientes.

Las 45 discusiones históricas inspeccionadas mantienen el `noindex` del último rastreo en la API, aunque su respuesta pública ya permite indexación. Es una comprobación dirigida, no una lectura API de las 344 discusiones. Los 9 perfiles con `backTo` figuran como desconocidos; sus destinos limpios muestran 4 indexados y 5 rastreados sin indexar. No se detectaron discrepancias entre el canonical público y el elegido por Google cuando la API informó uno.

El catálogo HTML completo y los snippets se publicaron el 12/10 en la auditoría anterior. Debe observarse su nuevo rastreo antes de atribuirles resultados o repetir contenido en cientos de fichas. Los textos actuales de películas y perfiles están presentes en HTML. Su longitud por sí sola no demuestra calidad ni permite explicar por qué Google decidió no indexar una página.

## Corrección comprobada

La reseña de *Freddy vs. Jason* nombraba a Kane Hodder como Jason. Se corrigió a **Ken Kirzinger**, consistente con el elenco que ya tenía la ficha y con el [press kit de New Line Cinema, página 1](https://nightmareonelmstreetfilms.com/Files/FreddyvsJasonProductionNotes.pdf). Se modificó únicamente ese nombre dentro de la reseña original. Se conserva Score CinePosta 3 y el resto de los datos. [JustWatch Argentina](https://www.justwatch.com/ar/pelicula/freddy-contra-jason), consultado el 12/10, confirma HBO Max por suscripción; no fue necesario cambiar la plataforma.

La comprobación Astro pasó sin errores, advertencias ni hints. La auditoría dirigida de la película se ejecutó con `--candidate` y aprobó el contenido. Conserva una advertencia previa e informativa: el poster WebP válido de 480×696 ocupa 24.876 bytes, por debajo del rango de peso preferido. No se alteró la imagen. La publicación requiere además la validación completa de contenido y build del hook, y verificar el nombre corregido en producción.

## Acciones y seguimiento

1. Las solicitudes de `/catalogo/` y `/editorial/` ya fueron realizadas por el usuario. No repetirlas ahora ni volver a enviar un sitemap que Google ya descargó correctamente.
2. Solicitar indexación de estas URLs prioritarias después de **Probar URL publicada**: `/personas/guillermo-del-toro/`, `/personas/pierce-brosnan/`, `/personas/billy-wilder/` y `/personas/paul-thomas-anderson/`. Las dos primeras figuran como desconocidas y las otras como descubiertas. Todas están enlazadas desde el directorio HTML de Personas y en el sitemap. Se puede agregar `/peliculas/ready-player-one-2018/` y `/peliculas/anora-2024/`, que mantienen rastreos antiguos. La API no ofrece la solicitud de indexación; no corresponde usar la Indexing API para este catálogo de películas.
3. Si la validación del motivo noindex sigue **Iniciada**, dejarla continuar. Los antiguos trailers consolidan su señal en las fichas y no tienen que convertirse en páginas independientes indexadas. No iniciar validaciones masivas del motivo «Rastreada» como si las 121 URLs ya hubieran sido indexadas.
4. Revisar rastreo y estado el **18/10 y 25/10**. Usar la misma evidencia para comparar cambios por URL; mantener separadas las páginas canónicas y los duplicados. La ausencia de bloqueos técnicos no garantiza la indexación de las páginas pendientes.
