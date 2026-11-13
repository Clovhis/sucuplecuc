# Revisión: llegadas a plataformas de películas de años anteriores

Fecha de revisión: 13/11/2026, Argentina. Pedido: comprobar la captura de Prime y afinar la skill de carga. No se usaron skills `cineposta-cloud-*` ni subagentes.

## Hallazgo

La película es *Mothers’ Instinct* (2024), de Benoît Delhomme, con Jessica Chastain y Anne Hathaway. Su título cinematográfico argentino es *Instinto maternal*; JustWatch AR la publica como *Vidas perfectas*. Identidades: IMDb `tt13397574`, TMDB `758679`, JustWatch `tm1386684`. No debe confundirse con la adaptación de 2018 ni con el documental de Netflix de 2026 de título parecido.

| Dato | Fuente | Hecho comprobado |
| --- | --- | --- |
| Año, dirección y protagonistas | https://www.neonrated.com/film/mothers-instinct | 2024; Benoît Delhomme; Jessica Chastain, Anne Hathaway, Josh Charles y Anders Danielsen Lie. |
| Título argentino | https://www.cinepolis.com.ar/peliculas/instinto-maternal | Instinto maternal; original Mothers’ Instinct; 94 minutos, P-16. La ficha histórica no demuestra cartelera vigente. |
| Estreno cinematográfico AR histórico | https://www.imdb.com/es/title/tt13397574/releaseinfo/ | 11/01/2024; no es un estreno cinematográfico de 2026. |
| Oferta vigente AR | https://www.justwatch.com/ar/pelicula/mothers-instinct | Incluida en Amazon Prime Video; alquiler/compra también en Amazon Video y Apple TV Store. |
| Evidencia oficial aportada por el usuario | Captura de Prime Video adjunta a este pedido | Mothers’ Instinct, «Ver ahora» e «Incluido con Prime». No incluye fecha de llegada. |
| Enlace de la oferta Prime desde JustWatch AR | https://app.primevideo.com/detail?gti=amzn1.dv.gti.90b84876-dfa1-4de4-b6b0-1cd2bca014e1 | Oferta FLATRATE del título exacto; el acceso web público no permitió obtener una fecha de incorporación. |
| Detección semanal | arrival-sweep.json, día 2026-11-13, título tm1386684 | El barrido ya contenía el título de 2024 y su oferta Prime FLATRATE. |
| Duplicados | new-movie --title "Instinto maternal" --year 2024 --dry-run --json y cotejo del título original/aliases | Sin ficha duplicada identificada. Slug propuesto: instinto-maternal-2024. El dry-run no creó una ficha ni un sidecar. |

Conclusión: debía evaluarse como candidata de plataforma. La disponibilidad Prime actual y el año 2024 están confirmados. La detección del 13/11 no demuestra por sí sola que ese día haya sido su primera incorporación a Prime: el nodo del feed muestra todas sus ofertas actuales. La fecha exacta de ese pase queda pendiente de evidencia específica del proveedor. No se inventó una `releaseDate`, no se asignó un score ni se publicó una ficha incompleta para cerrar este hallazgo.

## Causa y alcance del recorte

La consulta original a `newTitles(country:AR, ..., filter:{objectTypes:[MOVIE]})` no tenía un filtro de año. La clasificación temporal posterior sí ejecutó `originalReleaseYear >= 2025`, antes de armar el manifiesto de 75 candidatos recientes. Ese corte no estaba autorizado por el pedido de estrenos semanales de plataformas. Se trata de un error de selección, no de ausencia de la película en JustWatch ni de una falsedad demostrada por parte de Prime.

El barrido conservado contiene 345 registros diarios y 331 identidades únicas. El corte automático dejó fuera 234 identidades con año anterior a 2025 y al menos una oferta no cinematográfica, más una con año sin resolver (`Project Child: Perfect Knight`, valor fuente `0`). Ese cero no es un año histórico válido. Algunas de las películas anteriores a 2025 ya están en CinePosta o se recuperaron individualmente durante la carga; otras pueden ser alquileres, reingresos, proveedores fuera del alcance o detecciones sin llegada fechada. Estos números no equivalen a estrenos omitidos listos para publicar.

Por lo tanto, las 33 altas y 8 actualizaciones ya realizadas son una carga comprobada, pero el manifiesto reciente no demuestra cobertura exhaustiva de las novedades de todos los años. La corrección de la skill no equivale a haber cargado o auditado individualmente las 234 candidatas antiguas ni a haber resuelto la identidad sin año. Se conserva el reporte previo como evidencia de lo efectivamente realizado, con esta aclaración de alcance.

## Cambio de las skills

- Alta: se agregó una regla visible en `SKILL.md` que dirige a `references/streaming-arrivals.md` antes de cualquier barrido semanal.
- La referencia separa año original, estreno histórico, llegada/cambio de oferta AR, detección del feed y fechas editoriales/de alta. Incluye suscripción, alquiler/compra, pases y reingresos.
- Prohíbe recortes de año no pedidos tanto en la consulta como en transformaciones posteriores. Si el usuario pide expresamente películas de un año concreto, se respeta ese límite.
- Exige conciliar el conjunto descubierto completo con altas, existentes, cambios, pendientes y exclusiones justificadas, en lugar de presentar un subconjunto reciente como exhaustivo.
- Auditoría: verifica esa conciliación y el origen de la fecha; no acepta una portada, un ranking o una oferta actual como prueba suficiente de llegada semanal.
- Se conservan `year`, slug e identidad reales, las fechas históricas y `catalogAddedAt`; no se mueven para forzar el carrusel. Las nuevas precisiones quedan en el informe, sin agregar campos al JSON.

## Validación

- `sync-from-repo.mjs --install` ejecutado: copia versionada del repositorio, plugin y Codex local sincronizadas.
- `quick_validate.py` con Python UTF-8: alta y auditoría válidas en las tres ubicaciones (seis verificaciones).
- Comparación de contenido de los dos entrypoints y de la nueva referencia: igualdad entre las tres copias.
- Revisión del caso real: la política nueva conserva Mothers’ Instinct (2024) como candidata; su llegada exacta permanece pendiente, sin convertir detección en estreno confirmado.
- Revisión de límites: una restricción expresa «películas de 2026» conserva su filtro; una oferta vigente sin fecha no se anuncia como novedad fechada; una película existente se revalida sin duplicarla ni mover `catalogAddedAt`.
- No se modificaron películas, scores, people, editoriales publicadas, UI, carruseles, automatizaciones ni snapshots. Esta revisión no genera publicaciones adicionales en redes.
