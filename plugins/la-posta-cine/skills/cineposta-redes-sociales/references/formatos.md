# Medios para redes

El generador del repositorio compone arte real del catálogo, logo y texto editorial. No genera imágenes por IA ni inventa fotogramas. Ejecutalo desde la raíz del repositorio; para textos originales de agentes podés adaptar la pieza manteniendo datos canónicos y revisarla antes de enviar.

```powershell
npm run social:media -- --slugs the-shining-1980 --format feed --out .tmp/social-feed
npm run social:media -- --slugs the-shining-1980 --format story --out .tmp/social-story
npm run social:media -- --slugs the-shining-1980,the-thing-1982 --format reel --out .tmp/social-reel
```

Verificá previamente que los slugs existan. `manifest.json` incluye rutas, alt, score y URL. Feed produce JPEG sRGB 1080×1350; Story 1080×1920. Varios slugs con `feed` producen placas ordenadas para un carrusel. El helper admite hasta diez títulos por pieza, un límite conservador propio.

Reel crea un MP4 H.264, yuv420p, 30fps, cinco segundos por película, sin audio. Necesita FFmpeg instalado (gratuito; ya disponible en la PC de Leo). Si falta, usá una distribución oficial o ofrecé carrusel. No agregues dependencias pagas ni descargues música sin derechos. Inspeccioná principio, cambios y cierre del vídeo, además de su duración/codec; `--out` debe ser nuevo para no sobrescribir un Reel existente.

## Capacidades

| Pieza | Asset MCP | Metadatos Instagram | Condición |
| --- | --- | --- | --- |
| Feed | Una imagen | `type: post`, `shouldShareToFeed: true` | JPG/PNG válido; caption ≤2200 |
| Carrusel | Varias imágenes ordenadas | `type: post`, `shouldShareToFeed: true` | Mismo ratio en todas; cuenta profesional |
| Story | Imagen/vídeo vertical | `type: story`, `shouldShareToFeed: false` | Texto visual integrado en imagen; sin prometer sticker/enlace automático |
| Reel | Un vídeo MP4 real | `type: reel`, `shouldShareToFeed: true` | Vertical, duración/formato dentro de límites actuales |

La posibilidad técnica no garantiza derechos de reutilización de clips o audio. Preferí placas animadas con material del catálogo. Las funciones que dependen de recordatorio móvil no se llaman automáticas. El primer comentario requiere plan pago: mantené el texto/hashtags en el caption.

## URLs públicas sin otro servicio

Buffer **no acepta archivos subidos por la API/MCP**: necesita URLs públicas estables y las vuelve a descargar al publicar. Para pósters/portadas ya desplegados, verificá la URL de `https://www.cineposta.com.ar/<asset>`. Para placas/vídeos nuevos, usá la rama operativa `cineposta-instagram-state` del repositorio público; no publiques assets nuevos en main sólo para resolver un post.

Para alojar una pieza autorizada, trabajá en un checkout separado de esa rama bajo `.tmp/`, copiá únicamente los medios revisados a `media/` con un nombre nuevo identificable (fecha y hash), commit y push sin force. Actualizá desde la rama remota primero, conservá `history.json` y los medios anteriores; si el push es rechazado, integrá el avance y verificá de nuevo. No alteres el checkout principal ni mezcles el historial del job diario con posts manuales. El registro de duplicados manuales vive en los propios posts de Buffer; conservá también los recibos de la tarea cuando corresponda.

URL de cada medio: `https://raw.githubusercontent.com/Clovhis/sucuplecuc/<SHA_INMUTABLE>/media/<archivo>`. Descargala y comprobá tipo, dimensiones y hash antes de crear el post. El SHA hace que otro push no cambie el asset programado. No borres ni reescribas la rama ni su historial. No crees URLs temporales, enlaces de vista previa o data URLs. Para archivos grandes, no supongas que GitHub admite el tamaño: el Reel de placas es pequeño; si excede límites, comprimí antes de subirlo.

Fuentes: [medios alojados](https://developers.buffer.com/guides/hosting-media.html), [Instagram en Buffer](https://support.buffer.com/en-us/articles/using-instagram-with-buffer-YSjg2dXFV8), [metadatos Instagram](https://developers.buffer.com/types/InstagramPostMetadataInput.html). Revalidá límites si la API rechaza un formato; no pagues para sortearlo.
