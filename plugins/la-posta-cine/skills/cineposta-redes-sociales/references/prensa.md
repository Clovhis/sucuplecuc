# Press kits, clips y sonido para Reels

Desde la raíz del repositorio, leé `docs/social-press-kits.md` cuando el pedido necesite fotos oficiales, EPK, B-roll, spots, clips, música o sonido de una película. Esa guía reúne portales comprobados, rutas de acceso, alcance y el proyecto piloto de Cómo robar un banco. Si la skill se usa fuera de un checkout con esa guía, localizá primero el repo de CinePosta; no inventes un portal ni un permiso.

Empezá por distribuidor argentino → sitio de prensa enlazado oficialmente → estudio → otro distribuidor oficial, conservando identidad de título/año y datos AR separados del territorio de los materiales. Un kit puede exigir acreditación gratuita. Un login o 403 se registra como acceso pendiente: no exportar sesiones, extraer tokens ni eludir el acceso.

Para cada foto/clip/audio, guardá origen, crédito y evidencia del alcance de reutilización. El acceso público y la invitación editorial de un portal no equivalen automáticamente a permiso de remix de música o publicidad paga. No uses condiciones de Sony Electronics para Sony Pictures, ni las de un logo para clips de un film. La música incluida en un tráiler/spot autorizado se mantiene dentro del uso concedido; no convertirla en una pista libre separada.

Con permiso pendiente, avanzar con investigación, guion y maqueta local identificada; no subir esos assets a GitHub público ni a Buffer. Resolver el alcance con el distribuidor o sustituir por material con alcance comprobado. Preparar una solicitud no autoriza enviarla: hacelo sólo si el usuario pidió contactar a esa persona/empresa.

Para una pieza dinámica, `npm run social:reel -- --project proyecto.json --out .tmp/carpeta-nueva` crea un montaje vertical con fotos en movimiento, entrada de títulos, cortes y audio original sin samples. El proyecto registra las fuentes y el recibo conserva hashes. Por defecto es una maqueta local; `--release` exige evidencia por asset y no publica nada. No marcar `cleared` sólo para pasar el gate. Los Reels de clips reales pueden montarse con FFmpeg cuando el paquete permita edición; no convertir fotos animadas en una afirmación de que hay escenas de vídeo del film.

La versión diaria de Instagram sigue siendo el feed automatizado existente hasta un pedido explícito de cambiarla. Una pieza especial no autoriza cambiar cron, historial, clave ni automatización de X.
