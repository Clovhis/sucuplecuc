# Política de biografías de personas

`src/data/personProfiles.ts` conserva `biography` sólo como material histórico o importado de referencia. No es un campo publicable.

El render público usa exclusivamente `editorialBiography` y sólo cuando `editorialStatus` es `approved`.

Estados posibles:

- `approved`: texto original de Cine Posta, revisado manualmente, con fuentes específicas. Puede indexarse, aparecer en el sitemap y cargar anuncios.
- `pending`: la ficha tiene o puede tener material heredado, pero espera investigación y redacción editorial. Sigue navegable, con `noindex, follow`, fuera del sitemap y sin anuncios.
- `informational`: ficha estable de datos verificables, premios y filmografía interna sin biografía editorial. También es `noindex, follow`, queda fuera del sitemap y sin anuncios.

## Cómo aprobar una biografía

1. Conservá `biography` intacto como registro histórico; no lo parafrasees ni lo copies a `editorialBiography`.
2. Investigá fuentes concretas y agregalas a `referenceUrls`; deben aparecer en la página.
3. Escribí `editorialBiography` desde cero, con hechos que puedan comprobarse y una mirada editorial propia. No alcanza una longitud mínima ni un reemplazo de sinónimos.
4. Marcá `editorialStatus: 'approved'` sólo después de una revisión humana de originalidad, exactitud, valor editorial y fuentes.
5. Ejecutá `npm run audit:profile-originality -- --require-dist`, `npm run check`, `npm run build` y las pruebas pertinentes.

La validación bloquea el render de `biography`, la inclusión accidental de fragmentos heredados en la salida construida y cualquier perfil no aprobado que quede indexable, en sitemap o con el cargador de anuncios.
