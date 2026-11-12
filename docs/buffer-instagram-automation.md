# Instagram diario de CinePosta

El workflow nuevo `.github/workflows/publish-buffer-instagram.yml` prepara una recomendación del catálogo a las **18:15 de Argentina** (`15 21 * * *`) y la programa en Buffer para **19:15 AR** (`22:15 UTC`). El cron de GitHub puede demorarse; Buffer recibe una hora fija con una hora de margen. Si quedan menos de cinco minutos, se omite ese día: no se arrastra el envío a mañana ni se acumula una cola. Funciona en GitHub aunque la PC esté apagada.

La publicación diaria de X queda intacta: conserva scripts, workflows, configuración, historial, variables y secret existentes. No hay dependencia funcional desde X hacia el código nuevo.

## Componentes

- `skills/cineposta-redes-sociales/`: operaciones de agentes mediante MCP oficial y OAuth local. Una skill para X e Instagram, con adaptación editorial por red, estados, borradores, programación, imágenes, carruseles, Stories y Reels.
- `scripts/publish-buffer-instagram.mjs`: job determinista por GraphQL oficial. Una única mutación de programación por ejecución y canal verificado. Reutiliza el secret `BUFFER_API_KEY` de Actions sin modificarlo.
- `scripts/lib/social-media.mjs`: selección, caption y placas con Sharp. Recomendaciones con score canónico ≥6, fecha no futura, texto editorial concreto y póster local; rota categorías y excluye todo título usado. No presenta títulos antiguos como estrenos ni afirma disponibilidad actual a partir de una plataforma almacenada.
- `scripts/create-social-media.mjs`: piezas para agentes, con varios slugs y formatos feed, story o reel. El Reel opcional requiere FFmpeg gratuito. No envía nada a Buffer.
- `assets/social/`: Noto Sans Regular/Bold con su licencia SIL OFL, desde [Noto Fonts](https://github.com/notofonts/noto-fonts/tree/main/hinted/ttf/NotoSans). Evita depender de las fuentes instaladas en cada sistema.
- Rama remota **`cineposta-instagram-state`**: `history.json` y `media/`. Es un árbol operativo independiente, sin código del sitio ni workflows. Sus commits no van a main ni disparan Pages. No mezclar ni rebasar esta rama sobre main.

## Contenido y medios

El caption tiene una apertura variable, título/año, una oración completa de la mirada editorial existente, score con su etiqueta, invitación a guardar y dominio/URL con UTM. El generador no usa LLM, claves de IA, Codex Cloud, sesiones de Codex ni servicios de imágenes. La variante se elige por el historial propio. No copia el texto generado para X.

Placa JPEG sRGB 1080×1350, menor de 8 MB, con póster completo, logo, título, score, una idea editorial y el dominio. Se genera una por día: no requiere renderizar todo el catálogo durante el build. Las variantes manuales de Story/Reel usan 1080×1920. Los títulos sin score o con crítica negativa no entran en la recomendación automática; los agentes pueden promocionarlos como crítica respetando su valoración.

La API/MCP de Buffer necesita una URL pública, no acepta upload directo. Por eso se sube primero la placa a la rama operativa y se usa `https://raw.githubusercontent.com/Clovhis/sucuplecuc/<SHA>/media/<archivo>.jpg`, fijada al SHA del commit. Antes de crear el post se descarga sin autenticación y se compara SHA-256. Se conservan medios e historial, sin force-push ni borrados. No se espera un deploy ni se usa una URL firmada que venza.

## Habilitación y pruebas sin publicaciones ficticias

1. Conectar `@cineposta.ar` a Buffer como cuenta profesional (Business/Creator) por el flujo oficial. Un perfil personal o `defaultToReminders=true` no sirve. No hace falta página de Facebook para publicaciones normales.
2. Mantener OAuth local del MCP separado del secret de Actions. No generar una segunda clave por defecto: Buffer Free limita la cantidad de claves. No rotar/revocar la clave usada por X.
3. Crear la rama operativa con este contenido inicial, sin ancestros del sitio:

   ```json
   { "version": 1, "posts": [] }
   ```

   Archivo `history.json`, más `media/.gitkeep` vacío. El workflow sólo modifica esos datos/medios. Persiste las credenciales únicamente en el checkout operativo; el token de Actions conserva permiso `contents: write` del repositorio. El checkout del código usa `persist-credentials: false`.
4. Configurar `BUFFER_INSTAGRAM_CHANNEL_ID` con el ID confirmado por MCP. Reutilizar `BUFFER_ORGANIZATION_ID` sin cambiarlo. Mantener `BUFFER_INSTAGRAM_AUTOPUBLISH_ENABLED` ausente o `false` hasta que pase el check real.
5. `workflow_dispatch`, `mode=dry-run`: genera una vista previa sin llamar a Buffer. `mode=check`: consulta canal/cola con el secret real de Actions, sin crear un post. Debe mostrar Instagram correcto, profesional, conectado, desbloqueado, cola habilitada y sin recordatorios predeterminados. Si faltan permisos o la clave devuelve 401, dejar desactivado el cron y resolver la credencial con Leo por el mecanismo oficial; no afectar la clave de X para ocultar el problema.
6. Sólo después del check aprobado, configurar `BUFFER_INSTAGRAM_AUTOPUBLISH_ENABLED=true`. El cron programará el siguiente día elegible. `mode=publish` también exige los mismos controles y publica contenido real: no usarlo como test ficticio.

Comandos locales:

```powershell
npm run test:buffer:instagram
npm run buffer:instagram
npm run buffer:instagram -- --check
npm run social:media -- --slugs the-shining-1980 --format story --out .tmp/story
```

`--check` necesita credenciales válidas en el entorno. No usar el antiguo `BUFFER_API_KEY` local si venció: el MCP se reconectó por OAuth, pero eso no renueva esa variable ni el secret de Actions. El modo sin argumentos es offline; el artefacto de Actions permite revisar la placa sin publicar.

## Duplicados y recuperación

El job consulta todos los estados de Instagram, paginando hasta 100 por página (máximo conservador de 20 páginas; excederlo bloquea para revisar cuota). Busca enlaces/slug, incluso con UTM. Títulos de borradores o errores también se reservan. Antes de crear contenido, verifica que no exista otro post para el día argentino y que haya menos de 10 pendientes. Vuelve a comprobar ambos límites antes de la mutación. No usa el historial de X ni le consume posiciones de cola.

Primero persiste y pushea la reserva con película, texto, hora, hash y `attemptId` (run:attempt); luego crea el post. El recibo incluye ID y estado de Buffer. La persistencia final corre también si el envío falla; además conserva el historial como artifact durante siete días. Un fallo de push de la reserva impide llegar a la mutación. El grupo de concurrencia propio impide ejecuciones simultáneas del job.

Si se perdió el recibo, una nueva ejecución recupera el post desde Buffer y no crea otro. Si hay reserva pero no aparece un post, o una mutación tuvo timeout, el job se detiene: **no reintentar la creación a ciegas**. Revisar el run/artifact y `list_posts` del canal, incluyendo borradores, errores y enviados. Si Buffer tiene un ID, conservarlo y recuperar/editar ese mismo post según la autorización del usuario. Una reserva de un día anterior queda en el historial y no impide elegir otra película mañana.

Sólo si se confirmó inequívocamente que no se creó ningún post, una recuperación manual puede quitar **esa reserva no enviada** de `history.json` en la rama operativa, preservando los demás registros, commitear sin force y ejecutar `publish` antes del corte. Es una operación excepcional con evidencia, no un reinicio del historial ni un paso automático. Si el post existe con `error`, corregir/reintentar el mismo ID; no borrar su registro para volver a publicar.

Para pausar, `BUFFER_INSTAGRAM_AUTOPUBLISH_ENABLED=false`. Eso frena futuros cron; no cancela posts ya recibidos por Buffer. Consultar sus IDs y estados antes de prometer cancelación. Las publicaciones programadas se informan como programadas: confirmar `sent` y enlace externo posteriormente requiere una consulta real.

## Costos y límites

Usa el plan gratuito existente: dos de tres canales y hasta diez programados por canal, comprobados por MCP al configurar. Una publicación diaria ocupa aproximadamente un espacio en Instagram; no precarga un mes. Ambos clientes comparten la cuota API de la organización: normalmente este job usa seis requests por día con menos de cien posts, y crece por paginación; respetar cuota viva y 429, no insistir con mutaciones. El límite mensual mostrado por la cuenta es la referencia, incluso si cambia la página de precios.

GitHub Actions usa runner Linux estándar en este repositorio público; no se habilitan runners pagos, grandes, servicios adicionales ni compras. Los MP4 opcionales se generan con FFmpeg sin audio. No se usan primer comentario (pago), música comercial, Shop Grid ni stickers para sostener la automatización.

Fuentes oficiales consultadas el 12/11/2026: [MCP](https://developers.buffer.com/guides/integrations/mcp.html), [OAuth de Codex](https://developers.buffer.com/guides/integrations/chatgpt.html), [Instagram](https://support.buffer.com/en-us/articles/using-instagram-with-buffer-YSjg2dXFV8), [medios públicos](https://developers.buffer.com/guides/hosting-media.html), [metadatos](https://developers.buffer.com/types/InstagramPostMetadataInput.html), [Buffer Free](https://buffer.com/pricing).
