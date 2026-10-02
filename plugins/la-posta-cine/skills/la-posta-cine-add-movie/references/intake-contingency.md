# Contingencia automática de carga

Leer y ejecutar cuando una ficha no puede completar un campo requerido tras la investigación normal, el enriquecimiento o la auditoría. Aplica a una película y a cada pendiente de un batch, antes del reporte final y sin solicitar que el usuario vuelva a indicar fuentes. Recuperar evidencia; conservar todos los gates de `SKILL.md`.

## Preparar y acotar

1. Reutilizar el manifiesto y el ledger. Enumerar sólo campos sin resolver; conservar hechos verificados, título AR/original, año, tipo y IDs ya confirmados. Consultar sólo la ficha o persona afectada, sin barrer nuevamente plataformas ni el catálogo.
2. Ejecutar la ruta correspondiente de abajo. Hacer una pasada complementaria por las fuentes pertinentes; abrir una segunda búsqueda sólo cuando aparezca un nuevo ID, alias, crédito, canal o fuente identificable. No repetir consultas idénticas ni gastar cuota en datos ya resueltos. La secuencia completa de puntajes sigue siendo obligatoria.
3. Reusar respuestas de Watchmode de esta ejecución. Si está configurado y puede aportar al campo pendiente, usar el helper canónico, incluyendo `--include-ratings` desde la primera consulta cuando falte puntaje. No crear scripts ad hoc que vuelvan a pedir los mismos detalles.

```bash
node skills/la-posta-cine-add-movie/scripts/watchmode-metadata.mjs --title "<título AR>" --original-title "<título original>" --year YYYY --imdb-id tt... --include-ratings
```

Omitir flags cuyos datos no se conocen y `--include-ratings` si el puntaje ya está verificado. Leer las reglas de identidad, clave y cuota en [movie-load-contract.md](movie-load-contract.md#watchmode-fuente-complementaria-de-contingencia). La búsqueda prioriza IDs conocidos: un título inglés distinto puede ser correcto si coinciden ID, año y tipo; un nombre parecido nunca alcanza. Una fecha global de Watchmode no es estreno argentino ni demuestra el primer año de exhibición.

## Puntaje

- Completar el protocolo de `SKILL.md`: RT audiencia, luego IMDb, TMDb, Letterboxd, Filmweb y Metacritic User Score antes de los agregados de crítica. Buscar por el IMDb ID confirmado y título/año, no sólo por el título traducido. Revisar ficha y página de ratings; una página localizada o resultado indexado de la propia fuente puede resolver un bloqueo de acceso si muestra inequívocamente ese ID, valor, tipo y fecha de consulta. Si no permite verificar identidad y métrica, conservar el bloqueo.
- Distinguir en Metacritic User Score (audiencia, 0–10) y Metascore (crítica, 0–100). Consultar Watchmode con `--include-ratings` si las fuentes públicas anteriores no resuelven el puntaje y hay clave local. Su `user_rating` es audiencia Watchmode, no IMDb; no publica conteo de votos ni garantiza una muestra mínima. Registrar votos desconocidos y la limitación, sin inventar tamaño de muestra.
- Usar una métrica numérica de audiencia verificada antes que una de crítica. Sólo si no se pudo verificar ninguna, seguir RT Tomatometer, Metacritic Metascore u otro agregado de crítica, incluido Watchmode `critic_score`, y finalmente la nota numérica de un crítico profesional identificado. Aplicar exactamente la conversión canónica, sin promediar ni seleccionar el valor más favorable.
- `null`, falta de campo, acceso bloqueado, “sin suficientes votos” sin número, porcentajes de popularidad y etiquetas Fresh/Rotten no son calificaciones. Un número cero explícito y verificado es distinto de `null`. Si no se verifica ninguna nota tras completar las rutas, dejar el score sin inventar y registrar el bloqueo de publicación.

## Identidad, créditos y retratos

- Confirmar créditos del film/año en fuentes oficiales y IMDb full credits; contrastar cada identidad con una señal independiente, como filmografía o perfil oficial. Usar IDs y créditos de Watchmode como pistas: productor, presenter o crew no se convierte en director ni participante. El endpoint de persona puede aportar IDs y biografía factual; no asumir que suministra un retrato.
- Buscar el nombre completo más el film, cargo o IMDb person ID en IMDb/TMDb, web oficial del realizador, productora, agencia, prensa y perfiles atribuibles de festivales o entrevistas. Un realizador que también escribe puede tener un retrato identificado en su página de autor de un medio especializado; verificar que es la misma persona, no aceptar sólo la coincidencia de nombre.
- Abrir la fuente que identifica la foto, contrastarla con la identidad/crédito independiente e inspeccionar visualmente el archivo. Si es seguro y decodificable, guardar `remoteImageUrl`, referencias y retrato local, y usar el optimizador canónico. Aplican las dimensiones y los mínimos de director y elenco de `SKILL.md`; no rellenarlos con crew, monónimos, personas incidentales o imágenes sustitutas.
- Si la búsqueda complementaria no resuelve un retrato, documentar la omisión y aplicar los gates existentes a los créditos retenidos. Un crédito eliminado nunca cuenta para el mínimo. Si el mínimo no se cumple, dejar la película pendiente.

## Tráiler

- Buscar título original, año e IDs en canales oficiales de productora, distribuidora o plataforma; revisar la galería de videos de IMDb y el enlace de Watchmode como pistas hacia el canal y video original.
- Confirmar película, año, idioma original, autor/canal y que el enlace es un tráiler o teaser oficial admisible; verificar el ID de YouTube con oEmbed y el auditor sin `--skip-youtube`. No confundir homónimos, películas previas, fan trailers, entrevistas, podcasts ni resúmenes con el tráiler.
- Un video sólo alojado en IMDb o Vimeo no completa `trailerYoutubeId`: buscar una publicación oficial en YouTube. Si no existe evidencia verificable y compatible con el campo, registrar el resultado y mantener el bloqueo, sin cambiar UI/schema ni copiar un ID ajeno.

## Póster y otros metadatos

- Para arte faltante, buscar prensa/productora/distribuidora oficial, JustWatch, TMDb, IMDb, Wikimedia o un archivo de carteles atribuible como IMP Awards. Verificar identidad/año/mercado y el arte visual, el archivo fuente y las dimensiones requeridas; localizar con `posters:localize`. No usar imágenes de Watchmode ni miniaturas como atajo.
- Para país, año original, duración o fecha, contrastar ficha oficial, IMDb/TMDb y las pistas de Watchmode. Un estreno comercial tardío no cambia el año original: si un festival o fuente oficial prueba una exhibición previa fuera del año pedido, clasificar como fuera de alcance y registrar el motivo.
- Disponibilidad y fecha AR conservan JustWatch AR y la confirmación oficial argentina cuando corresponde; una ficha global, Watchmode o un resultado extranjero no los reemplaza. Mantener el procedimiento especial de Flow. Nacionalidad/fecha de nacimiento opcionales de personas pueden quedar ausentes y no disparan un bloqueo de película por sí solas.

## Acceso y cierre

- Falta de clave local, 401/403/429, cuota agotada o robots: registrar `inaccesible`, seguir otras fuentes pertinentes y no reintentar esa ruta en bucle ni pedir credenciales como condición para continuar. Para un timeout/fallo transitorio, admitir un único reintento acotado. No exponer claves en URLs, comandos, reportes o logs.
- Para cada campo, registrar `candidato + IDs -> campo -> fuente/consulta y fecha -> resultado -> decisión`. Distinguir `verificado`, `sin valor numérico/asset`, `inaccesible`, `identidad discordante` y `agotado sin evidencia`; un bloqueo de acceso no prueba que el dato no existe. Guardar el raw score, escala, tipo, votos conocidos/desconocidos y cálculo; para media, identidad, fuente y verificación visual/técnica.
- Volver al flujo normal para cada candidato recuperado y ejecutar sus validaciones y auditorías. Cerrar el batch con cargadas, pendientes reales y excluidas por alcance, especificando campos y rutas intentadas. No declarar terminada una carga bloqueada, prometer que una API siempre la resolverá ni esperar otro prompt para esta contingencia.
