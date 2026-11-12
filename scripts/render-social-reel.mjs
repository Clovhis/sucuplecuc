import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ROOT, digest } from './lib/social-media.mjs';
import { originalReelAudio } from './lib/social-reel-audio.mjs';

const escape = text => String(text).replace(/[&<>"']/gu,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

export function validateReelProject(project, release = false) {
	if (!project?.slug || !Array.isArray(project.scenes) || project.scenes.length < 2 || project.scenes.length > 12) throw new Error('El proyecto requiere slug y 2–12 escenas.');
	if (project.audio?.type !== 'original-synth-v1') throw new Error('Este renderer usa audio original; no acepta pistas extraídas de películas.');
	let duration = 0;
	for(const scene of project.scenes) {
		if (!Number.isFinite(scene.duration) || scene.duration < 1.5 || scene.duration > 8) throw new Error('Cada escena requiere 1.5–8 segundos.');
		if (!Array.isArray(scene.headline) || scene.headline.length<1 || scene.headline.length>3 || scene.headline.some(line=>typeof line!=='string' || line.length>30)) throw new Error('Titulares de 1–3 líneas, hasta 30 caracteres por línea.');
		const asset = project.assets?.[scene.asset];
		if(!asset?.credit || !asset.sourcePage || (!asset.url && !asset.localPath)) throw new Error('Falta imagen, crédito o página de origen.');
		if(release && (asset.rights?.status !== 'cleared' || !asset.rights?.evidence)) throw new Error(`Uso público pendiente para ${scene.asset}. El acceso técnico no acredita permiso.`);
		duration+=scene.duration;
	}
	if(duration<5 || duration>60) throw new Error('La duración total debe ser de 5–60 segundos.');
	return duration;
}

async function textImage(text, {size=64,width=920,color='#f7f3e9',bold=true}={}) {
	for(let fontSize=size;fontSize>=16;fontSize-=2) {
		const {data,info}=await sharp({text:{text:`<span foreground="${color}">${escape(text)}</span>`,font:`Noto Sans${bold?' Bold':''} ${fontSize}`,fontfile:path.join(ROOT,`assets/social/NotoSans-${bold?'Bold':'Regular'}.ttf`),width,rgba:true,align:'left'}}).png().toBuffer({resolveWithObject:true});
		if(info.height<=105)return data;
	}
	throw new Error('El texto no entra en su zona sin superponerse.');
}

function ffmpeg(args, cwd) {
	const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-n',...args],{cwd,encoding:'utf8',timeout:240000});
	if(result.error || result.status!==0)throw new Error(`FFmpeg: ${result.error?.message || result.stderr?.slice(-1800)}`);
}

export async function renderSocialReel(project, outputDir, {release=false}={}) {
	const duration=validateReelProject(project,release);
	await mkdir(outputDir,{recursive:true});
	const inputAssets=new Map();
	const sourceReceipts=[];
	for(const name of new Set(project.scenes.map(scene=>scene.asset))) {
		const asset=project.assets[name];
		let bytes;
		if(asset.localPath)bytes=await readFile(path.resolve(ROOT,asset.localPath));
		else {
			if(new URL(asset.url).protocol!=='https:')throw new Error('Sólo URLs HTTPS para fuentes.');
			const response=await fetch(asset.url,{signal:AbortSignal.timeout(30000)});
			if(!response.ok || !response.headers.get('content-type')?.startsWith('image/'))throw new Error(`Fuente no disponible: ${name} (${response.status}).`);
			bytes=Buffer.from(await response.arrayBuffer());
		}
		inputAssets.set(name,bytes);
		sourceReceipts.push({name,...asset,sha256:digest(bytes)});
	}
	const logo=await sharp(await readFile(path.join(ROOT,'public/brand/cineposta-logo-full.png'))).resize({width:250,height:70,fit:'inside'}).png().toBuffer();
	let time=0;
	const cuts=[];
	for(const [index,scene] of project.scenes.entries()) {
		const number=String(index).padStart(2,'0');
		const bytes=inputAssets.get(scene.asset);
		const background=await sharp(bytes).resize(1080,1920,{fit:'cover'}).blur(28).modulate({brightness:0.28,saturation:0.6}).png().toBuffer();
		const foreground=await sharp(bytes).resize({width:1080,height:850,fit:'inside'}).png().toBuffer({resolveWithObject:true});
		const imageTop=580+Math.round((850-foreground.info.height)/2);
		await sharp(background).composite([{input:foreground.data,left:Math.round((1080-foreground.info.width)/2),top:imageTop}]).png().toFile(path.join(outputDir,`${number}-photo.png`));
		const layers=[{input:logo,left:80,top:145}];
		layers.push({input:await textImage(project.eyebrow || 'ESTRENOS / CINE',{size:23,width:540,color:'#ff777d'}),left:420,top:164});
		for(const [lineIndex,line] of scene.headline.entries()) layers.push({input:await textImage(line,{size:scene.fontSize || 78,color:lineIndex===1?'#ff4f5b':'#f7f3e9'}),left:80,top:290+lineIndex*113});
		layers.push({input:await textImage(scene.subline || '',{size:31,width:920,bold:false}),left:80,top:1510});
		layers.push({input:await textImage('cineposta.com.ar',{size:32}),left:80,top:1625});
		layers.push({input:await textImage(project.imageCredit,{size:16,width:920,color:'#b7b6b4',bold:false}),left:80,top:1710});
		await sharp({create:{width:1080,height:1920,channels:4,background:'#00000000'}}).composite(layers).png().toFile(path.join(outputDir,`${number}-type.png`));
		const filter=`[0:v]zoompan=z='1.015+0.00045*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30[photo];[photo][1:v]overlay=x='44*exp(-12*t)':y=0:eval=frame,drawbox=x=80:y=245:w=920:h=4:color=0xff4f5b:t=fill,fade=t=in:st=0:d=0.08,fade=t=out:st=${scene.duration-0.08}:d=0.08,format=yuv420p[out]`;
		ffmpeg(['-loop','1','-framerate','30','-i',`${number}-photo.png`,'-loop','1','-framerate','30','-i',`${number}-type.png`,'-filter_complex',filter,'-map','[out]','-t',String(scene.duration),'-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-color_range','tv',`${number}.mp4`],outputDir);
		time+=scene.duration;
		cuts.push(time);
		console.log(`Escena ${index+1}/${project.scenes.length}: ${scene.duration}s`);
	}
	await writeFile(path.join(outputDir,'score-original.wav'),originalReelAudio(duration,cuts.slice(0,-1)));
	await writeFile(path.join(outputDir,'concat.txt'),project.scenes.map((_,i)=>`file '${String(i).padStart(2,'0')}.mp4'`).join('\n')+'\n');
	ffmpeg(['-f','concat','-safe','0','-i','concat.txt','-i','score-original.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-af','loudnorm=I=-16:TP=-3:LRA=7','-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-t',String(duration),'-movflags','+faststart','reel.mp4'],outputDir);
	const output=await readFile(path.join(outputDir,'reel.mp4'));
	const receipt={slug:project.slug,mode:release?'release':'local-preview',duration,width:1080,height:1920,video:'reel.mp4',sha256:digest(output),bytes:output.length,audio:{type:'original-synth-v1',bpm:120,description:'Composición procedural y efectos propios; sin samples ni audio de la película.'},rightsReady:sourceReceipts.every(asset=>asset.rights?.status==='cleared' && asset.rights?.evidence),sources:sourceReceipts,caption:project.caption};
	await writeFile(path.join(outputDir,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
	await writeFile(path.join(outputDir,'caption.txt'),project.caption+'\n');
	return receipt;
}

async function main() {
	const args=process.argv.slice(2);
	const projectPath=args[args.indexOf('--project')+1];
	const output=args[args.indexOf('--out')+1];
	if(!args.includes('--project') || !args.includes('--out') || !projectPath || !output)throw new Error('Uso: --project proyecto.json --out carpeta-nueva [--release]');
	console.log(JSON.stringify(await renderSocialReel(JSON.parse(await readFile(projectPath,'utf8')),path.resolve(output),{release:args.includes('--release')}),null,2));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
