# Auditoría integral del sitio — 26/09/2026

**Branch:** `fix/sitewide-audit-20260926`

**Mercado editorial y de disponibilidad:** Argentina.

**Publicación:** retenida por retratos de créditos sin una imagen segura y de calidad suficiente.

## Datos y clasificación

- **El paciente inglés (1996):** se normalizó el título argentino y se reescribió la sinopsis. [JustWatch Argentina](https://www.justwatch.com/ar/pelicula/el-paciente-ingles), consultado el 26/09/2026, mostraba alquiler/compra en Amazon Video y Apple TV Store, pero no suscripción. Se registraron Apple TV y Prime Video como opciones transaccionales y se aclaró esa condición.
- **George Scribner:** se corrigió el nacimiento imposible de 1900 a 1952, sin inventar día ni mes. La identidad se contrastó con su [sitio](https://www.scribnerart.com/about) y una [biografía periodística](https://www.revistaeyn.com/especiales/centroamerica-inspira/george-scribner-el-animador-de-disney-cineasta-y-pintor-nacido-en-panama-YH8108188).
- **Pierre Leduc:** se quitaron fecha, nacionalidad y referencias que pertenecían a otro homónimo. Se conservó la identidad vinculada a sus créditos de videojuegos con [IMDb](https://www.imdb.com/name/nm2966857/) y [MarioWiki](https://www.mariowiki.com/Pierre_Leduc), y se reemplazó la miniatura por el archivo local de tamaño completo.
- **Bruna Mascarenhas y Natalie Grace:** se reemplazaron sus retratos borrosos por imágenes identificadas en la [agencia oficial de Bruna](https://www.ilanabrakarz.com.br/atrizes/14/Bruna-Mascarenhas) y la ficha de [IMDb de Natalie](https://www.imdb.com/name/nm10576004/), respectivamente.
- **Género Bélica:** se añadió como señal secundaria, sin alterar categorías principales, en *1941*, *From Here to Eternity*, *Ip Man*, *Mrs. Miniver*, *The Best Years of Our Lives*, *El paciente inglés* y *El vínculo sueco*. Se contrastó con las fichas de [Universal](https://www.universalpicturesathome.com/movies/1941), [Sony](https://www.sonypictures.com/movies/fromheretoeternity), [Disney+](https://www.disneyplus.com/browse/entity-3a634cbb-cf2c-400b-8c1c-d8083d1b6d18), [AFI: Mrs. Miniver](https://catalog.afi.com/Film/27360-MRS-MINIVER), [AFI: The Best Years of Our Lives](https://catalog.afi.com/Film/24693-THE-BEST-YEARS-OF-OUR-LIVES), [Miramax](https://www.miramax.com/movie/the-english-patient/) y [Netflix](https://www.netflix.com/title/81713119).
- Se quitaron etiquetas Bélica de *Casablanca*, *El laberinto del fauno*, *El maquinista de la General* y *Teléfono rojo: volamos hacia Moscú*: el filtro queda reservado a relatos donde la guerra o la ocupación organizan el conflicto. La decisión se revisó con fichas de [BFI: Casablanca](https://www.bfi.org.uk/film/61d5c0dc-151e-5c9c-92ef-4a3039aa82f2/casablanca), [BFI: The General](https://www.bfi.org.uk/film/136a6211-90d9-5d18-b047-7967deac8bab/the-general) y [AFI: Dr. Strangelove](https://catalog.afi.com/Film/23082-DR-STRANGELOVE-OR-HOW-I-LEARNED-TO-STOP-WORRYING-AND-LOVE-THE-BOMB). No se modificó la categoría principal.
- Se mantuvieron fuera de Bélica *El puente de los espías*, *Lo que el viento se llevó*, *Lincoln*, *Love and Death*, *Persépolis*, *The Breadwinner* y *Los archivos del Pentágono*, donde la guerra funciona principalmente como época, contexto o materia política.

## Edición y medios

- Se reescribieron 109 cierres de reseña con fórmulas genéricas, más otros cierres redundantes y dos textos formulaicos. El contenido nuevo conserva las opiniones y los datos específicos de cada película.
- `npm run images:people:check` revisó 5.393 retratos: todos pasan formato, resolución mínima y limpieza de metadata. Esa validación técnica no confirma por sí sola que la imagen sea un retrato editorial apropiado.
- `npm run posters:check` revisó 2.227 carteles locales: cero errores; 1.503 dentro del rango de bytes preferido y 724 con avisos por tamaño. Los archivos mantienen dimensiones y formato válidos; el aviso de bytes no implica un defecto visual. También se inspeccionó una muestra de carteles pequeños y se confirmó que correspondían a sus películas.
- **Siguen pendientes nueve retratos que bloquean la publicación:**
  - Andrés Alberto Tan He, Chien Min Lee y Yuchen Che, en [*Los Caminantes de la Calle*](https://www.cineposta.com.ar/peliculas/los-caminantes-de-la-calle-2026/): las imágenes actuales son recortes de fotos de papel/festival, no retratos autónomos identificables. El reparto está documentado por [Festival de Lima](https://festivaldelima.com/2026/pelicula/los-caminantes-de-la-calle/); la cobertura de [El Comercio](https://elcomercio.pe/luces/cine/los-caminantes-de-la-calle-la-pelicula-extorsion-que-le-habla-al-peru-y-cuyo-director-se-inspiro-la-realidad-balearon-a-su-padre-por-cobro-de-cupos-noticia/) no aporta retratos individuales seguros.
  - Fiona Gollob, en *Los Bobos*: el archivo actual es un recorte de una imagen de escena/promoción; [Alternativa Teatral](https://www.alternativateatral.com/persona160960-fiona-gollob) verifica la identidad, pero no se encontró un retrato individual seguro.
  - Lenny Gonzales, Valentina Oviedo y Virginia Esparza, en *Marianela y el cadáver*: las imágenes actuales son fotogramas o stills promocionales. Los créditos aparecen en [IMDb](https://www.imdb.com/title/tt33037951/) y una foto de [Ámbito](https://www.ambito.com/espectaculos/weser-la-tierra-explota-y-marianela-y-el-cadaver-tres-estrenos-nacionales-la-poesia-la-denuncia-ambiental-y-el-humor-negro-n6305856/amp) identifica a parte del elenco, pero no ofrece retratos individuales reutilizables con atribución inequívoca.
  - Eric Leighton: el retrato actual mide 104×165 y se recortó de una foto grupal de 2000; [AWN](https://www.awn.com/mag/issue5.03/AWNMag5.03.pdf) identifica a Leighton a la izquierda, pero no se halló una versión individual de resolución suficiente. [IMDb](https://www.imdb.com/name/nm0500343/) confirma su identidad.
  - Marcos Mossello, acreditado por el documental *The Bald*: [Cine Nacional](https://cinenacional.com/persona/marcos-mossello) indica “Foto no disponible”. [Visions du Réel](https://www.visionsdureel.ch/en/film/2024/the-bald/) y [Business Doc Europe](https://businessdoceurope.com/vdr-grand-angle-qa-the-bald-by-marcos-simon-mossello-elias-ezequiel-gismondi/) verifican identidad y crédito. No se encontró una foto de rostro que pudiera atribuírsele con seguridad.
- No se fabricaron, ampliaron por IA ni asignaron imágenes de homónimos o fotogramas como reemplazo. Para cerrar este bloqueo hace falta una fuente de retrato aprobada para esos nueve créditos, o retirar dichos créditos si la fuente de identidad no puede acompañarlos.

## Correcciones técnicas

- La carga del catálogo del home conserva la selección inicial de Cine/streaming; si el usuario elige “Más nuevas” explícitamente, activa el catálogo completo y ordena por año.
- Se corrigió el desborde horizontal de los filtros rápidos alrededor de 980 px con una grilla de tres columnas.
- Escape ya no permite que una búsqueda demorada vuelva a abrir las sugerencias sobre los filtros.
- Se ajustaron E2E para esperar la hoja de estilos al medir overflow, inspeccionar el sitemap como XML, esperar banderas/imágenes lazy-loaded y no exigir en móvil una ilustración que el diseño compacto oculta deliberadamente.

## Validaciones

- `npm run check`: 223 archivos; cero errores, advertencias o hints.
- `npm run validate:content`: 2.227 películas, 620 perfiles aprobados, cero sinopsis débiles, reseñas cortas, cierres formulaicos o rutas locales de póster inválidas; generó 7.315 páginas. Validación de sitemap: 5.087 páginas canónicas.
- `npm run build`: compilación estática de 7.315 páginas completada.
- `audit:profiles`, `audit:profiles:facts`, `test:editorial-meters`, `test:poster-source-policy`, `audit:content-quality`, `audit:editorial-low-value`, `images:people:check` y `posters:check` pasaron. El auditor editorial no halló candidatas de reseñas repetitivas, cortas o formulaicas; el aviso de 188 diferencias entre categoría y primer género es informativo y no justifica alterar la taxonomía principal.
- Playwright ejecutó 107 casos en cada uno de sus cinco proyectos: 479 aprobados y 56 omitidos por viewport/proyecto. Chromium escritorio: 94 aprobados/13 omitidos; Firefox escritorio: 92/15; WebKit escritorio: 92/15; Chromium móvil: 101/6; WebKit móvil: 100/7. No quedaron aserciones fallidas tras las correcciones.
- Los proyectos Chromium escritorio, Firefox escritorio y Chromium móvil terminaron con código 0. En los dos proyectos WebKit, todos los casos mostraron estado aprobado u omitido, pero el proceso quedó esperando la salida de un worker después del último caso y hubo que interrumpir el runner; esos dos comandos no entregaron un cierre normal.
- `git diff --check` no reportó errores de whitespace. Git mostró avisos de normalización LF/CRLF propios de `core.autocrlf`.

## Publicación

No se publicó a `main`: los nueve retratos pendientes no cumplen el requisito de identidad y calidad visual para créditos de director/elenco. La branch queda local para revisión y para incorporar retratos aprobados cuando estén disponibles.
