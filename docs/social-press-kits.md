# Materiales oficiales para redes de CinePosta

Objetivo: producir Reels con montaje, movimiento, audio y una idea editorial propia sobre estrenos de cine y streaming. Un press kit es una fuente de trabajo; no es una licencia universal para cualquier imagen, canción, territorio o edición. Consultado el **12 de noviembre de 2026**. Revalidar las condiciones al producir una pieza nueva.

## Dónde buscar primero

| Fuente | Qué ofrece / para qué sirve | Acceso comprobado y alcance |
| --- | --- | --- |
| [UIP Argentina](https://uip.com.ar/) | Distribución local, fichas, fechas AR, pósters y enlaces a tráilers oficiales | Sitio público. Confirma datos argentinos; el enlace de YouTube no acredita permiso de descarga/remontaje. Buscar el contacto local para un paquete social/EPK. |
| [Movie Films, prensa](https://moviefilms.com.uy/prensa/) | Kits por película: afiches, fotos, notas de producción y datos técnicos; informa materiales para cobertura de medios | Página pública con invitación expresa a periodistas/medios. El kit de Cómo robar un banco redirigió a login Microsoft. No se accedió ni se eludió. Es distribuidor uruguayo: no usar su fecha/placa territorial como prueba argentina. |
| [Sony Pictures, recursos oficiales de prensa](https://www.sonypictures.com/corp/presscontact.html) | Deriva al [Global Asset Hub](https://globalassethub.sonypictures.com/) para publicidad cinematográfica y a media.sonypictures.com para televisión | Hub B2B; la página oficial invita a registrarse para materiales. No crear cuentas, aceptar contratos ni enviar solicitudes de CinePosta sin el pedido correspondiente. |
| [Sony Pictures Germany](https://www.sonypictures.de/filme/how-to-rob-a-bank) | Galería pública de esta película, fotografías de escena y prensa con créditos y archivos originales | Fotos accesibles. Sus [términos generales](https://intl.sonypictures.com/de/terms-of-use) no dan una autorización abierta para modificar/republicar. Pendiente confirmar alcance de un Reel editorial argentino. No aplicar permisos de Sony Electronics a Sony Pictures. |
| [Amazon MGM Studios Press](https://press.amazonmgmstudios.com/) | Fichas, fotografías, publicity, clips/EPK y contactos según título | El acceso anónimo dio 403 en esta investigación. Registrar la limitación y usar acceso oficial de prensa si CinePosta lo obtiene. No usar cookies exportadas ni saltar un login. |
| [Netflix Media Center](https://media.netflix.com/) | Fichas oficiales, comunicados, assets y acceso de prensa según título | Verificar título, año, país y condiciones del asset. Su How to Rob a Bank de 2024 es un documental distinto: **no** usarlo para la ficción de Leitch de 2026. Una ficha internacional no acredita streaming en AR. |
| [Disney+ Press](https://press.disneyplus.com/) y [Disney UK Press](https://press.disney.co.uk/) | Portales oficiales con fichas, fotos, press kits y contactos; algunas imágenes permiten descarga pública | Condiciones por material; no trasladar permisos de logos a fotos/clip/audio. Confirmar disponibilidad argentina por separado. |
| [Warner Bros. Discovery Pressroom](https://press.wbd.com/us/user/login) | Publicity destinado a periodistas y medios | Login/acreditación. No confundir estar suscripto a HBO Max con acceso o permiso de prensa. |

Para títulos distribuidos por otras empresas, empezar por la página oficial argentina, sus enlaces de prensa y el estudio acreditado. No usar cuentas agregadoras, capturas de streaming, carpetas sin procedencia, torrents ni agencias de imágenes pagas como alternativa gratuita.

## Qué pedir y cómo conservarlo

Los paquetes pueden incluir **key art, unit stills, clips, spots verticales, B-roll, entrevistas EPK, notas de producción y piezas sociales terminadas**. Pedir primero un spot vertical de 15/30 segundos listo para medios o clips expresamente editables. El audio suele venir unido al spot: no asumir que hay música, diálogos o efectos separados ni que se permite extraerlos.

Solicitar al distribuidor: archivo descargable, crédito exacto, embargo, territorio, duración permitida, si admite corte/reencuadre/textos, publicación orgánica en Instagram y si el audio incluido está cubierto para ese uso. Un permiso editorial no necesariamente cubre anuncios pagos. Si hay una instrucción concreta, conservarla literalmente en evidencia privada cuando incluya datos privados; en el repo público guardar sólo una referencia y el alcance, sin correos privados, credenciales o enlaces autenticados.

Una política de prensa o autorización vigente que ya cubra el paquete y el uso propuesto sirve como evidencia: no hace falta pedir un permiso nuevo por cada archivo dentro de ese mismo alcance. Guardar esa referencia permite reutilizar el proceso con otros estrenos sin repetir la gestión.

Por asset registrar en el proyecto:

- `sourcePage`, `url` oficial y fecha de acceso; archivo y SHA-256 de los bytes descargados.
- Obra/título/año, tipo (foto, vídeo, audio), fotógrafo/titular y texto de crédito.
- `rights.status`: `cleared`, `pending` o `restricted`, con `rights.evidence` que explique la autorización **para esa pieza**. “Devuelve 200”, “dice oficial”, “tiene copyright” o “lo usa otro medio” no equivalen a permiso.
- Embargo, territorio y restricciones relevantes. La identidad, disponibilidad AR, acceso técnico y permiso de reutilización son comprobaciones distintas.

Conservar originales en caché local `.tmp/`, respetando las condiciones; no subir al repositorio público un press kit entero ni un enlace firmado. Sólo alojar los medios finales que tengan alcance público resuelto. Se puede preparar una maqueta local para revisión mientras se gestiona el material; debe seguir identificada como pendiente y no pasar a Buffer ni a la rama pública de medios.

## Audio que podemos usar sin un servicio pago

1. Audio de un clip/spot autorizado **dentro del alcance concedido**. Mantener el archivo y crédito del distribuidor. No separar una canción de un tráiler y presentarla como libre.
2. Biblioteca de Instagram, si la cuenta y ese tipo de publicación la ofrecen. La licencia/selección dentro de Instagram no se traslada automáticamente al MP4 alojado en GitHub. El MCP actual no ofrece un selector de canciones. Buffer permite seleccionar música de Reels en su interfaz si Instagram se conectó por Facebook; otra opción es terminar en la app. [Fuente oficial](https://support.buffer.com/en-us/articles/scheduling-instagram-posts-reels-stories-and-notifications-3XA98S9Q5p).
3. Composición y efectos propios. `render-social-reel.mjs` incluye un patrón electrónico original a 120 BPM con percusión, bajo, ticks y transiciones generados localmente, sin samples externos ni música de la película. No es una imitación de una banda sonora ni audio oficial. No requiere IA ni API.

Los primeros generadores del repo hacen placas o secuencias simples de cinco segundos. Para una pieza de estreno con más ritmo, usar un storyboard específico: gancho inmediato, 3–5 ideas visuales, cortes coordinados con el audio y cierre legible hacia la reseña. Evitar una sinopsis larga en pantalla, falsas métricas de seguidores y prometer que la película es mejor de lo que indica su score.

## Producción reproducible

El proyecto piloto está en `reports/social/como-robar-un-banco-2026/project.json`. Contiene fuentes, créditos, caption original y cinco escenas. Ejecución desde la raíz del repo, con FFmpeg gratuito instalado:

```powershell
npm run social:reel -- --project reports/social/como-robar-un-banco-2026/project.json --out .tmp/reel-banco
```

Produce MP4 1080×1920 H.264, 30 fps, AAC estéreo 48 kHz, WAV original, caption, recibo con hashes y cuadros intermedios. El modo por defecto es **maqueta local**. `--release` exige `rights.status=cleared` y evidencia por cada asset antes de descargar/renderizar; no cambia los permisos ni publica por sí mismo. No modificar el estado para saltar un permiso pendiente.

Antes de publicar, inspeccionar todos los planos y cortes, textos en pantalla, safe areas, crédito, destino del enlace, audio no vacío/sin saturación y duración/codecs. Para circulación pública se usa el procedimiento de medios/Buffer de `cineposta-redes-sociales`; para una maqueta con permisos pendientes se comparte sólo el archivo local con Leo. Las automatizaciones de X e Instagram conservan sus horarios y formatos actuales.

## Solicitud de material lista para adaptar

> Hola, somos CinePosta, medio argentino de cine (cineposta.com.ar / @cineposta.ar). Estamos preparando una cobertura editorial del estreno de [título, año] en Instagram. ¿Nos pueden facilitar un spot vertical o clips/fotos de prensa y confirmar si podemos recortar, reencuadrar y sumar texto/marca en un Reel orgánico de 15–30 segundos? Necesitamos también el crédito, embargo/territorio y alcance del audio incluido. Gracias.

Contacto publicado para el kit localizado: `prensa@moviefilms.com.uy`; solicita nombre, medio y contacto para validación. Esto es una plantilla de trabajo: **no se envió ningún mensaje**. Para esta película, priorizar confirmar el alcance con UIP/Sony Argentina; el paquete uruguayo es una ruta adicional, no una autorización argentina ya concedida.
