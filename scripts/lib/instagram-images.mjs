import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {ROOT,digest,argentinaDate,loadMovies} from './social-media.mjs';

export function assertImageGrant(asset,today=argentinaDate()) {
  const permission=asset.permission;
  if(asset.status!=='approved')return false;
  if(!asset.id || !['portrait','event-photo','poster','still','backdrop'].includes(asset.kind) || !asset.subject || !asset.credit || !asset.title || !/^https:\/\//u.test(asset.sourceUrl||'') || !/^https:\/\//u.test(asset.evidenceUrl||'') || !/^https:\/\//u.test(asset.licenseUrl||'') || !asset.license || !/^[a-f0-9]{64}$/u.test(asset.sha256||'') || !/^(?:assets\/social\/photos|assets\/posters|people)\/[a-zA-Z0-9/_-]+\.(webp|jpg|png)$/u.test(asset.path||''))throw Error(`Registro de imagen incompleto: ${asset.id}`);
  if(!permission || permission.organicInstagram!==true || permission.publicHosting!==true || !permission.territories?.some(t=>['worldwide','AR'].includes(t)))return false;
  if(!['open-license','press-permission'].includes(permission.basis))throw Error('Falta una base de autorización admitida.');
  if(permission.basis==='press-permission' && (!permission.rightsHolder || !permission.grantSummary))throw Error('El permiso de prensa necesita titular y alcance documentado.');
  if(permission.expiresAt && permission.expiresAt<today)return false;
  if(asset.embargoUntil && asset.embargoUntil>today)return false;
  if(asset.kind==='portrait' && !asset.person)throw Error('El retrato necesita identidad de persona.');
  if(asset.kind!=='portrait' && !asset.slugs?.length)throw Error('El arte cinematográfico necesita slugs explícitos.');
  if(permission.basis==='open-license' && !/^CC BY(?:-SA)? (2\.0|3\.0|4\.0)$/u.test(asset.license))throw Error('Licencia abierta no admitida automáticamente.');
  return true;
}

export async function imageRegistry(root=ROOT,today=argentinaDate()) {
  const ledger=JSON.parse(await readFile(path.join(root,'assets/social/instagram-rights.json'),'utf8'));
  if(ledger.version!==2 || !Array.isArray(ledger.assets))throw Error('Se requiere el registro de imágenes v2. No hay alternativa gráfica.');
  const assets=[];
  for(const asset of ledger.assets) {
    try {
      if(!assertImageGrant(asset,today))continue;
      if(digest(await readFile(path.join(root,'public',asset.path)))!==asset.sha256)throw Error('cambió el archivo');
      if(asset.evidencePath && digest(await readFile(path.join(root,asset.evidencePath)))!==asset.evidenceSha256)throw Error('cambió la evidencia');
      assets.push(asset);
    }catch(error){console.error(`Se excluye ${asset.id}: ${error.message}`);}
  }
  return assets;
}

export function appliesToMovie(asset,movie) {
  return asset.slugs?.includes(movie.slug) || (asset.kind==='portrait' && [...(movie.mainCast||[]),movie.director].includes(asset.person));
}

export async function visualMovies(root=ROOT,{movies,today=argentinaDate(),history={posts:[]}}={}) {
  const assets=await imageRegistry(root,today);
  // Reuse rights, but avoid the same photograph on consecutive days when alternatives exist.
  const recent=new Set(history.posts.slice(-14).flatMap(p=>p.media?.flatMap(m=>m.rights?.assetIds||[])||[]));
  return (movies||await loadMovies(root)).map(movie=>({...movie,socialArt:assets.filter(a=>appliesToMovie(a,movie)).sort((a,b)=>Number(recent.has(a.id))-Number(recent.has(b.id)) || Number(a.kind==='portrait')-Number(b.kind==='portrait') || a.id.localeCompare(b.id))}));
}

export async function imageBytes(asset,root=ROOT) {
  if(!assertImageGrant(asset))throw Error('Permiso vencido, pendiente o restringido.');
  const bytes=await readFile(path.join(root,'public',asset.path));
  if(digest(bytes)!==asset.sha256)throw Error(`El arte cambió desde la autorización: ${asset.id}`);
  return bytes;
}

export function photoCaption(asset) {
  return asset.kind==='portrait' ? `${asset.person} · archivo ${asset.photoDate?.match(/\d{4}/)?.[0]||''}`.trim() : asset.kind==='event-photo' ? `${asset.subject} · archivo ${asset.photoDate?.match(/\d{4}/)?.[0]||''}`.trim() : asset.kind==='poster'?'Afiche original':'Fotografía de la película';
}

export function editionCredits(edition) {
  const assets=[...new Map(edition.movies.map(m=>{if(!m.socialArt?.length)throw Error(`Sin imagen autorizada: ${m.slug}`);return[m.socialArt[0].id,m.socialArt[0]];})).values()];
  const licenses=[...new Map(assets.map(a=>[a.license,a.licenseUrl])).entries()];
  const lines=assets.map(a=>`${a.subject}: ${a.credit} · «${a.title}». ${a.sourceUrl}`);
  return `Fotos de archivo${assets.some(a=>['poster','still','backdrop'].includes(a.kind))?' y material cinematográfico':''}:\n${lines.join('\n')}\n${licenses.map(([name,url])=>`${name}: ${url}`).join('\n')}\nRecorte y composición: CinePosta. ${assets.some(a=>a.license.includes('-SA'))?'Placas adaptadas: CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/':'Gráfica propia; fotos bajo sus licencias indicadas.'}`;
}
