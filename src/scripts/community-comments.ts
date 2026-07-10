import { communitySupabase, isSupabaseConfigured } from '../lib/supabaseClient';

type CommunityMessage = {
	id: number;
	parent_id: number | null;
	author_name: string;
	body: string;
	created_at: string;
	edited_at: string | null;
	status: 'approved' | 'pending';
	is_mine: boolean;
	is_spoiler: boolean;
	upvotes: number;
	downvotes: number;
	my_vote: -1 | 0 | 1;
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
	const nicknameInput = root.querySelector<HTMLInputElement>('[name="authorName"]');
	const nicknameField = root.querySelector<HTMLElement>('[data-community-comments-nickname-field]');
	const nicknameHint = root.querySelector<HTMLElement>('[data-community-comments-nickname-hint]');
	const changeNicknameButton = root.querySelector<HTMLButtonElement>('[data-community-comments-change-nickname]');
	const nicknameDialog = root.querySelector<HTMLDialogElement>('[data-community-comments-nickname-dialog]');
	const nicknameForm = root.querySelector<HTMLFormElement>('[data-community-comments-nickname-form]');
	const newNicknameInput = root.querySelector<HTMLInputElement>('[name="nickname"]');
	const nicknameError = root.querySelector<HTMLElement>('[data-community-comments-nickname-error]');
	const cancelNickname = root.querySelector<HTMLButtonElement>('[data-community-comments-cancel-nickname]');
	const captchaTarget = root.querySelector<HTMLElement>('[data-community-comments-captcha]');
	const replying = root.querySelector<HTMLElement>('[data-community-comments-replying]');
	const cancelReply = root.querySelector<HTMLButtonElement>('[data-community-comments-cancel]');
	const messageInput = root.querySelector<HTMLTextAreaElement>('[name="body"]');
	const emojiButtons = root.querySelectorAll<HTMLButtonElement>('[data-community-comments-emoji]');

	if (!(status && list && form && replying && cancelReply && messageInput && nicknameInput && nicknameField && nicknameHint && changeNicknameButton && nicknameDialog && nicknameForm && newNicknameInput && nicknameError && cancelNickname)) return;
	const statusEl = status;
	const listEl = list;
	const formEl = form;
	const replyingEl = replying;
	const cancelReplyButton = cancelReply;
	const messageInputEl = messageInput;
	const nicknameInputEl = nicknameInput;
	const nicknameFieldEl = nicknameField;
	const nicknameHintEl = nicknameHint;
	const changeNicknameButtonEl = changeNicknameButton;
	const nicknameDialogEl = nicknameDialog;
	const nicknameFormEl = nicknameForm;
	const newNicknameInputEl = newNicknameInput;
	const nicknameErrorEl = nicknameError;
	const cancelNicknameButton = cancelNickname;
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
		await loadNickname();
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
	emojiButtons.forEach((button) => {
		button.addEventListener('click', () => insertEmoji(messageInputEl, button.dataset.communityCommentsEmoji ?? ''));
	});
	changeNicknameButtonEl.addEventListener('click', () => {
		newNicknameInputEl.value = nicknameInputEl.value;
		nicknameErrorEl.hidden = true;
		nicknameDialogEl.showModal();
		newNicknameInputEl.focus();
	});
	cancelNicknameButton.addEventListener('click', () => nicknameDialogEl.close());
	nicknameFormEl.addEventListener('submit', (event) => {
		event.preventDefault();
		void changeNickname();
	});
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
		renderMessages(listEl, (data ?? []) as CommunityMessage[], setReply, updateMessage, deleteMessage, castVote);
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
		const isSpoiler = formData.get('isSpoiler') === 'on';
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
			p_is_spoiler: isSpoiler,
		});
		if (submit) submit.disabled = false;
		if (error) {
			setStatus(
				error.message.includes('nickname unavailable')
					? 'Ese apodo ya está en uso. Elegí otro.'
					: error.message.includes('rate limit')
					? 'Esperá unos minutos antes de mandar otro mensaje.'
					: 'No pudimos enviar tu mensaje. Revisá el texto e intentá de nuevo.',
				'error',
			);
			return;
		}
		formEl.reset();
		await loadNickname();
		setReply(null);
		setStatus('Listo: tu mensaje ya está en la charla.', 'ready');
		await loadMessages();
	}

	async function loadNickname(): Promise<void> {
		const { data, error } = await client.rpc('get_community_nickname');
		if (error || typeof data !== 'string' || !data.trim()) return;
		nicknameInputEl.value = data;
		nicknameInputEl.readOnly = true;
		nicknameFieldEl.hidden = true;
		nicknameHintEl.textContent = `Publicás como ${data}.`;
		changeNicknameButtonEl.hidden = false;
	}

	async function changeNickname(): Promise<void> {
		const newNickname = newNicknameInputEl.value.trim();
		if (newNickname.length < 2) {
			nicknameErrorEl.textContent = 'Escribí un apodo de al menos 2 caracteres.';
			nicknameErrorEl.hidden = false;
			return;
		}
		const submit = nicknameFormEl.querySelector<HTMLButtonElement>('[type="submit"]');
		if (submit) submit.disabled = true;
		const { error } = await client.rpc('change_community_nickname', { p_author_name: newNickname });
		if (submit) submit.disabled = false;
		if (error) {
			nicknameErrorEl.textContent = error.message.includes('cooldown')
				? 'Ya cambiaste el apodo. Podés volver a hacerlo dentro de 15 días.'
				: error.message.includes('nickname unavailable')
					? 'Ese apodo ya está en uso. Elegí otro.'
					: 'No pudimos cambiar el apodo. Probá de nuevo.';
			nicknameErrorEl.hidden = false;
			return;
		}
		nicknameDialogEl.close();
		await loadNickname();
		setStatus('Apodo actualizado en tus mensajes.', 'ready');
		await loadMessages();
	}

	async function updateMessage(messageId: number, body: string): Promise<void> {
		const normalizedBody = body.trim();
		if (!normalizedBody) {
			setStatus('El mensaje no puede quedar vacío.', 'error');
			return;
		}
		setStatus('Guardando cambios…', 'loading');
		const { error } = await client.rpc('update_community_message', {
			p_message_id: messageId,
			p_body: normalizedBody,
		});
		if (error) {
			setStatus('No pudimos guardar los cambios. Probá de nuevo.', 'error');
			return;
		}
		setStatus('Cambios guardados.', 'ready');
		await loadMessages();
	}

	async function deleteMessage(messageId: number): Promise<void> {
		if (!window.confirm('¿Borrar este mensaje? Esta acción no se puede deshacer.')) return;
		setStatus('Borrando mensaje…', 'loading');
		const { error } = await client.rpc('delete_community_message', { p_message_id: messageId });
		if (error) {
			setStatus('No pudimos borrar el mensaje. Probá de nuevo.', 'error');
			return;
		}
		setStatus('Mensaje borrado.', 'ready');
		await loadMessages();
	}

	async function castVote(messageId: number, vote: -1 | 0 | 1): Promise<void> {
		const { error } = await client.rpc('vote_community_message', { p_message_id: messageId, p_vote: vote });
		if (error) {
			setStatus('No pudimos guardar tu reacción. Probá de nuevo.', 'error');
			return;
		}
		await loadMessages();
	}
}

function insertEmoji(input: HTMLTextAreaElement, emoji: string): void {
	if (!emoji) return;
	const start = input.selectionStart;
	const end = input.selectionEnd;
	const nextValue = `${input.value.slice(0, start)}${emoji}${input.value.slice(end)}`;
	if (nextValue.length > input.maxLength) return;
	input.setRangeText(emoji, start, end, 'end');
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.focus();
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
	onUpdate: (messageId: number, body: string) => Promise<void>,
	onDelete: (messageId: number) => Promise<void>,
	onVote: (messageId: number, vote: -1 | 0 | 1) => Promise<void>,
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
		list.append(createMessage(message, byParent, onReply, onUpdate, onDelete, onVote));
	}
}

function createMessage(
	message: CommunityMessage,
	byParent: Map<number | null, CommunityMessage[]>,
	onReply: (message: CommunityMessage) => void,
	onUpdate: (messageId: number, body: string) => Promise<void>,
	onDelete: (messageId: number) => Promise<void>,
	onVote: (messageId: number, vote: -1 | 0 | 1) => Promise<void>,
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
	if (message.edited_at) {
		const edited = document.createElement('span');
		edited.className = 'community-message__edited';
		edited.textContent = 'Editado';
		header.append(edited);
	}
	if (message.status === 'pending') {
		const pending = document.createElement('span');
		pending.className = 'community-message__pending';
		pending.textContent = 'Pendiente de revisión';
		header.append(pending);
	}
	const body = document.createElement('p');
	body.dir = 'auto';
	body.textContent = message.body;
	let messageBody: HTMLElement = body;
	if (message.is_spoiler) {
		const spoiler = document.createElement('div');
		spoiler.className = 'community-message__spoiler';
		const reveal = document.createElement('button');
		reveal.type = 'button';
		reveal.className = 'community-message__spoiler-reveal';
		reveal.textContent = '⚠ Spoiler · tocá o pasá el mouse para verlo';
		reveal.setAttribute('aria-expanded', 'false');
		reveal.addEventListener('click', () => {
			const isRevealed = spoiler.classList.toggle('is-revealed');
			reveal.setAttribute('aria-expanded', String(isRevealed));
		});
		spoiler.append(reveal, body);
		messageBody = spoiler;
	}
	const reply = document.createElement('button');
	reply.type = 'button';
	reply.textContent = 'Responder';
	reply.addEventListener('click', () => onReply(message));
	const actions = document.createElement('div');
	actions.className = 'community-message__actions';
	actions.append(reply);
	if (message.is_mine) {
		const edit = document.createElement('button');
		edit.type = 'button';
		edit.textContent = 'Editar';
		edit.addEventListener('click', () => openEditor(article, message, onUpdate));
		const remove = document.createElement('button');
		remove.type = 'button';
		remove.textContent = 'Borrar';
		remove.addEventListener('click', () => void onDelete(message.id));
		actions.append(edit, remove);
	}
	actions.append(
		createVoteButton('👍', 'Me gusta este comentario', Number(message.upvotes ?? 0), message.my_vote === 1, () => void onVote(message.id, message.my_vote === 1 ? 0 : 1)),
		createVoteButton('👎', 'No me gusta este comentario', Number(message.downvotes ?? 0), message.my_vote === -1, () => void onVote(message.id, message.my_vote === -1 ? 0 : -1)),
	);
	article.append(header, messageBody, actions);
	item.append(article);
	const replies = byParent.get(message.id) ?? [];
	if (replies.length) {
		const nested = document.createElement('ol');
		nested.className = 'community-message__replies';
		for (const child of replies) nested.append(createMessage(child, byParent, onReply, onUpdate, onDelete, onVote));
		item.append(nested);
	}
	return item;
}

function createVoteButton(icon: string, label: string, count: number, active: boolean, onClick: () => void): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'community-message__vote';
	button.classList.toggle('is-active', active);
	button.setAttribute('aria-label', label);
	button.setAttribute('aria-pressed', String(active));
	button.textContent = `${icon} ${count}`;
	button.addEventListener('click', onClick);
	return button;
}

function openEditor(
	article: HTMLElement,
	message: CommunityMessage,
	onUpdate: (messageId: number, body: string) => Promise<void>,
): void {
	if (article.querySelector('[data-community-message-editor]')) return;
	const form = document.createElement('form');
	form.className = 'community-message__editor';
	form.dataset.communityMessageEditor = '';
	const label = document.createElement('label');
	label.htmlFor = `community-message-edit-${message.id}`;
	label.textContent = 'Editar mensaje';
	const textarea = document.createElement('textarea');
	textarea.id = label.htmlFor;
	textarea.name = 'body';
	textarea.rows = 3;
	textarea.maxLength = 300;
	textarea.required = true;
	textarea.value = message.body;
	const save = document.createElement('button');
	save.type = 'submit';
	save.textContent = 'Guardar';
	const cancel = document.createElement('button');
	cancel.type = 'button';
	cancel.textContent = 'Cancelar';
	cancel.addEventListener('click', () => form.remove());
	const actions = document.createElement('div');
	actions.className = 'community-message__actions';
	actions.append(save, cancel);
	form.append(label, textarea, actions);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		void onUpdate(message.id, textarea.value);
	});
	article.append(form);
	textarea.focus();
}
