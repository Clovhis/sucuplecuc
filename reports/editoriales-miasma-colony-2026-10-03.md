# Editoriales: Campamento Miasma y Colony: Zona Cero

- Trabajo iniciado el 2 de octubre; textos fechados el 3 de octubre de 2026, fecha local al redactar.
- Branch local: `editorial/miasma-colony-2026-10-02`.
- Skill aplicada: `skills/cineposta-editorial/SKILL.md`; referencia de voz: editorial de Resident Evil: Noche Cero.
- Dos textos originales en primera persona a partir de los takes del usuario, sin subtítulos ni spoilers fuertes. Firma: CinePosta.
- Miasma: 1001 palabras; Colony: 1014 palabras. El loader calcula **5 minutos** para ambas a 220 palabras/minuto, redondeando hacia arriba.
- Cada nota tiene cinco imágenes intercaladas, portada reutilizada del cuerpo y variantes WebP de 640 px y hasta 1280 px, sin ampliar originales.
- Integración automática con `/editorial/`, los tres destacados de “Desde CinePosta” y las fichas mediante `movieSlug` y `featured: true`.
- Las dos notas nuevas ocupan los primeros lugares del home por fecha; las publicaciones anteriores siguen en el índice y en sus fichas.
- No se modificaron películas, reseñas, scores, categorías, plataformas ni skills.
- Entrega inicial: creación y revisión local en branch. El usuario aprobó las notas y autorizó explícitamente publicar en `main` el 3 de octubre de 2026.

## Textos y revisión local

| Nota | JSON | Ruta |
| --- | --- | --- |
| Campamento Miasma: si venís por Jason, preparate para el delirio | `src/data/editorials/campamento-miasma-si-venis-por-jason-preparate-para-el-delirio.json` | `/editorial/campamento-miasma-si-venis-por-jason-preparate-para-el-delirio/` |
| Colony: Zona Cero: me gustó, pero no me voló la peluca | `src/data/editorials/colony-zona-cero-me-gusto-pero-no-me-volo-la-peluca.json` | `/editorial/colony-zona-cero-me-gusto-pero-no-me-volo-la-peluca/` |

## Verificación factual y decisiones de redacción

- **Brad Pitt: productor ejecutivo confirmado.** El [press kit oficial de MUBI alojado en Cannes](https://cdn.festival-cannes.com/media/uploads/2026/05/205459.pdf), página 27, lo acredita expresamente como `EXECUTIVE PRODUCER`. También verifica dirección de Jane Schoenbrun, reparto principal y premisa del encuentro entre cineasta y actriz. El PDF de Digital Ciné contiene el mismo crédito, pero su descarga directa respondió 403; se utilizó la copia oficial de Cannes.
- [MUBI, ficha oficial de Miasma](https://mubi.com/en/us/films/teenage-sex-and-death-at-camp-miasma): película correcta y URL directa del tráiler usada para los fotogramas.
- [Colony, press kit oficial de Showbox alojado en Cannes](https://cdn.festival-cannes.com/media/uploads/2026/05/202466.pdf), página 3: brote, encierro, infectados que evolucionan y actúan mediante conciencia colectiva. Página 6: maquillaje con mucosidad. La comparación visual con leche/semen pertenece al usuario; no se le atribuye una composición ni una intención autoral no comprobada.
- [Well Go USA, ficha oficial de Colony](https://wellgousa.com/films/colony): película de Yeon Sang-ho, sinopsis y galería de stills. Se usa como fuente de material promocional, no para inferir disponibilidad argentina.
- KitKat, KFC, Nerds y Kellogg's se presentan como productos observados por el usuario, sin afirmar patrocinio o publicidad paga. El fotograma del comercio ilustra los exhibidores, no prueba por sí solo la presencia de cada marca mencionada.
- La desnudez de Miasma se expresa como impresión personal y sin ubicación temporal precisa, imágenes explícitas o contexto que revele el desenlace.
- El comentario sobre heroísmo y roles de género en Colony se refiere a los recursos de esta película, sin generalizar sobre toda una cultura.
- Las editoriales no indican disponibilidad ni recomiendan proveedores; las plataformas de las fichas no forman parte de estos cambios.

## Procedencia y función de imágenes

Assets Miasma: `public/assets/editorial/campamento-miasma-si-venis-por-jason-preparate-para-el-delirio/`.

| Archivo | Imagen verificada y relación con el texto | Original |
| --- | --- | --- |
| `campamento.webp` | Construcción de madera, árboles y nieve; acompaña la expectativa de un slasher en un campamento. 1280 × 720. | [Tráiler oficial MUBI, 00:33](https://trailers.mubicdn.net/368829/optimised/1080p-t-teenage-sex-and-death-at-camp-miasma_en_us_1790915034.mp4#t=33) |
| `protagonistas.webp` | Hannah Einbinder y Gillian Anderson en un interior de madera; acompaña la premisa y el encuentro. 1280 × 720. | https://www.steinbrennermueller.de/wp-content/uploads/2026/04/CampMiasma_Still_1_%C2%A9MUBI-scaled.jpg |
| `productos.webp` | Hombre en un comercio entre exhibidores de productos; acompaña las observaciones sobre marcas. 1280 × 720. | [Tráiler oficial MUBI, 01:33](https://trailers.mubicdn.net/368829/optimised/1080p-t-teenage-sex-and-death-at-camp-miasma_en_us_1790915034.mp4#t=93) |
| `lago.webp` | Figura con objeto largo sobre el agua, niebla y árboles; acompaña la familiaridad del slasher y la extrañeza visual. 1280 × 853. | https://www.steinbrennermueller.de/wp-content/uploads/2026/09/CampMiasma_Still_2_%C2%A9MUBI.jpg |
| `paisaje.webp` | Dos mujeres vestidas de rosa ante un lago y un cielo anaranjado; acompaña la observación sobre el cambio de paisajes y el delirio. 1280 × 720. | [Tráiler oficial MUBI, 01:57](https://trailers.mubicdn.net/368829/optimised/1080p-t-teenage-sex-and-death-at-camp-miasma_en_us_1790915034.mp4#t=117) |

Los dos stills proceden del material de MUBI publicado por su agencia de prensa [SteinbrennerMüller](https://www.steinbrennermueller.de/allgemein/mubi-freut-sich-auf-den-plattformstart-von-teenage-sex-and-death-at-camp-miasma/). URLs obtenidas de su API pública de medios de WordPress. Se miraron los originales y los fotogramas antes de seleccionarlos. No se utilizaron pósters, montajes promocionales con títulos ni imágenes generadas.

Assets Colony: `public/assets/editorial/colony-zona-cero-me-gusto-pero-no-me-volo-la-peluca/`. Todos los originales están enlazados desde la galería de [Well Go USA](https://wellgousa.com/films/colony); versiones locales de 1280 × 720 y 640 × 360.

| Archivo | Imagen verificada y relación con el texto | Original |
| --- | --- | --- |
| `infectados.webp` | Grupo de infectados mirando hacia arriba; acompaña la conducta colectiva. | https://wellgousa.com/sites/default/files/2026-04/Colony_Still_01.jpg |
| `defensa.webp` | Guardia sosteniendo un objeto largo y personas detrás; acompaña la defensa cuerpo a cuerpo. | https://wellgousa.com/sites/default/files/2026-04/Colony_Still_14.jpg |
| `pasillo.webp` | Forcejeo en un pasillo con paredes pálidas y fibrosas; conecta acción y contaminación del espacio. | https://wellgousa.com/sites/default/files/2026-04/Colony_Still_02.jpg |
| `encierro.webp` | Mujer junto a cajas y superficie con vetas blancas; acompaña el asco y la apariencia del edificio. | https://wellgousa.com/sites/default/files/2026-04/Colony_Still_04.jpg |
| `cuarentena.webp` | Personas con trajes amarillos de protección biológica y linternas; devuelve el foco al brote. | https://wellgousa.com/sites/default/files/2026-04/Colony_Still_18.jpg |

Se conservaron encuadres, colores y proporciones. Calidad WebP 84. Peso por archivo: aproximadamente 11–176 KB. Las fuentes visibles y la procedencia documentan atribución; no equivalen a una licencia de reutilización comprobada.

## Validación

- `npm run check`: 242 archivos; 0 errores, 0 warnings, 0 hints.
- `npm run build`: versión final completa, 7538 páginas, código de salida 0. Se ejecutó un build a la vez; se repitió tras los últimos ajustes de redacción y atribución.
- `npx playwright test tests/e2e/editorial.spec.ts --project=desktop-chromium --project=mobile-chromium --workers=2`: **12/12 aprobados**, 20,1 segundos. Incluye las dos notas nuevas y la editorial de referencia de Resident Evil; navegación home → índice → nota → ficha → nota, fechas, cinco minutos, canonical, datos estructurados, fuentes, imágenes decodificadas, srcset y ausencia de overflow a 320 px.
- Revisión visual en Browser: títulos, bajadas y lectura en desktop y a 320 px, imágenes interiores e índice editorial. Sin desbordes observados. Viewport temporal restaurado.
- Verificación de archivos: dimensiones reales de todos los WebP y variantes, cinco imágenes por cuerpo, fichas existentes, todos los párrafos finales coinciden exactamente con el HTML generado y ambas rutas están en el sitemap.
- `git diff --check`: sin errores de whitespace.
- Preview usado para la aprobación: [Miasma](http://127.0.0.1:43211/editorial/campamento-miasma-si-venis-por-jason-preparate-para-el-delirio/) y [Colony](http://127.0.0.1:43211/editorial/colony-zona-cero-me-gusto-pero-no-me-volo-la-peluca/).
