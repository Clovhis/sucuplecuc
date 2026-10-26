# Trivia: revisión para publicación, 26 de octubre de 2026

Revisión aprobada del minijuego `/juegos/trivia/`, integrado al home junto al simulador. Base actualizada sobre el commit del bot `ea489757` antes de validar; las ediciones generadas se conservaron.

## Mobile y desktop

Se recorrió una partida completa con Edge aislado, CDP nativo y dos usuarios temporales reales de Supabase. Se verificaron 42 estados/tamaños:

| Ancho | Alto de viewport | Uso |
| --- | --- | --- |
| 320 | 740 | teléfono angosto |
| 390 | 844 | teléfono |
| 600 | 900 | teléfono/tablet |
| 768 | 1024 | tablet vertical |
| 1024 | 900 | tablet/desktop |
| 1440 | 1000 | desktop |
| 844 | 390 | móvil horizontal |

Resultado: cero desbordes horizontales, cero excepciones JavaScript y cero controles por debajo del tamaño mínimo en teléfonos/tablets. Campos de 16 px, blancos de toque de al menos 44 px y retratos de 72 × 72 px. Se inspeccionaron las capturas, incluidas las preguntas con dos personas.

Se corrigió la altura explícita que estiraba el póster móvil: ahora conserva 2:3 (88 × 132 px en teléfono y 180 × 270 px en desktop). Se ampliaron zonas de toque de enlaces y detalles, preservando la presentación desktop aprobada.

La partida recorrió: filtro de insultos al escribir, nickname ocupado, perfil obligatorio, pista, acierto, error, desconexión, reconexión sin reiniciar el plazo, recarga con tiempo vencido, las 20 preguntas, bonus por pistas, resumen, acceso a las 20 fichas y repetición con el mismo jugador. Las identidades temporales y todos sus datos se eliminaron al terminar; se verificó su ausencia.

Es emulación Chromium/Edge con eventos táctiles, no una afirmación de prueba física en iPhone/Safari. No se utilizó Playwright, por indicación del usuario. El script reproducible es `scripts/review-trivia-ui.mjs`; sus capturas y JSON se generan bajo `test-results/` y no se versionan.

## Controles de publicación

- Instalación limpia con `npm ci`, y `npm audit` sin vulnerabilidades reportadas.
- Ocho pruebas de trivia aprobadas, incluyendo PostgreSQL/PGlite, propiedad del nickname, aislamiento de jugadores, reloj, pistas, score, datos privados, reintentos y récord que no se sobrescribe con una partida peor.
- Pruebas de migraciones de votos y tribuna aprobadas.
- `validate:content --astro-check` aprobado: catálogos, auditoría de contenido, tipos, build de 8055 páginas, originalidad de 759 perfiles, salida pública y 5648 páginas canónicas en sitemap.
- Ruta incorporada al sitemap y pruebas de trivia agregadas al workflow de validación.
- El banco público sólo expone versión y cantidad; las 9139 preguntas y soluciones usadas para jugar están en tablas privadas de Supabase.

La revisión detectó alertas en dependencias indirectas. Se aplicaron únicamente actualizaciones compatibles del lockfile: `undici` 8.11.2 → 8.12.3, `zod` 4.6.5 → 4.6.7 y `fast-uri` 3.1.8 → 3.1.9. Astro permanece en 7.3.5. Referencias: [advisory de undici](https://github.com/advisories/GHSA-4qv8-2p9j-2685), [advisory de Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). La instalación limpia y el build completo se ejecutaron con esas versiones.

La salida a producción se comprueba con el SHA exacto del workflow de Pages y con la ruta pública, assets, metadata del banco, enlace del home y sitemap. El hook `pre-push` obligatorio vuelve a ejecutar `validate:content`; no se omite.
