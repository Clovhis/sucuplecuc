# Estrenos de streaming en Argentina, del 23 al 29 de noviembre de 2026

Corte del viernes 27 en Argentina. El barrido de JustWatch AR recorrió los siete días, agotó la paginación y devolvió 662 registros y 649 títulos distintos sin recorte por año. Se consultó por separado el feed de cada paquete disponible en JustWatch para separar una detección de las demás ofertas vigentes. Los días 28 y 29 todavía no devolvían registros. La cobertura de esta publicación es parcial.

- [Evidencia de las altas, las revalidaciones y las consultas por proveedor](evidencia.json)
- [Manifiesto de títulos con fechas, modalidades y estado](manifiesto.json)
- [Guía de la semana](https://www.cineposta.com.ar/editorial/estrenos-streaming-23-al-29-noviembre-2026/)

Las altas abarcan Netflix, Apple TV, Paramount+, Prime Video, MUBI y HBO Max. Se comprobaron diferencias entre el año original, fecha del pase, modalidad y fecha de incorporación al sitio. Los pases detectados en el feed de un proveedor se registran como detecciones, sin atribuirles una primera disponibilidad histórica. Las fichas existentes conservan sus fechas. También se revisaron incorporaciones de Disney+ y se actualizaron plataformas vigentes y puntajes donde correspondía.

Para cada score publicado se priorizó el Popcornmeter y se conservó la muestra y normalización en el archivo de evidencia. The Mosquito Bowl obtuvo 90% de audiencia y un 8 tras aplicar el criterio de obra maestra. Fuego contra fuego conservó su 9 por la evidencia de audiencia y el reconocimiento sostenido de la Academia y el BFI. Se revisó la identidad y el póster local de cada alta, los créditos y personajes por película y el material visual de la nota. Los sidecars de créditos están en el directorio de altas.

## Pendientes al corte

- Netflix. El niño figura en el feed argentino del 27 y tiene un 5,4/10 temprano en IMDb mostrado por JustWatch. La Academia y el ICAA confirman dirección, duración, elenco y parte de los personajes. Sigue pendiente completar la evidencia para el crédito de Álex Infantes y resolver su retrato o excepción. Quasimodo tiene fecha oficial y reparto principal, pero aún no se comprobó un score publicable. Watchmode devolvió ambas métricas vacías para los dos títulos. Los siete perros figura como disponible en Netflix Argentina. Falta completar el cotejo de personajes y retratos de reparto.
- Paramount+. El feed fechó Maldita Trinidad el martes 24 y el Popcornmeter mostró 66% con 250+ valoraciones verificadas. Pendiente retrato comprobado del director Richard Gray. El Show de JLo queda pendiente de revisión de formato y créditos.
- MUBI. El feed directo trajo Queridos vecinos y La Gloria de las Prostitutas. Esta última queda pendiente por el piso de participantes con identidad, créditos y retrato comprobados. Nostalgia de la luz, El botón de nácar y La cordillera de los sueños aparecieron en el feed de MUBI Amazon Channel, mientras la oferta directa requiere confirmación local.
- Flow. El calendario argentino anunció El peso de la libertad como alquiler el jueves 26. Sigue pendiente corroborar el título exacto y una oferta propia de Flow con una fuente de Personal o su catálogo. Series, señales lineales y servicios adicionales se revisaron como modalidades separadas.
- Crunchyroll. El feed propio registró Strike Witches: La Película el jueves 26. Sigue pendiente verificar el tráiler oficial y el retrato de Kazuhiro Takamura. Mercado Play registró Tiroteo en Columbine: minuto a minuto el mismo día. Sigue pendiente la revisión editorial del documental. CINE.AR Play registró Bienvenidos al infierno y Perros del viento el miércoles 25. Ambos requieren revisión de ficha.
- Prime Video, HBO Max, Disney+ y otros proveedores. La matriz registra las detecciones restantes, incluidos los otros títulos de Bond. El arribo semanal y la aprobación individual de todos esos títulos siguen pendientes. Las tiendas de Apple y Amazon se distinguen de la suscripción base y cada canal adicional conserva su propio código.

Fuentes de los pendientes de mayor interés: [Netflix Argentina, Los siete perros](https://www.netflix.com/ar/title/83198436), [Netflix, Quasimodo](https://about.netflix.com/en/news/netflix-presents-quasimodo-the-soul-of-paris-the-myth-revisited-releasing-nov-27-2026), [ICAA, El niño](https://infoicaa.mcu.es/CatalogoICAA/Peliculas/Detalle?Pelicula=167926), [programación argentina de Flow](https://www.cineteca.com.ar/estrenos-de-flow-noviembre-2026/), [programación de MUBI](https://www.escribiendocine.com/noticias/2026/10/26/26265-mubi-en-noviembre-de-2026-estrenos-peliculas-y-series/).

## Carrusel y validación

El build muestra 12 fichas de streaming, sin slugs repetidos ni coincidencias con las 24 fichas de la cartelera de cine. Las siete altas entran en el carrusel. Las primeras cuatro llevan «Recién agregada» y las otras se ordenan por la fecha de llegada detectada. Se verificaron en Chromium a 1440 y 320 px, junto con los 14 enlaces de la guía y la carga de sus cuatro imágenes.

La auditoría previa de 24 fichas terminó sin errores y registró 168 advertencias, entre ellas datos opcionales, procedencia de imágenes, tamaño objetivo de pósters y búsquedas de YouTube. La auditoría de las mismas fichas después del build terminó también sin errores y registró 155 advertencias. El control global de retratos aprobó 6.859 imágenes.

La variante de auditoría global detectó dos errores preexistentes de grafía del crédito de J. K. Simmons en Juno y La La Land. Se cotejaron ambos archivos con origin/main. La auditoría puntual de la tanda informa sus resultados por separado.

Pasaron la validación dirigida, Astro Check, el build local de 9.025 páginas, la validación de salida pública, el sitemap y 86 pruebas Playwright de editorial y carruseles en Chromium de escritorio y móvil.

En Cambio de roles, la ficha prioriza la suscripción verificada en HBO Max. El alquiler de Flow fue documentado en octubre y su vigencia sigue pendiente al 27/11. Apple TV Store y Amazon Video corresponden a tiendas transaccionales.
