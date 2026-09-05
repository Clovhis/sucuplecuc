# Posters locales

Las fichas de películas guardan rutas relativas bajo `assets/posters/<año>/<slug>.webp`. Los binarios viven en `public/assets/posters/`, por lo que Astro los sirve sin una dependencia de CDN externa y `getPosterUrl` conserva el `BASE_URL` configurado.

`npm run posters:migrate` localiza el catálogo completo. Una ficha nueva puede hacer la conversión atómica con `npm run new-movie -- --title "…" --year YYYY --poster-url "https://…"`; el starter nunca queda con esa URL, porque el comando descarga y localiza el arte antes de terminar. Si la URL se carga después, ejecutar `npm run posters:localize -- --movie <slug>`; ambos caminos convierten a WebP, limitan a 480x720 sin deformar y reemplazan el campo por la ruta local. Si la fuente no es usable, el localizador deja el fallback y sale con código 2 para que la carga se detenga y se consiga un arte correcto.

`npm run posters:check` es el gate determinista: rechaza URLs externas, rutas inexistentes, archivos que no son WebP, pósters horizontales, dimensiones superiores a 480x720 y archivos de más de 100 KiB. Informa como advertencia los WebP válidos fuera de la meta de 40–80 KiB.

`public/scripts/poster-fallback.js` sólo aplica el WebP local de contingencia cuando un `img[data-cineposta-poster]` no puede cargar. No consulta proveedores ni proxies externos.
