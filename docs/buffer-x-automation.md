# Publicación diaria en X con Buffer

El workflow `.github/workflows/publish-buffer-x.yml` publica únicamente estrenos de plataformas en Argentina desde `src/data/movies`: fecha de estreno válida dentro de los últimos 30 días, año original actual o anterior y al menos una plataforma. No exige el flag histórico `isPremiere`, ausente en las altas actuales. Una fecha reciente de catálogo no convierte una película antigua en estreno. **Star Trek queda excluido permanentemente**, por slug, título y título original, incluso si se estrena una película nueva. `Cine`/`CINEMA` no son plataformas elegibles; se omiten también cuando la ficha tiene una oferta de streaming. `Otras plataformas` excluye toda la ficha.

Antes de crear cada post, consulta JustWatch con país `AR`, comprueba título y año exactos y usa sólo ofertas vigentes de proveedores representados. Prioriza suscripción/gratis; si sólo hay alquiler/compra, lo aclara en el texto. No convierte canales adicionales o bundles en una suscripción al proveedor base. Una ficha sin coincidencia inequívoca u oferta legal se descarta y se prueba la siguiente; un error de red o de la fuente detiene la ejecución sin publicar. La fuente, modalidad, proveedores y fecha de comprobación quedan en el historial. La ausencia de evidencia específica en JustWatch (por ejemplo, Flow) no autoriza inferir disponibilidad. No modifica las fichas.

Exige título, año, reseña, un `cinepostaScore` válido y un póster local existente en `public/assets/posters`. El formato es breve y rioplatense: disponibilidad, una línea editorial concreta, score canónico con número y nombre (`8 - Excelente`, por ejemplo), enlace directo a la ficha y hasta dos hashtags de descubrimiento según categoría, géneros y subgéneros. Las variantes ortográficas de la taxonomía se normalizan a una etiqueta estable; si falta un mapeo, usa `#Cine`.

El script no modifica contenido editorial. Su historial operativo está en `.github/cineposta-buffer-x-history.json`; una película queda excluida apenas se programa. Antes de crear una publicación, también revisa los últimos 100 posteos de Buffer, reconoce los enlaces de Cine Posta y confirma que la franja de las 19:00 ART esté libre. Así un reintento no duplica el post ni crea un segundo post del día aunque falle el commit del historial.

El texto tiene un máximo interno de 250 caracteres ponderados para dejar margen a Buffer/X. El adelanto usa únicamente la primera oración completa de la reseña: primero intenta quitar la introducción editorial y abreviar el arranque para que entre. Si aun así no cabe, o la fuente no tiene una oración cerrada, omite el adelanto y conserva disponibilidad, score, enlace y hashtags. Nunca corta una oración ni agrega puntos suspensivos para ajustarla al límite.

## Recomendaciones y críticas negativas

La selección prioriza películas con `cinepostaScore` de **6 a 10** entre los estrenos elegibles que todavía no se publicaron. Dentro de ese grupo mantiene el orden por fecha de estreno. Un estreno de 1 a 5 nunca desplaza a una recomendación disponible, aunque sea más reciente.

Sólo si no quedan películas elegibles sin publicar con 6 o más, usa una de 1 a 5 como **crítica negativa**. El arranque dice explícitamente «mediocre» para un 5, «mala» para un 4 y «malísima» para un 1 a 3. Esas publicaciones no usan invitaciones como «¿Qué mirar?», «Plan de peli» o «Anotá esta»; el formato abreviado para títulos largos conserva la crítica. Siempre mantiene el score y su nombre canónico, por ejemplo `5 - Regular`, sin inventar una valoración nueva. Las películas sin score entero de 1 a 10 quedan excluidas.

El historial y las exclusiones de Buffer se aplican antes de decidir si hay recomendaciones disponibles. El cambio del generador se aplica a futuros posteos; los que ya están programados conservan su texto.

## Vista previa local

```bash
npm run buffer:x
```

Es el modo por defecto y no lee la clave ni llama a Buffer. Muestra el texto, el póster, la ficha, la hora y el peso estimado para X.

La vista previa es local y provisional: la oferta argentina se confirma al publicar, de modo que el proveedor o la película pueden cambiar si la evidencia vigente no coincide con el catálogo.

## Publicación inmediata

El modo manual del workflow `publish-now` envía una sola película con `shareNow`, sin esperar a las 19:00 AR. Conserva los filtros, la comprobación legal AR y la protección contra repetir una película del historial o de Buffer. `publish` mantiene el horario diario. El modo inmediato no cancela ni regenera publicaciones ya programadas: revisar la cola antes de usarlo para reemplazar un post eliminado. El log distingue `submitted-now` de `sent`: confirmar la publicación final y su enlace en Buffer/X.

```bash
npm run buffer:x -- --publish-now
```

## Habilitación única

1. Revocá la clave que se compartió por chat y creá una nueva en Buffer, con nombre `GitHub Actions Cine Posta X` y sólo los permisos `postsRead` y `postsWrite`.
2. En `Clovhis/sucuplecuc` → Settings → Secrets and variables → Actions, creá el secret `BUFFER_API_KEY` con esa nueva clave. Nunca lo guardes en un archivo del repositorio.
3. Confirmá que `@cineposta` esté conectado en Buffer y configurá las variables de repositorio `BUFFER_ORGANIZATION_ID` y `BUFFER_X_CHANNEL_ID` con sus IDs de Buffer. De ese modo la clave queda limitada a `posts:read` y `posts:write`; no necesita leer datos de cuenta para descubrirlos. Si omitís alguna, el script intenta descubrir el canal, lo que requiere además `account:read`.
4. Ejecutá manualmente el workflow con `mode: dry-run` y revisá el log. Esa opción no se comunica con Buffer.
5. Cuando la vista previa esté aprobada, agregá la variable de repositorio `BUFFER_X_AUTOPUBLISH_ENABLED=true`. El schedule queda activo todos los días a las 18:30 ART y Buffer recibe una publicación con hora fija 19:00 ART (22:00 UTC).

La clave personal de Buffer puede durar como máximo un año. Para esta automatización de una sola cuenta es más robusta que OAuth: OAuth entrega access tokens de una hora y refresh tokens de un solo uso, que requieren almacenamiento mutable y rotación atómica. Anotá un recordatorio antes del vencimiento para crear una clave nueva y reemplazar sólo el secret.

## Pausa y recuperación

Para pausar la automatización sin borrar nada, quitá o cambiá `BUFFER_X_AUTOPUBLISH_ENABLED` a cualquier valor distinto de `true`. Si Buffer devuelve un error de canal o de permisos, el workflow falla sin agregar la película al historial, por lo que se puede corregir la conexión y reintentar sin perder el post.
