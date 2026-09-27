# CinePosta Editorial — revisión DEV

Fecha: 27/09/2026. Este reporte registra la implementación y validación inicial en DEV. Después de aprobar la nota, el usuario autorizó incorporar la skill a `AGENTS.md`, verificar la instalación global y publicar el conjunto en `main`.

## Arquitectura

El checkout inicial no tenía rutas `/editorial/`, modelo de publicaciones ni bloque “Desde CinePosta”. Se agregaron reutilizando `BaseLayout`, `HomeBrandLink`, tokens de estilos y las fichas existentes. Las publicaciones JSON viven en `src/data/editorials/`; `src/lib/editorial.ts` valida tipos, fechas, slugs únicos, relación con película y contenido, y calcula `readingTime` a 220 palabras/minuto. Soporta editorial, nota, especial y opinión. El orden principal es por fecha; home prioriza destacados y después recientes.

La relación se deriva de `movieSlug` sin modificar el JSON de la película. La ficha mantiene su reseña y score existentes. Home incluye “Desde CinePosta” después del catálogo principal. Footer distingue Editorial de Política editorial. Se incorporaron índice y notas al sitemap, canonical, Open Graph y Article JSON-LD.

## Primera publicación

- Título: **Resident Evil: Noche Cero: la vería 99 veces y volvería a abrir esa puerta**.
- Ruta: `/editorial/resident-evil-noche-cero-la-veria-99-veces/`.
- Película: `resident-evil-noche-cero-2026`.
- 997 palabras, 5 minutos estimados, 5 imágenes interiores. Firma CinePosta, sin spoilers fuertes.
- Opinión escrita a partir de los puntos del usuario; no se atribuyen anécdotas de sala ni escenas no verificadas.

## Evidencia visual

Fuente: [sitio oficial de la película](https://residentevil.movie/), cuyo HTML incorpora [este montaje promocional](https://residentevil.movie/video/bgvideo.mp4). Se descargó y decodificó el video de 10,01 segundos, 1920 × 860. Identidad contrastada con la [ficha oficial de Sony](https://www.sonypictures.com/movies/residentevil8) y el [trailer oficial](https://www.youtube.com/watch?v=mNd1gb19A-c). La descarga de YouTube no estuvo disponible; las capturas proceden del video alojado en el sitio oficial, no de thumbnails de YouTube.

| Archivo | Segundo | Relación con el texto |
| --- | ---: | --- |
| recorrido.webp | 0,5 | Recorrido nocturno, anticipación y decisiones de videojuego |
| linterna.webp | 4,4 | Visibilidad parcial y tensión en la oscuridad |
| criatura.webp | 3,4 | Presencia corpulenta y extrañeza visual, sin inventar identidad |
| puerta.webp | 5,8 | Supervivencia inmediata y una puerta que debe aguantar |
| calle.webp | 9,4 | Volver a recorrer Raccoon City; también portada de tarjeta |

Se inspeccionaron visualmente las cinco capturas y sus versiones WebP finales. No se cambiaron colores, escenas ni encuadres. Hay variantes de 1280 × 573 y 640 × 287, entre 2,4 y 54,3 KB por archivo; unos 133 KB sumando las diez variantes. La oscuridad corresponde al material oficial. Alt descriptivo, captions y enlaces a la fuente con timestamp. Las imágenes interiores usan srcset, sizes, lazy loading y dimensiones para reservar espacio. Atribución de procedencia, sin afirmar una licencia de reutilización no comprobada.

## Skill reutilizable

`skills/cineposta-editorial/SKILL.md`, con metadata en `agents/openai.yaml`. Copia de plugin sincronizada mediante `sync-from-repo.mjs`; sólo la nueva skill se copió a la instalación local de Codex. Las tres copias pasaron `quick_validate.py` con Python en UTF-8. La primera nota se escribió usando esta skill. No se modificaron memorias personales.

## Validación

- Astro check: 0 errores, 0 advertencias, 0 hints.
- Playwright sobre DEV: 4/4 pruebas editoriales desktop/móvil; ida y vuelta entre home, sección, nota y película; reseña existente visible; cinco imágenes decodificadas y entre párrafos; fuentes, fecha, canonical, duración estructurada y ausencia de errores JS.
- Regresión de filtros avanzados desktop/móvil: 2/2, selección y estado en URL preservados.
- Inspección visual de columna completa, cabecera desktop, cabecera e índice a 320 px, índice desktop y bloque home. Sin desborde horizontal en la columna a 320 px.
- Build final: 7456 páginas, completado correctamente. Playwright repetido sobre la salida estática final: 4/4 desktop/móvil.
- `validate:public-output`: aprobado. `validate:sitemap-indexability`: aprobado, 5228 páginas canónicas.
- Dimensiones de las diez variantes comprobadas con Sharp; copias de la skill comparadas por SHA-256. Sin cambios en JSON de películas, personas, lógica del score ni script de filtros. `git diff --check` aprobado.
- DEV disponible en `http://127.0.0.1:4321/editorial/`.
