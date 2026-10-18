# Arquitectura y automatización del home

## Fuentes de verdad y responsabilidades

CinePosta es un sitio estático Astro 7. `src/data/movies/*.json` aporta películas, `people.json` y `personProfiles.ts` aportan personas, y `src/data/editorials/*.json` aporta notas. `src/lib/movies.ts`, `people.ts`, `editorial.ts`, los medidores y el motor de recomendaciones transforman esas fuentes. Las rutas Astro generan fichas, archivo editorial, personas, catálogo paginado, trailers, Comunidad, sitemap y el índice JSON de búsqueda. Los scripts del navegador manejan filtros/paginación, carruseles, players y juegos. Supabase atiende ratings y Comunidad en el navegador; sus SQL viven en `supabase/sql/`. Las credenciales administrativas no pertenecen al repo.

Las cargas con skills modifican películas, personas/assets y referencias derivadas; la validación de contenido comprueba esos datos, rutas, catálogo, originalidad y salida pública. Pósters y retratos conservan sus políticas locales. Cada reparación limita sus cambios al alcance solicitado.

Recomendadas y próximos estrenos leen snapshots versionados que las cargas de películas deben conservar. El Radar se calcula al construir el sitio desde todas las editoriales locales, con una ventana de 30 días calendario de Argentina y máximo seis notas.

| Sección | Snapshot | Generador | Lectura del home |
| --- | --- | --- | --- |
| Radar de Cine | `src/data/editorials/*.json` | Cada build y reconstrucción diaria | `getCinemaNews()` selecciona las seis notas más recientes de los últimos 30 días, sin red |
| Recomendadas | `src/data/weeklyRecommendations.generated.ts` | `npm run refresh:weekly-recommendations` | Usa `WEEKLY_RECOMMENDATION_CARDS`, con título, póster, plataforma y score congelados |
| Próximos estrenos | `src/data/upcomingReleases.generated.ts` | `npm run update-upcoming-releases` | Usa la edición generada, sin añadir películas del catálogo ni filtrar por fecha en cada build |

Próximos estrenos renueva su edición todos los días a la 01:00 de Argentina. El generador toma sólo fechas posteriores al día de ejecución en Argentina: los estrenos de hoy dejan de ser próximos al publicarse esa edición. Las cargas y los builds siguen leyendo el snapshot, sin retirarle videos ni sustituirlos por su cuenta. El autoplay, mute, selección y navegación siguen en `src/scripts/upcoming-suggestions.ts`; Actions actualiza el contenido, no reproduce videos. La selección puede repetirse si las fuentes no ofrecen nuevos estrenos o trailers; entre medianoche y la publicación diaria puede seguir visible la edición anterior.

## Workflows conservados

Todos los horarios son de Argentina, UTC-3. Los cron están escritos en UTC y no dependen del reloj de la computadora. GitHub puede demorar o excepcionalmente perder una ejecución programada; la hora es la de disparo solicitada, no una garantía de publicación al minuto. La validación y el deploy agregan tiempo.

| Archivo | Nombre visible | Disparador |
| --- | --- | --- |
| `refresh-cinema-news.yml` | Radar de Cine diario (10:00 AR) | `0 13 * * *`, o manual |
| `refresh-weekly-recommendations.yml` | Recomendadas semanales (domingo 01:00 AR) | `0 4 * * 0`, o manual |
| `refresh-upcoming-releases.yml` | Proximos estrenos diarios (01:00 AR) | `0 4 * * *`, o manual |
| `deploy.yml` | Publicar CinePosta en GitHub Pages | Push a `main`, manual o `workflow_run` exitoso de cualquiera de los tres workflows |
| `validate.yml` | Validar sitio: contenido, seguridad y navegadores | PR, lunes `30 5 * * 1`, o manual |
| `publish-buffer-x.yml` | Publicar pelicula diaria en X (19:00 AR via Buffer) | `30 21 * * *`, o manual; activado por `BUFFER_X_AUTOPUBLISH_ENABLED` |

`refresh-upcoming-releases.yml` es independiente del semanal para que una fecha que llega un jueves no permanezca hasta el domingo como próximo estreno. El deploy sigue sin cron propio: cada workflow exitoso lo dispara mediante `workflow_run`. Los nombres de ese disparador coinciden exactamente con los tres actualizadores. Los registros históricos de Actions pueden conservar los nombres de la edición semanal combinada.

El semanal genera las seis recomendaciones, valida y publica exclusivamente `weeklyRecommendations.generated.ts`. El diario de próximos estrenos consulta las fichas argentinas, valida y publica exclusivamente `upcomingReleases.generated.ts`. Un fallo de trailers conserva su edición anterior y no bloquea las recomendadas; lo mismo ocurre a la inversa. Repetir una generación de recomendadas en la misma semana conserva la selección si no cambió el catálogo. No se hace una segunda selección al publicar. Las pruebas del publicador simulan una carga concurrente, verifican que el rebase la conserve y rechazan cambios fuera del snapshot autorizado, incluida otra edición.

Radar usa exclusivamente publicaciones propias de cualquier tipo (nota, editorial, especial u opinión), sin exigir `featured`. Ordena fecha descendente con slug como desempate; toma hoy y los 29 días anteriores según Argentina, excluye notas futuras, deduplica por slug y limita a seis. Muestra la portada local y abre la nota en la misma pestaña. El archivo `/editorial/` sigue ofreciendo todas las publicaciones. Si no hay notas recientes, se omite la sección.

Cada publicación incorpora las notas nuevas en el mismo deploy. `refresh-cinema-news.yml` conserva el cron de las 10:00 AR, valida y construye sin escribir snapshots ni hacer commits; su éxito activa Pages mediante el `workflow_run` existente. Así caducan las notas aunque ese día no se publique ninguna. No se consultan RSS ni páginas de diarios. Como todo el sitio es estático, el corte se aplica en cada build y se refleja al terminar el deploy; una ejecución demorada conserva temporalmente la selección del último build.

Próximos estrenos toma títulos y fechas de Cines Argentinos, siempre Argentina. El video procede del endpoint de Videos de la **misma ficha** (`/pelicula/<id>/trailer`). YouTube oEmbed confirma que admite inserción; ante 401/403/404 se prueba el siguiente video de esa misma ficha, sin sustituirlo por un título distinto. El log registra título y canal como evidencia. La miniatura procede de YouTube. No se infiere disponibilidad por estudio ni se selecciona el primer resultado de una búsqueda global. Las fichas sin video insertable se omiten y se reportan; se requieren al menos cinco para reemplazar la edición. No se copia una sinopsis remota: el home conserva su descripción de fecha. Se quitó la dependencia de búsquedas HTML en TMDB que devolvían HTTP 403.

Los jobs que escriben ediciones comparten `publish-home-editions` con `cancel-in-progress: false`. El publicador permite sólo los archivos propios del actualizador, realiza commit, fetch, rebase y push, conservando cargas que hayan llegado a `main` mientras consultaba las fuentes. Un conflicto falla visiblemente y no descarta trabajo. El push con `GITHUB_TOKEN` no dispara otro workflow por `push`: `workflow_run` es el enlace explícito al deploy. Este hace checkout de `main` actualizado y acepta sólo actualizadores exitosos de este mismo repositorio y rama.


X continúa operativo con su historial, control de duplicados, modo dry-run y horarios existentes. Una edición del home no manda mensajes ni agenda posts. El workflow generado por GitHub para Dependabot no es un actualizador del home ni un YAML propio; no se elimina como supuesto duplicado.

## Contrato de las skills y publicación

1. Una carga/auditoría no ejecuta los generadores de recomendadas/trailers ni modifica sus snapshots. El Radar local se selecciona durante el build.
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

Si falla un actualizador, revisar su log y el resumen de fuentes antes de reejecutarlo. La edición anterior permanece en `main`; nunca borrar snapshots para forzar una actualización ni cambiar un error por un éxito artificial. Después de corregir la causa, ejecutar manualmente el workflow correspondiente. Verificar el commit generado, el deploy exitoso y la sección pública. Si sólo falló Pages, repetir el deploy: no hace falta regenerar snapshots ni repetir X en modo publish.

El archivo `/catalogo/` también tiene páginas acotadas de 48 tarjetas. Sus tarjetas conservan el layout completo, como las 36 del buscador del home: `content-visibility: auto` cambiaba las alturas estimadas al desplazarse y podía mover los enlaces de paginación durante un clic en WebKit. La prueba conserva navegación real por clic y JavaScript desactivado. La prueba móvil espera y vuelve a medir las seis secciones, evitando evaluar un estado anterior al primer layout.

`tsconfig.json` excluye los reportes y trazas generados (`test-results/`, `playwright-report/` y `.tmp/`) para que una nueva validación local revise el código del proyecto sin analizar los bundles del visor de Playwright.

Documentación primaria: [cron y eventos de GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [eventos creados por GITHUB_TOKEN](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).
