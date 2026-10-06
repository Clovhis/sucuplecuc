# Fichas de películas: edición revista

Rama `redesign/movie-detail-magazine`, creada desde `c7d796d3`. Se revisaron los cuatro commits aprobados antes de editar: `c7d796d3` (carruseles), `06b96848` (Radar), `74c14331` (descubrimiento) y `77212a7b` (catálogo). La referencia principal es su fondo uniforme, tipografía Archivo, afiches, paleta y separadores.

## Evaluación y organización

La ficha anterior tenía un panel exterior y numerosas tarjetas con degradados, sombras y bordes de colores. Trailer, medidor y herramientas para compartir precedían a la lectura; la ficha técnica repetía información y la reacción ilustrada ocupaba demasiado espacio.

Se inspeccionaron la ruta de películas, sus cálculos, las fuentes de datos, estilos compartidos, scripts de navegación y componentes de trailer, votos, medidores, premios, personas y enlaces editoriales. La navegación de vuelta conserva su historial; los iframes siguen apareciendo sólo al reproducir; compartir sigue utilizando la URL canónica y los votos conservan su widget y servicio.

Referencias consultadas el 5 de octubre de 2026: [ficha de Letterboxd](https://letterboxd.com/film/parasite-2019/) y [ficha de Rotten Tomatoes](https://www.rottentomatoes.com/m/parasite_2019). Se tomó como referencia la separación entre identidad de la película, lectura, créditos y herramientas del lector. IMDb no respondió a la consulta. No se usaron skills de diseño ni se agregaron dependencias al proyecto.

- Cabecera: afiche completo junto al título, año, género, duración, score derivado, firma editorial, fecha y plataformas existentes. Accesos directos a reseña, ficha técnica y trailer.
- Columna principal: «La Posta en 10 segundos», sinopsis y reseña. A continuación quedan «El equipo dice» con score y texto, los enlaces a editoriales, votos, compartir y medidores/postcréditos. Las recomendaciones cierran la ficha. El bloque del equipo no renderiza ni descarga una ilustración.
- Columna lateral en escritorio: trailer, ficha técnica, premios, dirección y elenco. Género, países y subgéneros aparecen una vez en la ficha técnica. Se conservan nacionalidades, fechas, edades, retratos, perfiles y el tratamiento de voces de animación.
- En móvil: afiche y título comparten cabecera; la lectura aparece antes de la información lateral. Los accesos permiten saltar directamente al trailer o a los datos técnicos. Los controles principales tienen al menos 44 px; compartir y los retratos enlazados, al menos 48 px. Firma, origen y fechas de las personas tienen un mínimo de 12 px. La ficha admite pantallas de 320 px.
- Medidores: conservan porcentaje, etiqueta, nota y semántica accesible; la barra tiene una presentación simple, sin animaciones decorativas. El criterio de selección del medidor permanece en la ruta original.

Los estilos están limitados a `body.movie-edition` en `src/styles/movie-detail.css`. Se reutiliza `bodyClass` del layout. No se modifica la home, las fichas de personas, el catálogo, la taxonomía, scores, reseñas, plataformas, rutas, metadatos SEO, datos estructurados ni dependencias del sitio. La galería alternativa y las condiciones de ausencia de trailer se conservan; el catálogo actual no contiene ejemplos de esos dos casos.

## Validación

- `npm run check`: 252 archivos; cero errores, warnings o hints.
- `npm run build`: 7.540 páginas generadas correctamente con el componente del equipo sin ilustración.
- `npm run validate:public-output`: aprobado.
- `npm run validate:sitemap-indexability`: aprobado; 5.286 páginas canónicas.
- Matriz amplia: 327 aprobados y 28 omisiones por dispositivo. Los cuatro fallos del selector de géneros retirado y un timeout aislado de búsqueda en WebKit se resolvieron y se repitieron en los cuatro proyectos.
- Pasada final de layout, plataformas, retratos, medidores, filtros y auditoría móvil: **52 aprobados y cuatro omisiones esperadas**, sin fallos. Proyectos: `desktop-chromium`, `desktop-webkit`, `mobile-chromium` y `mobile-webkit`.
- Después de retirar la ilustración: **24 pruebas aprobadas**, sin fallos, en esos mismos cuatro proyectos. Cubren layout entre 320 y 1.440 px, textos secundarios y retratos táctiles, navegación, compartir, votos, títulos largos, postcréditos, orden de lectura y scores 9, 8, 6, 5 y 3. El bloque del equipo no contiene imágenes.
- Revisión visual final del build: Digger, Akira e Insaciable en desktop Chromium a 1.440 px e iPhone 13 emulado en WebKit a 390 px. Las seis vistas respondieron HTTP 200, conservaron título, score, reseña y canonical, cargaron sus afiches y no presentaron errores de JavaScript ni desbordes. Insaciable conserva su enlace editorial.
- La auditoría móvil registra 21 escenarios por navegador. No hay desbordes en sus rutas; en las fichas de 320, 390 y 844 px no hay controles de película marcados como pequeños ni textos secundarios de ficha por debajo de 12 px.
- `git diff --check`: aprobado.

Se actualizaron las expectativas de las pruebas para los géneros en la ficha técnica, las plataformas junto a «Dónde verla», el orden de lectura y el equipo sin imágenes. Una medición de geometría de la home resultó intermitente en WebKit; esa prueba espera ahora la carga completa y las fuentes antes de medir, conservando las aserciones. Las pasadas finales usan un worker y desactivan la grabación de video en una configuración temporal; la configuración versionada de CI se conserva. Se cerró un worker de Playwright que quedó detenido durante su salida; las pruebas posteriores terminaron correctamente. Las pruebas de votos usan una API simulada y no registran votos reales.

Capturas y comprobación de las seis vistas: `test-results/movie-detail-review/`. Allí se conservan `visual-proof.json`, imágenes de viewport y página completa, y los logs de validación. Las vistas finales registran cero imágenes dentro de «El equipo dice».

El trabajo queda en la rama local para revisión.
