# Revalidación de Cartelera — 27/09/2026

## Resultado

La portada muestra las 31 fichas publicadas cuyo estado efectivo incluye `Cine` y cuya fecha no está en el futuro. El carrusel ya no recorta por una ventana de 42 días, un máximo de 12 tarjetas, la presencia de fecha ni la disponibilidad de tráiler. Los estrenos sin fecha y los reestrenos con año original quedan incluidos si su estado `Cine` fue revalidado.

## Fuentes consultadas

- `https://m.cinesargentinos.com.ar/cartelera/` → cartelera argentina consultada el 27/09/2026. El parser ahora recoge tanto `news-item__head-title` como `movie-item__title`; encontró títulos de los estrenos recientes y de la selección más vista.
- `https://www.cinemark.com.ar/elegi-pelicula` → películas disponibles en la selección de Cinemark Argentina el 27/09/2026.
- `https://servicios.lavoz.com.ar/cartelera/pelicula/el-final-de-la-calle-oak` → horarios de `El final de la calle Oak` en salas argentinas publicados el 23/09/2026; también se comprobó su cartelera de Showcase y Atlas en IMDb Showtimes el 20/09/2026.
- `https://complejoteatral.gob.ar/ver/Hospital-Brit%C3%A1nico` → funciones de `Hospital Británico` del 24/09 al 01/10, incluida la del domingo 27/09.
- `https://elpulsofederal.com/noticia/elpulsofederal-cine-pampeano-y-cordobes-llega-a-la-pantalla-del-amadeus-84a4e0ba15c1/` → `Los calvos` tuvo funciones el 26, 28 y 29/09 en el Cine Amadeus; sigue dentro de su corrida teatral.
- `https://www.justwatch.com/ar/pelicula/los-mundos-de-coraline` → actualizado el 27/09; no presenta una oferta de cine vigente. Registra Universal+ Amazon Channel y alquiler/compra en Apple TV Store.
- `https://www.justwatch.com/ar/pelicula/regreso-al-futuro` → actualizado el 26/09; no presenta una oferta de cine vigente. Registra Prime Video, Disney Plus, MovistarTV, HBO Max y Universal+ Amazon Channel.
- `https://www.tvlaint.com/2026/09/shrek-volver-al-futuro-coraline-y-mas.html` → la Fiesta del Cine que incluyó `Los mundos de Coraline` y `Back to the Future` duró del 10 al 17/09; no justifica mantener esos títulos en salas el 27/09.

Los 28 títulos siguientes coinciden con la cartelera activa de Cines Argentinos o Cinemark (se aceptaron equivalencias de título local):

`Avengers: Endgame`, `Toy Story 5`, `La Odisea`, `Spider-Man: Un Nuevo Día`, `La invitación`, `PAW Patrol: La Dino Película`, `Yo, Narciso`, `La noche del demonio: Están entre nosotros`, `Coyote vs. Acme`, `Colony: Zona Cero`, `Pepita la pistolera`, `Código: Venganza`, `El heladero`, `Hechizo de Amor: La magia continúa`, `Oasis: Don't Look Back in Anger`, `Tadeo El Explorador y la Lámpara Maravillosa`, `El árbol mágico`, `One Piece: La película`, `Panda Plan 2: La tribu mágica`, `Puella Magi Madoka Magica: La Rebelión`, `Resident Evil: Noche Cero`, `Tres adioses`, `Bajo tus pies`, `El corazón de la bestia`, `El último gran golpe`, `Encantador`, `La isla olvidada` y `Su propio infierno`.

Las tres fichas restantes con estado `Cine` tienen evidencia de salas argentinas en las fuentes complementarias enumeradas arriba: `El final de la calle Oak`, `Hospital Británico` y `Los calvos`.

## Cambios de disponibilidad

- `los-mundos-de-coraline-2009.json`: se quitó `Cine`; JustWatch AR conserva Apple TV Store para alquiler/compra, por eso la ficha queda en `Apple TV`.
- `back-to-the-future-1985.json`: se quitó `Cine`; JustWatch AR confirma Prime Video en Argentina, por eso la ficha queda en `Prime Video`.

Los cambios preservan puntajes, reseñas y créditos. `docs/movie-catalog-reference.md` se regeneró desde los JSON.
