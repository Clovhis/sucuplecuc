const EXCEPTION_CATEGORIES = new Set([
	'child-privacy',
	'secondary-voice-no-individual-portrait',
	'obscure-no-reliable-image',
	'unsafe-or-inappropriate-source',
]);
const PROMINENCE = new Set(['lead', 'co-lead', 'supporting', 'participant', 'incidental', 'crew']);

export function createMovieCreditCoverageDraft(movie, createdOn) {
	return {
		schemaVersion: 1,
		status: 'incomplete',
		movieSlug: movie.slug,
		title: movie.title,
		year: movie.year,
		reviewedOn: '',
		createdOn,
		billingSources: [],
		credits: [],
	};
}

export function normalizeCreditName(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/gu, ' ')
		.replace(/\s+/gu, ' ')
		.trim();
}

function splitCredits(value) {
	return String(value ?? '').split(/\s*,\s*|\s+y\s+/iu).map(item => item.trim()).filter(Boolean);
}

function validUrl(value) {
	try {
		const url = new URL(value);
		return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
	} catch { return false; }
}

function add(errors, message) { errors.push(message); }

/** Validate only a newly added movie's complete cast research sidecar. */
export function validateMovieCreditCoverage(movie, review) {
	const errors = [];
	const portraitExceptions = new Set();
	if (!movie || typeof movie !== 'object') return { errors: ['No se pudo cargar la ficha nueva.'], portraitExceptions };
	if (!review || typeof review !== 'object' || Array.isArray(review)) return { errors: ['Falta el ledger de investigación de elenco para esta alta nueva.'], portraitExceptions };
	if (review.schemaVersion !== 1 || review.status !== 'reviewed') add(errors, 'El ledger de elenco debe usar schemaVersion 1 y state reviewed.');
	if (review.movieSlug !== movie.slug || review.title !== movie.title || Number(review.year) !== Number(movie.year)) {
		add(errors, 'El ledger de elenco no corresponde exactamente al slug, título y año de la película.');
	}
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(review.reviewedOn ?? '') || Number.isNaN(Date.parse(`${review.reviewedOn}T00:00:00Z`))) {
		add(errors, 'El ledger necesita la fecha real de revisión reviewedOn.');
	}
	const billingSources = Array.isArray(review.billingSources) ? review.billingSources : [];
	const fullCreditSources = [];
	const sourceUrls = new Set();
	for (const source of billingSources) {
		if (!validUrl(source?.url) || typeof source.kind !== 'string' || !source.kind.trim()) {
			add(errors, 'Cada fuente de créditos necesita URL HTTP(S) y tipo de fuente.');
			continue;
		}
		if (source.checkedOn !== review.reviewedOn) add(errors, `La fuente de créditos ${source.url} no conserva checkedOn=${review.reviewedOn}.`);
		sourceUrls.add(source.url);
		if (source.fullCredits === true) {
			if (!Number.isInteger(source.relevantCreditCount) || source.relevantCreditCount < 3) add(errors, `La fuente ${source.url} debe conservar el recuento real de créditos principales/secundarios revisados.`);
			fullCreditSources.push(source);
		}
	}
	if (fullCreditSources.length !== 1) add(errors, 'El ledger debe declarar una sola fuente canónica de créditos completos para contar cada omisión una vez.');
	if (sourceUrls.size < 2) add(errors, 'Registrá la fuente de billing completo y la fuente usada para contrastar los créditos.');

	const directorNames = splitCredits(movie.director).map(normalizeCreditName).filter(Boolean);
	const castNames = (Array.isArray(movie.mainCast) ? movie.mainCast : []).flatMap(splitCredits).map(normalizeCreditName).filter(Boolean);
	const expected = new Map();
	for (const name of directorNames) expected.set(`director:${name}`, { role: 'director', name });
	for (const name of castNames) expected.set(`performer:${name}`, { role: 'performer', name });
	const roster = Array.isArray(review.credits) ? review.credits : [];
	const decisions = new Map();

	for (const credit of roster) {
		const role = credit?.role;
		const normalizedName = normalizeCreditName(credit?.name);
		const key = `${role}:${normalizedName}`;
		if (!normalizedName || !['director', 'performer'].includes(role)) {
			add(errors, 'Cada fila del billing necesita nombre y rol director o performer.');
			continue;
		}
		if (decisions.has(key)) add(errors, `El ledger repite ${role} ${credit.name}.`);
		decisions.set(key, credit);
		if (!PROMINENCE.has(credit.prominence)) add(errors, `Indicá el nivel de billing de ${credit.name} sin completar con nombres incidentales.`);
		if (!['include', 'omit'].includes(credit.decision)) add(errors, `Indicá si ${credit.name} se incluye u omite después de revisar el billing.`);
		if (!validUrl(credit.creditSourceUrl) || !fullCreditSources.some(source => source.url === credit.creditSourceUrl)) add(errors, `${credit.name} necesita una fuente de participación dentro del billing completo.`);
		if (credit.decision === 'omit') {
			if (typeof credit.omissionReason !== 'string' || credit.omissionReason.trim().length < 20) add(errors, `La omisión de ${credit.name} necesita un motivo específico (20 caracteres o más).`);
			if (!['lesser-role', 'incidental', 'crew', 'duplicate', 'no-safe-portrait', 'out-of-scope'].includes(credit.omissionCategory)) add(errors, `La omisión de ${credit.name} necesita una categoría concreta.`);
			if (credit.omissionCategory === 'no-safe-portrait') {
				if (['lead', 'co-lead'].includes(credit.prominence)) add(errors, `${credit.name}: no se puede omitir un crédito protagonista/coprotagonista sólo por falta de retrato; resolvé la contingencia o dejá la ficha pendiente.`);
				if (credit.omissionReason.trim().length < 32) add(errors, `${credit.name}: la omisión por falta de foto necesita explicar la contingencia agotada.`);
				const searches = Array.isArray(credit.portraitSearches) ? credit.portraitSearches : [];
				const searchUrls = new Set();
				for (const search of searches) {
					if (!validUrl(search?.url) || typeof search.result !== 'string' || search.result.trim().length < 16) add(errors, `${credit.name}: registrá fuente y resultado de cada búsqueda de retrato.`);
					else searchUrls.add(search.url);
				}
				if (searchUrls.size < 2) add(errors, `${credit.name}: documentá las consultas de retrato antes de omitir un crédito importante.`);
			}
			if (expected.has(key)) add(errors, `${credit.name} figura omitido en el ledger pero permanece en la película.`);
			if (credit.portrait || credit.portraitException) add(errors, `La fila omitida de ${credit.name} no debe declarar retrato o excepción de una inclusión.`);
			continue;
		}
		if (!expected.has(key)) add(errors, `${credit.name} se declara incluido en el ledger pero no figura en director o mainCast.`);
		if (['incidental', 'crew'].includes(credit.prominence)) add(errors, `${credit.name} es crédito incidental/crew y no puede rellenar mainCast.`);
		const identitySources = Array.isArray(credit.identitySources) ? credit.identitySources : [];
		const identityUrls = new Set();
		for (const evidence of identitySources) {
			if (!validUrl(evidence?.url) || typeof evidence.fact !== 'string' || evidence.fact.trim().length < 16) {
				add(errors, `${credit.name} necesita fuentes de identidad con URL y el hecho verificado.`);
				continue;
			}
			identityUrls.add(evidence.url);
		}
		if (identityUrls.size < 2) add(errors, `${credit.name} necesita dos señales trazables de identidad, además de su crédito en la película.`);
		const hasPortrait = Boolean(credit.portrait);
		const hasException = Boolean(credit.portraitException);
		if (hasPortrait === hasException) {
			add(errors, `${credit.name} necesita un retrato verificado o una excepción específica, nunca ambos.`);
		} else if (hasPortrait) {
			if (!validUrl(credit.portrait.sourceUrl) || credit.portrait.visuallyVerified !== true) add(errors, `${credit.name} necesita la fuente exacta y verificación visual de su retrato.`);
		} else {
			const exception = credit.portraitException;
			if (!EXCEPTION_CATEGORIES.has(exception.category) || typeof exception.reason !== 'string' || exception.reason.trim().length < 32) {
				add(errors, `${credit.name} no tiene una categoría y una razón concreta válida para no usar foto.`);
			} else if (exception.category === 'secondary-voice-no-individual-portrait' && (role !== 'performer' || !['supporting', 'participant'].includes(credit.prominence))) {
				add(errors, `${credit.name}: la excepción de voz sin retrato individual sólo aplica a voz secundaria.`);
			} else if (exception.category === 'obscure-no-reliable-image' && exception.recognition !== 'obscure') {
				add(errors, `${credit.name}: una excepción por foto no disponible exige evidencia de perfil realmente poco conocido.`);
			} else if (exception.category === 'obscure-no-reliable-image' && (!validUrl(exception.recognitionBasis?.sourceUrl) || typeof exception.recognitionBasis.fact !== 'string' || exception.recognitionBasis.fact.trim().length < 32)) {
				add(errors, `${credit.name}: la excepción por escasa notoriedad necesita una señal concreta de perfil y fuente.`);
			} else if (exception.category === 'child-privacy' && (exception.subjectStatus?.isMinor !== true || !validUrl(exception.subjectStatus.sourceUrl) || typeof exception.subjectStatus.fact !== 'string' || exception.subjectStatus.fact.trim().length < 20)) {
				add(errors, `${credit.name}: la excepción de privacidad infantil necesita fuente y hecho verificable de minoría de edad.`);
			} else if (exception.category === 'unsafe-or-inappropriate-source' && (!validUrl(exception.safetyBasis?.sourceUrl) || typeof exception.safetyBasis.issue !== 'string' || exception.safetyBasis.issue.trim().length < 32)) {
				add(errors, `${credit.name}: la excepción por seguridad necesita describir el caso concreto y su fuente.`);
			}
			const searched = Array.isArray(exception.sourcesSearched) ? exception.sourcesSearched : [];
			const searchUrls = new Set();
			for (const search of searched) {
				if (!validUrl(search?.url) || typeof search.result !== 'string' || search.result.trim().length < 16) {
					add(errors, `${credit.name}: registrá URL y resultado de cada búsqueda de retrato.`);
					continue;
				}
				searchUrls.add(search.url);
			}
			if (searchUrls.size < 2) add(errors, `${credit.name}: una excepción de retrato requiere registrar fuentes consultadas y sus resultados.`);
			portraitExceptions.add(key);
		}
	}

	for (const [key, expectedCredit] of expected) {
		const actual = decisions.get(key);
		if (!actual) add(errors, `${expectedCredit.name} permanece en ${expectedCredit.role === 'director' ? 'director' : 'mainCast'} sin revisión de crédito, identidad y retrato.`);
		else if (actual.decision !== 'include') add(errors, `${expectedCredit.name} figura omitido pero sigue en los créditos de la película.`);
	}
	if (fullCreditSources.length === 1) {
		const source = fullCreditSources[0];
		const recordedRelevantCredits = roster.filter(credit => credit?.creditSourceUrl === source.url && ['lead', 'co-lead', 'supporting', 'participant'].includes(credit.prominence)).length;
		if (recordedRelevantCredits !== source.relevantCreditCount) add(errors, `La fuente principal declara ${source.relevantCreditCount} créditos relevantes, pero el ledger revisa ${recordedRelevantCredits}; registrá inclusiones y omisiones del reparto.`);
	}
	const omittedRelevant = roster.filter(credit => credit?.decision === 'omit' && ['lead', 'co-lead', 'supporting', 'participant'].includes(credit.prominence));
	if (omittedRelevant.length) {
		const coverage = review.coverageReview;
		if (!coverage || typeof coverage.rationale !== 'string' || coverage.rationale.trim().length < 40 || !Array.isArray(coverage.omittedRelevantCredits)) {
			add(errors, 'El recorte de un billing amplio necesita coverageReview con una razón y omisiones cotejadas explícitas.');
		} else {
			const declared = new Set(coverage.omittedRelevantCredits.map(item => `${item?.role}:${normalizeCreditName(item?.name)}`));
			const actual = new Set(omittedRelevant.map(item => `${item.role}:${normalizeCreditName(item.name)}`));
			if (declared.size !== actual.size || [...actual].some(key => !declared.has(key))) add(errors, 'coverageReview debe enumerar exactamente cada crédito principal/secundario omitido.');
		}
	}
	return { errors, portraitExceptions };
}

export function assertMovieCreditCoverage(movie, review) {
	const result = validateMovieCreditCoverage(movie, review);
	if (result.errors.length) throw new Error(result.errors.join('\n'));
	return result;
}
