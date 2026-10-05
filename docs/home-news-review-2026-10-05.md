# Radar de cine: continuidad del diseño de la home

Rama: `feat/radar-cine-magazine`, desde `74c14331`. Se revisaron los dos commits anteriores de la home (`74c14331` y `77212a7b`) y el funcionamiento del Radar antes de editarlo. No se usaron skills de diseño.

## Integración revisada

`src/pages/index.astro` llama a `getCinemaNews()` durante la generación estática. `src/lib/cinemaNews.ts` consulta los feeds de La Nación, Clarín, Página/12, Infobae, Ámbito y Cines Argentinos; filtra las entradas, elimina duplicados, ordena por fecha y selecciona hasta ocho noticias. Conserva sus enlaces y fuentes, obtiene imágenes del feed o de la página del artículo y formatea fechas en horario argentino. Si no consigue noticias, la sección no se renderiza. La etiqueta de actualización existente corresponde a la fecha de la noticia más reciente.

El workflow `deploy.yml` reconstruye la home al publicar main, diariamente y tras las actualizaciones automáticas de estrenos y recomendaciones. El Radar no necesita un workflow propio ni polling del navegador. No se cambiaron el recolector, los workflows, los paquetes, la configuración de Astro ni los datos del catálogo.

## Presentación

La sección usa Archivo, fondo uniforme, paleta sobria y línea fina del catálogo y del bloque de personas. Las fotografías tienen una proporción estable de 16:9; el medio, la fecha y el titular completo aparecen debajo. Un enlace identifica el medio de destino y anuncia la apertura de otra pestaña. Las noticias sin imagen conservan un espacio neutro con el nombre del medio. Hay encabezados h2 y h3, sin degradados, sombras ni texto superpuesto a las fotos.

Se mantienen las dos listas necesarias para el loop; la copia queda oculta para lectores de pantalla y fuera del orden de Tab. Ambas se generan con el mismo markup. El espacio entre listas forma parte del segmento medido para conservar la separación en la unión del loop.

`news-ticker.ts`, también utilizado por los colaboradores, sigue intacto: movimiento en desktop, pausa por hover/foco, carril manual en teléfonos y respeto por movimiento reducido. `news-navigation.ts` se limita al Radar manual y muestra completamente la tarjeta al recibir foco, porque Android podía dejar la última parcialmente fuera de vista. El CSS desactiva el ajuste obligatorio mientras hay foco dentro del carril. Se mantienen las reglas existentes de visibilidad de la home según viewport y dispositivo.

## Validación

- `npm run check`: 250 archivos, sin errores, warnings ni hints.
- `npm run build`, con el código final: 7.540 páginas generadas correctamente.
- `npm run validate:public-output`: aprobado.
- Radar en desktop Chromium, Android Chromium e iPhone WebKit: 27 pruebas aprobadas y 9 omisiones previstas, al repetir tres veces cada caso con un worker. Se verifican enlaces, fuentes, fechas, copias del loop, movimiento, pausa, foco, movimiento reducido y contención móvil. Se usa Tab real en Chromium y foco directo en WebKit móvil, cuyo recorrido con Tab omite los enlaces nativos en este entorno.
- Regresiones de la home: navegación general, búsqueda y paginación, filtros, selector, reseñas y galería de personas verificadas en los tres proyectos. Una corrida con tres workers dio un timeout de filtros de WebKit; el caso se repitió sin cambios de producción con un worker y pasó tres veces. El recorte de foco en Android fue corregido; las pruebas nuevas se repitieron después del último build.
- Revisión visual del diseño en navegador y de capturas móviles. `git diff --check`: aprobado.

Las capturas y los logs locales están en `playwright-report/` y `test-results/`, fuera de Git. Captura de la vista DEV final: `playwright-report/radar-final-desktop.png`. Las pruebas del Radar admiten el estado vacío legítimo cuando ningún feed responde, para conservar el comportamiento de los builds en Actions. No se ejecutó un workflow remoto ni se publicó la rama.

Vista DEV: `http://127.0.0.1:4321/#radar-de-cine`. El trabajo queda en la rama para revisión; no se publicó en main.
