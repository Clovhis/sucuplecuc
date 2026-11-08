# Buscador local de CinePosta

Funciona en Astro y en el navegador con MiniSearch y reglas deterministas. No usa IA, embeddings, servicios pagos, cuentas nuevas ni un servidor de búsqueda. MiniSearch es la única biblioteca agregada por el buscador. La auditoría de producción actualizó el runner Playwright/WebKit y la dependencia transitiva `qs`.

## Datos, títulos y altas semanales

Cada build toma **todas** las películas de `src/data/movies/*.json`. Título, original, dirección, reparto, taxonomía, plataformas y Score CinePosta entran automáticamente. No hay una lista cerrada de películas en el motor ni es necesario agregar un alias para que una nueva ficha aparezca.

`src/data/movie-search-aliases.json` contiene únicamente nombres adicionales, con slug, año, región del metadato y URL de evidencia. Es independiente de `movie-aliases.json`, que conserva sus alias de rutas. No se modifican títulos visibles, películas, personas, puntajes, disponibilidad ni URLs canónicas.

La auditoría revisó los títulos y originales de las 2.574 fichas. Encontró 1.080 con título y original equivalentes, y ninguna sin original. La primera investigación seleccionó 250 películas: 227 coincidencias inequívocas por nombre conocido y año original exacto, y 23 casos pendientes. La auditoría final revisó esos 23: incorporó 16 nombres para 14 películas y dejó nueve sin alias adicionales comprobados. No se afirma haber completado la investigación regional de todo el catálogo.

El total es de 137 nombres adicionales para 129 películas. Las versiones AR, ES, US y los originales provienen del mismo nodo Movie de JustWatch o de fichas verificadas de Apple TV Argentina y Cines Argentinos. La región identifica la procedencia del nombre; no convierte un título español en nombre de distribución argentino. Se confirmaron, entre otros, Boyhood: Momentos de una Vida, Una pareja despareja, El camino de los sueños y Actividad paranormal. Los homónimos y conflictos entre año original y estreno comercial están documentados en [las 23 resoluciones](../reports/search-production-audit-2026-11-08/title-resolutions.json); no se corrigieron años ni títulos canónicos para forzar coincidencias. La evidencia del primer relevamiento se conserva en `reports/search-optimization-2026-11-07/`.

Flujo opcional después de una carga semanal:

```powershell
# Comprobación local de referencias; no consulta servicios.
npm run audit:search-titles -- --check

# Enriquecer sólo incorporaciones de los últimos 14 días.
npm run audit:search-titles -- --recent-days 14
```

El enriquecimiento es aditivo: conserva los alias anteriores, reutiliza respuestas verificadas del mismo reporte y deja sin incorporar coincidencias dudosas. El build y la publicación nunca ejecutan consultas remotas. No se exige cobertura regional completa ni se bloquean altas nuevas por carecer de alias. Las pruebas incluyen una película nueva que entra por título y original sin tocar el intérprete.

## Arquitectura y rendimiento

1. `createHomeMovieRecord` arma los registros desde los datos canónicos y agrega los alias cuyo slug **y año** coinciden.
2. `home-search-codec.ts` codifica un JSON versionado: filas de campos conocidos y un diccionario de presentaciones de cards repetidas. No transmite nuevamente título y metadata normalizados; el cliente los deriva una vez. La aplicación sigue trabajando con objetos con nombres de campos. El decodificador también lee el formato anterior para snapshots y pruebas.
3. `home-search-data.ts` genera `search-index-v2.json` y su versión hash. `search-index.json` conserva el array anterior para páginas cacheadas y herramientas existentes; la home nueva sólo descarga la versión compacta. El cliente descarga y decodifica una vez, y no vuelve a serializar el catálogo dentro del DOM. Antes se retenía allí otra cadena de aproximadamente 3,5 millones de caracteres.
4. MiniSearch indexa sólo títulos, originales, alias, dirección y reparto. La sinopsis sigue disponible para coincidencias **literales**, y para términos literales combinados cuando no hay resultados de títulos o créditos. Se eliminó el índice fuzzy de sinopsis para reducir memoria y resultados incidentales.
5. El índice se prepara en bloques de 200 registros. Las doce fichas iniciales permanecen renderizadas en HTML y utilizables mientras se habilitan los controles. Se mantienen páginas de 36 cards, seis sugerencias, debounce de 175 ms y cancelación de consultas obsoletas.
6. Las métricas de fetch, decodificación y construcción quedan en User Timing (`cineposta:index-*`). No se muestran detalles técnicos en la interfaz.

Las fichas, el catálogo completo y las rutas de SEO siguen generándose del lado del build. Reducir el payload del buscador no elimina contenido indexable ni cambia sitemap o canónicas. Los tests comparan la lista del índice con las rutas canónicas del sitemap.

La elección original de [MiniSearch](https://lucaong.github.io/minisearch/) sigue vigente por su índice local, AND entre términos, prefijos y ponderación. [Fuse.js](https://www.fusejs.io/fuzzy-search.html) y [FlexSearch](https://github.com/nextapps-de/flexsearch) son alternativas válidas; cambiar de biblioteca no era necesario para quitar duplicaciones e indexación innecesaria. No se realizó un benchmark comparativo entre bibliotecas.

## Precisión e interpretación

La batería versionada en `scripts/search-acceptance-cases.mjs` contiene **107 consultas**. Para títulos se exige el resultado esperado en primer lugar; para facetas y personas se compara el conjunto completo con predicados sobre metadatos canónicos, independientes del parser. Los casos vacíos deben devolver cero. No es una estimación de precisión sobre cualquier consulta posible.

El MVP anterior aprobó 68/107 y la versión auditada 107/107. El detalle por consulta está en `reports/search-production-audit-2026-11-08/queries-before.json` y `queries-after.json`. Incluyen títulos en español e inglés, originales no latinos, errores, actores y directores, décadas, puntajes, plataformas, negaciones simples y combinaciones. El primer experimento de 85 consultas se conserva como evidencia histórica.

Cambios de precisión:

- Un título conocido busca en títulos, originales y alias: Alien no coincide por accidente con valiente ni Psycho con una etiqueta psicológica. Los fragmentos amplios siguen teniendo búsqueda literal. Títulos y alias exactos antes de menciones en sinopsis; los alias cortos cercanos ganan sobre títulos largos que comparten una palabra en búsquedas aproximadas.
- Conservación de letras no latinas: una consulta desconocida ya no desaparece y devuelve todo el catálogo. También permite buscar originales como パプリカ o 紅の豚 cuando constan en los metadatos.
- Años explícitos (`año 1984`), décadas escritas (`los ochenta`) y títulos numéricos conocidos.
- Comparaciones estrictas e inclusivas: `más de 8` exige 9 o 10; `al menos 8` incluye 8. Las películas sin puntaje nunca satisfacen restricciones numéricas.
- Los límites acumulados de años y puntajes se intersectan: `de los 80 antes de 2000` conserva 1980–1989. Una condición posterior no amplía la anterior; las contradicciones devuelven cero y una interpretación visible de límites incompatibles.
- `sin` y `excepto` para géneros, subgéneros y plataformas conocidos. No es un lenguaje booleano arbitrario.
- La disponibilidad y el resto de restricciones se aplican también antes de decidir si hace falta fuzzy; una coincidencia en otra plataforma no impide corregir una errata dentro del conjunto solicitado.
- Los nombres reconocidos se contrastan con créditos. Los roles explícitos no pueden armar una persona combinando el nombre de un actor y el apellido de otro.
- `de Spielberg` puede interpretarse como dirección cuando los créditos de dirección dominan claramente en el catálogo. Para personas con doble rol se conserva una filmografía más amplia; `director`, `dirigida por`, `actor`, `actriz` o `protagonizada por` desambiguan.
- Las comillas conservan frases literales y protegen números/facetas dentro de títulos. Los títulos conocidos toleran variaciones de puntuación.

Las facetas mantienen OR dentro de un grupo y AND entre grupos. Lo escrito en la consulta se intersecta con los filtros manuales. Los géneros respetan el carril principal de los controles existentes; Musical conserva su excepción de género secundario. Culto, cine nacional y demás selecciones editoriales siguen su contrato de filtro separado.

## Experiencia de usuario

La explicación muestra etiquetas legibles y límites como `Score ≥ 9`, `1980–1989`, `Anterior a 2000` o `Sin Gore`. Las sugerencias explican un alias cuando difiere del título de la ficha y toleran una errata en nombres de perfiles. No muestran perfiles que contradigan una consulta restringida por plataforma o género.

Una leyenda pequeña de “Búsqueda inteligente” se integra al borde de la barra, con el acento editorial existente y descripción accesible. No ocupa ancho de escritura ni agrega recursos externos. Las consultas recibidas por URL o sesión respetan el mismo límite de 300 caracteres que el campo.

El estado vacío distingue una consulta sin coincidencias de una búsqueda cuyos resultados fueron excluidos por controles manuales. El botón permite quitar esos controles **conservando la consulta**, o volver a editarla. Al editar se desplaza el campo a la vista y se enfoca: Safari puede conservar el foco anterior aun cuando el campo quedó fuera de pantalla. No se relajan restricciones automáticamente. Se conservaron Escape, navegación por teclado, limpieza, URLs compartibles, sesión, historial y retorno desde fichas. Los cambios de estilos están limitados al buscador.

Si no hay pósters pendientes, el indicador de carga se oculta inmediatamente. Se eliminó una espera artificial de 120 ms que desplazaba el botón de recuperación durante un click en Firefox. Una prueba observa que el estado vacío nunca se ofrece debajo de esa fila de carga; reprodujo el defecto antes de corregirlo.

## Medición reproducible

```powershell
npm run test:movie-search
npm run check
npm run build
npm run test:search-acceptance

node --expose-gc --experimental-strip-types scripts/profile-search-engine.mjs --output .astro/search-engine-current.json
node scripts/preview-e2e.mjs --host 127.0.0.1 --port 43214
# En otra terminal:
node scripts/profile-search-browser.mjs --output .astro/search-browser-current.json

npx playwright test tests/e2e/intelligent-search.spec.ts tests/e2e/search-performance.spec.ts tests/e2e/filter-combos.spec.ts tests/e2e/home-index-loading.spec.ts tests/e2e/mobile-ux.spec.ts --project=mobile-chromium --project=mobile-webkit --workers=1
```

Para repetir el antes/después en este workspace se conservó la versión inicial bajo `.astro/search-baseline/`: motor, tipos, filtros, JSON y HTML/assets compilados. Es una captura local ignorada por Git; eliminar caches puede borrarla. Los comandos del motor aceptan `--engine` y `--index`; el perfil del navegador acepta `--snapshot .astro/search-baseline` y la misma estructura para el después. Los hashes de entrada y resultados quedan en el reporte comparativo.

Se usan tres procesos Node nuevos por tamaño, GC explícito y el mismo catálogo. `heapUsed` mide heap de V8, no RAM total del sistema. La carga y el índice se miden separados de las consultas; se descarta el calentamiento. Los 10.000 registros repiten documentos con IDs diferentes, por lo que no representan 10.000 películas ni vocabulario único.

Los navegadores usan tres contextos nuevos por motor, emulación Pixel 5/iPhone 13, el mismo servidor local y las mismas restricciones de recursos. Se bloquean imágenes y recursos externos en ambos lados para aislar el buscador. Chromium aporta heap post-GC vía CDP; WebKit no expone una medición equivalente y se deja `null`. No se infiere ausencia de Long Tasks cuando la API no existe. Los tiempos no simulan una red móvil y no corresponden a teléfonos físicos.

Resultados del primer experimento del 7 de noviembre sobre las mismas 2.574 películas (medianas de tres ejecuciones; bytes decimales):

| Métrica | Antes | Después |
| --- | ---: | ---: |
| JSON sin comprimir | 3.503.381 B | 2.390.021 B |
| JSON gzip | 764.201 B | 663.665 B |
| JSON Brotli | 532.224 B | 481.091 B |
| Datos + índice, heap Node post-GC | 29.062.056 B | 16.179.800 B |
| Sólo índice, heap Node post-GC | 17.142.576 B | 11.519.464 B |
| Construcción del índice Node | 188,29 ms | 193,82 ms |
| Mediana de medianas por consulta Node | 0,2604 ms | 0,2916 ms |
| Buscador listo, Chromium mobile emulado | 394,5 ms | 314,2 ms |
| Heap Chromium post-GC | 18.445.208 B | 12.021.740 B |
| Buscador listo, WebKit mobile emulado | 620 ms | 494 ms |
| Copia JSON retenida en DOM | 3.483.884 caracteres | 0 |
| Consultas de aceptación correctas | 64/85 | 85/85 |

La mejora principal es de memoria, transferencia y disponibilidad inicial; no se afirma una aceleración de cada consulta ni de la construcción. El costo mediano de consulta aumenta 0,0312 ms con las reglas adicionales. La prueba sintética de 10.000 registros pasa de 53.005.360 a 25.189.608 B de heap total, con construcción de 789,69 a 784,73 ms. Los reportes conservan las muestras, versiones, hashes y consultas individuales en `reports/search-optimization-2026-11-07/`; `comparison.json` es la comparación calculada, no una estimación de hardware físico.

## Historial de validación y auditoría final

- 12 pruebas unitarias y 85/85 consultas de aceptación aprobadas.
- `astro check`: 360 archivos, cero errores, advertencias o hints. Build aprobado: 8.635 páginas. Salida pública y sitemap aprobados: 6.052 páginas canónicas.
- Paridad de las 2.574 películas: mismos campos, salvo los alias y su texto buscable; el endpoint anterior conserva su contrato y coincide con el nuevo decodificado.
- Chromium: 46 pruebas desktop y 50 mobile aprobadas; 12 omisiones explícitas por tipo de dispositivo. Sin errores globales ni reintentos.
- WebKit mobile: 50 casos con aserciones aprobadas y cuatro omisiones por dispositivo. **La ejecución completa no es limpia**: dos bloques terminaron con código 1 porque sus workers no cerraron dentro de 300.000 ms, después de aprobar sus casos. Se repitieron en procesos aislados y sin grabación de video; el bloqueo de cierre persistió en esos bloques. No se relajaron aserciones ni timeouts de la aplicación. La causa exacta del cierre queda pendiente.
- Capturas revisadas a 320 px en ambos motores; los tests comprueban también 390 y 430 px, sin desborde y con controles táctiles de al menos 44 px.
- DEV verificado con Chromium mobile emulado en `http://127.0.0.1:43211/`: alias argentino, década/género y persona/plataforma, sin errores de página. El arranque en frío de Astro requirió preparar los módulos del catálogo antes de responder; esta demora de DEV no se mezcla con las mediciones estáticas del navegador.

Ese primer pase quedó documentado en `reports/search-optimization-2026-11-07/validation.json`; sus fallas de cierre son históricas y no se borraron. La auditoría de producción posterior está en `reports/search-production-audit-2026-11-08/`: reproduce el cierre de WebKit 26.4/Playwright 1.60, actualiza a WebKit 27.2/Playwright 1.65 y verifica el cierre normal con las mismas aserciones y opciones habituales, sin desactivar videos ni reducir timeouts para dar una prueba por aprobada.

También se aisló un falso positivo del debugger de Firefox: una excepción capturada dentro de un callback nativo de Web Locks se informa como `pageerror`, aunque no produce eventos `error` ni `unhandledrejection`. La navegación ahora observa esos eventos reales del navegador mediante un helper probado con una excepción sin capturar y una promesa rechazada deliberadas. No se filtran mensajes por nombre ni se modifican los locks de Supabase. Los resultados finales, las repeticiones y las capturas corresponden al artefacto auditado y están separados de esos diagnósticos.

El smoke del pie espera la señal existente de catálogo listo antes de desplazarse al desplegable. Los eventos demostraron que la galería de personas, que se completa durante la carga, podía mover el destino entre `pointerdown` y `pointerup`; también se reprodujo en el snapshot anterior. Se conservaron el click y todas las aserciones, y se repitió 20 veces. No se cambió el pie ni se afirma eliminada esa variación de altura durante la carga inicial.

## Límites pendientes

La gramática y los sinónimos son acotados; no hay comprensión semántica de tramas ni intenciones subjetivas. `vieja`, `antigua` y `clásica` usan el corte visible anterior a 2000, sin afirmar calidad editorial. Personas con doble rol o apellidos compartidos pueden requerir un nombre completo y un rol explícito.

Los alias regionales se enriquecieron para una selección, no para cada película del catálogo. Los 23 pendientes originales fueron revisados; nueve no aportaron nombres nuevos respaldados por las fuentes. El relevamiento regional completo continúa siendo una tarea de catálogo. El buscador no traduce ni inventa nombres y no extrae alias de reseñas. La plataforma refleja lo registrado en Argentina, sin verificación en vivo ni distinción nueva entre alquiler y suscripción.

El índice completo sigue cargándose en memoria y crece con las incorporaciones. Las mediciones de estrés y emulación no garantizan el comportamiento de hardware lento ni sustituyen una prueba en teléfonos físicos.
