# Recuperación de llegadas a streaming — 13/11/2026

Lote congelado por pedido del usuario: **51 altas**, incluida **Instinto maternal (2024)**. No se siguió abriendo investigación o redacción después del cierre.

## Alcance y cobertura

Se revisaron los eventos de JustWatch Argentina del lunes 9 al domingo 15 de noviembre, por proveedor y sin filtro de año original. Las fechas futuras 14/15 no tenían eventos al consultar. El nuevo barrido devolvió 388 registros diarios; el conjunto de películas anteriores a 2025 con un evento semanal en los proveedores compatibles reúne 127 identidades. Reconciliación: {"already-in-catalog":17,"loaded":51,"pending-evidence":45,"deferred-by-user-scope":14}. No se presenta el lote publicado como cobertura exhaustiva de todas las novedades. Los eventos con año 0 o identidad cruzada no se convierten en películas históricas por suposición.

La revisión de la skill ya está publicada en 43a8841 y 8044371. Se conserva por separado el año original, la llegada detectada al proveedor y catalogAddedAt. El carrusel se audita sobre sus 12 selecciones reales. Las ediciones de recomendadas y trailers se preservan.

## Caso detectado

Instinto maternal corresponde a Mothers’ Instinct, con Jessica Chastain y Anne Hathaway, de 2024. El evento por paquete prv registra Prime Video en Argentina el 13/11/2026 y la oferta vigente es de suscripción. Esto confirma una llegada detectada esta semana, sin afirmar que nunca haya estado antes. Score CinePosta 5, derivado del público; el valor y muestra reproducibles están en evidence.json.

## Auditoría

Cada ficha tiene ledger completo de billing, identidades, retratos locales inspeccionados y omisiones enumeradas en reports/movie-intake. Se agregaron los créditos relevantes fuera de las primeras posiciones cuando la publicidad o IMDb los identifican. Se rechazaron avatares genéricos y retratos ajenos. Una ambigüedad de foto dejó Tatsumi y Otra terapia peligrosa fuera de este lote. No se alteraron personajes previamente publicados. Siete roles ausentes en TMDB se verificaron en fuentes web y sus IDs exactos: character-web-evidence.json.

Las fechas de nacimiento y nacionalidades de personas siguen siendo opcionales: los datos no demostrados se omiten y sus advertencias permanecen visibles en los logs. No se inventan retratos ni biografías. Las reseñas son originales y se mantienen las categorías por su sentido narrativo, sin forzar medidores. La única normalización pública que supera 8 es Médium: 85% de 100+ valoraciones verificadas da 9 por redondeo y queda 8 por el filtro de confianza y reconocimiento perdurable.

Los pósters fueron localizados por el script canónico, sin redimensionar fuentes pequeñas para superar el piso. La optimización de retratos usa exclusivamente images:people:optimize. Las comprobaciones finales se registran en validation.json y browser-qa.json.

No se duplican las publicaciones sociales de la campaña original ni se modifican automatizaciones, credenciales, UI o snapshots de la home.

## Cierre local

Las 51 rutas y sus 51 pósters se abrieron y decodificaron en Chromium; se comprobaron 405 personajes renderizados. El carrusel conserva 12 selecciones únicas, sin Cine ni fechas futuras; incluye Instinto maternal y otros ingresos de años anteriores. Las vistas de 1365 y 320 px no desbordan. Magal & Magali y El expreso polar aparecen con Musical en el filtro usando sus títulos completos. Pasaron 8 pruebas de carruseles y 4 de presentación del género Musical.

Build final: 8.915 páginas; sitemap: 6.241 rutas canónicas. validate:content, check, auditor de personas, auditor de las 51 fichas, YouTube (49 sin cambios + 2 corregidas y repetidas sin skip), duplicados, pósters, imágenes de personas, medidores, salida pública y personajes del build aprobados. Se preservaron por rebase los commits 36e1b8ce y 77b2a963 del bot. La publicación final se entrega a Pages cuando inicia su job build, sin afirmar disponibilidad pública antes del despliegue.
