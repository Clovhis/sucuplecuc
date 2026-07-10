const banner = document.querySelector<HTMLElement>('[data-community-banner]');
const homeBanner = document.querySelector<HTMLElement>('[data-community-home-banner]');

const phrases = [
	'Vení a tirar factos sobre esa película que te dejó pensando.',
	'¿Te voló la peluca o te dio sueño? Dejalo asentado.',
	'Caé con tu hot take: acá se banca el debate con argumentos.',
	'¿La rompió o era puro trailer? Vení a ponerlo en palabras.',
	'Hay una escena que te persigue: largala, pero tapá el spoiler.',
	'El algoritmo no te conoce como esta comunidad. Sumate.',
	'¿La defendés solo vos? Mejor: vení a militarla con cariño.',
	'Una peli, muchas opiniones y cero necesidad de caretearla.',
	'Pasá, sentate y contá si esa recomendación era cine o chamuyo.',
	'¿Finalazo o mamarracho? Acá hay lugar para esa sentencia.',
	'Decí lo que pensás antes de que el grupo de WhatsApp cambie de tema.',
	'Si saliste del cine queriendo discutir, este es tu plano secuencia.',
	'No hace falta saber de cine: alcanza con tener algo para decir.',
	'¿Te hizo llorar, reír o mirar el celular? Te leemos.',
	'El póster promete mucho; vos contanos si la peli cumple.',
	'Entrá a defender esa joyita incomprendida que nadie te banca.',
	'La butaca está libre: sumá tu opinión a la función.',
	'¿La volverías a ver? Esa es la clase de data que sirve.',
	'Opiniones fuertes, spoilers tapados y buena onda: mandale.',
	'Una crítica breve puede salvarle la noche a alguien. Tirala.',
];

if (banner) {
	banner.textContent = phrases[Math.floor(Math.random() * phrases.length)] ?? banner.textContent;
}

const homePhrases = [
	'¿La viste recién? Caé a contar si fue cine o puro humo.',
	'Tirá tu recomendación antes de que el algoritmo te encierre de nuevo.',
	'¿Finalazo o cualquier cosa? El foro está para esa discusión.',
	'Una opinión honesta puede salvarle la noche a alguien. Dejala.',
	'¿Esa peli está infravalorada? Vení a militarla un poquito.',
	'Si te dejó pensando, acá hay gente para seguir la charla.',
	'Contá qué te pareció, aunque sea para pinchar una burbuja.',
	'¿La bancás solo vos? Mejor: vení a defenderla.',
	'Te leemos: recomendación, bronca cinéfila o descubrimiento.',
	'Hay lugar para el hot take, siempre que venga con argumentos.',
	'¿Te reíste, lloraste o miraste el celu? Soltá la data.',
	'Una peli, muchas miradas y cero obligación de caretearla.',
	'Pasá y contá si vale darle play o seguir buscando.',
	'¿La volverías a ver? Es la crítica más útil que existe.',
	'Caé con tu ranking mental: acá se charla de cine en serio.',
	'El tráiler promete; vos contanos si la película cumple.',
	'¿Saliste con ganas de debatir? Te guardamos una butaca.',
	'No hace falta saber todo de cine: alcanza con tener una opinión.',
	'Vení a dejar esa frase que le recomendarías a un amigo.',
	'Opiniones fuertes, spoilers tapados y buena onda. Mandale.',
];

if (homeBanner) {
	homeBanner.textContent = homePhrases[Math.floor(Math.random() * homePhrases.length)] ?? homeBanner.textContent;
}
