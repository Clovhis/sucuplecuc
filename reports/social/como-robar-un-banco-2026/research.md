# Cómo robar un banco (2026): investigación y Reel piloto

Fecha de investigación: **12/11/2026, Argentina**. Identidad: How to Rob a Bank, David Leitch, Nicholas Hoult / Zoë Kravitz, ficción de 2026. No es el documental de Netflix de 2024 ni la película de 2007.

## Hallazgos comprobados

| Fuente | Comprobación | Resultado operativo |
| --- | --- | --- |
| [UIP Argentina](https://uip.com.ar/peliculas/como-robar-un-banco/) | Título, año, director, estreno 12 de noviembre y dos enlaces a tráilers oficiales | Fuente local del estreno. No ofrece una descarga pública de EPK ni permiso de remontaje visible en la ficha. |
| [Sony Pictures Germany](https://www.sonypictures.de/filme/how-to-rob-a-bank) | Sección Szenenbilder, JPEG originales, nombres de personajes y créditos individuales | Se descargaron fotos para la maqueta local. Fotógrafa Megan Schoenbachler; © 2026 Amazon Content Services LLC. Los hashes exactos se generan en el recibo. |
| [Términos Sony](https://intl.sonypictures.com/de/terms-of-use) | Los términos generales limitan reproducción, modificación y publicación salvo autorización aplicable | No se declara esta adaptación como públicamente autorizada. Falta aclarar el alcance de los materiales de prensa para un Reel editorial argentino. |
| [Movie Films, prensa](https://moviefilms.com.uy/prensa/) | Página destinada a medios, kit específico y contacto de prensa | El enlace del kit redirige a Microsoft Login; no se accedió, no se usaron sesiones ajenas ni se solicitaron credenciales. Fuente uruguaya; no usar como prueba de disponibilidad AR. |
| [Sony, recursos de prensa](https://www.sonypictures.com/corp/presscontact.html) | La ruta oficial cinematográfica es Global Asset Hub | Hub B2B, posible acreditación. No se creó una cuenta ni se aceptaron condiciones. |
| [Amazon MGM Press](https://press.amazonmgmstudios.com/) / Cineimage | Respuesta anónima 403 | Registrado sin intentar eludir controles. |
| Gmail de CinePosta | Búsqueda desde agosto de 2026 por título en español/inglés | Sin correos coincidentes que aportaran material o autorización. No se enviaron solicitudes. |
| Buffer MCP oficial | OAuth válido; lista de Instagram consultada incluyendo todos los estados | Sin posts previos en @cineposta.ar en la consulta de esta tarea. No se creó ni envió un post de prueba. |

Se encontraron fotos de escena y rutas de EPK/press kit; **no** una pista de banda sonora o efectos separados con permiso comprobado de reutilización. El Reel usa composición procedural original, sin voces, canciones, samples ni audio del film.

## Pieza preparada

Storyboard: `project.json`. Gancho: «El botín no les alcanza / También quieren hacerse virales». Desarrollo: atracos, exposición y persecución; cierre con título, director, score canónico **7 · Muy buena** y reseña de CinePosta. Fecha escrita como 12 de noviembre para que no dependa de publicar “hoy”.

Formato: 20 segundos, cinco escenas de 3/3/4/4/6 segundos, fotografías con movimiento, entrada de textos y cortes coordinados con audio original a 120 BPM. MP4 vertical 1080×1920, H.264 yuv420p, 30 fps; AAC estéreo 48 kHz. Se puede regenerar con el comando de `docs/social-press-kits.md`.

Verificación del archivo final: 4.202.493 bytes; duración exacta 20 segundos; movimiento medido dentro de un mismo plano (diferencia RGB media 4,23 entre segundos 1 y 2); cinco planos revisados en segundos 1/4/7/11/17. Audio decodificado no vacío, -17,73 LUFS integrados y -2,06 dBTP de pico verdadero. Evidencia estructurada en `qa.json` y hashes/fuentes en `render-receipt.json`. La escucha final y aprobación estética de Leo pueden hacerse abriendo el MP4 local; no se presenta una medición como si fuera una escucha humana.

Estado: **maqueta local, pendiente de aclaración de derechos visuales para publicación**. `rights.status=pending` en los cuatro assets; el renderer impide `--release`. No se subió a la rama pública de medios ni a Buffer y no se alteraron automatizaciones. Un HTTP 200, un crédito o una galería pública no se registraron como autorización de edición.

Para dejarla lista para publicación: obtener del distribuidor un spot/clip autorizado o confirmar el uso editorial/adaptación de estas fotos, guardar evidencia y restricciones, actualizar el proyecto sólo conforme a esa evidencia, renderizar de nuevo y comprobar duplicados/canal antes de enviar. No es necesario contratar un servicio ni alterar el secret compartido con X.
