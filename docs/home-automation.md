# Arquitectura y automatización del home

## Fuentes de verdad y responsabilidades

CinePosta es un sitio estático Astro 7. `src/data/movies/*.json` aporta películas, `people.json` y `personProfiles.ts` aportan personas, y `src/data/editorials/*.json` aporta notas. `src/lib/movies.ts`, `people.ts`, `editorial.ts`, los medidores y el motor de recomendaciones transforman esas fuentes. Las rutas Astro generan fichas, archivo editorial, personas, catálogo paginado, trailers, Comunidad, sitemap y el índice JSON de búsqueda. Los scripts del navegador manejan filtros/paginación, carruseles, players y juegos. Supabase atiende ratings y Comunidad en el navegador; sus SQL viven en `supabase/sql/`. Las credenciales administrativas no pertenecen al repo.

Las cargas con skills modifican películas, personas/assets y referencias derivadas; la validación de contenido comprueba esos datos, rutas, catálogo, originalidad y salida pública. Pósters y retratos conservan sus políticas locales. Este cambio no altera la taxonomía, Score CinePosta, reseñas, biografías, filtros, medidores ni el diseño.

Las siguientes secciones del home tienen una edición propia: **su fuente pública es un snapshot versionado**, no un cálculo al construir el sitio. Los builds locales, pushes de películas y publicaciones de editoriales leen la misma edición. El resto del catálogo, cartelera y streaming mantiene su comportamiento normal.

| Sección | Snapshot | Generador | Lectura del home |
| --- | --- | --- | --- |
| Radar de Cine | `src/data/cinemaNews.generated.json` | `npm run refresh:cinema-news` | `getCinemaNews()` lee los datos locales sin red |
| Recomendadas | `src/data/weeklyRecommendations.generated.ts` | `npm run refresh:weekly-recommendations` | Usa `WEEKLY_RECOMMENDATION_CARDS`, con título, póster, plataforma y score congelados |
| Próximos estrenos | `src/data/upcomingReleases.generated.ts` | `npm run update-upcoming-releases` | Usa la edición generada, sin añadir películas del catálogo ni filtrar por fecha en cada build |

La fecha del próximo estreno permanece visible durante la edición aunque llegue su estreno: la lista se renueva al siguiente ciclo semanal. Esto evita que una carga normal retire o sustituya videos a mitad de semana. El autoplay, mute, selección y navegación siguen en `src/scripts/upcoming-suggestions.ts`; Actions actualiza el contenido, no reproduce videos. No se puede garantizar contenido distinto cada semana si las fuentes no ofrecen nuevos estrenos o trailers.

## Workflows conservados

Todos los horarios son de Argentina, UTC-3. Los cron están escritos en UTC y no dependen del reloj de la computadora. GitHub puede demorar o excepcionalmente perder una ejecución programada; la hora es la de disparo solicitada, no una garantía de publicación al minuto. La validación y el deploy agregan tiempo.

| Archivo | Nombre visible | Disparador |
| --- | --- | --- |
| `refresh-cinema-news.yml` | Radar de Cine diario (10:00 AR) | `0 13 * * *`, o manual |
| `refresh-weekly-recommendations.yml` | Edicion semanal: recomendadas y trailers (domingo 01:00 AR) | `0 4 * * 0`, o manual |
| `deploy.yml` | Publicar CinePosta en GitHub Pages | Push a `main`, manual o `workflow_run` exitoso de cualquiera de los dos actualizadores |
| `validate.yml` | Validar sitio: contenido, seguridad y navegadores | PR, lunes `30 5 * * 1`, o manual |
| `publish-buffer-x.yml` | Publicar pelicula diaria en X (19:00 AR via Buffer) | `30 21 * * *`, o manual; activado por `BUFFER_X_AUTOPUBLISH_ENABLED` |

Se eliminó `refresh-upcoming-releases.yml`: su responsabilidad pertenece al único workflow semanal. También se eliminó el cron diario de deploy, que reconstruía y consultaba el Radar fuera del horario pedido. Los nombres de `workflow_run` coinciden exactamente con los nuevos actualizadores. Los registros históricos de Actions pueden conservar nombres y fallos antiguos aunque ya no exista el archivo.

El semanal lanza dos jobs paralelos: uno genera las seis recomendaciones y el otro obtiene los próximos estrenos. Cada uno entrega un artifact; el job final descarga ambos sobre `main`, valida y publica un único commit. Si cualquiera falla, no se publica una edición incompleta. Repetir una generación en la misma semana conserva la selección si no cambió el catálogo. No se hace una segunda selección al publicar. Las pruebas del publicador simulan una carga concurrente, verifican que el rebase la conserve y rechazan cambios fuera de los snapshots.

Radar consulta **La Nación, Clarín, Página/12 y Ámbito**, además de las fuentes existentes **Infobae y Cines Argentinos**. Conserva el filtro de noticias cinematográficas, deduplica y publica hasta ocho historias, reservando una por fuente con noticias elegibles para que una fuente abundante no tape al resto. Clarín usa el feed mantenido de Espectáculos con filtro cinematográfico: su RSS específico de cine había quedado detenido en notas de 2025. El snapshot registra el resultado de cada fuente. Las peticiones tienen timeout y un reintento. Una fuente temporalmente caída conserva sus últimas noticias, con estado `preserved`; no se inventan noticias ni se borra la sección. Si todas fallan o no hay noticias, el generador falla antes de sobrescribir la edición. Las imágenes faltantes se intentan obtener desde el artículo del mismo medio.

Próximos estrenos toma títulos y fechas de Cines Argentinos, siempre Argentina. El video procede del endpoint de Videos de la **misma ficha** (`/pelicula/<id>/trailer`). YouTube oEmbed confirma que admite inserción; ante 401/403/404 se prueba el siguiente video de esa misma ficha, sin sustituirlo por un título distinto. El log registra título y canal como evidencia. La miniatura procede de YouTube. No se infiere disponibilidad por estudio ni se selecciona el primer resultado de una búsqueda global. Las fichas sin video insertable se omiten y se reportan; se requieren al menos cinco para reemplazar la edición. No se copia una sinopsis remota: el home conserva su descripción de fecha. Se quitó la dependencia de búsquedas HTML en TMDB que devolvían HTTP 403.

Los jobs que escriben ediciones comparten `publish-home-editions` con `cancel-in-progress: false`. El publicador permite sólo los archivos propios del actualizador, realiza commit, fetch, rebase y push, conservando cargas que hayan llegado a `main` mientras consultaba las fuentes. Un conflicto falla visiblemente y no descarta trabajo. El push con `GITHUB_TOKEN` no dispara otro workflow por `push`: `workflow_run` es el enlace explícito al deploy. Este hace checkout de `main` actualizado y acepta sólo actualizadores exitosos de este mismo repositorio y rama.

Consultar todos los medios no implica inventar una noticia por medio: una fuente puede devolver cero historias que pasen el filtro de cine. No se rellena su lugar con noticias de música, series o notas viejas del RSS abandonado. El filtro usa la descripción completa del feed antes de acortar el texto de la tarjeta.

X continúa operativo con su historial, control de duplicados, modo dry-run y horarios existentes. Una edición del home no manda mensajes ni agenda posts. El workflow generado por GitHub para Dependabot no es un actualizador del home ni un YAML propio; no se elimina como supuesto duplicado.

## Contrato de las skills y publicación

1. Una carga/auditoría no ejecuta ninguno de los tres generadores ni modifica los snapshots.
2. Antes de publicar la carga, hacer fetch/rebase de `origin/main` para conservar ediciones más recientes del bot; resolver cualquier conflicto sin reponer una copia vieja.
3. `npm run validate:content` incluye `validate:home-editions`: verifica fechas, cardinalidad, videos, fuentes, referencias y pósters de los snapshots. También rechaza un diff que combine películas y ediciones.
4. Para una actualización manual de estas secciones, invocar su workflow de forma separada. No mezclarla con altas de películas.
5. Las instrucciones modificadas de carga/auditoría se sincronizan desde `skills/` al plugin y a la instalación de Codex. El contrato detallado de carga ya no pide regenerar trailers.

## Validaciones y recuperación

```bash
npm run test:home-automation
npm run validate:home-editions
npm run check
npm run validate:content -- --astro-check
npm audit --omit=dev --audit-level=high
npx playwright test tests/e2e/cinema-news.spec.ts tests/e2e/upcoming-trailers.spec.ts tests/e2e/weekly-recommendations.spec.ts tests/e2e/home-carousels.spec.ts
```

CI verifica pósters locales con `npm run posters:check`, sin las antiguas opciones de timeout/concurrencia que ya no existían. Conserva audit de dependencias productivas, política de retratos, contenido, build y Chromium. `full_e2e` lanza Firefox, WebKit y ambas vistas móviles en jobs paralelos, sin repetir Chromium de escritorio; cada proyecto dispone de 45 minutos y conserva diagnósticos si falla. El antiguo job secuencial no alcanzaba a terminar dentro de sus 30 minutos. `full_content_audit` solicita auditoría de todo el catálogo. Las pruebas de filtros simulan el iframe externo de YouTube y mantienen todas las comprobaciones de resultados, paginación y URLs; la prueba extensa de Musical tiene un límite propio de 90 segundos. Las pruebas largas del simulador esperan el siguiente turno o resumen, en vez de una pausa fija menor que su transición. Las comprobaciones de ancho esperan que WebKit aplique el CSS y complete el primer layout; un overflow persistente sigue fallando.

Si falla un actualizador, revisar su log y el resumen de fuentes antes de reejecutarlo. La edición anterior permanece en `main`; nunca borrar snapshots para forzar una actualización ni cambiar un error por un éxito artificial. Después de corregir la causa, ejecutar manualmente el workflow correspondiente. Verificar el commit generado, el deploy exitoso y la sección pública. Si sólo falló Pages, repetir el deploy: no hace falta regenerar datos ni repetir X en modo publish.

Documentación primaria: [cron y eventos de GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [eventos creados por GITHUB_TOKEN](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).
