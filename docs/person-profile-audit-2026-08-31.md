# Auditoría de perfiles con bio extendida

Fecha de corte: 2026-08-31. Alcance: perfiles con `editorialStatus: approved` y `editorialBiography` pública en `src/data/personProfiles.ts`.

## Resultado estructural

- 555 perfiles revisados, con 555 nombres únicos y fuente visible en cada ficha.
- 1.937 películas del catálogo comparadas contra elenco principal, dirección y destinatarios de premios.
- 3.604 créditos conectados en `knownFor`; no quedan créditos del catálogo omitidos ni slugs inválidos.
- Se eliminaron tres alias duplicados: Lupita Nyong’o, Catherine O’Hara y Peter O’Toole.
- 437 perfiles tienen premios cargados en 478 highlights; los 118 perfiles sin highlights conservan un arreglo vacío cuando no hubo un reconocimiento seleccionado con evidencia suficiente para incorporarlo.

## Datos factuales corregidos

- Barry Keoghan: 18 de octubre de 1992.
- James Wan: 26 de febrero de 1977; nacionalidad primaria australiana, con nacimiento en Malasia.
- Federico Luppi: 23 de febrero de 1936; se mantuvo el fallecimiento del 20 de octubre de 2017.
- Adrián Caetano: 20 de diciembre de 1969, Montevideo; se normalizó como uruguayo-argentino y se agregó un Cóndor de Plata por `Un oso rojo` (2003).
- Catherine Deneuve: 22 de octubre de 1943, París, Francia; nacionalidad francesa, IMDb `nm0000130` y César a mejor actriz por `Le Dernier Métro` (1981).
- Christopher McQuarrie, Edward Berger y Luis Ortega pasaron de año aproximado a fecha completa verificada. Benjamín Naishtat queda correctamente sólo con el año: las fuentes consultadas no sostienen un día y mes comunes entre sí.
- John Leguizamo: se normalizó al 22 de julio de 1964, respaldado por IBDB y Proimágenes Colombia; IMDb mantiene 1960, por eso la discrepancia queda documentada en `people.json`.
- Se corrigieron los IMDb de Caitríona Balfe (`nm1495520`) y Chloé Zhao (`nm2125482`), y se renombraron sus retratos locales para que no conservaran IDs erróneos.
- Se corrigieron referencias Wikidata mal asociadas en Winona Ryder, Joe Pesci, John Lithgow, Charlton Heston, William Wyler, Talia Shire, Emily Watson y Eva Marie Saint. John Goodman conserva como referencia canónica `Q215072`; Luis Ortega dejó de apuntar al homónimo empresario `Q122884193`.
- La comparación de 554 entidades Wikidata disponibles para el alcance no encontró una contradicción confirmada de fallecimiento. Los perfiles con muerte cargada tienen fecha completa; no se muestra una edad numérica cuando falta precisión suficiente.

## Créditos de películas recuperados

Se añadieron los créditos que faltaban en el catálogo y luego se regeneró el mapa completo:

- Sunny Sandler en `Grown Ups` (2010), `Pixels` (2015) y `Leo` (2023).
- Ed Harris en `The Truman Show` (1998), como Christof.

La filmografía de cada ficha sigue calculándose desde `src/data/movies/*.json`; no se inventaron títulos externos al catálogo.

## Fuentes destacadas

- [Académie des César: ceremonia de 1981](https://www.academie-cinema.org/evenements/ceremonie-des-cesar-1981/)
- [Catherine Deneuve en Wikidata](https://www.wikidata.org/wiki/Q106418)
- [Adrián Caetano en Cine Nacional](https://cinenacional.com/persona/israel-adrian-caetano)
- [Adrián Caetano en ICAU](https://icau.mec.gub.uy/innovaportal/file/106986/1/adrian-caetano-bio-publicar.pdf)
- [Christopher McQuarrie en IMDb](https://www.imdb.com/name/nm0003160/)
- [Edward Berger en IMDb](https://www.imdb.com/name/nm0074163/bio/)
- [Luis Ortega en el Catálogo de Cine Argentino](https://catalogocineargentino.incaa.gob.ar/realizador/luis-ortega/)
- [Caitríona Balfe en IMDb](https://www.imdb.com/name/nm1495520/)
- [Chloé Zhao en Wikidata](https://www.wikidata.org/wiki/Q21078321)
- [Federico Luppi en CineChile](https://cinechile.cl/persona/federico-luppi/)
- [John Leguizamo en IBDB](https://www.ibdb.com/broadway-cast-staff/john-leguizamo-6851)
- [John Leguizamo en Proimágenes Colombia](https://www.proimagenescolombia.com/secciones/cine_colombiano/perfiles/perfil_persona.php?id_perfil=3800)

## Reproducción

```text
npm run catalog:people
npm run catalog:people:reference
npm run audit:profiles:facts
npm run audit:profiles --all
npm run audit:profile-originality
npm run check
npm run build
```
