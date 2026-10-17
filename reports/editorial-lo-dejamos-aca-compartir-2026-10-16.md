# Lo dejamos acá y compartir publicaciones

Fecha de trabajo: 16 de octubre de 2026, Argentina.
Rama de revisión: `editorial/lo-dejamos-aca-compartir`.

## Nota

`src/data/editorials/lo-dejamos-aca-darin-peretti-entre-la-risa-y-el-bajon.json`

- Título: «Lo dejamos acá: Darín, Peretti y ese viaje entre la risa y el bajón».
- Opinión en primera persona a partir de las ideas del usuario: balance positivo y recomendación, Darín brillante, exceso inicial de Peretti que se acomoda, comienzo dinámico y divertido, caída dramática cerca de la mitad y recuperación de la comedia. Sin escenas ni experiencias inventadas y sin spoilers fuertes.
- 930 palabras de cuerpo; lectura calculada: 5 minutos.
- Vinculada a `lo-dejamos-aca-2026`, ya existente. Integración automática con la ficha, archivo y las seis tarjetas de home.
- No se modificaron reseña, score, disponibilidad, datos de películas ni ediciones automáticas.

## Fuentes y verificación de imágenes

La [comunicación oficial del tráiler de Netflix, 18/09/2026](https://about.netflix.com/es/news/netflix-presenta-el-trailer-oficial-de-lo-dejamos-aca-la-nueva-pelicula-argentina-con-ricardo-darin-y-diego-peretti) confirma protagonistas, dirección de Hernán Goldfrid y la premisa del psicoanalista y el escritor bloqueado. Su enlace «Descargá nuevas imágenes acá» lleva al [material promocional oficial](https://assetshare.netflixstudios.com/4eddfdcd-2291-41f5-9978-583e350ba443).

Las cinco fotografías fueron inspeccionadas visualmente antes de redactar los textos alternativos y pies. Las imágenes acompañan los temas cercanos; no se afirma que la fotografía de poca luz pertenezca al tramo medio ni que el brindis represente un momento concreto de la comedia. Se conserva el encuadre y la proporción del original, sin cambios de color ni ampliación.

| Archivo local | Archivo promocional de Netflix | ID en AssetShare | Uso |
| --- | --- | --- | --- |
| `consultorio.webp` | `PHLDA_20250602-SC19_00022_R.jpg` | `d1519d0b-763f-11f1-a2d0-12b295d65787` | Portada y premisa, ambos protagonistas frente al escritorio |
| `darin.webp` | `PHLDA_20250602-SC19_00085_R.jpg` | `d1519d08-763f-11f1-a2d0-12b295d65787` | Actuación de Darín, sentado detrás del escritorio |
| `peretti.webp` | `PHLDA_20250602-SC19_00105_R.jpg` | `d1519d0a-763f-11f1-a2d0-12b295d65787` | Actuación de Peretti, saco salmón |
| `drama.webp` | `PHLDA_20250627-SC89_00009_R.jpg` | `50e84653-815c-11f1-beb5-0e3dac6f2131` | Cambio de ánimo, primer plano de Darín con poca luz |
| `encuentro.webp` | `PHLDA_07012025_SC32_00082_R.jpg` | `d1519d09-763f-11f1-a2d0-12b295d65787` | Regreso a la dupla, ambos con vasos en una barra |

Cada `source` enlaza al detalle público del asset dentro de ese paquete. Derivados en `public/assets/editorial/lo-dejamos-aca-darin-peretti-entre-la-risa-y-el-bajon/`: 1280 × 886 y 640 × 443, diez WebP en total, con dimensiones reales, variantes responsive y carga diferida. Los cinco principales pesan entre 27 y 83 KiB. Crédito visible: Netflix. Procedencia y atribución comprobadas; no se afirma una licencia abierta ni un permiso adicional.

## Compartir en todas las publicaciones

Se extrajo el bloque de las fichas a `ShareButtons.astro` y su comportamiento a `src/scripts/share.ts`. Las fichas reutilizan ese componente conservando texto, enlaces, nombres accesibles y clases de estilo. La plantilla editorial lo incluye al pie de todas las publicaciones, cualquiera sea su tipo y fecha; se aplica automáticamente a las futuras notas.

- WhatsApp y X reciben título y URL canónica propios de la publicación. Funcionan también sin JavaScript.
- «Copiar URL» copia la URL canónica y anuncia éxito o error mediante `role="status"`.
- «Compartir» abre el panel del sistema cuando existe `navigator.share`; permanece oculto si no está disponible. Cancelar no muestra un error.
- Controles con foco visible y objetivos táctiles de al menos 44 px, distribución flexible a 320 px y estilo sobrio de la sección editorial.
- Compartir requiere una acción del lector. Las pruebas simulan APIs nativas y portapapeles; no envían publicaciones a redes.

## Validación

- `npm run check`: 290 archivos, cero errores, advertencias o hints.
- `npm run build`: 7.968 páginas, terminado correctamente.
- `npm run validate:public-output`: correcto.
- `npm run validate:sitemap-indexability`: 5.593 páginas canónicas, correcto.
- `npx playwright test tests/e2e/editorial.spec.ts tests/e2e/editorial-share.spec.ts tests/e2e/movie-detail-design.spec.ts --project=desktop-chromium --project=mobile-chromium --project=desktop-webkit --project=mobile-webkit --workers=2`: **136/136 correctos**. Se reutilizó el servidor local de revisión con `PLAYWRIGHT_REUSE_SERVER=1`.
- Las 22 publicaciones verificaron sus enlaces a WhatsApp/X, URL copiada, iconos decodificados, foco por teclado, tamaño táctil y ausencia de overflow a 320 px en los cuatro proyectos. El panel nativo se probó mediante una API simulada: envío del título/texto/URL correctos, cancelación y error. También se comprobó la alternativa sin JavaScript y el error de portapapeles no disponible.
- Navegación home → archivo → nota → ficha → nota; posición del archivo según fecha; portada de la nueva tarjeta reconocible; imágenes interiores decodificadas y sin deformación; canonical y lectura `PT5M` correctos.
- Comparación del HTML generado con el JSON: los 13 párrafos completos coinciden, luego de decodificar entidades HTML.
- Revisión visual de home, encabezado y cuerpo de la nota, y botones en escritorio y 320 px. Capturas E2E en `test-results/`, directorio ignorado por Git.
- `git diff --check`: correcto. Sin cambios en películas ni snapshots independientes.

La prueba inicial de cancelación se corrigió para consultar directamente el aviso vacío: ese nodo está oculto con CSS cuando no tiene mensaje, por lo que una consulta por rol visible no lo encuentra. La suite final completa pasó con esa corrección.

La revisión local se efectuó con el preview del build en el puerto 43210; el servidor se detuvo al preparar la publicación.

## Publicación autorizada

El usuario autorizó publicar en `main` y dejar el checkout limpio después de aprobar la revisión local. El cambio se integra sobre `origin/main`, conservando el historial de la automatización de X. El hook `pre-push` vuelve a ejecutar la validación de contenido, el build y las verificaciones de salida y sitemap. La entrega requiere confirmar el SHA de GitHub Pages, la ruta pública, los enlaces de compartir y los archivos de imagen, y dejar `main` sincronizado sin cambios pendientes.
