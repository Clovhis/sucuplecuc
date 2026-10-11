# Qué vemos hoy: revisión visual

Rama de trabajo: `design/que-miro-hoy-visual-2026-10-10`.

Ruta: `/que-miro-hoy/`. Destino de publicación: <https://www.cineposta.com.ar/que-miro-hoy/>.

## Criterio visual

Se revisaron la homepage actual, los últimos cambios de sus estilos, la estructura del Postómetro, su formulario, los estados renderizados por el script y las dos ilustraciones originales. Las capturas anteriores al cambio están en `reports/que-miro-hoy-visual-2026-10-10/before-chromium-*.png`.

La sección adopta Archivo, el fondo carbón `#101318`, el texto cálido `#f0eee8`, las líneas `#343b45` y el acento durazno `#e6b291` de la homepage. Las divisiones del formulario organizan la lectura; las opciones usan tipografía, líneas finas e indicadores de radio; se retiraron los emojis, los números decorativos y los fondos de tarjetas. El estado activo se distingue por el acento durazno y la línea inferior. La recomendación usa un afiche acotado, título destacado y datos separados por líneas. El número del puntaje, el denominador y la valoración tienen el mismo tamaño y peso, sin un recuadro de color que los sobredimensione. Las acciones se acomodan al ancho disponible.

Luego de la aprobación visual en DEV, se redujo el texto por pedido del usuario: una sola pregunta para el mood («¿Qué tenés ganas de sentir?»), una introducción breve («Armemos la noche») y ninguna explicación redundante en compañía, tiempo o intensidad. Los ajustes de época y plataforma se identifican como opcionales. Se retiraron también las instrucciones repetidas de la espera y la carga, conservando los mensajes de estado, la frase lúdica de carga y la información específica de cada recomendación. El reinicio no restaura los textos eliminados.

La disponibilidad muestra sólo el logo de la plataforma. Su nombre queda accesible a lectores de pantalla; los proveedores sin logo mantienen el texto como alternativa.

En el resultado se eliminó el diagnóstico y la aclaración a la derecha del encabezado. Los motivos se reescribieron con frases breves y naturales: «Para pasarla bien y desconectar», «Va bien para una noche con amigos», «Te engancha sin hacerse pesada». Sólo cambian los textos; se conservan las condiciones, el orden, el límite de motivos y el criterio de recomendación.

Las escenas del videoclub mantienen sus archivos, fondos, personajes y elementos originales. La cabecera se encuadra completa en 3:2 y la escena de recomendación en 4:3, dentro del mismo contenedor que el texto. No se usan offsets negativos, recortes ni deformaciones. Un degradado sobre las zonas oscuras de los bordes une el fondo sólido con la ilustración: horizontal en desktop y vertical al apilar la escena en mobile. Los personajes quedan fuera de la transición. En mobile se apilan texto y escena; en tablet la cabecera conserva dos columnas para evitar una introducción excesivamente alta.

## Alcance

- `src/pages/que-miro-hoy.astro`: importación de CSS, clase de página en `BaseLayout`, eliminación de los spans decorativos de emojis y sus mapas, y reducción de textos redundantes.
- `src/scripts/postometro.ts`: sólo eliminación de textos repetidos en espera, carga y cabecera del resultado, para mantener la reducción también después del reinicio.
- `src/lib/postometro-engine.ts`: sólo reemplazo de las frases de los motivos de recomendación.
- `src/styles/postometro.css`: estilos exclusivos de `body.postometro-edition`.
- `tests/e2e/postometro-design.spec.ts`: protección de proporciones, contención, separación entre texto e imagen, reinicio, ausencia de emojis y números visibles, escala uniforme del score y visibilidad con movimiento reducido.
- `tests/e2e/postometro-ux.spec.ts`: nombre accesible del grupo actualizado a la pregunta única del mood; controles de logos sin texto duplicado y con nombre accesible.

`revision-2/source-contract.json` comprueba que los controles, sus valores predeterminados, etiquetas de opciones, botones, payload, metadata y markup de las ilustraciones coinciden con el original. El script y el motor coinciden exactamente fuera de la lista explícita de textos eliminados o reemplazados. Por SHA-256 verifica que la construcción del catálogo y las dos imágenes permanecen idénticas. No se editaron datos, puntuaciones, plataformas, algoritmos, componentes compartidos ni GitHub Actions.

Se corrigieron dos problemas de presentación detectados durante la revisión: el contenido de la recomendación permanecía transparente al desactivar las animaciones, y WebKit podía retener una altura anterior de la grilla al redimensionar imágenes con altura intrínseca. La corrección queda en el CSS exclusivo de la página: opacidad visible en movimiento reducido y proporciones explícitas para ambos contenedores.

## Evidencia de revisión

| Vista | Cabecera | Escena de espera | Resultado |
| --- | --- | --- | --- |
| Desktop, 1440 px | [Cabecera](../reports/que-miro-hoy-visual-2026-10-10/revision-2/hero-chromium-desktop.png) | [Escena completa](../reports/que-miro-hoy-visual-2026-10-10/revision-2/idle-chromium-desktop.png) | [Recomendación](../reports/que-miro-hoy-visual-2026-10-10/revision-2/result-detail-chromium-desktop.png) |
| Tablet, 768 px | [Cabecera](../reports/que-miro-hoy-visual-2026-10-10/revision-2/hero-webkit-tablet.png) | [Escena completa](../reports/que-miro-hoy-visual-2026-10-10/revision-2/idle-webkit-tablet.png) | [Recomendación](../reports/que-miro-hoy-visual-2026-10-10/revision-2/result-detail-webkit-tablet.png) |
| Mobile, 390 px | [Cabecera](../reports/que-miro-hoy-visual-2026-10-10/revision-2/hero-webkit-mobile.png) | [Escena completa](../reports/que-miro-hoy-visual-2026-10-10/revision-2/idle-webkit-mobile.png) | [Recomendación](../reports/que-miro-hoy-visual-2026-10-10/revision-2/result-detail-webkit-mobile.png) |
| Mobile angosto, 320 px | [Cabecera](../reports/que-miro-hoy-visual-2026-10-10/revision-2/hero-chromium-narrow.png) | [Escena completa](../reports/que-miro-hoy-visual-2026-10-10/revision-2/idle-chromium-narrow.png) | [Recomendación](../reports/que-miro-hoy-visual-2026-10-10/revision-2/result-detail-chromium-narrow.png) |

## Validación

La versión aprobada pasó las siguientes verificaciones sobre el build completo. Sus resultados y capturas viven en `reports/que-miro-hoy-visual-2026-10-10/revision-2/`.

- `npm run check`: 267 archivos; cero errores, advertencias o hints.
- `npm run build`: 7816 páginas, salida correcta.
- `npm run validate:public-output`: correcto.
- Playwright: 50 pruebas correctas en desktop Chromium, Firefox y WebKit, y mobile Chromium y WebKit. Incluye el flujo completo, navegación por teclado desde la homepage, reinicio, logos accesibles, score, ausencia de emojis/números decorativos y encuadres.
- Capturas y recorridos: ocho combinaciones de Chromium/WebKit y 1440, 768, 390 y 320 px; cero errores de JavaScript, desbordes o imágenes fuera de sus contenedores/proporciones.
- Inspección visual de las capturas finales: cabecera, opciones, escena de espera y resultado; sin línea de corte entre fondo e ilustración, personajes completos, sin textos repetidos ni nombres duplicados bajo los logos.
- Contrato de fuentes: controles y metadata conservados; scripts iguales fuera de la lista explícita de cambios de texto; ilustraciones originales idénticas por SHA-256.

El script de capturas recorre Chromium y WebKit en 1440, 768, 390 y 320 px. Cambia los seis controles y comprueba carga, recomendación, otra película, ya vista, enlace a la ficha, ausencia de desbordes y reinicio. Las pruebas de encuadre también recorren 600, 900, 1024 y 1280 px. Las capturas se inspeccionan como escenas completas y como detalles, no sólo mediante el resultado de compilación.

La configuración local de QA reutiliza la matriz de navegadores del repositorio; desactiva solamente el video para esta ejecución en Windows. No modifica la configuración de CI.

El usuario aprobó el diseño en DEV y autorizó integrar y publicar en `main` después de las validaciones. La base de integración es `b9283f70`; el cambio remoto intermedio sólo registró una publicación automática de Buffer y no modificó el sitio.
