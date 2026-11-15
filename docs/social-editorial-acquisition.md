# Adquisición editorial y permisos reutilizables

La política del 15/11/2026 permite trabajar como medio cinematográfico: una autorización de fuente o un paquete oficial distribuido para prensa se evalúa una vez y se reutiliza dentro de su alcance. No exige obtener una nueva carta por cada fotografía. No convierte una API, la nacionalidad extranjera, una galería de fans ni un crédito aislado en permiso.

## Fuentes y niveles de evidencia

`public.social_media_grants` y `assets/social/source-grants.json` registran fuente/paquete, emisor, estado, evidencia/hash, películas admitidas, territorio, vencimiento y condiciones de composición. `social_media_assets.grant_id` tiene FK al permiso. Las 28 fotos históricas conservan sus permisos individuales. El consumidor consulta condiciones actuales de la fuente; una restricción o vencimiento bloquea también su lectura Storage mediante RLS. El snapshot de cada foto conserva lo aprobado originalmente y nunca se amplía automáticamente por un cambio de política.

Se distinguen los respaldos sin presentarlos como equivalentes:

- **Condiciones expresas de prensa:** Sundance ofrece imágenes para cobertura editorial con créditos. Sus hojas de caption limitan el uso a cobertura de sus programas; las fotos se vinculan a la selección oficial y sólo a las películas concretas del catálogo. Caption y placa conservan ese contexto. No se recortan ni se superpone texto sobre ellas.
- **Distribución oficial como press kit:** los stills de *Aftersun* se ofrecen en el kit de Charades, con crédito explícito a Sarah Makharine; el distribuidor Independența Film ofrece los de *The Substance* mediante su enlace Press Kit. La decisión editorial se apoya en esa distribución dirigida a prensa para cubrir las obras. Se registra como `official-press-distribution`, **sin afirmar una carta individual recibida, licencia abierta ni autorización irrestricta**. Se usan fotos completas y créditos, sólo en cobertura orgánica de la película. No se toman de agencias comerciales ni de una galería agregadora.
- **Licencias abiertas:** Commons exige evidencia del archivo concreto, identidad y licencia real del fotógrafo. Se reutiliza la evaluación de CC BY/BY-SA; no se investiga nuevamente el texto legal para cada foto. No se presume que todo Commons esté libre ni que dominio público estadounidense equivalga al argentino.

Las restricciones explícitas prevalecen. El portal A24 exige registro y limita la vigencia del material a doce meses desde el estreno: no se importó desde allí sin ese acceso. No se eludieron los portales privados de Sony ni otros logins. El material del documental *Super/Man* con créditos de agencias llegó dentro del paquete oficial autorizado de Sundance, no descargado desde bancos comerciales sin licencia. Conserva sus créditos individuales.

No se incorporó material argentino bajo esta evaluación internacional. Para personas, producciones o recursos argentinos se requiere revisión adicional documentada: `reviewRegion: AR`, `argentinaReview`, fuente, evidencia y decisión aprobada. Un actor extranjero no permite usar material de cualquier origen: se mantienen copyright, atribución, embargos y condiciones del titular. No se incorporan filtraciones, capturas de streaming ni material obtenido saltando controles.

## Flujo administrativo

1. Revisar una fuente/paquete: guardar su evidencia en `assets/social/source-evidence/`, agregar el permiso local y crear su fila mediante MCP administrativo. No poner service-role keys en archivos ni en el cron diario.
2. Resolver título/año/director contra el catálogo. Los homónimos son candidatos, no coincidencias definitivas: por ejemplo, los títulos *Dunkirk*, *Fear*, *Glory* o *The Mission* encontrados en otro distribuidor no se importaron por coincidir únicamente en el nombre. TMDB puede descubrir/localizar; no otorga derechos.
3. Descargar materiales ofrecidos por el titular/distribuidor, leer captions y restricciones por paquete, inspeccionar visualmente y conservar autor por archivo. Los PDFs de prensa se usan sólo para las fotografías que ofrecen como stills, no para copiar textos publicados. El cron no hace esta investigación.
4. Preparar con `node scripts/prepare-social-press-package.mjs --manifest=manifest-revisado.json --grant=ID`. El manifiesto proporciona originales locales, película canónica, archivo/entrada del paquete y caption/crédito suministrado. Sharp decodifica estrictamente, convierte sRGB/WebP calidad 85 y reduce a máximo 1920 px y 2 MiB. Mínimo 600 px en el lado corto para stills y 700 para retratos; no se estira ni se inventa detalle.
5. Inspeccionar las fotos antes de dar por aprobada una lista de carga. Preservar la evidencia compartida por paquete (`assets/social/press-packages/`) y su hash. La herramienta no publica, no modifica el catálogo ni agrega automáticamente al registro global.
6. Para importación administrativa directa, sigue disponible `manage-social-library.mjs --import` con credencial administrativa en entorno seguro. Para una carga mediante MCP sin sacar esa credencial del servidor, usar `stage-social-library-batch.mjs --assets=lista-aprobada.json`: genera en `.tmp/social-batch/` registros, una capacidad aleatoria de 256 bits, su hash y una función Edge limitada a los hashes de esa lista, con treinta minutos de vigencia.
7. Desplegar el archivo generado como `cineposta-social-bootstrap` mediante MCP y ejecutar `node scripts/upload-social-library-batch.mjs`. El cuerpo debe coincidir exactamente con el registro revisado y los bytes con su hash. La función sólo carga esos objetos en `cineposta-social` y registra metadata; la service-role key se usa únicamente dentro de Supabase. No permite subir otra imagen ni acceder a otras tablas. Verificar recibos, hash, dimensiones, referencias y huérfanos; luego reemplazar la función por una respuesta 410, incluso si hay fallos. No publicar las capacidades ni los archivos `.tmp`.
8. Actualizar el registro versionado con los assets efectivamente cargados. Los binarios nuevos quedan exclusivamente en Storage. No borrar las fotos históricas ni URLs finales usadas por Buffer.

La importación se detiene en el primer error y conserva recibos. Un objeto subido sin metadata no tiene lectura pública: auditarlo antes de completar o eliminar mediante Storage API. La PK/hash/ruta y la FK al objeto impiden duplicados y referencias inexistentes. Una carga repetida del mismo ID/hash devuelve `existing`; un contenido distinto devuelve conflicto. La evaluación de permisos no se reabre por cada ejecución diaria.

## Selección y composición

Instagram prioriza stills/backdrops sobre retratos, y retratos sobre fotos de eventos. Dentro de ese grupo considera los últimos catorce días, frecuencia de sesenta ediciones y una variación determinista diaria. Los temas con más arte cinematográfico preceden a grupos que sólo tienen retratos. Los formatos continúan compitiendo por historial y elegibilidad, sin rotación semanal rígida.

Un retrato obtenido con permiso específico de un paquete **no** se extiende a todas las películas de esa persona: sólo puede acompañar los slugs autorizados. Un retrato CC puede acompañar las películas del elenco/dirección canónicos. No se hace pasar una foto de festival por un fotograma.

Sin permiso de recorte se conserva el fotograma completo; título, marca y Score van fuera de la foto. La puntuación puede ser grande en el panel editorial sin modificar la imagen. En composiciones con licencias mixtas, CC BY-SA se declara sólo para las fotografías adaptadas correspondientes; el material de prensa conserva sus condiciones. No se ofrece una licencia abierta sobre imágenes de un estudio.

GitHub Actions y Buffer, 18:15 ART de preparación y 19:15 ART de publicación, permanecen iguales. No cambia X, la cola de Buffer ni publicaciones existentes. El esquema de biblioteca sigue disponible para un consumidor futuro de X, que deberá aplicar los permisos de su canal.

Fuentes primarias: [Sundance Press](https://www.sundance.org/about/press/), [kit Aftersun de Charades](https://charades.eu/storage/documents/recbzP6j1z2vf05ot.pdf), [kit The Substance del distribuidor](https://www.independentafilm.ro/project/the-substance/), [condiciones del portal A24](https://press.a24films.com/terms), [FAQ TMDB](https://developer.themoviedb.org/docs/faq).

## Descubrimiento con TMDB

Se comprobó la integración existente con The Substance (`933260`) y Aftersun (`965150`): cada una devolvió 24 candidatos de pósters/backdrops, todos pendientes de derechos. Los archivos incorporados proceden de sus paquetes de prensa, no de asumir permisos por aparecer en TMDB. La búsqueda de Aftersun resultó ambigua; se resolvió con su ficha primaria y ahora el comando admite `--tmdb-id=965150`, revalidando título, año y dirección. No cambia el catálogo ni aprueba material automáticamente.
