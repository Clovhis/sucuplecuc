# Marquesina de incorporaciones al catálogo

- Barra de 36 px sobre el buscador, con movimiento continuo, títulos enlazados y únicamente los logos de las plataformas registradas en cada ficha. Nombres conservados para lectores de pantalla y tooltip. Cine usa un ticket; plataformas sin marca disponible usan un símbolo neutro.
- Muestra las 12 incorporaciones más recientes, sin depender del año de la película, la fecha de estreno ni la fecha de reseña. Excluye fechas futuras según el día de Argentina.
- `catalogAddedAt` conserva la fecha real de alta. `new-movie` la asigna automáticamente; AGENTS.md documenta su conservación en posteriores ediciones. Las fichas históricas sin fecha verificada quedan fuera.
- Se recuperaron las fechas de las últimas dos cargas a partir de los commits de alta: `775788cd3a44951d1deb2f6d0e1897b21532ebac` (23/10/2026, cinco películas) y `c1e02e3392e87cb89c950d2d57f210d22a5ec8ec` (22/10/2026, ocho películas). Verificación JSON contra HEAD: únicamente se agregó esta fecha en las 13 fichas.
- Pausa manual, pausa con mouse, recorrido estático al enfocar un enlace y respeto por movimiento reducido. Sin JavaScript queda una lista horizontal navegable. Los duplicados visuales quedan fuera del acceso por teclado y de los lectores de pantalla.
- Se preservan las ediciones generadas de recomendadas y trailers.

## Validación

- `npm run check`: cero errores, advertencias e indicaciones.
- `npm run test:catalog-additions`: aprobado; cubre incorporación de una película antigua, separación de fechas, límite, fechas futuras y cambio de día UTC/Argentina.
- `npm run validate:content -- --skip-build`: aprobado.
- `node --check scripts/new-movie.mjs`: aprobado.
- Revisión visual DEV aprobada por el usuario en desktop/mobile. Por su pedido no se repite Playwright. Una corrida iniciada antes de esa indicación aprobó desktop y movimiento en Android; detectó un ajuste de desplazamiento del foco en Android, corregido al calcular una sola alineación. WebKit sobre DEV no inicializó el componente. Esa corrida parcial no se presenta como validación completa.
- La publicación ejecuta además el build y las validaciones del hook pre-push obligatorio.
