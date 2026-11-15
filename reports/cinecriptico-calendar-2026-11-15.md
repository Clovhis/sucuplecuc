# CineCríptico: calendario 2026–2027

Fecha: 15/11/2026, Argentina.

## Cobertura cargada

Supabase confirmó 413 filas, 413 fechas y 413 respuestas distintas después de aplicar la misma normalización del servidor. Primera fecha: 14/11/2026. Última: 31/12/2027. La comparación contra una serie diaria devuelve cero fechas faltantes; ninguna entrada carece de revisión, explicación, referencia o sus tres ayudas.

Se agregaron 399 entradas mediante 50 transacciones administrativas. Cada transacción comparó los doce campos persistidos con el banco privado: fecha, pista, respuesta, longitud, ayudas, explicación, referencia, URL, ficha interna, dificultad, prueba y fecha de revisión. La carga no reemplazó fechas existentes.

Las huellas de las siete partidas existentes y de los catorce desafíos anteriores resultaron idénticas antes y después. No se modificaron perfiles, rankings, partidas ni datos de la trivia o del simulador.

## Revisión del contenido

Las 413 construcciones pasaron el auditor de fechas, unicidad y álgebra de letras, y revisión editorial del autor de sus indicadores, alcance y conexión cinematográfica. La ampliación incluye anagramas combinados con extracciones y sustituciones, charadas, inversiones, palabras ocultas e inserciones. Las nuevas fechas se intercalaron de forma determinista para evitar meses separados por categoría o franquicia. Hay 376 enlaces a fichas internas; cuando no existe ficha, se conserva el contexto educativo sin enlace saliente.

Se corrigieron asociaciones ambiguas de nombres de personajes con otras películas y se sustituyeron construcciones defectuosas. Las referencias se apoyan en el catálogo existente y fuentes primarias culturales o educativas conservadas en el banco privado. Las ayudas guían la construcción sin escribir literalmente la solución; la explicación final sí desarrolla el resultado completo.

La dificultad 8 es una **estimación editorial**, no una medición experimental. No se realizó una prueba ciega independiente con otro modelo ni calibración con jugadores. La auditoría automática demuestra consistencia estructural y exactitud de letras, no demuestra por sí sola dificultad 8–9 ni imposibilidad de resolver con IA.

## Privacidad y mantenimiento

El banco, fuentes de autoría, SQL y recibos por lote permanecen fuera del repositorio, en el directorio privado del usuario. El recibo registra huellas por lote y las verificaciones sin publicarlas en artifacts. No se incorporaron soluciones ni seeds al build.

La comprobación de permisos confirmó que `anon` y `authenticated` carecen de USAGE del esquema y SELECT sobre las soluciones; RLS sigue habilitado en todas las tablas privadas. No se cambió el contrato de RPC, la fecha autoritativa del servidor ni el cálculo de puntaje.

Para ampliar a otro período, el auditor permite configurar `start/end`; conservar la fuente privada, revisión editorial y comprobación posterior a cada importación. No reemplazar silenciosamente un desafío ya jugado.

## Validaciones

- Auditor privado con `--require-complete`: 413 entradas, cero huecos, cero errores.
- Comparación de todos los campos importados: 399 coincidencias en 50 transacciones.
- Pruebas Node de CineCríptico: cuatro aprobadas, incluidas permisos, score, replay, límites, rachas, medianoche y rechazo de ayudas que divulgan la respuesta.
- `npm run check`: cero errores y advertencias; tres hints preexistentes en scripts semanales ajenos al cambio.
- Control de filtraciones: texto privado ausente de los 21.255 archivos de código, contenido público y build revisados.
- Verificación adicional con búsqueda literal nativa de las huellas privadas: sin coincidencias en código, contenido ni build.
- Playwright: 60 pruebas aprobadas en Chromium, Firefox y WebKit de escritorio, Chromium móvil y WebKit móvil. Incluyen persistencia, pérdida y cambio de sesión, refresh de token, reconciliación tras pérdida de respuesta, medianoche y disposición responsive.
- Build local: 8.916 páginas generadas correctamente. La publicación conserva las dos actualizaciones automáticas de ediciones recibidas de `origin/main`.

El frontend conserva su implementación. Se agregó una prueba con contenido sintético de doce letras y ayudas extensas para cubrir los máximos del nuevo calendario en anchos de 320, 390, 768 y 1440 px; las pruebas nunca importan las soluciones reales.
