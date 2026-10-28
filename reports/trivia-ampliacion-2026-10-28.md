# Trivia: idioma, variedad, lectura y copia — 28/10/2026

## Alcance y diagnóstico

Rama de trabajo: `fix/trivia-espanol-variedad-2026-10-28`. Revisión del generador, banco privado activo, selección de partidas, frontend, estilos, identidad, ranking, SQL, puntuación, pistas y navegación. El banco de producción tenía 2658 preguntas y 1577 películas como respuestas. Se confirmó una pregunta narrativa de Justice League con consigna y explicación en inglés. Las otras coincidencias de inglés eran títulos originales o nombres propios; no se tradujeron nombres arbitrariamente.

La mayoría de las consignas repetía el esquema de sinopsis, pareja de actores o actor/director. El banco público entrega sólo versión y cantidad; las preguntas y soluciones se administran en Supabase. Por eso publicar archivos del sitio sin sincronizar el banco no resuelve el contenido que juegan los visitantes.

## Resultado del banco

- 3192 preguntas aceptadas: 534 más que el banco publicado (+20,1%).
- 1624 películas distintas como respuestas: 47 incorporaciones al repertorio anterior.
- 116 preguntas argentinas, con alternativas del mismo contexto argentino. Las restantes son internacionales.
- Estilos: 857 historias, 260 preguntas con afiches, 784 duplas, 746 de dirección, 484 parejas adicionales del reparto, 17 lugares, 12 conflictos, 10 de tres pistas, 6 de objetos, 15 de premios y 1 de postcréditos.
- Se escribieron 66 consignas específicas nuevas; 45 superan los filtros de alternativas y se incorporan. Las demás permanecen fuera del banco hasta que haya distractores adecuados.
- Se mantienen tres opciones, una respuesta válida, las restricciones de género/medio/país/contexto, el control de codirecciones y la cuarentena anterior. La selección prioriza estilos narrativos menos usados dentro de la partida. No se agregaron películas ni se cambiaron categorías, scores o ediciones automáticas.

Justice League tiene una consigna propia en español. La explicación narrativa usa la pista revisada, no la sinopsis completa sin filtrar. La detección preventiva de prosa inglesa se ejecuta al generar y auditar; reconoce conjuntos de palabras funcionales y permite nombres y títulos. No pretende sustituir una revisión lingüística universal.

Los afiches son los WebP locales ya vinculados a las tres películas de cada pregunta. Los títulos permanecen visibles y accesibles aunque falle una imagen. Se mantiene la proporción 2:3, el uso de teclas 1/2/3 y el descarte de opciones por pistas.

## 25 segundos y compatibilidad

Las partidas nuevas disponen de 25 segundos por pregunta. La duración queda registrada en la partida por el servidor y se devuelve al cliente. La migración incremental `supabase/sql/trivia_25_seconds.sql` conserva las partidas existentes con 20 segundos; sus snapshots, respuestas, deadlines y puntajes no se reescriben.

La rapidez se normaliza a 200 puntos: `1000 + floor(restantes_ms / (duracion_segundos * 5))`. Una respuesta inmediata vale hasta 1200 en ambas modalidades; se mantienen el máximo de 24.750 y los récords anteriores. El vencimiento, la corrección y el bonus se calculan en PostgreSQL. Se actualizaron reloj, textos de presentación, metadatos y tarjeta del hub.

La prueba de migración simula una base sin la columna nueva, ejecuta la actualización dos veces, compara todos los snapshots y puntajes y comprueba los dos relojes y ambas fórmulas. Las tres funciones de la migración deben coincidir exactamente con las del instalador canónico.

## Medidas contra copiar y pegar

Durante la pregunta activa se bloquean selección, copiar/cortar, arrastre y menú contextual dentro del panel. La copia de una selección que atraviese el panel también se bloquea. La restricción se retira al responder; formularios, resumen y ranking siguen siendo utilizables. El foco sin selección no dispara el bloqueo de copia fuera del panel.

No se oculta texto a lectores de pantalla ni se interceptan todas las teclas del navegador. No se pausa o reinicia el reloj al cambiar de pestaña. La protección es una traba al copiar y pegar, no una garantía frente a capturas, OCR, herramientas de desarrollo o un segundo dispositivo. La defensa del ranking continúa siendo el estado privado, el plazo y la corrección del servidor, los IDs opacos y las respuestas futuras ocultas.

## Validación y publicación

La suite de lógica/SQL cubre todo el banco, alternativas, español, consignas nuevas, selección, fechas límite, identidad, pistas, puntajes, privacidad y migración repetible. La suite de navegador agrega partida de 20 preguntas hasta el resumen, error/acierto, afiches, teclado, hints, reloj anterior, vencimiento a los 25 segundos y copia limitada. El ranking conserva sus pruebas de edad, banderas y layout.

Las pruebas de navegador simulan las RPC y no escriben puntajes públicos. El helper de HTTP local reproduce la omisión de `upgrade-insecure-requests` que ya realiza `preview-e2e.mjs`, para poder revisar DEV con WebKit; la política CSP de producción no se modifica.

La publicación requiere `npm run check`, `npm run test:trivia`, la suite Playwright pertinente, build completo y los controles de contenido/salida pública/sitemap. El pre-push ejecuta `validate:content` y vuelve a construir la versión final. Se aplica la migración incremental y se sincroniza el banco privado con el script administrativo existente. El smoke JWT crea identidades temporales identificadas y elimina sólo sus datos, sin completar partidas ni publicar puntajes de prueba. La comprobación final incluye Pages, ruta pública, banco publicado, duración del servidor y sincronización de Git.

Las partidas ya empezadas conservan sus preguntas anteriores. Para ver las nuevas consignas y formatos hay que iniciar otra ronda.

### Resultados verificados antes del push

- `npm run test:trivia`: 13/13 pruebas y auditoría exhaustiva de las 3192 preguntas, sin fallos.
- `npm run check`: 330 archivos, cero errores, advertencias o hints.
- Playwright: 25/25 pruebas aprobadas en Chromium, Firefox, WebKit y perfiles móviles Chromium/WebKit. Capturas revisadas de los afiches.
- Build completo: 8088 páginas. Salida pública e indexación: controles aprobados, 5672 páginas canónicas.
- Migración aplicada al servidor: se conservaron los 36 jugadores, 31 récords y 67 partidas previas; estas últimas conservan 20 segundos. El valor por defecto para partidas nuevas es 25.

El build anterior al cierre de las últimas correcciones fue verificado; el hook pre-push reconstruye el árbol final y vuelve a validar salida e indexación antes de enviar `main`.

Banco privado sincronizado y comprobado: 3192 preguntas activas, 1624 películas como respuestas, 260 consignas con afiches y cero ocurrencias de la antigua consigna inglesa. La serialización administrativa conserva el indicador de afiches y tiene una prueba de regresión propia.

Smoke con JWT reales aprobado: reloj inicial y siguiente de 25 segundos, indicador de afiches recibido por la RPC, tres pósters locales, apodo único, aislamiento de propietarios, soluciones ocultas, pistas del servidor, reintento idempotente y endpoint de score falso denegado. Las identidades temporales se eliminaron sin publicar puntajes de prueba.
