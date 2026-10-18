# Masterplan: editorial y ajuste de Score CinePosta

Fecha de trabajo: 18/10/2026, Argentina. Rama: `editorial/masterplan-2026`.

## Resultado

- Nota: **Masterplan: Tucci y un espionaje que parece de juguete**.
- Ruta: `/editorial/masterplan-tucci-espionaje-de-juguete/`.
- 1035 palabras, lectura calculada de cinco minutos, firma CinePosta, sin spoilers fuertes.
- Vinculada a `masterplan-2026`; integración mediante los componentes existentes con ficha, home y archivo. Sin cambios de interfaz.
- `cinepostaScore`: **7 → 5**, cuya etiqueta derivada es **Regular**. Pedido editorial explícito del usuario, sustentado en sus críticas al tono ingenuo, utilería, música, efectos, previsibilidad y actuaciones.
- La reseña corta y los demás campos de la ficha se conservan. No se modifican disponibilidad, categorías, personas ni snapshots de Radar, recomendadas o trailers.
- Publicación en `main` autorizada expresamente por el usuario después de revisar la entrega local.

## Criterio y verificación

La voz es personal, coloquial rioplatense. Se mantienen la comparación con Ocean’s Eleven y las críticas del usuario a la apariencia barata de los gadgets y a la sensación de IA. No se inventan escenas, remates argumentales ni experiencias de visionado.

El uso de IA en música o producción no se pudo confirmar: se expresa como percepción del autor, con una aclaración en el cuerpo. La fabricación con filamento también se presenta como apariencia observada, sin afirmar conocer el proceso de utilería ni el presupuesto real. El comentario sobre público infantil/adolescente describe el tono percibido, no una clasificación oficial.

La película correcta es la de Thomas Vincent, con Stanley Tucci, Simona Tabasco y Victor Belmondo. [Amazon, ficha y promoción oficial](https://www.aboutamazon.com/news/entertainment/masterplan-stanley-tucci-prime-video) confirma dirección, reparto y premisa. [Gaumont](https://www.gaumont.com/en/news/masterplan-discover-the-trailer) aporta la imagen promocional del equipo; su texto tiene erratas de año/nombre y no se usa para esas afirmaciones.

Antecedente de puntaje: `reports/plataformas-ar-2026-10-16.md` documentaba TMDb 6,7/10 con seis votos, redondeado a 7 y limitado por muestra pequeña. Esa evidencia histórica no se presenta como una consulta actual. El cambio a 5 responde a la valoración expresa del usuario; no se usa un nuevo promedio externo ni se añaden campos al JSON.

También se consultó [Film Music Reporter](https://filmmusicreporter.com/2026/10/16/amazon-prime-masterplan-score-soundtrack-album-released/), que atribuye la música original a Polérik Rouvière. Ese crédito no demuestra ni descarta herramientas generativas. La nota no presenta el uso de IA como un hecho probado.

## Imágenes

Se revisaron visualmente las cinco imágenes oficiales originales; no son imágenes generadas ni montajes de escenas. Se exportan diez WebP locales, cinco principales y cinco variantes de 640 px, conservando proporción y sin ampliar el original. Las cuatro imágenes interiores se intercalan al terminar las ideas que acompañan; la quinta es portada. Los epígrafes distinguen observación visual y opinión. No se afirma una licencia de reutilización.

| Archivo | Original y procedencia | Dimensiones locales | Relación con el texto |
| --- | --- | --- | --- |
| `equipo.webp` | [Gaumont, imagen del equipo](https://www.gaumont.com/sites/com/files/styles/image_webp/public/2026-09/ARTICLE%20-%20IMAGE%20CORPS%20DE%20TEXTE%20-%201890x886__2.jpg.webp?itok=J3vDmvyB) | 1280 × 600 | Portada: Tucci, Belmondo y Tabasco con reproducción de la Mona Lisa. |
| `tucci-cuadro.webp` | [Amazon, still 1](https://assets.aboutamazon.com/5c/5d/74314e11407f978678a73e704594/masterplan-inline-1-amazon-news.png) | 1280 × 720 | La ambición del robo tras presentar la premisa. |
| `chiara.webp` | [Amazon, still 4](https://assets.aboutamazon.com/8c/cf/a145f76d491ea224a92ad09f9c7b/masterplan-inline-4-amazon-news.png) | 1280 × 720 | Atmósfera de la aventura, tras discutir sonido y efectos; la foto no se presenta como prueba de IA. |
| `tunel.webp` | [Amazon, still 2](https://assets.aboutamazon.com/fa/c5/159116e94b8ba43abe5a99637b2b/masterplan-inline-2-amazon-news.png) | 1280 × 720 | Los dos jóvenes en el recorrido del golpe, después de hablar de intriga y previsibilidad. |
| `tucci-auto.webp` | [Amazon, still 3](https://assets.aboutamazon.com/c8/f7/815619c6454a8703cbaf5a956d07/masterplan-inline-3-amazon-news.png) | 1280 × 720 | Presencia y actuaciones: Tucci junto al auto. |

Todos los archivos viven en `public/assets/editorial/masterplan-tucci-espionaje-de-juguete/`. Las variantes pequeñas miden 640 × 300 para la portada y 640 × 360 para los stills.

## Validación

- `npm run check`: 290 archivos, cero errores, advertencias o hints.
- `npm run validate:content -- --skip-build`: PASS; catálogos sincronizados y ediciones independientes intactas. El catálogo de películas se regeneró, pero sólo variaba la fecha de cabecera: se retiró ese cambio innecesario.
- Auditoría explícita de `masterplan-2026.json`: PASS WITH WARNINGS; seis avisos previos sobre nacionalidades ausentes y hosts de retratos de Thomas Vincent, Simona Tabasco y Victor Belmondo. Una señal informativa indica que Acción es género secundario; no se cambia la categoría.
- `npm run build`: PASS, 7972 páginas. Se ejecutó un único build.
- `npm run validate:public-output`: PASS.
- `npm run validate:sitemap-indexability`: PASS, 5596 páginas canónicas; la nueva ruta figura en el sitemap.
- QA específica en Chromium y WebKit, a 1440 y 320 px: cuatro recorridos completos aprobados; tarjeta en home, primera posición en el archivo, fecha, canonical, texto idéntico al JSON, lectura de cinco minutos, cuatro imágenes interiores decodificadas con srcset y proporciones correctas, enlaces ficha ↔ editorial y score visible **5 · Regular**. Sin overflow ni errores JavaScript.
- Revisión visual de cabecera, cuerpo, primera imagen y tarjetas: aprobada en escritorio y 320 px; la portada sigue mostrando a los tres intérpretes y el cuadro en el recorte de tarjeta.
- Integridad de ficha: comparación contra HEAD confirma que sólo cambia `cinepostaScore`. Las ediciones independientes no tienen diff.
- Medios: diez WebP, 439394 bytes en total; mayor archivo de 90508 bytes. Dimensiones contrastadas con los archivos reales.
- `git diff --check`: PASS.
- `npx playwright test tests/e2e/editorial.spec.ts --project=desktop-chromium --project=mobile-chromium --workers=2`: **52/52 PASS**.

URL prevista de publicación: `https://www.cineposta.com.ar/editorial/masterplan-tucci-espionaje-de-juguete/`.

## Preparación de la publicación

Se consultó `origin/main` antes de publicar: avanzó con ediciones automáticas de Radar, recomendadas, próximos estrenos y el historial de Buffer. Se conserva ese avance mediante rebase; ninguno de esos archivos forma parte del cambio editorial. El hook de pre-push ejecuta nuevamente la validación de contenido y el build sobre el estado integrado.

Disponibilidad revalidada el 18/10/2026 antes de publicar: [JustWatch Argentina](https://www.justwatch.com/ar/pelicula/masterplan-2026), mediante su API pública `https://apis.justwatch.com/graphql` con `country: AR`, devuelve **Masterplan (2026), tm2930066, Amazon Prime Video, FLATRATE**. La página HTML devuelve 403, pero la consulta estructurada responde 200 con la oferta argentina. [Prime Video, ficha oficial en español latinoamericano](https://www.primevideo.com/-/es_419/detail/0K2MF62NJL76Q54YS0KEABBDVZ) confirma identidad, reparto y acceso por suscripción; la prueba territorial se toma de JustWatch AR. Se conserva `Prime Video` sin modificar la plataforma.
