---
name: la-posta-cine-github-mcp
description: Use GitHub MCP as the compact default GitHub interface for Clovhis/sucuplecuc and the shared publication handoff for CinePosta. Trigger for repo PRs, issues, reviews, comments, installations, or authorized GitHub Pages publication; finish once the validated commit reaches main and the Pages build starts.
---

# la-posta-cine-github-mcp

Defaults: `Clovhis/sucuplecuc`, owner `Clovhis`, branch `main`. Do not ask for these unless the user changes them.

Use GitHub MCP first for PR/issue/review/comment/install reads and writes. Use `mcp__github__.push_files` only for an atomic change to one/few final plain-text files after local validation and targeted diff inspection. Read those final files from disk and push only the intended paths.

Use local `git`/`gh` instead for branch creation, history-aware staging, deletions/renames, binary assets, multi-file refactors, or any worktree containing unrelated edits. Avoid doing the same lookup through MCP, web, and shell; report the MCP result directly and keep diffs summarized.

## Publicación con cierre temprano

Este es el cierre predeterminado para toda publicación autorizada de CinePosta, incluidas cargas, auditorías, perfiles, editoriales y cambios de UI. Editar o probar en DEV no autoriza publicar; respetá una autorización ya otorgada.

1. Antes del push, exigí las validaciones pertinentes y un `npm run build` local exitoso del contenido final. Conservá esa evidencia sin repetir un build ya aprobado si sus entradas no cambiaron. Esto comprueba la generación local de las páginas; el build remoto continúa por su cuenta.
2. Publicá sólo el cambio autorizado, conservando las ediciones del bot al actualizar desde `origin/main`. Confirmá el SHA publicado en `origin/main` y dejá el checkout limpio y sincronizado sin descartar trabajo ajeno.
3. Consultá `.github/workflows/deploy.yml` para ese SHA y verificá que su job `build` haya iniciado (`in_progress`), sin fallos ya observados. El workflow en cola o un run de otro commit no alcanza. Hacé como máximo tres consultas compactas de estado en una ventana total de hasta 60 segundos; detenete en cuanto confirmes el inicio. No esperes al paso `Build site`, a que termine el job `build` ni al job `deploy`.
4. Con build local aprobado, push confirmado y build de Pages iniciado, cerrá la tarea como **success** por entrega a GitHub. No marques como `success` una ejecución remota todavía en curso ni afirmes que ya está online. Respondé: «Listo Leo, las validaciones y el build local pasaron. Ahora a esperar que se buildee el sitio: en aprox. 7 minutos debería estar publicado». Agregá el enlace al run; los siete minutos son una estimación.

Después de ese cierre, no sigas esperando ni consultando Actions, no uses `gh run watch`, no dejes monitores en segundo plano ni abras la home, rutas o assets de producción. La comprobación pública queda a cargo de Leo. Esperar el deploy completo o comprobar producción requiere un pedido explícito de seguimiento.

Si al agotar la ventana sigue en cola o no aparece el run, informá push confirmado e inicio pendiente, con el enlace a Actions disponible; no declares el inicio ni el cierre exitoso sin evidencia. Si observás un fallo, reportalo y resolvelo dentro del alcance autorizado antes de dar éxito. Si el run ya terminó al consultarlo, reportá su resultado real sin iniciar comprobaciones de producción.
