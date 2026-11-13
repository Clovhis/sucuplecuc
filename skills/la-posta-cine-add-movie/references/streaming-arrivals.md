# Estrenos de plataforma y año original

Leé esta referencia para pedidos como «estrenos de streaming de esta semana» o «novedades de todas las plataformas». La ventana solicitada corresponde a la llegada al servicio argentino; no implica películas producidas o estrenadas mundialmente en el año actual. Si el usuario pide expresamente «películas de 2026», respetá esa restricción de año original y documentala.

## Fechas que deben mantenerse separadas

- **Año de la obra:** identidad original/festival verificada; conservar en `year`, el slug y los cotejos de duplicados. No cambiarlo al año de incorporación al streaming ni confundir una remake con la versión anterior.
- **Estreno original o en salas argentinas:** antecedente histórico, que puede ser años anterior al streaming.
- **Llegada o cambio de oferta en una plataforma AR:** fecha, proveedor y modalidad comprobados para la semana. Una nueva suscripción, un pase entre servicios, alquiler/compra o reingreso pueden ser novedades distintas; no afirmar que es la primera disponibilidad histórica en Argentina sin evidencia.
- **Alta en CinePosta:** `catalogAddedAt`, fecha real de incorporación al sitio. `reviewPublishedAt` corresponde a la publicación de la reseña. Ninguna de las dos prueba cuándo llegó al servicio.

Guardá estos hechos y sus fuentes en el informe, sin inventar campos en las fichas. Una nueva ficha puede conservar `year: 2024` y tener una `releaseDate` AR de plataforma verificada en 2026, según el contrato existente. En una ficha histórica conservá `catalogAddedAt` y la fecha de estreno ya documentada; registrá el nuevo pase en el informe, sin mover fechas para forzar carruseles.

## Descubrimiento y cobertura

1. Barré de lunes a domingo en Argentina, agotando la paginación. No agregues un mínimo de `originalReleaseYear`, `releaseYear` o `year` a la consulta ni a la clasificación posterior, salvo restricción expresa del usuario. Tampoco limites arbitrariamente a «este año y el anterior». Las películas de catálogo antiguas siguen siendo candidatas cuando su llegada al servicio cae en la ventana solicitada.
2. Conservá el barrido sin filtrar y un manifiesto de títulos únicos con identidad, año original, fecha(s) de detección, proveedor, modalidad y URL AR. El feed puede listar el mismo título en varios días: deduplicá por identidad estable y luego cruzá título localizado, original, aliases y año con todas las fichas y el preflight canónico.
3. Evaluá todo el manifiesto, incluidas las filas de años anteriores. Conciliá cada título como alta, ficha existente sin cambio, actualización, pendiente o exclusión con motivo concreto. La suma debe cubrir todo el conjunto descubierto dentro del alcance; «es vieja» no es motivo válido por sí solo. No llames exhaustiva a una carga cuya conciliación sólo cubre un subconjunto reciente.
4. Un evento en `newTitles` puede ser detección, reingreso o cambio de oferta. Comprobá la disponibilidad actual con JustWatch AR y la plataforma oficial cuando haga falta; distinguí `FLATRATE` de `RENT`/`BUY` y de un canal adicional. Un nodo puede mostrar todas sus ofertas actuales: su aparición en el feed no fecha automáticamente cada proveedor. Buscá el evento o anuncio del proveedor exacto antes de atribuirle la llegada. Registrá separadamente la fecha observada y una fecha de llegada confirmada, con su grado de certeza. Si sólo hay detección, decí «novedad detectada el…», sin convertirla en primera fecha de estreno comprobada.
5. Una portada, «nuevo», un Top 10 o «incluido con Prime» ayuda a verificar identidad/oferta; no demuestra la fecha de incorporación. Sin fecha fiable, la película puede quedar como disponibilidad vigente con llegada semanal pendiente; no inventes `releaseDate` para publicarla como estreno de esa semana. No presentes futuros estrenos como disponibles.

## Presentación y auditoría

Usá «llega a Prime», «se suma al catálogo», «ahora incluida con la suscripción» o «vuelve a…» según la evidencia. Mostrá el año real cuando evite confusión y reservá «estreno mundial» o «primera vez en Argentina» para hechos comprobados. No conviertas «estreno mentiroso» en una acusación a la plataforma: puede ser una novedad legítima del servicio.

Antes de cerrar, revisá las transformaciones entre barrido, selección y reporte: una consulta sin filtro anual no alcanza si un paso posterior elimina los años anteriores. Incluí en la comprobación al menos un caso anterior al año actual cuando el barrido contenga alguno, sin imponer una cuota de películas antiguas. El auditor debe detectar cualquier descarte anual no pedido.

Caso de referencia: *Mothers’ Instinct* (2024, IMDb `tt13397574`, TMDB `758679`; título argentino *Instinto maternal*) apareció en el barrido AR del 13/11/2026 con Prime `FLATRATE`, pero una selección posterior `originalReleaseYear >= 2025` la omitió. La corrección es evaluar la llegada sin ese recorte, conservar 2024 y cotejar aliases como *Vidas perfectas*. El evento del feed no prueba por sí solo la primera disponibilidad histórica.
