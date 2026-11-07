import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const candidatePath = path.join(dir, 'pre1980-candidates.json');
const metadataPath = path.join(dir, 'pre1980-metadata.json');

const candidates = [
  {
    title: 'Mary Poppins', originalTitle: 'Mary Poppins', year: 1964, slug: 'mary-poppins-1964',
    duplicateGate: 'npm run new-movie -- --title --original-title --year --slug --dry-run --json: duplicates=[]; Argentina title and exact year checked',
    justwatch: 'https://www.justwatch.com/ar/pelicula/mary-poppins',
    providers: [{ name: 'Disney Plus', type: 'FLATRATE' }],
    posterSource: 'https://www.posterpalace.com/cdn/shop/files/mary-poppins-posterpalacecom-712210.jpg?v=1762922013',
    posterSourceDimensions: '2070x3131',
    trailer: 'https://www.youtube.com/watch?v=6TLIi28kNYg',
    trailerChannel: 'Animation Compendia; title identifies the 1964 original theatrical trailer, verified by YouTube oEmbed',
    creditsSource: 'https://www.disneyplus.com/es-ar/browse/entity/f63db666-b097-4c61-99c1-b778de2d4ae1',
    credits: ['Robert Stevenson', 'Julie Andrews', 'Dick Van Dyke'],
    scoreSource: 'https://www.rottentomatoes.com/m/mary_poppins', scoreMetric: 'Popcornmeter', raw: '86%', sample: '250,000+ ratings', normalized: 9, cinepostaScore: 9,
    scoreDecision: '9 justified by durable, title-specific achievement: AFI ranks it #6 among its greatest movie musicals; the Library of Congress National Film Registry preserves it; it won five Academy Awards including for its hybrid visual effects. The strong 250,000+ audience sample independently normalizes to 9.',
    masterpieceSources: ['https://www.afi.com/news/afi-movie-club-mary-poppins/', 'https://catalog.afi.com/Catalog/moviedetails/23290', 'https://www.oscars.org/oscars/ceremonies/1965', 'https://www.loc.gov/static/portals/about/documents/gazette/Gazette_23_060923_web.pdf'],
    awards: { wins: [
      { award: 'oscar', category: 'Mejor actriz', recipient: 'Julie Andrews', year: 1965 },
      { award: 'oscar', category: 'Mejor montaje', recipient: 'Cotton Warburton', year: 1965 },
      { award: 'oscar', category: 'Mejor banda sonora original', recipient: 'Richard M. Sherman, Robert B. Sherman', year: 1965 },
      { award: 'oscar', category: 'Mejor canción original', recipient: 'Richard M. Sherman, Robert B. Sherman', year: 1965 },
      { award: 'oscar', category: 'Mejores efectos visuales', recipient: 'Peter Ellenshaw, Eustace Lycett, Hamilton Luske', year: 1965 },
    ] },
  },
  {
    title: 'La violencia está en nosotros', originalTitle: 'Deliverance', year: 1972, slug: 'la-violencia-esta-en-nosotros-1972',
    duplicateGate: 'npm run new-movie -- --title --original-title --year --slug --dry-run --json: duplicates=[]; exact original/local Argentine title and year checked',
    justwatch: 'https://www.justwatch.com/ar/pelicula/defensa', providers: [{ name: 'HBO Max', type: 'FLATRATE' }],
    localizedTitleSources: ['https://cineyseries.net/pelicula/Amarga-pesadilla-17671', 'https://www.imdb.com/title/tt0068473/releaseinfo/'],
    posterSource: 'https://www.impawards.com/1972/posters/deliverance_ver2_xlg.jpg', posterSourceDimensions: '996x1500',
    trailer: 'https://www.youtube.com/watch?v=sckWeXMLsac', trailerChannel: 'Warner Bros. Rewind (verified official channel); original theatrical trailer; YouTube oEmbed verified',
    creditsSource: 'https://catalog.afi.com/Film/54452-deliverance', credits: ['John Boorman', 'Jon Voight', 'Burt Reynolds', 'Ned Beatty'],
    scoreSource: 'https://www.rottentomatoes.com/m/deliverance', scoreMetric: 'Popcornmeter', raw: '82%', sample: '25,000+ ratings', normalized: 8, cinepostaScore: 8,
    scoreDecision: '82% normalizes to 8. The acclaim, awards attention and genre influence do not alone establish the exceptional, enduring formal achievement reserved for 9.',
    awards: { wins: [], note: 'No award win was confirmed; nominations are not reported as wins.' },
  },
  {
    title: 'Llegan los Muppets', originalTitle: 'The Muppet Movie', year: 1979, slug: 'llegan-los-muppets-1979',
    duplicateGate: 'npm run new-movie -- --title --original-title --year --slug --dry-run --json: duplicates=[]; Argentine title and exact year checked',
    justwatch: 'https://www.justwatch.com/ar/pelicula/la-pelicula-de-los-telenecos', providers: [{ name: 'Disney Plus', type: 'FLATRATE' }],
    localizedTitleSources: ['https://www.lanacion.com.ar/espectaculos/top-5-peliculas-de-los-muppets-nid1686570/', 'https://lumiton.ar/evento/llegan-los-muppets/', 'https://www.mardelplatafilmfest.com/libros/24-Festival-Catalogo.pdf'],
    posterSource: 'https://www.impawards.com/1979/posters/muppet_movie_ver1_xxlg.jpg', posterSourceDimensions: '1970x3000',
    trailer: 'https://www.youtube.com/watch?v=EYFQqSP7sj0', trailerChannel: 'Trailer World; original theatrical trailer labelled with exact title/year; YouTube oEmbed verified',
    creditsSource: 'https://catalog.afi.com/Film/56143-THE-MUPPET-MOVIE?cxt=filmography', credits: ['James Frawley', 'Jim Henson', 'Frank Oz'],
    scoreSource: 'https://www.rottentomatoes.com/m/muppet_movie', scoreMetric: 'Popcornmeter', raw: '88%', sample: '50,000+ ratings', normalized: 9, cinepostaScore: 8,
    scoreDecision: '88% normalizes to 9, but the editorial score stays at 8: its first-feature significance and durable popular following are not enough evidence of the exceptional artistic distinction required for the 9 tier.',
    awards: { wins: [], note: 'No award win was confirmed; the 1980 original-song nomination is not reported as a win.' },
  },
];

const metadata = [
  {
    slug: 'mary-poppins-1964', audienceRating: 'ATP', releasePlatform: 'Disney Plus', director: 'Robert Stevenson',
    mainCast: ['Julie Andrews', 'Dick Van Dyke'], productionCompany: 'Walt Disney Productions', cinepostaScore: 9,
    runtimeMinutes: 139, category: 'Musical', genres: ['Musical', 'Fantasía', 'Familia', 'Comedia'], trailerYoutubeId: '6TLIi28kNYg',
    country: 'US', isArgentinian: false,
    becauseYouLiked: ['the-sound-of-music-1965'],
    related: ['101-dalmatas-1961', 'el-libro-de-la-selva-1967', 'encanto-2021'],
    awards: candidates[0].awards,
    synopsis: 'En el Londres de los Banks, una nueva niñera aparece cuando Jane y Michael necesitan que sus padres vuelvan a mirarlos. Mary Poppins y Bert convierten las tareas y los paseos por la ciudad en una sucesión de juegos que también altera la rutina de los adultos.',
    review: 'Robert Stevenson combina números musicales, animación y acción real sin dejar que el truco visual se coma la vida de la familia Banks. Julie Andrews sostiene a Mary con una serenidad que puede ser afectuosa o implacable según lo que la escena necesite; Dick Van Dyke le da a Bert el movimiento de un artista que siempre está inventando otro oficio. La película cambió la escala de lo que Disney podía hacer con una intérprete y un decorado, y todavía encuentra emoción en algo más simple que la magia: un padre aprendiendo a prestar atención.',
    tenSecondTake: {
      verdict: 'Mary Poppins no llega a ordenar una casa: empuja a una familia a prestarse atención.',
      whatToExpect: 'Julie Andrews encabeza canciones, fantasía urbana londinense y juegos animados que cambian las prioridades de los Banks.',
      pace: 'Los números musicales interrumpen la rutina con excursiones imaginativas; cada vuelta a casa modifica un poco el ánimo de los Banks.',
      intensity: 'El tono es familiar y luminoso, con conflictos adultos tratados desde la mirada de dos chicos.',
      practicalContext: 'La mezcla de animación y acción real es parte del espectáculo: mirá cómo los personajes pasan de la calle a los dibujos sin cambiar la lógica del juego.',
      forFansOf: 'Musicales clásicos que usan la fantasía para hablar de vínculos y vida familiar.',
      notForYouIf: 'Preferís una aventura fantástica de ritmo continuo o no conectás con los números musicales tradicionales.',
    },
  },
  {
    slug: 'la-violencia-esta-en-nosotros-1972', audienceRating: '+17', releasePlatform: 'HBO Max', director: 'John Boorman',
    mainCast: ['Jon Voight', 'Burt Reynolds', 'Ned Beatty'], productionCompany: 'Elmer Enterprises, Warner Bros.', cinepostaScore: 8,
    runtimeMinutes: 109, category: 'Thriller', genres: ['Thriller', 'Aventura', 'Drama'], trailerYoutubeId: 'sckWeXMLsac',
    country: 'US', isArgentinian: false, awards: { wins: [] },
    becauseYouLiked: ['el-renacido-2015'],
    related: ['apocalypse-now-1979', 'infierno-blanco-2012', 'naufrago-2000'],
    synopsis: 'Cuatro amigos de Atlanta descienden en canoa por un río de los Apalaches antes de que una represa transforme el valle. El paseo se rompe tras un encuentro violento y el grupo debe encontrar la salida mientras el río y sus propias decisiones reducen sus opciones.',
    review: 'Boorman transforma el río en una presión que no ofrece respuestas limpias: los amigos llegaron a probarse en la naturaleza y terminan midiendo el costo de lo que hacen para sobrevivir. Voight y Reynolds sostienen temperamentos opuestos, mientras Ned Beatty evita que el grupo quede reducido a una disputa de egos. Los rápidos tienen una presencia física que pocas películas igualan; la mirada del film sobre la gente del lugar, en cambio, envejeció bastante peor que su trabajo de suspenso.',
    tenSecondTake: {
      verdict: 'Deliverance vuelve la excursión una disputa por sobrevivir y decidir qué consecuencias cargar de vuelta a casa.',
      whatToExpect: 'Un descenso en canoa, tensión entre amigos y un thriller que hace del paisaje una fuerza narrativa.',
      pace: 'El viaje alterna preparación, tramos de río y decisiones urgentes; los momentos de calma nunca duran demasiado.',
      intensity: 'Incluye violencia sexual, amenazas y peligro físico sostenido; parte del conflicto se apoya en la tensión moral.',
      practicalContext: 'John Boorman ordena el suspenso desde la geografía: seguir cada canoa y los cambios de corriente ayuda a leer el peligro.',
      forFansOf: 'Thrillers de supervivencia donde el paisaje y las decisiones del grupo pesan tanto como el antagonista.',
      notForYouIf: 'Te afectan las escenas de violencia sexual o buscás una historia de aventura sin conflictos morales ásperos.',
    },
  },
  {
    slug: 'llegan-los-muppets-1979', audienceRating: 'ATP', releasePlatform: 'Disney Plus', director: 'James Frawley',
    mainCast: ['Jim Henson', 'Frank Oz'], productionCompany: 'ITC Entertainment', cinepostaScore: 8,
    runtimeMinutes: 95, category: 'Comedia', genres: ['Comedia', 'Familia', 'Musical'], trailerYoutubeId: 'EYFQqSP7sj0',
    country: 'US, GB', isArgentinian: false, awards: { wins: [] },
    becauseYouLiked: ['jim-henson-idea-man-2024'],
    related: ['toy-story-1995', 'toy-story-2-1999', 'el-libro-de-la-selva-1967'],
    synopsis: 'Kermit deja su pantano rumbo a Hollywood después de que un agente de talentos lo invita a una audición. En el camino se cruza con los Muppets y con un empresario que quiere convertirlo en la cara de un negocio de ancas de rana.',
    review: 'James Frawley entiende que el salto de los Muppets al cine pide ampliar el mundo sin perder el chiste de que los muñecos conviven con personas que aceptan cualquier rareza. Kermit lleva la película con una mezcla de pudor y ambición; cada nuevo compañero suma una manera distinta de mirar el viaje. La música de Paul Williams y la cadena de cameos hacen que el camino parezca una celebración del espectáculo, aunque su núcleo sea más tranquilo: un grupo de artistas que apuesta a que puede hacer feliz a alguien.',
    tenSecondTake: {
      verdict: 'En Llegan los Muppets, Kermit pone rumbo a Hollywood y descubre que la meta se disfruta mejor en grupo.',
      whatToExpect: 'James Frawley dirige una road movie musical con cameos y humor sobre los límites entre títeres y mundo real.',
      pace: 'Cada parada suma un personaje, una canción o un gag; el viaje conserva impulso sin apurarse hacia Hollywood.',
      intensity: 'Es una comedia familiar, con una persecución sostenida y humor de doble lectura que no vuelve áspero el tono.',
      practicalContext: 'La película presenta a sus personajes como actores dentro de un rodaje; prestar atención a los quiebres de cuarta pared es parte del encanto.',
      forFansOf: 'Aventuras musicales de grupo, humor meta y personajes que se toman en serio sus sueños aunque la película no se tome demasiado en serio a sí misma.',
      notForYouIf: 'No te interesan los títeres o preferís una trama lineal sin desvíos, invitados y canciones.',
    },
  },
];

const candidatesDoc = JSON.parse(await fs.readFile(candidatePath, 'utf8'));
for (const entry of candidates) {
  const index = candidatesDoc.candidates.findIndex((candidate) => candidate.slug === entry.slug);
  if (index === -1) candidatesDoc.candidates.push(entry);
  else candidatesDoc.candidates[index] = entry;
}
await fs.writeFile(candidatePath, `${JSON.stringify(candidatesDoc, null, 2)}\n`, 'utf8');

const metadataDoc = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
for (const entry of metadata) {
  const index = metadataDoc.movies.findIndex((movie) => movie.slug === entry.slug);
  if (index === -1) metadataDoc.movies.push(entry);
  else metadataDoc.movies[index] = entry;
}
await fs.writeFile(metadataPath, `${JSON.stringify(metadataDoc, null, 2)}\n`, 'utf8');

for (const entry of metadata) {
  const file = path.resolve('src/data/movies', `${entry.slug}.json`);
  const movie = JSON.parse(await fs.readFile(file, 'utf8'));
  for (const field of ['synopsis', 'audienceRating', 'category', 'genres', 'country', 'isArgentinian', 'trailerYoutubeId', 'releasePlatform', 'director', 'mainCast', 'productionCompany', 'cinepostaScore', 'awards', 'review', 'runtimeMinutes']) {
    movie[field] = entry[field];
  }
  movie.reviewPublishedAt = metadataDoc.verifiedAt;
  delete movie.releaseDate;
  movie.editorial = { ...(movie.editorial ?? {}), becauseYouLiked: entry.becauseYouLiked, related: entry.related, tenSecondTake: entry.tenSecondTake };
  await fs.writeFile(file, `${JSON.stringify(movie, null, '\t')}\n`, 'utf8');
}

console.log(`Completed ${metadata.length} classic entries; catalogAddedAt and localized posters preserved.`);
