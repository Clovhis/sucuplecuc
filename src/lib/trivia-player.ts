export const TRIVIA_COUNTRY_CODES = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');

import { isTriviaNicknameAllowed } from './trivia-nickname.ts';

export interface TriviaPlayer { id: string; name: string; country: string; age: number }

export function isTriviaPlayer(value: unknown): value is TriviaPlayer {
	if (!value || typeof value !== 'object') return false;
	const player = value as TriviaPlayer;
	return typeof player.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(player.id)
		&& typeof player.name === 'string' && player.name === player.name.trim() && player.name.length >= 2 && player.name.length <= 24 && !/[<>\u0000-\u001f\u007f-\u009f]/.test(player.name)
		&& isTriviaNicknameAllowed(player.name)
		&& TRIVIA_COUNTRY_CODES.includes(player.country) && Number.isInteger(player.age) && player.age >= 1 && player.age <= 120;
}
