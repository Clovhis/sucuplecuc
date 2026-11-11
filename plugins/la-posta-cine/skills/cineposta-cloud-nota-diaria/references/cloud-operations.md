# Operación eficiente

60–90 minutos es una referencia, nunca un límite para aprobar información dudosa. Se conservan los dos Luna Max nativos, cuotas incluidas, estados y gates. No hay API LLM, agentes adicionales ni aprendizaje continuo.

## Orquestador y agentes

- Actualizá el checkout preservando trabajo ajeno, guardá el catálogo nativo real y ejecutá `--prepare`. En reanudaciones consultá `--status`: es de solo lectura, incluso con lock activo. Seguí `nextAction`; no reinicies el día ni repitas etapas terminadas. Repetir un congelado ya aprobado e intacto conserva la aprobación; un snapshot o informe distinto no la hereda. La recuperación de recibos publicados y las excepciones históricas no cambian.
- Probá exactamente dos agentes, con la selección real y `fork_turns: none`, y reutilizá sus IDs. Registrá `startedAt` antes de cada llamada, `completedAt` tras su completion real y `usage` sólo si el runtime la devuelve. Un fallo no escribe una ejecución completed. Los followups indican etapa, worktree y feedback, sin repetir el prompt entero. Los contratos se leen al inicio; después se consultan las secciones pertinentes.
- Antes de profundizar cada candidato, la autora lee íntegro `published-brief.json`, la vista de todos los registros de `published.json`, acontecimientos, entidades, títulos alternativos, hechos de fuentes, guías y descartes; evita sólo hashes/texto duplicado. Si falta la vista, lee todo el canónico. No hay límite de 60. Los antecedentes relevantes se abren íntegros.
- Comprobá temprano una vía visual plausible: fichas/licencias aplicables y funciones narrativas para 4–6 fotos. No descargues muchas variantes del mismo encuadre. Cuatro imágenes diferentes no exigen cuatro eventos diferentes. Un archivo de otra película/año necesita contexto y pie honestos. Ante condiciones dudosas buscá alternativas claras; no repitas indefinidamente el análisis de la misma licencia. La inviabilidad documentada sigue correspondiendo al auditor.
- La autora entrega candidato y espera preflight independiente. Aprobado éste, desarrolla nota, evidencia, imágenes y tweet en el mismo trabajo creativo. El tweet presenta la película/evento, noticia y comentario propio con invitación natural a leer. No es una advertencia metodológica ni un bloque de créditos. `draft.social` y la aprobación independiente `report.social` son obligatorios según el contrato de calidad. Elegir portada con permisos compatibles con un crédito secundario; nunca omitir obligaciones para hacerlo entrar.
- Antes de terminar, la autora ejecuta desde el worktree `node scripts/check-daily-editorial.mjs --draft`; la auditora, `node scripts/check-daily-editorial.mjs --review`. Cada una corrige las omisiones de contrato de su archivo en el mismo turno. Estos chequeos no hacen builds, no verifican la verdad por sí solos ni sustituyen la aprobación y los completions reales.

## Revisión iterativa

`--review` genera `review-packet.json`, `review-template.json` y `review-diff.json`. La plantilla tiene **pending**, nunca aprueba. Puede conservar comprobaciones del mismo auditor sobre entradas intactas. En la primera auditoría se abren las fuentes por cuenta propia; en correcciones se cotejan diff y snapshots y se reutilizan comprobaciones vigentes de campos, fuentes e imágenes sin cambios.

El auditor lee y verifica todo lo nuevo, incluidas afirmaciones omitidas del ledger, y decide explícitamente cobertura y tres dimensiones. Historia/política cambiadas exigen revisar originalidad. Conserva materiales anteriores y corrige sólo decisiones/evidencia afectadas, sin reescribir todo el informe. `claim.field` permite comparar el campo real objetado; un error factual nunca se resuelve cambiando sólo metadata. Sigue el ciclo de correcciones/Plan B del contrato canónico, sin cancelar por errores recuperables.

## Validación y recuperación

`--dry-run`/`--revalidate` conservan todos los gates. Sólo reutilizan contenido/Astro y build aprobados con iguales hashes de entradas, dependencias/configuración pertinentes y artefactos. Fuentes y revisión vigente se comprueban otra vez; Playwright siempre corre completo. Cambios de entradas o de `dist` invalidan el cache. Un fallo no habilita publicación.

Playwright usa desde el primer intento la política de CI existente, con los mismos timeouts, proyectos y dos workers. Los diagnósticos y capturas se archivan antes de otro intento. Si falla, inspeccioná errores/trazas y compará casos afectados con main. Probá cualquier fix mínimo con esos casos antes de una integral. Si persiste tras una corrección comprobada y una nueva integral, detené reintentos y entregá diagnóstico/checkpoint; no saltees tests ni aumentes timeouts para pasar.

Con validación aprobada, `--publish` mantiene push seguro → Pages/URL correcta → Buffer inmediato deduplicado. Si falla sólo Buffer, `--tweet`; no hay nueva nota ni regeneración durante recuperación. Agenda y tareas semanales permanecen intactas.

## Métricas

`FECHA-metrics.jsonl` registra etapas, duración, reutilización, fallos y ejecuciones nativas registradas. `--status` muestra etapa activa y resumen. Los tiempos nativos son wall-clock si se registraron ambos extremos, no tiempo puro de inferencia. Tokens no expuestos son **desconocidos**, nunca cero ni estimados. Un fallo puede registrarse mediante `EditorialMetrics.native(role, execution)` con status failed y datos reales, sin sobrescribir el archivo de ejecución aprobable.
