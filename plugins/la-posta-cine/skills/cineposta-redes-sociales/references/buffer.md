# Buffer: conexión y operaciones

En Codex local, el alta oficial es `codex mcp add buffer --url https://mcp.buffer.com/mcp`; abre OAuth. Para renovar una conexión OAuth, `codex mcp login buffer`. Leo completa el inicio de sesión/consentimiento. No copies tokens ni claves al chat, archivos versionados, plugin o Actions. El MCP usa OAuth local; el job independiente usa el secret personal existente `BUFFER_API_KEY`. No son intercambiables.

Si existía `bearer_token_env_var = "BUFFER_API_KEY"` y esa clave da 401, agregar de nuevo el mismo servidor con el comando oficial lo pasa a OAuth. No reemplaces ni revoques la clave de Actions. Si el MCP sigue ausente en el chat actual, reconectá/reiniciá el cliente o abrí sesión nueva; el registro de configuración por sí solo no prueba acceso.

Preflight real de lectura: `get_account` → canales de la organización → detalles del canal → posts de ese canal. La conexión está probada cuando esas llamadas responden; no hace falta publicar una prueba. Los nombres de herramientas pueden llevar prefijo del cliente.

Snapshot de identificación, **revalidar en vivo**: organización `6a9d88d88ecb84720dd91cc1`; X `6a9d89a6cd8b9c702c191cd9`; Instagram `6af6465a62b70b94b0105899`. Instagram debe ser `business` en el esquema de Buffer (cuenta profesional), `isDisconnected=false`, `isLocked=false`, `isQueuePaused=false`, `metadata.defaultToReminders=false`. Un perfil personal sólo admite recordatorio y no sirve para el job automático.

`list_posts`: `organizationId`, `channelIds`, `status`, `first` hasta 100, `after` con cursor (nunca un ID). Leé `pageInfo` hasta cubrir la búsqueda. Los límites vivos y `Retry-After` mandan; no hagas polling continuo ni consultes métricas si sólo necesitás cola/estados.

Ejemplo conceptual de programación por MCP (usar IDs descubiertos, texto y medios reales):

```json
{
  "channelId": "ID_VERIFICADO",
  "schedulingType": "automatic",
  "mode": "customScheduled",
  "dueAt": "FECHA_FUTURA_T19:15:00-03:00",
  "text": "CAPTION_ORIGINAL",
  "assets": [{"image": {"url": "URL_PUBLICA_ESTABLE", "metadata": {"altText": "DESCRIPCION_REAL"}}}],
  "metadata": {"instagram": {"type": "post", "shouldShareToFeed": true}}
}
```

No uses los valores ilustrativos como una publicación de prueba. Para borrador, `saveToDraft=true`; para inmediato, `mode=shareNow` sin `dueAt`. Si editás, omití lo que no cambia: las listas y el objeto de metadatos enviado reemplazan su valor completo, y los metadatos Instagram enviados deben mantener sus miembros obligatorios. Respetá `allowedActions` del post.

Fuentes oficiales, consultadas el 12/11/2026:

- [Codex y Buffer por OAuth](https://developers.buffer.com/guides/integrations/chatgpt.html)
- [Herramientas MCP y cuotas](https://developers.buffer.com/guides/integrations/mcp.html)
- [Conectar Instagram](https://support.buffer.com/articles/connecting-your-instagram-account-to-buffer-n9Ad6veXsu)
- [Free y sus límites](https://buffer.com/pricing)
