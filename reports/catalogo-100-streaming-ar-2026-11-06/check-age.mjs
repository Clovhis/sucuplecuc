import fs from 'node:fs/promises';
const slugs = ['anatomia-de-un-asesinato','el-buscavidas','pelham-1-2-3','terror-en-amityville'];
const results=[];
for(const slug of slugs){
 const url=`https://www.justwatch.com/ar/pelicula/${slug}`;
 const response=await fetch(url,{headers:{'user-agent':'Mozilla/5.0','accept-language':'es-AR,es;q=0.9'}});
 const html=await response.text();
 const rating=html.match(/"contentRating":"([^"]+)"/);
 results.push({slug,url,httpStatus:response.status,contentRating:rating?.[1]??null,htmlBytes:html.length});
}
await fs.writeFile('reports/catalogo-100-streaming-ar-2026-11-06/ar-content-ratings.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results,null,2));
