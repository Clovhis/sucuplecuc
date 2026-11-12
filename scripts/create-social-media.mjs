import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, validSlug, renderMovieCard, scoreLabel, movieUrl, editorialExcerpt } from './lib/social-media.mjs';

const args = process.argv.slice(2);
const value = key => args[args.indexOf(key)+1];
try {
	const allowed = new Set(['--slugs','--format','--out']);
	for(let i=0;i<args.length;i+=2) if(!allowed.has(args[i]) || !args[i+1] || args[i+1].startsWith('--')) throw new Error('Uso: --slugs slug[,slug] --format feed|story|reel --out .tmp/social');
	const slugs = args.includes('--slugs') ? value('--slugs').split(',') : [];
	const format = args.includes('--format') ? value('--format') : 'feed';
	if(!slugs.length || slugs.length > 10 || slugs.some(slug => !validSlug(slug)) || new Set(slugs).size !== slugs.length) throw new Error('Indicá entre uno y diez slugs distintos del catálogo.');
	if(!['feed','story','reel'].includes(format)) throw new Error('Formato desconocido.');
	const output = path.resolve(args.includes('--out') ? value('--out') : '.tmp/social');
	await mkdir(output,{recursive:true});
	const cards = [];
	for(const [index,slug] of slugs.entries()) {
		const movie = JSON.parse(await readFile(path.join(ROOT,'src/data/movies',`${slug}.json`),'utf8'));
		const card = await renderMovieCard(movie,path.join(output,`card-${String(index).padStart(2,'0')}.jpg`),{format:format === 'feed' ? 'feed' : 'story'});
		cards.push({slug,title:movie.title,score:scoreLabel(movie),url:movieUrl(slug),excerpt:editorialExcerpt(movie),...card});
	}
	let video;
	if(format === 'reel') {
		// No audio: avoids unlicensed music and any external generation service.
		video = path.join(output,'reel.mp4');
		const result = spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-n','-framerate','1/5','-i',path.join(output,'card-%02d.jpg'),'-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-c:v','libx264','-r','30','-pix_fmt','yuv420p','-color_range','tv','-movflags','+faststart',video],{encoding:'utf8',timeout:120000});
		if(result.error || result.status !== 0) throw new Error('FFmpeg no pudo crear el Reel. Instalá FFmpeg desde su distribución oficial gratuita o usá las placas como carrusel. No se publicó nada.');
	}
	const manifest = {format,cards,...(video ? {video} : {}),note:'Archivos locales; requieren URL pública estable antes de usar assets en Buffer MCP. No publica ni modifica el historial diario.'};
	await writeFile(path.join(output,'manifest.json'),`${JSON.stringify(manifest,null,2)}\n`);
	console.log(JSON.stringify(manifest,null,2));
} catch(error) {console.error(error.message);process.exitCode=1;}
