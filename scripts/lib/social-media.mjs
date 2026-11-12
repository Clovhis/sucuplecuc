import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { CINEPOSTA_SCORE_LABELS } from '../../src/lib/cineposta-score.ts';

export const SITE = 'https://www.cineposta.com.ar';
export const ROOT = path.resolve(import.meta.dirname, '../..');
export const digest = value => createHash('sha256').update(value).digest('hex');
const escape = value => String(value).replace(/[&<>"']/gu, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));
export const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value ?? '');
export const movieUrl = slug => `${SITE}/peliculas/${slug}/`;

export function argentinaDate(now = new Date()) {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function dailySlot(now = new Date()) {
	return new Date(`${argentinaDate(now)}T19:15:00-03:00`).toISOString();
}

export function scoreLabel(movie) {
	const score = movie.cinepostaScore;
	if (!Number.isInteger(score) || !CINEPOSTA_SCORE_LABELS[score]) throw new Error('La ficha necesita un Score CinePosta entero entre 1 y 10.');
	return `${score} · ${CINEPOSTA_SCORE_LABELS[score]}`;
}

export function editorialExcerpt(movie) {
	const candidates = [movie.editorial?.tenSecondTake?.verdict, movie.review];
	for (const candidate of candidates) {
		if (typeof candidate !== 'string') continue;
		const sentence = candidate.replace(/\s+/gu, ' ').trim().match(/^(.+?[.!?])(?:\s|$)/u)?.[1];
		if (sentence && sentence.length >= 40 && sentence.length <= 420 && !/…|\.{3}|https?:/u.test(sentence)) return sentence;
	}
	throw new Error(`Sin oración editorial completa y breve: ${movie.slug}`);
}

export async function loadMovies(root = ROOT) {
	const directory = path.join(root, 'src/data/movies');
	return Promise.all((await readdir(directory)).filter(file => file.endsWith('.json')).sort().map(async file => JSON.parse(await readFile(path.join(directory, file), 'utf8'))));
}

export function posterPath(movie, root = ROOT) {
	if (!/^assets\/posters\/[a-zA-Z0-9/_-]+\.webp$/u.test(movie.poster ?? '')) throw new Error('Se requiere un póster WebP local del catálogo.');
	return path.join(root, 'public', movie.poster);
}

export function eligibleMovie(movie, today) {
	try {
		if (!validSlug(movie.slug) || !movie.title?.trim() || movie.title.length > 180 || !Number.isInteger(movie.year) || movie.year > Number(today.slice(0, 4))) return false;
		if (movie.releaseDate && movie.releaseDate > today) return false;
		scoreLabel(movie);
		posterPath(movie);
		editorialExcerpt(movie);
		return movie.cinepostaScore >= 6;
	} catch { return false; }
}

export function selectInstagramMovie(movies, history, externalSlugs, today) {
	const used = new Set([...history.posts.map(post => post.slug), ...externalSlugs]);
	const recentCategories = history.posts.slice(-3).map(post => post.category);
	const candidates = movies.filter(movie => eligibleMovie(movie, today) && !used.has(movie.slug));
	// Rotate genres and titles deterministically; catalog addition dates aren't release dates.
	candidates.sort((a, b) => Number(recentCategories.includes(a.category)) - Number(recentCategories.includes(b.category)) || digest(`${today}:${a.slug}`).localeCompare(digest(`${today}:${b.slug}`)));
	if (!candidates.length) throw new Error('No quedan recomendaciones sin publicar. No se reinicia el historial automáticamente.');
	return candidates[0];
}

export function instagramCaption(movie, index = 0) {
	const openings = ['Una para tu próxima noche de cine.', 'Hoy te dejamos una para sumar a la lista.', '¿Qué peli viene después? Mirá esta.', 'Si estás por elegir peli, arrancá por acá.', 'Un ratito para hablar de cine.', 'La recomendación de hoy va por acá.'];
	const url = `${movieUrl(movie.slug)}?utm_source=instagram&utm_medium=social&utm_campaign=diaria`;
	const text = `${openings[index % openings.length]}\n\n${movie.title} (${movie.year})\n${editorialExcerpt(movie)}\n\nScore CinePosta: ${scoreLabel(movie)}.\n\nGuardala para cuando estés buscando qué mirar. La reseña completa está en cineposta.com.ar: buscá el título.\n${url}\n\n#CinePosta #Cine #QueVer`;
	if ([...text].length > 2200) throw new Error('El caption supera 2200 caracteres.');
	return text;
}

async function textLayer(value, width, maxHeight, size, color = '#f5f3ef', bold = false) {
	for (let fontSize = size; fontSize >= 16; fontSize -= 2) {
		const { data, info } = await sharp({text:{text:`<span foreground="${color}">${escape(value)}</span>`, font:`Noto Sans${bold ? ' Bold' : ''} ${fontSize}`, fontfile:path.join(ROOT,`assets/social/NotoSans-${bold ? 'Bold' : 'Regular'}.ttf`), width, align:'left', justify:false, rgba:true, spacing:10}}).png().toBuffer({resolveWithObject:true});
		if (info.height <= maxHeight) return data;
	}
	throw new Error('El texto no entra en la placa sin cortarse.');
}

export async function renderMovieCard(movie, outputPath, { format = 'feed', root = ROOT } = {}) {
	if (!['feed', 'story'].includes(format)) throw new Error('Formato de placa desconocido.');
	scoreLabel(movie);
	const story = format === 'story';
	const height = story ? 1920 : 1350;
	const top = story ? 310 : 210;
	const layers = [];
	const addText = async (text, left, y, width, maxHeight, size, color, bold) => layers.push({input:await textLayer(text,width,maxHeight,size,color,bold),left,top:y});
	layers.push({input:Buffer.from(`<svg width="1080" height="${height}"><rect width="1080" height="${height}" fill="#141517"/><rect x="64" y="${top-40}" width="952" height="4" fill="#e33a42"/></svg>`),left:0,top:0});
	const logo = await sharp(await readFile(path.join(root,'public/brand/cineposta-logo-full.png'))).resize({width:340,height:90,fit:'inside'}).png().toBuffer();
	layers.push({input:logo,left:64,top:story ? 160 : 64});
	await addText('PARA TU LISTA', 650, story ? 185 : 89, 366, 50, 24, '#dbb6b8', true);
	const poster = await sharp(await readFile(posterPath(movie,root))).resize(440,660,{fit:'contain',background:'#141517'}).png().toBuffer();
	layers.push({input:poster,left:64,top});
	await addText(movie.title, 552, top+12, 464, 350, 54, '#f5f3ef', true);
	await addText(`${movie.year}  /  ${movie.category || 'Cine'}`,552,top+390,464,90,26,'#b9b7b3');
	await addText('SCORE CINEPOSTA',552,top+520,464,50,22,'#dbb6b8',true);
	await addText(scoreLabel(movie),552,top+570,464,90,36,'#f5f3ef',true);
	const excerptTop = story ? 1040 : 920;
	await addText(editorialExcerpt(movie),64,excerptTop,952,story ? 410 : 255,story ? 42 : 34);
	await addText('La reseña completa en',64,height-(story ? 330 : 120),952,50,24,'#b9b7b3');
	await addText('cineposta.com.ar',64,height-(story ? 280 : 78),952,70,32,'#f5f3ef',true);
	await mkdir(path.dirname(outputPath), { recursive:true });
	await sharp({create:{width:1080,height,channels:3,background:'#141517'}}).composite(layers).toColourspace('srgb').jpeg({quality:90,mozjpeg:true}).toFile(outputPath);
	const bytes = await readFile(outputPath);
	if (bytes.length > 8*1024*1024) throw new Error('La placa supera 8 MB.');
	return { path:outputPath, width:1080, height, sha256:digest(bytes), alt:`${movie.title} (${movie.year}). ${scoreLabel(movie)} en CinePosta. ${editorialExcerpt(movie)}` };
}
