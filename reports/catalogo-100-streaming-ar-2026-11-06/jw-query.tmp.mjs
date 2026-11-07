import fs from 'node:fs/promises';
const query = `query SearchTitles($searchQuery: String!, $country: Country!, $language: Language!) { popularTitles(country: $country, first: 8, filter: {searchQuery: $searchQuery, objectTypes: [MOVIE]}) { edges { node { ... on Movie { content(country: $country, language: $language) { title originalReleaseYear fullPath } offers(country: $country, platform: WEB) { monetizationType package { id clearName technicalName shortName } } } } } } }`;
const titles = [
 ['Chantaje en Broadway','Sweet Smell of Success',1957],['Sed de mal','Touch of Evil',1958],['Anatomía de un asesinato','Anatomy of a Murder',1959],['El buscavidas','The Hustler',1961],['El mensajero del miedo','The Manchurian Candidate',1962],['La pantera rosa','The Pink Panther',1963],['Doce del patíbulo','The Dirty Dozen',1967],['Serpico','Serpico',1973],['Pelham 1, 2, 3','The Taking of Pelham One Two Three',1974],['Terror en Amityville','The Amityville Horror',1979]
];
const results=[];
for (const [title, originalTitle, year] of titles) {
 const response=await fetch('https://apis.justwatch.com/graphql',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,variables:{searchQuery:originalTitle,country:'AR',language:'es'}})});
 if(!response.ok) throw new Error('JustWatch HTTP '+response.status+' for '+originalTitle);
 const payload=await response.json();
 if(payload.errors?.length) throw new Error(JSON.stringify(payload.errors));
 const candidates=(payload.data?.popularTitles?.edges??[]).map(e=>e.node).filter(n=>n?.content).map(node=>({node,title:node.content.title,year:Number(node.content.originalReleaseYear),fullPath:node.content.fullPath,score:(node.content.title===title?120:0)+(Number(node.content.originalReleaseYear)===year?30:0)})).sort((a,b)=>b.score-a.score);
 const best=candidates[0];
 const exact=best&&best.score>=150&&best.year===year;
 const seen=new Set();
 const offers=exact?(best.node.offers??[]).filter(o=>{const key=(o.package?.id||'')+'|'+o.monetizationType;if(seen.has(key))return false;seen.add(key);return true;}).map(o=>({type:o.monetizationType,provider:o.package?.clearName,technicalName:o.package?.technicalName})) : [];
 results.push({title,originalTitle,year,matched:!!exact,matchedTitle:best?.title??null,matchedYear:best?.year??null,url:exact?'https://www.justwatch.com'+best.fullPath:null,checkedAt:new Date().toISOString(),offers});
}
await fs.writeFile('reports/catalogo-100-streaming-ar-2026-11-06/justwatch-availability.json',JSON.stringify({country:'AR',language:'es',source:'https://apis.justwatch.com/graphql',checkedDate:'2026-11-06',results},null,2)+'\n');
console.log(JSON.stringify(results.map(({title,url,offers,matched})=>({title,matched,url,offers:offers.filter(o=>o.type==='FLATRATE')})),null,2));
