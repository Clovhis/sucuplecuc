# Footer, apoyo y recorrido responsive

Rama: `design/footer-mobile-2026-10-07`. Base: `a567a7a9`.

## Referencias y alcance

Se revisaron los últimos doce commits, con foco en el home editorial
(`77212a7b`), carruseles (`c7d796d3`), fichas (`81fc6f33`), trailers
(`89416bfe`), promociones (`38961526`) y biografías (`f50dac72`).
El criterio común es fondo oscuro liso, separadores finos, Archivo,
acento durazno y controles sin brillos ni sombras decorativas.

El recorrido cubre 19 destinos: home, ficha, biografía, directorio de
personas, recomendador, comunidad, discusión, archivo editorial, nota,
simulador, metodología, presentación, política editorial, fuentes,
contacto, privacidad, equipo, copyright y redirección de trailers.
Se revisan sus plantillas y recorridos representativos; las comprobaciones
del HTML generado cubren el conjunto de páginas estáticas.

## Hallazgos y cambios

- El footer anterior medía aproximadamente 1.166 px de alto a 390 px de
  ancho. La versión compacta mide aproximadamente 741 px, un 36 % menos.
  Los cinco destinos de consulta frecuente siguen a la vista. Las ocho
  páginas institucionales se agrupan en un desplegable nativo, cerrado
  inicialmente hasta 720 px y abierto en escritorio. Si no hay JavaScript,
  los enlaces quedan abiertos y accesibles. Al cambiar de ancho se
  sincroniza el estado; dentro del mismo ancho el usuario puede abrirlo
  y cerrarlo. Se conservan los 13 destinos originales.
- `SiteFooter.astro` centraliza la nueva presentación. Contacto, prensa y
  X usan filas con separadores, tipografía sans y texto sin cursiva.
  Se retiran los estilos anteriores del footer y la animación de su logo
  de apoyo; se conservan los estilos del resto de los componentes.
- La franja superior pasa al mismo fondo y tipografía del home, sin la
  cápsula de color. Se retira en teléfonos y en horizontal de poca altura:
  el enlace a Cafecito queda en el footer, sin ocupar los 60 px del acceso.
- La barra de accesos mobile conserva sus tres destinos y su posición
  sticky, con separadores rectos, texto más legible y sin desenfoque.
- Las filas de filtros permiten desplazamiento horizontal y vertical
  con `touch-action: auto`. Antes, `pan-x` impedía bajar la página si el
  gesto comenzaba sobre esos filtros.
- Los campos visibles en pantallas pequeñas o dispositivos táctiles usan
  16 px. Los selectores de orden y año antes tenían texto inferior a 16 px,
  condición que puede provocar zoom al enfocarlos en Safari de iPhone.
- Las cabeceras de Personas y Qué vemos hoy se compactan en mobile:
  títulos con tamaño de lectura, altura según contenido, estadísticas
  completas e ilustraciones decorativas ocultas. Se conservan las
  ilustraciones y la presentación de escritorio. El formulario, las
  opciones, los resultados y los enlaces mantienen sus funciones.

No se modifican películas, scores, perfiles, editoriales, disponibilidad,
URLs, metadatos, generación de agenda ni GitHub Actions. Las peticiones
de datos comunitarios y del ranking del juego se simulan durante las
pruebas que interactúan con esos servicios.

## Evidencia local

`test-results/footer-mobile-review/` contiene el script de recorrido,
los registros, las métricas y las capturas antes/después. Se usan Chromium
y WebKit, con anchos de 320, 390, 768, 844 y 1.440 px, incluido horizontal
de 844 × 390. Las capturas mobile se toman con `scale: 'css'`, conservando
el viewport. Los casos del footer también recorren 600 y 1.024 px.

La suite agrega una prueba de gestos táctiles reales mediante CDP en
Chromium, verifica el desplegable con teclado y navegación y comprueba
contención, campos legibles y errores JavaScript por plantilla.

## Validación

- `npm run check`: 258 archivos, cero errores, warnings o hints.
- `npm run build`: 7.540 páginas generadas correctamente.
- `npm run validate:public-output`: aprobado.
- `npm run validate:sitemap-indexability`: 5.286 páginas canónicas, aprobado.
- Pruebas nuevas: 77 aprobadas y tres omisiones previstas (los gestos CDP
  son exclusivos de Chromium mobile). La primera corrida conjunta tuvo
  un error de infraestructura al cerrar un worker, después de completar
  todas las aserciones. Se repitieron los veinte casos de Chromium mobile
  con un solo worker: veinte aprobados y cierre correcto, sin cambios al
  producto ni a las expectativas de las pruebas.
- Regresión de escritorio: 288 aserciones aprobadas y 30 omisiones
  previstas en Chromium y WebKit. La corrida quedó esperando el cierre
  de sus workers después de completar los 318 casos; se detuvieron esos
  procesos locales. Los perfiles mobile se ejecutan por separado, con
  un worker cada uno, para completar la comprobación.
- Chromium mobile: 153 aprobadas, seis omisiones previstas y cierre
  correcto. WebKit mobile: 152 aprobadas y siete omisiones previstas;
  completó todas las aserciones, pero el runner volvió a agotar el plazo
  de cierre de su worker. Se conserva el error de infraestructura en el
  log. La repetición final de los recorridos afectados, en un proceso
  nuevo de WebKit mobile, cerró correctamente: 34 aprobadas y dos
  omisiones previstas. Incluye footer, todas las plantillas responsive,
  controles mobile, directorio de personas, recomendador y trailers.
- Recorrido visual final: 136 combinaciones de destino y ancho, cero
  desbordes horizontales y cero errores JavaScript en ambos motores.
  Los controles mobile medidos alcanzan al menos 44 px y los campos
  medidos usan 16 px o más. Las capturas de Personas, recomendador,
  biografías, home y footer se inspeccionaron en los dos motores.

Balance de casos únicos de la suite completa: **670 aserciones aprobadas
y 46 omisiones previstas, 716 casos en 33 archivos**. No hubo fallos de
aserciones del sitio. Esto no equivale a una corrida única con salida cero:
los bloqueos de cierre del runner de Windows quedaron registrados y las
repeticiones focalizadas cerraron sin errores. No se cambió la configuración
de CI ni se relajaron expectativas para ocultar esas incidencias.

Los logs principales son `e2e-desktop.log`, `e2e-mobile-chromium.log`,
`e2e-mobile-webkit.log`, `e2e-focus.log`, `e2e-focus-mobile-repeat.log`
y `e2e-webkit-final.log`, dentro del directorio de evidencia local.

Preview del build revisado: `http://127.0.0.1:43211/`.

La rama queda para revisión local, sin publicación en `main`.
