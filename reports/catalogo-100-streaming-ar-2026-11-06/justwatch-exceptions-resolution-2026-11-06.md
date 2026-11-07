# JustWatch AR: resolución de excepciones

Consulta de las 20 excepciones del lote, realizada el **2026-11-06 a las 23:02:17.597 UTC** mediante la API GraphQL de JustWatch (`https://apis.justwatch.com/graphql`, `country: AR`, `language: es`). Se contrastó cada fila con el título y año del JSON actual y con la coincidencia de título localizado/año de JustWatch. Los proveedores y ofertas repetidos en la respuesta se deduplicaron por tipo y proveedor; se excluyeron ofertas de cine.

El ledger anterior tenía 18 resultados `unmatched` y 2 `mismatch`. En esta consulta los 20 títulos se corroboraron con una ficha argentina del mismo largometraje y año. No quedó ninguno sin evidencia.

| Película del catálogo | JustWatch AR (título y año) | FLATRATE | RENT | BUY |
|---|---|---|---|---|
| 3 anuncios por un crimen (2017) | [Tres anuncios en las afueras (2017)](https://www.justwatch.com/ar/pelicula/tres-anuncios-en-las-afueras) | Disney Plus | — | — |
| 500 días con ella (2009) | [(500) días juntos (2009)](https://www.justwatch.com/ar/pelicula/500-dias-juntos) | Disney Plus | — | — |
| Amigos con beneficios (2011) | [Con derecho a roce (2011)](https://www.justwatch.com/ar/pelicula/con-derecho-a-roce) | HBO Max | Amazon Video; Apple TV Store | Amazon Video; Apple TV Store |
| Boda sangrienta (2019) | [Noche de bodas (2019)](https://www.justwatch.com/ar/pelicula/noche-de-bodas) | Disney Plus | — | — |
| Calabozos & Dragones: Honor entre ladrones (2023) | [Dungeons & Dragons: Honor entre ladrones (2023)](https://www.justwatch.com/ar/pelicula/dungeons-y-dragons) | Paramount Plus; Paramount+ Amazon Channel | Amazon Video; Apple TV Store | Amazon Video; Apple TV Store |
| Contra lo imposible (2019) | [Le Mans '66 (2019)](https://www.justwatch.com/ar/pelicula/le-mans-66) | Disney Plus | — | — |
| El esquema fenicio (2025) | [La trama fenicia (2025)](https://www.justwatch.com/ar/pelicula/the-phoenician-scheme) | HBO Max | — | Amazon Video; Apple TV Store |
| El juicio de los 7 de Chicago (2020) | [El juicio de los siete de Chicago (2020)](https://www.justwatch.com/ar/pelicula/el-juicio-de-los-7-de-chicago) | Netflix | — | — |
| El sueño de Walt Disney (2013) | [Al encuentro de Mr. Banks (2013)](https://www.justwatch.com/ar/pelicula/al-encuentro-de-mr-banks) | Disney Plus | — | — |
| Historias cruzadas (2011) | [Criadas y Señoras (2011)](https://www.justwatch.com/ar/pelicula/criadas-y-senoras) | Disney Plus | — | — |
| La chica del dragón tatuado (2011) | [Millennium: Los hombres que no amaban a las mujeres (2011)](https://www.justwatch.com/ar/pelicula/la-chica-del-dragon-tatuado) | MovistarTV; HBO Max | MovistarTV | Amazon Video; Apple TV Store |
| La increíble vida de Walter Mitty (2013) | [La vida secreta de Walter Mitty (2013)](https://www.justwatch.com/ar/pelicula/la-vida-secreta-de-walter-mitty) | Disney Plus | — | — |
| La violencia está en nosotros (1972) | [Defensa (1972)](https://www.justwatch.com/ar/pelicula/defensa) | HBO Max | Apple TV Store | Apple TV Store |
| Llegan los Muppets (1979) | [La película de los Teleñecos (1979)](https://www.justwatch.com/ar/pelicula/la-pelicula-de-los-telenecos) | Disney Plus | — | — |
| Mi nombre es Dolemite (2019) | [Yo soy Dolemite (2019)](https://www.justwatch.com/ar/pelicula/yo-soy-dolemite) | Netflix | — | — |
| Nace una estrella (2018) | [Ha nacido una estrella (2018)](https://www.justwatch.com/ar/pelicula/ha-nacido-una-estrella) | Amazon Prime Video; MovistarTV; HBO Max | Apple TV Store | Apple TV Store |
| Un amor inseparable (2017) | [La gran enfermedad del amor (2017)](https://www.justwatch.com/ar/pelicula/la-gran-enfermedad-del-amor) | Amazon Prime Video | Apple TV Store | Apple TV Store |
| Un lugar en silencio Parte 2 (2021) | [Un lugar tranquilo 2 (2021)](https://www.justwatch.com/ar/pelicula/un-lugar-tranquilo-2) | Netflix; Paramount Plus; MovistarTV; Paramount+ Amazon Channel; Universal+ Amazon Channel | MovistarTV; Amazon Video; Apple TV Store | Amazon Video; Apple TV Store |
| Volver (2006) | [Volver (2006)](https://www.justwatch.com/ar/pelicula/volver) | Filmelier Plus Amazon Channel | Apple TV Store; Amazon Video | Apple TV Store; Amazon Video |
| Yo vi al diablo (2010) | [Encontré al diablo (2010)](https://www.justwatch.com/ar/pelicula/encontre-al-diablo) | MUBI; MUBI Amazon Channel | — | — |

## Cotejo con las fichas

- **18 `unmatched`:** los títulos localizados de JustWatch difieren del `title` o `originalTitle` usado en la consulta inicial, pero coinciden en año e identidad; las páginas y ofertas de la tabla confirman disponibilidad AR.
- **Amigos con beneficios (2011), marcado `mismatch`:** la búsqueda inicial tomó una ficha de JustWatch rotulada *Friends (With Benefits)*, año 2010, sin ofertas. La ficha argentina de *Con derecho a roce* corresponde a 2011 y sí muestra HBO Max en FLATRATE, además de Amazon Video y Apple TV Store para RENT y BUY. La etiqueta actual `HBO Max` coincide.
- **Volver (2006), marcado `mismatch`:** título y año sí coinciden. JustWatch muestra Filmelier Plus Amazon Channel en FLATRATE y Apple TV Store/Amazon Video en RENT y BUY. El JSON conserva `Otras plataformas`; el proveedor de suscripción es un canal Amazon no representado en la taxonomía de plataformas. La alerta previa surgía de tratar una oferta transaccional de Apple TV como plataforma principal.
- En varias páginas hay suscripciones adicionales de MovistarTV y canales de Amazon (`Paramount+`, `Universal+`, `MUBI` o `Filmelier Plus`). Las fichas mantienen las plataformas representadas en el catálogo; los canales y proveedores no representados quedan consignados aquí por separado y no se reinterpretan como etiquetas del sitio.

Esta revisión no modificó JSON de películas, `people.json` ni otros reportes.
