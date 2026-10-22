# Cartelera CABA y Provincia de Buenos Aires — 22/10/2026

Se revisaron las 43 fichas con Cine: **7 bajas, 36 continuidades, 8 altas y 1 reestreno recuperado**, con **45 películas** en la cartelera final. Hay **16 JSON candidatos** y **2393 películas** en el catálogo. Se trabaja en `feature/movie-cartelera-ba-2026-10-22`, sin commit ni publicación.

La cantidad final crece porque los nueve ingresos superan las siete bajas. No se impone un cupo al carrusel: las películas antiguas que conservan una función válida en CABA/PBA siguen correspondiendo. Atlas se comprobó por complejo, fecha y respuesta de funciones; su lista nacional o una fecha de estreno no bastan. Se sumaron Gaumont, La Plata, Mar del Plata, El Palomar, MALBA y programación independiente.

El [manifiesto y ledger](cartelera-ba-2026-10-22/evidencia.json) contiene rutas, duplicate-check, identidad/año original, disponibilidad AR y tipo de oferta, puntajes crudos y conversión, taxonomía, créditos/retratos, arte/trailers, omisiones y límites por película.

## Altas

| Película | Año original | Score y evidencia |
|---|---|---|
| Clayface | 2026 | [8.9/10; IMDb audience as reported by JustWatch](https://www.justwatch.com/ar/pelicula/clayface) → 8 |
| El poder de la red | 2026 | [71/100; RT Popcornmeter](https://www.rottentomatoes.com/m/the_social_reckoning) → 7 |
| Buenas vibraciones | 2026 | [5.8/10; IMDb audience; página localizada indexada y campo IMDb de JustWatch](https://www.imdb.com/fr/title/tt38607784/ratings/) → 6 |
| Heidi: El rescate del lince | 2025 | [6.4/10; IMDb audience as reported by JustWatch](https://www.justwatch.com/ar/pelicula/heidi-to-the-rescue) → 6 |
| Que Dios perdona a todos | 2026 | [6.5/10; IMDb audience as reported by JustWatch](https://www.justwatch.com/ar/pelicula/que-dios-perdona-a-todos) → 7 |
| Terror en el Amazonas | 2026 | [67/100; RT Popcornmeter](https://www.rottentomatoes.com/m/beware_boiuna) → 7 |
| ¿Querés ser mi hijo? | 2026 | [2/5; Diego Batlle, crítico individual](https://otroscines.com/post/critica-de-queres-ser-mi-hijo-pelicula-de-hernan-guerschuny-con-wanda-nara-y-agustin-bernasconi) → 4 |
| Susana Rinaldi, libre | 2025 | [7/10; Juan Pablo Russo, crítico individual](https://www.escribiendocine.com/noticias/2026/10/20/19460-critica-de-susana-rinaldi-libre-el-tango-como-postura-politica-y-memoria-activa) → 7 |

Se respetan 2025 para Heidi y Susana aunque el estreno comercial argentino sea de hoy. RT audiencia tiene prioridad sobre crítica. Cuando no publica porcentaje se continúa a otros agregados. Los datos de IMDb reproducidos por JustWatch se atribuyen expresamente como indirectos; no habilitan 9/10. Clayface 8.9 con 145 votos queda en 8 por confianza y por falta de reconocimiento perdurable. ¿Querés ser mi hijo? usa **Diego Batlle 2/5 → 4** y Susana **Juan Pablo Russo 7/10 → 7**, ambos como crítico individual después de la contingencia, sin presentarlos como consenso. Las alternativas de Watchmode y los accesos fallidos están registrados; null no equivale a cero.

**Los otros** ya existía como `the-others-2001`: se reutiliza esa ficha, se corrige título AR/fecha 22/10 y se agrega Cine junto con Apple TV transaccional. No cambia su score 8.

## Bajas

- **Bajo tus pies** → Otras plataformas. [Ofertas AR](https://www.justwatch.com/ar/pelicula/bajo-tus-pies).
- **Vértigo 2: Punto muerto** → Otras plataformas. [Ofertas AR](https://www.justwatch.com/ar/pelicula/vertigo-2-punto-muerto).
- **Quiero tu sexo** → Otras plataformas. [Ofertas AR](https://www.justwatch.com/ar/pelicula/quiero-tu-sexo).
- **Los Juegos del Hambre** → Apple TV. [Ofertas AR](https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre).
- **Los Juegos del Hambre: En llamas** → Apple TV. [Ofertas AR](https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre-en-llamas).
- **Los Juegos del Hambre: Sinsajo Parte 1** → Apple TV. [Ofertas AR](https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre-sinsajo-parte-1).
- **Los Juegos del Hambre: Sinsajo Parte 2** → Apple TV. [Ofertas AR](https://www.justwatch.com/ar/pelicula/los-juegos-del-hambre-sinsajo-parte-2).

Las cuatro películas de Los Juegos del Hambre conservan alquiler/compra en Apple TV. Vértigo 2, Quiero tu sexo y Bajo tus pies pasan a Otras plataformas, sin afirmar llegada a streaming. Se conservan exactamente sus puntajes, reseñas, créditos, géneros y medios. No se afirma que hayan salido de toda Argentina.

**Discrepancias:** Quebutaca/Única Cartelera todavía muestra Quiero tu sexo en Atlas Alcorta el 22/10 a las 20:20; la API del propio exhibidor no ofrece complejo, fecha ni función del título, y las otras cadenas contrastadas no lo sostienen. Se retira Cine por falta de función vigente verificable en el exhibidor, conservando la discrepancia en el ledger. Bajo tus pies tiene una futura función el **31/10 a las 21** en Gritos/Planetario UNLP, festival que comienza el 30/10: no se usa para prolongar al 22/10 una exhibición comercial finalizada.

## Funciones que sostienen las continuidades y altas

| Película | Sala y localidad | Función o primera fecha comprobada | Evidencia |
|---|---|---|---|
| Adolescencia, sexo y muerte en Campamento Miasma | Gaumont; Av. Rivadavia 1635, CABA | 2026-10-27 22:00 | [Fuente](https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=372001&fecha=27/10/2026) |
| Annemarie | MALBA; Av. Figueroa Alcorta 3415, CABA | 2026-10-23 20:00 | [Fuente](https://malba.org.ar/evento/annemarie/) |
| Avengers: Endgame | Atlas Flores; Rivera Indarte 44, Cdad. Autónoma de Buenos Aires | 2026-10-22 15:00 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=197&codPelicula=546&fecha=2026-10-22) |
| Buenas vibraciones | Atlas Patio Bullrich; Posadas 1245, Cdad. Autónoma de Buenos Aires | 2026-10-22 18:20 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=195&codPelicula=610&fecha=2026-10-22) |
| Cars | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 12:30 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=593&fecha=2026-10-22) |
| Clayface | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 13:30 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=608&fecha=2026-10-22) |
| CordobeCes: La película | Gaumont; Av. Rivadavia 1635, CABA | 2026-10-22 16:00 | [Fuente](https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=372001&fecha=22/10/2026) |
| Coyote vs. Acme | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 15:20 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=547&fecha=2026-10-22) |
| Desobediente | Gaumont; Av. Rivadavia 1635, CABA | 2026-10-23 20:00 | [Fuente](https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=372001&fecha=23/10/2026) |
| Digger | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 20:00 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=582&fecha=2026-10-22) |
| El corazón de la bestia | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 20:30 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=578&fecha=2026-10-22) |
| El poder de la red | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 15:00 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=611&fecha=2026-10-22) |
| El tren fluvial | MALBA; Av. Figueroa Alcorta 3415, CABA | 2026-10-24 20:00 | [Fuente](https://malba.org.ar/evento/el-tren-fluvial/) |
| Escondida en mi cabeza | Cine Teatro Helios; Ciudad Jardín, El Palomar, Morón, PBA | 2026-10-22 20:00 | [Fuente](https://apiv2.gaf.adro.studio/movie/45/6716a18a3cda1aad8fd1eddaaa257112) |
| Escuela de Monstruos | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 13:50 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=604&fecha=2026-10-22) |
| Guardianes del museo 2 | Cinema Los Gallegos Shopping; Mar del Plata, PBA | 2026-10-24 14:50 | [Fuente](https://www.cinemacenter.com.ar/ficha/5812-GUARDIANES-DEL-MUSEO-2---2D-CAST) |
| Hangar Rojo | Sala Norita Cortiñas / ATE Cultura; Belgrano 2527, CABA | 2026-10-23 19:00 | [Fuente](https://agendadecine.com/ciclos-y-festivales/octubre-en-sala-norita-cortinas-espacio-incaa-ate-nacional) |
| Heidi: El rescate del lince | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 12:40 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=612&fecha=2026-10-22) |
| Hope: El primer impacto | Atlas Liniers; Coronel Ramon L. Falcon 7145, Cdad. Autónoma de Buenos Aires | 2026-10-22 18:10 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=198&codPelicula=594&fecha=2026-10-22) |
| La caída de la ballena | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 14:40 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=605&fecha=2026-10-22) |
| La casa | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 20:50 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=595&fecha=2026-10-22) |
| La invitación | Cosmos UBA; Av. Corrientes 2046, CABA | 2026-10-22 17:20 | [Fuente](https://www.foquito.ar/) |
| La isla olvidada | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 14:40 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=580&fecha=2026-10-22) |
| La noche del demonio: Están entre nosotros | Cinema Ocho; La Plata, PBA | 2026-10-22 16:10 / 22:50 | [Fuente](https://www.cinemalaplata.com/Titulos/Index/7390) |
| La Odisea | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 17:40 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=501&fecha=2026-10-22) |
| La vida es así | Atlas Patio Bullrich; Posadas 1245, Cdad. Autónoma de Buenos Aires | 2026-10-22 16:50 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=195&codPelicula=596&fecha=2026-10-22) |
| Lo dejamos acá | Gaumont; Av. Rivadavia 1635, CABA | 2026-10-22 14:00 | [Fuente](https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=372001&fecha=22/10/2026) |
| Lo que trajo la tormenta | Sala Norita Cortiñas / ATE Cultura; Belgrano 2527, CABA | 2026-10-30 19:00 | [Fuente](https://agendadecine.com/ciclos-y-festivales/octubre-en-sala-norita-cortinas-espacio-incaa-ate-nacional) |
| Madre siniestra | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 21:10 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=597&fecha=2026-10-22) |
| PAW Patrol: La Dino Película | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 13:00 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=528&fecha=2026-10-22) |
| Pepita la pistolera | Gaumont; Av. Rivadavia 1635, CABA | 2026-10-22 15:00 | [Fuente](https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=372001&fecha=22/10/2026) |
| Que Dios perdona a todos | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 15:40 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=613&fecha=2026-10-22) |
| ¿Querés ser mi hijo? | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 18:20 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=609&fecha=2026-10-22) |
| Resident Evil: Noche Cero | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 18:50 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=569&fecha=2026-10-22) |
| Spider-Man: Un Nuevo Día | Cinema Ocho / Cinema San Martín; La Plata, PBA | 2026-10-22 13:45 / 18:20 / 22:40 | [Fuente](https://www.cinemalaplata.com/Titulos/Index/7297) |
| Street Fighter | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 12:50 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=598&fecha=2026-10-22) |
| Su propio infierno | Cinépolis Houssay, MUBI Fest; Av. Córdoba 2135, CABA | 2026-10-23 14:20 | [Fuente](https://www.timeout.com/es/buenos-aires/mubi-fest-2026-cinepolis-houssay) |
| Susana Rinaldi, libre | Gaumont; Av. Rivadavia 1635, CABA | 2026-10-22 18:45 | [Fuente](https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=372001&fecha=22/10/2026) |
| Terror en el Amazonas | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 22:50 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=614&fecha=2026-10-22) |
| Los otros | Cinema City; La Plata, PBA | 2026-10-22 12:00 / 16:35 / 21:10 | [Fuente](https://www.cinemalaplata.com/Titulos/Index/8514) |
| Tiempos de ilusión | Atlas Patio Bullrich; Posadas 1245, Cdad. Autónoma de Buenos Aires | 2026-10-22 16:30 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=195&codPelicula=607&fecha=2026-10-22) |
| Tres adioses | Cosmos UBA; Av. Corrientes 2046, CABA | 2026-10-22 19:10 | [Fuente](https://www.foquito.ar/) |
| Una quinta en Portugal | Cine Lorca; Av. Corrientes 1428, CABA | 2026-10-22 13:55 / 16:10 | [Fuente](https://agendadecine.com/pelicula/una-quinta-en-portugal) |
| Verity: La sombra de un engaño | Atlas Caballito; Av. Rivadavia 5071, Cdad. Autónoma de Buenos Aires | 2026-10-22 12:20 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=191&codPelicula=583&fecha=2026-10-22) |
| Yo, Narciso | Atlas Flores; Rivera Indarte 44, Cdad. Autónoma de Buenos Aires | 2026-10-22 22:20 | [Fuente](https://www.atlascines.com/Peliculas/GetCacheFuncionesComplejoPeliculaFecha?complejoId=197&codPelicula=529&fecha=2026-10-22) |

La matriz JSON conserva todas las funciones recuperadas, con fecha y URL. Cosmos/Lorca y MUBI tienen los límites de acceso primario descritos en el ledger y horarios nominales contrastados: no se afirma una compra de entradas comprobada. Escondida tiene funciones oficiales Helios el 22/10 20:00 y 28/10 18:00. Guardianes sigue en Los Gallegos, Mar del Plata, 24/25 a las 14:50. Esto evita usar la ausencia en una cadena porteña como baja de toda PBA.

## Pendiente

**Militante:** estreno comprobado del 22/10, pero sólo se identifica a Pablo Ayala como participante principal. La [skill de carga](../skills/la-posta-cine-add-movie/SKILL.md) exige “at least two distinct, full-name principal actors/performers”; el director o personal técnico no cuentan sin papel en pantalla verificado. Se ejecutó la contingencia nominal y no apareció un segundo participante documentado. No se creó una ficha parcial ni se inventaron créditos.

## Texto, personas y arte

Ocho sinopsis, ocho reseñas y ocho guías de siete campos originales, escritas desde cero por IA. Taxonomía revisada película por película: Susana es documental sobre música, sin convertirla en Musical; ninguna alta tiene guerra central. No se agregan etiquetas De culto por inferencia ni se cambian categorías para activar medidores.

21 personas nuevas; 28 identidades / 29 apariciones de créditos en las altas. Todos los nombres retenidos tienen retrato local decodificable y fuente trazable, con auditor de personas aprobado. Se preservan ausentes los datos opcionales no documentados de Tobias Schwarz. Se documenta la omisión de la codirectora Aizea Roca, sin retrato seguro; se conserva la dirección principal internacional de Tobias. Los retratos seleccionados fueron inspeccionados junto a sus fuentes nominales. Se descarta un reemplazo grupal automático de Noher y se recupera su retrato aprobado.

Pósters de IMDb y Selecta, más Cine Nacional para Susana, inspeccionados antes/después de localizarlos con el script canónico. Se rechazaron las miniaturas de Cinemark, el perfil JustWatch de 718 px y el afiche alemán de Heidi con un badge promocional. Se usa arte original cuando no hay afiche AR de alta resolución verificable; las fechas extranjeras impresas no se usan como fecha argentina. Los 8 WebP locales son correctos y legibles.

## Validación

La auditoría sin omitir YouTube pasó para los 16 candidatos, con 16 pósters válidos y cero errores. Avisos: búsqueda auxiliar de YouTube HTTP 302 (oEmbed y correspondencia aprobados), biografía/nacionalidad opcionales, hosts nominales fuera de la lista corta, referencias de Filmportal/Cine Nacional no reconocidas por el detector limitado y dos pósters por debajo del peso preferido. Un cruce entre recomendaciones de Vértigo es heredado y no se altera en una baja de plataforma. El warning sobre historial Buffer era un commit heredado de origin/main frente al main local, sin cambios del trabajo en ese archivo.

Resultados de compilación, salida pública, sitemap, auditor posterior y navegador: [validación](cartelera-ba-2026-10-22/validacion.json). No se cambian código/UI/Share/Comunidad/reacciones ni recomendadas/trailers. El build calcula Radar desde las notas versionadas, sin regenerar ediciones.

Validación final: `npm run check` aprobó 302 archivos sin errores, avisos ni hints. `npm run validate:content` terminó correctamente, construyó 8034 páginas y validó 5634 URLs canónicas del sitemap. El auditor posterior de cine, Comunidad y reacciones pasó sobre los 16 candidatos.

Chromium de escritorio y WebKit móvil comprobaron las 45 tarjetas, sus 45 pósters, ausencia de las siete bajas y las 16 fichas afectadas con póster correcto, sin errores de página. La suite de carruseles pasó **8/8**, usando un worker después de dos timeouts en la primera ejecución paralela (6 aprobadas). Capturas: [escritorio](cartelera-ba-2026-10-22/desktop-chromium-carousel.png) y [móvil](cartelera-ba-2026-10-22/mobile-webkit-carousel.png).

**Límite del helper de streaming:** la auditoría postbuild completa devuelve cuatro errores para Los Juegos del Hambre porque exige cada candidata en un carrusel cuyo selector real tiene cupo de 12. Se conserva [la salida cruda](cartelera-ba-2026-10-22/audit-built.json). La selección del código real se contrastó con el DOM: **12/12 exactas en ambos navegadores**, sin modificar UI, fechas ni snapshots. No se declara que ese helper haya pasado. La auditoría específica de cine sí pasó sin errores.

Los logs versionados omiten la enumeración repetida de rutas y normalizan espacios finales. Se conservan resultados, advertencias, errores y resúmenes; los registros originales quedan en el archivo temporal de investigación.
