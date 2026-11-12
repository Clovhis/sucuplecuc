# La Posta Cine Agent Plugin

Paquete local de skills y configuración portable para trabajar en Cine Posta.

## Qué incluye

- `plugin.json`: manifiesto portable de Agent Plugins 1.0.0.
- `.codex-plugin/plugin.json`: metadatos de compatibilidad con el formato de plugins de Codex.
- `skills/`: copia empaquetada de las skills propias del repositorio.
- `mcp.json`: configuración portable de los MCP de GitHub y Buffer, sin credenciales.
- `.mcp.json`: equivalente consumible por el adaptador de Codex.
- `scripts/sync-from-repo.mjs`: actualiza la copia empaquetada desde `../../skills`.

## Límites de seguridad

Este directorio no es parte del build de Astro ni de la salida pública. La fuente de verdad operativa sigue siendo `skills/` en la raíz del repositorio; el paquete se mantiene como una copia aislada para distribución.

Los MCP de GitHub y Buffer sólo declaran sus endpoints oficiales. La autenticación la gestiona el cliente que instala el plugin; Buffer usa OAuth. No se guardan tokens, claves ni archivos `.env` aquí. Los MCP personales de Notion, Azure, Supabase, Discord, Zammad y el runtime local no se incluyen.

`cineposta-redes-sociales` gestiona X e Instagram con Buffer MCP y las fuentes del catálogo. Incluye preparación de placas, carruseles, Stories y Reels, programación, borradores y estados. No modifica la automatización diaria de X. La nueva automatización de Instagram se documenta en `docs/buffer-instagram-automation.md` del repositorio.

Las skills de películas comparten el contrato editorial vigente: `cinepostaScore` es la única fuente de verdad para títulos valorados, siempre como entero de 1 a 10, y la etiqueta canónica se deriva. No se persisten `verdict`, `verdictLabel`, `absoluteCinema` ni etiquetas personalizadas, y no se inventa un score para una película todavía no rankeada.

## Sincronizar skills

Desde la raíz del repositorio:

```bash
node plugins/la-posta-cine/scripts/sync-from-repo.mjs
```

Para alinear además las skills locales de Codex con la fuente versionada:

```bash
node plugins/la-posta-cine/scripts/sync-from-repo.mjs --install
```

`--install` copia las skills de Cine Posta a `$CODEX_HOME/skills` o, si esa variable no está definida, a la carpeta `.codex/skills` del usuario actual. No modifica otras skills instaladas. Después de sincronizar, validá cada skill, el manifiesto del plugin y las checks normales del repositorio antes de publicarlo.
