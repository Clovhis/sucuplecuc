import type { PersonProfileRecord } from '../types/person';

const globalActorDefaults = {
	roles: ['Actor'],
	stats: [],
};

const globalActressDefaults = {
	roles: ['Actriz'],
	stats: [],
};

const globalDirectorDefaults = {
	roles: ['Director'],
	stats: [],
};

const argentineActorDefaults = {
	roles: ['Actor'],
	stats: [],
};

const argentineActressDefaults = {
	roles: ['Actriz'],
	stats: [],
};

const argentineDirectorDefaults = {
	roles: ['Director'],
	stats: [],
};

function normalizePersonName(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

const catalogBackedProfileMeta = {
	'emma-watson': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Emma%20Watson%202013.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q39476', 'https://www.imdb.com/name/nm0914612/', 'https://www.themoviedb.org/person/10990-emma-watson'],
	},
	'scarlett-johansson': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scarlett%20Johansson%20by%20Gage%20Skidmore%202%20(cropped)%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q34436', 'https://www.imdb.com/name/nm0424060/', 'https://www.themoviedb.org/person/1245-scarlett-johansson'],
	},
	'lupita-nyong-o': {
		profileImage: "https://commons.wikimedia.org/wiki/Special:FilePath/MKr347546%20Lupita%20Nyong'o%20(Jury%2C%20Berlinale%202024)%20crop.jpg?width=640",
		referenceUrls: ['https://www.wikidata.org/wiki/Q3840847', 'https://www.imdb.com/name/nm2143282/'],
	},
	'emily-blunt': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Emily%20Blunt%20at%202026%20Golden%20Globes%2001%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q193517', 'https://www.imdb.com/name/nm1289434/', 'https://www.themoviedb.org/person/5081-emily-blunt'],
	},
	'amy-adams': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amy%20Adams%20UK%20Nocturnal%20Animals%20Premiere%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q481832', 'https://www.imdb.com/name/nm0010736/', 'https://www.themoviedb.org/person/9273-amy-adams'],
	},
	'jessica-chastain': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jessica%20Chastain-64631%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q229313', 'https://www.imdb.com/name/nm1567113/', 'https://www.themoviedb.org/person/83002-jessica-chastain'],
	},
	'hailee-steinfeld': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hailee%20Steinfeld%20(21604481176)%20(cropped)-001.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q231726', 'https://www.imdb.com/name/nm2794962/', 'https://www.themoviedb.org/person/130640-hailee-steinfeld'],
	},
	'ariana-debose': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ariana%20DeBose%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q27733932', 'https://www.imdb.com/name/nm3663196/', 'https://www.themoviedb.org/person/1437491-ariana-debose'],
	},
	'kirsten-dunst': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kirsten%20Dunst%20(2017%20crop).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q76478', 'https://www.imdb.com/name/nm0000379/', 'https://www.themoviedb.org/person/205-kirsten-dunst'],
	},
	'rachel-mcadams': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rachel%20McAdams%20-%20Walk%20of%20Fame.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q190386', 'https://www.imdb.com/name/nm1046097/', 'https://www.themoviedb.org/person/53714-rachel-mcadams'],
	},
	'daisy-edgar-jones': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Daisy%20Edgar-Jones%20at%20the%202024%20Toronto%20International%20Film%20Festival%202%20(better%20crop).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q73889193', 'https://www.imdb.com/name/nm8402992/', 'https://www.themoviedb.org/person/2230991-daisy-edgar-jones'],
	},
	'jamie-lee-curtis': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/2025%20Jamie%20Lee%20Curtis%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q106997', 'https://www.imdb.com/name/nm0000130/', 'https://www.themoviedb.org/person/8944-jamie-lee-curtis'],
	},
	'sigourney-weaver': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sigourney%20Weaver%20at%20the%202025%20Toronto%20International%20Film%20Festival%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q102124', 'https://www.imdb.com/name/nm0000244/', 'https://www.themoviedb.org/person/10205-sigourney-weaver'],
	},
	'jennifer-connelly': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jennifer%20Connelly%202010%20TIFF.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q103343', 'https://www.imdb.com/name/nm0000124/', 'https://www.themoviedb.org/person/6161-jennifer-connelly'],
	},
	'viola-davis': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Viola%20Davis%20(27983785894)%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q229181', 'https://www.imdb.com/name/nm0205626/', 'https://www.themoviedb.org/person/19492-viola-davis'],
	},
	'halle-berry': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Halle%20Berry%20by%20Gage%20Skidmore%202.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q1033016', 'https://www.imdb.com/name/nm0000932/', 'https://www.themoviedb.org/person/4587-halle-berry'],
	},
	'brie-larson': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Captain%20Marvel%20trailer%20at%20the%20National%20Air%20and%20Space%20Museum%204%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q29328', 'https://www.imdb.com/name/nm0488953/', 'https://www.themoviedb.org/person/60073-brie-larson'],
	},
	'awkwafina': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Awkwafina%20by%20Gage%20Skidmore.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q15306031', 'https://www.imdb.com/name/nm5377144/', 'https://www.themoviedb.org/person/1625558-awkwafina'],
	},
	'america-ferrera': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/America%20Ferrera%20at%20the%202025%20Toronto%20International%20Film%20Festival%20(cropped2).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q219402', 'https://www.imdb.com/name/nm1065229/', 'https://www.themoviedb.org/person/59174-america-ferrera'],
	},
	'michelle-williams': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Michelle%20Williams%20UK%20Manchester%20By%20the%20Sea%20Premiere.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q156796', 'https://www.imdb.com/name/nm0931329/', 'https://www.themoviedb.org/person/1812-michelle-williams'],
	},
	'keke-palmer': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Keke%20Palmer%202016%20Paleyfest%20original.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q273044', 'https://www.imdb.com/name/nm1551130/', 'https://www.themoviedb.org/person/74688-keke-palmer'],
	},
	'caitriona-balfe': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Caitriona%20Balfe%20at%20the%202024%20Toronto%20International%20Film%20Festival%20(crop).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q2933352', 'https://www.imdb.com/name/nm2928020/', 'https://www.themoviedb.org/person/147056-caitr-ona-balfe'],
	},
	'kristen-wiig': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kristin%20Wiig%202013.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q231382', 'https://www.imdb.com/name/nm1325419/', 'https://www.themoviedb.org/person/41091-kristen-wiig'],
	},
	'rebecca-hall': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/RebeccaHallTIFFSept2011.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q230534', 'https://www.imdb.com/name/nm0356017/', 'https://www.themoviedb.org/person/15556-rebecca-hall'],
	},
	'rosamund-pike': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/RosamundPike10TIFF.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q230004', 'https://www.imdb.com/name/nm0683253/', 'https://www.themoviedb.org/person/10882-rosamund-pike'],
	},
	'will-smith': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Will%20Smith%20by%20Gage%20Skidmore%202.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q40096', 'https://www.imdb.com/name/nm0000226/', 'https://www.themoviedb.org/person/2888-will-smith'],
	},
	'nicolas-cage': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nicolas%20Cage%20Deauville%202013%202.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q42869', 'https://www.imdb.com/name/nm0000115/', 'https://www.themoviedb.org/person/2963-nicolas-cage'],
	},
	'jamie-foxx': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/TIFF%202019%20jamie%20foxx%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q171905', 'https://www.imdb.com/name/nm0004937/', 'https://www.themoviedb.org/person/134-jamie-foxx'],
	},
	'sylvester-stallone': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sylvester%20Stallone%20Cannes%202019.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q40026', 'https://www.imdb.com/name/nm0000230/', 'https://www.themoviedb.org/person/16483-sylvester-stallone'],
	},
	'laurence-fishburne': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Laurence%20Fishburne%202009%20-%20cropped.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q193048', 'https://www.imdb.com/name/nm0000401/', 'https://www.themoviedb.org/person/2975-laurence-fishburne'],
	},
	'johnny-depp': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Johnny%20Depp%202020.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q37175', 'https://www.imdb.com/name/nm0000136/', 'https://www.themoviedb.org/person/85-johnny-depp'],
	},
	'ian-mckellen': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/McKellenRichmnd040219-5%20(46275370484)%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q170510', 'https://www.imdb.com/name/nm0005212/', 'https://www.themoviedb.org/person/1327-ian-mckellen'],
	},
	'liam-neeson': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Liam%20Neeson%20Deauville%202012.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q58444', 'https://www.imdb.com/name/nm0000553/', 'https://www.themoviedb.org/person/3896-liam-neeson'],
	},
	'edward-norton': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ed%20Norton%20and%20Shauna%20Robertson%20TIFF%202025%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q125904', 'https://www.imdb.com/name/nm0001570/', 'https://www.themoviedb.org/person/819-edward-norton'],
	},
	'ke-huy-quan': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ke%20Huy%20Quan%20at%20the%20White%20House%20(52902390767)%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q445017', 'https://www.imdb.com/name/nm0702841/', 'https://www.themoviedb.org/person/690-ke-huy-quan'],
	},
	'james-mcavoy': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/James%20McAvoy%20by%20Gage%20Skidmore%202.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q193659', 'https://www.imdb.com/name/nm0564215/', 'https://www.themoviedb.org/person/5530-james-mcavoy'],
	},
	'christoph-waltz': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Christoph%20Waltz%20at%2082nd%20Venice%20International%20Film%20Festival-1%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q76819', 'https://www.imdb.com/name/nm0910607/', 'https://www.themoviedb.org/person/27319-christoph-waltz'],
	},
	'don-cheadle': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Don%20Cheadle%20at%20Jimmy%20Kimmel%20Live!%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q272019', 'https://www.imdb.com/name/nm0000332/', 'https://www.themoviedb.org/person/1896-don-cheadle'],
	},
	'jesse-eisenberg': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jesse%20Eisenberg%20by%20Philip%20Romano%20(3x4%20cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q219512', 'https://www.imdb.com/name/nm0251986/', 'https://www.themoviedb.org/person/44735-jesse-eisenberg'],
	},
	'woody-harrelson': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Woody%20Harrelson%20191020-N-NU281-1028%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q201279', 'https://www.imdb.com/name/nm0000437/', 'https://www.themoviedb.org/person/57755-woody-harrelson'],
	},
	'viggo-mortensen': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Viggo%20Mortensen%20B%20(2020).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q171363', 'https://www.imdb.com/name/nm0001557/', 'https://www.themoviedb.org/person/110-viggo-mortensen'],
	},
	'tom-hiddleston': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tom%20Hiddleston%20at%20the%202024%20Toronto%20International%20Film%20Festival%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q295803', 'https://www.imdb.com/name/nm1089991/', 'https://www.themoviedb.org/person/91606-tom-hiddleston'],
	},
	'brendan-gleeson': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Brendan%20Gleeson.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q206659', 'https://www.imdb.com/name/nm0322407/', 'https://www.themoviedb.org/person/2039-brendan-gleeson'],
	},
	'jesse-plemons': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jesse%20Plemons%20(20769593584).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q1138674', 'https://www.imdb.com/name/nm0687146/', 'https://www.themoviedb.org/person/88124-jesse-plemons'],
	},
	'colin-firth': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Colin%20Firth%20by%20Gage%20Skidmore.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q162492', 'https://www.imdb.com/name/nm0000147/', 'https://www.themoviedb.org/person/5472-colin-firth'],
	},
	'dustin-hoffman': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dustin%20Hoffman%20-%201968.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q42930', 'https://www.imdb.com/name/nm0000163/', 'https://www.themoviedb.org/person/4483-dustin-hoffman'],
	},
	'gene-hackman': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gene%20Hackman%20-%201972.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q150943', 'https://www.imdb.com/name/nm0000432/', 'https://www.themoviedb.org/person/193-gene-hackman'],
	},
	'antonio-banderas': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Antonio%20Banderas%202020.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q41548', 'https://www.imdb.com/name/nm0000104/', 'https://www.themoviedb.org/person/3131-antonio-banderas'],
	},
	'ben-kingsley': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ben%20Kingsley%20by%20Gage%20Skidmore.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q173158', 'https://www.imdb.com/name/nm0001426/', 'https://www.themoviedb.org/person/2282-ben-kingsley'],
	},
	'christopher-walken': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Christopher%20Walken%202018.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q185051', 'https://www.imdb.com/name/nm0000686/', 'https://www.themoviedb.org/person/4690-christopher-walken'],
	},
	'david-fincher': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/TheKillerBFILFF051023%20(8%20of%2022)%20(53255176376)%20(cropped2).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q184903', 'https://www.imdb.com/name/nm0000399/', 'https://www.themoviedb.org/person/7467-david-fincher'],
	},
	'ridley-scott': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ridley%20Scott%20At%20BFI%20-%20BFI%20Southbank%20-%20Saturday%204th%20October%202025.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q56005', 'https://www.imdb.com/name/nm0000631/', 'https://www.themoviedb.org/person/578-ridley-scott'],
	},
	'george-miller': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/George%20Miller%20(35706244922).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q446960', 'https://www.imdb.com/name/nm0004306/', 'https://www.themoviedb.org/person/20629-george-miller'],
	},
	'greta-gerwig': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Greta%20Gerwig.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q271967', 'https://www.imdb.com/name/nm1950086/', 'https://www.themoviedb.org/person/45400-greta-gerwig'],
	},
	'damien-chazelle': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Damien%20Chazelle%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q18350026', 'https://www.imdb.com/name/nm3227090/', 'https://www.themoviedb.org/person/136495-damien-chazelle'],
	},
	'yorgos-lanthimos': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yorgos%20Lanthimos%2C%20THE%20LOBSTER%2C%20Fantastic%20Fest%202015%20-9674%20(27161878820)%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q975410', 'https://www.imdb.com/name/nm0487166/'],
	},
	'matt-reeves': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/MattReeves.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q931613', 'https://www.imdb.com/name/nm0716257/', 'https://www.themoviedb.org/person/32278-matt-reeves'],
	},
	'chloe-zhao': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chloe%20Zhao.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q21078321', 'https://www.imdb.com/name/nm3144293/', 'https://www.themoviedb.org/person/1395183-chloe-zhao'],
	},
	'sam-mendes': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sam%20Mendes%20in%202022%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q223233', 'https://www.imdb.com/name/nm0005222/', 'https://www.themoviedb.org/person/39-sam-mendes'],
	},
	'robert-eggers': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Robert%20Eggers%20-%20The%20Witch%2CFantastic%20Fest%202015-1667%20(28894993650)%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q20826736', 'https://www.imdb.com/name/nm3211470/', 'https://www.themoviedb.org/person/138781-robert-eggers'],
	},
	'hector-alterio': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/H%C3%A9ctor%20Alterio%202023.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q2576722', 'https://www.imdb.com/name/nm0022765/', 'https://www.themoviedb.org/person/59136-hector-alterio'],
	},
	'luis-brandoni': {
		profileImage: '/people/luis-brandoni-2024.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q6700387', 'https://www.imdb.com/name/nm0104809/', 'https://www.themoviedb.org/person/74896-luis-brandoni'],
	},
	'oscar-martinez': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Goyas%202025%20-%20Oscar%20Mart%C3%ADnez%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q3357012', 'https://www.imdb.com/name/nm0553650/', 'https://www.themoviedb.org/person/1457004-oscar-martinez'],
	},
	'diego-peretti': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Diego%20Peretti%20en%20terapia.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q5274770', 'https://www.imdb.com/name/nm0673391/', 'https://www.themoviedb.org/person/96429-diego-peretti'],
	},
	'dario-grandinetti': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dar%C3%ADo%20Grandinetti%20(cropped%202).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q285022', 'https://www.imdb.com/name/nm0334882/', 'https://www.themoviedb.org/person/3618-dario-grandinetti'],
	},
	'nahuel-perez-biscayart': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nahuel%20P%C3%A9rez%20Biscayart%20-65369.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q2879350', 'https://www.imdb.com/name/nm1465580/', 'https://www.themoviedb.org/person/66957-nahuel-perez-biscayart'],
	},
	'daniel-fanego': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Daniel%20Fanego%20-%20Sonido%20Cultura%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q5798330', 'https://www.imdb.com/name/nm0266723/', 'https://www.themoviedb.org/person/140541-daniel-fanego'],
	},
	'julio-chavez': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Julio%20Ch%C3%A1vez%20en%202017%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q6309177', 'https://www.imdb.com/name/nm0154509/', 'https://www.themoviedb.org/person/583126-julio-chavez'],
	},
	'joaquin-furriel': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Festival%20de%20M%C3%A1laga%202024%20-%20Joaqu%C3%ADn%20Furriel%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q5931963', 'https://www.imdb.com/name/nm0299078/'],
	},
	'eduardo-blanco': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Premios%20Goya%202018%20-%20Eduardo%20Blanco.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q5340537', 'https://www.imdb.com/name/nm0087249/', 'https://www.themoviedb.org/person/132449-eduardo-blanco'],
	},
	'gaston-pauls': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Camara%20Diputados%20de%20Chile%20(10995516304).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q589361', 'https://www.imdb.com/name/nm0667282/', 'https://www.themoviedb.org/person/119671-gaston-pauls'],
	},
	'mauricio-dayub': {
		profileImage: 'https://media.themoviedb.org/t/p/w500/rYzuZ4OpRYbhFQIWeISzqyEkMKf.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q6006921', 'https://www.imdb.com/name/nm0206778/', 'https://www.themoviedb.org/person/115210-mauricio-dayub'],
	},
	'norma-aleandro': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Norma%20Aleandro%20-%20Festival%20Internacional%20de%20Cine%20de%20Mar%20del%20Plata%20(cropped).jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q240136', 'https://www.imdb.com/name/nm0001903/', 'https://www.themoviedb.org/person/46853-norma-aleandro'],
	},
	'graciela-borges': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Graciela%20Borges.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q1814181', 'https://www.imdb.com/name/nm0096559/', 'https://www.themoviedb.org/person/590943-graciela-borges'],
	},
	'martina-gusman': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Martina%20Gusman%20Cannes%202011.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q3295713', 'https://www.imdb.com/name/nm1089900/', 'https://www.themoviedb.org/person/84667-martina-gusman'],
	},
	'cecilia-dopazo': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cecilia%20Dopazo%202014.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q5759788', 'https://www.imdb.com/name/nm0233292/', 'https://www.themoviedb.org/person/109003-cecilia-dopazo'],
	},
	'julieta-diaz': {
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Julieta%20D%C3%ADaz%20-%20Presentaci%C3%B3n%20Coraz%C3%B3n%20de%20Le%C3%B3n.jpg?width=640',
		referenceUrls: ['https://www.wikidata.org/wiki/Q586715', 'https://www.imdb.com/name/nm0246638/', 'https://www.themoviedb.org/person/140542-julieta-diaz'],
	},
	'keegan-michael-key': {
		profileImage: '/people/keegan-michael-key-nm1221047.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q6382703', 'https://www.imdb.com/name/nm1221047/', 'https://www.themoviedb.org/person/298410-keegan-michael-key'],
	},
	'charlie-day': {
		profileImage: '/people/charlie-day-nm0206359.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q365915', 'https://www.imdb.com/name/nm0206359/', 'https://www.themoviedb.org/person/95101-charlie-day'],
	},
	'zazie-beetz': {
		profileImage: '/people/zazie-beetz-nm5939164.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q26997611', 'https://www.imdb.com/name/nm5939164/', 'https://www.themoviedb.org/person/1545693-zazie-beetz'],
	},
	'patricia-arquette': {
		profileImage: '/people/patricia-arquette-nm0000099.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q215976', 'https://www.imdb.com/name/nm0000099/', 'https://www.themoviedb.org/person/4687-patricia-arquette'],
	},
	'samara-weaving': {
		profileImage: '/people/samara-weaving-nm3034977.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q7408805', 'https://www.imdb.com/name/nm3034977/', 'https://www.themoviedb.org/person/1372369-samara-weaving'],
	},
	'kathryn-newton': {
		profileImage: '/people/kathryn-newton-nm1105980.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q165625', 'https://www.imdb.com/name/nm1105980/', 'https://www.themoviedb.org/person/221192-kathryn-newton'],
	},
	'adria-arjona': {
		profileImage: '/people/adria-arjona-nm5245722.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q18684239', 'https://www.imdb.com/name/nm5245722/', 'https://www.themoviedb.org/person/1371297-adria-arjona'],
	},
	'jack-quaid': {
		profileImage: '/people/jack-quaid-nm4425051.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q1139078', 'https://www.imdb.com/name/nm4425051/', 'https://www.themoviedb.org/person/1030513-jack-quaid'],
	},
	'cameron-diaz': {
		profileImage: '/people/cameron-diaz-nm0000139.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q44380', 'https://www.imdb.com/name/nm0000139/', 'https://www.themoviedb.org/person/6941-cameron-diaz'],
	},
	'toni-collette': {
		profileImage: '/people/toni-collette-nm0001057.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q229291', 'https://www.imdb.com/name/nm0001057/', 'https://www.themoviedb.org/person/3051-toni-collette'],
	},
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
	'brad-dourif': {
		profileImage: '/people/brad-dourif-nm0000374.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q329734', 'https://www.imdb.com/name/nm0000374/', 'https://www.themoviedb.org/person/1370-brad-dourif'],
	},
	'rupert-grint': {
		profileImage: '/people/rupert-grint-nm0342488.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q19190', 'https://www.imdb.com/name/nm0342488/', 'https://www.themoviedb.org/person/10989-rupert-grint'],
	},
	'mark-hamill': {
		profileImage: '/people/mark-hamill-nm0000434.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q210447', 'https://www.imdb.com/name/nm0000434/', 'https://www.themoviedb.org/person/2-mark-hamill'],
	},
	'arnold-schwarzenegger': {
		profileImage: '/people/arnold-schwarzenegger-nm0000216.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q2685', 'https://www.imdb.com/name/nm0000216/', 'https://www.themoviedb.org/person/1100-arnold-schwarzenegger'],
	},
	'carrie-fisher': {
		profileImage: '/people/carrie-fisher-nm0000402.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q108941', 'https://www.imdb.com/name/nm0000402/', 'https://www.themoviedb.org/person/4-carrie-fisher'],
	},
	'carrie-anne-moss': {
		profileImage: '/people/carrie-anne-moss-nm0005251.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q206890', 'https://www.imdb.com/name/nm0005251/', 'https://www.themoviedb.org/person/530-carrie-anne-moss'],
	},
	'christopher-reeve': {
		profileImage: '/people/christopher-reeve-nm0001659.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q174311', 'https://www.imdb.com/name/nm0001659/', 'https://www.themoviedb.org/person/20006-christopher-reeve'],
	},
	'courteney-cox': {
		profileImage: '/people/courteney-cox-nm0001073.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q58912', 'https://www.imdb.com/name/nm0001073/', 'https://www.themoviedb.org/person/14405-courteney-cox'],
	},
	'donald-pleasence': {
		profileImage: '/people/donald-pleasence-nm0000587.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q314914', 'https://www.imdb.com/name/nm0000587/', 'https://www.themoviedb.org/person/9221-donald-pleasence'],
	},
	'gal-gadot': {
		profileImage: '/people/gal-gadot-nm2933757.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q185654', 'https://www.imdb.com/name/nm2933757/'],
	},
	'geoffrey-rush': {
		profileImage: '/people/geoffrey-rush-nm0001691.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q166272', 'https://www.imdb.com/name/nm0001691/', 'https://www.themoviedb.org/person/118-geoffrey-rush'],
	},
	'henry-cavill': {
		profileImage: '/people/henry-cavill-nm0147147.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q295498', 'https://www.imdb.com/name/nm0147147/', 'https://www.themoviedb.org/person/73968-henry-cavill'],
	},
	'neve-campbell': {
		profileImage: '/people/neve-campbell-nm0000117.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q193482', 'https://www.imdb.com/name/nm0000117/', 'https://www.themoviedb.org/person/9206-neve-campbell'],
	},
	'robert-englund': {
		profileImage: '/people/robert-englund-nm0000387.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q310389', 'https://www.imdb.com/name/nm0000387/', 'https://www.themoviedb.org/person/5139-robert-englund'],
	},
	'ving-rhames': {
		profileImage: '/people/ving-rhames-nm0000609.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q310315', 'https://www.imdb.com/name/nm0000609/', 'https://www.themoviedb.org/person/10182-ving-rhames'],
	},
	'ed-harris': {
		profileImage: '/people/ed-harris-nm0000438.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q104791', 'https://www.imdb.com/name/nm0000438/', 'https://www.themoviedb.org/person/228-ed-harris'],
	},
	'gerard-butler': {
		profileImage: '/people/gerard-butler-nm0124930.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q169982', 'https://www.imdb.com/name/nm0124930/', 'https://www.themoviedb.org/person/17276-gerard-butler'],
	},
	'gwyneth-paltrow': {
		profileImage: '/people/gwyneth-paltrow-nm0000569.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q34460', 'https://www.imdb.com/name/nm0000569/', 'https://www.themoviedb.org/person/12052-gwyneth-paltrow'],
	},
	'jeff-goldblum': {
		profileImage: '/people/jeff-goldblum-nm0000156.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q106706', 'https://www.imdb.com/name/nm0000156/', 'https://www.themoviedb.org/person/4785-jeff-goldblum'],
	},
	'mel-gibson': {
		profileImage: '/people/mel-gibson-nm0000154.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q42229', 'https://www.imdb.com/name/nm0000154/', 'https://www.themoviedb.org/person/2461-mel-gibson'],
	},
	'paul-rudd': {
		profileImage: '/people/paul-rudd-nm0748620.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q276525', 'https://www.imdb.com/name/nm0748620/', 'https://www.themoviedb.org/person/22226-paul-rudd'],
	},
	'sam-worthington': {
		profileImage: '/people/sam-worthington-nm0941777.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q82085', 'https://www.imdb.com/name/nm0941777/', 'https://www.themoviedb.org/person/65731-sam-worthington'],
	},
	'uma-thurman': {
		profileImage: '/people/uma-thurman-nm0000235.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q125017', 'https://www.imdb.com/name/nm0000235/', 'https://www.themoviedb.org/person/139-uma-thurman'],
	},
	'bryce-dallas-howard': {
		profileImage: '/people/bryce-dallas-howard-nm0397171.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q229775', 'https://www.imdb.com/name/nm0397171/', 'https://www.themoviedb.org/person/18997-bryce-dallas-howard'],
	},
	'chris-pine': {
		profileImage: '/people/chris-pine-nm1517976.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q23466', 'https://www.imdb.com/name/nm1517976/', 'https://www.themoviedb.org/person/62064-chris-pine'],
	},
	'christopher-lloyd': {
		profileImage: '/people/christopher-lloyd-nm0000502.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q109324', 'https://www.imdb.com/name/nm0000502/', 'https://www.themoviedb.org/person/1062-christopher-lloyd'],
	},
	'david-arquette': {
		profileImage: '/people/david-arquette-nm0000274.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q294185', 'https://www.imdb.com/name/nm0000274/', 'https://www.themoviedb.org/person/15234-david-arquette'],
	},
	'evangeline-lilly': {
		profileImage: '/people/evangeline-lilly-nm1431940.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q160392', 'https://www.imdb.com/name/nm1431940/', 'https://www.themoviedb.org/person/19034-evangeline-lilly'],
	},
	'james-franco': {
		profileImage: '/people/james-franco-nm0290556.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q306403', 'https://www.imdb.com/name/nm0290556/', 'https://www.themoviedb.org/person/17051-james-franco'],
	},
	'jason-bateman': {
		profileImage: '/people/jason-bateman-nm0000867.png',
		referenceUrls: ['https://www.wikidata.org/wiki/Q284636', 'https://www.imdb.com/name/nm0000867/', 'https://www.themoviedb.org/person/23532-jason-bateman'],
	},
	'linda-hamilton': {
		profileImage: '/people/linda-hamilton-nm0000157.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q208214', 'https://www.imdb.com/name/nm0000157/', 'https://www.themoviedb.org/person/2713-linda-hamilton'],
	},
	'marlon-brando': {
		profileImage: '/people/marlon-brando-nm0000008.png',
		referenceUrls: ['https://www.wikidata.org/wiki/Q34012', 'https://www.imdb.com/name/nm0000008/', 'https://www.themoviedb.org/person/3084-marlon-brando'],
	},
	'michael-j-fox': {
		profileImage: '/people/michael-j-fox-nm0000150.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q395274', 'https://www.imdb.com/name/nm0000150/', 'https://www.themoviedb.org/person/521-michael-j-fox'],
	},
	'orlando-bloom': {
		profileImage: '/people/orlando-bloom-nm0089217.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q44467', 'https://www.imdb.com/name/nm0089217/', 'https://www.themoviedb.org/person/114-orlando-bloom'],
	},
	'patrick-stewart': {
		profileImage: '/people/patrick-stewart-nm0001772.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q16296', 'https://www.imdb.com/name/nm0001772/', 'https://www.themoviedb.org/person/2387-patrick-stewart'],
	},
	'paul-walker': {
		profileImage: '/people/paul-walker-nm0908094.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q213864', 'https://www.imdb.com/name/nm0908094/', 'https://www.themoviedb.org/person/8167-paul-walker'],
	},
	'tessa-thompson': {
		profileImage: '/people/tessa-thompson-nm1935086.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q271500', 'https://www.imdb.com/name/nm1935086/', 'https://www.themoviedb.org/person/62561-tessa-thompson'],
	},
	'tommy-lee-jones': {
		profileImage: '/people/tommy-lee-jones-nm0000169.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q170587', 'https://www.imdb.com/name/nm0000169/', 'https://www.themoviedb.org/person/2176-tommy-lee-jones'],
	},
	'vin-diesel': {
		profileImage: '/people/vin-diesel-nm0004874.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q178166', 'https://www.imdb.com/name/nm0004874/', 'https://www.themoviedb.org/person/12835-vin-diesel'],
	},
	'wesley-snipes': {
		profileImage: '/people/wesley-snipes-nm0000648.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q189694', 'https://www.imdb.com/name/nm0000648/', 'https://www.themoviedb.org/person/10814-wesley-snipes'],
	},
	'anthony-mackie': {
		profileImage: '/people/anthony-mackie-nm1107001.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q511554', 'https://www.imdb.com/name/nm1107001/', 'https://www.themoviedb.org/person/53650-anthony-mackie'],
	},
	'andy-serkis': {
		profileImage: '/people/andy-serkis-nm0785227.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q206922', 'https://www.imdb.com/name/nm0785227/', 'https://www.themoviedb.org/person/1333-andy-serkis'],
	},
	'jodie-comer': {
		profileImage: '/people/jodie-comer-nm3069650.jpeg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q16567346', 'https://www.imdb.com/name/nm3069650/', 'https://www.themoviedb.org/person/1388593-jodie-comer'],
	},
	'penelope-cruz': {
		profileImage: '/people/penelope-cruz-nm0004851.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q39666', 'https://www.imdb.com/name/nm0004851/', 'https://www.themoviedb.org/person/955-penelope-cruz'],
	},
	'michael-caine': {
		profileImage: '/people/michael-caine-nm0000323.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q123351', 'https://www.imdb.com/name/nm0000323/', 'https://www.themoviedb.org/person/3895-michael-caine'],
	},
	'michael-shannon': {
		profileImage: '/people/michael-shannon-nm0788335.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q41449', 'https://www.imdb.com/name/nm0788335/', 'https://www.themoviedb.org/person/335-michael-shannon'],
	},
	'jennifer-garner': {
		profileImage: '/people/jennifer-garner-nm0004950.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q172044', 'https://www.imdb.com/name/nm0004950/', 'https://www.themoviedb.org/person/9278-jennifer-garner'],
	},
	'jeremy-renner': {
		profileImage: '/people/jeremy-renner-nm0719637.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q23365', 'https://www.imdb.com/name/nm0719637/', 'https://www.themoviedb.org/person/17604-jeremy-renner'],
	},
	'melissa-barrera': {
		profileImage: '/people/melissa-barrera-nm4574440.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q20810462', 'https://www.imdb.com/name/nm4574440/', 'https://www.themoviedb.org/person/1373659-melissa-barrera'],
	},
	'alberto-ammann': {
		profileImage: '/people/alberto-ammann-nm2975962.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q2595437', 'https://www.imdb.com/name/nm2975962/', 'https://www.themoviedb.org/person/110424-alberto-ammann'],
	},
	'luis-ziembrowski': {
		profileImage: '/people/luis-ziembrowski-nm0956249.jpg',
		referenceUrls: ['https://www.wikidata.org/wiki/Q5984494', 'https://www.imdb.com/name/nm0956249/', 'https://www.themoviedb.org/person/1028444-luis-ziembrowski'],
	},
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
	const fallbackMeta = bulkProfileReferenceUrls[seed.slug];
	const fallbackProfileImage =
		fallbackMeta && typeof fallbackMeta === 'object' && !Array.isArray(fallbackMeta)
			? fallbackMeta.profileImage
			: undefined;
	const fallbackReferenceUrls = Array.isArray(fallbackMeta)
		? fallbackMeta
		: fallbackMeta && typeof fallbackMeta === 'object'
			? fallbackMeta.referenceUrls
			: undefined;

	return {
		...seed,
		profileImage: seed.profileImage ?? fallbackProfileImage ?? bulkProfileImageUrls[seed.slug],
		roles: defaults.roles,
		stats: defaults.stats.map((stat) => ({ ...stat })),
		referenceUrls: mergeReferenceUrls(seed.referenceUrls, fallbackReferenceUrls),
	};
}

/**
 * @param {{ roles: string[]; stats: { label: string; value: string }[] }} defaults
 * @param {Array<Record<string, unknown> & { slug: string }>} seeds
 */
function buildBulkProfiles(defaults, seeds) {
	return Object.fromEntries(seeds.map((seed) => [seed.slug, buildBulkProfile(defaults, seed)]));
}

function getCatalogBackedProfileMeta(slug) {
	return catalogBackedProfileMeta[slug];
}

function buildCatalogBackedBiography(name, roleLabel, spotlight, knownFor) {
	const connectionLabel =
		knownFor.length > 1 ? 'a varios titulos fuertes del catalogo' : 'a un titulo fuerte del catalogo';

	return [
		`${name} mantiene una carrera muy visible y un peso real dentro de la conversacion cinematografica que el sitio ya cubre. Como ${roleLabel}, sigue funcionando como referencia inmediata cuando se mezclan prestigio, industria y reconocimiento popular.`,
		`${spotlight} En Cine Posta aparece conectado ${connectionLabel}, asi que su ficha exclusiva ordena mejor busquedas, enlaces de reparto y navegacion editorial.`,
	];
}

function buildCatalogBackedProfile(defaults, seed) {
	const profileMeta = getCatalogBackedProfileMeta(seed.slug);
	const fallbackMeta = bulkProfileReferenceUrls[seed.slug];
	const fallbackProfileImage =
		fallbackMeta && typeof fallbackMeta === 'object' && !Array.isArray(fallbackMeta)
			? fallbackMeta.profileImage
			: undefined;
	const fallbackReferenceUrls = Array.isArray(fallbackMeta)
		? fallbackMeta
		: fallbackMeta && typeof fallbackMeta === 'object'
			? fallbackMeta.referenceUrls
			: undefined;
	const roleLabel = defaults.roles.includes('Director')
		? 'director'
		: defaults.roles.includes('Actriz')
			? 'actriz'
			: 'actor';
	const spotlight =
		seed.spotlight ??
		'Su nombre sigue funcionando como una referencia inmediata para el tipo de cine con el que el catalogo ya lo conecta.';

	return {
		...seed,
		profileImage: seed.profileImage ?? profileMeta?.profileImage ?? fallbackProfileImage ?? bulkProfileImageUrls[seed.slug],
		roles: defaults.roles,
		spotlight,
		biography: seed.biography ?? buildCatalogBackedBiography(seed.name, roleLabel, spotlight, seed.knownFor ?? []),
		stats: defaults.stats.map((stat) => ({ ...stat })),
		referenceUrls: mergeReferenceUrls(
			seed.referenceUrls,
			mergeReferenceUrls(profileMeta?.referenceUrls, fallbackReferenceUrls),
		),
	};
}

function buildCatalogBackedProfiles(defaults, seeds) {
	return Object.fromEntries(seeds.map((seed) => [seed.slug, buildCatalogBackedProfile(defaults, seed)]));
}

const personProfileEditorialOverrides = {
	/* __PERSON_PROFILE_EDITORIAL_OVERRIDES_START__ */
	'aaron-taylor-johnson': {
		biography: [
			'Aaron Perry Taylor-Johnson (High Wycombe, Buckinghamshire, Inglaterra, 13 de junio de 1990) es un actor, guionista y productor británico. Es más conocido por su interpretación del personaje Dave Lizewski / Kick-Ass en la película homónima Kick-Ass (2010) y su secuela Kick-Ass 2 (2013), y del personaje Pietro Maximoff / Quicksilver en Vengadores: La era de Ultrón (2015).',
			'Johnson comenzó a actuar de niño y apareció en películas como Shanghai Knights (2003), El ilusionista (2006) y Angus, tangas y besos perfectos (2008).',
			'Su interpretación de John Lennon en la película biográfica Nowhere Boy (2009), dirigida por Sam Taylor-Johnson, con quien se casó en 2012, cosechó muy buenas críticas en su carrera.'
		],
	},
	'adam-driver': {
		biography: [
			'Adam Douglas Driver (San Diego, 19 de noviembre de 1983) es un marine retirado, cantante ocasional y actor estadounidense. Es internacionalmente conocido por sus papeles como Adam Sackler en la exitosa serie de televisión de HBO Girls y como Kylo Ren, el villano principal, en la nueva saga (apareciendo en 3 de ellas episodios: VII, VIII, IX) de ciencia ficción Star Wars.',
			'En Cine Posta aparece ligado a Megalopolis y Star Wars: The Last Jedi, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'adria-arjona': {
		biography: [
			'Adria Arjona Torres (Puerto Rico, 25 de abril de 1992) es una actriz puertorriqueña.',
			'Es más conocida por sus papeles en las series de televisión True Detective, Person of Interest y Good Omens, en la que interpreta a Anathema Device, basada en el personaje de la novela Buenos presagios, de Neil Gaiman y Terry Pratchett.',
			'En 2022 interpretó a Bix Caleen en la serie Andor de Disney+.'
		],
	},
	'adrien-brody': {
		biography: [
			'Adrien Nicholas Brody (Newhaven, Nueva York, 14 de abril de 1973), es un actor y productor estadounidense.',
			'Saltó a la fama en el año 2002, tras encarnar a Władysław Szpilman en la película El pianista, dirigida por Roman Polanski, por la cual obtuvo premio Óscar como mejor actor principal a los 29 años de edad.',
			'También es conocido por su papel como un sobreviviente del Holocausto que emigra a los Estados Unidos en The brutalist (2024) de Brady Corbet.'
		],
	},
	'alberto-ammann': {
		birthPlace: 'Córdoba, Argentina',
	},
	'america-ferrera': {
		biography: [
			'America Georgina Ferrera (Los Ángeles, 18 de abril de 1984) es una actriz, directora y productora estadounidense de padres hondureños. Ferrera desarrolló un interés en la actuación a una edad temprana, actuando en varias producciones teatrales en su escuela.',
			'Hizo su debut en el cine en 2002 con la comedia dramática Real Women Have Curves, ganando elogios por su actuación.',
			'Ferrera ha ganado un Premio Emmy, un Globo de Oro y un Premio del Sindicato de Actores, entre otros.'
		],
	},
	'amy-adams': {
		biography: [
			'Amy Lou Adams (Vicenza, 20 de agosto de 1974) es una actriz estadounidense, conocida por sus actuaciones tanto cómicas como dramáticas.',
			'Se formó para ser bailarina, pero a los 18 años encontró que el teatro musical encajaba mejor, y desde 1994 hasta 1998 trabajó en restaurantes de teatro en vivo.',
			'Sus reconocimientos incluyen, entre otros, dos Globos de Oro, un Premio del Sindicato de Actores, cinco Premios de la Crítica Cinematográfica y un premio Indepedent Spirit, además de seis nominaciones a los Premios de la Academia y siete a los Premios BAFTA.'
		],
	},
	'ana-de-armas': {
		biography: [
			'Ana Celia de Armas Caso (La Habana, 30 de abril de 1988) es una actriz cubana de origen español y nacionalizada estadounidense. Comenzó su carrera con 16 años en su país natal y pronto obtuvo un papel principal en el drama romántico hispanocubano Una rosa de Francia (2006).',
			'A la edad de 18 años, se mudó a Madrid y protagonizó series como la popular serie de suspenso El internado (2007-2010) y el drama histórico Hispania, la leyenda (2010-2012).',
			'Después de mudarse a Los Ángeles, De Armas tuvo papeles de habla inglesa en el thriller psicológico Knock Knock (2015), la comedia criminal War Dogs (2016), y tuvo un papel secundario en la película biográfica Manos de piedra (2016).'
		],
	},
	'andrew-garfield': {
		biography: [
			'Andrew Russell Garfield (Los Ángeles, California, 20 de agosto de 1983) es un actor y productor británicoestadonidense.',
			'Nacido en Los Ángeles y criado en Epsom, Inglaterra, Garfield se formó en la Royal Central School of Speech and Drama y comenzó su carrera en los escenarios del Reino Unido y en producciones televisivas.',
			'Conocido por interpretar a Spider-Man en la franquicia cinematográfica The Amazing Spider-Man, de Marc Webb.'
		],
	},
	'andy-serkis': {
		biography: [
			'Andrew Clement Serkis (Ruislip, Middlesex, Inglaterra, 20 de abril de 1964), conocido como Andy Serkis, es un actor, director de cine y escritor británico.',
			'Conocido por interpretar a personajes a través de la técnica de captura de movimiento, como Gollum en las trilogías cinematográficas de El Señor de los Anillos y El hobbit.',
			'Además del líder Supremo, Snoke, en Star Wars: Episodio VII - El despertar de la Fuerza, y Star Wars: Episodio VIII - Los últimos Jedi, y a César en la franquicia de El planeta de los simios.'
		],
	},
	'anthony-mackie': {
		biography: [
			'Anthony Dwane Mackie (Nueva Orleans, Luisiana; 23 de septiembre de 1978) es un actor estadounidense conocido por su papel como el sargento JT Sanborn en la película The Hurt Locker, ganadora en los Premios Oscar a la Mejor Película.',
			'Ha aparecido en otras películas y series de televisión, así como en los escenarios de Broadway.',
			'También es conocido por interpretar a Sam Wilson / Falcon en las películas del Universo cinematográfico de Marvel Captain America: The Winter Soldier (2014), Avengers: Age of Ultron (2015), Ant-Man (2015), Capitán América: Civil War (2016), Avengers: Infinity War (2018), Avengers: Endgame (2019) y recientemente al nuevo Capitán América en The Falcon and the Winter Soldier (2021) y Captain America: Brave New World (2025).'
		],
	},
	'antonio-banderas': {
		biography: [
			'José Antonio Domínguez Bandera (Málaga, 10 de agosto de 1960), conocido como Antonio Banderas, es un actor, director de cine, cantante, productor, guionista y empresario teatral español.',
			'Comenzó como actor en el teatro en España y, poco más tarde en el cine con una serie de películas de Pedro Almodóvar en la década de 1980.',
			'En 2003, Banderas debutó en el teatro de Estados Unidos en Nine, por lo que fue nominado para un Premio Tony y ganó un Premio Drama Desk.'
		],
	},
	'anya-taylor-joy': {
		biography: [
			'Anya-Josephine Marie Taylor-Joy (Miami, 16 de abril de 1996) es una actriz y modelo británica y estadounidense, nacida en Miami y criada entre Buenos Aires (Argentina) y Londres (Reino Unido). Ha recibido varios premios, incluido un Globo de Oro, un Premio del Sindicato de Actores y un Premio de la Crítica Televisiva, además de recibir nominaciones a los Premios BAFTA y a los Premios Primetime Emmy.',
			'En 2021, la revista Time la colocó en la lista «Los próximos 100 de Time». De madre inglesa y española y padre argentino de raíces escocesas, Taylor-Joy dejó la escuela a los dieciséis años y comenzó su carrera como actriz.',
			'Después de pequeños papeles en televisión, debutó en el cine con el papel principal de Thomasin en la película de terror La bruja (2015), que le valió un premio Gotham y un premio Empire.'
		],
	},
	'ariana-debose': {
		biography: [
			'Ariana DeBose (Raleigh, Carolina del Norte; 25 de enero de 1991) es una actriz, cantante y bailarina estadounidense.',
			'En 2022, la revista Time la nombró una de las 100 personas más influyentes del mundo. DeBose hizo su debut en televisión compitiendo en la sexta temporada de So You Think You Can Dance en 2009, donde terminó entre las 20 mejores.',
			'Conocida por sus actuaciones en el escenario y la pantalla, ha recibido múltiples elogios, incluido un Premio Óscar, un Premio BAFTA y un Globo de Oro.'
		],
	},
	'ariana-grande': {
		biography: [
			'Ariana Grande-Butera (Boca Ratón, Florida, 26 de junio de 1993) es una cantante, compositora, productora, empresaria y actriz estadounidense. Inició su carrera artística en Broadway a los 15 años, al participar en el musical 13 (2008).',
			'Alcanzó notoriedad al interpretar a Cat Valentine en las series de televisión de Nickelodeon Victorious (2010-2013) y Sam & Cat (2013-2014).',
			'En 2011, firmó con Republic Records, luego de que ejecutivos del sello descubrieran vídeos suyos interpretando versiones de canciones en YouTube.'
		],
	},
	'arnold-schwarzenegger': {
		biography: [
			'Arnold Alois Schwarzenegger (pronunciado /ˈanɔlt ˈaːlɔɪ̯s ˈʃvat͡səneːɡɐ/; Thal, Austria, 30 de julio de 1947) es un actor, empresario, político y exfísicoculturista profesional austriaco y estadounidense.',
			'Ejerció como trigésimo octavo gobernador del estado de California en dos mandatos desde 2003 hasta 2011. Schwarzenegger comenzó a entrenar con pesas cuando tenía quince años, ganó el título de Mr. Universo con veinte y luego encadenó siete victorias en la competición de Mister Olympia entre 1970 y 1980.',
			'Es ampliamente reconocido como uno de los fisicoculturistas más importantes de todos los tiempos y su embajador más carismático. Ganó fama mundial a partir de la década de 1980 como icono del cine de acción de Hollywood.'
		],
	},
	'austin-butler': {
		biography: [
			'Austin Robert Butler (Anaheim, California, 17 de agosto de 1991) es un actor, cantante y modelo estadounidense, conocido principalmente por interpretar a Elvis Presley en la película biográfica musical Elvis.',
			'Comenzó su carrera en televisión, primero en papeles en Disney Channel y Nickelodeon y luego en dramas para adolescentes, incluidas partes recurrentes en las series de The CW Life Unexpected (2010-2011) y Switched at Birth (2011-2012).',
			'Obtuvo reconocimiento por protagonizar The Carrie Diaries (2013-2014) y The Shannara Chronicles (2016-2017).'
		],
	},
	'awkwafina': {
		biography: [
			'Nora Lum (Nueva York, 2 de junio de 1988), conocida profesionalmente como Awkwafina, es una actriz y cantante estadounidense de ascendencia china y surcoreana.',
			'Sus apariciones en televisión incluyen producciones como Girl Code, Future Man y Saturday Night Live.',
			'Participó en las películas Ocean\'s 8 y Crazy Rich Asians (2018), además de protagonizar la cinta The Farewell (2019), por la cual ganó un Globo de Oro en 2020 como mejor actriz de comedia o musical.'
		],
	},
	'ayo-edebiri': {
		biography: [
			'Ayo Edebiri (Boston, Massachusetts, 3 de octubre de 1995) es una comediante, escritora, productora y actriz estadounidense.',
			'Edebiri es conocida por interpretar a Missy en Big Mouth (2020-presente) y por interpretar a Sídney en The Bear (2022-presente).',
			'Apareció en Up Next de Comedy Central y es coanfitriona del podcast Iconography con Olivia Craighead.'
		],
	},
	'barry-keoghan': {
		biography: [
			'Barry Keoghan (pronunciado /ˈkjoʊɡən/; n.',
			'Ha recibido varios reconocimientos, incluido un premio BAFTA, y ha sido nominado a un premio Óscar y dos premios Globo de Oro. Keoghan comenzó a actuar en 2011 y obtuvo reconocimiento en 2017 por sus papeles en Dunkerque (2017) y The Killing of a Sacred Deer (2017).',
			'Obtuvo elogios por sus actuaciones en la película policial irlandesa Calm with Horses (2019) y en la película de fantasía The Green Knight (2021).'
		],
	},
	'ben-affleck': {
		biography: [
			'Benjamin Géza Affleck-Boldt (Berkeley, 15 de agosto de 1972), conocido simplemente como Ben Affleck, es un actor, director, productor y guionista estadounidense.',
			'Apoyado por su madre, inició su carrera como actor infantil de documentales educativos y después apareciendo en varias películas dirigidas por Kevin Smith, entre estas Mallrats (1995) y Chasing Amy (1997).',
			'Comenzó a ganar notoriedad dentro de la industria del cine tras protagonizar y escribir el guion de Good Will Hunting (1997), película que obtuvo la aclamación crítica y le valió, entre otros premios, el Óscar al mejor guion original.'
		],
	},
	'ben-kingsley': {
		biography: [
			'Ben Kingsley (Scarborough, Yorkshire, Inglaterra, 31 de diciembre de 1943) es un actor británico de amplia trayectoria.',
			'También conocido por sus papeles en televisión, recibió cuatro nominaciones en los Primetime Emmy.',
			'Es ganador de un Premio Óscar, Globos de Oro y un BAFTA por su interpretación de Mahatma Gandhi en la película Gandhi de 1982.'
		],
	},
	'benedict-cumberbatch': {
		biography: [
			'Benedict Timothy Carlton Cumberbatch (Londres, 19 de julio de 1976), conocido como Benedict Cumberbatch, es un actor británico de televisión, teatro, cine y voz. Accedió a la fama con su interpretación de Stephen Hawking en la película televisiva Hawking (2004); posteriormente, interpretó el personaje de William Pitt en la película histórica Amazing Grace (2006), así como el rol del célebre detective Sherlock Holmes en una adaptación moderna del personaje de Arthur Conan Doyle, en la serie Sherlock (2010-2017), ambas producciones de la BBC.',
			'En noviembre de 2013, fue galardonado por el BAFTA Los Ángeles con un premio Britannia para el artista británico del año por «sus actuaciones magistrales en televisión, cine y teatro».',
			'En el 2015, recibió su primera nominación a un Óscar a mejor actor, por su papel en la película The Imitation Game.'
		],
	},
	'bong-joon-ho': {
		biography: [
			'Bong Joon-ho (Daegu, 14 de septiembre de 1969) es un director de cine y guionista surcoreano.',
			'Entre sus trabajos cinematográficos figuran Memorias de un asesino (2003), la película de monstruos The Host (2006), la película de ciencia ficción Snowpiercer (2013) y la ganadora del Óscar a Mejor Película, Parásitos (2019).',
			'En 2017, Metacritic lo clasificó en el puesto 13 de su lista de los 25 mejores directores de cine del siglo XXI. Sus películas presentan temas incómodos, humor negro y cambios repentinos de humor.'
		],
	},
	'brad-dourif': {
		biography: [
			'Bradford Claude «Brad» Dourif (Huntington, Virginia Occidental; 18 de marzo de 1950) es un actor estadounidense retirado (a excepción de su papel como Chucky) de cine y televisión, candidato a un premio Óscar y a un premio Emmy.',
			'Probablemente es más conocido por su papel en One Flew Over the Cuckoo\'s Nest, que le valió la citada candidatura al Óscar como mejor actor de reparto. También ha puesto su voz al personaje de Chucky en las películasChild\'s Play, ha interpretado a Lon Suder en Star Trek: Voyager, al doctor Gediman en Alien: resurrección y a Gríma Lengua de Serpiente en la adaptación cinematográfica de El Señor de los Anillos.',
			'También ha ganado un premio Saturn por El exorcista III y ha sido candidato a un premio Emmy por su papel en Deadwood.'
		],
	},
	'bradley-cooper': {
		biography: [
			'Bradley Charles Cooper (Filadelfia, 5 de enero de 1975) es un actor, actor de voz, director, productor, guionista, cantante y compositor estadounidense.',
			'Inspirado por su padre, comenzó a interesarse por la actuación a temprana edad, y continuó con sus estudios hasta el 2000, cuando obtuvo su máster en Bellas Artes en The New School, en Nueva York.',
			'Posteriormente, desempeñó papeles menores en numerosas películas y series de televisión, entre estas Alias y Wedding Crashers (2005). Cooper saltó a la fama con su papel en The Hangover (2009), que se convirtió en un éxito crítico y comercial, extendiéndose por dos secuelas igualmente exitosas lanzadas en 2011 y 2013. Su racha de filmes aclamados y taquilleros continuó con Silver Linings Playbook (2012), American Hustle (2013) y American Sniper (2014), con los cuales recibió nominaciones a los premios Óscar por su actuación. Asimismo, prestó su voz para dar vida al personaje de Rocket Raccoon en el Universo cinematográfico de Marvel. Además del cine, Cooper interpretó a Joseph Merrick en la obra de teatro El hombre elefante. En 2018, protagonizó, dirigió, produjo y escribió la película A Star Is Born, que también fue un éxito crítico y comercial, y le valió tres nominaciones a los Óscar. Su banda sonora, la cual grabó en conjunto con Lady Gaga, alcanzó la primera posición de los álbumes más vendidos en 21 países, además de haber sido el cuarto disco más vendido tanto del 2018 como del 2019, con 1.9 y 1.2 millones de copias, respectivamente. Cooper ha sido uno de los actores mejores pagados del cine desde 2013, y ha sido reconocido por la revista Time como una de las celebridades más influyentes. En sumatoria, todas sus películas totalizan una recaudación de más de $11.3 mil millones a nivel mundial, siendo uno de los diez actores más recaudadores de toda la historia del cine. Asimismo, Cooper ha ganado un BAFTA, cuatro Critics\' Choice y dos Grammys, además de haber obtenido ocho nominaciones al premios Óscar, cinco al Golden Globe y una al Tony. Por otra parte, Cooper ha sido un filántropo activo desde los inicios de su carrera y ha apoyado a fundaciones que combaten enfermedades como el cáncer y el alzheimer. Desde 2015 hasta 2019, mantuvo una relación con la modelo Irina Shayk, con quien tiene una hija.'
		],
	},
	'brady-corbet': {
		biography: [
			'Brady James Monson Corbet (Scottsdale, Arizona; 17 de agosto de 1988) es un actor y director de cine estadounidense.',
			'También interpretó a Derek Huxley en la serie de TV 24.',
			'Es conocido por haber interpretado a Mason Freeland en Thirteen, a Brian Lackey en Mysterious Skin y a Alan Tracy en Thunderbirds.'
		],
	},
	'brendan-fraser': {
		biography: [
			'Brendan James Fraser (Indianápolis, 3 de diciembre de 1968) es un actor canadoestadounidense ganador del premio Oscar en 2023 por su rol de Charlie en la cinta La ballena de Darren Aronofsky.',
			'Fraser es reconocido principalmente por sus interpretaciones en películas como Dioses y monstruos, George of the Jungle, la trilogía de La momia, The Mummy Returns y La momia: la tumba del emperador Dragón; The Quiet American, Crash, Al diablo con el diablo, Viaje al centro de la Tierra y La ballena.'
		],
	},
	'brendan-gleeson': {
		biography: [
			'Brendan Gleeson (Dublín, 29 de marzo de 1955) es un actor irlandés que ha trabajado en películas como Braveheart, The General, Gangs of New York, Troya, In Bruges y la saga de Harry Potter.',
			'Es padre del también actor Domhnall Gleeson.'
		],
	},
	'brian-tyree-henry': {
		biography: [
			'Brian Tyree Henry (Fayetteville, Carolina del Norte, Estados Unidos; 31 de marzo de 1982) es un actor estadounidense, es conocido por sus papeles en televisión que incluyen a Alfred "Paper Boi" Miles en Atlanta y Tavis Brown en Vice Principals.',
			'Henry también fue parte del reparto original de The Book of Mormon. En febrero de 2017, Henry apareció como invitado en la serie de NBC This is Us, en el episodio "Memphis" como el primo de William, por lo que fue nominado a un Premio Primetime Emmy. En 2021, interpretó a Phastos en la película Eternals de Marvel Studios.',
			'El personaje tuvo el primer beso homosexual de un superhéroe en el Universo cinematográfico de Marvel, al lado del actor Haaz Sleiman. Fue nominado al Premio Oscar en la categoría de mejor actor principal del año 2022 por su papel en la película "Causeway", la cual protagoniza junto a Jennifer Lawrence.'
		],
	},
	'brie-larson': {
		biography: [
			'Brianne Sidonie Desaulniers (Sacramento, 1 de octubre de 1989), más conocida como Brie Larson, es una actriz, cantante, directora, productora, guionista, modelo y youtuber estadounidense.',
			'Brie fue educada en su casa antes de estudiar interpretación en el American Conservatory Theater.',
			'Es ganadora, entre otros, del premio Óscar, Globo de Oro, SAG y BAFTA a la mejor actriz, además de un premio Primetime Emmy como productora.'
		],
	},
	'bryce-dallas-howard': {
		biography: [
			'Bryce Dallas Howard (Los Ángeles, 2 de marzo de 1981) es una actriz, guionista y directora estadounidense.',
			'Howard asistió a la Tisch School of the Arts de la Universidad de Nueva York; yéndose inicialmente en 2002 para asumir papeles en Broadway, pero se graduó oficialmente en 2020.',
			'Su primer papel cinematográfico fue en Parenthood de 1989, dirigida por su padre Ron Howard.'
		],
	},
	'cailee-spaeny': {
		biography: [
			'Cailee Spaeny (Springfield, Misuri; 24 de julio de 1998) es una actriz y cantante estadounidense. Es conocida principalmente por haber interpretado a Priscilla Presley en la película autobiográfica Priscilla (2023) y a Rain Carradine en Alien: Romulus (2024).',
			'En Cine Posta aparece ligado a Alien: Romulus y Civil War, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'caitriona-balfe': {
		biography: [
			'Caitríona Mary Balfe (Dublín, 4 de octubre de 1979) es una actriz y modelo irlandesa, más conocida por interpretar a Claire Fraser en la serie Outlander.',
			'En Cine Posta aparece ligado a Belfast y The Amateur, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'cameron-diaz': {
		biography: [
			'Cameron Michelle Diaz (San Diego, California, 30 de agosto de 1972) es una actriz y modelo estadounidense.',
			'Saltó a la fama en la década de 1990 por sus papeles en películas como La Máscara (1994), La boda de mi mejor amigo (1997) y Algo pasa con Mary (1998).',
			'Otras películas por las que es conocida son Los ángeles de Charlie (2000) y su secuela Los ángeles de Charlie: Al límite (2003), por darle voz a la Princesa Fiona en la franquicia de Shrek (2001-2010), The Holiday (2006), Algo pasa en Las Vegas (2008), Knight & Day (2010), The Green Hornet (2011), Bad Teacher (2011), The Other Woman (2014) y Annie (2014).'
		],
	},
	'carrie-anne-moss': {
		biography: [
			'Carrie-Anne Moss (Burnaby, Columbia Británica; 21 de agosto de 1967) es una actriz canadiense que consiguió fama mundial tras sus apariciones en la saga The Matrix como Trinity.',
			'En Cine Posta aparece ligado a The Matrix, The Matrix Reloaded y The Matrix Revolutions, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'carrie-fisher': {
		biography: [
			'Carrie Frances Fisher (Burbank, California, 21 de octubre de 1956-Los Ángeles, 27 de diciembre de 2016), más conocida como Carrie Fisher, fue una actriz, cantante, novelista, escritora y guionista script doctor estadounidense de cine y televisión. Es conocida por interpretar a la Princesa Leia Organa en las películas de Star Wars (1977-2019), papel por el que fue nominada a cuatro Premios Saturn.',
			'Sus otros créditos cinematográficos incluyen Shampoo (1975), The Blues Brothers (1980), Hannah and Her Sisters (1986), The \'Burbs (1989), When Harry Met Sally... (1989), Soapdish (1991) y The Women (2008). Fisher fue nominada dos veces al Premio Primetime Emmy a la mejor actriz invitada en una serie de comedia por sus actuaciones en las series de televisión 30 Rock y Catastrophe.',
			'Fue nombrada póstumamente una Leyenda de Disney en 2017, y en 2018 recibió un Premio Grammy póstumo al mejor álbum hablado.'
		],
	},
	'cecilia-dopazo': {
		birthPlace: 'Argentina',
	},
	'charlie-day': {
		biography: [
			'Charles Peckham "Charlie" Day (Nueva York, 9 de febrero de 1976) es un actor, director, guionista y escritor estadounidense. Es conocido por su papel en Horrible Bosses y en la serie It\'s Always Sunny in Philadelphia, donde conoció a su esposa.',
			'En 2011, fue nominado a los premios Critics\' Choice Television y Satellite por este papel. En 2020, cocreó la serie de comedia Mythic Quest, de Apple TV+.'
		],
	},
	'chino-darin': {
		biography: [
			'Ricardo Mario Darín (San Nicolás de los Arroyos, provincia de Buenos Aires, 14 de enero de 1989), conocido artísticamente como Chino Darín, es un actor, productor de cine y presentador de televisión argentino, hijo de Ricardo Darín.',
			'En Cine Posta aparece ligado a La odisea de los giles y El Ángel, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'chiwetel-ejiofor': {
		biography: [
			'Chiwetel Umeadi Ejiofor (Londres, 10 de julio de 1977) es un actor y director británico con una larga trayectoria tanto en cine y televisión como en teatro.',
			'Estuvo nominado al Óscar por su interpretación en la película 12 años de esclavitud (2013).'
		],
	},
	'chloe-zhao': {
		biography: [
			'Zhao Ting (Pekín, 31 de marzo de 1982), más conocida cómo Chloé Zhao, es una directora, productora y guionista china.',
			'Obtuvo un gran reconocimiento por su trabajo en el aclamado filme Nomadland (2020), por el cual recibió el premio a la mejor película y mejor dirección en la 93.ª entrega de los Premios Óscar, convirtiéndose en la segunda mujer en ganarlo. Adicionalmente ha ganado, entre otros, dos Premios BAFTA, dos Globos de Oro, un Premio del Sindicato de Directores y tres Premios de la Crítica Cinematográfica. También, destacan sus trabajos para el Universo Cinematográfico de Marvel con la película de superhéroes Eternals (2021), y la película dramática Hamnet (2025) con la que recibió de nuevo elogios de la crítica y tres nominaciones en la 98.ª edición de los Premios Óscar. En diciembre de 2024, fue incluida en la lista de la BBC 100 Women.'
		],
	},
	'chris-evans': {
		biography: [
			'Christopher Robert Evans (Boston, 13 de junio de 1981), conocido simplemente como Chris Evans, es un actor, actor de voz, director y productor de cine estadounidense.',
			'Criado en el pueblo de Sudbury, mostró interés a temprana edad por la actuación y se mudó a Nueva York para estudiar teatro después de terminar la secundaria.',
			'Debutó como actor en 1997 al aparecer en un cortometraje educativo y años más tarde, en el 2000, protagonizó la serie Opposite Sex.'
		],
	},
	'chris-hemsworth': {
		biography: [
			'Christopher Hemsworth (Melbourne, 11 de agosto de 1983) es un actor, actor de voz y productor australiano.',
			'Criado en la comunidad de Bulman, al norte de Australia, mostró interés por la actuación motivado por su hermano mayor e inició su carrera en 2002 con apariciones menores en series de televisión de su país.',
			'Posteriormente, se mudó a Sídney para conseguir mejores oportunidades y logró reconocimiento tras unirse al elenco principal de Home and Away, serie para la que grabó 189 episodios en cuestión de tres años.'
		],
	},
	'chris-pine': {
		biography: [
			'Christopher Whitelaw Pine (Los Ángeles, California, 26 de agosto de 1980), más conocido como Chris Pine, es un actor y modelo estadounidense, famoso por interpretar a James T.',
			'Kirk en la saga reboot de Star Trek y a Jake Hardin en Just My Luck.'
		],
	},
	'chris-pratt': {
		biography: [
			'Christopher Michael Pratt (Virginia, 21 de junio de 1979), conocido simplemente como Chris Pratt, es un actor, actor de voz y productor estadounidense.',
			'Aunque nació en Virginia, creció en la ciudad de Lake Stevens (Washington) y tras terminar la secundaria en 1997, abandonó sus estudios universitarios para mudarse a Maui (Hawái), donde fue descubierto por la actriz Rae Dawn Chong mientras trabajaba como camarero en un restaurante de Bubba Gump Shrimp Company.',
			'C., pero destacó principalmente por su papel como Andy Dwyer en la comedia Parks and Recreation.'
		],
	},
	'christoph-waltz': {
		biography: [
			'Christoph Waltz (Viena, 4 de octubre de 1956) es un actor austriacoalemán nacionalizado estadounidense, que obtuvo reconocimiento internacional por sus interpretaciones de villanos en el cine.',
			'Tras una carrera considerable en la televisión y el teatro alemán, el papel que le catapultó al éxito en Estados Unidos fue en la película de Quentin Tarantino de 2009, Malditos Bastardos, donde interpretó a Hans Landa, por el que recibió el Premio Óscar al Mejor Actor de Reparto y el Premio al Mejor Actor del Festival de Cine de Cannes.',
			'Entre sus premios se incluyen dos Premios Óscar, dos Globos de Oro, dos Premios BAFTA, dos Premios del Sindicato de Actores de Cine, dos Premios de la Crítica de Cine y una nominación a un Premio Emmy.'
		],
	},
	'christopher-lloyd': {
		biography: [
			'Christopher Allen Lloyd (Stamford, Connecticut, 22 de octubre de 1938) es un actor estadounidense.',
			'También ha desarrollado su carrera en televisión, ganando dos Premios Primetime Emmy por su papel de Jim Ignatowski en la serie Taxi (1978-1983).',
			'Ha interpretado a Doc Emmett Brown en la trilogía de Back to the Future (1985, 1989 y 1990), a Fester Addams en The Addams Family (1991) y Addams Family Values (1993), y al Juez Doom en ¿Quién engañó a Roger Rabbit? (1988).'
		],
	},
	'christopher-mcquarrie': {
		biography: [
			'Christopher McQuarrie (Princeton, Nueva Jersey, 25 de octubre de 1968) es un guionista, director y productor estadounidense.',
			'También creó la serie Persons Unknown.',
			'McQuarrie ganó el premio Óscar al mejor guion original por The Usual Suspects.'
		],
	},
	'christopher-reeve': {
		biography: [
			'Christopher D\'Olier Reeve (Nueva York, 25 de septiembre de 1952-Mount Kisco, 10 de octubre de 2004) fue un actor, director de cine y activista estadounidense.',
			'Adquirió fama mundial como actor al interpretar a Superman en la película de acción real y sus tres secuelas, y también es recordado por su personaje de Richard Collier en la película Somewhere in Time.'
		],
	},
	'christopher-walken': {
		biography: [
			'Ronald Walken (Nueva York, 31 de marzo de 1943), conocido artísticamente como Christopher Walken, es un actor de cine y teatro estadounidense. Ha participado en más de cien películas y programas de televisión, entre ellos Annie Hall, The Deer Hunter, Sleepy Hollow, Brainstorm, The Dead Zone, A View to a Kill, At Close Range, El rey de Nueva York, Batman Returns, True Romance, Atrápame si puedes, Pulp Fiction, Envy, Wedding Crashers, Click, Hairspray, Things to Do in Denver When You\'re Dead y Seven Psychopaths, además de aparecer en videos musicales de Madonna, Journey y Fatboy Slim.',
			'Walken debutó como director y guionista con el cortometraje Popcorn Shrimp de 2001.',
			'Sus películas han recaudado más de 1800 millones de dólares en Estados Unidos. Además, ha protagonizado las obras de William Shakespeare: Hamlet, Macbeth, Romeo y Julieta y Coriolano.'
		],
	},
	'cillian-murphy': {
		biography: [
			'/ˈkɪliən/ Cork, 25 de mayo de 1976) es un actor, actor de voz, músico y productor irlandés.',
			'Comenzó a mostrar interés por la música desde temprana edad y con diez años ya había compuesto varias canciones.',
			'Tras ello, empezó a estudiar derecho en la Universidad Colegio Cork, donde fue cobrando interés por la actuación tras ver y protagonizar varias de sus obras de teatro.'
		],
	},
	'colin-farrell': {
		biography: [
			'Colin James Farrell (Castleknock, Dublín, 31 de mayo de 1976) es un actor irlandés.',
			'Farrell comenzó a actuar en la serie dramática de la BBC Ballykissangel (1998) e hizo su debut cinematográfico en el drama The War Zone (1999).',
			'Protagonista de éxitos de taquilla y películas independientes desde la década de 2000, ha recibido varios premios y nominaciones, incluidos dos Globos de Oro y una nominación a un Premio de la Academia.'
		],
	},
	'colin-firth': {
		biography: [
			'Colin Andrew Firth (Hampshire; 10 de septiembre de 1960) es un actor y productor británico.',
			'En televisión, fue nominado a los Premios Emmy por su papel del Dr. Wilhelm Stuckart en la película de la BBC Conspiracy (2001), y por su interpretación de Michael Peterson en la miniserie de HBO The Staircase (2022).',
			'Ha recibido numerosos reconocimientos, incluyendo un Premio Óscar, dos Premios BAFTA y un Premio Globo de Oro, así como nominaciones a dos Premios Primetime Emmy.'
		],
	},
	'colman-domingo': {
		biography: [
			'Colman Jason Domingo (Filadelfia, 28 de noviembre de 1969) es un actor, director de escena y dramaturgo estadounidense. Ganador de un Premio Primetime Emmy y nominado a los Premios Óscar y a los Premios Tony, en 2024 fue incluido en la prestigiosa lista de la revista Time 100 como una de las 100 personas más influyentes del mundo. Domingo comenzó en Broadway en la obra de teatro de 2005, Well y se consagró con el musical de 2008, Passing Strange.',
			'En televisión, comenzó como invitado en la serie, Law & Order, aunque sería su papel de Victor Strand en la serie Fear The Walking Dead (2015-2023), de AMC, el que le llevaría al reconocimiento. Las apariciones cinematográficas de Domingo incluyen papeles secundarios en Lincoln (2012), Selma (2014), If Beale Street Could Talk (2018), Ma Rainey\'s Black Bottom (2020) o The Color Purple (2023).',
			'Obtuvo elogios por su papel de Mr. Bones en el musical: The Scottsboro Boys (2011), por el que fue nominado al premio Tony al mejor actor destacado en un musical.'
		],
	},
	'coralie-fargeat': {
		biography: [
			'Coralie Fargeat (París, 24 de noviembre de 1976) es una directora de cine y guionista francesa.',
			'Es conocida por su primer largometraje Revenge de 2017, por la que recibió premios en festivales de cine independientes, como en el Festival de Sitges, Monster Fest, el Festival Internacional de Cine Fantástico de Bucheon, el Festival Internacional de Cine de Calgary y el Festival Internacional de Cine de Cleveland. Fargeat estrenó su segunda película, The Substance, en el Festival de Cannes 2024, donde ganó el premio a mejor guion.'
		],
	},
	'courteney-cox': {
		biography: [
			'Courteney Bass Cox (Birmingham, Alabama, 15 de junio de 1964) es una actriz, modelo, productora de televisión y directora de cine estadounidense, célebre por su interpretación de Monica Geller en la popular serie de televisión Friends y por interpretar a Gale Weathers en la saga de películas de Scream.',
			'Ganadora de un Premio del Sindicato de Actores y nominada a un Premio Globo de Oro como mejor actriz por la serie televisiva, Cougar Town en 2010.',
			'Gracias a la buena acogida de crítica y público, recibió su primera nominación al premio Emmy al mejor programa de variedades. En 2023, recibió una estrella en el Paseo de la Fama de Hollywood. Cox es socia creadora de la productora audiovisual, Coquette Productions, fundada junto a su exmarido, David Arquette, en 2004. Hizo su debut como directora en el telefilme, TalhotBlond (2012).'
		],
	},
	'cynthia-erivo': {
		biography: [
			'Cynthia Chinasaokwu Onyedinmanasu Owezuke Amarachukwu Echimino Erivo (Stockwell, 8 de enero de 1987), conocida como Cynthia Erivo, es una actriz y cantante británica.',
			'Reconocida por su trabajo en el teatro y el cine, ha recibido múltiples premios y forma parte del grupo de artistas nominados a los Emmy, Grammy, Óscar y Tony (EGOT), entre otros.',
			'Debutó en el West End con el musical Los paraguas de Cherburgo (2011) y más tarde en Broadway con el papel de Celie en la reposición de The Color Purple (2015-2017).'
		],
	},
	'daisy-edgar-jones': {
		biography: [
			'Daisy Jessica Edgar-Jones (Londres, 24 de mayo de 1998) es una actriz inglesa.',
			'Comenzó su carrera con las series de televisión Cold Feet (2016–2020) y War of the Worlds (2019–2021).',
			'Obtuvo reconocimiento por su papel protagónico en la miniserie dramática romántica Normal People (2020), producida por BBC y Hulu, que le valió nominaciones a un Premio de Televisión de la Academia Británica y a un Globo de Oro.'
		],
	},
	'damien-chazelle': {
		biography: [
			'Damien Sayre Chazelle (Providence, Rhode Island, 19 de enero de 1985) es un director, guionista y productor de cine estadounidense y francés.',
			'Dirigió y escribió Whiplash y La La Land, estrenadas en 2014 y 2016, así como First Man en 2018 y Babylon en 2022.',
			'Whiplash obtuvo tres premios Óscar entre cinco nominaciones, y La La Land recibió siete Globos de Oro, el mayor número otorgado a una película desde la creación del certamen, así como seis premios Óscar entre 14 nominaciones.'
		],
	},
	'daniel-craig': {
		biography: [
			'Daniel Wroughton Craig (Chester, Inglaterra, 2 de marzo de 1968), conocido como Daniel Craig, es un actor británico de cine, teatro y televisión.',
			'El papel de Bond lo ha elevado a nivel de estrella internacional: a pesar de que inicialmente fue recibido con escepticismo por los seguidores más fieles a Bond, se ha convertido en uno de los actores más aclamados, cuya interpretación hasta le ha válido a una nominación al premio BAFTA, convirtiéndose en uno de los actores con más ganancias de la industria cinematográfica. Reconocido por sus papeles en películas de acción y aventuras, Craig es instruido en la compañía británica National Youth Theatre y se gradúa en la Guildhall School of Music and Drama, de música e interpretación de Londres, donde inició su carrera en el escenario.',
			'Debe su notoriedad especialmente por ser el sexto actor en encarnar en el cine al personaje de James Bond del escritor Ian Fleming, en las adaptaciones oficiales de las películas producidas por Eon Productions: Casino Royale (2006), Quantum of Solace (2008), Skyfall (2012), Spectre (2015) y Sin tiempo para morir (2021).'
		],
	},
	'daniel-fanego': {
		birthPlace: 'Buenos Aires',
	},
	'daniel-kaluuya': {
		biography: [
			'Daniel Kaluuya (Londres; 24 de febrero de 1989) es un actor y cineasta inglés.',
			'Es conocido por haber participado en el segundo episodio de la primera temporada de la serie de televisión Black Mirror y en la película de Jordan Peele Get Out, por la cual recibió aclamación por parte de la crítica y su primera nominación a los premios de la Academia como mejor actor.',
			'Ha ganado, entre otros, el premio Óscar, SAG, Globo de Oro y BAFTA al mejor actor de reparto por su actuación en Judas and The Black Messiah (2021).'
		],
	},
	'daniel-radcliffe': {
		birthPlace: 'Fulham, Inglaterra',
	},
	'danny-boyle': {
		biography: [
			'Radcliffe, Gran Mánchester; 20 de octubre de 1956) es un director y productor de cine británico.',
			'Dirigió los filmes Shallow Grave (1994), Trainspotting (1996), A Life Less Ordinary (1997), La playa (2000), 28 días después (2002), Millones (2004), Sunshine (2007), Slumdog Millionaire (2008), 127 horas (2010), Trance (2013), Steve Jobs (2015) y Yesterday (2019).',
			'Slumdog Millionaire le valió una estatuilla al mejor director en la 81.ª entrega de los Premios Óscar.'
		],
	},
	'dario-grandinetti': {
		birthPlace: 'Rosario',
	},
	'david-arquette': {
		biography: [
			'David James Arquette (Winchester, Virginia, 8 de septiembre de 1971) es un actor estadounidense, director de cine, productor, guionista, diseñador de modas, y ocasionalmente luchador libre profesional.',
			'Desde entonces ha tenido varios papeles de televisión, interpretando a "Jason Ventress" en In Case of Emergency.',
			'Es miembro de la familia de actores Arquette, se hizo conocido en el papel durante la década de 1990 después de protagonizar muchas películas de Hollywood, incluyendo la saga Scream.'
		],
	},
	'david-fincher': {
		biography: [
			'David Andrew Leo Fincher (Denver, 28 de agosto de 1962) es un director y productor estadounidense de cine, televisión y vídeos musicales. Fue nominado para el Óscar a mejor director por El curioso caso de Benjamin Button (2008), La red social (2010) y por Mank (2020).',
			'También es conocido por haber dirigido la película de terror y ciencia ficción Alien³ (1992) en su debut como director y los thrillers psicológicos Seven (1995), Fight Club (1999), Perdida (2014), Zodiac (2007) y The Girl with the Dragon Tattoo (2011), entre otras, además de tener un papel decisivo en la creación de las series de televisión House of Cards y Mindhunter, ambas de Netflix.',
			'Sus películas Zodiac y La red social están incluidas en el ranking de la BBC Las 100 mejores películas del siglo XXI.'
		],
	},
	'demi-moore': {
		biography: [
			'Demetria Gene Moore (Roswell, Nuevo México, 11 de noviembre de 1962), conocida profesionalmente como Demi Moore, es una actriz, modelo y productora estadounidense. Después de realizar papeles pequeños en películas y un papel recurrente en la serie de televisión General Hospital, Moore estableció su carrera en la década de 1990.',
			'Acto seguido apareció en películas con buenos resultados en taquilla como A Few Good Men (1992), Indecent Proposal (1993) y Disclosure (1994). Protagonizó un episodio de la serie de terror Tales from the Crypt.',
			'Su actuación protagonista en Ghost, la película más taquillera de 1990, le valió una nominación a los Globos de Oro.'
		],
	},
	'denis-villeneuve': {
		biography: [
			'Denis Villeneuve (Trois-Rivières, Quebec, 3 de octubre de 1967) es un director de cine, productor y guionista canadiense.',
			'Fue nominado a un premio Óscar en la categoría de mejor dirección por su película La llegada (2016), y ha ganado tres premios Genie como mejor director por sus largometrajes Maelström (2000), Polytechnique (2009) e Incendies (2010).',
			'La película Incendies fue nominada además a un Óscar en la categoría de mejor película de habla no inglesa.'
		],
	},
	'dev-patel': {
		biography: [
			'Dev Patel (Harrow, Londres, Inglaterra; 23 de abril de 1990) es un actor y director británico de ascendencia india.',
			'Es conocido por sus papeles en las películas Slumdog Millionaire, El Exótico Hotel Marigold, The Last Airbender, Lion, y en las series Skins y The Newsroom. En el año 2016 fue nominado al Premio Óscar por su interpretación de Saroo Brierley en Lion.'
		],
	},
	'diego-peretti': {
		birthPlace: 'Buenos Aires',
	},
	'don-cheadle': {
		biography: [
			'Donald Frank Cheadle Jr. (Kansas City, Misuri; 29 de noviembre de 1964) es un actor y productor de cine y televisión estadounidense.',
			'Ganador del Globo de Oro al mejor actor de reparto - Serie, miniserie o telefilme y dos veces ganador del Premio del Sindicato de Actores al mejor reparto. Candidato a los Premios Óscar, Emmy y BAFTA. Conocido por sus intervenciones en películas como Boogie Nights (1997), Traffic (2000), Ocean\'s Twelve (2004), Hotel Rwanda (2004), Crash (2004) o El vuelo (2012).',
			'También es conocido por interpretar al teniente coronel James «Rhodey» Rhodes en las películas del Universo cinematográfico de Marvel Iron Man 2 (2010), Iron Man 3 (2013), Avengers: Age of Ultron (2015), Capitán América: Civil War (2016), Avengers: Infinity War (2018), Avengers: Endgame (2019) y la serie The Falcon and the Winter Soldier (2021).'
		],
	},
	'donald-pleasence': {
		biography: [
			'Donald Henry Pleasence (Worksop, Nottinghamshire, Inglaterra; 5 de octubre de 1919-Saint-Paul de Vence, Francia; 2 de febrero de 1995) fue un actor británico.',
			'Aunque es habitualmente asociado a papeles de «malo» (o al menos sombríos) en películas de serie B, tuvo una carrera muy extensa y trabajó con figuras de máximo prestigio, como Laurence Olivier, John Sturges y Woody Allen.',
			'Ciertos críticos solían referirse a él con el apodo del «hombre de los ojos hipnóticos».'
		],
	},
	'dustin-hoffman': {
		biography: [
			'Dustin Lee Hoffman (Los Ángeles, California, 8 de agosto de 1937), conocido artísticamente como Dustin Hoffman, es un actor, comediante y director estadounidense.',
			'Ha ganado en dos ocasiones el Óscar de la Academia de Cine de Hollywood al mejor actor. Hoffman obtuvo elogios críticos por protagonizar la obra Eh?, por la cual ganó un premio de teatro mundial y un premio Drama Desk.',
			'Este logro fue seguido pronto por su papel en la película de El graduado, de 1967.'
		],
	},
	'dwayne-johnson': {
		biography: [
			'Dwayne Douglas Johnson (Hayward, California, 2 de mayo de 1972), conocido como The Rock o La Roca, es un actor, luchador profesional y empresario estadounidense. Se desempeñó como luchador profesional para WWE hasta su retirada oficial en 2019, aunque regresó en 2023 a tiempo parcial.',
			'El primer papel protagonista de Johnson en una película fue en El rey Escorpión en 2002.',
			'Como actor, ha participado en numerosas películas en bastantes de ellas, siendo su papel como Luke Hobbs en la franquicia The Fast and the Furious uno de los más reconocidos, así como Black Adam para su cinta independiente Black Adam (2022), perteneciente al Universo extendido de DC.'
		],
	},
	'ebon-moss-bachrach': {
		biography: [
			'Ebon Che Moss-Bachrach (Nueva York, Nueva York, 19 de marzo de 1977) es un actor estadounidense, conocido por interpretar el papel de David Lieberman en The Punisher y Desi Harperin en Girls.',
			'Desde 2022, Moss-Bachrach ha interpretado a Richard "Richie" Jerimovich en la serie dramática The Bear.'
		],
	},
	'ed-harris': {
		biography: [
			'Edward Allen Harris (Tenafly, Nueva Jersey, 28 de noviembre de 1950), más conocido como Ed Harris, es un actor y cineasta estadounidense.',
			'En televisión, Harris destaca por sus papeles como Miles Roby en la miniserie Empire Falls (2005) y como el senador estadounidense John McCain en el telefilme Game Change (2012); este último le valió el Globo de Oro al mejor actor de reparto de serie, miniserie o telefilme.',
			'Sus interpretaciones en Apolo 13 (1995), El show de Truman (1998), Pollock (2000) y Las horas (2002) le valieron el aplauso de la crítica y nominaciones al Oscar.'
		],
	},
	'eddie-redmayne': {
		birthPlace: 'Westminster, Londres',
	},
	'eduardo-blanco': {
		birthPlace: 'Buenos Aires',
	},
	'edward-berger': {
		biography: [
			'Edward Berger (Wolfsburgo, Baja Sajonia, Baja Sajonia; 6 de marzo de 1970) es un guionista y director de cine alemán con nacionalidades suiza y austríaca.',
			'En Cine Posta su obra queda conectada con Conclave y All Quiet on the Western Front, que hoy funcionan como entrada rápida a su filmografía dentro del sitio.'
		],
	},
	'edward-norton': {
		biography: [
			'Edward Harrison Norton (Boston, Massachusetts, 18 de agosto de 1969) es un actor, guionista, director y productor de cine estadounidense. Ha ganado un Globo de Oro y ha sido nominado en cuatro ocasiones al Óscar (por Primal Fear, American History X, Birdman y A Complete Unknown).',
			'En Cine Posta aparece ligado a Fight Club, Glass Onion: A Knives Out Mystery y The Incredible Hulk, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'elle-fanning': {
		biography: [
			'Mary Elle Fanning (Conyers, Georgia, 9 de abril de 1998) es una actriz, modelo y productora de cine estadounidense.',
			'Es conocida por interpretar a la Princesa Aurora / Bella Durmiente en las películas de fantasía Maleficent (2014) y Maleficent: Mistress of Evil (2019) y por interpretar a Catalina la Grande en la serie The Great (2020-2023), papel por el que recibió nominaciones a un Premio Emmy en 2022; tres Premios Globo de Oro en 2021, 2022 y 2023, al Premio del Sindicato de Actores de 2022 y al Premio Satellite en 2023 como Mejor actriz de serie de comedia.',
			'Saltó a la fama tras protagonizar junto a su hermana la miniserie Taken (2002).'
		],
	},
	'emily-blunt': {
		biography: [
			'Emily Olivia Laura Blunt (Londres, 23 de febrero de 1983), conocida como Emily Blunt, es una actriz y cantante británica, ganadora de un Globo de Oro, de un Premio del Sindicato de Actores y de un Premio de la Crítica Cinematográfica.',
			'Ha sido nominada a seis Globos de Oro, cuatro Premios BAFTA, tres Premios del Sindicato de Actores y siete Premios de la Crítica Cinematográfica.',
			'Es conocida por su trabajo en The Devil Wears Prada (2006), The Young Victoria (2009), The Adjustment Bureau (2011), Looper (2012), Al filo del mañana (2014), Sicario (2015), El cazador y la reina del hielo (2016), La chica del tren (2016), A Quiet Place (2018), El regreso de Mary Poppins (2018), Wild Mountain Thyme (2020), y Oppenheimer (2023) entre otros.'
		],
	},
	'emma-watson': {
		biography: [
			'Emma Charlotte Duerre Watson (París, 15 de abril de 1990) es una actriz, modelo y activista británica, conocida principalmente por haber interpretado el personaje de Hermione Granger en la saga de películas de Harry Potter.',
			'Fue elegida para interpretar a Hermione Granger a los nueve años, después de haber participado anteriormente en obras de teatro escolares. Protagonizó, junto con Daniel Radcliffe y Rupert Grint, las ocho películas de la serie cinematográfica. Debido a su trabajo en Harry Potter, fue galardonada con diversos premios y se estima que ha ganado 26 millones de libras esterlinas. Hizo su primera aparición fuera de la saga de Harry Potter en la película para televisión Ballet Shoes emitida por BBC One el 26 de diciembre de 2007 con una audiencia de 5,2 millones.',
			'En 2012 protagonizó junto a Logan Lerman, la película The Perks of Being a Wallflower, basada en la novela homónima de Stephen Chbosky, en 2013 actuó en The Bling Ring, película de Sofia Coppola basada en hechos reales, y en 2014 apareció en Noé, la epopeya bíblica de Darren Aronofsky.'
		],
	},
	'evangeline-lilly': {
		biography: [
			'Nicole Evangeline Lilly (Fort Saskatchewan, Alberta; 3 de agosto de 1979), conocida artísticamente como Evangeline Lilly, es una exactriz y escritora canadiense.',
			'Logró popularidad por su papel de Kate Austen en la serie de televisión Lost (2004-2010), por la que obtuvo un Premio del Sindicato de Actores y recibió una nominación al Globo de Oro. También fue reconocida por sus interpretaciones de Connie James en The Hurt Locker (2008), Hope van Dyne en Ant-Man and the Wasp (2018), Bailey Tallet en Real Steel (2011) y Tauriel en la serie fílmica de El Hobbit.',
			'Interpretó a Hope van Dyne / "La Avispa" en el universo cinematográfico de Marvel en las películas Ant-Man (2015), Ant-Man and the Wasp (2018) Avengers: Endgame (2019) y Ant-Man and the Wasp: Quantumania (2023).'
		],
	},
	'ewan-mcgregor': {
		birthPlace: 'Perth',
	},
	'fernanda-torres': {
		biography: [
			'Fernanda Torres (Río de Janeiro, 15 de septiembre de 1965) es una escritora y actriz brasileña de cine, teatro y televisión.',
			'Por su actuación aclamada por la crítica en la película dramática Aún estoy aqui (2024), Torres ganó el Globo de Oro a la mejor actriz - Drama, convirtiéndose en la primera brasileña en obtenerlo.',
			'Torres creció inmersa en el mundo del arte y la actuación, debido a que es hija de la actriz Fernanda Montenegro y del actor Fernando Torres.'
		],
	},
	'florence-pugh': {
		biography: [
			'Florence Rose Pugh (Oxford, Inglaterra; 3 de enero de 1996) es una actriz británica.',
			'Hizo su debut actoral en 2014 en la película dramática The Falling.',
			'Pugh ganó reconocimiento en 2016 por su papel protagónico como una joven esposa violenta en el drama independiente Lady Macbeth, ganando un Premio de Cine Independiente Británico.'
		],
	},
	'gal-gadot': {
		biography: [
			'Gal Gadot (Petaj Tikva, 30 de abril de 1985) es una actriz, productora y modelo israelí.',
			'A los 18 años ganó el título de Miss Israel 2004, con el cual representó a Israel en Miss Universo 2004.',
			'Su primer papel cinematográfico internacional llegó con Gisele Yashar en Fast & Furious (2009), un papel que repitió en las entregas posteriores de la franquicia cinematográfica.'
		],
	},
	'gary-oldman': {
		biography: [
			'Gary Leonard Oldman (Londres, 21 de marzo de 1958) es un actor, director de cine, guionista y productor inglés.',
			'También ha doblado a Viktor Reznov en los videojuegos Call of Duty World at War y Call of Duty: Black Ops y a Lord Shen en Kung Fu Panda 2, papel por el que recibió una nominación a Mejor Interpretación Vocal en los premios Annie.',
			'Entre sus películas están JFK (1991), Amada Inmortal (1994), Drácula, de Bram Stoker (1992), Romeo Is Bleeding (1993), Léon (1994), El quinto elemento (1997), Harry Potter y el prisionero de Azkaban (2004), Batman Begins (2005) Harry Potter y la Orden del Fénix (2007), The Dark Knight (2008), Tinker Tailor Soldier Spy, The Dark Knight Rises (2012), Darkest Hour (2017) y Mank (2020).'
		],
	},
	'gaston-pauls': {
		birthPlace: 'Buenos Aires',
	},
	'gene-hackman': {
		biography: [
			'Eugene Allen Hackman (San Bernardino, California; 30 de enero de 1930-Santa Fe, Nuevo México; 18 de febrero de 2025), conocido como Gene Hackman, fue un actor estadounidense.',
			'Se retiró principalmente de la actuación después de su último papel cinematográfico en Welcome to Mooseport (2004), y ocasionalmente brindó narraciones para documentales de televisión hasta 2017.',
			'Hackman ganó dos premios Oscar por su papel de Jimmy "Popeye" Doyle en el thriller de acción The French Connection (1971) de William Friedkin y por su papel de Mejor Actor de Reparto por su papel de un sheriff villano en la película western de Clint Eastwood, Unforgiven (1992).'
		],
	},
	'geoffrey-rush': {
		biography: [
			'Geoffrey Roy Rush (Toowoomba, Queensland, 6 de julio de 1951), conocido como Geoffrey Rush, es un actor australiano.',
			'Rush comenzó su carrera como actor profesional en la Queensland Theatre Company en 1971.',
			'Es conocido por sus excéntricos papeles de protagonista en el escenario y la pantalla.'
		],
	},
	'george-clooney': {
		biography: [
			'George Timothy Clooney (Lexington, Kentucky, 6 de mayo de 1961) es un actor, director, productor y guionista estadounidense nacionalizado francés en diciembre de 2025.',
			'Fue nominado dos veces para los premios Emmy por su interpretación del Dr. Doug Ross en la galardonada serie de televisión Urgencias.',
			'También es conocido por su activismo político, siendo Mensajero de la Paz de Naciones Unidas desde 2008, título al que renunció posteriormente.'
		],
	},
	'george-miller': {
		biography: [
			'George Miller (Brisbane, 3 de marzo de 1945) es un cineasta australiano, conocido por ser el creador de la saga Mad Max.',
			'Miller es, gracias a la saga Mad Max, considerado uno de los mejores directores de acción.',
			'Además de haber dirigido acción, Miller también ha destacado en obras dramáticas como Lorenzo\'s Oil (nominada al Óscar a Mejor guion original), la película de fantasía The Witches of Eastwick o Happy Feet, ganadora de un Óscar a Mejor película de animación.'
		],
	},
	'gerard-butler': {
		biography: [
			'Gerard James Butler (Paisley, Escocia, 13 de noviembre de 1969) es un actor de cine y televisión y productor británico.',
			'Después de estudiar Derecho, se dedicó a la actuación a mediados de la década de 1990 con pequeños papeles en producciones fílmicas.',
			'En 2000, interpretó a Drácula en la película de terror Dracula 2000 con Christopher Plummer y Jonny Lee Miller.'
		],
	},
	'glen-powell': {
		biography: [
			'Glen Thomas Powell Jr. (Austin, Texas, 21 de octubre de 1988) es un actor, escritor y productor estadounidense. Es conocido por interpretar a Chad Radwell en la serie de comedia de terror de Fox Scream Queens (2015-2016), Finnegan en Everybody Wants Some!! (2016), y al astronauta John Glenn en el drama Hidden Figures (2016), aunque obtuvo un mayor reconocimiento por su papel secundario en la película de acción Top Gun: Maverick (2022) y su papel principal en la comedia romántica Anyone but You (2023).',
			'En Cine Posta aparece ligado a Jugada Maestra, Hit Man y Twisters, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'graciela-borges': {
		birthPlace: 'Buenos Aires',
	},
	'greta-gerwig': {
		biography: [
			'Greta Celeste Gerwig (Sacramento, California; 4 de agosto de 1983) es una actriz, directora, guionista y productora estadounidense.',
			'En 2017 debutó como directora y guionista en solitario con la película Lady Bird, por la que ganó el Globo de Oro a la mejor película - Comedia o musical y recibió nominaciones a los Premios Óscar a mejor dirección y mejor guion original.',
			'Su renombre surgió por su participación en películas del género mumblecore. Ha colaborado con el director Joe Swanberg en varios proyectos, incluyendo la película Nights and Weekends escrita, dirigida y protagonizada por ambos.'
		],
	},
	'gwyneth-paltrow': {
		biography: [
			'Gwyneth Kate Paltrow (Los Ángeles, 27 de septiembre de 1972) es una actriz y cantante estadounidense.',
			'Es ganadora de un Óscar, un Globo de Oro y dos Premios del Sindicato de Actores todos ellos por su interpretación de Viola de Lesseps en la película Shakespeare in Love (1998).',
			'Recibió su estrella en el Paseo de la Fama de Hollywood en 2010.'
		],
	},
	'hailee-steinfeld': {
		biography: [
			'Hailee Steinfeld (Tarzana, Los Ángeles, California; 11 de diciembre de 1996) es una actriz y cantante estadounidense.',
			'Tuvo algunos papeles en cortometrajes y series de televisión antes de interpretar a Mattie Ross en la adaptación de True Grit de los hermanos Coen, por la cual fue nominada al Óscar.',
			'Interpretó a Emily Junk en la serie de películas Pitch Perfect (2015-2017) y a Nadine Franklin en The Edge of Seventeen (2016), la última de las cuales le valió una nominación al Globo de Oro a la mejor actriz de comedia cinematográfica o Musical.'
		],
	},
	'halle-berry': {
		biography: [
			'Halle Maria Berry (Cleveland, Ohio, 14 de agosto de 1966) es una actriz, directora y productora estadounidense ganadora de un Premio Óscar, un Globo de Oro, dos Premios del Sindicato de Actores y un Emmy.',
			'Antes de convertirse en actriz, comenzó siendo modelo y participó en varios concursos de belleza, terminando como primera finalista en el concurso de Miss Estados Unidos y ocupando el sexto lugar en el concurso de Miss Mundo en 1986.',
			'Dandridge (1999), por la cual ganó el Premio Primetime Emmy y el Premios Globo de Oro a la Mejor Actriz en una Miniserie o Película, entre muchos otros premios.'
		],
	},
	'harrison-ford': {
		biography: [
			'Harrison Ford (Chicago, Illinois, 13 de julio de 1942) es un actor, productor de cine, y actor de voz estadounidense de cine y televisión.',
			'Aunque inicialmente fue un fracaso en taquilla, la película se transformó con el tiempo en una película de culto de la ciencia ficción.',
			'Es recordado por haber interpretado el personaje de Indiana Jones en la saga homónima (1981-2023) y por haber interpretado al personaje de Han Solo en la saga de ciencia ficción Star Wars (1977-1983, 2015-2019).'
		],
	},
	'hector-alterio': {
		birthPlace: 'Buenos Aires',
	},
	'henry-cavill': {
		biography: [
			'Henry William Dalgliesh Cavill (Saint Helier, Jersey; 5 de mayo de 1983) es un actor británico.',
			'Inició su carrera profesional con la película Laguna (2001) y durante los años posteriores desarrolló papeles secundarios en varias producciones británicas como The Count of Monte Cristo (2002), Tristan & Isolde (2006) y Stardust (2007).',
			'Comenzó a ganar reconocimiento al interpretar a Charles Brandon, primer duque de Suffolk, en la serie de televisión The Tudors, desde 2007 hasta 2010.'
		],
	},
	'hugh-grant': {
		biography: [
			'Hugh John Mungo Grant (Hammersmith, Londres, 9 de septiembre de 1960), más conocido como Hugh Grant, es un actor y productor de cine británico.',
			'Protagonizó otras comedias románticas como Notting Hill (1999), El diario de Bridget Jones (2001) y su secuela de 2004, Un niño grande (2002), Amor con preaviso (2002), Love Actually (2003) y Tú la letra, yo la música (2007). Durante la década de 2010, Grant comenzó a tomar papeles opuestos, comenzando con múltiples papeles en la película de ciencia ficción El atlas de las nubes (2012) de The Wachowski.',
			'Se estableció al principio de su carrera como un protagonista romántico encantador y vulnerable, y desde entonces ha pasado a ser un actor de carácter más dramático.'
		],
	},
	'hugh-jackman': {
		biography: [
			'Hugh Michael Jackman (Sídney, 12 de octubre de 1968) es un actor, cantante y productor de cine australobritánico. Su papel más reconocido es Wolverine en la serie de películas de X-Men y en Deadpool & Wolverine del Universo cinematográfico de Marvel en 2024.',
			'En teatro, ganó un premio Tony por su papel en The Boy From Oz.',
			'Entre otras obras notables, ha protagonizado las películas: Kate & Leopold (2001), Van Helsing (2004), The Prestige (2006), Australia (2008), Real Steel (2011), Los Miserables (2012), Prisoners (2013) y El gran showman (2017).'
		],
	},
	'ian-mckellen': {
		biography: [
			'Sir Ian Murray McKellen (Burnley, Inglaterra, 25 de mayo de 1939) es un actor británico de cine y teatro, uno de los más notables del Reino Unido, considerado comúnmente un icono de la cultura británica. En su larga carrera ha ganado siete premios Laurence Olivier, un Globo de Oro, un Tony, dos premios del Sindicato de Actores, un BIF y dos premios de la Crítica Cinematográfica; y ha sido nominado al Óscar en dos ocasiones, cinco a los BAFTA y cinco a los Emmy.',
			'Su labor interpretativa ha abarcado desde Shakespeare y el teatro popular contemporáneo hasta la fantasía y la ciencia ficción.',
			'La BBC declaró que «sus interpretaciones le han asegurado un nicho en el canon del teatro inglés y dentro del gremio cinematográfico». Comenzó su carrera profesional en 1961 como parte del selecto elenco del Belgrade Theatre.'
		],
	},
	'jack-black': {
		biography: [
			'Thomas Jacob Black (Santa Mónica, California, 28 de agosto de 1969), más conocido como Jack Black, es un actor, cantante, músico, comediante y productor musical estadounidense.',
			'Entre su extensa filmografía, Black ha protagonizado películas tales como Amor ciego, King Kong, School of Rock, Nacho Libre, Tropic Thunder, The Holiday, Goosebumps, Bernie, Jumanji, Kung Fu Panda, Super Mario Bros.: La Película y Una Película de Minecraft.'
		],
	},
	'jack-quaid': {
		biography: [
			'Jack Henry Quaid (Los Ángeles, 24 de abril de 1992) es un actor estadounidense que adquirió popularidad por interpretar a Hughie Campbell en la serie original de Amazon Prime Video The Boys.',
			'En Cine Posta aparece ligado a Companion y Novocaine, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'jacob-elordi': {
		biography: [
			'Jacob Nathaniel Elordi (Brisbane, Queensland, 26 de junio de 1997) es un actor australiano conocido por interpretar a Noah Flynn en la franquicia de películas de Netflix The Kissing Booth (2018-2021) y a Nate Jacobs en la serie Euphoria de HBO.',
			'En Cine Posta aparece ligado a Cumbres Borrascosas, Frankenstein y Saltburn, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'jake-gyllenhaal': {
		biography: [
			'Jacob Benjamin Gyllenhaal (Los Ángeles, 19 de diciembre de 1980) es un actor estadounidense.',
			'Comenzó a actuar a la edad de once años, cuando participó en City Slickers, estrenada en 1991.',
			'Su primer papel protagonista fue en la película October Sky (1999), a la que le siguieron trabajos como la película independiente de culto Donnie Darko, en la que interpreta a un adolescente con problemas psicológicos y donde compartió reparto con su hermana Maggie Gyllenhaal, y The Day After Tomorrow (2004), que trata el tema catastrófico del enfriamiento global.'
		],
	},
	'james-franco': {
		biography: [
			'James Edward Franco (Palo Alto, California, 19 de abril de 1978) es un actor y director de cine estadounidense. Inició su trabajo interpretativa a finales de la década de 1990, con apariciones en series televisivas como Freaks and Geeks y en películas de adolescentes.',
			'En 2001 interpretó el papel de James Dean en la película homónima, actuación que fue premiada con un Globo de Oro al mejor actor de miniserie o telefilme. Alcanzó la fama internacional por su papel de Harry Osborn en la primera trilogía de Spider-Man.',
			'A partir de entonces, sus participaciones en películas han sido muy variadas, incluyendo la película de guerra The Great Raid (2005), el drama romántico Tristán e Isolda, y la película dramática Annapolis (2006), dirigida por Justin Lin, entre otras.'
		],
	},
	'james-gunn': {
		biography: [
			'James Francis Gunn Jr. (San Luis, Misuri; 5 de agosto de 1966) es un cineasta y guionista estadounidense, copresidente y codirector del Universo DC.',
			'Discovery contrató a Gunn y Peter Safran para convertirse en copresidentes y codirectores ejecutivos de DC Studios. Bajo DC Studios, Gunn coproducirá y será productor ejecutivo de todas las películas y series de televisión de la próxima franquicia de medios del Universo DC (DCU) junto con Safran, al mismo tiempo que seguirá escribiendo guiones y dirigiendo proyectos para el DCU. Comenzó su carrera como guionista a mediados de los años 1990, comenzando en Troma Entertainment con Tromeo and Juliet (1997).',
			'Reconocido por escribir y dirigir las películas de la trilogía de Guardianes de la Galaxia (2014-2023), la película The Suicide Squad (2021) y la película de Superman (2025); así como las series Peacemaker (2022-2025) de HBO Max, Creature Commandos (2024), y el especial original de Disney+ The Guardians of the Galaxy Holiday Special (2022).'
		],
	},
	'james-mangold': {
		biography: [
			'James Allen Mangold (Nueva York, 16 de diciembre de 1963) es un director de cine y guionista estadounidense.',
			'Es conocido por haber dirigido la película The Wolverine (2013) y su secuela Logan (2017), ambas pertenecientes a la saga de películas de X-Men.'
		],
	},
	'james-mcavoy': {
		biography: [
			'James McAvoy (Glasgow, Escocia, 21 de abril de 1979) es un actor escocés.',
			'Hizo su debut como actor cuando era adolescente en The Near Room (1995) y apareció principalmente en televisión hasta 2003, cuando comenzó su carrera cinematográfica.',
			'McAvoy obtuvo reconocimiento por interpretar al Sr. Tumnus en la película de fantasía Las crónicas de Narnia: El león, la bruja y el armario (2005) y a Wesley Gibson en la película de acción Wanted (2008).'
		],
	},
	'jamie-foxx': {
		biography: [
			'Eric Marlon Bishop (Terrell, Texas; 13 de diciembre de 1967), más conocido como Jamie Foxx, es un actor, comediante, productor discográfico y cantante de R&B estadounidense.',
			'Otros papeles incluyen al Sargento Sykes en Jarhead (2005), el ejecutivo discográfico Curtis Taylor Jr. en Dreamgirls (2006), el Detective Ricardo Tubbs en la adaptación cinematográfica de 2006 de la serie de televisión, Miami Vice, el papel principal en la película Django Unchained (2012), el supervillano Electro en The Amazing Spider-Man 2: Rise of Electro (2014) y Spider-Man: No Way Home (2021), Will Stacks en Annie (2014), el gánster Bats/Leon Jefferson III en Baby Driver (2017) y como Walter McMillian en Just Mercy (2019), donde recibió un Premio SAG.',
			'Foxx se hizo muy conocido por su interpretación de Ray Charles en la película biográfica Ray de 2004, por la que ganó un Premio Óscar, un Globo de Oro, un BAFTA y un Premio del Sindicato de Actores como Mejor Actor, siendo uno de los pocos actores afroamericanos en ganar los premios principales en la industria cinematográfica.'
		],
	},
	'jamie-lee-curtis': {
		biography: [
			'Jamie Lee Curtis (Santa Mónica, California, 22 de noviembre de 1958) es una actriz, productora cinematográfica, autora infantil y activista estadounidense.',
			'Murder Case) de la serie Colombo, emitida el 22 de mayo de 1977.',
			'Conocida por sus actuaciones en los géneros de terror y slasher, se la considera una reina del grito, además de sus papeles en comedias. Curtis ha recibido múltiples elogios, incluido un Premio Óscar, un Emmy, un BAFTA, tres Globos de Oro y dos Premios del Sindicato de Actores, así como nominaciones para un Grammy y para un Independent Spirit.'
		],
	},
	'jason-bateman': {
		biography: [
			'Jason Kent Bateman (Rye, Nueva York, 14 de enero de 1969) es un actor y director estadounidense ganador de un Globo de Oro, un Premio Emmy y tres Premios del Sindicato de Actores.',
			'Después de haber actuado en varias series de comedia durante la década de 1980, Bateman adquirió fama por su trabajo como Michael Bluth en la serie Arrested Development (2003-2019).',
			'Ha protagonizado y dirigido la serie de televisión Ozark (2017-2022), por la que ha recibido multitud de galardones.'
		],
	},
	'jason-momoa': {
		biography: [
			'Joseph Jason Namakaeha Momoa (Honolulu, 1 de agosto de 1979) es un actor, actor de voz, director, guionista y productor de cine estadounidense.',
			'Comenzó su carrera como actor después de mentir sobre ser un modelo profesional, lo cual le concedió un papel en la serie Baywatch, en la que debutó en 1999 y participó dos temporadas.',
			'Más tarde, ganó popularidad interpretando a Ronon Dex en la serie de televisión Stargate Atlantis desde 2004 hasta 2009.'
		],
	},
	'javier-bardem': {
		biography: [
			'Javier Ángel Encinas Bardem (Las Palmas de Gran Canaria, 1 de marzo de 1969), conocido artísticamente como Javier Bardem, es un actor español, hijo de la actriz española Pilar Bardem y proveniente de una familia de conocidos actores españoles.',
			'Ganó el Premio Óscar al mejor actor de reparto de 2007 por su papel como el psicópata asesino Anton Chigurh en No Country for Old Men.',
			'También ha cosechado elogios de la crítica por papeles en películas tales como Jamón, jamón, Carne trémula, Boca a boca, Los lunes al sol, Mar adentro y El buen patrón.'
		],
	},
	'jeff-goldblum': {
		biography: [
			'Jeffrey Lynn Goldblum (West Homestead, Pensilvania, Estados Unidos; 22 de octubre de 1952), más conocido como Jeff Goldblum, es un actor y músico estadounidense.',
			'Su carrera comenzó con la película Death Wish (1974) donde interpretaba a un maleante y desde entonces se ha destacado en películas taquilleras como La mosca (1986), Parque Jurásico (1993), Independence Day (1996), El mundo perdido (1997), Jurassic World: el reino caído (2018), entre otras.',
			'Entre 2009 y 2010 interpretó al detective Zach Nichols en la serie Law & Order: Criminal Intent.'
		],
	},
	'jenna-ortega': {
		biography: [
			'Jenna Marie Ortega (Palm Desert, California, 27 de septiembre de 2002) es una actriz estadounidense.',
			'Logró su gran avance actoral al protagonizar la serie de Disney Channel Stuck in the Middle (2016-2018), donde interpretó a Harley Diaz.',
			'Otros de sus primeros trabajos reconocidos incluyen su interpretación como Ellie Alves en la serie de suspense You (2019), y su protagónico en la cinta de comedia familiar Yes Day (2021), ambas de Netflix.'
		],
	},
	'jennifer-connelly': {
		biography: [
			'Jennifer Lynn Connelly (Cairo, Nueva York, 12 de diciembre de 1970) es una actriz y modelo estadounidense.',
			'Comenzó su carrera como modelo infantil antes de debutar en la actuación en el filme de Sergio Leone Érase una vez en América (1984).',
			'Un año después, realizó su primer papel protagónico en la película de terror de Dario Argento Phenomena, y en 1986 obtuvo reconocimiento al participar junto con David Bowie en la cinta de fantasía Labyrinth, de Jim Henson.'
		],
	},
	'jennifer-garner': {
		biography: [
			'Jennifer Anne Garner (Houston, Texas; 17 de abril de 1972) es una actriz y productora estadounidense de cine y televisión, conocida principalmente por su papel como la agente de la CIA Sydney Bristow en la serie de televisión Alias, emitida por la cadena estadounidense ABC, y por la que ganó un Globo de Oro a la mejor interpretación femenina.',
			'En Cine Posta aparece ligado a Daredevil y Elektra, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'jeremy-renner': {
		biography: [
			'Jeremy Lee Renner (Modesto, 7 de enero de 1971) es un actor, actor de voz, productor y músico estadounidense.',
			'Inició su carrera como actor en 1995 con apariciones en varios proyectos de su universidad y posteriormente como protagonista de filmes independientes, entre ellos Dahmer (2002), en el que su actuación recibió buenos comentarios.',
			'Ganó reconocimiento en la industria al protagonizar la aclamada película The Hurt Locker (2008), que le valió una nominación a los Premios Óscar como mejor actor, así como a otros galardones, entre ellos el BAFTA y el SAG.'
		],
	},
	'jeremy-strong': {
		biography: [
			'Jeremy Strong (Boston, Massachusetts, Estados Unidos, 25 de diciembre de 1978) es un actor estadounidense de cine y teatro, conocido principalmente por su papel como Kendall Roy en la serie de televisión estadounidense Succession (2018), por el que ganó el premio Primetime Emmy como mejor actor en una serie dramática en 2020. También ha intervenido en varias películas destacadas, como Lincoln (2012), La noche más oscura (2012), Selma (2014), La gran apuesta (2015), Molly\'s Game (2017) y The Gentlemen (2019).',
			'En Cine Posta aparece ligado a The Apprentice (La historia de Trump), tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'jesse-eisenberg': {
		biography: [
			'Jesse Adam Eisenberg (Nueva York, 5 de octubre de 1983) es un actor, actor de voz, escritor, dramaturgo y humorista estadounidense.',
			'Su papel debut fue en la película The Emperor\'s Club (2002), The Village (2004), The Squid and the Whale (2005), The Living Wake (2007) y The Education of Charlie Banks (2007).',
			'Fue nominado para mejor actor en los premios Óscar por su papel en The Social Network (2010) y al Premio Golden Raspberry en 2016, al peor actor de reparto por su papel de Lex Luthor. En 2007 fue honrado con el Premio Rising Star del Festival de Cine de Vail por su papel de Mills Joquin en The Living Wake. En 2009 protagonizó la comedia dramática Adventureland y la comedia de terror Zombieland, por la que ganó aclamación por parte de la crítica.'
		],
	},
	'jesse-plemons': {
		biography: [
			'Jesse Plemons (Dallas, Texas; 2 de abril de 1988) es un actor estadounidense.',
			'Comenzó su carrera como actor infantil y su carrera tomó impulso con su participación en la serie dramática Friday Night Lights (2006-2011).',
			'Posteriormente interpretó a Todd Alquist en la quinta temporada de la serie criminal Breaking Bad (2012-2013); repitió su papel en el telefilme El Camino: A Breaking Bad Movie (2019).'
		],
	},
	'jessica-chastain': {
		biography: [
			'Jessica Michelle Chastain (Sacramento, 24 de marzo de 1977), conocida como Jessica Chastain, es una actriz y productora de cine estadounidense.',
			'Es fundadora de la productora de cine y televisión Freckle Films creada en 2016. Después de interpretar pequeños papeles en series de televisión, hizo su debut en la gran pantalla con la película independiente Jolene en 2008.',
			'En su carrera ha recibido varios premios y nominaciones: entre ellos, un Premio Óscar, un Globo de Oro y tres Premios SAG.'
		],
	},
	'jessie-buckley': {
		biography: [
			'Jessie Noelle Buckley (Killarney, 28 de diciembre de 1989) es una actriz, cantante y compositora irlandesa.',
			'Ganadora de un Premio Laurence Olivier, un premio BAFTA, un Globo de Oro y un Óscar. En 2019, fue reconocida por la revista Forbes en su lista anual 30 Under 30, y en 2020, fue incluida en el número 38 en la lista del diario The Irish Times dentro de los mejores actores irlandeses de cine de todos los tiempos. Su carrera comenzó en 2008 como concursante en un programa de talentos de la BBC titulado I\'d Do Anything, en el que ocupó el segundo lugar. Después de participar en papeles teatrales, suspendió su carrera profesional para estudiar en la Real Academia de Arte Dramático, de donde se graduó en 2013.',
			'Desde entonces, ha protagonizado las películas Beast (2017) y Wild Rose (2018), por las cuales recibió elogios de la crítica y una nominación al Premio BAFTA a la mejor actriz en un papel principal por este último; y The Lost Daughter (2021), por la que fue nominada a mejor actriz de reparto en la 94.ª edición de los Premios Óscar por su interpretación de Leda.'
		],
	},
	'joaquin-furriel': {
		birthPlace: 'Lomas de Zamora, provincia de Buenos Aires',
	},
	'jodie-comer': {
		biography: [
			'Jodie Marie Comer (Liverpool; 11 de marzo de 1993), conocida artísticamente como Jodie Comer, es una actriz británica de cine, televisión y teatro.',
			'Ha recibido varios reconocimientos, incluidos dos Premios de la Academia Británica de la Televisión, un Premio Primetime Emmy, un Premio Tony, y un Premio Laurence Olivier.',
			'Además de nominaciones como dos Premios Globo de Oro, dos Premios de la Crítica Cinematográfica, y un Premio del Sindicato de Actores.'
		],
	},
	'john-david-washington': {
		biography: [
			'John David Washington (Los Ángeles, California; 28 de julio de 1984) es un actor y exjugador de fútbol americano profesional estadounidense.',
			'Como actor es más conocido por su rol protagonista en la película de 2018 BlacKkKlansman y en la de 2020 Tenet.'
		],
	},
	'johnny-depp': {
		biography: [
			'John Christopher Depp II (Owensboro, Kentucky, 9 de junio de 1963) es un actor, director, productor de cine y músico estadounidense.',
			'Ha sido nominado en tres ocasiones al Óscar y recibió un Globo de Oro, un Premio del Sindicato de Actores y un César. Comenzó su carrera en la película de terror A Nightmare on Elm Street de 1984 como Glen Lantz, una de las víctimas de Freddy Krueger.',
			'Dos años después, tuvo un papel de reparto en Platoon dirigido por Oliver Stone.'
		],
	},
	'jon-m-chu': {
		biography: [
			'Jonathan Murray Chu (pinyin, Zhū Hàowěi; 2 de noviembre de 1979) es un cineasta estadounidense.',
			'Chu es alumno de la Escuela de Cine de la Universidad del Sur de California.',
			'Ha dirigido las películas Step Up 2: The Streets, Step Up 3D, Justin Bieber: Never Say Never, las franquicias de Hasbro Jem and the Holograms y G.I.'
		],
	},
	'jonathan-bailey': {
		biography: [
			'Jonathan Stuart Bailey (Wallingford, Reino Unido; 25 de abril de 1988) es un actor de cine, teatro y televisión británico, ganador de un Premio Laurence Olivier y conocido por interpretar a Anthony Bridgerton en la serie Bridgerton (2020-2026).',
			'Comenzó a destacar con su papel en la serie musical Groove High (2012) de Disney Channel y por su participación en la serie de Crashing (2016), en la cual interpretó el papel de Sam.'
		],
	},
	'joseph-kosinski': {
		biography: [
			'Joseph Kosinski (Marshalltown, Iowa, 3 de mayo de 1974) es un actor, director de anuncios comerciales de televisión estadounidense y director de cine, principalmente conocido por su trabajo con imágenes generadas por computador (CGI).',
			'Debutó como director en la gran pantalla con la película de ciencia ficción en Disney digital 3-D Tron: Legacy, secuela de la película Tron de 1982.',
			'Sus trabajos anteriores han estado principalmente relacionados con comerciales de televisión que incluyen CGI, algunos de los cuales han sido el comercial de Starry Night, para Halo 3 y el galardonado Mad World para el videojuego Gears of War.'
		],
	},
	'josh-brolin': {
		biography: [
			'Josh James Brolin (Santa Mónica, California, 12 de febrero de 1968), es un actor de cine y televisión estadounidense.',
			'Su primer papel fue en la película Los Goonies en 1985.',
			'Desde entonces ha aparecido en varias películas y es conocido por papeles como Llewellyn Moss en No Country for Old Men, el Agente K joven en Hombres de negro III, el presidente George W.'
		],
	},
	'josh-o-connor': {
		biography: [
			'Josh O\'Connor (Southampton, Hampshire; 20 de mayo de 1990) es un actor británico.',
			'Es conocido por sus papeles como Johnny Saxby en la película God\'s Own Country (2017), por el de Lawrence Durrell en la serie televisiva The Durrells (2016-2019) y por interpretar al entonces príncipe Carlos de Gales (actual Carlos III) en la tercera y cuarta temporada de The Crown.',
			'Por este último papel ha ganado un premio Emmy, un Globo de Oro, un Premio de la Crítica Televisiva y dos premios SAG.'
		],
	},
	'jude-law': {
		biography: [
			'David Jude Heyworth Law (Lewisham, Londres, 29 de diciembre de 1972), más conocido como Jude Law, es un actor, productor y director de cine y de teatro británico. Comenzó su carrera en el teatro antes de conseguir pequeños papeles en varias producciones de televisión y largometrajes británicos, y luego obtuvo reconocimiento por su papel en The Talented Mr. Ripley (1999), de Anthony Minghella, por la que ganó el Premios BAFTA al mejor actor en un papel secundario y fue nominado a un Premio Óscar. Law encontró un mayor éxito comercial y de crítica en AI Artificial Intelligence (2001) de Steven Spielberg, Road to Perdition (2002) de Sam Mendes, Cold Mountain (2003) de Minghella, por la que obtuvo nominaciones al Premio de la Academia y al BAFTA, además del drama Closer (2004) y la comedia romántica The Holiday (2006).',
			'Otros papeles notables incluyen las series de televisión The Young Pope (2016) y The New Pope (2020). Además de su trabajo cinematográfico, Law ha actuado en varias producciones del West End de Londres y en Broadway de New York, incluidas Les Parents terribles en 1994, Hamlet en 2010 y Anna Christie en 2011. Law ha recibido múltiples premios y nominaciones, incluido un Premio BAFTA al Mejor Actor de Reparto y el Premio César Honorario.',
			'Ha sido nominado a un Premio BAFTA al Mejor Actor en un Papel Protagónico, así como a un total de dos Premios de la Academia, dos Premios Tony y cuatro Premios Globo de Oro.'
		],
	},
	'julianne-moore': {
		biography: [
			'Julie Anne Smith (Fayetteville, Carolina del Norte, 3 de diciembre de 1960), conocida profesionalmente como Julianne Moore, es una actriz y productora estadounidense, una de las pocas actrices que ha ganado los cuatro premios más importantes de la industria cinematográfica: el Premio Óscar, los Globos de Oro, el Premio BAFTA y el Premio del Sindicato de Actores por sus interpretaciones en diversos papeles. También ha sido galardonada con un premio Primetime Emmy, la Copa Volpi a la mejor actriz, el Premio del Festival de Cannes a la mejor actriz y el Oso de plata del Festival Internacional de Cine de Berlín.',
			'Desde 2008, es embajadora de la ONG Save the Children. Es conocida por su participación en películas como The Lost World: Jurassic Park (1997), Boogie Nights (1997), Magnolia (1999), Hannibal (2001), Las horas (2002), Far from Heaven (2002), Children of Men (2006), A Single Man (2009), The Kids Are All Right (2011), Carrie (2013), Maps to the Stars (2014), Still Alice (2014), Los juegos del hambre: sinsajo - Parte 1 (2014), Sinsajo - Parte 2 (2015), Freeheld (2015) y La habitación de al lado (2024).'
		],
	},
	'julieta-diaz': {
		birthPlace: 'Buenos Aires',
	},
	'julio-chavez': {
		birthPlace: 'Buenos Aires',
	},
	'kathryn-newton': {
		biography: [
			'Kathryn Love Newton (Orlando, Florida, 8 de febrero de 1997) es una actriz estadounidense.',
			'Es conocida por su papel de Allie Pressman en la serie de Netflix The Society, así como por su papel de Alex Nelson en la película de 2012 Paranormal Activity 4, que le valió un Young Artist Award por Mejor actriz joven en un largometraje. También es conocida por interpretar una versión más joven de Claire Novak en la serie de The CW Supernatural.',
			'En 2023 interpretó a Cassie Lang en Ant-Man and the Wasp: Quantumania.'
		],
	},
	'ke-huy-quan': {
		biography: [
			'Ke Huy Quan (關繼威) (Saigón, 20 de agosto de 1971), también conocido como Jonathan Ke Quan, es un actor vietnamita-estadounidense.',
			'Conocido por su actuación en 2 famosas películas de aventuras de la década de los 80: Indiana Jones y el templo maldito (1984), en el que interpretaba el papel de Tapón, y Los Goonies (1985), en el personaje de Data.',
			'Y, posteriormente, con el resurgimiento de su carrera en 2022, con la película Everything Everywhere All at Once, que le valió el premio Óscar al mejor actor de reparto y el Globo de Oro al mejor actor de reparto, siendo el primer actor de origen vietnamita en conseguirlo.'
		],
	},
	'keanu-reeves': {
		biography: [
			'Keanu Charles Reeves (Beirut, 2 de septiembre de 1964) es un actor y músico canadiense. Su trayectoria cinematográfica abarca más de cuatro décadas y ha recibido diversos reconocimientos por su trabajo en el cine.',
			'En teatro, actuó como el Príncipe Hamlet para la producción de Hamlet en el Manitoba Theatre Center.',
			'Es conocido por sus papeles protagónicos en películas de acción, su amable imagen pública y sus esfuerzos filantrópicos. Es conocido por interpretar a Neo en Matrix y a John Wick en la saga John Wick. Tiene entre su repertorio las comedias de la franquicia de Bill y Ted (1989-2020); los thrillers de acción Point Break (1991), Speed (1994) y la franquicia John Wick (2014-2023); el thriller psicológico The Devil\'s Advocate (1997); el thriller sobrenatural Constantine (2005); y la saga de ciencia ficción y acción The Matrix (1999-2021).'
		],
	},
	'keegan-michael-key': {
		biography: [
			'Keegan-Michael Key (Southfield, Michigan; 22 de marzo de 1971) es un actor, comediante, guionista y productor estadounidense, reconocido por su participación en producciones como Parks and Recreation, Dolemite is my Name, The Star y The Prom.',
			'En Cine Posta aparece ligado a Super Mario Galaxy y Wonka, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'keke-palmer': {
		biography: [
			'Lauren Keyana «Keke» Palmer (Harvey, Illinois; 26 de agosto de 1993) es una actriz y cantante estadounidense.',
			'Fue incluida en la lista de la revista Time de las personas más influyentes del mundo en 2019. Palmer hizo su debut actoral en Barbershop 2: Back in Business (2004). Más tarde apareció en la película para televisión The Wool Cap (2004) y tuvo su gran avance protagonizando la película dramática Akeelah and the Bee (2006).',
			'Conocida por interpretar papeles protagónicos y de personajes en producciones de comedia dramática, ha recibido un Premio Primetime Emmy, cinco Premios NAACP Image y nominaciones para un Premio Daytime Emmy y un Premio del Sindicato de Actores.'
		],
	},
	'kieran-culkin': {
		biography: [
			'Kieran Kyle Culkin (Nueva York, 30 de septiembre de 1982) es un actor estadounidense. Conocido por interpretar personajes desagradables pero simpáticos en el escenario y la pantalla, sus galardones incluyen un premio Oscar, un premio BAFTA, un premio Primetime Emmy y dos premios Globo de Oro.',
			'Culkin comenzó su carrera cuando era niño en producciones teatrales para la Light Opera of Manhattan.',
			'Hizo su debut cinematográfico junto a su hermano mayor, Macaulay, en la comedia navideña Home Alone (1990); más tarde repitió su papel en su secuela Home Alone 2: Lost in New York (1992).'
		],
	},
	'kirsten-dunst': {
		biography: [
			'Kirsten Caroline Dunst (Point Pleasant, Nueva Jersey; 30 de abril de 1982) es una actriz estadounidense. También ha realizado incursiones como cantante, modelo y productora de cine. Debutó en el medio cinematográfico con Oedipus Wrecks, un cortometraje de Woody Allen perteneciente a la antología cinematográfica Historias de Nueva York (1989).',
			'En 2001, la actriz hizo su debut como cantante en el filme Get Over It, en el cual interpretó dos canciones.',
			'A los doce años fue reconocida por su interpretación de la vampiresa Claudia en Entrevista con el vampiro (1994), papel por el cual fue nominada al Globo de Oro como mejor actriz de reparto. Ese mismo año actuó en la película Mujercitas, lo que contribuyó al aumento de su popularidad.'
		],
	},
	'kristen-wiig': {
		biography: [
			'Kristen Carroll Wiig (Canandaigua, Nueva York, 22 de agosto de 1973) es una actriz de cine y televisión estadounidense, que formó parte de Saturday Night Live desde 2005 hasta 2012.',
			'Wiig fue miembro del grupo The Groundlings, y ha aparecido en varias películas y series de televisión, incluyendo Bridesmaids, MacGruber, Flight of the Conchords, Adventureland y Paul.',
			'Sus papeles como actriz de voz incluyen a "Ruffnut" en Cómo entrenar a tu dragón y "Lola Bunny" en la serie The Looney Tunes Show.'
		],
	},
	'laurence-fishburne': {
		biography: [
			'Laurence John Fishburne III (Augusta, Georgia, 30 de julio de 1961), conocido como Laurence Fishburne, es un actor de cine estadounidense.',
			'Ha participado también en la popular serie de CBS, CSI, y representó a Perry White en la cinta El Hombre de Acero (2013) y su continuación en Batman v Superman: Dawn of Justice (2016).',
			'En 1993 fue nominado al premio Óscar al mejor actor por la película What\'s Love Got to Do with It, un biopic sobre la vida de la cantante Tina Turner, en la que Fishburne interpretaba a un personaje Villano Ike Turner.'
		],
	},
	'liam-neeson': {
		biography: [
			'William John Neeson (Ballymena, Irlanda del Norte, 7 de junio de 1952), conocido como Liam Neeson, es un actor británico. En 1976 comenzó a actuar en el Teatro Lírico de Belfast, donde estuvo dos años y en 1978 hace su debut en The Pilgrim\'s Progress.',
			'Su primer papel reseñable en el cine fue el de la película Excalibur de 1981.',
			'La fama mundial le llegó con su interpretación de Oskar Schindler en la aclamada película La lista de Schindler (1993), dirigida por Steven Spielberg, un papel por el que fue nominado a los premios Óscar.'
		],
	},
	'linda-hamilton': {
		biography: [
			'Linda Carroll Hamilton (Salisbury, Maryland; 30 de septiembre de 1956) es una actriz estadounidense.',
			'También protagonizó la serie de televisión La Bella y la Bestia.',
			'Realizó el papel más notable como Sarah Connor en las películas The Terminator, Terminator 2: Judgment Day y Terminator: Dark Fate, así como en otras películas.'
		],
	},
	'luca-guadagnino': {
		biography: [
			'Luca Guadagnino (Palermo, 10 de agosto de 1971) es un director, guionista y productor de cine italiano. Nominado al Óscar a la Mejor Película y BAFTA al Mejor Director, por su película Call Me by Your Name (2017), Guadagnino lleva una extensa carrera de más de tres décadas.',
			'Ganó reconocimiento con su película Melissa P (2005).',
			'Ha colaborado en varios proyectos con Tilda Swinton: las películas The Protagonists (1999), Soy el amor (2010) y Cegados por el sol (2015).'
		],
	},
	'luis-brandoni': {
		birthPlace: 'Dock Sud, Avellaneda, provincia de Buenos Aires',
	},
	'luis-ziembrowski': {
		birthPlace: 'Buenos Aires',
	},
	'lupita-nyong-o': {
		biography: [
			'Lupita Amondi Nyong\'o Buyu (Ciudad de México, 1 de marzo de 1983) es una actriz kenianomexicana.',
			'En 2013 se convirtió en la primera actriz keniata y mexicana en ganar un Óscar a mejor actriz de reparto. También ha recibido un premio Daytime Emmy, y nominaciones a dos premios de la Academia de Cine Británica, un Globo de Oro y un premio Tony.',
			'Saltó a la fama en 2013 con su papel como Patsey en la película 12 Years a Slave, del director británico Steve Rodney McQueen, por la que fue aclamada por la crítica.'
		],
	},
	'mads-mikkelsen': {
		biography: [
			'Mads Dittmann Mikkelsen (Østerbro, Copenhague, 22 de noviembre de 1965) es un actor, gimnasta y bailarín danés.',
			'Saltó a la fama en su natal Dinamarca como actor por sus papeles como Tonny en las dos primeras películas de la trilogía cinematográfica Pusher (1996 y 2004), el sargento detective Allan Fischer en la serie de televisión Rejseholdet (2000‑2004), Niels en Open Hearts (2002), Svend en The green butchers (2003), Iván en Adam’s apples (2005), Jacob Petersen en Después de la boda (2006), Le Chiffre en Casino Royale (película de 2006), Hannibal Lecter en la serie de televisión Hannibal (2013) y Jürgen Voller en Indiana Jones y el dial del destino (2023).'
		],
	},
	'mahershala-ali': {
		biography: [
			'Mahershala Ali, nacido como Mahershalalhashbaz Gilmore (Oakland, California, 16 de febrero de 1974) es un actor estadounidense, ganador de dos Premios Óscar como mejor actor de reparto por las películas Moonlight (2016) y Green Book (2018) y dos Premios del Sindicato de Actores también como actor secundario.',
			'La revista Time lo nombró una de las "100 personas más influyentes del mundo" en 2019.'
		],
	},
	'margaret-qualley': {
		biography: [
			'Sarah Margaret Qualley (Kalispell, Montana; 23 de octubre de 1994) es una actriz estadounidense.',
			'Hija de la también intérprete Andie MacDowell, practicó ballet desde pequeña y su interés por esa danza la llevó a anotarse en la North Carolina School of the Arts a los catorce años. A los dieciséis, tomó clases de verano en el American Ballet Theatre, pero para cuando le ofrecieron una pasantía había decidido no continuar con esa disciplina. Durante un tiempo prosiguió su carrera ejerciendo como modelo, hasta que se decantó por la actuación y formó parte de un programa de verano de la Real Academia de Arte Dramático. Su primer trabajo fue una participación menor en la película de 2013 Palo Alto, donde se la seleccionó porque no conseguían otra candidata. Un año más tarde se hizo con un papel en la serie de televisión The Leftovers, en la que tuvo mayor implicación, aunque su personaje recibió críticas negativas por su desarrollo. En 2016 adquirió más popularidad, cuando protagonizó un video publicitario para el perfume Kenzo World en que se la muestra bailando de manera poco convencional. Al año siguiente, su interpretación de monja católica que atraviesa una crisis de fe en Novitiate le reportó comentarios positivos de los medios. Al mismo tiempo, coprotagonizó Death Note (2017), adaptación de Netflix del manga homónimo muy criticada por los espectadores y la prensa, a quienes el desempeño de Qualley no convenció. Más tarde, se valió de sus habilidades como bailarina en videos musicales para artistas como SoKo, Cashmere Cat y, también, su hermana, Rainey Qualley. De manera semejante, por su interpretación de la coreógrafa Ann Reinking en Fosse/Verdon (2019) recibió una nominación al premio Primetime Emmy a la mejor actriz de reparto - Miniserie o telefilme. Continuó afianzándose como actriz principal con producciones como IO, Strange but True (2019) y My Salinger Year (2020). Su interpretación de una empleada doméstica y madre soltera en la miniserie Maid (2021) suscitó comentarios positivos de la prensa, además de que por ello se la nominó, entre otros premios, al Globo de Oro, al Primetime Emmy y al del Sindicato de Actores. Sus siguientes proyectos cinematográficos tuvieron elementos eróticos: en Stars at Noon fue una periodista que se prostituye con funcionarios gubernamentales por motivos de seguridad, y en Sanctuary (2022) interpretó a una dominatrix que chantajea a un cliente. Casada desde 2023 con el cantante de Bleachers, Jack Antonoff, ese año participó en dos videos musicales del grupo, uno de los cuales dirigió. En 2024 trabajó en Drive-Away Dolls, una comedia dirigida por Ethan Coen, y en La sustancia, por la que fue nominada al Globo de Oro.'
		],
	},
	'margot-robbie': {
		biography: [
			'Margot Elise Robbie (Dalby, Queensland, 2 de julio de 1990) es una actriz y productora australiana.',
			'Luego de su salida, se mudó a los Estados Unidos y protagonizó la serie Pan Am en el 2011, y más tarde comenzó a ganar popularidad por su papeles en las exitosas películas El lobo de Wall Street (2013) y Focus (2015).',
			'Su filmografía incluye tanto películas taquilleras como independientes, y entre sus galardones incluye nominaciones a tres Premios Óscar, seis Premios BAFTA y cuatro Premios Globo de Oro.'
		],
	},
	'mark-hamill': {
		biography: [
			'Mark Richard Hamill (Oakland, California, 25 de septiembre de 1951) es un actor de cine, televisión, voz, director, productor y escritor estadounidense.',
			'Es conocido por interpretar a Luke Skywalker en la serie de películas Star Wars, ganando tres premios Saturn por el papel.',
			'Es un actor de doblaje prolífico que ha interpretado personajes en muchas series de televisión animadas, películas y videojuegos.'
		],
	},
	'mark-ruffalo': {
		biography: [
			'Mark Alan Ruffalo (Kenosha, Wisconsin, 22 de noviembre de 1967) es un actor, actor de voz, productor y director estadounidense.',
			'Inició su carrera como actor en los años 1990 apareciendo en varias series de televisión y películas con papeles menores hasta que logró reconocimiento con la película Puedes contar conmigo (2000).',
			'Más tarde, protagonizó comedias románticas como Eternal Sunshine of the Spotless Mind (2004), 13 Going on 30 (2004) y Dicen por ahí... (2005), así como los suspensos Zodiac (2007) y Shutter Island (2010); también ganó reconocimiento en el teatro gracias a su participación en la obra Awake and Sing!, con la que fue nominado a los premios Tony de 2006.'
		],
	},
	'marlon-brando': {
		biography: [
			'Marlon Brando Jr. (Omaha, Nebraska, 3 de abril de 1924-Los Ángeles, California, 1 de julio de 2004) fue un actor estadounidense de cine y teatro.',
			'Su formación e instrucción teatral fue llevada a cabo por Stella Adler, una de las más prestigiosas profesoras que desarrollaron el sistema Stanislavski en Nueva York (véase actuación de método); muchos sábados acudía al Actor\'s Studio interesado en las clases de Elia Kazan. Se convirtió en actor de teatro a mediados de la década de 1940 y en actor de cine a comienzos de los años 1950.',
			'A lo largo de su carrera recibió múltiples reconocimientos por sus logros artísticos, entre ellos dos premios Óscar al mejor actor —por On the Waterfront (1954) y El padrino (1972)—, dos Globo de Oro y tres BAFTA. Se hizo mundialmente conocido en la década de 1950 por sus intervenciones en películas como Un tranvía llamado Deseo (1951), ¡Viva Zapata! (1952), Julio César y On the Waterfront (1954), entre otras.'
		],
	},
	'martina-gusman': {
		birthPlace: 'Buenos Aires',
	},
	'matt-damon': {
		biography: [
			'Matthew Paige Damon (Cambridge, Massachusetts, 8 de octubre de 1970), conocido simplemente como Matt Damon, es un actor, guionista y productor estadounidense.',
			'Desde temprana edad se destacó en sus estudios y comenzó a mostrar interés por la actuación durante la secundaria gracias a sus maestros.',
			'Tras varias apariciones como extra, hizo su debut como protagonista con la película School Ties (1992) y después logró mayor reconocimiento con su papel en Good Will Hunting (1997), que le valió una nominación al Óscar como mejor actor y un galardón por mejor guion original.'
		],
	},
	'matt-reeves': {
		biography: [
			'Matthew George "Matt" Reeves (Rockville Centre, Nueva York; 27 de abril de 1966) es un director, guionista y productor de cine estadounidense.',
			'En Cine Posta su obra queda conectada con Dawn of the Planet of the Apes, The Batman y War for the Planet of the Apes, que hoy funcionan como entrada rápida a su filmografía dentro del sitio.'
		],
	},
	'mauricio-dayub': {
		birthPlace: 'Paraná, Entre Ríos',
	},
	'mel-gibson': {
		biography: [
			'Mel Colm-Cille Gerard Gibson (Peekskill, Nueva York, 3 de enero de 1956), conocido como Mel Gibson, es un actor, director y productor de cine estadounidense.',
			'Abanderado de la mejor generación del cine australiano y tras lograr la fama en Hollywood con las series de películas Mad Max y Lethal Weapon, Gibson se embarcó en dirigir y actuar en la película Braveheart, ganadora de cinco Premios Óscar, incluyendo mejor película y mejor dirección.',
			'Fue designado como enviado presidencial de Donald Trump en Hollywood en enero de 2025.'
		],
	},
	'melissa-barrera': {
		biography: [
			'Melissa Barrera Martínez (Monterrey, Nuevo León; 4 de julio de 1990) es una actriz y cantante mexicana.',
			'Barrera es conocida por sus trabajos en telenovelas como Siempre tuya Acapulco (2013) y Tanto amor (2015), en series como Club de Cuervos (2017), Vida (2018-2020) y Keep Breathing (2022), y en películas como In the Heights (2021), Scream (2022), Scream VI (2023), y Abigail (2024)'
		],
	},
	'michael-b-jordan': {
		biography: [
			'Michael Bakari Waterson Jordan (Santa Ana, California; 9 de febrero de 1987), popularmente conocido como Michael B.',
			'Dentro de sus primeros trabajos se encuentran las series de televisión The Wire y Friday Night Lights.',
			'Ganador del Premio Óscar y del Premio SAG a Mejor Actor por su papel en Sinners (2025), también es conocido por interpretar al personaje de Erik Killmonger, el primo y enemigo de T\'Challa en el Universo cinematográfico de Marvel, en Black Panther (2018), y a Adonis Creed, hijo del boxeador ficticio Apollo Creed, en Creed (2015), Creed II (2018) y Creed III (2023).'
		],
	},
	'michael-caine': {
		biography: [
			'Michael Caine (Londres, 14 de marzo de 1933) es un actor británico, famoso por su particular acento inglés de cockney.',
			'Ha aparecido en más de 150 películas a lo largo de su carrera y es considerado una leyenda en la industria cinematográfica británica. Logró el reconocimiento del público en los sesenta con las cintas inglesas Zulu de 1964, Archivo confidencial de 1965, Alfie de 1966, por la cual aspiró al Óscar, The Italian Job de 1969 y La batalla de Inglaterra de 1969.',
			'Entre sus películas más importantes durante los setenta se encuentran: Asesino implacable de 1971, El último valle de 1972, La huella, la cual le dio su segunda candidatura al Óscar, El hombre que pudo reinar de 1975 y Un puente lejano de 1977.'
		],
	},
	'michael-fassbender': {
		biography: [
			'Michael Fassbender (Heidelberg, República Federal de Alemania, 2 de abril de 1977) es un actor, productor de cine y piloto de carreras germanoirlandés.',
			'Su debut en el cine fue con la película 300 (2007).',
			'En 2008 con el filme Hunger (2008) obtuvo su primer papel protagonista, el cual fue bien recibido por parte de la crítica y con el cual ganó su primer British Independent Film Awards.'
		],
	},
	'michael-j-fox': {
		biography: [
			'Michael Andrew Fox (Edmonton, 9 de junio de 1961), conocido artísticamente como Michael J.',
			'Fox, es un actor canadiense y estadounidense. Su carrera en el cine y la televisión comenzó a finales de los años setenta.',
			'Entre sus papeles se destacan Marty McFly en la trilogía de Back to the Future (1985-1990); Alex Keaton en Family Ties (1982-1989), por la cual ganó tres premios Emmy y un Globo de Oro, y Mike Flaherty en Spin City (1996-2000), por la cual ganó un Emmy, dos Globos de Oro y dos SAG.'
		],
	},
	'michael-keaton': {
		biography: [
			'Michael John Douglas (Coraopolis, Pensilvania, 5 de septiembre de 1951), más conocido por su nombre artístico Michael Keaton, es un actor estadounidense, ganador de un Globo de Oro.',
			'Es conocido por su vasta carrera e intervenciones en películas como la comedía de humor negro Beetlejuice (1988), encarnar al superhéroe de DC Comics, Batman, en Batman (1989) y su secuela, Batman Returns (1992) —las tres dirigidas por Tim Burton— con las que saltaría a la fama mundial y ganaría la aclamación de la crítica.',
			'También actuó en Multiplicity (1996), en el drama Jackie Brown (1997), en la comedia navideña Jack Frost (1999), White Noise (2005), en Toy Story 3 (2010) como la voz de Ken, en el drama Spotlight (2015), en la película biográfica The Founder (2016) como Ray Kroc, en Spider-Man: Homecoming (2017) como el supervillano de Marvel Comics, Buitre, y en la película drámatica legal histórica The Trial of the Chicago 7 (2020) como Ramsey Clark, con la que ganaría múltiples premios.'
		],
	},
	'michael-shannon': {
		biography: [
			'Michael Corbett Shannon (Lexington, Kentucky, 7 de agosto de 1974) es un actor estadounidense.',
			'El debut cinematográfico de Shannon fue en El día de la marmota (1993).',
			'Shannon recibió dos nominaciones al Premio de la Academia al Mejor Actor de Reparto, por Revolutionary Road (2008) y Nocturnal Animals (2016).'
		],
	},
	'michelle-williams': {
		biography: [
			'Michelle Ingrid Williams (Kalispell, Montana, 9 de septiembre de 1980) es una actriz estadounidense.',
			'Desde pequeña comenzó a actuar en producciones locales hasta que en 1994 hizo su debut en la película Lassie.',
			'Ganadora de un Premio Primetime Emmy y tres Premios Globo de Oro, también ha sido nominada a los Premios Tony y Premios Óscar.'
		],
	},
	'mikey-madison': {
		biography: [
			'Mikaela «Mikey» Madison Rosberg (Los Ángeles, California; 25 de marzo de 1999) es una actriz estadounidense. Comenzó su carrera actuando en cortometrajes y recibió reconocimiento por su papel de una adolescente hosca en la serie de comedia de FX Better Things (2016-2022), y por Anora (2024) de Sean Baker, obteniendo el Premio Óscar a la mejor actriz por esta última.',
			'También interpretó a Susan Atkins en la película de comedia dramática de época de Quentin Tarantino, Once Upon a Time in Hollywood (2019) y a Amber Freeman en la película de terror Scream (2022). En 2024, Madison protagonizó la comedia dramática Anora, dirigida por Sean Baker, siendo elogiada por la crítica cinematográfica.',
			'Por la película recibió nominaciones a mejor actriz en los Globos de Oro, los Premios BAFTA y los Premios Óscar, entre otros, resultando ganadora en las dos últimas entregas de premios por su actuación.'
		],
	},
	'miles-teller': {
		biography: [
			'Miles Alexander Teller (Downingtown, Pensilvania; 20 de febrero de 1987) es un actor estadounidense.',
			'Posteriormente, comenzó a estudiar actuación del método en el Instituto de Teatro y Cine Lee Strasberg y apareció en varios cortometrajes hasta debutar formalmente en el cine con la película Rabbit Hole (2010), en la que fue escogido personalmente por Nicole Kidman.',
			'Tras su debut, Teller ganó reconocimiento protagonizando la película The Spectacular Now (2013), en la cual recibió elogios de la crítica y ganó el premio especial del jurado en el Festival de Cine de Sundance de 2013.'
		],
	},
	'nahuel-perez-biscayart': {
		birthPlace: 'Buenos Aires',
	},
	'neve-campbell': {
		biography: [
			'Neve Adrianne Campbell (Guelph, Ontario; 3 de octubre de 1973) es una actriz canadiense.',
			'Campbell es reconocida por su trabajo en los géneros de drama y terror, por lo que es considerada como una reina del grito. Después de una serie de apariciones menores, Campbell interpretó un papel protagónico en la serie dramática canadiense Catwalk (1992-1994) y la película para televisión The Canterville Ghost (1996), esta última le valió un premio Family Film Awards a la mejor actriz.',
			'Posteriormente se mudó a los Estados Unidos para interpretar el papel de Julia Salinger en la serie dramática para adolescentes de Fox Party of Five (1994-2000), que fue su papel decisivo, lo que le valió el reconocimiento como ídolo adolescente y una nominación al premio Teen Choice Awards a la mejor actriz de televisión.'
		],
	},
	'nicholas-hoult': {
		biography: [
			'Nicholas Caradoc Hoult (Wokingham, Inglaterra; 7 de diciembre de 1989) es un actor británico.',
			'Su exitoso comienzo en el séptimo arte se da al interpretar con 11 años a Marcus en About a Boy (2002) —previamente, había intervenido en pequeños roles televisivos y cinematográficos en la televisión británica desde que se inicia en la actuación a los 3 años debutando en la película Intimate Relations (1996)— Desde entonces, su legado no ha dejado de extenderse, interviniendo en series y largometrajes.',
			'A sus 17 años da vida al personaje Tony Stonem en la serie británica Skins (2007-2008), papel que lo ayuda a hacer la transición de estrella infantil a papeles más oscuros en la industria del cine, alcanzando éxito y reconocimiento. Y no sería hasta una década más tarde, que regresaría a una serie para interpretar al emperador Pedro III de Rusia en The Great (2020-2023) que le otorga nominaciones a dos Premios Globo de Oro y un Premio Primetime Emmy.'
		],
	},
	'nicolas-cage': {
		biography: [
			'Nicolas Kim Coppola (Long Beach, California, 7 de enero de 1964), conocido profesionalmente como Nicolas Cage, es un actor, actor de voz y productor de cine estadounidense. Ha recibido varios galardones, entre ellos un Premio de la Academia, un Premio del Screen Actors Guild y un Premio Globo de Oro.',
			'Conocido por su versatilidad como actor, su participación en varios géneros cinematográficos le ha valido seguidores de culto. Nacido en el seno de la familia Coppola, Cage comenzó su carrera en películas como Fast Times at Ridgemont High (1982) y Valley Girl (1983), así como diversas películas de su tío Francis Ford Coppola como La ley de la calle (1983), The Cotton Club (1984) y Peggy Sue se casó (1986).',
			'Obtuvo éxito de crítica por sus papeles en Hechizo de luna (1987) y Raising Arizona (1987), y obtuvo un Premio de la Academia al Mejor Actor por su actuación en la película dramática Leaving Las Vegas (1995).'
		],
	},
	'norma-aleandro': {
		birthPlace: 'Buenos Aires',
	},
	'orlando-bloom': {
		biography: [
			'Orlando Jonathan Blanchard Copeland Bloom (Canterbury, Kent, 13 de enero de 1977) es un actor británico.',
			'Bloom hizo su debut teatral en el escenario del Duke of York, con un papel en la obra In Celebration, que se representó hasta 2007.',
			'Su salto a la fama se produjo con dos papeles protagonistas en grandes producciones: en 2001 el del príncipe elfo Legolas en El Señor de los Anillos: la Comunidad del Anillo, primera película de la trilogía basada en la novela de J.'
		],
	},
	'oscar-isaac': {
		biography: [
			'Óscar Isaac Hernández Estrada (Ciudad de Guatemala, 9 de marzo de 1979), conocido como Oscar Isaac, es un actor y productor de cine guatemaltecoestadounidense. Entre sus papeles más relevantes se encuentran Poe Dameron, en la serie de películas de Star Wars y sus papeles principales en Inside Llewyn Davis (2013), por la que recibió una nominación al Globo de Oro, El año más violento (2014), Ex Machina (2015) y Moon Knight, en la serie de televisión homónima de Disney+.',
			'En Cine Posta aparece ligado a Frankenstein, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'oscar-martinez': {
		birthPlace: 'Buenos Aires',
	},
	'pamela-anderson': {
		biography: [
			'Pamela Denise Anderson (Ladysmith, Columbia Británica, 1 de julio de 1967) es una actriz y modelo de glamour canadoestadounidense.',
			'Luego recibió reconocimiento internacional por protagonizar a "CJ" Parker en la serie dramática de acción Baywatch (1992-1997), que consolidó aún más su estatus como símbolo sexual.',
			'Luego pasó a interpretar a Vallery Irons en la serie sindicada VIP (1998-2002) y a Skyler Dayton en la comedia de Fox Stacked (2005-2006).'
		],
	},
	'patricia-arquette': {
		biography: [
			'Patricia Tarrey Arquette (Chicago, 8 de abril de 1968) es una actriz estadounidense ganadora de un Premio Óscar, tres Globos de Oro, un BAFTA, dos Premios del Sindicato de Actores y dos Emmy.',
			'Arquette hizo su debut cinematográfico como Kristen Parker en el slasher de fantasía A Nightmare on Elm Street 3: Dream Warriors (1987).',
			'Por interpretar a una madre soltera en la película de mayoría de edad Boyhood (2014), que se filmó entre 2002 y 2014, Arquette ganó el Óscar a la mejor actriz de reparto.'
		],
	},
	'patrick-stewart': {
		biography: [
			'Sir Patrick Stewart (Mirfield, Inglaterra, 13 de julio de 1940) es un actor británico de cine, televisión y doblaje, conocido principalmente por sus papeles en obras de teatro de William Shakespeare y, especialmente, por ser Jean-Luc Picard, capitán, principalmente en la serie Star Trek: The Next Generation y en las películas Star Trek: Generations, Star Trek: First Contact, Star Trek: Insurrection y Star Trek: Nemesis; y como almirante retirado en la serie Star Trek: Picard de la saga de Star Trek, así como el Profesor Xavier, en las películas de X-Men.',
			'Fue nombrado oficial de la Orden del Imperio Británico en la lista honorífica de año nuevo de 2001.',
			'Sus padres no le dieron un segundo nombre, pero usó profesionalmente «Patrick Hewes Stewart» —añadiendo como segundo nombre «Hewes»— durante un tiempo en la década de 1980.'
		],
	},
	'paul-dano': {
		biography: [
			'Paul Franklin Dano (Nueva York, 19 de junio de 1984) es un actor, guionista y director de cine estadounidense.',
			'Ha trabajado, entre otras, en las películas There Will Be Blood, Little Miss Sunshine, Ruby Sparks, Love & Mercy, Looper, 12 Years a Slave, Prisoners, Youth, Okja y The Batman. En 2018, debutó como director con Wildlife.'
		],
	},
	'paul-giamatti': {
		biography: [
			'Paul Edward Valentine Giamatti (New Haven, Connecticut, 6 de junio de 1967) es un actor estadounidense.',
			'Comenzó su carrera como actor secundario durante los años 1990 en producciones como Private Parts, The Truman Show, Saving Private Ryan, El negociador y Man on the Moon, antes de conseguir papeles como protagonista durante los años 2000 en películas como American Splendor, Entre copas, Cinderella Man, John Adams, Lady in the Water y Cold Souls.',
			'Durante su carrera ha sido nominado a dos Óscar y ha ganado tres Globo de Oro.'
		],
	},
	'paul-mescal': {
		biography: [
			'Paul Colm Michael Mescal (Maynooth, Kildare, 2 de febrero de 1996) es un actor irlandés.',
			'Inició su carrera en 2013 como actor de teatro apareciendo en numerosas obras en Dublín.',
			'Posteriormente, ganó reconocimiento en la televisión al protagonizar la miniserie Normal People con el personaje de Connell Waldron, actuación que le valió un BAFTA TV y una nominación a los premios Emmy.'
		],
	},
	'paul-rudd': {
		biography: [
			'Paul Stephen Rudd (Passaic, Nueva Jersey, 6 de abril de 1969) es un actor, comediante, escritor y productor de cine estadounidense.',
			'Estudió teatro en la Universidad de Kansas y en la Academia Estadounidense de Artes Dramáticas, antes de hacer su debut como actor en 1992 con la serie dramática titulada Sisters de NBC.',
			'Es conocido por sus papeles en las películas: Clueless (1995), Romeo + Juliet (1996), The Object of My Affection (1998), Wet Hot American Summer (2001), Anchorman: The Legend of Ron Burgundy (2004), The 40 Year Old Virgin (2005), Knocked Up (2007), Role Models (2008), I Love You, Man (2009), This Is 40 (2012), The Perks of Being a Wallflower (2012), Anchorman 2: The Legend Continues (2013), Los principios del cuidado (2016), Mute (2018) e Ideal Home (2018).'
		],
	},
	'paul-thomas-anderson': {
		biography: [
			'Paul Thomas Anderson (Studio City, California; 26 de junio de 1970) es un director, guionista y productor de cine estadounidense.',
			'Ha dirigido diez largometrajes: Sydney (1996), Boogie Nights (1997), Magnolia (1999), Embriagado de amor (2002), There Will Be Blood (2007), The Master (2012), Puro vicio (2014), Phantom Thread (2017), Licorice Pizza (2021) y Una batalla tras otra (2025).',
			'Ha estado nominado a ocho premios Óscar por Phantom Thread (mejor película, mejor director), There Will Be Blood (mejor director, mejor película y mejor guion adaptado), Inherent Vice (mejor guion adaptado), Magnolia (mejor guion original) y Boogie Nights (mejor guion original); ha ganado el premio a (mejor director) del Festival de Cannes por Embriagado de amor, un Oso de Oro y un Oso de Plata a la mejor dirección del Festival internacional de Cine de Berlín y un León de Plata al mejor director del Festival internacional de Cine de Venecia.'
		],
	},
	'paul-walker': {
		biography: [
			'Paul William Walker IV (Glendale, California, 12 de septiembre de 1973-Santa Clarita, California, 30 de noviembre de 2013) fue un actor, modelo, piloto de carreras y biólogo marino estadounidense, conocido por su papel de Brian O\'Conner en la película de acción The Fast and the Furious, repitiéndolo en cinco ocasiones de las siguientes películas de la franquicia.',
			'Tras licenciarse en Biología Marina en la Universidad de California, estudios que compaginó con su carrera como modelo profesional, Walker inició su trayectoria como actor con apariciones en varios programas de televisión como The Young and the Restless y Touched by an Angel.',
			'También obtuvo fama a través de películas para adolescentes tales como Alguien como tú y Juego de campeones.'
		],
	},
	'pedro-pascal': {
		biography: [
			'José Pedro Balmaceda Pascal (Santiago de Chile, 2 de abril de 1975), conocido como Pedro Pascal, es un actor de cine, teatro y televisión, actor de voz y director de escena chileno, nacionalizado estadounidense, conocido por interpretar al príncipe Oberyn Martell en la serie de televisión Game of Thrones (2014), a Javier Peña en Narcos (2015–2017) de Netflix; a el Mandaloriano en la serie The Mandalorian (2019–2023), y por la serie The Last of Us (2023–2025) de HBO, donde interpreta a Joel Miller.',
			'En cine, ha protagonizado grandes blockbuster como Wonder Woman 1984 (2020), Gladiator II (2024) o The Fantastic Four: First Steps (2025).',
			'Nominado al Premio Globo de Oro, a los Premios Primetime Emmy y ganador de un Premio del Sindicato de Actores; en 2023, la revista Time le nombró una de las 100 personas más influyentes del mundo.'
		],
	},
	'penelope-cruz': {
		biography: [
			'Penélope Cruz Sánchez (Alcobendas, 28 de abril de 1974) es una actriz, cantante y modelo española. En 2006 fue la primera actriz española candidata a los Premios Óscar y a los Globos de Oro en la categoría de mejor actriz protagonista, por su papel en la película española Volver, dirigida por el cineasta español Pedro Almodóvar; en esa ocasión no obtuvo el Óscar, pero en 2008 se convirtió en la primera actriz española en conseguir el Óscar como mejor actriz de reparto gracias a la película Vicky Cristina Barcelona dirigida por Woody Allen. Con esta película ganó además el premio BAFTA, su tercer Goya, y fue nominada a los Globos de Oro y al Premio del Sindicato de Actores.',
			'Penélope Cruz volvió a ser nominada al Óscar como mejor actriz de reparto de 2010 por su papel en Nine y en 2022 en la categoría de mejor actriz protagonista por su papel en la película de Almodóvar, Madres paralelas.',
			'En 2018 recibió Medalla de Oro al Mérito en las Bellas Artes, concedida por el Gobierno de España. En 2019 recibió el Premio Donostia y fue el rostro identificativo del 67 Festival de cine de San Sebastián. En 2022 le fue concedido el Premio Nacional de Cinematografía.'
		],
	},
	'pierce-brosnan': {
		biography: [
			'Pierce Brendan Brosnan (Drogheda, Leinster; 16 de mayo de 1953) es un actor y productor de cine irlandés. Fue el quinto actor en interpretar al agente secreto ficticio James Bond en la saga cinematográfica de James Bond, protagonizando cuatro películas entre 1995 y 2002 (GoldenEye, El mañana nunca muere, El mundo nunca es suficiente y Muere otro día).',
			'Tras una carrera como actor de teatro, saltó a la popularidad en la serie de televisión Remington Steele (1982-1987).',
			'Tras alcanzar fama mundial por su papel de James Bond, Brosnan protagonizó otras películas importantes, entre ellas la épica película de aventuras y desastres Dante\'s Peak (1997) y la nueva versión de la película de atraco The Thomas Crown Affair (1999).'
		],
	},
	'rachel-mcadams': {
		biography: [
			'Rachel Anne McAdams (London, Ontario, 17 de noviembre de 1978) es una actriz canadiense.',
			'Después de graduarse de un programa de grado en teatro en la Universidad York en 2001, trabajó en producciones cinematográficas y televisivas canadienses, como la película dramática Perfect Pie (2002), por la que recibió una nominación al premio Genie, la película de comedia, My Name Is Tanino (2002) y la serie de comedia Slings and Arrows (2003-2005), por la que ganó un premio Gemini.',
			'McAdams saltó a la fama en 2004 con la comedia Mean Girls y el drama romántico The Notebook. En 2005 protagonizó la comedia romántica Wedding Crashers, el thriller psicológico Red Eye y la comedia dramática The Family Stone.'
		],
	},
	'rachel-zegler': {
		biography: [
			'Rachel Anne Zegler (Hackensack, Nueva Jersey, 3 de mayo de 2001) es una actriz y cantante estadounidense.',
			'Es conocida por películas como West Side Story (2021), ¡Shazam!',
			'La furia de los dioses (2023), Los juegos del hambre: balada de pájaros cantores y serpientes (2023), y Snow White (2025).'
		],
	},
	'ralph-fiennes': {
		biography: [
			'Ralph Nathaniel Twisleton-Wykeham-Fiennes (Ipswich, Inglaterra, 22 de diciembre de 1962), conocido artísticamente como Ralph Fiennes, es un actor y director británico, nominado tres veces al Premio Oscar.',
			'En Cine Posta aparece ligado a 28 Years Later: The Bone Temple, 28 Years Later y Conclave, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'rami-malek': {
		biography: [
			'Rami Said Malek (Torrance, California, 12 de mayo de 1981) es un actor estadounidense.',
			'Es conocido principalmente por su papel como Elliot Alderson en la serie televisiva Mr. Robot, por el que ganó un premio Emmy y un Premio de la Crítica Televisiva, y por encarnar a la leyenda del Rock Freddie Mercury en la película biográfica Bohemian Rhapsody, interpretación por la cual ganó un premio Óscar, un Globo de Oro, un SAG y un BAFTA, entre otros, al mejor actor.',
			'Malek también ha interpretado personajes notables en el cine y televisión como el faraón Ahkmenrah en la trilogía Night at the Museum, Kenny en la serie de FOX The War at Home (La guerra en casa), y Merriel "Snafu" Shelton en la miniserie de HBO The Pacific.'
		],
	},
	'rebecca-ferguson': {
		biography: [
			'Rebecca Louisa Ferguson Sundström (Estocolmo, 19 de octubre de 1983), conocida artísticamente como Rebecca Ferguson, es una actriz sueca, reconocida por haber interpretado a Anna Gripenhielm en Nya tider, a Chrissy Eriksson en la serie Ocean Ave, a Elizabeth Woodville en The White Queen, a Jessica Atreides en Dune y por dar vida a Ilsa Faust en las películas Misión: Imposible - Nación Secreta, Misión Imposible - Fallout y Misión imposible: sentencia mortal.',
			'En Cine Posta aparece ligado a Mercy, Peaky Blinders: El hombre inmortal y Dune: Part Two, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'rebecca-hall': {
		biography: [
			'Rebecca Maria Hall (Londres, 3 de mayo de 1982), conocida como Rebecca Hall, es una actriz, directora y productora británica de cine y televisión.',
			'En junio de 2010, ganó el premio BAFTA a la mejor actriz de reparto por su interpretación como Paula Garland en la adaptación televisiva de Red Riding, del 2009. En el 2021 debutó como directora con el drama Passing.',
			'Es hija del director Peter Hall y de la soprano estadounidense Maria Ewing.'
		],
	},
	'renate-reinsve': {
		biography: [
			'Renate Reinsve es una actriz noruega.',
			'Hizo su debut cinematográfico en Oslo, 31 de agosto (2011) antes de protagonizar la película aclamada por la crítica La peor persona del mundo (2021), que le valió el Premio del Festival de Cine de Cannes a la Mejor Actriz y una nominación en los Premios BAFTA. Desde entonces, ha protagonizado la serie de suspenso legal estadounidense Presumed Innocent y la película dramática A Different Man (ambas de 2024).',
			'Se reunió nuevamente con el director Joachim Trier para protagonizar la película Sentimental Value, que le valió una nominación en los Globos de Oro, en la categoría de Mejor Actriz - Drama y a los Premios Óscar en la categoría de Mejor Actriz.'
		],
	},
	'ridley-scott': {
		biography: [
			'Ridley Scott (South Shields, Inglaterra, 30 de noviembre de 1937) es un director de cine, productor y guionista británico.',
			'Comenzando su carrera en la publicidad, donde perfeccionó sus habilidades cinematográficas al hacer mini-películas creativas para comerciales de televisión, el trabajo de Scott es conocido por su estilo visual altamente concentrado y atmosférico. A pesar de que sus películas varían ampliamente en ambientación y época, frecuentemente exhiben imágenes memorables de entornos urbanos, ya sea en el Antiguo Egipto (Exodus: Gods and Kings), el siglo II en Roma (Gladiador), del Jerusalén del siglo XII (Kingdom of Heaven), la Inglaterra medieval (Robin Hood), el contemporáneo Mogadiscio (Black Hawk Down), los paisajes futuros de Blade Runner o los planetas distantes en Alien, Prometheus, The Martian y Alien: Covenant.',
			'Varias de sus películas también son conocidas por sus fuertes personajes femeninos. Scott ha sido nominado tres veces al Óscar al mejor director (por Thelma & Louise, Gladiator y Black Hawk Down). En 1995, tanto Ridley como su hermano Tony recibieron un BAFTA por su destacada contribución británica al cine. En una encuesta de la BBC de 2004, Scott fue nombrado la décima persona más influyente en la cultura británica. En 2015, recibió un doctorado honorario de la Royal College of Art en Londres, y en 2018 recibió la BAFTA Fellowship por el logro de toda la vida.'
		],
	},
	'robert-downey-jr': {
		biography: [
			'Robert John Downey Jr. (Nueva York, 4 de abril de 1965) es un actor, actor de voz, productor y cantante estadounidense.',
			'Inició su carrera como actor a temprana edad en varios filmes dirigidos por su padre, Robert Downey Sr., y en su infancia estudió actuación en varias academias de Nueva York.',
			'Tras numerosos proyectos fallidos, ganó relevancia en el cine protagonizando la película Chaplin (1992), actuación con que ganó un BAFTA y recibió una nominación a los premios Óscar y los Globo de Oro.'
		],
	},
	'robert-eggers': {
		biography: [
			'Robert Houston Eggers, conocido como Robert Eggers (Nueva York, 7 de julio de 1983), es un director de cine, guionista y diseñador de producción estadounidense. Es conocido por sus aclamadas películas La bruja (2015), El faro (2019), El hombre del norte (2022) y Nosferatu (2024). Sus películas se destacan por sus elementos folclóricos y mitológicos, así como por sus denodados esfuerzos por garantizar la autenticidad histórica.',
			'En Cine Posta su obra queda conectada con Nosferatu, que hoy funcionan como entrada rápida a su filmografía dentro del sitio.'
		],
	},
	'robert-englund': {
		biography: [
			'Robert Barton Englund (Glendale, California, 6 de junio de 1947), conocido como Robert Englund, es un actor, actor de voz, cantante y director de cine estadounidense, célebre por interpretar al famoso asesino ficticio Freddy Krueger, en la serie de películas A Nightmare on Elm Street.',
			'Recibió dos nominaciones al Premio Saturn en la categoría de mejor actor de reparto por A Nightmare on Elm Street 3: Dream Warriors (1987) y por A Nightmare on Elm Street 4: The Dream Master (1988) en España.'
		],
	},
	'robert-pattinson': {
		biography: [
			'Robert Douglas Thomas Pattinson (Londres; 13 de mayo de 1986) es un actor, modelo, productor y cantante británico.',
			'Inició su carrera durante su adolescencia como modelo de varias marcas infantiles, pero tras la llegada de su pubertad comenzó a tener problemas para obtener nuevos empleos, por lo que decidió dedicarse a la actuación. Tras aparecer en el telefilme Dark Kingdom: The Dragon King, debutó en el cine con Vanity Fair (2004) y seguidamente ganó reconocimiento al interpretar al personaje de Cedric Diggory en Harry Potter y el cáliz de fuego (2005). Pattinson logró mayor popularidad al interpretar al personaje de Edward Cullen en las películas Twilight (2008), The Twilight Saga: New Moon (2009), The Twilight Saga: Eclipse (2010), The Twilight Saga: Breaking Dawn - Part 1 (2011) y The Twilight Saga: Breaking Dawn - Part 2 (2012), que fueron éxitos en taquilla. Su trabajo en dicha saga lo hizo ganador de dos premios en los Scream Awards, así como de nueve en los MTV Movie Awards y diez en los Teen Choice Awards.',
			'Además de ello, interpretó al personaje de Batman en The Batman (2022).'
		],
	},
	'rosamund-pike': {
		biography: [
			'Rosamund Mary Ellen Pike (Hammersmith, Inglaterra, 1979) es una actriz británica de cine y televisión.',
			'En televisión, destacan sus papeles en A Rather English Marriage (1998), Esposas e hijas (1999), Love in a Cold Climate (2001), State of the Union (2019) o The Wheel of Time (2021-2025).',
			'Es conocida internacionalmente por sus personajes de la villana Miranda Frost en la película de James Bond Die Another Day, Jane Bennet en Orgullo y prejuicio en 2005 y Amy Dunne en Perdida, por el que ha sido nominada a diversos premios entre los cuales destacan el Óscar, el Globo de Oro, el BAFTA y el premio SAG; todos en la categoría de mejor actriz.'
		],
	},
	'rupert-grint': {
		biography: [
			'Rupert Alexander Lloyd Grint (Harlow, Inglaterra, 24 de agosto de 1988) es un actor británico, conocido por interpretar a Ron Weasley en la serie de películas de Harry Potter.',
			'Obtuvo dicho papel a los once años, después de haber participado anteriormente solo en obras de teatro escolares y grupos de teatro locales. Protagonizó, junto a Daniel Radcliffe y Emma Watson, las ocho películas de la serie cinematográfica. Realizó su primera aparición fuera de Harry Potter en el largometraje Thunderpants dirigido por Pete Hewitt y estrenado el 24 de mayo de 2002.',
			'Protagonizó la comedia dramática Driving Lessons, estrenada el 8 de septiembre de 2006, donde compartió reparto con Julie Walters, actriz que encarnó a Molly Weasley —madre del personaje de Grint— en la saga de películas de Harry Potter, y Cherrybomb (2009), una cinta de bajo presupuesto de lanzamiento limitado.'
		],
	},
	'ryan-coogler': {
		biography: [
			'Ryan Kyle Coogler (Oakland, California; 23 de mayo de 1986) es un director y guionista estadounidense.',
			'Comenzó a ser reconocido en la industria por su trabajo como director de las películas Creed (2015) y Black Panther (2018).',
			'Coogler también produjo el drama histórico Judas and the Black Messiah (2021) y la película de terror sobrenatural Sinners (2025), que también escribió y dirigió.'
		],
	},
	'ryan-gosling': {
		biography: [
			'Ryan Thomas Gosling (London, Ontario, 12 de noviembre de 1980) es un actor y músico canadiense.',
			'Inició su carrera como estrella infantil en el programa The Mickey Mouse Club (1993-1994) de Disney Channel y posteriormente participó en otras producciones televisivas orientadas al público juvenil, como Are You Afraid of the Dark? (1995), Goosebumps (1996), Breaker High (1997-1998) y Young Hercules (1998-1999).',
			'Su primer papel importante en el cine fue en The believer (2001), y luego construyó una reputación por sus interpretaciones en películas independientes como Murder by numbers (2002), The Slaughter Rule (2002), The United States of Leland (2003) y Stay (2005).'
		],
	},
	'ryan-reynolds': {
		biography: [
			'Ryan Rodney Reynolds (Vancouver, 23 de octubre de 1976) es un actor, actor de voz, comediante, guionista, productor de cine y empresario canadiense, nacionalizado estadounidense.',
			'Comenzó su carrera protagonizando la telenovela canadiense para adolescentes Hillside (1991-1993) y tuvo papeles menores antes de obtener el papel principal en la comedia de situación Two Guys and a Girl entre 1998 y 2001.',
			'Reynolds luego protagonizó una variedad de películas, que incluyen comedias como Van Wilder (2002) o The Proposal (2009).'
		],
	},
	'sam-mendes': {
		biography: [
			'Samuel Alexander Mendes (Reading, Berkshire, 1 de agosto de 1965) es un director de cine y teatro, productor y guionista inglés.',
			'En 2000, fue nombrado Comendador de la Orden del Imperio Británico por sus servicios al teatro, y fue nombrado caballero en la Lista de Honores de Año Nuevo de 2020.',
			'En 2000, Mendes recibió el Premio Shakespeare de la Fundación Alfred Toepfer en Hamburgo, Alemania.'
		],
	},
	'sam-worthington': {
		biography: [
			'Samuel Henry John «Sam» Worthington (Godalming, Surrey; 2 de agosto de 1976) es un actor australiano-británico, conocido por interpretar a Jake Sully en Avatar, Marcus Wright en Terminator Salvation y Perseo en Furia de titanes.',
			'Ha asumido otros papeles dramáticos en The Debt (2010), Everest (2015), Hasta el último hombre (2016), La cabaña (2017), Manhunt: Unabomber (2017) y Fractured (2019).'
		],
	},
	'samara-weaving': {
		biography: [
			'Samara Weaving (Adelaida, Australia Meridional; 23 de febrero de 1992) es una actriz y modelo australiana.',
			'Comenzó su carrera en su país natal, interpretando a Kirsten Mulroney en la serie Out of the Blue (2008) y a Indi Walker en la telenovela Home and Away (2009-2013), por la que recibió una nominación al premio AACTA.',
			'Weaving protagonizó las películas de terror Mayhem y The Babysitter (ambas de 2017), y recibió numerosos premios de reparto por la película dramática Three Billboards Outside Ebbing, Missouri (2017).'
		],
	},
	'samuel-l-jackson': {
		biography: [
			'Samuel Leroy Jackson (Washington D.',
			'C., 21 de diciembre de 1948) es un actor y productor de cine, televisión y teatro estadounidense.',
			'Ha sido candidato al Premio Óscar, a los Globos de Oro y al Premio del Sindicato de Actores, así como ganador de un BAFTA al mejor actor de reparto y en 2022 se le entregó un Óscar honorífico a su trayectoria profesional. Es conocido por sus numerosas intervenciones en películas como Coming to America (1988), Goodfellas (1990), Jurassic Park (1993), Pulp Fiction (1994), Die Hard with a Vengeance (1995), A Time to Kill (1996), El protegido (2000), Changing Lanes (2002), S.W.A.T. (2003), Django Unchained (2012), Spiral, From the Book of Saw (2021) en el Universo cinematográfico de Marvel como el director de S.H.I.E.L.D., Nick Fury, en la saga Star Wars como el maestro Mace Windu (1999, 2002 y 2005) y en The Hateful Eight (2015) como el mayor Marquis Warren, El Cazarrecompensas.'
		],
	},
	'sandra-huller': {
		biography: [
			'Sandra Hüller (Suhl, Turingia; 30 de abril de 1978) es una actriz alemana de cine, teatro y televisión.',
			'Su trayectoria la ha llevado a protagonizar películas alemanas, británicas, estadounidenses y francesas.',
			'Obtuvo elogios de la crítica por su interpretación de Anneliese Michel —en la película llamada Micaela Klinger— en el drama de 2006 Réquiem (El exorcismo de Micaela) y por su papel de Ines Conradi en la película nominada en los Premios Oscar de 2016, Toni Erdmann\'.'
		],
	},
	'scarlett-johansson': {
		biography: [
			'Scarlett Ingrid Johansson (Nueva York, 22 de noviembre de 1984) es una actriz estadounidense que también se ha desempeñado de manera eventual como cantante, productora, modelo y directora.',
			'Comenzó a mostrar interés en las artes escénicas desde edad temprana y, a lo largo de su infancia y adolescencia, recibió formación actoral en distintos centros de enseñanza.',
			'En 2025, sus películas con papel protagonista totalizaron más de 15 mil millones de dólares recaudados, lo que la convirtió en la estrella de cine más taquillera de la historia hasta ese momento.'
		],
	},
	'sean-baker': {
		biography: [
			'Sean Baker (Summit, Nueva Jersey, 26 de febrero de 1971) es un cineasta estadounidense.',
			'Graduado por la Universidad de Nueva York, es conocido por la realización de películas como Starlet (2012), Tangerine (2015) y The Florida Project (2017). En 2024 ganó la Palma de Oro del Festival de Cannes y en 2025 el Oscar a mejor película, guion original, montaje y dirección por Anora.'
		],
	},
	'sebastian-stan': {
		biography: [
			'Sebastian Stan (Constanza, 13 de agosto de 1982) es un actor rumano-estadounidense. Reconocido por su papel de Bucky Barnes / Winter Soldier, antihéroe de Marvel.',
			'En televisión, interpretó a Carter Baizen en Gossip Girl, al príncipe Jack Benjamin en Kings, a Jefferson en Once Upon a Time y a T.J.',
			'Este último le valió una nominación al premio Critics\' Choice Television como Mejor Actor de Reparto en una Película / Miniserie.'
		],
	},
	'sigourney-weaver': {
		biography: [
			'Susan Alexandra Weaver (Manhattan, Nueva York, 8 de octubre de 1949), más conocida como Sigourney Weaver, es una actriz estadounidense de cine, televisión y teatro.',
			'Ha sido candidata a los Premios Óscar y a los Premios del Sindicato de Actores. Ha sido ganadora de dos Globo de Oro en las categorías de mejor actriz en drama y mejor actriz de reparto, de varios Saturn Awards (Aliens y Avatar) y de un BAFTA a la mejor actriz de reparto. Es conocida por sus intervenciones como la teniente Ellen Ripley en varias películas de la saga de Alien: Alien, el octavo pasajero (1979), Aliens (1986), Alien 3 (1992) y Alien: resurrección (1997).',
			'Ha participado también en otras películas tan recordadas como Avatar (2009), Los cazafantasmas (1984), Gorilas en la niebla (1988), Working Girl (1988), Copycat (1994), La tormenta de hielo (1997), Snow White: A Tale of Terror (1997), y The Village (2004).'
		],
	},
	'steven-yeun': {
		biography: [
			'Yeun Sang-yeop (Seúl, Corea del Sur, 21 de diciembre de 1983), a menudo llamado Steven Yeun, es un actor surcoreano conocido principalmente por haber interpretado a Glenn Rhee en la serie original de AMC The Walking Dead desde el año 2010 hasta el año 2016.',
			'Fue nominado al Premio Óscar al mejor actor en el año 2021 por la película Minari.'
		],
	},
	'sydney-sweeney': {
		biography: [
			'Sydney Bernice Sweeney (Spokane, Washington, 12 de septiembre de 1997) es una actriz, modelo y productora estadounidense. Es conocida por sus papeles en la serie dramática Euphoria (2019-presente) de HBO y en la primera temporada de la serie de antología The White Lotus (2021), que le valió nominaciones a dos premios Primetime Emmy. Sweeney llamó la atención por primera vez en 2018 por aparecer en las series de televisión Everything Sucks! y en The Handmaid\'s Tale, y en la serie limitada Sharp Objects.',
			'Al año siguiente, apareció en la película Once Upon a Time in Hollywood dirigida por Quentin Tarantino.',
			'En 2023, interpretó a Reality Winner en la película dramática Reality y protagonizó la comedia romántica Anyone but You.'
		],
	},
	'sylvester-stallone': {
		biography: [
			'Sylvester Gardenzio Stallone (Nueva York, 6 de julio de 1946) es un actor, pintor y cineasta estadounidense.',
			'En televisión, destaca su papel protagonista en la serie Tulsa King.',
			'La cinta Rocky (1976) se hizo con tres estatuillas del premio Óscar, en la categoría de mejor director, mejor película y mejor montaje.'
		],
	},
	'tessa-thompson': {
		biography: [
			'Tessa Lynne Thompson (Los Ángeles, California; 3 de octubre de 1983) es una actriz estadounidense.',
			'En televisión, actuó como Jackie Cook en el drama de misterio Veronica Mars (2005-2006), Sara Freeman en el drama policial de época Copper (2012-2013) y Charlotte Hale en el thriller de ciencia ficción de HBO Westworld (2016-2022).',
			'Obtuvo un mayor reconocimiento por sus papeles protagónicos como Nyla Adrose en la película dramática For Colored Girls (2010), la activista por los derechos civiles Diane Nash en la película de drama histórico Selma (2014), Bianca en la película de drama deportivo Creed (2015), Josie Radek en la película de terror de ciencia ficción Annihilation (2018) y la Agente M en Men in Black: International (2019).'
		],
	},
	'timothee-chalamet': {
		biography: [
			'Timothée Hal Chalamet (Hell\'s Kitchen, Manhattan, Nueva York, 27 de diciembre de 1995) es un actor estadounidense-francés. Ha sido nominado para tres Premios Óscar, tres BAFTAs, cuatro Premios Globo de Oro, cinco SAG y seis Premios de la Crítica Cinematográfica.',
			'Chalamet comenzó su carrera cuando era adolescente en televisión, apareciendo en la serie Homeland en 2012.',
			'Chalamet saltó a la fama internacional con el papel principal de un adolescente enamorado en la película de Luca Guadagnino Call Me by Your Name (2017), lo que le valió una nominación al Premio de la Academia al Mejor Actor.'
		],
	},
	'tom-cruise': {
		biography: [
			'Thomas Cruise Mapother IV (Siracusa, Nueva York, 3 de julio de 1962), conocido como Tom Cruise, es un actor y productor de cine estadounidense, ganador de un Premio Óscar Honorífico, tres Globos de Oro, un Premio Saturn y una Palma de Oro, entre otras.',
			'En más de cuatro décadas de carrera ha protagonizado películas de gran éxito comercial y aclamadas por la crítica: las cintas de acción Top Gun (1986), Days of Thunder (1990), la saga Misión imposible (1996-presente) y Top Gun: Maverick (2022); las películas dramáticas El color del dinero (1986), Rain Man (1988), Nacido el 4 de julio (1989) y Magnolia (1999); la película gótica de terror Entrevista con el vampiro (1994); la comedia romántica Jerry Maguire (1996); así como las películas de ciencia ficción Minority Report (2002), La guerra de los mundos (2005) y Oblivion (2013).',
			'También ha protagonizado los thrillers The Firm (1993), Collateral (2004), Valkyrie (2008) y Jack Reacher (2012).'
		],
	},
	'tom-hardy': {
		biography: [
			'Edward Thomas Hardy (Hammersmith, Londres, 15 de septiembre de 1977) es un actor inglés, considerado como un actor de método.',
			'Su debut llegó en la película Black Hawk Down (2001).',
			'Desde entonces ha sido nominado por sus trabajos al Premio Óscar al Mejor Actor de Reparto, en dos ocasiones al Premios de la Crítica Cinematográfica y otras dos a los Premios de Cine de la Academia Británica, así como, ha sido galardonado con un Premio BAFTA a la estrella emergente del 2011. Las actuaciones que más reconocimiento le han otorgado son Eddie Brock en Venom (2018) y sus secuelas Venom: Let There Be Carnage (2021) y Venom: The Last Dance (2024), a Bane en The Dark Knight Rises (2012) y a Mad Max en Mad Max: Fury Road (2015).'
		],
	},
	'tom-hiddleston': {
		biography: [
			'Thomas William Hiddleston (Westminster, Inglaterra, 9 de febrero de 1981) es un actor y productor de cine británico.',
			'Es conocido por haber interpretado a Loki en las adaptaciones cinematográficas de la Trilogía de Thor de Marvel Studios: Thor (2011), Thor: The Dark World (2013) y Thor: Ragnarok (2017), así como también en The Avengers (2012), Avengers: Infinity War (2018), Avengers: Endgame (2019) y en la serie Loki (2021-2023) de Disney+.',
			'Fue galardonado con el premio Globo de oro por su interpretación en The Night Manager.'
		],
	},
	'tom-holland': {
		biography: [
			'Thomas Stanley Holland (Londres, 1 de junio de 1996), conocido simplemente como Tom Holland, es un actor, actor de voz y bailarín británico.',
			'Comenzó su carrera en el teatro en 2008 interpretando al personaje principal en el musical Billy Elliot.',
			'Posteriormente, tras graduarse de la BRIT School en 2012, debutó en el cine con la película Lo imposible (2012) y logró gran reconocimiento por parte de la crítica, tras haber sido nombrado por la National Board of Review como el actor revelación de ese año, además de haber sido nominado a los Premios de la Crítica Cinematográfica como mejor intérprete joven.'
		],
	},
	'tommy-lee-jones': {
		biography: [
			'Tommy Lee Jones (San Saba, Texas, 15 de septiembre de 1946) es un actor y cineasta estadounidense.',
			'Call en la miniserie Lonesome Dove, el agente K en la serie cinematográfica de Hombres de negro, al alguacil Ed Tom Bell en No Country for Old Men, al villano Dos Caras en Batman Forever, al terrorista William "Bill" Strannix en Under Siege, al ranger Roland Sharp en Man of the House, el ranchero Pete Perkins en Los tres entierros de Melquiades Estrada, el coronel Chester Phillips en Capitán América: el primer vengador, el director de la CIA Robert Dewey en Jason Bourne y a Warden Dwight McClusky en Natural Born Killers.',
			'Ha recibido cuatro nominaciones al Premio Óscar, ganando el premio en la categoría de mejor actor de reparto por su actuación como el alguacil Samuel Gerard en la película de suspense de 1993 El fugitivo.'
		],
	},
	'toni-collette': {
		biography: [
			'Antonia Collette (Blacktown, Nueva Gales del Sur; 1 de noviembre de 1972), conocida como Toni Collette, es una actriz y productora australiana.',
			'Conocida por su trabajo en televisión y películas independientes, ha recibido varios galardones, entre ellos un Globo de Oro, un Premio Primetime Emmy y cinco Premios AACTA, con nominaciones a un Premio de la Academia y un Premio Tony.',
			'Su papel decisivo se produjo en la comedia dramática La boda de Muriel (1994), que le valió una nominación al Globo de Oro y le valió el premio AACTA a la mejor actriz en un papel principal.'
		],
	},
	'uma-thurman': {
		biography: [
			'Uma Karuna Thurman (Boston, Massachusetts, 29 de abril de 1970) es una actriz y exmodelo estadounidense nominada al Óscar y ganadora del Globo de Oro.',
			'Comenzó como modelo profesional y acabó dedicándose al cine en 1988, donde ha trabajado tanto en producciones de bajo presupuesto como en superproducciones de grandes estudios.',
			'Aunque sin duda es mundialmente conocida por sus trabajos en Pulp Fiction (1994) y Kill Bill (2003-2004), ambas dirigidas por Quentin Tarantino.'
		],
	},
	'vanessa-kirby': {
		biography: [
			'Vanessa Nuala Kirby (Wimbledon, Londres, Inglaterra, 18 de abril de 1988), conocida como Vanessa Kirby, es una actriz británica.',
			'Ha recibido, entre otros reconocimientos, un British Academy Television Awards, una Copa Volpi, nominaciones para un premio Óscar, un Globo de Oro, un Premio Primetime Emmy y dos Premios del Sindicato de Actores.',
			'Después de su graduación, hizo su debut como actriz profesional en el escenario con una producción de Todos eran mis hijos (2010), de Arthur Miller, y siguió esto con aclamadas actuaciones en las obras El sueño de una noche de verano (2010), Como gustéis (2010), Women Beware Women (2011), Las tres hermanas (2012) y como Stella Kowalski en Un tranvía llamado Deseo (2014), y obtuvo los premios Ian Charleson por estas actuaciones.'
		],
	},
	'viggo-mortensen': {
		biography: [
			'Viggo Peter Mortensen Jr. (Nueva York, 20 de octubre de 1958) es un actor y director de cine estadounidense de origen danés.',
			'Por sus interpretaciones ha sido nominado en tres ocasiones a los Premios Óscar, en cuatro a los Premios Globo de Oro y una vez a los Premios Goya.',
			'También se desempeña como poeta, músico, fotógrafo y pintor. Es un gran aficionado al club argentino de fútbol San Lorenzo de Almagro.'
		],
	},
	'vin-diesel': {
		biography: [
			'Mark Sinclair Vincent (Alameda, California, 18 de julio de 1967), más conocido por su nombre artístico Vin Diesel, es un actor productor y director de cine estadounidense. Conocido por la interpretación de Dominic Toretto en la saga cinematográfica The Fast and the Furious y por el papel de Richard B.',
			'Diesel ha protagonizado además películas como xXx y xXx: Return of Xander Cage (2002 y 2017); A Man Apart (2003); The Pacifier (2005); Find me Guilty (2006); y El último cazador de brujas (2015).',
			'Riddick en la trilogía Las Crónicas de Riddick, es también productor de las secuelas de ambas franquicias.'
		],
	},
	'ving-rhames': {
		biography: [
			'Irving Rameses "Ving" Rhames (Nueva York, 12 de mayo de 1959) es un actor estadounidense y ganador de un Globo de Oro, conocido por sus papeles en películas como Pulp Fiction, Guardianes de la Galaxia Vol. 2 y el personaje de Luther Stickell en la saga de películas Misión Imposible.',
			'En Cine Posta aparece ligado a Mission: Impossible III, Mission: Impossible - Fallout y Mission: Impossible - Dead Reckoning Part One, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'viola-davis': {
		biography: [
			'Matthews, Carolina del Sur, 11 de agosto de 1965) es una actriz y productora estadounidense.',
			'Desde joven, había mostrado interés en la actuación y se graduó con honores de la Rhode Island College en 1988 y luego en la Escuela Juilliard en 1993.',
			'También protagonizó la obra Seven Guitars en 1996, papel con el que fue nominada a un Tony.'
		],
	},
	'wagner-moura': {
		biography: [
			'Wagner Maniçoba de Moura (Salvador, 27 de junio de 1976) es un actor y cineasta brasileño conocido por sus papeles de Roberto Nascimento en las películas Tropa de élite y Tropa de élite 2, Pablo Escobar en la serie Narcos de Netflix, y de Marcelo en O Agente Secreto, por la que consiguió el Globo de Oro al Mejor actor de Drama y una nominación a los Premios Óscar.',
			'En Cine Posta aparece ligado a Civil War y El agente secreto, tres títulos que ayudan a seguir su recorrido dentro del sitio.'
		],
	},
	'will-smith': {
		biography: [
			'Willard Carroll Smith II (Filadelfia, 25 de septiembre de 1968), más conocido como Will Smith, es un actor, rapero y productor de cine estadounidense.',
			'En 1990, su fama aumentó drásticamente, cuando protagonizó la serie de televisión El príncipe de Bel-Air, donde interpretaba a una versión ficticia de sí mismo, y que se transmitió durante más de media década (1990-1996) en la NBC y se ha retransmitido de forma permanente en diversas cadenas.',
			'Ha tenido éxito en sus dos facetas artísticas: Ganó un Premio Óscar con dos nominaciones previas, siendo nominado a cuatro Premios Globo de Oro y saliendo ganador de cuatro Premios Grammy.'
		],
	},
	'willem-dafoe': {
		biography: [
			'William James Dafoe (Appleton, Wisconsin, 22 de julio de 1955) es un actor estadounidense.',
			'Dafoe fue miembro fundador de la compañía de teatro experimental The Wooster Group.',
			'Conocido por sus diversos papeles en el cine, ha recibido varios galardones, incluida la Copa Volpi al Mejor Actor, así como nominaciones a cuatro Premios de la Academia, un Premio BAFTA y cuatro Premios Globo de Oro.'
		],
	},
	'woody-harrelson': {
		biography: [
			'Woodrow Tracy Harrelson (Midland, Texas, 23 de julio de 1961), más conocido como Woody Harrelson, es un actor y dramaturgo estadounidense de cine, teatro y televisión conocido por su papel del camarero Woody Boyd en la sitcom Cheers de los años 1980, con la que consiguió un premio Emmy.',
			'Larry Flynt, la adaptación cinematográfica de Una mirada a la oscuridad, el drama Three Billboards Outside Ebbing, Missouri, en la aclamada serie True Detective y como Cletus Kasady / Carnage en la película Venom: Let There Be Carnage, donde comparte reparto con Tom Hardy.',
			'Harrelson ha sido nominado en tres ocasiones al premio Óscar, la primera en la categoría de Mejor actor por The People vs.'
		],
	},
	'yorgos-lanthimos': {
		biography: [
			'Yorgos Lánthimos (Atenas, 23 de septiembre de 1973) es un director de cine y de teatro, guionista y productor de cine griego, conocido por su enfoque distintivo en el cine contemporáneo.',
			'Ganador en 2018, al BAFTA a la mejor película británica por The Favourite y en 2023, al Globo de Oro a la mejor película - comedia o musical por Poor Things; ha sido también nominado en varias ocasiones al Premio Óscar.',
			'Su obra se caracteriza por un estilo único y, a menudo, surrealista.'
		],
	},
	'zazie-beetz': {
		biography: [
			'Zazie Olivia Beetz (Berlín, 1 de junio de 1991) es una actriz germano-estadounidense. Se hizo conocida por su papel de Vanessa, en la serie televisiva Atlanta.',
			'En 2023 participa en un episodio de la serie Black Mirror de Netflix.',
			'En el cine, participó en la película de ciencia ficción Geostorm (2017) y posteriormente interpretó a la mercenaria mutante Neena Thurman/Dominó en Deadpool 2 (2018).'
		],
	},
	'zendaya': {
		biography: [
			'Zendaya Maree Stoermer Coleman (Oakland, California, 1 de septiembre de 1996), conocida simplemente como Zendaya, es una actriz y cantante estadounidense. Entre sus galardones se incluyen dos premios Primetime Emmy y un Globo de Oro.',
			'Nacida y criada en Oakland, California, Zendaya comenzó su carrera como modelo infantil y bailarina de respaldo.',
			'Hizo su debut televisivo como Rocky Blue en la comedia de situación de Disney Channel Shake It Up (2010-2013) y protagonizó el papel principal en la comedia de situación del canal K.C.'
		],
	},
	'zoe-saldana': {
		biography: [
			'Zoë Yadira Saldaña-Perego (Passaic, Nueva Jersey, 19 de junio de 1978) es una actriz, bailarina y modelo estadounidense de ascendencia dominicana. Conocida principalmente por su trabajo en franquicias de películas de ciencia ficción, ha protagonizado cuatro de las películas más taquilleras de todos los tiempos (Avatar, Avatar: The Way of Water, Avengers: Infinity War y Avengers: Endgame).',
			'La revista Time la nombró una de las 100 personas más influyentes del mundo en el 2023. Como bailarina, Saldaña comenzó su carrera actoral en la pantalla en 1999 con un papel de invitada en dos episodios de Law & Order.',
			'Su primer papel en el cine fue en Center Stage (2000), en el que interpretó a una bailarina de ballet.'
		],
	},
/* __PERSON_PROFILE_EDITORIAL_OVERRIDES_END__ */
};

function applyPersonProfileEditorialOverrides(profiles) {
	return Object.fromEntries(
		Object.entries(profiles).map(([slug, profile]) => {
			const override = personProfileEditorialOverrides[slug];
			if (!override) {
				return [slug, profile];
			}

			return [
				slug,
				{
					...profile,
					...override,
					biography: override.biography ?? profile.biography,
				},
			];
		}),
	);
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
	...buildBulkProfiles(globalActorDefaults, [
		{
			slug: 'harrison-ford',
			name: 'Harrison Ford',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Harrison%20Ford%20at%20the%202009%20Deauville%20American%20Film%20Festival%2C%20cropped.jpg?width=640',
			headline: 'Harrison Ford sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Harrison Ford viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Captain America: Brave New World, Indiana Jones and the Dial of Destiny y Blade Runner 2049, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Witness', year: 1986 }],
			knownFor: ['captain-america-brave-new-world-2025', 'indiana-jones-and-the-dial-of-destiny-2023', 'blade-runner-2049-2017', 'star-wars-episode-vii-the-force-awakens-2015'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q81328',
				'https://www.imdb.com/name/nm0000148/',
				'https://www.themoviedb.org/person/3-harrison-ford',
			],
		},
		{
			slug: 'chris-pratt',
			name: 'Chris Pratt',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chris%20Pratt%202018.jpg?width=640',
			headline: 'Chris Pratt mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Chris Pratt se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Mercy, Super Mario Galaxy y The Electric State muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'People\'s Choice', category: 'Actor de accion favorito', work: 'Guardians of the Galaxy Vol. 3', year: 2024 }],
			knownFor: ['mercy-2026', 'super-mario-galaxy-2026', 'the-electric-state-2025', 'guardians-of-the-galaxy-vol-3-2023'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q503706',
				'https://www.imdb.com/name/nm0695435/',
				'https://www.themoviedb.org/person/73457-chris-pratt',
			],
		},
		{
			slug: 'keanu-reeves',
			name: 'Keanu Reeves',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Keanu%20Reeves%20at%20TIFF%202025%2002%20(Cropped).jpg?width=640',
			headline: 'Keanu Reeves aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Keanu Reeves logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Ballerina, John Wick: Chapter 4 y The Matrix Resurrections, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'MTV Movie Award', category: 'Mejor pelea', work: 'The Matrix', year: 2000 }],
			knownFor: ['ballerina-2025', 'john-wick-chapter-4-2023', 'the-matrix-resurrections-2021', 'john-wick-chapter-3-parabellum-2019'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q43416',
				'https://www.imdb.com/name/nm0000206/',
				'https://www.themoviedb.org/person/6384-keanu-reeves',
			],
		},
		{
			slug: 'ben-affleck',
			name: 'Ben Affleck',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ben%20Affleck%20by%20Gage%20Skidmore%203.jpg?width=640',
			headline: 'Ben Affleck sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Ben Affleck viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a El Botin (The Rip), The Accountant 2 y Air, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor pelicula como productor', work: 'Argo', year: 2013 }],
			knownFor: ['el-botin-the-rip-2026', 'the-accountant-2-2025', 'air-2023', 'zack-snyder-s-justice-league-2021'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q483118',
				'https://www.imdb.com/name/nm0000255/',
				'https://www.themoviedb.org/person/880-ben-affleck',
			],
		},
		{
			slug: 'chris-hemsworth',
			name: 'Chris Hemsworth',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chris%20Hemsworth%20-%20Crime%20101.jpg?width=640',
			headline: 'Chris Hemsworth mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Chris Hemsworth se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Crime 101, Furiosa: A Mad Max Saga y Transformers Uno muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'People\'s Choice', category: 'Actor de accion favorito', work: 'Extraction 2', year: 2023 }],
			knownFor: ['crime-101-2026', 'furiosa-a-mad-max-saga-2024', 'transformers-one-2024', 'thor-love-and-thunder-2022'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q54314',
				'https://www.imdb.com/name/nm1165110/',
				'https://www.themoviedb.org/person/74568-chris-hemsworth',
			],
		},
		{
			slug: 'hugh-jackman',
			name: 'Hugh Jackman',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hugh%20Jackman%20Is%20This%20Thing%20On-68%20(cropped).jpg?width=640',
			headline: 'Hugh Jackman aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Hugh Jackman logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Deadpool & Wolverine, Logan y X-Men: Days of Future Past, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'Les Miserables', year: 2013 }],
			knownFor: ['deadpool-and-wolverine-2024', 'logan-2017', 'x-men-days-of-future-past-2014', 'the-wolverine-2013'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q129591',
				'https://www.imdb.com/name/nm0413168/',
				'https://www.themoviedb.org/person/6968-hugh-jackman',
			],
		},
		{
			slug: 'michael-fassbender',
			name: 'Michael Fassbender',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Michael%20Fassbender%20Cannes%202009.jpg?width=640',
			headline: 'Michael Fassbender sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Michael Fassbender viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Black Bag, The Killer y Dark Phoenix, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Steve Jobs', year: 2016 }],
			knownFor: ['black-bag-2025', 'the-killer-2023', 'dark-phoenix-2019', 'alien-covenant-2017'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q57147',
				'https://www.imdb.com/name/nm1055413/',
			],
		},
		{
			slug: 'daniel-radcliffe',
			name: 'Daniel Radcliffe',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Daniel%20Radcliffe%20in%20July%202015.jpg?width=640',
			headline: 'Daniel Radcliffe mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Daniel Radcliffe se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Harry Potter and the Deathly Hallows: Part 2, Harry Potter and the Deathly Hallows: Part 1 y Harry Potter and the Half-Blood Prince muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Emmy', category: 'Nominacion a mejor actor en telefilm', work: 'Weird: The Al Yankovic Story', year: 2023 }],
			knownFor: ['harry-potter-and-the-deathly-hallows-part-2-2011', 'harry-potter-and-the-deathly-hallows-part-1-2010', 'harry-potter-and-the-half-blood-prince-2009', 'harry-potter-and-the-order-of-the-phoenix-2007'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q38119',
				'https://www.imdb.com/name/nm0705356/',
				'https://www.themoviedb.org/person/10980-daniel-radcliffe',
			],
		},
		{
			slug: 'robert-downey-jr',
			name: 'Robert Downey Jr.',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Robert%20Downey%20Jr%202014%20Comic%20Con%20(cropped).jpg?width=640',
			headline: 'Robert Downey Jr. aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Robert Downey Jr. logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Avengers: Endgame, Avengers: Infinity War y Captain America: Civil War, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Oppenheimer', year: 2024 }],
			knownFor: ['avengers-endgame-2019', 'avengers-infinity-war-2018', 'captain-america-civil-war-2016', 'avengers-age-of-ultron-2015'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q165219',
				'https://www.imdb.com/name/nm0000375/',
				'https://www.themoviedb.org/person/3223-robert-downey-jr',
			],
		},
		{
			slug: 'chris-evans',
			name: 'Chris Evans',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chris%20Evans%20Red%202024.jpg?width=640',
			headline: 'Chris Evans sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Chris Evans viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Avengers: Endgame, Captain America: Civil War y Captain America: The Winter Soldier, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'People\'s Choice', category: 'Actor de accion favorito', work: 'Avengers: Endgame', year: 2019 }],
			knownFor: ['avengers-endgame-2019', 'captain-america-civil-war-2016', 'captain-america-the-winter-soldier-2014', 'the-avengers-2012'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q178348',
				'https://www.imdb.com/name/nm0262635/',
				'https://www.themoviedb.org/person/16828-chris-evans',
			],
		},
		{
			slug: 'mark-ruffalo',
			name: 'Mark Ruffalo',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mark%20Ruffalo%20(36201774756)%20(cropped).jpg?width=640',
			headline: 'Mark Ruffalo mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Mark Ruffalo se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Crime 101, Poor Things y Avengers: Endgame muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'Poor Things', year: 2024 }],
			knownFor: ['crime-101-2026', 'poor-things-2023', 'avengers-endgame-2019', 'avengers-infinity-war-2018'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q41422',
				'https://www.imdb.com/name/nm0749263/',
				'https://www.themoviedb.org/person/103-mark-ruffalo',
			],
		},
		{
			slug: 'matt-damon',
			name: 'Matt Damon',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/MKr347638%20Matt%20Damon%20(Small%20Things%20Like%20These%2C%20Berlinale%202024).jpg?width=640',
			headline: 'Matt Damon aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Matt Damon logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a El Botin (The Rip), The Instigators y Air, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor guion original', work: 'Good Will Hunting', year: 1998 }],
			knownFor: ['el-botin-the-rip-2026', 'the-instigators-2024', 'air-2023', 'oppenheimer-2023'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q175535',
				'https://www.imdb.com/name/nm0000354/',
				'https://www.themoviedb.org/person/1892-matt-damon',
			],
		},
		{
			slug: 'michael-keaton',
			name: 'Michael Keaton',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Michael%20Keaton%20(NYCC%202014).JPG?width=640',
			headline: 'Michael Keaton sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Michael Keaton viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Beetlejuice Beetlejuice, The Flash y Spider-Man: Homecoming, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'Birdman', year: 2015 }],
			knownFor: ['beetlejuice-beetlejuice-2024', 'the-flash-2023', 'spider-man-homecoming-2017', 'spotlight-2015'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q138005',
				'https://www.imdb.com/name/nm0000474/',
				'https://www.themoviedb.org/person/2232-michael-keaton',
			],
		},
		{
			slug: 'tom-hardy',
			name: 'Tom Hardy',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tom%20Hardy%20by%20Gage%20Skidmore%20in%202018.jpg?width=640',
			headline: 'Tom Hardy mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Tom Hardy se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Havoc, Venom: The Last Dance y Venom: Let There Be Carnage muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'The Revenant', year: 2016 }],
			knownFor: ['havoc-2025', 'venom-the-last-dance-2024', 'venom-let-there-be-carnage-2021', 'venom-2018'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q208026',
				'https://www.imdb.com/name/nm0362766/',
				'https://www.themoviedb.org/person/2524-tom-hardy',
			],
		},
		{
			slug: 'dwayne-johnson',
			name: 'Dwayne Johnson',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dwayne%20Johnson-1809%20(cropped).jpg?width=640',
			headline: 'Dwayne Johnson aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Dwayne Johnson logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Moana 2, Black Adam y Jungle Cruise, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'People\'s Choice', category: 'Icon Award', work: 'Reconocimiento especial', year: 2019 }],
			knownFor: ['moana-2-2024', 'black-adam-2022', 'jungle-cruise-2021', 'red-notice-2021'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q10738',
				'https://www.imdb.com/name/nm0425005/',
				'https://www.themoviedb.org/person/18918-dwayne-johnson',
			],
		},
		{
			slug: 'ryan-reynolds',
			name: 'Ryan Reynolds',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Deadpool%202%20Japan%20Premiere%20Red%20Carpet%20Ryan%20Reynolds%20(cropped).jpg?width=640',
			headline: 'Ryan Reynolds sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Ryan Reynolds viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Deadpool & Wolverine, Free Guy y Red Notice, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'People\'s Choice', category: 'Male Movie Star', work: 'Deadpool & Wolverine', year: 2024 }],
			knownFor: ['deadpool-and-wolverine-2024', 'free-guy-2021', 'red-notice-2021', 'deadpool-2-2018'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q192682',
				'https://www.imdb.com/name/nm0005351/',
				'https://www.themoviedb.org/person/10859-ryan-reynolds',
			],
		},
		{
			slug: 'samuel-l-jackson',
			name: 'Samuel L. Jackson',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/SamuelLJackson.jpg?width=640',
			headline: 'Samuel L. Jackson mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Samuel L. Jackson se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Captain Marvel, Spider-Man: Far From Home y The Hateful Eight muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Premio honorifico', work: 'Trayectoria', year: 2022 }],
			knownFor: ['captain-marvel-2019', 'spider-man-far-from-home-2019', 'the-hateful-eight-2015', 'the-incredibles-2004'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q172678',
				'https://www.imdb.com/name/nm0000168/',
				'https://www.themoviedb.org/person/2231-samuel-l-jackson',
			],
		},
		{
			slug: 'benedict-cumberbatch',
			name: 'Benedict Cumberbatch',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/BCumberbatch%20Comic-Con%202019.jpg?width=640',
			headline: 'Benedict Cumberbatch aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Benedict Cumberbatch logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Doctor Strange in the Multiverse of Madness, Spider-Man: No Way Home y The Power of the Dog, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'The Power of the Dog', year: 2022 }],
			knownFor: ['doctor-strange-in-the-multiverse-of-madness-2022', 'spider-man-no-way-home-2021', 'the-power-of-the-dog-2021', 'doctor-strange-2016'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q244674',
				'https://www.imdb.com/name/nm1212722/',
				'https://www.themoviedb.org/person/71580-benedict-cumberbatch',
			],
		},
		{
			slug: 'jake-gyllenhaal',
			name: 'Jake Gyllenhaal',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jake%20Gyllenhaal%202019%20by%20Glenn%20Francis.jpg?width=640',
			headline: 'Jake Gyllenhaal sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Jake Gyllenhaal viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Road House y Spider-Man: Far From Home, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'BAFTA', category: 'Nominacion a mejor actor de reparto', work: 'Brokeback Mountain', year: 2006 }],
			knownFor: ['road-house-2024', 'spider-man-far-from-home-2019'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q133313',
				'https://www.imdb.com/name/nm0350453/',
				'https://www.themoviedb.org/person/131-jake-gyllenhaal',
			],
		},
		{
			slug: 'javier-bardem',
			name: 'Javier Bardem',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/MJK%2071654%20Javier%20Bardem%20(The%20Roads%20Not%20Taken%2C%20Berlinale%202020).jpg?width=640',
			headline: 'Javier Bardem mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Javier Bardem se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con F1: The Movie, Pirates of the Caribbean: Dead Men Tell No Tales y Skyfall muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'No Country for Old Men', year: 2008 }],
			knownFor: ['f1-the-movie-2025', 'pirates-of-the-caribbean-dead-men-tell-no-tales-2017', 'skyfall-2012', 'no-country-for-old-men-2007'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q134895',
				'https://www.imdb.com/name/nm0000849/',
				'https://www.themoviedb.org/person/3810-javier-bardem',
			],
		},
		{
			slug: 'jonathan-bailey',
			name: 'Jonathan Bailey',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jonathan%20Bailey%20press%20for%20Wicked.png?width=640',
			headline: 'Jonathan Bailey aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Jonathan Bailey logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Jurassic World Rebirth y Wicked: For Good, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Olivier', category: 'Mejor actor de reparto en musical', work: 'Company', year: 2019 }],
			knownFor: ['jurassic-world-rebirth-2025', 'wicked-for-good-2025'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q6272488',
				'https://www.imdb.com/name/nm0047332/',
				'https://www.themoviedb.org/person/80860-jonathan-bailey',
			],
		},
		{
			slug: 'nicholas-hoult',
			name: 'Nicholas Hoult',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/NicholasHoultTolkien2.jpg?width=640',
			headline: 'Nicholas Hoult sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Nicholas Hoult viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Superman, Nosferatu y Mad Max: Fury Road, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'BAFTA', category: 'Nominacion a Rising Star', work: 'Reconocimiento revelacion', year: 2010 }],
			knownFor: ['superman-2025', 'nosferatu-2024', 'mad-max-fury-road-2015'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q298347',
				'https://www.imdb.com/name/nm0396558/',
				'https://www.themoviedb.org/person/3292-nicholas-hoult',
			],
		},
		{
			slug: 'john-david-washington',
			name: 'John David Washington',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/JohnDavidWashington.jpg?width=640',
			headline: 'John David Washington mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'John David Washington se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Tenet muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Golden Globe', category: 'Nominacion a mejor actor', work: 'Malcolm & Marie', year: 2021 }],
			knownFor: ['tenet-2020'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q4120019',
				'https://www.imdb.com/name/nm0913475/',
				'https://www.themoviedb.org/person/1117313-john-david-washington',
			],
		},
		{
			slug: 'josh-brolin',
			name: 'Josh Brolin',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Josh%20Brolin%20TIFF%202025%20(cropped).jpg?width=640',
			headline: 'Josh Brolin aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Josh Brolin logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Weapons, Deadpool 2 y Jonah Hex, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'SAG', category: 'Mejor elenco', work: 'No Country for Old Men', year: 2008 }],
			knownFor: ['weapons-2025', 'deadpool-2-2018', 'jonah-hex-2010', 'no-country-for-old-men-2007'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q41396',
				'https://www.imdb.com/name/nm0000982/',
				'https://www.themoviedb.org/person/16851-josh-brolin',
			],
		},
		{
			slug: 'jeremy-strong',
			name: 'Jeremy Strong',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jeremy%20Strong.jpg?width=640',
			headline: 'Jeremy Strong sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Jeremy Strong viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a The Apprentice (La historia de Trump), una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en serie dramatica', work: 'Succession', year: 2022 }],
			knownFor: ['the-apprentice-2024'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q15854232',
				'https://www.imdb.com/name/nm0834989/',
				'https://www.themoviedb.org/person/239271-jeremy-strong',
			],
		},
		{
			slug: 'daniel-kaluuya',
			name: 'Daniel Kaluuya',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Daniel%20Kaluuya%20by%20Gage%20Skidmore.jpg?width=640',
			headline: 'Daniel Kaluuya mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Daniel Kaluuya se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Nope muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Judas and the Black Messiah', year: 2021 }],
			knownFor: ['nope-2022'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q510970',
				'https://www.imdb.com/name/nm2257207/',
				'https://www.themoviedb.org/person/206919-daniel-kaluuya',
			],
		},
		{
			slug: 'brian-tyree-henry',
			name: 'Brian Tyree Henry',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Brian%20Tyree%20Henry%20by%20Gage%20Skidmore.jpg?width=640',
			headline: 'Brian Tyree Henry aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Brian Tyree Henry logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Godzilla x Kong: The New Empire, Transformers Uno y Spider-Man: Across the Spider-Verse, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'Causeway', year: 2023 }],
			knownFor: ['godzilla-x-kong-the-new-empire-2024', 'transformers-one-2024', 'spider-man-across-the-spider-verse-2023'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q26924801',
				'https://www.imdb.com/name/nm3109964/',
				'https://www.themoviedb.org/person/226366-brian-tyree-henry',
			],
		},
		{
			slug: 'mahershala-ali',
			name: 'Mahershala Ali',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mahershala%20Ali%20(29953410761).jpg?width=640',
			headline: 'Mahershala Ali sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Mahershala Ali viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Jurassic World Rebirth y Green Book, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Moonlight', year: 2017 }],
			knownFor: ['jurassic-world-rebirth-2025', 'green-book-2018'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q360531',
				'https://www.imdb.com/name/nm0991810/',
				'https://www.themoviedb.org/person/932967-mahershala-ali',
			],
		},
		{
			slug: 'ebon-moss-bachrach',
			name: 'Ebon Moss-Bachrach',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ebon%20Moss-Bachrach%20by%20Gage%20Skidmore.jpg?width=640',
			headline: 'Ebon Moss-Bachrach mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Ebon Moss-Bachrach se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con The Fantastic Four: First Steps muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Emmy', category: 'Mejor actor de reparto en comedia', work: 'The Bear', year: 2024 }],
			knownFor: ['the-fantastic-four-first-steps-2025'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q1279993',
				'https://www.imdb.com/name/nm0609114/',
				'https://www.themoviedb.org/person/21042-ebon-moss-bachrach',
			],
		},
		{
			slug: 'paul-dano',
			name: 'Paul Dano',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20Dano%20Deauville%202012.jpg?width=640',
			headline: 'Paul Dano aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Paul Dano logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a The Fabelmans, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Golden Globe', category: 'Nominacion a mejor actor', work: 'Love & Mercy', year: 2016 }],
			knownFor: ['the-fabelmans-2022'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q343616',
				'https://www.imdb.com/name/nm0200452/',
				'https://www.themoviedb.org/person/17142-paul-dano',
			],
		},
		{
			slug: 'willem-dafoe',
			name: 'Willem Dafoe',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Willem%20Dafoe%20Cannes%202019.jpg?width=640',
			headline: 'Willem Dafoe sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Willem Dafoe viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Poor Things, Aquaman y John Wick, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'The Florida Project', year: 2018 }],
			knownFor: ['poor-things-2023', 'aquaman-2018', 'john-wick-2014', 'the-english-patient-1996'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q188772',
				'https://www.imdb.com/name/nm0000353/',
				'https://www.themoviedb.org/person/5293-willem-dafoe',
			],
		},
		{
			slug: 'rami-malek',
			name: 'Rami Malek',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rami%20Malek%20in%202015%20(2)%20(cropped).jpg?width=640',
			headline: 'Rami Malek mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Rami Malek se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Nuremberg, The Amateur y No Time to Die muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Bohemian Rhapsody', year: 2019 }],
			knownFor: ['nuremberg-2025', 'the-amateur-2025', 'no-time-to-die-2021'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q375590',
				'https://www.imdb.com/name/nm1785339/',
				'https://www.themoviedb.org/person/17838-rami-malek',
			],
		},
		{
			slug: 'jude-law',
			name: 'Jude Law',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jude%20Law%20-%20Headshot.jpg?width=640',
			headline: 'Jude Law aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Jude Law logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Fantastic Beasts: The Secrets of Dumbledore y Fantastic Beasts: The Crimes of Grindelwald, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'The Talented Mr. Ripley', year: 2000 }],
			knownFor: ['fantastic-beasts-the-secrets-of-dumbledore-2022', 'fantastic-beasts-the-crimes-of-grindelwald-2018'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q160432',
				'https://www.imdb.com/name/nm0000179/',
				'https://www.themoviedb.org/person/9642-jude-law',
			],
		},
		{
			slug: 'miles-teller',
			name: 'Miles Teller',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Miles%20Teller%20March%2018%2C%202014%20(cropped).jpg?width=640',
			headline: 'Miles Teller sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Miles Teller viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a The Gorge, Top Gun: Maverick y Fantastic Four, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'BAFTA', category: 'Nominacion a Rising Star', work: 'Reconocimiento revelacion', year: 2015 }],
			knownFor: ['the-gorge-2025', 'top-gun-maverick-2022', 'fantastic-four-2015', 'whiplash-2014'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q267330',
				'https://www.imdb.com/name/nm1886602/',
				'https://www.themoviedb.org/person/996701-miles-teller',
			],
		},
		{
			slug: 'george-clooney',
			name: 'George Clooney',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/George%20Clooney.jpg?width=640',
			headline: 'George Clooney mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'George Clooney se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Wolfs y Batman & Robin muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Syriana', year: 2006 }],
			knownFor: ['wolfs-2024', 'batman-and-robin-1997'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q23844',
				'https://www.imdb.com/name/nm0000123/',
				'https://www.themoviedb.org/person/1461-george-clooney',
			],
		},
		{
			slug: 'hugh-grant',
			name: 'Hugh Grant',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hugh%20Grant%20in%202014.jpg?width=640',
			headline: 'Hugh Grant aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Hugh Grant logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Heretic y Wonka, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'Four Weddings and a Funeral', year: 1995 }],
			knownFor: ['heretic-2024', 'wonka-2023'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q163286',
				'https://www.imdb.com/name/nm0000424/',
				'https://www.themoviedb.org/person/3291-hugh-grant',
			],
		},
		{
			slug: 'chiwetel-ejiofor',
			name: 'Chiwetel Ejiofor',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chiwetel%20Ejiofor%20at%20the%202024%20Toronto%20International%20Film%20Festival%20(cropped).jpg?width=640',
			headline: 'Chiwetel Ejiofor sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Chiwetel Ejiofor viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Venom: The Last Dance, Doctor Strange in the Multiverse of Madness y Doctor Strange, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: '12 Years a Slave', year: 2014 }],
			knownFor: ['venom-the-last-dance-2024', 'doctor-strange-in-the-multiverse-of-madness-2022', 'doctor-strange-2016', '12-years-a-slave-2013'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q317343',
				'https://www.imdb.com/name/nm0252230/',
			],
		},
		{
			slug: 'gary-oldman',
			name: 'Gary Oldman',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gary%20Oldman%20by%20Gage%20Skidmore.jpg?width=640',
			headline: 'Gary Oldman mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Gary Oldman se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Dawn of the Planet of the Apes, The Dark Knight Rises y Kung Fu Panda 2 muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Darkest Hour', year: 2018 }],
			knownFor: ['dawn-of-the-planet-of-the-apes-2014', 'the-dark-knight-rises-2012', 'kung-fu-panda-2-2011'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q83492',
				'https://www.imdb.com/name/nm0000198/',
				'https://www.themoviedb.org/person/64-gary-oldman',
			],
		},
		{
			slug: 'steven-yeun',
			name: 'Steven Yeun',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/StevenYeun2015ComicCon.jpg?width=640',
			headline: 'Steven Yeun aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Steven Yeun logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Mickey 17, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Minari', year: 2021 }],
			knownFor: ['mickey-17-2025'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q552176',
				'https://www.imdb.com/name/nm3081796/',
				'https://www.themoviedb.org/person/215055-steven-yeun',
			],
		},
		{
			slug: 'bradley-cooper',
			name: 'Bradley Cooper',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bradley%20Cooper.jpg?width=640',
			headline: 'Bradley Cooper sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Bradley Cooper viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Guardians of the Galaxy Vol. 3, Maestro y Nightmare Alley, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Maestro', year: 2024 }],
			knownFor: ['guardians-of-the-galaxy-vol-3-2023', 'maestro-2023', 'nightmare-alley-2021'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q205707',
				'https://www.imdb.com/name/nm0177896/',
				'https://www.themoviedb.org/person/51329-bradley-cooper',
			],
		},
		{
			slug: 'colin-farrell',
			name: 'Colin Farrell',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/2025%20Colin%20Farrell%20-%202%20(cropped).jpg?width=640',
			headline: 'Colin Farrell mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Colin Farrell se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con The Banshees of Inisherin y Minority Report muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'The Banshees of Inisherin', year: 2023 }],
			knownFor: ['the-banshees-of-inisherin-2022', 'minority-report-2002'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q172035',
				'https://www.imdb.com/name/nm0268199/',
				'https://www.themoviedb.org/person/72466-colin-farrell',
			],
		},
		{
			slug: 'brendan-fraser',
			name: 'Brendan Fraser',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Brendan%20Fraser%20October%202022.jpg?width=640',
			headline: 'Brendan Fraser aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Brendan Fraser logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a The Whale y Crash, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'The Whale', year: 2023 }],
			knownFor: ['the-whale-2022', 'crash-2005'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q193555',
				'https://www.imdb.com/name/nm0000409/',
				'https://www.themoviedb.org/person/18269-brendan-fraser',
			],
		},
		{
			slug: 'eddie-redmayne',
			name: 'Eddie Redmayne',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Eddie%20Redmayne%20MFF%20Portrait.jpg?width=640',
			headline: 'Eddie Redmayne sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Eddie Redmayne viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Fantastic Beasts: The Secrets of Dumbledore, Fantastic Beasts: The Crimes of Grindelwald y Fantastic Beasts and Where to Find Them, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'The Theory of Everything', year: 2015 }],
			knownFor: ['fantastic-beasts-the-secrets-of-dumbledore-2022', 'fantastic-beasts-the-crimes-of-grindelwald-2018', 'fantastic-beasts-and-where-to-find-them-2016'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q28288',
				'https://www.imdb.com/name/nm1519666/',
				'https://www.themoviedb.org/person/37632-eddie-redmayne',
			],
		},
		{
			slug: 'paul-giamatti',
			name: 'Paul Giamatti',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20Giamatti%20MFF%202024.jpg?width=640',
			headline: 'Paul Giamatti mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Paul Giamatti se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con The Holdovers muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'The Holdovers', year: 2024 }],
			knownFor: ['the-holdovers-2023'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q208649',
				'https://www.imdb.com/name/nm0316079/',
				'https://www.themoviedb.org/person/13242-paul-giamatti',
			],
		},
		{
			slug: 'tom-holland',
			name: 'Tom Holland',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Tom%20Holland%20during%20pro-am%20Wentworth%20golf%20club%202023-2.jpg?width=640',
			headline:
				'Tom Holland se sostiene como una cara central del blockbuster contemporaneo, con peso real en franquicias globales y buen margen para correrse a proyectos mas chicos.',
			spotlight:
				'Su perfil publico mezcla carisma de estrella, timing fisico y una asociacion inmediata con el Spider-Man mas reciente del cine.',
			biography: [
				'Tom Holland salto al primer plano mundial a partir de Spider-Man, pero su presencia funciona tambien fuera del traje: tiene energia fisica, una veta juvenil muy marcada y oficio para empujar aventuras de estudio.',
				'En Cine Posta queda asociado a Uncharted, Spider-Man: No Way Home, Spider-Man: Far From Home y Spider-Man: Homecoming, un bloque que explica rapido por que sigue tan pegado al imaginario pop reciente.',
			],
			awards: [{ label: 'BAFTA', category: 'Rising Star', work: 'Reconocimiento revelacion', year: 2017 }],
			knownFor: ['uncharted-2022', 'spider-man-no-way-home-2021', 'spider-man-far-from-home-2019', 'spider-man-homecoming-2017'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q2023710',
				'https://www.imdb.com/name/nm4043618/',
				'https://www.themoviedb.org/person/1136406-tom-holland',
			],
		},
		{
			slug: 'ewan-mcgregor',
			name: 'Ewan McGregor',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ewan%20McGregor%20-%20Los%20Angeles%20Comic%20Con%202024.jpg?width=640',
			headline: 'Ewan McGregor sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Ewan McGregor viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Star Wars: Episode III - Revenge of the Sith, Star Wars: Episode II - Attack of the Clones y Star Wars: Episode I - The Phantom Menace, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en miniserie o telefilm', work: 'Fargo', year: 2018 }],
			knownFor: ['star-wars-episode-iii-revenge-of-the-sith-2005', 'star-wars-episode-ii-attack-of-the-clones-2002', 'star-wars-episode-i-the-phantom-menace-1999'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q165518',
				'https://www.imdb.com/name/nm0000191/',
				'https://www.themoviedb.org/person/3061-ewan-mcgregor',
			],
		},
		{
			slug: 'mads-mikkelsen',
			name: 'Mads Mikkelsen',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mads%20Mikkelsen%20Cannes%202013%202.jpg?width=640',
			headline: 'Mads Mikkelsen mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Mads Mikkelsen se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con Casino Royale muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'Cannes', category: 'Mejor actor', work: 'The Hunt', year: 2012 }],
			knownFor: ['casino-royale-2006'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q294647',
				'https://www.imdb.com/name/nm0586568/',
				'https://www.themoviedb.org/person/1019-mads-mikkelsen',
			],
		},
		{
			slug: 'jack-black',
			name: 'Jack Black',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/TenaciousDO2160623%20(38%20of%2062)%20Jack%20Black.jpg?width=640',
			headline: 'Jack Black aparece hoy como uno de los rostros mas firmes del mapa global, entre grandes estudios, cine adulto y pulso de temporada.',
			spotlight: 'Su nombre sigue funcionando como señal inmediata de visibilidad internacional, incluso cuando el proyecto cambia fuerte de tono o de escala.',
			biography: [
				'Jack Black logro algo poco comun: ser identificable para publicos muy distintos sin resignar densidad ni flexibilidad como interprete.',
				'En este catalogo queda ligado a Super Mario Galaxy, A Minecraft Movie y Kung Fu Panda 4, una mezcla que ayuda a entender por que su figura todavia pesa tanto en la conversacion mundial.',
			],
			awards: [{ label: 'Golden Globe', category: 'Nominacion a mejor actor de comedia o musical', work: 'School of Rock', year: 2004 }],
			knownFor: ['super-mario-galaxy-2026', 'a-minecraft-movie-2025', 'kung-fu-panda-4-2024', 'kung-fu-panda-2-2011'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q483907',
				'https://www.imdb.com/name/nm0085312/',
				'https://www.themoviedb.org/person/70851-jack-black',
			],
		},
		{
			slug: 'pierce-brosnan',
			name: 'Pierce Brosnan',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/PierceBrosnan-byPhilipRomano.jpg?width=640',
			headline: 'Pierce Brosnan sigue siendo una figura global muy reconocible, con capacidad para sostener franquicia, star power y conversacion cinéfila al mismo tiempo.',
			spotlight: 'Su vigencia actual mezcla reconocimiento masivo, oficio de estrella y una presencia que el catalogo sigue conectando con titulos fuertes.',
			biography: [
				'Pierce Brosnan viene armando una carrera que no se deja encerrar en un solo molde: puede moverse entre espectaculo industrial, thriller adulto y cine de prestigio sin perder identidad.',
				'En el mapa actual del sitio aparece asociado a Black Adam, una combinacion que explica por que sigue funcionando como nombre trend dentro del mainstream global.',
			],
			awards: [{ label: 'Golden Globe', category: 'Nominacion a mejor actor de comedia o musical', work: 'The Matador', year: 2006 }],
			knownFor: ['black-adam-2022'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q81520',
				'https://www.imdb.com/name/nm0000112/',
				'https://www.themoviedb.org/person/517-pierce-brosnan',
			],
		},
		{
			slug: 'jason-momoa',
			name: 'Jason Momoa',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jason%20Momoa%20(43055621224)%20(cropped).jpg?width=640',
			headline: 'Jason Momoa mantiene un perfil internacional altisimo, en ese punto raro donde el prestigio critico todavia convive con el impacto masivo.',
			spotlight: 'Cuando entra en un proyecto grande, su presencia ordena la pelicula; cuando baja la escala, suele arrastrar igual la conversacion.',
			biography: [
				'Jason Momoa se sostuvo durante años en una zona muy dificil de conservar: seguir siendo relevante para el gran publico sin quedar reducido a una sola franquicia o personaje.',
				'Las conexiones actuales del catalogo con A Minecraft Movie, Aquaman and the Lost Kingdom y Aquaman muestran justamente esa amplitud de registro y de escala que lo mantiene vigente.',
			],
			awards: [{ label: 'People\'s Choice', category: 'Actor de accion favorito', work: 'Aquaman', year: 2019 }],
			knownFor: ['a-minecraft-movie-2025', 'aquaman-and-the-lost-kingdom-2023', 'aquaman-2018'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q315271',
				'https://www.imdb.com/name/nm0597388/',
				'https://www.themoviedb.org/person/117642-jason-momoa',
			],
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
	...buildBulkProfiles(globalDirectorDefaults, [
		{
			slug: 'james-gunn',
			name: 'James Gunn',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/James%20Gunn%20by%20Gage%20Skidmore%203.jpg?width=640',
			headline: 'James Gunn sigue siendo un director de altisima visibilidad internacional, con capacidad para mover industria, critica y publico en la misma conversacion.',
			spotlight: 'Su nombre ya funciona como marca de evento, incluso cuando cambia de escala, genero o presupuesto.',
			biography: [
				'James Gunn construyo una firma reconocible y al mismo tiempo lo bastante flexible como para circular entre cine de autor, premios y producciones de gran estudio.',
				'Dentro del catalogo actual aparece ligado a Superman, Guardians of the Galaxy Vol. 3 y The Suicide Squad, una señal bastante clara de por que sigue siendo un nombre trend para la industria global.',
			],
			awards: [{ label: 'Critics Choice Super Awards', category: 'Mejor pelicula de superheroes', work: 'Guardians of the Galaxy Vol. 3', year: 2024 }],
			knownFor: ['superman-2025', 'guardians-of-the-galaxy-vol-3-2023', 'the-suicide-squad-2021', 'guardians-of-the-galaxy-vol-2-2017'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q717015',
				'https://www.imdb.com/name/nm0348181/',
				'https://www.themoviedb.org/person/15218-james-gunn',
			],
		},
		{
			slug: 'bong-joon-ho',
			name: 'Bong Joon-ho',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bong%20Joon%20Ho%20-%20Okja.jpg?width=640',
			headline: 'Bong Joon-ho ocupa hoy una zona central del cine internacional, entre ambicion autoral, peso industrial y conversacion de temporada.',
			spotlight: 'Tiene ese perfil de realizador que puede ordenar tanto el debate critico como la expectativa del publico antes del estreno.',
			biography: [
				'Bong Joon-ho fue consolidando una filmografia con marca propia y suficiente escala como para convertirse en referencia inmediata cada vez que anuncia proyecto nuevo.',
				'Las peliculas conectadas en el sitio, como Mickey 17 y Parasite, muestran por que su nombre sigue pesando tanto en el radar global.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Parasite', year: 2020 }],
			knownFor: ['mickey-17-2025', 'parasite-2019'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q495980',
				'https://www.imdb.com/name/nm0094435/',
			],
		},
		{
			slug: 'joseph-kosinski',
			name: 'Joseph Kosinski',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Joseph%20Kosinski%202022.jpg?width=640',
			headline: 'Joseph Kosinski sigue siendo un director de altisima visibilidad internacional, con capacidad para mover industria, critica y publico en la misma conversacion.',
			spotlight: 'Su nombre ya funciona como marca de evento, incluso cuando cambia de escala, genero o presupuesto.',
			biography: [
				'Joseph Kosinski construyo una firma reconocible y al mismo tiempo lo bastante flexible como para circular entre cine de autor, premios y producciones de gran estudio.',
				'Dentro del catalogo actual aparece ligado a F1: The Movie y Top Gun: Maverick, una señal bastante clara de por que sigue siendo un nombre trend para la industria global.',
			],
			awards: [{ label: 'Saturn', category: 'Mejor direccion', work: 'Top Gun: Maverick', year: 2023 }],
			knownFor: ['f1-the-movie-2025', 'top-gun-maverick-2022'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q2444076',
				'https://www.imdb.com/name/nm2676052/',
				'https://www.themoviedb.org/person/86270-joseph-kosinski',
			],
		},
		{
			slug: 'christopher-mcquarrie',
			name: 'Christopher McQuarrie',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Christopher%20McQuarrie%20(2).jpg?width=640',
			headline: 'Christopher McQuarrie ocupa hoy una zona central del cine internacional, entre ambicion autoral, peso industrial y conversacion de temporada.',
			spotlight: 'Tiene ese perfil de realizador que puede ordenar tanto el debate critico como la expectativa del publico antes del estreno.',
			biography: [
				'Christopher McQuarrie fue consolidando una filmografia con marca propia y suficiente escala como para convertirse en referencia inmediata cada vez que anuncia proyecto nuevo.',
				'Las peliculas conectadas en el sitio, como Mission: Impossible - The Final Reckoning, Mission: Impossible - Dead Reckoning Part One y Mission: Impossible - Fallout, muestran por que su nombre sigue pesando tanto en el radar global.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor guion original', work: 'The Usual Suspects', year: 1996 }],
			knownFor: ['mission-impossible-the-final-reckoning-2025', 'mission-impossible-dead-reckoning-part-one-2023', 'mission-impossible-fallout-2018', 'mission-impossible-rogue-nation-2015'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q337658',
				'https://www.imdb.com/name/nm0003160/',
				'https://www.themoviedb.org/person/9033-christopher-mcquarrie',
			],
		},
		{
			slug: 'jon-m-chu',
			name: 'Jon M. Chu',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jon%20M.%20Chu%202013.jpg?width=640',
			headline: 'Jon M. Chu sigue siendo un director de altisima visibilidad internacional, con capacidad para mover industria, critica y publico en la misma conversacion.',
			spotlight: 'Su nombre ya funciona como marca de evento, incluso cuando cambia de escala, genero o presupuesto.',
			biography: [
				'Jon M. Chu construyo una firma reconocible y al mismo tiempo lo bastante flexible como para circular entre cine de autor, premios y producciones de gran estudio.',
				'Dentro del catalogo actual aparece ligado a Wicked: For Good y Wicked, una señal bastante clara de por que sigue siendo un nombre trend para la industria global.',
			],
			awards: [{ label: 'Critics Choice', category: 'Nominacion a mejor director', work: 'Wicked', year: 2025 }],
			knownFor: ['wicked-for-good-2025', 'wicked-2024'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q1702754',
				'https://www.imdb.com/name/nm0160840/',
				'https://www.themoviedb.org/person/54507-jon-m-chu',
			],
		},
		{
			slug: 'james-mangold',
			name: 'James Mangold',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/James%20Mangold%20Press%20Conference%20Logan%20Berlinale%202017%2003.jpg?width=640',
			headline: 'James Mangold ocupa hoy una zona central del cine internacional, entre ambicion autoral, peso industrial y conversacion de temporada.',
			spotlight: 'Tiene ese perfil de realizador que puede ordenar tanto el debate critico como la expectativa del publico antes del estreno.',
			biography: [
				'James Mangold fue consolidando una filmografia con marca propia y suficiente escala como para convertirse en referencia inmediata cada vez que anuncia proyecto nuevo.',
				'Las peliculas conectadas en el sitio, como Indiana Jones and the Dial of Destiny, Logan y The Wolverine, muestran por que su nombre sigue pesando tanto en el radar global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor director', work: 'A Complete Unknown', year: 2025 }],
			knownFor: ['indiana-jones-and-the-dial-of-destiny-2023', 'logan-2017', 'the-wolverine-2013'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q433893',
				'https://www.imdb.com/name/nm0003506/',
				'https://www.themoviedb.org/person/366-james-mangold',
			],
		},
		{
			slug: 'edward-berger',
			name: 'Edward Berger',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/2025%20Edward%20Berger%20(cropped).jpg?width=640',
			headline: 'Edward Berger sigue siendo un director de altisima visibilidad internacional, con capacidad para mover industria, critica y publico en la misma conversacion.',
			spotlight: 'Su nombre ya funciona como marca de evento, incluso cuando cambia de escala, genero o presupuesto.',
			biography: [
				'Edward Berger construyo una firma reconocible y al mismo tiempo lo bastante flexible como para circular entre cine de autor, premios y producciones de gran estudio.',
				'Dentro del catalogo actual aparece ligado a Conclave y All Quiet on the Western Front, una señal bastante clara de por que sigue siendo un nombre trend para la industria global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor pelicula internacional', work: 'All Quiet on the Western Front', year: 2023 }],
			knownFor: ['conclave-2024', 'all-quiet-on-the-western-front-2022'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q1291686',
				'https://www.imdb.com/name/nm0074163/',
				'https://www.themoviedb.org/person/221522-edward-berger',
			],
		},
		{
			slug: 'danny-boyle',
			name: 'Danny Boyle',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Danny%20Boyle%20MFF%202019%20(cropped).jpg?width=640',
			headline: 'Danny Boyle ocupa hoy una zona central del cine internacional, entre ambicion autoral, peso industrial y conversacion de temporada.',
			spotlight: 'Tiene ese perfil de realizador que puede ordenar tanto el debate critico como la expectativa del publico antes del estreno.',
			biography: [
				'Danny Boyle fue consolidando una filmografia con marca propia y suficiente escala como para convertirse en referencia inmediata cada vez que anuncia proyecto nuevo.',
				'Las peliculas conectadas en el sitio, como 28 Years Later y Slumdog Millionaire, muestran por que su nombre sigue pesando tanto en el radar global.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Slumdog Millionaire', year: 2009 }],
			knownFor: ['28-years-later-2025', 'slumdog-millionaire-2008'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q134867',
				'https://www.imdb.com/name/nm0000965/',
				'https://www.themoviedb.org/person/2034-danny-boyle',
			],
		},
		{
			slug: 'luca-guadagnino',
			name: 'Luca Guadagnino',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Luca%20Guadagnino.jpg?width=640',
			headline: 'Luca Guadagnino sigue siendo un director de altisima visibilidad internacional, con capacidad para mover industria, critica y publico en la misma conversacion.',
			spotlight: 'Su nombre ya funciona como marca de evento, incluso cuando cambia de escala, genero o presupuesto.',
			biography: [
				'Luca Guadagnino construyo una firma reconocible y al mismo tiempo lo bastante flexible como para circular entre cine de autor, premios y producciones de gran estudio.',
				'Dentro del catalogo actual aparece ligado a Challengers, una señal bastante clara de por que sigue siendo un nombre trend para la industria global.',
			],
			awards: [{ label: 'Silver Lion', category: 'Mejor director', work: 'Bones and All', year: 2022 }],
			knownFor: ['challengers-2024'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q1335528',
				'https://www.imdb.com/name/nm0345174/',
				'https://www.themoviedb.org/person/78160-luca-guadagnino',
			],
		},
		{
			slug: 'paul-thomas-anderson',
			name: 'Paul Thomas Anderson',
			profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20Thomas%20Anderson%202022%20(2)%20(cropped).jpg?width=640',
			headline: 'Paul Thomas Anderson ocupa hoy una zona central del cine internacional, entre ambicion autoral, peso industrial y conversacion de temporada.',
			spotlight: 'Tiene ese perfil de realizador que puede ordenar tanto el debate critico como la expectativa del publico antes del estreno.',
			biography: [
				'Paul Thomas Anderson fue consolidando una filmografia con marca propia y suficiente escala como para convertirse en referencia inmediata cada vez que anuncia proyecto nuevo.',
				'Las peliculas conectadas en el sitio, como One Battle After Another, muestran por que su nombre sigue pesando tanto en el radar global.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor director', work: 'Phantom Thread', year: 2018 }],
			knownFor: ['one-battle-after-another-2025'],
			referenceUrls: [
				'https://www.wikidata.org/wiki/Q25132',
				'https://www.imdb.com/name/nm0000759/',
				'https://www.themoviedb.org/person/4762-paul-thomas-anderson',
			],
		},
	]),
	...buildBulkProfiles(argentineActorDefaults, [
		{
			slug: 'ricardo-darin',
			name: 'Ricardo Darín',
			birthPlace: 'Buenos Aires, Argentina',
			headline: 'El gran rostro del cine argentino contemporáneo, con una autoridad que trasciende géneros, generaciones y modas.',
			spotlight:
				'Sigue siendo la figura que mejor sintetiza prestigio internacional, identificación popular y un modo muy argentino de habitar la pantalla.',
			biography: [
				'Ricardo Darín atravesó casi todas las etapas del cine argentino reciente y en cada una encontró una forma distinta de volverse central. Lo notable es que nunca quedó reducido a la idea de estrella inaccesible: incluso cuando lidera relatos enormes, conserva una cercanía muy rioplatense que el público reconoce al instante.',
				'De Nueve reinas a El secreto de sus ojos y de ahí a Argentina, 1985, fue armando una filmografía que funciona como mapa posible del cine nacional cuando quiere combinar masividad, oficio y espesor dramático. Pocos actores locales lograron ese equilibrio con tanta continuidad.',
				'En un sitio argentino como este, Darín no pesa solo por premios o prestigio exportable. Pesa porque durante décadas fue la cara que permitió discutir moral, crisis, amistad, justicia o clase media sin perder nunca conexión emocional con el público local.',
			],
			awards: [{ label: 'Goya', category: 'Mejor actor', work: 'Truman', year: 2016 }],
			knownFor: ['argentina-1985-2022', 'la-odisea-de-los-giles-2019', 'el-secreto-de-sus-ojos-2009', 'nueve-reinas-2000'],
		},
		{
			slug: 'peter-lanzani',
			name: 'Peter Lanzani',
			birthPlace: 'Buenos Aires, Argentina',
			headline: 'Actor argentino que pasó del reconocimiento masivo a una madurez dramática cada vez más sólida.',
			spotlight:
				'Su crecimiento se volvió especialmente interesante cuando dejó de apoyarse en la exposición y empezó a construir personajes con fricción, presión y ambigüedad.',
			biography: [
				'Peter Lanzani hizo una transición que en Argentina no siempre sale bien: pasar de la popularidad juvenil a una carrera adulta con verdadero peso actoral. Lo consiguió sin romper del todo con su visibilidad anterior, pero sí afinando mucho mejor la elección de materiales.',
				'El clan lo mostró en una zona más áspera y Argentina, 1985 terminó de consolidarlo como parte de una camada capaz de sostener relatos históricos, institucionales y dramáticos sin sentirse prestada. Ya no funciona como promesa: funciona como presencia confiable.',
				'También representa algo valioso para el cine local reciente: un puente real entre públicos masivos y proyectos de mayor espesor. Esa combinación le da un lugar importante dentro del presente argentino, más allá del ruido de coyuntura.',
			],
			awards: [{ label: 'Platino', category: 'Nominacion a mejor actor', work: 'Argentina, 1985', year: 2023 }],
			knownFor: ['argentina-1985-2022', 'el-clan-2015'],
		},
		{
			slug: 'leonardo-sbaraglia',
			name: 'Leonardo Sbaraglia',
			birthPlace: 'Buenos Aires, Argentina',
			headline: 'Actor de enorme elasticidad que puede cargar elegancia, descontrol o agotamiento con la misma eficacia.',
			spotlight:
				'Su diferencial está en la precisión con la que vuelve legible a tipos quebrados, ambiguos o directamente peligrosos, sin perder humanidad.',
			biography: [
				'Leonardo Sbaraglia hace años ocupa un lugar singular dentro del mapa argentino: puede ser protagonista clásico, actor de reparto de lujo o desestabilizador puro de una escena. Siempre da la sensación de que entra a la película con una temperatura ya decidida.',
				'Su recorrido entre Argentina y España también lo convirtió en un intérprete especialmente dúctil para thrillers, melodramas y dramas adultos, géneros donde el matiz importa más que el golpe de efecto. Por eso sigue apareciendo como una opción natural cuando hace falta alguien intenso pero nunca obvio.',
				'Para el cine argentino, además, Sbaraglia aporta una cosa escasa: sofisticación sin distancia. Puede sonar cosmopolita, nervioso o roto, pero casi siempre conserva un nervio reconocible para el espectador local.',
			],
			awards: [{ label: 'Goya', category: 'Nominacion a mejor actor', work: 'Intacto', year: 2002 }],
			knownFor: ['relatos-salvajes-2014', 'plata-quemada-2000', 'caballos-salvajes-1995'],
		},
		{
			slug: 'guillermo-francella',
			name: 'Guillermo Francella',
			birthPlace: 'Buenos Aires, Argentina',
			headline: 'Figura popularísima que supo llevar su potencia de comediante a territorios mucho más oscuros y densos.',
			spotlight:
				'Lo más atractivo de su presente es esa doble condición de ídolo popular y actor capaz de incomodar, endurecerse o correrse hacia zonas francamente siniestras.',
			biography: [
				'Guillermo Francella es uno de esos nombres que en Argentina exceden largamente al cine: televisión, humor, costumbrismo y memoria popular ya forman parte de su figura pública. Justamente por eso fue tan fuerte verlo reconvertirse con tanta eficacia en papeles de otra oscuridad.',
				'El clan reordenó la percepción crítica sobre él, pero no fue un relámpago aislado. Mi obra maestra, Corazón de León y proyectos posteriores confirmaron que detrás del timing de comediante había una lectura muy precisa del gesto, la amenaza y el desgaste emocional.',
				'En un catálogo argentino, Francella no puede figurar apenas como estrella simpática. Hay que leerlo también como un actor que acompañó y expresó mutaciones del gusto local, pasando del entretenimiento masivo a un cine de personajes más agrios sin perder magnetismo.',
			],
			awards: [{ label: 'Platino', category: 'Mejor actor', work: 'El clan', year: 2016 }],
			knownFor: ['homo-argentum-2025', 'mi-obra-maestra-2018', 'el-clan-2015', 'corazon-de-leon-2013'],
		},
		{
			slug: 'chino-darin',
			name: 'Chino Darín',
			birthPlace: 'San Nicolás de los Arroyos, Buenos Aires, Argentina',
			headline: 'Actor argentino de presencia contenida y muy fotogénica, cada vez más instalado en proyectos de gran circulación.',
			spotlight:
				'Su mejor versión aparece cuando mezcla aplomo, melancolía y una energía muy contemporánea, sin caer en la sobreactuación de figura joven.',
			biography: [
				'Chino Darín fue construyendo una carrera propia dentro de un apellido inevitablemente visible, y lo hizo con bastante inteligencia. En lugar de forzar una ruptura artificial, armó un perfil basado en la sobriedad, en la lectura correcta del material y en una presencia muy filmable.',
				'Su circulación entre producciones argentinas y españolas lo ayudó a consolidarse como un intérprete de época actual: menos grandilocuente, más atento al clima de escena y al pulso emocional que al gesto efectista. Eso explica por qué funciona bien en relatos de alcance amplio sin perder intimidad.',
				'Para el cine argentino reciente, representa además una continuidad generacional interesante: la posibilidad de sostener visibilidad internacional con una actuación menos ampulosa y más afinada con sensibilidades nuevas.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actor de reparto', work: 'La odisea de los giles', year: 2020 }],
			knownFor: ['la-odisea-de-los-giles-2019', 'el-angel-2018'],
		},
	]),
	...buildBulkProfiles(argentineActressDefaults, [
		{
			slug: 'dolores-fonzi',
			name: 'Dolores Fonzi',
			birthPlace: 'Buenos Aires, Argentina',
			headline: 'Actriz argentina de enorme magnetismo, siempre muy fuerte cuando el material pide nervio, inteligencia y una presencia frontal.',
			spotlight:
				'Su lugar en el cine argentino viene de combinar sensibilidad, carácter y una pantalla que nunca parece decorativa ni complaciente.',
			biography: [
				'Dolores Fonzi pertenece a esa generación que ayudó a empujar el recambio del cine argentino hacia formas más ásperas, más íntimas y menos convencionales. Desde muy temprano transmitió una mezcla rara de fragilidad, desafío y conciencia de escena.',
				'Con el tiempo fue armando una trayectoria donde conviven drama político, cine de autor, relatos sentimentales y una relación muy activa con la discusión pública alrededor del cine nacional. Por eso su figura pesa más allá de cada título puntual: también encarna una posición cultural.',
				'En pantalla suele imponer una verdad inmediata. Incluso cuando el personaje calla o se repliega, siempre hay una intensidad circulando debajo. Esa persistencia explica por qué sigue siendo una referencia fuerte del cine argentino contemporáneo.',
			],
			awards: [{ label: 'Platino', category: 'Nominacion a mejor actriz', work: 'Paulina', year: 2016 }],
			knownFor: ['belen-2025', 'la-cordillera-2017', 'truman-2015', 'el-aura-2005'],
		},
		{
			slug: 'mercedes-moran',
			name: 'Mercedes Morán',
			birthPlace: 'Concarán, San Luis, Argentina',
			headline: 'Una de las presencias más firmes y sofisticadas del cine argentino, con enorme autoridad para sostener personajes complejos.',
			spotlight:
				'Su fuerza está en la precisión: puede endurecer una escena con una mirada o volverla íntima sin necesidad de subrayar nada.',
			biography: [
				'Mercedes Morán construyó una carrera admirable porque nunca dependió de una sola imagen pública. Supo circular por televisión, cine y teatro con la misma autoridad, pero en el cine argentino encontró un espacio especialmente fértil para desplegar matiz, ironía y densidad afectiva.',
				'Es una actriz decisiva para entender el puente entre generaciones: puede dialogar con el nuevo cine argentino, con dramas más clásicos o con relatos corales sin perder centro propio. Esa elasticidad la volvió una pieza de enorme valor para distintas etapas del cine nacional.',
				'Lo más notable es que su prestigio nunca se siente solemne. Morán transmite experiencia, sí, pero también picardía, observación y un pulso muy fino para detectar el tono exacto de cada película.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actriz', work: 'Luna de Avellaneda', year: 2005 }],
			knownFor: ['el-angel-2018', 'betibu-2014', 'luna-de-avellaneda-2004', 'la-cienaga-2001'],
		},
		{
			slug: 'soledad-villamil',
			name: 'Soledad Villamil',
			birthPlace: 'La Plata, Buenos Aires, Argentina',
			headline: 'Actriz de sensibilidad clásica y una pantalla que sabe cargar memoria, melancolía y decisión al mismo tiempo.',
			spotlight:
				'Su atractivo nace de una combinación poco frecuente de calidez, inteligencia emocional y una tristeza que nunca se vuelve sentimentalismo fácil.',
			biography: [
				'Soledad Villamil ocupa un lugar muy querido dentro de la cultura argentina porque parece trabajar siempre desde la verdad afectiva del personaje. Hay en su presencia algo inmediatamente cercano, pero jamás simple o lineal.',
				'El secreto de sus ojos fijó con fuerza esa percepción pública, aunque su valor no depende de una sola película. Su recorrido viene sosteniendo una línea muy clara de personajes capaces de cargar duelo, deseo, memoria y dignidad sin perder naturalidad.',
				'En el contexto del cine argentino, Villamil también importa por su tono: representa una forma de actuación profundamente legible para el público local, más apoyada en la escucha y la emoción contenida que en el lucimiento evidente.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actriz', work: 'El secreto de sus ojos', year: 2010 }],
			knownFor: ['el-secreto-de-sus-ojos-2009', 'un-oso-rojo-2002'],
		},
		{
			slug: 'erica-rivas',
			name: 'Érica Rivas',
			birthPlace: 'Ramos Mejía, Buenos Aires, Argentina',
			headline: 'Actriz de enorme versatilidad y una energía que puede pasar del humor seco al desgarro sin transición visible.',
			spotlight:
				'Cuando una película necesita incomodidad, ironía o un estallido emocional sin red, pocas intérpretes locales responden con tanta precisión.',
			biography: [
				'Érica Rivas construyó prestigio desde el riesgo. En teatro, televisión y cine siempre tendió a correrse del lugar cómodo, buscando personajes con aristas, neurosis, rabia o una fragilidad menos decorativa que verdaderamente incómoda.',
				'Relatos salvajes la instaló con fuerza en el imaginario masivo, pero su valor dentro del cine argentino ya venía de antes: de esa capacidad para habitar lo grotesco, lo doloroso o lo filoso sin perder humanidad. Su pantalla nunca está adormecida.',
				'También representa un tipo de actriz muy importante para el ecosistema local: la que no ordena la escena para gustar, sino para volverla más viva, más imprevisible y más verdadera.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actriz de reparto', work: 'Relatos salvajes', year: 2015 }],
			knownFor: ['la-cordillera-2017', 'relatos-salvajes-2014'],
		},
		{
			slug: 'alejandra-flechner',
			name: 'Alejandra Flechner',
			birthPlace: 'Buenos Aires, Argentina',
			headline: 'Actriz de gran solvencia para personajes filosos, observadores y levemente corrosivos.',
			spotlight:
				'Tiene ese oficio rarísimo de los grandes actores de reparto: entrar poco tiempo y dejar una textura, un tono y una memoria duradera.',
			biography: [
				'Alejandra Flechner viene sosteniendo una carrera de muchísimo oficio dentro del cine, el teatro y la televisión argentina. Su trabajo suele quedar ligado a personajes secundarios, pero eso no le quita centralidad: muchas veces es justamente la intérprete que termina ordenando el clima de la escena.',
				'Su mayor virtud está en la observación. Puede volver incisivo un diálogo aparentemente simple y darle espesor a figuras que en otras manos quedarían como mera función narrativa. Eso la vuelve especialmente valiosa para el cine argentino de ensembles y corales.',
				'En un catálogo nacional, Flechner merece más que la etiqueta de presencia confiable. Es una actriz que aporta mundo, tono social y una ironía muy local cada vez que aparece en pantalla.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actriz de reparto', work: 'Argentina, 1985', year: 2023 }],
			knownFor: ['argentina-1985-2022'],
		},
	]),
	...buildBulkProfiles(argentineDirectorDefaults, [
		{
			slug: 'lucrecia-martel',
			name: 'Lucrecia Martel',
			birthPlace: 'Salta, Argentina',
			headline: 'Autora decisiva del cine argentino moderno, con una puesta en escena que cambió la manera de filmar clase, deseo y sonido en la región.',
			spotlight:
				'No es solo una directora influyente: es una forma entera de pensar el encuadre, el fuera de campo, la voz y la violencia social en el cine argentino.',
			biography: [
				'Lucrecia Martel alteró de manera profunda el lenguaje del cine argentino. Desde La ciénaga quedó claro que su trabajo con el sonido, los cuerpos, el espacio doméstico y la percepción social no respondía a una moda pasajera sino a una mirada verdaderamente singular.',
				'Zama y el resto de su obra confirmaron que su cine puede ser al mismo tiempo íntimo, político, sensual y brutal. Muy pocos autores de la región generaron un impacto tan fuerte en cineastas posteriores, en la crítica internacional y en la conversación estética latinoamericana.',
				'Para un sitio argentino, Martel no es solo prestigio festivalero. Es una figura clave para entender cómo el cine local dejó de pensarse únicamente desde Buenos Aires y empezó a construir otras texturas, otros sonidos y otras formas de incomodidad.',
			],
			awards: [{ label: 'Berlinale', category: 'Premio Alfred Bauer', work: 'La mujer sin cabeza', year: 2008 }],
			knownFor: ['zama-2017', 'la-cienaga-2001'],
		},
		{
			slug: 'santiago-mitre',
			name: 'Santiago Mitre',
			birthPlace: 'Buenos Aires, Argentina',
			headline: 'Director argentino que volvió muy visible el cruce entre cine político, thriller institucional y drama de alta circulación.',
			spotlight:
				'Su aporte más fuerte fue volver masivo un tipo de cine argentino que discute poder, justicia y desgaste cívico sin resignar tensión narrativa.',
			biography: [
				'Santiago Mitre fue encontrando una zona muy propia dentro del cine argentino: relatos atravesados por instituciones, negociación política, desgaste moral y una puesta en escena lo bastante clara como para no perder al público en el camino. Esa combinación le dio una identidad muy reconocible.',
				'La cordillera y Argentina, 1985 muestran bien su capacidad para traducir conflictos públicos en drama cinematográfico de alto impacto. No trabaja la política como comentario decorativo, sino como estructura concreta de presión sobre los personajes.',
				'En el contexto local, eso tiene mucho valor. Mitre ayudó a instalar la idea de que el cine argentino puede ser sofisticado y a la vez accesible cuando se toma en serio la dimensión institucional de sus historias.',
			],
			awards: [{ label: 'Goya', category: 'Mejor pelicula iberoamericana', work: 'Argentina, 1985', year: 2023 }],
			knownFor: ['argentina-1985-2022', 'la-cordillera-2017'],
		},
		{
			slug: 'damian-szifron',
			name: 'Damián Szifron',
			birthPlace: 'Ramos Mejía, Buenos Aires, Argentina',
			headline: 'Director de enorme pulso narrativo que sabe empujar thriller, comedia negra y catarsis popular como pocos en la región.',
			spotlight:
				'Su cine entiende como pocos la furia cotidiana argentina y sabe convertirla en espectáculo sin vaciarla de nervio social.',
			biography: [
				'Damián Szifron construyó una voz popular sin sacrificar inteligencia formal. Ya desde sus trabajos más conocidos en televisión y luego en cine quedó claro que dominaba el ritmo, el crescendo y el placer de contar historias con precisión industrial.',
				'Relatos salvajes fue la síntesis más potente de todo eso: humor negro, violencia, clase media crispada y una lectura feroz del malestar contemporáneo. Pero incluso antes y después de esa película, su obra mostró una habilidad muy poco frecuente para mezclar entretenimiento y observación social.',
				'En clave argentina, Szifron importa porque logró algo raro: hacer cine de gran circulación que suena local hasta la médula, sin pedir permiso estético ni perder eficacia narrativa.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor pelicula internacional', work: 'Relatos salvajes', year: 2015 }],
			knownFor: ['relatos-salvajes-2014', 'tiempo-de-valientes-2005'],
		},
	]),
};

const bulkExpansionProfiles = {
	...buildCatalogBackedProfiles(globalActressDefaults, [
		{
			slug: 'emma-watson',
			name: 'Emma Watson',
			headline: 'Figura global marcada por Harry Potter y todavia muy instalada en la cultura pop internacional.',
			awards: [{ label: 'MTV Movie Award', category: 'Trailblazer Award' }],
			knownFor: [
				'harry-potter-and-the-chamber-of-secrets-2002',
				'harry-potter-and-the-deathly-hallows-part-1-2010',
				'harry-potter-and-the-deathly-hallows-part-2-2011',
				'harry-potter-and-the-goblet-of-fire-2005',
			],
		},
		{
			slug: 'scarlett-johansson',
			name: 'Scarlett Johansson',
			headline: 'Estrella de primera linea capaz de moverse entre blockbuster, sci-fi y comedia con la misma autoridad.',
			awards: [{ label: 'BAFTA', category: 'Mejor actriz', work: 'Lost in Translation', year: 2004 }],
			knownFor: [
				'black-widow-2021',
				'captain-america-civil-war-2016',
				'captain-america-the-winter-soldier-2014',
				'jurassic-world-rebirth-2025',
			],
		},
		{
			slug: 'lupita-nyong-o',
			name: "Lupita Nyong'o",
			headline: 'Actriz de enorme presencia que sostiene prestigio, terror y franchise movie sin perder elegancia.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: '12 Years a Slave', year: 2014 }],
			knownFor: ['12-years-a-slave-2013', 'a-quiet-place-day-one-2024', 'black-panther-2018', 'black-panther-wakanda-forever-2022'],
		},
		{
			slug: 'emily-blunt',
			name: 'Emily Blunt',
			headline: 'Una de las actrices britanicas mas confiables del mainstream reciente, entre accion, drama y comedia.',
			awards: [{ label: 'Golden Globe', category: 'Nominacion a mejor actriz de reparto', work: 'Oppenheimer', year: 2024 }],
			knownFor: ['jungle-cruise-2021', 'oppenheimer-2023', 'the-fall-guy-2024'],
		},
		{
			slug: 'amy-adams',
			name: 'Amy Adams',
			headline: 'Actriz de altisimo oficio que puede darle humanidad inmediata a cine de estudio y drama prestigioso.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'American Hustle', year: 2014 }],
			knownFor: ['atrapame-si-puedes-2002', 'justice-league-2017', 'man-of-steel-2013'],
		},
		{
			slug: 'jessica-chastain',
			name: 'Jessica Chastain',
			headline: 'Presencia intensa y elegante, siempre asociada a personajes de gran peso emocional.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz', work: 'The Eyes of Tammy Faye', year: 2022 }],
			knownFor: ['dark-phoenix-2019', 'interstellar-2014', 'it-chapter-two-2019'],
		},
		{
			slug: 'hailee-steinfeld',
			name: 'Hailee Steinfeld',
			headline: 'Figura joven que sigue mezclando musica, voz pop y cine comercial con mucha naturalidad.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz de reparto', work: 'True Grit', year: 2011 }],
			knownFor: ['sinners-2025', 'spider-man-across-the-spider-verse-2023', 'spider-man-into-the-spider-verse-2018'],
		},
		{
			slug: 'ariana-debose',
			name: 'Ariana DeBose',
			headline: 'Actriz y performer con energia de musical clasico reciclada para la Hollywood actual.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'West Side Story', year: 2022 }],
			knownFor: ['kraven-the-hunter-2024', 'west-side-story-2021', 'wish-2023'],
		},
		{
			slug: 'kirsten-dunst',
			name: 'Kirsten Dunst',
			headline: 'Ex nena prodigio convertida en actriz adulta de enorme precision para drama, ironia y desencanto.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz de reparto', work: 'The Power of the Dog', year: 2022 }],
			knownFor: ['civil-war-2024', 'spider-man-2-2004', 'spider-man-3-2007', 'the-power-of-the-dog-2021'],
		},
		{
			slug: 'rachel-mcadams',
			name: 'Rachel McAdams',
			headline: 'Actriz canadiense que combina carisma mainstream y un registro dramatico siempre creible.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz de reparto', work: 'Spotlight', year: 2016 }],
			knownFor: ['doctor-strange-2016', 'send-help-2026', 'spotlight-2015'],
		},
		{
			slug: 'daisy-edgar-jones',
			name: 'Daisy Edgar-Jones',
			headline: 'Una de las caras jovenes mas visibles del drama romantico y del nuevo cine de estudio britanico.',
			awards: [{ label: 'Golden Globe', category: 'Nominacion a mejor actriz en miniserie', work: 'Normal People', year: 2021 }],
			knownFor: ['twisters-2024'],
		},
		{
			slug: 'jamie-lee-curtis',
			name: 'Jamie Lee Curtis',
			headline: 'Icono absoluto del cine de genero que sigue reinventandose sin perder autoridad pop.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Everything Everywhere All at Once', year: 2023 }],
			knownFor: ['everything-everywhere-all-at-once-2022', 'halloween-1978', 'halloween-2018', 'halloween-ends-2022'],
		},
		{
			slug: 'sigourney-weaver',
			name: 'Sigourney Weaver',
			headline: 'Leyenda del sci-fi moderno y una presencia que todavia eleva cualquier universo fantastico o industrial.',
			awards: [{ label: 'BAFTA', category: 'Mejor actriz', work: 'Aliens', year: 1987 }],
			knownFor: ['alien-1979', 'alien-3-1992', 'alien-resurrection-1997', 'aliens-1986'],
		},
		{
			slug: 'jennifer-connelly',
			name: 'Jennifer Connelly',
			headline: 'Actriz de nervio elegante, muy fuerte cuando una pelicula necesita gravedad y melancolia.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'A Beautiful Mind', year: 2002 }],
			knownFor: ['a-beautiful-mind-2001', 'hulk-2003', 'jim-henson-idea-man-2024', 'top-gun-maverick-2022'],
		},
		{
			slug: 'viola-davis',
			name: 'Viola Davis',
			headline: 'Una de las grandes actrices estadounidenses contemporaneas, con una pantalla siempre dominante.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Fences', year: 2017 }],
			knownFor: ['air-2023', 'g20-2025', 'kung-fu-panda-4-2024'],
		},
		{
			slug: 'halle-berry',
			name: 'Halle Berry',
			headline: 'Estrella historica de Hollywood que todavia conserva poder de icono y presencia fisica muy fuerte.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz', work: "Monster's Ball", year: 2002 }],
			knownFor: ['catwoman-2004', 'john-wick-chapter-3-parabellum-2019', 'x-men-the-last-stand-2006'],
		},
		{
			slug: 'brie-larson',
			name: 'Brie Larson',
			headline: 'Actriz que encontro un equilibrio raro entre prestigio dramatico y liderazgo de franquicia.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz', work: 'Room', year: 2016 }],
			knownFor: ['captain-marvel-2019', 'the-marvels-2023'],
		},
		{
			slug: 'awkwafina',
			name: 'Awkwafina',
			headline: 'Figura muy reconocible de la comedia actual, con timing pop y una veta dramatica que ya demostro peso propio.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz de comedia o musical', work: 'The Farewell', year: 2020 }],
			knownFor: ['kung-fu-panda-4-2024', 'shang-chi-and-the-legend-of-the-ten-rings-2021'],
		},
		{
			slug: 'america-ferrera',
			name: 'America Ferrera',
			headline: 'Actriz y voz publica con enorme reconocimiento transversal entre television, animacion y cine popular.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz de reparto', work: 'Barbie', year: 2024 }],
			knownFor: ['how-to-train-your-dragon-2010', 'how-to-train-your-dragon-the-hidden-world-2019'],
		},
		{
			slug: 'michelle-williams',
			name: 'Michelle Williams',
			headline: 'Actriz de enorme prestigio que sigue cruzando cine adulto, biopic y proyectos de alto perfil.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'My Week with Marilyn', year: 2012 }],
			knownFor: ['the-fabelmans-2022', 'venom-2018', 'venom-let-there-be-carnage-2021'],
		},
		{
			slug: 'keke-palmer',
			name: 'Keke Palmer',
			headline: 'Performer completisima, con carisma instantaneo y una energia que encaja perfecto en el cine pop actual.',
			awards: [{ label: 'Emmy', category: 'Mejor presentadora de game show', work: 'Password', year: 2024 }],
			knownFor: ['nope-2022'],
		},
		{
			slug: 'caitriona-balfe',
			name: 'Caitríona Balfe',
			headline: 'Actriz irlandesa muy respetada, ideal para personajes sobrios y de fuerte carga emocional.',
			awards: [{ label: 'BAFTA', category: 'Nominacion a mejor actriz de reparto', work: 'Belfast', year: 2022 }],
			knownFor: ['belfast-2021', 'the-amateur-2025'],
		},
		{
			slug: 'kristen-wiig',
			name: 'Kristen Wiig',
			headline: 'Comediante de altisimo perfil que hace rato demostro tambien criterio autoral y versatilidad de actriz.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor guion original', work: 'Bridesmaids', year: 2012 }],
			knownFor: ['despicable-me-4-2024', 'will-y-harper-2024', 'wonder-woman-1984-2020'],
		},
		{
			slug: 'rebecca-hall',
			name: 'Rebecca Hall',
			headline: 'Actriz de gran precision para personajes ambiguos, inteligentes y algo opacos.',
			awards: [{ label: 'Golden Globe', category: 'Nominacion a mejor actriz', work: 'Vicky Cristina Barcelona', year: 2009 }],
			knownFor: ['godzilla-vs-kong-2021', 'godzilla-x-kong-the-new-empire-2024'],
		},
		{
			slug: 'rosamund-pike',
			name: 'Rosamund Pike',
			headline: 'Presencia glacial y sofisticada, perfecta para cine adulto, thriller y humor negro elegante.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz de comedia o musical', work: 'I Care a Lot', year: 2021 }],
			knownFor: ['saltburn-2023'],
		},
	]),
	...buildCatalogBackedProfiles(globalActorDefaults, [
		{
			slug: 'will-smith',
			name: 'Will Smith',
			headline: 'Estrella masiva que sigue ocupando una zona central entre franquicia, accion y carisma de leading man.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'King Richard', year: 2022 }],
			knownFor: ['bad-boys-ride-or-die-2024', 'king-richard-2021', 'suicide-squad-2016'],
		},
		{
			slug: 'nicolas-cage',
			name: 'Nicolas Cage',
			headline: 'Figura de culto y superestrella a la vez, siempre lista para llevar una pelicula a un lugar desquiciado.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Leaving Las Vegas', year: 1996 }],
			knownFor: ['ghost-rider-2007', 'ghost-rider-spirit-of-vengeance-2011', 'longlegs-2024'],
		},
		{
			slug: 'jamie-foxx',
			name: 'Jamie Foxx',
			headline: 'Actor de gran presencia popular que puede pasar del thriller a la comedia y al drama biografico sin friccion.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Ray', year: 2005 }],
			knownFor: ['back-in-action-2025', 'django-unchained-2012', 'the-amazing-spider-man-2-2014'],
		},
		{
			slug: 'sylvester-stallone',
			name: 'Sylvester Stallone',
			headline: 'Icono absoluto del cine de accion y del relato de superacion popular hecho estrella.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: 'Creed', year: 2016 }],
			knownFor: ['creed-2015', 'creed-ii-2018', 'rocky-1976', 'rocky-balboa-2006'],
		},
		{
			slug: 'laurence-fishburne',
			name: 'Laurence Fishburne',
			headline: 'Actor de voz y presencia inconfundibles, clave para cine de accion, sci-fi y drama adulto.',
			awards: [{ label: 'Tony Award', category: 'Mejor actor', work: 'Two Trains Running', year: 1992 }],
			knownFor: ['a-nightmare-on-elm-street-3-dream-warriors-1987', 'john-wick-chapter-2-2017', 'john-wick-chapter-3-parabellum-2019', 'john-wick-chapter-4-2023'],
		},
		{
			slug: 'johnny-depp',
			name: 'Johnny Depp',
			headline: 'Figura hiperreconocible del cine global, entre personaje iconico, excentricidad y star power sostenido.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de comedia o musical', work: 'Sweeney Todd', year: 2008 }],
			knownFor: ['fantastic-beasts-the-crimes-of-grindelwald-2018', 'pirates-of-the-caribbean-at-worlds-end-2007', 'pirates-of-the-caribbean-dead-mans-chest-2006', 'pirates-of-the-caribbean-dead-men-tell-no-tales-2017'],
		},
		{
			slug: 'ian-mckellen',
			name: 'Ian McKellen',
			headline: 'Leyenda britanica cuya autoridad dramatica sigue dando espesor inmediato a fantasia, blockbuster y teatro filmado.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Gods and Monsters', year: 1999 }],
			knownFor: ['the-lord-of-the-rings-the-fellowship-of-the-ring-2001', 'the-lord-of-the-rings-the-return-of-the-king-2003', 'the-lord-of-the-rings-the-two-towers-2002', 'x-men-2000'],
		},
		{
			slug: 'liam-neeson',
			name: 'Liam Neeson',
			headline: 'Actor de voz grave y fisico imponente que supo reinventarse como estrella de accion tardia.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: "Schindler's List", year: 1994 }],
			knownFor: ['batman-begins-2005', 'schindler-s-list-1993', 'star-wars-episode-i-the-phantom-menace-1999', 'y-donde-esta-el-policia-2025'],
		},
		{
			slug: 'edward-norton',
			name: 'Edward Norton',
			headline: 'Actor de precision quirurgica, ideal para personajes nerviosos, brillantes o moralmente torcidos.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: 'Primal Fear', year: 1997 }],
			knownFor: ['fight-club-1999', 'glass-onion-a-knives-out-mystery-2022', 'the-incredible-hulk-2008'],
		},
		{
			slug: 'ke-huy-quan',
			name: 'Ke Huy Quan',
			headline: 'Una de las historias de regreso mas queridas del cine reciente y una cara muy facil de abrazar para el publico.',
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Everything Everywhere All at Once', year: 2023 }],
			knownFor: ['indiana-jones-and-the-temple-of-doom-1984', 'the-electric-state-2025', 'zootopia-2-2025'],
		},
		{
			slug: 'james-mcavoy',
			name: 'James McAvoy',
			headline: 'Actor britanico de enorme elasticidad, capaz de cargar vulnerabilidad, furia o rareza con la misma eficacia.',
			awards: [{ label: 'BAFTA', category: 'Rising Star Award', year: 2006 }],
			knownFor: ['dark-phoenix-2019', 'it-chapter-two-2019', 'x-men-apocalypse-2016', 'x-men-days-of-future-past-2014'],
		},
		{
			slug: 'christoph-waltz',
			name: 'Christoph Waltz',
			headline: 'Actor de inteligencia filosa y diccion perfecta, siempre listo para convertir un villano en puro espectaculo.',
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Inglourious Basterds', year: 2010 }],
			knownFor: ['django-unchained-2012', 'dracula-2026', 'frankenstein-2025', 'inglourious-basterds-2009'],
		},
		{
			slug: 'don-cheadle',
			name: 'Don Cheadle',
			headline: 'Actor muy confiable para cine coral, franquicia y drama politico, siempre con energia de veterano fino.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Hotel Rwanda', year: 2005 }],
			knownFor: ['crash-2005', 'iron-man-2-2010', 'iron-man-3-2013', 'space-jam-a-new-legacy-2021'],
		},
		{
			slug: 'jesse-eisenberg',
			name: 'Jesse Eisenberg',
			headline: 'Actor de nervio acelerado y una marca verbal muy propia, hoy tambien instalado como autor.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'The Social Network', year: 2011 }],
			knownFor: ['a-real-pain-2024', 'batman-v-superman-dawn-of-justice-2016', 'los-ilusionistas-3-2025'],
		},
		{
			slug: 'woody-harrelson',
			name: 'Woody Harrelson',
			headline: 'Presencia rustica, canchera y muy flexible, capaz de sumar humanidad o peligro apenas entra en cuadro.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'Three Billboards Outside Ebbing, Missouri', year: 2018 }],
			knownFor: ['los-ilusionistas-3-2025', 'solo-a-star-wars-story-2018', 'venom-let-there-be-carnage-2021', 'war-for-the-planet-of-the-apes-2017'],
		},
		{
			slug: 'viggo-mortensen',
			name: 'Viggo Mortensen',
			headline: 'Actor de enorme gravitas que puede llevar cine epico, drama adulto y proyectos autorales sin perder misterio.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Captain Fantastic', year: 2017 }],
			knownFor: ['green-book-2018', 'the-lord-of-the-rings-the-return-of-the-king-2003', 'the-lord-of-the-rings-the-two-towers-2002'],
		},
		{
			slug: 'tom-hiddleston',
			name: 'Tom Hiddleston',
			headline: 'Actor britanico muy reconocible, con una mezcla eficaz de elegancia, ironia y energia de villano pop.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en miniserie', work: 'The Night Manager', year: 2017 }],
			knownFor: ['thor-2011', 'thor-ragnarok-2017', 'thor-the-dark-world-2013'],
		},
		{
			slug: 'brendan-gleeson',
			name: 'Brendan Gleeson',
			headline: 'Actor irlandes de peso enorme, ideal para personajes fatigados, filosos o secretamente tiernos.',
			awards: [{ label: 'BAFTA', category: 'Nominacion a mejor actor de reparto', work: 'The Banshees of Inisherin', year: 2023 }],
			knownFor: ['joker-folie-a-deux-2024', 'the-banshees-of-inisherin-2022'],
		},
		{
			slug: 'jesse-plemons',
			name: 'Jesse Plemons',
			headline: 'Uno de los actores estadounidenses mas finos de su generacion, especialista en quietud inquietante.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'The Power of the Dog', year: 2022 }],
			knownFor: ['the-power-of-the-dog-2021'],
		},
		{
			slug: 'colin-firth',
			name: 'Colin Firth',
			headline: 'Actor britanico de perfil clasico, siempre muy fuerte cuando el material pide elegancia y vulnerabilidad.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: "The King's Speech", year: 2011 }],
			knownFor: ['the-king-s-speech-2010'],
		},
		{
			slug: 'dustin-hoffman',
			name: 'Dustin Hoffman',
			headline: 'Una de las grandes caras del cine estadounidense moderno, todavia clave para entender el actorismo de Hollywood.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Kramer vs. Kramer', year: 1980 }],
			knownFor: ['kramer-vs-kramer-1979', 'kung-fu-panda-2008', 'midnight-cowboy-1969', 'rain-man-1988'],
		},
		{
			slug: 'gene-hackman',
			name: 'Gene Hackman',
			headline: 'Gigante absoluto del cine americano, con una autoridad seca que sigue pesando incluso desde la retirada.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'The French Connection', year: 1972 }],
			knownFor: ['superman-1978', 'superman-iv-the-quest-for-peace-1987', 'the-french-connection-1971', 'unforgiven-1992'],
		},
		{
			slug: 'antonio-banderas',
			name: 'Antonio Banderas',
			headline: 'Estrella hispana global que sigue girando entre thriller, aventura y cine de autor con mucha soltura.',
			awards: [{ label: 'Cannes', category: 'Mejor actor', work: 'Pain and Glory', year: 2019 }],
			knownFor: ['competencia-oficial-2021', 'indiana-jones-and-the-dial-of-destiny-2023', 'uncharted-2022'],
		},
		{
			slug: 'ben-kingsley',
			name: 'Ben Kingsley',
			headline: 'Actor de enorme autoridad escenica, siempre listo para sumar prestigio instantaneo a una pelicula.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Gandhi', year: 1983 }],
			knownFor: ['gandhi-1982', 'schindler-s-list-1993'],
		},
		{
			slug: 'christopher-walken',
			name: 'Christopher Walken',
			headline: 'Figura unica del cine estadounidense, capaz de volver extrana o magnetica cualquier escena con muy poco.',
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'The Deer Hunter', year: 1979 }],
			knownFor: ['atrapame-si-puedes-2002', 'the-deer-hunter-1978'],
		},
	]),
	...buildCatalogBackedProfiles(globalDirectorDefaults, [
		{
			slug: 'david-fincher',
			name: 'David Fincher',
			headline: 'Uno de los grandes estilistas del thriller contemporaneo y un nombre que todavia ordena conversacion critica.',
			awards: [{ label: 'Golden Globe', category: 'Mejor director', work: 'The Social Network', year: 2011 }],
			knownFor: ['alien-3-1992', 'fight-club-1999', 'se7en-1995', 'the-killer-2023'],
		},
		{
			slug: 'ridley-scott',
			name: 'Ridley Scott',
			headline: 'Maestro industrial del gran espectaculo adulto, con una filmografia que sigue siendo referencia global.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor director', work: 'Gladiator', year: 2001 }],
			knownFor: ['alien-1979', 'alien-covenant-2017', 'blade-runner-1982', 'gladiator-2000'],
		},
		{
			slug: 'george-miller',
			name: 'George Miller',
			headline: 'Autor de energia desbordada que hizo de Mad Max una religion visual y del movimiento una firma.',
			awards: [{ label: 'Oscar', category: 'Mejor pelicula animada', work: 'Happy Feet', year: 2007 }],
			knownFor: ['furiosa-a-mad-max-saga-2024', 'mad-max-1979', 'mad-max-2-1981', 'mad-max-beyond-thunderdome-1985'],
		},
		{
			slug: 'greta-gerwig',
			name: 'Greta Gerwig',
			headline: 'Rara figura capaz de llevar sensibilidad indie, evento de estudio y conversacion cultural masiva en una sola firma.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor directora', work: 'Lady Bird', year: 2018 }],
			knownFor: ['barbie-2023'],
		},
		{
			slug: 'damien-chazelle',
			name: 'Damien Chazelle',
			headline: 'Uno de los directores mas visibles de su generacion, entre virtuosismo formal, musica y ambicion de gran estudio.',
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'La La Land', year: 2017 }],
			knownFor: ['whiplash-2014'],
		},
		{
			slug: 'yorgos-lanthimos',
			name: 'Yorgos Lanthimos',
			headline: 'Autor de prestigio altisimo que logro volver muy popular una rareza que sigue siendo verdaderamente suya.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor director', work: 'Poor Things', year: 2024 }],
			knownFor: ['poor-things-2023'],
		},
		{
			slug: 'matt-reeves',
			name: 'Matt Reeves',
			headline: 'Director ideal para darle gravedad, escala y melancolia al blockbuster contemporaneo.',
			awards: [{ label: 'Saturn Award', category: 'Mejor director', work: 'Dawn of the Planet of the Apes', year: 2015 }],
			knownFor: ['dawn-of-the-planet-of-the-apes-2014', 'the-batman-2022', 'war-for-the-planet-of-the-apes-2017'],
		},
		{
			slug: 'chloe-zhao',
			name: 'Chloé Zhao',
			headline: 'Autora que paso del indie contemplativo a la maquinaria de estudio sin perder mirada propia.',
			awards: [{ label: 'Oscar', category: 'Mejor directora', work: 'Nomadland', year: 2021 }],
			knownFor: ['eternals-2021', 'hamnet-2025', 'nomadland-2020'],
		},
		{
			slug: 'sam-mendes',
			name: 'Sam Mendes',
			headline: 'Director de gran oficio para cine prestigioso y de gran escala, siempre muy solido en la puesta.',
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'American Beauty', year: 2000 }],
			knownFor: ['american-beauty-1999', 'skyfall-2012', 'spectre-2015'],
		},
		{
			slug: 'robert-eggers',
			name: 'Robert Eggers',
			headline: 'Uno de los autores mas trendy del terror actual, obsesionado con textura historica y clima asfixiante.',
			awards: [{ label: 'Independent Spirit Award', category: 'Nominacion a mejor opera prima', work: 'The Witch', year: 2016 }],
			knownFor: ['nosferatu-2024'],
		},
	]),
	...buildCatalogBackedProfiles(argentineActorDefaults, [
		{
			slug: 'hector-alterio',
			name: 'Héctor Alterio',
			headline: 'Una de las presencias mas grandes del cine rioplatense, con autoridad historica y una voz inconfundible.',
			spotlight:
				'Su carrera cruza cine argentino, teatro y una etapa espanola muy fuerte, siempre con personajes que cargan memoria, peso politico o autoridad moral.',
			biography: [
				'Hector Alterio es uno de esos nombres que ordenan solos buena parte de la historia del cine argentino moderno. En los setenta fue pieza clave de peliculas politicas y populares, y despues siguio construyendo una filmografia de enorme prestigio entre Argentina y Espana.',
				'En el catalogo del sitio aparece asociado a La historia oficial, Camila, Caballos salvajes y El hijo de la novia, cuatro titulos que muestran distintas edades de su carrera: del drama historico al cine de reencuentro generacional, siempre con una autoridad expresiva impresionante.',
			],
			awards: [{ label: 'Goya', category: 'Mejor actor', work: 'El nido', year: 1981 }],
			knownFor: ['caballos-salvajes-1995', 'camila-1984', 'el-hijo-de-la-novia-2001', 'la-historia-oficial-1985'],
		},
		{
			slug: 'luis-brandoni',
			name: 'Luis Brandoni',
			headline: 'Figura central del cine y el teatro argentinos, siempre muy fuerte en personajes populares y de oficio clasico.',
			spotlight:
				'Su peso local no sale solo del cine: tambien viene de decadas de teatro y television, donde construyo una figura reconocible, querible y de enorme oficio.',
			biography: [
				'Luis Brandoni ocupa un lugar rarisimo dentro de la cultura argentina porque combina prestigio actoral, popularidad transversal y una relacion muy vieja con el teatro, la tele y el cine nacional. Tiene esa mezcla de actor clasico y figura popular que le permite pasar de la comedia al drama sin perder identidad.',
				'La seleccion del catalogo lo conecta con Esperando la carroza, Mi obra maestra, El cuento de las comadrejas y La odisea de los giles, un recorrido muy bueno para entender su alcance: humor costumbrista, duelos actorales, cine de gran publico y personajes que parecen salir directo de la calle argentina.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actor', work: 'Mi obra maestra', year: 2019 }],
			knownFor: ['el-cuento-de-las-comadrejas-2019', 'esperando-la-carroza-1985', 'la-odisea-de-los-giles-2019', 'mi-obra-maestra-2018'],
		},
		{
			slug: 'oscar-martinez',
			name: 'Oscar Martínez',
			headline: 'Actor argentino de enorme sofisticacion, con una mezcla rarissima de ironia, elegancia y densidad.',
			spotlight:
				'Es una referencia inmediata del actor intelectual argentino: filoso, preciso y con una manera muy personal de trabajar la ironia.',
			biography: [
				'Oscar Martinez viene del teatro y de una formacion muy solida, y eso se nota en la manera en que construye cada personaje: no necesita sobreactuar nada para imponer inteligencia, ego, fragilidad o veneno. Es uno de los actores argentinos que mejor envejecieron en pantalla.',
				'En Cine Posta queda conectado a El ciudadano ilustre, Competencia oficial y El cuento de las comadrejas. Ese trio alcanza para ver varias de sus zonas mas fuertes: el sarcasmo, el duelo verbal, la inseguridad escondida detras de la autosuficiencia y una enorme comodidad para sostener peliculas apoyadas en la actuacion.',
			],
			awards: [{ label: 'Goya', category: 'Mejor actor', work: 'El ciudadano ilustre', year: 2017 }],
			knownFor: ['competencia-oficial-2021', 'el-ciudadano-ilustre-2016', 'el-cuento-de-las-comadrejas-2019'],
		},
		{
			slug: 'diego-peretti',
			name: 'Diego Peretti',
			headline: 'Actor muy querido por el publico local, capaz de mezclar neurotica comica y peso dramatico con mucha precision.',
			spotlight:
				'Su recorrido tiene una marca muy propia: puede ser hilarante, ansioso o conmovedor sin dejar de sonar siempre cercano al espectador argentino.',
			biography: [
				'Diego Peretti logro algo dificil: convertirse en una figura super popular sin quedar limitado a un solo registro. Su paso previo por la psiquiatria, sumado a una intuicion muy fina para la observacion del comportamiento, le dio herramientas ideales para personajes cruzados por la neurosis, la culpa o la torpeza afectiva.',
				'Tiempo de valientes sigue siendo una referencia clarisima para verlo en accion, pero su peso en el cine y la television local va bastante mas alla de esa pelicula. Tiene timing de comedia, escucha para el drama y una cualidad muy argentina para hacer creible al tipo comun cuando todo alrededor se desordena.',
			],
			awards: [{ label: 'Martín Fierro', category: 'Mejor actor protagonista de unitario', work: 'En terapia', year: 2013 }],
			knownFor: ['tiempo-de-valientes-2005'],
		},
		{
			slug: 'dario-grandinetti',
			name: 'Darío Grandinetti',
			headline: 'Presencia finamente ambigua del cine argentino, ideal para personajes cultivados, opacos o imprevisibles.',
			spotlight:
				'Su carrera le dio un lugar muy particular: actor argentino de fuerte raiz local pero con circulacion natural en el cine espanol y de autor.',
			biography: [
				'Dario Grandinetti tiene una elegancia seca que lo volvio ideal para personajes sofisticados, ambiguos o directamente inquietantes. Sin hacer grandes despliegues gestuales, suele instalar una tension muy clara entre lo que el personaje muestra y lo que esconde.',
				'Rojo lo aprovecha muy bien en esa zona de respetabilidad enrarecida, pero su carrera viene de mucho antes y dialoga con varias etapas fuertes del cine iberoamericano. Eso lo convierte en una ficha muy util para un sitio que mira cine argentino con contexto regional y autoral.',
			],
			awards: [{ label: 'Premios Platino', category: 'Nominacion a mejor actor', work: 'Rojo', year: 2019 }],
			knownFor: ['rojo-2018'],
		},
		{
			slug: 'nahuel-perez-biscayart',
			name: 'Nahuel Pérez Biscayart',
			headline: 'Uno de los actores argentinos con mejor circulacion internacional y un registro cada vez mas prestigioso.',
			spotlight:
				'Su presencia fisica y emocional es muy singular: transmite fragilidad, deseo, violencia o desborde con una intensidad poco comun.',
			biography: [
				'Nahuel Perez Biscayart construyo una carrera mucho mas festivalera e internacional que la mayoria de sus contemporaneos argentinos. Eso no lo alejo de una identidad fuerte: sigue teniendo una energia muy rioplatense, solo que puesta al servicio de peliculas mas arriesgadas y directores muy distintos entre si.',
				'El Jockey lo suma al catalogo desde un lugar ideal, porque encaja con esa imagen de actor imprevisible, corporal y muy dispuesto al riesgo. Es de esos interpretes que no parecen ordenar la pelicula sino agitarla desde adentro.',
			],
			awards: [{ label: 'César', category: 'Nominacion a mejor actor revelacion', work: '120 BPM', year: 2018 }],
			knownFor: ['el-jockey-2024'],
		},
		{
			slug: 'daniel-fanego',
			name: 'Daniel Fanego',
			headline: 'Actor de enorme densidad y un timbre dramatico muy propio, clave para thrillers y dramas adultos argentinos.',
			spotlight:
				'Pocos actores argentinos tenian una autoridad tan inmediata para entrar a una escena y cargarla de conflicto, historia o amenaza.',
			biography: [
				'Daniel Fanego fue durante decadas una presencia central del cine, la television y el teatro argentinos. Tenia voz, rostro y tempo para personajes de poder, de desgaste o de cinismo, pero tambien una sensibilidad muy particular para volver humanos a tipos duros o moralmente quebrados.',
				'Betibu lo encuentra en una zona que le sentaba perfecto: thriller adulto, climas enrarecidos y personajes marcados por lo que saben y por lo que callan. Su figura sigue pesando mucho dentro del imaginario del cine argentino contemporaneo.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actor de reparto', work: 'Luna de Avellaneda', year: 2005 }],
			knownFor: ['betibu-2014'],
		},
		{
			slug: 'julio-chavez',
			name: 'Julio Chávez',
			headline: 'Uno de los grandes actores argentinos vivos, con una intensidad seca y una escucha muy poco comunes.',
			spotlight:
				'En escena transmite concentracion total: parece escuchar de verdad, pensar de verdad y reaccionar desde un lugar muy trabajado pero nunca mecanico.',
			biography: [
				'Julio Chavez tiene una carrera inmensa en teatro, cine y television, y en todos los formatos mantiene el mismo nivel de exigencia. Su estilo no pasa por el lucimiento vistoso sino por una intensidad contenida, muy precisa, que vuelve inolvidables incluso a los personajes mas cerrados o antipaticos.',
				'Un oso rojo muestra bien esa potencia seca, pero su peso en la actuacion argentina excede largamente un solo titulo. Es una referencia inevitable cuando se habla de actores de composicion, de trabajo de cuerpo y voz, y de presencia dramatica sostenida.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actor', work: 'El custodio', year: 2007 }],
			knownFor: ['un-oso-rojo-2002'],
		},
		{
			slug: 'joaquin-furriel',
			name: 'Joaquín Furriel',
			headline: 'Actor de presencia sobria y elegante, muy eficaz para thriller, drama y personajes bajo presion.',
			spotlight:
				'Tiene una pantalla serena pero muy tensionada, ideal para tipos que parecen controlados hasta que algo se les rompe.',
			biography: [
				'Joaquin Furriel construyo una carrera sostenida entre teatro, television y cine, con una imagen de actor serio, prolijo y muy confiable para relatos de tension. Le sale muy bien ese personaje que contiene mas de lo que dice y que va revelando el conflicto a medida que la pelicula lo aprieta.',
				'Cortafuego lo enlaza con el catalogo desde un presente de thriller, pero su valor editorial va mas alla de una pelicula puntual. Es una de esas figuras argentinas que pueden sostener protagonicos adultos sin necesidad de sobreactuar heroicidad ni tormento.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actor', work: 'El patron, radiografia de un crimen', year: 2015 }],
			knownFor: ['cortafuego-2026'],
		},
		{
			slug: 'eduardo-blanco',
			name: 'Eduardo Blanco',
			headline: 'Rostro queridisimo del cine argentino, especialista en humanidad, calidez y verdad popular.',
			spotlight:
				'Su gran virtud es que nunca parece actuar para la platea: transmite barrio, experiencia y vulnerabilidad con una naturalidad enorme.',
			biography: [
				'Eduardo Blanco es una pieza fundamental del cine argentino de las ultimas decadas porque representa como pocos al hombre comun llevado a situaciones limite, tiernas o dolorosas. Tiene una cercania inmediata que vuelve muy facil empatizar con sus personajes sin que pierdan complejidad.',
				'Luna de Avellaneda lo tiene en una de sus zonas mas queridas, pero su trayectoria tambien quedo muy marcada por colaboraciones fuertes dentro del cine industrial argentino de calidad. Cuando una pelicula necesita calor humano y verdad popular, su nombre aparece enseguida.',
			],
			awards: [{ label: 'Premios Sur', category: 'Mejor actor de reparto', work: 'Luna de Avellaneda', year: 2005 }],
			knownFor: ['luna-de-avellaneda-2004'],
		},
		{
			slug: 'gaston-pauls',
			name: 'Gastón Pauls',
			headline: 'Actor muy asociado al cambio de clima del cine argentino de fines de los noventa y principios de los dos mil.',
			spotlight:
				'Su imagen quedo muy ligada a una generacion de peliculas urbanas, nerviosas y desencantadas que marcaron epoca en Argentina.',
			biography: [
				'Gaston Pauls fue una de las caras mas visibles del recambio del cine argentino cuando el policial, la estafa y el retrato de una juventud desencajada empezaron a ganar otro pulso. Tiene una energia intensa, algo fragil y algo nocturna, que definio muy bien ese momento de pantalla.',
				'Nueve reinas es una referencia obligada para leer ese periodo, pero su presencia excede un solo clasico: tambien ayudo a construir una idea de actor joven argentino menos solemne y mas conectado con la calle, la duda y la velocidad del relato.',
			],
			awards: [{ label: 'Cóndor de Plata', category: 'Nominacion a mejor actor', work: 'Nueve reinas', year: 2001 }],
			knownFor: ['nueve-reinas-2000'],
		},
		{
			slug: 'mauricio-dayub',
			name: 'Mauricio Dayub',
			headline: 'Actor de enorme oficio y sensibilidad popular, siempre valioso cuando una pelicula necesita humanidad inmediata.',
			spotlight:
				'Su trayectoria teatral pesa mucho en pantalla: sabe dar verdad, humor y emocion sin cargar de mas ninguna escena.',
			biography: [
				'Mauricio Dayub es uno de los actores argentinos mas queridos dentro del cruce entre teatro comercial de calidad, television y cine. Tiene un oficio muy asentado, de esos que ordenan un elenco y hacen que la emocion llegue sin subrayados innecesarios.',
				'Corazon de leon lo conecta con el costado mas popular del catalogo, pero su valor tambien esta en la versatilidad. Puede sostener humor, ternura, observacion costumbrista y momentos de dolor con la misma naturalidad, algo nada facil de conseguir.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actor de reparto', work: 'El cuento de las comadrejas', year: 2020 }],
			knownFor: ['corazon-de-leon-2013'],
		},
	]),
	...buildCatalogBackedProfiles(argentineActressDefaults, [
		{
			slug: 'norma-aleandro',
			name: 'Norma Aleandro',
			headline: 'Leyenda absoluta del cine argentino, con una mezcla inigualable de inteligencia, calidez y autoridad dramatica.',
			spotlight:
				'Su figura excede ampliamente una pelicula o una epoca: es una referencia mayor del teatro y del cine argentino dentro y fuera del pais.',
			biography: [
				'Norma Aleandro ocupa un lugar central en la historia cultural argentina por la amplitud y la consistencia de su carrera. Tiene una inteligencia interpretativa muy rara, capaz de volver transparentes emociones complejas sin perder jamas elegancia ni contundencia.',
				'La historia oficial la proyecto al mundo y El hijo de la novia la volvio a confirmar para nuevas generaciones, pero su peso no depende solo de esos titulos. Hablar de ella es hablar de una actriz que sostuvo prestigio artistico, popularidad y reconocimiento internacional durante decadas.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'La historia oficial', year: 1986 }],
			knownFor: ['el-hijo-de-la-novia-2001', 'la-historia-oficial-1985'],
		},
		{
			slug: 'graciela-borges',
			name: 'Graciela Borges',
			headline: 'Icono historico de la pantalla argentina, elegante y feroz al mismo tiempo, siempre con peso de estrella.',
			spotlight:
				'Pocas figuras argentinas atravesaron tantas etapas del cine nacional conservando aura de estrella y verdadera curiosidad artistica.',
			biography: [
				'Graciela Borges empezo muy joven y termino convirtiendose en una presencia historica del cine argentino. Su carrera cruza melodrama, modernidad, cine de autor y personajes de una enorme sofisticacion emocional, siempre con una fotogenia y una personalidad muy dificiles de igualar.',
				'Que en el catalogo aparezca asociada tanto a La cienaga como a El cuento de las comadrejas habla bien de su amplitud. Puede dialogar con Lucrecia Martel o con una pelicula mas abierta al gran publico sin perder nunca su misterio ni su peso de figura legendaria.',
			],
			awards: [{ label: 'Premios Sur', category: 'Premio a la trayectoria', year: 2016 }],
			knownFor: ['el-cuento-de-las-comadrejas-2019', 'la-cienaga-2001'],
		},
		{
			slug: 'martina-gusman',
			name: 'Martina Gusmán',
			headline: 'Actriz argentina de intensidad frontal, muy potente cuando el cine pide fisicidad, calle y nervio.',
			spotlight:
				'Su mejor zona aparece cuando la pelicula necesita cuerpo, tension social y una energia que no busque ser simpatica.',
			biography: [
				'Martina Gusman construyo una imagen muy fuerte dentro del cine argentino contemporaneo a partir de personajes expuestos al limite fisico y moral. Tiene una forma directa de estar en pantalla, sin adornos, que la volvio clave para un tipo de drama urbano, aspero y muy corporal.',
				'Leonera y Carancho son dos puntos fundamentales para entender esa presencia, pero tambien sirven para medir su importancia dentro de una etapa fuerte del cine local que dialogo mucho con festivales y con una idea mas rugosa del realismo.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actriz', work: 'Carancho', year: 2011 }],
			knownFor: ['carancho-2010', 'leonera-2008'],
		},
		{
			slug: 'cecilia-dopazo',
			name: 'Cecilia Dopazo',
			headline: 'Actriz muy reconocible del cine argentino de los noventa, con presencia sensible y un tono muy local.',
			spotlight:
				'Su cara quedo asociada a un momento muy especifico del cine argentino, entre juventud, romanticismo y una energia urbana bien de epoca.',
			biography: [
				'Cecilia Dopazo fue una figura muy visible del cine argentino de los noventa y tambien tuvo mucho recorrido en television y teatro. En pantalla supo combinar fragilidad, empuje y una sensibilidad muy reconocible para personajes atravesados por el deseo, la epoca y la confusion sentimental.',
				'Tango feroz y Caballos salvajes la dejan muy bien ubicada dentro de ese tramo del cine local que mezclo impulso generacional, musica, road movie y dramatismo popular. Su presencia ayuda a leer una etapa entera, no solo un par de titulos sueltos.',
			],
			awards: [{ label: 'Cóndor de Plata', category: 'Nominacion a revelacion femenina', work: 'Tango feroz', year: 1994 }],
			knownFor: ['caballos-salvajes-1995', 'tango-feroz-la-leyenda-de-tanguito-1993'],
		},
		{
			slug: 'julieta-diaz',
			name: 'Julieta Díaz',
			headline: 'Actriz muy popular dentro del cine y la tele argentina, con una mezcla efectiva de calidez, humor y drama.',
			spotlight:
				'Tiene llegada masiva sin perder oficio: funciona muy bien en comedia romantica, drama familiar y relatos apoyados en vinculos cercanos.',
			biography: [
				'Julieta Diaz construyo una carrera muy solida entre television, teatro y cine, y eso la volvio una de las caras mas reconocibles para el publico argentino. Tiene una cercania muy natural, pero tambien sabe sostener conflictos emotivos sin volverse melosa ni subrayada.',
				'Corazon de leon la conecta en el sitio con un gran exito popular, aunque su recorrido es mas amplio. Es una actriz muy valiosa para el cine local porque puede atraer publico, darle ritmo a escenas cotidianas y al mismo tiempo cargar de verdad los momentos mas sensibles.',
			],
			awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actriz', work: 'Corazon de Leon', year: 2014 }],
			knownFor: ['corazon-de-leon-2013'],
		},
	]),
	'fernan-miras': {
		slug: 'fernan-miras',
		name: 'Fernán Mirás',
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fern%C3%A1n%20Mir%C3%A1s%20(cropped).jpg?width=640',
		headline:
			'Actor, director y guionista argentino que pasó de figura muy popular de los 90 a un recorrido cada vez más completo detrás y delante de cámara.',
		roles: ['Actor', 'Director', 'Guionista'],
		birthPlace: 'Buenos Aires, Argentina',
		spotlight:
			'Tango feroz lo volvió masivo, pero su carrera siguió creciendo en televisión, teatro y cine hasta sumar una etapa propia como director y coguionista.',
		biography: [
			'Fernán Gonzalo Mirás nació en Buenos Aires el 17 de julio de 1969. Según Wikipedia, debutó en teatro en 1987 con Cuba y su pequeño Teddy, de Reynaldo Povod, y poco después hizo su primer trabajo cinematográfico en La amiga, la película de Jeanine Meerapfel estrenada en 1988.',
			'El gran salto llegó en 1993 con Tango feroz: la leyenda de Tanguito, donde interpretó al músico Tanguito y quedó instalado como una de las caras fuertes de esa etapa del cine argentino. Después sostuvo mucha presencia en televisión con títulos como La banda del Golden Rocket, Chiquititas, Verano del 98, Vulnerables, Culpables, Rebelde Way, Para vestir santos y Tiempos compulsivos.',
			'Wikipedia también marca que, además de seguir actuando en cine y series, abrió una etapa como realizador con El peso de la ley, continuó como director y coguionista en Casi muerta y volvió a ese rol en La casaca de Dios. En el recorrido local eso lo vuelve una figura especialmente interesante: alguien que cruzó teatro, tele, cine industrial y dirección sin quedar atado a una sola versión de sí mismo.',
		],
		stats: [],
		awards: [
			{ label: 'Premio Cóndor de Plata', category: 'Nominacion por actuacion', work: 'Tango feroz: la leyenda de Tanguito', year: 1994 },
		],
		knownFor: ['la-casaca-de-dios-2026', 'tango-feroz-la-leyenda-de-tanguito-1993'],
		referenceUrls: [
			'https://es.wikipedia.org/wiki/Fern%C3%A1n_Mir%C3%A1s',
			'https://it.wikipedia.org/wiki/Tango_feroz_-_La_leyenda_de_Tanguito',
		],
	},
	'jorge-marrale': {
		slug: 'jorge-marrale',
		name: 'Jorge Marrale',
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/JMarrale.JPG?width=640',
		headline:
			'Actor argentino de larguísima trayectoria, muy asociado a villanos, figuras severas y personajes de enorme autoridad escénica.',
		roles: ['Actor'],
		birthPlace: 'Barracas, Buenos Aires, Argentina',
		spotlight:
			'Su formación en el Conservatorio y su paso por la Comedia Nacional del Cervantes ayudan a explicar la solidez con la que se movió entre teatro, cine y televisión durante décadas.',
		biography: [
			'Jorge Luis Marrale nació en Buenos Aires el 30 de junio de 1947. Wikipedia precisa que nació en Barracas, se crió en Lanús, cursó una secundaria industrial y llegó a empezar Ingeniería antes de decidirse por la actuación después de ver a Vittorio Gassman en El hombre de la flor en la boca.',
			'Dejó la facultad, entró al Conservatorio de Arte Dramático y egresó con un promedio que le permitió integrarse a la Comedia Nacional del Teatro Nacional Cervantes. En sus primeros años también trabajó en Segba y durante once años en Gas del Estado, hasta que entrados los 80 la continuidad actoral empezó a afirmarse y los 90 terminaron siendo uno de los períodos más fuertes de su carrera.',
			'Desde entonces acumuló una trayectoria enorme en televisión, teatro y cine, con un perfil muy reconocible para roles intensos o directamente villanescos. La misma Wikipedia lo registra además como presidente de SAGAI desde 2018 y como una voz activa en debates públicos sobre teatro y cultura, algo que termina de ubicarlo como una figura muy fuerte del oficio en Argentina.',
		],
		stats: [],
		awards: [{ label: 'Premio Cóndor de Plata', category: 'Mejor actor', work: 'Maracaibo', year: 2018 }],
		knownFor: ['la-casaca-de-dios-2026'],
		referenceUrls: ['https://es.wikipedia.org/wiki/Jorge_Marrale', 'https://en.wikipedia.org/wiki/Jorge_Marrale'],
	},
	'natalia-oreiro': {
		slug: 'natalia-oreiro',
		name: 'Natalia Oreiro',
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Natalia%20Oreiro%20at%202017%20MIFF%20(cropped).jpg?width=640',
		headline: 'Actriz y cantante uruguaya que construyó una carrera rioplatense enorme entre telenovelas, pop y cine.',
		roles: ['Actriz'],
		birthPlace: 'Montevideo, Uruguay',
		spotlight:
			'Se instaló en Argentina en 1994, explotó a escala internacional con Muñeca brava y después sostuvo una presencia fuerte también en el cine, sin dejar la música.',
		biography: [
			'Natalia Marisa Oreiro Iglesias nació en Montevideo el 19 de mayo de 1977. Wikipedia señala que empezó a trabajar en publicidades durante la preadolescencia y que a los 15 años ganó en Uruguay y luego en Argentina un concurso para ser Paquita de Xuxa, experiencia que terminó financiando su mudanza a Buenos Aires en 1994.',
			'Ya instalada en Argentina, encadenó títulos muy visibles como 90 60 90 modelos, Ricos y famosos y, sobre todo, Muñeca brava, el éxito que la internacionalizó y la dejó asociada a la llamada Oreiromanía. La misma página repasa que después siguió con Kachorra, Sos mi vida y Solamente vos, al mismo tiempo que desarrollaba una carrera musical solista con cuatro discos de estudio y más de siete millones de discos vendidos en el mundo.',
			'En cine, Wikipedia destaca películas como Un argentino en New York, Música en espera, Mi primera boda, Infancia clandestina, Wakolda y Gilda, no me arrepiento de este amor. Justamente por Gilda ganó el Cóndor de Plata y el Premio Sur a mejor actriz, un punto alto dentro de una trayectoria muy marcada por el ida y vuelta entre Uruguay, Argentina y un público popular gigantesco en toda la región.',
		],
		stats: [],
		awards: [{ label: 'Premio Cóndor de Plata', category: 'Mejor actriz', work: 'Gilda, no me arrepiento de este amor', year: 2017 }],
		knownFor: ['la-casaca-de-dios-2026'],
		referenceUrls: [
			'https://es.wikipedia.org/wiki/Natalia_Oreiro',
			'https://es.wikipedia.org/wiki/Gilda,_no_me_arrepiento_de_este_amor',
		],
	},
	'rafael-ferro': {
		slug: 'rafael-ferro',
		name: 'Rafael Ferro',
		profileImage: 'https://media.themoviedb.org/t/p/w500/rBPfuNG5p0mnPWMl0WgWbuxnW0p.jpg',
		headline:
			'Actor argentino de cine, teatro y televisión, muy reconocido por su intensidad y por una galería amplia de villanos televisivos.',
		roles: ['Actor'],
		birthPlace: 'Buenos Aires, Argentina',
		spotlight:
			'Su carrera mezcla tiras masivas, teatro y películas de perfil autoral, siempre con una presencia áspera y muy fácil de recordar.',
		biography: [
			'José Rafael Ferro nació en Buenos Aires el 6 de diciembre de 1965. Wikipedia indica que creció en el barrio de Palermo y que su carrera quedó repartida entre cine, teatro y televisión, con una visibilidad muy fuerte en la pantalla chica desde comienzos de los 2000.',
			'La propia entrada lo presenta como un actor especialmente ligado a telenovelas y series como Verano del 98, Resistiré, Lalola, Para vestir santos, Guapas, Un año para recordar y Las Estrellas, donde en muchos casos interpretó villanos. Esa asociación con personajes duros o incómodos terminó siendo una de sus marcas más reconocibles ante el público local.',
			'En paralelo también sostuvo una filmografía variada que va de Bolivia y La antena a Medianeras, El robo del siglo y La casaca de Dios. Wikipedia además registra una nominación a los Premios Sur por La vida después, señal de un recorrido que no quedó encerrado en la tele sino que también tuvo peso en el cine argentino contemporáneo.',
		],
		stats: [],
		awards: [{ label: 'Premios Sur', category: 'Nominacion a mejor actor de reparto', work: 'La vida después', year: 2015 }],
		knownFor: ['la-casaca-de-dios-2026'],
		referenceUrls: [
			'https://es.wikipedia.org/wiki/Rafael_Ferro',
			'https://es.wikipedia.org/wiki/Rafael_Ferro#Premios_y_nominaciones',
		],
	},
	'gore-verbinski': {
		slug: 'gore-verbinski',
		name: 'Gore Verbinski',
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gore%20Verbinski%201.JPG?width=640',
		headline: 'Director estadounidense que pasó de la publicidad y los videoclips al blockbuster con una firma visual muy marcada.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Oak Ridge, Tennessee, Estados Unidos',
		spotlight:
			'Su carrera combinó formación académica en UCLA, avisos premiados, terror de estudio y la primera gran trilogía de Piratas del Caribe antes del Oscar por Rango.',
		biography: [
			'Gregor Verbinski nació en Oak Ridge, Tennessee, el 16 de marzo de 1964. Wikipedia cuenta que su familia se mudó al sur de California en 1967 y que estudió cine y televisión en UCLA, donde se graduó en 1987 antes de empezar a dirigir numerosos anuncios publicitarios y videos musicales.',
			"Su debut como director de largometrajes fue MouseHunt, pero el salto fuerte llegó con The Ring y sobre todo con las tres primeras películas de Piratas del Caribe: The Curse of the Black Pearl, Dead Man's Chest y At World's End. Más adelante sumó títulos como El llanero solitario y A Cure for Wellness.",
			'Wikipedia también remarca que en 2011 ganó el Oscar a mejor película animada por Rango, película que además escribió y produjo. Esa combinación de oficio industrial, imaginación visual y capacidad para moverse entre live action y animación explica por qué su nombre sigue pesando tanto cuando aparece un proyecto suyo nuevo.',
		],
		stats: [],
		awards: [{ label: 'Oscar', category: 'Mejor pelicula animada', work: 'Rango', year: 2012 }],
		knownFor: [
			'buena-suerte-diviertete-no-mueras-2026',
			'pirates-of-the-caribbean-at-worlds-end-2007',
			'pirates-of-the-caribbean-dead-mans-chest-2006',
			'pirates-of-the-caribbean-the-curse-of-the-black-pearl-2003',
		],
		referenceUrls: ['https://es.wikipedia.org/wiki/Gore_Verbinski', 'https://es.wikipedia.org/wiki/Rango_(pel%C3%ADcula)'],
	},
	'sam-rockwell': {
		slug: 'sam-rockwell',
		name: 'Sam Rockwell',
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sam%20Rockwell%20(51492)%20(cropped).jpg?width=640',
		headline:
			'Actor estadounidense de registro excéntrico y enorme precisión, una referencia fija para personajes raros, eléctricos y muy magnéticos.',
		roles: ['Actor'],
		birthPlace: 'Daly City, California, Estados Unidos',
		spotlight:
			'Se formó en Nueva York, creció en el cine independiente y terminó convirtiendo esa rareza en un lugar propio dentro de Hollywood.',
		biography: [
			'Samuel Rockwell nació en Daly City, California, el 5 de noviembre de 1968. Wikipedia cuenta que es hijo de actores, que sus padres se separaron cuando era chico y que se crió entre San Francisco y los veranos con su madre en Nueva York. A los diez años ya había actuado en un escenario del East Village interpretando a Humphrey Bogart en un sketch improvisado.',
			'Después de terminar la secundaria se mudó a Nueva York para seguir la carrera, estudió en el William Esper Studio y pasó varios años encadenando apariciones chicas mientras trabajaba en restaurantes, hacía repartos en bicicleta y hasta colaboró con un detective privado. El quiebre llegó con Box of Moon Light y Lawn Dogs, dos películas que lo pusieron en el mapa del cine independiente.',
			'Wikipedia marca luego una progresión muy clara: Confesiones de una mente peligrosa como primer gran protagónico, Moon como consagración crítica y finalmente Three Billboards Outside Ebbing, Missouri, película por la que ganó el Oscar, el Globo de Oro, el BAFTA y el SAG como actor de reparto. Desde ahí quedó confirmado como uno de los intérpretes más singulares y confiables del cine estadounidense reciente.',
		],
		stats: [],
		awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'Three Billboards Outside Ebbing, Missouri', year: 2018 }],
		knownFor: ['buena-suerte-diviertete-no-mueras-2026'],
		referenceUrls: [
			'https://es.wikipedia.org/wiki/Sam_Rockwell',
			'https://es.wikipedia.org/wiki/Three_Billboards_Outside_Ebbing,_Missouri',
		],
	},
};

const bulkCompletionProfiles = {
	...buildCatalogBackedProfiles(globalActorDefaults, [
		{
			slug: 'brad-dourif',
			name: 'Brad Dourif',
			headline: 'Actor de culto con una intensidad rarisima, fundamental para el terror y para el cine de personajes torcidos.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: "One Flew Over the Cuckoo's Nest", year: 1976 }],
			knownFor: ['child-s-play-1988', 'bride-of-chucky-1998', 'cult-of-chucky-2017', 'one-flew-over-the-cuckoo-s-nest-1975'],
		},
		{
			slug: 'rupert-grint',
			name: 'Rupert Grint',
			headline: 'Rostro inseparable de Harry Potter, clave para la pata mas popular y generacional de esa saga dentro del sitio.',
			awards: [{ label: 'National Movie Awards', category: 'Nominacion a actuacion del ano', work: 'Harry Potter and the Deathly Hallows Part 1', year: 2011 }],
			knownFor: [
				'harry-potter-and-the-sorcerers-stone-2001',
				'harry-potter-and-the-prisoner-of-azkaban-2004',
				'harry-potter-and-the-half-blood-prince-2009',
				'harry-potter-and-the-deathly-hallows-part-2-2011',
			],
		},
		{
			slug: 'mark-hamill',
			name: 'Mark Hamill',
			headline: 'Icono pop absoluto entre Star Wars, animacion y doblaje, con una voz y una presencia que siguen pesando mucho.',
			awards: [{ label: 'Disney Legends', category: 'Trayectoria', year: 2017 }],
			knownFor: ['star-wars-episode-iv-a-new-hope-1977', 'star-wars-episode-v-the-empire-strikes-back-1980', 'star-wars-episode-viii-the-last-jedi-2017', 'child-s-play-2019'],
		},
		{
			slug: 'arnold-schwarzenegger',
			name: 'Arnold Schwarzenegger',
			headline: 'Superestrella total de la accion ochentosa y noventosa, todavia inseparable de Terminator y del cuerpo industrial del blockbuster.',
			awards: [{ label: 'Golden Globe Award for New Star of the Year – Actor', category: 'Revelacion masculina', year: 1977 }],
			knownFor: ['the-terminator-1984', 'terminator-2-judgment-day-1991', 'terminator-genisys-2015', 'terminator-dark-fate-2019'],
		},
		{
			slug: 'christopher-reeve',
			name: 'Christopher Reeve',
			headline: 'La cara definitiva de Superman para varias generaciones y una figura historica del cine fantastico clasico.',
			awards: [{ label: 'BAFTA', category: 'Revelacion cinematografica', work: 'Superman', year: 1980 }],
			knownFor: ['superman-1978', 'superman-ii-1980', 'superman-iii-1983', 'super-man-the-christopher-reeve-story-2024'],
		},
		{
			slug: 'donald-pleasence',
			name: 'Donald Pleasence',
			headline: 'Veterano britanico de enorme peso para el terror y para el cine de personajes obsesivos o perturbadores.',
			awards: [{ label: 'Tony Award', category: 'Nominacion a mejor actor en obra', year: 1965 }],
			knownFor: ['halloween-1978', 'halloween-ii-1981', 'halloween-4-the-return-of-michael-myers-1988', 'halloween-5-the-revenge-of-michael-myers-1989'],
		},
		{
			slug: 'geoffrey-rush',
			name: 'Geoffrey Rush',
			headline: 'Actor australiano de altisimo prestigio, capaz de llevar excentricidad, autoridad y humor venenoso con la misma comodidad.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'Shine', year: 1997 }],
			knownFor: ['pirates-of-the-caribbean-at-worlds-end-2007', 'pirates-of-the-caribbean-on-stranger-tides-2011', 'the-king-s-speech-2010', 'shakespeare-in-love-1998'],
		},
		{
			slug: 'henry-cavill',
			name: 'Henry Cavill',
			headline: 'Figura muy instalada del blockbuster de estudio, entre superheroes, espias y musculatura de leading man clasico.',
			awards: [{ label: 'MTV Movie Award', category: 'Best Hero', work: 'Man of Steel', year: 2014 }],
			knownFor: ['man-of-steel-2013', 'batman-v-superman-dawn-of-justice-2016', 'justice-league-2017', 'mission-impossible-fallout-2018'],
		},
		{
			slug: 'robert-englund',
			name: 'Robert Englund',
			headline: 'Leyenda absoluta del horror moderno, inseparable de Freddy Krueger y del slasher de video club.',
			awards: [{ label: 'Saturn Award', category: 'Nominacion a mejor actor de reparto', work: 'A Nightmare on Elm Street 3: Dream Warriors', year: 1988 }],
			knownFor: ['a-nightmare-on-elm-street-4-the-dream-master-1988', 'a-nightmare-on-elm-street-5-the-dream-child-1989', 'freddy-vs-jason-2003', 'wes-craven-s-new-nightmare-1994'],
		},
		{
			slug: 'ving-rhames',
			name: 'Ving Rhames',
			headline: 'Actor de presencia enorme y voz inconfundible, muy asociado al cine de accion y a figuras de poder duro.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en miniserie o telefilm', work: 'Don King: Only in America', year: 1998 }],
			knownFor: ['mission-impossible-iii-2006', 'mission-impossible-fallout-2018', 'mission-impossible-dead-reckoning-part-one-2023', 'mission-impossible-the-final-reckoning-2025'],
		},
		{
			slug: 'ed-harris',
			name: 'Ed Harris',
			headline: 'Actor de enorme autoridad dramatica, ideal para personajes severos, desgastados o moralmente ambiguos.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de reparto en miniserie o telefilm', work: 'Game Change', year: 2013 }],
			knownFor: ['the-truman-show-1998', 'a-beautiful-mind-2001', 'love-lies-bleeding-2024', 'jugada-maestra-2026'],
		},
		{
			slug: 'gerard-butler',
			name: 'Gerard Butler',
			headline: 'Actor escoces muy reconocible para accion y aventura, con una energia de heroe fisico que sigue siendo vendible.',
			awards: [{ label: 'MTV Movie Award', category: 'Nominacion a mejor actuacion', work: '300', year: 2007 }],
			knownFor: ['how-to-train-your-dragon-2010', 'how-to-train-your-dragon-2-2014', 'how-to-train-your-dragon-2025', 'greenland-2-migration-2026'],
		},
		{
			slug: 'jeff-goldblum',
			name: 'Jeff Goldblum',
			headline: 'Figura unica del cine norteamericano, con carisma excéntrico y un ritmo verbal que lo vuelve reconocible al instante.',
			awards: [{ label: 'Hollywood Walk of Fame', category: 'Trayectoria' }],
			knownFor: ['jurassic-park-1993', 'the-lost-world-jurassic-park-1997', 'wicked-2024', 'wicked-for-good-2025'],
		},
		{
			slug: 'mel-gibson',
			name: 'Mel Gibson',
			headline: 'Estrella historica del cine de accion y aventura que tambien dejo una marca gigante como realizador.',
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Braveheart', year: 1996 }],
			knownFor: ['mad-max-1979', 'mad-max-2-1981', 'mad-max-beyond-thunderdome-1985', 'braveheart-1995'],
		},
		{
			slug: 'paul-rudd',
			name: 'Paul Rudd',
			headline: 'Actor muy querido del mainstream reciente, con timing de comedia y una version amable del heroe de franquicia.',
			awards: [{ label: 'Hollywood Walk of Fame', category: 'Trayectoria' }],
			knownFor: ['halloween-the-curse-of-michael-myers-1995', 'ant-man-2015', 'ant-man-and-the-wasp-2018', 'ant-man-and-the-wasp-quantumania-2023'],
		},
		{
			slug: 'sam-worthington',
			name: 'Sam Worthington',
			headline: 'Actor asociado al blockbuster sci-fi de gran escala, especialmente a la maquinaria emocional y tecnica de Avatar.',
			awards: [{ label: 'Saturn Award', category: 'Nominacion a mejor actor', work: 'Avatar', year: 2010 }],
			knownFor: ['avatar-2009', 'avatar-the-way-of-water-2022', 'avatar-fuego-y-cenizas-2025', 'terminator-salvation-2009'],
		},
		{
			slug: 'chris-pine',
			name: 'Chris Pine',
			headline: 'Leading man moderno con mezcla de ironia, elegancia y presencia fisica, muy comodo entre fantasia, comedia y accion.',
			awards: [{ label: "Critics' Choice Award", category: 'Nominacion a mejor elenco', work: 'Hell or High Water', year: 2017 }],
			knownFor: ['wonder-woman-2017', 'wonder-woman-1984-2020', 'wish-2023'],
		},
		{
			slug: 'christopher-lloyd',
			name: 'Christopher Lloyd',
			headline: 'Actor de composicion inolvidable, historico para el cine fantastico y para personajes excéntricos de culto.',
			awards: [{ label: 'Primetime Emmy', category: 'Mejor actor de reparto en comedia', work: 'Taxi', year: 1983 }],
			knownFor: ['back-to-the-future-1985', 'back-to-the-future-part-ii-1989', 'back-to-the-future-part-iii-1990'],
		},
		{
			slug: 'david-arquette',
			name: 'David Arquette',
			headline: 'Nombre muy ligado al terror pop noventoso y a la identidad coral de la saga Scream.',
			awards: [{ label: 'Teen Choice Award', category: 'Quimica en pantalla', work: 'Scream 3', year: 2000 }],
			knownFor: ['scream-1996', 'scream-2-1997', 'scream-3-2000'],
		},
		{
			slug: 'james-franco',
			name: 'James Franco',
			headline: 'Actor muy visible de los 2000 y 2010, siempre cerca de personajes desprolijos, carismaticos o deliberadamente inestables.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en miniserie o telefilm', work: 'James Dean', year: 2002 }],
			knownFor: ['spider-man-2-2004', 'spider-man-3-2007', 'rise-of-the-planet-of-the-apes-2011'],
		},
		{
			slug: 'jason-bateman',
			name: 'Jason Bateman',
			headline: 'Actor de perfil sobrio y muy afilado para la comedia seca, el thriller y la ironia contemporanea.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en serie de comedia', work: 'Arrested Development', year: 2005 }],
			knownFor: ['carry-on-2024', 'thunder-force-2021', 'zootopia-2-2025'],
		},
		{
			slug: 'marlon-brando',
			name: 'Marlon Brando',
			headline: 'Gigante absoluto de la actuacion del siglo XX, referencia ineludible para entender el star system y el actor moderno.',
			awards: [{ label: 'Oscar', category: 'Mejor actor', work: 'The Godfather', year: 1973 }],
			knownFor: ['on-the-waterfront-1954', 'the-godfather-1972', 'apocalypse-now-1979'],
		},
		{
			slug: 'michael-j-fox',
			name: 'Michael J. Fox',
			headline: 'Icono total de los ochenta, inseparable de la aventura pop y del carisma comico que hizo enorme a Volver al futuro.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en serie de comedia', work: 'Spin City', year: 2000 }],
			knownFor: ['back-to-the-future-1985', 'back-to-the-future-part-ii-1989', 'back-to-the-future-part-iii-1990'],
		},
		{
			slug: 'orlando-bloom',
			name: 'Orlando Bloom',
			headline: 'Figura muy asociada al cine de aventuras y fantasia de gran escala, clave para el blockbuster de los 2000.',
			awards: [{ label: 'Screen Actors Guild Award', category: 'Mejor elenco', work: 'The Lord of the Rings: The Return of the King', year: 2004 }],
			knownFor: ['pirates-of-the-caribbean-the-curse-of-the-black-pearl-2003', 'pirates-of-the-caribbean-dead-mans-chest-2006', 'pirates-of-the-caribbean-at-worlds-end-2007'],
		},
		{
			slug: 'patrick-stewart',
			name: 'Patrick Stewart',
			headline: 'Actor britanico legendario, con una autoridad escenica que le dio espesor a ciencia ficcion, teatro y blockbuster.',
			awards: [{ label: 'Hollywood Walk of Fame', category: 'Trayectoria' }],
			knownFor: ['x-men-2000', 'x2-2003', 'logan-2017'],
		},
		{
			slug: 'paul-walker',
			name: 'Paul Walker',
			headline: 'Rostro central de Rapido y furioso, asociado para siempre al costado mas afectivo y callejero de esa franquicia.',
			awards: [{ label: 'MTV Movie Award', category: 'Best On-Screen Duo', work: 'The Fast and the Furious', year: 2002 }],
			knownFor: ['the-fast-and-the-furious-2001', 'fast-five-2011', 'furious-7-2015'],
		},
		{
			slug: 'tommy-lee-jones',
			name: 'Tommy Lee Jones',
			headline: 'Actor de rostro durisimo y enorme oficio, muy eficaz para personajes de ley, poder o desgaste moral.',
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'The Fugitive', year: 1994 }],
			knownFor: ['no-country-for-old-men-2007', 'captain-america-the-first-avenger-2011', 'batman-forever-1995'],
		},
		{
			slug: 'vin-diesel',
			name: 'Vin Diesel',
			headline: 'Figura central del action franchise contemporaneo, muy ligada al costado muscular y familiar de Rapido y furioso.',
			awards: [{ label: 'MTV Movie Award', category: 'Best On-Screen Duo', work: 'Fast & Furious 6', year: 2014 }],
			knownFor: ['the-fast-and-the-furious-2001', 'fast-five-2011', 'f9-the-fast-saga-2021'],
		},
		{
			slug: 'anthony-mackie',
			name: 'Anthony Mackie',
			headline: 'Actor muy instalado en el cine comercial reciente, capaz de mezclar carisma liviano y dramatismo sin volverse solemne.',
			awards: [{ label: 'Black Reel Award', category: 'Mejor actor de reparto', work: 'The Hurt Locker', year: 2010 }],
			knownFor: ['the-hurt-locker-2008', 'captain-america-brave-new-world-2025'],
		},
		{
			slug: 'andy-serkis',
			name: 'Andy Serkis',
			headline: 'Pionero absoluto de la captura de movimiento y actor clave para entender el blockbuster digital del siglo XXI.',
			awards: [{ label: 'Saturn Award', category: 'Mejor actor de reparto', work: 'The Lord of the Rings: The Return of the King', year: 2004 }],
			knownFor: ['dawn-of-the-planet-of-the-apes-2014', 'war-for-the-planet-of-the-apes-2017'],
		},
		{
			slug: 'michael-caine',
			name: 'Michael Caine',
			headline: 'Actor britanico gigantesco, de elegancia seca y trayectoria monumental entre clasicos, thrillers y blockbuster.',
			awards: [{ label: 'Oscar', category: 'Mejor actor de reparto', work: 'The Cider House Rules', year: 2000 }],
			knownFor: ['batman-begins-2005', 'the-prestige-2006'],
		},
		{
			slug: 'michael-shannon',
			name: 'Michael Shannon',
			headline: 'Actor de intensidad seca y amenazante, muy valioso para personajes que parecen quebrarse por dentro.',
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor de reparto', work: 'Nocturnal Animals', year: 2017 }],
			knownFor: ['the-shape-of-water-2017', 'nuremberg-2025'],
		},
		{
			slug: 'jeremy-renner',
			name: 'Jeremy Renner',
			headline: 'Actor de energia sobria y fisica, muy fuerte cuando una pelicula necesita tension, oficio y dureza sin pose.',
			awards: [{ label: 'Screen Actors Guild Award', category: 'Mejor elenco', work: 'American Hustle', year: 2014 }],
			knownFor: ['the-hurt-locker-2008', 'mission-impossible-rogue-nation-2015'],
		},
		{
			slug: 'alberto-ammann',
			name: 'Alberto Ammann',
			headline: 'Actor argentino-espanol muy valioso para thrillers y dramas de temperatura oscura, con fuerte circulacion iberoamericana.',
			spotlight:
				'Dentro del cine argentino reciente suma una mezcla interesante de prestigio, fisico de personaje y una carrera armada entre Buenos Aires y Espana.',
			biography: [
				'Alberto Ammann construyo una carrera muy particular porque nunca quedo encerrado en una sola industria ni en un unico tipo de personaje. Tiene una presencia dura, a veces opaca y a veces explosiva, que le sienta muy bien al thriller, al policial y a los dramas de clima espeso.',
				'En el catalogo aparece asociado a Tesis sobre un homicidio y Betibu, dos titulos que lo conectan con un costado bien reconocible del cine rioplatense: intriga, zonas grises, personajes atravesados por secretos y una actuacion que trabaja mas desde la tension que desde el lucimiento.',
			],
			awards: [{ label: 'Goya', category: 'Mejor actor revelacion', work: 'Cell 211', year: 2010 }],
			knownFor: ['tesis-sobre-un-homicidio-2013', 'betibu-2014'],
		},
		{
			slug: 'luis-ziembrowski',
			name: 'Luis Ziembrowski',
			headline: 'Actor argentino muy respetado por su intensidad, su fisico expresivo y su facilidad para volver inquietante cualquier escena.',
			spotlight:
				'Para el cine argentino de genero y para varios dramas urbanos pesados, su presencia funciona como un acelerador inmediato de tension y extrañeza.',
			biography: [
				'Luis Ziembrowski es una de esas caras del cine argentino que el publico reconoce enseguida aunque no siempre se lo ubique como estrella. Tiene una energia muy particular, entre fragilidad, amenaza y desborde, que lo hizo valiosisimo para peliculas de clima raro, violencia contenida o personajes al borde.',
				'Que el sitio lo conecte con Septimo y Cuando acecha la maldad tiene bastante sentido editorial: ahi aparece una parte importante de su valor, la de un actor capaz de meterse tanto en el thriller industrial como en el terror argentino contemporaneo sin perder identidad propia.',
			],
			awards: [{ label: 'Cóndor de Plata', category: 'Mejor actor de reparto', work: 'Los sonambulos', year: 2020 }],
			knownFor: ['septimo-2013', 'cuando-acecha-la-maldad-2023'],
		},
	]),
	...buildCatalogBackedProfiles(globalActressDefaults, [
		{
			slug: 'carrie-fisher',
			name: 'Carrie Fisher',
			headline: 'Icono pop absoluto cuya imagen como Leia ya forma parte de la historia grande del cine comercial.',
			awards: [{ label: 'Disney Legends', category: 'Trayectoria', year: 2017 }],
			knownFor: ['star-wars-episode-iv-a-new-hope-1977', 'star-wars-episode-v-the-empire-strikes-back-1980', 'star-wars-episode-vii-the-force-awakens-2015', 'star-wars-episode-viii-the-last-jedi-2017'],
		},
		{
			slug: 'carrie-anne-moss',
			name: 'Carrie-Anne Moss',
			headline: 'Figura central del sci-fi de fines de los noventa y principios de los dos mil, siempre asociada a personajes duros y elegantes.',
			awards: [{ label: 'Independent Spirit Award', category: 'Nominacion a mejor actriz de reparto', work: 'Memento', year: 2002 }],
			knownFor: ['the-matrix-1999', 'matrix-reloaded-2003', 'matrix-revolutions-2003', 'memento-2000'],
		},
		{
			slug: 'courteney-cox',
			name: 'Courteney Cox',
			headline: 'Actriz hiperreconocible entre Friends y Scream, con un pie fuerte en la comedia masiva y otro en el terror mainstream.',
			awards: [{ label: 'Hollywood Walk of Fame', category: 'Trayectoria', year: 2023 }],
			knownFor: ['scream-1996', 'scream-2-1997', 'scream-4-2011', 'scream-7-2026'],
		},
		{
			slug: 'gal-gadot',
			name: 'Gal Gadot',
			headline: 'Figura muy visible del blockbuster reciente, ligada al imaginario superheroico y al star power global.',
			awards: [{ label: 'Hollywood Walk of Fame', category: 'Trayectoria' }],
			knownFor: ['wonder-woman-2017', 'wonder-woman-1984-2020', 'zack-snyder-s-justice-league-2021', 'snow-white-2025'],
		},
		{
			slug: 'neve-campbell',
			name: 'Neve Campbell',
			headline: 'Rostro central del slasher noventoso y una pieza clave para la identidad completa de Scream en el catalogo.',
			awards: [{ label: 'Saturn Award', category: 'Nominacion a mejor actriz', work: 'Scream', year: 1997 }],
			knownFor: ['scream-1996', 'scream-2-1997', 'scream-4-2011', 'scream-7-2026'],
		},
		{
			slug: 'gwyneth-paltrow',
			name: 'Gwyneth Paltrow',
			headline: 'Actriz muy asociada al star system de los noventa y dos mil, entre prestigio romanticizado y blockbuster puro.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz', work: 'Shakespeare in Love', year: 1999 }],
			knownFor: ['se7en-1995', 'shakespeare-in-love-1998', 'iron-man-2-2010', 'iron-man-3-2013'],
		},
		{
			slug: 'uma-thurman',
			name: 'Uma Thurman',
			headline: 'Figura muy potente del cine de autor popular, con una fotogenia y una fisicidad que dejaron huella duradera.',
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz en miniserie o telefilm', work: 'Hysterical Blindness', year: 2003 }],
			knownFor: ['pulp-fiction-1994', 'kill-bill-vol-1-2003', 'kill-bill-vol-2-2004', 'pretty-lethal-2026'],
		},
		{
			slug: 'bryce-dallas-howard',
			name: 'Bryce Dallas Howard',
			headline: 'Actriz muy reconocible del blockbuster reciente, particularmente ligada al renacimiento Jurassic World.',
			awards: [{ label: 'Hasty Pudding Woman of the Year', category: 'Trayectoria', year: 2019 }],
			knownFor: ['jurassic-world-2015', 'jurassic-world-fallen-kingdom-2018', 'jurassic-world-dominion-2022'],
		},
		{
			slug: 'evangeline-lilly',
			name: 'Evangeline Lilly',
			headline: 'Actriz muy asociada al sci-fi y la aventura de gran estudio, con una presencia sobria que siempre ordena bien la escena.',
			awards: [{ label: 'Screen Actors Guild Award', category: 'Mejor elenco en drama', work: 'Lost', year: 2006 }],
			knownFor: ['ant-man-2015', 'ant-man-and-the-wasp-2018', 'ant-man-and-the-wasp-quantumania-2023'],
		},
		{
			slug: 'linda-hamilton',
			name: 'Linda Hamilton',
			headline: 'Icono absoluto del cine de accion y sci-fi, central para la dimension humana y fisica de Terminator.',
			awards: [{ label: 'Saturn Award', category: 'Mejor actriz', work: 'Terminator 2: Judgment Day', year: 1992 }],
			knownFor: ['the-terminator-1984', 'terminator-2-judgment-day-1991', 'terminator-dark-fate-2019'],
		},
		{
			slug: 'tessa-thompson',
			name: 'Tessa Thompson',
			headline: 'Actriz de enorme elegancia y una pantalla contemporanea muy fuerte, ideal para personajes filosos, seguros o contradictorios.',
			awards: [{ label: 'Independent Spirit Award', category: 'Nominacion a mejor actriz', work: 'Dear White People', year: 2015 }],
			knownFor: ['creed-2015', 'creed-ii-2018', 'creed-iii-2023'],
		},
		{
			slug: 'jodie-comer',
			name: 'Jodie Comer',
			headline: 'Actriz britanica de enorme actualidad, muy valorada por su elasticidad y por la precision con la que cambia de registro.',
			awards: [{ label: 'Primetime Emmy', category: 'Mejor actriz dramatica', work: 'Killing Eve', year: 2019 }],
			knownFor: ['free-guy-2021', '28-years-later-2025'],
		},
		{
			slug: 'penelope-cruz',
			name: 'Penélope Cruz',
			headline: 'Una de las grandes estrellas iberoamericanas del cine contemporaneo, con peso real tanto en Hollywood como en el cine de autor.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Vicky Cristina Barcelona', year: 2009 }],
			knownFor: ['pirates-of-the-caribbean-on-stranger-tides-2011', 'competencia-oficial-2021'],
		},
		{
			slug: 'jennifer-garner',
			name: 'Jennifer Garner',
			headline: 'Figura muy conocida del mainstream de los 2000, asociada a accion, comic book movies y un carisma muy accesible.',
			awards: [{ label: 'Hollywood Walk of Fame', category: 'Trayectoria' }],
			knownFor: ['daredevil-2003', 'elektra-2005'],
		},
		{
			slug: 'melissa-barrera',
			name: 'Melissa Barrera',
			headline: 'Actriz mexicana con mucho peso en el terror mainstream reciente y una presencia cada vez mas identificable para el publico joven.',
			awards: [{ label: 'Imagen Award', category: 'Nominacion a mejor actriz', work: 'Vida', year: 2021 }],
			knownFor: ['scream-2022', 'scream-vi-2023'],
		},
	]),
};

const bulkRequestedProfiles = {
	...buildCatalogBackedProfiles(globalActorDefaults, [
		{
			slug: 'keegan-michael-key',
			name: 'Keegan-Michael Key',
			headline: 'Comediante y actor hiperreconocible, con timing de sketch y energia suficiente para sostener doblaje, musical y mainstream puro.',
			awards: [{ label: 'Primetime Emmy', category: 'Mejor serie de sketches de variedades', work: 'Key & Peele', year: 2016 }],
			knownFor: ['super-mario-galaxy-2026', 'wonka-2023'],
		},
		{
			slug: 'charlie-day',
			name: 'Charlie Day',
			headline: 'Actor y comediante de nervio caotico, muy asociado a personajes acelerados que vuelven memorable cualquier escena.',
			awards: [{ label: "Critics' Choice Television Award", category: 'Nominacion a mejor actor en comedia', work: "It's Always Sunny in Philadelphia", year: 2011 }],
			knownFor: ['super-mario-galaxy-2026', 'the-super-mario-bros-movie-2023'],
		},
		{
			slug: 'jack-quaid',
			name: 'Jack Quaid',
			headline: 'Cara muy instalada de la camada joven del mainstream, entre accion pop, terror y un carisma bastante relajado.',
			awards: [{ label: 'Critics Choice Super Award', category: 'Nominacion a mejor actor en pelicula de accion', work: 'Novocaine', year: 2025 }],
			knownFor: ['companion-2025', 'novocaine-2025'],
		},
		{
			slug: 'john-travolta',
			name: 'John Travolta',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/John%20Travolta%2C%202014%20(cropped).jpg?width=640',
			headline:
				'Figura enorme del cine popular estadounidense, capaz de mezclar baile, carisma de estrella y una veta rara que lo mantuvo vigente durante decadas.',
			birthPlace: 'Englewood, Nueva Jersey, Estados Unidos',
			spotlight:
				'Su carrera tuvo picos muy distintos, del estallido disco y la fiebre pop de los setenta al renacimiento noventoso con Tarantino y varios thrillers de estudio.',
			biography: [
				'John Travolta nacio el 18 de febrero de 1954 en Englewood y crecio en una familia muy ligada al espectaculo. Empezo en el teatro musical y salto rapido a la fama con Welcome Back, Kotter, Saturday Night Fever y Grease, tres trabajos que lo volvieron una de las caras mas reconocibles de fines de los setenta.',
				'Despues de una etapa mas irregular, Pulp Fiction lo devolvio al centro de la conversacion critica y popular con un papel que reorganizo toda su imagen publica. Desde entonces siguio alternando accion, comedia, policial y thriller, siempre con ese magnetismo medio canchero que sigue haciendo reconocible a Travolta apenas entra en cuadro.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actor', work: 'Pulp Fiction', year: 1995 }],
			knownFor: ['pulp-fiction-1994', 'the-punisher-2004'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/John_Travolta',
				'https://www.wikidata.org/wiki/Q80938',
				'https://www.oscars.org/oscars/ceremonies/1995',
			],
		},
		{
			slug: 'jim-carrey',
			name: 'Jim Carrey',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Jim%20Carrey%202020%20cropped.jpg?width=640',
			headline:
				'Comediante y actor de energia fisica arrolladora que paso del gesto desatado al drama sin perder una personalidad instantaneamente reconocible.',
			birthPlace: 'Newmarket, Ontario, Canada',
			spotlight:
				'Convirtio su elasticidad corporal y su timing salvaje en una marca pop global, pero tambien demostro un costado dramatico mucho mas fino de lo que muchos le suponian.',
			biography: [
				'Jim Carrey nacio el 17 de enero de 1962 en Newmarket, Ontario, y se formo primero en el circuito de stand-up, donde pulio una combinacion rarissima de imitacion, velocidad y desborde fisico. Cuando entro a la tele y despues al cine, esa energia ya venia completamente aceitada.',
				'Ace Ventura, The Mask y Dumb and Dumber lo convirtieron en un fenomeno de los noventa, pero The Truman Show, Man on the Moon y Eternal Sunshine of the Spotless Mind mostraron enseguida que podia trabajar registros mucho mas melancolicos y complejos. En el catalogo del sitio queda unido a Batman Forever y The Truman Show, un cruce muy bueno para ver sus dos caras mas famosas.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor en comedia o musical', work: 'The Truman Show', year: 1999 }],
			knownFor: ['batman-forever-1995', 'the-truman-show-1998'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Jim_Carrey',
				'https://www.wikidata.org/wiki/Q40504',
				'https://www.goldenglobes.com/person/jim-carrey',
			],
		},
		{
			slug: 'eddie-murphy',
			name: 'Eddie Murphy',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Eddie%20Murphy%20by%20David%20Shankbone.jpg?width=640',
			headline:
				'Superestrella de la comedia y del doblaje mainstream, una presencia central para entender la cultura popular estadounidense desde los ochenta para aca.',
			birthPlace: 'Brooklyn, Nueva York, Estados Unidos',
			spotlight:
				'Paso de revolucionar el humor televisivo a liderar franquicias de cine y ponerle voz a uno de los personajes animados mas queridos de este siglo.',
			biography: [
				'Eddie Murphy nacio el 3 de abril de 1961 en Brooklyn y exploto muy joven gracias a Saturday Night Live, donde su velocidad comica y su capacidad para aduenarse de cualquier sketch lo volvieron una figura inmediata. Ese impulso paso casi sin escalas al cine, donde armo una racha demoledora en los ochenta con 48 Hrs., Trading Places, Beverly Hills Cop y Coming to America.',
				'Con el tiempo amplio su perfil entre comedia familiar, doblaje y proyectos mas dramaticos. El exito global de Shrek le dio una segunda vida para otra generacion, mientras que Dreamgirls le devolvio prestigio de premios. Dentro del sitio queda conectado a Axel F y Shrek, dos puntas muy claras de una carrera larguisima y todavia muy popular.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actor de reparto', work: 'Dreamgirls', year: 2007 }],
			knownFor: ['beverly-hills-cop-axel-f-2024', 'shrek-2001'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Eddie_Murphy',
				'https://www.wikidata.org/wiki/Q43874',
				'https://www.goldenglobes.com/person/eddie-murphy',
			],
		},
	]),
	...buildCatalogBackedProfiles(globalActressDefaults, [
		{
			slug: 'zazie-beetz',
			name: 'Zazie Beetz',
			headline: 'Actriz de presencia muy contemporanea, siempre efectiva para personajes secos, filosos o un poco imprevisibles.',
			awards: [{ label: 'Primetime Emmy', category: 'Nominacion a mejor actriz de reparto en comedia', work: 'Atlanta', year: 2018 }],
			knownFor: ['joker-2019', 'te-van-a-matar-2026'],
		},
		{
			slug: 'patricia-arquette',
			name: 'Patricia Arquette',
			headline: 'Actriz importantisima de varias decadas, con prestigio real y una mezcla muy rara de vulnerabilidad, aspereza y verdad.',
			awards: [{ label: 'Oscar', category: 'Mejor actriz de reparto', work: 'Boyhood', year: 2015 }],
			knownFor: ['te-van-a-matar-2026'],
		},
		{
			slug: 'samara-weaving',
			name: 'Samara Weaving',
			headline: 'Actriz muy fuerte para terror y comedia negra, con una energia fisica que la volvio figura de genero en tiempo record.',
			awards: [{ label: 'AACTA Award', category: 'Nominacion a mejor actriz de television', work: 'Home and Away', year: 2011 }],
			knownFor: ['boda-sangrienta-2-2026'],
		},
		{
			slug: 'kathryn-newton',
			name: 'Kathryn Newton',
			headline: 'Actriz joven muy visible en terror, comedia y fantasy pop, con perfil claro de estrella de genero contemporanea.',
			awards: [{ label: 'Young Artist Award', category: 'Mejor actriz joven de reparto', work: 'Paranormal Activity 4', year: 2013 }],
			knownFor: ['boda-sangrienta-2-2026'],
		},
		{
			slug: 'adria-arjona',
			name: 'Adria Arjona',
			headline: 'Actriz cada vez mas presente en el mainstream reciente, con una mezcla util de elegancia, misterio y fisico de thriller.',
			awards: [{ label: 'Imagen Award', category: 'Nominacion a mejor actriz en television', work: 'Emerald City', year: 2017 }],
			knownFor: ['hit-man-2024', 'morbius-2022'],
		},
		{
			slug: 'cameron-diaz',
			name: 'Cameron Diaz',
			headline: 'Una de las grandes caras del mainstream noventoso y dosmilero, entre comedia, animacion y star power puro.',
			awards: [{ label: 'Hollywood Walk of Fame', category: 'Trayectoria', year: 2009 }],
			knownFor: ['back-in-action-2025', 'shrek-2001'],
		},
		{
			slug: 'toni-collette',
			name: 'Toni Collette',
			headline: 'Actriz enorme, capaz de llevar drama, comedia y terror con una precision emocional que casi nunca falla.',
			awards: [{ label: 'Primetime Emmy', category: 'Mejor actriz en comedia', work: 'United States of Tara', year: 2009 }],
			knownFor: ['nightmare-alley-2021', 'the-sixth-sense-1999'],
		},
		{
			slug: 'keira-knightley',
			name: 'Keira Knightley',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/KeiraKnightleyByAndreaRaffin2011%20(cropped).jpg?width=640',
			headline:
				'Actriz britanica que supo combinar cine de epoca, franquicia global y drama adulto con una elegancia muy poco aparatosa.',
			birthPlace: 'Teddington, Londres, Inglaterra',
			spotlight:
				'Su filmografia se sostiene sobre un equilibrio raro entre star system, sensibilidad clasica y una presencia muy afinada para personajes romanticos o tensos.',
			biography: [
				'Keira Knightley nacio el 26 de marzo de 1985 en Teddington y empezo a trabajar de chica despues de criarse en una familia de actores y dramaturgos. El salto mas fuerte le llego muy temprano con Bend It Like Beckham y, enseguida, con Pirates of the Caribbean, saga que la termino de instalar como estrella global.',
				'Lejos de quedarse en el blockbuster, Knightley encontro rapido una zona muy fuerte en los dramas de epoca y los personajes emocionalmente contenidos. Pride & Prejudice, Atonement, Never Let Me Go y The Imitation Game ayudaron a consolidar una carrera donde la delicadeza nunca le quita firmeza a lo que interpreta.',
			],
			awards: [{ label: 'Oscar', category: 'Nominacion a mejor actriz', work: 'Pride & Prejudice', year: 2006 }],
			knownFor: ['pirates-of-the-caribbean-the-curse-of-the-black-pearl-2003', 'pirates-of-the-caribbean-dead-mans-chest-2006'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Keira_Knightley',
				'https://www.wikidata.org/wiki/Q42581',
				'https://www.oscars.org/oscars/ceremonies/2006',
			],
		},
		{
			slug: 'glenn-close',
			name: 'Glenn Close',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Glenn%20Close%202012%201.jpg?width=640',
			headline:
				'Una de las grandes actrices estadounidenses de las ultimas decadas, dueña de una autoridad tremenda para drama, thriller y personajes muy filosos.',
			birthPlace: 'Greenwich, Connecticut, Estados Unidos',
			spotlight:
				'Su potencia aparece tanto en villanas memorables como en figuras heridas o cansadas, siempre con una precision que vuelve enorme cualquier gesto.',
			biography: [
				'Glenn Close nacio el 19 de marzo de 1947 en Greenwich y llego al cine despues de una formacion muy fuerte en teatro. Esa base escenica se nota en la manera en que controla la voz, la quietud y el crescendo emocional, recursos que la ayudaron a convertirse en una presencia muy poderosa desde sus primeros papeles filmicos.',
				'The World According to Garp, Fatal Attraction, Dangerous Liaisons, Albert Nobbs y The Wife muestran bien la amplitud de su carrera. Close puede trabajar desde la sofisticacion, la ferocidad o la fragilidad sin perder nunca peso escenico, algo que la mantuvo como referencia incluso cuando la industria fue cambiando de ritmo y de rostros.',
			],
			awards: [{ label: 'Golden Globe', category: 'Mejor actriz en drama', work: 'The Wife', year: 2019 }],
			knownFor: ['back-in-action-2025', 'super-man-the-christopher-reeve-story-2024'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Glenn_Close',
				'https://www.wikidata.org/wiki/Q372311',
				'https://www.goldenglobes.com/person/glenn-close',
			],
		},
	]),
	...buildCatalogBackedProfiles(globalDirectorDefaults, [
		{
			slug: 'alfred-hitchcock',
			name: 'Alfred Hitchcock',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Hitchcock%2C%20Alfred%2002.jpg?width=640',
			headline:
				'Maestro absoluto del suspenso cinematografico y una figura fundacional para entender como el cine puede manipular mirada, tiempo y ansiedad.',
			birthPlace: 'Leytonstone, Essex, Inglaterra',
			spotlight:
				'Convirtio el suspenso en una forma de puesta en escena mas que en un simple genero, y esa influencia sigue viva en casi todo thriller moderno.',
			biography: [
				'Alfred Hitchcock nacio el 13 de agosto de 1899 en Leytonstone y empezo a trabajar en la industria britanica del cine mudo antes de afirmarse como director en los anos treinta. Ya desde esa etapa quedo claro que pensaba las peliculas desde el punto de vista, la informacion y la manera de administrar el miedo cuadro a cuadro.',
				'Cuando se traslado a Hollywood llevo esa precision a otro nivel con Rebecca, Shadow of a Doubt, Rear Window, Vertigo, North by Northwest y Psycho. No necesitaba explosiones ni grandilocuencia: le alcanzaba con un encuadre, una escalera o una puerta para instalar paranoia. Por eso sigue siendo una referencia obligatoria mas de medio siglo despues de su ultima gran etapa.',
			],
			awards: [{ label: 'Oscar', category: 'Premio Irving G. Thalberg Memorial', work: 'Trayectoria', year: 1968 }],
			knownFor: ['rebecca-1940', 'psycho-1960'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Alfred_Hitchcock',
				'https://www.wikidata.org/wiki/Q7374',
				'https://www.oscars.org/governors-awards',
			],
		},
		{
			slug: 'clint-eastwood',
			name: 'Clint Eastwood',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Clint%20Eastwood%20at%202010%20New%20York%20Film%20Festival.jpg?width=640',
			headline:
				'Icono total del cine estadounidense, primero como rostro del western y del policial y despues como director de una sobriedad demoledora.',
			birthPlace: 'San Francisco, California, Estados Unidos',
			spotlight:
				'Pocas trayectorias resumen tan bien medio siglo de Hollywood: estrella masculina clasica, autor tardio y director de dramas secos con enorme precision moral.',
			biography: [
				'Clint Eastwood nacio el 31 de mayo de 1930 en San Francisco y se hizo famoso como actor en la television y, sobre todo, en los westerns de Sergio Leone y en la saga de Dirty Harry. Esa primera etapa lo convirtio en un simbolo del heroe duro, laconicamente masculino y ligado a una idea muy fisica de la pantalla.',
				'Con el tiempo se afirmo tambien como director de peso enorme. Unforgiven, The Bridges of Madison County, Mystic River, Million Dollar Baby, Letters from Iwo Jima y Gran Torino muestran un cineasta cada vez mas interesado por la culpa, el paso del tiempo y las zonas grises de la violencia. Incluso cuando aparece adelante de camara, su figura ya dialoga con toda esa historia.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Unforgiven', year: 1993 }],
			knownFor: ['unforgiven-1992', 'million-dollar-baby-2004'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Clint_Eastwood',
				'https://www.wikidata.org/wiki/Q43203',
				'https://www.oscars.org/oscars/ceremonies/1993',
				'https://www.oscars.org/oscars/ceremonies/2005',
			],
		},
		{
			slug: 'taika-waititi',
			name: 'Taika Waititi',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Taika%20Waititi%20photo%20by%20pouria%20afkhami%20(cropped).jpg?width=640',
			headline:
				'Director neozelandes que mezclo humor absurdo, sensibilidad pop y melancolia para convertirse en una firma muy reconocible del cine reciente.',
			birthPlace: 'Wellington, Nueva Zelanda',
			spotlight:
				'Su cine puede ser jugueton y ridiculo, pero casi siempre esconde una veta emocional muy clara que evita que todo quede solo en ocurrencia.',
			biography: [
				'Taika Waititi nacio el 16 de agosto de 1975 en Wellington y se movio primero entre el cortometraje, la comedia y la escena artistica neozelandesa antes de armar una identidad cinematografica muy propia. Eagle vs Shark, Boy y What We Do in the Shadows mostraban ya una mezcla muy rara de ironia, ternura y absurdo.',
				'El salto global llego con Hunt for the Wilderpeople, Thor: Ragnarok y Jojo Rabbit, pelicula con la que gano el Oscar por guion adaptado. Desde entonces se volvio una figura central para un tipo de blockbuster mas descontracturado y colorido, sin dejar del todo la sensibilidad rara y afectiva que ya estaba en sus trabajos mas chicos.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor guion adaptado', work: 'Jojo Rabbit', year: 2020 }],
			knownFor: ['thor-ragnarok-2017', 'thor-love-and-thunder-2022', 'free-guy-2021'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Taika_Waititi',
				'https://www.wikidata.org/wiki/Q2388576',
				'https://www.oscars.org/oscars/ceremonies/2020',
			],
		},
		{
			slug: 'kenneth-branagh',
			name: 'Kenneth Branagh',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Kenneth%20Branagh%20at%20diff%202015.jpg?width=640',
			headline:
				'Director y actor britanico que llevo Shakespeare al cine popular y despues encontro un lugar propio entre la actuacion prestigiosa y el gran estudio.',
			birthPlace: 'Belfast, Irlanda del Norte',
			spotlight:
				'Su carrera va del teatro clasico al blockbuster con una naturalidad rara, siempre apoyada en oficio, voz y una enorme confianza en el texto.',
			biography: [
				'Kenneth Branagh nacio el 10 de diciembre de 1960 en Belfast y se formo muy fuerte en teatro antes de irrumpir con sus adaptaciones cinematograficas de Shakespeare. Henry V lo instalo muy rapido como una de las grandes promesas britanicas porque mostraba ambicion, energia y una relacion muy viva con el material clasico.',
				'Despues amplio mucho el rango entre actuacion, direccion y guion. Paso por Hamlet, Much Ado About Nothing, Thor, Dunkirk y Belfast, pelicula con la que finalmente gano el Oscar por guion original. Ese recorrido explica bien por que sigue siendo una figura tan util para unir prestigio actoral y cine industrial.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor guion original', work: 'Belfast', year: 2022 }],
			knownFor: ['belfast-2021', 'thor-2011', 'dunkirk-2017'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Kenneth_Branagh',
				'https://www.wikidata.org/wiki/Q55294',
				'https://www.oscars.org/oscars/ceremonies/2022',
			],
		},
		{
			slug: 'brad-bird',
			name: 'Brad Bird',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Brad%20bird%20cropped%202009.jpg?width=640',
			headline:
				'Director clave para la animacion moderna, capaz de combinar velocidad, claridad narrativa y una fe rara en la inteligencia del publico.',
			birthPlace: 'Kalispell, Montana, Estados Unidos',
			spotlight:
				'Su cine se reconoce por el movimiento, la construccion de mundo y una confianza muy fuerte en el poder del relato clasico bien contado.',
			biography: [
				'Brad Bird nacio el 24 de septiembre de 1957 en Kalispell y empezo a llamar la atencion desde muy joven como animador, primero en cortos caseros y despues dentro de Disney. Durante anos trabajo en television y animacion serial, pero su gran salto como director llego cuando llevo The Iron Giant a un estatus de clasico moderno.',
				'Con The Incredibles y Ratatouille termino de consolidarse como una de las firmas mas fuertes de Pixar, capaz de mezclar humor, aventura, familia y una puesta en escena realmente cinematografica. Mas tarde incluso paso con comodidad al live action con Mission: Impossible - Ghost Protocol, otra prueba de que su sentido del movimiento no dependia solo de la animacion.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor pelicula animada', work: 'Ratatouille', year: 2008 }],
			knownFor: ['the-incredibles-2004', 'ratatouille-2007', 'mission-impossible-ghost-protocol-2011'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Brad_Bird',
				'https://www.wikidata.org/wiki/Q310960',
				'https://www.oscars.org/oscars/ceremonies/2008',
			],
		},
		{
			slug: 'robert-zemeckis',
			name: 'Robert Zemeckis',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Robert%20Zemeckis%20%22The%20Walk%22%20at%20Opening%20Ceremony%20of%20the%2028th%20Tokyo%20International%20Film%20Festival%20(21835891403)%20(cropped).jpg?width=640',
			headline:
				'Director de enorme inventiva tecnica y narrativa, responsable de varios clasicos populares que unieron aventura, humor y emocion sin perder escala.',
			birthPlace: 'Chicago, Illinois, Estados Unidos',
			spotlight:
				'Su filmografia cruza fantasia, comedia, sci-fi y melodrama, siempre con una fascinacion visible por la tecnologia puesta al servicio del entretenimiento.',
			biography: [
				'Robert Zemeckis nacio el 14 de mayo de 1952 en Chicago y se formo en la USC dentro de una generacion obsesionada con llevar nuevas herramientas tecnicas al cine comercial. Muy pronto encontro una alianza fuerte con Bob Gale y Steven Spielberg que lo ayudo a desarrollar una voz propia entre la aventura clasica y la experimentacion visual.',
				'Back to the Future, Who Framed Roger Rabbit, Forrest Gump, Contact, Cast Away y The Walk muestran bien esa combinacion de asombro tecnologico y relato directo. Zemeckis nunca se quedo quieto: cada tanto persigue un nuevo recurso formal, pero casi siempre lo hace sin abandonar el instinto de gran showman popular.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Forrest Gump', year: 1995 }],
			knownFor: ['back-to-the-future-1985', 'back-to-the-future-part-ii-1989', 'back-to-the-future-part-iii-1990', 'forrest-gump-1994', 'here-2024'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Robert_Zemeckis',
				'https://www.wikidata.org/wiki/Q187364',
				'https://www.oscars.org/oscars/ceremonies/1995',
			],
		},
		{
			slug: 'sam-raimi',
			name: 'Sam Raimi',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Sam%20Raimi%20(53896379405)%20(cropped).jpg?width=640',
			headline:
				'Director crucial para entender el cruce entre terror jugueton, humor fisico y blockbuster superheroico de enorme impacto popular.',
			birthPlace: 'Royal Oak, Michigan, Estados Unidos',
			spotlight:
				'Su sello mezcla camara desatada, gusto por el grotesco y una energia de comic que le dio un tono muy propio incluso a sus peliculas mas industriales.',
			biography: [
				'Sam Raimi nacio el 23 de octubre de 1959 en Royal Oak y empezo a filmar de adolescente junto a Bruce Campbell y Rob Tapert, el nucleo creativo con el que termino armando The Evil Dead. Esa primera etapa ya traia todo lo que despues lo iba a distinguir: humor negro, terror fisico, movimientos de camara inventivos y una energia casi de dibujo animado.',
				'Con Darkman, A Simple Plan, Spider-Man, Spider-Man 2 y Doctor Strange in the Multiverse of Madness mostro que podia llevar ese estilo a escalas muy distintas sin perder identidad. Raimi es uno de esos directores que hicieron escuela porque su puesta siempre parece estar a punto de salirse de control, pero en realidad esta pensada con una precision muy particular.',
			],
			awards: [{ label: 'Saturn Award', category: 'Mejor director', work: 'Spider-Man 2', year: 2005 }],
			knownFor: ['spider-man-2-2004', 'spider-man-3-2007', 'doctor-strange-in-the-multiverse-of-madness-2022', 'send-help-2026'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Sam_Raimi',
				'https://www.wikidata.org/wiki/Q275402',
				'https://www.saturnawards.org/The-Saturn-Awards-Past-Winners.php',
			],
		},
		{
			slug: 'ron-howard',
			name: 'Ron Howard',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Ron%20Howard%202011%20Shankbone%203.JPG?width=640',
			headline:
				'Director de enorme oficio industrial que paso de nino actor a narrador clasico del Hollywood mas visible y prestigioso.',
			birthPlace: 'Duncan, Oklahoma, Estados Unidos',
			spotlight:
				'Tiene una cualidad muy clara para ordenar relatos complejos y volverlos accesibles sin quitarles peso dramatico ni escala popular.',
			biography: [
				'Ron Howard nacio el 1 de marzo de 1954 en Duncan y se crio practicamente dentro de los sets, primero como actor infantil y despues como una cara muy popular de la television estadounidense. Esa experiencia temprana le dio una comprension muy concreta del trabajo de produccion y del funcionamiento de los relatos masivos.',
				'Cuando paso a la direccion encontro rapido un perfil muy solido para el cine de estudio con Splash, Apollo 13, A Beautiful Mind, Frost/Nixon, Rush y Solo. Howard no suele imponer una firma ruidosa, pero si una claridad narrativa muy eficaz que explica por que sigue siendo un nombre tan confiable para proyectos grandes y biografias filmadas.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'A Beautiful Mind', year: 2002 }],
			knownFor: ['a-beautiful-mind-2001', 'solo-a-star-wars-story-2018', 'jim-henson-idea-man-2024'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Ron_Howard',
				'https://www.wikidata.org/wiki/Q103646',
				'https://www.oscars.org/oscars/ceremonies/2002',
			],
		},
		{
			slug: 'robert-redford',
			name: 'Robert Redford',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Tell%20Them%20Willie%20Boy%20Is%20Here%20%E2%80%93%20Robert%20Redford%20photo.jpg?width=640',
			headline:
				'Figura legendaria del cine estadounidense que supo sostener carrera de estrella, direccion prestigiosa y un compromiso fuerte con el cine independiente.',
			birthPlace: 'Santa Monica, California, Estados Unidos',
			spotlight:
				'Su nombre remite enseguida a un tipo de cine adulto y elegante, con actores centrales, oficio clasico y una idea muy clara de prestigio americano.',
			biography: [
				'Robert Redford nacio el 18 de agosto de 1936 en Santa Monica y se afirmo primero como actor durante los sesenta y setenta hasta convertirse en una de las caras mas fuertes de Hollywood. Butch Cassidy and the Sundance Kid, The Sting, All the President\'s Men y Out of Africa ayudaron a fijar esa imagen de estrella serena, atletica y muy fotogenica.',
				'Tambien encontro peso grande como director con Ordinary People, Quiz Show y The Horse Whisperer, y fuera de los sets impulso de manera decisiva el ecosistema del cine independiente a traves del Sundance Institute. Esa doble condicion de estrella clasica y promotor cultural lo vuelve una figura imprescindible para cualquier catalogo serio.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'Ordinary People', year: 1981 }],
			knownFor: ['the-sting-1973', 'ordinary-people-1980', 'out-of-africa-1985'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Robert_Redford',
				'https://www.wikidata.org/wiki/Q59215',
				'https://www.oscars.org/oscars/ceremonies/1981',
			],
		},
		{
			slug: 'billy-wilder',
			name: 'Billy Wilder',
			profileImage:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Gloria%20Swanson%20%26%20Billy%20Wilder%20-%20ca.%201950.JPG?width=640',
			headline:
				'Uno de los grandes guionistas y directores del siglo XX, maestro para convertir cinismo, humor y melancolia en cine perfecto.',
			birthPlace: 'Sucha, Galitzia, Imperio austrohungaro',
			spotlight:
				'Su cine podia ser feroz con las instituciones y a la vez profundamente humano con personajes quebrados, ambiciosos o directamente desesperados.',
			biography: [
				'Billy Wilder nacio el 22 de junio de 1906 en Sucha y arranco como periodista antes de pasar al guion en Berlin y luego emigrar a Hollywood escapando del nazismo. Esa biografia marcada por el exilio y la observacion periodistica se siente en la lucidez con la que mira el deseo, el poder, la moral y la hipocresia social.',
				'Double Indemnity, Sunset Boulevard, Ace in the Hole, The Apartment y Some Like It Hot bastan para explicar por que su nombre sigue siendo central en cualquier historia del cine. Wilder escribia y dirigia con una precision extraordinaria: podia ser gracioso, cruel, romantico o devastador sin perder claridad ni filo.',
			],
			awards: [{ label: 'Oscar', category: 'Mejor director', work: 'The Apartment', year: 1961 }],
			knownFor: ['the-lost-weekend-1945', 'the-apartment-1960'],
			referenceUrls: [
				'https://es.wikipedia.org/wiki/Billy_Wilder',
				'https://www.wikidata.org/wiki/Q51547',
				'https://www.oscars.org/oscars/ceremonies/1961',
			],
		},
	]),
};

export const personProfiles: Record<string, PersonProfileRecord> = applyPersonProfileEditorialOverrides({
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
	'danny-devito': {
		slug: 'danny-devito',
		name: 'Danny DeVito',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Danny%20DeVito%20cropped%20and%20edited%20for%20brightness.jpg?width=640',
		headline:
			'Actor, comediante, director y productor con una energía inconfundible, capaz de pasar del caos televisivo al cine de estudio sin perder filo ni timing.',
		roles: ['Actor', 'Director', 'Productor'],
		birthPlace: 'Neptune Township, Nueva Jersey, Estados Unidos',
		spotlight:
			'Pocos intérpretes volvieron tan productiva una presencia física tan singular: DeVito hizo de eso una marca de humor, ternura y mala leche en proporciones muy suyas.',
		biography: [
			'Daniel Michael DeVito Jr. nació el 17 de noviembre de 1944 en Neptune Township, Nueva Jersey. Antes de dedicarse por completo a la actuación trabajó como esteticista en el salón de su hermana, y esa búsqueda de formación en maquillaje lo terminó llevando a la American Academy of Dramatic Arts de Nueva York, donde se graduó en 1966.',
			'Su primer gran salto llegó con One Flew Over the Cuckoo’s Nest, pero la consagración popular vino poco después gracias a Louie De Palma en Taxi. Ese personaje lo instaló como una figura central de la comedia televisiva y le abrió una carrera larguísima en cine y TV, con títulos como Romancing the Stone, Twins, Batman Returns, Get Shorty y L.A. Confidential.',
			'Con el tiempo también consolidó peso detrás de cámara. Dirigió películas como Throw Momma from the Train, The War of the Roses y Matilda, y como productor estuvo ligado a proyectos muy fuertes de Jersey Films. En pantalla, mientras tanto, siguió explotando una mezcla rara de ferocidad cómica y humanidad que lo volvió irrepetible.',
		],
		stats: [
			{ label: 'Primetime Emmy', value: '1981' },
			{ label: 'Golden Globe', value: '1980' },
			{ label: 'Debut como director', value: '1987' },
		],
		awards: [
			{ label: 'Primetime Emmy', category: 'Mejor actor de reparto en comedia', work: 'Taxi', year: 1981 },
			{ label: 'Golden Globe', category: 'Mejor actor de reparto en televisión', work: 'Taxi', year: 1980 },
		],
		knownFor: ['batman-returns-1992'],
		referenceUrls: [
			'https://es.wikipedia.org/wiki/Danny_DeVito',
			'https://www.wikidata.org/wiki/Q26806',
			'https://www.televisionacademy.com/features/emmy-magazine/articles/archive-danny-devito',
			'https://goldenglobes.com/tv-show/taxi/',
		],
	},
	'michelle-pfeiffer': {
		slug: 'michelle-pfeiffer',
		name: 'Michelle Pfeiffer',
		profileImage:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Michelle%20Pfeiffer%20Ant-Man%20%26%20The%20Wasp%20premiere%20(cropped).jpg?width=640',
		headline:
			'Actriz de enorme elegancia y carácter, una estrella que supo combinar glamour clásico con una intensidad dramática siempre filosa.',
		roles: ['Actriz', 'Productora'],
		birthPlace: 'Santa Ana, California, Estados Unidos',
		spotlight:
			'Su carrera se armó sobre un equilibrio poco común: magnetismo de gran estrella, riesgo para elegir personajes y una voz propia incluso dentro del Hollywood más industrial.',
		biography: [
			'Michelle Marie Pfeiffer nació el 29 de abril de 1958 en Santa Ana, California, y creció en Orange County. Después de terminar la secundaria trabajó como cajera, pasó por Golden West College y durante un tiempo pensó en formarse como taquígrafa judicial, antes de volcarse de lleno a la actuación tras participar en certámenes de belleza a fines de los 70.',
			'Empezó con televisión y pequeños papeles, pero el gran cambio llegó cuando Brian De Palma la eligió para Scarface. A partir de ahí construyó una de las filmografías más fuertes de los 80 y 90 con títulos como Dangerous Liaisons, The Fabulous Baker Boys, Batman Returns, The Age of Innocence y What Lies Beneath.',
			'Pfeiffer nunca dependió sólo del star system. Su peso como intérprete siempre estuvo en cómo mezcla sofisticación, vulnerabilidad y peligro. Esa combinación la convirtió en una figura clave para entender el Hollywood adulto de esas décadas y explica por qué Catwoman sigue siendo uno de sus papeles más recordados.',
		],
		stats: [
			{ label: 'Golden Globe', value: '1990' },
			{ label: 'BAFTA', value: '1990' },
			{ label: 'Nominaciones al Oscar', value: '3' },
		],
		awards: [
			{ label: 'Golden Globe', category: 'Mejor actriz en drama', work: 'The Fabulous Baker Boys', year: 1990 },
			{ label: 'BAFTA', category: 'Mejor actriz de reparto', work: 'Dangerous Liaisons', year: 1990 },
		],
		knownFor: ['batman-returns-1992'],
		referenceUrls: [
			'https://es.wikipedia.org/wiki/Michelle_Pfeiffer',
			'https://www.wikidata.org/wiki/Q159778',
			'https://goldenglobes.com/articles/golden-globe-moment-michelle-pfeiffer-and-tom-cruise-1990/',
			'https://www.bafta.org/awards/film/?award-year=1990',
		],
	},
	'tim-burton': {
		slug: 'tim-burton',
		name: 'Tim Burton',
		profileImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tim%20Burton-63605.jpg?width=640',
		headline:
			'Director, productor y guionista que convirtió la sensibilidad gótica, la animación y el cuento raro en una marca autoral reconocible incluso dentro del blockbuster.',
		roles: ['Director', 'Productor', 'Guionista'],
		birthPlace: 'Burbank, California, Estados Unidos',
		spotlight:
			'Su cine hizo convivir suburbio, monstruos, humor negro y melancolía sin perder nunca vocación popular; por eso su firma visual sigue siendo inmediata.',
		biography: [
			'Timothy Walter Burton nació el 25 de agosto de 1958 en Burbank, California. De chico dibujaba y filmaba cortos caseros, y después estudió animación en el California Institute of the Arts, el semillero creado por Disney para formar nuevos talentos visuales.',
			'Su entrada profesional fue justamente en Disney, donde trabajó como animador y desarrolló cortos como Vincent y Frankenweenie. Esos trabajos, más su imaginario ya muy definido, lo empujaron hacia su debut en largometraje con Pee-wee’s Big Adventure, la película que abrió la puerta a una carrera cada vez más singular dentro de Hollywood.',
			'Burton terminó armando una filmografía marcada por outsideres, criaturas tristes y mundos deformados pero muy precisos. Beetlejuice, Batman, Batman Returns, Edward Scissorhands, Ed Wood, Sleepy Hollow y Big Fish muestran cómo logró llevar una sensibilidad casi artesanal y de freak suburbano a una escala masiva sin volverla genérica.',
		],
		stats: [
			{ label: 'Debut en largometraje', value: '1985' },
			{ label: 'Golden Lion', value: 'Venecia 2007' },
			{ label: 'CalArts', value: 'Promoción 1979' },
		],
		awards: [{ label: 'Golden Lion', category: 'Premio a la trayectoria', work: 'Festival de Venecia', year: 2007 }],
		knownFor: ['batman-1989', 'batman-returns-1992', 'beetlejuice-beetlejuice-2024'],
		referenceUrls: [
			'https://es.wikipedia.org/wiki/Tim_Burton',
			'https://www.wikidata.org/wiki/Q56008',
			'https://www.timburton.com/about',
			'https://www.labiennale.org/en/history-venice-film-festival',
		],
	},
	...bulkTrendProfiles,
	...bulkExpansionProfiles,
	...bulkCompletionProfiles,
	...bulkRequestedProfiles,
});
