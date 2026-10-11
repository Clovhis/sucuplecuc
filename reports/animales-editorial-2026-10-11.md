# Editorial de Animales — 11 de octubre de 2026

Nota validada localmente. El usuario autorizó su publicación en `main` y la limpieza del repositorio.

- Título: **Animales: Ben Affleck habla castellano y yo no puedo parar de reírme**.
- Slug: `animales-ben-affleck-me-rio-por-los-motivos-equivocados`.
- 1053 palabras; 5 minutos calculados por el loader.
- Primera persona a partir de los takes del usuario. El chiste de JLo está formulado como una situación imaginada, sin atribuirle experiencias o declaraciones reales.
- Crítica al desenlace sin revelar sus giros; `spoilers: false`.
- Integración automática en home, archivo y ficha por `movieSlug`. Sin cambios en reseña, score ni disponibilidad.

## Fuentes y material visual

- Ficha indicada por el usuario: https://www.cineposta.com.ar/peliculas/animales-ben-affleck-2026/
- Netflix Tudum, guía del elenco: https://www.netflix.com/tudum/articles/animals-cast-guide — verificados reparto, personajes, premisa y uso de español por Mark Kimball. Gillian Anderson interpreta a Dayle Burton y figura en The X-Files. Las valoraciones son del usuario, no de Netflix.
- Netflix Tudum, imágenes oficiales: https://www.netflix.com/tudum/articles/animals-ben-affleck-release-date-photos-news — cuatro fotos inspeccionadas visualmente. Crédito Warrick Page/Netflix. La procedencia no implica una licencia de uso comprobada.

Assets en `public/assets/editorial/animales-ben-affleck-me-rio-por-los-motivos-equivocados/`:

| Imagen | Contenido visto | Dimensiones | Relación con el texto |
| --- | --- | --- | --- |
| telefono.webp | Affleck sostiene un teléfono frente a Washington en un living | 1200 × 675 | Portada; contraste entre gravedad y reacción del autor; recuerdo del final sin mostrarlo |
| pareja.webp | Washington sentada, Affleck detrás con brazos cruzados | 1200 × 800 | Sensación teatral y escena armada |
| sam.webp | Steven Yeun con brazos cruzados junto a una repisa | 1200 × 800 | Evaluación del elenco |
| dayle.webp | Anderson con traje claro en un pasillo, hombre detrás | 1200 × 800 | Crítica al personaje de Dayle |

Todas tienen variante de 640 px, conservan proporción y no amplían ni alteran el original. Alt limitado al contenido visible. Sin escenas del desenlace.

## Validación

- `npm run check`: 266 archivos, 0 errores, 0 warnings y 0 hints.
- `npm run build`: correcto; 7817 páginas generadas.
- Suite editorial en DEV, Chromium desktop y mobile: 36/36 pruebas correctas.
- Pruebas de Animales sobre el build estático, Chromium desktop y mobile: 4/4 correctas. Home, archivo, ficha, enlaces de ida y vuelta, canonical, lectura calculada, imágenes decodificadas y ausencia de overflow a 320 px.
- `npm run validate:public-output`: correcto.
- `npm run validate:sitemap-indexability`: correcto; 5473 páginas canónicas.
- Comparación de todos los párrafos del JSON contra el HTML generado: coincidencia completa. Fecha, `PT5M`, vínculo a película y aviso sin spoilers fuertes presentes.
- Revisión visual del cuerpo en escritorio y a 320 px, y de la portada en ambas tarjetas: correcta. Capturas y logs conservados en `test-results/animales-editorial-review/` y en las salidas Playwright de la nota.
- Se ajustó la prueba de noticias de la home para respetar el límite de seis publicaciones: las notas desplazadas siguen verificándose desde el archivo. La nueva nota reutiliza las pruebas existentes de editoriales vinculadas a películas.
- URL de revisión en el servidor DEV que ya estaba abierto: http://localhost:4321/editorial/animales-ben-affleck-me-rio-por-los-motivos-equivocados/
- Los temporales de esta nota se archivaron fuera del repositorio en `C:\Users\yosoy\CinePosta-evidence\2026-10-11-animales`. Las capturas y logs también se conservaron en `test-results/animales-editorial-review/`.

## URLs originales de las imágenes

- telefono: https://dnm.nflximg.net/api/v6/2DuQlx0fM4wd1nzqm5BFBi6ILa8/AAAAQYRu486Y0hp_IJlthrkCBnPWzg2RZJJby6tj3bgdCgYAu7PDXjmck4JwR978dHyPTY7b-LhoozvYk6DqfYNyF3qYAjBUjTh3tTpNE5EP_ZY-qquuuZPEi_mOd3YfSH9aLVMI9omFLeXNMDCwbWHInNtV.jpg?r=1e8
- pareja: https://dnm.nflximg.net/api/v6/2DuQlx0fM4wd1nzqm5BFBi6ILa8/AAAAQXJAl4ewTpuOAncE7UbSYCo_CEqW7ylheByLq9FcB8UK6RBPRVk97c6vzDE0Sz3bVB_zedIgd7k868otYyZfuGxzaQ9NS-ZY8T3j-fejcmK2oNkhoXehDg15h27XA-EmYN0OjptzXMCsZ6kexCm02qwk.jpg?r=02d
- sam: https://dnm.nflximg.net/api/v6/2DuQlx0fM4wd1nzqm5BFBi6ILa8/AAAAQQ-q11i-c9_OEjC9yY3oK9jiyoCCogz6h-y0qgU8xUUls94SEvzUV0mNczE3vlq3EJ0ADCQbUsri63CwoPvqhpbsg4jkn2kXz_Q3nEGea3IHQ2XYfnaxoyTzV4-VCj0XBqgSLthRlvURs4Da-q_U-iXw.jpg?r=34a
- dayle: https://dnm.nflximg.net/api/v6/2DuQlx0fM4wd1nzqm5BFBi6ILa8/AAAAQf5jdglBBGsVq3CfpoA0MrKUx9HarRDyIQAEEf-Mu_fSQE3QhOjXd_HneGZjJCQ0tKpd5gSgEY6MWPp__E1nvRQRtQMqcvfo_WZcqpJK_zLyB1bmdGrGrViphaeV_bAxeaRqMSf_rcScZNb5aJxh_EKx.jpg?r=455
