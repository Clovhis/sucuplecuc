# Guía de trabajo del repositorio

## Alcance y fuentes de verdad

- Las películas viven en `src/data/movies/*.json`; no edites el catálogo derivado a mano.
- Cine Posta está orientado a público argentino. Toda etiqueta `releasePlatform` / `releasePlatforms`, fecha de estreno, cartelera y título localizado debe describir la disponibilidad vigente en Argentina, nunca la de Estados Unidos, España u otro mercado.
- `docs/movie-catalog-reference.md` y `docs/person-profile-catalog-reference.md` se regeneran con sus scripts.
- `src/data/people.json` centraliza los datos de personas y `src/data/personProfiles.ts` contiene los perfiles extensos.
- Radar (`src/data/cinemaNews.generated.json`), recomendadas (`src/data/weeklyRecommendations.generated.ts`) y trailers (`src/data/upcomingReleases.generated.ts`) son ediciones generadas independientes. No las regeneres, edites ni reviertas durante una carga/auditoría de películas; el build lee lo versionado. Sólo sus workflows o un pedido explícito de actualización pueden cambiarlas.
- No agregues secretos, credenciales administrativas ni service-role keys. Las variables esperadas están en `.env.example`.

## Flujo mínimo de cambios

1. Conservá la taxonomía existente: `category` es el carril principal; `genres` y `subgenres` agregan señales secundarias.
2. Para altas o cambios de películas, corré `npm run validate:content`; actualiza los catálogos derivados si corresponde.
3. Para UI o scripts de navegador, corré `npm run check`, `npm run build` y la suite Playwright pertinente.
4. No cambies categorías sólo para activar un medidor editorial; priorizá la clasificación correcta. Las señales de medidores ocultos por género secundario son informativas: consultá `docs/content-audit-policy.md` antes de modificar una categoría.
5. Las reseñas y biografías deben ser originales, específicas, en español rioplatense y sin citar agregadores ni usar texto de fuentes como copia publicada.
6. `cinepostaScore` es la única fuente de verdad para una película valorada: entero de 1 a 10, con etiqueta derivada por el sitio. No inventes score para una película todavía no rankeada ni agregues etiquetas personalizadas de valoración. Los puntajes 9 (`Obra maestra`) y 10 (`Absolute Cinema`) son exclusivos para obras maestras genuinas: 9 exige logros cinematográficos excepcionales y reconocimiento perdurable; 10 queda para un grupo muy reducido de hitos máximos. Popularidad, franquicia, una reseña elogiosa o una calificación externa alta no bastan por sí solas. Primero normalizá la evidencia pública y aplicá su tope de confianza; después aplicá este filtro editorial, que sólo puede bajar el score. Si una película es una obra maestra pero no alcanza el nivel excepcional de 10, corresponde 9; si no supera el filtro, el máximo es 8. Documentá el razonamiento y las referencias por título en el reporte, sin agregar campos al JSON. Para *Colony: Zona Cero*, el tope pedido es 8.
7. Antes de publicar o cambiar una plataforma, verificá la disponibilidad legal en AR en la fecha de trabajo: primero JustWatch AR y luego la página oficial argentina de la plataforma cuando haga falta confirmar. Guardá la URL y el dato comprobado en el reporte de la tarea.
8. No inferir una plataforma por el estudio, la franquicia, una ficha global ni un enlace que redirige a otro país. Priorizá suscripción (`FLATRATE`); si sólo hay alquiler/compra legal en AR, se puede usar ese proveedor, dejando explícito que es transaccional. Si no hay evidencia AR vigente, usá `Otras plataformas` y no combines esa etiqueta con otra.

## Notas y editoriales de CinePosta

- Para crear o editar editoriales, notas, especiales u opiniones, usá siempre la skill [`cineposta-editorial`](skills/cineposta-editorial/SKILL.md), aunque el pedido sólo diga «Creá una editorial para esta película. Estas son mis ideas…». Leela antes de redactar; allí están las reglas de voz, estructura, imágenes, integración, validación y publicación.
- La nota de [Resident Evil: Noche Cero](src/data/editorials/resident-evil-noche-cero-la-veria-99-veces.json) es la referencia aprobada de tono, ritmo y relación entre texto e imágenes. Conservá ese criterio, con texto original y una idea central propia para cada nueva publicación.
- Las publicaciones viven en `src/data/editorials/*.json`; `src/lib/editorial.ts` calcula la lectura y vincula `movieSlug` con las fichas. Reutilizá `/editorial/`, “Desde CinePosta” y los componentes editoriales sin reemplazar reseñas ni modificar Score CinePosta.
- Mantené la skill disponible en el repositorio, en `plugins/la-posta-cine/skills/cineposta-editorial/` y en la instalación global de Codex (`$CODEX_HOME/skills/cineposta-editorial/`, o `~/.codex/skills/cineposta-editorial/`). Al actualizarla, sincronizá y validá las tres copias. Una prueba en DEV no autoriza publicar; un pedido explícito de publicación sí.

## Automatización

- Los horarios son de Argentina (UTC-3). Radar corre todos los días a las 10:00 (`0 13 * * *`); consulta La Nación, Clarín, Página/12 y Ámbito, además de Infobae y Cines Argentinos.
- Recomendadas tiene su workflow semanal los domingos a la 01:00 (`0 4 * * 0`), después del sábado a la noche. Próximos estrenos tiene un workflow independiente todos los días a la 01:00 (`0 4 * * *`), que excluye películas con fecha de estreno igual o anterior al día de ejecución en Argentina. Cada uno valida y publica sólo su snapshot; si falla, conserva su edición publicada.
- `deploy.yml` sólo construye/publica el contenido versionado. Corre por push a `main`, manualmente o al finalizar exitosamente un actualizador. No consulta feeds, no regenera ediciones ni tiene un cron diario redundante.
- `validate.yml` valida contenido, ediciones, pósters locales, seguridad y Chromium en cada PR y los lunes. La matriz completa de navegadores es manual (`full_e2e`); el audit completo de contenido se solicita con `full_content_audit`.
- La publicación diaria en X se conserva: Actions agenda en Buffer a las 18:30 AR para publicar a las 19:00 AR; no modifica películas ni ediciones.
- Antes de publicar una carga, rebaseá sobre `origin/main` para conservar las ediciones del bot. `validate:content` bloquea diffs que mezclen películas con cambios en esos snapshots. No uses la actualización de trailers como paso de carga.
- GitHub puede demorar los cron. Los horarios indican el disparo solicitado; publicación y disponibilidad pública llegan después de la validación y el deploy.
- La arquitectura, responsabilidades, recuperación y pruebas están en [`docs/home-automation.md`](docs/home-automation.md).
- `skills/` es la fuente versionada de las skills de Cine Posta. Después de modificarlas, ejecutá `node plugins/la-posta-cine/scripts/sync-from-repo.mjs`; usá `--install` cuando también corresponda actualizar la instalación local. Validá las tres copias antes de publicar.
