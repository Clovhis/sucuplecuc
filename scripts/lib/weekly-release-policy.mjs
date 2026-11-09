import { selectNativeLuna, validateNativeExecution } from './cineposta-luna.mjs';

export const WEEKLY_RELEASE_KINDS = Object.freeze(['cine', 'plataformas']);
export const ELIGIBLE_CINEMA_CHAINS = Object.freeze([
	'Cinemark', 'Hoyts', 'Showcase', 'Cinépolis', 'Atlas', 'Cinemacenter', 'Multiplex',
]);
export const PLATFORM_OFFERS = Object.freeze(['FLATRATE', 'RENT', 'BUY']);

const asDay = value => {
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(value ?? '')) throw new Error('La fecha debe tener formato YYYY-MM-DD.');
	const date = new Date(`${value}T12:00:00Z`);
	if (date.toISOString().slice(0, 10) !== value) throw new Error('La fecha indicada no existe.');
	return date;
};
const addDays = (date, days) => {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + days);
	return next.toISOString().slice(0, 10);
};
export const argentinaDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {
	timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);

/** Thursday–Wednesday cinema window, or the current Monday–Sunday streaming week. */
export function getWeeklyReleasePeriod(kind, runDate) {
	if (!WEEKLY_RELEASE_KINDS.includes(kind)) throw new Error(`Tipo semanal desconocido: ${kind}`);
	const date = asDay(runDate);
	const weekday = date.getUTCDay(); // The UTC date is constructed at noon, so its weekday is stable.
	if (kind === 'cine') {
		if (weekday !== 4) throw new Error('La guía de cine sólo se ejecuta los jueves de Argentina.');
		return { kind, runDate, start: runDate, end: addDays(date, 6), schedule: 'jueves-10-art' };
	}
	if (weekday !== 5) throw new Error('La guía de plataformas sólo se ejecuta los viernes de Argentina.');
	const start = addDays(date, -((weekday + 6) % 7));
	return { kind, runDate, start, end: addDays(asDay(start), 6), schedule: 'viernes-10-art' };
}

export function validateNativeWeeklyRun(execution, catalog, expectedDate) {
	if (!catalog?.models?.length) throw new Error('Falta el catálogo nativo de modelos anunciado en este run.');
	if (!catalog.observedAt || argentinaDate(new Date(catalog.observedAt)) !== expectedDate) throw new Error('El catálogo nativo de modelos no fue observado en la fecha argentina de este run.');
	const selection = selectNativeLuna(catalog.models);
	validateNativeExecution(execution, selection);
	const completion = execution.parentCompletion;
	if (completion?.attestedBy !== 'native-task-root' || completion.agentId !== execution.agentId || !Number.isFinite(Date.parse(completion.completedAt ?? ''))) {
		throw new Error('La tarea raíz debe registrar el completion observado del mismo agente Luna antes de validar el recibo semanal.');
	}
	return { selection, execution };
}

const normalized = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const includesPlatform = (movie, label) => [movie.releasePlatform, ...(movie.releasePlatforms ?? [])]
	.filter(Boolean).some(value => normalized(value) === normalized(label));
const moviePlatforms = movie => [...new Set([movie.releasePlatform, ...(movie.releasePlatforms ?? [])].filter(Boolean))];
const httpsUrl = value => {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' && !url.username && !url.password;
	} catch { return false; }
};
const isJustWatchArgentina = value => {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' && /^www\.justwatch\.com$/u.test(url.hostname) && url.pathname.startsWith('/ar/');
	} catch { return false; }
};
const canonicalTitle = value => normalized(value).replace(/[^a-z0-9]+/gu, ' ').trim();
const allText = note => [note.title, note.excerpt, ...note.content.filter(block => block.type === 'paragraph').map(block => block.text)].join('\n');

function validateScore(entry, movie, runDate) {
	// Revalidation of availability preserves its score. A candidate with no reliable public score
	// remains pending and is never assigned a value to satisfy the catalog gate.
	if (!['loaded', 'updated', 'revalidated', 'rerated', 'pending'].includes(entry.status)) return;
	const score = entry.score;
	if (!score) {
		if (entry.status === 'pending' && movie.cinepostaScore === undefined && Array.isArray(entry.scoreSearches) && entry.scoreSearches.length > 0) return;
		if (entry.status !== 'loaded' && movie.cinepostaScore !== undefined) return;
		if (entry.include || movie.cinepostaScore !== undefined || !Array.isArray(entry.scoreSearches) || entry.scoreSearches.length === 0) {
			throw new Error(`No se puede incluir ${entry.slug} sin score público comprobable; registrá las búsquedas y dejalo pendiente.`);
		}
		return;
	}
	if (!httpsUrl(score.sourceUrl) || score.retrievedOn !== runDate || !score.source || !score.metric || !Number.isFinite(score.rawValue) || !Number.isInteger(score.final) || score.final < 1 || score.final > 10) {
		throw new Error(`La evidencia pública y normalización de score están incompletas para ${entry.slug}.`);
	}
	if (score.final !== movie.cinepostaScore) throw new Error(`El ledger de score no coincide con ${entry.slug}.cinepostaScore.`);
	if (!['audience', 'critics', 'single-critic'].includes(score.metric)) throw new Error(`Tipo de puntuación no documentado para ${entry.slug}.`);
	if (score.final >= 9 && (!score.masterpieceReason || !Array.isArray(score.masterpieceSources) || score.masterpieceSources.length === 0 || !score.sampleEvidence)) throw new Error(`Score ${score.final} requiere evidencia de muestra y argumento/documentación de obra maestra para ${entry.slug}.`);
	if (score.final >= 9 && (typeof score.masterpieceReason !== 'string' || score.masterpieceReason.trim().length < 80)) {
		throw new Error(`Score ${score.final} requiere argumento editorial de obra maestra para ${entry.slug}.`);
	}
}

function validateCinemaEvidence(entry, period) {
	if (!includesPlatform(entry.movie, 'Cine')) throw new Error(`${entry.slug} no registra Cine como disponibilidad verificada.`);
	const showings = entry.evidence?.showings;
	if (!Array.isArray(showings) || showings.length === 0) throw new Error(`Falta función vigente de sala para ${entry.slug}.`);
	for (const showing of showings) {
		if (!showing.date || showing.date < period.start || showing.date > period.end) throw new Error(`La función de ${entry.slug} no cae dentro de ${period.start}–${period.end}.`);
		if (!showing.chain || !showing.venue || !showing.locality || !showing.url || !httpsUrl(showing.url)) throw new Error(`La función de ${entry.slug} necesita cadena, sala, localidad y URL.`);
		if (!['CABA', 'PBA'].includes(showing.jurisdiction)) throw new Error(`La sede de ${entry.slug} no está en CABA o la Provincia de Buenos Aires.`);
		const chainMatch = ELIGIBLE_CINEMA_CHAINS.some(name => normalized(showing.chain).includes(normalized(name)));
		if (!chainMatch && showing.comparableChainVerified !== true) throw new Error(`Exhibidor no verificado para ${entry.slug}: ${showing.chain}.`);
	}
}

function validateCinemaRevalidation(entry, baselineMovie, movie, runDate) {
	const check = entry.cinemaRevalidation;
	if (!check || check.checkedOn !== runDate) throw new Error(`Falta la revalidación completa de cartelera para ${entry.slug} en ${runDate}.`);
	if (baselineMovie.cinepostaScore !== movie.cinepostaScore && entry.status !== 'rerated') throw new Error(`La revalidación de disponibilidad cambió el score de ${entry.slug}; conservá el valor previo.`);
	if (entry.status === 'rerated' && !entry.include) throw new Error(`El rerating de ${entry.slug} debe quedar incluido en la guía para pasar su ledger público.`);
	if (check.decision === 'retained') {
		if (!includesPlatform(movie, 'Cine')) throw new Error(`${entry.slug} se marcó como cartelera vigente pero ya no tiene Cine en su ficha.`);
		if (!Array.isArray(check.showings) || check.showings.length === 0) throw new Error(`La cartelera de ${entry.slug} necesita una función actual o próxima verificada.`);
		for (const showing of check.showings) {
			if (!showing.date || showing.date < runDate || !showing.chain || !showing.venue || !showing.locality || !showing.url || !httpsUrl(showing.url) || !['CABA', 'PBA'].includes(showing.jurisdiction)) throw new Error(`La revalidación de ${entry.slug} requiere cadena, sala, localidad, fecha futura/actual y URL en CABA/PBA.`);
			const chainMatch = ELIGIBLE_CINEMA_CHAINS.some(name => normalized(showing.chain).includes(normalized(name)));
			if (!chainMatch && showing.comparableChainVerified !== true) throw new Error(`Exhibidor no verificado en la revalidación de ${entry.slug}: ${showing.chain}.`);
		}
		return;
	}
	if (check.decision !== 'removed' || includesPlatform(movie, 'Cine')) throw new Error(`${entry.slug} debe conservar Cine con una función verificada o quitar esa etiqueta.`);
	const venueChecks = check.venueChecks;
	if (!Array.isArray(venueChecks) || venueChecks.length < 2 || venueChecks.some(item => item.checkedOn !== runDate || item.result !== 'no-eligible-showing' || !httpsUrl(item.url))) throw new Error(`La salida de cartelera de ${entry.slug} necesita dos fuentes consultadas en la fecha de ejecución.`);
	if (new Set(venueChecks.map(item => new URL(item.url).hostname)).size < 2 || !venueChecks.some(item => item.official === true)) throw new Error(`La salida de cartelera de ${entry.slug} necesita fuentes independientes y una agenda oficial.`);
	const availability = check.availability;
	if (!availability || availability.checkedOn !== runDate || !isJustWatchArgentina(availability.justwatchUrl)) throw new Error(`Al quitar Cine de ${entry.slug}, confirmá JustWatch AR en la fecha de ejecución.`);
	const offers = availability.offers ?? [];
	const currentPlatforms = moviePlatforms(movie);
	if (offers.length === 0) {
		if (currentPlatforms.length !== 1 || normalized(currentPlatforms[0]) !== normalized('Otras plataformas')) throw new Error(`Sin oferta legal confirmada, ${entry.slug} debe quedar en Otras plataformas.`);
		return;
	}
	for (const offer of offers) {
		if (!offer.provider || !currentPlatforms.some(platform => normalized(platform) === normalized(offer.provider)) || !PLATFORM_OFFERS.includes(offer.offerType) || offer.country !== 'AR' || !httpsUrl(offer.url)) throw new Error(`La plataforma alternativa de ${entry.slug} no coincide con evidencia legal AR.`);
	}
	if (currentPlatforms.some(platform => !offers.some(offer => normalized(offer.provider) === normalized(platform)))) throw new Error(`La ficha de ${entry.slug} conserva una plataforma que no está confirmada en el ledger.`);
}

function validateCinemaRevalidationManifest(report, baselineCinemaSlugs, baselineMoviesBySlug, moviesBySlug, runDate) {
	const candidatesBySlug = new Map(report.candidates.map(candidate => [candidate.slug, candidate]));
	for (const slug of baselineCinemaSlugs) {
		const candidate = candidatesBySlug.get(slug);
		const baselineMovie = baselineMoviesBySlug[slug];
		const movie = moviesBySlug[slug];
		if (!candidate || !baselineMovie || !movie) throw new Error(`El manifiesto semanal debe incluir y auditar toda ficha que ya tenía Cine: ${slug}.`);
		validateCinemaRevalidation(candidate, baselineMovie, movie, runDate);
	}
}

function validatePlatformEvidence(entry, period) {
	const availability = entry.evidence?.availability;
	if (!availability || !isJustWatchArgentina(availability.justwatchUrl)) throw new Error(`Falta JustWatch AR para ${entry.slug}.`);
	if (!['new-release', 'new-availability'].includes(availability.reason)) throw new Error(`La oferta de ${entry.slug} no está identificada como novedad de la semana.`);
	if (!availability.activeOn || availability.activeOn < period.start || availability.activeOn > period.runDate) throw new Error(`La novedad de ${entry.slug} no estaba activa entre ${period.start} y el corte ${period.runDate}. Los anuncios futuros quedan pendientes.`);
	if (availability.checkedOn !== period.runDate) throw new Error(`La disponibilidad de ${entry.slug} debe verificarse en la fecha de ejecución ${period.runDate}.`);
	if (!Array.isArray(availability.offers) || availability.offers.length === 0) throw new Error(`Falta proveedor/modalidad AR para ${entry.slug}.`);
	for (const offer of availability.offers) {
		if (!offer.provider || !includesPlatform(entry.movie, offer.provider) || !PLATFORM_OFFERS.includes(offer.offerType) || !httpsUrl(offer.url)) {
			throw new Error(`Proveedor, modalidad o URL AR no coincide con la ficha de ${entry.slug}.`);
		}
		if (offer.country !== 'AR') throw new Error(`La oferta de ${entry.slug} no prueba Argentina.`);
	}
}

/** Enforce evidence, note, social and duplicate invariants before any weekly publication. */
export function validateWeeklyRelease({ kind, runDate, period, execution, modelCatalog, report, note, moviesBySlug, baselineCinemaSlugs = [], baselineMoviesBySlug = {}, priorReports = [], priorNotes = [], now = new Date() }) {
	const expectedPeriod = getWeeklyReleasePeriod(kind, runDate);
	if (period?.kind !== expectedPeriod.kind || period?.runDate !== expectedPeriod.runDate || period?.start !== expectedPeriod.start || period?.end !== expectedPeriod.end || period?.schedule !== expectedPeriod.schedule) throw new Error('La ventana semanal no coincide con la política de Argentina.');
	if (argentinaDate(now) !== runDate) throw new Error('La fecha actual de Argentina cambió; no publiques un run fechado otro día.');
	if (report?.kind !== kind || report?.date !== runDate || report?.slug !== note?.slug || report?.period?.start !== period.start || report?.period?.end !== period.end) {
		throw new Error('El recibo semanal no coincide con tipo, fecha, nota o ventana.');
	}
	if (note?.date !== runDate || note?.author !== 'CinePosta' || note?.type !== 'nota' || note?.spoilers) throw new Error('La guía debe ser una nota CinePosta fechada hoy, sin spoilers fuertes.');
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(note.slug ?? '') || !note.slug.startsWith(kind === 'cine' ? 'estrenos-cines-' : 'estrenos-streaming-')) throw new Error('El slug no corresponde al tipo de guía.');
	if (!Array.isArray(report.candidates) || !Array.isArray(report.includedSlugs)) throw new Error('Falta el manifiesto explícito de candidatos y títulos incluidos.');
	if (new Set(report.candidates.map(entry => entry.slug)).size !== report.candidates.length) throw new Error('El manifiesto repite candidatos.');
	if (new Set(report.includedSlugs).size !== report.includedSlugs.length || report.includedSlugs.length === 0) throw new Error('La guía debe declarar títulos reales, sin duplicados.');
	if (!Array.isArray(report.homeSlugs) || report.homeSlugs.some(slug => !report.includedSlugs.includes(slug))) throw new Error('Los títulos del carrusel deben ser un subconjunto de los títulos incluidos en la guía.');
	if (report.homeSlugs.length === 0 && (typeof report.homeOmissionReason !== 'string' || !report.homeOmissionReason.trim())) throw new Error('Si ningún incluido aparece en el carrusel actual, registrá una razón concreta en homeOmissionReason.');
	const included = report.candidates.filter(entry => entry.include === true);
	if (included.map(entry => entry.slug).sort().join('\n') !== [...report.includedSlugs].sort().join('\n')) throw new Error('El manifiesto de incluidos no coincide con sus decisiones título por título.');
	const copy = allText(note);
	for (const entry of report.candidates) {
		const movie = moviesBySlug[entry.slug];
		if (!movie) {
			if (entry.include || !['pending', 'excluded'].includes(entry.status) || typeof entry.reason !== 'string' || !entry.reason.trim()) throw new Error(`El candidato ausente ${entry.slug} sólo puede quedar pendiente o excluido con una razón concreta.`);
			if (entry.status === 'pending' && (!Array.isArray(entry.scoreSearches) || entry.scoreSearches.length === 0)) throw new Error(`El pendiente ${entry.slug} necesita registrar búsqueda pública de score.`);
			continue;
		}
		const candidate = { ...entry, movie };
		if (entry.include) {
			if (!['loaded', 'updated', 'existing', 'revalidated', 'rerated'].includes(entry.status)) throw new Error(`Estado inválido para título incluido: ${entry.slug}.`);
			if (!copy.includes(movie.title)) throw new Error(`La guía no nombra el título incluido ${movie.title}.`);
			if (kind === 'cine') validateCinemaEvidence(candidate, period);
			else validatePlatformEvidence(candidate, period);
			validateScore(candidate, movie, runDate);
		} else if (entry.status === 'pending' && typeof entry.reason !== 'string') {
			throw new Error(`El candidato pendiente ${entry.slug} necesita una razón concreta.`);
		}
	}
	if (kind === 'cine') validateCinemaRevalidationManifest(report, baselineCinemaSlugs, baselineMoviesBySlug, moviesBySlug, runDate);
	const native = validateNativeWeeklyRun(execution, modelCatalog, runDate);
	if (JSON.stringify(report.execution) !== JSON.stringify(native.execution)) throw new Error('El recibo no conserva la evidencia real del ejecutor nativo Luna Max.');
	if (report.tweet !== report.social?.tweet || typeof report.tweet !== 'string') throw new Error('El tweet original debe estar en el recibo semanal y en el borrador social.');
	const sourceHosts = new Set((report.sources || []).map(source => {
		if (!httpsUrl(source.url)) throw new Error('La guía incluye una URL de fuente inválida.');
		return new URL(source.url).hostname.replace(/^www\./u, '');
	}));
	if (sourceHosts.size < 2) throw new Error('La guía necesita dos dominios de fuente independientes.');
	const noteSourceUrls = new Set((note.sources || []).map(source => source.url));
	for (const source of report.sources || []) if (!noteSourceUrls.has(source.url)) throw new Error(`La fuente ${source.url} debe aparecer en la nota publicada.`);
	if (report.imageChecks?.length < 1 || report.imageChecks.some(item => !item.sourceUrl || !httpsUrl(item.sourceUrl) || !item.description || item.description.length < 20)) throw new Error('Falta inspección visual y procedencia de la portada.');
	if (priorReports.some(previous => previous.kind === kind && previous.period?.start === period.start && previous.period?.end === period.end)) throw new Error('Ya hay un recibo publicado para esta ventana; reanudar su estado existente.');
	if (priorNotes.some(previous => previous.slug === note.slug || canonicalTitle(previous.title) === canonicalTitle(note.title))) throw new Error('La guía ya existe en el archivo editorial.');
	return { ...report, period, execution: native.execution, candidateCount: report.candidates.length, includedCount: included.length };
}

/** Explicit allow-list for the content footprint; home snapshots and unrelated app code stay frozen. */
export function assertWeeklyReleaseScope(changes, { kind, date, slug }) {
	const receipt = `reports/weekly-releases/${kind}/${date}.json`;
	const editorial = `src/data/editorials/${slug}.json`;
	const editorialAsset = new RegExp(`^public/assets/editorial/${slug}/[a-z0-9-]+\\.webp$`, 'u');
	const allowed = path => path === editorial || path === receipt || editorialAsset.test(path)
		|| /^src\/data\/movies\/[a-z0-9-]+\.json$/u.test(path)
		|| path === 'src/data/people.json'
		|| /^src\/data\/personProfiles(?:[A-Za-z0-9_-]+)?\.ts$/u.test(path)
		|| /^public\/people\/[a-z0-9-]+\.(?:webp|avif|jpg|jpeg|png)$/iu.test(path)
		|| /^public\/assets\/posters\/[0-9]{4}\/[a-z0-9-]+\.webp$/u.test(path)
		|| path === 'docs/movie-catalog-reference.md'
		|| path === 'docs/person-profile-catalog-reference.md';
	for (const change of changes) {
		const { status, path } = typeof change === 'string' ? { status: 'M', path: change } : change;
		if (!['A', 'M', '??'].includes(status)) throw new Error(`No se permiten borrados ni renombres en una guía semanal: ${status} ${path}`);
		if (!allowed(path)) throw new Error(`Cambio fuera del alcance semanal: ${path}`);
	}
	const paths = changes.map(change => typeof change === 'string' ? change : change.path);
	if (!paths.includes(editorial)) throw new Error('Debe publicarse exactamente la guía editorial verificada.');
	if (!paths.includes(receipt)) throw new Error('Debe versionarse el recibo de evidencia y el tweet original.');
	if (paths.some(path => /weeklyRecommendations\.generated|upcomingReleases\.generated|cinemaNews\.generated/u.test(path))) throw new Error('Los snapshots independientes del home permanecen congelados.');
	return true;
}
