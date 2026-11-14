# Instagram diario de CinePosta

El workflow `.github/workflows/publish-buffer-instagram.yml` conserva el cron **18:15 ART** (`15 21 * * *`) y Buffer publica **19:15 ART** (`22:15 UTC`). Prepara **la edición de mañana**, una por ejecución: la anticipación absorbe demoras del cron sin cambiar la publicación. Normalmente hay una edición futura; durante una hora pueden coexistir la de hoy y la de mañana. Funciona con la PC apagada.

GitHub puede demorar o perder un cron: no hay garantía absoluta. Si se pierde más de un día, recuperar sólo una franja futura vacía. Nunca trasladar una reserva vencida ni repetir una mutación ambigua. La automatización, configuración, historial y claves de **X permanecen intactos**.

## Incidente del 13/11/2026

El [run 43540537062](https://github.com/Clovhis/sucuplecuc/actions/runs/43540537062), previsto para 21:15 UTC, se creó el 14/11 a las 01:25:48 UTC (**13/11, 22:25:48 ART**): más de cuatro horas tarde. La preparación a las 22:26 ART omitió la franja vencida antes de consultar Buffer. El historial quedó vacío. Actions informó success porque los skips terminaban con exit 0. No fue un error de clave ni de activación. Hubo un Reel manual enviado el 13/11; faltó la edición diaria automática.

El 14/11 se comprobaron workflow activo, `BUFFER_INSTAGRAM_AUTOPUBLISH_ENABLED=true`, organización **My organization** `6a9d88d88ecb84720dd91cc1`, canal profesional `@cineposta.ar` `6af6465a62b70b94b0105899`, conectado, desbloqueado, cola habilitada y `defaultToReminders=false`. El [check con el secret real de Actions](https://github.com/Clovhis/sucuplecuc/actions/runs/43593537937) pasó con dos posts históricos y cero pendientes. OAuth MCP y secret de Actions se comprobaron por separado; no se rotó ninguna clave.

## Sistema editorial

`scripts/lib/instagram-editorial.mjs` combina cuatro familias y cuatro paletas: carbón/coral, papel/tinta roja, azul/lima y ciruela/durazno. Incluye ilustración a todo el ancho, número protagonista y tarjetas numeradas. La ilustración geométrica se genera localmente, sin IA ni costos; no pretende ser un fotograma.

- **Deslizá para descubrir:** portada + cinco películas relacionadas por género, director o recorrido histórico.
- **En primer plano:** una película, ilustración grande, título y mirada concreta de su reseña.
- **Score CinePosta:** número de la ficha, escala /10 y etiqueta canónica. Requiere score ≥8 para este formato.
- **Doble función:** portada + dos películas del mismo género. No inventa un ranking.

Los formatos compiten según candidatos e historial, sin rotación por día de semana. Penaliza categorías/temas recientes, evita repetir formato consecutivo cuando hay alternativas y cambia paleta. Cada integrante de un carrusel se reserva individualmente; nunca reinicia el historial para reciclar títulos. Recomendaciones con score ≥6, fecha no futura y reseña completa. No modifica el catálogo.

Captions con títulos, años, opinión existente, scores, invitación a conversar/guardar, hasta tres hashtags y URL con UTM **para cada integrante**, para deduplicación remota completa. Si cinco reseñas exceden 2200 caracteres, usa títulos/scores en caption y deja la oración completa en cada placa: no recorta frases. No afirma disponibilidad, plataformas o estrenos a partir de datos almacenados, ni promete enlace en bio sin verificarlo.

## Derechos y calidad

JPEG sRGB **1080×1350**, ratio 4:5, menos de 8 MB. Noto Sans local y licencia SIL OFL en `assets/social/`. Texto que no baja de 28 px; si no entra se descarta ese candidato. No renderiza todo el catálogo en el build.

Un póster del catálogo no acredita permiso de adaptación para Instagram. Por defecto se publica **gráfica original de CinePosta**, con texto/datos propios, sin fotogramas, logos de películas ni música ajena. Es una alternativa publicable permanente, no una maqueta pendiente.

`assets/social/instagram-rights.json` permite incorporar fotografías con permiso documentado: `slug`, `path` bajo `public/assets/`, `sha256`, `sourceUrl`, `evidenceUrl`, `credit`, `license`, `socialAdaptationAllowed: true`. Permisos incompletos o hashes cambiados impiden usar esa imagen. La lista actual está vacía. No se heredan permisos de posts anteriores.

## Estado, publicación y recuperación

El job usa GraphQL oficial y el secret existente `BUFFER_API_KEY`. OAuth del MCP es independiente: sólo el `check` de Actions prueba ese secret. No leer ni rotar el valor. Variables: `BUFFER_ORGANIZATION_ID`, `BUFFER_INSTAGRAM_CHANNEL_ID`, `BUFFER_INSTAGRAM_AUTOPUBLISH_ENABLED`. Activar sólo tras check aprobado. Para pausar: `false`, que no cancela posts ya aceptados por Buffer.

La rama `cineposta-instagram-state` es un árbol operativo independiente: `history.json` y `media/`. No se mezcla ni rebasa sobre main, no se reescribe y no dispara Pages. No borrar medios fijados a posts existentes. Historial inicial: `{ "version": 1, "posts": [] }`. El checkout del código no persiste credenciales; el de estado usa `contents: write`.

Antes de reservar/programar se leen todos los estados del canal (hasta 20 páginas de 100), se excluyen todos los slugs y se comprueba la franja argentina y el máximo de 10 pendientes. Borradores/errores también reservan películas. El grupo de concurrencia propio serializa los jobs. No usa el historial ni consume posiciones de X.

Primero se pushean reserva y medios, con formato, tema, paleta, todos los slugs, caption, derechos/hashes y `attemptId`. Después se descarga cada URL pública inmutable `https://raw.githubusercontent.com/Clovhis/sucuplecuc/<SHA>/media/<archivo>.jpg` y se compara SHA-256. Sólo entonces se hace **una mutación** con 1, 3 o 6 imágenes ordenadas. `customScheduled`, `automatic`, `type: post`, hora exacta: los horarios irregulares de la cola de Buffer no influyen.

El recibo persiste incluso tras errores y se guarda en artifact por siete días. El código acepta registros históricos de una imagen. Timeout o reserva sin recibo bloquean otro intento hasta reconciliarlo. Si existe un ID, revisar ese mismo post, no crear otro. Sólo con evidencia inequívoca de ausencia remota puede retirarse manualmente esa reserva no enviada, preservando todos los demás registros.

Se reconcilian recibos anteriores y se advierte sobre errores/reservas viejas; no se reprograman. Los skips por franja vencida, cola llena o reserva inexistente ahora **fallan Actions** y explican el motivo; una edición existente aceptada por Buffer termina correctamente con su ID. El resumen diferencia `prepared`, `existing`, `scheduled`, `checked`. Programado no significa publicado: comprobar `sent` y enlace externo cuando corresponda.

## Operación manual

```powershell
npm run test:buffer:instagram
npm run social:instagram:preview
npm run buffer:instagram
gh workflow run publish-buffer-instagram.yml -f mode=check
# Envíos REALES, sólo para franjas futuras vacías:
gh workflow run publish-buffer-instagram.yml -f mode=publish -f edition=today
gh workflow run publish-buffer-instagram.yml -f mode=publish -f edition=tomorrow
```

`dry-run` es offline, sin secretos ni cambios de historial. `check` consulta Buffer con el secret real, sin crear posts. `publish` es real: `edition=today` permite sembrar hoy y `tomorrow` preparar la edición normal. No usarlo para posts ficticios. Si faltan menos de cinco minutos, no reprograma al día siguiente.

La galería reproducible está en `.tmp/instagram-design/`: cuatro formatos, carrusel completo y `manifest.json` con captions/hashes. Generarla no llama a Buffer. Los generadores manuales `social:media` y `social:reel` siguen disponibles; su capacidad de componer un póster no acredita derechos para publicarlo.

## Compatibilidad y costos

Buffer Free comprobado el 14/11/2026: 3 canales, 10 programados **por canal**, API incluida. Se usan hasta seis imágenes, por debajo de los límites documentados. Un carrusel cuenta como un post. Normalmente seis requests por día, más paginación; cuota compartida con X/MCP. Respetar 429, sin reintentar mutaciones automáticamente.

Reels/Stories existentes quedan para piezas especiales. La edición diaria usa imagen/carrusel para publicación automática sin móvil, música comercial, stickers ni funciones pagas. No agrega servicios, dependencias ni APIs de IA. Runner Linux estándar del repositorio público.

Fuentes oficiales revalidadas el 14/11/2026: [API incluida en Free](https://support.buffer.com/en-us/articles/what-is-buffers-api-GtIYIQilz5), [publicación automática y carruseles](https://support.buffer.com/articles/scheduling-instagram-posts-reels-stories-and-notifications-3XA98S9Q5p), [medios públicos](https://developers.buffer.com/guides/hosting-media.html), [InstagramMetadata](https://developers.buffer.com/types/InstagramPostMetadataInput.html).
