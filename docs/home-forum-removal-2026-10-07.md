# Retiro del bloque de Foro Cineposta del home

Branch: `redesign/home-promos-agenda-2026-10-07`.

Se retiró el bloque promocional de Foro Cineposta del home y el acceso
`#comunidad-home` del menú móvil. El menú reparte sus tres accesos restantes
en tres columnas. La agenda de 2027 queda después del simulador.

Se eliminaron las reglas específicas del bloque en los estilos globales,
móviles y del home, junto con sus frases aleatorias y la carga de ese script
en la portada. El script conserva las frases usadas por la página del foro.
La ruta de comunidad y las funciones del foro permanecen disponibles.

Se ajustaron las pruebas existentes para comprobar la ausencia del bloque,
los accesos móviles vigentes y el orden simulador → agenda → footer.

## Validación

- `npm run check`: 0 errores, 0 warnings, 0 hints.
- `npm run build`: 7.540 páginas, aprobado.
- Playwright: 30 pruebas aprobadas y 9 omisiones esperadas, sin fallos, en
  escritorio Chromium, móvil Chromium y móvil WebKit. Incluye el home del
  simulador, la agenda y las pruebas de navegación y contención móvil.
- Capturas locales: `test-results/home-forum-removal-review/desktop.png`
  y `mobile.png`.
