# Auditoría de indexación de Google Search Console

Fecha de trabajo: 2026-07-28 (America/Buenos_Aires)  
Propiedad: `https://www.cineposta.com.ar/`

## Resumen ejecutivo

La cuenta de servicio del proyecto autentica correctamente contra Search Console y tiene permiso `siteOwner`.

El número “724 páginas no indexadas” no equivale a 724 páginas canónicas perdidas. El informe mezcla URLs canónicas que requieren seguimiento con variantes históricas o deliberadamente no indexables:

| Motivo mostrado por GSC | Cantidad de la captura | Diagnóstico |
| --- | ---: | --- |
| Excluida por `noindex` | 381 | Rutas antiguas `/trailers/.../` que debían consolidarse con la ficha de película. |
| Página con redirección | 56 | Principalmente variantes históricas de personas con `?backTo=...`; no deben indexarse como URLs separadas. |
| Rastreada: actualmente sin indexar | 107 | Grupo accionable; predominan perfiles de personas publicados o aprobados editorialmente en lote. |
| Alternativa con canonical adecuada | 175 | Exclusión correcta de duplicados; no se debe intentar indexar la variante. |
| No encontrada (404) | 1 | La API no expone el ejemplo. El sitemap y los enlaces internos del build no contienen destinos rotos. |
| Descubierta: actualmente sin indexar | 4 | Cola de rastreo pequeña, sin bloqueo técnico. |

La inspección individual por API de las 1.380 URLs canónicas del sitemap dio este estado más actual:

- 1.286 URLs enviadas e indexadas.
- 89 URLs rastreadas y actualmente sin indexar.
- 4 URLs descubiertas y todavía sin indexar.
- 1 URL nueva todavía no reconocida por Google.
- 1.375 de 1.380 URLs con fetch exitoso.
- Ningún bloqueo por `robots.txt`.
- Ningún canonical de Google en conflicto con el canonical declarado.
- Ningún error 4xx/5xx entre las URLs canónicas enviadas.

Una segunda inspección de la sección `/personas/` encontró:

- 291 perfiles indexados.
- 85 perfiles rastreados y actualmente sin indexar.
- Charlton Heston descubierto y pendiente de primer rastreo.
- Una respuesta transitoria incompleta para James Franco.

Por lo tanto, el grupo canónico pendiente se concentra en personas, no en películas. La aprobación editorial masiva de perfiles ocurrió el 2026-07-12; una gran parte de las fechas de último rastreo informadas por GSC es anterior a esa publicación o muy cercana a ella.

## Inventario técnico

El build genera 3.362 páginas HTML:

- 1.380 URLs canónicas incluidas en `sitemap.xml`.
- 991 fichas de películas.
- 377 fichas de personas.
- 991 discusiones de comunidad deliberadamente `noindex`.
- 991 rutas históricas de trailers.

`video-sitemap.xml` contiene 991 fichas canónicas de películas. Los dos sitemaps responden correctamente y Search Console informa cero errores y cero advertencias.

## Cambios aplicados

1. Las 991 rutas históricas `/trailers/.../` ahora hacen una redirección instantánea a `/peliculas/.../`.
   - GitHub Pages no permite configurar respuestas 301 por ruta.
   - Google interpreta un `meta refresh` instantáneo como redirección permanente cuando no se puede implementar una redirección HTTP.
   - Se conserva el canonical absoluto a la ficha de película.
   - Se eliminó el `noindex` de estas rutas: la consolidación ahora se expresa como movimiento permanente, no como una página excluida.
2. Se amplió `scripts/gsc.mjs` con:
   - listado de sitemaps y su estado;
   - inspección masiva de todas las URLs de un sitemap;
   - filtros por prefijo de ruta;
   - concurrencia limitada y salida compacta;
   - resumen de verdict, cobertura, fetch, permiso de indexación y canonical.
3. La validación del sitemap ahora comprueba además:
   - enlaces internos rotos desde cualquier página canónica;
   - reaparición de parámetros `backTo`;
   - reaparición de enlaces internos a rutas legacy `/trailers/`.
4. Se actualizó el e2e de trailers para exigir que la ruta legacy termine en la ficha canónica.

## Qué no debe “corregirse”

- Una URL con redirección no debe indexarse; debe indexarse el destino.
- Una alternativa con canonical correcto tampoco debe indexarse por separado.
- Las discusiones `/comunidad/peliculas/.../` siguen siendo `noindex` de forma deliberada y están fuera del sitemap.
- No conviene bloquear estas rutas mediante `robots.txt`: impediría que Google vea la directiva o la redirección.
- No se debe usar la Indexing API para estas páginas. Google la reserva para `JobPosting` y eventos retransmitidos en vivo, no para películas o biografías.

## Acciones posteriores al deploy

1. Fusionar esta rama en `main` para que GitHub Pages publique el cambio.
2. Esperar que termine el workflow de deploy.
3. Volver a enviar:

   ```powershell
   npm run gsc:submit-sitemap
   npm run gsc:submit-sitemap -- --sitemap https://www.cineposta.com.ar/video-sitemap.xml
   ```

4. En GSC:
   - abrir “Excluida por una etiqueta `noindex`”;
   - inspeccionar una URL `/trailers/.../` y confirmar que ahora se detecta como redirección;
   - iniciar una nueva validación de ese grupo;
   - iniciar validación de “Rastreada: actualmente sin indexar” después del deploy y del reenvío del sitemap;
   - no iniciar validación para “Página con redirección” ni “Alternativa con canonical adecuada” salvo que el ejemplo sea una URL que realmente deba indexarse.
5. Abrir el único ejemplo 404 en la interfaz. Si está en el sitemap o enlazado internamente, corregirlo; si es una URL vieja sin reemplazo ni enlaces, dejar el 404. La API pública de Search Console no entrega esa lista de ejemplos.
6. Solicitar indexación manual sólo para una muestra prioritaria, por ejemplo:
   - `/personas/denzel-washington/`
   - `/personas/jack-nicholson/`
   - `/personas/amy-adams/`
   - `/personas/charlton-heston/`
   - `/peliculas/la-casaca-de-dios-2026/`

No es necesario solicitar manualmente las 85 fichas: el sitemap y el enlazado interno ya permiten que Google las recorra. La indexación no está garantizada ni es inmediata.

## Evidencia y referencias

- Search Console API: `sites.list`, `sitemaps.list` y `urlInspection.index.inspect`.
- Sitemap principal descargado por Google el 2026-07-29T01:47:05Z, sin errores ni advertencias.
- Sitemap de video descargado por Google el 2026-07-28T18:17:14Z, sin errores ni advertencias.
- [Google Search Central: redirecciones y `meta refresh`](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google Search Console: informe de indexación de páginas](https://support.google.com/webmasters/answer/7440203?hl=es)
- [Search Console API: referencia](https://developers.google.com/webmaster-tools/v1/api_reference_index)
- [Search Console API: límites de uso](https://developers.google.com/webmaster-tools/limits)

