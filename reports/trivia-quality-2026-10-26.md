# Revisión de calidad de la trivia — 26/10/2026

## Alcance

Banco reconstruido: **2658 preguntas**. Auditoría exhaustiva de todas las ternas; cero fallos en las reglas de elegibilidad. Se revisaron además muestras de partidas y preguntas de distintos géneros y cine argentino. No se afirma una revisión humana individual ni verificación externa de todas las sinopsis del catálogo.

| Tipo | Preguntas |
| --- | ---: |
| La historia | 1114 |
| Dirección | 746 |
| Duplas | 782 |
| Premios | 15 |
| Postcréditos | 1 |

1.114 preguntas de historias. 101 preguntas con películas argentinas y 2.557 internacionales; las alternativas de cada pregunta conservan ese contexto. Cada partida reserva al menos 12 historias y como máximo seis preguntas de reparto/dirección. Se usan historias nuevas antes de repetir premios o postcréditos agotados.

## Descartes completos de la generación

| Motivo | Candidatos |
| --- | ---: |
| title-or-iconic-character-giveaway | 587 |
| fewer-than-two-credible-distractors | 3518 |
| duplicate-prompt | 244 |

Las consignas por año de estreno se retiraron. Los años no se muestran mientras se responde. Exactamente tres opciones, películas distintas, plausibilidad de género/época/formato/producción y coincidencia parcial de créditos obligatoria en preguntas de personas. Se evitan alternativas de la misma familia de títulos. La clasificación semántica es conservadora y ampliable; no garantiza que todas las preguntas resulten difíciles para cada jugador.

## Fuentes apartadas del juego

- `spider-man-2002`: La ficha mezcla la identidad de la película de 2002 con créditos y sinopsis de otra obra. No usarla tampoco como distractor. Evidencia: https://www.sonypictures.com/movies/spiderman
- `shelter-2026`: La sinopsis del búnker no corresponde a la película de Jason Statham. Excluir de preguntas y alternativas. Evidencia: https://sheltermovie.com/synopsis/

Quedaron excluidas también como distractores. Las fichas originales no se modificaron; la cuarentena evita trasladar sus inconsistencias a la trivia.

## Ejemplos de ternas reconstruidas

- **Un jurado se resiste a condenar a un adolescente y obliga a los otros once a revisar las pruebas. ¿Qué película transcurre casi por completo en esa deliberación?** Opciones: 12 Angry Men / The Bridge on the River Kwai / Senderos de gloria.
- **¿Qué película cuenta esta historia? El hijo de un candidato a la alcaldía de Los Ángeles es secuestrado, y sus padres reciben unas pocas horas para reunir el rescate.** Opciones: Animales (Ben Affleck) / Culpable / Sin rastro.
- **¿En qué película comparten elenco Cate Blanchett y Kevin Hart?** Opciones: Borderlands: El destino del universo está en juego / Padre Madre Hermana Hermano / Robin Hood.
- **¿Qué película cuenta esta historia? Una pareja de buscadores de tesoros separada por el desgaste vuelve a trabajar junta cuando aparece una pista sobre un cargamento de oro perdido en el Caribe.** Opciones: Fantastic Beasts: The Secrets of Dumbledore / Como locos... a por el oro / Pirates of the Caribbean: Dead Man's Chest.
- **¿Qué película cuenta esta historia? Un elefante pequeño, ridiculizado por sus orejas enormes, descubre que puede volar y transforma esa diferencia en una oportunidad para recuperar a su madre.** Opciones: Peter Pan / La Cenicienta / Dumbo.
- **¿Qué película cuenta esta historia? Darby Shaw, estudiante de Derecho, redacta una teoría sobre los asesinatos de dos jueces de la Corte Suprema.** Opciones: El informe Pelícano / Seduciendo a un extraño / Cálculo mortal.
- **¿En qué película comparten elenco Liam Neeson y Kerry Condon?** Opciones: Venganza bajo cero / Caminando entre las tumbas / En tierra de santos y pecadores.
- **¿En qué película se cruzan Adam Sandler en el reparto y Valerie Breiman en la dirección?** Opciones: Going Overboard / Happy Gilmore / El hijo del Diablo.
- **¿En qué película se cruzan Brad Pitt en el reparto y Quentin Tarantino en la dirección?** Opciones: Django Unchained / Inglourious Basterds / F1: The Movie.
- **En una base antártica, una criatura puede imitar a cualquier ser vivo. Nadie sabe quién sigue siendo humano. ¿Qué película construye su terror con esa desconfianza?** Opciones: La cosa / La novia de Chucky / Stephen King's IT.
- **¿En qué película se cruzan Patton Oswalt en el reparto y Chris Renaud en la dirección?** Opciones: Ratatouille / La vida secreta de tus mascotas 2 / El Lorax: En busca de la trúfula perdida.
- **¿En qué película comparten elenco Alan Alda y Woody Allen?** Opciones: La última noche de Boris Grushenko / La maldición del escorpión de jade / Misterioso asesinato en Manhattan.
- **¿En qué película se cruzan Bob Dylan en el reparto y Martin Scorsese en la dirección?** Opciones: Shine a Light / No Direction Home: Bob Dylan / Hablar en público.
- **¿En qué película comparten elenco Yōji Matsuda y Yuriko Ishida?** Opciones: Princess Mononoke / La colina de las amapolas / Nausicaa of the Valley of the Wind.
- **¿Qué película cuenta esta historia? Mr. T revisa el camino que lo convirtió en un ícono de los años ochenta y vuelve sobre la persona detrás de la cresta, las cadenas y la frase que lo hizo reconocible en todo el mundo.** Opciones: Travis Barker: Más allá del miedo / May Contain: My Life / Secretos del deporte: Mr. T.
- **¿En qué película se cruzan Arnold Schwarzenegger en el reparto y Jonathan Mostow en la dirección?** Opciones: Depredador / Batman & Robin / Terminator 3: Rise of the Machines.
- **¿En qué película comparten elenco Meryl Streep y Tom Hanks?** Opciones: Camino a la perdición / Los archivos del Pentágono / Leones por corderos.
- **¿Qué película cuenta esta historia? Un administrador de un edificio de lujo descubre que el millonario que estafó a sus empleados está protegido por la ley.** Opciones: Un golpe de altura / The Grand Budapest Hotel / Escándalo americano.
- **¿En qué película se cruzan Mone Kamishiraishi en el reparto y Makoto Shinkai en la dirección?** Opciones: El tiempo contigo / Suzume / Your Name..

## Validación

- `npm run test:trivia`: once pruebas de banco, regresiones de dificultad, selección, perfiles, SQL, puntuación y seguridad. Incluye `audit:trivia` sobre todas las preguntas.
- Supabase: sincronización privada y migración del selector. Los snapshots de partidas anteriores se conservan. No se reinician jugadores ni récords.
- `npm run check`: cero errores, advertencias o hints.
- Microsoft Edge con CDP nativo, sin Playwright: 49 comprobaciones locales en 320, 390, 600, 768, 1024 y 1440 px, y 844 × 390 horizontal. Sin errores JS, overflow ni controles menores a 44 px; años ocultos antes de responder, mezcla del servidor, fotos y consignas narrativas, pistas, desconexión, vencimiento, resumen de 20 fichas y enlaces HTTP 200. Usuarios de prueba identificados y eliminados.
- Banco privado sincronizado: `edcb7d00f8272a6ea03fc4df6fd298c8f6c3390045ecbb13034773043df31fd0`. Migración aplicada conservando nueve jugadores y ocho mejores puntajes presentes al aplicarla.
- La publicación exige también el hook de contenido/build y la verificación del despliegue del mismo commit.

El detalle reproducible está en `npm run audit:trivia`; el JSON de todas las ternas se escribe en `test-results/trivia-question-audit.json` (ignorado por Git).

La comparación de dirección descompone las codirecciones y descarta cualquier distractor que comparta actor y un director de la pista, aunque su ficha guarde una lista parcial o en otro orden. Se probaron todas las preguntas de dirección con esta condición adicional.
