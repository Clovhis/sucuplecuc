# Revisión de fallecimientos en personas

Fecha de corte: 2026-10-11. Alcance: los 5.662 registros de `src/data/people.json` y las fuentes visibles de los perfiles extendidos.

## Resultado

El filtro de registros sin dato de fallecimiento y con nacimiento hasta 1926 identificó a Eva Marie Saint: nació el 4 de julio de 1924 y murió el 6 de octubre de 2026, a los 102 años. Se agregaron `deathDate`, `deathYear`, la fecha de verificación y las referencias del fallecimiento en `people.json`. Las mismas referencias se incorporaron a las fuentes visibles de su perfil. La fecha y la edad están confirmadas por [Associated Press](https://apnews.com/article/eva-marie-saint-dies-7019a82dbbac40b99a976354cbb89200) y [Los Angeles Times](https://www.latimes.com/entertainment-arts/story/2026-10-06/eva-marie-saint-dead-north-by-northwest-on-the-waterfront); el segundo medio también confirma su nacimiento el 4 de julio de 1924.

## Control del catálogo completo

- Antes del cambio, 994 personas tenían algún dato de fallecimiento: 993 con `deathDate` y una con sólo `deathYear`. Después del cambio, son 995: 987 fechas exactas, siete fechas con precisión parcial y un año sin fecha.
- Las siete precisiones parciales se conservaron tal como están documentadas: Buddy Duress (mes), Davos Hanich (mes), y Cora Lee Day, El Hedi ben Salem, John Allen Phillips, Mary Gregory y Tom Morris (año).
- Abraham Bomba conserva sólo el año 2000; no se completó un día o mes que las fuentes del registro no sostienen.
- En los registros que contienen ambos campos, no hay discrepancias entre `deathDate` y `deathYear`, ni fechas de fallecimiento anteriores al nacimiento cargado. No quedó una persona nacida hasta 1926 sin dato de fallecimiento.

La edad se calcula desde `birthDate` y `deathDate`; por eso el cambio también actualiza las etiquetas públicas de edad y fallecimiento sin modificar biografías ni créditos.
