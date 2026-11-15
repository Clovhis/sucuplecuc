# Retiro de Comunidad y foro

Trabajo del 15/11/2026 en `feat/retirar-comunidad-orden-ficha`. La branch retira el foro completo: sala principal, discusiones por película, comentarios, respuestas, apodos, spoilers y reacciones a mensajes. Se eliminan sus enlaces, imagen, scripts, estilos, entradas del sitemap y variables de build. Las URLs anteriores conservan exclusivamente una redirección sin foro ni conexión a Supabase. Las referencias históricas en reportes de tareas anteriores conservan su valor documental.

Las fichas muestran primero «De qué va», después «La posta» y el medidor que corresponda (Explosiómetro, Lagrimómetro, Jajámetro, Cagazómetro o Sangrómetro). Al final de esa lectura, «El equipo dice» → «¿La miro?» → «Qué dice la gente». Los votos de películas siguen funcionando.

## URLs históricas y Search Console

Verificación por API el 15/11/2026, datos finales consultados del 18/10 al 14/11: 599 URLs de Comunidad con 3.322 impresiones y 39 clics. La portada y la discusión de La apuesta más alta figuran enviadas e indexadas. Por eso se conservan sólo alias de navegación: `/comunidad/` lleva a `/catalogo/` y cada `/comunidad/peliculas/<slug>/` lleva directamente a su ficha canónica, incluidos los dos alias históricos de películas. Las 598 discusiones con impresiones tienen una película o alias de destino vigente.

GitHub Pages sirve archivos estáticos: se usa el mismo patrón existente de meta refresh inmediato, canonical al destino y enlace HTML accesible. No se afirma que sean respuestas HTTP 301. Ninguna URL antigua vuelve al sitemap ni a la navegación del sitio. Los alias no cargan JavaScript, estilos ni el cliente de Supabase.

## Supabase compartido: retiro preparado, todavía sin aplicar

Inspección de lectura del proyecto `bftcrexcwktyiqsermni`: cuatro tablas exclusivas (`community_threads`, `community_messages`, `community_identities`, `community_message_votes`), ocho RPC desplegadas y dos cron exclusivos. En el momento de la inspección las cuatro tablas estaban vacías. No se encontraron claves foráneas desde otras tablas del producto hacia esas tablas. No hay buckets ni Edge Functions del foro: los existentes corresponden a redes sociales.

El SQL está en [`../supabase/migrations/20261115132413_retire_community.sql`](../supabase/migrations/20261115132413_retire_community.sql). Está preparado para aplicarse tras desplegar el sitio sin foro. Aplicarlo mientras producción conserva la versión anterior dejaría rotas sus discusiones. No ejecutar `db push` a ciegas: el repositorio conserva instalaciones SQL manuales y esta carpeta no representa todo el historial remoto.

Orden de publicación autorizado:

1. Publicar la versión del sitio que retira Comunidad.
2. Aplicar este único SQL en el proyecto comprobado mediante una migración remota con nombre `retire_community`. Elimina definitivamente los datos del foro que existan al ejecutarlo; respaldarlos antes si se desea conservarlos.
3. Confirmar que no queden tablas, funciones, enum ni cron del foro y comprobar las RPC de votos y juegos.
4. La publicación retira la variable de GitHub `PUBLIC_COMMUNITY_ENABLED`, cuya existencia se confirmó. No se encontraron `PUBLIC_TURNSTILE_SITE_KEY` ni secretos de GitHub con nombres COMMUNITY/TURNSTILE. Los nombres anteriores ya no se consumen en el workflow. Cualquier otro recurso de Turnstile requiere comprobar antes que sea exclusivo del foro.

El retiro usa una transacción y `RESTRICT`, sin `CASCADE`: una dependencia desconocida revierte también la eliminación de los cron. Se puede reejecutar. No borra usuarios ni sesiones de `auth`, no deshabilita autenticación anónima, no toca el proyecto, las claves públicas, Storage, Edge Functions ni la extensión cron. La trivia y CineCríptico necesitan autenticación anónima; votos, simulador y redes también usan Supabase. Los apodos del foro desaparecen con su tabla exclusiva.

Documentación consultada: [Supabase Cron](https://supabase.com/docs/guides/cron) y [eliminación de tablas y dependencias en PostgreSQL](https://www.postgresql.org/docs/17/sql-droptable.html).

## Verificación local

`node --test scripts/retire-community.test.mjs` prueba el SQL contra PostgreSQL embebido: eliminación completa del foro, cron ajenos conservados, votos y datos de juegos/redes/auth intactos, reejecución, base sin cron y reversión ante dependencias ajenas. Playwright comprueba ausencia de accesos y rutas del foro, sitemap y orden real de lectura y ubicación de los cinco medidores en escritorio y móvil. Las pruebas existentes de votos, navegación, fichas y juegos cubren las funciones compartidas.

Resultados:

- `npm run check`: cero errores, cero warnings; tres hints anteriores en scripts de publicación semanal sin cambios relacionados con esta tarea.
- Build de publicación: 8.916 archivos/páginas generados, incluidos los alias históricos; sin nuevas páginas canónicas. Se comprobaron los 599 alias presentes en los datos de GSC: todos generan una redirección sin scripts del foro. Validaciones de salida pública y sitemap aprobadas: 3.576 páginas canónicas.
- `npm run validate:content -- --skip-build`: aprobado; el build se ejecutó por separado, en serie.
- SQL de retiro: tres pruebas aprobadas. `npm run test:movie-ratings`: aprobado, incluidos votos históricos y nuevos, límites, permisos y alias.
- Primera pasada amplia de Playwright: 256 aprobadas, 11 omitidas por las condiciones propias de las pruebas y tres fallos del observador `pageerror` en Firefox por contención manejada del SDK. Se reemplazó ese observador en las tres pruebas por el helper existente `captureUnhandledErrors`; su prueba distingue errores reales de rechazos manejados, sin filtrar mensajes por texto. Pasada final: **55/55 aprobadas** en Chromium, Firefox, WebKit y los dos perfiles móviles. Incluye las tres pruebas corregidas, partidas completas del simulador, votos, ranking de trivia, las fichas y la ubicación de los cinco medidores.
- `npm run test:weekly-release`: 19 aprobadas y cinco fallos previos de compatibilidad Windows (`ERR_UNSUPPORTED_ESM_URL_SCHEME` al cargar `NODE_OPTIONS=--import=C:\...`). Se reprodujo el mismo error con el CLI y la prueba originales de `HEAD`, sin el cambio de esta branch. No se modificó ese mecanismo.
- Pasada de publicación tras agregar redirecciones: **121 aprobadas, cuatro omitidas por condiciones de navegador y cero fallos** en los cinco perfiles (fichas, medidores, votos, redirecciones, navegación, footer y home).
- Las cuatro fuentes modificadas de las skills de carga/auditoría coinciden por SHA-256 entre repositorio, plugin e instalación local.

No se editaron películas, personas, puntajes ni snapshots de Recomendadas o Próximos estrenos. El usuario autorizó la publicación en main el 15/11/2026. El retiro de Supabase remoto queda pendiente hasta que se publique el sitio, para conservar el servicio durante el despliegue; el cierre de GitHub se realiza al iniciar el build de Pages, según la política del repositorio.
