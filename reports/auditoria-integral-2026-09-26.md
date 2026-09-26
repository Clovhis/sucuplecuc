# Auditoría integral del sitio — 26/09/2026

**Branch de integración:** `fix/titles-and-filters-20260926` (incluye las mejoras de `fix/sitewide-audit-20260926`).

**Mercado editorial y de disponibilidad:** Argentina.

**Retratos:** los retratos disponibles para los nombres indicados por el usuario se conservaron sin cambios, según su instrucción. Este hallazgo no bloquea la publicación.

## Datos y clasificación

- **Títulos para Argentina:** se cambió *Superbad* según la preferencia explícita del usuario; las fuentes del estreno argentino en 2007 registran el nombre promocional *Supercool* ([Cines Argentinos](https://m.cinesargentinos.com.ar/proximos/01-noviembre-2007/), [Página/12](https://www.pagina12.com.ar/diario/suplementos/espectaculos/5-8402-2007-11-23.html)). Se corrigieron *Airplane!* a *¿Y dónde está el piloto?*, *The Naked Gun* a *La pistola desnuda* y *Fast Times at Ridgemont High* a *Picardías estudiantiles*.
- **El paciente inglés (1996):** se normalizó el título argentino y se reescribió la sinopsis. [JustWatch Argentina](https://www.justwatch.com/ar/pelicula/el-paciente-ingles), consultado el 26/09/2026, mostraba alquiler/compra en Amazon Video y Apple TV Store, pero no suscripción. Se registraron Apple TV y Prime Video como opciones transaccionales y se aclaró esa condición.
- **George Scribner:** se corrigió el nacimiento imposible de 1900 a 1952, sin inventar día ni mes. La identidad se contrastó con su [sitio](https://www.scribnerart.com/about) y una [biografía periodística](https://www.revistaeyn.com/especiales/centroamerica-inspira/george-scribner-el-animador-de-disney-cineasta-y-pintor-nacido-en-panama-YH8108188).
- **Pierre Leduc:** se quitaron fecha, nacionalidad y referencias que pertenecían a otro homónimo. Se conservó la identidad vinculada a sus créditos de videojuegos con [IMDb](https://www.imdb.com/name/nm2966857/) y [MarioWiki](https://www.mariowiki.com/Pierre_Leduc), y se reemplazó la miniatura por el archivo local de tamaño completo.
- **Bruna Mascarenhas y Natalie Grace:** se reemplazaron sus retratos borrosos por imágenes identificadas en la [agencia oficial de Bruna](https://www.ilanabrakarz.com.br/atrizes/14/Bruna-Mascarenhas) y la ficha de [IMDb de Natalie](https://www.imdb.com/name/nm10576004/), respectivamente.
- **Señal Bélica:** se añadió como género secundario, sin alterar categorías principales, en *1941*, *From Here to Eternity*, *Ip Man*, *Mrs. Miniver*, *The Best Years of Our Lives*, *El paciente inglés* y *El vínculo sueco*. La app reserva esta señal para historias donde la guerra organiza el conflicto, frente al uso más amplio de `Guerra`. Se contrastó con las fichas de [Universal](https://www.universalpicturesathome.com/movies/1941), [Sony](https://www.sonypictures.com/movies/fromheretoeternity), [Disney+](https://www.disneyplus.com/browse/entity-3a634cbb-cf2c-400b-8c1c-d8083d1b6d18), [AFI: Mrs. Miniver](https://catalog.afi.com/Film/27360-MRS-MINIVER), [AFI: The Best Years of Our Lives](https://catalog.afi.com/Film/24693-THE-BEST-YEARS-OF-OUR-LIVES), [Miramax](https://www.miramax.com/movie/the-english-patient/) y [Netflix](https://www.netflix.com/title/81713119).
- Se quitó el género amplio `Guerra` de *Casablanca*, *El laberinto del fauno*, *El maquinista de la General* y *Teléfono rojo: volamos hacia Moscú*; ninguna de esas entradas tenía la señal explícita `Bélica`. La clasificación refleja su foco en melodrama, fantasía, comedia o sátira política: [BFI: Casablanca](https://www.bfi.org.uk/film/61d5c0dc-151e-5c9c-92ef-4a3039aa82f2/casablanca), [BFI: The General](https://www.bfi.org.uk/film/136a6211-90d9-5d18-b047-7967deac8bab/the-general), [AFI: The General](https://catalog.afi.com/Film/9303-THE-GENERAL) y [AFI: Dr. Strangelove](https://catalog.afi.com/Film/23082-DR-STRANGELOVE-OR-HOW-I-LEARNED-TO-STOP-WORRYING-AND-LOVE-THE-BOMB). No se modificó la categoría principal.
- Se dejaron sin la señal explícita `Bélica` *El puente de los espías*, *Lo que el viento se llevó*, *Lincoln*, *Love and Death*, *Persépolis*, *The Breadwinner* y *Los archivos del Pentágono*, donde la guerra cumple principalmente una función histórica, política o de contexto.

## Edición y medios

- Se reescribieron 109 cierres de reseña con fórmulas genéricas, otros cierres redundantes y dos textos formulaicos. El contenido nuevo conserva las opiniones y los datos específicos de cada película.
- `npm run images:people:check` revisó 5.393 retratos: todos pasan formato, resolución mínima y limpieza de metadata. Esa validación técnica no confirma por sí sola que la imagen sea un retrato editorial apropiado.
- `npm run posters:check` revisó 2.227 carteles locales: cero errores; 1.503 dentro del rango de bytes preferido y 724 con avisos por tamaño. Los archivos mantienen dimensiones y formato válidos; el aviso de bytes no implica un defecto visual. También se inspeccionó una muestra de carteles pequeños y se confirmó que correspondían a sus películas.
- **Retratos indicados por el usuario:** se conservaron sin cambios los assets disponibles de Andrés Alberto Tan He, Chien Min Lee, Yuchen Che, Fiona Gollob, Lenny Gonzales, Valentina Oviedo, Virginia Esparza y Eric Leighton. La inspección anterior los había señalado como recortes de stills o material grupal; el usuario autorizó mantenerlos. En el catálogo no existe una entrada de persona ni un archivo local de retrato para Marcos Mossello; su crédito de *Los calvos* se conservó y no se inventó una imagen.
- Los créditos de *Los Caminantes de la Calle* están documentados por [Festival de Lima](https://festivaldelima.com/2026/pelicula/los-caminantes-de-la-calle/); [Alternativa Teatral](https://www.alternativateatral.com/persona160960-fiona-gollob) verifica a Fiona Gollob; los créditos de *Marianela y el cadáver* aparecen en [IMDb](https://www.imdb.com/title/tt33037951/) y parte del elenco en [Ámbito](https://www.ambito.com/espectaculos/weser-la-tierra-explota-y-marianela-y-el-cadaver-tres-estrenos-nacionales-la-poesia-la-denuncia-ambiental-y-el-humor-negro-n6305856/amp). [IMDb de Eric Leighton](https://www.imdb.com/name/nm0500343/) confirma su identidad. Para Marcos Mossello, [Cine Nacional](https://cinenacional.com/persona/marcos-mossello) no muestra foto; [Visions du Réel](https://www.visionsdureel.ch/en/film/2024/the-bald/) y [Business Doc Europe](https://businessdoceurope.com/vdr-grand-angle-qa-the-bald-by-marcos-simon-mossello-elias-ezequiel-gismondi/) corroboran el crédito.

## Correcciones técnicas

- La carga del catálogo del home conserva la selección inicial de Cine/streaming; si el usuario elige “Más nuevas” explícitamente, activa el catálogo completo y ordena por año.
- Se corrigió el desborde horizontal de los filtros rápidos alrededor de 980 px con una grilla de tres columnas.
- Escape ya no permite que una búsqueda demorada vuelva a abrir las sugerencias sobre los filtros.
- Se ajustaron E2E para esperar la hoja de estilos al medir overflow, inspeccionar el sitemap como XML, esperar banderas/imágenes lazy-loaded y no exigir en móvil una ilustración que el diseño compacto oculta deliberadamente.

## Validaciones

- `npm run check`: 223 archivos; cero errores, advertencias o hints.
- `npm run validate:content -- --skip-build`: 2.227 películas, 620 perfiles aprobados, cero sinopsis débiles, reseñas cortas, cierres formulaicos o rutas locales de póster inválidas. `npm run validate:sitemap-indexability` validó 5.087 páginas canónicas.
- `npm run build`: compilación estática de 7.315 páginas completada.
- `audit:profiles`, `audit:profiles:facts`, `test:editorial-meters`, `test:poster-source-policy`, `audit:content-quality`, `audit:editorial-low-value`, `images:people:check` y `posters:check` pasaron. El auditor editorial no halló candidatas de reseñas repetitivas, cortas o formulaicas; el aviso de 188 diferencias entre categoría y primer género es informativo y no justifica alterar la taxonomía principal.
- Playwright recorrió 108 casos en cada uno de sus cinco proyectos (540 en total): 487 aprobados y 53 omitidos por viewport/proyecto. Chromium escritorio: 95/13; Firefox escritorio: 93/15; WebKit escritorio: 94/14; Chromium móvil: 103/5; WebKit móvil: 102/6. No quedaron aserciones fallidas.
- La prueba de rango de edad se ajustó porque Firefox vacía un `<input type="number">` al tipear un año mayor al atributo `max`. Ahora establece ese estado inválido con la API DOM y verifica el mensaje/ARIA de validación. La prueba corregida pasó en los cinco proyectos, y la corrida completa final de Chromium/Firefox terminó con 188 aprobados, 28 omitidos y cero fallos.
- Chromium escritorio/Firefox terminaron normalmente. WebKit escritorio y móvil reportaron los 108 estados de cada proyecto, todos aprobados u omitidos; la sesión de escritorio se cerró antes de poder guardar su código de salida y la de móvil quedó esperando a un worker, por lo que se interrumpió. La regresión corregida sí terminó con código 0 en los cinco proyectos.
- `git diff --check` no reportó errores de whitespace. Git mostró avisos de normalización LF/CRLF propios de `core.autocrlf`.

## Publicación

La autorización del usuario cubrió los retratos locales disponibles de los nombres indicados; se conservaron esos ocho assets sin cambios. Marcos Mossello no tiene registro ni retrato local en el catálogo, y su crédito se mantuvo sin inventar una imagen. Ese faltante no bloquea la publicación.
