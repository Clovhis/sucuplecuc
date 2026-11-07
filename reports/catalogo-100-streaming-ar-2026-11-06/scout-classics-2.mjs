import fs from 'node:fs/promises';
const query=`query SearchTitles($searchQuery: String!, $country: Country!, $language: Language!) { popularTitles(country:$country,first:10,filter:{searchQuery:$searchQuery,objectTypes:[MOVIE]}) { edges { node { ... on Movie { content(country:$country,language:$language){title originalReleaseYear fullPath} offers(country:$country,platform:WEB){monetizationType package{id clearName technicalName}} } } } } }`;
const candidates=[
 ["The Best Years of Our Lives",1946],["Notorious",1946],["Rome, Open City",1945],["Brief Encounter",1945],["The Treasure of the Sierra Madre",1948],["All About Eve",1950],["The Night of the Hunter",1955],["Invasion of the Body Snatchers",1956],["The Bridge on the River Kwai",1957],["Paths of Glory",1957],["Ben-Hur",1959],["Some Like It Hot",1959],["The Magnificent Seven",1960],["Spartacus",1960],["To Kill a Mockingbird",1962],["Lawrence of Arabia",1962],["Dr. No",1962],["The Great Escape",1963],["Mary Poppins",1964],["The Sound of Music",1965],["The Good, the Bad and the Ugly",1966],["2001: A Space Odyssey",1968],["Midnight Cowboy",1969],["MASH",1970],["The Last Picture Show",1971],["Deliverance",1972],["The Longest Yard",1974],["The Bad News Bears",1976],["The Man Who Fell to Earth",1976],["Assault on Precinct 13",1976],["Halloween",1978],["The Muppet Movie",1979],["Being There",1979],["The Black Stallion",1979],["Kagemusha",1980],["The Elephant Man",1980],["The Last Emperor",1987],["Cinema Paradiso",1988],["The Cook, the Thief, His Wife & Her Lover",1989],["Ran",1985]
];
const results=[];
for(const [title,year] of candidates){
 const response=await fetch('https://apis.justwatch.com/graphql',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,variables:{searchQuery:title,country:'AR',language:'es'}})});
 if(!response.ok)throw new Error('JustWatch HTTP '+response.status+' for '+title);
 const payload=await response.json();
 const hits=(payload.data?.popularTitles?.edges??[]).map(e=>e.node).filter(n=>n?.content).map(n=>({title:n.content.title,year:Number(n.content.originalReleaseYear),url:'https://www.justwatch.com'+n.content.fullPath,offers:n.offers??[]})).sort((a,b)=>Number(b.year===year)-Number(a.year===year));
 const best=hits[0];const seen=new Set();const offers=(best?.offers??[]).filter(o=>{const k=(o.package?.clearName||'')+'|'+o.monetizationType;if(seen.has(k))return false;seen.add(k);return true;}).map(o=>({type:o.monetizationType,provider:o.package?.clearName,technicalName:o.package?.technicalName}));
 results.push({title,year,matchedTitle:best?.title??null,matchedYear:best?.year??null,url:best?.url??null,exact:Number(best?.year)===year,offers});
}
await fs.writeFile('reports/catalogo-100-streaming-ar-2026-11-06/classics-scout-2.json',JSON.stringify({country:'AR',language:'es',verifiedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results.filter(x=>x.exact&&x.offers.some(o=>['FLATRATE','FLATRATE_AND_BUY'].includes(o.type))).map(({title,year,matchedTitle,url,offers})=>({title,year,matchedTitle,url,sub:offers.filter(o=>['FLATRATE','FLATRATE_AND_BUY'].includes(o.type)).map(o=>o.provider)})),null,2));
