import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, digest, eligibleMovie, editorialExcerpt, movieUrl, scoreLabel } from './social-media.mjs';

export const FORMATS = ['carousel', 'protagonist', 'score', 'double'];
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
  const pool = movies.filter(m => eligibleMovie(m,date) && !used.has(m.slug));
  pool.sort((a,b) => Number(recent.some(p=>p.category===a.category))-Number(recent.some(p=>p.category===b.category)) || seed(`${date}:${a.slug}`)-seed(`${date}:${b.slug}`));
  if (!pool.length) throw Error('No quedan películas inéditas elegibles. El historial no se reinicia.');
  const themes = [];
  for (const category of new Set(pool.map(m=>m.category))) {
    const group = pool.filter(m=>m.category===category);
    if(group.length>=5) themes.push({key:`genre:${category}`,title:`5 de ${categoryLabel(category)} para tu lista`,movies:group.slice(0,5),category});
    if(group.length>=2) themes.push({key:`double:${category}`,title:`Doble función: ${categoryLabel(category)}`,movies:group.slice(0,2),category,double:true});
  }
  const classics=pool.filter(m=>m.year<=Number(date.slice(0,4))-25);
  if(classics.length>=5) themes.push({key:'classics',title:'5 películas para volver a mirar',movies:classics.slice(0,5),category:classics[0].category});
  for(const director of new Set(pool.slice(0,100).map(m=>m.director).filter(Boolean))) {
    const group=pool.filter(m=>m.director===director);
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
  const parts=[multi ? edition.title+'.' : edition.format==='score' ? 'Un número abre la charla. La película hace el resto.' : 'Hoy ponemos esta película en primer plano.'];
  for(const [i,m] of edition.movies.entries()) parts.push(`${multi ? `${i+1}. ` : ''}${m.title} (${m.year})\n${editorialExcerpt(m)}\nScore CinePosta: ${scoreLabel(m)}.`);
  parts.push(multi ? '¿Cuál va primero? Guardá la selección y compartila con quien elige la próxima peli.' : '¿Coincidís con la mirada de CinePosta? Contanos qué te dejó y guardala para tu próxima noche de cine.');
  parts.push('Leé las reseñas en cineposta.com.ar: buscá cada título.');
  // Every carousel member has its canonical URL: remote duplicate detection reserves all of them.
  parts.push(...edition.movies.map(m=>`${movieUrl(m.slug)}?utm_source=instagram&utm_medium=social&utm_campaign=diaria_${edition.format}`));
  parts.push('#CinePosta #QueVer #Cine');
  let text=parts.join('\n\n');
  // Five detailed reviews may exceed Instagram's limit: use title+score in the caption;
  // the complete editorial sentence remains on its slide. Never truncate a sentence.
  if([...text].length>2200) {
    text=[parts[0],...edition.movies.map((m,i)=>`${i+1}. ${m.title} (${m.year}) · ${scoreLabel(m)}`),...parts.slice(edition.movies.length+1)].join('\n\n');
  }
  if([...text].length>2200) throw Error('La edición supera el caption de Instagram.');
  return text;
}

const esc = value=>String(value).replace(/[&<>"']/gu,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
async function text(value,width,height,size,color,bold=true) {
  for(let n=size;n>=28;n-=2) {
    const result=await sharp({text:{text:`<span foreground="${color}">${esc(value)}</span>`,font:`Noto Sans${bold?' Bold':''} ${n}`,fontfile:path.join(ROOT,`assets/social/NotoSans-${bold?'Bold':'Regular'}.ttf`),width,rgba:true,spacing:4}}).png().toBuffer({resolveWithObject:true});
    if(result.info.height<=height) return result.data;
  }
  throw Error(`Texto demasiado largo para lectura móvil: ${value}`);
}

// Original geometric cinema illustrations. No stills, likenesses, film logos or samples.
function illustration(p,index,width,height) {
  const motif=index%6;
  let shapes='';
  if(motif===0) {
    for(let i=0;i<9;i++) shapes+=`<path d="M ${width*.5} ${height*.12} L ${-width*.8+i*width*.33} ${height} L ${-width*.66+i*width*.33} ${height} Z" fill="${i%2?p.accent:p.fg}" opacity="${i%2?.48:.10}"/>`;
    shapes+=`<circle cx="${width*.5}" cy="${height*.26}" r="${height*.13}" fill="${p.fg}"/><rect x="${width*.44}" y="${height*.19}" width="${width*.12}" height="${height*.14}" rx="8" fill="${p.bg}"/>`;
  } else if(motif===1) {
    for(let i=0;i<7;i++) shapes+=`<rect x="${30+i*width*.06}" y="${20+i*height*.065}" width="${width-60-i*width*.12}" height="${height-40-i*height*.13}" fill="none" stroke="${i%2?p.fg:p.accent}" stroke-width="${i===6?16:3}" opacity="${.22+i*.1}"/>`;
    shapes+=`<path d="M ${width*.45} ${height*.65} L ${width*.55} ${height*.65} L ${width*.68} ${height} L ${width*.32} ${height} Z" fill="${p.accent}" opacity=".65"/>`;
  } else if(motif===2) {
    for(let i=0;i<7;i++) shapes+=`<ellipse cx="${width*.54}" cy="${height*.51}" rx="${width*(.13+i*.065)}" ry="${height*(.09+i*.058)}" fill="none" stroke="${i%2?p.fg:p.accent}" stroke-width="${i%2?2:5}" transform="rotate(-24 ${width*.54} ${height*.51})" opacity=".7"/>`;
    shapes+=`<circle cx="${width*.54}" cy="${height*.51}" r="${height*.09}" fill="${p.accent}"/>`;
  } else if(motif===3) {
    for(let i=0;i<12;i++) shapes+=`<path d="M ${i*width/12} ${height} v ${-height*(.15+((i*7)%11)/14)} h ${width/14} v ${height}" fill="${i%3?p.accent:p.fg}" opacity="${i%2?.7:.35}"/>`;
    shapes+=`<circle cx="${width*.73}" cy="${height*.22}" r="${height*.12}" fill="${p.fg}"/>`;
  } else if(motif===4) {
    for(let i=0;i<5;i++)shapes+=`<circle cx="${width*(.18+i*.16)}" cy="${height*(i%2?.38:.61)}" r="${height*(.10+i*.015)}" fill="${i%2?p.fg:p.accent}" opacity="${.35+i*.13}"/><circle cx="${width*(.18+i*.16)}" cy="${height*(i%2?.38:.61)}" r="${height*(.14+i*.015)}" fill="none" stroke="${p.accent}" stroke-width="2"/>`;
  } else {
    for(let i=0;i<6;i++)shapes+=`<path d="M ${width*(.12+i*.11)} ${height*.86} v ${-height*(.2+i*.09)} h ${width*.11} v ${height*(.2+i*.09)} Z" fill="${i%2?p.fg:p.accent}" opacity="${.35+i*.1}"/>`;
    shapes+=`<path d="M ${width*.1} ${height*.25} L ${width*.85} ${height*.8}" fill="none" stroke="${p.fg}" stroke-width="4"/>`;
  }
  return Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="${p.panel}"/>${shapes}</svg>`);
}

export async function clearedArt(movie,root=ROOT) {
  let ledger;
  try {ledger=JSON.parse(await readFile(path.join(root,'assets/social/instagram-rights.json'),'utf8'));} catch(error) {if(error.code==='ENOENT')return null;throw error;}
  if(ledger.version!==1 || !Array.isArray(ledger.assets)) throw Error('Registro de derechos inválido.');
  const asset=ledger.assets.find(a=>a.slug===movie.slug);
  if(!asset)return null;
  if(asset.socialAdaptationAllowed!==true || !asset.credit || !asset.license || !/^https:\/\//u.test(asset.evidenceUrl||'') || !/^https:\/\//u.test(asset.sourceUrl||'') || !/^assets\/[a-zA-Z0-9/_-]+\.(webp|jpg|png)$/u.test(asset.path||'') || !/^[a-f0-9]{64}$/u.test(asset.sha256||''))throw Error(`Permiso de arte incompleto: ${movie.slug}`);
  const bytes=await readFile(path.join(root,'public',asset.path));
  if(digest(bytes)!==asset.sha256)throw Error(`El arte cambió desde la autorización: ${movie.slug}`);
  return {bytes,credit:asset.credit,evidenceUrl:asset.evidenceUrl,license:asset.license};
}

export async function renderEdition(edition,directory,{root=ROOT}={}) {
  await mkdir(directory,{recursive:true});
  const p=palettes[edition.palette];
  const multi=edition.movies.length>1;
  const pages=multi ? [null,...edition.movies] : edition.movies;
  const cards=[];
  for(const [index,movie] of pages.entries()) {
    const layers=[];
    const svg=s=>Buffer.from(`<svg width="1080" height="1350">${s}</svg>`);
    layers.push({input:svg(`<rect width="1080" height="1350" fill="${p.bg}"/><path d="M64 148H1016 M64 1240H1016" stroke="${p.accent}" stroke-width="3"/><rect x="64" y="58" width="60" height="60" rx="30" fill="${p.accent}"/>`),left:0,top:0});
    const add=async(value,x,y,w,h,size,color=p.fg,bold=true)=>layers.push({input:await text(value,w,h,size,color,bold),left:x,top:y});
    await add('CP',76,70,40,36,28,p.bg);
    await add('CinePosta',144,67,400,60,38);
    await add(multi ? `${String(index+1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}` : '@cineposta.ar',760,78,256,42,28,p.muted);
    const label=!movie ? (edition.format==='double'?'DOBLE FUNCIÓN':'DESLIZÁ PARA DESCUBRIR') : edition.format==='score'?'SCORE CINEPOSTA':multi?`PARA TU LISTA / ${String(index).padStart(2,'0')}`:'EN PRIMER PLANO';
    await add(label,64,180,952,50,30,p.accent);
    if(!movie) {
      await add(edition.title,64,258,920,300,86);
      layers.push({input:illustration(p,seed(edition.theme),952,490),left:64,top:594});
      await add(edition.format==='double'?'Dos películas. Una buena excusa para seguir mirando.':'Cinco películas, cinco miradas. Elegí la próxima.',64,1115,810,88,34);
      await add('→',918,1110,90,90,64,p.accent);
    } else if(edition.format==='score') {
      await add(movie.title,64,258,952,215,76);
      layers.push({input:illustration(p,seed(movie.slug),952,450),left:64,top:510});
      layers.push({input:svg(`<rect x="64" y="510" width="510" height="450" fill="${p.bg}" opacity=".96"/>`),left:0,top:0});
      await add(String(movie.cinepostaScore),74,512,movie.cinepostaScore===10?610:390,365,350,p.accent);
      await add('/ 10',460,814,155,70,46);
      await add(`${movie.year}   ·   ${scoreLabel(movie).split(' · ')[1]}`,84,905,600,48,30);
      await add(editorialExcerpt(movie),64,1010,952,180,36,p.fg,false);
    } else if(!multi) {
      // A full-width illustration and a bottom title make the spotlight a different
      // composition from the numbered reading cards and the large score spread.
      const art=await clearedArt(movie,root);
      layers.push({input:art ? await sharp(art.bytes).resize(1080,650,{fit:'contain',background:p.panel}).png().toBuffer() : illustration(p,seed(movie.slug),1080,650),left:0,top:245});
      layers.push({input:svg(`<defs><linearGradient id="fade" x2="0" y2="1"><stop stop-color="${p.bg}" stop-opacity="0"/><stop offset="1" stop-color="${p.bg}"/></linearGradient></defs><rect x="0" y="700" width="1080" height="195" fill="url(#fade)"/>`),left:0,top:0});
      await add(movie.title,64,845,952,175,76);
      await add(`${movie.year}${movie.runtimeMinutes?`  /  ${movie.runtimeMinutes} MIN`:''}   ·   ${scoreLabel(movie)}`,64,1025,952,60,32,p.accent);
      await add(editorialExcerpt(movie),64,1095,952,130,34,p.fg,false);
      if(art)await add(art.credit,64,795,952,36,28,p.fg,false);
    } else {
      await add(movie.title,64,258,952,215,76);
      const art=await clearedArt(movie,root);
      layers.push({input:art ? await sharp(art.bytes).resize(952,450,{fit:'contain',background:p.panel}).png().toBuffer() : illustration(p,seed(edition.theme)+index,952,450),left:64,top:510});
      await add(`${movie.year}${movie.runtimeMinutes?`  /  ${movie.runtimeMinutes} MIN`:''}   ·   ${scoreLabel(movie)}`,64,982,952,65,32,p.accent);
      await add(editorialExcerpt(movie),64,1063,952,145,34,p.fg,false);
      if(art) await add(art.credit,80,920,900,35,28,p.fg,false);
    }
    await add('cineposta.com.ar',64,1274,620,45,28,p.fg);
    await add(multi?'GUARDÁ LA SELECCIÓN':'CINE PARA CONVERSAR',670,1274,346,45,28,p.muted);
    const filename=`${edition.date}-${edition.movies[0].slug}-${edition.format}-${index+1}.jpg`;
    const output=path.join(directory,filename);
    await sharp({create:{width:1080,height:1350,channels:3,background:p.bg}}).composite(layers).toColourspace('srgb').jpeg({quality:93,mozjpeg:true}).toFile(output);
    const bytes=await readFile(output);
    if(bytes.length>8*1024*1024)throw Error('Placa superior a 8 MB.');
    const art=movie && edition.format!=='score' ? await clearedArt(movie,root) : null;
    cards.push({path:output,mediaPath:`media/${filename}`,sha256:digest(bytes),width:1080,height:1350,alt:movie?`${movie.title} (${movie.year}). Score CinePosta: ${scoreLabel(movie)}. ${editorialExcerpt(movie)}`:`${edition.title}. Deslizá para descubrir ${edition.movies.map(m=>m.title).join(', ')}.`,rights:art?{type:'licensed-art',credit:art.credit,evidenceUrl:art.evidenceUrl,license:art.license}:{type:'original-graphic',credit:'Gráfica y texto editorial: CinePosta. Noto Sans: SIL OFL 1.1.'}});
  }
  return cards;
}
