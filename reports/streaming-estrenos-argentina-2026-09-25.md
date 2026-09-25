# Estrenos de streaming en Argentina — 25/09/2026

**Fecha del relevamiento:** 25 de septiembre de 2026.

**Mercado:** Argentina. Ventana de novedades: 18–25 de septiembre de 2026.

**Alcance:** todas las plataformas de streaming configuradas en src/lib/platforms.ts; se excluyó el carril teatral “Cine”, como pidió el usuario. CINE.AR se relevó como streaming. Se registraron seis altas y dos actualizaciones.

## Altas nuevas

| Película | Disponibilidad verificada en Argentina | Estreno AR | Puntaje y conversión |
|---|---|---:|---|
| [Baby Do Die Do](https://www.justwatch.com/ar/pelicula/baby-do-die-do) | Netflix, suscripción. Ficha oficial de [Netflix](https://www.netflix.com/title/83195142). | 23/09/2026 | [IMDb](https://www.imdb.com/title/tt37544992/): 6,4/10, ~1,1 mil votos → **6**. |
| [Modha Rathri](https://www.justwatch.com/ar/pelicula/modha-rathri) | Netflix, suscripción. [Netflix](https://www.netflix.com/title/82811466) confirma título y elenco; [CBFC India](https://cbfcindia.gov.in/cbfcAdmin/search-result.php?recid=Q0EwMzA4MDgyMDI2MDAxOTM%3D) respalda créditos y duración. | 18/09/2026 | [IMDb](https://www.imdb.com/title/tt42262473/): 8,8/10, ~1,2 mil votos → **9**. JustWatch muestra otra agregación (7,7/~2,6 mil); no se promediaron fuentes. |
| [Sinagtala](https://www.justwatch.com/ar/pelicula/sinagtala) | Netflix, suscripción. [Netflix](https://www.netflix.com/title/82995800); [GMA](https://www.gmanetwork.com/entertainment/showbiznews/sinagtala-starring-kapuso-stars-releases-official-trailer/120918/) verifica dirección, elenco y premisa. | 24/09/2026 | [IMDb](https://www.imdb.com/title/tt36349782/): 7,8/10, 12 votos → **8**. Muestra chica, consignada para que se lea con cautela. |
| [Autos, Mota y Rocanrol](https://www.justwatch.com/ar/pelicula/autos-mota-y-rocanrol) | Prime Video, suscripción. [IMCINE](https://www.imcine.gob.mx/media/2025/2/cm-2025-v3.pdf) y [El País](https://elpais.com/mexico/2025-06-10/autos-mota-y-rocanrol-el-mitico-y-escandaloso-festival-de-avandaro-revive-como-comedia-y-falso-documental.html) respaldan datos y enfoque. | 20/09/2026 | [IMDb](https://www.imdb.com/title/tt36971130/): 7,2/10, 437 votos → **7**. |
| [El Diario de Pilar en Amazonas](https://www.justwatch.com/ar/pelicula/el-diario-de-pilar-en-amazonas) | Disney+, suscripción. [Disney+ Brasil](https://www.disneyplus.com/pt-br/browse/entity-c51c8f8b-efd4-4c81-944f-4cf3907876fc) y [prensa Disney](https://imprensa.disney.com.br/novidades/o-di%C3%A1rio-de-pilar-na-amaz%C3%B4nia-estreia-em-20-de-mar%C3%A7o-no-disney%2B) confirman ficha y ventana de streaming; [IMDb](https://www.imdb.com/title/tt34382344/) respalda año, créditos y rating. | 25/09/2026 | IMDb: 6,2/10, 59 votos → **6**. |
| [Stray Kids: The dominATE Experience](https://www.justwatch.com/ar/pelicula/stray-kids-the-dominate-experience) | HBO Max, suscripción; Apple TV Store, alquiler/compra transaccional. [Live Nation](https://news.livenationentertainment.com/news/bleecker-streets-crosswalk-and-universal-pictures-content-group-acquire-k-pop-concert-film-stray-kids-the-dominate-experience-from-live-nation-studios) confirma producción; [AMC](https://www.amctheatres.com/movies/stray-kids-the-dominate-experience-82318/videos) ofrece ficha y arte. | 25/09/2026 | [IMDb](https://www.imdb.com/title/tt39216314/): 8,1/10, 1,6 mil votos → **8**. |

La conversión aplicada a ratings públicos de 0–10 fue round(valor), con límites 1–10. No se promediaron fuentes ni se asignaron scores sin rating público. En Modha Rathri se conserva la diferencia visible entre IMDb y la otra agregación mostrada por JustWatch; en Sinagtala queda explícito que el rating todavía tiene 12 votos.

### Carteles locales

Se descargaron y revisaron visualmente contra las fichas de título enlazadas arriba; los seis se convirtieron a WebP de 480 px de ancho y quedaron por debajo de 100 KiB. El verificador dedicado dio **6 aprobados, 0 advertencias, 0 errores**.

| Película | Fuente revisada | Original | WebP local |
|---|---|---:|---:|
| Baby Do Die Do | IMDb, ficha de título | 2363×3150 | 480×640, 53.284 bytes |
| Modha Rathri | IMDb, ficha de título | 1440×2160 | 480×720, 79.242 bytes |
| Sinagtala | IMDb, ficha de título | 1080×1350 | 480×600, 71.496 bytes |
| Autos, Mota y Rocanrol | [sitio del productor](https://www.danielfarah.com/autos) | 1406×2000 | 480×683, 75.600 bytes |
| El Diario de Pilar en Amazonas | Disney+/IMDb | 3421×5000 | 480×702, 74.708 bytes |
| Stray Kids: The dominATE Experience | AMC / ficha de película | 2700×4000 | 480×711, 56.762 bytes |

Las fichas guardan los posters locales en public/assets/posters/{año}/{slug}.webp. No se ampliaron imágenes pequeñas ni se añadieron sellos gráficos.

## Actualizaciones de fichas existentes

- [Toy Story 5](https://www.justwatch.com/ar/pelicula/toy-story-5): se refleja Disney+ como disponibilidad de streaming vigente en Argentina. Conserva Cine dentro de releasePlatforms porque la película seguía en cartelera al verificar; no se modificó su fecha teatral.
- [El día de la revelación](https://www.justwatch.com/ar/pelicula/el-dia-de-la-revelacion): se agregan Apple TV Store y Flow On Demand como alquiler/compra, no como suscripción. La ventana de Flow del 24/09 se contrasta con [Otros Cines](https://www.otroscines.com/post/todos-los-lanzamientos-de-flow-en-septiembre-2026).

## Cobertura de plataformas

Se revisaron Netflix, HBO Max, Paramount+, Disney+, Prime Video, Apple TV+, Mercado Play, Crunchyroll, DGO, Flow, CINE.AR y el estado de disponibilidad incierta. Los datos de proveedores con cobertura de JustWatch se contrastaron con páginas AR de título; Flow se comprobó además con la agenda local; CINE.AR y su catálogo se revisaron en [CINE.AR](https://www.cine.ar/index.php?idioma_sel=es) y [CINE.AR Play](https://play.cine.ar/).

| Plataforma | Resultado del período |
|---|---|
| Netflix | Tres altas: Baby Do Die Do, Modha Rathri y Sinagtala. |
| Prime Video | Una alta: Autos, Mota y Rocanrol. |
| HBO Max | Una alta: Stray Kids: The dominATE Experience. |
| Disney+ | Una alta: El Diario de Pilar en Amazonas; también se actualizó Toy Story 5. |
| Flow | Sin alta de estreno reciente; se actualizó El día de la revelación como transaccional. |
| Apple TV+ / Apple TV Store | Sin estreno SVOD reciente confirmado; aparece como alquiler/compra para Stray Kids y El día de la revelación. |
| Paramount+ | Los candidatos del período eran incorporaciones de catálogo anterior; ninguno cumplió el criterio de estreno reciente/novedad especial. |
| Crunchyroll | Sin película del período que pasara el filtro de novedad y los controles editoriales y de poster. |
| Mercado Play | No se halló una llegada reciente y específica con evidencia argentina verificable por título. |
| DGO | No se halló una llegada reciente y específica con evidencia argentina verificable por título. |
| CINE.AR Play | Se verificó como streaming independiente de la cartelera. Ningún candidato pasó todos los controles de publicación. |
| Cine | Excluido para altas teatrales nuevas, según la instrucción del usuario. |
| Otras plataformas | No se asignó ningún proveedor por inferencia ni por disponibilidad de otro mercado. |

### CINE.AR: candidatos revisados y descartados

CINE.AR se trató como plataforma de streaming. [Una temporada en la frontera](https://play.cine.ar/INCAA/produccion/9916) apareció como novedad de CINE.AR Play y se verificaron sus créditos; la imagen oficial disponible era de **250×378 px** y no se encontró un cartel mayor que cumpliera el mínimo de calidad. No se la amplió artificialmente. Las brigadistas tampoco reunió evidencia suficiente de créditos principales y poster para una ficha publicable. Las fichas existentes con CINE.AR no se modificaron.

## Auditoría y validación

- La búsqueda de duplicados se hizo antes de crear cada ficha: seis candidatos nuevos, sin coincidencias exactas de título/año.
- Auditoría individual de las seis fichas: **PASS**, con trailers verificados y campos editoriales completos. Créditos esenciales: al menos un director y dos intérpretes verificados por película.
- Auditoría de personas de las seis fichas: **PASS**. Se dejaron créditos de película sin perfil personal cuando faltó identidad/retrato verificable; no se inventaron fechas de nacimiento ni nacionalidades.
- Carteles nuevos: **6/6 PASS**.
- npm run validate:content -- --all --skip-build: salida 0; revisión integral de 2.227 fichas y perfiles. Reportó avisos históricos de calidad de cartel y títulos/remakes, sin errores.
- npm run build: salida 0; 7.265 páginas generadas.
- npm run validate:public-output: PASS.
- npm run validate:sitemap-indexability: PASS, 5.037 páginas canónicas.
- npm run audit:profile-originality -- --require-dist: PASS, 570 perfiles aprobados, 0 no indexables.
- npm run posters:check global: 2.227 carteles, 0 errores; quedan 724 avisos de tamaño preferido en fichas preexistentes. Los seis carteles de esta carga aprobaron el control dedicado.
- La opción --verify-reaction-build de la auditoría actual devuelve seis falsos positivos de texto: espera “Zafa”/“Mirala” en el HTML. La UI vigente muestra el score y su etiqueta canónica (por ejemplo, “6 · Buena” o “8 · Excelente”) junto con clases correctas pass/up; los seis HTML generados se inspeccionaron y coinciden con el score. No se modificó UI para adaptar el control desactualizado.
- npm run images:people:check: PASS en 5.382 retratos.

## Fuentes del catálogo CINE.AR

- [Portal CINE.AR](https://www.cine.ar/index.php?idioma_sel=es)
- [CINE.AR Play: Una temporada en la frontera](https://play.cine.ar/INCAA/produccion/9916)
- [Catálogo Cinenacional](https://cinenacional.com/)
