// Normalize filter labels, without overwriting the sourced nationality text.
const nationalityGroups: Record<string, string[]> = {
	Argentino: ['Argentina', 'AR'], Español: ['Española', 'España'],
	Alemán: ['Alemana', 'Alemania'], Australiano: ['Australiana', 'Australia', 'Australianos'],
	Austriaco: ['Austríaco', 'Austria'], Brasileño: ['Brasileña', 'Brasil'],
	Británico: ['Británica', 'Reino Unido'], Canadiense: ['Canadá'],
	Chileno: ['Chilena', 'Chile'], Chino: ['China'], Coreano: ['Coreana'],
	Colombiano: ['Colombiana', 'Colombia'], Surcoreano: ['Surcoreana', 'Corea del Sur'],
	Danés: ['Danesa', 'Dinamarca'], Estadounidense: ['Estados Unidos'],
	Francés: ['Francesa', 'Francia'], Griego: ['Grecia', 'Griega'],
	Guatemalteco: ['Guatemalteca', 'Guatemala'], Hongkonés: ['Hongkonesa'],
	Indio: ['India'], Irlandés: ['Irlandesa', 'Irlanda'], Israelí: ['Israel'],
	Italiano: ['Italiana', 'Italia'], Japonés: ['Japonesa', 'Japón'],
	Malasio: ['Malasia', 'Malaya', 'Malayo'], Mexicano: ['Mexicana', 'México'],
	Neozelandés: ['Neozelandesa', 'Nueva Zelanda'], Noruego: ['Noruega'],
	Soviético: ['Soviética', 'Unión Soviética'], Sudafricano: ['Sudafricana', 'Sudáfrica'],
	Sueco: ['Sueca', 'Suecia'], Suizo: ['Suiza'], Uruguayo: ['Uruguaya', 'Uruguay'],
	Taiwanés: ['Taiwanesa', 'República de China'],
};

export const normalizePersonFilter = (value: string): string => value
	.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const nationalityLabels = new Map(Object.entries(nationalityGroups).flatMap(([label, aliases]) =>
	[label, ...aliases].map(alias => [normalizePersonFilter(alias), label] as const),
));

export function getPersonNationalities(value: string | undefined): string[] {
	if (!value?.trim() || value === 'Nacionalidad no informada') return [];
	// Dual nationalities participate in either nationality filter.
	return [...new Set(value.split(/\s+y\s+|-/).map(part => {
		const text = part.trim();
		return nationalityLabels.get(normalizePersonFilter(text)) ?? text;
	}).filter(Boolean))];
}

export function normalizeNationalityFilter(value: string): string {
	const normalized = normalizePersonFilter(value);
	return normalizePersonFilter(nationalityLabels.get(normalized) ?? value);
}

// The adjective agrees with the field's noun, "nacionalidad", not with sexo.
const feminineNationalityLabels: Record<string, string> = {
	Argentino: 'Argentina', Español: 'Española', Alemán: 'Alemana', Australiano: 'Australiana',
	Austriaco: 'Austriaca', Brasileño: 'Brasileña', Británico: 'Británica', Chileno: 'Chilena',
	Chino: 'China', Coreano: 'Coreana', Colombiano: 'Colombiana', Surcoreano: 'Surcoreana',
	Danés: 'Danesa', Francés: 'Francesa', Griego: 'Griega', Guatemalteco: 'Guatemalteca',
	Hongkonés: 'Hongkonesa', Indio: 'India', Irlandés: 'Irlandesa', Italiano: 'Italiana',
	Japonés: 'Japonesa', Malasio: 'Malasia', Mexicano: 'Mexicana', Neozelandés: 'Neozelandesa',
	Noruego: 'Noruega', Soviético: 'Soviética', Sudafricano: 'Sudafricana', Sueco: 'Sueca',
	Suizo: 'Suiza', Uruguayo: 'Uruguaya', Taiwanés: 'Taiwanesa',
};
for (const [canonical, feminine] of Object.entries(feminineNationalityLabels)) {
	nationalityLabels.set(normalizePersonFilter(feminine), canonical);
}

export function getNationalityFilterLabel(value: string): string {
	return feminineNationalityLabels[value] ?? value;
}

export type PersonSexFilter = '' | 'masculino' | 'femenino';
export function normalizeSexFilter(value: string): PersonSexFilter {
	return value === 'masculino' || value === 'femenino' ? value : '';
}
