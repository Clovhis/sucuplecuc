import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, digest, eligibleMovie, editorialExcerpt, movieUrl, scoreLabel } from './social-media.mjs';
import {imageBytes,photoCaption,editionCredits} from './instagram-images.mjs';

export const FORMATS = ['carousel', 'protagonist', 'score', 'double', 'ranking'];
export const slugsOf = post => post.slugs || [post.slug];
const palettes = [
  {bg:'#141719',fg:'#fff5df',accent:'#fb5544',muted:'#bfc2b9',panel:'#292f30'},
  {bg:'#f1eadb',fg:'#192c32',accent:'#b32632',muted:'#53636a',panel:'#ded5c3'},
  {bg:'#142d44',fg:'#fff7df',accent:'#dbff8e',muted:'#b3c7d2',panel:'#234a60'},
  {bg:'#312135',fg:'#fff0dd',accent:'#ffb77c',muted:'#d9bfcf',panel:'#54334d'},
];
const seed = value => parseInt(digest(value).slice(0,8),16);
const categoryLabel = category => ({accion:'acción',animacion:'animación',documental:'documentales','ciencia ficcion':'ciencia ficción','comedia romantica':'comedia romántica',fantasia:'fantasía',biografica:'biográfica','sci-fi':'ciencia ficción',superheroes:'superhéroes','pelicula-nacional':'cine argentino','oscar-mejor-pelicula':'ganadoras del Oscar',romcom:'comedia romántica'}[category.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('es-AR')] || category.toLocaleLowerCase('es-AR'));
export function nextDate(date) { return new Date(new Date(`${date}T12:00:00-03:00`).getTime()+86400000).toISOString().slice(0,10); }

// Formats compete by eligibility and recent use, rather than following a weekday rotation.
export function planEdition(movies, history, externalSlugs, date, {format:forcedFormat} = {}) {
  if (forcedFormat && !FORMATS.includes(forcedFormat)) throw Error('Formato Instagram desconocido.');
  const used = new Set([...history.posts.flatMap(slugsOf),...externalSlugs]);
  const recent = history.posts.slice(-4);
  const recentImages=new Set(history.posts.slice(-14).flatMap(p=>p.media?.flatMap(m=>m.rights?.assetIds||[])||[]));
  const pool = movies.filter(m => eligibleMovie(m,date) && m.socialArt?.length && !used.has(m.slug));
  pool.sort((a,b) => Number(recentImages.has(a.socialArt[0].id))-Number(recentImages.has(b.socialArt[0].id)) || Number(recent.some(p=>p.category===a.category))-Number(recent.some(p=>p.category===b.category)) || seed(`${date}:${a.slug}`)-seed(`${date}:${b.slug}`));
  if (!pool.length) throw Error('No quedan películas inéditas con imágenes autorizadas. No se publica una placa genérica ni se reinicia el historial.');
  const distinct=group=>{const ids=new Set();return group.flatMap(m=>{const art=m.socialArt.find(a=>!ids.has(a.id));if(!art)return[];ids.add(art.id);return[{...m,socialArt:[art,...m.socialArt.filter(a=>a.id!==art.id)]}];});};
  const themes = [];
  for (const category of new Set(pool.map(m=>m.category))) {
    const group = distinct(pool.filter(m=>m.category===category));
    if(group.length>=5) themes.push({key:`genre:${category}`,title:`5 de ${categoryLabel(category)} para tu lista`,movies:group.slice(0,5),category});
    if(group.length>=2) themes.push({key:`double:${category}`,title:`Doble función: ${categoryLabel(category)}`,movies:group.slice(0,2),category,double:true});
  }
  const classics=distinct(pool.filter(m=>m.year<=Number(date.slice(0,4))-25));
  if(classics.length>=5) themes.push({key:'classics',title:'5 películas para volver a mirar',movies:classics.slice(0,5),category:classics[0].category});
  for(const director of new Set(pool.slice(0,100).map(m=>m.director).filter(Boolean))) {
    const group=distinct(pool.filter(m=>m.director===director));
    if(group.length>=5) themes.push({key:`director:${director}`,title:`5 películas de ${director}`,movies:group.slice(0,5),category:group[0].category});
  }
  themes.sort((a,b)=>Number(recent.some(p=>p.theme===a.key))-Number(recent.some(p=>p.theme===b.key)) || seed(`${date}:${a.key}`)-seed(`${date}:${b.key}`));
  const options=[{format:'protagonist',movies:[pool[0]],title:pool[0].title,key:'spotlight',category:pool[0].category}];
  const scored=pool.find(m=>m.cinepostaScore>=8);
  if(scored) options.push({format:'score',movies:[scored],title:scored.title,key:'score',category:scored.category});
  for(const format of ['carousel','double']) {
    const theme=themes.find(t=>Boolean(t.double)===(format==='double'));
    if(theme) options.push({...theme,format});
  }
  const ranked=themes.find(t=>!t.double);
  if(ranked)options.push({...ranked,format:'ranking',key:'ranking:'+ranked.key,title:'5 para tu lista, según el Score CinePosta',movies:[...ranked.movies].sort((a,b)=>b.cinepostaScore-a.cinepostaScore)});
  options.sort((a,b)=>Number(recent.at(-1)?.format===a.format)-Number(recent.at(-1)?.format===b.format) || recent.filter(p=>p.format===a.format).length-recent.filter(p=>p.format===b.format).length || seed(`${date}:${a.format}`)-seed(`${date}:${b.format}`));
  const chosen=forcedFormat ? options.find(p=>p.format===forcedFormat) : options[0];
  if(!chosen) throw Error('No hay suficientes películas inéditas para ese formato.');
  const lastPalette=recent.at(-1)?.palette;
  const paletteCandidates=palettes.map((_,i)=>i).filter(i=>i!==lastPalette);
  const palette=paletteCandidates[seed(`${date}:${chosen.key}`)%paletteCandidates.length];
  return {...chosen,theme:chosen.key,palette,date,slugs:chosen.movies.map(m=>m.slug)};
}

export function editionCaption(edition) {
  const multi=edition.movies.length>1;
  const intro=multi?edition.title+'.':`${edition.movies[0].title}: la mirada de CinePosta.`;
  const credits=editionCredits(edition);
  const ending=multi?'¿Cuál va primero? Guardá la selección y compartila.':'¿Qué te dejó esta película? Leé la reseña en cineposta.com.ar.';
  const links=edition.movies.map((m,i)=>`${movieUrl(m.slug)}${i===0?`?utm_source=instagram&utm_medium=social&utm_campaign=diaria_${edition.format}`:''}`);
  const details=edition.movies.map((m,i)=>`${multi?`${i+1}. `:''}${m.title} (${m.year}) · ${scoreLabel(m)}${!multi?'\n'+editorialExcerpt(m):''}`);
  let result=[intro,...details,ending,...links,credits,'#CinePosta #QueVer #Cine'].join('\n\n');
  if([...result].length>2200)result=[intro,...details,ending,...edition.movies.map(m=>movieUrl(m.slug)),credits,'#CinePosta'].join('\n\n');
  if([...result].length>2200)throw Error('La atribución completa no entra en Instagram: reducir la selección, nunca quitar créditos.');
  return result;
}

const esc = value=>String(value).replace(/[&<>"']/gu,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
async function text(value,width,height,size,color,bold=true) {
  for(let n=size;n>=24;n-=2) {
    const result=await sharp({text:{text:`<span foreground="${color}">${esc(value)}</span>`,font:`Noto Sans${bold?' Bold':''} ${n}`,fontfile:path.join(ROOT,`assets/social/NotoSans-${bold?'Bold':'Regular'}.ttf`),width,rgba:true,spacing:4}}).png().toBuffer({resolveWithObject:true});
    if(result.info.height<=height) return result.data;
  }
  throw Error(`Texto demasiado largo para lectura móvil: ${value}`);
}

// Photographs are mandatory on every page, including covers and scores.
export async function clearedArt(movie,root=ROOT) {
  const asset=movie.socialArt?.[0];
  if(!asset)throw Error(`Sin imagen real autorizada: ${movie.slug}`);
  return {...asset,bytes:await imageBytes(asset,root)};
}

export async function renderEdition(edition,directory,{root=ROOT}={}) {
  const arts=await Promise.all(edition.movies.map(m=>clearedArt(m,root)));
  await mkdir(directory,{recursive:true});
  const palette=palettes[edition.palette],p={...palette,accent:'#f24b43'};
  const multi=edition.movies.length>1,pages=multi?[null,...edition.movies]:edition.movies,cards=[];
  for(const [index,movie] of pages.entries()) {
    const layers=[];
    const svg=s=>Buffer.from(`<svg width="1080" height="1350">${s}</svg>`);
    const add=async(value,x,y,w,h,size,color=p.fg,bold=true)=>layers.push({input:await text(value,w,h,size,color,bold),left:x,top:y});
    const rect=(x,y,w,h,fill)=>layers.push({input:svg(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`),left:0,top:0});
    const photo=async(art,x,y,w,h,fit='cover')=>layers.push({input:await sharp(art.bytes).resize(w,h,{fit:art.kind!=='poster'&&art.permission.crop===true?fit:'contain',position:art.focalPoint||'centre',background:p.bg}).png().toBuffer(),left:x,top:y});
    rect(0,0,1080,1350,p.bg);
    await add('CinePosta',54,43,620,70,48);
    rect(54,113,74,5,p.accent);
    await add(multi?`${String(index+1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}`:'@cineposta.ar',772,62,250,45,28,p.muted);
    let used;
    if(!movie) {
      used=arts;
      if(arts.length===2) {
        for(const [i,a] of arts.entries())await photo(a,i*540,150,536,810);
      } else {
        for(const [i,a] of arts.entries())await photo(a,i<2?i*540:(i-2)*360,i<2?150:555,i<2?536:356,401);
      }
      await add(edition.format==='double'?'DOBLE FUNCIÓN':edition.format==='ranking'?'SEGÚN EL SCORE CINEPOSTA':'DESLIZÁ PARA DESCUBRIR',54,986,972,50,28,p.accent);
      await add(edition.title,54,1050,972,170,66);
      await add('Fotografías de archivo · créditos en el texto',54,1234,972,42,26,p.muted,false);
    } else {
      const art=arts[multi?index-1:0];used=[art];
      if(art.kind==='poster') {
        await photo(art,40,155,660,990,'contain');
        await add(movie.title,736,220,290,340,48);
        await add(`${movie.year}`,736,590,290,48,30,p.muted);
        await add(`${movie.cinepostaScore}/10`,736,700,290,160,88,p.accent);
        await add(scoreLabel(movie).split(' · ')[1],736,880,290,100,30);
        await add(art.credit,54,1180,972,70,28,p.muted,false);
      } else {
        await photo(art,0,150,1080,770,art.kind==='event-photo'?'contain':'cover');
        rect(0,920,1080,50,p.bg);
        await add(photoCaption(art),54,931,972,40,26,p.muted,false);
        await add(`${edition.format==='ranking'?`${index}. `:''}${movie.title}`,54,1002,972,155,68);
        await add(`${movie.year}${movie.runtimeMinutes?`  /  ${movie.runtimeMinutes} MIN`:''}   ·   ${scoreLabel(movie)}`,54,1180,972,58,30,p.accent);
        if(edition.format==='score' && art.permission.overlay===true) {
          rect(54,729,200,168,p.accent);
          await add(`${movie.cinepostaScore}`,78,744,150,100,96,'#111315');
          await add('/ 10',165,852,80,35,28,'#111315');
        }
        await add(`Foto: ${art.credit}`,54,1242,972,42,24,p.muted,false);
      }
    }
    rect(54,1297,972,1,'#777777');
    await add('cineposta.com.ar',54,1310,650,38,26,p.fg);
    const filename=`${edition.date}-${edition.movies[0].slug}-${edition.format}-photo-${index+1}.jpg`;
    const output=path.join(directory,filename);
    await sharp({create:{width:1080,height:1350,channels:3,background:p.bg}}).composite(layers).toColourspace('srgb').jpeg({quality:94,mozjpeg:true}).toFile(output);
    const bytes=await readFile(output);if(bytes.length>8*1024*1024)throw Error('Placa superior a 8 MB.');
    const license=used.some(a=>a.license.includes('-SA'))?'CC BY-SA 4.0':null;
    cards.push({path:output,mediaPath:`media/${filename}`,sha256:digest(bytes),width:1080,height:1350,alt:movie?`${movie.title} (${movie.year}). ${scoreLabel(movie)}. ${photoCaption(used[0])}.`:`${edition.title}. Fotografías de archivo: ${used.map(a=>a.subject).join(', ')}.`,rights:{type:'licensed-photography',assetIds:used.map(a=>a.id),assets:used.map(({bytes:_bytes,...a})=>a),adaptationLicense:license,changes:'Recorte, redimensionado y composición editorial. Los retratos y conciertos son imágenes de archivo.'}});
  }
  return cards;
}
