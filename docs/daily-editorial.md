# Nota diaria con la suscripción ChatGPT

La solución usa una tarea nativa de Codex/Work vinculada al entorno cloud del proyecto. El modelo editorial se ejecuta mediante la herramienta oficial nativa `collaboration.spawn_agent`, dentro de las capacidades/cuotas de la cuenta ChatGPT. **No usa OpenAI API, claves de LLM, sesiones exportadas, tokens copiados ni credenciales de una PC.** Si se agota la cuota o no está disponible el modelo, falla sin comprar créditos ni sustituir otra familia.

La prueba nativa del 9 de noviembre de 2026 completó un turno solicitado explícitamente con `model: gpt-6-luna`, `reasoning_effort: max`, `fork_turns: none`, ID `/root/cineposta_luna`. La sesión de CLI anidado había fallado con `unauthorized`; no se intenta renovarla ni usarla para inferencia. Se retiró la alternativa de API antes de activarla. El CLI no forma parte de la ejecución editorial.

## Modelo real y actualización

El bootstrap enumera los modelos/razonamientos anunciados por la herramienta oficial **de cada run**, y escribe `.tmp/cineposta-daily/native-catalog.json` con `{ observedAt, models: [{ model, reasoningEfforts }] }`. `selectNativeLuna` ordena versiones numéricas y exige Max en la última Luna disponible; no deduce IDs ni elige silenciosamente una versión anterior o una familia distinta. `--prepare` imprime la selección que debe pasarse como argumentos reales al único ejecutor editorial nativo.

Antes de adoptar una versión, se completa un probe mínimo con ese modelo y Max, luego se reutiliza el mismo agente para investigar/redactar. El orquestador no redacta. Al terminar el autor, el orquestador registra ID y argumentos reales en `native-execution.json`; el publicador exige completion, probe aprobado y coincidencia con la selección. No basta declarar el modelo en el prompt. Una futura Luna anunciada en el runtime se selecciona en el siguiente run y debe pasar la prueba real; si el runtime no la ofrece o no admite Max, se detiene. No se fija permanentemente GPT-6.

## Agenda y persistencia

`config/daily-editorial.json` guarda el VEVENT de **sábado a miércoles a las 10:00 America/Argentina/Buenos_Aires**, sin ejecuciones los jueves ni viernes, el ID/estado del scheduler nativo y la política de cuotas. `config/daily-editorial-prompt.md` contiene el bootstrap completo, independiente de este chat. `enabled: false` y `automationId: null` significan que aún no hay agenda activa. Sólo se crea/activa después de una publicación real y Pages verificados; al crearla se registra el ID devuelto y su entorno cloud. No se crea un cron de inferencia en GitHub Actions.

Las 10:00 son el inicio solicitado. Investigación, validación, colas y Pages agregan tiempo. Plus tiene cuotas, no ejecución ilimitada ni garantía de terminar todos los días si se agotan. No se habilita consumo adicional. Radar sigue seleccionando editoriales propias en cada build, sin workflow diario separado; este flujo no altera películas, scores, Recomendadas, Próximos estrenos ni el flujo de películas de Buffer.

## Ejecución del orquestador

1. Guardar el catálogo nativo vigente y ejecutar `node scripts/daily-editorial.mjs --prepare`. Crea un worktree desde origin/main, instala dependencias/Chromium y escribe el índice acotado de publicaciones; devuelve fecha, ruta, selección y executionFile. Si ya hay nota del día, no genera otro turno.
2. Invocar el único agente con los argumentos devueltos, probarlo y encargarle la preparación con `cineposta-cloud-nota-diaria` y `cineposta-editorial`. El agente escribe una nota, sus WebP y `.tmp/cineposta-daily/draft.json` con un tweet original, en el mismo turno y worktree. Nunca hace commits ni push.
3. Tras completion nativo satisfactorio, escribir el executionFile con `{ provider: "codex-native", model, effort: "max", agentId, probe: "passed", status: "completed" }`, usando datos de las llamadas reales. Ejecutar `--dry-run`: valida sin publicar. En el primer run, revisar la nota completa y las capturas desktop/320 px.
4. Ejecutar `--publish` sobre esa misma preparación aprobada. Si cambia el contenido o main, `--revalidate` integra y repite checks sin otra redacción. El usuario autorizó publicación directa y comprobación completa de producción.
5. Después de verificar Pages de la primera nota, crear una única agenda nativa con el prompt/VEVENT versionados, el entorno cloud guardado y timezone argentino. Registrar la respuesta real y el ID en config. Si las herramientas del scheduler no incluyen el ejecutor nativo requerido, detener/pausar la agenda y reportar esa limitación; no suponer compatibilidad.

El publicador exige dos dominios y fuente primaria, evidencia de datos/imágenes, WebP locales decodificados y responsive de peso acotado, fecha argentina y controles de duplicados. El criterio semántico y la voz siguen en las skills existentes. El índice inicial se limita a 60 notas y se busca por candidato en todo el historial. No hay aprendizaje continuo ni análisis exhaustivos diarios.

El gate reutiliza `validate:content -- --astro-check` (un build), la suite editorial desktop/móvil y el smoke test de la preparación. Usa hasta 6 GB de heap y dos workers Playwright. El build inicial del código existente pasó: 8.635 páginas. La primera nota real agregó una página: el build final generó 8.636 páginas, Astro check no registró errores ni warnings y las 70 pruebas editoriales desktop/móvil pasaron (incluidos los dos casos dinámicos de la nota). Se revisaron visualmente la nota y su tarjeta de portada en desktop y a 320 px, sin desbordamiento ni imágenes rotas.

Hay lock local, ámbito limitado a nota/imagenes/registro, rebase y push fast-forward sin force. El registro `reports/daily-editorial/<fecha AR>.json` se publica atómicamente con la nota y conserva modelo/Max/ID nativo, tema, fuentes y checks. Un reintento de la fecha no redacta otra nota. Pages se comprueba por SHA y URL/fecha; si falla, conservar el commit y usar `--verify`, sin regenerar contenido. Un fallo de validación invalida la prueba anterior. No descartar preparaciones ni locks sin inspección.

Lesson Learned de red: `fetch` nativo de Node devolvió ECONNREFUSED en este cloud, mientras `curl` accede correctamente mediante los proxies y CA heredados. Las verificaciones usan curl con TLS y redirecciones exclusivamente HTTPS; no se desactiva la comprobación de certificados. Si main avanza antes de la primera validación, se integra por fast-forward conservando la preparación; después se valida el contenido combinado.

## Fuentes oficiales y límites

- [Tareas programadas y skills/modelo/razonamiento](https://learn.chatgpt.com/docs/automations): las tareas web son cloud, pueden usar skills/plugins y las opciones disponibles dependen de la cuenta; el CLI no administra Scheduled. Los proyectos locales requieren PC encendida.
- [Codex incluido en planes ChatGPT y cloud](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan): cuentas Plus elegibles pueden usar Cloud y sus cuotas; no implica API gratuita ilimitada.
- [ChatGPT Work y Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex): Work cloud y tareas nativas son distintos de controlar una PC remotamente.

La herramienta de scheduler disponible en este chat no expone campos model/reasoning. Por eso el modelo real se impone en el único ejecutor nativo, con el override oficial, en vez de prometer que el texto del prompt cambia el modelo del scheduler. La prueba inicial confirmó esa vía nativa. La primera nota fue redactada realmente por ese ejecutor y publicada con Pages/URL verificados. La prueba de activación volvió a completar Luna Max en cloud y recorrió la recuperación de una publicación existente, sin generar otro artículo. No se presenta este probe como una segunda generación editorial.


## Buffer y X después de publicar

La misma ejecución creativa de Luna genera el tweet y lo guarda en el borrador; se valida antes del build y queda versionado en el registro diario. Debe tener un comentario propio, URL canónica y 1–3 hashtags, con límite interno de 250 caracteres ponderados reutilizando el contador existente (URLs 23, emojis/Unicode según ponderación X). No se usa otro LLM ni una nueva skill.

Sólo después de Pages y la comprobación pública, `--publish` despacha el workflow existente `publish-buffer-editorial-x.yml`. Reutiliza `BUFFER_API_KEY`, organización/canal ya configurados y el cliente oficial de Buffer de `publish-buffer-x.mjs`. El workflow confirma canonical/fecha/portada reales, canal X @cineposta, y manda `shareNow` sin `dueAt` futuro. Consulta posts existentes antes de crear y reutiliza un ID persistido; un error de entrega se reintenta por `editPost` en modo `shareNow`, no con un segundo `createPost`.

Se confirma `sent` y se conserva `externalLink` cuando Buffer lo proporciona. El comprobante/error se guarda en `reports/buffer-editorial/<slug>.json` en main y como artifact. Un fallo de X no revierte la nota. `node scripts/daily-editorial.mjs --tweet` reintenta sólo el tweet de hoy; para cualquier fecha, ejecutar ese mismo workflow con `slug` y `mode=publish-now`. El envío de una URL ya publicada recupera su comprobante sin duplicarla. No se altera el workflow de películas de las 19:00 ni su historial.

## Primer run real

El 9 de noviembre se publicó en main la preparación validada de [Godzilla Minus Zero y su estreno casi simultáneo](https://www.cineposta.com.ar/editorial/godzilla-minus-zero-estreno-global/), commit `f5838d15b35c9caf04ef98e08b234f62d5d5f511`. El único autor nativo fue GPT-6 Luna Max; la nota tiene 917 palabras, cinco fuentes y cinco imágenes (cuatro en el cuerpo y una portada, con variantes responsive; 793 KB en total). El tweet original quedó en el mismo registro diario, con 236 caracteres ponderados y dos hashtags. El registro versionado conserva la evidencia del ejecutor y los resultados del gate.

Lesson Learned editorial del primer run: contrastar por separado idioma, origen de producción, territorio y ventana de recaudación antes de formular un récord. Una precisión pedida en revisión debe corregirse en la misma preparación, sin abrir otra nota ni sumar agentes. Esto aplica a la verificación editorial normal; no se agrega un análisis exhaustivo diario.

Lesson Learned de despliegue: el primer run de Pages completó el build y el artifact, pero GitHub falló antes de crear el job deploy con `Internal server error` (run `42672559598`). La anotación aparecía en la página del run, no en `--log-failed`, porque no había ningún job fallido. GitHub rechazó rerun; se recupera con el workflow oficial `deploy.yml` por workflow_dispatch sobre el mismo SHA, sin cambiar ni regenerar contenido. Tras recuperar Pages, `--publish` comprueba la publicación existente y reanuda Buffer idempotentemente; `--verify` por sí solo no envía a X.

Resultado real verificado: Pages recuperado en [run 42674588394](https://github.com/Clovhis/sucuplecuc/actions/runs/42674588394), HTTP 200, título/fecha/canonical correctos. Buffer publicó por `shareNow` y confirmó `sent` en [run 42676729753](https://github.com/Clovhis/sucuplecuc/actions/runs/42676729753); ID `6af214c54edc9538cafb8116`, [tweet publicado](https://twitter.com/cineposta/status/2119863956651020540). El comprobante quedó en `reports/buffer-editorial/godzilla-minus-zero-estreno-global.json`; no hubo duplicación del artículo ni del tweet.

## Agenda activa verificada

La tarea nativa **Nota diaria CinePosta** quedó habilitada con el bootstrap versionado (sin el prefijo temporal de prueba), VEVENT de sábado a miércoles (excluye jueves y viernes) a las 10:00 `America/Argentina/Buenos_Aires`, desde el 10 de noviembre de 2026. Una consulta posterior confirmó `is_enabled: true`, horario/zona y el entorno cloud guardado `sucuplecuc`, no una PC. El ID y el selector de configuración cloud quedan en `config/daily-editorial.json`. El servicio no devuelve URL pública compartible de la tarea ni `next_run_time`; el horario confirmado es el VEVENT, sin inventar un próximo timestamp del proveedor. La tarea se encuentra en Scheduled con ese nombre.

La prueba de activación recibida ejecutó realmente `collaboration.spawn_agent`, `model: gpt-6-luna`, `reasoning_effort: max`, `fork_turns: none`, agente `/root/cineposta_scheduler_probe`, completion `OK Luna Max nativo.`. Se actualizó el catálogo desde el descriptor oficial, `--prepare` reconoció la nota existente y `--publish` verificó Pages/URL y recuperó Buffer. El [run 42677431215](https://github.com/Clovhis/sucuplecuc/actions/runs/42677431215) terminó correctamente con `mode: already-sent`, el mismo post `6af214c54edc9538cafb8116` y el mismo tweet: no hubo nueva redacción ni duplicado. No se usó inferencia por CLI/API, sesiones exportadas ni créditos adicionales. Los campos históricos del scheduler no devuelven un resultado detallado; esta evidencia corresponde a las llamadas y comandos observados, no a una inferencia basada en contadores.

Lesson Learned de agenda: el endpoint oficial `run_now` devolvió 404; una actualización relativa vacía tampoco se guardó. Una prueba única con DTSTART absoluto fue aceptada. Después del probe nativo real se restauró la recurrencia solicitada y se comprobó el estado final. La prueba temporal no forma parte del prompt cotidiano. El ID de GPT-6 guardado en la evidencia es una observación del primer run, no un pin: la selección diaria sigue consultando los modelos nativos disponibles y probando la última Luna compatible con Max.
