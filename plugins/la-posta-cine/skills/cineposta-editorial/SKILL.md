---
name: cineposta-editorial
description: Crear y editar editoriales, notas, especiales y columnas de opinión de CinePosta a partir de las ideas del usuario, con voz rioplatense, imágenes narrativas verificadas e integración con home, sección editorial y fichas.
---

# CinePosta Editorial

La columna `src/data/editorials/resident-evil-noche-cero-la-veria-99-veces.json` es la referencia aprobada por el usuario para voz, ritmo y relación entre texto e imágenes. Consultala cuando necesites calibrar el resultado: conservá el criterio, sin copiar sus frases ni repetir sus opiniones en otras películas.

## Voz y criterio

Convertí las ideas del usuario en una columna original con una idea central, un arranque que enganche, desarrollo fluido y un cierre que deje una reflexión. Usá primera persona cuando expreses su opinión. Lenguaje simple, natural y coloquial rioplatense; expresiones argentinas sólo cuando salgan solas. Evitá lenguaje académico, poses de crítico profesional, frases genéricas de IA y enumerar las ideas recibidas. Pocos o ningún subtítulo: debe sentirse como una columna, no como una review por secciones.

Transmití la experiencia que el usuario contó sin inventarle recuerdos, reacciones físicas, anécdotas de sala, escenas ni opiniones nuevas. No conviertas una preferencia personal en consenso crítico. Verificá datos externos; las fuentes no son texto para copiar. No hace falta reconstruir la trama. Evitá spoilers fuertes por defecto; si se solicitan, marcá `spoilers: true`.

Apuntá por defecto a unos cinco minutos: aproximadamente 950–1100 palabras a 220 palabras/minuto. La duración es una estimación calculada desde el cuerpo; no rellenes para alcanzar una cifra. Respetá otra duración indicada. Firma predeterminada: CinePosta, salvo autor indicado por el usuario.

## Imágenes que cuentan

Para cinco minutos elegí aproximadamente 4–6 imágenes intercaladas. Primero decidí qué idea cercana acompaña cada imagen; después ubicála al terminar ese bloque. No uses cuotas de párrafos ni cortes una idea para insertar una foto. Texto e imágenes deben contar juntos la misma historia.

Preferí stills y promoción oficiales o capturas apropiadas de trailers oficiales. Verificá película, año, fuente y contenido mirando cada imagen. Nunca generes escenas con IA ni uses otra adaptación de la franquicia. No inventes un guiño, monstruo o identidad para justificar una foto. Si no hay material verificable, informá el faltante concreto; no sustituyas silenciosamente por pósters repetidos o decoración.

Conectá visualmente cada elección: recorrido/punto de vista para sensación de videojuego; escenario/iluminación para tensión; criatura para diseño; personaje para actuación. No reveles desenlaces o sorpresas fuertes sin autorización de spoilers. Escribí `alt` descriptivo de lo que realmente se ve, sin adivinar. `caption` y `source` son opcionales en el modelo; conservá siempre la procedencia comprobada en el reporte y preferí un enlace visible a la fuente. Una atribución no equivale a una licencia: no afirmes permisos que no comprobaste.

Guardá WebP locales en `public/assets/editorial/<slug>/`, con variantes de 640 y hasta 1280 px sin ampliar el original. Conservá proporción y dimensiones reales; revisá calidad y peso. El componente existente usa srcset, sizes, width/height y lazy loading en imágenes interiores. No alteres escenas, colores o encuadres para aparentar otro contenido.

## Integración y modelo

Antes de editar revisá `AGENTS.md`, `src/lib/editorial.ts`, `src/components/Editorial*.astro`, `src/pages/editorial/`, home y ficha. Reutilizá layout, tokens y componentes. Publicaciones: `src/data/editorials/*.json`, separadas de reseñas y Score CinePosta.

Cada JSON tiene `slug`, `title`, `excerpt`, `author`, `date` (YYYY-MM-DD), `type` (`editorial`, `nota`, `especial`, `opinión`), `tags`, `featured`, `cover`, `content` y opcionalmente `movieSlug` y `spoilers`. El loader deriva `readingTime` desde los párrafos. `content` es una secuencia de `{type: "paragraph", text}` y `{type: "image", src, alt, width, height, srcSmall?, caption?, source?}`. `cover` usa el mismo objeto de imagen sin `type`. Rutas de assets relativas a public, sin barra inicial. No HTML libre. Consultá el esquema vigente para detalles.

Comprobá `movieSlug` contra el catálogo real: el loader y los componentes vinculan automáticamente editorial → ficha y ficha → editorial. `/editorial/` mezcla los cuatro tipos y muestra todas las publicaciones de la más reciente a la más antigua, con desempate por slug. “Desde CinePosta” muestra hasta seis publicaciones, prioriza destacados y luego recientes, y enlaza al archivo con “Todas las publicaciones”; no copies datos manualmente entre estas superficies. Título con gancho, bajada específica, tags útiles y fecha real de trabajo. No toques reseñas, score, metadata, categorías ni disponibilidad por escribir una opinión.

Para cada nueva publicación reutilizá `EditorialCard.astro` y `EditorialHighlights.astro`: el diseño aprobado usa tarjetas oscuras con alturas naturales, portada 16:9, firma, tipo, bajada, fecha, lectura estimada y “Leer nota”. La home tiene tres columnas en escritorio, dos en tablet y una en móvil; el archivo conserva una grilla en orden de fecha. Los títulos de las tarjetas usan Archivo (`var(--font-sans)`), peso 500, tamaño de 1.25–1.5 rem e interlineado 1.3. Conservá esa tipografía y los estilos compartidos al cargar notas; no restaures la serif ni la negrita pesada salvo pedido del usuario. Comprobá que la portada siga siendo reconocible con el recorte de la tarjeta en escritorio y 320 px, y mantené sus variantes responsive, dimensiones reales y carga diferida. Estos criterios describen las tarjetas, no prescriben la tipografía del cuerpo de las notas.

## Verificación y entrega

Leé la columna entera en voz natural, comprobá fidelidad a las ideas, ritmo, extensión, spoilers y relación de cada imagen con sus párrafos. Corré `npm run check`, `npm run build` (un build a la vez) y `npx playwright test tests/e2e/editorial.spec.ts --project=desktop-chromium --project=mobile-chromium`. Revisá visualmente desktop y 320 px, navegación en ambos sentidos, home, cards, fechas, fuentes, imágenes decodificadas y ausencia de overflow.

Verificá que la nueva nota aparezca en `/editorial/` en su lugar por fecha, aunque quede fuera de las seis tarjetas de la home. No fijes en los tests el total del archivo: comparalo con las publicaciones disponibles. Si cambiás el layout de las tarjetas, comprobá también el enlace al archivo, el foco visible y la apertura por teclado; agregá una revisión en WebKit cuando afecte las columnas o el comportamiento responsive.

Crear o probar en DEV autoriza edición y validación local; no implica push, deploy ni publicaciones sociales. Si se pide publicar, seguí el flujo vigente de publicación del repositorio y verificá el SHA desplegado y las rutas públicas. No vuelvas a pedir una autorización ya otorgada. Entregá URL de revisión y resultado real de los checks, con cualquier faltante.

La fuente versionada de esta skill está en `skills/cineposta-editorial/`. Después de cambiarla ejecutá `node plugins/la-posta-cine/scripts/sync-from-repo.mjs --install` para sincronizar el plugin y la instalación local de Codex, y validá las tres copias y su paridad.
