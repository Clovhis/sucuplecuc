# CALM: nota y procedencia de materiales

Fecha de investigación: 8 de octubre de 2026. El usuario autorizó crear la nota con la skill editorial y publicar en `main` si la validación resulta satisfactoria.

Publicación: `src/data/editorials/calm-horacio-quiroga-animacion-sitges-2026.json`.
Ruta: `/editorial/calm-horacio-quiroga-animacion-sitges-2026/`.

## Enfoque y fuentes

Nota informativa original, firmada CinePosta: Quiroga como personaje, técnicas mixtas, coproducción con participación argentina, recorrido Annecy–Sitges y proyecto de largometraje. No se atribuye al autor haber visto el corto. No se crea una ficha de película, una valoración ni una plataforma argentina. La gacetilla no anuncia exhibición argentina ni fecha del futuro largo; el texto conserva ese alcance.

- Gacetilla recibida de Radix Comunicación el 8 de octubre, asunto “NOTA DE PRENSA | CALM celebrará su estreno español en Sitges tras su paso por Annecy”. Confirma dirección de María Ruisánchez y Álvaro León, producción de La Mola Studio con Ojo Raro y Sísmica Studio, estreno español en Anima’t y proyecto antológico en desarrollo. Sus declaraciones se parafrasean con atribución.
- [Kit de prensa enviado por Radix](https://drive.google.com/drive/folders/1ujdEtzv803AqDgW3KGneQioiY5WTroMP): carpetas de fotogramas, equipo y proceso de trabajo. Descarga pública comprobada.
- [Ficha oficial de Annecy](https://www.annecyfestival.com/en/the-festival/official-selection/short-films/midnight-shorts/calm-the-last-tale-horacio-quiroga): dirección, coproducción España–Argentina–México; Patricio Plaza por Ojo Raro y Asdrúbal Rivera por Sísmica; técnicas de objetos, dibujo, recortes y animación digital 2D/3D; público joven adulto/adulto. Se omite la duración para evitar discrepancias de redondeo entre catálogos.
- [Midnight Shorts, selección oficial](https://www.annecyfestival.com/en/the-festival/official-selection/short-films/midnight-shorts): CALM aparece en la selección 2026; descripción oficial del alcance de la sección.
- [Sitges, lista oficial de participantes](https://sitgesfilmfestival.com/en/noticies/list-confirmed-artists-sitges-2026): incluye CALM bajo Anima’t. La lista llama “director” a Miguel Español Celiméndiz, pero Annecy lo acredita como distribuidor/ventas. Se conserva la dirección concordante entre Annecy y la gacetilla, sin reproducir ese error. No se publica un horario de función sin haber recuperado su ficha oficial.
- [Kinoforum, ficha oficial](https://2026.kinoforum.org/filme/399673/calm-o-ultimo-conto-de-horacio-quiroga): corroboración adicional de dirección y países. No se incorpora un detalle adicional de trama o exhibición de esta fuente.

## Imágenes

Se inspeccionaron visualmente los cuatro originales elegidos. Conversión a WebP sin recorte, ampliación ni alteración de colores o escenas; orientación EXIF respetada. Variantes de 640 px y 1280 px de ancho, dimensiones reales. Cuatro imágenes intercaladas por relación con los párrafos; la portada reutiliza el fotograma del hospital. Los enlaces de procedencia quedan visibles en la nota. Se trata de materiales suministrados para prensa; no se afirma una licencia abierta.

| Asset | Original del kit | Dimensiones publicadas | Relación con el texto |
| --- | --- | --- | --- |
| `hospital.webp` | [CALM Frame Horizontal (6).jpg](https://drive.google.com/file/d/1kl6V9SL0Lf0lUnkT1-LxSC-IvYQfrG-C/view) | 1280 × 720; 640 × 360 | Inicio en el hospital; rostros y luz, sin inventar identidades adicionales. |
| `recuerdos.webp` | [CALM Frame Horizontal (3).jpg](https://drive.google.com/file/d/1BvTGXlTYb37JN9SUQPBp8T2OyNTFik4H/view) | 1280 × 720; 640 × 360 | Cambio de textura y lenguaje visual. |
| `proceso.webp` | [Rodaje-CALM (1).jpeg](https://drive.google.com/file/d/1jb8tJcvb55cJ1DFiTUqpTL-9sWJugmcj/view) | 1280 × 960; 640 × 480 | Imagen de trabajo frente al monitor; no se atribuye un software o técnica particular a esta foto. |
| `directores.webp` | [Maria Alvaro Directors.jpg](https://drive.google.com/file/d/1PbxApT31r0ENAlKI8vsJkntv-IhhbeXU/view) | 1280 × 960; 640 × 480 | Equipo responsable y próxima etapa del proyecto. |

897 palabras; lectura calculada por el loader: 5 minutos. Se reutilizan el archivo, las tarjetas y los componentes vigentes; sin cambios de UI, scores, reseñas o catálogo de películas. La nota queda destacada para entrar en la selección automática de la home.

## Validación

La comprobación existente de notas informativas incorpora CALM: navegación desde home y archivo, fecha, lectura, canonical, Open Graph, Article JSON-LD, fuentes visibles, decodificación/proporción de imágenes y ausencia de overflow a 320 px.

- `npm run check`: 257 archivos, cero errores, warnings e hints.
- `npm run validate:content -- --skip-build`: correcto; sin cambios en películas ni perfiles.
- `npm run build`: 7.576 páginas generadas, sin errores.
- `npm run validate:public-output`: correcto.
- `npm run validate:sitemap-indexability`: 5.311 páginas canónicas; presencia explícita de la nueva URL en el sitemap comprobada.
- `npx playwright test tests/e2e/editorial.spec.ts --project=desktop-chromium --project=mobile-chromium --project=mobile-webkit --workers=3`: 39/39 casos correctos.
- Revisión visual de la nota en escritorio y 320 px, tarjeta de home y archivo; las cuatro imágenes interiores se decodifican y conservan sus proporciones. Se inspeccionaron los WebP finales y se verificaron dimensiones de las ocho variantes.
- El HTML generado conserva exactamente los once párrafos del JSON. Canonical, description, Open Graph y Article JSON-LD quedan cubiertos por la prueba de CALM.
- `git diff --cached --check`: correcto. Alcance de publicación: JSON, ocho WebP, reporte y ampliación de la prueba editorial existente.

Las capturas de revisión local se conservan en `test-results/editorial-calm-horacio-qui-caf08-lable-from-home-and-archive-*/`. El despliegue y la ruta pública se verificarán para el SHA publicado; la evidencia de esa comprobación se conserva localmente en `test-results/calm-production/`.
