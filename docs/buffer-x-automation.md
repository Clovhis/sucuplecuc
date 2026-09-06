# Publicación diaria en X con Buffer

El workflow `.github/workflows/publish-buffer-x.yml` toma únicamente películas reales de `src/data/movies`. Exige título, año, reseña, veredicto y un póster local existente en `public/assets/posters`. Arma una publicación corta desde la primera oración de la reseña, conserva el veredicto y enlaza la ficha por su `slug`.

El script no modifica contenido editorial. Su historial operativo está en `.github/cineposta-buffer-x-history.json`; una película queda excluida apenas se programa. Antes de crear una publicación, también revisa los últimos 100 posteos de Buffer, reconoce los enlaces de Cine Posta y confirma que la franja de las 19:00 ART esté libre. Así un reintento no duplica el post ni crea un segundo post del día aunque falle el commit del historial.

## Vista previa local

```bash
npm run buffer:x
```

Es el modo por defecto y no lee la clave ni llama a Buffer. Muestra el texto, el póster, la ficha, la hora y el peso estimado para X.

## Habilitación única

1. Revocá la clave que se compartió por chat y creá una nueva en Buffer, con nombre `GitHub Actions Cine Posta X` y sólo los permisos `postsRead` y `postsWrite`.
2. En `Clovhis/sucuplecuc` → Settings → Secrets and variables → Actions, creá el secret `BUFFER_API_KEY` con esa nueva clave. Nunca lo guardes en un archivo del repositorio.
3. Confirmá que `@cineposta` esté conectado en Buffer y configurá las variables de repositorio `BUFFER_ORGANIZATION_ID` y `BUFFER_X_CHANNEL_ID` con sus IDs de Buffer. De ese modo la clave queda limitada a `posts:read` y `posts:write`; no necesita leer datos de cuenta para descubrirlos. Si omitís alguna, el script intenta descubrir el canal, lo que requiere además `account:read`.
4. Ejecutá manualmente el workflow con `mode: dry-run` y revisá el log. Esa opción no se comunica con Buffer.
5. Cuando la vista previa esté aprobada, agregá la variable de repositorio `BUFFER_X_AUTOPUBLISH_ENABLED=true`. El schedule queda activo todos los días a las 18:30 ART y Buffer recibe una publicación con hora fija 19:00 ART (22:00 UTC).

La clave personal de Buffer puede durar como máximo un año. Para esta automatización de una sola cuenta es más robusta que OAuth: OAuth entrega access tokens de una hora y refresh tokens de un solo uso, que requieren almacenamiento mutable y rotación atómica. Anotá un recordatorio antes del vencimiento para crear una clave nueva y reemplazar sólo el secret.

## Pausa y recuperación

Para pausar la automatización sin borrar nada, quitá o cambiá `BUFFER_X_AUTOPUBLISH_ENABLED` a cualquier valor distinto de `true`. Si Buffer devuelve un error de canal o de permisos, el workflow falla sin agregar la película al historial, por lo que se puede corregir la conexión y reintentar sin perder el post.
