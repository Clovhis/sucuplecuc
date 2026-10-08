# Cartelera de Argentina — 8 de octubre de 2026

Quedaron **11 altas** (10 visibles en el build del 8/10 y Annemarie preparada para el 9/10), **13 salidas de Cine**, **dos reingresos** y **42 películas en el carrusel vigente**. Se revisaron las 43 fichas que inicialmente tenían Cine. El catálogo pasa de 2254 a 2265 películas. La tanda incluye estrenos en Argentina de cualquier país de producción: siete altas argentinas y cuatro extranjeras.

El pedido de cargar todos los estrenos **no queda totalmente cubierto**: 11 candidatos identificados siguen pendientes por evidencia insuficiente, además de los límites regionales y eventos detallados abajo. No se inventaron notas, personas, plataformas ni películas para completar la tanda. La disponibilidad es una foto del 8/10; una cartelera nacional cambia y requiere nuevas comprobaciones.

Validación realizada en `feature/movie-cartelera-ar-2026-10-08`, base `5fe8557d`. Los resultados y capturas de este reporte corresponden a la etapa previa a publicar. Después de revisarlos, el usuario autorizó publicar en `main` y dejar el repositorio limpio; la publicación debe comprobar el SHA remoto, GitHub Pages y las rutas públicas.

## Altas

| Película | Año original | Estreno comercial AR | Score | Estado |
| --- | --- | --- | --- | --- |
| Madre siniestra | 2026 | 2026-10-08 | 8 | Cine, visible hoy |
| A cualquier precio | 2026 | 2026-10-08 | 8 | Cine, visible hoy |
| El tren fluvial | 2026 | 2026-10-08 | 7 | Cine, visible hoy |
| La casa | 2025 | 2026-10-08 | 7 | Cine, visible hoy |
| La vida es así | 2025 | 2026-10-08 | 7 | Cine, visible hoy |
| Hope: El primer impacto | 2026 | 2026-10-08 | 8 | Cine, visible hoy |
| Lo dejamos acá | 2026 | 2026-10-08 | 8 | Cine, visible hoy |
| Annemarie | 2026 | 2026-10-09 | 7 | Preparada; estreno 9/10, fuera del build de hoy |
| Retrato de un pianista | 2025 | 2026-10-01 | 7 | Cine, visible hoy |
| Una película de Parque Chas | 2025 | 2026-10-04 | 6 | Cine, visible hoy |
| Desobediente | 2026 | 2026-09-17 | 6 | Cine, visible hoy |

Cada alta tiene reseña original rioplatense, los siete campos de la toma de diez segundos, taxonomía, póster WebP local, tráiler con identidad verificada y personas retenidas con retratos. Los documentos de catálogo se regeneraron con sus scripts. No se editaron manualmente los catálogos derivados.

Annemarie tiene primera función comercial el viernes 9/10 a las 20:00 en [MALBA](https://malba.org.ar/evento/annemarie/). `getMovies()` excluye estrenos futuros; por eso hoy no tiene ficha ni Comunidad en dist y no aparece en el carrusel. Su publicación requiere un nuevo build a partir del 9/10. Los laureles BAFICI del póster no prueban una fecha comercial anterior.

[Lo dejamos acá](https://about.netflix.com/es/news/netflix-presenta-el-trailer-oficial-de-lo-dejamos-aca-la-nueva-pelicula-argentina-con-ricardo-darin-y-diego-peretti) tiene funciones Gaumont esta semana y llega a Netflix el 16/10. Conserva Cine hoy. La fecha Netflix impresa en su arte oficial no se convirtió en una plataforma disponible antes de tiempo.

## Revalidación de Cine y plataformas

| Película existente | Antes | Después | Score |
| --- | --- | --- | --- |
| El final de la calle Oak | Cine | Apple TV | 8, conservado |
| Los domingos | Cine | Otras plataformas | 7, conservado |
| Código: Venganza | Cine | Otras plataformas | 8, conservado |
| Hospital Británico | Cine | Otras plataformas | 7, conservado |
| Los calvos | Cine | Otras plataformas | 5, conservado |
| Tadeo El Explorador y la Lámpara Maravillosa | Cine | Otras plataformas | 7, conservado |
| Cars | Disney Plus | Cine + Disney Plus | 7, conservado |
| Adolescencia, sexo y muerte en Campamento Miasma | Otras plataformas | Cine | 7, conservado |
| El árbol mágico | Cine | Otras plataformas | 8, conservado |
| One Piece: La película | Cine | Otras plataformas | 7, conservado |
| Panda Plan 2: La tribu mágica | Cine | Apple TV | 4, conservado |
| El último gran golpe | Cine | Otras plataformas | 5, conservado |
| Su propio infierno | Cine | Otras plataformas | 4, conservado |
| Cuentos del jardín mágico | Cine | Otras plataformas | 7, conservado |
| Relajadas y muy peligrosas | Cine | Otras plataformas | 7, conservado |

El final de la calle Oak y Panda Plan 2 tienen **alquiler/compra en Apple TV Store Argentina**, no suscripción Apple TV+. Se contrastaron las ofertas de JustWatch AR; [Apple AR para El final de la calle Oak](https://tv.apple.com/ar/movie/el-final-de-la-calle-oak/umc.cmc.zgc43vpna42wfgfi645em0sm) confirmó identidad y país. Para Panda Plan 2, la oferta inequívoca procede de [JustWatch AR](https://www.justwatch.com/ar/pelicula/panda-plan-the-magical-tribe); la página Apple AR no fue accesible. Las once bajas restantes no tienen una oferta online legal AR vigente verificable en esta investigación: Otras plataformas expresa esa falta de evidencia, no la existencia garantizada de un servicio alternativo.

Cars vuelve por su reestreno del 8/10, conserva año original 2006, score 7 y Disney Plus por suscripción. Campamento Miasma vuelve por [NAVE UNCUYO, 13/10 a las 20:40](https://nave.uncuyo.edu.ar/evento/fecha/2026/10). JustWatch AR también señala MUBI/MUBI Amazon Channel, proveedor que no integra las etiquetas admitidas del sitio: se documentó esa oferta, sin inventar una etiqueta ni mezclar Cine con Otras plataformas.

Las decisiones por cada una de las 43 fichas originales, URLs y notas de contraste están en [evidence.json](cartelera-2026-10-08/evidence.json), campos `baselineMatrix`, `platformEvidence` y `changes`. Se conservaron exactamente los 15 scores existentes; las discrepancias de referencias actuales se informan en `preservedScoreChecks`.

## Funciones y alcance de la búsqueda

Se cruzaron [Cinemark](https://www.cinemark.com.ar/elegi-pelicula), [Atlas](https://www.atlascines.com/Peliculas), [Showcase](https://www.todoshowcase.com/), [Cinemacenter](https://www.cinemacenter.com.ar/cartelera), [Gaumont](https://www.cinegaumont.ar/es-AR), [MALBA](https://malba.org.ar/evento/annemarie/), [NAVE UNCUYO](https://nave.uncuyo.edu.ar/evento/fecha/2026/10), Select/Ecoselect La Plata, El Cairo, Córdoba y funciones regionales específicas. Los calendarios de Atlas y las consultas públicas fechadas de Gaumont/Las Tipas se guardaron como hechos de títulos y fechas, sin datos privados ni credenciales.

El listado mensual de estrenos de Cines Argentinos sirve para identificar altas y fechas comerciales, **no para probar que una película sigue en cartelera**. Tampoco se aceptó una oferta CINEMA de JustWatch sin funciones actuales. La página de Cinépolis devolvió un estado vacío/inaccesible, por lo que su ausencia aislada no se usó para retirar una película. Funciones secundarias del 7/10 y carteleras de Bolivia, Chile, México, Venezuela, España o Estados Unidos se descartaron como prueba vigente AR.

El cruce permitió conservar Tres adioses, Bajo tus pies y Encantador, que tenían funciones regionales de esta semana. [Linkin Park: Unshatter](https://cineya.lat/ar/pelicula/linkin-park-unshatter/) tiene funciones fechadas en Cinépolis Recoleta el 8, 9, 12 y 13/10; no se retiró sólo porque el evento inicial terminaba el 4/10. Las Tipas tenía Tadeo y Spa Weekend indexadas el 7/10, pero su programación pública del 8/10 ya no los incluye.

La matriz indica retiro cuando no se recuperaron funciones vigentes tras este cruce, no una prueba absoluta de inexistencia en cada sala argentina. No se garantiza un censo exhaustivo de todas las salas o cineclubes del país.

## Evidencia de los scores nuevos

Se priorizó audiencia pública y se agotaron las rutas de contingencia pertinentes antes de recurrir a un crítico individual. Los agregadores sin nota, un desafío de acceso y un rating null se distinguen: ninguno vale cero. Primero se normaliza a 1–10 y aplica la confianza; después el filtro editorial sólo puede bajar. No se concedió 9 o 10 a estrenos recientes por popularidad o una nota externa alta.

| Película | Referencia elegida | Dato | Normalización/final | Razón |
| --- | --- | --- | --- | --- |
| Madre siniestra | [audiencia TMDb](https://www.themoviedb.org/movie/1400837-other-mommy) | 9.1/10; 10 | 9 → 8 | Muestra de diez votos; confianza máxima 8. No hay reconocimiento perdurable que habilite 9/10. |
| A cualquier precio | [audiencia RT](https://www.rottentomatoes.com/m/by_any_means_2026) | 88/100; 1,000+ Verified Ratings | 9 → 8 | 88/100 normaliza a 9; baja a 8 por el filtro editorial: estreno reciente sin evidencia de reconocimiento perdurable excepcional. |
| El tren fluvial | [audiencia IMDb](https://www.imdb.com/title/tt39381628/ratings/) | 6.5/10; 47 | 7 → 7 | Muestra pequeña; tope de confianza 8, sin efecto sobre el 7 normalizado. |
| La casa | [crítico individual: Juan Pablo Russo](https://www.escribiendocine.com/noticias/2026/05/31/20933-critica-de-la-casa-diego-peretti-y-el-thriller-donde-todo-parece-perdido-hasta-que-deja-de-serlo) | 7/10; sin muestra de audiencia | 7 → 7 | Un crítico; tope 8. IMDb tt39674284 no publica nota de audiencia verificable. No se usó el ID secundario ambiguo tt39709028. |
| La vida es así | [audiencia IMDb](https://www.imdb.com/it/title/tt34905624/ratings/) | 6.6/10; 1.3k | 7 → 7 | RT no ofrece una audiencia numérica inequívoca; IMDb normaliza a 7. |
| Hope: El primer impacto | [audiencia RT](https://www.rottentomatoes.com/m/hope_2026) | 77/100; 500+ Verified Ratings | 8 → 8 | 77/100 normaliza a 8; no habilita nivel de obra maestra. |
| Lo dejamos acá | [audiencia IMDb](https://www.imdb.com/es-es/title/tt37027309/) | 9.4/10; 31 | 9 → 8 | Muestra de 31 votos: 9 normalizado, tope de confianza 8; no reconocimiento perdurable para 9/10. |
| Annemarie | [crítico individual: Maximiliano Curcio](https://cinefreaks.net/2026/10/07/annemarie-los-rostros-de-toda-una-vida/) | 7/10; sin muestra de audiencia | 7 → 7 | Un crítico; tope 8. Watchmode 11119541 devuelve ratings null; no son cero. |
| Retrato de un pianista | [crítico individual: Emiliano Basile](https://www.escribiendocine.com/noticias/2026/09/30/25575-critica-de-retrato-de-un-pianista-documental-sobre-el-musico-antonio-formaro/) | 7/10; sin muestra de audiencia | 7 → 7 | Un crítico; tope 8. Sin audiencia numérica verificable tras la contingencia. |
| Una película de Parque Chas | [crítico individual: Emiliano Basile](https://www.escribiendocine.com/noticias/2026/10/01/25620-critica-de-una-pelicula-de-parque-chas-un-barrio-contado-desde-adentro) | 6/10; sin muestra de audiencia | 6 → 6 | Un crítico; tope 8. Watchmode 11057512 devuelve ratings null; no son cero. |
| Desobediente | [crítico individual: José C. Donayre Guerrero](https://www.escribiendocine.com/noticias/2026/10/02/25674-critica-de-desobediente-una-familia-frente-a-las-huellas-de-la-dictadura) | 6/10; sin muestra de audiencia | 6 → 6 | Un crítico; tope 8. No se encontró una ficha de audiencia numérica inequívoca; homónimos descartados. |

Las rutas complementarias, IDs, acceso y resultados aparecen en `scoreEvidence` y `complementaryScoreAccess` del JSON. La casa corresponde a Gustavo Triviño/Diego Peretti, IMDb tt39674284; se descartó un ID secundario ambiguo y la adaptación española del cómic. Hospital británico no se confundió con Britannia Hospital de 1982.

## Metadatos, personas y medios

Madre siniestra queda +13 por clasificación AR de Cinemacenter/Las Tipas. La casa conserva año original 2025 por su festival e IMDb, con estreno comercial 8/10/2026 y duración comercial 107 minutos (IMDb, La Nación y Las Tipas); las referencias al corte de festival de 95 minutos no se usaron como duración del estreno actual. Retrato de un pianista y Una película de Parque Chas también conservan el año original 2025. El tren fluvial y Retrato de un pianista no se clasificaron Musical por tener música; ninguna alta se etiquetó Bélica para activar un filtro.

En Desobediente, [Biblioteca Nacional](https://www.bn.gov.ar/agenda-cultural/desobediente) acredita dirección de Federico Coringrato; Martín Vergara es idea/guion. La clasificación fuente SP se representa como ATP dentro de la taxonomía admitida, dejando explícita la indicación de supervisión parental. Se mantuvo el fallecimiento público de Taty Almeida del 14/6/2026, confirmado por [Provincia de Buenos Aires](https://www.gba.gob.ar/derechoshumanos/noticias/la_subsecretar%C3%ADa_de_derechos_humanos_de_la_provincia_despide_taty_almeida).

Hay 39 créditos distintos retenidos entre las altas. Se modificaron 42 registros de personas y agregaron 27; también se corrigieron retratos insuficientes detectados en la auditoría de fichas existentes. Cada director/intérprete retenido tiene imagen local decodificable de al menos 200×250 y referencia de identidad. Las referencias de fuentes oficiales y entrevistas se conservaron aunque el auditor no reconozca su host habitual. Las fechas de nacimiento y nacionalidades sin prueba se dejaron ausentes. No se escribieron nuevas biografías extensas ni se inventaron enlaces a perfiles.

Omisiones específicas de las altas, después de buscar imágenes individuales e identidad:

| Película | Personas no retenidas | Dato faltante |
| --- | --- | --- |
| El tren fluvial | Milo Barría, Mariano Barría | Retratos individuales verificables recuperados con resolución suficiente. Quedan Rita Pauls y Fabián Casas, sin contar directores como actores. |
| Hope | HOYEON | Crédito de monónimo no cuenta para el mínimo de dos intérpretes con nombre y apellido. El piso está cubierto por otros protagonistas verificados. |
| Annemarie | Alicia Heinrich, Ricardo Heinrich | Retratos individuales trazables no recuperados. Mariana Sanguinetti cuenta también como participante en pantalla por crédito verificado; Graciela Borges completa el mínimo. |
| Retrato de un pianista | Eduardo Chino Orueta | No se recuperó retrato individual identificado en CN/IMDb/prensa. Antonio Formaro y Maximiliano Coria cumplen el mínimo. |
| Una película de Parque Chas | Margarita García Simón, Oscar Mango, Isabel Mango | No se recuperaron retratos individuales verificables en las rutas consultadas. Se retienen Inés Fernández Moreno y Ariel Prat, participantes centrales acreditados. |

La omisión afecta a los créditos de esta alta; no se borraron personas globales usadas por otras películas. Los intentos sin acceso no equivalen a afirmar que nunca existe una foto.

Los 11 pósters fueron descargados desde originales de al menos 720×1000, inspeccionados antes de convertir y revisados en WebP final mediante el localizador canónico. No se usó Cines Argentinos como origen de arte. La hoja de control está en [posters-final.png](cartelera-2026-10-08/posters-final.png). El póster Netflix de Lo dejamos acá es una composición oficial con los actores rotados; se verificó el arte del estudio y no se alteró. Firmas, laureles y créditos propios del afiche se conservaron. No se rellenaron artificialmente archivos válidos para alcanzar un peso preferido.

Los trailers oficiales se contrastaron por fuente, película, año y oEmbed. El auditor reporta algunas búsquedas YouTube HTTP 302; eso no se ocultó ni se presentó como reproducción remota completa. Los diálogos de tráiler sí se comprobaron en la suite local.

## Pendientes concretos

| Película | Año original | Bloqueo | Evidencia/función |
| --- | --- | --- | --- |
| Abeja | 2025 | score | No se encontró una nota numérica publicable tras audiencia pública/Watchmode y crítica explícita. Metadatos y medios restantes no se consideran aprobados. [Fuente](https://agendadecine.com/pelicula/abeja). Renzi La Banda 8, 10 y 11/10 a las 20:00. |
| Todo va mal | 2026 | score | IMDb tt45257108 respondió con desafío/HTTP 202; TMDb 1744553 y Letterboxd sin audiencia numérica; Watchmode 11231020 devuelve ratings null. No se recuperó crítica con nota explícita. [Fuente](https://cineclubmunicipal.org.ar/production/todo-va-mal/). Cineclub Municipal Córdoba, semana 8–14/10. |
| Crotos libres | 2025 | score, créditos y retratos | Sin puntuación verificable recuperada; Pedro aparece sólo por nombre y no se verificaron dos participantes principales con crédito de nombre y apellido y retratos. [Fuente](https://www.pagina12.com.ar/861314-la-filosofia-del-ocio-creador/). Gaumont 9/10 a las 20:00. Año 2025 por programa FICPBA; duración pendiente de resolver. |
| Rocambole en el camino | Sin resolver | créditos y retratos, año | Crítico Maximiliano Curcio 8/10 recuperado; sin audiencia agregada inequívoca. Rocambole figura como monónimo y Oscar Jalil es el único intérprete con crédito de nombre y apellido: no alcanza el mínimo. Retratos de directores y año original siguen pendientes. [Fuente](https://cinefreaks.net/2026/06/23/rocambole-en-el-camino-imaginario-colectivo/). Gaumont 10/10 a las 20:00. |
| Soy ella | 2026 | créditos y retratos | Hay crítica explícita 7/10, pero sólo Milena Kalo Navun tiene identidad principal de nombre y apellido; falta verificar un segundo participante principal y retratos. WIP 2025 no prueba estreno original 2025. Watchmode por título y TMDb 1742608 no devuelve coincidencia inequívoca. [Fuente](https://www.escribiendocine.com/noticias/2026/09/25/25468-critica-de-soy-ella-la-delicada-mirada-de-cecilia-pinotti-sobre-la-kalo). Gaumont 14/10 a las 20:00. |
| Una chica en la estación | 2026 | score y gates de personas | IMDb tt35920351/TMDb 1661955 sin nota numérica recuperada; Watchmode 11119861 con ratings null. Los demás gates de carga siguen abiertos. [Fuente](https://www.escribiendocine.com/noticias/2026/10/07/25776-festival-de-cine-inusual-de-buenos-aires-2026-peliculas-sedes-y-programacion-de-la-21-edicion/). Gaumont 8/10 a las 22:00; Cristian Bidone, no el error BiAdone de la programación. |
| La película que quisieras ver | 2026 | score y gates de personas | Sin rating inequívoco recuperado en el barrido de audiencia/Watchmode; gates de medios/personas aún abiertos. Director acreditado Esteban Pablo Pérez Ghersi. [Fuente](https://www.escribiendocine.com/noticias/2026/10/07/25776-festival-de-cine-inusual-de-buenos-aires-2026-peliculas-sedes-y-programacion-de-la-21-edicion/). Gaumont 9/10 a las 22:00. |
| Camino de brujas | 2026 | score y gates de personas | No se recuperó rating numérico inequívoco en audiencia pública/Watchmode; no se consideran aprobados los medios ni las personas. Director Rodrigo Cardozo. [Fuente](https://www.escribiendocine.com/noticias/2026/10/07/25776-festival-de-cine-inusual-de-buenos-aires-2026-peliculas-sedes-y-programacion-de-la-21-edicion/). Gaumont 10/10 a las 22:00. |
| El silencio de Marilyn | 2026 | score y gates de personas | Sin nota numérica inequívoca recuperada tras el barrido público y Watchmode. Director Edgardo Gabo; demás gates abiertos. [Fuente](https://www.escribiendocine.com/noticias/2026/10/07/25776-festival-de-cine-inusual-de-buenos-aires-2026-peliculas-sedes-y-programacion-de-la-21-edicion/). Gaumont 13/10 a las 22:00. |
| Yo soy Hermes | 2023 | score y gates de personas | No se recuperó rating inequívoco; Watchmode también se consultó con año original 2023 sin coincidencia. No se confunde la función de festival 2026 con el año original. Director Gonzalo Albornoz. [Fuente](https://www.escribiendocine.com/noticias/2026/10/07/25776-festival-de-cine-inusual-de-buenos-aires-2026-peliculas-sedes-y-programacion-de-la-21-edicion/). Gaumont 14/10 a las 22:00. |
| Bárbara | 2026 | identidad | Gaumont atribuye Andrés Andreani; el programa de Cine Inusual acredita Tomás Emanuel Brunella. No se cargó el homónimo de 2011 ni se consultó su rating como si fuera este film. [Fuente](https://www.escribiendocine.com/noticias/2026/10/07/25776-festival-de-cine-inusual-de-buenos-aires-2026-peliculas-sedes-y-programacion-de-la-21-edicion/). Gaumont 11/10 a las 22:00. |

El detalle legible por herramientas está en [pending.json](cartelera-2026-10-08/pending.json). La [skill de alta](../skills/la-posta-cine-add-movie/SKILL.md) exige: “If the floor cannot be met, block the title.” También prohíbe inventar scores o debilitar los mínimos de créditos/retratos. Se aplicó esa regla a los títulos pendientes, sin transformar un monónimo en nombre completo por un alias ni contar al equipo técnico como protagonistas.

Otros límites: Diarios de un viajero y La virgen de la Tosquera aparecieron en NAVE como programación anterior/repertorio y no completaron una nueva alta en esta tanda. Blue Lock no tuvo identidad de nuevo largometraje AR inequívoca; no se cargó una serie o Episode Nagi 2024 como película nueva de 2026. Preventas futuras de Dune, Doomsday y Street Fighter se excluyeron del estreno actual. Queen/Lalisa son eventos o programación de recitales; Lalisa tampoco cumplió el mínimo de dos protagonistas con nombre y apellido en esta revisión.

## Carrusel y verificación final

El carrusel usa las plataformas/fechas del catálogo: ahora tiene 42 títulos visibles y excluye las 13 bajas y Annemarie futura. Incluye Cars y Campamento Miasma. Se actualizó su prueba para contrastar todos los slugs contra los JSON vigentes y exigir enlace a la ficha para cada tarjeta; se retiraron ejemplos fijos que obligaban a mantener películas ya salidas de cartelera. No se alteraron el renderer, autoplay, diálogos, workflows ni la integración de streaming.

| Verificación | Resultado |
| --- | --- |
| validate:content, incluido build final serial | PASS; 7575 páginas construidas |
| check | 257 archivos; 0 errores, 0 warnings, 0 hints |
| Auditor final, sin omitir YouTube | 26 fuentes; 25 fichas publicadas con controles de Comunidad/reacción/carruseles; 0 errores |
| Fuente Annemarie | PASS por separado; sin exigir rutas futuras |
| Avisos del auditor | 79 warnings, 10 infos; datos biográficos opcionales, hosts primarios, pesos de póster, HTTP 302 y solapamientos editoriales heredados |
| Personas de las 26 fichas | PASS; sin nacionalidades/fechas inferidas |
| Imágenes de personas | 5495 retratos revisados; PASS |
| Sitemap | 5310 rutas canónicas; PASS |
| Playwright de carruseles | 16/16; escritorio/móvil, Chromium/WebKit |
| Navegación adicional | 25 fichas × dos tamaños = 50; pósters WebP cargados, enlace Comunidad, sin desbordes ni errores JavaScript |
| Home adicional | 42/42 slugs y pósters verificados en dos tamaños |
| Taxonomía en navegador | 8 controles: las 10 altas visibles excluidas de Musical/Guerra/De culto en escritorio y móvil; sello De culto de Psycho cargado en ambos tamaños |
| Duplicados y scores existentes | Sin duplicados nuevos; 15 scores existentes idénticos a la base |
| git diff --check | PASS |

Evidencia: [auditor publicado](cartelera-2026-10-08/audit-final-published.json), [auditor futuro](cartelera-2026-10-08/audit-final-future.json), [navegación](cartelera-2026-10-08/browser-final.json), [build/contenido](cartelera-2026-10-08/validation-final.log), [Playwright](cartelera-2026-10-08/playwright-final.log). Capturas: [carrusel escritorio](cartelera-2026-10-08/carousel-desktop.png), [carrusel móvil](cartelera-2026-10-08/carousel-mobile.png), [ficha escritorio](cartelera-2026-10-08/detail-desktop.png), [ficha móvil](cartelera-2026-10-08/detail-mobile.png). Los SHA256 de los 26 JSON comprobados están en evidence.json.

Los [controles de filtros](cartelera-2026-10-08/filter-final.json) se hicieron mediante los botones reales, con sesiones aisladas.

`npm run update-upcoming-releases` se intentó con el script oficial, pero TMDb respondió HTTP 403. Se preservó `upcomingReleases.generated.ts`; no se fabricó una actualización ni se modificó la automatización. Este refresco queda pendiente del servicio externo y no invalida las altas/cartelera ya comprobadas.
