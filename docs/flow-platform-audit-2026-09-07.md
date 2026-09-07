# Auditoría de disponibilidad en Flow Argentina

Fecha de corte: 2026-09-07 (America/Buenos_Aires). Alcance: las 2.113 películas de `src/data/movies/*.json`.

## Resultado

Se encontraron 10 coincidencias exactas de título y año con el catálogo argentino de Flow informado el 2026-09-05:

| Película | Año | Evidencia de catálogo Flow | Datos conservados |
| --- | ---: | --- | --- |
| Carancho | 2010 | On demand sin cargo | Disney Plus + Flow |
| El Ángel | 2018 | Catálogo Flow | Flow |
| El cuento de las comadrejas | 2019 | Segmento premium | Flow |
| El hombre de al lado | 2009 | On demand sin cargo | Disney Plus + Flow |
| El robo del siglo | 2020 | Segmento premium | Flow |
| La ciénaga | 2001 | On demand sin cargo | Prime Video + Flow |
| La odisea de los giles | 2019 | Segmento premium | Disney Plus + Flow |
| Las buenas intenciones | 2019 | Catálogo Flow | CINE.AR + Flow |
| Mundo grúa | 1999 | Catálogo Flow | Netflix + Flow |
| Un oso rojo | 2002 | On demand sin cargo | HBO Max + Flow |

Las siete fichas que ya tenían una plataforma concreta conservan esa información y agregan Flow como segunda oferta. En las otras tres, `Flow` reemplaza el fallback `Otras plataformas` porque la evidencia específica de Flow es más precisa. No se eliminó ni se modificó el soporte de DGO: sus películas siguen pudiendo resolverse mediante `Otras plataformas` en el filtro destacado.

## Criterio y fuentes

- [Flow oficial de Personal](https://www.personal.com.ar/flow): confirma que Flow ofrece televisión, streaming y contenido bajo demanda en Argentina.
- [Relevamiento argentino de títulos nacionales disponibles en Flow](https://barilochemas.com.ar/el-angel-y-toxico-entre-los-nuevos-filmes-nacionales-de-flow/), publicado el 2026-09-05: aporta la lista título por título y separa catálogo general, segmento premium y on demand sin cargo.
- [JustWatch Argentina](https://www.justwatch.com/ar/peliculas): se consultó como índice comparativo. Flow no aparece como proveedor indexado allí, por lo que una ausencia en JustWatch no se tomó como evidencia contra Flow.
- [Lanzamientos de Flow de septiembre de 2026](https://www.otroscines.com/post/todos-los-lanzamientos-de-flow-en-septiembre-2026): se usó como control de vigencia; no se incorporaron títulos con disponibilidad futura, ventana promocional vencida o alquiler temporal sin confirmación actual.

La página pública de Flow redirige al acceso de usuario para consultar el catálogo autenticado. Por eso el lote se limitó a títulos con comunicación específica para Argentina vigente a la fecha de corte; no se infirió disponibilidad a partir de bundles de HBO, Paramount+, Disney+ o Netflix dentro de Flow.

## Reproducción y validación

```text
npm run catalog:movies
npm run validate:content -- --all --astro-check
npm run catalog:movies:check
node skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --candidate <cada ficha Flow> --skip-youtube
npx playwright test tests/e2e/filter-combos.spec.ts --project=desktop-chromium --project=mobile-chromium
npx playwright test tests/e2e/mobile-ux.spec.ts --project=mobile-chromium
```

Resultado: `validate:content` pasó con advertencias heredadas; `catalog:movies:check` pasó; la auditoría explícita pasó para las 10 fichas; el E2E del filtro pasó con 37 pruebas y 1 skip esperado; la regresión mobile pasó con 5 pruebas y 1 skip esperado.
