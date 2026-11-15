# CineCríptico: revisión de publicación

Fecha de trabajo: 14/11/2026 (Argentina). Publicación a `main` autorizada después de las pruebas en DEV. Este reporte registra el alcance y las verificaciones locales; no certifica el final del deploy de Pages.

Actualización del 15/11/2026: la cobertura parcial documentada abajo es histórica. Se completó y verificó el calendario de 413 fechas; ver [reporte de ampliación](cinecriptico-calendar-2026-11-15.md).

## Alcance

Juego diario integrado a Home, hub y sitemap; ilustración original con gafas 3D de CinePosta y manos corregidas; versión horizontal para tarjetas. Tipografía, botones y colores alineados con los otros juegos. La explicación enlaza sólo la ficha interna; compartir tiene controles separados y no revela la palabra.

Backend privado en Supabase, fecha argentina del servidor, una partida por dueño/día, seis errores, tres ayudas, score atómico, revisión de estado y UUID idempotente. Se conserva la sesión anónima de la trivia con nicks independientes por juego. No se modificaron las funciones ni los registros de los otros juegos. Los seeds y las soluciones permanecen fuera de Git y del build.

**Calendario parcial: 14/413 fechas cargadas, del 14 al 27 de noviembre de 2026; faltan 399.** Las 14 construcciones pasaron el auditor mecánico y la revisión del autor. Dificultad estimada, sin calibración ciega independiente. El auditor `--require-complete` falla correctamente por esa cobertura pendiente. Una fecha sin acertijo muestra indisponibilidad y no inicia una partida.

## Correcciones de la segunda revisión

- Pérdida, cambio o borrado de sesión: se vacían estado privado y jugador visibles, se bloquean acciones y se descartan respuestas de solicitudes de la identidad anterior. Reconectar conserva el dueño si la sesión es válida; crear otra identidad requiere una acción explícita.
- Una sesión anónima borrada no puede recuperarse escribiendo el nick. Sus resultados siguen en Supabase; esta limitación se informa sin permitir apropiarse del apodo.
- La expiración normal del token se renueva sin reemplazar el jugador.
- Un fallo del dashboard tiene su propio aviso y no presenta una jugada aceptada como perdida.
- Una respuesta ingresada por teclado mientras hay una actualización en curso espera el estado final y se envía una sola vez; si cambió la identidad o el día, no se atribuye a la nueva partida.
- Los datos locales pendientes se validan antes de usarse; un registro corrupto no bloquea el juego. Una recarga reconcilia una ayuda ya guardada cuya respuesta se perdió, sin gastar otra ayuda.
- La fecha del servidor se vuelve a comprobar después del bloqueo del dueño; se probó un avance de día durante esa espera para impedir que una petición tardía modifique la partida del día anterior.
- Astro actualizado a 7.4.12, con lockfile actualizado y cero vulnerabilidades en `npm audit --omit=dev --audit-level=moderate`. Referencias de las correcciones: [nombres de etiquetas dinámicas](https://github.com/advisories/GHSA-mh32-jxcr-mh9f), [validación de rutas del servicio de imágenes](https://github.com/advisories/GHSA-r3h5-4585-7x3w).

## Verificación final

- `npm run check`: cero errores y advertencias; tres hints preexistentes en scripts ajenos a este cambio.
- Instalación limpia `npm ci`: aprobada. Validación del lockfile con npm 10.9.4 y destino Linux (`npm ci --dry-run --os=linux --cpu=x64 --libc=glibc`): aprobada.
- `npm run build`: 8.916 páginas generadas con Astro 7.4.12.
- `npm run test:cinecriptico`: tres casos aprobados, incluyendo PostgreSQL embebido con roles reales, migración que conserva partidas, privacidad, nicks por juego, replay, rate limit, score, intentos, ayudas, derrota, rachas y límites exactos de medianoche/año en Argentina.
- `npm run test:trivia`: 13 casos aprobados y auditoría del banco de trivia sin fallos.
- Playwright de CineCríptico sobre el build final: **55 aprobadas**, en escritorio Chromium/Firefox/WebKit y móvil Chromium/WebKit. Incluyen teclado, perfil, recargas, sesión perdida, token vencido, red, respuestas tardías, metadata de ranking, enlaces internos, compartir sin spoilers ni superposición a 320/390/768/1440 px, y cambio de día.
- Regresión de trivia y simulador: **32 aprobadas y dos omitidas por la suite existente**, en Chromium de escritorio y móvil.
- `posters:check`, `validate:sitemap-indexability` y `validate:public-output`: aprobados.
- Auditor privado: sin pistas, explicaciones o ayudas del banco en los archivos de texto de fuentes, herramientas, documentación, reportes y salida pública revisados.
- Verificación directa de Supabase: RLS en las cuatro tablas privadas, sin permisos de acceso para el navegador, sin ejecución de RPC por el rol `anon`, `search_path` vacío y cero partidas con perfil/dueño inválido. Las pruebas reales previas de score y reserva entre juegos se revirtieron; no dejaron datos de QA.
- CI incorpora `test:cinecriptico` junto con la validación de los juegos existentes.

## Límites conocidos

No hay protección infalible contra IA, soluciones compartidas o identidades múltiples. Las marcas de velocidad son informativas y no penalizan automáticamente. El ranking global se agrega al consultarlo; si el volumen crece, conviene cachearlo.

DEV y producción no comparten almacenamiento de sesión. Un nick creado en DEV queda ligado a esa identidad; escribirlo desde la web pública no transfiere su propiedad. No se reasignan cuentas automáticamente por coincidencia de apodo.

El SDK compartido de Supabase puede emitir avisos de contención de Web Locks en Firefox; las pruebas funcionales de autenticación y persistencia pasan y ese aviso específico queda anotado. No se ocultan otros errores.

El endpoint MCP de advisors devolvió un error interno en esta revisión; los permisos y metadatos del esquema propio se verificaron directamente mediante SQL. No se declara al proyecto completo libre de avisos de configuración. La inspección anterior del proyecto contenía advertencias ajenas a este juego, que no se modificaron.

## Corrección de instalación en CI

El [primer run de Pages](https://github.com/Clovhis/sucuplecuc/actions/runs/43662132928) falló en `npm ci`, antes del build: el lockfile producido con npm 11 en Windows omitía las entradas de `@emnapi/core` y `@emnapi/runtime` 2.0.0-beta.2 usadas por el fallback WASI de Rolldown. Se regeneró en una carpeta aislada con npm 10, conservando todas las versiones ya fijadas y agregando esas dos entradas. Luego pasaron la validación de instalación para Linux y una instalación limpia real en el checkout. No cambió el código del juego ni las versiones de sus dependencias activas con esta reparación.
