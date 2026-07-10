# Comunidad: La Sala

La Sala es el foro temporal de Cine Posta. Se ejecuta sobre el Supabase que ya usa el sitio para los puntajes: no hay proveedor de comentarios, backend nuevo, cuentas visibles ni perfiles públicos.

## Funcionamiento

- `/comunidad/` muestra discusiones recientes y dirige a la discusión de cada película.
- Cada ficha tiene el enlace **Abrir discusión**.
- La ruta `/comunidad/peliculas/<slug>/` es la única discusión para esa película. El primer mensaje crea su hilo y la restricción `unique(movie_slug)` evita duplicados.
- Las personas escriben un apodo y un mensaje; no se guardan mensajes ni apodos en `localStorage`.
- Supabase Anonymous Auth crea una identidad técnica por navegador, sin pantalla de login. Sirve exclusivamente para aplicar límites y vincular respuestas.
- Las respuestas se agrupan debajo del mensaje original y el navegador actualiza la lista cada 25 segundos sin recargar la página.

## Retención y límites

- Publicación inmediata; no hay cola de revisión.
- Máximo 3 mensajes por identidad anónima cada 10 minutos.
- Máximo 600 caracteres por mensaje y 32 por apodo.
- Sin HTML, adjuntos ni imágenes.
- Cada hilo conserva como máximo 200 mensajes y los mensajes vencen a los 60 días.
- El cron diario borra los vencidos y, tras 61 días, las identidades anónimas que ya no tienen mensajes. Supabase no elimina estas identidades automáticamente.
- Si `pg_cron` no está activo, el tope de 200 sigue evitando crecimiento indefinido, pero hay que habilitarlo para cumplir la retención exacta.

## Activación manual

1. Abrí el SQL Editor del proyecto Supabase existente y ejecutá [community_messages.sql](../supabase/sql/community_messages.sql).
2. En Supabase Authentication, habilitá **Anonymous sign-ins**.
3. Recomendado: activá CAPTCHA de Turnstile en Supabase Auth. Creá un widget gratuito de Cloudflare Turnstile y configurá allí su secret; ese secreto no va al repositorio.
4. Para desarrollo local, agregá a `.env`:

   ```bash
   PUBLIC_COMMUNITY_ENABLED=true
   PUBLIC_TURNSTILE_SITE_KEY=tu-site-key-publica # opcional, requerida si activaste CAPTCHA
   ```

5. Para GitHub Pages, configurá las variables de repositorio `PUBLIC_COMMUNITY_ENABLED=true` y, si corresponde, `PUBLIC_TURNSTILE_SITE_KEY`. El workflow ya las expone al build.
6. Reiniciá `npm run dev`, abrí una ficha de película y elegí **Abrir discusión**.

Para desactivarlo temporalmente, usá `PUBLIC_COMMUNITY_ENABLED=false` y reconstruí el sitio. La Sala seguirá navegable, pero no inicializará Supabase ni permitirá publicar.

## Moderación y operación

La publicación es instantánea por decisión editorial. Desde el panel de Supabase se puede ocultar un mensaje cambiando `status` a `hidden` o borrándolo. No otorgues a navegadores permisos directos sobre las tablas: la migración revoca esos permisos y sólo expone dos RPCs con validaciones.

El límite por identidad no reemplaza un CAPTCHA: sin Turnstile, una persona maliciosa puede crear nuevas identidades anónimas. Revisá periódicamente los mensajes, especialmente al inicio. No expongas nunca la service-role key; el sitio sólo utiliza la publishable/anon key existente y RLS.

## Futuro

El esquema ya separa `community_threads` de `community_messages`, por lo que se puede sumar a la portada una lista real de hilos activos, votos o reportes sin migrar contenido. Antes de agregar imágenes, notificaciones o mensajes privados hay que revisar costos, privacidad y moderación.
