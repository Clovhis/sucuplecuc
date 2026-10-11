# Personas: fichas oscuras y filtros

Rama de revisión: `design/personas-dark-2026-10-11`. Base: `1a0e6f40`.

Se revisaron el anteúltimo commit `bcb7f214` (Qué vemos hoy), los cambios de la home `77212a7b` y `74c14331`, las biografías `f50dac72` y el ajuste mobile `c1e292de`. El directorio usa la misma tipografía Archivo, fondo carbón `#101318`, texto cálido `#f0eee8`, líneas `#343b45` y acento durazno `#e6b291`.

Las fichas conservan su composición de archivo: retrato, rol, nombre, presentación, películas, edad, catálogo, origen y acceso a la biografía. El papel pasa a carbón `#1c2129`, con renglones sutiles, una franja de colores apagados y un marco gris para la foto. Se eliminan la sombra marrón, la elevación y la rotación al pasar el cursor. La cabecera muestra la ilustración original completa en 3:2, también en mobile. El buscador usa controles oscuros, líneas finas y un foco durazno.

Sexo y Nacionalidad quedan visibles junto a la búsqueda y el orden. Rol, Edad, Presencia en el catálogo y Premios siguen en Más filtros. Los controles se combinan, persisten en la URL y admiten limpieza individual o total. La cantidad del botón Más filtros cuenta únicamente los cuatro controles que contiene.

## Castellano y nacionalidades

Las opciones concuerdan con el sustantivo «nacionalidad»: Argentina, Brasileña, Española, Francesa, etc., independientemente del sexo seleccionado. Cada nacionalidad tiene una única opción. Los valores masculinos y femeninos anteriores de la URL se normalizan al mismo grupo. El texto de nacionalidad de las fichas y las biografías mantiene el dato original.

Las nacionalidades dobles se incluyen en cada grupo correspondiente: «Argentino-español» permite encontrar a la persona por Argentina o Española; «Austriaco y suizo», por Austriaca o Suiza. La búsqueda libre incluye ambas formas del gentilicio. Los identificadores de filtro se mantienen separados de sus etiquetas visibles.

## Procedencia del filtro de sexo

Se incorporaron únicamente los valores Masculino y Femenino, con Todos como valor inicial. `scripts/enrich-person-sex.mjs` consulta las referencias de Wikidata ya presentes en el catálogo, lee P21 («sex or gender») y exige que P345 coincida con el identificador de IMDb existente. Sólo acepta una declaración no obsoleta inequívoca de Q6581097 o Q6581072. No utiliza nombres, imágenes ni roles para deducir el dato.

Se verificaron 745 perfiles: 495 masculinos y 250 femeninos. Otros 14 siguen sin clasificación y aparecen en Todos. Los casos sin referencia inequívoca, con identificadores que no coinciden o sin dato utilizable quedan detallados en [sex-evidence.json](../reports/personas-dark-2026-10-11/sex-evidence.json), con la URL por persona. No se corrigen aquí identificadores u otros datos ajenos al filtro.

Los campos `sex`, `sexSourceUrl` y `sexVerifiedAt` viven en la fuente central `people.json`. El [contrato de fuentes](../reports/personas-dark-2026-10-11/source-contract.json) verifica que todos los valores anteriores permanecen idénticos y que no se editaron biografías, créditos, imágenes, estilos compartidos, Postómetro ni deploy. Los catálogos derivados se verifican mediante `validate:content`.

## Revisión visual

Las capturas anteriores están en `reports/personas-dark-2026-10-11/before/`; las finales y métricas están en `after/`. El script `capture.mjs` recorre Chromium y WebKit en 1440, 768, 390 y 320 px, y captura cabecera, fichas y filtros desplegados.

- [Ficha de Aaron Eckhart](../reports/personas-dark-2026-10-11/after/aaron-chromium-desktop.png)
- [Desktop](../reports/personas-dark-2026-10-11/after/hero-chromium-desktop.png)
- [Mobile Safari](../reports/personas-dark-2026-10-11/after/hero-webkit-mobile.png)
- [Filtros mobile](../reports/personas-dark-2026-10-11/after/filters-webkit-mobile.png)

El usuario aprobó el diseño y autorizó publicar en `main` después de verificar desktop y mobile. Se integró la actualización automática de recomendaciones `5b04c379`, sin modificarla.

La revisión detectó y corrigió dos fallas: WebKit computaba el ancho del texto de los selectores fuera de sus límites, y el evento `change` del buscador al perder foco podía reemplazar el filtro activo entre el inicio y el fin del clic. El selector nativo mantiene sus opciones y comportamiento de teclado con un indicador visual propio y el texto contenido; la búsqueda se actualiza con `input`, sin repetir ese render al perder foco. Las pruebas cubren ambos casos.

## Validación de la versión aprobada

- `npm run check`: 272 archivos, cero errores, advertencias o hints.
- `npm run validate:content`: auditorías de contenido y perfiles correctas; 759 biografías aprobadas, sin cambios de texto.
- Build final: 7817 páginas. Salida pública correcta y 5473 páginas canónicas verificadas en el sitemap.
- Capturas finales: ocho combinaciones de Chromium/WebKit con 1440, 768, 390 y 320 px; sin errores de JavaScript ni desbordes.
- Playwright: 56 pruebas correctas, 14 en cada uno de desktop Chromium, desktop WebKit, mobile Chromium y mobile WebKit. Cubren el directorio, sexo/nacionalidad, aliases de URLs anteriores, nacionalidades dobles, limpieza de filtros, teclado y biografías con distintas cantidades de películas.

Las capturas y logs están en `reports/personas-dark-2026-10-11/`. La primera salida de build se descartó porque dos validaciones locales se ejecutaron en paralelo; las verificaciones posteriores del build se hicieron en serie. Los diagnósticos intermedios quedaron archivados fuera del repositorio.

La matriz final se ejecutó en procesos independientes por proyecto. La configuración de QA desactiva el video y el plugin de servidor de Playwright, porque se utiliza un preview estático ya abierto por la sesión. Así se evita un bloqueo de cierre del plugin en Windows; no se modificó la configuración de CI ni los workflows.
