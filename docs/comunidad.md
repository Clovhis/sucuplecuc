# Comunidad: La Sala

`/comunidad/` es el MVP de conversación pública de Cine Posta. Es una página estática de Astro: no incorpora backend, base de datos, login ni registro propios. La conversación persistente queda a cargo de FastComments.

## Qué hay implementado

- La Sala, con tema semanal y reglas de convivencia.
- Un hilo principal estable: `cineposta-la-sala-principal`. No depende de la URL ni de parámetros del navegador.
- El widget vanilla de FastComments se carga solamente en esta página y solamente cuando está activado.
- Estados en español para configuración pendiente, carga, error de red o bloqueo de contenido, además de una alternativa útil sin JavaScript.
- Preparación mínima para futuros hilos por película mediante `getMovieCommunityThreadId(slug)` en `src/lib/community.ts`. No se agregaron widgets a las fichas existentes.

## Por qué FastComments

FastComments ofrece un widget JavaScript liviano para sitios estáticos, conversaciones persistentes, respuestas y actualizaciones en vivo. Evita que Cine Posta tenga que almacenar mensajes, apodos o credenciales. La integración usa el snippet vanilla oficial, sin paquetes npm extras.

## Activación manual

1. Creá la cuenta de Cine Posta en FastComments y agregá como dominios permitidos `www.cineposta.com.ar` y, si corresponde, `cineposta.com.ar`. Para pruebas locales, agregá también el origen exacto que vayas a usar, por ejemplo `http://localhost:4321`.
2. En el panel de FastComments habilitá comentarios anónimos o sin requerir email. El sitio no implementa SSO ni cuentas de Cine Posta: cada visitante participa con el nombre o apodo que permita el proveedor.
3. Buscá el **Tenant ID** de FastComments. Es un identificador público de la integración, no una API key. No copies API keys ni secretos al repositorio.
4. Para desarrollo local, agregá en `.env`:

   ```bash
   PUBLIC_FASTCOMMENTS_ENABLED=true
   PUBLIC_FASTCOMMENTS_TENANT_ID=tu-tenant-id-publico
   ```

5. Para GitHub Pages, creá las variables de repositorio (no secretos) `PUBLIC_FASTCOMMENTS_ENABLED=true` y `PUBLIC_FASTCOMMENTS_TENANT_ID=tu-tenant-id-publico`. El workflow de deploy ya las expone durante el build.
6. Publicá el sitio y comprobá `/comunidad/`. El ID del hilo no debe cambiar si se cambia el dominio o la ruta.

La configuración de código está centralizada en `src/lib/community.ts`; las variables documentadas están en `.env.example`. Para pausar la comunidad, poné `PUBLIC_FASTCOMMENTS_ENABLED=false` o dejá vacío el Tenant ID y reconstruí. La página seguirá visible, sin cargar recursos de FastComments.

## Tema semanal

El texto de **Tema de la semana** está concentrado en `src/pages/comunidad.astro`, junto al contenido de la sección. Cambialo allí para actualizarlo: no exige tocar scripts, estilos ni configuración del proveedor.

## Moderación recomendada

Antes de activar la sala, configurá desde el panel de FastComments las opciones disponibles en el plan contratado:

- protección contra spam y CAPTCHA;
- moderación previa o revisión de primeros comentarios;
- restricción de enlaces y filtro de palabras;
- reportes de usuarios y bloqueo de participantes;
- límite de frecuencia de publicación;
- moderadores con acceso al panel, sin compartir credenciales.

Probá una publicación normal, una respuesta, un spoiler marcado, un enlace y un reporte. Revisá también las políticas y controles que ofrezca FastComments antes de comunicar condiciones de privacidad específicas.

## Prueba local

```bash
npm run dev
# abrir http://localhost:4321/comunidad/
```

Para validar sin activar el servicio, dejá las variables de FastComments ausentes o en `false`; debe verse el mensaje de sala pausada y no debe cargarse ningún script de terceros. Para probar error de carga, activá una configuración de prueba y bloqueá `cdn.fastcomments.com` desde las herramientas del navegador: el estado debe finalizar con un mensaje claro, sin cargador infinito.

## Límites conocidos

Sin backend ni login propio, Cine Posta no controla la identidad, los datos ni la moderación de los comentarios. La disponibilidad, las notificaciones y las funciones de anonimato dependen del proveedor y de su plan/configuración. La política de privacidad del sitio menciona prudentemente que este contenido puede ser gestionado por un tercero; no reemplaza las condiciones del proveedor.

## Futuro: conversaciones por película

Cuando se decida habilitarlas, se puede insertar el mismo componente en una ficha y usar `getMovieCommunityThreadId(movie.slug)` como `urlId`, pasando también la URL canónica de la película. Hacerlo solo después de definir la política editorial y la carga de moderación; no migrar ni crear hilos masivamente.
