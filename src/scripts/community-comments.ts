import { communitySupabase, isSupabaseConfigured } from '../lib/supabaseClient';

type CommunityMessage = {
	id: number;
	parent_id: number | null;
	author_name: string;
	body: string;
	created_at: string;
	status: 'approved' | 'pending';
};

interface TurnstileWindow extends Window {
	turnstile?: {
		render: (target: HTMLElement, options: Record<string, unknown>) => string;
	};
}

const root = document.querySelector<HTMLElement>('[data-community-comments-root]');

if (root) {
	void setupCommunity(root);
}

async function setupCommunity(root: HTMLElement): Promise<void> {
	const enabled = root.dataset.communityEnabled === 'true';
	const threadId = root.dataset.communityThreadId?.trim() ?? '';
	const movieSlug = root.dataset.communityMovieSlug?.trim() ?? '';
	const movieTitle = root.dataset.communityMovieTitle?.trim() ?? '';
	const turnstileSiteKey = root.dataset.communityTurnstileSiteKey?.trim() ?? '';
	const status = root.querySelector<HTMLElement>('[data-community-comments-status]');
	const list = root.querySelector<HTMLOListElement>('[data-community-comments-list]');
	const form = root.querySelector<HTMLFormElement>('[data-community-comments-form]');
	const captchaTarget = root.querySelector<HTMLElement>('[data-community-comments-captcha]');
	const replying = root.querySelector<HTMLElement>('[data-community-comments-replying]');
	const cancelReply = root.querySelector<HTMLButtonElement>('[data-community-comments-cancel]');

	if (!(status && list && form && replying && cancelReply)) return;
	const statusEl = status;
	const listEl = list;
	const formEl = form;
	const replyingEl = replying;
	const cancelReplyButton = cancelReply;
	const setStatus = (message: string, state: 'loading' | 'error' | 'ready') => {
		statusEl.textContent = message;
		statusEl.dataset.state = state;
		statusEl.hidden = state === 'ready';
	};
	if (!enabled) return;
	if (!isSupabaseConfigured || !communitySupabase || !threadId) {
		setStatus('La conversación necesita terminar su configuración antes de abrir la sala.', 'error');
		return;
	}

	const client = communitySupabase;
	let replyToId: number | null = null;
	try {
		const { data, error } = await client.auth.getSession();
		if (error) throw error;
		if (!data.session) {
			const captchaToken = await prepareCaptcha(captchaTarget, turnstileSiteKey);
			const result = await client.auth.signInAnonymously({
				options: captchaToken ? { captchaToken } : undefined,
			});
			if (result.error) throw result.error;
		}
		await loadMessages();
		setStatus('', 'ready');
	} catch {
		setStatus('No pudimos abrir la charla ahora. Probá de nuevo en un rato.', 'error');
		return;
	}

	formEl.addEventListener('submit', (event) => {
		event.preventDefault();
		void submitMessage();
	});
	cancelReplyButton.addEventListener('click', () => setReply(null));
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) void loadMessages();
	});
	window.setInterval(() => {
		if (!document.hidden) void loadMessages();
	}, 25000);

	async function loadMessages(): Promise<void> {
		const { data, error } = await client.rpc('list_community_messages', {
			p_thread_key: threadId,
			p_limit: 200,
		});
		if (error) {
			setStatus('No pudimos actualizar la charla. Probá de nuevo en un rato.', 'error');
			return;
		}
		renderMessages(listEl, (data ?? []) as CommunityMessage[], setReply);
	}

	function setReply(message: CommunityMessage | null): void {
		replyToId = message?.id ?? null;
		cancelReplyButton.hidden = !message;
		replyingEl.hidden = !message;
		replyingEl.textContent = message ? `Estás respondiendo a ${message.author_name}.` : '';
		formEl.querySelector<HTMLTextAreaElement>('[name="body"]')?.focus();
	}

	async function submitMessage(): Promise<void> {
		const formData = new FormData(formEl);
		const authorName = String(formData.get('authorName') ?? '').trim();
		const body = String(formData.get('body') ?? '').trim();
		if (authorName.length < 2 || body.length < 1) {
			setStatus('Completá tu apodo y el mensaje antes de enviarlo.', 'error');
			return;
		}

		const submit = formEl.querySelector<HTMLButtonElement>('[type="submit"]');
		if (submit) submit.disabled = true;
		setStatus('Publicando tu mensaje…', 'loading');
		const { error } = await client.rpc('submit_community_message', {
			p_thread_key: threadId,
			p_movie_slug: movieSlug,
			p_movie_title: movieTitle,
			p_parent_id: replyToId,
			p_author_name: authorName,
			p_body: body,
		});
		if (submit) submit.disabled = false;
		if (error) {
			setStatus(
				error.message.includes('rate limit')
					? 'Esperá unos minutos antes de mandar otro mensaje.'
					: 'No pudimos enviar tu mensaje. Revisá el texto e intentá de nuevo.',
				'error',
			);
			return;
		}
		formEl.reset();
		setReply(null);
		setStatus('Listo: tu mensaje ya está en la charla.', 'ready');
		await loadMessages();
	}
}

async function prepareCaptcha(target: HTMLElement | null, siteKey: string): Promise<string | undefined> {
	if (!siteKey || !target) return undefined;
	await new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('captcha unavailable'));
		document.head.append(script);
	});
	return new Promise<string>((resolve, reject) => {
		const turnstile = (window as TurnstileWindow).turnstile;
		if (!turnstile) return reject(new Error('captcha unavailable'));
		turnstile.render(target, {
			sitekey: siteKey,
			theme: 'dark',
			callback: (token: string) => resolve(token),
			'error-callback': () => reject(new Error('captcha unavailable')),
		});
	});
}

function renderMessages(
	list: HTMLOListElement,
	messages: CommunityMessage[],
	onReply: (message: CommunityMessage) => void,
): void {
	list.replaceChildren();
	if (!messages.length) {
		const empty = document.createElement('li');
		empty.className = 'community-comments__empty';
		empty.textContent = 'Todavía no hay mensajes aprobados. Rompé el hielo, sin spoilers pesados.';
		list.append(empty);
		return;
	}
	const byParent = new Map<number | null, CommunityMessage[]>();
	for (const message of messages) {
		const parent = message.parent_id && messages.some((candidate) => candidate.id === message.parent_id) ? message.parent_id : null;
		byParent.set(parent, [...(byParent.get(parent) ?? []), message]);
	}
	for (const message of byParent.get(null) ?? []) {
		list.append(createMessage(message, byParent, onReply));
	}
}

function createMessage(
	message: CommunityMessage,
	byParent: Map<number | null, CommunityMessage[]>,
	onReply: (message: CommunityMessage) => void,
): HTMLLIElement {
	const item = document.createElement('li');
	item.className = 'community-message';
	if (message.status === 'pending') item.dataset.status = 'pending';
	const article = document.createElement('article');
	const header = document.createElement('header');
	const author = document.createElement('strong');
	author.dir = 'auto';
	author.textContent = message.author_name;
	const time = document.createElement('time');
	time.dateTime = message.created_at;
	time.textContent = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.created_at));
	header.append(author, time);
	if (message.status === 'pending') {
		const pending = document.createElement('span');
		pending.className = 'community-message__pending';
		pending.textContent = 'Pendiente de revisión';
		header.append(pending);
	}
	const body = document.createElement('p');
	body.dir = 'auto';
	body.textContent = message.body;
	const reply = document.createElement('button');
	reply.type = 'button';
	reply.textContent = 'Responder';
	reply.addEventListener('click', () => onReply(message));
	article.append(header, body, reply);
	item.append(article);
	const replies = byParent.get(message.id) ?? [];
	if (replies.length) {
		const nested = document.createElement('ol');
		nested.className = 'community-message__replies';
		for (const child of replies) nested.append(createMessage(child, byParent, onReply));
		item.append(nested);
	}
	return item;
}
