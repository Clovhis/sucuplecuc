/**
 * Astro 6 client entrypoint.
 * Page-level browser behavior lives in a typed module so the linked `.astro`
 * page can stay declarative and `astro check` covers this logic too.
 */

type PersonDateParts = {
	year: number;
	month: number | null;
	day: number | null;
};

const backLink = document.querySelector<HTMLAnchorElement>('[data-history-back]');
if (backLink instanceof HTMLAnchorElement) {
	backLink.addEventListener('click', (event) => {
		let canUseHistoryBack = false;

		try {
			if (document.referrer) {
				const referrerUrl = new URL(document.referrer);
				canUseHistoryBack = referrerUrl.origin === window.location.origin;
			}
		} catch {
			canUseHistoryBack = false;
		}

		if (canUseHistoryBack && window.history.length > 1) {
			event.preventDefault();
			window.history.back();
		}
	});
}

document.querySelectorAll<HTMLElement>('[data-movie-share]').forEach((shareRoot) => {
	const shareUrl = shareRoot.dataset.shareUrl ?? window.location.href;
	const shareTitle = shareRoot.dataset.shareTitle ?? document.title;
	const shareText = shareRoot.dataset.shareText ?? shareTitle;
	const nativeShareButton = shareRoot.querySelector<HTMLButtonElement>('[data-native-share]');
	const copyButton = shareRoot.querySelector<HTMLButtonElement>('[data-copy-share-url]');
	const statusNode = shareRoot.querySelector<HTMLElement>('[data-share-status]');
	let statusTimer: number | undefined;

	const setStatus = (message: string) => {
		if (!statusNode) {
			return;
		}

		statusNode.textContent = message;

		if (statusTimer) {
			window.clearTimeout(statusTimer);
		}

		statusTimer = window.setTimeout(() => {
			statusNode.textContent = '';
		}, 3200);
	};

	if (nativeShareButton && typeof navigator.share === 'function') {
		nativeShareButton.hidden = false;
		nativeShareButton.addEventListener('click', async () => {
			try {
				await navigator.share({
					title: shareTitle,
					text: shareText,
					url: shareUrl,
				});
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					setStatus('No se pudo abrir el panel de compartir.');
				}
			}
		});
	}

	copyButton?.addEventListener('click', async () => {
		try {
			await copyShareUrl(shareUrl);
			setStatus('Link copiado.');
		} catch {
			setStatus('No se pudo copiar el link.');
		}
	});
});

document.querySelectorAll<HTMLElement>('[data-birth-year], [data-birth-date]').forEach((node) => {
	const birthDate = parsePersonDate(node.dataset.birthDate ?? '');
	const fallbackBirthYear = Number.parseInt(node.dataset.birthYear ?? '', 10);
	const now = new Date();
	const today = {
		year: now.getUTCFullYear(),
		month: now.getUTCMonth() + 1,
		day: now.getUTCDate(),
	};

	let age: number | undefined;

	if (birthDate?.year) {
		age = today.year - birthDate.year;
		if (birthDate.month && today.month < birthDate.month) {
			age -= 1;
		} else if (
			birthDate.month &&
			birthDate.day &&
			today.month === birthDate.month &&
			today.day < birthDate.day
		) {
			age -= 1;
		}
	} else if (Number.isInteger(fallbackBirthYear)) {
		age = today.year - fallbackBirthYear;
	}

	if (typeof age !== 'number' || !Number.isInteger(age) || age <= 0) {
		return;
	}

	node.textContent = `${age} años`;
});

async function copyShareUrl(value: string): Promise<void> {
	if (!navigator.clipboard?.writeText || !window.isSecureContext) {
		throw new Error('Clipboard API unavailable');
	}

	await navigator.clipboard.writeText(value);
}

function parsePersonDate(value: string): PersonDateParts | null {
	if (value.trim().length === 0) {
		return null;
	}

	const match = value.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
	if (!match) {
		return null;
	}

	return {
		year: Number.parseInt(match[1], 10),
		month: match[2] ? Number.parseInt(match[2], 10) : null,
		day: match[3] ? Number.parseInt(match[3], 10) : null,
	};
}
