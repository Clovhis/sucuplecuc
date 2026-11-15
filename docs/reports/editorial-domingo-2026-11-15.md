# Nota de domingo — 15 de noviembre de 2026

- Nota: `src/data/editorials/los-juegos-del-hambre-hollywood-rejuvenece-nosotros-no.json`.
- Enfoque: el estreno próximo de Amanecer en la cosecha como disparador para conversar sobre precuelas, reconocimiento y espectáculo. Comentario editorial original; no presenta una crítica de un visionado ni atribuye experiencias a Leo.
- 892 palabras; el loader calcula 5 minutos. Firma CinePosta, sin spoilers fuertes. No se agregaron fichas ni scores.
- Estreno argentino anunciado para el 19/11/2026: Canal 26, 06/11/2026, https://www.canal26.com/espectaculos/2026/11/06/a-dias-del-estreno-de-los-juegos-del-hambre-amanecer-en-la-cosecha-todo-lo-que-hay-que-saber-para-entender-la-precuela/ . Se describe como anunciado, sin afirmar funciones ni disponibilidad actual en salas.
- Premisa, 24 años antes, Joseph Zada, dirección Francis Lawrence: https://www.hungergamesmovie.com/synopsis/ . Sinopsis corroborada por el distribuidor https://metrofilms.com/film/hunger-games-sunrise-on-the-reaping__trashed/ . Las fechas francesa y norteamericana no se trasladan al público argentino.
- Reparto y personajes Fiennes/Snow, Fanning/Effie, Plemons/Plutarch y Culkin/Caesar: Associated Press, 11/11/2026, https://apnews.com/article/8c0771ddc42dc9cd9780c62e4bf599ce . Se omitieron revelaciones del epílogo mencionadas por esa cobertura.
- No se incluye movieSlug: no existe ficha de esta película en el catálogo local.

## Imágenes

Cinco fotografías promocionales de la película de 2026, verificadas visualmente en el material del distribuidor oficial Metropolitan Filmexport. Sin escenas generadas ni alteración de color o encuadre. Cada fotografía conserva su proporción y fuente visible. WebP de hasta 1280 px y variante de 640 px; diez archivos, 668824 bytes en total. La primera también es portada, reconocible en el recorte central 16:9.

Procedencia promocional verificada; no se afirma una licencia libre ni permiso de reutilización expresamente concedido. No se hizo publicación social.

- `haymitch`: original 3600 × 2400, variante principal 1280 × 853. Fuente: https://metrofilms.com/media/SOLSTICE_UNIT_250924_01842R_CropC.1b2b59a7-e202-4671-b349-acd83253305e.jpg
- `antes-de-la-arena`: original 3600 × 2400, variante principal 1280 × 853. Fuente: https://metrofilms.com/media/SOLSTICE_UNIT_250903_00331RC.22abb4b0-fdd4-4be4-997a-7e238bd6bbd6.jpg
- `show`: original 3000 × 2000, variante principal 1280 × 853. Fuente: https://metrofilms.com/media/SOLSTICE_UNIT_251117_01889RC3.5f86c649-0791-4a01-a9ec-0827da9c00db.jpg
- `snow`: original 3840 × 1599, variante principal 1280 × 533. Fuente: https://metrofilms.com/media/Solstice_Final+Trailer+Grab_00002RC.8713e151-08a5-47c0-9777-f863e62fe92e.jpg
- `camara`: original 3000 × 2000, variante principal 1280 × 853. Fuente: https://metrofilms.com/media/SOLSTICE_UNIT_250925_00425RC.f1245238-0b1c-4ae7-ba84-f1297740b5f1.jpg

## Validación local

- `npm run check`: 0 errores, 0 warnings y 3 hints previos por imports/variables sin usar en scripts de supervisión semanal ajenos al cambio.
- `npm run build`: aprobado, 8917 páginas.
- `npx playwright test tests/e2e/editorial.spec.ts --project=desktop-chromium --project=mobile-chromium --workers=4`: 68 aprobados.
- Revisión específica con Playwright local a 1280 y 320 px: cinco imágenes decodificadas, sin overflow ni errores JS; navegación home → nota y archivo → nota, regreso al archivo y orden por fecha correctos. Capturas revisadas visualmente en `test-results/sunday-1280.png`, `sunday-320.png` y `sunday-home-320.png`.
- `git diff --check`: aprobado. Sólo nota, diez WebP y este reporte; sin cambios en fichas, snapshots, componentes o automatizaciones.
- DEV disponible en http://127.0.0.1:4321/editorial/los-juegos-del-hambre-hollywood-rejuvenece-nosotros-no/ .

Sin commit, push ni deploy.
