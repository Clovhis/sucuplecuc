# Auditoría integral de personajes — 9 de noviembre de 2026

## Alcance y método

Se revisaron las 2.574 fichas de `src/data/movies/`. El flujo de TMDB se volvió a ejecutar sobre las 571 fichas sin `castCharacters`, forzando una consulta actual en vez de usar la caché. Para las 2.003 fichas con créditos guardados se consultó en vivo [TMDB Movie Credits](https://developer.themoviedb.org/reference/movie-credits) y se comparó cada rol por `tmdbPersonId`; los candidatos de reparto también se cotejaron con [TMDB Person External IDs](https://developer.themoviedb.org/reference/person-external-ids). Posibles integrantes faltantes de `mainCast` sólo se aceptarían con nombre exacto y coincidencia del IMDb externo de TMDB con `people.json`.

## Resultado

- 2.003 fichas tienen 7.039 créditos de personajes guardados, frente a 8.970 integrantes en `mainCast`; 1.931 créditos de actor no tienen un personaje verificado almacenado. El barrido usó 2.058 solicitudes y no registró errores de API.
- 7.033 créditos coincidieron directamente por ID de persona y nombre. Revisé además las seis filas que el cotejo marcó como excepciones: en *Franz* (2025), Peter Kurth, Katharina Stark y Sebastian Schwarz aparecen dos veces en el reparto de TMDB, pero la entrada duplicada no tiene personaje y la entrada con personaje conserva exactamente `Hermann Kafka`, `Ottla Kafka` y `Max Brod`; en *Un hijo propio* (2026), la segunda entrada de Mayra Sérbulo también está vacía y la primera conserva `Mamá Arthuro`. En *La caída de la ballena* (2026) y *Wolfs* (2024), TMDB devolvió el nombre malformado `Austin AbraDIH`, pero el ID de persona devuelve IMDb `nm3641002`, igual al de Austin Abrams en `people.json`, y los roles `Jay Gardiner` y `Kid` coinciden. Por lo tanto, los 7.039 roles guardados siguen respaldados por el reparto actual de TMDB; no hubo cambios de personaje pendientes.
- El barrido encontró 56 posibles roles de actores de `mainCast` en 52 películas, pero no los agregó: 55 no pasan la coincidencia exacta entre IMDb y el ID de TMDB, y uno devuelve varios créditos de reparto posibles. El detalle de títulos, actores, IDs y motivo está en [el resultado de API adjunto](auditoria-personajes-catalogo-2026-11-09.json). Quedan como candidatos de identidad para una verificación puntual, no como créditos aprobados.
- 571 películas siguen sin personajes verificados. La reconsulta fresca no produjo una coincidencia nueva: 239 tienen título/año ambiguo, 125 dirección no coincidente, 71 resultados en múltiples páginas y 136 menos de dos identidades confirmadas. El detalle por título está en [el reporte de enriquecimiento del 8 de noviembre](../docs/character-enrichment-report-2026-11-08.md). No inferí personajes para cerrar estos casos; tampoco hice búsquedas web individuales para esos 571 títulos históricos, así que el resultado los clasifica como no confirmados por el proceso de TMDB, no como irrecuperables.
- 2.094 de los 7.039 valores guardados tienen una sola palabra. Es una alerta heurística, no una lista de errores: TMDB devuelve muchos nombres legítimos así. El barrido comprobó que esos valores coinciden con su crédito actual en TMDB; no hice búsquedas web individuales para esos 2.094 casos. Sólo amplié el ejemplo confirmado de Alex; el resto requiere evidencia concreta antes de cambiarlo.

## Corrección verificada

Para *La naranja mecánica* (1971), la respuesta actual de TMDB para película 185/persona 56890 y el dato existente mantienen `character: "Alex"`. Añadí `displayCharacter: "Alex DeLarge"` para que el nombre completo se muestre y se pueda buscar, preservando el dato original de TMDB. AFI registra el crédito de Malcolm McDowell como `Alex [DeLarge]`, y Criterion identifica a Alex DeLarge como el personaje interpretado por McDowell ([AFI Catalog](https://catalog.afi.com/Film/54041-A-CLOCKWORKORANGE?cp=1&pos=4&sid=a8923776-bed8-424b-a8f4-4e2e68eb51bb&sr=0.05371957), [Criterion Collection](https://www.criterion.com/films/30441-a-clockwork-orange)). El nombre de Mark Hamill ya está completo como `Luke Skywalker` en sus seis fichas de *Star Wars* del catálogo, por lo que no requirió cambios.

## Regla para futuras cargas

Actualicé las skills de alta y auditoría: la información de personajes es casi obligatoria, primero se consulta TMDB y, si el rol falta o está abreviado, se busca una fuente web fiable para la película y el actor exactos. Los IDs de TMDB para película y persona siguen necesitando verificación independiente; la web no habilita inventarlos. Sólo se puede aprobar sin personajes una película demostrablemente muy de nicho y poco conocida, después de agotar y documentar ambas búsquedas. Una API caída, una clave ausente o una coincidencia ambigua no habilita la excepción. La regla se limita a cargas nuevas/revalidadas; no transforma automáticamente cada hueco histórico en un error de contenido.

## Validación

- `quick_validate.py`: aprobadas las skills de alta y auditoría en las copias fuente, plugin e instalación local (6/6).
- `npm run validate:content -- --allow-character-correction la-naranja-mecanica-1971=https://www.criterion.com/films/30441-a-clockwork-orange`: validación del contenido, catálogos derivados y auditoría de la ficha. El warning de póster es heredado y no está relacionado con esta corrección.
- El build local terminó correctamente: 8.635 páginas. `validate:public-output` y `validate:sitemap-indexability` pasaron; el sitemap contiene 6.052 páginas canónicas.
- `npm run audit:character-build` pasó: 2.003 fichas, 7.039 créditos. Revisé además el HTML de la ficha y el índice `search-index-v3.json`: la tarjeta dice `Como Alex DeLarge` y el índice guarda `Alex DeLarge` con `Alex` como variante.

