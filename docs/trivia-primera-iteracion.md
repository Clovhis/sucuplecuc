# Trivia Cine Posta

Ruta: `/juegos/trivia/`. Acceso desde el home junto al simulador.

## Juego

- Perfil obligatorio: nickname, nacionalidad y edad entera de 1 a 120. El nickname se reserva en Supabase para una identidad de Auth, persistida en este navegador. Una identidad tiene un jugador y un apodo fijo; puede actualizar nacionalidad y edad para partidas futuras.
- 20 preguntas con películas distintas, tres opciones por pregunta y 20 segundos. Después de responder se revela la película correcta, explicación y ficha en otra pestaña. El avance a la próxima pregunta es manual.
- Retratos circulares de 72 × 72 px, nombre y rol para las personas mencionadas. Fotos locales de `people.json`, con prioridad por nombre exacto y aliases explícitos; iniciales si una imagen no carga. Se revisaron los retratos de Robert Mitchum y Charles Laughton y el alias de F. W. Murnau.
- Tres pistas para toda la partida, máximo una por pregunta. Cada una descarta una opción incorrecta sin detener el reloj. Cada pista guardada suma 250 puntos al final.
- Acierto: `1000 + floor(milisegundos_restantes / 100)`, hasta 1200 puntos. Error o vencimiento: cero. Bonus final: `(3 - pistas_usadas) * 250`. Máximo: 24.750. Nota: `max(1, puntos / 2475)`, con un decimal y techo 10.
- El resumen conserva las 20 preguntas, elecciones, respuestas, películas y enlaces. El ranking muestra una entrada por jugador, con su mejor partida. Una partida peor no baja su récord.
- Teclas 1/2/3, controles con foco, mensajes accesibles y respeto por `prefers-reduced-motion`.

## Nicknames e identidad

`src/lib/trivia-nickname.ts` contiene la política de insultos y referencias de odio. El formulario avisa al escribir, marca el campo en rojo y bloquea el inicio. Cubre los ejemplos del usuario y variantes comunes con tildes, leetspeak, espacios, símbolos, repeticiones y algunos caracteres visualmente similares. Se prueban también palabras inocentes para reducir falsos positivos. La política es ampliable; no es un clasificador semántico universal.

`scripts/sync-trivia-nickname-policy.mjs` genera la misma política dentro de `supabase/sql/trivia_high_scores.sql`. La suite exige que ambas copias estén sincronizadas y compara sus resultados en PostgreSQL.

La propiedad del jugador proviene de `auth.uid()` validado por Supabase, nunca de un UUID enviado por el navegador. La clave única del nickname normaliza mayúsculas, tildes, espacios, separadores y sustituciones comunes. Las pruebas incluyen `Natalia`, `NATALIA`, `Nátalia`, `N a t a l i a`, `Nata.lia` y `N4t4lia`. El índice único también resuelve carreras entre dos registros simultáneos. La disponibilidad se consulta al escribir y se vuelve a comprobar al reservar.

La identidad anónima de Auth no pide email ni contraseña y tiene almacenamiento separado del foro y los votos de películas. Borrar el almacenamiento o pasar a otro navegador pierde esas credenciales: el nickname sigue reservado. Compartir el mismo perfil de navegador comparte ese jugador. No se implementó recuperación de cuenta ni verificación de identidad humana. Referencia: [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous).

## Estado y puntuación en el servidor

`supabase/sql/trivia_sessions.sql` implementa jugadores, banco privado, partidas, historial de preguntas y mejores puntajes. Todas las tablas tienen RLS y no permiten lectura ni escritura directa de `anon` o `authenticated`. Las funciones de juego exigen autenticación y comprueban propiedad antes de cada acción. El serializer interno no es ejecutable por esos roles.

Cada partida conserva una copia privada de sus 20 preguntas. Se priorizan preguntas no vistas y se evita repetir películas. La mezcla reserva 12 lugares para historias, 6 para créditos (máximo 3 de cada tipo) y 2 para premios/postcréditos. Si una familia no tiene preguntas nuevas, se completa primero con historias no vistas; se mezcla el orden final. El orden de las opciones se mezcla en el servidor. El cliente recibe sólo la pregunta actual y las respuestas ya cerradas; no recibe soluciones ni preguntas futuras. Los identificadores públicos son opacos: los IDs del catálogo contenían el slug de la respuesta y no se exponen mientras se responde.

El cliente envía sólo una opción, el número de pregunta y el ID de partida. PostgreSQL fija el plazo, comprueba la opción, corrige, calcula velocidad y bonus, descuenta pistas y publica el resultado al completar las 20. Cambiar `Date.now`, datos locales, campos del DOM o payloads de puntos no cambia el score guardado.

Las acciones bloquean la fila de la partida. Repetir una respuesta conserva el primer resultado; no permite probar las tres opciones. Reintentar «siguiente» no reinicia el reloj. Una pregunta vencida vale cero aunque se envíe la opción correcta. No se puede avanzar sin responder, responder otra ronda ni usar una cuarta pista. Otra pestaña comparte el estado del servidor, con una sola partida activa por identidad. Se limitan los arranques a cinco por minuto por identidad.

Los récords verificados viven en `trivia_verified_scores`, con una fila por jugador. Se actualizan sólo si mejora su puntaje. La RPC antigua que aceptaba corrección y tiempo del cliente queda revocada para navegadores. La edad y los identificadores de propiedad no aparecen en el ranking público.

El juego requiere conexión. Una respuesta perdida se recupera consultando el estado del servidor, sin recrear puntos ni plazos. El reloj visible usa `performance.now` sincronizado con la respuesta del servidor; la validación definitiva siempre ocurre en PostgreSQL.

Esto cierra los vectores técnicos probados de suplantación y fabricación de resultados. No impide consultar fuentes externas, automatizar conocimiento cinematográfico o crear múltiples identidades desde distintos navegadores; no se promete protección absoluta contra bots. No se modificaron los controles globales de Auth usados por otras secciones.

## Banco privado y mantenimiento

El banco depurado contiene 2658 preguntas derivadas de 2396 películas estrenadas: historias, reparto/dirección, duplas, Oscar a Mejor película/reparto y postcréditos registrados. No se infieren postcréditos ausentes ni se agregan hechos ajenos a las fichas. Se exige una sola opción válida y un mínimo de 1000 preguntas.

`scripts/sync-trivia-bank.mjs` lee películas y personas, genera el banco e importa sus preguntas a Supabase con `SUPABASE_ACCESS_TOKEN` sólo desde un entorno administrativo. Sin `--apply` sólo informa conteos y versión. Las partidas existentes conservan sus snapshots durante una actualización del banco.

Orden de instalación: aplicar `supabase/sql/trivia_high_scores.sql`, luego `supabase/sql/trivia_sessions.sql`, y ejecutar `node --experimental-strip-types scripts/sync-trivia-bank.mjs --apply`. Actualizar la política requiere ejecutar primero `node --experimental-strip-types scripts/sync-trivia-nickname-policy.mjs`. No se guarda ningún token administrativo en archivos o bundles.

El endpoint estático `/juegos/trivia/banco.json` expone únicamente versión y cantidad de preguntas; ya no publica el banco con respuestas. No se carga en el home. Los catálogos, ediciones automáticas, películas y datos de personas permanecen intactos.

## Validación

- `npm run test:trivia`: ocho pruebas aprobadas. Incluye todo el banco, distractores, nombres de las pistas, selección, puntajes, pistas, moderación, paridad cliente/SQL y una simulación completa con varios usuarios en PostgreSQL/PGlite.
- La prueba de seguridad cubre apodos duplicados y variantes; aislamiento de jugadores; tablas privadas; soluciones e IDs privados; envío falso de score; respuestas fuera de orden; reintentos; reloj vencido; límite de pistas; una partida activa; límite de arranques; récord preservado y migración repetible.
- `node scripts/trivia-live-smoke.mjs`: prueba explícita contra Supabase con dos usuarios anónimos y JWT reales. Comprobó nickname único, partida ajena denegada, soluciones ocultas, pistas del servidor, respuesta idempotente y endpoint de score falso bloqueado. Limpia sólo los usuarios y datos marcados por esa ejecución. No publica scores de prueba. Requiere el token administrativo para la limpieza.
- `npm run check` sin errores ni advertencias; `npm run build` completo y comprobaciones HTTP de DEV y salida estática.
- Playwright omitido por pedido del usuario. `node scripts/review-trivia-ui.mjs` recorre el juego en un Edge aislado mediante CDP nativo: 320, 390, 600, 768, 1024 y 1440 px, más 844 × 390 horizontal. Usa dos identidades temporales marcadas y las elimina, junto a sus partidas y récords, al terminar. Revisa registro, moderación, apodo ocupado, respuesta correcta/incorrecta, pistas, offline, recuperación, tiempo vencido, las 20 respuestas, resumen, fichas y repetición con el mismo jugador. Guarda capturas y geometrías en `test-results/trivia-review/` (ignorado por Git).
- El control incluye desbordes, zonas táctiles de al menos 44 px, campos de 16 px en teléfonos/tablets, retratos uniformes y proporción 2:3 del póster revelado. La revisión es emulación Chromium/Edge; no se presenta como una prueba sobre un dispositivo iOS físico.
- La suite `test:trivia` queda integrada en el workflow de validación. La ruta del juego está incluida en el sitemap.

## Revisión de variedad — 26/10/2026

Se retiraron las consignas por año de estreno y los años de las opciones mientras se responde. El año se muestra al revelar la respuesta y en el resumen. No se modificaron años del catálogo.

Las pistas de historia salen del inicio de la sinopsis propia: frases completas, hasta 240 caracteres, sin el título ni años numéricos. No se toma una segunda frase aislada si la primera no sirve. `src/lib/trivia-stories.ts` permite reemplazarla por una pregunta específica reescrita para esa película (22 iniciales, basadas en las sinopsis locales). Las alternativas deben pertenecer al mismo contexto argentino o internacional, al mismo tipo de producción y género principal, con un máximo de 18 años de distancia. En historias se exige además un país de producción compartido y afinidad de conflicto/ambientación. Se excluyen títulos coincidentes, familias de títulos y sinopsis muy similares. Esto reduce ambigüedades; no reemplaza la revisión editorial de cada premisa.

Las partidas ya empezadas conservan sus preguntas; el banco actualizado se aplica al iniciar otra partida. La sincronización y la migración no modifican jugadores ni sus récords.

## Criterio de dificultad — feedback de jugadores

No aceptar ternas como «Superman salva el mundo: X-Men / X-Men 2 / Superman» ni «Brandoni: Esperando la carroza / Terminator / Batman». El conocimiento de una película debe resolver la pista; los distractores deben ser creíbles. No se completa el banco con alternativas absurdas para inflar su tamaño.

- Las preguntas de historias que nombran un título distintivo o una franquicia/personaje que regala la respuesta se descartan. Se revisan también variantes de nombres y derivados (por ejemplo, «kryptoniano»).
- En duplas y dirección, cada alternativa debe compartir al menos una de las personas nombradas y fallar la combinación completa. Se busca cubrir las dos mitades de la pista entre ambas alternativas cuando hay candidatos adecuados.
- En premios y postcréditos, las tres películas deben incluir al actor mencionado. Para postcréditos, las incorrectas necesitan cero escenas registrado explícitamente.
- No mezclar fichas argentinas con extranjeras en una misma terna; no inferir nacionalidad de las personas por su nombre. Se usan `country` e `isArgentinian` de las películas.
- Evitar que las dos alternativas incorrectas sean variaciones de la misma saga. Una pregunta sin dos alternativas válidas se retira.
- `src/lib/trivia-quality.ts` centraliza estas reglas y una cuarentena de fuentes inconsistentes, con evidencia. Las fichas en cuarentena no pueden aparecer ni como respuestas ni como distractores. No se alteraron los JSON del catálogo en esta tarea.
- `npm run audit:trivia` examina **cada pregunta aceptada** y genera `test-results/trivia-question-audit.json`, con la terna completa y los candidatos rechazados. Forma parte de `test:trivia`, por lo que CI vuelve a ejecutarla. La auditoría automática verifica reglas explícitas; la dificultad y toda ambigüedad semántica siguen admitiendo revisión editorial.

La comparación de dirección descompone las codirecciones y descarta cualquier distractor que comparta actor y un director de la pista, aunque su ficha guarde una lista parcial o en otro orden. Se probaron todas las preguntas de dirección con esta condición adicional.
