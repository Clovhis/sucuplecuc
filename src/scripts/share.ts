document.querySelectorAll<HTMLElement>('[data-content-share]').forEach((shareRoot) => {
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

async function copyShareUrl(value: string): Promise<void> {
	if (!navigator.clipboard?.writeText || !window.isSecureContext) {
		throw new Error('Clipboard API unavailable');
	}

	await navigator.clipboard.writeText(value);
}
