# Nota diaria con la suscripción ChatGPT

La solución usa una tarea nativa de Codex/Work vinculada al entorno cloud del proyecto. El modelo editorial se ejecuta mediante la herramienta oficial nativa `collaboration.spawn_agent`, dentro de las capacidades/cuotas de la cuenta ChatGPT. **No usa OpenAI API, API keys, sesiones exportadas, tokens copiados ni credenciales de una PC.** Si se agota la cuota o no está disponible el modelo, falla sin comprar créditos ni sustituir otra familia.

La prueba nativa del 9 de noviembre de 2026 completó un turno solicitado explícitamente con `model: gpt-6-luna`, `reasoning_effort: max`, `fork_turns: none`, ID `/root/cineposta_luna`. La sesión de CLI anidado había fallado con `unauthorized`; no se intenta renovarla ni usarla para inferencia. Se retiró la alternativa de API antes de activarla. El CLI no forma parte de la ejecución editorial.

## Modelo real y actualización

El bootstrap enumera los modelos/razonamientos anunciados por la herramienta oficial **de cada run**, y escribe `.tmp/cineposta-daily/native-catalog.json` con `{ observedAt, models: [{ model, reasoningEfforts }] }`. `selectNativeLuna` ordena versiones numéricas y exige Max en la última Luna disponible; no deduce IDs ni elige silenciosamente una versión anterior o una familia distinta. `--prepare` imprime la selección que debe pasarse como argumentos reales al único ejecutor editorial nativo.

Antes de adoptar una versión, se completa un probe mínimo con ese modelo y Max, luego se reutiliza el mismo agente para investigar/redactar. El orquestador no redacta. Al terminar el autor, el orquestador registra ID y argumentos reales en `native-execution.json`; el publicador exige completion, probe aprobado y coincidencia con la selección. No basta declarar el modelo en el prompt. Una futura Luna anunciada en el runtime se selecciona en el siguiente run y debe pasar la prueba real; si el runtime no la ofrece o no admite Max, se detiene. No se fija permanentemente GPT-6.

## Agenda y persistencia

`config/daily-editorial.json` guarda el VEVENT diario de las **10:00 America/Argentina/Buenos_Aires**, el ID/estado del scheduler nativo y la política de cuotas. `config/daily-editorial-prompt.md` contiene el bootstrap completo, independiente de este chat. `enabled: false` y `automationId: null` significan que aún no hay agenda activa. Sólo se crea/activa después de una publicación real y Pages verificados; al crearla se registra el ID devuelto y su entorno cloud. No se crea un cron de inferencia en GitHub Actions.

Las 10:00 son el inicio solicitado. Investigación, validación, colas y Pages agregan tiempo. Plus tiene cuotas, no ejecución ilimitada ni garantía de terminar todos los días si se agotan. No se habilita consumo adicional. El Radar existente conserva su cron de reconstrucción; este flujo no altera películas, scores, Recomendadas, Próximos estrenos ni Buffer.

## Ejecución del orquestador

1. Guardar el catálogo nativo vigente y ejecutar `node scripts/daily-editorial.mjs --prepare`. Crea un worktree desde origin/main, instala dependencias/Chromium y escribe el índice acotado de publicaciones; devuelve fecha, ruta, selección y executionFile. Si ya hay nota del día, no genera otro turno.
2. Invocar el único agente con los argumentos devueltos, probarlo y encargarle la preparación con `cineposta-cloud-nota-diaria` y `cineposta-editorial`. El agente escribe una nota, sus WebP y `.tmp/cineposta-daily/draft.json` en el worktree. Nunca hace commits ni push.
3. Tras completion nativo satisfactorio, escribir el executionFile con `{ provider: "codex-native", model, effort: "max", agentId, probe: "passed", status: "completed" }`, usando datos de las llamadas reales. Ejecutar `--dry-run`: valida sin publicar. En el primer run, revisar la nota completa y las capturas desktop/320 px.
4. Ejecutar `--publish` sobre esa misma preparación aprobada. Si cambia el contenido o main, `--revalidate` integra y repite checks sin otra redacción. El usuario autorizó publicación directa y comprobación completa de producción.
5. Después de verificar Pages de la primera nota, crear una única agenda nativa con el prompt/VEVENT versionados, el entorno cloud guardado y timezone argentino. Registrar la respuesta real y el ID en config. Si las herramientas del scheduler no incluyen el ejecutor nativo requerido, detener/pausar la agenda y reportar esa limitación; no suponer compatibilidad.

El publicador exige dos dominios y fuente primaria, evidencia de datos/imágenes, WebP locales decodificados y responsive de peso acotado, fecha argentina y controles de duplicados. El criterio semántico y la voz siguen en las skills existentes. El índice inicial se limita a 60 notas y se busca por candidato en todo el historial. No hay aprendizaje continuo ni análisis exhaustivos diarios.

El gate reutiliza `validate:content -- --astro-check` (un build), la suite editorial desktop/móvil y el smoke test de la preparación. Usa hasta 6 GB de heap y dos workers Playwright. El build inicial del código existente pasó: 8.635 páginas. La suite editorial existente pasó 68 pruebas; los dos casos de nota diaria se omitieron entonces porque todavía no había preparación real. Estos resultados no sustituyen las validaciones de la primera nota.

Hay lock local, ámbito limitado a nota/imagenes/registro, rebase y push fast-forward sin force. El registro `reports/daily-editorial/<fecha AR>.json` se publica atómicamente con la nota y conserva modelo/Max/ID nativo, tema, fuentes y checks. Un reintento de la fecha no redacta otra nota. Pages se comprueba por SHA y URL/fecha; si falla, conservar el commit y usar `--verify`, sin regenerar contenido. Un fallo de validación invalida la prueba anterior. No descartar preparaciones ni locks sin inspección.

Lesson Learned de red: `fetch` nativo de Node devolvió ECONNREFUSED en este cloud, mientras `curl` accede correctamente mediante los proxies y CA heredados. Las verificaciones usan curl con TLS y redirecciones exclusivamente HTTPS; no se desactiva la comprobación de certificados. Si main avanza antes de la primera validación, se integra por fast-forward conservando la preparación; después se valida el contenido combinado.

## Fuentes oficiales y límites

- [Tareas programadas y skills/modelo/razonamiento](https://learn.chatgpt.com/docs/automations): las tareas web son cloud, pueden usar skills/plugins y las opciones disponibles dependen de la cuenta; el CLI no administra Scheduled. Los proyectos locales requieren PC encendida.
- [Codex incluido en planes ChatGPT y cloud](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan): cuentas Plus elegibles pueden usar Cloud y sus cuotas; no implica API gratuita ilimitada.
- [ChatGPT Work y Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex): Work cloud y tareas nativas son distintos de controlar una PC remotamente.

La herramienta de scheduler disponible en este chat no expone campos model/reasoning. Por eso el modelo real se impone en el único ejecutor nativo, con el override oficial, en vez de prometer que el texto del prompt cambia el modelo del scheduler. La prueba inicial confirmó esa vía nativa. No se afirma aún que una agenda nueva haya publicado hasta observar su resultado.
