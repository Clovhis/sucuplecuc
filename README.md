# La posta cine

Sitio estatico de resenas cortas de peliculas, en castellano rioplatense, sin ads y sin automatismos de contenido.

## Stack

- Astro (sitio 100% estatico)
- Contenido desacoplado en `src/data/movies/*.json`
- Deploy automatico a GitHub Pages por GitHub Actions

## Estructura de contenido

Cada pelicula vive en un archivo JSON dentro de:

`src/data/movies/`

Schema:

```json
{
	"slug": "nombre-pelicula-2026",
	"title": "Nombre de la pelicula",
	"year": 2026,
	"poster": "https://... o /posters/local.svg",
	"screenshots": ["https://.../shot-1.jpg", "https://.../shot-2.jpg"],
	"trailerYoutubeId": "abc123",
	"verdict": "recomendada|zafa|no_recomendada|basura_atomica",
	"verdictLabel": "Opcional para override de etiqueta visible",
	"review": "Resena corta (max 5 lineas aprox)"
}
```

Notas:

- Solo se guarda `trailerYoutubeId` para YouTube.
- Si `trailerYoutubeId` esta vacio, el detalle muestra "Trailer no disponible".
- Si `poster` esta vacio, se usa un poster fallback.
- `screenshots` es opcional. Si tiene al menos 2 URLs, el detalle usa galeria (2 capturas).
- Si no hay `screenshots`, el detalle usa poster fallback.
- `verdictLabel` es opcional y pisa la etiqueta por defecto del badge.

## Peliculas de ejemplo cargadas

- `28 YEARS LATER` (obligatoria, con primera impresion)
- `Noche en la Ruta` (ficticia)
- `El Club del Ultimo Jueves` (ficticia)

## Correr localmente

1. Instalar dependencias:

```bash
npm install
```

2. Levantar servidor de desarrollo:

```bash
npm run dev
```

3. Build de produccion:

```bash
npm run build
```

4. Preview del build:

```bash
npm run preview
```

## Crear una nueva pelicula manualmente

### Opcion A (recomendada): script

Comando:

```bash
npm run new-movie -- --slug "mi-pelicula-2026" --title "Mi Pelicula" --year 2026
```

Que hace:

- Crea `src/data/movies/mi-pelicula-2026.json`
- Usa `templates/movie.template.json`
- Valida formato de slug
- Valida anio
- Frena si detecta slug duplicado

Luego editas el JSON generado para completar `poster`, `trailerYoutubeId`, `verdict` y `review`.

### Opcion B: template manual

Usa:

`templates/movie.template.json`

y copialo dentro de `src/data/movies/` con el nombre `<slug>.json`.

## Publicar en GitHub Pages

El repo ya incluye:

`/.github/workflows/deploy.yml`

Pasos:

1. En GitHub, entrar al repo `Clovhis/sucuplecuc`.
2. Ir a `Settings > Pages`.
3. En `Build and deployment`, elegir `Source: GitHub Actions`.
4. Hacer push a `main`.
5. Esperar el workflow `Deploy Astro to GitHub Pages`.

URL esperada:

`https://clovhis.github.io/sucuplecuc/`

## Config importante para Pages

`astro.config.mjs` esta seteado con:

- `site: "https://clovhis.github.io"`
- `base: "/sucuplecuc"`

Si cambia nombre de usuario o repo, actualizar esos dos valores.

## Edicion editorial (manual, sin automatizar)

- Las peliculas no se agregan solas.
- Las resenas no se inventan automaticamente.
- Flujo sugerido: pedir "crear entrada para X pelicula" y completar la resena con feedback humano.
