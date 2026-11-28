# Biblioteca editorial central de CinePosta

Proyecto Supabase `bftcrexcwktyiqsermni` para la biblioteca editorial.

## Estado vigente — 15/11/2026

**163 fotos / 43.789.076 bytes (41,76 MiB)**, 163 hashes distintos, cero huérfanos. Se incorporaron 135 imágenes a las 28 anteriores: 40 stills cinematográficos y 15 retratos de dirección desde paquetes de prensa, más 80 retratos internacionales con licencias verificadas. Hay tres permisos reutilizables y dieciséis paquetes con evidencia. La sección de resultados del 14/11 se conserva como historial de la migración inicial.

La simulación histórica cubrió 60 ediciones sin repetir películas: 168 títulos, 103 fotos, los cinco formatos. **Las escenas abarcan actualmente 16 películas**; con la exclusión histórica permanente no equivalen a 60 publicaciones distintas hechas exclusivamente con stills: la simulación contiene siete ediciones con escenas y el resto utiliza también retratos. Es capacidad editorial con variedad de formatos, no una promesa de sesenta estrenos ni de sesenta películas con escenas.

Ver [política práctica de prensa y operación de cargas](social-editorial-acquisition.md) y [reporte completo](../reports/social/editorial-library-2026-11-15.json).

## Arquitectura y derechos

`social_media_assets` es la fuente operativa de fotografías aprobadas. `metadata` conserva identidad, películas/persona, fuente, autor, licencia, permisos, fecha de verificación, territorio, embargo/vencimiento, dimensiones y hashes. `evidence` permite consultar la evidencia; `evidence_raw` conserva sus bytes exactos para verificar `evidenceSha256`. El registro Git `assets/social/instagram-rights.json` y los snapshots de evidencia conservan la procedencia revisable.

El bucket **privado** `cineposta-social` almacena WebP ≤2 MiB en `movies/<asset-id>/<sha256>.webp`, `people/...` o `events/...`. La ruta por hash es estable e inmutable. No se usa un bucket público: los buckets públicos omiten el control de lectura RLS. Lectura sin sesión de usuario mediante la clave *publishable* y el endpoint `/storage/v1/object/authenticated/...`; RLS habilita únicamente registros aprobados, territorio AR/worldwide y vigencia válida. Es acceso público con clave pública, no una service-role key. Las URLs de esta biblioteca necesitan ese encabezado: **no se envían directamente a Buffer**.

Los grants SQL no permiten escrituras de `anon`/`authenticated`. Los administradores importan mediante Storage API; nunca se insertan filas de `storage.objects` manualmente. La metadata exige FK a un objeto real, hash/ruta/ID únicos, dimensiones válidas y coherencia con la evidencia registrada. La validación administrativa decodifica con Sharp y comprueba referencias de películas/personas contra el catálogo local. Los objetos deben cargarse antes de aprobar su metadata: durante ese intervalo no se pueden leer públicamente. Un fallo de registro deja un huérfano inaccesible para revisión administrativa, nunca una foto automáticamente aprobada.

## Historial de Instagram

El flujo diario se retiró el 27/11/2026. La rama `cineposta-instagram-state` conserva JPEG y recibos históricos. `social_media_asset_usage` conserva los registros de uso ya sincronizados. La biblioteca permanece disponible para la selección editorial manual.

## Administración y mantenimiento

```powershell
# Auditoría de lectura: descarga/hash/decodificación/permisos de todos los aprobados
node scripts/manage-social-library.mjs
npm run test:social:library
# Importar sólo después de revisión visual y legal explícita; clave administrativa
# mediante gestor seguro/entorno de operador. Nunca guardarla en .env versionado.
node scripts/manage-social-library.mjs --import --id=commons-ID
```

`SOCIAL_LIBRARY_ADMIN_KEY` es una credencial administrativa de operador. El importador existente de Commons prepara imágenes/evidencia localmente; detenerse ante 429 y revisar identidad, derechos y restricciones antes de aprobar. Optimizar nuevas fotos con Sharp a máximo 1920 px, WebP calidad 82 y ≤2 MiB. Conservar los hashes del original y del resultado, evidencia, crédito y cambios. No reoptimizar un objeto ya publicado bajo el mismo hash. Ante un hash ya registrado, reutilizarlo sin segunda copia. Los afiches se excluyen de esta importación a Storage.

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

Fuentes oficiales consultadas: [Storage y acceso](https://supabase.com/docs/guides/storage/security/access-control), [buckets públicos/privados](https://supabase.com/docs/guides/storage/buckets/fundamentals), [límites Free](https://supabase.com/pricing). Receta del esquema en `supabase/sql/social_media_assets.sql`; cuatro migraciones iniciales y dos de permisos reutilizables aplicadas por MCP. La receta no se reejecuta sobre un proyecto ya migrado.
