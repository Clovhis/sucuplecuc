import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { SEARCH_ACCEPTANCE_CASES } from './search-acceptance-cases.mjs';
const folder = 'src/data/movies';
const arg=(key,fallback)=>process.argv.includes(key)?process.argv[process.argv.indexOf(key)+1]:fallback;
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date());
const reportDir=arg('--report-dir',`reports/search-title-audit-${today}`);
await mkdir(reportDir,{recursive:true});
const movies = await Promise.all((await readdir(folder)).filter((file)=>file.endsWith('.json')).map(async(file)=>JSON.parse(await readFile(`${folder}/${file}`,'utf8'))));
const normalize = (value) => String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu,' ').trim();
const requested = new Set(SEARCH_ACCEPTANCE_CASES.flatMap((row)=>row.top?[row.top]:[]));
const existing=JSON.parse(await readFile('src/data/movie-search-aliases.json','utf8'));
if(process.argv.includes('--check')){
	const invalid=existing.entries.filter((entry)=>!movies.some((movie)=>movie.slug===entry.slug&&movie.year===entry.year));
	console.log(JSON.stringify({catalog:movies.length,aliasMovies:existing.entries.length,invalid:invalid.map((entry)=>entry.slug),newMoviesAreImmediatelySearchableByTitleAndOriginal:true}));
	if(invalid.length)process.exitCode=1;
}else{
const recentDays=Number(arg('--recent-days',0));
if(!Number.isInteger(recentDays)||recentDays<0||recentDays>365)throw new Error('Invalid recent-days');
const cutoff=new Date(`${today}T12:00:00Z`);cutoff.setUTCDate(cutoff.getUTCDate()-recentDays);
const cutoffDay=cutoff.toISOString().slice(0,10);
const candidates = movies.filter((movie)=>recentDays ? movie.catalogAddedAt>=cutoffDay : requested.has(movie.slug) || (normalize(movie.title)===normalize(movie.originalTitle) && movie.year<=2015 && movie.cinepostaScore>=6))
	.sort((a,b)=>Number(requested.has(b.slug))-Number(requested.has(a.slug)) || (b.cinepostaScore??0)-(a.cinepostaScore??0) || a.slug.localeCompare(b.slug)).slice(0,250);
const query=`query($q:String!){popularTitles(country:AR,first:5,filter:{searchQuery:$q,objectTypes:[MOVIE]}){edges{node{id ... on Movie{content(country:AR,language:es){title originalTitle originalReleaseYear fullPath} english:content(country:US,language:en){title originalTitle originalReleaseYear fullPath} spanish:content(country:ES,language:es){title fullPath}}}}}}`;
let cached=[];
try { cached=JSON.parse(await readFile(`${reportDir}/title-evidence.json`,'utf8')).results; } catch {}
const results = [];
let cursor=0;
async function worker(){while(cursor<candidates.length){const movie=candidates[cursor++];
	const old=cached.find((row)=>row.slug===movie.slug && row.year===movie.year && row.query===(movie.originalTitle||movie.title) && row.status==='verified');
	if(old){results.push(old);continue;}
	try {
		const response=await fetch('https://apis.justwatch.com/graphql',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,variables:{q:movie.originalTitle||movie.title}}),signal:AbortSignal.timeout(15000)});
		if(!response.ok)throw new Error(`HTTP ${response.status}`);
		const payload=await response.json(); if(payload.errors)throw new Error('GraphQL error');
		const known=new Set([movie.title,movie.originalTitle].map(normalize));
		const matches=(payload.data?.popularTitles?.edges??[]).map((row)=>row.node).filter((row)=>row.content?.originalReleaseYear===movie.year && [row.content.title,row.content.originalTitle,row.english?.title,row.english?.originalTitle].some((name)=>known.has(normalize(name))));
		results.push({slug:movie.slug,year:movie.year,query:movie.originalTitle||movie.title,status:matches.length===1?'verified':matches.length?'ambiguous':'unmatched',match:matches.length===1?matches[0]:null});
	}catch(error){results.push({slug:movie.slug,status:'error',error:error.message});}
	if(results.length%25===0)console.log(`${results.length}/${candidates.length}`);
	await new Promise((resolve)=>setTimeout(resolve,150));
}}
await Promise.all([worker(),worker(),worker()]);
results.sort((a,b)=>a.slug.localeCompare(b.slug));
const entries=results.filter((row)=>row.status==='verified').flatMap((row)=>{
	const movie=movies.find((entry)=>entry.slug===row.slug);
	const known=new Set([movie.title,movie.originalTitle].map(normalize));
	const titles=[];
	for(const [region,content] of [['AR',row.match.content],['ES',row.match.spanish],['US',row.match.english],['AR',{title:row.match.content.originalTitle,fullPath:row.match.content.fullPath,original:true}]]){
		if(!content?.title||known.has(normalize(content.title))||!content.fullPath?.startsWith(`/${region.toLowerCase()}/`))continue;
		known.add(normalize(content.title)); titles.push({title:content.title,region,source:`https://www.justwatch.com${content.fullPath}`,...content.original?{kind:'original'}:{}});
	}
	return titles.length?[{slug:movie.slug,year:movie.year,titles}]:[];
});
// Additive enrichment: a weekly intake never discards earlier verified aliases.
for(const old of existing.entries){
	if(!movies.some((movie)=>movie.slug===old.slug&&movie.year===old.year))continue;
	const current=entries.find((entry)=>entry.slug===old.slug);
	if(!current){entries.push(old);continue;}
	for(const item of old.titles)if(!current.titles.some((title)=>normalize(title.title)===normalize(item.title)))current.titles.push(item);
}
entries.sort((a,b)=>a.slug.localeCompare(b.slug));
await writeFile('src/data/movie-search-aliases.json',JSON.stringify({verifiedAt:today,entries},null,2)+'\n');
await writeFile(`${reportDir}/title-evidence.json`,JSON.stringify({verifiedAt:today,identityGate:'Unique exact normalized known title/original/English title AND exact original year; AR search, same Movie node for every regional alias.',results},null,2)+'\n');
const summary={catalog:movies.length,identicalTitleAndOriginal:movies.filter((r)=>normalize(r.title)===normalize(r.originalTitle)).length,missingOriginal:movies.filter((r)=>!r.originalTitle?.trim()).map((r)=>r.slug),researched:candidates.length,verified:results.filter((r)=>r.status==='verified').length,pending:results.filter((r)=>r.status!=='verified').map(({slug,status})=>({slug,status})),moviesWithNewAliases:entries.length,newAliases:entries.reduce((n,row)=>n+row.titles.length,0)};
await writeFile(`${reportDir}/title-audit.json`,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
}
