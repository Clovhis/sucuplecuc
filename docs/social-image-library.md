# Biblioteca editorial central de CinePosta

Proyecto Supabase `bftcrexcwktyiqsermni`; sólo Instagram integrado. Los pósters, personas del sitio, ratings, trivia, comunidad, autenticación y automatización de X no cambian.

## Arquitectura y derechos

`social_media_assets` es la fuente operativa de fotografías aprobadas. `metadata` conserva identidad, películas/persona, fuente, autor, licencia, permisos, fecha de verificación, territorio, embargo/vencimiento, dimensiones y hashes. `evidence` permite consultar la evidencia; `evidence_raw` conserva sus bytes exactos para verificar `evidenceSha256`. El registro Git `assets/social/instagram-rights.json` y los snapshots de evidencia conservan la procedencia revisable, pero el cron consulta Supabase, sin investigar permisos cada día.

El bucket **privado** `cineposta-social` almacena WebP ≤2 MiB en `movies/<asset-id>/<sha256>.webp`, `people/...` o `events/...`. La ruta por hash es estable e inmutable. No se usa un bucket público: los buckets públicos omiten el control de lectura RLS. Lectura sin sesión de usuario mediante la clave *publishable* y el endpoint `/storage/v1/object/authenticated/...`; RLS habilita únicamente registros aprobados, territorio AR/worldwide y vigencia válida. Es acceso público con clave pública, no una service-role key. Las URLs de esta biblioteca necesitan ese encabezado: **no se envían directamente a Buffer**.

Los grants SQL no permiten escrituras de `anon`/`authenticated`. Los administradores importan mediante Storage API; nunca se insertan filas de `storage.objects` manualmente. La metadata exige FK a un objeto real, hash/ruta/ID únicos, dimensiones válidas y coherencia con la evidencia registrada. La validación administrativa decodifica con Sharp y comprueba referencias de películas/personas contra el catálogo local. Los objetos deben cargarse antes de aprobar su metadata: durante ese intervalo no se pueden leer públicamente. Un fallo de registro deja un huérfano inaccesible para revisión administrativa, nunca una foto automáticamente aprobada.

## Generación diaria y recuperación

`instagram-images.mjs` usa Supabase por defecto; `SOCIAL_LIBRARY_BACKEND=supabase` queda explícito en Actions. El modo `local` es sólo una herramienta de revisión del respaldo histórico de 16 fotos; no es recuperación automática y no incluye las 12 fotos nuevas que existen exclusivamente en Storage.

1. Leer metadata aprobada y validar el hash de su evidencia y permiso.
2. Seleccionar películas inéditas; priorizar stills/backdrops sobre retratos y evitar fotografías recientes cuando existen alternativas.
3. Descargar WebP, verificar SHA-256 y cachear por hash en `.tmp/social-library-cache/`. La caché sólo evita descargas de bytes; no sustituye la consulta actual de permisos.
4. Renderizar JPEG 1080×1350, preservar créditos completos y permisos de adaptación.
5. Reservar historial y medios finales en `cineposta-instagram-state`, verificar sus URLs públicas fijadas a SHA, programar Buffer y persistir recibo. Este protocolo no cambió.

Si falla Supabase, no se elige material de metadata obsoleta: el job falla antes de reservar. Una descarga corrupta falla sin enviarse a Buffer. No hay fallback abstracto, reinicio de historial ni reintento automático de mutaciones ambiguas. Los JPEG ya aceptados por Buffer siguen disponibles en GitHub aunque Supabase falle. No borrar ni sustituir esos archivos ni sus commits históricos durante una migración.

`social_media_asset_usage` registra usos por asset/canal/post, compatible con X futuro sin integrarlo ahora. La Edge Function `cineposta-social-usage` lee exclusivamente la URL fija del historial público de Instagram y hace upsert idempotente de recibos `scheduled`/`sent`. Se autentica con una capacidad dedicada, `SOCIAL_LIBRARY_USAGE_KEY`, secret de Actions; sólo su hash figura en el código. La service-role key permanece dentro del entorno de Supabase. El body HTTP no puede elegir assets, canal ni URL. El paso corre después de persistir el recibo y tolera fallos: el historial continúa siendo autoridad para no duplicar. Reejecutar `node scripts/sync-social-library-usage.mjs` con ese secret reconcilia sin crear posts. Al rotar esta capacidad, actualizar secret y hash de la función conjuntamente. La función de bootstrap de migración quedó deshabilitada (410).

## Administración y mantenimiento

```powershell
# Auditoría de lectura: descarga/hash/decodificación/permisos de todos los aprobados
node scripts/manage-social-library.mjs
# Simulación de tres días desde el historial real, sin mutaciones ni Buffer key
node scripts/simulate-instagram-library.mjs
npm run social:instagram:preview
npm run test:buffer:instagram
# Importar sólo después de revisión visual y legal explícita; clave administrativa
# mediante gestor seguro/entorno de operador. Nunca guardarla en .env versionado.
node scripts/manage-social-library.mjs --import --id=commons-ID
```

`SOCIAL_LIBRARY_ADMIN_KEY` es una credencial administrativa de operador, **no necesaria en Actions diario**. El importador existente de Commons prepara imágenes/evidencia localmente; detenerse ante 429 y revisar identidad, derechos y restricciones antes de aprobar. Optimizar nuevas fotos con Sharp a máximo 1920 px, WebP calidad 82 y ≤2 MiB. Conservar los hashes del original y del resultado, evidencia, crédito y cambios. No reoptimizar un objeto ya publicado bajo el mismo hash. Ante un hash ya registrado, reutilizarlo sin segunda copia. Los afiches se excluyen de esta importación a Storage.

Revisión periódica administrativa mediante MCP/SQL (no elimina nada):

```sql
-- Huérfanos: cargas sin metadata; revisar antes de eliminar mediante Storage API.
select o.id,o.name from storage.objects o
where o.bucket_id='cineposta-social'
and not exists(select 1 from public.social_media_assets a where a.object_id=o.id);
-- Permisos vencidos/por vencer; no borrar fotos usadas en publicaciones históricas.
select id,status,expires_on,embargo_until from public.social_media_assets
where expires_on <= current_date + 30 or embargo_until > current_date;
-- Uso y presupuesto real de objetos.
select count(*),sum(bytes) from public.social_media_assets;
select asset_id,count(*),max(used_at) from public.social_media_asset_usage group by asset_id;
```

Para restringir un asset, cambiar `status` a `restricted` administrativamente: desaparece de selección y lectura Storage. No borrar medios finales de posts existentes automáticamente. RLS y caché no revocan copias que alguien ya descargó; una retirada legal de una publicación requiere revisión específica del post y sus medios finales.

## Resultado comprobado — 14/11/2026

- 28 fotos, 28 hashes únicos, **13.780.030 bytes** (~13,14 MiB), cero huérfanos. Migradas las 16 originales sin alterar hashes ni evidencia; conservadas como respaldo Git. Las 12 adicionales no duplican sus binarios en GitHub.
- Son fotografías de personas/eventos, **no stills ni backdrops de películas**. Se sumaron DeVito, Eastwood, Harris, Willis, Bale, Gyllenhaal, Phoenix, Foster, Jackson, Scorsese, Carrey y Burton. Las fotos se revisaron visualmente; archivo corrupto rechazado y descargas detenidas ante 429 de Wikimedia. Los candidatos pendientes no cuentan como material autorizado. No se alcanzaron 150–200; faltan permisos específicos para priorizar escenas oficiales. TMDB sólo descubre, no autoriza. Ver [política de derechos](instagram-image-rights.md) y [fuentes de prensa investigadas](social-press-kits.md).
- 6 asociaciones foto/post registradas para los dos recibos existentes. KATSEYE `sent`; carrusel 15/11 19:15 ART `scheduled`, mismos IDs y URLs. Ninguna mutación de esos posts.
- Simulación 16–18/11: doble función (3 placas), score (1), ranking (6), sin repetir películas. Los cinco formatos pasaron render completo; 30 pruebas incluyen corrupción/caché, caída de Supabase e integridad de evidencia. Escritura anónima y lectura de recurso restringido bloqueadas; sync de uso sin capacidad devuelve 401 y autenticado 200.
- PostgreSQL medido: 65.563.795 bytes (~62,53 MiB), incluyendo las tablas existentes; sólo se crearon las dos tablas sociales. Advisors detectan advertencias preexistentes fuera de alcance (por ejemplo vistas security-definer); no se alteraron tablas/funciones ajenas. La tabla de uso intencionalmente no tiene política pública.

## Free y transferencia

Plan Free verificado: 500 MB de DB, 1 GB Storage, 5 GB egress y 5 GB cached egress; pausa tras una semana de inactividad. Se usan servicios existentes, sin dependencias nuevas ni APIs pagas. Las fotos son ~1,4% del GB de Storage. Estimación conservadora de 6 fotos ×2 MiB ×31 días: ≤372 MiB/mes para una ejecución diaria, más pruebas/auditorías y el resto del proyecto. Es una estimación, **no el consumo facturado**: el MCP conectado no expone el contador de egress del período; revisarlo en Usage del Dashboard. El bucket privado y las cuotas compartidas del proyecto no deben confundirse con almacenamiento ilimitado. Los medios finales para Buffer se sirven desde GitHub y no generan descargas públicas adicionales del bucket.

Fuentes oficiales consultadas: [Storage y acceso](https://supabase.com/docs/guides/storage/security/access-control), [buckets públicos/privados](https://supabase.com/docs/guides/storage/buckets/fundamentals), [límites Free](https://supabase.com/pricing). Receta del esquema en `supabase/sql/social_media_assets.sql`; cuatro migraciones aplicadas por MCP. La receta no se reejecuta sobre un proyecto ya migrado.
