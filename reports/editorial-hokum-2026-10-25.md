# Hokum: editorial desde los takes del usuario

Fecha de trabajo: 25 de octubre de 2026, Argentina.

## Alcance y criterio

Publicación: `hokum-la-maldicion-de-la-bruja-ganas-de-hacer-el-check-out`.
Título: **Hokum: La maldición de la bruja y las ganas de hacer el check-out**.

Columna original en primera persona, con humor rioplatense, 1056 palabras, doce párrafos y cinco minutos de lectura calculados a 220 palabras/minuto. Conserva los cinco takes: desconexión entre las líneas del relato; actuaciones mediocres y pose seria/antipática del escritor; encierro agobiante en el hotel; uno o dos sustos recordados y experiencia más cercana a una investigación; falta de temor por la vida del protagonista. La invulnerabilidad se expresa como sensación del espectador y el número de sustos como recuerdo aproximado, sin afirmar hechos del desenlace. `spoilers: false`.

El humor del hotel, las reservas, el karaoke y el modo dios son comparaciones del autor, sin presentarlas como escenas de la película. No se atribuyen al usuario nuevas anécdotas ni reacciones físicas.

Se usa la ficha existente `hokum-la-maldicion-de-la-bruja-2026`. La nota se integra automáticamente con home, archivo, Radar y ficha mediante los componentes compartidos. Se conserva el modelo de tarjetas aprobado. No se modifica la película, su reseña, su puntaje ni su disponibilidad, ni las ediciones generadas de recomendadas y trailers.

## Fuentes e imágenes verificadas

La página oficial de NEON, https://www.neonrated.com/film/hokum , identifica la película como producción de 2026 dirigida por Damian McCarthy y protagonizada por Adam Scott, con un escritor en una posada irlandesa y una leyenda de brujería. Se utiliza sólo para identidad, premisa y procedencia visual; la opinión proviene de los takes del usuario. No se incorporan opiniones de otras reseñas.

Los cinco materiales proceden de esa página oficial. Se descargaron los originales y se inspeccionaron visualmente antes de elegirlos; no se generan escenas ni se alteran colores o encuadres. Las variantes WebP mantienen proporción, con anchos 1280 y 640 px. Cada imagen lleva un enlace visible a la galería oficial. No se afirma una licencia no comprobada.

| Archivo | Contenido y relación con el texto | Original oficial | Dimensiones WebP |
| --- | --- | --- | --- |
| encierro.webp | Adam Scott agachado en una abertura de madera con un farol; portada y primeras impresiones del encierro | https://www.datocms-assets.com/148598/1771522395-hokum_adamscott_01.jpeg | 1280 × 537 |
| escritor.webp | Adam Scott sentado frente a cortinas claras; actuación y distancia respecto del personaje | https://www.datocms-assets.com/148598/1780321982-hokum-1.jpg | 1280 × 720 |
| hotel.webp | Campanas con placas de las suites; espacio del hotel e historias en habitaciones separadas | https://www.datocms-assets.com/148598/1780326834-hokum-5.jpg | 1280 × 720 |
| farol.webp | Adam Scott ilumina paredes de piedra; investigación sin sensación de amenaza | https://www.datocms-assets.com/148598/1780322213-hokum-2.jpg | 1280 × 720 |
| espejo.webp | Adam Scott y su reflejo sosteniendo un farol entre paneles de madera; vínculo con el protagonista y encierro | https://www.datocms-assets.com/148598/1780326834-hokum-6.jpg | 1280 × 720 |

Se excluyen el afiche, las imágenes de figuras o criaturas y el material ajeno a estos argumentos. La nota incluye las cinco imágenes intercaladas y diez archivos WebP en total; la portada reutiliza el fotograma de encierro.

## Validación y publicación

Se amplía el recorrido parametrizado existente de `tests/e2e/editorial.spec.ts` con esta nota para comprobar navegación home/archivo/ficha, conservación de la reseña, imágenes y fuente, SEO, lectura estimada y adaptación a 320 px. Los logs y capturas propios de esta tarea se guardan fuera del repositorio, en la carpeta temporal `cineposta-hokum-20261025`.

- `npm run check`: 309 archivos, cero errores, advertencias e indicaciones.
- `npm run build`: aprobado, 8054 páginas, un solo build en ejecución.
- `npm run validate:content -- --skip-build`: aprobado; catálogos, duplicados, calidad, originalidad y ediciones sin cambios ajenos.
- `npm run validate:public-output`: aprobado.
- `npm run validate:sitemap-indexability`: aprobado, 5647 páginas canónicas.
- `npm run audit:profile-originality -- --require-dist`: aprobado.
- Suite completa `tests/e2e/editorial.spec.ts`, desktop-chromium y mobile-chromium: **60/60 aprobadas**, sin reintentos, en 53,4 segundos.
- Revisión adicional en Chromium a 1440 y 320 px: los doce párrafos renderizados coinciden exactamente con el JSON; cinco imágenes decodificadas; canonical, lectura estimada, navegación home → nota → ficha → nota → archivo, orden del archivo y ausencia de errores JavaScript y overflow comprobados.
- Inspección visual del encabezado de la nota y de las tarjetas de home en escritorio y 320 px: imagen reconocible, título legible, fecha y lectura correctas. Dimensiones y pesos reales de los diez WebP comprobados (5–54 KB por archivo).
- El remoto se actualizó antes del trabajo y se volvió a consultar antes del commit para conservar las publicaciones del bot. El diff contiene únicamente esta nota, diez imágenes, este reporte y dos líneas que incorporan la nota a las pruebas existentes.

El usuario autorizó publicar en main si las comprobaciones pasan, sin una segunda confirmación. La publicación conserva el hook pre-push de validación completa; la entrega final debe informar el resultado remoto real.

URL pública prevista: https://www.cineposta.com.ar/editorial/hokum-la-maldicion-de-la-bruja-ganas-de-hacer-el-check-out/ . El cierre requiere comprobar el SHA publicado en Pages, las rutas e imágenes públicas y main limpio y sincronizado.
