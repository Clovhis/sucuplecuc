# Guía de trabajo del repositorio

## Alcance y fuentes de verdad

- Las películas viven en `src/data/movies/*.json`; no edites el catálogo derivado a mano.
- Cine Posta está orientado a público argentino. Toda etiqueta `releasePlatform` / `releasePlatforms`, fecha de estreno, cartelera y título localizado debe describir la disponibilidad vigente en Argentina, nunca la de Estados Unidos, España u otro mercado.
- `docs/movie-catalog-reference.md` y `docs/person-profile-catalog-reference.md` se regeneran con sus scripts.
- `src/data/people.json` centraliza los datos de personas y `src/data/personProfiles.ts` contiene los perfiles extensos.
- `src/data/upcomingReleases.generated.ts` es generado: actualizalo con `npm run update-upcoming-releases` y versioná el resultado.
- No agregues secretos, credenciales administrativas ni service-role keys. Las variables esperadas están en `.env.example`.

## Flujo mínimo de cambios

1. Conservá la taxonomía existente: `category` es el carril principal; `genres` y `subgenres` agregan señales secundarias.
2. Para altas o cambios de películas, corré `npm run validate:content`; actualiza los catálogos derivados si corresponde.
3. Para UI o scripts de navegador, corré `npm run check`, `npm run build` y la suite Playwright pertinente.
4. No cambies categorías sólo para activar un medidor editorial; priorizá la clasificación correcta. Las señales de medidores ocultos por género secundario son informativas: consultá `docs/content-audit-policy.md` antes de modificar una categoría.
5. Las reseñas y biografías deben ser originales, específicas, en español rioplatense y sin citar agregadores ni usar texto de fuentes como copia publicada.
6. Antes de publicar o cambiar una plataforma, verificá la disponibilidad legal en AR en la fecha de trabajo: primero JustWatch AR y luego la página oficial argentina de la plataforma cuando haga falta confirmar. Guardá la URL y el dato comprobado en el reporte de la tarea.
7. No inferir una plataforma por el estudio, la franquicia, una ficha global ni un enlace que redirige a otro país. Priorizá suscripción (`FLATRATE`); si sólo hay alquiler/compra legal en AR, se puede usar ese proveedor, dejando explícito que es transaccional. Si no hay evidencia AR vigente, usá `Otras plataformas` y no combines esa etiqueta con otra.

## Automatización

- Cada PR valida contenido, build, dependencias productivas y e2e en Chromium.
- La cobertura completa de navegadores corre semanalmente o con `workflow_dispatch` y `full_e2e`.
- Los próximos estrenos se actualizan en un PR automatizado; el deploy sólo publica lo ya versionado en `main`.
