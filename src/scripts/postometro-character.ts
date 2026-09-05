const CHARACTER_STORAGE_KEY = 'cineposta:postometro-character:v1';
const characterImage = document.querySelector<HTMLImageElement>('[data-postometro-character]');

if (characterImage) {
	const characterSources = parseCharacterSources(characterImage.dataset.postometroCharacterSources);

	if (characterSources.length > 1) {
		setRandomCharacter(characterImage, characterSources);
		window.addEventListener('pageshow', (event) => {
			if (event.persisted) {
				setRandomCharacter(characterImage, characterSources);
			}
		});
	}
}

function parseCharacterSources(rawSources: string | undefined): string[] {
	if (!rawSources) return [];

	try {
		const parsed = JSON.parse(rawSources) as unknown;
		return Array.isArray(parsed)
			? parsed.filter((source): source is string => typeof source === 'string' && source.length > 0)
			: [];
	} catch {
		return [];
	}
}

function setRandomCharacter(image: HTMLImageElement, sources: string[]): void {
	const previousIndex = getPreviousIndex(sources.length);
	let nextIndex = getRandomIndex(sources.length);

	if (sources.length > 1 && nextIndex === previousIndex) {
		nextIndex = (nextIndex + 1) % sources.length;
	}

	const nextSource = sources[nextIndex];
	if (!nextSource) return;

	image.src = nextSource;
	image.dataset.postometroCharacterIndex = String(nextIndex);

	try {
		sessionStorage.setItem(CHARACTER_STORAGE_KEY, String(nextIndex));
	} catch {
		// Private browsing or blocked storage should not prevent the character from loading.
	}
}

function getPreviousIndex(sourceCount: number): number {
	try {
		const storedIndex = Number.parseInt(sessionStorage.getItem(CHARACTER_STORAGE_KEY) ?? '', 10);
		return Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < sourceCount ? storedIndex : -1;
	} catch {
		return -1;
	}
}

function getRandomIndex(sourceCount: number): number {
	const cryptoApi = globalThis.crypto;
	if (cryptoApi?.getRandomValues) {
		const values = new Uint32Array(1);
		cryptoApi.getRandomValues(values);
		return (values[0] ?? 0) % sourceCount;
	}

	return Math.floor(Math.random() * sourceCount);
}

export {};
