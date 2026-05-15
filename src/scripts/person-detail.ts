const personBackLink = document.querySelector<HTMLAnchorElement>('[data-history-back]');

if (personBackLink instanceof HTMLAnchorElement) {
	const searchParams = new URLSearchParams(window.location.search);
	const returnPath = getSafeReturnPath(searchParams.get('backTo'));

	if (returnPath) {
		personBackLink.href = returnPath;
		searchParams.delete('backTo');
		const canonicalPath = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}${window.location.hash}`;
		window.history.replaceState(window.history.state, '', canonicalPath);
	}

	personBackLink.addEventListener('click', (event) => {
		if (returnPath) {
			event.preventDefault();
			if (canReturnWithHistory(returnPath)) {
				window.history.back();
				return;
			}

			window.location.assign(returnPath);
			return;
		}

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

function canReturnWithHistory(returnPath: string): boolean {
	if (window.history.length <= 1 || !document.referrer) {
		return false;
	}

	try {
		const referrerUrl = new URL(document.referrer);
		const returnUrl = new URL(returnPath, window.location.origin);

		return (
			referrerUrl.origin === window.location.origin &&
			referrerUrl.pathname === returnUrl.pathname &&
			referrerUrl.search === returnUrl.search
		);
	} catch {
		return false;
	}
}

function getSafeReturnPath(value: string | null): string | null {
	if (!value) {
		return null;
	}

	try {
		const candidate = new URL(value, window.location.origin);

		if (candidate.origin !== window.location.origin) {
			return null;
		}

		if (candidate.pathname === window.location.pathname) {
			return null;
		}

		return `${candidate.pathname}${candidate.search}${candidate.hash}`;
	} catch {
		return null;
	}
}
