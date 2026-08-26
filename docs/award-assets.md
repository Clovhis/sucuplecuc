# Assets visuales de galardones

Los premios se muestran con una familia de ilustraciones editoriales originales para Cine Posta. Cada ilustración representa la silueta u objeto reconocible del galardón —estatuilla, copa, león, máscara, palma, gramófono, busto, tabla de surf o estrella— sin reproducir logos, wordmarks ni marcas oficiales.

Los assets están en `public/brand/awards/illustrated/` y se sirven optimizados como WebP transparente de 256 × 256 px. Todos los tipos de galardón actualmente presentes en el catálogo —incluidos los menos frecuentes— tienen una ilustración dedicada; `generic.webp` queda como respaldo para valores desconocidos. Oscar tiene dos variantes: `oscar.webp` representa un premio ganado y `oscar-nomination.webp` representa una nominación mediante una carta firmada con un pequeño dibujo dorado de la estatuilla. La variante BFI usa una medalla dorada con cruz azul y cinta roja, inspirada en la referencia visual del Fellowship y sin reproducir el logotipo oficial.

## Criterio legal

Se revisaron los recursos oficiales, pero no se incorporaron sus logos o trofeos registrados al render principal sin una autorización específica. La guía de marca de [The Oscars](https://brand.oscars.org/oscars) exige aprobación para los usos de sus marcas y una leyenda legal cuando aparece el logo o la estatuilla; sus [regulaciones](https://www.oscars.org/legal/regulations) también distinguen los usos editoriales. BAFTA publica sus [reglas de uso de marca](https://www.bafta.org/media-centre/logo-branding/) y Golden Globes concentra sus materiales en su [media center](https://goldenglobes.com/media-info/).

## Prompt de producción

Se generó el set con el generador de imágenes integrado, usando prompts específicos por galardón: `ilustración editorial original, objeto o silueta reconocible de [galardón], trofeo completo sin mano externa, fondo transparente, lectura clara a 32 px, sin texto, sin logo, sin marca de agua y sin reproducir una insignia oficial`. La variante de nominación usa una carta de papel con firma abstracta y un pequeño dibujo dorado de una estatuilla en la hoja; no muestra un trofeo independiente. La medalla BFI se produjo a partir de la referencia visual aportada y luego se limpió con una máscara de fondo para conservar transparencia real también en sus huecos internos. Cada variante se normalizó a WebP con canal alfa real, padding transparente y tratamiento visual consistente.
