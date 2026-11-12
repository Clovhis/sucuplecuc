import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { argentinaDate, dailySlot, selectInstagramMovie, instagramCaption, renderMovieCard, editorialExcerpt, digest } from './lib/social-media.mjs';
import { assertInstagramChannel, readInstagramPosts, remoteSlugs, dailyGuard, entryMatches, readHistory, saveHistory, publicMediaUrl, verifyPublicMedia, buildInstagramInput, prepareInstagram, publishInstagram } from './publish-buffer-instagram.mjs';

const org = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const id = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const channel = {id,name:'cineposta.ar',service:'instagram',type:'business',metadata:{defaultToReminders:false},isDisconnected:false,isLocked:false,isQueuePaused:false};
const now = new Date('2026-11-12T20:00:00Z');
const movie = {slug:'una-pelicula-2020',title:'Una película',year:2020,category:'Terror',poster:'assets/posters/2020/una-pelicula-2020.webp',cinepostaScore:8,review:'Una casa vacía se vuelve una trampa y cada ruido cambia lo que creemos saber. El suspenso funciona con muy poco.'};
const emptyHistory = () => ({version:1,posts:[]});
const entry = () => ({date:'2026-11-12',slug:movie.slug,category:movie.category,state:'reserved',attemptId:'42:1',channelId:id,dueAt:dailySlot(now),mediaPath:'media/2026-11-12-una-pelicula-2020.jpg',mediaSha256:'abc',text:instagramCaption(movie),alt:'Una película, placa CinePosta.'});

async function fixture(t) {
	const root = await mkdtemp(path.join(tmpdir(),'cineposta-instagram-'));
	t.after(() => rm(root,{recursive:true,force:true}));
	const stateDir = path.join(root,'state');
	await saveHistory(stateDir,emptyHistory());
	return {root,stateDir};
}

function fakeBuffer(posts = [], mutate = async () => ({createPost:{__typename:'PostActionSuccess',post:{id:'receipt',status:'scheduled',dueAt:dailySlot(now)}}})) {
	const calls=[];
	const request=async (_key,query,variables) => {
		calls.push({query,variables});
		if(query.includes('InstagramChannels'))return {channels:[channel]};
		if(query.includes('InstagramPosts'))return {posts:{edges:posts.map(node=>({node})),pageInfo:{hasNextPage:false}}};
		if(query.includes('mutation'))return mutate(variables);
		throw Error('Unexpected request');
	};
	return {request,calls};
}

test('ART date, 19:15 slot and midnight remain independent of host timezone',()=>{
	assert.equal(argentinaDate(new Date('2026-11-13T02:50:00Z')),'2026-11-12');
	assert.equal(dailySlot(now),'2026-11-12T22:15:00.000Z');
});

test('selection excludes every history/remote slug, unrated, low-score and future films; rotates genres',()=>{
	const other={...movie,slug:'otra-2020',category:'Drama'};
	assert.equal(selectInstagramMovie([movie,other],{posts:[{slug:'vieja',category:'Terror'}]},new Set(),'2026-11-12').slug,other.slug);
	for(const modified of [{cinepostaScore:undefined},{cinepostaScore:5},{cinepostaScore:11},{year:2027},{releaseDate:'2026-11-13'}])assert.throws(()=>selectInstagramMovie([{...movie,...modified}],emptyHistory(),new Set(),'2026-11-12'));
	assert.throws(()=>selectInstagramMovie([movie],{posts:[{slug:movie.slug}]},new Set(),'2026-11-12'));
	assert.throws(()=>selectInstagramMovie([movie],emptyHistory(),new Set([movie.slug]),'2026-11-12'));
});

test('caption preserves canonical score and complete editorial sentence without claiming stale platforms',()=>{
	const text=instagramCaption({...movie,releasePlatform:'Una plataforma vieja'});
	assert.ok(text.includes('8 · Excelente'));
	assert.ok(text.includes(editorialExcerpt(movie)));
	assert.ok(text.includes('utm_source=instagram'));
	assert.ok(!text.includes('Una plataforma vieja'));
	assert.ok(text.length<2200);
	assert.throws(()=>editorialExcerpt({...movie,review:'Texto cortado…'}));
});

test('only exact professional Instagram with automatic publishing is accepted',()=>{
	assert.equal(assertInstagramChannel(channel,id),channel);
	for(const modification of [{service:'twitter'},{name:'otra.cuenta'},{type:'profile'},{metadata:{defaultToReminders:true}},{metadata:null},{isDisconnected:true},{isLocked:true},{isQueuePaused:true}])assert.throws(()=>assertInstagramChannel({...channel,...modification},id));
});

test('pagination reads beyond 100 posts and fails on a repeated cursor',async()=>{
	let count=0;
	const posts=await readInstagramPosts({organizationId:org,channelId:id,request:async()=>({posts:{edges:[{node:{id:++count}}],pageInfo:{hasNextPage:count===1,endCursor:'cursor'}}})});
	assert.equal(posts.length,2);
	await assert.rejects(readInstagramPosts({request:async()=>({posts:{edges:[],pageInfo:{hasNextPage:true,endCursor:'same'}}})}),/duplicados/);
});

test('remote URL dedupe handles campaign parameters and keeps drafts/errors reserved',()=>{
	assert.deepEqual([...remoteSlugs([{status:'draft',text:instagramCaption(movie)},{status:'error',text:'https://cineposta.com.ar/peliculas/otra-2020/'}])],[movie.slug,'otra-2020']);
	assert.equal(dailyGuard([{dueAt:'2026-11-13T02:00:00Z',status:'scheduled'}],'2026-11-12').length,1);
	assert.equal(entryMatches([{id:'known',text:'https://buff.ly/short'}],{...entry(),bufferPostId:'known'}).length,1);
});

test('media uses an immutable public SHA and only the approved bytes',async()=>{
	assert.ok(publicMediaUrl('Clovhis/sucuplecuc','a'.repeat(40),'media/card.jpg').includes('/'+'a'.repeat(40)+'/'));
	assert.throws(()=>publicMediaUrl('Clovhis/sucuplecuc','main','media/card.jpg'));
	assert.throws(()=>publicMediaUrl('Clovhis/sucuplecuc','a'.repeat(40),'../card.jpg'));
	await verifyPublicMedia('https://example.test/card.jpg',digest('image'),async()=>new Response('image',{headers:{'content-type':'image/jpeg'}}));
	await assert.rejects(verifyPublicMedia('https://example.test/card.jpg','wrong',async()=>new Response('image',{headers:{'content-type':'image/jpeg'}})),/no coincide/);
});

test('feed payload explicitly selects automatic Instagram post and 19:15, never shareNow',()=>{
	const input=buildInstagramInput(id,entry(),'https://example.test/card.jpg');
	assert.equal(input.channelId,id);
	assert.equal(input.dueAt,'2026-11-12T22:15:00.000Z');
	assert.equal(input.mode,'customScheduled');
	assert.deepEqual(input.metadata,{instagram:{type:'post',shouldShareToFeed:true}});
});

test('corrupt or absent operational history fails closed',async t=>{
	const {stateDir}=await fixture(t);
	await writeFile(path.join(stateDir,'history.json'),'{}');
	await assert.rejects(readHistory(stateDir),/inválido/);
	await assert.rejects(readHistory(path.join(stateDir,'missing')));
});

test('late prepare skips without contacting Buffer or writing tomorrow',async t=>{
	const {stateDir}=await fixture(t);
	const result=await prepareInstagram({stateDir,now:new Date('2026-11-12T22:16:00Z'),request:()=>{throw Error('No call');}});
	assert.equal(result.mode,'skipped');
	assert.equal((await readHistory(stateDir)).posts.length,0);
});

test('queue capacity and a manual daily post prevent a reservation',async t=>{
	const {stateDir}=await fixture(t);
	for(const posts of [[{dueAt:dailySlot(now),status:'scheduled'}],Array.from({length:10},()=>({status:'scheduled',dueAt:'2026-11-15T22:00:00Z'}))]){
		const api=fakeBuffer(posts);
		assert.equal((await prepareInstagram({stateDir,key:'test',organizationId:org,channelId:id,attemptId:'42:1',now,request:api.request})).mode,'skipped');
	}
	assert.equal((await readHistory(stateDir)).posts.length,0);
});

test('real local card generation produces safe JPEG feed/story dimensions and a durable reservation',async t=>{
	const {stateDir,root}=await fixture(t);
	await mkdir(path.join(root,'src/data/movies'),{recursive:true});
	await mkdir(path.join(root,'public/assets/posters/2020'),{recursive:true});
	await mkdir(path.join(root,'public/brand'),{recursive:true});
	await writeFile(path.join(root,'src/data/movies',`${movie.slug}.json`),JSON.stringify(movie));
	await sharp({create:{width:400,height:600,channels:3,background:'#773344'}}).webp().toFile(path.join(root,'public',movie.poster));
	await sharp({create:{width:300,height:60,channels:4,background:'#eeeeee'}}).png().toFile(path.join(root,'public/brand/cineposta-logo-full.png'));
	const api=fakeBuffer();
	const result=await prepareInstagram({stateDir,root,key:'test',organizationId:org,channelId:id,attemptId:'42:1',now,request:api.request});
	assert.equal(result.mode,'prepared');
	const stored=(await readHistory(stateDir)).posts[0];
	assert.equal(stored.state,'reserved');
	const feed=await sharp(await readFile(path.join(stateDir,stored.mediaPath))).metadata();
	assert.deepEqual([feed.width,feed.height,feed.format],[1080,1350,'jpeg']);
	const storyPath=path.join(root,'story.jpg');
	await renderMovieCard({...movie,title:'Una película con un título bastante largo & signos <raros>'},storyPath,{format:'story',root});
	const story=await sharp(await readFile(storyPath)).metadata();
	assert.deepEqual([story.width,story.height],[1080,1920]);
	assert.ok((await readFile(storyPath)).length<8*1024*1024);
});

test('one schedule mutation persists receipt, retry reconciles the same ID without creating another',async t=>{
	const {stateDir}=await fixture(t);
	await saveHistory(stateDir,{version:1,posts:[entry()]});
	const api=fakeBuffer();
	const options={stateDir,key:'test',organizationId:org,channelId:id,attemptId:'42:1',repository:'Clovhis/sucuplecuc',mediaRef:'a'.repeat(40),now,request:api.request,verifyMedia:async()=>{}};
	assert.equal((await publishInstagram(options)).mode,'scheduled');
	assert.equal(api.calls.filter(call=>call.query.includes('mutation')).length,1);
	const receipt=(await readHistory(stateDir)).posts[0];
	assert.equal(receipt.bufferPostId,'receipt');
	const retry=fakeBuffer([{id:'receipt',text:receipt.text,status:'scheduled',dueAt:receipt.dueAt}]);
	assert.equal((await publishInstagram({...options,attemptId:'43:1',request:retry.request})).mode,'existing');
	assert.equal(retry.calls.filter(call=>call.query.includes('mutation')).length,0);
});

test('a mutation timeout preserves the attempt and blocks another mutation, even if the remote list is empty',async t=>{
	const {stateDir}=await fixture(t);
	await saveHistory(stateDir,{version:1,posts:[entry()]});
	const api=fakeBuffer([],async()=>{throw Error('Timeout after sending');});
	const options={stateDir,key:'test',organizationId:org,channelId:id,attemptId:'42:1',repository:'Clovhis/sucuplecuc',mediaRef:'a'.repeat(40),now,request:api.request,verifyMedia:async()=>{}};
	await assert.rejects(publishInstagram(options),/Timeout/);
	assert.ok((await readHistory(stateDir)).posts[0].attemptedAt);
	await assert.rejects(publishInstagram(options),/ambiguo/);
	assert.equal(api.calls.filter(call=>call.query.includes('mutation')).length,1);
});

test('lost receipt is reconciled from Buffer before permitting a new reservation',async t=>{
	const {stateDir}=await fixture(t);
	await saveHistory(stateDir,{version:1,posts:[entry()]});
	const api=fakeBuffer([{id:'existing-id',text:entry().text,status:'sent',dueAt:entry().dueAt}]);
	const result=await prepareInstagram({stateDir,key:'test',organizationId:org,channelId:id,attemptId:'43:1',now,request:api.request});
	assert.equal(result.bufferPostId,'existing-id');
	assert.equal((await readHistory(stateDir)).posts[0].state,'sent');
	assert.equal(api.calls.filter(call=>call.query.includes('mutation')).length,0);
});

test('a missing receipt and different workflow attempt stops before any mutation',async t=>{
	const {stateDir}=await fixture(t);
	await saveHistory(stateDir,{version:1,posts:[entry()]});
	const api=fakeBuffer();
	await assert.rejects(publishInstagram({stateDir,key:'test',organizationId:org,channelId:id,attemptId:'43:1',now,request:api.request}),/ambiguo/);
	assert.equal(api.calls.filter(call=>call.query.includes('mutation')).length,0);
});

test('an existing failed Buffer post surfaces its error instead of reporting a successful daily schedule',async t=>{
	const {stateDir}=await fixture(t);
	await saveHistory(stateDir,{version:1,posts:[entry()]});
	const api=fakeBuffer([{id:'failed-id',text:entry().text,status:'error',dueAt:entry().dueAt}]);
	await assert.rejects(prepareInstagram({stateDir,key:'test',organizationId:org,channelId:id,attemptId:'43:1',now,request:api.request}),/failed-id.*error/);
	assert.equal((await readHistory(stateDir)).posts[0].bufferPostId,'failed-id');
	assert.equal(api.calls.filter(call=>call.query.includes('mutation')).length,0);
});
