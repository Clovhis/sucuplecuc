# Auditoría UX/UI mobile y preparación para AdSense — 2026

Fecha: 19 de julio de 2026

Branch: `audit/mobile-ux-adsense-2026`

Alcance: sólo teléfonos. No se evaluó ni se propone rediseñar la experiencia desktop.

## Veredicto ejecutivo

El sitio tiene una identidad visual fuerte, una buena base semántica y un portrait estable en 320–390 px, pero **todavía no conviene activar toda la carga automática de AdSense en mobile**. Antes del lanzamiento hay que resolver cuatro bloqueos:

1. En WebKit/iPhone horizontal (844 × 390), la portada activa contenido desktop y el documento llega a 1669 px de ancho. El `overflow-x: hidden` oculta parte del problema, pero la interfaz queda cortada.
2. La primera pantalla está sobrecargada antes de llegar al contenido que responde a la intención del usuario. El aviso de Cafecito, el header, promociones y héroes altos compiten por altura con un futuro anchor ad y con el mensaje de consentimiento.
3. Hay controles recurrentes debajo de los mínimos de Apple/Android: Cafecito mide 32 px de alto; acciones de página, flechas de carrusel y reacciones quedan en 36–41 px; las estrellas miden aproximadamente 23 × 26 px. Apple recomienda 44 × 44 pt como tamaño estándar y Android 48 × 48 dp.
4. La integración carga el script de Auto ads, pero el repositorio no define una estrategia verificable de formatos, exclusiones, frecuencia, espacios reservados ni protección de navegación crítica. La mayor parte de esa configuración vive en la cuenta de AdSense y no puede auditarse desde el código.

Estado recomendado: **apto para una fase de corrección y experimento limitado; no apto todavía para activar Auto ads sin restricciones**.

## Estado de remediación de la experiencia actual

La corrección mobile de esta etapa quedó implementada en la misma branch, sin activar ni modificar formatos de anuncios. Los hallazgos y mediciones que siguen documentan la línea de base previa al cambio.

Resultado posterior a la implementación:

- 42 escenarios auditados en Chromium/Android y WebKit/iPhone;
- cero desbordes horizontales, incluidos 844 × 390 en landscape;
- cero errores de consola;
- cero controles aislados por debajo del baseline táctil de 48 × 48 CSS px (los enlaces de texto corrido se evalúan como texto, no como botones);
- `npm run check` sin errores, warnings ni hints;
- build estático completo de 3329 páginas;
- suite mobile completa: 52 de 52 pruebas aprobadas.

Se compactaron Cafecito, header y héroes; se elevó la legibilidad de microcopy funcional; se redujo el dominio del póster en la primera pantalla; y se agregó un modo de teléfono landscape que refluye el contenido en vez de recortarlo. La estrategia de AdSense queda deliberadamente postergada hasta que Google habilite el serving definitivo.

## Metodología y evidencia

Se probaron Chromium mobile y WebKit mobile con 14 tipos de ruta representativos:

- portada;
- ficha de película;
- recuperación de trailer;
- índice y ficha de personas;
- Postómetro / “Qué vemos hoy”;
- comunidad y discusión;
- metodología, sobre el sitio, política editorial, fuentes, contacto y privacidad.

La matriz incluyó 390 × 844, 320 × 568 y 844 × 390. Se registraron overflow, targets táctiles, tipografía muy pequeña, elementos fixed/sticky, dimensiones de imágenes, errores de consola y capturas en dos posiciones de scroll.

Resultados:

- 42 escenarios propios completados: 21 en Chromium y 21 en WebKit.
- 84 capturas generadas: superior y media por escenario.
- Sin overflow horizontal en portrait a 320 o 390 px en las plantillas probadas.
- Overflow reproducible sólo en portada WebKit a 844 × 390: 1669 px de documento contra 844 px de viewport.
- La suite mobile existente terminó con 49 pruebas aprobadas y una fallida en WebKit por precisión subpíxel: 43.9998779 px frente a una expectativa exacta de 44 px. Esa falla no explica los targets realmente pequeños hallados por esta auditoría.

El test reproducible quedó en `tests/e2e/mobile-site-audit.spec.ts`. Sus resultados y capturas se generan bajo `test-results/mobile-site-audit/` y no se versionan.

## Scorecard mobile

| Área | Estado | Lectura |
| --- | --- | --- |
| Reflow portrait 320–390 px | Bueno | No hubo overflow horizontal en las plantillas relevadas. |
| Landscape de teléfono | Bloqueante | La portada entra en composición desktop y queda cortada en WebKit. |
| Identidad y consistencia visual | Bueno | Sistema oscuro, acentos y componentes reconocibles. |
| Jerarquía de la primera pantalla | Débil | Demasiado espacio antes de búsqueda, título o contenido editorial principal. |
| Ergonomía táctil | Insuficiente | Varios controles están por debajo de 44/48 px. |
| Legibilidad | Insuficiente | Hay texto visible entre 9.6 y 11.8 px; es demasiado pequeño para mobile moderno. |
| Navegación y semántica | Buena base | Landmarks, skip link, labels y headings están mayormente bien resueltos. |
| Movimiento | Bueno | Existe tratamiento para `prefers-reduced-motion`. |
| AdSense técnico | Parcial | Script, publisher ID, `ads.txt` y privacidad existen; falta estrategia de serving mobile. |
| Riesgo CLS con anuncios | Alto | No hay slots propios con espacio reservado ni una prueba con creatividades reales. |
| Consentimiento | No verificable | La política lo menciona, pero el mensaje/CMP depende de la cuenta de AdSense. |

## Hallazgos priorizados

### P0 — Bloqueantes antes de activar anuncios

#### 1. El breakpoint por ancho confunde iPhone landscape con desktop

La portada oculta sus bloques mobile en `max-width: 720px`, pero un teléfono horizontal moderno puede superar ese ancho CSS. En WebKit a 844 × 390 aparecen el catálogo/archivo desktop y grillas que requieren aproximadamente el doble del viewport.

Impacto:

- contenido cortado y navegación lateral imposible o escondida;
- riesgo de anuncios insertados dentro de una composición ya desbordada;
- mala señal de calidad en Safari/iOS;
- `overflow-x: hidden` disimula el fallo en lugar de resolver el reflow.

Recomendación: definir el modo teléfono con una combinación de ancho, alto/orientación y capacidad de puntero, o hacer que los bloques desktop sean intrínsecamente reflow-safe. La prueba de aceptación debe incluir 844 × 390 y 915 × 412 en WebKit y Chromium.

#### 2. AdSense no tiene límites o exclusiones auditables desde el repositorio

`BaseLayout.astro` carga Auto ads en todas las páginas indexables salvo las exclusiones explícitas. No existen unidades manuales ni contenedores reservados. Tampoco puede saberse desde el código si están activos banners, anchors, viñetas, ad intents, Multiplex o sus frecuencias.

Impacto:

- Auto ads puede insertar anuncios debajo del header, dentro de filtros, alrededor de trailers o entre piezas que visualmente pertenecen al mismo bloque;
- un anchor puede reducir todavía más la altura útil;
- las viñetas pueden interrumpir “Volver”, “Ir al listado”, resultados de búsqueda o navegación del Postómetro;
- ad intents puede convertir texto editorial en enlaces comerciales y alterar el tono de reseñas o biografías.

Recomendación: no usar la configuración global por defecto. Definir y documentar por tipo de página qué formatos se permiten y qué zonas quedan excluidas.

#### 3. La pila superior deja poco espacio útil para anuncios y consentimiento

El aviso de Cafecito aparece antes del contenido en casi todas las rutas. En portada se suma a un header de tres filas; en película, al aviso y tres acciones antes de un póster vertical; en personas, al aviso, la acción de regreso y un héroe de unas dos pantallas.

Impacto:

- búsqueda, título o contenido editorial quedan por debajo del primer viewport;
- con CMP y anchor ad simultáneos puede quedar una franja mínima de contenido;
- la monetización compite con la propuesta de valor y con la donación.

Recomendación: convertir Cafecito en una invitación compacta y no repetitiva (por ejemplo, una vez por sesión o después de consumir contenido), y reducir los héroes mobile. El usuario debería ver en el primer viewport el propósito de la página y una acción principal.

### P1 — Alta prioridad

#### 4. Targets táctiles por debajo de Apple y Android

Mediciones representativas:

- Cafecito: 186 × 32 px;
- acciones `Volver` / `Ir al listado`: ~41 px de alto;
- flechas de carrusel: ~41 × 41 px;
- botones de reacción: 36 × 36 px;
- estrellas de valoración: ~23 × 26 px;
- enlace externo del trailer: ~111 × 22 px;
- algunos enlaces del footer: 36–40 px de ancho aunque alcanzan 44 px de alto.

Apple usa 44 × 44 pt como tamaño estándar de control en iOS y Android recomienda al menos 48 × 48 dp. Para una web compartida, el baseline seguro es **48 × 48 CSS px para controles aislados**, con separación suficiente para evitar taps accidentales.

#### 5. Tipografía demasiado pequeña

Se detectó texto visible entre 9.6 y 11.8 px en navegación del header, badges, etiquetas, ranks y metadatos. En una pantalla de alta densidad puede verse nítido, pero no necesariamente legible; además, los estilos en mayúsculas y monoespaciados agravan la percepción de tamaño.

Recomendación:

- cuerpo y controles: 16 px como base;
- metadatos: 12–14 px sólo si el contraste y el peso son suficientes;
- acciones del header: no menos de 12 px y preferentemente 13–14 px;
- verificar zoom de texto al 200% sin pérdida de contenido.

#### 6. La ficha de película prioriza el póster sobre el título y el veredicto

En 390 px el póster vertical ocupa casi toda la primera pantalla útil y el título aparece después. Esto retrasa la respuesta a “qué película es y qué opina Cine Posta”.

Recomendación: en mobile mostrar primero título, año, veredicto y resumen breve; usar el póster en formato más compacto o en una composición lateral/parcial. No insertar un anuncio antes de ese bloque editorial primario.

#### 7. La portada demora demasiado el catálogo y los filtros son extensos

La secuencia actual prioriza promoción de comunidad y dos carruseles antes de los filtros/catálogo. La matriz de plataformas consume mucha altura; algunos badges se perciben vacíos o ambiguos cuando el logo no comunica por sí solo.

Recomendación: llevar búsqueda y acceso al catálogo al primer viewport, comprimir filtros en un disclosure/bottom sheet accesible y mantener etiquetas visibles como fallback de cada plataforma. Reservar anuncios sólo entre secciones completas, nunca dentro de la grilla de filtros o del carrusel.

#### 8. “Qué vemos hoy” tiene un héroe mobile excesivamente alto y con espacio vacío

La propuesta es clara, pero el héroe de 39 rem mantiene una gran zona vacía antes del formulario. En teléfonos bajos y landscape genera una distancia innecesaria hasta la tarea principal.

Recomendación: héroe de contenido, no de altura fija; el primer grupo de elección debe asomar en la primera pantalla. Excluir esta ruta de anchors y viñetas durante la interacción o excluir la página completa de Auto ads si su objetivo principal es retención.

### P2 — Media prioridad

#### 9. Imágenes sin dimensiones HTML explícitas

En todas las plantillas hay al menos el logo de Cafecito sin `width`/`height`; las rutas con tarjetas agregan varias imágenes dinámicas sin atributos. Algunos wrappers usan `aspect-ratio`, lo que reduce el riesgo, pero no todas las reservas son verificables.

Recomendación: declarar dimensiones o `aspect-ratio` estable para cada imagen y póster. Si se agregan unidades manuales de anuncios, reservar su `min-height` por breakpoint para proteger CLS. Google recomienda un CLS de 0.1 o menos en al menos el 75% de las visitas.

#### 10. No hay tratamiento explícito de safe areas

No se usa `env(safe-area-inset-*)`. Hoy no hay una navegación fija inferior propia, pero anchors, banners de consentimiento y futuros controles fixed pueden chocar con el home indicator o las barras del navegador.

Recomendación: si se introduce cualquier elemento fixed/sticky de borde, sumar padding con safe areas y probar Safari con barras compacta/expandida.

#### 11. La fuente web añade costo y potencial reflow

Archivo y Spline Sans Mono se cargan desde Google Fonts. Hay `preconnect`, lo cual es positivo, pero no existe una estrategia local ni un control de métricas de fallback visible en el repositorio.

Recomendación: medir LCP/CLS con red mobile; considerar self-hosting WOFF2 o ajustar fallbacks si las métricas reales muestran reflow.

## Evaluación por plantilla

### Portada

Fortalezas: búsqueda prominente, filtros con estado, carruseles táctiles y buen contraste general.

Problemas: header alto, promoción antes del catálogo, landscape roto, tipografía del header demasiado pequeña, filtros extensos y riesgo alto de inserción automática en componentes complejos.

### Ficha de película

Fortalezas: información editorial rica, navegación clara y estructura semántica.

Problemas: póster domina antes del título, demasiadas acciones superiores, estrellas muy pequeñas y varios targets de 41 px. Es la mejor candidata a anuncios in-page manuales después de la reseña o entre secciones editoriales completas.

### Índice de personas

Fortalezas: búsqueda y filtros potentes, arte consistente y tarjetas informativas.

Problemas: héroe enorme antes del buscador, labels de 11.68 px y lista de cientos de perfiles sin estrategia visible de carga progresiva/virtualización. Evitar un anuncio antes de la toolbar.

### Perfil de persona

Fortalezas: buen contenido original y múltiples secciones naturales.

Problemas: algunos metadatos pequeños y alto volumen de imágenes sin atributos de dimensión. Buen candidato a uno o dos slots in-page entre biografía, premios y filmografía.

### Postómetro

Fortalezas: flujo distintivo, controles grandes en tarjetas y feedback de estado.

Problemas: héroe alto, radios visuales pequeños y 21 targets marcados por escenario si se mide el input nativo sin considerar el label. La zona interactiva completa debe verificarse con hitboxes reales; no conviene superponer anchors durante el flujo.

### Comunidad y discusiones

Fortalezas: ya están excluidas de anuncios, decisión correcta para confianza, moderación e interacción.

Problemas: reacciones de 36 px y estrellas pequeñas. Mantener `allowAds={false}`.

### Páginas institucionales y legales

Fortalezas: contenido claro, semántica simple y buena estabilidad.

Problemas: acciones de regreso de ~41 px. Contacto, privacidad y copyright no deberían monetizarse por defecto: aportan confianza y cumplimiento, no una experiencia editorial donde el anuncio sume valor.

## Configuración AdSense mobile recomendada

Esta es una recomendación UX-first, no una regla de Google.

### Fase 1 — Lanzamiento controlado

- Permitir anuncios sólo en fichas indexables de película y perfiles extensos de persona.
- Mantener sin anuncios: comunidad, discusiones, trailers noindex, contacto, privacidad, copyright, fuentes y política editorial.
- Excluir la portada y el Postómetro al inicio; incorporarlos sólo después de probar placements concretos.
- Empezar con banners in-page; máximo inicial sugerido: 1–2 por ficha, separados por secciones editoriales completas y nunca antes del título/resumen.
- No usar Multiplex en mobile durante la primera fase.
- Desactivar ad intent links/chips dentro de reseñas, biografías, badges, filtros y controles; si se habilitan, proteger esas zonas con `google-anno-skip`.
- Probar anchors como experimento separado. Si se usan, elegir posición inferior, verificar cierre accesible y controlar que no cubran CTAs, rating, filtros ni el formulario del Postómetro.
- Mantener viñetas apagadas en la primera fase. Si luego se ensayan, usar una frecuencia conservadora de 30–60 minutos, sin triggers adicionales, y marcar navegación crítica con `data-google-vignette="false"`.

Google permite configurar un máximo de banners, distancia mínima, áreas y páginas excluidas en Auto ads. En 2026 esos controles pasan a “advanced settings” y reemplazan el antiguo slider de carga.

### Fase 2 — Experimentos

- Activar un solo formato nuevo por experimento.
- Medir por plantilla y dispositivo, no sólo RPM global.
- Guardrails mínimos: CLS p75 ≤ 0.1, ausencia de taps accidentales, sin caída material en búsqueda/filtros, retorno, páginas por sesión o finalización del Postómetro.
- Usar experimentos de AdSense antes de aplicar un cambio a todo el tráfico.

### Exclusiones de área sugeridas

- `.donation-invite`
- `.site-header` y `.site-search-bar`
- `.home-community-promo`
- carruseles y sus controles
- `.home-results-tools` y todos los grupos de filtros
- cabecera/título/veredicto de película
- trailer y botones de reproducción
- widgets de rating/reacción
- formularios y resultados del Postómetro
- navegación, footer y CTAs de soporte

Las exclusiones de área de AdSense dependen de selectores CSS; si cambian, deben volver a revisarse en el preview de AdSense.

## Privacidad y consentimiento

La política de privacidad menciona AdSense y que el mensaje/CMP se administra desde la cuenta. Eso es una buena base, pero no demuestra que esté activo.

Antes de servir anuncios a EEA, Reino Unido o Suiza hay que confirmar en “Privacy & messaging” una CMP certificada por Google e integrada con TCF. Desde el 1 de marzo de 2026 el marco relevante es TCF v2.3. El mensaje debe probarse en 320 px, portrait y landscape, junto con Cafecito y cualquier anchor.

## Criterios de aceptación antes del go-live

- Sin overflow ni contenido cortado en 320 × 568, 390 × 844, 412 × 915, 844 × 390 y 915 × 412 en Chromium y WebKit.
- Todos los controles aislados con hitbox mínimo de 48 × 48 px; sin targets superpuestos.
- Ningún texto funcional visible por debajo de 12 px; controles y cuerpo preferentemente en 14–16 px o más.
- Búsqueda/título/propuesta de valor visibles en el primer viewport sin depender de cerrar anuncios.
- CMP usable con teclado, lector de pantalla, zoom 200% y safe areas.
- Anchor cerrable y sin cubrir controles, o desactivado en la plantilla afectada.
- Viñetas excluidas de navegación crítica y frecuencia documentada.
- Slots manuales con espacio reservado; CLS p75 de campo ≤ 0.1.
- Revisión visual con creatividades reales largas/cortas y anuncios no servidos.
- Suite mobile Chromium/WebKit verde sin comparaciones frágiles de subpíxel.

## Orden de implementación recomendado

1. Corregir landscape y reemplazar el ocultamiento de overflow por reflow real.
2. Normalizar targets a 48 px y elevar la tipografía mínima.
3. Compactar aviso de Cafecito, header y héroes mobile.
4. Reordenar portada y ficha de película para mostrar antes la intención principal.
5. Definir una matriz de anuncios por plantilla y agregar exclusiones en código/cuenta.
6. Reservar espacio para slots, verificar CMP y medir CLS/LCP.
7. Ejecutar un experimento limitado antes de habilitar overlays o viñetas.

## Fuentes oficiales consultadas

- [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/)
- [Apple Human Interface Guidelines — Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios)
- [Android Developers — Accessibility](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility)
- [Google AdSense — About Auto ads](https://support.google.com/adsense/answer/9261805?hl=en)
- [Google AdSense — Auto ads settings](https://support.google.com/adsense/answer/9305577?hl=en)
- [Google AdSense — Advanced banner settings in 2026](https://support.google.com/adsense/answer/16683740?hl=en)
- [Google AdSense — About anchor ads](https://support.google.com/adsense/answer/15484692?hl=en)
- [Google AdSense — Vignette frequency](https://support.google.com/adsense/answer/13956167?hl=en-GB)
- [Google AdSense — Prevent a link from triggering vignettes](https://support.google.com/adsense/answer/17016693?hl=en)
- [Google AdSense — Exclude pages](https://support.google.com/adsense/answer/9262311?hl=en)
- [Google AdSense — Exclude areas](https://support.google.com/adsense/answer/12626543?hl=en)
- [Google AdSense — Publisher integration with IAB TCF](https://support.google.com/adsense/answer/9804260?hl=en)
- [Google Search Central — Avoid intrusive interstitials](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials)
- [web.dev — Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls)
