import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { FORMATS, nextDate, planEdition, editionCaption, renderEdition, clearedArt } from './lib/instagram-editorial.mjs';
import { editionDate, prepareInstagram, publishInstagram, saveHistory, readHistory, buildInstagramInput, entryMatches, remoteSlugs } from './publish-buffer-instagram.mjs';
import { digest } from './lib/social-media.mjs';
import {visualMovies,assertImageGrant,imageRegistry} from './lib/instagram-images.mjs';

const movie={slug:'una-2020',title:'Una película',year:2020,category:'Terror',poster:'assets/posters/2020/una.webp',cinepostaScore:8,review:'Una casa vacía se vuelve una trampa y cada ruido cambia lo que creemos saber.'};
const org='a'.repeat(24),channelId='b'.repeat(24);
const channel={id:channelId,name:'cineposta.ar',service:'instagram',type:'business',metadata:{defaultToReminders:false}};
const pool=Array.from({length:40},(_,i)=>({...movie,slug:`una-${i}`,title:`Una película ${i}`,year:1980+i,socialArt:[{id:`photo-${i}`,title:`Photo ${i}`,subject:`Actor ${i}`,credit:'Fotógrafo',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourceUrl:'https://example.test/photo-'+i}]}));
async function fixture(t) {const root=await mkdtemp(path.join(tmpdir(),'instagram-editorial-'));t.after(()=>rm(root,{recursive:true,force:true}));return root;}
function api(posts=[]) {const mutations=[];return {mutations,request:async(_key,query,variables)=>{
  if(query.includes('InstagramChannels'))return {channels:[channel]};
  if(query.includes('InstagramPosts'))return {posts:{edges:posts.map(node=>({node})),pageInfo:{hasNextPage:false}}};
  mutations.push(variables.input);return {createPost:{__typename:'PostActionSuccess',post:{id:'real-receipt',status:'scheduled',dueAt:variables.input.dueAt}}};
}};}

test('advance editions cross ART midnight, month and year without reviving expired slots',()=>{
  assert.equal(nextDate('2026-12-31'),'2027-01-01');
  assert.equal(editionDate(new Date('2026-11-14T01:25:00Z'),'tomorrow'),'2026-11-14');
  assert.throws(()=>editionDate(new Date(),'next-week'));
});

test('adaptive editions reserve all carousel members, change format/palette and never recycle movies',()=>{
  const history={posts:[]};
  for(let i=0;i<12;i++) {
    const plan=planEdition(pool,history,new Set(),`2026-11-${String(i+1).padStart(2,'0')}`);
    const previous=history.posts.at(-1);
    if(previous){assert.notEqual(plan.format,previous.format);assert.notEqual(plan.palette,previous.palette);}
    assert.ok(!history.posts.flatMap(p=>p.slugs).some(slug=>plan.slugs.includes(slug)));
    history.posts.push({...plan,slug:plan.slugs[0]});
  }
  assert.ok(new Set(history.posts.map(p=>p.format)).size>=3);
});

test('captions preserve real scores, avoid platform assertions and expose every member for dedupe',()=>{
  const plan=planEdition(pool,{posts:[]},new Set(),'2026-11-14',{format:'carousel'});
  const text=editionCaption(plan);
  assert.equal(remoteSlugs([{text}]).size,5);
  assert.ok([...text].length<=2200);
  assert.ok(text.includes('8 · Excelente'));
  assert.ok(!text.includes('Netflix'));
  assert.equal(entryMatches([{id:'x',text:`https://www.cineposta.com.ar/peliculas/${plan.slugs[3]}/`}],{slugs:plan.slugs}).length,1);
});

test('display titles restore accents from legacy category spellings without editing the catalog',()=>{
  const plan=planEdition(pool.map(m=>({...m,year:2020,category:'Animacion'})),{posts:[]},new Set(),'2026-11-14',{format:'carousel'});
  assert.equal(plan.title,'5 de animación para tu lista');
  assert.equal(plan.category,'Animacion');
});

test('pending, missing, expired, foreign and changed rights fail closed',async t=>{
  const root=await fixture(t);await mkdir(path.join(root,'assets/social'),{recursive:true});await mkdir(path.join(root,'public/assets/social/photos'),{recursive:true});
  await assert.rejects(clearedArt(movie,root),/Sin imagen/);
  const asset={id:'photo',status:'approved',kind:'still',subject:movie.title,slugs:[movie.slug],title:'Foto',path:'assets/social/photos/photo.jpg',sha256:digest('image'),credit:'Autor',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourceUrl:'https://example.test/source',evidenceUrl:'https://example.test/permission',permission:{basis:'open-license',organicInstagram:true,publicHosting:true,territories:['worldwide']}};
  assert.equal(assertImageGrant({...asset,status:'pending'}),false);
  assert.equal(assertImageGrant({...asset,permission:{...asset.permission,expiresAt:'2020-01-01'}}),false);
  assert.equal(assertImageGrant({...asset,permission:{...asset.permission,territories:['US']}}),false);
  assert.equal(assertImageGrant({...asset,permission:{...asset.permission,publicHosting:false}}),false);
  assert.throws(()=>assertImageGrant({...asset,license:'TMDB API'}));
  await writeFile(path.join(root,'public',asset.path),'changed');await writeFile(path.join(root,'assets/social/instagram-rights.json'),JSON.stringify({version:2,assets:[asset]}));
  assert.deepEqual(await imageRegistry(root),[]);
  await assert.rejects(clearedArt({...movie,socialArt:[asset]},root),/cambió/);
});

test('a movie without approved photography is skipped, never given an abstract fallback',()=>{
  assert.throws(()=>planEdition([movie],{posts:[]},new Set(),'2026-11-14'),/imágenes autorizadas/);
});

test('all real-catalog formats have licensed photos, including covers, rankings and score cards',async t=>{
  const root=await fixture(t),movies=await visualMovies();
  for(const format of FORMATS) {
    const plan=planEdition(movies,{posts:[]},new Set(),'2026-11-14',{format});
    const cards=await renderEdition(plan,path.join(root,format));
    assert.equal(cards.length,['carousel','ranking'].includes(format)?6:format==='double'?3:1);
    for(const card of cards) {
      const bytes=await readFile(card.path),meta=await sharp(bytes).metadata();
      assert.deepEqual([meta.width,meta.height,meta.format],[1080,1350,'jpeg']);
      assert.equal(digest(bytes),card.sha256);assert.equal(card.rights.type,'licensed-photography');assert.ok(card.rights.assetIds.length);assert.ok(bytes.length<8*1024*1024);
    }
  }
});

test('yesterday four hours late can prepare tomorrow; six verified assets are one Buffer post',async t=>{
  const stateDir=await fixture(t);await saveHistory(stateDir,{version:1,posts:[]});
  const now=new Date('2026-11-14T01:25:00Z'),remote=api();
  const opts={stateDir,key:'test',organizationId:org,channelId,attemptId:'42:1',edition:'tomorrow',now,request:remote.request};
  const result=await prepareInstagram(opts);assert.equal(result.mode,'prepared');assert.equal(result.dueAt,'2026-11-14T22:15:00.000Z');
  const history=await readHistory(stateDir),entry=history.posts[0];
  const checked=[];
  const posted=await publishInstagram({...opts,repository:'Clovhis/sucuplecuc',mediaRef:'a'.repeat(40),verifyMedia:async(url,hash)=>checked.push({url,hash})});
  assert.equal(posted.status,'scheduled');assert.equal(remote.mutations.length,1);assert.equal(checked.length,entry.media.length);
  assert.equal(remote.mutations[0].assets.length,entry.media.length);
  assert.equal(remote.mutations[0].dueAt,'2026-11-14T22:15:00.000Z');
  const urls=Array.from({length:6},(_,i)=>`https://example.test/${i}.jpg`);
  assert.equal(buildInstagramInput(channelId,{...entry,media:Array.from({length:6},()=>({alt:'Texto alternativo'}))},urls).assets.length,6);
  assert.throws(()=>buildInstagramInput(channelId,entry,[...urls,...urls]));
});

test('a bad carousel image aborts before any Buffer mutation',async t=>{
  const stateDir=await fixture(t),remote=api();
  const now=new Date('2026-11-14T12:00:00Z');
  const entry={date:'2026-11-14',slug:movie.slug,slugs:[movie.slug],state:'reserved',attemptId:'42:1',dueAt:'2026-11-14T22:15:00Z',channelId,text:'Una película',media:[{mediaPath:'media/a.jpg',sha256:'a',rights:{type:'licensed-photography'}},{mediaPath:'media/b.jpg',sha256:'b',rights:{type:'licensed-photography'}}]};
  await saveHistory(stateDir,{version:1,posts:[entry]});
  await assert.rejects(publishInstagram({stateDir,key:'test',organizationId:org,channelId,attemptId:'42:1',now,request:remote.request,repository:'Clovhis/sucuplecuc',mediaRef:'a'.repeat(40),verifyMedia:async(url)=>{if(url.endsWith('b.jpg'))throw Error('Bad bytes');}}),/Bad bytes/);
  assert.equal(remote.mutations.length,0);
});


test('unpublished legacy abstract reservations are blocked before any media request or mutation',async t=>{
  const stateDir=await fixture(t),remote=api();
  const entry={date:'2026-11-14',slug:movie.slug,state:'reserved',attemptId:'42:1',dueAt:'2026-11-14T22:15:00Z',channelId,media:[{mediaPath:'media/old.jpg',rights:{type:'original-graphic'}}]};
  await saveHistory(stateDir,{version:1,posts:[entry]});
  await assert.rejects(publishInstagram({stateDir,key:'test',organizationId:org,channelId,attemptId:'42:1',now:new Date('2026-11-14T12:00:00Z'),request:remote.request,verifyMedia:()=>{throw Error('Must not fetch');}}),/gráficos abstractos/);
  assert.equal(remote.mutations.length,0);
});
