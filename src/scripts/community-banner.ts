const banner = document.querySelector<HTMLElement>('[data-community-banner]');

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
