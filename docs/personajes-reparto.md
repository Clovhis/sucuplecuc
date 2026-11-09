# Personajes del reparto

Los créditos de personajes viven en el campo opcional `castCharacters` de cada película. `actor` debe coincidir exactamente con `mainCast`; `character` conserva el nombre acreditado por TMDB. `tmdbMovieId` y `tmdbPersonId` identifican el crédito de origen, y `verifiedAt` registra la fecha de consulta. `displayCharacter` y `variants` sólo se agregan con una fuente verificable; no se infieren traducciones ni aliases.

## Alta

Después de verificar el reparto y las identidades de actores, enriquecé una alta individual con:

```bash
npm run enrich:characters -- --slug <slug> --apply
```

Para una tanda, una vez verificado el reparto de todas las fichas seleccionadas:

```bash
npm run enrich:characters -- --changed --apply
```

El lote procesa todos los archivos seleccionados, sin límite implícito. Omite las películas que ya tienen personajes almacenados y sólo agrega créditos verificados. Una coincidencia exige título y año únicos, director coincidente y al menos dos actores con IMDb coincidente entre `people.json` y los IDs externos de TMDB. Si falta la clave, no hay personajes o falla la API, el checkpoint registra el pendiente y la carga sigue sin inventar datos.

## Datos y operación

La API se consulta durante la carga, nunca desde el navegador. Definí `TMDB_API_KEY` en `.env.local` o en el entorno local; no la guardes en archivos versionados. El cliente limita las solicitudes, usa timeout y reintentos acotados, y mantiene caché y checkpoint en `reports/character-enrichment/` (ignorados por Git).

Los créditos guardados forman parte permanente del JSON de la película. La herramienta automática no reemplaza ni elimina entradas existentes, y `validate:content` bloquea cualquier eliminación o reescritura accidental respecto de `origin/main`. Una corrección requiere un pedido explícito y una fuente verificable para el título, el actor y los IDs afectados. Registrá el valor anterior, el nuevo y la fuente en el reporte de esa tarea, y autorizá únicamente el título corregido con `npm run validate:content -- --allow-character-correction <slug>=<https://fuente-verificable>`.

El build integra los créditos en las fichas y en el índice MiniSearch. Para verificar el catálogo completo y la salida construida, ejecutá `npm run validate:content`, `npm run build` y `npm run audit:character-build`.
