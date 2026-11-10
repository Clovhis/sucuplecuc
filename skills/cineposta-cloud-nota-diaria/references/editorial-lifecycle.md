# Ciclo editorial diario y diversidad

Aplica sólo a la tarea diaria. No cambia agendas, selección de los dos Luna Max, suscripción, guías semanales, Pages ni Buffer. Reutiliza el contrato factual v1: evidencia por afirmación, unidades, ART/DST, linaje de fuentes, acceso argentino, permisos, atribuciones y cierre material siguen siendo obligatorios.

## Roles y checkpoints

El orquestador registra llamadas **reales** de dos agentes nativos independientes, `fork_turns: none`, con la selección de `--prepare`. El autor propone candidatos, investiga, redacta, prepara recursos y tweet. El auditor contrasta fuentes por su cuenta, pide soluciones concretas y aprueba o descarta candidatos. Ambos se reutilizan mediante `collaboration.followup_task` con sus IDs reales en todos los intentos. No editar el checkpoint desde estos roles, ni delegar ni publicar. No usar API LLM, CLI de inferencia o créditos adicionales.

`--prepare` crea o reanuda la jornada, sin sobrescribir trabajo. `--status` imprime `status`, `nextAction`, `attemptId`, agentes, feedback y descartados. El checkpoint atómico con checksum vive fuera del worktree en `.tmp/cineposta-daily/FECHA-session.json`; cada intento tiene su directorio propio y journal de revisión. Si existe recibo de hoy en main, no hay otra redacción: recuperar Pages/X por los controles existentes; los históricos sin revisión sólo admiten `--verify`.

Transiciones comprobadas en código:

```
drafting → reviewing → changes_required → revising → reviewing → approved → published
topic_unviable / duplicate_topic / editorial_saturation → switching_topic → drafting
```

La revisión preliminar del candidato tiene `phase: candidate`; su aprobación devuelve a `drafting` con `candidateApproved`, sin autorizar commits. Sólo `phase: article` y el gate completo pueden llegar a `approved`. Los cambios posteriores vuelven a `reviewing`. La publicación se registra después de confirmar el push; Pages y Buffer se recuperan sin volver a generar contenido. El recibo atómico conserva el checkpoint aprobado anterior al push (no puede contener su propio SHA futuro) y la sesión cloud registra después `published` con SHA.

## Antes de investigar cada candidato

El autor lee el índice completo `published.json`, revisa antecedentes pertinentes y compara candidatos por relevancia, hecho nuevo, calidad de fuentes y diversidad. Escribe `.tmp/cineposta-daily/candidate.json`:

```json
{
  "id": "identidad-del-candidato",
  "topicKey": "acontecimiento-estable",
  "title": "Propuesta de título",
  "summary": "Hecho y ángulo concretos, no sólo un nombre de película.",
  "event": {
    "key": "acontecimiento-estable",
    "type": "announcement",
    "date": "YYYY-MM-DD",
    "entities": ["film:identidad-canonica"],
    "description": "Qué sucedió y por qué es distinto de lo publicado."
  },
  "entities": [{"id":"film:identidad-canonica","kind":"film","aliases":["Título original", "Título argentino"]}],
  "category": "estrenos",
  "novelty": "Aporte cinematográfico concreto y sustancial.",
  "evidence": [{"url":"https://fuente.example/anuncio","excerpt":"Fragmento comprobado del anuncio original.","checkedOn":"YYYY-MM-DD"}]
}
```

Usar los identificadores/alias canónicos de la política y del índice: `topicKey` y `event.key` representan la misma identidad canónica, y `event.entities` refiere a los sujetos centrales del hecho, siempre declarados en `entities`; las películas citadas sólo como contexto se registran fuera de ese foco. El auditor debe comprobar que este foco describa el texto real, no una forma de eludir la política. Incluir franquicia y secuela si corresponde; no renombrar entidades ni evento para evadir una coincidencia. La fecha es la del acontecimiento, no la de una copia del comunicado ni la de ejecución. La comparación no se limita a los últimos días: el código lee todas las editoriales y recibos de `origin/main`, más descartes, antes de cada candidato y al validar. No modifica el catálogo ni notas históricas.

El orquestador registra el turno real del autor en `native-execution.json` y ejecuta `--candidate`. Congela `candidate-input.json` con candidato, política, historial íntegro, resultados deterministas y digest. El auditor revisa originalidad **antes** de investigar en profundidad. Escribe `factual-review.json`; el orquestador registra su completion real y ejecuta `--record-review`.

La política configurable está en `config/daily-editorial-diversity.json`: ventana de 14 días para una película/franquicia central y concentración a 30 días. El código normaliza alias y hechos estructurados; las menciones contextuales en comparaciones/fuentes siguen exigiendo revisión semántica, pero no cuentan automáticamente como otra nota centrada; coincidencias de claves/eventos estables bloquean, y coincidencias de entidades/ángulos producen comparaciones obligatorias. Los titulares diferentes no prueban novedad. Un hash sólo liga el historial revisado, no demuestra equivalencia semántica. El auditor debe leer y explicar los antecedentes relevantes, incluidas traducciones, secuelas y republicaciones del mismo anuncio.

Las menciones en guías semanales no cuentan como otra nota centrada en una película. Si una diaria desarrolla exactamente el hecho ya explicado por una guía, exige un aporte sustancialmente distinto. Este validador no cambia ni se aplica al publicador semanal.

## Informes y decisiones

El informe mantiene `version: 1`, `date`, `candidateId`, `contentDigest` y `verdict`. En nota completa agrega `slug` y todo el contrato factual. Veredictos:

- `changes_required`: mismo candidato, con `reason` y `findings` accionables. Cada hallazgo abierto conserva `id`, `kind` (`claim`, `access`, `image`, `text`), `targetId`, `severity`, `status`, `description`, `action` y `evidence` abierta con URL/extracto/fecha. En preflight usar `kind: text` y un campo real como `targetId: candidate/summary`; su aprobación también debe resolver materiales con antes/después/evidencia. Explicar qué cambiar y qué evidencia sirve. No esconder un error retirando sólo el claim del ledger.
- `topic_unviable`: problema sustancial tras búsquedas razonables. Requiere `reason`, `unresolvable`, `searches` y `evidence` con URL/extracto/fecha. Explicar por qué no alcanza corregir, limitar afirmaciones o sustituir imágenes. Una imagen sin permiso puede reemplazarse manteniendo texto válido; no vuelve automáticamente inviable toda noticia.
- `duplicate_topic` / `editorial_saturation`: identificar `relatedPublications` y `evidence`, con el hecho repetido o la concentración y su alcance. Se rechaza el candidato, no la jornada.
- `approved`: candidato verificablemente nuevo/diverso; para nota completa, además factualidad, calidad editorial y derechos resueltos. Nunca aprobar para facilitar la cuota.

En toda aprobación incluir:

```json
{
  "originality": {
    "verdict": "approved",
    "history": {"digest":"del-indice-congelado","recordCount":0,"checkedRecordIds":[],"checkedDiscardedIds":[]},
    "coverage": {"fullHistory":true,"events":true,"entities":true,"guideContributions":true},
    "comparisons": [],
    "guideComparisons": [],
    "reconsiderations": []
  }
}
```

`checkedRecordIds` y `checkedDiscardedIds` cubren exactamente todos los registros y descartes del índice, sin duplicados. Por cada match general que requiera comparación: `{recordId, relation:"distinct_event", priorAngle, candidateContribution, difference, evidence:[{recordId, sourcePath o url, excerpt}]}`. Una coincidencia estructurada de tipo/fecha original/entidad no prueba equivalencia: exige además `eventDifference` y `newEventEvidence` con URL/extracto/fecha coincidentes con evidencia del candidato; `same_event` no permite aprobar un duplicado diario. La evidencia histórica debe apuntar al antecedente identificado; la diferencia describe hechos, no un cambio cosmético de título. La nota completa añade `dimensions:{factual:"approved",editorial:"approved",originality:"approved"}`.

Por cada guía del índice, `guideComparisons` incluye `{recordId,relation:"no_same_event" o "substantial_contribution",basis,evidence:[{recordId,sourcePath o url,excerpt}]}`. Abrir la guía completa. La mera mención de una película puede dar `no_same_event`; si existe una señal estructurada de posible mismo evento, agregar `eventDifference` y `eventEvidence` (URL/extracto/fecha ligados a evidencia nueva del candidato). Una clave exacta del mismo acontecimiento requiere `substantial_contribution`, con `candidateContribution`, `difference` y `contributionEvidence` nueva ligada al candidato: no declarar falsamente que es otro hecho. Los campos de identidad sólo se corrigen en `revising`, manteniendo el ID del candidato y con un hallazgo explícito del auditor sobre el campo (`candidate/entities`, `candidate/event/type`, etc.); no se cambia de noticia arbitrariamente. La revisión preliminar no aplica cooldown a festivales/personas por mera coincidencia; las ventanas de película/franquicia son específicas.

Una excepción de 14 días necesita `originality.exception14d:{verdict:"approved",extraordinary:true,rationale,distinctContribution,evidence:[...]}`. Debe acreditar un hecho extraordinario sustancialmente nuevo y comparar la cobertura anterior; no salva un duplicado real. Una entrevista, tráiler, póster o actualización menor no alcanza por sí sola. Ante concentración en 30 días, priorizar alternativas interesantes y justificar cualquier aprobación excepcional. No hay cuotas por nacionalidad ni género.

Cuando el preflight detecte concentración, agregar `originality.concentrationReview:{rationale,alternativesConsidered:[{topicKey,title,reason}]}`: al menos una alternativa legítima y por qué esta novedad merece prioridad. No inventar candidatos para rellenar campos. El umbral predeterminado señala la tercera publicación relacionada en 30 días, incluyendo la propuesta; es configurable.

Los descartes se comparan por ID, clave y hechos estructurados, además de quedar disponibles para juicio semántico. Sólo evidencia nueva puede habilitar reconsideración: `candidate.reconsideration:{discardedId,reason,newEvidence:[{url,checkedOn,excerpt}]}`, con un par URL/extracto distinto del previamente comprobado, no sólo otra fecha. Sigue requiriendo al auditor: `originality.reconsiderations:[{discardedId,verdict:"approved",basis,newEvidence}]` debe auditar exactamente esa evidencia congelada. No permite reaprobar un acontecimiento ya publicado; una reconsideración es otro intento, con su propia investigación/revisión y sin borrar el archivo original.

## Corregir y reauditar

`--record-review` conserva el informe y devuelve la próxima acción sin tratar un rechazo como una cancelación. Con `changes_required`, ejecutar `--revise` y devolver feedback al **mismo autor**. Cambiar sólo lo necesario: conservar investigación, redacción e imágenes válidas. Registrar el nuevo completion real, ejecutar `--review` y pedir nueva auditoría al **mismo auditor**. El informe final documenta IDs materiales resueltos, antes/después del mismo objeto y evidencia, conforme al contrato factual. Corregir también tweet, alt o pie si contienen el dato objetado.

Se conservan todos los snapshots, reportes adversos y observaciones, aunque se reescriba el informe vigente. Si se repiten los mismos hallazgos sobre el mismo contenido/evidencia, el checkpoint marca estancamiento. `--revise` exige entonces `correction-plan.json` con `strategy` distinta y `evidence` nueva; no se puede congelar otra vez el mismo paquete sin avances. Si ya no hay una solución razonable, `--assess-viability` congela una evaluación explícita por el mismo auditor: puede proponer otra corrección concreta o justificar inviabilidad, pero no aprobar el paquete sin avances. No permite repetir esa evaluación sobre el mismo contenido. No hay máximo arbitrario de rondas con avances reales ni de candidatos legítimos; el mismo paquete sin avances no puede formar un bucle infinito.

Con un rechazo de candidato, ejecutar `--switch-topic`. Archiva investigación completa, nota, recursos, informes, snapshots, manifiesto de bytes/hashes y evidencias antes de retirar sólo los archivos nuevos no publicados de ese intento. Luego abre otro ID, journal y preparación sin los hallazgos anteriores. Mantiene el registro diario de descartados. Plan B/C vuelve a pasar todo el preflight y revisión; no reutiliza una aprobación ajena. Antes de retirar originales, verifica los bytes/hashes del archivo; sólo repara una copia ausente/alterada si el original coincide exactamente con el manifiesto. Los commits locales propios aún no publicados quedan preservados en una referencia Git del intento; un reset mixed acotado conserva los archivos para archivarlos, sin tocar commits de main ni usar force. Una transacción interrumpida en `switching_topic` se completa al reanudar `--prepare` o `--switch-topic`.

## Publicar y recuperar

Sólo un `approved` completo permite validar/publicar. El estado imprime `validationCommand`: `--dry-run` si no hubo prueba técnica; `--revalidate` si existe una prueba previa, fallida o anterior a correcciones; después `--publish` sobre la misma preparación. Se mantienen alcance, validación editorial, Astro/build/Playwright, rebase seguro sin force, Pages real antes de X y deduplicación/recuperación de Buffer. El preflight registra el historial comprobado antes de investigar; cambios concurrentes durante la investigación se contrastan nuevamente en la auditoría final. `historyRef` permite abrir el blob exacto con `git show SHA:ruta` si el worktree todavía no integra ese archivo. Si main incorpora nuevas notas, el historial cambia y exige nueva revisión; una actualización ajena sin cambios editoriales no fuerza otra redacción. `--revalidate` integra y valida la misma preparación.

El recibo `reports/daily-editorial/FECHA.json` conserva `editorialJourney`, intentos, documentos de los descartados, snapshots, evidencias y manifiestos, además de la revisión factual vigente. Los bytes visuales descartados permanecen en el archivo del entorno cloud; sus hashes/procedencia y condiciones quedan en el registro versionado. Los journals se escriben con transacción recuperable; un espejo alterado sin transacción pendiente bloquea. Los locks con propietario local muerto se archivan automáticamente, sin desplazar una ejecución viva.

El checkpoint permite reanudar interrupciones en el mismo entorno persistente. Si el proveedor destruye el workspace antes del push, o no permite volver a contactar los mismos agentes nativos, no se declara una recuperación inexistente: conservar los datos accesibles e informar el bloqueo. Tampoco se publica sin Max, cuota incluida, herramientas, fuentes, permisos o aprobación independiente. Ningún test demuestra por sí solo verdad semántica o una licencia; la revisión nativa independiente sigue siendo obligatoria.
