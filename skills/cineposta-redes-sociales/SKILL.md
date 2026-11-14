---
name: cineposta-redes-sociales
description: Publicar, programar y preparar borradores de películas y notas de CinePosta en X e Instagram mediante Buffer MCP; crear placas, carruseles, Stories y Reels con el catálogo, consultar cola y estados y evitar duplicados.
---

# Redes sociales de CinePosta

Usá el MCP oficial `https://mcp.buffer.com/mcp` para las operaciones de los agentes. Cuentas: X `@cineposta`, Instagram `@cineposta.ar`, organización `My organization` de CinePosta. El catálogo y las notas del repositorio son las fuentes editoriales. Localizá su raíz (`C:\WebsitePeliculas` en la PC de Leo); no ejecutes comandos relativos a la carpeta de instalación de esta skill.

## Resolver el pedido y conectar

- «En redes» / «X e Instagram» significa las dos cuentas. Si el usuario nombra una, operá sólo esa. «Publicá» autoriza publicar ese contenido ahora; «programá» necesita fecha/hora concreta, en Argentina; «prepará» / «borrador» no autoriza enviar. Si falta un dato esencial, avanzá con las piezas y pedí sólo ese dato.
- Descubrí las herramientas Buffer disponibles. Con `get_account`, `list_channels` y `get_channel`, verificá organización, servicio, handle, conexión, bloqueo y capacidad automática. Reutilizá IDs y respuestas de la misma tarea; no publiques por nombre aproximado. Si hay varias organizaciones, elegí la que contiene las cuentas verificadas de CinePosta.
- Si falta Buffer o devuelve 401, leé [references/buffer.md](references/buffer.md). Usá OAuth oficial; no extraigas tokens de sesiones ni leas secretos de Codex. Un chat existente puede necesitar reconexión o una sesión nueva para cargar las herramientas.
- Consultá con `list_posts` las publicaciones del canal y todos los estados, paginando lo necesario, antes de escribir. Buscá URL canónica/slug, campañas UTM, texto y contenido de carruseles. Incluí borradores, errores y envíos en curso. Si ya existe, informá el ID/estado y retomá ese mismo post cuando esté autorizado; no crees otro para sortear un error. Las dos plataformas tienen recibos independientes: si una falla, reintentá sólo esa.

## Preparar algo que valga la pena leer

- Abrí la ficha en `src/data/movies/<slug>.json` o la nota de `src/data/editorials/<slug>.json`. «Última nota» es la de mayor fecha publicada, sin fechas futuras en Argentina; resolvé empates leyendo sus datos. No cambies el contenido del sitio para acompañar un post.
- Conservá el punto de vista de la reseña. Elegí una idea concreta, sin spoilers importantes, con castellano rioplatense natural. No inventes personajes, premios, citas, fechas, scores ni disponibilidad. `cinepostaScore` entero 1–10 y la etiqueta de `src/lib/cineposta-score.ts` son canónicos; si no hay score, omitilo. No conviertas una crítica negativa en recomendación.
- X: un gancho breve, una observación propia y enlace directo; 1–3 hashtags específicos, sin repetir título tres veces. Usá el margen de 250 caracteres ponderados del repositorio (`weightedXLength` en `scripts/publish-buffer-x.mjs`). Star Trek permanece excluido de X. No reutilices el workflow diario para una publicación manual.
- Instagram: desarrollá la idea con más aire, una invitación pertinente a guardar/comentar y hasta 3 hashtags. El caption admite 2200 caracteres. No digas «enlace en bio» sin verificar que realmente apunta a CinePosta; podés indicar el dominio y el título para buscar. Los enlaces del caption no son clicables: incluí la URL directa también como identidad de contenido y agregá UTM para medir enlaces compartidos. Escribí una versión propia para cada red.
- No afirmes «ya está en Netflix», «estreno» o «en cines» a partir de un dato viejo. Para disponibilidad actual verificá JustWatch AR y, si hace falta, la plataforma oficial; para salas aplicá CABA/PBA y cadenas del AGENTS.md. Si el pedido no necesita esa afirmación, enfocá la publicación en la película y su reseña.
- Usá pósters y portadas locales que correspondan a la obra, conservando proporciones, identidad y atribución/licencias aplicables. No descargues imágenes arbitrarias. Una nota nueva del sitio requiere `cineposta-editorial`; promocionar una nota existente se resuelve acá.

## Elegir formato y enviar

Leé [references/formatos.md](references/formatos.md) para placas, carruseles, Stories, Reels y alojamiento de archivos. Para estrenos con clips, fotos de escena o audio, leé [references/prensa.md](references/prensa.md) antes de buscar materiales. Priorizá un storyboard propio con gancho inmediato, montaje, movimiento y audio pertinente; el generador de placas es una opción simple, no el formato obligatorio de Instagram. Hay generadores locales gratuitos (`npm run social:media` y `npm run social:reel`), sin API de IA. Revisá visualmente los archivos antes de adjuntarlos. Un MP4 real es necesario para un Reel; una imagen vertical sigue siendo imagen.

Con las piezas listas y dentro de la autorización del pedido:

1. Confirmá que la URL de destino y los assets públicos existan y correspondan al contenido. Para programar, los archivos deben permanecer accesibles hasta el envío. Nunca mandes rutas locales ni URLs temporales como assets.
2. Respetá el esquema **actual** de `create_post`/`edit_post`. Una operación por canal. Para Instagram enviá `metadata.instagram.type` (`post`, `story` o `reel`) y `shouldShareToFeed`; `reel` requiere vídeo. Usá `automatic` sólo si el canal/formato lo permite; `notification` requiere que el usuario quiera terminar a mano. Un recordatorio no cumple un pedido de automatización.
3. Inmediato: `mode: shareNow`. Fecha concreta: `customScheduled` y `dueAt` ISO con zona (`-03:00`), siempre futuro, anclado al día actual de Argentina. Borrador: `saveToDraft: true`. No uses `addToQueue` para reemplazar una hora exacta.
4. Guardá el ID y estado devueltos antes de cualquier otra acción. Un timeout de creación puede haber creado el post: buscá ese contenido antes de reintentar; si sigue ambiguo, detené el envío. No elimines ni reprogrames contenido ajeno al pedido.
5. Para inmediato, comprobá con `get_post` sólo si la respuesta todavía no demuestra `sent`. Informá publicación pendiente si sigue `scheduled`/`sending`; «publicado» requiere `sent`, con enlace externo si Buffer lo devuelve. Para programación o borrador, el recibo devuelto basta para afirmar que quedó guardado en ese estado.

Reportá por red: contenido, tipo, hora AR si corresponde, ID Buffer, estado y enlace externo disponible. No confundas una placa local, un borrador, un post programado y un envío real.

## Automatización y costos

La automatización diaria de X es ajena a esta skill: no cambies sus scripts, horarios, historial, variables ni secretos para un pedido social. Instagram tiene `.github/workflows/publish-buffer-instagram.yml`, 19:15 AR, historial y medios en la rama `cineposta-instagram-state`. Consultá `docs/buffer-instagram-automation.md` sólo si el pedido afecta su operación; publicar manualmente no autoriza cambiar la agenda ni activar un job.

Instagram diario prepara **mañana** a las 18:15 AR y conserva 19:15 AR de publicación. Usa imágenes reales obligatorias en carrusel, protagonista, score, doble función y ranking (`scripts/lib/instagram-editorial.mjs`). Sin imagen autorizada, elige otra película; no publica gráficos abstractos. El registro v2 `assets/social/instagram-rights.json` y `docs/instagram-image-rights.md` conservan permisos, fuentes, créditos, hashes, territorio y vencimientos. TMDB sólo localiza; no concede derechos del estudio. Los retratos se rotulan como archivo. `npm run social:instagram:preview` genera ejemplos. Para reparar posts programados, editar sus mismos IDs con URLs inmutables y todos los campos de Instagram requeridos; conservar versiones previas en `mediaRevisions` del historial y guardar el recibo. No reprogramar atrasos.

Buffer Free: verificá límites vivos con `get_account`; la cuenta comprobada admite 3 canales y 10 programados **por canal**. No contrates planes, regeneres la clave compartida con X ni uses funciones pagas (por ejemplo primer comentario). Reels sin música o con audio de derechos comprobados; stickers, enlaces y música que requieran terminación móvil se ofrecen como opción manual, sin prometer publicación automática.
