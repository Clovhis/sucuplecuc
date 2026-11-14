# Imágenes cinematográficas para Instagram

Desde el 14/11/2026 el generador diario exige una imagen real autorizada **en todas las páginas**, incluidas portadas y scores. No existe alternativa abstracta. Si una película no tiene material utilizable, se selecciona otra; si se agota el conjunto, el job falla sin publicar una placa genérica.

## Registro reutilizable

`assets/social/instagram-rights.json` v2 contiene 16 fotografías aprobadas con evidencia por archivo en `assets/social/rights-evidence/`. Los originales convertidos a WebP están bajo `public/assets/social/photos/`. Algunas fuentes se localizaron desde `people.json`; se descargó mayor resolución cuando la copia local era demasiado pequeña. El resto de los retratos y pósters **no** se habilita automáticamente.

Cada entrada conserva identidad del sujeto, título del archivo, fuente y URL original, revisión de la página de licencia, autor/crédito, licencia/URL, fecha de foto, restricciones, hashes del archivo y de la evidencia, fecha de verificación y permiso para Instagram orgánico y alojamiento público. El job diario reutiliza esta evidencia: no hace una nueva investigación ni llama a TMDB cada día.

Tipos: `poster`, `still`, `backdrop`, `portrait`, `event-photo`. El arte cinematográfico se vincula por slugs explícitos. Un retrato sólo puede acompañar películas cuyo `mainCast` o `director` contenga exactamente esa persona. El tipo `event-photo` de KATSEYE está vinculado sólo al documental correspondiente. Los retratos y conciertos se rotulan **archivo + año**, nunca se presentan como fotogramas.

Estados: `approved`, `pending`, `restricted` (sólo el primero entra). `permission` contiene `basis` (`open-license` o `press-permission`), `territories`, `organicInstagram`, `publicHosting`, `crop`, `overlay`, `expiresAt`; pueden agregarse `embargoUntil`, `focalPoint`, `slugs` y `person`. Para prensa se requieren además `rightsHolder` y `grantSummary`, explicando el alcance de la autorización. No reemplazar una licencia pendiente por una presunción de fair use.

El hash cambiado, permiso incompleto, territorio distinto de AR/worldwide, embargo futuro o vencimiento impiden seleccionar el recurso. Un permiso sin reencuadre se compone completo, con márgenes; los afiches se preservan completos siempre. Los scores sólo se superponen cuando está permitido. El conjunto inicial fue inspeccionado visualmente.

## Creative Commons

Se verificaron individualmente las páginas y metadatos de Commons; estar en Commons no es una autorización genérica. El importador admite CC BY y CC BY-SA 2.0/3.0/4.0, exige una fuente de al menos 700 px en su lado menor y guarda el original hash más la evidencia. No admite NC, ND ni presume dominio público válido en Argentina.

El caption incluye crédito, enlace a cada fuente, licencias con enlaces y los cambios de composición. Las adaptaciones con SA se distribuyen bajo CC BY-SA 4.0, conservando la licencia original de cada fotografía; la cláusula 4.b de BY-SA 2.0 admite versiones posteriores con los mismos elementos. Se respetan avisos de derechos de personalidad: uso editorial relacionado, sin publicidad paga ni afirmación de aval por la persona retratada.

```powershell
# Primero revisar la página y la imagen; no aprueba ni publica:
npm run social:images:import -- --file "Katseye at Wango Tango 2025.jpg" --slugs katseye-wild-hearts-2026
# La aprobación es una acción editorial explícita, fuera del cron:
npm run social:images:import -- --file "Katseye at Wango Tango 2025.jpg" --slugs katseye-wild-hearts-2026 --approve
# Para retratos, usar la identidad exacta de people.json:
npm run social:images:import -- --file "Bill Hader (29419489470) (cropped).jpg" --person "Bill Hader" --approve
```

No ejecutar importaciones concurrentes: modifican el mismo registro. Ante 429 detenerse y respetar la espera; no martillar la fuente ni eludir el límite. `--approve` no sustituye revisar identidad, encuadre, licencias y restricciones. No se ejecuta desde Actions diario.

## TMDB: localización, no autorización

```powershell
npm run social:images:discover -- katseye-wild-hearts-2026
```

Reutiliza `TMDB_API_KEY` de `.env.local`/entorno sin imprimirla. Resuelve identidad por ID guardado o título/año exactos; ambigüedad bloquea. Lista pósters, backdrops y retratos en `.tmp/instagram-discovery/`, todos **pending-rights**. No descarga imágenes, no cambia catálogo/registro y no publica. La prueba real del documental encontró ID `1728113`, 22 pósters/backdrops y 8 retratos; ninguno se convirtió automáticamente en permiso.

La FAQ oficial distingue acceso gratuito no comercial y atribución, y aclara que TMDB no posee los derechos de las imágenes. No se contrata una licencia comercial ni se considera que una clave de API concede derechos del estudio.

## Press kits y recursos pendientes

La infraestructura admite afiches, escenas y backdrops con permiso específico reutilizable, incluidos límites de recorte, superposición, territorio, embargo y vencimiento. **El conjunto inicial aprobado contiene fotografías de personas/eventos, no pósters ni fotogramas de estudios.** No presentar los ejemplos como si fueran escenas de las películas.

En `pendingSources` quedaron el paquete oficial de KATSEYE y los pósters de las cinco animadas. La página Disney+ Press ofrece material y contacto, pero no se acreditó autorización para adaptación y alojamiento público en GitHub de estas composiciones argentinas. Para habilitar ese material hace falta una política aplicable o permiso del titular que cubra publicación editorial orgánica en Instagram, territorio, vigencia, reencuadre/textos y alojamiento requerido por Buffer. Contacto publicado del paquete: `Disney+.Media.Relations@disney.com`. No se envió ninguna solicitud ni se crearon cuentas de prensa.

Consultar también [social-press-kits.md](social-press-kits.md). Un portal accesible, una foto acreditada, una descarga o que otro medio la use no bastan. Las fotografías con licencia comprobada permiten que el canal funcione mientras esos permisos siguen pendientes.

Fuentes: [TMDB FAQ](https://developer.themoviedb.org/docs/faq), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [CC BY-SA 2.0, código legal](https://creativecommons.org/licenses/by-sa/2.0/legalcode.en), [Commons: reutilización](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia), [fotografía KATSEYE](https://commons.wikimedia.org/wiki/File:Katseye_at_Wango_Tango_2025.jpg), [prensa Disney+](https://press.disneyplus.com/news/katseye-wild-hearts-on-disneyplus-hulu).
