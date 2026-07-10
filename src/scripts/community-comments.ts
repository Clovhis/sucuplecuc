interface FastCommentsWindow extends Window {
	FastCommentsUI?: (target: HTMLElement, config: Record<string, unknown>) => unknown;
}

const root = document.querySelector<HTMLElement>('[data-community-comments-root]');

if (root) {
	const status = root.querySelector<HTMLElement>('[data-community-comments-status]');
	const target = root.querySelector<HTMLElement>('[data-community-comments-target]');
	const enabled = root.dataset.commentsEnabled === 'true';
	const tenantId = root.dataset.commentsTenantId?.trim() ?? '';
	const threadId = root.dataset.commentsThreadId?.trim() ?? '';
	const canonicalUrl = root.dataset.commentsUrl?.trim() ?? '';

	const setStatus = (message: string, state: 'loading' | 'error' | 'ready') => {
		if (!status) return;
		status.textContent = message;
		status.dataset.state = state;
		status.hidden = state === 'ready';
	};

	if (enabled && tenantId && threadId && canonicalUrl && target) {
		const fail = () =>
			setStatus(
				'No pudimos cargar la conversación ahora. Revisá tu conexión o desactivá el bloqueador de contenido e intentá de nuevo.',
				'error',
			);
		const timeout = window.setTimeout(fail, 10000);
		const script = document.createElement('script');
		script.src = 'https://cdn.fastcomments.com/js/embed-v2.min.js';
		script.async = true;
		script.onload = () => {
			try {
				const fastComments = window as FastCommentsWindow;
				if (!fastComments.FastCommentsUI) return fail();
				fastComments.FastCommentsUI(target, {
					tenantId,
					urlId: threadId,
					url: canonicalUrl,
					urlTitle: 'Cine Posta — La Sala',
					allowAnon: true,
				});
				window.clearTimeout(timeout);
				setStatus('', 'ready');
			} catch {
				window.clearTimeout(timeout);
				fail();
			}
		};
		script.onerror = () => {
			window.clearTimeout(timeout);
			fail();
		};
		document.head.append(script);
	} else if (enabled) {
		setStatus('La conversación necesita una configuración válida antes de abrir la sala.', 'error');
	}
}
