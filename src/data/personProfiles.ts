import type { PersonProfileRecord } from '../types/person';

const globalActorDefaults = {
	roles: ['Actor'],
	stats: [
		{ label: 'Momento', value: 'Radar 2024-2026' },
		{ label: 'Marca', value: 'Prestigio + taquilla' },
		{ label: 'Pulso', value: 'Figura global' },
	],
};

const globalActressDefaults = {
	roles: ['Actriz'],
	stats: [
		{ label: 'Momento', value: 'Radar 2024-2026' },
		{ label: 'Marca', value: 'Prestigio + franquicia' },
		{ label: 'Pulso', value: 'Figura global' },
	],
};

const globalDirectorDefaults = {
	roles: ['Director'],
	stats: [
		{ label: 'Momento', value: 'Autor de alto perfil' },
		{ label: 'Marca', value: 'Peliculas evento' },
		{ label: 'Pulso', value: 'Industria + autor' },
	],
};

const argentineActorDefaults = {
	roles: ['Actor'],
	stats: [
		{ label: 'Momento', value: 'Radar argentino' },
		{ label: 'Marca', value: 'Cine nacional' },
		{ label: 'Pulso', value: 'Figura fuerte' },
	],
};

const argentineActressDefaults = {
	roles: ['Actriz'],
	stats: [
		{ label: 'Momento', value: 'Radar argentino' },
		{ label: 'Marca', value: 'Presencia clave' },
		{ label: 'Pulso', value: 'Cine nacional' },
	],
};

const argentineDirectorDefaults = {
	roles: ['Director'],
	stats: [
		{ label: 'Momento', value: 'Autor argentino' },
		{ label: 'Marca', value: 'Prestigio festivalero' },
		{ label: 'Pulso', value: 'Mirada propia' },
	],
};

const bulkProfileReferenceUrls = {
	'timothee-chalamet': [
		'https://www.wikidata.org/wiki/Q19877770',
		'https://www.imdb.com/name/nm3154303/',
		'https://www.themoviedb.org/person/1190668-timothee-chalamet',
	],
	'paul-mescal': [
		'https://www.wikidata.org/wiki/Q73367368',
		'https://www.imdb.com/name/nm8958770/',
		'https://www.themoviedb.org/person/2326151-paul-mescal',
	],
	'austin-butler': [
		'https://www.wikidata.org/wiki/Q469954',
		'https://www.imdb.com/name/nm2581521/',
		'https://www.themoviedb.org/person/86654-austin-butler',
	],
	'glen-powell': [
		'https://www.wikidata.org/wiki/Q5567967',
		'https://www.imdb.com/name/nm1412974/',
		'https://www.themoviedb.org/person/83271-glen-powell',
	],
	'pedro-pascal': [
		'https://www.wikidata.org/wiki/Q14752155',
		'https://www.imdb.com/name/nm0050959/',
		'https://www.themoviedb.org/person/1253360-pedro-pascal',
	],
	'cillian-murphy': [
		'https://www.wikidata.org/wiki/Q202589',
		'https://www.imdb.com/name/nm0614165/',
		'https://www.themoviedb.org/person/2037-cillian-murphy',
	],
	'barry-keoghan': [
		'https://www.wikidata.org/wiki/Q28542230',
		'https://www.imdb.com/name/nm4422686/',
		'https://www.themoviedb.org/person/1290466-barry-keoghan',
	],
	'colman-domingo': [
		'https://www.wikidata.org/wiki/Q5147723',
		'https://www.imdb.com/name/nm0231458/',
		'https://www.themoviedb.org/person/91671-colman-domingo',
	],
	'sebastian-stan': [
		'https://www.wikidata.org/wiki/Q455898',
		'https://www.imdb.com/name/nm1659221/',
		'https://www.themoviedb.org/person/60898-sebastian-stan',
	],
	'andrew-garfield': [
		'https://www.wikidata.org/wiki/Q23891',
		'https://www.imdb.com/name/nm1940449/',
		'https://www.themoviedb.org/person/37625-andrew-garfield',
	],
	'robert-pattinson': [
		'https://www.wikidata.org/wiki/Q36767',
		'https://www.imdb.com/name/nm1500155/',
		'https://www.themoviedb.org/person/11288-robert-pattinson',
	],
	'josh-o-connor': ['https://www.wikidata.org/wiki/Q27898655', 'https://www.imdb.com/name/nm4853066/'],
	'aaron-taylor-johnson': [
		'https://www.wikidata.org/wiki/Q45923',
		'https://www.imdb.com/name/nm1093951/',
		'https://www.themoviedb.org/person/27428-aaron-taylor-johnson',
	],
	'adrien-brody': [
		'https://www.wikidata.org/wiki/Q104514',
		'https://www.imdb.com/name/nm0004778/',
		'https://www.themoviedb.org/person/3490-adrien-brody',
	],
	'kieran-culkin': [
		'https://www.wikidata.org/wiki/Q313204',
		'https://www.imdb.com/name/nm0001085/',
		'https://www.themoviedb.org/person/18793-kieran-culkin',
	],
	'ralph-fiennes': [
		'https://www.wikidata.org/wiki/Q28493',
		'https://www.imdb.com/name/nm0000146/',
		'https://www.themoviedb.org/person/5469-ralph-fiennes',
	],
	'daniel-craig': [
		'https://www.wikidata.org/wiki/Q4547',
		'https://www.imdb.com/name/nm0185819/',
		'https://www.themoviedb.org/person/8784-daniel-craig',
	],
	'tom-cruise': [
		'https://www.wikidata.org/wiki/Q37079',
		'https://www.imdb.com/name/nm0000129/',
		'https://www.themoviedb.org/person/500-tom-cruise',
	],
	'ryan-gosling': [
		'https://www.wikidata.org/wiki/Q193815',
		'https://www.imdb.com/name/nm0331516/',
		'https://www.themoviedb.org/person/30614-ryan-gosling',
	],
	'michael-b-jordan': [
		'https://www.wikidata.org/wiki/Q3308007',
		'https://www.imdb.com/name/nm0430107/',
		'https://www.themoviedb.org/person/135651-michael-b-jordan',
	],
	'adam-driver': [
		'https://www.wikidata.org/wiki/Q4678990',
		'https://www.imdb.com/name/nm3485845/',
		'https://www.themoviedb.org/person/1023139-adam-driver',
	],
	'jacob-elordi': [
		'https://www.wikidata.org/wiki/Q53909401',
		'https://www.imdb.com/name/nm8624059/',
		'https://www.themoviedb.org/person/2034418-jacob-elordi',
	],
	'oscar-isaac': [
		'https://www.wikidata.org/wiki/Q336788',
		'https://www.imdb.com/name/nm1209966/',
		'https://www.themoviedb.org/person/25072-oscar-isaac',
	],
	'dev-patel': [
		'https://www.wikidata.org/wiki/Q245075',
		'https://www.imdb.com/name/nm2353862/',
		'https://www.themoviedb.org/person/76788-dev-patel',
	],
	'wagner-moura': [
		'https://www.wikidata.org/wiki/Q922503',
		'https://www.imdb.com/name/nm0609944/',
		'https://www.themoviedb.org/person/52583-wagner-moura',
	],
	'zendaya': [
		'https://www.wikidata.org/wiki/Q189489',
		'https://www.imdb.com/name/nm3918035/',
		'https://www.themoviedb.org/person/505710-zendaya',
	],
	'sydney-sweeney': [
		'https://www.wikidata.org/wiki/Q49561909',
		'https://www.imdb.com/name/nm2858875/',
		'https://www.themoviedb.org/person/115440-sydney-sweeney',
	],
	'mikey-madison': [
		'https://www.wikidata.org/wiki/Q26923245',
		'https://www.imdb.com/name/nm5700898/',
		'https://www.themoviedb.org/person/1640439-mikey-madison',
	],
	'demi-moore': [
		'https://www.wikidata.org/wiki/Q43044',
		'https://www.imdb.com/name/nm0000193/',
		'https://www.themoviedb.org/person/3416-demi-moore',
	],
	'zoe-saldana': [
		'https://www.wikidata.org/wiki/Q190162',
		'https://www.imdb.com/name/nm0757855/',
		'https://www.themoviedb.org/person/8691-zoe-saldana',
	],
	'margaret-qualley': [
		'https://www.wikidata.org/wiki/Q17380672',
		'https://www.imdb.com/name/nm4960279/',
		'https://www.themoviedb.org/person/1392137-margaret-qualley',
	],
	'florence-pugh': [
		'https://www.wikidata.org/wiki/Q22277803',
		'https://www.imdb.com/name/nm6073955/',
		'https://www.themoviedb.org/person/1373737-florence-pugh',
	],
	'jenna-ortega': [
		'https://www.wikidata.org/wiki/Q21738166',
		'https://www.imdb.com/name/nm4911194/',
		'https://www.themoviedb.org/person/974169-jenna-ortega',
	],
	'anya-taylor-joy': [
		'https://www.wikidata.org/wiki/Q20882479',
		'https://www.imdb.com/name/nm5896355/',
		'https://www.themoviedb.org/person/1397778-anya-taylor-joy',
	],
	'cailee-spaeny': [
		'https://www.wikidata.org/wiki/Q43387663',
		'https://www.imdb.com/name/nm8314228/',
		'https://www.themoviedb.org/person/1683343-cailee-spaeny',
	],
	'rebecca-ferguson': [
		'https://www.wikidata.org/wiki/Q4947838',
		'https://www.imdb.com/name/nm0272581/',
		'https://www.themoviedb.org/person/933238-rebecca-ferguson',
	],
	'ana-de-armas': [
		'https://www.wikidata.org/wiki/Q698173',
		'https://www.imdb.com/name/nm1869101/',
		'https://www.themoviedb.org/person/224513-ana-de-armas',
	],
	'ariana-grande': [
		'https://www.wikidata.org/wiki/Q151892',
		'https://www.imdb.com/name/nm3812858/',
		'https://www.themoviedb.org/person/226001-ariana-grande',
	],
	'cynthia-erivo': [
		'https://www.wikidata.org/wiki/Q21592474',
		'https://www.imdb.com/name/nm7248827/',
		'https://www.themoviedb.org/person/1765068-cynthia-erivo',
	],
	'fernanda-torres': [
		'https://www.wikidata.org/wiki/Q465907',
		'https://www.imdb.com/name/nm0868639/',
		'https://www.themoviedb.org/person/87335-fernanda-torres',
	],
	'vanessa-kirby': [
		'https://www.wikidata.org/wiki/Q6159535',
		'https://www.imdb.com/name/nm3948952/',
		'https://www.themoviedb.org/person/556356-vanessa-kirby',
	],
	'rachel-zegler': [
		'https://www.wikidata.org/wiki/Q61693947',
		'https://www.imdb.com/name/nm10399505/',
		'https://www.themoviedb.org/person/2217977-rachel-zegler',
	],
	'ayo-edebiri': [
		'https://www.wikidata.org/wiki/Q99365507',
		'https://www.imdb.com/name/nm8731249/',
		'https://www.themoviedb.org/person/2195140-ayo-edebiri',
	],
	'jessie-buckley': [
		'https://www.wikidata.org/wiki/Q6187642',
		'https://www.imdb.com/name/nm2976580/',
		'https://www.themoviedb.org/person/1498158-jessie-buckley',
	],
	'margot-robbie': [
		'https://www.wikidata.org/wiki/Q1924847',
		'https://www.imdb.com/name/nm3053338/',
		'https://www.themoviedb.org/person/234352-margot-robbie',
	],
	'julianne-moore': [
		'https://www.wikidata.org/wiki/Q80405',
		'https://www.imdb.com/name/nm0000194/',
		'https://www.themoviedb.org/person/1231-julianne-moore',
	],
	'sandra-huller': [
		'https://www.wikidata.org/wiki/Q70003',
		'https://www.imdb.com/name/nm1197689/',
		'https://www.themoviedb.org/person/7152-sandra-huller',
	],
	'pamela-anderson': [
		'https://www.wikidata.org/wiki/Q83325',
		'https://www.imdb.com/name/nm0000097/',
		'https://www.themoviedb.org/person/6736-pamela-anderson',
	],
	'renate-reinsve': [
		'https://www.wikidata.org/wiki/Q28718257',
		'https://www.imdb.com/name/nm4561559/',
		'https://www.themoviedb.org/person/1576786-renate-reinsve',
	],
	'elle-fanning': [
		'https://www.wikidata.org/wiki/Q228943',
		'https://www.imdb.com/name/nm1102577/',
		'https://www.themoviedb.org/person/18050-elle-fanning',
	],
	'sean-baker': [
		'https://www.wikidata.org/wiki/Q7441419',
		'https://www.imdb.com/name/nm0048918/',
		'https://www.themoviedb.org/person/118415-sean-baker',
	],
	'denis-villeneuve': [
		'https://www.wikidata.org/wiki/Q548823',
		'https://www.imdb.com/name/nm0898288/',
		'https://www.themoviedb.org/person/137427-denis-villeneuve',
	],
	'coralie-fargeat': [
		'https://www.wikidata.org/wiki/Q60837652',
		'https://www.imdb.com/name/nm0267287/',
		'https://www.themoviedb.org/person/1607016-coralie-fargeat',
	],
	'brady-corbet': [
		'https://www.wikidata.org/wiki/Q897115',
		'https://www.imdb.com/name/nm1227232/',
		'https://www.themoviedb.org/person/55493-brady-corbet',
	],
	'ryan-coogler': [
		'https://www.wikidata.org/wiki/Q7383978',
		'https://www.imdb.com/name/nm3363032/',
		'https://www.themoviedb.org/person/1056121-ryan-coogler',
	],
	'ricardo-darin': [
		'https://www.wikidata.org/wiki/Q463860',
		'https://www.imdb.com/name/nm0201857/',
		'https://www.themoviedb.org/person/69310-ricardo-darin',
	],
	'peter-lanzani': [
		'https://www.wikidata.org/wiki/Q2203927',
		'https://www.imdb.com/name/nm2306611/',
		'https://www.themoviedb.org/person/1246181-peter-lanzani',
	],
	'leonardo-sbaraglia': [
		'https://www.wikidata.org/wiki/Q1189379',
		'https://www.imdb.com/name/nm0768614/',
		'https://www.themoviedb.org/person/19803-leonardo-sbaraglia',
	],
	'guillermo-francella': [
		'https://www.wikidata.org/wiki/Q3277882',
		'https://www.imdb.com/name/nm0289856/',
		'https://www.themoviedb.org/person/93650-guillermo-francella',
	],
	'chino-darin': [
		'https://www.wikidata.org/wiki/Q5766607',
		'https://www.imdb.com/name/nm3779182/',
		'https://www.themoviedb.org/person/1308586-chino-darin',
	],
	'dolores-fonzi': [
		'https://www.wikidata.org/wiki/Q929860',
		'https://www.imdb.com/name/nm0285135/',
		'https://www.themoviedb.org/person/74909-dolores-fonzi',
	],
	'mercedes-moran': [
		'https://www.wikidata.org/wiki/Q3306307',
		'https://www.imdb.com/name/nm0608187/',
		'https://www.themoviedb.org/person/18499-mercedes-moran',
	],
	'soledad-villamil': [
		'https://www.wikidata.org/wiki/Q769719',
		'https://www.imdb.com/name/nm0897845/',
		'https://www.themoviedb.org/person/93647-soledad-villamil',
	],
	'erica-rivas': [
		'https://www.wikidata.org/wiki/Q8078416',
		'https://www.imdb.com/name/nm0729050/',
		'https://www.themoviedb.org/person/141455-erica-rivas',
	],
	'alejandra-flechner': [
		'https://www.wikidata.org/wiki/Q2844031',
		'https://www.imdb.com/name/nm0281371/',
		'https://www.themoviedb.org/person/239252-alejandra-flechner',
	],
	'lucrecia-martel': [
		'https://www.wikidata.org/wiki/Q254152',
		'https://www.imdb.com/name/nm0551506/',
		'https://www.themoviedb.org/person/56208-lucrecia-martel',
	],
	'santiago-mitre': [
		'https://www.wikidata.org/wiki/Q6121032',
		'https://www.imdb.com/name/nm1377207/',
		'https://www.themoviedb.org/person/84677-santiago-mitre',
	],
	'damian-szifron': [
		'https://www.wikidata.org/wiki/Q5212638',
		'https://www.imdb.com/name/nm1167933/',
		'https://www.themoviedb.org/person/591600-damian-szifron',
	],
};

const bulkProfileImageUrls = {
	'timothee-chalamet':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Timoth%C3%A9e%20Chalamet-63541%20(cropped).jpg?width=640',
	'paul-mescal':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20Mescal%20at%20the%20Toronto%20International%20Film%20Festival%20in%202025%202%20(cropped%202).jpg?width=640',
	'austin-butler':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Austin%20Butler%20at%20the%202025%20Cannes%20Film%20Festival%2002.jpg?width=640',
	'glen-powell':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Glen%20Powell%20at%20CinemaCon%202025%2006%20(cropped).jpg?width=640',
	'pedro-pascal': 'https://commons.wikimedia.org/wiki/Special:FilePath/Pedro%20Pascal%20by%20Gage%20Skidmore.jpg?width=640',
	'cillian-murphy':
		'https://commons.wikimedia.org/wiki/Special:FilePath/CillianMurphy-TIFF2025-01-Cropped%20(cropped).png?width=640',
	'barry-keoghan': 'https://commons.wikimedia.org/wiki/Special:FilePath/Barry%20Keoghan%202024%20(cropped).jpg?width=640',
	'colman-domingo':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Colman%20Domingo%20at%2082nd%20Venice%20International%20Film%20Festival-1.jpg?width=640',
	'sebastian-stan':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Sebastian%20Stan%20by%20Gage%20Skidmore%202%20(cropped).jpg?width=640',
	'andrew-garfield': 'https://commons.wikimedia.org/wiki/Special:FilePath/Andrew%20Garfield.jpg?width=640',
	'robert-pattinson':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Robert%20Pattinson%20at%20Berlinale%202025.jpg?width=640',
	'josh-o-connor':
		"https://commons.wikimedia.org/wiki/Special:FilePath/Josh%20O'Connor%2C%20Toronto%20International%20Film%20Festival%202025%201.jpg?width=640",
	'aaron-taylor-johnson':
		"https://commons.wikimedia.org/wiki/Special:FilePath/Rahm%20Emanuel%2C%20Aaron%20Taylor-Johnson%20and%20Brad%20Pitt%20at%20'Bullet%20Train'%20event%20at%20Tokyo%20Station%202022-08-23%20cropped.jpg?width=640",
	'adrien-brody':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Adrien%20Brody%20Is%20This%20Thing%20On-89%20(cropped).jpg?width=640',
	'kieran-culkin':
		'https://commons.wikimedia.org/wiki/Special:FilePath/ARealPainBFILFF131024%20(82%20of%20138)%20(54065186044)%20(cropped)%20(cropped).jpg?width=640',
	'ralph-fiennes':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Ralph%20Fiennes%20from%20%22The%20White%20Crow%22%20at%20Opening%20Ceremony%20of%20the%20Tokyo%20International%20Film%20Festival%202018%20(31747095048).jpg?width=640',
	'daniel-craig': 'https://commons.wikimedia.org/wiki/Special:FilePath/Daniel%20Craig-62900.jpg?width=640',
	'tom-cruise':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Tom%20Cruise%20at%2053rd%20Saturn%20Awards%202026-01.jpg?width=640',
	'ryan-gosling':
		'https://commons.wikimedia.org/wiki/Special:FilePath/GoslingBFI081223%20(22%20of%2030)%20(53388157347)%20(cropped).jpg?width=640',
	'michael-b-jordan':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Michael%20B%20Jordan%20-%20Sinners.jpg?width=640',
	'adam-driver': 'https://commons.wikimedia.org/wiki/Special:FilePath/Adam%20Driver.jpg?width=640',
	'jacob-elordi':
		'https://commons.wikimedia.org/wiki/Special:FilePath/JacobElordi-TIFF2025-01%20(cropped%202).png?width=640',
	'oscar-isaac':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Oscar%20Isaac%20at%2082nd%20Venice%20International%20Film%20Festival-1%20(cropped).jpg?width=640',
	'dev-patel': 'https://commons.wikimedia.org/wiki/Special:FilePath/SXSW%202024%20-%20Dev%20Patel%204%20(cropped).jpg?width=640',
	'wagner-moura': 'https://commons.wikimedia.org/wiki/Special:FilePath/Wagner%20Moura-6546.jpg?width=640',
	'zendaya': 'https://commons.wikimedia.org/wiki/Special:FilePath/Zendaya%20-%202019%20by%20Glenn%20Francis.jpg?width=640',
	'sydney-sweeney':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Sydney%20Sweeney%20at%20the%202024%20Toronto%20International%20Film%20Festival%2004%20(Cropped).jpg?width=640',
	'mikey-madison':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Mikey%20Madison%20at%20the%202024%20TIFF%20(cropped).jpg?width=640',
	'demi-moore':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Demi%20Moore%20at%20WWD%20Style%20Awards%202026.jpg?width=640',
	'zoe-saldana':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Zoe%20Salda%C3%B1a%20at%20the%202024%20Toronto%20International%20Film%20Festival%20(cropped).jpg?width=640',
	'margaret-qualley':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Margaret%20Qualley%20at%20the%202025%20Cannes%20Film%20Festival%2001.jpg?width=640',
	'florence-pugh':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Actress%20Florence%20Pugh%20-%20Thunderbolts%20-%20L.A.%20Premiere%20(cropped).jpg?width=640',
	'jenna-ortega':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Jenna%20Ortega-63799%20(cropped).jpg?width=640',
	'anya-taylor-joy':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Anya%20Taylor-Joy%20at%20the%202025%20Toronto%20International%20Film%20Festival.%2007%20(cropped).jpg?width=640',
	'cailee-spaeny':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Cailee%20Spaeny%20TIFF%202025%202%20(cropped).jpg?width=640',
	'rebecca-ferguson':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Rebecca%20Ferguson%20in%202018.jpg?width=640',
	'ana-de-armas':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Ana%20de%20Armas%20(54462619561)%20(cropped%203).jpg?width=640',
	'ariana-grande':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Ariana%20Grande%20promoting%20Wicked%20(2024).jpg?width=640',
	'cynthia-erivo':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Cynthia%20Erivo%20-%20Wicked-FYC-1.jpg?width=640',
	'fernanda-torres':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Fernanda%20Torres%2C%20September%202024.jpg?width=640',
	'vanessa-kirby':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Vanessa%20Kirby%20at%20the%202024%20Toronto%20International%20Film%20Festival%2008%20(Cropped).jpg?width=640',
	'rachel-zegler': 'https://commons.wikimedia.org/wiki/Special:FilePath/RachelZegler-byPhilipRomano4crop.jpg?width=640',
	'ayo-edebiri':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Ayo%20Edebiri%20After%20The%20Hunt-43%20(cropped).jpg?width=640',
	'jessie-buckley': 'https://commons.wikimedia.org/wiki/Special:FilePath/Jessie%20Buckley.jpg?width=640',
	'margot-robbie':
		"https://commons.wikimedia.org/wiki/Special:FilePath/SYDNEY%2C%20AUSTRALIA%20-%20JANUARY%2023%20Margot%20Robbie%20arrives%20at%20the%20Australian%20Premiere%20of%20'I%2C%20Tonya'%20on%20January%2023%2C%202018%20in%20Sydney%2C%20Australia%20(25980753838)%20(cropped).jpg?width=640",
	'julianne-moore':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Julianne%20Moore%2066%C3%A8me%20Festival%20de%20Venise%20(Mostra)%20color%20crop.JPG?width=640',
	'sandra-huller':
		'https://commons.wikimedia.org/wiki/Special:FilePath/MKr23529%20Sandra%20H%C3%BCller%20(Sisi%20%26%20Ich%2C%20Berlinale%202023).jpg?width=640',
	'pamela-anderson':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Pamela%20Anderson%202024%20Headshot%20by%20Norman%20Wong.jpg?width=640',
	'renate-reinsve': 'https://commons.wikimedia.org/wiki/Special:FilePath/Renate%20Reinsve-9937.jpg?width=640',
	'elle-fanning':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Elle%20Fanning%20at%20the%202025%20Cannes%20Film%20Festival%20(cropped).jpg?width=640',
	'sean-baker':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Sean%20Baker%20at%20the%202024%20Toronto%20International%20Film%20Festival%202%20(cropped).jpg?width=640',
	'denis-villeneuve':
		'https://commons.wikimedia.org/wiki/Special:FilePath/DVilleneuveRFH121024%20(12%20of%2023)%20(54061976489)%20(cropped).jpg?width=640',
	'coralie-fargeat':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Coralie%20Fargeat%20at%20the%202024%20Toronto%20International%20Film%20Festival.jpg?width=640',
	'brady-corbet': 'https://commons.wikimedia.org/wiki/Special:FilePath/BradyCorbert04.jpg?width=640',
	'ryan-coogler': 'https://commons.wikimedia.org/wiki/Special:FilePath/Ryan%20Coogler%20-%20Sinners.jpg?width=640',
	'ricardo-darin':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Alejandra%20Dar%C3%ADn%20y%20Ricardo%20Dar%C3%ADn%20(cropped).jpg?width=640',
	'peter-lanzani':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Presentaci%C3%B3n%20del%20nuevo%20Plan%20de%20Fomento%20para%20la%20industria%20cinematogr%C3%A1fica%20(cropped).jpg?width=640',
	'leonardo-sbaraglia':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20Sbaraglia%20en%20la%20presentaci%C3%B3n%20de%20la%20segunda%20temporada%20de%20%E2%80%9C99%2C99%25.%20La%20ciencia%20de%20las%20Abuelas%E2%80%9D%20(16670703837)%20(cropped).jpg?width=640',
	'guillermo-francella':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Malaga%20Film%20Festival%202025%20-%20Guillermo%20Francella%2001%20(3x4%20cropped).jpg?width=640',
	'chino-darin':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Chino%20Dar%C3%ADn%20Press%20Conference%20The%20Queen%20of%20Spain%20Berlinale%202017.jpg?width=640',
	'dolores-fonzi': 'https://commons.wikimedia.org/wiki/Special:FilePath/Dolores%20Fonzi%20at%20PAULINA.jpg?width=640',
	'mercedes-moran':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Malaga%20Film%20Festival%202025%20-%20Mercedes%20Mor%C3%A1n%2003%20(cropped).jpg?width=640',
	'soledad-villamil': 'https://commons.wikimedia.org/wiki/Special:FilePath/Soledad-villamil-perfil.jpg?width=640',
	'erica-rivas':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Erica%20Rivas%20in%202017%20(37635309635)%20(cropped).jpg?width=640',
	'alejandra-flechner':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Alejandra%20Flechner%20(cropped).jpg?width=640',
	'lucrecia-martel': 'https://commons.wikimedia.org/wiki/Special:FilePath/Lucrecia%20Martel%20(cropped).jpg?width=640',
	'santiago-mitre':
		'https://commons.wikimedia.org/wiki/Special:FilePath/Santiago%20Mitre%20-%20Mar%20del%20Plata%202022.jpg?width=640',
	'damian-szifron': 'https://commons.wikimedia.org/wiki/Special:FilePath/Dami%C3%A1n%20Szifron.jpg?width=640',
};

/**
 * @param {...(string[] | undefined)} groups
 */
function mergeReferenceUrls(...groups) {
	return Array.from(
		new Set(
			groups
				.flat()
				.filter((value) => typeof value === 'string' && value.trim().length > 0)
				.map((value) => value.trim()),
		),
	);
}

/**
 * @param {{ roles: string[]; stats: { label: string; value: string }[] }} defaults
 * @param {{ slug: string; referenceUrls?: string[] } & Record<string, unknown>} seed
 * @returns {PersonProfileRecord}
 */
function buildBulkProfile(defaults, seed) {
	return {
		...seed,
		profileImage: bulkProfileImageUrls[seed.slug],
		roles: defaults.roles,
		stats: defaults.stats.map((stat) => ({ ...stat })),
		referenceUrls: mergeReferenceUrls(seed.referenceUrls, bulkProfileReferenceUrls[seed.slug]),
	};
}

/**
 * @param {{ roles: string[]; stats: { label: string; value: string }[] }} defaults
 * @param {Array<Record<string, unknown> & { slug: string }>} seeds
 */
function buildBulkProfiles(defaults, seeds) {
	return Object.fromEntries(seeds.map((seed) => [seed.slug, buildBulkProfile(defaults, seed)]));
}

const bulkTrendProfiles = {
	...buildBulkProfiles(globalActorDefaults, [
		{
			slug: 'timothee-chalamet',
			name: 'Timothée Chalamet',
			headline: 'La cara más visible de la nueva camada de estrellas que pueden vender prestigio y blockbuster al mismo tiempo.',
			spotlight:
				'Convirtió sensibilidad indie, musical y sci-fi épica en una misma marca personal, algo rarísimo para una estrella tan joven.',
			biography: [
				'Timothée Chalamet pasó de promesa de festival a protagonista global sin perder una vibra de actor de autor. En pocos años encadenó papeles que lo corrieron del drama íntimo al espectáculo de gran estudio.',
				'Su momento actual mezcla la saga Dune, el vuelo pop de Wonka y una presencia mediática que lo sostiene como referencia inmediata del star system joven.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'A Complete Unknown', year: 2025 }],
			knownFor: ['dune-part-two-2024', 'wonka-2023', 'dune-2021'],
		},
		{
			slug: 'paul-mescal',
			name: 'Paul Mescal',
			headline: 'Actor irlandés que convirtió intensidad contenida y melancolía física en un sello cada vez más grande.',
			spotlight:
				'Se mueve bien entre drama sensible y épica de estudio, con una presencia que nunca parece fabricada.',
			biography: [
				'Paul Mescal irrumpió como una de las grandes revelaciones de su generación gracias a una actuación muy desnuda, sostenida más por tensión interna que por exhibición.',
				'Después de Aftersun dio el salto a proyectos de escala mayor sin perder intimidad, algo que hoy lo vuelve uno de los nombres más seguidos del cine anglo del momento.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Aftersun', year: 2023 }],
			knownFor: ['hamnet-2025', 'gladiator-ii-2024'],
		},
		{
			slug: 'austin-butler',
			name: 'Austin Butler',
			headline: 'Performer de viejo molde hollywoodense que encontró su gran despegue con biopics y cine de estudio.',
			spotlight:
				'Tiene algo de estrella clásica rehecha para la era actual: físico preciso, voz trabajada y una energía muy de leading man.',
			biography: [
				'Austin Butler pasó varios años orbitando televisión y papeles secundarios antes de encontrar en Elvis el rol que reorganizó por completo su carrera.',
				'Desde entonces quedó ubicado en una zona de alto perfil industrial, con proyectos grandes y un seguimiento de prensa que lo empuja como figura ascendente del mainstream.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Elvis', year: 2023 }],
			knownFor: ['elvis-2022'],
		},
		{
			slug: 'glen-powell',
			name: 'Glen Powell',
			headline: 'Uno de los actores más calientes del cine comercial reciente, con timing de comedia y físico de héroe clásico.',
			spotlight:
				'Su gran activo es que puede jugar de galán, canchero o tipo ligeramente pasado de rosca sin perder simpatía.',
			biography: [
				'Glen Powell tardó en despegar, pero cuando encontró el envión lo hizo con una velocidad notable: Top Gun, Hit Man y Twisters lo empujaron a primera línea.',
				'Hoy es un nombre central del Hollywood más industrial, con una mezcla muy buscada de carisma ligero, ironía y tracción de taquilla.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Nominacion a mejor actor de comedia o musical', work: 'Hit Man', year: 2025 },
			],
			knownFor: ['jugada-maestra-2026', 'hit-man-2024', 'twisters-2024'],
		},
		{
			slug: 'pedro-pascal',
			name: 'Pedro Pascal',
			headline: 'Carisma instantáneo y una capacidad rara para parecer cercano incluso cuando está en el centro de una franquicia gigante.',
			spotlight:
				'Pasó de figura de culto a rostro omnipresente del entretenimiento global sin perder una vibra muy humana.',
			biography: [
				'Pedro Pascal construyó una carrera de combustión lenta hasta volverse un imán de pantalla capaz de conectar con públicos muy distintos.',
				'Su presente mezcla ciencia ficción, animación y superproducción, con una popularidad que lo volvió uno de los intérpretes más visibles del momento.',
			],
			awards: [{ label: 'Emmy', category: 'Nominacion a mejor actor en drama', work: 'The Last of Us', year: 2024 }],
			knownFor: ['the-fantastic-four-first-steps-2025', 'gladiator-ii-2024', 'the-wild-robot-2024'],
		},
		{
			slug: 'cillian-murphy',
			name: 'Cillian Murphy',
			headline: 'Actor de precisión extrema que convirtió reserva, nervio y amenaza silenciosa en un lenguaje propio.',
			spotlight:
				'Puede sostener cine de autor, thriller y megaproducción sin cambiar la intensidad seca que lo define.',
			biography: [
				'Cillian Murphy viene de una carrera larga y muy respetada, pero la última etapa lo terminó de instalar como figura de peso absoluto en la conversación global.',
				'Su combinación de magnetismo frío y vulnerabilidad contenida lo volvió ideal para personajes obsesivos, inquietos o moralmente quebrados.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Oppenheimer', year: 2024 }],
			knownFor: ['peaky-blinders-the-immortal-man-2026', 'oppenheimer-2023'],
		},
		{
			slug: 'barry-keoghan',
			name: 'Barry Keoghan',
			headline: 'Rostro impredecible del cine británico e irlandés reciente, siempre listo para llevar una escena a un lugar raro.',
			spotlight:
				'Tiene una energía inquietante y juguetona que lo vuelve perfecto para personajes fuera de eje.',
			biography: [
				'Barry Keoghan se instaló como uno de los intérpretes más singulares de su generación gracias a un registro que mezcla fragilidad, extrañeza y peligro.',
				'Entre premios, franquicias y películas de autor, su nombre quedó asociado a esa clase de actor que nunca entra a una toma para pasar desapercibido.',
			],
			awards: [
				{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'The Banshees of Inisherin', year: 2023 },
			],
			knownFor: ['crime-101-2026', 'peaky-blinders-the-immortal-man-2026', 'saltburn-2023'],
		},
		{
			slug: 'colman-domingo',
			name: 'Colman Domingo',
			headline: 'Presencia elegante, grave y magnética que se volvió una garantía de peso dramático en cualquier proyecto.',
			spotlight:
				'Su crecimiento reciente mezcla prestigio crítico, premios grandes y una autoridad escénica que no se discute.',
			biography: [
				'Colman Domingo venía construyendo carrera desde hace años en teatro, cine y televisión, pero el último tramo lo puso definitivamente en primer plano.',
				'Sing Sing y su cadena de nominaciones lo consolidaron como un actor de enorme densidad emocional, muy respetado dentro y fuera de la industria.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Sing Sing', year: 2025 }],
			knownFor: ['sing-sing-2024'],
		},
		{
			slug: 'sebastian-stan',
			name: 'Sebastian Stan',
			headline: 'Actor que saltó de la franquicia al prestigio con una soltura que pocos logran cuando ya son reconocibles.',
			spotlight:
				'Puede entrar en una producción gigantesca o en un retrato incómodo y funcionar con la misma concentración.',
			biography: [
				'Sebastian Stan supo aprovechar la visibilidad que le dio Marvel para correrse hacia personajes más torcidos y ambiciosos.',
				'El período reciente le sumó premios, transformación física y un prestigio nuevo que amplió mucho su lugar dentro del cine industrial.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'A Different Man', year: 2025 },
			],
			knownFor: ['thunderbolts-2025', 'the-apprentice-2024', 'captain-america-the-winter-soldier-2014'],
		},
		{
			slug: 'andrew-garfield',
			name: 'Andrew Garfield',
			headline: 'Intérprete muy físico y muy emotivo, capaz de ir del heroísmo clásico al desborde vulnerable.',
			spotlight:
				'Su mejor versión aparece cuando mezcla intensidad emocional con un cuerpo siempre al borde del quiebre.',
			biography: [
				'Andrew Garfield cruzó cine de estudio, teatro y drama adulto sin quedar preso de una sola imagen, algo que le dio una elasticidad poco común.',
				'Cada vez que vuelve al centro de la conversación aparece la misma idea: es un actor de enorme entrega, con facilidad para lo épico y para lo íntimo.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Hacksaw Ridge', year: 2017 }],
			knownFor: ['the-amazing-spider-man-2-2014', 'the-amazing-spider-man-2012', 'spider-man-2002'],
		},
		{
			slug: 'robert-pattinson',
			name: 'Robert Pattinson',
			headline: 'Exestrella teen reciclada como actor de culto y luego reinyectada al blockbuster sin perder rareza.',
			spotlight:
				'Su carrera reciente es una prueba de que se puede entrar al mainstream grande sin abandonar el gusto por lo incómodo.',
			biography: [
				'Robert Pattinson convirtió el desgaste de la fama temprana en una filmografía llena de riesgos, directores exigentes y personajes descentrados.',
				'La convivencia entre Mickey 17, The Batman y Tenet resume bien su gracia actual: estrella reconocible, pero nunca completamente domesticada.',
			],
			awards: [{ label: 'Gotham Awards', category: 'Mejor actor', work: 'Good Time', year: 2017 }],
			knownFor: ['mickey-17-2025', 'the-batman-2022', 'tenet-2020'],
		},
		{
			slug: 'josh-o-connor',
			name: "Josh O'Connor",
			headline: 'Uno de los intérpretes británicos más finos del presente, con una mezcla de vulnerabilidad, ironía y nervio.',
			spotlight:
				'No necesita sobreactuar para imponerse: suele ganar la escena desde la incomodidad o el detalle mínimo.',
			biography: [
				'Josh O Connor fue creciendo en televisión y cine hasta quedar asociado a un tipo de actuación muy observadora, poco ostentosa y muy precisa.',
				'Con Challengers y su cadena de proyectos de prestigio quedó instalado como uno de los nombres más buscados del circuito autoral anglo.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en drama televisivo', work: 'The Crown', year: 2021 }],
			knownFor: ['challengers-2024'],
		},
		{
			slug: 'aaron-taylor-johnson',
			name: 'Aaron Taylor-Johnson',
			headline: 'Actor de perfil físico y energía volcánica que puede llevar acción, thriller y drama sin perder filo.',
			spotlight:
				'Su imagen combina estrella de género y presencia más sombría, ideal para personajes cargados de impulso.',
			biography: [
				'Aaron Taylor Johnson se consolidó con un recorrido muy variado, saltando entre cine de superhéroes, dramas más duros y producciones de alto perfil.',
				'La seguidilla reciente de títulos grandes lo sostiene como una cara fuerte del cine comercial con un costado más áspero que el promedio.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: 'Nocturnal Animals', year: 2017 },
			],
			knownFor: ['28-years-later-2025', 'kraven-the-hunter-2024', 'the-fall-guy-2024'],
		},
		{
			slug: 'adrien-brody',
			name: 'Adrien Brody',
			headline: 'Actor de fisonomía única y sensibilidad muy fina, siempre cerca de personajes heridos o intensamente obsesivos.',
			spotlight:
				'Sigue siendo uno de esos intérpretes que pueden darle espesor trágico a una película apenas aparece en cuadro.',
			biography: [
				'Adrien Brody entró a la historia del Oscar muy joven y desde entonces armó una carrera irregular pero siempre interesante, cruzando grandes autores y cine más lateral.',
				'El regreso fuerte con The Brutalist reactivó su nombre dentro de la temporada de premios y lo devolvió al centro del radar cinéfilo.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'The Pianist', year: 2003 }],
			knownFor: ['the-brutalist-2024'],
		},
		{
			slug: 'kieran-culkin',
			name: 'Kieran Culkin',
			headline: 'Dueño de una ironía filosa y una cadencia verbal muy particular que hoy lo vuelven figura de alto prestigio.',
			spotlight:
				'Su gran virtud es parecer liviano mientras deja ver capas de agotamiento, crueldad o tristeza.',
			biography: [
				'Kieran Culkin llevaba años siendo un secreto a voces para mucha gente de la industria, hasta que la exposición masiva terminó de acomodarlo entre los intérpretes más celebrados del momento.',
				'A Real Pain lo encontró en un punto de madurez ideal: mordaz, frágil y capaz de sostener el humor y el dolor en el mismo plano.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'A Real Pain', year: 2025 }],
			knownFor: ['a-real-pain-2024'],
		},
		{
			slug: 'ralph-fiennes',
			name: 'Ralph Fiennes',
			headline: 'Actor clásico en el mejor sentido: técnica impecable, voz memorable y una presencia que ordena cualquier escena.',
			spotlight:
				'Puede ser monstruoso, elegante o devastador con una naturalidad que muy pocos sostienen durante décadas.',
			biography: [
				'Ralph Fiennes pertenece a esa clase de intérpretes que combinan oficio teatral, refinamiento y peligro latente sin que nunca se vea el esfuerzo.',
				'Con Conclave y sus nuevos trabajos de alto perfil volvió a quedar muy arriba en la conversación industrial y crítica.',
			],
			awards: [
				{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: "Schindler's List", year: 1994 },
			],
			knownFor: ['28-years-later-the-bone-temple-2026', '28-years-later-2025', 'conclave-2024'],
		},
		{
			slug: 'daniel-craig',
			name: 'Daniel Craig',
			headline: 'Figura central del cine popular del siglo XXI, con un registro seco y físico que se volvió inmediatamente reconocible.',
			spotlight:
				'Más allá de Bond, supo empujar una carrera donde el star power convive con elecciones algo más desacomodadas.',
			biography: [
				'Daniel Craig tomó uno de los personajes más icónicos del cine y lo llevó hacia una versión más cansada, dura y corporal.',
				'Incluso después de cerrar su etapa en 007 siguió siendo un nombre fuerte para thrillers, sagas y proyectos que necesitan una presencia muy definida.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Nominacion a mejor actor de comedia o musical', work: 'Knives Out', year: 2020 },
			],
			knownFor: ['glass-onion-a-knives-out-mystery-2022', 'no-time-to-die-2021', 'casino-royale-2006'],
		},
		{
			slug: 'tom-cruise',
			name: 'Tom Cruise',
			headline: 'Probablemente el último gran cuerpo de estrella total de Hollywood, todavía obsesionado con hacer del cine un evento.',
			spotlight:
				'Su carrera reciente funciona como una defensa física de la sala: stunts reales, escala grande y sentido del espectáculo.',
			biography: [
				'Tom Cruise domina hace décadas un territorio muy específico: el del protagonista capaz de convertir una película industrial en cita obligada.',
				'La saga Mission Impossible y el regreso de Top Gun reforzaron esa imagen de figura totémica del blockbuster, siempre al borde del exceso calculado.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en drama', work: 'Born on the Fourth of July', year: 1990 }],
			knownFor: [
				'mission-impossible-the-final-reckoning-2025',
				'mission-impossible-dead-reckoning-part-one-2023',
				'top-gun-maverick-2022',
			],
		},
		{
			slug: 'ryan-gosling',
			name: 'Ryan Gosling',
			headline: 'Carisma melancólico, timing de comedia y una pantalla que soporta tanto ironía como romanticismo.',
			spotlight:
				'Su gran gracia es parecer relajado mientras todo alrededor se ordena según su presencia.',
			biography: [
				'Ryan Gosling pasó del drama independiente a una forma de estrellato muy particular, construida sobre magnetismo cool y bastante sentido del humor.',
				'Barbie, The Fall Guy y los proyectos de ciencia ficción que vienen lo mantienen en un punto fuerte entre prestigio pop y poder de convocatoria.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'La La Land', year: 2017 }],
			knownFor: ['project-hail-mary-2026', 'the-fall-guy-2024', 'barbie-2023'],
		},
		{
			slug: 'michael-b-jordan',
			name: 'Michael B. Jordan',
			headline: 'Actor y productor que encontró su mejor zona en personajes intensos, físicos y muy cargados de orgullo.',
			spotlight:
				'Funciona igual de bien como héroe, rival o protagonista herido, siempre con una presencia muy musculosa pero emocional.',
			biography: [
				'Michael B Jordan creció frente a cámara y terminó convirtiéndose en una figura muy sólida del cine comercial estadounidense contemporáneo.',
				'La serie Creed, Black Panther y su etapa reciente como realizador lo afirmaron como un nombre importante dentro del cine de gran escala.',
			],
			awards: [{ label: 'NAACP Image Awards', category: 'Mejor actor', work: 'Creed III', year: 2024 }],
			knownFor: ['sinners-2025', 'creed-iii-2023', 'black-panther-2018', 'creed-2015'],
		},
		{
			slug: 'adam-driver',
			name: 'Adam Driver',
			headline: 'Uno de los actores estadounidenses más intensos de su generación, siempre listo para llevar un personaje al borde del colapso.',
			spotlight:
				'Tiene una presencia física rarísima que combina torpeza, peligro y sensibilidad en la misma toma.',
			biography: [
				'Adam Driver salió del circuito televisivo con un perfil muy singular y en pocos años ya estaba trabajando con los grandes directores del momento.',
				'Su filmografía alterna franquicia, cine de autor y experimentos más extremos, una combinación que lo sostiene como actor muy buscado.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Marriage Story', year: 2020 }],
			knownFor: ['megalopolis-2024', 'star-wars-episode-viii-the-last-jedi-2017'],
		},
		{
			slug: 'jacob-elordi',
			name: 'Jacob Elordi',
			headline: 'Estrella joven de enorme presencia física que empezó a correrse con inteligencia hacia roles más inquietantes.',
			spotlight:
				'Cuando elige bien, usa su imagen de galán para hacerla chocar con personajes mucho más oscuros o ambiguos.',
			biography: [
				'Jacob Elordi se hizo masivo muy rápido, pero su mejor movimiento fue evitar quedar encerrado en una sola postal de ídolo juvenil.',
				'El presente lo encuentra enlazado a saltos fuertes entre cine de prestigio, adaptaciones literarias y títulos muy comentados del calendario industrial.',
			],
			awards: [{ label: 'BAFTA', category: 'Nominacion a Rising Star', work: 'Saltburn', year: 2024 }],
			knownFor: ['cumbres-borrascosas-2026', 'frankenstein-2025', 'saltburn-2023'],
		},
		{
			slug: 'oscar-isaac',
			name: 'Oscar Isaac',
			headline: 'Actor versátil y muy carismático, capaz de darle espesor incluso a materiales que dependen mucho del star power.',
			spotlight:
				'Se mueve con soltura entre franquicias, ciencia ficción, thriller y drama psicológico, siempre con un sello muy reconocible.',
			biography: [
				'Oscar Isaac lleva más de una década funcionando como uno de los intérpretes más confiables para proyectos grandes y para directores con ambiciones más autorales.',
				'Su perfil sigue siendo valioso porque combina magnetismo clásico, inteligencia y una capacidad real para cambiar el tono de una película.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en miniserie o telefilm', work: 'Show Me a Hero', year: 2016 }],
			knownFor: ['frankenstein-2025'],
		},
		{
			slug: 'dev-patel',
			name: 'Dev Patel',
			headline: 'Actor, guionista y director que convirtió sensibilidad y energía física en un combo muy propio.',
			spotlight:
				'Su carrera reciente muestra una clara voluntad de ir hacia materiales más personales, feroces y corporales.',
			biography: [
				'Dev Patel pasó de revelación temprana a artista mucho más completo, con una evolución clara hacia papeles y proyectos de mayor control creativo.',
				'Monkey Man reforzó esa transición hacia un perfil más autoral, aunque sigue conservando la conexión inmediata que siempre tuvo con el público amplio.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'Lion', year: 2017 }],
			knownFor: ['monkey-man-2024', 'slumdog-millionaire-2008'],
		},
		{
			slug: 'wagner-moura',
			name: 'Wagner Moura',
			headline: 'Actor brasileño de enorme presencia que hoy también funciona como referencia latinoamericana de prestigio global.',
			spotlight:
				'Su voz, su intensidad política y su peso dramático le dan a cada papel una temperatura muy particular.',
			biography: [
				'Wagner Moura construyó una carrera potente en Brasil y después amplió su alcance internacional sin perder identidad ni filo.',
				'El tramo más reciente, entre cine político y drama de alto perfil, lo volvió un nombre cada vez más comentado dentro del circuito de festivales y premios.',
			],
			awards: [{ label: 'Cannes', category: 'Mejor actor', work: 'The Secret Agent', year: 2025 }],
			knownFor: ['civil-war-2024', 'el-agente-secreto-2025'],
		},
	]),
	...buildBulkProfiles(globalActressDefaults, [
		{
			slug: 'zendaya',
			name: 'Zendaya',
			headline: 'Pocas figuras jóvenes logran combinar moda, franquicia, prestigio y magnetismo pop con esta naturalidad.',
			spotlight:
				'Sabe moverse entre personaje vulnerable, icono cool y heroína mainstream sin perder control de su imagen.',
			biography: [
				'Zendaya pasó de promesa televisiva a una de las estrellas más influyentes del entretenimiento global, con un dominio muy fino de la pantalla y del aparato mediático.',
				'Challengers, Dune y Spider-Man la ubican en un cruce rarísimo entre cine de estudio, prestigio generacional y potencia cultural.',
			],
			awards: [{ label: 'Emmy', category: 'Mejor actriz en drama', work: 'Euphoria', year: 2022 }],
			knownFor: ['challengers-2024', 'dune-part-two-2024', 'dune-2021', 'spider-man-no-way-home-2021'],
		},
		{
			slug: 'sydney-sweeney',
			name: 'Sydney Sweeney',
			headline: 'Figura omnipresente del momento, capaz de empujar thriller, terror y drama con una mezcla rara de fragilidad y cálculo.',
			spotlight:
				'Su ascenso combina exposición masiva, una agenda industrial muy cargada y una ambición clara para producir sus propios proyectos.',
			biography: [
				'Sydney Sweeney se volvió un nombre inevitable en muy poco tiempo, con una cadena de títulos que la hicieron pasar del hype a la consolidación comercial.',
				'Entre drama íntimo, terror y vehículos star-driven, hoy es una de las actrices jóvenes más visibles del mercado estadounidense.',
			],
			awards: [
				{ label: 'Emmy', category: 'Nominacion a mejor actriz de reparto', work: 'The White Lotus', year: 2022 },
			],
			knownFor: ['echo-valley-2025', 'the-housemaid-2025', 'immaculate-2024', 'madame-web-2024'],
		},
		{
			slug: 'mikey-madison',
			name: 'Mikey Madison',
			headline: 'La irrupción más explosiva del último año en clave de star making clásico pero con nervio muy actual.',
			spotlight:
				'Su fuerza está en la mezcla entre intensidad cruda, vulnerabilidad y una pantalla que se prende enseguida.',
			biography: [
				'Mikey Madison venía creciendo de a poco hasta que Anora la llevó al centro del mapa cinéfilo e industrial de manera fulminante.',
				'Desde entonces quedó instalada como una de las nuevas caras con más empuje de la conversación global sobre actuación.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actriz', work: 'Anora', year: 2025 }],
			knownFor: ['anora-2024'],
		},
		{
			slug: 'demi-moore',
			name: 'Demi Moore',
			headline: 'Estrella histórica que encontró un regreso explosivo y muy comentado sin renunciar a su magnetismo de diva.',
			spotlight:
				'The Substance la devolvió a la discusión grande con una mezcla de autoparodia, cuerpo y fiereza total.',
			biography: [
				'Demi Moore ya era un ícono de Hollywood antes de su reaparición fuerte en la temporada reciente de premios, pero hacía tiempo que no concentraba tanta atención cinéfila.',
				'Su regreso funcionó porque supo usar su propia imagen pública como material dramático y como comentario feroz sobre la industria.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz de comedia o musical', work: 'The Substance', year: 2025 }],
			knownFor: ['the-substance-2024'],
		},
		{
			slug: 'zoe-saldana',
			name: 'Zoe Saldaña',
			headline: 'Actriz que lleva años en el centro del blockbuster global y ahora también quedó muy arriba en la conversación de premios.',
			spotlight:
				'Pocas intérpretes actuales pueden decir que dominan a la vez el cine de franquicia y la temporada alta de galardones.',
			biography: [
				'Zoe Saldaña construyó un lugar singular dentro de Hollywood: es parte de algunas de las sagas más grandes del siglo y al mismo tiempo una actriz con oficio real.',
				'El paso reciente por Emilia Pérez reforzó ese perfil híbrido entre estrella gigantesca y figura cada vez más reconocida por la crítica.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Emilia Pérez', year: 2025 }],
			knownFor: ['avatar-fuego-y-cenizas-2025', 'emilia-perez-2024', 'avatar-the-way-of-water-2022', 'avatar-2009'],
		},
		{
			slug: 'margaret-qualley',
			name: 'Margaret Qualley',
			headline: 'Una de las actrices más seductoras del momento para el cine que quiere extrañeza, glamour y desborde físico.',
			spotlight:
				'Puede ser sofisticada, torpe o feroz sin abandonar una sensación de peligro juguetón.',
			biography: [
				'Margaret Qualley fue dejando atrás la etiqueta de promesa para convertirse en una presencia cada vez más fuerte dentro del cine de autor y del mainstream elegante.',
				'The Substance y sus nuevos proyectos la muestran en un punto alto, muy comentado por su mezcla de sensualidad, humor y riesgo.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Nominacion a mejor actriz de reparto', work: 'The Substance', year: 2025 },
			],
			knownFor: ['jugada-maestra-2026', 'the-substance-2024'],
		},
		{
			slug: 'florence-pugh',
			name: 'Florence Pugh',
			headline: 'Actriz de enorme presencia emocional que sostiene drama, terror y superproducción sin cambiar de intensidad.',
			spotlight:
				'Su registro parece contemporáneo incluso cuando trabaja con moldes muy clásicos de star system.',
			biography: [
				'Florence Pugh creció muy rápido porque encontró una combinación muy buscada: autoridad dramática, carisma y una pantalla extremadamente viva.',
				'El presente la mantiene pegada a proyectos grandes como Thunderbolts, pero sigue conservando credenciales de actriz seria para materiales más densos.',
			],
			awards: [
				{ label: 'BAFTA', category: 'Nominacion a mejor actriz de reparto', work: 'Little Women', year: 2020 },
			],
			knownFor: ['thunderbolts-2025', 'black-widow-2021'],
		},
		{
			slug: 'jenna-ortega',
			name: 'Jenna Ortega',
			headline: 'Figura generacional que se volvió sinónimo de terror pop y de una energía gótica muy vendible.',
			spotlight:
				'Su pantalla mezcla fragilidad seca, humor negro y una fotogenia perfecta para el cine de género.',
			biography: [
				'Jenna Ortega escaló rápido gracias a una mezcla de exposición juvenil, sentido del tono y afinidad total con proyectos de horror y fantasía oscura.',
				'El ruido sostenido alrededor de su nombre la convirtió en una de las caras más reconocibles del entretenimiento joven actual.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Nominacion a mejor actriz de comedia televisiva', work: 'Wednesday', year: 2023 },
			],
			knownFor: ['scream-vi-2023', 'scream-2022'],
		},
		{
			slug: 'anya-taylor-joy',
			name: 'Anya Taylor-Joy',
			headline: 'Actriz con aura instantánea y un rostro perfecto para personajes raros, intensos o directamente mitológicos.',
			spotlight:
				'Su carrera vive en una zona muy productiva entre la franquicia, el thriller elegante y la fantasía extraña.',
			biography: [
				'Anya Taylor Joy se consolidó como una estrella muy particular porque nunca parece del todo domesticable, incluso dentro de proyectos industriales.',
				'Furiosa y sus trabajos recientes la sostienen en un nivel alto de visibilidad sin apagar su costado más inquietante y estilizado.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz en miniserie', work: "The Queen's Gambit", year: 2021 }],
			knownFor: ['super-mario-galaxy-2026', 'the-gorge-2025', 'furiosa-a-mad-max-saga-2024', 'the-super-mario-bros-movie-2023'],
		},
		{
			slug: 'cailee-spaeny',
			name: 'Cailee Spaeny',
			headline: 'Actriz joven con mucho control interno, ideal para personajes que parecen frágiles hasta que toman el centro.',
			spotlight:
				'Su mejor zona está entre el drama serio y el género, con un rostro que nunca queda desbordado por el dispositivo visual.',
			biography: [
				'Cailee Spaeny venía creciendo de forma sostenida y terminó de afirmarse cuando empezó a encadenar películas muy visibles con autores y marcas fuertes.',
				'La combinación entre Civil War y Alien Romulus la deja muy bien posicionada como una de las intérpretes jóvenes con mejor presente.',
			],
			awards: [{ label: 'Volpi Cup', category: 'Mejor actriz', work: 'Priscilla', year: 2023 }],
			knownFor: ['alien-romulus-2024', 'civil-war-2024'],
		},
		{
			slug: 'rebecca-ferguson',
			name: 'Rebecca Ferguson',
			headline: 'Elegancia, misterio y una pantalla muy firme para personajes que combinan poder y opacidad.',
			spotlight:
				'Su presencia funciona perfecto en universos de ciencia ficción, espionaje o épica gris.',
			biography: [
				'Rebecca Ferguson construyó un perfil muy sólido como intérprete capaz de habitar películas grandes sin quedar reducida a mero soporte visual.',
				'En Dune y en su agenda reciente aparece como una de esas actrices que el blockbuster contemporáneo usa para sumar clase y gravedad.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Nominacion a mejor actriz en miniserie', work: 'The White Queen', year: 2014 },
			],
			knownFor: ['mercy-2026', 'peaky-blinders-the-immortal-man-2026', 'dune-part-two-2024', 'dune-2021'],
		},
		{
			slug: 'ana-de-armas',
			name: 'Ana de Armas',
			headline: 'Carisma feroz y una facilidad poco común para entrar al cine de estudio sin perder sensualidad ni filo.',
			spotlight:
				'Se volvió una figura muy codiciada para acción, thriller y drama a partir de una pantalla intensamente física.',
			biography: [
				'Ana de Armas construyó una transición muy eficiente hacia Hollywood y en poco tiempo pasó de promesa llamativa a nombre fuerte del mercado.',
				'Ballerina, Blade Runner 2049 y sus papeles recientes consolidan esa mezcla de estrella glamorosa y actriz de mucha entrega corporal.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'Blonde', year: 2023 }],
			knownFor: ['ballerina-2025', 'no-time-to-die-2021', 'blade-runner-2049-2017'],
		},
		{
			slug: 'ariana-grande',
			name: 'Ariana Grande',
			headline: 'Superestrella pop convertida en figura cinematográfica de alto impacto mediático y enorme capacidad de arrastre.',
			spotlight:
				'Su desembarco en Wicked la reposicionó dentro de Hollywood como algo más que una celebridad invitada.',
			biography: [
				'Ariana Grande llegó al cine con un nivel de exposición planetaria, pero la clave de su aterrizaje fue entender cómo usar ese capital dentro de un musical gigantesco.',
				'La recepción de Wicked la dejó instalada en el cruce entre fandom pop, premios y una nueva etapa profesional muy visible.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Nominacion a mejor actriz de reparto', work: 'Wicked', year: 2025 },
			],
			knownFor: ['wicked-for-good-2025', 'wicked-2024'],
		},
		{
			slug: 'cynthia-erivo',
			name: 'Cynthia Erivo',
			headline: 'Actriz y cantante de enorme potencia vocal y dramática, siempre lista para papeles de alta exigencia emocional.',
			spotlight:
				'Su presencia tiene algo de acontecimiento: cuando aparece, la película sube de intensidad automáticamente.',
			biography: [
				'Cynthia Erivo se mueve con autoridad entre teatro, música y cine, y esa formación se nota en la precisión con la que sostiene personajes grandes.',
				'Wicked reforzó su visibilidad global y consolidó una imagen de intérprete total, muy valiosa para proyectos de exposición máxima.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'Harriet', year: 2020 }],
			knownFor: ['wicked-for-good-2025', 'wicked-2024'],
		},
		{
			slug: 'fernanda-torres',
			name: 'Fernanda Torres',
			headline: 'Actriz brasileña de enorme refinamiento que volvió al centro del mapa global con un trabajo maduro y filoso.',
			spotlight:
				'Su fuerza actual nace de una mezcla muy atractiva entre trayectoria, inteligencia y un regreso celebrado en todo el circuito de premios.',
			biography: [
				'Fernanda Torres ya tenía una carrera enorme en Brasil, pero el último tramo la proyectó con muchísima más fuerza hacia la conversación internacional.',
				'Aun estoy aqui la reposicionó como una intérprete sofisticada y profundamente contemporánea en su forma de habitar el dolor y la memoria.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz en drama', work: 'Aun estoy aqui', year: 2025 }],
			knownFor: ['aun-estoy-aqui-2024'],
		},
		{
			slug: 'vanessa-kirby',
			name: 'Vanessa Kirby',
			headline: 'Actriz de nervio elegante, ideal para personajes orgullosos, intensos y emocionalmente volcados al límite.',
			spotlight:
				'Su rostro funciona perfecto tanto para el drama de prestigio como para el universo de gran estudio con barniz serio.',
			biography: [
				'Vanessa Kirby fue construyendo una carrera de mucho prestigio a partir de personajes exigentes y una pantalla notablemente concentrada.',
				'Napoleon y Fantastic Four la sostienen en un punto interesante donde el prestigio previo se cruza con franquicias de enorme escala.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'Pieces of a Woman', year: 2021 }],
			knownFor: ['the-fantastic-four-first-steps-2025', 'napoleon-2023'],
		},
		{
			slug: 'rachel-zegler',
			name: 'Rachel Zegler',
			headline: 'Una de las voces jóvenes más fuertes para el musical y el melodrama pop de esta etapa de Hollywood.',
			spotlight:
				'Su presencia combina energía frontal, registro vocal y una exposición mediática permanente.',
			biography: [
				'Rachel Zegler irrumpió de manera abrupta y desde entonces quedó instalada como figura muy comentada cada vez que aparece un título grande en su agenda.',
				'West Side Story y Snow White muestran bien esa doble condición suya: actriz joven bajo lupa constante y a la vez apuesta fuerte del estudio.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz de comedia o musical', work: 'West Side Story', year: 2022 }],
			knownFor: ['snow-white-2025', 'west-side-story-2021'],
		},
		{
			slug: 'ayo-edebiri',
			name: 'Ayo Edebiri',
			headline: 'Figura cultural total de la nueva generación, con humor, timing y una sensibilidad muy reconocible.',
			spotlight:
				'Cada vez que pasa al cine trae una energía fresca, irónica y bastante impredecible.',
			biography: [
				'Ayo Edebiri explotó en popularidad muy rápido y supo capitalizarlo sin quedar reducida a una sola máscara cómica.',
				'Su entrada a proyectos cinematográficos la muestra como una presencia nueva y muy apetecible para historias que necesitan inteligencia y nervio.',
			],
			awards: [{ label: 'Emmy', category: 'Mejor actriz de reparto en comedia', work: 'The Bear', year: 2024 }],
			knownFor: ['opus-2025'],
		},
		{
			slug: 'jessie-buckley',
			name: 'Jessie Buckley',
			headline: 'Actriz capaz de hacer que la incomodidad, la rabia y la ternura convivan en una misma interpretación.',
			spotlight:
				'Es una de esas intérpretes que elevan de inmediato cualquier película con pura personalidad.',
			biography: [
				'Jessie Buckley fue armando una carrera cada vez más consistente entre cine de autor, drama pesado y materiales de época con mucha exigencia tonal.',
				'Su actualidad mantiene ese perfil de actriz muy respetada, siempre convocada para proyectos que buscan una intensidad menos obvia.',
			],
			awards: [
				{ label: 'Oscar', category: 'Nominacion a mejor actriz de reparto', work: 'The Lost Daughter', year: 2022 },
			],
			knownFor: ['the-bride-2026', 'hamnet-2025'],
		},
		{
			slug: 'margot-robbie',
			name: 'Margot Robbie',
			headline: 'Estrella total con inteligencia industrial y un control muy fino sobre cómo producir y protagonizar cine popular.',
			spotlight:
				'Su carrera es una mezcla muy eficaz de glamour clásico, riesgo selectivo y olfato para detectar proyectos enormes.',
			biography: [
				'Margot Robbie se consolidó como una de las figuras más potentes del Hollywood reciente porque supo jugar a la vez como actriz, productora y marca.',
				'Barbie y la cadena de títulos a su alrededor confirmaron que su lugar no depende de una sola franquicia, sino de una lectura muy clara del negocio y de la pantalla.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor pelicula como productora', work: 'Barbie', year: 2024 }],
			knownFor: ['cumbres-borrascosas-2026', 'barbie-2023', 'once-upon-a-time-in-hollywood-2019'],
		},
		{
			slug: 'julianne-moore',
			name: 'Julianne Moore',
			headline: 'Una de las grandes actrices estadounidenses de las últimas décadas, todavía capaz de sumar peso y extrañeza con muy poco.',
			spotlight:
				'Su pantalla mantiene intacta esa mezcla de vulnerabilidad cerebral y autoridad que la volvió imprescindible.',
			biography: [
				'Julianne Moore lleva años siendo sinónimo de prestigio interpretativo, pero su valor no se volvió museístico: sigue encontrando cómo insertarse en relatos contemporáneos.',
				'Echo Valley la devuelve a un cine de exposición reciente con la misma capacidad de siempre para sostener personajes densos y ambiguos.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actriz', work: 'Still Alice', year: 2015 }],
			knownFor: ['echo-valley-2025', 'the-lost-world-jurassic-park-1997'],
		},
		{
			slug: 'sandra-huller',
			name: 'Sandra Hüller',
			headline: 'Actriz alemana de enorme inteligencia para la ambigüedad, hoy plenamente instalada en el radar global.',
			spotlight:
				'Su gran fuerza está en no cerrar nunca del todo un personaje: siempre deja una zona opaca y fascinante.',
			biography: [
				'Sandra Huller viene de una carrera prestigiosa en Europa, pero el salto más visible del último tiempo la convirtió en nombre habitual para cualquier conversación cinéfila seria.',
				'La combinación entre premios, nominaciones y nuevos proyectos grandes consolidó una pantalla muy singular dentro del panorama actual.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'Anatomy of a Fall', year: 2024 }],
			knownFor: ['project-hail-mary-2026', 'the-zone-of-interest-2023'],
		},
		{
			slug: 'pamela-anderson',
			name: 'Pamela Anderson',
			headline: 'Icono pop histórico que encontró una segunda vida crítica mucho más seria y menos irónica de lo que muchos esperaban.',
			spotlight:
				'Su regreso reciente reordenó la percepción sobre su figura y la devolvió al centro del relato industrial.',
			biography: [
				'Pamela Anderson cargó durante años con una imagen pública muy rígida, pero el período más reciente le permitió correrse hacia un lugar más complejo y respetado.',
				'La nueva atención crítica sobre su trabajo la convirtió en una de las narrativas de comeback más comentadas del momento.',
			],
			awards: [
				{ label: 'Golden Globe', category: 'Nominacion a mejor actriz en drama', work: 'The Last Showgirl', year: 2025 },
			],
			knownFor: ['y-donde-esta-el-policia-2025'],
		},
		{
			slug: 'renate-reinsve',
			name: 'Renate Reinsve',
			headline: 'Actriz noruega con una pantalla intensísima que la volvió referencia inmediata del cine europeo contemporáneo.',
			spotlight:
				'Transmite deseo, desconcierto y desborde emocional con una precisión muy poco frecuente.',
			biography: [
				'Renate Reinsve quedó marcada en el radar internacional por una irrupción muy fuerte dentro del circuito festivalero y desde entonces no dejó de crecer.',
				'Su presencia en nuevos proyectos grandes muestra que ya no es solo figura de culto, sino una actriz seguida de cerca por toda la industria.',
			],
			awards: [{ label: 'Cannes', category: 'Mejor actriz', work: 'The Worst Person in the World', year: 2021 }],
			knownFor: ['valor-sentimental-2025'],
		},
		{
			slug: 'elle-fanning',
			name: 'Elle Fanning',
			headline: 'Actriz que pasó de niña prodigio a intérprete muy refinada sin perder ligereza ni fotogenia.',
			spotlight:
				'Puede llevar cine de época, drama sensible o relato excéntrico con una naturalidad casi engañosa.',
			biography: [
				'Elle Fanning viene madurando su carrera desde hace años y hoy ocupa una zona muy sólida entre el prestigio crítico y la visibilidad industrial.',
				'Los proyectos recientes la mantienen cerca de autores fuertes, pero siempre con suficiente perfil propio como para destacar por encima del dispositivo.',
			],
			awards: [{ label: 'Emmy', category: 'Nominacion a mejor actriz de comedia', work: 'The Great', year: 2022 }],
			knownFor: ['valor-sentimental-2025'],
		},
	]),
	...buildBulkProfiles(globalDirectorDefaults, [
		{
			slug: 'sean-baker',
			name: 'Sean Baker',
			headline: 'Director que volvió explosivo el cruce entre realismo callejero, humor incómodo y cine indie de alto voltaje.',
			spotlight:
				'Su mirada sobre la periferia urbana y los cuerpos al margen logró pasar del culto a la conversación más central de la industria.',
			biography: [
				'Sean Baker construyó una filmografía coherente, muy pegada a la calle y a personajes que el cine industrial suele mirar de lejos o con paternalismo.',
				'El fenómeno Anora lo empujó de lleno al centro del sistema de premios sin borrar nada del filo y la vitalidad que ya definían su obra.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Anora', year: 2025 }],
			knownFor: ['anora-2024'],
		},
		{
			slug: 'denis-villeneuve',
			name: 'Denis Villeneuve',
			headline: 'Autor de gran escala que hizo del blockbuster serio y sensorial un territorio otra vez prestigioso.',
			spotlight:
				'Pocas filmografías actuales unen con tanta naturalidad contemplación, músculo visual y capacidad industrial.',
			biography: [
				'Denis Villeneuve pasó del drama áspero y las tensiones morales a la ciencia ficción de estudio sin perder densidad ni control atmosférico.',
				'Dune terminó de ubicarlo como uno de los directores más decisivos del cine mainstream contemporáneo, en un punto de equilibrio muy raro entre autor e ingeniería de espectáculo.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor director', work: 'Arrival', year: 2017 }],
			knownFor: ['dune-part-two-2024', 'dune-2021', 'blade-runner-2049-2017'],
		},
		{
			slug: 'coralie-fargeat',
			name: 'Coralie Fargeat',
			headline: 'Directora que convirtió rabia corporal, sátira feroz y terror pop en una firma imposible de ignorar.',
			spotlight:
				'Su cine trabaja el exceso como arma política y como espectáculo, siempre con una energía muy física.',
			biography: [
				'Coralie Fargeat ya tenía una voz clara en el cine de género, pero The Substance multiplicó su visibilidad de forma radical.',
				'Su presente es el de una autora plenamente instalada en la conversación internacional, capaz de unir festival, culto y debate industrial en una sola película.',
			],
			awards: [{ label: 'Cannes', category: 'Mejor guion', work: 'The Substance', year: 2024 }],
			knownFor: ['the-substance-2024'],
		},
		{
			slug: 'brady-corbet',
			name: 'Brady Corbet',
			headline: 'Director de ambición monumental que filma el prestigio sin miedo a la densidad ni a la duración.',
			spotlight:
				'Su trabajo reciente lo metió de lleno en la liga de autores discutidos por toda la temporada de premios.',
			biography: [
				'Brady Corbet fue afinando una voz autoral severa, muy calculada y poco concesiva, hasta encontrar con The Brutalist una escala completamente mayor.',
				'Ese salto lo dejó muy bien posicionado dentro del mapa internacional, como un director joven ya asociado a proyectos enormes y muy comentados.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor director', work: 'The Brutalist', year: 2025 }],
			knownFor: ['the-brutalist-2024'],
		},
		{
			slug: 'ryan-coogler',
			name: 'Ryan Coogler',
			headline: 'Director capaz de darle identidad, emoción y comentario social a películas de altísima exposición comercial.',
			spotlight:
				'Sabe trabajar con maquinaria industrial pesada sin perder una mirada muy clara sobre comunidad, legado y duelo.',
			biography: [
				'Ryan Coogler apareció con una voz fuerte desde su debut y supo trasladar esa energía a franquicias gigantes sin diluirse dentro del sistema.',
				'Entre Creed, Black Panther y el envión reciente de Sinners, hoy es uno de los nombres más influyentes del cine estadounidense de gran escala.',
			],
			awards: [{ label: 'Cannes', category: 'Premio Un Certain Regard', work: 'Fruitvale Station', year: 2013 }],
			knownFor: ['sinners-2025', 'black-panther-wakanda-forever-2022', 'black-panther-2018', 'creed-2015'],
		},
	]),
	...buildBulkProfiles(argentineActorDefaults, [
		{
			slug: 'ricardo-darin',
			name: 'Ricardo Darín',
			headline: 'El gran rostro del cine argentino contemporáneo, con una autoridad que trasciende géneros, generaciones y modas.',
			spotlight:
				'Sigue siendo la figura que mejor sintetiza prestigio, conexión popular y peso dramático dentro del cine nacional.',
			biography: [
				'Ricardo Darín armó una carrera larguísima y muy querida, pero su verdadero diferencial está en cómo logra parecer cercano incluso cuando el personaje carga el centro moral de la película.',
				'Argentina 1985 reforzó una vez más su lugar como referencia absoluta del cine argentino y como rostro exportable de enorme credibilidad.',
			],
			awards: [{ label: 'Goya', category: 'Mejor actor', work: 'Truman', year: 2016 }],
			knownFor: ['argentina-1985-2022', 'la-odisea-de-los-giles-2019', 'el-secreto-de-sus-ojos-2009', 'nueve-reinas-2000'],
		},
		{
			slug: 'peter-lanzani',
			name: 'Peter Lanzani',
			headline: 'Actor argentino que pasó del reconocimiento masivo a una madurez dramática cada vez más sólida.',
			spotlight:
				'Su mejor momento aparece cuando combina energía joven con personajes cruzados por presión institucional o violencia contenida.',
			biography: [
				'Peter Lanzani fue ensanchando su registro de manera sostenida hasta encontrar un espacio muy firme dentro del cine y la televisión argentinos.',
				'El recorrido entre El clan y Argentina 1985 terminó de consolidarlo como uno de los intérpretes más visibles de su generación.',
			],
			awards: [{ label: 'Platino', category: 'Nominacion a mejor actor', work: 'Argentina, 1985', year: 2023 }],
			knownFor: ['argentina-1985-2022', 'el-clan-2015'],
		},
		{
			slug: 'leonardo-sbaraglia',
			name: 'Leonardo Sbaraglia',
			headline: 'Actor de enorme elasticidad que puede cargar elegancia, descontrol o agotamiento con la misma eficacia.',
			spotlight:
				'Su carrera vive en una zona productiva entre el thriller, el melodrama y el retrato de tipos moralmente turbios.',
			biography: [
				'Leonardo Sbaraglia es uno de los intérpretes argentinos con mejor puente entre cine local e industria española, siempre sostenido por una presencia muy precisa.',
				'Su peso dentro del thriller y del drama adulto lo mantiene como figura de consulta cuando se buscan personajes intensos y ambiguos.',
			],
			awards: [{ label: 'Goya', category: 'Nominacion a mejor actor', work: 'Intacto', year: 2002 }],
			knownFor: ['relatos-salvajes-2014', 'plata-quemada-2000', 'caballos-salvajes-1995'],
		},
		{
			slug: 'guillermo-francella',
			name: 'Guillermo Francella',
			headline: 'Figura popularísima que supo llevar su potencia de comediante a territorios mucho más oscuros y densos.',
			spotlight:
				'Cuando elige papeles ásperos o ambiguos aparece un actor más inquietante de lo que su imagen televisiva sugería.',
			biography: [
				'Guillermo Francella fue durante años un nombre central de la comedia argentina, pero su carrera cinematográfica reciente amplió mucho esa percepción.',
				'El clan, Mi obra maestra y sus proyectos más nuevos sostienen esa doble condición de estrella popular y actor dramático muy rendidor.',
			],
			awards: [{ label: 'Platino', category: 'Mejor actor', work: 'El clan', year: 2016 }],
			knownFor: ['homo-argentum-2025', 'mi-obra-maestra-2018', 'el-clan-2015', 'corazon-de-leon-2013'],
		},
		{
			slug: 'chino-darin',
			name: 'Chino Darín',
			headline: 'Actor argentino de presencia contenida y muy fotogénica, cada vez más instalado en proyectos de gran circulación.',
			spotlight:
				'Su perfil creció apoyado en una mezcla de carisma, sobriedad y buena lectura de materiales industriales.',
			biography: [
				'Chino Darín fue armando un recorrido sostenido entre cine argentino y español, con una imagen pública muy nítida y un trabajo cada vez más afirmado.',
				'No es casual que aparezca seguido en títulos de alcance amplio: transmite modernidad, temple y una melancolía bastante vendible.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actor de reparto', work: 'La odisea de los giles', year: 2020 }],
			knownFor: ['la-odisea-de-los-giles-2019', 'el-angel-2018'],
		},
	]),
	...buildBulkProfiles(argentineActressDefaults, [
		{
			slug: 'dolores-fonzi',
			name: 'Dolores Fonzi',
			headline: 'Actriz argentina de enorme magnetismo, siempre muy fuerte cuando el material pide nervio, inteligencia y una presencia frontal.',
			spotlight:
				'Su carrera cruza cine de autor, drama político y personajes de mucho espesor emocional sin perder naturalidad.',
			biography: [
				'Dolores Fonzi se consolidó hace tiempo como una de las actrices más respetadas del cine argentino, con una pantalla que mezcla sensibilidad y fuerza.',
				'Incluso cuando cambia de registro, suele conservar una intensidad muy propia que la vuelve inmediatamente identificable.',
			],
			awards: [{ label: 'Platino', category: 'Nominacion a mejor actriz', work: 'Paulina', year: 2016 }],
			knownFor: ['belen-2025', 'la-cordillera-2017', 'truman-2015', 'el-aura-2005'],
		},
		{
			slug: 'mercedes-moran',
			name: 'Mercedes Morán',
			headline: 'Una de las presencias más firmes y sofisticadas del cine argentino, con enorme autoridad para sostener personajes complejos.',
			spotlight:
				'Su pantalla transmite inteligencia, ironía y una precisión emocional que no necesita subrayados.',
			biography: [
				'Mercedes Morán viene construyendo desde hace décadas una carrera admirable, siempre ligada a personajes de muchísima densidad y sutileza.',
				'Su valor actual sigue intacto: es de esas actrices que mejoran una película por simple presencia, tono y oficio.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actriz', work: 'Luna de Avellaneda', year: 2005 }],
			knownFor: ['el-angel-2018', 'betibu-2014', 'luna-de-avellaneda-2004', 'la-cienaga-2001'],
		},
		{
			slug: 'soledad-villamil',
			name: 'Soledad Villamil',
			headline: 'Actriz de sensibilidad clásica y una pantalla que sabe cargar memoria, melancolía y decisión al mismo tiempo.',
			spotlight:
				'Sus mejores personajes tienen una humanidad inmediata, sin artificio y con mucho espesor afectivo.',
			biography: [
				'Soledad Villamil ocupa un lugar muy querido dentro del cine argentino porque transmite cercanía sin perder densidad dramática.',
				'El secreto de sus ojos terminó de fijar esa imagen de actriz confiable, elegante y profundamente emotiva.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actriz', work: 'El secreto de sus ojos', year: 2010 }],
			knownFor: ['el-secreto-de-sus-ojos-2009', 'un-oso-rojo-2002'],
		},
		{
			slug: 'erica-rivas',
			name: 'Érica Rivas',
			headline: 'Actriz de enorme versatilidad y una energía que puede pasar del humor seco al desgarro sin transición visible.',
			spotlight:
				'Siempre parece encontrar una temperatura propia para el personaje, incluso dentro de relatos muy corales.',
			biography: [
				'Érica Rivas construyó una carrera muy respetada gracias a su capacidad para hacer convivir incomodidad, inteligencia y dolor en una misma interpretación.',
				'Relatos salvajes reforzó su llegada masiva, pero su prestigio ya venía sostenido por años de trabajos muy sólidos en cine, teatro y televisión.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actriz de reparto', work: 'Relatos salvajes', year: 2015 }],
			knownFor: ['la-cordillera-2017', 'relatos-salvajes-2014'],
		},
		{
			slug: 'alejandra-flechner',
			name: 'Alejandra Flechner',
			headline: 'Actriz de gran solvencia para personajes filosos, observadores y levemente corrosivos.',
			spotlight:
				'Suele aparecer como ese tipo de presencia secundaria que reorganiza la escena con voz, tempo y carácter.',
			biography: [
				'Alejandra Flechner viene construyendo una carrera muy consistente dentro del cine y la televisión argentina, siempre desde un lugar de enorme oficio.',
				'Su valor actual está en esa capacidad para darle espesor y personalidad incluso a intervenciones breves dentro de películas muy comentadas.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actriz de reparto', work: 'Argentina, 1985', year: 2023 }],
			knownFor: ['argentina-1985-2022'],
		},
	]),
	...buildBulkProfiles(argentineDirectorDefaults, [
		{
			slug: 'lucrecia-martel',
			name: 'Lucrecia Martel',
			headline: 'Autora decisiva del cine argentino moderno, con una puesta en escena que cambió la manera de filmar clase, deseo y sonido en la región.',
			spotlight:
				'Su cine parece íntimo y al mismo tiempo feroz: trabaja la asfixia social desde detalles mínimos y una precisión brutal.',
			biography: [
				'Lucrecia Martel construyó una obra pequeña en cantidad pero gigantesca en influencia, central para entender el nuevo cine argentino y buena parte del cine latinoamericano reciente.',
				'Cada regreso suyo activa inmediatamente la conversación crítica porque su mirada sigue siendo única, rigurosa y profundamente incómoda.',
			],
			awards: [{ label: 'Berlinale', category: 'Premio Alfred Bauer', work: 'La mujer sin cabeza', year: 2008 }],
			knownFor: ['zama-2017', 'la-cienaga-2001'],
		},
		{
			slug: 'santiago-mitre',
			name: 'Santiago Mitre',
			headline: 'Director argentino que volvió muy visible el cruce entre cine político, thriller institucional y drama de alta circulación.',
			spotlight:
				'Sus películas suelen trabajar poder, justicia y desgaste moral con un pulso muy accesible para públicos amplios.',
			biography: [
				'Santiago Mitre fue afinando una filmografía donde la política no aparece como fondo ilustrativo sino como motor real del conflicto.',
				'Argentina 1985 lo dejó en un lugar de enorme visibilidad internacional y confirmó su capacidad para llevar temas duros hacia el centro de la conversación pública.',
			],
			awards: [{ label: 'Goya', category: 'Mejor pelicula iberoamericana', work: 'Argentina, 1985', year: 2023 }],
			knownFor: ['argentina-1985-2022', 'la-cordillera-2017'],
		},
		{
			slug: 'damian-szifron',
			name: 'Damián Szifron',
			headline: 'Director de enorme pulso narrativo que sabe empujar thriller, comedia negra y catarsis popular como pocos en la región.',
			spotlight:
				'Su mejor cine mezcla precisión industrial, humor filoso y una lectura muy clara del malestar social.',
			biography: [
				'Damián Szifron construyó una voz muy reconocible gracias a un sentido del ritmo feroz y a una mirada aguda sobre la violencia cotidiana.',
				'Relatos salvajes lo instaló definitivamente en la escena internacional y todavía sigue siendo la mejor síntesis de su potencia autoral y popular.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor pelicula internacional', work: 'Relatos salvajes', year: 2015 }],
			knownFor: ['relatos-salvajes-2014', 'tiempo-de-valientes-2005'],
		},
	]),
};

export const personProfiles: Record<string, PersonProfileRecord> = {
	'brad-pitt': {
		slug: 'brad-pitt',
		name: 'Brad Pitt',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Brad%20Pitt%202019%20by%20Glenn%20Francis.jpg?width=640',
		headline:
			'Actor y productor que supo combinar carisma de estrella con proyectos de autor y un olfato muy fino para producir cine premiado.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Shawnee, Oklahoma, Estados Unidos',
		spotlight:
			'Arrancó como sex symbol noventoso, pero terminó armando una carrera mucho más amplia: thriller, comedia negra, cine bélico, prestige drama y producción pesada desde Plan B.',
		biography: [
			'William Bradley Pitt nació el 18 de diciembre de 1963 en Shawnee, Oklahoma, y creció en Springfield, Missouri. Después de estudiar periodismo en la Universidad de Missouri, dejó la carrera a muy poco de recibirse y se fue a Los Ángeles para probar suerte como actor.',
			'Su irrupción fuerte llegó a comienzos de los 90 con Thelma & Louise, y desde ahí se volvió una cara central del cine comercial. En paralelo fue armando una filmografía menos obvia, con títulos como Se7en, Fight Club, The Assassination of Jesse James by the Coward Robert Ford, Inglourious Basterds y Once Upon a Time in Hollywood.',
			'Como productor también construyó peso propio. A través de Plan B Entertainment impulsó películas como The Departed y 12 Years a Slave, dos títulos que terminaron ganando el Oscar a mejor película y consolidaron su perfil detrás de cámara.',
		],
		stats: [
			{ label: 'Oscar como actor', value: '2020' },
			{ label: 'Oscar como productor', value: '2014' },
			{ label: 'Pulso', value: 'Taquilla + autor' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Once Upon a Time in Hollywood', year: 2020 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: '12 Years a Slave', year: 2014 },
			{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: '12 Monkeys', year: 1996 },
			{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: 'Once Upon a Time in Hollywood', year: 2020 },
		],
		knownFor: [
			'fight-club-1999',
			'se7en-1995',
			'inglourious-basterds-2009',
			'once-upon-a-time-in-hollywood-2019',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Brad-Pitt',
			'https://www.oscars.org/oscars/ceremonies/2014',
			'https://www.oscars.org/oscars/ceremonies/2020',
			'https://www.goldenglobes.com/person/brad-pitt',
		],
	},
	'al-pacino': {
		slug: 'al-pacino',
		name: 'Al Pacino',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/ALPACINO%200234e%20(30401875260)%20(cropped).jpg?width=640',
		headline:
			'Uno de los rostros centrales del Nuevo Hollywood, capaz de pasar del gangster épico al policial neurótico sin perder intensidad.',
		roles: ['Actor'],
		birthPlace: 'East Harlem, Nueva York, Estados Unidos',
		spotlight:
			'Su modo de actuar mezcla vulnerabilidad, furia y una presencia eléctrica que lo volvió inconfundible durante más de cinco décadas.',
		biography: [
			'Alfredo James Pacino nació el 25 de abril de 1940 en Nueva York y se formó en la escena teatral antes de llegar al cine. La disciplina del Actors Studio y el peso de la escuela neoyorquina marcaron para siempre su forma de construir personajes.',
			'El salto masivo llegó con The Godfather, donde su Michael Corleone pasó de heredero reacio a figura trágica del crimen organizado. Después consolidó una carrera de enorme prestigio con títulos como Serpico, Dog Day Afternoon, Scarface, Heat y The Insider.',
			'Pacino se volvió un símbolo del actor total: puede ser explosivo, mínimo o teatral según el material, pero siempre deja una temperatura muy particular en pantalla. Incluso cuando el proyecto es irregular, su presencia suele ordenar la escena.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Huella', value: 'Nuevo Hollywood' },
			{ label: 'Pulso', value: 'Intensidad pura' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Scent of a Woman', year: 1993 },
		],
		knownFor: ['the-godfather-1972', 'the-godfather-part-ii-1974'],
		referenceUrls: [
			'https://www.britannica.com/biography/Al-Pacino',
			'https://www.oscars.org/oscars/ceremonies/1975',
			'https://www.oscars.org/oscars/ceremonies/1993',
		],
	},
	'leonardo-dicaprio': {
		slug: 'leonardo-dicaprio',
		name: 'Leonardo DiCaprio',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20DiCaprio%20-%20BFI%20Southbank%203%20(crop).jpg?width=640',
		headline:
			'De ídolo global noventoso a actor fetiche del cine de prestigio, siempre eligiendo proyectos grandes sin quedar preso de la comodidad.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Los Ángeles, California, Estados Unidos',
		spotlight:
			'Encontró un equilibrio rarísimo entre estrella de estudio, cuerpo de blockbuster y filmografía obsesionada con directores pesados.',
		biography: [
			'Leonardo DiCaprio nació el 11 de noviembre de 1974 en Los Ángeles y empezó a trabajar desde chico en televisión y publicidades. Muy rápido mostró algo más que fotogenia: una intensidad juvenil que lo distinguía incluso dentro del Hollywood industrial.',
			'Con Titanic se convirtió en un fenómeno global, pero en vez de repetir el molde buscó una carrera más ambiciosa. Ahí entran sus asociaciones con Martin Scorsese, Christopher Nolan y Quentin Tarantino, además de películas como Catch Me If You Can, The Departed, Inception, Django Unchained y Once Upon a Time in Hollywood.',
			'Su Oscar por The Revenant terminó de cerrar una narrativa que ya estaba instalada hacía años: la de un actor que nunca dejó de empujar hacia adelante y que suele elegir personajes al borde del derrumbe, la obsesión o la culpa.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Autor + taquilla' },
			{ label: 'Pulso', value: 'Riesgo constante' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'The Revenant', year: 2016 },
		],
		knownFor: ['titanic-1997', 'inception-2010', 'the-departed-2006', 'once-upon-a-time-in-hollywood-2019'],
		referenceUrls: [
			'https://www.britannica.com/biography/Leonardo-DiCaprio',
			'https://www.oscars.org/oscars/ceremonies/2005',
			'https://www.oscars.org/oscars/ceremonies/2016',
		],
	},
	'tom-hanks': {
		slug: 'tom-hanks',
		name: 'Tom Hanks',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Tom%20Hanks%20at%20the%20Elvis%20Premiere%202022.jpg?width=640',
		headline:
			'Figura bisagra entre la comedia popular de los 80 y el drama prestigioso de los 90, con una pantalla que transmite confianza al instante.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Concord, California, Estados Unidos',
		spotlight:
			'Pocos actores pueden ser tan masivos y a la vez tan efectivos para encarnar tipos comunes puestos ante situaciones extraordinarias.',
		biography: [
			'Tom Hanks nació el 9 de julio de 1956 en California y construyó primero una carrera de comedia con energía simpática y timing muy fino. Esa base le dio un oficio enorme antes de pasar a materiales más dramáticos.',
			'La década del 90 lo convirtió en uno de los nombres más respetados del cine estadounidense. Philadelphia, Forrest Gump, Apollo 13, Saving Private Ryan y Toy Story lo consolidaron como actor popular, serio y extremadamente confiable para estudios y directores.',
			'Su perfil público siempre tuvo algo de “americano clásico”, pero su carrera muestra más elasticidad de la que parece: puede ir del melodrama al cine bélico, del thriller histórico a la animación, sin perder identidad.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Clásico moderno' },
			{ label: 'Pulso', value: 'Humanidad total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Philadelphia', year: 1994 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'Forrest Gump', year: 1995 },
		],
		knownFor: ['forrest-gump-1994', 'saving-private-ryan-1998', 'toy-story-1995', 'atrapame-si-puedes-2002'],
		referenceUrls: [
			'https://www.britannica.com/biography/Tom-Hanks',
			'https://www.oscars.org/oscars/ceremonies/1994',
			'https://www.oscars.org/oscars/ceremonies/1995',
		],
	},
	'robert-de-niro': {
		slug: 'robert-de-niro',
		name: 'Robert De Niro',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Robert%20De%20Niro%20Cannes%202016.jpg?width=640',
		headline:
			'Uno de los actores más influyentes del cine estadounidense, con una combinación letal de naturalismo, amenaza y control interno.',
		roles: ['Actor', 'Productor'],
		birthPlace: 'Manhattan, Nueva York, Estados Unidos',
		spotlight:
			'Su alianza con Martin Scorsese redefinió el criminal moderno en pantalla y dejó una escuela entera de actuación.',
		biography: [
			'Robert De Niro nació el 17 de agosto de 1943 en Nueva York y se formó dentro de una tradición actoral profundamente ligada al trabajo de observación y composición. Desde muy temprano mostró una capacidad rarísima para desaparecer dentro del personaje.',
			'Con Mean Streets, Taxi Driver, Raging Bull y Goodfellas quedó asociado para siempre al cine de Scorsese, pero su filmografía es mucho más amplia. También fue central en The Godfather Part II, The Deer Hunter, Heat, Jackie Brown y una buena parte del cine criminal de prestigio.',
			'De Niro domina algo que pocos logran: transmitir violencia o fragilidad sin subrayar nada. Incluso en roles secundarios, suele funcionar como un eje gravitatorio alrededor del cual se ordena la película.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Huella', value: 'Método feroz' },
			{ label: 'Pulso', value: 'Poder contenido' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'The Godfather Part II', year: 1975 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'Raging Bull', year: 1981 },
		],
		knownFor: ['goodfellas-1990', 'taxi-driver-1976', 'the-deer-hunter-1978', 'killers-of-the-flower-moon-2023'],
		referenceUrls: [
			'https://www.britannica.com/biography/Robert-De-Niro',
			'https://www.oscars.org/oscars/ceremonies/1975',
			'https://www.oscars.org/oscars/ceremonies/1981',
		],
	},
	'denzel-washington': {
		slug: 'denzel-washington',
		name: 'Denzel Washington',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Denzel%20Washington%20at%20the%202025%20Cannes%20Film%20Festival.jpg?width=640',
		headline:
			'Presencia gigantesca del drama estadounidense, con una mezcla de autoridad, carisma y precisión que sostiene cualquier plano.',
		roles: ['Actor', 'Director'],
		birthPlace: 'Mount Vernon, Nueva York, Estados Unidos',
		spotlight:
			'Se mueve con naturalidad entre el héroe noble, el líder roto y el personaje moralmente ambiguo sin perder magnetismo.',
		biography: [
			'Denzel Washington nació el 28 de diciembre de 1954 en Mount Vernon, Nueva York, y primero encontró reconocimiento en televisión antes de dominar el cine. Su formación teatral siempre se nota en la dicción, el control corporal y el peso específico que les da a los diálogos.',
			'Películas como Glory, Malcolm X, Philadelphia, Training Day, Flight y Fences lo instalaron como uno de los intérpretes más sólidos de su generación. Incluso cuando el proyecto no es brillante, suele elevar el material con pura presencia.',
			'Washington también construyó carrera como director y productor, pero su gran rasgo sigue siendo otro: esa sensación de que cuando entra en escena todo el relato gana densidad de inmediato.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Pulso', value: 'Autoridad total' },
			{ label: 'Marca', value: 'Drama de alto nivel' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Glory', year: 1990 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'Training Day', year: 2002 },
		],
		knownFor: ['gladiator-ii-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Denzel-Washington',
			'https://www.oscars.org/oscars/ceremonies/1990',
			'https://www.oscars.org/oscars/ceremonies/2002',
		],
	},
	'morgan-freeman': {
		slug: 'morgan-freeman',
		name: 'Morgan Freeman',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Academy%20Award-winning%20actor%20Morgan%20Freeman%20narrates%20for%20the%20opening%20ceremony%20(26904746425)%20(cropped)%203.jpg?width=640',
		headline:
			'Actor de voz legendaria y presencia serena, siempre listo para dar autoridad, calidez o gravedad a una película.',
		roles: ['Actor'],
		birthPlace: 'Memphis, Tennessee, Estados Unidos',
		spotlight:
			'Tiene una calma casi magnética que funciona tanto para el mentor sabio como para el personaje cansado que ya vio demasiado.',
		biography: [
			'Morgan Freeman nació el 1 de junio de 1937 en Memphis, Tennessee, y tardó más que otros en convertirse en figura de cine, pero cuando lo hizo ya llegaba con una madurez de oficio muy difícil de igualar. Su carrera tiene algo de combustión lenta: fue creciendo hasta volverse indispensable.',
			'Driving Miss Daisy, The Shawshank Redemption, Se7en, Million Dollar Baby y Unforgiven muestran bien su rango. Puede ser cálido, irónico o profundamente melancólico, y casi siempre transmite la idea de que su personaje tiene una vida entera fuera de cuadro.',
			'Freeman es una de esas figuras cuya sola presencia ordena el relato. Incluso en roles chicos, aporta tono, estabilidad y una autoridad que no necesita gestos ampulosos.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Pulso', value: 'Calma imponente' },
			{ label: 'Marca', value: 'Voz icónica' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Million Dollar Baby', year: 2005 },
		],
		knownFor: ['the-shawshank-redemption-1994', 'se7en-1995', 'million-dollar-baby-2004', 'unforgiven-1992'],
		referenceUrls: [
			'https://www.britannica.com/biography/Morgan-Freeman',
			'https://www.oscars.org/oscars/ceremonies/1990',
			'https://www.oscars.org/oscars/ceremonies/2005',
		],
	},
	'jack-nicholson': {
		slug: 'jack-nicholson',
		name: 'Jack Nicholson',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Jack%20Nicholson%202001.jpg?width=640',
		headline:
			'Carisma, peligro y sarcasmo en dosis únicas: una de las grandes caras del cine estadounidense del último medio siglo.',
		roles: ['Actor'],
		birthPlace: 'Neptune City, Nueva Jersey, Estados Unidos',
		spotlight:
			'Su sonrisa torcida y su energía impredecible alcanzaron para volverlo una presencia irrepetible en dramas, comedias negras y cine de terror.',
		biography: [
			'Jack Nicholson nació el 22 de abril de 1937 en Nueva Jersey y encontró primero su espacio en películas pequeñas, antes de convertirse en una de las figuras fundamentales del Nuevo Hollywood. Five Easy Pieces y Chinatown ya lo mostraban como un actor distinto, lleno de filo e inteligencia.',
			'Después llegaron One Flew Over the Cuckoo’s Nest, The Shining, Terms of Endearment, Batman y As Good as It Gets, donde su capacidad para mezclar ironía, fragilidad y amenaza quedó cristalizada. Pocos intérpretes dominaron tan bien la idea de personaje incómodo pero fascinante.',
			'Nicholson no necesita llenar la pantalla a los gritos. Muchas veces le alcanza con una mirada apenas torcida para desacomodar toda la escena.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Huella', value: 'Icono total' },
			{ label: 'Pulso', value: 'Ironía + filo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'One Flew Over the Cuckoo’s Nest', year: 1976 },
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Terms of Endearment', year: 1984 },
			{ label: 'Oscar', category: 'Mejor actor', work: 'As Good as It Gets', year: 1998 },
		],
		knownFor: ['one-flew-over-the-cuckoo-s-nest-1975', 'the-shining-1980', 'batman-1989', 'terms-of-endearment-1983'],
		referenceUrls: [
			'https://www.britannica.com/biography/Jack-Nicholson',
			'https://www.oscars.org/oscars/ceremonies/1976',
			'https://www.oscars.org/oscars/ceremonies/1984',
			'https://www.oscars.org/oscars/ceremonies/1998',
		],
	},
	'christian-bale': {
		slug: 'christian-bale',
		name: 'Christian Bale',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Christian%20Bale-7837.jpg?width=640',
		headline:
			'Actor camaleónico, obsesivo con la transformación física y siempre dispuesto a llevar el personaje hasta el extremo.',
		roles: ['Actor'],
		birthPlace: 'Haverfordwest, Gales, Reino Unido',
		spotlight:
			'Puede pasar del héroe de estudio al tipo quebrado y hostil sin que se note el cambio de marcha: para él todo parece parte del mismo rigor.',
		biography: [
			'Christian Bale nació el 30 de enero de 1974 en Gales y empezó a actuar desde muy chico. Empire of the Sun ya lo dejaba ver como un intérprete intensísimo, mucho antes de convertirse en figura mainstream.',
			'Con American Psycho, The Machinist, la trilogía de Batman de Christopher Nolan, The Prestige y The Fighter construyó una carrera muy marcada por la transformación y el compromiso físico. Bale suele meterse de lleno en la mecánica interna del personaje, incluso cuando eso vuelve su trabajo incómodo o áspero.',
			'Su prestigio no viene solo del esfuerzo visible, sino de algo más difícil: logra que cada transformación tenga sentido dramático y no quede en mero truco.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Pulso', value: 'Transformación total' },
			{ label: 'Marca', value: 'Rigor feroz' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'The Fighter', year: 2011 },
		],
		knownFor: ['batman-begins-2005', 'the-dark-knight-2008', 'the-dark-knight-rises-2012', 'the-prestige-2006'],
		referenceUrls: [
			'https://www.britannica.com/biography/Christian-Bale',
			'https://www.oscars.org/oscars/ceremonies/2011',
			'https://www.oscars.org/oscars/ceremonies/2019',
		],
	},
	'joaquin-phoenix': {
		slug: 'joaquin-phoenix',
		name: 'Joaquin Phoenix',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Joaquin%20Phoenix%20in%202018.jpg?width=640',
		headline:
			'Actor de nervio raro y sensibilidad desacomodada, ideal para personajes al borde del colapso o la obsesión.',
		roles: ['Actor'],
		birthPlace: 'San Juan, Puerto Rico',
		spotlight:
			'Su trabajo suele tener algo imprevisible: parece siempre a punto de romper la escena, y eso le da una tensión muy particular.',
		biography: [
			'Joaquin Phoenix nació el 28 de octubre de 1974 en Puerto Rico y pasó parte de su infancia dentro de una familia itinerante antes de asentarse en Estados Unidos. Empezó de chico en televisión, pero con el tiempo fue corrigiendo cualquier gesto de actor precoz para encontrar una voz muy propia.',
			'The Master, Walk the Line, Her, Gladiator y Joker lo terminaron de instalar como uno de los intérpretes más singulares de su generación. Phoenix trabaja desde la incomodidad: no busca caer simpático, sino hacer visible el temblor interno del personaje.',
			'Cuando el material lo acompaña, esa forma de actuar genera algo potentísimo: la sensación de estar viendo a alguien desarmarse en tiempo real sin que parezca un truco calculado.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Pulso', value: 'Incomodidad filosa' },
			{ label: 'Marca', value: 'Riesgo permanente' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Joker', year: 2020 },
		],
		knownFor: ['joker-2019', 'gladiator-2000', 'napoleon-2023', 'joker-folie-a-deux-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Joaquin-Phoenix',
			'https://www.oscars.org/oscars/ceremonies/2006',
			'https://www.oscars.org/oscars/ceremonies/2020',
		],
	},
	'russell-crowe': {
		slug: 'russell-crowe',
		name: 'Russell Crowe',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Russell%20Crowe%20on%20the%20Green%20Carpet%20at%20the%202025%20Zurich%20Film%20Festival%2006%20(cropped).jpg?width=640',
		headline:
			'Figura de enorme presencia física y dramática, especialista en tipos tensos, orgullosos o atravesados por una épica muy terrenal.',
		roles: ['Actor'],
		birthPlace: 'Wellington, Nueva Zelanda',
		spotlight:
			'Durante años fue la cara perfecta del protagonista adulto de estudio: intensidad, oficio y una gravedad que se sentía corpórea.',
		biography: [
			'Russell Crowe nació el 7 de abril de 1964 en Wellington y desarrolló gran parte de su carrera entre Australia y Hollywood. Su salto internacional fue rápido porque tenía algo que el cine industrial valora muchísimo: presencia inmediata y una energía muy física.',
			'Gladiator, The Insider, A Beautiful Mind, Master and Commander y L.A. Confidential lo consolidaron como una de las estrellas adultas más potentes de fines de los 90 y principios de los 2000. Crowe puede ir al melodrama, al thriller o a la épica histórica sin perder espesor.',
			'Aun cuando su filmografía se volvió más irregular, sigue teniendo un recurso muy efectivo: la sensación de que cada personaje tiene orgullo, cansancio y rabia acumulada bajo la piel.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Épica adulta' },
			{ label: 'Pulso', value: 'Peso escénico' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actor', work: 'Gladiator', year: 2001 },
		],
		knownFor: ['gladiator-2000', 'a-beautiful-mind-2001', 'man-of-steel-2013', 'nuremberg-2025'],
		referenceUrls: [
			'https://www.britannica.com/biography/Russell-Crowe',
			'https://www.oscars.org/oscars/ceremonies/2001',
			'https://www.oscars.org/oscars/ceremonies/2002',
		],
	},
	'meryl-streep': {
		slug: 'meryl-streep',
		name: 'Meryl Streep',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Meryl%20Streep%20interview%20at%20Festival%20de%20Cannes%202024%20(cropped%202).jpg?width=640',
		headline:
			'Referencia absoluta de la actuación contemporánea, con una técnica tan precisa que casi siempre parece invisible.',
		roles: ['Actriz'],
		birthPlace: 'Summit, Nueva Jersey, Estados Unidos',
		spotlight:
			'Puede cambiar acento, registro, edad o tono sin que se note el esfuerzo: su versatilidad quedó como estándar para varias generaciones.',
		biography: [
			'Meryl Streep nació el 22 de junio de 1949 en Nueva Jersey y pasó del teatro y la formación clásica al cine con una facilidad asombrosa. Ya desde sus primeros trabajos se percibía una combinación infrecuente de inteligencia técnica y emoción limpia.',
			'Kramer vs. Kramer, Sophie’s Choice, Out of Africa, The Devil Wears Prada, Doubt y The Iron Lady forman apenas una parte de una carrera larguísima y casi siempre al máximo nivel. Streep no se repite tanto como parece: más bien adapta su instrumento al material con una precisión quirúrgica.',
			'Su prestigio es tan grande que a veces tapa lo más importante: la enorme capacidad que tiene para volver humanos incluso a personajes escritos desde el artificio o el gesto grandilocuente.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Versatilidad total' },
			{ label: 'Pulso', value: 'Técnica invisible' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Kramer vs. Kramer', year: 1980 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Sophie’s Choice', year: 1983 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Iron Lady', year: 2012 },
		],
		knownFor: ['kramer-vs-kramer-1979', 'out-of-africa-1985', 'dont-look-up-2021'],
		referenceUrls: [
			'https://www.britannica.com/biography/Meryl-Streep',
			'https://www.oscars.org/oscars/ceremonies/1980',
			'https://www.oscars.org/oscars/ceremonies/1983',
			'https://www.oscars.org/oscars/ceremonies/2012',
		],
	},
	'kate-winslet': {
		slug: 'kate-winslet',
		name: 'Kate Winslet',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/KateWinslet%20(cropped).jpg?width=640',
		headline:
			'Actriz británica de enorme intensidad emocional, capaz de sostener tanto romance clásico como drama áspero sin perder verdad.',
		roles: ['Actriz'],
		birthPlace: 'Reading, Berkshire, Inglaterra',
		spotlight:
			'Siempre transmite una mezcla de inteligencia, vulnerabilidad y fuerza que vuelve muy difícil despegar la mirada de sus personajes.',
		biography: [
			'Kate Winslet nació el 5 de octubre de 1975 en Reading y se formó en una familia ligada al teatro. Desde joven mostró una potencia dramática muy por encima del promedio, con una presencia que escapaba a cualquier idea de ingenuidad decorativa.',
			'Sense and Sensibility la puso en el radar, pero Titanic la volvió una figura global. Después construyó una carrera menos obvia y más rica, combinando cine de autor, melodrama, trabajos de época y personajes emocionalmente complejos.',
			'Winslet tiene algo muy valioso: una sensación de entrega total sin caer en la sobreactuación. Incluso en escenas grandilocuentes, suele encontrar una verdad concreta y terrenal.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Drama frontal' },
			{ label: 'Pulso', value: 'Emoción nítida' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Reader', year: 2009 },
		],
		knownFor: ['titanic-1997'],
		referenceUrls: [
			'https://www.britannica.com/biography/Kate-Winslet',
			'https://www.oscars.org/oscars/ceremonies/1998',
			'https://www.oscars.org/oscars/ceremonies/2009',
		],
	},
	'cate-blanchett': {
		slug: 'cate-blanchett',
		name: 'Cate Blanchett',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Cate%20Blanchett%20Cannes%202018%202%20(cropped).jpg?width=640',
		headline:
			'Actriz de una precisión notable, capaz de pasar del cine industrial al trabajo más sofisticado con la misma autoridad.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Ivanhoe, Victoria, Australia',
		spotlight:
			'Su elasticidad interpretativa le permite ser regia, monstruosa, cómica o fría sin que ninguna de esas capas parezca impostada.',
		biography: [
			'Cate Blanchett nació el 14 de mayo de 1969 en Australia y construyó una carrera muy asociada al teatro, la literatura y el cine de autor, aunque nunca se quedó encerrada ahí. Desde Elizabeth quedó claro que tenía presencia, voz y control para dominar personajes complejos.',
			'Con el tiempo logró una filmografía rarísima por amplitud: The Aviator, Blue Jasmine, Carol, Tár, los filmes de Peter Jackson, el Marvel de Thor y hasta trabajos de voz para animación. Blanchett parece sentirse cómoda tanto en el artificio más alto como en el naturalismo más seco.',
			'Es una actriz que no teme a la incomodidad ni al exceso cuando el material lo pide. Y cuando el personaje requiere apenas un desplazamiento mínimo, también sabe hacerlo pesar muchísimo.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Prestigio total' },
			{ label: 'Pulso', value: 'Precisión quirúrgica' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'The Aviator', year: 2005 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Blue Jasmine', year: 2014 },
		],
		knownFor: ['tar-2022', 'nightmare-alley-2021', 'thor-ragnarok-2017', 'indiana-jones-and-the-kingdom-of-the-crystal-skull-2008'],
		referenceUrls: [
			'https://www.britannica.com/biography/Cate-Blanchett',
			'https://www.oscars.org/oscars/ceremonies/2005',
			'https://www.oscars.org/oscars/ceremonies/2014',
		],
	},
	'angelina-jolie': {
		slug: 'angelina-jolie',
		name: 'Angelina Jolie',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Angelina%20Jolie-643531%20(cropped).jpg?width=640',
		headline:
			'Una de las últimas grandes estrellas globales de Hollywood, con mezcla de glamour, intensidad y una carrera más diversa de lo que suele recordarse.',
		roles: ['Actriz', 'Directora'],
		birthPlace: 'Los Ángeles, California, Estados Unidos',
		spotlight:
			'Pasó del drama áspero al cine de acción y después a la dirección sin dejar de sostener una imagen pública potentísima.',
		biography: [
			'Angelina Jolie nació el 4 de junio de 1975 en Los Ángeles y creció dentro de una familia muy ligada a la actuación. Su irrupción fuerte se dio en los 90, cuando ya mostraba una mezcla poco frecuente de vulnerabilidad, extrañeza y magnetismo inmediato.',
			'Girl, Interrupted le dio su Oscar y luego afianzó una imagen de superestrella con títulos como Lara Croft: Tomb Raider, Mr. & Mrs. Smith, Changeling, Salt y Maleficent. En paralelo armó una faceta como directora con películas como In the Land of Blood and Honey, Unbroken y First They Killed My Father.',
			'Jolie funciona bien tanto desde la fragilidad dramática como desde la presencia icónica. No es casual que haya sido durante años un nombre central del star system global.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Estrella global' },
			{ label: 'Pulso', value: 'Glamour + riesgo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Girl, Interrupted', year: 2000 },
			{ label: 'Oscar', category: 'Premio humanitario Jean Hersholt', work: 'Trayectoria humanitaria', year: 2014 },
		],
		knownFor: ['eternals-2021', 'kung-fu-panda-2008', 'kung-fu-panda-2-2011'],
		referenceUrls: [
			'https://www.britannica.com/biography/Angelina-Jolie',
			'https://www.oscars.org/oscars/ceremonies/2000',
			'https://www.oscars.org/oscars/ceremonies/2014',
		],
	},
	'jodie-foster': {
		slug: 'jodie-foster',
		name: 'Jodie Foster',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Jodie%20Foster%20in%20Baltimore%20(cropped).jpg?width=640',
		headline:
			'Actriz de enorme inteligencia y control, capaz de cargar con material psicológico muy complejo sin volverse aparatosa.',
		roles: ['Actriz', 'Directora'],
		birthPlace: 'Los Ángeles, California, Estados Unidos',
		spotlight:
			'Su trayectoria va desde la niña prodigio hasta la intérprete adulta de dramas intensos, siempre con una mirada muy lúcida sobre el personaje.',
		biography: [
			'Jodie Foster nació el 19 de noviembre de 1962 en Los Ángeles y empezó a trabajar desde muy chica. Lo notable es que logró salir del lugar de niña prodigio sin perder rigor ni curiosidad como actriz.',
			'Taxi Driver la puso en el centro de la conversación desde temprano, y años después The Accused y The Silence of the Lambs confirmaron una capacidad extraordinaria para sostener personajes vulnerables y al mismo tiempo durísimos. Foster siempre transmite inteligencia, concentración y una tensión interior muy precisa.',
			'Además de actuar, dirigió cine y televisión. Esa doble condición se percibe en pantalla: suele dar la impresión de entender la escena no solo desde su personaje, sino desde toda la arquitectura del relato.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Inteligencia feroz' },
			{ label: 'Pulso', value: 'Control total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Accused', year: 1989 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'The Silence of the Lambs', year: 1992 },
		],
		knownFor: ['the-silence-of-the-lambs-1991', 'taxi-driver-1976'],
		referenceUrls: [
			'https://www.britannica.com/biography/Jodie-Foster',
			'https://www.oscars.org/oscars/ceremonies/1989',
			'https://www.oscars.org/oscars/ceremonies/1992',
		],
	},
	'emma-stone': {
		slug: 'emma-stone',
		name: 'Emma Stone',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Emma%20Stone%20at%20the%202025%20Cannes%20Film%20Festival%2004.jpg?width=640',
		headline:
			'Actriz con timing afilado y una expresividad rarísima: puede ser luminosa, incómoda o devastadora sin dejar de sentirse contemporánea.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Scottsdale, Arizona, Estados Unidos',
		spotlight:
			'Su carrera fue de la comedia juvenil al cine de autor más desatado sin perder frescura ni precisión.',
		biography: [
			'Emma Stone nació el 6 de noviembre de 1988 en Arizona y se hizo conocida primero por su carisma en comedias y películas adolescentes. Lo que parecía un perfil de starlet simpática se transformó bastante rápido en algo más serio.',
			'Birdman, La La Land, The Favourite y Poor Things mostraron una evolución clarísima: Stone tiene timing, presencia cómica y una enorme capacidad para sostener vulnerabilidad o extrañeza. Puede resultar cercana incluso en personajes muy desviados o estilizados.',
			'En una industria donde muchas carreras se enfrían rápido, la suya hizo lo contrario: fue creciendo en riesgo y en nivel de exigencia sin perder atractivo popular.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Riesgo elegante' },
			{ label: 'Pulso', value: 'Frescura filosa' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'La La Land', year: 2017 },
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Poor Things', year: 2024 },
		],
		knownFor: ['poor-things-2023', 'birdman-or-the-unexpected-virtue-of-ignorance-2014', 'cruella-2021', 'the-amazing-spider-man-2012'],
		referenceUrls: [
			'https://www.britannica.com/biography/Emma-Stone',
			'https://www.oscars.org/oscars/ceremonies/2017',
			'https://www.oscars.org/oscars/ceremonies/2024',
		],
	},
	'natalie-portman': {
		slug: 'natalie-portman',
		name: 'Natalie Portman',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/NataliePortman.jpg?width=640',
		headline:
			'Actriz de gran delicadeza técnica, siempre efectiva para personajes introspectivos, frágiles o intensamente racionales.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Jerusalén, Israel',
		spotlight:
			'Construyó una carrera muy singular: de niña prodigio a estrella global sin dejar de buscar materiales complejos y directores fuertes.',
		biography: [
			'Natalie Portman nació el 9 de junio de 1981 en Jerusalén y se trasladó de chica a Estados Unidos. Desde Léon: The Professional se volvió evidente que no era una presencia infantil pasajera, sino una actriz con recursos poco comunes para su edad.',
			'Su recorrido va de Star Wars a Closer, de Black Swan a Jackie, y también incluye trabajos comerciales donde mantiene una gravitación tranquila pero firme. Portman suele actuar desde la interioridad, incluso cuando el personaje está al borde del estallido.',
			'Su mejor registro aparece cuando el relato le permite combinar control, vulnerabilidad y una inteligencia muy visible en pantalla. Ahí se vuelve una intérprete de enorme precisión.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Fragilidad + control' },
			{ label: 'Pulso', value: 'Prestigio sereno' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Black Swan', year: 2011 },
		],
		knownFor: ['star-wars-episode-i-the-phantom-menace-1999', 'star-wars-episode-ii-attack-of-the-clones-2002', 'star-wars-episode-iii-revenge-of-the-sith-2005', 'thor-2011'],
		referenceUrls: [
			'https://www.britannica.com/biography/Natalie-Portman',
			'https://www.oscars.org/oscars/ceremonies/2005',
			'https://www.oscars.org/oscars/ceremonies/2011',
		],
	},
	'charlize-theron': {
		slug: 'charlize-theron',
		name: 'Charlize Theron',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Charlize-theron-IMG%206045.jpg?width=640',
		headline:
			'Presencia imponente y muy dúctil, capaz de moverse entre el drama oscuro, el cine físico de acción y el blockbuster sin perder filo.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Benoni, Gauteng, Sudáfrica',
		spotlight:
			'Tiene glamour de estrella clásica, pero su carrera está llena de decisiones incómodas, físicas o directamente ásperas.',
		biography: [
			'Charlize Theron nació el 7 de agosto de 1975 en Sudáfrica y llegó al cine después de una formación ligada al modelaje y a la danza. Su irrupción no fue solo por presencia física: muy rápido mostró una disposición total para el trabajo duro.',
			'Monster marcó un antes y un después porque dejó en claro que podía desarmar cualquier expectativa de glamour para construir algo incómodo y profundamente humano. Después reforzó esa amplitud con Mad Max: Fury Road, Young Adult, Atomic Blonde y varias producciones de acción de alto voltaje.',
			'Theron suele funcionar especialmente bien cuando la película le pide dureza, ironía y un fondo de tristeza o agotamiento. Ahí aparece toda su potencia.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Dureza elegante' },
			{ label: 'Pulso', value: 'Fisicidad total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Monster', year: 2004 },
		],
		knownFor: ['mad-max-fury-road-2015', 'prometheus-2012'],
		referenceUrls: [
			'https://www.britannica.com/biography/Charlize-Theron',
			'https://www.oscars.org/oscars/ceremonies/2004',
			'https://www.oscars.org/oscars/ceremonies/2006',
		],
	},
	'anne-hathaway': {
		slug: 'anne-hathaway',
		name: 'Anne Hathaway',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Anne%20Hathaway%20at%20The%20Apprentice%20in%20NYC%2003%20(cropped).jpg?width=640',
		headline:
			'Actriz de enorme claridad expresiva, capaz de pasar del romanticismo luminoso al drama intenso con muchísima naturalidad.',
		roles: ['Actriz'],
		birthPlace: 'Brooklyn, Nueva York, Estados Unidos',
		spotlight:
			'Su carrera supo correrse del molde de estrella amable para buscar papeles más filosos, vulnerables o directamente oscuros.',
		biography: [
			'Anne Hathaway nació el 12 de noviembre de 1982 en Brooklyn y se volvió muy conocida con películas de tono juvenil y romántico. Pero esa primera imagen de actriz accesible y encantadora fue apenas una parte de su recorrido.',
			'Brokeback Mountain, Rachel Getting Married, Les Misérables, Interstellar y The Devil Wears Prada muestran cómo fue ampliando su rango. Hathaway puede ser muy luminosa, pero también sabe trabajar la ansiedad, el agotamiento o la herida emocional cuando el material lo pide.',
			'Con el tiempo armó una carrera bastante más rica de lo que sugería su arranque. Su virtud principal está en la transparencia: transmite rápido lo que le pasa al personaje sin forzarlo.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Versatilidad limpia' },
			{ label: 'Pulso', value: 'Emoción franca' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Les Misérables', year: 2013 },
		],
		knownFor: ['interstellar-2014', 'the-idea-of-you-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Anne-Hathaway',
			'https://www.oscars.org/oscars/ceremonies/2009',
			'https://www.oscars.org/oscars/ceremonies/2013',
		],
	},
	'jennifer-lawrence': {
		slug: 'jennifer-lawrence',
		name: 'Jennifer Lawrence',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Jennifer%20Lawrence%2C%20Cannes%20Film%20Festival%202025.jpg?width=640',
		headline:
			'Star contemporánea de enorme naturalidad, con una presencia frontal que le permite ser cercana, sarcástica o devastadora sin esfuerzo aparente.',
		roles: ['Actriz'],
		birthPlace: 'Indian Hills, Kentucky, Estados Unidos',
		spotlight:
			'Su combinación de carisma popular y timing seco la volvió una de las caras más fuertes de Hollywood en la década pasada.',
		biography: [
			'Jennifer Lawrence nació el 15 de agosto de 1990 en Kentucky y tuvo un ascenso velocísimo. En muy pocos años pasó de promesa televisiva a protagonista de franquicias gigantes y dramas de prestigio.',
			'Winter’s Bone la reveló como una actriz con una intensidad inhabitual para su edad. Después sumó The Hunger Games, Silver Linings Playbook, American Hustle, Mother! y Don’t Look Up, consolidando una carrera donde conviven lo popular y lo imprevisible.',
			'Lawrence trabaja muy bien desde la espontaneidad. Tiene algo directo, casi desprolijo en el mejor sentido, que hace que muchos de sus personajes se sientan vivos de una manera poco calculada.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Marca', value: 'Star millennial' },
			{ label: 'Pulso', value: 'Naturalidad filosa' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor actriz', work: 'Silver Linings Playbook', year: 2013 },
		],
		knownFor: ['dont-look-up-2021', 'x-men-first-class-2011', 'x-men-apocalypse-2016'],
		referenceUrls: [
			'https://www.britannica.com/biography/Jennifer-Lawrence',
			'https://www.oscars.org/oscars/ceremonies/2013',
			'https://www.oscars.org/oscars/ceremonies/2014',
		],
	},
	'steven-spielberg': {
		slug: 'steven-spielberg',
		name: 'Steven Spielberg',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Steven%20Spielberg%202025.jpg?width=640',
		headline:
			'Director clave del blockbuster moderno y al mismo tiempo un narrador clásico capaz de pasar de la aventura pura al drama histórico con una fluidez rarísima.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Cincinnati, Ohio, Estados Unidos',
		spotlight:
			'Pocos cineastas moldearon tanto la imaginación popular: tiburones, extraterrestres, dinosaurios, guerras y memoria histórica, todo dentro de una misma carrera.',
		biography: [
			'Steven Spielberg nació el 18 de diciembre de 1946 en Cincinnati y desde muy chico filmó cortos caseros, armado con esa mezcla de curiosidad técnica y entusiasmo infantil que después se volvería una marca de estilo. Su ingreso a Hollywood se dio a través de la televisión, pero el salto real llegó con Duel y, sobre todo, con Jaws.',
			'Ahí empezó una etapa histórica. Spielberg ayudó a definir el blockbuster moderno con E.T., Indiana Jones y Jurassic Park, sin perder nunca claridad narrativa ni sentido del espectáculo. Pero su carrera no quedó encerrada en la aventura: también dirigió Schindler’s List, Saving Private Ryan, Munich, Lincoln y The Fabelmans, mostrando una veta dramática cada vez más fuerte.',
			'Su gran rasgo es la precisión con la que organiza emoción, espacio y ritmo. Puede filmar maravilla, terror, guerra o intimidad familiar sin perder legibilidad ni pulso popular. Por eso sigue siendo una referencia inevitable tanto para el cine industrial como para el más prestigioso.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Huella', value: 'Padre del blockbuster' },
			{ label: 'Pulso', value: 'Emoción + espectáculo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: "Schindler's List", year: 1994 },
			{ label: 'Oscar', category: 'Mejor director', work: 'Saving Private Ryan', year: 1999 },
			{ label: 'Oscar', category: 'Premio Irving G. Thalberg', work: 'Trayectoria como productor', year: 1986 },
		],
		knownFor: ['jaws-1975', 'e-t-the-extra-terrestrial-1982', 'jurassic-park-1993', 'schindler-s-list-1993'],
		referenceUrls: [
			'https://www.britannica.com/biography/Steven-Spielberg',
			'https://www.oscars.org/oscars/ceremonies/1994',
			'https://www.oscars.org/oscars/ceremonies/1999',
		],
	},
	'christopher-nolan': {
		slug: 'christopher-nolan',
		name: 'Christopher Nolan',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/ChrisNolanBFI150224%20(10%20of%2012)%20(53532289710)%20(cropped2).jpg?width=640',
		headline:
			'Director británico que convirtió las estructuras complejas, el gran formato y la obsesión por el tiempo en cine masivo de primer nivel.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Londres, Inglaterra, Reino Unido',
		spotlight:
			'Consiguió algo muy difícil: hacer películas conceptuales, formales y largamente ambiciosas sin abandonar la escala industrial ni el impacto popular.',
		biography: [
			'Christopher Nolan nació el 30 de julio de 1970 en Londres y creció entre Inglaterra y Estados Unidos. Desde sus primeros trabajos se notó una fascinación por la percepción, la memoria y las estructuras narrativas quebradas, algo que explotó del todo con Memento.',
			'Después convirtió esa obsesión en un lenguaje mainstream. Batman Begins, The Dark Knight, Inception, Interstellar, Dunkirk y Oppenheimer muestran a un director que piensa el espectáculo desde la forma, el montaje y la escala. Incluso cuando trabaja con ideas enormes, suele mantener una tensión narrativa muy concreta.',
			'Nolan filma como si cada película fuera un mecanismo de relojería. Su prestigio no viene solo de la grandilocuencia, sino de haber logrado que el cine-evento contemporáneo vuelva a sentirse como una experiencia de autor.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Gran formato autoral' },
			{ label: 'Pulso', value: 'Concepto + tensión' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'Oppenheimer', year: 2024 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'Oppenheimer', year: 2024 },
			{ label: 'BFI Fellowship', category: 'Máximo honor del BFI', work: 'Trayectoria', year: 2024 },
		],
		knownFor: ['memento-2000', 'inception-2010', 'interstellar-2014', 'oppenheimer-2023'],
		referenceUrls: [
			'https://www.britannica.com/biography/Christopher-Nolan-British-director',
			'https://www.oscars.org/oscars/ceremonies/2024',
			'https://www.bfi.org.uk/news/programme-announced-february-2024-bfi-southbank-bfi-imax',
		],
	},
	'quentin-tarantino': {
		slug: 'quentin-tarantino',
		name: 'Quentin Tarantino',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Quentin%20Tarantino%20by%20Gage%20Skidmore.jpg?width=640',
		headline:
			'Director y guionista que volvió pop la cita cinéfila, la violencia estilizada y el diálogo como motor puro de tensión y placer.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Knoxville, Tennessee, Estados Unidos',
		spotlight:
			'Su cine mezcla exploitation, western, kung fu, noir y comedia negra con una seguridad tonal tan extrema que terminó inventando un adjetivo propio.',
		biography: [
			'Quentin Tarantino nació el 27 de marzo de 1963 en Knoxville y se formó más en videoclubs y salas que en escuelas de cine. Esa educación cinéfila, desordenada y apasionada terminó siendo parte central de su identidad como autor.',
			'Reservoir Dogs y Pulp Fiction lo instalaron de inmediato como una voz singular. Después siguió expandiendo un universo reconocible con Jackie Brown, Kill Bill, Inglourious Basterds, Django Unchained, The Hateful Eight y Once Upon a Time in Hollywood. Cada película suya parece conversar con medio siglo de cine popular.',
			'Tarantino filma desde el exceso controlado: música, actuación, encuadre y texto trabajan para crear escenas larguísimas que siempre están a punto de explotar. Es un estilista total, pero también un narrador que entiende perfectamente el placer físico del cine.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios' },
			{ label: 'Marca', value: 'Autor pop absoluto' },
			{ label: 'Pulso', value: 'Diálogo + pólvora' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor guion original', work: 'Pulp Fiction', year: 1995 },
			{ label: 'Oscar', category: 'Mejor guion original', work: 'Django Unchained', year: 2013 },
		],
		knownFor: [
			'pulp-fiction-1994',
			'kill-bill-vol-1-2003',
			'inglourious-basterds-2009',
			'once-upon-a-time-in-hollywood-2019',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Quentin-Tarantino',
			'https://www.oscars.org/oscars/ceremonies/1995',
			'https://www.oscars.org/oscars/ceremonies/2013',
		],
	},
	'hayao-miyazaki': {
		slug: 'hayao-miyazaki',
		name: 'Hayao Miyazaki',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/HayaoMiyazakiCCJuly09.jpg?width=640',
		headline:
			'Maestro absoluto de la animación japonesa, creador de mundos sensibles, melancólicos y visualmente deslumbrantes que marcaron generaciones enteras.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Tokio, Japón',
		spotlight:
			'Su cine puede ser tierno, ecológico, bélico, fantástico y político al mismo tiempo, siempre con una humanidad enorme en el centro.',
		biography: [
			'Hayao Miyazaki nació el 5 de enero de 1941 en Tokio y se formó dentro de la industria de la animación japonesa antes de convertirse en uno de sus grandes renovadores. Su imaginación visual siempre convivió con una mirada crítica sobre la guerra, la modernidad y el vínculo entre humanidad y naturaleza.',
			'Con Nausicaä, My Neighbor Totoro, Princess Mononoke, Spirited Away, Howl’s Moving Castle y The Boy and the Heron armó una filmografía que atraviesa décadas sin perder delicadeza ni poder de asombro. Sus películas están llenas de vuelo, de criaturas extrañas y de personajes femeninos complejos y memorables.',
			'Miyazaki tiene algo raro incluso entre los gigantes: cada plano suyo parece dibujado desde una ética, no solo desde una estética. Por eso su cine emociona tanto a chicos como a adultos sin caer nunca en el subrayado fácil.',
		],
		stats: [
			{ label: 'Oscar', value: '2 premios competitivos' },
			{ label: 'Huella', value: 'Leyenda de la animación' },
			{ label: 'Pulso', value: 'Poesía + aventura' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor película animada', work: 'Spirited Away', year: 2003 },
			{ label: 'Oscar', category: 'Mejor película animada', work: 'The Boy and the Heron', year: 2024 },
		],
		knownFor: [
			'nausicaa-of-the-valley-of-the-wind-1984',
			'my-neighbor-totoro-1988',
			'spirited-away-2001',
			'the-boy-and-the-heron-2023',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Miyazaki-Hayao',
			'https://www.oscars.org/oscars/ceremonies/2003',
			'https://www.oscars.org/oscars/ceremonies/2024',
		],
	},
	'james-cameron': {
		slug: 'james-cameron',
		name: 'James Cameron',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/James%20Cameron%20at%2053rd%20Saturn%20Awards%202026-01.jpg?width=640',
		headline:
			'Director que convirtió la ambición tecnológica en espectáculo planetario sin resignar una vocación clarísima por el cine de aventura.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Kapuskasing, Ontario, Canadá',
		spotlight:
			'Su carrera está hecha de hitos industriales: secuelas superiores al original, ciencia ficción musculosa, récords de taquilla y obsesión real por la imagen.',
		biography: [
			'James Cameron nació el 16 de agosto de 1954 en Kapuskasing, Ontario, y llegó al cine por una mezcla de curiosidad técnica, trabajo duro y fascinación por la ciencia ficción. Su crecimiento fue veloz: de Piranha II a The Terminator hay un salto brutal de control y personalidad.',
			'Con Aliens, Terminator 2, Titanic y Avatar construyó una carrera ligada a la escala, la invención técnica y el espectáculo físico. Pero su cine no es puro aparato: suele apoyarse en conflictos simples y muy claros para que la dimensión industrial nunca tape del todo lo emocional.',
			'Cameron empuja cada proyecto como si quisiera probar un límite nuevo del medio. Esa obsesión, que a veces roza la demencia productiva, es parte de lo que lo volvió una figura central del cine mundial.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Espectáculo tecnológico' },
			{ label: 'Pulso', value: 'Ambición total' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'Titanic', year: 1998 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'Titanic', year: 1998 },
			{ label: 'Golden Globe', category: 'Mejor director', work: 'Avatar', year: 2010 },
		],
		knownFor: ['the-terminator-1984', 'aliens-1986', 'titanic-1997', 'avatar-2009'],
		referenceUrls: [
			'https://www.britannica.com/biography/James-Cameron',
			'https://www.oscars.org/oscars/ceremonies/1998',
			'https://www.goldenglobes.com/person/james-cameron',
		],
	},
	'martin-scorsese': {
		slug: 'martin-scorsese',
		name: 'Martin Scorsese',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Martin%20Scorsese%20MFF%202023.jpg?width=640',
		headline:
			'Uno de los grandes autores del cine estadounidense, dueño de una energía visual y moral que sigue marcando el estándar del drama adulto.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Queens, Nueva York, Estados Unidos',
		spotlight:
			'Pocos filmaron con tanta intensidad la culpa, la violencia, la fe, la ambición y el derrumbe de los hombres modernos.',
		biography: [
			'Martin Scorsese nació el 17 de noviembre de 1942 en Queens y creció en Little Italy, un universo que impregnó buena parte de su cine. Su formación mezcla cinefilia extrema, educación católica y una sensibilidad urbana que hizo de sus primeras películas algo inconfundible.',
			'Mean Streets, Taxi Driver, Raging Bull, Goodfellas, Casino, The Departed, The Wolf of Wall Street y Killers of the Flower Moon forman parte de una filmografía monumental. También fue central como historiador, restaurador y defensor del cine, tanto en documentales como en tareas de preservación.',
			'Scorsese filma con nervio, música, cámara móvil y montaje vivo, pero detrás de esa superficie siempre hay preguntas morales profundas. No es solo un estilista feroz: es un observador implacable de la violencia y de la culpa.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio' },
			{ label: 'Huella', value: 'Autor total' },
			{ label: 'Pulso', value: 'Furia moral' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Departed', year: 2007 },
			{ label: 'Palma de Oro', category: 'Mejor película', work: 'Taxi Driver', year: 1976 },
		],
		knownFor: ['taxi-driver-1976', 'goodfellas-1990', 'the-departed-2006', 'killers-of-the-flower-moon-2023'],
		referenceUrls: [
			'https://www.britannica.com/biography/Martin-Scorsese',
			'https://www.oscars.org/oscars/ceremonies/2007',
			'https://www.festival-cannes.com/en/p/taxi-driver/',
		],
	},
	'francis-ford-coppola': {
		slug: 'francis-ford-coppola',
		name: 'Francis Ford Coppola',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Francis%20Ford%20Coppola%20on%20December%208%2C%202024%20in%20the%20White%20House%20Oval%20Office%20(cropped).jpg?width=640',
		headline:
			'Figura fundacional del Nuevo Hollywood, capaz de levantar epopeyas monumentales y al mismo tiempo pelear por una idea radical de independencia creativa.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Detroit, Michigan, Estados Unidos',
		spotlight:
			'Entre The Godfather, The Conversation y Apocalypse Now dejó una de las décadas más impresionantes que haya firmado un director en la historia del cine.',
		biography: [
			'Francis Ford Coppola nació el 7 de abril de 1939 en Detroit y se formó primero en teatro y después en cine. Su paso por el circuito de Roger Corman le dio oficio industrial, pero muy rápido apuntó a algo más ambicioso y personal.',
			'En los 70 dirigió una seguidilla imposible: The Godfather, The Conversation, The Godfather Part II y Apocalypse Now. Esas películas no solo lo volvieron central en el Nuevo Hollywood, también redefinieron la escala posible del cine de estudio cuando un autor toma el control.',
			'Coppola siempre fue más que un director prestigioso: también funcionó como productor, impulsor tecnológico y figura de referencia para generaciones enteras. Su carrera tiene altibajos, sí, pero su peso histórico es inmenso.',
		],
		stats: [
			{ label: 'Oscar', value: '6 premios personales' },
			{ label: 'Huella', value: 'Nuevo Hollywood' },
			{ label: 'Pulso', value: 'Épica + riesgo' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Godfather Part II', year: 1975 },
			{ label: 'Oscar', category: 'Mejor guion adaptado', work: 'The Godfather', year: 1973 },
		],
		knownFor: ['the-godfather-1972', 'the-godfather-part-ii-1974', 'apocalypse-now-1979', 'megalopolis-2024'],
		referenceUrls: [
			'https://www.britannica.com/biography/Francis-Ford-Coppola',
			'https://www.oscars.org/oscars/ceremonies/1973',
			'https://www.oscars.org/oscars/ceremonies/1975',
		],
	},
	'george-lucas': {
		slug: 'george-lucas',
		name: 'George Lucas',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/George%20Lucas.jpg?width=640',
		headline:
			'Arquitecto de franquicias modernas, productor visionario y director que cambió para siempre la relación entre cine, tecnología y cultura popular.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Modesto, California, Estados Unidos',
		spotlight:
			'No filmó demasiado como director, pero lo que hizo alcanzó para redefinir los efectos visuales, el merchandising y la idea misma de universo cinematográfico.',
		biography: [
			'George Lucas nació el 14 de mayo de 1944 en Modesto y llegó al cine después de una adolescencia marcada por los autos, la velocidad y un accidente que casi le cambia la vida. Ya en la USC empezó a combinar fascinación visual, ciencia ficción y una mirada muy precisa sobre la cultura estadounidense.',
			'THX 1138 y American Graffiti mostraban dos facetas distintas, pero fue Star Wars la obra que reorganizó su carrera y buena parte de la industria. Lucas no solo dirigió la película original y la trilogía precuela: también construyó Lucasfilm, ILM y una infraestructura tecnológica decisiva para el cine moderno.',
			'Su importancia excede largamente la dirección. Lucas pensó el cine como sistema, como mitología global y como laboratorio técnico. Por eso su figura es indispensable incluso cuando no estaba detrás de cámara.',
		],
		stats: [
			{ label: 'Oscar', value: '1 premio honorífico de producción' },
			{ label: 'Huella', value: 'Revolución industrial' },
			{ label: 'Pulso', value: 'Mito pop global' },
		],
		awards: [
			{ label: 'Oscar', category: 'Premio Irving G. Thalberg', work: 'Trayectoria como productor', year: 1991 },
		],
		knownFor: [
			'star-wars-episode-iv-a-new-hope-1977',
			'star-wars-episode-i-the-phantom-menace-1999',
			'star-wars-episode-ii-attack-of-the-clones-2002',
			'star-wars-episode-iii-revenge-of-the-sith-2005',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/George-Lucas',
			'https://www.lucasfilm.com/who-we-are/george-lucas/',
			'https://www.oscars.org/oscars/ceremonies/1992',
		],
	},
	'peter-jackson': {
		slug: 'peter-jackson',
		name: 'Peter Jackson',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Peter%20Jackson%20ONZ%20(cropped).jpg?width=640',
		headline:
			'Director neozelandés que llevó la fantasía épica a una escala pocas veces vista y convirtió una sensibilidad geek en cine masivo del más alto nivel.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Pukerua Bay, Isla Norte, Nueva Zelanda',
		spotlight:
			'Pasó del gore artesanal a una de las trilogías más influyentes del siglo XXI sin perder el gusto por el detalle, el mundo construido y la aventura física.',
		biography: [
			'Peter Jackson nació el 31 de octubre de 1961 en Pukerua Bay y arrancó filmando de manera completamente autodidacta. Sus primeras películas ya mostraban una imaginación visual desaforada y una energía artesanal que después iba a escalar de forma impensada.',
			'El salto definitivo llegó con The Lord of the Rings, una apuesta gigantesca que redefinió el cine fantástico contemporáneo. La trilogía combinó ambición épica, trabajo técnico monumental y una convicción emocional que la volvió un fenómeno crítico y popular a nivel mundial.',
			'Jackson tiene un don especial para hacer tangible lo imposible. Sus películas pueden ser enormes, pero casi siempre conservan algo físico, táctil y lúdico. Esa mezcla es una parte grande de su encanto como director.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Fantasía épica' },
			{ label: 'Pulso', value: 'Aventura gigantesca' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Lord of the Rings: The Return of the King', year: 2004 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'The Lord of the Rings: The Return of the King', year: 2004 },
			{ label: 'Oscar', category: 'Mejor guion adaptado', work: 'The Lord of the Rings: The Return of the King', year: 2004 },
		],
		knownFor: [
			'the-lord-of-the-rings-the-fellowship-of-the-ring-2001',
			'the-lord-of-the-rings-the-two-towers-2002',
			'the-lord-of-the-rings-the-return-of-the-king-2003',
		],
		referenceUrls: [
			'https://www.britannica.com/biography/Peter-Jackson-New-Zealand-director',
			'https://www.oscars.org/oscars/ceremonies/2004',
			'https://www.nzonscreen.com/profile/peter-jackson/biography',
		],
	},
	'guillermo-del-toro': {
		slug: 'guillermo-del-toro',
		name: 'Guillermo del Toro',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Guillermo%20del%20Toro%20at%20the%202026%20Sundance%20Film%20Festival%2001%20(cropped).jpg?width=640',
		headline:
			'Director mexicano que volvió prestigioso al cine de monstruos sin domesticarlo, siempre mezclando imaginación visual con melancolía y política.',
		roles: ['Director', 'Guionista', 'Productor'],
		birthPlace: 'Guadalajara, Jalisco, México',
		spotlight:
			'Su filmografía une terror, fantasía, catolicismo, guerra y criaturas heridas en un universo visual que nadie más filma igual.',
		biography: [
			'Guillermo del Toro nació el 9 de octubre de 1964 en Guadalajara y desde muy joven estuvo obsesionado con los monstruos, el maquillaje, la imaginería católica y los cuentos oscuros. Esa mezcla se convirtió en el corazón de toda su obra.',
			'Cronos, The Devil’s Backbone, Pan’s Labyrinth, Hellboy, Pacific Rim, The Shape of Water, Nightmare Alley y Pinocchio muestran una carrera muy poco domesticable. Del Toro puede trabajar dentro de Hollywood sin perder nunca del todo su sensibilidad gótica, afectiva y monstruosa.',
			'Lo mejor de su cine aparece cuando hace convivir ternura y espanto. Sus criaturas no suelen ser simples amenazas: son cuerpos heridos, exiliados o incomprendidos. Ahí aparece toda su humanidad como autor.',
		],
		stats: [
			{ label: 'Oscar', value: '3 premios' },
			{ label: 'Marca', value: 'Poeta de monstruos' },
			{ label: 'Pulso', value: 'Fantasía + dolor' },
		],
		awards: [
			{ label: 'Oscar', category: 'Mejor director', work: 'The Shape of Water', year: 2018 },
			{ label: 'Oscar', category: 'Mejor película como productor', work: 'The Shape of Water', year: 2018 },
			{ label: 'Oscar', category: 'Mejor película animada', work: "Guillermo del Toro's Pinocchio", year: 2023 },
		],
		knownFor: ['blade-ii-2002', 'the-shape-of-water-2017', 'nightmare-alley-2021', 'frankenstein-2025'],
		referenceUrls: [
			'https://www.britannica.com/biography/Guillermo-del-Toro',
			'https://www.oscars.org/oscars/ceremonies/2018',
			'https://www.oscars.org/oscars/ceremonies/2023',
		],
	},
	...bulkTrendProfiles,
};
