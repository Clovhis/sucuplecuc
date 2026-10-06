# Revisión de scores 9 y 10: obras maestras

Revisión terminada: 06/10/2026. Branch creada el 05/10/2026: fix/cineposta-score-masterpiece-ceiling-2026-10-05.

## Alcance y regla aplicada

Se revisaron las 385 fichas del catálogo que tenían cinepostaScore 9 o 10 antes de este cambio. Los scores de 1 a 8 no se modificaron.

- 9 / Obra maestra: requiere un logro artístico o formal excepcional y reconocimiento perdurable en la historia del cine, cánones críticos, preservación o influencia cultural.
- 10 / Absolute Cinema: queda para una franja muy reducida de obras maestras con estatus de hito máximo. Una obra maestra que no alcance ese nivel queda en 9.
- Una nota externa alta, popularidad, franquicia, premios, entusiasmo reciente o una reseña elogiosa no bastan por sí solos. El tope de confianza de la fuente se aplica primero y el filtro editorial después; ambos sólo pueden bajar el candidato normalizado.
- Para títulos recientes, una recepción inicial, premios recientes o una muestra todavía pequeña no prueban por sí solos una reputación perdurable; se reevalúan cuando exista más perspectiva.
- Si no se supera el umbral de obra maestra, el máximo es 8. Colony: Zona Cero quedó explícitamente en 8 por indicación del usuario.
- La matriz registra la decisión editorial por ficha. No recalcula los agregados públicos heredados: las fuentes y muestras de cada rating se deben revalidar cuando una ficha vuelva a pasar por el flujo de alta/revalidación.

Como referencias de canon se consultaron [BFI Sight and Sound: resultados de Greatest Films of All Time 2022](https://www.bfi.org.uk/news/revealed-results-2022-sight-sound-greatest-films-all-time-poll), [AFI: 100 Years...100 Movies](https://www.afi.com/afis-100-years-100-movies/) y el [National Film Registry de la Library of Congress](https://www.loc.gov/programs/national-film-preservation-board/film-registry/complete-national-film-registry-listing/). Son fuentes de contexto, no una lista automática de elegibilidad.

## Resultado

| Cambio | Cantidad |
| --- | ---: |
| 10->10 | 27 |
| 10->8 | 169 |
| 10->9 | 49 |
| 9->8 | 99 |
| 9->9 | 41 |

Quedan 27 películas con 10 y 90 con 9; 268 de las 385 que tenían 9 o 10 bajaron a 8.

## Validación

- Auditoría global posterior al cambio (`audit_recent_movies.cjs --all --skip-youtube`): 2.253 fichas, 0 errores, 1.347 advertencias y 866 hallazgos informativos.
- `npm run validate:content` pasó; el build generó 7.540 páginas. La salida pública y el sitemap pasaron sus validadores; el sitemap confirmó 5.286 páginas canónicas.
- `npm run catalog:movies:check` pasó.
- `npx astro check` reportó un error TypeScript fuera de los archivos modificados: `test-results/movie-detail-review/temp/movie-detail.config.ts` no encuentra `../playwright.config` (ts2307).

## Matriz completa

| Película | Slug | Antes a después | Decisión |
| --- | --- | ---: | --- |
| ¿Y dónde está el piloto? (1980) | aterriza-como-puedas-1980 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| 101 dálmatas (1961) | 101-dalmatas-1961 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| 12 Years a Slave (2013) | 12-years-a-slave-2013 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| 1997: Rescate en Nueva York (1981) | 1997-rescate-en-nueva-york-1981 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| 2001: Odisea del espacio (1968) | 2001-a-space-odyssey-1968 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| A Goofy Movie (1995) | a-goofy-movie-1995 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Ace Ventura, un detective diferente (1994) | ace-ventura-un-detective-diferente-1994 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Aftersun (2022) | aftersun-2022 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Al final de la escapada (1960) | al-final-de-la-escapada-1960 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Aladdín (1992) | aladdin-1992 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Alien: El octavo pasajero (1979) | alien-1979 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Aliens (1986) | aliens-1986 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Amadeus (1984) | amadeus-1984 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Amélie (2001) | amelie-2001 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Amores perros (2000) | amores-perros-2000 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Anastasia (1997) | anastasia-1997 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Anatomía de una caída (2023) | anatomia-de-una-caida-2023 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Annie Hall (1977) | annie-hall-1977 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Ant-Man (2015) | ant-man-2015 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Antz: Hormiguitaz (1998) | antz-hormiguitaz-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Apocalipsis ahora (1979) | apocalypse-now-1979 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Apolo 13 (1995) | apolo-13-1995 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Argo (2012) | argo-2012 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Armas invencibles (Police Story) (1985) | armas-invencibles-police-story-1985 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Avengers: Endgame (2019) | avengers-endgame-2019 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Back to the Future (1985) | back-to-the-future-1985 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Bambi (1942) | bambi-1942 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Barrio chino (1974) | chinatown-1974 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Barry Lyndon (1975) | barry-lyndon-1975 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Basil, el gran detective (1986) | basil-el-gran-detective-1986 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Batman (1989) | batman-1989 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Batman: La máscara del fantasma (1993) | batman-la-mascara-del-fantasma-1993 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Beavis y Butt-Head recorren América (1996) | beavis-y-butt-head-recorren-america-1996 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Bichos: Una aventura en miniatura (1998) | bichos-una-aventura-en-miniatura-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Blade Runner (1982) | blade-runner-1982 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Blade Runner 2049 (2017) | blade-runner-2049-2017 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Boogie nights (1997) | boogie-nights-1997 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Buenos muchachos (1990) | goodfellas-1990 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Cantando bajo la lluvia (1952) | cantando-bajo-la-lluvia-1952 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Casablanca (1943) | casablanca-1943 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Casino (1995) | casino-1995 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Casino Royale (2006) | casino-royale-2006 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Castle in the Sky (1986) | castle-in-the-sky-1986 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Cavalcade (1933) | cavalcade-1933 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Cazafantasmas (1984) | cazafantasmas-1984 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Challengers (2024) | challengers-2024 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Chicago (2002) | chicago-2002 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Chungking Express (1994) | chungking-express-1994 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Cinema Paradiso (1988) | cinema-paradiso-1988 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Citizen Kane (1941) | citizen-kane-1941 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Ciudad de Dios (2002) | ciudad-de-dios-2002 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Coco (2017) | coco-2017 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Código: Venganza (2026) | codigo-venganza-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Colony: Zona Cero (2026) | colony-zona-cero-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Corre, Lola, corre (1998) | corre-lola-corre-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Coyote vs. Acme (2026) | coyote-vs-acme-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Crash (2005) | crash-2005 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Creed (2015) | creed-2015 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Cuentos de Tokio (1953) | cuentos-de-tokio-1953 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Dawn of the Planet of the Apes (2014) | dawn-of-the-planet-of-the-apes-2014 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Delitos y faltas (1989) | crimes-and-misdemeanors-1989 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Depredador (1987) | depredador-1987 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Deseando amar (2000) | deseando-amar-2000 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Día de entrenamiento (2001) | dia-de-entrenamiento-2001 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Diamantes en bruto (2019) | uncut-gems-2019 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Dont Look Back (1967) | dont-look-back-1967 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Dos hombres y un destino (1969) | dos-hombres-y-un-destino-1969 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Dr. Insólito (1964) | telefono-rojo-volamos-hacia-moscu-1964 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Drácula de Bram Stoker (1992) | dracula-de-bram-stoker-1992 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Dumbo (1941) | dumbo-1941 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Duro de matar (1988) | jungla-de-cristal-1988 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| E.T., el extraterrestre (1982) | e-t-the-extra-terrestrial-1982 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Ed Wood (1994) | ed-wood-1994 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El acto de matar (2012) | the-act-of-killing-2012 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El agente secreto (2025) | el-agente-secreto-2025 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El apartamento (1960) | the-apartment-1960 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El bebé de Rosemary (1968) | el-bebe-de-rosemary-1968 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El bueno, el malo y el feo (1966) | el-bueno-el-feo-y-el-malo-1966 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El cazador (1978) | the-deer-hunter-1978 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El cielo sobre Berlín (1987) | el-cielo-sobre-berlin-1987 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| El ciudadano ilustre (2016) | el-ciudadano-ilustre-2016 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El clan (2015) | el-clan-2015 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El corazón de la bestia (2026) | el-corazon-de-la-bestia-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El crepúsculo de los dioses (1950) | el-crepusculo-de-los-dioses-1950 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El día de la bestia (1995) | el-dia-de-la-bestia-1995 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El exorcista (1973) | the-exorcist-1973 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El extraño mundo de Jack (1993) | el-extrano-mundo-de-jack-1993 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El fugitivo (1993) | el-fugitivo-1993 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El gigante de hierro (1999) | el-gigante-de-hierro-1999 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| El graduado (1967) | el-graduado-1967 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El gran Lebowski (1998) | el-gran-lebowski-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El halcón maltés (1941) | el-halcon-maltes-1941 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El incinerador de cadáveres (1969) | el-incinerador-de-cadaveres-1969 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El jorobado de Notre Dame (1996) | el-jorobado-de-notre-dame-1996 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El laberinto del fauno (2006) | el-laberinto-del-fauno-2006 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El libro de la selva (1967) | el-libro-de-la-selva-1967 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El lobo de Wall Street (2013) | the-wolf-of-wall-street-2013 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El maquinista de la General (1926) | el-maquinista-de-la-general-1926 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El odio (1995) | el-odio-1995 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El padre (2020) | el-padre-2020 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El patrón, radiografía de un crimen (2014) | el-patron-radiografia-de-un-crimen-2014 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El pecado compartido (1966) | el-pecado-compartido-1966 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El pianista (2002) | el-pianista-2002 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El piano (1993) | el-piano-1993 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El planeta salvaje (1973) | el-planeta-salvaje-1973 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El precio del poder (1983) | el-precio-del-poder-1983 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El príncipe de Egipto (1998) | el-principe-de-egipto-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El quinto elemento (1997) | el-quinto-elemento-1997 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El renacido (2015) | el-renacido-2015 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| El rey de la comedia (1982) | the-king-of-comedy-1982 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| El secreto de Kells (2009) | el-secreto-de-kells-2009 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El secreto de NIMH (1982) | el-secreto-de-nimh-1982 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El secreto de sus ojos (2009) | el-secreto-de-sus-ojos-2009 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| El séptimo sello (1957) | el-septimo-sello-1957 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El silencio de los inocentes (1991) | the-silence-of-the-lambs-1991 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El silencio de un hombre (1967) | el-silencio-de-un-hombre-1967 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El sueño eterno (1946) | el-sueno-eterno-1946 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El tercer hombre (1949) | el-tercer-hombre-1949 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| El último unicornio (1982) | el-ultimo-unicornio-1982 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| El último vals (1978) | the-last-waltz-1978 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| El zorro y el sabueso (1981) | el-zorro-y-el-sabueso-1981 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| En busca del valle encantado (1988) | en-busca-del-valle-encantado-1988 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| En un lugar del corazón (1984) | en-un-lugar-del-corazon-1984 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Encuentros cercanos del tercer tipo (1977) | close-encounters-of-the-third-kind-1977 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Érase una vez en América (1984) | erase-una-vez-en-america-1984 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Érase una vez en el Oeste (1968) | hasta-que-llego-su-hora-1968 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Eva al desnudo (1950) | all-about-eve-1950 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Fantasia (1940) | fantasia-1940 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Fargo. Secuestro voluntario (1996) | fargo-secuestro-voluntario-1996 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Filadelfia (1993) | filadelfia-1993 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Finding Nemo (2003) | finding-nemo-2003 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Forrest Gump (1994) | forrest-gump-1994 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Fuego contra fuego (1995) | fuego-contra-fuego-1995 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Furiosa: A Mad Max Saga (2024) | furiosa-a-mad-max-saga-2024 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Garage Olimpo (1999) | garage-olimpo-1999 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Good Time: Viviendo al límite (2017) | good-time-viviendo-al-limite-2017 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Grave of the Fireflies (1988) | grave-of-the-fireflies-1988 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Grey Gardens (1975) | grey-gardens-1975 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Grupo salvaje (1969) | grupo-salvaje-1969 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Guardians of the Galaxy (2014) | guardians-of-the-galaxy-2014 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Guardians of the Galaxy Vol. 2 (2017) | guardians-of-the-galaxy-vol-2-2017 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Hamnet (2025) | hamnet-2025 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Hannah and Her Sisters (1986) | hannah-and-her-sisters-1986 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Happy Gilmore (1996) | happy-gilmore-1996 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Hard Boiled (1992) | hard-boiled-1992 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Heavy Metal (1981) | heavy-metal-1981 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Hechizo de Amor: La magia continúa (2026) | hechizo-de-amor-la-magia-continua-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Hércules (1997) | hercules-1997 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Hit Man (2024) | hit-man-2024 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Hoop Dreams (1994) | hoop-dreams-1994 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| How Green Was My Valley (1941) | how-green-was-my-valley-1941 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| How to Train Your Dragon (2025) | how-to-train-your-dragon-2025 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| In the Heat of the Night (1967) | in-the-heat-of-the-night-1967 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Inception (2010) | inception-2010 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Indiana Jones and the Last Crusade (1989) | indiana-jones-and-the-last-crusade-1989 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Indiana Jones and the Temple of Doom (1984) | indiana-jones-and-the-temple-of-doom-1984 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Inglourious Basterds (2009) | inglourious-basterds-2009 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Intensa-Mente (2015) | intensa-mente-2015 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Interstellar (2014) | interstellar-2014 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| It Happened One Night (1934) | it-happened-one-night-1934 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Jackie Brown (1997) | jackie-brown-1997 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| John Wick (2014) | john-wick-2014 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Jurassic Park (1993) | jurassic-park-1993 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Karate Kid, el momento de la verdad (1984) | karate-kid-el-momento-de-la-verdad-1984 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Kingdom of the Planet of the Apes (2024) | kingdom-of-the-planet-of-the-apes-2024 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Kirikú y la bruja (1998) | kiriku-y-la-bruja-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Kubo y la búsqueda del samurái (2016) | kubo-y-la-busqueda-del-samurai-2016 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La batalla de Argel (1966) | la-batalla-de-argel-1966 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| La bella durmiente (1959) | la-bella-durmiente-1959 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La bella y la bestia (1991) | la-bella-y-la-bestia-1991 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La bruja (2015) | la-bruja-2015 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La Cenicienta (1950) | la-cenicienta-1950 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La chaqueta metálica (1987) | la-chaqueta-metalica-1987 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La cosa (1982) | la-cosa-el-enigma-de-otro-mundo-1982 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La dama y el vagabundo (1955) | la-dama-y-el-vagabundo-1955 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La Dolce Vita (1960) | la-dolce-vita-1960 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| La doncella (2016) | la-doncella-2016 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| La guerra de los Rose (1989) | la-guerra-de-los-rose-1989 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| La insoportable levedad del ser (1988) | la-insoportable-levedad-del-ser-1988 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La invitación (2026) | la-invitacion-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| La isla olvidada (2026) | la-isla-olvidada-2026 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La lista de Schindler (1993) | schindler-s-list-1993 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| La luz que imaginamos (2024) | la-luz-que-imaginamos-2024 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| La máscara (1994) | la-mascara-1994 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La matanza de Texas (1974) | la-matanza-de-texas-1974 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La misión (1986) | la-mision-1986 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| La mosca (1986) | la-mosca-1986 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La naranja mecánica (1971) | la-naranja-mecanica-1971 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| La noche de Halloween (2018) | halloween-2018 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| La Noche de los Lápices (1986) | la-noche-de-los-lapices-1986 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| La noche del cazador (1955) | la-noche-del-cazador-1955 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| La Odisea (2026) | la-odisea-2026 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La pasión de Juana de Arco (1928) | la-pasion-de-juana-de-arco-1928 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| La Patagonia rebelde (1974) | la-patagonia-rebelde-1974 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| La pianista (2001) | la-pianista-2001 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| La pistola desnuda (1988) | agarralo-como-puedas-1988 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La princesa prometida (1987) | la-princesa-prometida-1987 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La rosa púrpura del Cairo (1985) | the-purple-rose-of-cairo-1985 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La sirenita (1989) | la-sirenita-1989 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La última película (1971) | la-ultima-pelicula-1971 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| La ventana indiscreta (1954) | la-ventana-indiscreta-1954 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La vida de Brian (1979) | la-vida-de-brian-1979 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La vida es bella (1997) | la-vida-es-bella-1997 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| La zona muerta (1983) | la-zona-muerta-1983 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Las margaritas (1966) | las-margaritas-1966 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Las trillizas de Belleville (2003) | las-trillizas-de-belleville-2003 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Las zapatillas rojas (1948) | las-zapatillas-rojas-1948 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Lawrence de Arabia (1962) | lawrence-of-arabia-1962 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Límite: 48 horas (1982) | limite-48-horas-1982 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Linkin Park: Unshatter (2026) | linkin-park-unshatter-2026 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Lo que queda del día (1993) | lo-que-queda-del-dia-1993 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Los Ángeles al desnudo (1997) | los-angeles-al-desnudo-1997 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Los aristogatos (1970) | los-aristogatos-1970 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Los caballeros de la mesa cuadrada y sus locos seguidores (1975) | los-caballeros-de-la-mesa-cuadrada-y-sus-locos-seguidores-1975 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Los cuatrocientos golpes (1959) | los-cuatrocientos-golpes-1959 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Los rescatadores (1977) | los-rescatadores-1977 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Los rescatadores en Cangurolandia (1990) | los-rescatadores-en-cangurolandia-1990 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Los siete samuráis (1954) | los-siete-samurais-1954 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Luz de luna (2016) | moonlight-2016 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| M, el vampiro de Düsseldorf (1931) | m-el-vampiro-de-dusseldorf-1931 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Mad Max (1979) | mad-max-1979 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Mad Max 2 (1981) | mad-max-2-1981 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Mad Max: Fury Road (2015) | mad-max-fury-road-2015 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Malas calles (1973) | mean-streets-1973 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Malcolm X (1992) | malcolm-x-1992 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Man with a Movie Camera (1929) | man-with-a-movie-camera-1929 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Manhattan (1979) | manhattan-1979 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Masacre (Ven y mira) (1985) | masacre-ven-y-mira-1985 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Match Point (2005) | match-point-2005 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Matrix (1999) | the-matrix-1999 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Medianoche en París (2011) | midnight-in-paris-2011 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Memento (2000) | memento-2000 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Memories of Murder (Crónica de un asesino en serie) (2003) | memories-of-murder-cronica-de-un-asesino-en-serie-2003 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Metrópolis (1927) | metropolis-1927 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Mi pobre angelito (1990) | home-alone-1990 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Mission: Impossible - Dead Reckoning Part One (2023) | mission-impossible-dead-reckoning-part-one-2023 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Mission: Impossible III (2006) | mission-impossible-iii-2006 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Modha Rathri (2026) | modha-rathri-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Moulin Rouge! (2001) | moulin-rouge-2001 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Mountainhead (2025) | mountainhead-2025 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Mulan (1998) | mulan-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Mulholland Drive (2001) | mulholland-drive-2001 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Múnich (2005) | munich-2005 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Nausicaa of the Valley of the Wind (1984) | nausicaa-of-the-valley-of-the-wind-1984 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Nicky, la aprendiz de bruja (1989) | nicky-la-aprendiz-de-bruja-1989 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Niños del hombre (2006) | hijos-de-los-hombres-2006 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| No Direction Home: Bob Dylan (2005) | no-direction-home-bob-dylan-2005 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Nosferatu (1922) | nosferatu-1922 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Oasis: Don't Look Back in Anger (2026) | oasis-don-t-look-back-in-anger-2026 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Ocho y medio (1963) | fellini-ocho-y-medio-1963 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Oldboy (2003) | oldboy-2003 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Oliver y su pandilla (1988) | oliver-y-su-pandilla-1988 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| One Battle After Another (2025) | one-battle-after-another-2025 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| One Flew Over the Cuckoo's Nest (1975) | one-flew-over-the-cuckoo-s-nest-1975 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Pacto de sangre (1944) | pacto-de-sangre-1944 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Paprika (2006) | paprika-2006 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Parasite (2019) | parasite-2019 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Paris Is Burning (1990) | paris-is-burning-1990 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| París, Texas (1984) | paris-texas-1984 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| PAW Patrol: La Dino Película (2026) | paw-patrol-la-dino-pelicula-2026 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Pelotón (1986) | platoon-1986 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Perros de paja (1971) | perros-de-paja-1971 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Persépolis (2007) | persepolis-2007 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Pesadilla en Elm Street (1984) | a-nightmare-on-elm-street-1984 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Peter Pan (1953) | peter-pan-1953 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Petróleo sangriento (2007) | pozos-de-ambicion-2007 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Pinocho de Guillermo del Toro (2022) | pinocho-de-guillermo-del-toro-2022 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Pocahontas (1995) | pocahontas-1995 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Pokémon: La película (1998) | pokemon-la-pelicula-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Poltergeist (1982) | poltergeist-1982 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Porco Rosso (1992) | porco-rosso-1992 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Posesión infernal (1981) | the-evil-dead-1981 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Primicia mortal (2014) | primicia-mortal-2014 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Princess Mononoke (1997) | princess-mononoke-1997 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Psicosis (1960) | psycho-1960 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Puella Magi Madoka Magica: La Rebelión (2013) | puella-magi-madoka-magica-la-rebelion-2013 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Pulp Fiction (1994) | pulp-fiction-1994 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Raiders of the Lost Ark (1981) | raiders-of-the-lost-ark-1981 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Rashomon (1950) | rashomon-1950 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Ratatouille (2007) | ratatouille-2007 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| REC (2007) | rec-2007 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Recuerdos del ayer (1991) | recuerdos-del-ayer-1991 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Resident Evil: Noche Cero (2026) | resident-evil-noche-cero-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Rob Roy, la pasión de un rebelde (1995) | rob-roy-la-pasion-de-un-rebelde-1995 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Robin Hood (1973) | robin-hood-1973 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| RoboCop: El defensor del futuro (1987) | robocop-el-defensor-del-futuro-1987 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Romeo + Julieta de William Shakespeare (1996) | romeo-julieta-de-william-shakespeare-1996 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Saving Private Ryan (1998) | saving-private-ryan-1998 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Scott Pilgrim contra el mundo (2010) | scott-pilgrim-contra-el-mundo-2010 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Scream 2 (1997) | scream-2-1997 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Scream 6 (2023) | scream-vi-2023 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Se levanta el viento (2013) | se-levanta-el-viento-2013 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Secreto en la montaña (2005) | secreto-en-la-montana-2005 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Senderos de gloria (1957) | senderos-de-gloria-1957 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Sentido y sensibilidad (1995) | sentido-y-sensibilidad-1995 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Septiembre 5 (2024) | septiembre-5-2024 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Seven Samurai (1954) | seven-samurai-1954 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Shoah (1985) | shoah-1985 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Shrek (2001) | shrek-2001 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Shrek 2 (2004) | shrek-2-2004 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Shrek, felices para siempre (2010) | shrek-felices-para-siempre-2010 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Shutter Island (2010) | shutter-island-2010 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Silverado (1985) | silverado-1985 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Sin lugar para los débiles (2007) | no-country-for-old-men-2007 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Solaris (1972) | solaris-1972 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Soul (2020) | soul-2020 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| South Park: Más grande, más largo y sin cortes (1999) | south-park-mas-grande-mas-largo-y-sin-cortes-1999 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Spider-Man (2002) | spider-man-2002 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Spider-Man: Un Nuevo Día (2026) | spider-man-brand-new-day-2026 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Spirited Away (2001) | spirited-away-2001 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Spotlight (2015) | spotlight-2015 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Stalker (1979) | stalker-1979 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Star Wars: Episode IV - A New Hope (1977) | star-wars-episode-iv-a-new-hope-1977 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Star Wars: Episode V - The Empire Strikes Back (1980) | star-wars-episode-v-the-empire-strikes-back-1980 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Stephen King's IT (1990) | it-1990 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Stop Making Sense (1984) | stop-making-sense-1984 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Suspiria (1977) | suspiria-1977 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Susurros del corazón (1995) | susurros-del-corazon-1995 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Taron y el caldero mágico (1985) | taron-y-el-caldero-magico-1985 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Tarzán (1999) | tarzan-1999 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Taxi Driver (1976) | taxi-driver-1976 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Terciopelo azul (1986) | vellut-blau-1986 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Terminator 2: El juicio final (1991) | terminator-2-judgment-day-1991 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Terms of Endearment (1983) | terms-of-endearment-1983 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Terroríficamente muertos (1987) | terrorificamente-muertos-1987 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Testigo en peligro (1985) | testigo-en-peligro-1985 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Avengers (2012) | the-avengers-2012 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Blair Witch Project (1999) | the-blair-witch-project-1999 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| The Dark Knight (2008) | the-dark-knight-2008 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| The End of Evangelion (1997) | the-end-of-evangelion-1997 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| The First Omen (2024) | the-first-omen-2024 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Girl Who Leapt Through Time (2006) | the-girl-who-leapt-through-time-2006 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Godfather (1972) | the-godfather-1972 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| The Godfather Part II (1974) | the-godfather-part-ii-1974 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| The Housemaid (La empleada) (2025) | the-housemaid-2025 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Hurt Locker (2008) | the-hurt-locker-2008 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Incredibles (2004) | the-incredibles-2004 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| The Lion King (1994) | the-lion-king-1994 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| The Lord of the Rings: The Fellowship of the Ring (2001) | the-lord-of-the-rings-the-fellowship-of-the-ring-2001 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| The Lord of the Rings: The Return of the King (2003) | the-lord-of-the-rings-the-return-of-the-king-2003 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| The Lord of the Rings: The Two Towers (2002) | the-lord-of-the-rings-the-two-towers-2002 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| The Others (2001) | the-others-2001 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Plague (2025) | the-plague-2025 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Shawshank Redemption (1994) | the-shawshank-redemption-1994 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| The Shining (1980) | the-shining-1980 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| The Sixth Sense (1999) | the-sixth-sense-1999 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| The Terminator (1984) | the-terminator-1984 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| The Thin Blue Line (1988) | the-thin-blue-line-1988 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| The Warriors (Los amos de la noche) (1979) | the-warriors-los-amos-de-la-noche-1979 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| The Wizard of Oz (1939) | the-wizard-of-oz-1939 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Thelma y Louise (1991) | thelma-y-louise-1991 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| This Is Spinal Tap (1984) | this-is-spinal-tap-1984 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Tiburón (1975) | jaws-1975 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Tiempos de gloria (1989) | tiempos-de-gloria-1989 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Tigre y dragón (2000) | tigre-y-dragon-2000 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Titanic (1997) | titanic-1997 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Todo por un sueño (1995) | todo-por-un-sueno-1995 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Tokyo Godfathers (2003) | tokyo-godfathers-2003 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Tonto y retonto (1994) | tonto-y-retonto-1994 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Toro salvaje (1980) | raging-bull-1980 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Toy Story (1995) | toy-story-1995 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Toy Story 2 (1999) | toy-story-2-1999 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Toy Story 3 (2010) | toy-story-3-2010 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Toy Story 5 (2026) | toy-story-5-2026 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Trainspotting (1996) | trainspotting-1996 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Tu madre se ha comido a mi perro (1992) | tu-madre-se-ha-comido-a-mi-perro-1992 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Un día de furia (1993) | un-dia-de-furia-1993 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Un equipo muy especial (1992) | un-equipo-muy-especial-1992 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Un lugar en el mundo (1992) | un-lugar-en-el-mundo-1992 | 9 a 9 | Se conserva 9: obra maestra con reconocimiento perdurable. |
| Una Eva y dos Adanes (1959) | con-faldas-y-a-lo-loco-1959 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Una terapia peligrosa (1999) | una-terapia-peligrosa-1999 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Uncharted (2022) | uncharted-2022 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Up (2009) | up-2009 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Valor de ley (2010) | valor-de-ley-2010 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Valor sentimental (2025) | valor-sentimental-2025 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Venganza (2008) | venganza-2008 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Vertigo (1958) | vertigo-1958 | 10 a 10 | Se conserva 10: hito excepcional dentro del canon cinematográfico. |
| Videodrome (1983) | videodrome-1983 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Viernes 13 (1980) | friday-the-13th-1980 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| Wall Street (1987) | wall-street-1987 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
| WALL-E (2008) | wall-e-2008 | 10 a 9 | 10 a 9: obra maestra perdurable, sin fundamento para el nivel máximo. |
| Watership Down (1978) | watership-down-1978 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Whiplash: Música y obsesión (2014) | whiplash-2014 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Yellow Submarine (1968) | yellow-submarine-1968 | 10 a 8 | 10 a 8: la calidad o popularidad no alcanza el umbral de obra maestra. |
| Your Name. (2016) | your-name-2016 | 9 a 8 | 9 a 8: excelencia reconocible, pero no alcanza el umbral de obra maestra. |
