import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { argentinaDate } from './lib/social-media.mjs';
import { FORMATS, planEdition, renderEdition, editionCaption } from './lib/instagram-editorial.mjs';
import {visualMovies} from './lib/instagram-images.mjs';

const out=path.resolve('.tmp/instagram-design');
await mkdir(out,{recursive:true});
const movies=await visualMovies();
const manifest=[];
const history={posts:[]};
for(const format of FORMATS) {
  const plan=planEdition(movies,history,new Set(),argentinaDate(),{format});
  const cards=await renderEdition(plan,path.join(out,format));
  manifest.push({format,slugs:plan.slugs,title:plan.title,palette:plan.palette,cards,text:editionCaption(plan)});
  history.posts.push({...plan,slug:plan.slugs[0]});
}
await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const thumbs=await Promise.all(manifest.map(async edition=>({input:await sharp(edition.cards[0].path).resize(324,405).toBuffer(),left:manifest.indexOf(edition)*324,top:0})));
await sharp({create:{width:324*FORMATS.length,height:405,channels:3,background:'#141719'}}).composite(thumbs).png().toFile(path.join(out,'formats.png'));
const carousel=manifest.find(p=>p.format==='carousel');
const slides=await Promise.all(carousel.cards.map(async(card,i)=>({input:await sharp(card.path).resize(270,338).toBuffer(),left:(i%3)*270,top:Math.floor(i/3)*338})));
await sharp({create:{width:810,height:676,channels:3,background:'#141719'}}).composite(slides).png().toFile(path.join(out,'carousel.png'));
console.log(out);
