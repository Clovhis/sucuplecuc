/** Regenerate the PostgreSQL block after changing this policy. */
const replacements = ['0o','1i','3e','4a','5s','7t','8b','9g','@a','!i','$s','+t','€e','аa','ɑa','αa','еe','εe','іi','ιi','оo','οo','рp','ρp','сc','ϲc','хx','χx','уy','υy','һh','нh','тt','τt','кk','κk','мm','μm','вb','βb'];
export const TRIVIA_NICKNAME_POLICY = {
	from: replacements.map((pair) => pair[0]).join(''),
	to: replacements.map((pair) => pair[1]).join(''),
	strong: 'hitler|pelotud|bolud|chupapij|chupaverg|comepij|hij[oa]deputa|putamadre|conchadetumadre|conchadesumadre|siegheil',
	word: 'pij(a|as|ita|itas|on|ones|udo|uda)|conchas?|put(a|o|as|os|ita|ito|itas|itos|azo|azos|on|ona|ones)|porongas?|vergas?|chot[ao]s?|cul[oa]s?|mierdas?|carajos?|for{2,}[oa]s?|pajer[oa]s?|mogolic[oa]s?|maric(on|ones)|trol[oa]s?|culiad[oa]s?|culead[oa]s?|pendej[oa]s?|gilipol{2,}as|cabron(es)?|nazis?|nazistas?|fuck(er|ing)?|shit|bitch',
	prefix: 'soy|el|la|un|una|re|gran|capitan|sr|don|mister|the|super|mega|cine',
	suffix: 'pro|gamer|master|rey|cine',
};

const strong = new RegExp(TRIVIA_NICKNAME_POLICY.strong);
const word = new RegExp(`(^|[^a-z])(${TRIVIA_NICKNAME_POLICY.word})([^a-z]|$)`);
const decorated = new RegExp(`^(${TRIVIA_NICKNAME_POLICY.prefix})*(${TRIVIA_NICKNAME_POLICY.word})(${TRIVIA_NICKNAME_POLICY.suffix})*$`);
const translations = new Map(replacements.map((pair) => [pair[0], pair[1]]));

export function isTriviaNicknameAllowed(name: string): boolean {
	const folded = name.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '');
	const translated = [...folded].map((char) => translations.get(char) ?? char).join('');
	for (const candidate of [folded, translated]) {
		const compact = candidate.replace(/[^a-z0-9]/g, '').replace(/^[0-9x]+|[0-9x]+$/g, '');
		const collapsed = compact.replace(/([a-z])\1+/g, '$1');
		if (strong.test(compact) || strong.test(collapsed) || word.test(candidate) || decorated.test(compact) || decorated.test(collapsed)) return false;
	}
	return true;
}
