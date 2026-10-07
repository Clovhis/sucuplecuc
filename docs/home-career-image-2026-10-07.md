# Imagen del simulador en el home

Branch: `redesign/home-promos-agenda-2026-10-07`.

El bloque «Construí tu carrera en el cine» usa una nueva escena de rodaje
generada con `imagegen` (herramienta integrada). La dirección visual es una
fotografía editorial cinematográfica: directora siguiendo una toma, cámara
en primer plano, luz cálida, tonos oscuros y saturación contenida.
Es una imagen generada; no documenta un rodaje real ni representa a una
persona identificada.

## Archivo e integración

- Archivo publicado por el componente:
  `public/images/home/cineposta-simulador-rodaje-editorial.webp`.
- Resolución: 1536 × 1024; proporción 3:2; 111.926 bytes.
- Conversión a WebP con Sharp, calidad 85, sin cambiar las dimensiones,
  recortar ni modificar la composición.
- Se conserva el ancho de hasta 450 px, la proporción reservada y el flujo
  normal en escritorio y móvil. El enlace sigue llevando al mismo simulador.
- El PNG anterior permanece disponible en el repositorio, pero el home usa
  el nuevo WebP. El arte interno del juego no se modifica.
- Se actualiza la comprobación existente del home en `actor-career.spec.ts`
  para reconocer el nuevo archivo.

## Prompt final

```text
Use case: photorealistic-natural. Asset type: cinematic editorial photograph for the homepage of Cine Posta, an Argentine cinema magazine website, illustrating a film career simulator titled 'Construí tu carrera en el cine'. Generate one new landscape image, 3:2 aspect ratio. Scene: an intimate independent film studio during a quiet moment before a take. One young adult film director, seen naturally from behind in three-quarter profile, in a plain dark jacket, seated on an understated black director's chair beside a real professional cinema camera on a tripod. The director looks toward the set; no identifiable famous person. The cinema camera occupies the right foreground, the seated director is near the center, and a softly lit practical studio lamp and modest set are visible deeper in the scene. Compose a complete intimate film-set photograph with a strong readable silhouette and the camera lens, filling the frame evenly; avoid unused blank space. Camera and person must remain clearly readable when the image is displayed at only 450x300 or 358x239 pixels. Style: sophisticated cinema magazine editorial still photograph, natural physical materials, subtle 35mm film grain, authentic restrained mood, quiet anticipation. Palette: charcoal black, slate grey, softly warm ivory and a restrained peach/amber practical light; low saturation, realistic cinematic chiaroscuro, enough midtone detail to read the subject. Designed to sit beside off-white text on a flat dark charcoal (#101318) website. Composition: landscape 3:2, medium-wide intimate framing, balanced subject sizes, complete important objects inside the frame, gentle shallow depth of field, professional photographic realism. No text, no typography, no logos, no watermark, no readable camera branding, no trophies, no red carpet, no stars, no cartoon characters, no neon purple or blue, no glossy advertising look. This is the standalone photograph only, not a mockup of the website.
```

## Validación

- `npm run check`: 0 errores, 0 warnings, 0 hints.
- `npm run build`: 7.540 páginas, aprobado.
- Playwright: 9 pruebas aprobadas, sin omisiones ni fallos, sobre el build
  final en escritorio Chromium, móvil Chromium y móvil WebKit.
- Se verificaron carga y proporción de la imagen, contención al cambiar de
  ancho, ausencia de superposición, orden del bloque y navegación al juego.
- Capturas locales:
  `test-results/home-career-image-review/desktop.png` y `mobile.png`.

```powershell
$env:PLAYWRIGHT_REUSE_SERVER='1'
npx playwright test tests/e2e/home-promos.spec.ts tests/e2e/actor-career.spec.ts --grep 'closing home|home game|aparece después' --project=desktop-chromium --project=mobile-chromium --project=mobile-webkit --workers=2
```
