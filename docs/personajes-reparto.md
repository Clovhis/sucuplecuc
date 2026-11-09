# Personajes del reparto

Los créditos de personajes viven en el campo opcional `castCharacters` de cada película. `actor` debe coincidir exactamente con `mainCast`; `character` conserva el rol acreditado por TMDB o, si falta allí, el rol verificado en una fuente web. `tmdbMovieId` y `tmdbPersonId` identifican las entidades de película y persona; `verifiedAt` registra la fecha de consulta a TMDB. Si una fuente fiable confirma una forma completa que TMDB abrevia, conserva el texto original en `character` y muestra la forma completa en `displayCharacter`. Las URLs y el dato corroborado se guardan en el reporte de la carga; `displayCharacter` y `variants` no se infieren ni traducen.

## Alta

Después de verificar el reparto y las identidades de actores, enriquecé una alta individual con:

```bash
npm run enrich:characters -- --slug <slug> --apply
```

Para una tanda, una vez verificado el reparto de todas las fichas seleccionadas:

```bash
npm run enrich:characters -- --changed --apply
```

El lote procesa todos los archivos seleccionados, sin límite implícito. Omite las películas que ya tienen personajes almacenados y sólo agrega créditos verificados. Una coincidencia exige título y año únicos, director coincidente y al menos dos actores con IMDb coincidente entre `people.json` y los IDs externos de TMDB. El registro de pendientes evita inventar datos, pero no significa que una carga nueva esté lista para aprobarse: la información de personajes es casi obligatoria. Si TMDB no devuelve el rol o la API no lo resuelve, hay que buscar fuentes web fiables y guardar la evidencia en el reporte. El auditor sólo puede aceptar una carga sin personajes cuando la película sea verdaderamente de nicho y se documenten las búsquedas agotadas y la falta de información fiable. Una falla de API o una clave ausente nunca habilita por sí sola esa excepción.

## Datos y operación

La API se consulta durante la carga, nunca desde el navegador. Definí `TMDB_API_KEY` en `.env.local` o en el entorno local; no la guardes en archivos versionados. El cliente limita las solicitudes, usa timeout y reintentos acotados, y mantiene caché y checkpoint en `reports/character-enrichment/` (ignorados por Git).

Los créditos guardados forman parte permanente del JSON de la película. La herramienta automática no reemplaza ni elimina entradas existentes, y `validate:content` bloquea cualquier eliminación o reescritura accidental respecto de `origin/main`. Una corrección requiere un pedido explícito y una fuente verificable para el título, el actor y los IDs afectados. Registrá el valor anterior, el nuevo y la fuente en el reporte de esa tarea, y autorizá únicamente el título corregido con `npm run validate:content -- --allow-character-correction <slug>=<https://fuente-verificable>`.

El build integra los créditos en las fichas y en el índice MiniSearch. Para verificar el catálogo completo y la salida construida, ejecutá `npm run validate:content`, `npm run build` y `npm run audit:character-build`.
