# Plataformas Argentina: control del viernes 23 de octubre de 2026

Ventana: lunes19 a viernes23/10/2026, inclusive. Se verifica únicamente disponibilidad legal de películas y especiales originales de2026 en Argentina. No se trabaja cartelera ni se crea una nota editorial. Se aplican las skills de carga y auditoría; la autorización previa de publicación se conserva para este nuevo control.

**Resultado: cinco altas, tres actualizaciones de plataformas, seis fichas ya vigentes y nueve candidatas pendientes.** Un título más se excluye por estreno original2025. El [registro de evidencia](plataformas-ar-2026-10-23-evidencia.json) conserva cada decisión, fuente, modalidad y score; [la validación](plataformas-ar-2026-10-23-validacion.json) registra los controles finales.

## Fichas cargadas

|Película|Llegada AR|Disponibilidad|Score|
|---|---|---|---|
|El paraíso / The Paradise|22/10|Netflix, suscripción|3|
|Idiotas / Idiots (antes The Shitheads)|22/10|Prime Video y Apple TV, alquiler/compra|6|
|Mother Mary|23/10|HBO Max, suscripción|6|
|Papi Ricky: La película|23/10|Prime Video, suscripción|7|
|Paralizada por la esperanza: La historia de Maria Bamford|23/10|Netflix, suscripción|8|

**Actualizaciones:** Colony pasa de Otras plataformas a Apple TV y Prime Video, como alquiler/compra. Scary Movie incorpora Paramount Plus como proveedor principal de suscripción y conserva Apple TV como tienda secundaria; se respeta el máximo de dos proveedores. Pulp agrega Prime Video a Apple TV, ambas operaciones transaccionales. No se alteran sus reseñas, fechas, géneros ni scores.

La Invitación2026, Primate, Los mejores años de nuestra vida2026, Spider-Man, Las redes sociales mataron a la estrella de cine y Moana Live Action ya estaban cargadas. Se distingue La Invitación2015 del film2026 y la animación Moana2016 del live action2026. Las nuevas ofertas de Amazon no justifican agregar un tercer proveedor ni tocar las etiquetas Cine de fichas ajenas al manifiesto.

## Cobertura y contingencias

Se agotaron las conexiones diarias `newTitles` de JustWatch AR del19 al23/10, filtradas por películas/año2026: 87 identidades brutas y23 con ofertas recientes de proveedores representados. Se sumó Tragedia con evidencia específica de Flow. La búsqueda se cruzó con las fichas oficiales y comunicaciones argentinas. Se cubrieron Netflix, HBO Max, Prime Video, Disney Plus, Paramount Plus, Apple TV, Crunchyroll, Flow, CINE.AR, Mercado Play y DGO. Otras plataformas se trata como etiqueta de incertidumbre, no como un proveedor.

Mercado Play devuelve403 hoy; DGO entrega el portal sin un inventario público fechable. Esos límites impiden prometer exhaustividad absoluta. No se atribuyen novedades a Crunchyroll sin evidencia. CINE.AR está accesible; C.I.T.A.2019 y las incorporaciones de films2020/2023 no califican como estrenos originales2026. Tenzing llegó el16/10 y queda fuera de la ventana. En Flow, un bundle con Paramount/HBO no prueba disponibilidad nativa; Mother Mary anunciada para el24/10 tampoco se adelanta.

Se usó **Watchmode API** por el CLI canónico, con búsqueda por identidad. Permitió recuperar IMDb/TMDb de Contra el huracán, Maria Bamford, Demasiado honesto para vender, el especial CMA, Echo Point y Neon Affair. Sus ratings null siguen siendo no disponibles; los valores de Watchmode no se atribuyen a IMDb. Las búsquedas sin coincidencia y las limitaciones de acceso se distinguen de la ausencia de puntuación.

Pendientes, con fuentes y recorrido en el JSON:

- **Contra el huracán:** sin valoración numérica verificable tras RT, IMDb, TMDb, JW, Metacritic, Letterboxd, FilmAffinity, Filmweb, SensCritique y Watchmode. No se inventa score.
- **Tragedia (Flow,22/10):** sin rating numérico del documental exacto tras búsqueda dirigida y Watchmode. No se confunde con obras homónimas.
- **Hot Wheels, ¡a correr! Ataque del T-Rex:** no se completan score y medios/créditos del especial exacto; no se reutiliza la ficha de la serie. Movieguide es inaccesible403.
- **CMA: celebración de Dolly Parton:** sin retrato seguro del director Alan Carter ni tráiler oficial YouTube. El MP4 promocional no equivale a un ID de YouTube; el productor Robert Deaton no reemplaza al director.
- **Echo Point:** no se recupera un retrato atribuible del director Evan Marcewicz. Watchmode no resuelve ese campo; no se reemplaza con un homónimo.
- **Neon Affair:** sin retrato seguro de Sean Hinds. Se siguió la nueva pista TMDb1694394/persona5177200, sin foto; se descarta el homónimo norirlandés. La puntuación ya disponible no elimina ese bloqueo.
- **Theo Von: I'm Doing Fine:** un solo intérprete principal; incumple el piso de dos sin inventar una participación.
- **Patagonian Chimeras:** afiche vertical disponible con laureles promocionales, rechazado por política de pósters. Se buscaron alternativas en TMDb, distribuidor/director y FilmFreeway; no se recorta ni se convierte un fotograma en afiche. Sus retratos investigados no se agregan huérfanos al sitio.
- **Demasiado honesto para vender:** las tiendas argentinas publican Sin Calificación/NR. Se recuperó una valoración de audiencia suficiente, pero no se inventa ATP/+N. Su edad es el bloqueo que resta.

**Desmadre en la granja / Animal Farm:** excluida por premiere en Annecy el9/6/2025. La llegada a tiendas en2026 no la transforma en estreno original de2026.

## Puntajes, géneros y metadatos

Se prioriza audiencia: RT verificado27%→3 para El paraíso,57%→6 para Idiotas y60%→6 para Mother Mary. IMDb indirecto de JW/Prime7.3 (25votos)→7 para Papi Ricky; IMDb indirecto de JW7.9 (45votos)→8 para Maria Bamford. Muestras pequeñas/indirectas limitadas a8; no se elige Tomatometer cuando existe una métrica de audiencia. Las tres revalidaciones conservan sus scores: Scary63%→6, Pulp7.5 (299votos)→8 y Colony93%→9 normalizado, reducido a8 por el límite explícito del usuario y la falta de reconocimiento perdurable de obra maestra. No se promedian fuentes.

La matriz semántica está por ficha: El paraíso conserva Acción como carril, Idiotas y Papi Ricky Comedia, Mother Mary Drama, Maria Bamford Documental. Los géneros previos de las tres fichas existentes se conservan. Ninguna acredita un conflicto militar central: no se agrega Bélica. Mother Mary conserva Drama y agrega Musical en genres: el podcast oficial de A24 con Lowery y Hathaway establece que la coreografía central comunica el conflicto como un monólogo y sostiene el relato. No se decide por la profesión de cantante. Pulp registra concierto/archivo y no se convierte en musical por su tema. Las señales de medidores secundarios ocultos son informativas y no disparan cambios de categoría.

Se verifica país de producción y se conservan códigos ISO. Mother Mary usa DE/FI/IE/US de JW AR y la fuente cinematográfica de contraste; Apple menciona GB y se documenta la discrepancia sin inventar una coproducción adicional. Para duración se prioriza proveedor digital: Idiotas98min Apple AR, Mother Mary111min Apple AR y Papi Ricky99min Prime (JW informa93). Edades: Paradise+16 JW AR; Idiotas SAM18 Apple AR; Mother Mary13+ HBO AR; Papi Ricky7+ Prime y Bamford16+ Netflix AR.

## Personas, imágenes y texto

35 identidades distintas /35 apariciones de créditos retenidas e inspeccionadas. Se agregan12 personas con foto y referencias trazables; se reemplaza el retrato previo de Patton Oswalt120×165 por la fuente original960×1318 y se procesa con el optimizador canónico. Se registra el alias exacto Kim Shin-rok para el display heredado Kim Sin-rock, respaldado por el crédito y retrato de Colony; no se cambia la película. Se recuperan11 fechas y11 nacionalidades explícitas para las12 altas. Quedan ausentes la nacionalidad de Mohan Babu, el nacimiento de Michaela Coel por contradicción interna de fuente y los dos datos opcionales previos de Neil Berkeley. No se infieren nacionalidades por lugar de nacimiento ni se publican placeholders.

Nani es un monónimo real verificado y no cuenta al piso: Mohan Babu y Sonali Kulkarni cubren los dos intérpretes completos. En Bamford, el programa oficial MSPIFF45 identifica expresamente a Maria Bamford y Patton Oswalt como reparto principal y a Apatow/Berkeley como directores. No se agrega crew ni material de archivo incidental para llenar créditos. Se conserva una selección de protagonistas suficiente; no se agregan retratos de personas de candidatas bloqueadas.

Los cinco afiches fuente780×1170 se inspeccionaron y se localizaron con el comando canónico, comparando luego los ocho artes finales. Las sinopsis, reseñas y siete campos de guía de las cinco altas son originales, específicos y escritos para cada film: no se copió ni tradujo prosa de fuentes ni se inventó un visionado del usuario. La primera auditoría encontró anclas incompletas en las guías; se corrigieron con nombres completos y se repitió sin omitir YouTube.

## Verificación y publicación

El manifiesto explícito tiene ocho rutas y se usa en ambos audits y en el navegador. Los resultados y advertencias finales quedan en el JSON de validación. Se preservan los resultados brutos del chequeo auxiliar de streaming cuando ignora el máximo vigente de12 tarjetas, contrastando después el orden completo con la selección canónica. No se alteran código, fechas ni selección para satisfacer ese chequeo. La comprobación final de Musical incluye Mother Mary y la excluye de Guerra; la combinación Musical+Drama conserva el comportamiento OR.

No se modifican UI, rutas, scripts, workflows, cartelera ni ediciones independientes de recomendaciones/tráilers. Se regeneran solamente catálogos/créditos derivados de las altas. No se escribe una nota editorial. El directorio .tmp ya existía al comenzar. Su contenido anterior del22/10 se conserva íntegro al archivar los temporales fuera del repositorio al cerrar la publicación; no se elimina trabajo ajeno.
