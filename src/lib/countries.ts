export interface MovieCountry {
	code: string;
	label: string;
	flagCode: string;
}

const COUNTRY_LABELS: Record<string, string> = {
	AR: 'Argentina',
	AT: 'Austria',
	AU: 'Australia',
	BE: 'Bélgica',
	BR: 'Brasil',
	CA: 'Canadá',
	CH: 'Suiza',
	CL: 'Chile',
	CN: 'China',
	CO: 'Colombia',
	CZ: 'República Checa',
	DE: 'Alemania',
	DK: 'Dinamarca',
	DZ: 'Argelia',
	ES: 'España',
	FI: 'Finlandia',
	FR: 'Francia',
	GB: 'Reino Unido',
	HK: 'Hong Kong',
	ID: 'Indonesia',
	IE: 'Irlanda',
	IN: 'India',
	IR: 'Irán',
	IT: 'Italia',
	JP: 'Japón',
	KR: 'Corea del Sur',
	LU: 'Luxemburgo',
	MT: 'Malta',
	MX: 'México',
	MY: 'Malasia',
	NL: 'Países Bajos',
	NO: 'Noruega',
	NZ: 'Nueva Zelanda',
	PE: 'Perú',
	PH: 'Filipinas',
	PL: 'Polonia',
	RS: 'Serbia',
	RU: 'Rusia',
	SA: 'Arabia Saudita',
	SE: 'Suecia',
	SU: 'Unión Soviética',
	TH: 'Tailandia',
	TR: 'Turquía',
	TW: 'Taiwán',
	UK: 'Reino Unido',
	US: 'Estados Unidos',
	UY: 'Uruguay',
	VE: 'Venezuela',
	XC: 'Checoslovaquia',
	XK: 'Kosovo',
	ZA: 'Sudáfrica',
};

const COUNTRY_ALIASES: Record<string, string> = {
	UK: 'GB',
	'ESTADOS UNIDOS': 'US',
	'UNITED STATES': 'US',
	'ETATS UNIS': 'US',
	'VEREINIGTE STAATEN US': 'US',
	'REINO UNIDO': 'GB',
	'GRAN BRETANA': 'GB',
	ESPANA: 'ES',
	JAPON: 'JP',
	'COREA DEL SUR': 'KR',
	CANADA: 'CA',
	'MEXICO': 'MX',
	'AUSTRIA': 'AT',
	'ALEMANIA': 'DE',
	FRANCIA: 'FR',
	ITALIA: 'IT',
	IRLANDA: 'IE',
	AUSTRALIA: 'AU',
	BELGICA: 'BE',
	BRASIL: 'BR',
	CHILE: 'CL',
	CHINA: 'CN',
	COLOMBIA: 'CO',
	DINAMARCA: 'DK',
	'EMIRATOS ARABES UNIDOS': 'AE',
	FILIPINAS: 'PH',
	FINLANDIA: 'FI',
	'HONG KONG': 'HK',
	INDIA: 'IN',
	INDONESIA: 'ID',
	ISLANDIA: 'IS',
	KAZAJISTAN: 'KZ',
	MALASIA: 'MY',
	'MARRUECOS': 'MA',
	'NIGERIA': 'NG',
	NORUEGA: 'NO',
	'NUEVA ZELANDA': 'NZ',
	'PAISES BAJOS': 'NL',
	'REPUBLICA CHECA': 'CZ',
	'REPUBLICA DOMINICANA': 'DO',
	RUSIA: 'RU',
	'SUDAFRICA': 'ZA',
	SUECIA: 'SE',
	SUIZA: 'CH',
	TAILANDIA: 'TH',
	TURQUIA: 'TR',
	'UNION SOVIETICA': 'SU',
	'CHECOSLOVAQUIA': 'XC',
};

function normalizeToken(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, ' ')
		.trim();
}

function getCountryCode(value: string): string | undefined {
	const normalized = normalizeToken(value);
	if (/^[A-Z]{2}$/.test(normalized)) return normalized === 'UK' ? 'GB' : normalized;
	return COUNTRY_ALIASES[normalized];
}

function getCountryLabel(code: string): string {
	if (COUNTRY_LABELS[code]) return COUNTRY_LABELS[code];
	try {
		return new Intl.DisplayNames('es-AR', { type: 'region' }).of(code) ?? code;
	} catch {
		return code;
	}
}

function getCountryFlagCode(code: string): string {
	if (code === 'XC') return 'cz';
	return code.toLowerCase();
}

/** Returns canonical country metadata from an ISO list such as `AR, ES`. */
export function getMovieCountries(value: string | undefined): MovieCountry[] {
	const codes = String(value ?? '')
		.split(',')
		.map((token) => getCountryCode(token.trim()))
		.filter((code): code is string => Boolean(code));

	return [...new Set(codes)].map((code) => ({ code, label: getCountryLabel(code), flagCode: getCountryFlagCode(code) }));
}

export function isValidMovieCountryValue(value: unknown): value is string {
	if (typeof value !== 'string' || value.trim().length === 0) return false;
	const countries = getMovieCountries(value);
	return countries.length > 0 && countries.length === value.split(',').map((part) => part.trim()).filter(Boolean).length;
}

export function hasMovieCountry(value: string | undefined, code: string): boolean {
	return getMovieCountries(value).some((country) => country.code === code);
}
