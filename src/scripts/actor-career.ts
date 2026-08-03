type Difficulty = 'intensa' | 'normal' | 'expres';
type Profile = 'camaleonico' | 'drama' | 'comedia' | 'accion';
type Profession = 'actor' | 'director' | 'assistant' | 'producer';
type Gender = 'masculino' | 'femenino';
type SummaryTier = 'superstar' | 'mediocre' | 'ruin';
type AwardId = 'mar-del-plata' | 'goya' | 'cannes' | 'golden-globe' | 'oscar';
type OfferKind = 'movie' | 'event';

interface DifficultyConfig {
	label: string;
	step: number;
	maxAge: number;
	peakLevel: number;
	retirementLevel: number;
	description: string;
}

interface AwardDefinition {
	label: string;
	short: string;
	asset: string;
}

interface Outcome {
	chance: number;
	label: string;
	project: string;
	levelDelta: number;
	filmsDelta: number;
	leadsDelta: number;
	nominationsDelta: number;
	luckDelta: number;
	award?: AwardId;
}

interface Choice {
	label: string;
	copy: string;
	icon: string;
	risk: string;
	outcomes: Outcome[];
	retire?: boolean;
}

type OutcomeSeed = Omit<Outcome, 'project'>;

interface MovieOffer {
	slug: string;
	title: string;
	year: number;
	posterUrl: string;
	director: string;
	category: string;
	genres: string[];
	isArgentinian: boolean;
	awardTypes: string[];
}

interface SimulationOffer {
	slug: string;
	title: string;
	year: number;
	posterUrl: string;
	category: string;
	detail: string;
}

interface OfferChoice {
	choice: Choice;
	kind: OfferKind;
	movie?: MovieOffer;
	simulation?: SimulationOffer;
}

interface CareerEvent {
	kicker: string;
	title: string;
	copy: string;
	choices: Choice[];
	mixed?: boolean;
}

interface TimelineEntry {
	age: number;
	year: number;
	project: string;
	choice?: string;
	result?: string;
	level: number;
	films: number;
	awards: number;
	luck: number;
	movie?: MovieOffer;
	simulation?: SimulationOffer;
	award?: AwardId;
}

interface CareerState {
	name: string;
	countryCode: string;
	countryName: string;
	countryFlag: string;
	birthYear: number;
	gender: Gender;
	profession: Profession;
	profile: Profile;
	difficulty: Difficulty;
	ages: number[];
	currentIndex: number;
	level: number;
	peakLevel: number;
	films: number;
	leads: number;
	nominations: number;
	luck: number;
	moviesSinceDevelopment: number;
	nextDevelopmentAfter: number;
	awards: AwardId[];
	history: TimelineEntry[];
	finished: boolean;
}

const root = document.querySelector<HTMLElement>('[data-actor-simulator]');

if (root) {
	const assetBase = root.dataset.assetBase ?? '/';
	root.style.setProperty('--actor-event-art-image', `url("${assetBase}images/actor-career/actor-career-events.png")`);
	const views = Array.from(root.querySelectorAll<HTMLElement>('[data-view]'));
	const stageNameInput = root.querySelector<HTMLInputElement>('[data-stage-name]');
	const stageNameError = root.querySelector<HTMLElement>('[data-stage-name-error]');
	const birthYearInput = root.querySelector<HTMLInputElement>('[data-birth-year]');
	const birthYearError = root.querySelector<HTMLElement>('[data-birth-year-error]');
	const countrySearchInput = root.querySelector<HTMLInputElement>('[data-country-search]');
	const countryButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-country]'));
	const genderInputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-gender]'));
	const professionInputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-profession]'));
	const profileInputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-profile]'));
	const difficultyButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-difficulty]'));
	const difficultyDescription = root.querySelector<HTMLElement>('[data-difficulty-description]');
	const identityForm = root.querySelector<HTMLFormElement>('[data-identity-form]');
	const summaryContent = root.querySelector<HTMLElement>('[data-summary-content]');
	const choiceGrid = root.querySelector<HTMLElement>('[data-choice-grid]');
	const eventKicker = root.querySelector<HTMLElement>('[data-event-kicker]');
	const eventTitle = root.querySelector<HTMLElement>('[data-event-title]');
	const eventCopy = root.querySelector<HTMLElement>('[data-event-copy]');
	const eventPanel = root.querySelector<HTMLElement>('[data-event-panel]');
	const eventResult = root.querySelector<HTMLElement>('[data-event-result]');
	const careerLogCount = root.querySelector<HTMLElement>('[data-career-log-count]');
	const careerLogBody = root.querySelector<HTMLElement>('[data-career-log-body]');
	const timelineBody = root.querySelector<HTMLElement>('[data-timeline-body]');
	const awardsShelf = root.querySelector<HTMLElement>('[data-awards-shelf]');
	const playerLevel = root.querySelector<HTMLElement>('[data-player-level]');
	const playerName = root.querySelector<HTMLElement>('[data-player-name]');
	const playerCountry = root.querySelector<HTMLElement>('[data-player-country]');
	const playerProfile = root.querySelector<HTMLElement>('[data-player-profile]');
	const playerProject = root.querySelector<HTMLElement>('[data-player-project]');
	const playerAge = root.querySelector<HTMLElement>('[data-player-age]');
	const playerYear = root.querySelector<HTMLElement>('[data-player-year]');
	const playerCachet = root.querySelector<HTMLElement>('[data-player-cachet]');
	const stateArt = root.querySelector<HTMLElement>('[data-state-art]');
	const stateArtImage = root.querySelector<HTMLImageElement>('[data-state-art-image]');
	const stateArtCaption = root.querySelector<HTMLElement>('[data-state-art-caption]');
	const playerFilms = root.querySelector<HTMLElement>('[data-player-films]');
	const playerLeads = root.querySelector<HTMLElement>('[data-player-leads]');
	const playerNominations = root.querySelector<HTMLElement>('[data-player-nominations]');
	const playerLuck = root.querySelector<HTMLElement>('[data-player-luck]');
	const timelineMode = root.querySelector<HTMLElement>('[data-timeline-mode]');
	const movieCatalogElement = document.getElementById('actor-movie-catalog');
	const movieCatalog = movieCatalogElement?.textContent ? (JSON.parse(movieCatalogElement.textContent) as MovieOffer[]) : [];
	const currentYear = new Date().getUTCFullYear();

	const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
		intensa: {
			label: 'Intensa',
			step: 1,
			maxAge: 60,
			peakLevel: 88,
			retirementLevel: 64,
			description: 'Decisiones cada año · más giros, más chances de meter la pata.',
		},
		normal: {
			label: 'Normal',
			step: 2,
			maxAge: 60,
			peakLevel: 87,
			retirementLevel: 63,
			description: 'Decisiones cada 2 años · una experiencia equilibrada.',
		},
		expres: {
			label: 'Exprés',
			step: 4,
			maxAge: 60,
			peakLevel: 86,
			retirementLevel: 61,
			description: 'Decisiones cada 4 años · una carrera en pocos minutos.',
		},
	};

	const profileDefinitions: Record<Profile, { label: string; short: string }> = {
		camaleonico: { label: 'Camaleónico', short: 'Camaleónico' },
		drama: { label: 'Drama', short: 'Drama' },
		comedia: { label: 'Comedia', short: 'Comedia' },
		accion: { label: 'Acción', short: 'Acción' },
	};

	const professionDefinitions: Record<Profession, { label: string; short: string }> = {
		actor: { label: 'Actuación', short: 'Actuación' },
		director: { label: 'Dirección', short: 'Dirección' },
		assistant: { label: 'Asistencia de dirección', short: 'Asistencia' },
		producer: { label: 'Producción', short: 'Producción' },
	};

	const summaryTierDefinitions: Record<SummaryTier, { label: string; caption: string; alt: string }> = {
		superstar: {
			label: 'FAMA TOTAL',
			caption: 'Del primer casting a la alfombra roja.',
			alt: 'Noche de premios, flashes y fama internacional',
		},
		mediocre: {
			label: 'CARRERA MODESTA',
			caption: 'Una filmografía honesta, con algunos créditos y ninguna estatua que te cambie la vida.',
			alt: 'Estreno independiente y equipo celebrando una carrera modesta',
		},
		ruin: {
			label: 'EN LA RUINA',
			caption: 'La pantalla se apagó, pero todavía queda una historia para contar.',
			alt: 'Últimos días de una carrera cinematográfica difícil, con dignidad y esperanza',
		},
	};

	function professionDisplayLabel(profession: Profession, gender: Gender): string {
		const labels: Record<Profession, [string, string]> = {
			actor: ['Actor', 'Actriz'],
			director: ['Director', 'Directora'],
			assistant: ['Asistente de dirección', 'Asistente de dirección'],
			producer: ['Productor', 'Productora'],
		};
		return labels[profession][gender === 'femenino' ? 1 : 0];
	}

	const awardDefinitions: Record<AwardId, AwardDefinition> = {
		'mar-del-plata': {
			label: 'Premio del público · Mar del Plata',
			short: 'Mar del Plata',
			asset: 'generic-award.svg',
		},
		goya: { label: 'Premio Goya', short: 'Goya', asset: 'generic-award.svg' },
		cannes: { label: 'Palma de Oro · Cannes', short: 'Cannes', asset: 'cannes.svg' },
		'golden-globe': { label: 'Globo de Oro', short: 'Globo de Oro', asset: 'golden-globe.svg' },
		oscar: { label: 'Premio Oscar', short: 'Oscar', asset: 'oscar.svg' },
	};

	const careerEvents: CareerEvent[] = [
		{
			kicker: 'PRIMERA OPORTUNIDAD',
			title: 'El primer casting',
			copy: 'Todo empieza con una llamada que puede parecer chica, pero alguien está mirando.',
			choices: [
				{
					label: 'El corto de autor',
					copy: 'Una directora nueva te ofrece un papel mínimo y un rodaje sin un peso.',
					icon: '🎬',
					risk: 'APUESTA',
					outcomes: [
						{ chance: 68, label: '+4 nivel · primer crédito', project: 'Los días quietos', levelDelta: 4, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: 5 },
						{ chance: 32, label: '+1 película · pasa sin ruido', project: 'Un papel chiquito', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 },
					],
				},
				{
					label: 'La serie que mira todo el mundo',
					copy: 'Tres escenas en una serie popular. No es cine, pero te ve medio país.',
					icon: '📺',
					risk: 'EXPOSICIÓN',
					outcomes: [
						{ chance: 56, label: '+3 nivel · te empiezan a llamar', project: 'La hora del patio', levelDelta: 3, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: 3 },
						{ chance: 44, label: 'Sin cambio · quedás de fondo', project: 'La hora del patio', levelDelta: 0, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 },
					],
				},
				{
					label: 'Esperar el papel indicado',
					copy: 'Decís que no a todo lo que no te convence y confiás en tu intuición.',
					icon: '⏳',
					risk: 'PACiencia',
					outcomes: [
						{ chance: 42, label: '+6 nivel · primer protagónico', project: 'La vuelta de la esquina', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 },
						{ chance: 58, label: '-2 nivel · se enfría el teléfono', project: 'Un año sin cámara', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 },
					],
				},
			],
		},
		{
			kicker: 'EL PRIMER SALTO',
			title: 'Una película de verdad',
			copy: 'El segundo llamado viene con un guion entero y un director que todavía no conoce tu cara.',
			choices: [
				{
					label: 'Papel secundario con director nuevo',
					copy: 'Te metés en una película chica que puede viajar por festivales.',
					icon: '🎞️',
					risk: 'AUTOR',
					outcomes: [
						{ chance: 64, label: '+5 nivel · una crítica te destaca', project: 'Los nombres del agua', levelDelta: 5, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 5 },
						{ chance: 36, label: '+2 nivel · buena escuela', project: 'Los nombres del agua', levelDelta: 2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -1 },
					],
				},
				{
					label: 'Comedia popular',
					copy: 'Un personaje querible, muchas funciones y un póster en todos los cines.',
					icon: '🍿',
					risk: 'PÚBLICO',
					outcomes: [
						{ chance: 59, label: '+4 nivel · te convertís en nombre', project: 'Fin de semana largo', levelDelta: 4, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 4 },
						{ chance: 41, label: '+1 película · chistes que no entran', project: 'Fin de semana largo', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 },
					],
				},
				{
					label: 'Entrenar antes de filmar',
					copy: 'Te tomás meses para preparar cuerpo, voz y una escena que no perdona.',
					icon: '🎭',
					risk: 'MÉTODO',
					outcomes: [
						{ chance: 73, label: '+7 nivel · actuación que se nota', project: 'El peso de la noche', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 6 },
						{ chance: 27, label: '-1 nivel · te pasás de rosca', project: 'El peso de la noche', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 },
					],
				},
			],
		},
		{
			kicker: 'REPRESENTACIÓN',
			title: 'Un agente llama',
			copy: 'Tu cara empieza a circular. Ahora hay que decidir quién va a negociar por vos.',
			choices: [
				{
					label: 'Firmar con la agencia grande',
					copy: 'Más contactos y una comisión que duele, pero te pone en otras mesas.',
					icon: '📇',
					risk: 'ESCALA',
					outcomes: [
						{ chance: 63, label: '+6 nivel · llega el papel internacional', project: 'Contrato de invierno', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 5 },
						{ chance: 37, label: '-2 nivel · te vuelven una ficha', project: 'Contrato de invierno', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 },
					],
				},
				{
					label: 'Seguir independiente',
					copy: 'Elegís tus proyectos y te quedás con menos certezas, pero más control.',
					icon: '🧭',
					risk: 'CONTROL',
					outcomes: [
						{ chance: 58, label: '+4 nivel · una voz propia', project: 'La casa transparente', levelDelta: 4, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 5 },
						{ chance: 42, label: '-1 nivel · cuesta financiarla', project: 'La casa transparente', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 },
					],
				},
				{
					label: 'Cambiar de país',
					copy: 'Te vas con una valija, un acento nuevo y cero garantías.',
					icon: '✈️',
					risk: 'RIESGO',
					outcomes: [
						{ chance: 47, label: '+8 nivel · te descubre un festival', project: 'La frontera del aire', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 },
						{ chance: 53, label: '-3 nivel · volvés con experiencia', project: 'Audiciones en otra lengua', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -7 },
					],
				},
			],
		},
		{
			kicker: 'PRIMER FESTIVAL',
			title: 'Mar del Plata te mira',
			copy: 'La película queda seleccionada. El festival está lleno de gente que puede cambiarte la carrera.',
			choices: [
				{
					label: 'Hacer prensa y bancar la gira',
					copy: 'Entrevistas, fotos y una charla incómoda a las ocho de la mañana.',
					icon: '🎤',
					risk: 'VISIBILIDAD',
					outcomes: [
						{ chance: 62, label: '+1 nominación · premio del público', project: 'Las luces del puerto', levelDelta: 4, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 6, award: 'mar-del-plata' },
						{ chance: 38, label: '+3 nivel · te gana la crítica', project: 'Las luces del puerto', levelDelta: 3, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 1 },
					],
				},
				{
					label: 'Desaparecer y dejar hablar a la peli',
					copy: 'No das notas. Confiás en la película y en que alguien la defienda por vos.',
					icon: '🕶️',
					risk: 'MISTERIO',
					outcomes: [
						{ chance: 46, label: '+6 nivel · una crítica te consagra', project: 'Las luces del puerto', levelDelta: 6, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 7 },
						{ chance: 54, label: 'Sin cambio · nadie sabe quién sos', project: 'Las luces del puerto', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 },
					],
				},
				{
					label: 'Pedir el personaje más difícil',
					copy: 'El director te ofrece un papel secundario. Vos pedís el que nadie quiere tocar.',
					icon: '⚡',
					risk: 'AMBICIÓN',
					outcomes: [
						{ chance: 51, label: '+9 nivel · la escena de la temporada', project: 'Las luces del puerto', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9 },
						{ chance: 49, label: '-2 nivel · no era tu registro', project: 'Las luces del puerto', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 },
					],
				},
			],
		},
		{
			kicker: 'SALTO INTERNACIONAL',
			title: 'Una película cruza fronteras',
			copy: 'El montaje viaja y alguien propone que tu personaje tenga otra lengua.',
			choices: [
				{
					label: 'Aprender el idioma y hacerlo',
					copy: 'Tres meses de coach, una pronunciación imposible y un papel que se agranda.',
					icon: '🌍',
					risk: 'DESAFÍO',
					outcomes: [
						{ chance: 66, label: '+7 nivel · nominación internacional', project: 'El mapa de los cuerpos', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 6, award: 'goya' },
						{ chance: 34, label: '+2 nivel · el acento te juega en contra', project: 'El mapa de los cuerpos', levelDelta: 2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 },
					],
				},
				{
					label: 'Quedarte en tu idioma',
					copy: 'Preferís el texto que conocés y una película que no te pida disfrazarte.',
					icon: '🗣️',
					risk: 'RAÍCES',
					outcomes: [
						{ chance: 69, label: '+5 nivel · un papel inolvidable', project: 'El mapa de los cuerpos', levelDelta: 5, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 4 },
						{ chance: 31, label: '+1 película · mercado más chico', project: 'El mapa de los cuerpos', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 },
					],
				},
				{
					label: 'Aceptar la versión doblada',
					copy: 'El estudio te ofrece una producción enorme. Tu voz queda para después.',
					icon: '🎙️',
					risk: 'MERCADO',
					outcomes: [
						{ chance: 57, label: '+6 nivel · salto de taquilla', project: 'Órbita 9', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 5 },
						{ chance: 43, label: '-1 nivel · quedás perdido en el elenco', project: 'Órbita 9', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 },
					],
				},
			],
		},
		{
			kicker: 'PAPEL BISAGRA',
			title: 'Te ofrecen transformarte',
			copy: 'El personaje es enorme, pero también te puede dejar pegado a una sola forma de actuar.',
			choices: [
				{
					label: 'Cambiar el cuerpo y la voz',
					copy: 'Entrenás, te aislás y llegás al set irreconocible.',
					icon: '🪞',
					risk: 'MÉTODO',
					outcomes: [
						{ chance: 64, label: '+8 nivel · te llaman valiente', project: 'La piel prestada', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7, award: 'golden-globe' },
						{ chance: 36, label: '-3 nivel · el truco pesa más que el papel', project: 'La piel prestada', levelDelta: -3, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: -6 },
					],
				},
				{
					label: 'Rechazar el encasillamiento',
					copy: 'Decís que no y buscás algo menos espectacular, pero más tuyo.',
					icon: '🧩',
					risk: 'CRITERIO',
					outcomes: [
						{ chance: 58, label: '+5 nivel · una elección inteligente', project: 'La habitación de al lado', levelDelta: 5, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 5 },
						{ chance: 42, label: '-2 nivel · el público quería otra cosa', project: 'La habitación de al lado', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 },
					],
				},
				{
					label: 'Aceptar una franquicia',
					copy: 'Una máscara, tres secuelas y un contrato que paga por adelantado.',
					icon: '🚀',
					risk: 'TAQUILLA',
					outcomes: [
						{ chance: 61, label: '+5 nivel · te volvés imprescindible', project: 'Guardianes del eclipse', levelDelta: 5, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 4 },
						{ chance: 39, label: '-2 nivel · te comen los efectos', project: 'Guardianes del eclipse', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 },
					],
				},
			],
		},
		{
			kicker: 'TEMPORADA DE PREMIOS',
			title: 'La campaña empieza',
			copy: 'La película tiene una ventana. Ahora todo depende de cuánto quieras jugar el juego de la industria.',
			choices: [
				{
					label: 'Hacer campaña sin parar',
					copy: 'Festivales, desayunos, entrevistas y una sonrisa para cada foto.',
					icon: '🏆',
					risk: 'CAMPAÑA',
					outcomes: [
						{ chance: 67, label: '+1 nominación · entrás en la conversación', project: 'La última función', levelDelta: 5, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 6 },
						{ chance: 33, label: '-1 nivel · agotás a todo el mundo', project: 'La última función', levelDelta: -1, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: -4 },
					],
				},
				{
					label: 'Dejar que hable la actuación',
					copy: 'No perseguís votos. Te refugiás en el trabajo y esperás.',
					icon: '🎞️',
					risk: 'PERFIL BAJO',
					outcomes: [
						{ chance: 48, label: '+8 nivel · la crítica te abraza', project: 'La última función', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8, award: 'goya' },
						{ chance: 52, label: 'Sin cambio · nadie te empuja', project: 'La última función', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 },
					],
				},
				{
					label: 'Volver a hacer teatro',
					copy: 'Te bajás del ruido y te subís a un escenario chico durante un año.',
					icon: '🎟️',
					risk: 'OFICIO',
					outcomes: [
						{ chance: 55, label: '+4 nivel · recuperás el pulso', project: 'La última función', levelDelta: 4, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 4 },
						{ chance: 45, label: '-1 nivel · el cine sigue sin esperar', project: 'La última función', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 },
					],
				},
			],
		},
		{
			kicker: 'LA LLAMADA',
			title: 'Cannes manda un mail',
			copy: 'Un director que admirás quiere que seas la cara de su película más arriesgada.',
			choices: [
				{
					label: 'Aceptar la película de autor',
					copy: 'El rodaje es difícil, el presupuesto es mínimo y la invitación puede ser histórica.',
					icon: '🌴',
					risk: 'CANNES',
					outcomes: [
						{ chance: 57, label: '+1 nominación · Palma de Oro', project: 'El verano de las sombras', levelDelta: 10, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 10, award: 'cannes' },
						{ chance: 43, label: '+3 nivel · ovación dividida', project: 'El verano de las sombras', levelDelta: 3, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: -5 },
					],
				},
				{
					label: 'Elegir la superproducción',
					copy: 'La película compite en otra liga: sets gigantes, estreno mundial y cero silencios.',
					icon: '🎥',
					risk: 'ESCALA',
					outcomes: [
						{ chance: 64, label: '+7 nivel · estrella global', project: 'Horizonte de titanio', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 },
						{ chance: 36, label: '-2 nivel · la película se desarma', project: 'Horizonte de titanio', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 },
					],
				},
				{
					label: 'Producir tu propia película',
					copy: 'Te jugás tus ahorros y llamás a gente que te debe un favor.',
					icon: '🎬',
					risk: 'AUTOGESTIÓN',
					outcomes: [
						{ chance: 41, label: '+9 nivel · tu voz llega lejos', project: 'Nadie filma por vos', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'mar-del-plata' },
						{ chance: 59, label: '-3 nivel · el estreno se complica', project: 'Nadie filma por vos', levelDelta: -3, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: -7 },
					],
				},
			],
		},
		{
			kicker: 'CAMBIO DE REGISTRO',
			title: 'La industria te encasilla',
			copy: 'Después de un éxito, todos quieren la misma versión de vos. La próxima elección puede romper el molde.',
			choices: [
				{
					label: 'Hacer una comedia absurda',
					copy: 'El papel parece una pavada hasta que te pide precisión quirúrgica.',
					icon: '😂',
					risk: 'COMEDIA',
					outcomes: [
						{ chance: 61, label: '+6 nivel · descubrís otro timing', project: 'El día de la marmota', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 5 },
						{ chance: 39, label: '-2 nivel · no te creen el chiste', project: 'El día de la marmota', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 },
					],
				},
				{
					label: 'Hacer el villano',
					copy: 'Aceptás que el público te odie durante dos horas.',
					icon: '🦂',
					risk: 'CONTRATIPO',
					outcomes: [
						{ chance: 65, label: '+7 nivel · robás la película', project: 'El lado oscuro del río', levelDelta: 7, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 6 },
						{ chance: 35, label: '+1 película · te piden lo mismo', project: 'El lado oscuro del río', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 },
					],
				},
				{
					label: 'Repetir la fórmula',
					copy: 'Sabés qué funciona y no te da culpa cobrar por hacerlo otra vez.',
					icon: '💵',
					risk: 'SEGURO',
					outcomes: [
						{ chance: 74, label: '+5 nivel · éxito de público', project: 'La fórmula perfecta', levelDelta: 5, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 4 },
						{ chance: 26, label: '-1 nivel · la secuela sobra', project: 'La fórmula perfecta', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 },
					],
				},
			],
		},
		{
			kicker: 'LOS GRANDES PREMIOS',
			title: 'La temporada de los Oscars',
			copy: 'Tu nombre aparece en las listas. Falta una película, una campaña y una noche que nadie puede ensayar.',
			choices: [
				{
					label: 'Ir con todo por el Oscar',
					copy: 'Vestido, discursos, entrevistas: convertís cada aparición en una escena.',
					icon: '🏛️',
					risk: 'OSCAR',
					outcomes: [
						{ chance: 48, label: '+1 nominación · Oscar en la vitrina', project: 'La habitación de los nombres', levelDelta: 12, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 12, award: 'oscar' },
						{ chance: 52, label: '+5 nivel · te quedás en la puerta', project: 'La habitación de los nombres', levelDelta: 5, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: -4 },
					],
				},
				{
					label: 'Elegir una película chica',
					copy: 'Mientras todos miran la alfombra, vos volvés a un rodaje con seis personas.',
					icon: '🪑',
					risk: 'AUTOR',
					outcomes: [
						{ chance: 55, label: '+8 nivel · una escena que queda', project: 'La habitación de los nombres', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7, award: 'cannes' },
						{ chance: 45, label: '+2 nivel · la ven cuatro personas', project: 'La habitación de los nombres', levelDelta: 2, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: -3 },
					],
				},
				{
					label: 'Hacer campaña por tu elenco',
					copy: 'No buscás el premio: buscás que la película encuentre su público.',
					icon: '🤝',
					risk: 'EQUIPO',
					outcomes: [
						{ chance: 63, label: '+6 nivel · reconocimiento colectivo', project: 'La habitación de los nombres', levelDelta: 6, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 6, award: 'golden-globe' },
						{ chance: 37, label: '+3 nivel · te recuerdan por el gesto', project: 'La habitación de los nombres', levelDelta: 3, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -1 },
					],
				},
			],
		},
		{
			kicker: 'ÚLTIMO GRAN PAPEL',
			title: 'El director de tus sueños',
			copy: 'A esta altura ya tenés un nombre. La pregunta es qué querés dejar cuando se apaguen las luces.',
			choices: [
				{
					label: 'Aceptar el papel más difícil',
					copy: 'El guion te da miedo y por eso mismo no podés soltarlo.',
					icon: '🖋️',
					risk: 'LEGADO',
					outcomes: [
						{ chance: 62, label: '+9 nivel · cierre perfecto', project: 'Antes de que amanezca', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8, award: 'oscar' },
						{ chance: 38, label: '-2 nivel · no llega a destino', project: 'Antes de que amanezca', levelDelta: -2, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: -5 },
					],
				},
				{
					label: 'Volver a filmar en casa',
					copy: 'Elegís una historia local, un equipo querido y un rodaje que se siente propio.',
					icon: '🏠',
					risk: 'RAÍCES',
					outcomes: [
						{ chance: 67, label: '+7 nivel · el público te devuelve todo', project: 'El patio de atrás', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 6, award: 'mar-del-plata' },
						{ chance: 33, label: '+2 nivel · despedida íntima', project: 'El patio de atrás', levelDelta: 2, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: -1 },
					],
				},
				{
					label: 'Pasar detrás de cámara',
					copy: 'Seguís en el cine, pero ahora tu nombre aparece antes del reparto.',
					icon: '🎥',
					risk: 'NUEVO ROL',
					outcomes: [
						{ chance: 52, label: '+6 nivel · descubrís otra voz', project: 'La película que falta', levelDelta: 6, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 7, award: 'goya' },
						{ chance: 48, label: '-1 nivel · extrañan verte delante', project: 'La película que falta', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 },
					],
				},
			],
		},
	];

	const finalEvent: CareerEvent = {
		kicker: 'FIN DE CICLO',
		title: 'Tu carrera llega a su fin',
		copy: 'El set queda en silencio. Podés aceptar una última película o cerrar la historia con lo que ya construiste.',
		choices: [
			{
				label: 'Una última película',
				copy: 'Elegís despedirte con un personaje que te representa de verdad.',
				icon: '🎬',
				risk: 'DESPEDIDA',
				outcomes: [
					{ chance: 63, label: '+5 nivel · final con aplausos', project: 'La última toma', levelDelta: 5, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 6, award: 'golden-globe' },
					{ chance: 37, label: '+1 película · final tranquilo', project: 'La última toma', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 },
				],
			},
			{
				label: 'Retirarte',
				copy: 'Colgás el vestuario, guardás los guiones y te vas cuando todavía podés elegir.',
				icon: '🌙',
				risk: 'CIERRE',
				retire: true,
				outcomes: [{ chance: 100, label: 'Una carrera completa · queda tu filmografía', project: 'Retiro del cine', levelDelta: 0, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 0 }],
			},
		],
	};

	function makeChoice(
		label: string,
		copy: string,
		icon: string,
		risk: string,
		success: OutcomeSeed,
		failure: OutcomeSeed,
	): Choice {
		return {
			label,
			copy,
			icon,
			risk,
			outcomes: [
				{ ...success, project: 'Proyecto elegido' },
				{ ...failure, project: 'Proyecto elegido' },
			],
		};
	}

	function makeEvent(kicker: string, title: string, copy: string, choices: Choice[]): CareerEvent {
		return { kicker, title, copy, choices };
	}

	const simulationEvents: Record<Profession, CareerEvent> = {
		actor: makeEvent('AÑO DE PREPARACIÓN', 'La cámara puede esperar', 'No hay una película estrenada en este año exacto. Convertís la pausa en entrenamiento para llegar mejor al próximo casting.', [
			makeChoice('Entrenar voz y cuerpo', 'Trabajás respiración, presencia y una escena que repetís hasta que parezca espontánea.', '🎭', 'MÉTODO', { chance: 76, label: '+6 nivel · llegás con más recursos', levelDelta: 6, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 6 }, { chance: 24, label: '+1 nivel · el entrenamiento cuesta', levelDelta: 1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			makeChoice('Armar un laboratorio de personajes', 'Probás voces, gestos y registros hasta encontrar una versión nueva de vos.', '🧪', 'BÚSQUEDA', { chance: 62, label: '+8 nivel · aparece un registro nuevo', levelDelta: 8, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 7 }, { chance: 38, label: '-1 nivel · te perdés buscando', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
		]),
		director: makeEvent('AÑO DE DESARROLLO', 'El guion todavía no rueda', 'No hay una película estrenada en este año exacto. Aprovechás el hueco para afilar la mirada antes de volver al set.', [
			makeChoice('Pulir el storyboard', 'Convertís cada plano en una decisión y encontrás la película antes de filmarla.', '🗺️', 'VISIÓN', { chance: 74, label: '+7 nivel · una puesta más precisa', levelDelta: 7, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 7 }, { chance: 26, label: '-1 nivel · demasiadas flechas', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Rodar un corto de prueba', 'Juntás un equipo chico para ensayar el tono, la luz y el movimiento de cámara.', '🎞️', 'PRÁCTICA', { chance: 65, label: '+6 nivel · encontrás una voz', levelDelta: 6, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 35, label: '+1 nivel · queda como ensayo', levelDelta: 1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
		]),
		assistant: makeEvent('SET EN PAUSA', 'El rodaje puede esperar', 'No hay una película estrenada en este año exacto. Usás el tiempo para aprender cómo sostener un set cuando vuelva a prenderse la cámara.', [
			makeChoice('Capacitarte en coordinación', 'Estudiás call sheets, tiempos y la coreografía invisible que hace funcionar una jornada.', '📋', 'OFICIO', { chance: 78, label: '+6 nivel · el equipo confía en vos', levelDelta: 6, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 22, label: '+1 nivel · todavía falta cancha', levelDelta: 1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			makeChoice('Aprender un oficio técnico', 'Te metés en luces, sonido y utilería para entender qué necesita cada departamento.', '🔧', 'CURIOSIDAD', { chance: 68, label: '+8 nivel · resolvés antes de llamar', levelDelta: 8, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 32, label: '-1 nivel · demasiadas herramientas', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
		]),
		producer: makeEvent('PREPRODUCCIÓN', 'La película se arma antes del rodaje', 'No hay una película estrenada en este año exacto. Aprovechás la pausa para que el próximo proyecto tenga alguna chance de existir.', [
			makeChoice('Armar una carpeta de proyecto', 'Ordenás presupuesto, plan de rodaje y una presentación que se pueda defender en cualquier mesa.', '📁', 'ESTRATEGIA', { chance: 72, label: '+7 nivel · el proyecto toma forma', levelDelta: 7, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 28, label: '-1 nivel · faltan números', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Buscar financiamiento', 'Llamás a productoras, fondos y contactos hasta encontrar una puerta entreabierta.', '💸', 'PERSISTENCIA', { chance: 58, label: '+9 nivel · aparece un aliado', levelDelta: 9, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 42, label: '-2 nivel · muchas reuniones, poco dinero', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
		]),
	};

	const simulationOfferDefinitions: Record<Profession, Array<Pick<SimulationOffer, 'title' | 'category' | 'detail'>>> = {
		actor: [
			{ title: 'Entrenamiento de actuación', category: 'Preparación', detail: 'Un año para sumar herramientas antes del próximo casting.' },
			{ title: 'Laboratorio de personajes', category: 'Investigación', detail: 'Probás registros nuevos sin que nadie grite “corte”.' },
		],
		director: [
			{ title: 'Taller de puesta en escena', category: 'Desarrollo', detail: 'Un año para encontrar la película antes de filmarla.' },
			{ title: 'Corto de prueba', category: 'Práctica', detail: 'Ensayás la mirada con un equipo chico y muchas ganas.' },
		],
		assistant: [
			{ title: 'Curso de coordinación', category: 'Oficio', detail: 'Aprendés a ordenar el caos antes de que llegue al set.' },
			{ title: 'Rotación técnica', category: 'Aprendizaje', detail: 'Conocés luces, sonido y utilería para anticiparte a todo.' },
		],
		producer: [
			{ title: 'Carpeta de proyecto', category: 'Preproducción', detail: 'Convertís una idea en algo que se pueda defender.' },
			{ title: 'Búsqueda de financiamiento', category: 'Gestión', detail: 'Golpeás puertas hasta conseguir una oportunidad.' },
		],
	};

	const developmentChoicePools: Record<Profession, Choice[]> = {
		actor: [
			simulationEvents.actor.choices[0],
			makeChoice('Subir de peso para un papel', 'Seguís un plan intenso para llegar al cuerpo que pide un personaje que todavía no sabés si va a existir.', '🍝', 'TRANSFORMACIÓN', { chance: 63, label: '+7 nivel · el papel te ve distinto', levelDelta: 7, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 37, label: '-3 nivel · el cuerpo pasa factura', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
			makeChoice('Bajar de peso con un coach', 'Entrenás con cuidado, descanso y una meta clara para no convertir la transformación en una apuesta ciega.', '🥗', 'DISCIPLINA', { chance: 71, label: '+6 nivel · llegás preparado', levelDelta: 6, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 29, label: '-2 nivel · te pasás de exigencia', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Volver al teatro', 'Aceptás una sala chica, un texto difícil y ocho funciones por semana para recuperar el músculo de actuar en vivo.', '🎟️', 'ESCENA', { chance: 68, label: '+8 nivel · el escenario te afila', levelDelta: 8, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 32, label: '+1 nivel · poco público, mucha práctica', levelDelta: 1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -1 }),
			simulationEvents.actor.choices[1],
		],
		director: [
			simulationEvents.director.choices[0],
			makeChoice('Estudiar montaje', 'Te sentás frente a horas de material y descubrís que una película también se dirige después del rodaje.', '✂️', 'MONTAJE', { chance: 73, label: '+7 nivel · encontrás el ritmo', levelDelta: 7, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 27, label: '-1 nivel · demasiadas versiones', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Observar a una directora', 'Pasás meses mirando cómo otra persona habla con el equipo, cuida la escena y toma decisiones bajo presión.', '👁️', 'MENTORÍA', { chance: 69, label: '+6 nivel · aprendés mirando', levelDelta: 6, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 31, label: 'Sin cambio · todavía falta rodaje', levelDelta: 0, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			simulationEvents.director.choices[1],
		],
		assistant: [
			simulationEvents.assistant.choices[0],
			makeChoice('Aprender luces y sonido', 'Te quedás después de hora con los equipos para entender qué puede salvar una jornada complicada.', '💡', 'TÉCNICA', { chance: 74, label: '+7 nivel · resolvés antes de llamar', levelDelta: 7, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 26, label: '-1 nivel · demasiados cables', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Ordenar call sheets', 'Convertís un montón de mensajes cruzados en una jornada que el equipo puede entender de un vistazo.', '📋', 'LOGÍSTICA', { chance: 79, label: '+6 nivel · el set te necesita', levelDelta: 6, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 8 }, { chance: 21, label: '-2 nivel · se te escapa un horario', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			simulationEvents.assistant.choices[1],
		],
		producer: [
			simulationEvents.producer.choices[0],
			makeChoice('Estudiar presupuesto', 'Aprendés a distinguir una idea cara de una idea imposible y empezás a hacer que los números cuenten una historia.', '🧮', 'GESTIÓN', { chance: 72, label: '+7 nivel · el proyecto cierra', levelDelta: 7, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 28, label: '-1 nivel · faltan cuentas', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Armar un dossier', 'Reunís sinopsis, presupuesto y referencias para que una idea chiquita pueda tocar una puerta grande.', '📚', 'PRESENTACIÓN', { chance: 67, label: '+8 nivel · alguien dice que sí', levelDelta: 8, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 33, label: '-2 nivel · queda en el cajón', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			simulationEvents.producer.choices[1],
		],
	};

	const additionalCareerEvents: CareerEvent[] = [
		makeEvent('SELF-TAPE', 'La audición en vertical', 'El casting pide una escena, un plano secuencia y que no se escuche el colectivo que pasa por tu ventana.', [
			makeChoice('Filmar de una', 'Una toma honesta, con el living dado vuelta y toda tu energía.', '📱', 'AUTÉNTICO', { chance: 64, label: '+4 nivel · te piden otra escena', levelDelta: 4, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 5 }, { chance: 36, label: 'Sin cambio · el audio traiciona', levelDelta: 0, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Editar hasta la madrugada', 'Música, corrección de color y una mirada que parece de festival.', '💻', 'PERFECCIÓN', { chance: 51, label: '+7 nivel · el video circula', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 49, label: '-2 nivel · se nota demasiado el truco', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Mandar una versión rara', 'No seguís la consigna: convertís la audición en una mini película.', '🪄', 'APUESTA', { chance: 43, label: '+9 nivel · te recuerdan', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 57, label: '-1 nivel · no entienden nada', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
		]),
		makeEvent('ELENCO', 'La química con tu compañera', 'El director cambia la escena el día del rodaje. La magia puede aparecer o pedir ensayo de emergencia.', [
			makeChoice('Ensayar hasta que duela', 'Repetís la escena en el pasillo hasta que los dos respiran al mismo tiempo.', '🤝', 'PREPARACIÓN', { chance: 72, label: '+6 nivel · escena inolvidable', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 28, label: '-1 nivel · se vuelve mecánica', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Improvisar', 'Soltás el texto y te agarrás de lo que acaba de pasar frente a cámara.', '🎲', 'QUÍMICA', { chance: 57, label: '+8 nivel · el plano no se corta', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 43, label: '-2 nivel · se pierde el tono', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Pedir cambiar la escena', 'Proponés otra versión para que ambos personajes tengan algo que perder.', '📝', 'CRITERIO', { chance: 61, label: '+5 nivel · el director te escucha', levelDelta: 5, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 5 }, { chance: 39, label: '-1 nivel · llegás como difícil', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
		]),
		makeEvent('GUION', 'Aparece una reescritura', 'La escena que te había enamorado desaparece. El nuevo texto es más chico, pero tiene un filo inesperado.', [
			makeChoice('Defender la escena original', 'Llamás al guionista y encontrás una forma de recuperar el corazón del personaje.', '📖', 'DEFENSA', { chance: 54, label: '+6 nivel · vuelve la escena', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 5 }, { chance: 46, label: '-2 nivel · te quedás afuera', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
			makeChoice('Aceptar el desafío', 'Tomás el texto nuevo como si siempre hubiera sido el plan.', '🧠', 'ADAPTACIÓN', { chance: 68, label: '+7 nivel · descubrís otra voz', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 32, label: '+1 película · queda correcto', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			makeChoice('Proponer una tercera versión', 'Escribís de noche y llegás con páginas llenas de tachones.', '✍️', 'AUTORÍA', { chance: 45, label: '+10 nivel · te dan una voz', levelDelta: 10, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'mar-del-plata' }, { chance: 55, label: '-3 nivel · demasiadas notas', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -7 }),
		]),
		makeEvent('RODAJE', 'La cámara decide no colaborar', 'La toma es perfecta y el equipo técnico anuncia que el archivo quedó corrupto. Hay que elegir cómo seguir.', [
			makeChoice('Repetir todo', 'Volvés a la marca, al clima y a la emoción sin que nadie se queje.', '🔁', 'OFICIO', { chance: 70, label: '+4 nivel · segunda toma mejor', levelDelta: 4, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: 5 }, { chance: 30, label: '-2 nivel · la energía se va', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Cambiar la puesta', 'Usás el accidente para acercar la cámara y volver la escena más íntima.', '🎥', 'INVENCIÓN', { chance: 63, label: '+7 nivel · el accidente suma', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 37, label: '-1 nivel · el plano se desarma', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Filmar con el celular', 'El equipo se ríe, pero la escena sucede antes de que vuelva la luz.', '📹', 'GUERRILLA', { chance: 48, label: '+8 nivel · queda material de culto', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 52, label: '-2 nivel · imagen imposible', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
		]),
		makeEvent('PRESUPUESTO', 'Se acabó la plata', 'El rodaje tiene dos días menos y una escena de lluvia que nadie quiere perder.', [
			makeChoice('Reducir la escena', 'Convertís una multitud en dos personas y un fuera de campo bien puesto.', '✂️', 'ECONOMÍA', { chance: 66, label: '+5 nivel · menos es más', levelDelta: 5, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 6 }, { chance: 34, label: '-1 nivel · queda apurado', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Poner tus ahorros', 'Arriesgás el alquiler por una secuencia que puede levantar toda la película.', '💸', 'CORAZÓN', { chance: 49, label: '+9 nivel · la apuesta funciona', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'goya' }, { chance: 51, label: '-4 nivel · el agujero crece', levelDelta: -4, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -8 }),
			makeChoice('Convocar al barrio', 'Una cadena de favores llena el set de manos, comida y gente con ganas.', '🏘️', 'COMUNIDAD', { chance: 74, label: '+6 nivel · película colectiva', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 26, label: 'Sin cambio · muchas opiniones', levelDelta: 0, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -1 }),
		]),
		makeEvent('COMPETENCIA', 'Otra persona quiere tu lugar', 'El casting final queda entre dos. La decisión no es sólo actuar: también es cómo querés entrar a la sala.', [
			makeChoice('Competir con todo', 'Llegás preparado, ocupás el espacio y dejás la escena servida.', '⚔️', 'AMBICIÓN', { chance: 58, label: '+7 nivel · te quedás con el papel', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 42, label: '-2 nivel · te gana el nervio', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
			makeChoice('Compartir la escena', 'Proponés que hagan la prueba juntos y la rivalidad se transforma en energía.', '🫶', 'EQUIPO', { chance: 69, label: '+5 nivel · ganás por generosidad', levelDelta: 5, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 6 }, { chance: 31, label: '+1 película · te vuelven secundario', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			makeChoice('Retirarte del casting', 'Decidís que ese proyecto no tiene nada que ver con vos.', '🚪', 'LÍMITES', { chance: 44, label: '+4 nivel · te llaman para otra cosa', levelDelta: 4, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: 8 }, { chance: 56, label: '-3 nivel · desaparece la oportunidad', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -8 }),
		]),
		makeEvent('CAMBIO DE TONO', 'La comedia te encuentra', 'Después de un drama intenso, aparece un papel ridículo que puede abrirte otra puerta.', [
			makeChoice('Abrazar el ridículo', 'Una peluca imposible y un timing preciso: no te guardás nada.', '🤣', 'COMEDIA', { chance: 66, label: '+6 nivel · descubrís tu timing', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 34, label: '-1 nivel · el chiste no aterriza', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Mantener el drama', 'Jugás la escena como si el absurdo escondiera una tragedia enorme.', '🎭', 'CONTRASTE', { chance: 59, label: '+8 nivel · crítica fascinada', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 41, label: '-2 nivel · nadie sabe cómo leerlo', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Negociar un personaje nuevo', 'No querés ser el chiste: querés ser quien lo provoca.', '🃏', 'REESCRITURA', { chance: 52, label: '+7 nivel · papel revelación', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 48, label: '-1 nivel · no hay tiempo', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
		]),
		makeEvent('ACCIÓN', 'El entrenamiento empieza mañana', 'La superproducción pide cuerpo, precisión y una escena que no perdona improvisaciones peligrosas.', [
			makeChoice('Entrenar seis meses', 'Aprendés la coreografía hasta que parece espontánea.', '🥊', 'DISCIPLINA', { chance: 75, label: '+8 nivel · presencia de estrella', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 25, label: '-2 nivel · te pasás de intensidad', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Usar doble de riesgo', 'Cuidás el cuerpo y dejás que el equipo haga lo que sabe hacer.', '🪖', 'CUIDADO', { chance: 67, label: '+5 nivel · rodaje seguro', levelDelta: 5, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: 6 }, { chance: 33, label: '+1 película · falta presencia', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			makeChoice('Cambiar la escena', 'Proponés tensión y mirada en lugar de explosiones.', '💥', 'VISIÓN', { chance: 54, label: '+9 nivel · acción con identidad', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 46, label: '-3 nivel · el estudio se asusta', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
		]),
		makeEvent('MALA PRENSA', 'Una crítica te pega donde duele', 'El estreno recibe una frase cruel que empieza a repetirse en todas las redes.', [
			makeChoice('Responder', 'Escribís un hilo largo y sincero sobre lo que intentaron hacer.', '💬', 'EXPOSICIÓN', { chance: 51, label: '+5 nivel · el público te banca', levelDelta: 5, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 6 }, { chance: 49, label: '-2 nivel · la discusión crece', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -7 }),
			makeChoice('No leer nada', 'Apagás el teléfono y volvés al próximo guion.', '🧘', 'FOCO', { chance: 68, label: '+6 nivel · seguís trabajando', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 32, label: '-1 nivel · te queda dando vueltas', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Convertirla en combustible', 'Elegís el proyecto más arriesgado que te ofrecen.', '🔥', 'VENGANZA', { chance: 47, label: '+10 nivel · respuesta en pantalla', levelDelta: 10, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'cannes' }, { chance: 53, label: '-2 nivel · presión innecesaria', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
		]),
		makeEvent('MENTOR', 'Una figura enorme te aconseja', 'En un pasillo, alguien que admirás te dice una frase que puede cambiar la forma de mirar tu oficio.', [
			makeChoice('Preguntar todo', 'Te quedás una hora escuchando historias de rodajes imposibles.', '👂', 'CURIOSIDAD', { chance: 71, label: '+6 nivel · aprendés un atajo', levelDelta: 6, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 1, luckDelta: 8 }, { chance: 29, label: 'Sin cambio · demasiados consejos', levelDelta: 0, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -1 }),
			makeChoice('Pedir una recomendación', 'El teléfono de esa persona puede abrir una puerta enorme.', '☎️', 'CONTACTO', { chance: 55, label: '+8 nivel · llega el llamado', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 9 }, { chance: 45, label: '-1 nivel · todavía no es tu momento', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Seguir tu intuición', 'Agradecés y te quedás con tu propia brújula.', '🧭', 'IDENTIDAD', { chance: 63, label: '+7 nivel · encontrás tu método', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 37, label: '-2 nivel · das una vuelta de más', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
		]),
		makeEvent('CONFLICTO', 'El equipo se divide', 'Dos cabezas del rodaje quieren películas distintas. Alguien tiene que hacer que el día siga.', [
			makeChoice('Medir las dos ideas', 'Armás una prueba de cámara para que la escena decida.', '⚖️', 'MEDIACIÓN', { chance: 69, label: '+6 nivel · aparece un plan', levelDelta: 6, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 6 }, { chance: 31, label: '-1 nivel · nadie cede', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Tomar partido', 'Elegís una visión y te hacés cargo de las consecuencias.', '🎯', 'DECISIÓN', { chance: 58, label: '+8 nivel · la película encuentra rumbo', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 7 }, { chance: 42, label: '-3 nivel · se rompe el clima', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -7 }),
			makeChoice('Pedir un día de pausa', 'Cortás la discusión antes de que el set se vuelva irreparable.', '⏸️', 'TEMPLE', { chance: 62, label: '+5 nivel · vuelven las ganas', levelDelta: 5, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: 6 }, { chance: 38, label: '-2 nivel · el calendario castiga', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
		]),
		makeEvent('RESHOOT', 'Hay que volver a filmar', 'La película está casi terminada, pero el final no convence a nadie. El estreno ya tiene fecha.', [
			makeChoice('Pelear por el final', 'Volvés al set aunque todos tengan la valija hecha.', '🛠️', 'EXIGENCIA', { chance: 65, label: '+8 nivel · cierre memorable', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 35, label: '-2 nivel · el remedio empeora', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Dejarlo como está', 'Confiás en que la película ya encontró su forma.', '🧩', 'CONFIANZA', { chance: 57, label: '+5 nivel · el público completa el final', levelDelta: 5, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 6 }, { chance: 43, label: '-1 nivel · queda gusto a poco', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Cambiarlo por completo', 'Tirás el final y proponés una última escena sin explicación.', '🌋', 'TODO O NADA', { chance: 46, label: '+11 nivel · golpe de autor', levelDelta: 11, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'cannes' }, { chance: 54, label: '-4 nivel · el estudio entra en pánico', levelDelta: -4, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -8 }),
		]),
		makeEvent('STREAMING', 'La película llega a todo el mundo', 'Una plataforma compra el proyecto. La audiencia crece, pero ahora cada decisión se discute en diez idiomas.', [
			makeChoice('Aceptar la gira digital', 'Entrevistas remotas, horarios imposibles y una sonrisa internacional.', '🌐', 'ALCANCE', { chance: 66, label: '+7 nivel · te conoce medio mundo', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 8 }, { chance: 34, label: '-2 nivel · te quema la exposición', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
			makeChoice('Cuidar el misterio', 'Dejás que la película hable y aparecés sólo cuando suma.', '🕯️', 'MISTERIO', { chance: 52, label: '+9 nivel · culto instantáneo', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8, award: 'golden-globe' }, { chance: 48, label: '+1 película · poca conversación', levelDelta: 1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Negociar el corte final', 'Pedís que el proyecto conserve su acento y sus silencios.', '✂️', 'CONTROL', { chance: 59, label: '+6 nivel · tu voz queda', levelDelta: 6, filmsDelta: 0, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 41, label: '-3 nivel · te sacan del trato', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -7 }),
		]),
		makeEvent('VIRAL', 'Una escena explota en redes', 'La gente repite un gesto tuyo. Por una semana, todo el mundo parece conocer ese personaje.', [
			makeChoice('Hacer un vivo', 'Te reís de vos mismo y convertís el momento en encuentro.', '📲', 'CERCANÍA', { chance: 61, label: '+5 nivel · público fiel', levelDelta: 5, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: 7 }, { chance: 39, label: '-1 nivel · el algoritmo cambia', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Proteger al personaje', 'No lo explicás: lo dejás vivir en la imaginación de la gente.', '🫥', 'DISTANCIA', { chance: 56, label: '+7 nivel · misterio bien usado', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 44, label: 'Sin cambio · pasa la ola', levelDelta: 0, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			makeChoice('Usarlo para financiar la próxima', 'Convertís la atención en una película más chica y más tuya.', '🚀', 'IMPULSO', { chance: 48, label: '+10 nivel · independencia total', levelDelta: 10, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'mar-del-plata' }, { chance: 52, label: '-3 nivel · no alcanza la plata', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -7 }),
		]),
		makeEvent('JURADO', 'Te toca elegir una película', 'El festival te invita a integrar un jurado. Mirás cientos de películas y recordás qué te trajo hasta acá.', [
			makeChoice('Premiar el riesgo', 'Elegís la película que se anima a fallar de una manera nueva.', '🌴', 'VALENTÍA', { chance: 64, label: '+6 nivel · respeto de la crítica', levelDelta: 6, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 1, luckDelta: 8 }, { chance: 36, label: '-1 nivel · te acusan de snob', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Premiar al público', 'Te inclinás por la película que hizo reír y llorar a la sala entera.', '👏', 'POPULAR', { chance: 70, label: '+5 nivel · te quieren en todas partes', levelDelta: 5, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 1, luckDelta: 7 }, { chance: 30, label: 'Sin cambio · decisión discutida', levelDelta: 0, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -2 }),
			makeChoice('Abstenerte y volver al set', 'Preferís filmar antes que explicar por qué una película es mejor que otra.', '🎬', 'OFICIO', { chance: 58, label: '+8 nivel · el próximo papel llega', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 8 }, { chance: 42, label: '-2 nivel · perdés una vidriera', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
		]),
		makeEvent('BLOCKBUSTER', 'El estudio ofrece una franquicia', 'Hay explosiones, contrato por tres películas y una cláusula que dice que no podés cambiar el peinado.', [
			makeChoice('Firmar las tres', 'La seguridad paga las cuentas y también puede construir una leyenda.', '🧨', 'ESCALA', { chance: 68, label: '+7 nivel · nombre global', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 32, label: '-2 nivel · quedás encasillado', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
			makeChoice('Pedir una película entre medio', 'Te reservás una historia pequeña para no perder el pulso.', '🪶', 'EQUILIBRIO', { chance: 63, label: '+8 nivel · dos públicos te siguen', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 37, label: '-1 nivel · el estudio duda', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
			makeChoice('Rechazar y filmar en el barrio', 'La plata es otra, pero la historia te devuelve la voz.', '🏠', 'RAÍCES', { chance: 51, label: '+10 nivel · película de culto', levelDelta: 10, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'cannes' }, { chance: 49, label: '-3 nivel · te olvidan por un rato', levelDelta: -3, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
		]),
		makeEvent('LEGADO', 'Una escuela lleva tu nombre', 'Una nueva generación te invita a hablar del oficio. La charla puede ser un discurso o una puerta.', [
			makeChoice('Dar una clase', 'Mostrás cómo una escena puede empezar con una pregunta simple.', '🏫', 'OFICIO', { chance: 72, label: '+5 nivel · nace otra mirada', levelDelta: 5, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 1, luckDelta: 7 }, { chance: 28, label: 'Sin cambio · nadie trajo mate', levelDelta: 0, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -1 }),
			makeChoice('Buscar talento nuevo', 'Te sentás en el fondo y dejás que otra persona sorprenda a todos.', '🌱', 'FUTURO', { chance: 64, label: '+7 nivel · tu legado crece', levelDelta: 7, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 1, luckDelta: 8, award: 'goya' }, { chance: 36, label: '-1 nivel · no aparece la chispa', levelDelta: -1, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
			makeChoice('Volver a empezar', 'Te anotás en un taller para recordar cómo se siente no saber.', '🔁', 'HUMILDAD', { chance: 55, label: '+9 nivel · recuperás el hambre', levelDelta: 9, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 9 }, { chance: 45, label: '-2 nivel · la nostalgia pesa', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
		]),
	];

	const professionCareerEvents: Record<Profession, CareerEvent[]> = {
		actor: [
			makeEvent('RAMA ACTORAL', 'El monólogo sin red', 'La escena llega sin cortes y el silencio del estudio parece más grande que el decorado.', [
				makeChoice('Dejar que tiemble la voz', 'No escondés el nervio: lo convertís en parte del personaje.', '🎙️', 'VERDAD', { chance: 69, label: '+8 nivel · actuación que queda', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 31, label: '-1 nivel · el silencio te gana', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
				makeChoice('Pedir otra toma', 'Respirás, volvés a la marca y buscás una verdad distinta.', '🔄', 'PRECISIÓN', { chance: 74, label: '+6 nivel · segunda toma perfecta', levelDelta: 6, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 0, luckDelta: 6 }, { chance: 26, label: '-2 nivel · el momento se escapa', levelDelta: -2, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
				makeChoice('Improvisar el final', 'Una palabra nueva cambia la escena y también cambia tu relación con el director.', '⚡', 'INSTINTO', { chance: 52, label: '+10 nivel · robás la escena', levelDelta: 10, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 9, award: 'mar-del-plata' }, { chance: 48, label: '-3 nivel · te vas de tono', levelDelta: -3, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
			]),
		],
		director: [
			makeEvent('RAMA DE DIRECCIÓN', 'Tu primer plano imposible', 'El equipo mira el storyboard. Hay una hora de luz y una idea que necesita tres cámaras.', [
				makeChoice('Reducir la idea', 'Encontrás el plano esencial y lo filmás antes de que caiga la tarde.', '🎞️', 'SÍNTESIS', { chance: 72, label: '+7 nivel · mirada propia', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 28, label: '-1 nivel · queda demasiado simple', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -4 }),
				makeChoice('Pedir una hora extra', 'Convencés al equipo de quedarse y defendés la escena completa.', '🕰️', 'VISIÓN', { chance: 56, label: '+10 nivel · plano de festival', levelDelta: 10, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8, award: 'cannes' }, { chance: 44, label: '-3 nivel · la luz se va', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -7 }),
				makeChoice('Cambiar de locación', 'Movés a todo el equipo a una terraza que nadie había visto.', '🗺️', 'PULSO', { chance: 63, label: '+8 nivel · aparece una película nueva', levelDelta: 8, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 8 }, { chance: 37, label: '-2 nivel · el plan se desordena', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
			]),
		],
		assistant: [
			makeEvent('RAMA DE ASISTENCIA', 'El día se queda sin plan', 'El call sheet tiene tres versiones y nadie sabe cuál es la correcta. El rodaje empieza en diez minutos.', [
				makeChoice('Ordenar el caos', 'Llamás, imprimís y pegás la jornada en la puerta del set.', '📋', 'CONTROL', { chance: 78, label: '+6 nivel · el set respira', levelDelta: 6, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: 8 }, { chance: 22, label: '-1 nivel · falta alguien clave', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
				makeChoice('Improvisar un nuevo orden', 'Rearmás la jornada alrededor de la actriz que está enferma.', '🔧', 'ADAPTACIÓN', { chance: 66, label: '+8 nivel · salvás la película', levelDelta: 8, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 8 }, { chance: 34, label: '-2 nivel · se corre todo', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
				makeChoice('Pedir que paren', 'Frenás el set para que el equipo no pague el apuro con el cuerpo.', '🛑', 'CUIDADO', { chance: 59, label: '+7 nivel · ganás respeto', levelDelta: 7, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 1, luckDelta: 7 }, { chance: 41, label: '-3 nivel · producción se enoja', levelDelta: -3, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -6 }),
			]),
		],
		producer: [
			makeEvent('RAMA DE PRODUCCIÓN', 'Hay que levantar la película', 'El guion está listo, el equipo también, pero falta el dinero que convierte una idea en rodaje.', [
				makeChoice('Ir puerta por puerta', 'Mostrás el proyecto a quien quiera escuchar durante toda la semana.', '🚪', 'PERSISTENCIA', { chance: 64, label: '+8 nivel · aparece un aliado', levelDelta: 8, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 1, luckDelta: 9 }, { chance: 36, label: '-2 nivel · te piden otra película', levelDelta: -2, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -5 }),
				makeChoice('Recortar para filmar ya', 'Sacás lo imposible y cuidás lo que hace única a la historia.', '✂️', 'INGENIO', { chance: 73, label: '+7 nivel · película viva', levelDelta: 7, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 7 }, { chance: 27, label: '-1 nivel · presupuesto demasiado chico', levelDelta: -1, filmsDelta: 1, leadsDelta: 0, nominationsDelta: 0, luckDelta: -3 }),
				makeChoice('Cerrar una coproducción', 'Abrís la puerta internacional sin perder el corazón local.', '🌍', 'ESCALA', { chance: 51, label: '+11 nivel · salto internacional', levelDelta: 11, filmsDelta: 1, leadsDelta: 1, nominationsDelta: 1, luckDelta: 10, award: 'goya' }, { chance: 49, label: '-4 nivel · demasiadas condiciones', levelDelta: -4, filmsDelta: 0, leadsDelta: 0, nominationsDelta: 0, luckDelta: -8 }),
			]),
		],
	};

	const careerEventBank: CareerEvent[] = [...careerEvents, ...additionalCareerEvents];

	function getEventBank(currentState: CareerState): CareerEvent[] {
		return [careerEventBank[0], ...professionCareerEvents[currentState.profession], ...careerEventBank.slice(1)];
	}

	function getVisibleChoices(event: CareerEvent): Choice[] {
		return event.choices.slice(0, 2).map(normalizeChoiceRisk);
	}

	function withLevelLabel(outcome: Outcome, levelDelta: number): Outcome {
		const levelPrefix = `${levelDelta > 0 ? '+' : ''}${levelDelta} nivel`;
		const label = /^[-+]?\d+\s+nivel/i.test(outcome.label)
			? outcome.label.replace(/^[-+]?\d+\s+nivel/i, levelPrefix)
			: `${levelPrefix} · ${outcome.label}`;
		return { ...outcome, levelDelta, label };
	}

	function normalizeChoiceRisk(choice: Choice): Choice {
		const failure = choice.outcomes[1];
		if (!failure || failure.levelDelta < 0) return choice;
		return {
			...choice,
			outcomes: [choice.outcomes[0], withLevelLabel(failure, -1)],
		};
	}

	function getDevelopmentInterval(): number {
		return 1 + Math.floor(Math.random() * 3);
	}

	function getUsedMovieSlugs(currentState: CareerState): Set<string> {
		return new Set(currentState.history.flatMap((entry) => (entry.movie?.slug ? [entry.movie.slug] : [])));
	}

	function hasExactMovieAvailable(currentState: CareerState): boolean {
		const careerYear = getCareerYear(currentState);
		const usedSlugs = getUsedMovieSlugs(currentState);
		return movieCatalog.some((movie) => movie.year === careerYear && !usedSlugs.has(movie.slug));
	}

	function shouldShowDevelopment(currentState: CareerState): boolean {
		const isFinalTurn = currentState.currentIndex >= currentState.ages.length - 1;
		return !isFinalTurn && hasExactMovieAvailable(currentState) && currentState.moviesSinceDevelopment >= currentState.nextDevelopmentAfter;
	}

	function getDevelopmentChoice(currentState: CareerState): Choice {
		const choices = developmentChoicePools[currentState.profession];
		return normalizeChoiceRisk(choices[hashText(`${currentState.name}-${currentState.birthYear}-${currentState.currentIndex}`) % choices.length]);
	}

	function getMixedCareerEvent(currentState: CareerState, baseEvent: CareerEvent): CareerEvent {
		const movieChoice = getVisibleChoices(baseEvent)[0] ?? simulationEvents[currentState.profession].choices[0];
		return {
			kicker: 'GIRO DE CARRERA',
			title: '¿Rodaje o preparación?',
			copy: 'Hay una película del año exacto, pero también podés invertir en tu oficio. Una buena carrera necesita elegir cuándo exponerse y cuándo crecer.',
			choices: [getDevelopmentChoice(currentState), movieChoice],
			mixed: true,
		};
	}

	function getCurrentEvent(currentState: CareerState): CareerEvent {
		const isFinalTurn = currentState.currentIndex >= currentState.ages.length - 1;
		const eventBank = getEventBank(currentState);
		const baseEvent = isFinalTurn ? finalEvent : eventBank[currentState.currentIndex % eventBank.length];
		if (!isFinalTurn && !hasExactMovieAvailable(currentState)) return simulationEvents[currentState.profession];
		return shouldShowDevelopment(currentState) ? getMixedCareerEvent(currentState, baseEvent) : baseEvent;
	}

	let selectedDifficulty: Difficulty = 'normal';
	let selectedCountry = { code: 'AR', name: 'Argentina', flag: 'ar.svg' };
	let selectedGender: Gender = 'masculino';
	let selectedProfession: Profession = 'actor';
	let selectedProfile: Profile = 'camaleonico';
	let state: CareerState | null = null;
	let transitionTimer: number | undefined;

	function query<T extends Element>(selector: string): T | null {
		return root?.querySelector<T>(selector) ?? null;
	}

	function escapeHtml(value: string): string {
		return value.replace(/[&<>'"]/g, (character) => {
			const replacements: Record<string, string> = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;',
			};
			return replacements[character] ?? character;
		});
	}

	function countryFlagUrl(flagAsset: string): string {
		return `${assetBase}images/flags/${flagAsset}`;
	}

	function updateCountryBadge(container: HTMLElement | null, flagAsset: string, code: string): void {
		if (!container) return;
		const image = container.querySelector<HTMLImageElement>('[data-country-flag-image]');
		const codeElement = container.querySelector<HTMLElement>('[data-country-code]');
		if (image) image.src = countryFlagUrl(flagAsset);
		if (codeElement) codeElement.textContent = code;
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}

	function getCareerAges(birthYear: number, difficulty: Difficulty): number[] {
		const config = difficultyConfig[difficulty];
		const endAge = Math.min(config.maxAge, currentYear - birthYear);
		const ages: number[] = [];
		for (let age = 18; age <= endAge; age += config.step) {
			ages.push(age);
		}
		if (ages.at(-1) !== endAge) {
			ages.push(endAge);
		}
		return ages;
	}

	function getCareerYear(currentState: CareerState, index = currentState.currentIndex): number {
		const age = currentState.ages[Math.min(index, currentState.ages.length - 1)] ?? 18;
		return currentState.birthYear + age;
	}

	function formatCachet(currentState: CareerState): string {
		const amount = Math.round(70 + currentState.level * 14 + currentState.films * 16 + currentState.awards.length * 65);
		if (amount >= 1000) {
			return `US$${(amount / 1000).toFixed(1)}M`;
		}
		return `US$${amount}K`;
	}

	function getCareerLevelCeiling(currentState: CareerState, index: number): number {
		const config = difficultyConfig[currentState.difficulty];
		const finalIndex = Math.max(1, currentState.ages.length - 1);
		const progress = clamp(index / finalIndex, 0, 1);
		const peakProgress = 0.52;
		if (progress <= peakProgress) {
			const rise = Math.pow(progress / peakProgress, 0.84);
			return Math.round(54 + (config.peakLevel - 54) * rise);
		}

		const decline = Math.pow((progress - peakProgress) / (1 - peakProgress), 0.9);
		return Math.round(config.peakLevel - (config.peakLevel - config.retirementLevel) * decline);
	}

	function getSummaryTier(currentState: CareerState): SummaryTier {
		const reachedTheTop = currentState.peakLevel >= 84 && (currentState.awards.length >= 2 || currentState.nominations >= 3);
		if (reachedTheTop) return 'superstar';

		const endedInRuin = currentState.level <= 36 || (currentState.level <= 44 && currentState.luck <= 30) || (currentState.films <= 2 && currentState.leads === 0 && currentState.luck <= 35);
		return endedInRuin ? 'ruin' : 'mediocre';
	}

	function outcomeTone(outcome: Outcome): string {
		const score = outcome.levelDelta + outcome.filmsDelta + outcome.leadsDelta + outcome.nominationsDelta * 2 + (outcome.award ? 4 : 0);
		return outcome.levelDelta < 0 || score < 0 ? ' actor-choice-card__outcome--negative' : score > 0 ? ' actor-choice-card__outcome--positive' : '';
	}

	function normalizeMovieText(movie: MovieOffer): string {
		return [movie.title, movie.category, ...movie.genres].join(' ').toLocaleLowerCase('es-AR');
	}

	function hashText(value: string): number {
		let hash = 0;
		for (let index = 0; index < value.length; index += 1) {
			hash = (hash << 5) - hash + value.charCodeAt(index);
			hash |= 0;
		}
		return Math.abs(hash);
	}

	function getMovieMatchScore(movie: MovieOffer, currentState: CareerState, targetYear: number): number {
		const styleTokens: Record<Profile, string[]> = {
			camaleonico: [],
			drama: ['drama', 'thriller', 'crimen', 'biograf'],
			comedia: ['comedia', 'romance', 'aventura'],
			accion: ['accion', 'aventura', 'superheroe', 'thriller'],
		};
		const movieText = normalizeMovieText(movie);
		const styleScore = styleTokens[currentState.profile].filter((token) => movieText.includes(token)).length * 12;
		const countryScore = currentState.countryCode === 'AR' && movie.isArgentinian ? 8 : 0;
		const awardScore = movie.awardTypes.length > 0 ? 3 : 0;
		const yearDistance = Math.abs(movie.year - targetYear);
		const freshnessScore = Math.max(0, 18 - yearDistance);
		const professionScore = currentState.profession === 'producer' && movie.isArgentinian ? 5 : currentState.profession === 'director' && movie.genres.some((genre) => genre.toLocaleLowerCase('es-AR').includes('drama')) ? 4 : 0;
		return styleScore + countryScore + awardScore + freshnessScore + professionScore + (hashText(`${movie.slug}-${currentState.currentIndex}`) % 100) / 100;
	}

	function getSimulationOffer(currentState: CareerState, choiceIndex: number): SimulationOffer {
		const definitions = simulationOfferDefinitions[currentState.profession];
		const definition = definitions[choiceIndex % definitions.length];
		return {
			slug: `simulacion-${currentState.profession}-${currentState.currentIndex}-${choiceIndex}`,
			title: definition.title,
			year: getCareerYear(currentState),
			posterUrl: `${assetBase}posters/poster-no-disponible.svg`,
			category: definition.category,
			detail: definition.detail,
		};
	}

	function getDevelopmentOffer(currentState: CareerState, choice: Choice): SimulationOffer {
		return {
			slug: `evento-${currentState.profession}-${currentState.currentIndex}-${hashText(choice.label)}`,
			title: choice.label,
			year: getCareerYear(currentState),
			posterUrl: `${assetBase}posters/poster-no-disponible.svg`,
			category: 'Desarrollo',
			detail: 'Evento de oficio · la suerte define cuánto crece tu carrera.',
		};
	}

	function getOfferChoices(currentState: CareerState, event: CareerEvent): OfferChoice[] {
		const careerYear = getCareerYear(currentState);
		const usedSlugs = getUsedMovieSlugs(currentState);
		const exactYearMovies = movieCatalog
			.filter((movie) => movie.year === careerYear && !usedSlugs.has(movie.slug))
			.sort((left, right) => getMovieMatchScore(right, currentState, careerYear) - getMovieMatchScore(left, currentState, careerYear));
		if (event.mixed) {
			const developmentChoice = event.choices[0] ?? simulationEvents[currentState.profession].choices[0];
			const movieChoice = event.choices[1] ?? simulationEvents[currentState.profession].choices[0];
			const choices: OfferChoice[] = [{ choice: developmentChoice, kind: 'event', simulation: getDevelopmentOffer(currentState, developmentChoice) }];
			const movie = exactYearMovies[0];
			choices.push(movie ? { choice: movieChoice, kind: 'movie', movie } : { choice: movieChoice, kind: 'event', simulation: getSimulationOffer(currentState, 0) });
			return choices;
		}
		return getVisibleChoices(event).map((choice, choiceIndex) => {
			const movie = exactYearMovies[choiceIndex];
			return movie ? { choice, kind: 'movie', movie } : { choice, kind: 'event', simulation: getSimulationOffer(currentState, choiceIndex) };
		});
	}

	function getProfessionAction(currentState: CareerState, choiceIndex: number): string {
		const progress = currentState.currentIndex / Math.max(1, currentState.ages.length - 1);
		const stage = progress < 0.34 ? 'early' : progress < 0.72 ? 'middle' : 'late';
		const feminine = currentState.gender === 'femenino';
		const actions: Record<Profession, Record<'early' | 'middle' | 'late', string[]>> = {
			actor: {
				early: feminine ? ['Hacer de extra', 'Tercera actriz de reparto', 'Papel mínimo'] : ['Hacer de extra', 'Tercer actor de reparto', 'Papel mínimo'],
				middle: ['Actuar de reparto', 'Papel secundario', 'Coprotagonizar'],
				late: ['Protagonizar', 'Encabezar el elenco', 'Papel principal'],
			},
			director: {
				early: ['Asistir el rodaje', 'Ser segunda unidad', 'Filmar una escena'],
				middle: ['Dirigir una unidad', 'Codirigir', 'Dirigir un corto'],
				late: ['Dirigir el largometraje', feminine ? 'Ser autora de la película' : 'Ser autor de la película', 'Dirigir una producción'],
			},
			assistant: {
				early: ['Ser auxiliar de set', 'Dar una mano en producción', 'Asistir el rodaje'],
				middle: ['Coordinar el set', 'Llevar un equipo', 'Supervisar una unidad'],
				late: ['Encabezar el set', 'Coordinar el rodaje', 'Supervisar la producción'],
			},
			producer: {
				early: ['Asistir producción', 'Armar el presupuesto', 'Conseguir el rodaje'],
				middle: ['Cerrar el proyecto', 'Coproducir', 'Levantar la película'],
				late: ['Producir la película', feminine ? 'Ser productora ejecutiva' : 'Ser productor ejecutivo', 'Liderar la producción'],
			},
		};
		return actions[currentState.profession][stage][choiceIndex % actions[currentState.profession][stage].length];
	}

	function showView(viewName: string): void {
		views.forEach((view) => {
			view.hidden = view.dataset.view !== viewName;
		});
		window.scrollTo({ top: 0, behavior: 'auto' });
	}

	function updateDifficultyUi(): void {
		const config = difficultyConfig[selectedDifficulty];
		difficultyButtons.forEach((button) => {
			const isSelected = button.dataset.difficulty === selectedDifficulty;
			button.classList.toggle('actor-segment--active', isSelected);
			button.setAttribute('aria-pressed', String(isSelected));
		});
		if (difficultyDescription) {
			difficultyDescription.textContent = config.description;
		}
	}

	function updateIdentityPreview(): void {
		const previewName = query<HTMLElement>('[data-preview-name]');
		const previewProfile = query<HTMLElement>('[data-preview-profile]');
		const previewCountry = query<HTMLElement>('[data-preview-country]');
		const name = stageNameInput?.value.trim() || 'Tu nombre';
		if (previewName) previewName.textContent = name;
		if (previewProfile) previewProfile.textContent = `${professionDisplayLabel(selectedProfession, selectedGender)} · ${profileDefinitions[selectedProfile].label}`.toUpperCase();
		updateCountryBadge(previewCountry, selectedCountry.flag, selectedCountry.code);
	}

	function selectCountry(button: HTMLButtonElement): void {
		selectedCountry = {
			code: button.dataset.country ?? 'AR',
			name: button.dataset.countryName ?? 'Argentina',
			flag: button.dataset.countryFlag ?? 'ar.svg',
		};
		countryButtons.forEach((countryButton) => {
			const isSelected = countryButton === button;
			countryButton.classList.toggle('actor-country--selected', isSelected);
			countryButton.setAttribute('aria-selected', String(isSelected));
		});
		updateIdentityPreview();
	}

	function readBirthYear(): number | null {
		const value = Number.parseInt(birthYearInput?.value ?? '', 10);
		const minYear = 1930;
		const maxYear = currentYear - 18;
		const valid = Number.isInteger(value) && value >= minYear && value <= maxYear;
		if (birthYearError) {
			birthYearError.textContent = valid ? '' : `Elegí un año entre ${minYear} y ${maxYear}.`;
			birthYearError.hidden = valid;
		}
		birthYearInput?.setAttribute('aria-invalid', String(!valid));
		return valid ? value : null;
	}

	function createState(name: string, birthYear: number): CareerState {
		return {
			name,
			countryCode: selectedCountry.code,
			countryName: selectedCountry.name,
			countryFlag: selectedCountry.flag,
			birthYear,
			gender: selectedGender,
			profession: selectedProfession,
			profile: selectedProfile,
			difficulty: selectedDifficulty,
			ages: getCareerAges(birthYear, selectedDifficulty),
			currentIndex: 0,
			level: 54,
			peakLevel: 54,
			films: 0,
			leads: 0,
			nominations: 0,
			luck: 50,
			moviesSinceDevelopment: 0,
			nextDevelopmentAfter: getDevelopmentInterval(),
			awards: [],
			history: [],
			finished: false,
		};
	}

	function updatePlayerUi(currentState: CareerState): void {
		const eventEntry = currentState.history.at(-1);
		if (playerLevel) playerLevel.textContent = String(currentState.level);
		if (playerName) playerName.textContent = currentState.name;
		updateCountryBadge(playerCountry, currentState.countryFlag, currentState.countryCode);
		if (playerProfile) playerProfile.textContent = `${professionDisplayLabel(currentState.profession, currentState.gender)} · ${profileDefinitions[currentState.profile].short}`;
		if (playerProject) playerProject.textContent = eventEntry?.project ?? 'Buscando primer crédito';
		if (playerAge) playerAge.textContent = String(currentState.ages[Math.min(currentState.currentIndex, currentState.ages.length - 1)]);
		if (playerYear) playerYear.textContent = String(getCareerYear(currentState));
		if (playerCachet) playerCachet.textContent = formatCachet(currentState);
		if (playerFilms) playerFilms.textContent = String(currentState.films);
		if (playerLeads) playerLeads.textContent = String(currentState.leads);
		if (playerNominations) playerNominations.textContent = String(currentState.nominations);
		if (playerLuck) {
			const strong = playerLuck.querySelector('strong');
			if (strong) strong.textContent = `${currentState.luck}%`;
			playerLuck.setAttribute('aria-label', `Suerte de la carrera: ${currentState.luck}%`);
		}
		if (timelineMode) timelineMode.textContent = difficultyConfig[currentState.difficulty].label;
		updateStateArt(currentState);
		renderAwards(currentState);
	}

	function updateStateArt(currentState: CareerState): void {
		if (!stateArt || !stateArtImage) return;
		const isSuperstar = currentState.level >= 78 || currentState.awards.length >= 2 || currentState.films >= 7;
		const nextTier = isSuperstar ? 'superstar' : 'struggling';
		const nextImage = `${assetBase}images/actor-career/actor-career-${nextTier}.png`;
		const hasChanged = stateArt.dataset.tier !== nextTier;
		stateArt.dataset.tier = nextTier;
		stateArt.classList.toggle('actor-state-art--superstar', isSuperstar);
		if (hasChanged) {
			stateArt.classList.remove('actor-state-art--changed');
			void stateArt.offsetWidth;
			stateArt.classList.add('actor-state-art--changed');
		}
		if (stateArtImage.src !== new URL(nextImage, window.location.href).toString()) stateArtImage.src = nextImage;
		stateArtImage.alt = isSuperstar
			? 'Dos estrellas del cine celebrando una noche de premios'
			: 'Dos personas resolviendo un rodaje independiente con pocos recursos';
		if (stateArtCaption) {
			stateArtCaption.textContent = isSuperstar
				? 'La marquesina se enciende: festivales, estatuillas y llamadas desde Hollywood.'
				: 'Primeros rodajes, luces prestadas y una oportunidad para no soltar.';
		}
	}

	function renderAwards(currentState: CareerState): void {
		if (!awardsShelf) return;
		if (currentState.awards.length === 0) {
			awardsShelf.classList.remove('actor-awards-shelf--has-awards');
			awardsShelf.innerHTML = '<div class="actor-awards-shelf__empty"><span aria-hidden="true">✦</span><span>La vitrina todavía está vacía</span></div>';
			return;
		}
		awardsShelf.classList.add('actor-awards-shelf--has-awards');
		awardsShelf.innerHTML = `<ul class="actor-awards-shelf__list" aria-label="Premios ganados">${currentState.awards
			.map((awardId) => {
				const award = awardDefinitions[awardId];
				return `<li class="actor-award-mini"><img src="${assetBase}brand/awards/${award.asset}" alt="" width="28" height="36" /><span>${escapeHtml(award.short)}</span></li>`;
			})
			.join('')}</ul>`;
	}

	function renderTimeline(currentState: CareerState): void {
		if (!timelineBody) return;
		timelineBody.innerHTML = currentState.ages
			.map((age, index) => {
				const entry = currentState.history[index];
				const isPast = Boolean(entry);
				const isCurrent = !entry && index === currentState.currentIndex && !currentState.finished;
				const rowClass = isPast ? 'actor-timeline__row--past' : isCurrent ? 'actor-timeline__row--current' : 'actor-timeline__row--future';
				const project = entry?.project ?? (isCurrent ? 'Decisión de carrera…' : 'Todavía por filmar');
				const year = entry?.year ?? currentState.birthYear + age;
				const projectCopy = entry?.movie
					? `${year} · ${entry.movie.category}`
					: entry?.simulation
						? `${year} · ${entry.simulation.category}`
					: entry?.award
						? `${year} · ${awardDefinitions[entry.award].short}`
						: isCurrent
							? `${year} · elegí tu próximo paso`
							: `${year} · el guion todavía no está escrito`;
				return `<div class="actor-timeline__row ${rowClass}" role="row">
					<span class="actor-timeline__age" role="cell">${age}</span>
					<span class="actor-timeline__project" role="cell">${escapeHtml(project)}<small>${escapeHtml(projectCopy)}</small></span>
					<span class="actor-timeline__value actor-timeline__level" role="cell">${entry?.level ?? (isCurrent ? currentState.level : '—')}</span>
					<span class="actor-timeline__value" role="cell">${entry?.films ?? (isCurrent ? currentState.films : '—')}</span>
					<span class="actor-timeline__value" role="cell">${entry?.awards ?? (isCurrent ? currentState.awards.length : '—')}</span>
				</div>`;
			})
			.join('');
	}

	function renderCareerLog(currentState: CareerState): void {
		if (!careerLogBody) return;
		const decisionCount = currentState.history.length;
		if (careerLogCount) {
			careerLogCount.textContent = decisionCount === 1 ? '1 decisión' : `${decisionCount} decisiones`;
		}
		if (decisionCount === 0) {
			careerLogBody.innerHTML = `<div class="actor-career-log__empty" data-career-log-empty><span aria-hidden="true">✦</span><strong>Tu primera toma todavía no está escrita.</strong><p>Elegí una de las dos oportunidades y acá va a quedar el resultado completo.</p></div>`;
			return;
		}

		careerLogBody.innerHTML = `<ol class="actor-career-log__list" aria-label="Decisiones tomadas">${currentState.history
			.slice()
			.reverse()
			.map((entry) => {
				const entryType = entry.simulation ? (entry.simulation.slug.startsWith('evento-') ? 'EVENTO DE OFICIO' : 'AÑO DE PREPARACIÓN') : entry.movie ? 'PELÍCULA' : 'GIRO DE CARRERA';
				const awardCopy = entry.award ? `<span class="actor-career-log__award">✦ ${escapeHtml(awardDefinitions[entry.award].short)}</span>` : '';
				const result = entry.result ?? `${entry.choice ?? 'Decisión'}: ${entry.project}.`;
				return `<li class="actor-career-log__entry${entry.simulation ? ' actor-career-log__entry--simulation' : ''}" data-career-log-entry>
					<div class="actor-career-log__entry-top">
						<span class="actor-career-log__stamp">${entry.year} · ${entry.age} AÑOS</span>
						<span class="actor-career-log__type">${entryType}</span>
					</div>
					<strong class="actor-career-log__choice">${escapeHtml(entry.choice ?? 'Decisión de carrera')}</strong>
					<span class="actor-career-log__project">${escapeHtml(entry.project)}</span>
					<p>${escapeHtml(result)}</p>
					<div class="actor-career-log__entry-meta"><span>NIVEL ${entry.level}</span><span>SUERTE ${entry.luck}%</span>${awardCopy}</div>
				</li>`;
			})
			.join('')}</ol>`;
	}

	function renderChoices(currentState: CareerState, event: CareerEvent): void {
		if (!choiceGrid) return;
		const offerChoices = getOfferChoices(currentState, event);
		choiceGrid.innerHTML = offerChoices
			.map(
				({ choice, kind, movie, simulation }, choiceIndex) => {
					const artIndex = (currentState.currentIndex * 2 + choiceIndex) % 9;
					const work = movie ?? simulation;
					const workTitle = work?.title ?? 'Año de preparación';
					const workYear = work?.year ?? getCareerYear(currentState);
					const workCategory = work?.category ?? 'Preparación';
					const workPoster = work?.posterUrl ?? `${assetBase}posters/poster-no-disponible.svg`;
					const workDetail = movie ? `Dirige ${movie.director}` : simulation?.detail ?? 'Un año para mejorar tu oficio.';
					const simulationClass = kind === 'event' ? ' actor-choice-card--simulation actor-choice-card--event' : '';
					const cardTitle = kind === 'event' ? `Evento: ${workTitle}` : `${getProfessionAction(currentState, choiceIndex)}: ${workTitle}`;
					const workVisual = kind === 'event'
						? `<span class="actor-choice-card__poster actor-choice-card__poster--event" aria-hidden="true">${choice.icon}</span>`
						: `<img class="actor-choice-card__poster" src="${escapeHtml(workPoster)}" alt="" width="68" height="96" loading="lazy" />`;
					return `<button type="button" class="actor-choice-card${simulationClass}" data-choice-index="${choiceIndex}" data-offer-kind="${kind}" data-offer-year="${workYear}" data-offer-slug="${escapeHtml(work?.slug ?? '')}">
					<span class="actor-choice-card__top"><span class="actor-choice-card__icon" aria-hidden="true">${choice.icon}</span><span class="actor-choice-card__risk">${escapeHtml(choice.risk)}</span></span>
					<span class="actor-choice-card__art actor-choice-card__art--${artIndex}" aria-hidden="true"></span>
					<span class="actor-choice-card__movie">${workVisual}<span class="actor-choice-card__movie-copy"><strong>${escapeHtml(cardTitle)}</strong><span class="actor-choice-card__movie-meta">${workYear} · ${escapeHtml(workCategory)}</span><span class="actor-choice-card__copy">${escapeHtml(choice.copy)}</span><small>${escapeHtml(workDetail)}</small></span></span>
					<span class="actor-choice-card__outcomes">${choice.outcomes
						.map(
							(outcome) => `<span class="actor-choice-card__outcome${outcomeTone(outcome)}"><span>${escapeHtml(outcome.label)}</span><b>${outcome.chance}%</b></span>`,
						)
						.join('')}</span>
				</button>`;
				},
			)
			.join('');
	}

	function renderEvent(currentState: CareerState): void {
		const event = getCurrentEvent(currentState);
		if (eventKicker) eventKicker.textContent = event.kicker;
		if (eventTitle) eventTitle.textContent = event.title;
		if (eventCopy) eventCopy.textContent = event.copy;
		if (eventResult) {
			eventResult.hidden = true;
			eventResult.classList.remove('actor-event-result--bad');
			eventResult.classList.remove('actor-event-result--rolling');
			eventResult.textContent = '';
		}
		eventPanel?.classList.remove('actor-event-panel--rolling');
		choiceGrid?.classList.remove('actor-choice-grid--rolling');
		renderChoices(currentState, event);
	}

	function renderCareer(): void {
		if (!state) return;
		updatePlayerUi(state);
		renderTimeline(state);
		renderCareerLog(state);
		if (state.finished) {
			renderFinishedCareer();
		} else {
			renderEvent(state);
		}
	}

	function renderFinishedCareer(): void {
		finishCareer();
	}

	function resolveOutcome(choice: Choice, currentState: CareerState): Outcome {
		if (choice.outcomes.length === 1) return choice.outcomes[0];
		const firstOutcome = choice.outcomes[0];
		const luckBias = (currentState.luck - 50) * 0.18;
		const adjustedChance = clamp(firstOutcome.chance + luckBias, 8, 92);
		return Math.random() * 100 <= adjustedChance ? firstOutcome : choice.outcomes[1];
	}

	function applyOutcome(outcome: Outcome, currentState: CareerState): Outcome {
		const previousLevel = currentState.level;
		const nextIndex = Math.min(currentState.currentIndex + 1, currentState.ages.length - 1);
		const careerCeiling = getCareerLevelCeiling(currentState, nextIndex);
		const levelAfterDecision = currentState.level + outcome.levelDelta;
		currentState.level = clamp(Math.min(levelAfterDecision, careerCeiling), 1, 99);
		currentState.peakLevel = Math.max(currentState.peakLevel, currentState.level);
		currentState.films = Math.max(0, currentState.films + outcome.filmsDelta);
		currentState.leads = Math.max(0, currentState.leads + outcome.leadsDelta);
		currentState.nominations = Math.max(0, currentState.nominations + outcome.nominationsDelta);
		currentState.luck = clamp(currentState.luck + outcome.luckDelta, 15, 90);
		if (outcome.award && !currentState.awards.includes(outcome.award)) {
			currentState.awards.push(outcome.award);
		}
		const actualLevelDelta = currentState.level - previousLevel;
		return actualLevelDelta === outcome.levelDelta ? outcome : withLevelLabel(outcome, actualLevelDelta);
	}

	function describeResult(choice: Choice, outcome: Outcome, currentState: CareerState): string {
		const awardCopy = outcome.award ? ` Ganaste ${awardDefinitions[outcome.award].label}.` : '';
		const luckCopy = ` Suerte actual: ${currentState.luck}%.`;
		return `${choice.label}: ${outcome.label}. ${outcome.project}.${awardCopy}${luckCopy}`;
	}

	function finishCareer(): void {
		if (!state) return;
		state.finished = true;
		if (eventKicker) eventKicker.textContent = 'CARRERA FINALIZADA';
		if (eventTitle) eventTitle.textContent = 'Tu carrera llegó a su fin';
		if (eventCopy) eventCopy.textContent = 'La pantalla se apaga, pero queda todo lo que elegiste en el camino.';
		if (eventResult) {
			eventResult.hidden = false;
			eventResult.classList.remove('actor-event-result--bad');
			eventResult.textContent = `${state.name} termina con nivel ${state.level}, ${state.films} películas y ${state.awards.length} premio${state.awards.length === 1 ? '' : 's'}.`;
		}
		if (choiceGrid) {
			choiceGrid.innerHTML = `<div class="actor-finale-card"><div><span class="actor-finale-card__stamp">ÚLTIMA TOMA</span><strong>¿Qué querés hacer ahora?</strong><p>Podés mirar el resumen completo de tu filmografía o volver a empezar con otra identidad.</p></div><div class="actor-finale-card__actions"><button type="button" class="actor-button actor-button--primary" data-game-action="summary">Ver resumen</button><button type="button" class="actor-button actor-button--ghost" data-game-action="restart">Volver a jugar</button></div></div>`;
		}
		updatePlayerUi(state);
		renderTimeline(state);
	}

	function selectChoice(choiceIndex: number): void {
		if (!state || state.finished) return;
		const isFinalTurn = state.currentIndex >= state.ages.length - 1;
		const event = getCurrentEvent(state);
		const offerChoice = getOfferChoices(state, event)[choiceIndex];
		if (!offerChoice) return;
		const { choice, movie, simulation } = offerChoice;
		const project = movie?.title ?? simulation?.title ?? 'Año de preparación';
		const resolvedOutcome = resolveOutcome(choice, state);
		const outcome = { ...resolvedOutcome, project };
		const choiceButtons = Array.from(root!.querySelectorAll<HTMLButtonElement>('[data-choice-index]'));
		choiceButtons.forEach((button) => {
			button.disabled = true;
		});
		choiceGrid?.classList.add('actor-choice-grid--rolling');
		eventPanel?.classList.add('actor-event-panel--rolling');
		if (eventResult) {
			eventResult.hidden = false;
			eventResult.classList.remove('actor-event-result--bad');
			eventResult.classList.add('actor-event-result--rolling');
			eventResult.textContent = '🎰 La suerte está rodando…';
		}
		if (transitionTimer) window.clearTimeout(transitionTimer);
		transitionTimer = window.setTimeout(() => {
			if (!state) return;
			const appliedOutcome = applyOutcome(outcome, state);
			const resultText = describeResult(choice, appliedOutcome, state);
			if (eventResult) {
				eventResult.classList.remove('actor-event-result--rolling');
				eventResult.classList.toggle('actor-event-result--bad', appliedOutcome.levelDelta < 0);
				eventResult.textContent = resultText;
			}
				choiceGrid?.classList.remove('actor-choice-grid--rolling');
				eventPanel?.classList.remove('actor-event-panel--rolling');
				if (movie) state.moviesSinceDevelopment += 1;
				if (simulation) {
					state.moviesSinceDevelopment = 0;
					state.nextDevelopmentAfter = getDevelopmentInterval();
				}
				state.history.push({
				age: state.ages[state.currentIndex],
				year: getCareerYear(state),
				project: outcome.project,
				choice: choice.label,
				result: resultText,
				level: state.level,
				films: state.films,
				awards: state.awards.length,
				luck: state.luck,
				movie,
				simulation,
					award: appliedOutcome.award,
			});
			renderCareerLog(state);
			if (choice.retire || isFinalTurn) {
				state.currentIndex = state.ages.length;
				transitionTimer = window.setTimeout(finishCareer, 560);
				return;
			}
			state.currentIndex += 1;
			transitionTimer = window.setTimeout(renderCareer, 460);
		}, 820);
	}

	function renderSummary(): void {
		if (!state || !summaryContent) return;
		const currentState = state;
		const summaryTier = getSummaryTier(currentState);
		const summaryDefinition = summaryTierDefinitions[summaryTier];
		const summaryArt = `final-${currentState.profession}-${summaryTier}.png`;
		const chapters = currentState.history
			.map((entry) => {
				const posterUrl = entry.movie?.posterUrl ?? entry.simulation?.posterUrl;
				const creditCopy = entry.movie
					? `${professionDisplayLabel(currentState.profession, currentState.gender)} · ${entry.movie.director}`
					: entry.simulation
						? `${professionDisplayLabel(currentState.profession, currentState.gender)} · ${entry.simulation.category}`
						: 'Un capítulo más en la carrera';
				return `<article class="actor-summary__chapter">${posterUrl ? `<img class="actor-summary__chapter-poster" src="${escapeHtml(posterUrl)}" alt="" width="90" height="126" loading="lazy" />` : ''}<span class="actor-summary__chapter-age">${entry.year} · ${entry.age} AÑOS</span><h3>${escapeHtml(entry.project)}</h3><p>${escapeHtml(creditCopy)}${entry.award ? ` · ${escapeHtml(awardDefinitions[entry.award].label)}` : ''}</p><div class="actor-summary__chapter-stats"><span>NIVEL ${entry.level}</span><span>${entry.films} CRÉD.</span><span>${entry.awards} PREM.</span></div></article>`;
			})
			.join('');
		const awards = state.awards.length
			? `<ul class="actor-summary__awards-list">${state.awards
				.map((awardId) => {
					const award = awardDefinitions[awardId];
					return `<li><img src="${assetBase}brand/awards/${award.asset}" alt="" width="28" height="36" />${escapeHtml(award.short)}</li>`;
				})
				.join('')}</ul>`
			: '<p class="actor-summary__empty-awards">Vitrina vacía. A veces una filmografía también se construye sin estatuillas.</p>';

		summaryContent.innerHTML = `<div class="actor-summary"><div class="actor-summary__header"><div><p class="actor-summary__eyebrow">CARRERA FINALIZADA</p><h1 id="actor-summary-title">${escapeHtml(state.name)}</h1><p class="actor-summary__profile"><span>${escapeHtml(state.countryCode)}</span><span>${escapeHtml(professionDisplayLabel(state.profession, state.gender))}</span><span>${escapeHtml(profileDefinitions[state.profile].label)}</span></p></div><div class="actor-summary__headline-metric"><small>NIVEL</small><strong>${state.level}</strong></div><div class="actor-summary__cachet"><small>CACHET FINAL</small><strong>${formatCachet(state)}</strong></div></div><div class="actor-summary__overview"><section class="actor-summary__selection" aria-labelledby="actor-summary-selection"><p class="actor-summary__selection-title" id="actor-summary-selection"><img class="actor-flag" src="${countryFlagUrl(escapeHtml(state.countryFlag))}" alt="" width="28" height="20" /> Selección ${escapeHtml(state.countryName)}</p><p class="actor-summary__selection-copy">Naciste en ${state.birthYear}. Una carrera hecha de decisiones, oportunidades y un poco de suerte.</p><dl class="actor-summary__stats"><div><dt>PELÍCULAS</dt><dd>${state.films}</dd></div><div><dt>CRÉDITOS CLAVE</dt><dd>${state.leads}</dd></div><div><dt>NOMINACIONES</dt><dd>${state.nominations}</dd></div></dl></section><section class="actor-summary__awards" aria-labelledby="actor-summary-awards"><p class="actor-summary__label" id="actor-summary-awards">Premios individuales</p>${awards}</section></div><figure class="actor-summary__art actor-summary__art--${summaryTier}" data-summary-tier="${summaryTier}"><img src="${assetBase}images/actor-career/${summaryArt}" alt="${escapeHtml(`${summaryDefinition.alt} · ${professionDisplayLabel(state.profession, state.gender)}`)}" width="1536" height="1024" loading="eager" decoding="async" /><figcaption><strong>${summaryDefinition.label}</strong><span>${summaryDefinition.caption}</span></figcaption></figure><section class="actor-summary__chapters" aria-labelledby="actor-summary-chapters-title"><h2 id="actor-summary-chapters-title">Los capítulos de tu filmografía</h2><div class="actor-summary__chapter-grid">${chapters}</div></section><div class="actor-summary__actions"><button type="button" class="actor-button actor-button--ghost" data-game-action="restart">↺ Volver a jugar</button></div></div>`;
	}

	function restartGame(): void {
		if (transitionTimer) window.clearTimeout(transitionTimer);
		state = null;
		selectedDifficulty = 'normal';
		selectedCountry = { code: 'AR', name: 'Argentina', flag: 'ar.svg' };
		selectedGender = 'masculino';
		selectedProfession = 'actor';
		selectedProfile = 'camaleonico';
		if (birthYearInput) {
			birthYearInput.value = '1990';
			birthYearInput.setAttribute('aria-invalid', 'false');
		}
		if (birthYearError) birthYearError.hidden = true;
		if (stageNameInput) {
			stageNameInput.value = '';
			stageNameInput.setAttribute('aria-invalid', 'false');
		}
		if (stageNameError) stageNameError.hidden = true;
		if (countrySearchInput) countrySearchInput.value = '';
		countryButtons.forEach((button) => {
			const isArgentina = button.dataset.country === 'AR';
			button.hidden = false;
			button.classList.toggle('actor-country--selected', isArgentina);
			button.setAttribute('aria-selected', String(isArgentina));
		});
		profileInputs.forEach((input) => {
			input.checked = input.value === selectedProfile;
			input.closest('.actor-profile-option')?.classList.toggle('actor-profile-option--selected', input.checked);
		});
		genderInputs.forEach((input) => {
			input.checked = input.value === selectedGender;
			input.closest('.actor-profile-option')?.classList.toggle('actor-profile-option--selected', input.checked);
		});
		professionInputs.forEach((input) => {
			input.checked = input.value === selectedProfession;
			input.closest('.actor-profile-option')?.classList.toggle('actor-profile-option--selected', input.checked);
		});
		updateDifficultyUi();
		updateIdentityPreview();
		showView('landing');
	}

	difficultyButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const difficulty = button.dataset.difficulty as Difficulty | undefined;
			if (!difficulty || !difficultyConfig[difficulty]) return;
			selectedDifficulty = difficulty;
			updateDifficultyUi();
		});
	});

	root.querySelector<HTMLElement>('[data-start-identity]')?.addEventListener('click', () => {
		showView('identity');
		window.setTimeout(() => stageNameInput?.focus(), 40);
	});

	root.querySelector<HTMLElement>('[data-back-landing]')?.addEventListener('click', () => showView('landing'));

	stageNameInput?.addEventListener('input', () => {
		if (stageNameError) stageNameError.hidden = true;
		stageNameInput.removeAttribute('aria-invalid');
		updateIdentityPreview();
	});

	countrySearchInput?.addEventListener('input', () => {
		const search = countrySearchInput.value.trim().toLocaleLowerCase('es-AR');
		countryButtons.forEach((button) => {
			const name = (button.dataset.countryName ?? '').toLocaleLowerCase('es-AR');
			button.hidden = Boolean(search && !name.includes(search));
		});
	});

	countryButtons.forEach((button) => button.addEventListener('click', () => selectCountry(button)));

	profileInputs.forEach((input) => {
		input.addEventListener('change', () => {
			const profile = input.value as Profile;
			if (!profileDefinitions[profile]) return;
			selectedProfile = profile;
			profileInputs.forEach((profileInput) => profileInput.closest('.actor-profile-option')?.classList.toggle('actor-profile-option--selected', profileInput.checked));
			updateIdentityPreview();
		});
	});

	genderInputs.forEach((input) => {
		input.addEventListener('change', () => {
			const gender = input.value as Gender;
			if (gender !== 'masculino' && gender !== 'femenino') return;
			selectedGender = gender;
			genderInputs.forEach((genderInput) => genderInput.closest('.actor-profile-option')?.classList.toggle('actor-profile-option--selected', genderInput.checked));
			updateIdentityPreview();
		});
	});

	professionInputs.forEach((input) => {
		input.addEventListener('change', () => {
			const profession = input.value as Profession;
			if (!professionDefinitions[profession]) return;
			selectedProfession = profession;
			professionInputs.forEach((professionInput) => professionInput.closest('.actor-profile-option')?.classList.toggle('actor-profile-option--selected', professionInput.checked));
			updateIdentityPreview();
		});
	});

	birthYearInput?.addEventListener('input', () => {
		if (birthYearError?.hidden === false) readBirthYear();
	});

	identityForm?.addEventListener('submit', (event) => {
		event.preventDefault();
		const name = stageNameInput?.value.trim() ?? '';
		if (!name) {
			if (stageNameError) stageNameError.hidden = false;
			stageNameInput?.setAttribute('aria-invalid', 'true');
			stageNameInput?.focus();
			return;
		}
		if (stageNameError) stageNameError.hidden = true;
		const birthYear = readBirthYear();
		if (birthYear === null) {
			birthYearInput?.focus();
			return;
		}
		state = createState(name, birthYear);
		showView('career');
		renderCareer();
	});

	choiceGrid?.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;
		const choiceButton = target.closest<HTMLButtonElement>('[data-choice-index]');
		if (!choiceButton) return;
		const choiceIndex = Number(choiceButton.dataset.choiceIndex);
		if (Number.isInteger(choiceIndex)) selectChoice(choiceIndex);
	});

	root.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;
		const actionElement = target.closest<HTMLElement>('[data-game-action]');
		const action = actionElement?.dataset.gameAction;
		if (action === 'summary') {
			renderSummary();
			showView('summary');
		} else if (action === 'restart') {
			restartGame();
		}
	});

	updateDifficultyUi();
	updateIdentityPreview();
}
