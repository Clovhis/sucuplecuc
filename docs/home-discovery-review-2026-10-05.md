# Home: selector, personas y últimas reseñas

Branch: `redesign/home-cine-magazine`, creada desde `77212a7b` (último rediseño de main). Diseño revisado y aprobado para publicar en `main` el 5 de octubre de 2026.

## Referencias y criterio

Se revisaron el último diff del home, su informe de diseño y las conexiones entre catálogo, fichas, personas, editoriales, selector, trailers y comunidad. El sitio conserva Astro, generación estática y sus módulos TypeScript; no se agregan dependencias.

- [Letterboxd](https://letterboxd.com/): fotografías y afiches como identidad, encabezados discretos y separación editorial.
- [IMDb](https://www.imdb.com/): columna lateral con imágenes pequeñas y texto para explorar contenido sin otro panel exterior. Inspección visual en navegador.
- [Rotten Tomatoes](https://www.rottentomatoes.com/): consulta de la página pública; la inspección visual quedó limitada por su aviso de bloqueo de publicidad. No se cambiaron las preferencias del navegador.

No se utilizaron skills de diseño.

## Cambio

El bloque de la captura ahora usa la misma paleta, Archivo, fondo uniforme y líneas finas del catálogo rediseñado. El selector es una invitación breve con acceso directo; la galería presenta diez retratos en dos filas de cinco en desktop; el acceso completo a personas ocupa un pie de sección. Se retiran las ilustraciones decorativas de este bloque.

Las últimas tres reseñas se presentan como una columna de afiches completos, títulos, géneros, score, fecha y un extracto del texto original de cada ficha. El extracto se deriva durante el build y no modifica los datos de las películas. Los títulos de las secciones son h2 y cada reseña tiene su h3.

Los estilos están limitados a `.home-discovery`. En tablet la columna de reseñas pasa debajo de la galería; en teléfonos táctiles se conserva la selección compacta existente de dos perfiles y dos reseñas, con acceso al índice completo. Los datos de personas, nacionalidades, edades, selección aleatoria, destinos y comportamiento al regresar al catálogo se conservan. La búsqueda, filtros, URL, paginación, recomendaciones y datos estructurados mantienen su lógica.

## Validación

- `npm run check`: 248 archivos, 0 errores, 0 warnings y 0 hints.
- `npm run build`: 7.540 páginas generadas correctamente con el código final.
- `npm run validate:public-output`: aprobado.
- Regresiones en desktop Chromium, Android Chromium e iPhone WebKit: filtros, búsqueda y paginación, navegación general, selector, reseñas y datos de personas. Primera corrida: 194 aprobadas, 15 omisiones previstas por dispositivo y 1 fallo en la nueva prueba de galería después de capturar el bloque completo en Android.
- La captura del elemento, más alto que la pantalla, alteraba el estado responsive del dispositivo. Se reemplazó por una captura de viewport sin redimensionamiento. Se repitió el archivo afectado en los tres proyectos: 9/9 aprobadas, incluida navegación real a la ficha. En conjunto, las 195 pruebas aplicables quedan verificadas; las 15 omisiones corresponden a pruebas exclusivas de desktop o mobile.
- Revisión visual del build en navegador desktop, y de las capturas móviles de Android y WebKit. Los afiches conservan proporción vertical y los textos quedan dentro del viewport.
- `git diff --check`, admitiendo el CRLF existente: aprobado. No hay cambios en datos, librerías, dependencias ni configuración de Astro.

Vista local del build: `http://127.0.0.1:4321/#que-vemos-hoy`. Captura desktop: `test-results/home-discovery-desktop.png`. Captura Android final: `test-results/home-discovery-mobile.png`. El resto de los artefactos y diagnósticos se conserva en `test-results/`.
