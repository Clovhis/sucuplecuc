import type { TriviaSource } from './trivia.ts';

/** A guard against English prose, not a ban on film titles or proper names. */
export function triviaHasEnglishProse(text: string): boolean {
	const words = triviaWords(text);
	const english = new Set(words.filter(word => ['the', 'and', 'his', 'her', 'their', 'they', 'with', 'from', 'after', 'when', 'must', 'into', 'using', 'which', 'who', 'while', 'through', 'attempt', 'upon'].includes(word)));
	const spanish = words.filter(word => ['el', 'la', 'los', 'las', 'de', 'del', 'que', 'una', 'un', 'en', 'su', 'sus', 'para', 'por', 'con', 'pero', 'mientras'].includes(word)).length;
	return english.size >= 3 && english.size > spanish;
}

export const triviaWords = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]+/g) ?? [];
export const triviaDirectors = (names: string) => names.split(/\s*,\s*|\s+y\s+|\s*&\s*/i).map(name => triviaWords(name).join(''));
export const triviaTitleFamily = (movie: TriviaSource) => {
	const words = triviaWords(movie.originalTitle || movie.title).filter(word => !['the', 'a', 'an', 'el', 'la', 'los', 'las', 'of', 'de'].includes(word));
	return words[0]?.length >= 4 ? words[0] : words.slice(0, 2).join('');
};
export const triviaArgentina = (movie: TriviaSource) => Boolean(movie.isArgentinian || movie.country?.split(',').some((code) => code.trim() === 'AR'));
export const triviaGenre = (movie: TriviaSource) => {
	const category = triviaWords(movie.category ?? '').join('');
	return ({ gore: 'terror', comediaromantica: 'romance', comedianegra: 'comedia', biografica: 'drama', historia: 'drama' } as Record<string, string>)[category] ?? category;
};
export const triviaMedium = (movie: TriviaSource) => {
	const category = triviaWords(movie.category ?? '').join('');
	return category === 'anime' ? 'anime' : category === 'animacion' ? 'animation' : category === 'documental' ? 'documentary' : 'live';
};

export const TRIVIA_QUARANTINE: Record<string, { reason: string; source: string }> = {
	'spider-man-2002': { reason: 'La ficha mezcla la identidad de la película de 2002 con créditos y sinopsis de otra obra. No usarla tampoco como distractor.', source: 'https://www.sonypictures.com/movies/spiderman' },
	'shelter-2026': { reason: 'La sinopsis del búnker no corresponde a la película de Jason Statham. Excluir de preguntas y alternativas.', source: 'https://sheltermovie.com/synopsis/' },
};

// Distinct settings/conflicts take precedence over broad signals such as family or survival.
const coreThemes = [
	/secuestr|desaparecid|desaparece|raptad/,
	/planeta|extraterrestre|astronauta|nave espacial|cosmic|orbital/,
	/militar|soldad|ejercito|nazis|nazi|refugiad|holocausto|guerra mundial/,
	/music|cantante|cancion|pianista|baterista|orquesta|jazz/,
	/deport|boxe|futbol|competicion|campeon|entrenador/,
	/jurado|juicio|abogad|tribunal|condena|carcel|prision/,
	/sacerdote|iglesia|pastor|monja|convento/,
	/cocin|chef|restaurante|gastronom/,
	/perro|perra|gato|gata|mascota|rata|raton|zorro|cachorro|conejo|pajaro/,
	/amnesia|recuerdo|memoria|viaj[ae] en el tiempo|temporal/,
	/medic|hospital|cirujan|paciente|tratamiento|terapeuta/,
	/fantasma|demoni|sobrenatural|maldicion|posesion|ritual|monstru|criatura|zombi|vampir/,
	/robar|roba |robo|ladron|ladrones|estafa|asalto|atraco|botin/,
	/espia|espionaje|cia\b|agente|terroris/,
	/mafia|mafios|narcotraf|cartel|pandilla|banda criminal/,
	/barco|tiburon|submarin|naufrag/,
	/rodaje|guionista|actriz|teatro|pintor|novelista|escritor/,
	/hechicer|magia|magico|mago|bruj[ao]|encantad/,
].map(pattern => new RegExp(`\\b(?:${pattern.source})`));
export const triviaCoreThemes = (text: string) => {
	const value = triviaWords(text).join(' ');
	return coreThemes.flatMap((pattern, i) => pattern.test(value) ? [i] : []);
};

const themes = [
	/famili|madre|padre|hij[oa]|herman|abuela|abuelo|crianza/,
	/policia|detective|asesin|crimen|criminal|investig|fiscal|cadaver/,
	/guerra|militar|soldad|ejercito|nazis|nazi|refugiad|holocausto/,
	/amor|pareja|romance|enamor|matrimonio|casamient|boda|divorci/,
	/tiempo|temporal|recuerdo|memoria|amnesia/,
	/jurado|juicio|abogad|tribunal|condena|carcel|prision/,
	/music|cantante|cancion|banda|pianista|baterista|orquesta|jazz/,
	/deport|boxe|futbol|competicion|campeon|entrenador|carrera atletica/,
	/mar |oceano|barco|tiburon|isla|submarin|naufrag/,
	/espaci[oa]|planeta|extraterrestre|alien|astronauta|nave |cosmic/,
	/escuela|colegio|alumn|estudiante|profesor|universidad|secundari/,
	/sobreviv|superviv|atrapad|aislad|rescat|encerrad|secuestr/,
	/espiritu|fantasma|demoni|sobrenatural|maldicion|posesion|ritual/,
	/rob[ao]|ladron|ladrones|estafa|asalto|atraco|botin/,
	/espia|espionaje|agente|mision|inteligencia|terroris/,
	/monstru|criatura|mutant|zombi|infectad|vampir|poderes/,
	/perr[oa]|gat[oa]|animal|mascota|rata|raton|zorro|cachorr|conejo|pajaro/,
	/cocin|comida|chef|restaurante|gastronom/,
	/actor|actriz|teatr|cine|rodaje|pelicula|escritor|novela|artista|pintor/,
	/religio|sacerdote|iglesia|pastor|monja|convento/,
	/politic|presidente|gobierno|poder|dictadura|corrupcion/,
	/medic|hospital|enferm|cirujan|paciente|tratamiento|terapeuta/,
].map(pattern => new RegExp(`\\b(?:${pattern.source})`));
export const triviaThemes = (movie: TriviaSource) => {
	const synopsis = triviaWords(movie.synopsis ?? '').join(' ');
	return themes.flatMap((pattern, i) => pattern.test(synopsis) ? [i] : []);
};

// A famous name must not identify the only franchise offered as an answer.
// These clues need an individually written question and three explicit installments.
const iconicNames = /\b(?:superman|clark kent|krypton[a-z]*|krypto|lex luthor|batman|bruce wayne|gotham|joker|spider[ -]?man|peter parker|harry potter|hogwarts|hermione|voldemort|frodo|gandalf|bilbo|sauron|skywalker|darth vader|jedi|obi[ -]?wan|indiana jones|james bond|007|wolverine|magneto|charles xavier|x[ -]?men|iron man|tony stark|capitan america|thor|hulk|nick fury|teseracto|shrek|fiona|woody|buzz lightyear|marty mcfly|doc brown|delorean|neo|morfeo|trinity|john wick|jack sparrow|rocky balboa|rambo|freddy krueger|jason voorhees|michael myers|hannibal lecter|sherlock holmes|godzilla|king kong|optimus prime|dominic toretto|grinch|gru|minions|paddington|pooh|scooby|snoopy|garfield|pinocho|pinocchio|cenicienta|cinderella|blancanieves|snow white|peter pan|mary poppins|aladdin|mulan|moana|elsa|ariel|cruella|leatherface|chucky|pinhead|jigsaw|anakin|yoda|chewbacca)\b/i;

export function triviaGiveaway(movie: TriviaSource, prompt: string, titleFrequency: Map<string, number>): boolean {
	const words = new Set(triviaWords(prompt));
	const titleWords = [...new Set(triviaWords(`${movie.title} ${movie.originalTitle ?? ''}`))];
	return titleWords.some((word) => word.length >= 4 && (titleFrequency.get(word) ?? 0) <= 10 && words.has(word)) || iconicNames.test(triviaWords(prompt).join(' ')) || /\b(?:jean grey|geppetto|mufasa|simba|nemo|dory|rapunzel|tarzan|dracula|frankenstein|beetlejuice|deadpool|pikachu|sonic|mario|luigi|popeye|sailor moon|goku|naruto|jake sully|pandora|na vi|haddonfield|myers|sarah connor|john connor|t 800|t 1000|ash williams|ash ketchum|annabelle|pennywise|hercule poirot|poirot|kaecilius|kamar taj|doctor strange|stephen strange|hipo|berk|chimuelo|toothless|tim goodman|ryme city|cassandra webb|ant man|scott lang|pym|t challa|wakanda|peter quill|gamora|loki|asgard|thanos|miles morales)\b/i.test(triviaWords(prompt).join(' '));
}

/** Strict eligibility, never padded with unrelated options to reach a bank-size target. */
export function triviaCompatible(a: TriviaSource, b: TriviaSource, story: boolean): boolean {
	if (triviaArgentina(a) !== triviaArgentina(b) || triviaMedium(a) !== triviaMedium(b) || Math.abs(a.year - b.year) > 18) return false;
	if (!triviaGenre(a) || triviaGenre(a) !== triviaGenre(b)) return false;
	if (!story) return true;
	const countries = a.country?.split(',').map((code) => code.trim()).filter(Boolean) ?? [];
	return countries.length > 0 && Boolean(b.country?.split(',').some((code) => countries.includes(code.trim())));
}
