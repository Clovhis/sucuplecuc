import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { originalReelAudio } from './lib/social-reel-audio.mjs';
import { validateReelProject, renderSocialReel } from './render-social-reel.mjs';

function project() {
	return {slug:'pelicula-2026',audio:{type:'original-synth-v1'},assets:{still:{url:'https://example.test/still.jpg',sourcePage:'https://example.test/press',credit:'Photo: studio',rights:{status:'pending',evidence:'Public gallery, scope not established.'}}},scenes:[{asset:'still',duration:3,headline:['UNA PELÍCULA.']},{asset:'still',duration:3,headline:['UNA IDEA PROPIA.']}]};
}

test('a public image with a credit remains a local preview when its permission is pending',()=>{
	assert.equal(validateReelProject(project()),6);
	assert.throws(()=>validateReelProject(project(),true),/Uso público pendiente/);
});

test('release rejects pending rights before fetching or creating output files',async t=>{
	const dir=await mkdtemp(path.join(tmpdir(),'cineposta-reel-rights-'));
	t.after(()=>rm(dir,{recursive:true,force:true}));
	await assert.rejects(renderSocialReel(project(),path.join(dir,'output'),{release:true}),/Uso público pendiente/);
	assert.deepEqual(await readdir(dir),[]);
});

test('each scene needs a known credited source and public release needs evidence for that source',()=>{
	const p=project();
	p.assets.still.rights.status='cleared';
	assert.equal(validateReelProject(p,true),6);
	delete p.assets.still.rights.evidence;
	assert.throws(()=>validateReelProject(p,true));
	delete p.assets.still.credit;
	assert.throws(()=>validateReelProject(p));
});

test('scene timing, overall duration and headline constraints prevent unreadable video projects',()=>{
	for(const duration of [0,1,9,NaN]){
		const p=project();p.scenes[0].duration=duration;
		assert.throws(()=>validateReelProject(p));
	}
	const p=project();p.scenes=Array.from({length:10},()=>({asset:'still',duration:8,headline:['DEMASIADO LARGO']}));
	assert.throws(()=>validateReelProject(p),/duración total/);
	const wide=project();wide.scenes[0].headline=['W'.repeat(31)];
	assert.throws(()=>validateReelProject(wide),/Titulares/);
});

test('the renderer never mistakes film music or an unknown audio mode for original composition',()=>{
	const p=project();p.audio.type='movie-soundtrack';
	assert.throws(()=>validateReelProject(p),/audio original/);
});

test('original audio is deterministic 48kHz stereo PCM with real signal and bounded peaks',()=>{
	const audio=originalReelAudio(2,[1]);
	assert.equal(audio.toString('ascii',0,4),'RIFF');
	assert.equal(audio.toString('ascii',8,12),'WAVE');
	assert.equal(audio.readUInt32LE(24),48000);
	assert.equal(audio.readUInt16LE(22),2);
	assert.equal(audio.readUInt16LE(34),16);
	assert.equal(audio.length,44+2*48000*4);
	let peak=0,energy=0;
	for(let index=44;index<audio.length;index+=2){const value=audio.readInt16LE(index);peak=Math.max(peak,Math.abs(value));energy+=value*value;}
	assert.ok(peak>1000 && peak<32767);
	assert.ok(energy>0);
	assert.equal(audio.readInt16LE(44),0);
	assert.ok(Math.abs(audio.readInt16LE(audio.length-2))<100);
	assert.deepEqual(audio,originalReelAudio(2,[1]));
	assert.notDeepEqual(audio,originalReelAudio(2,[]));
});

test('audio refuses unbounded allocations and invalid durations',()=>{
	for(const duration of [0,-1,Infinity,NaN,61])assert.throws(()=>originalReelAudio(duration));
});
