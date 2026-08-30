import { communitySupabase, isSupabaseConfigured } from '../lib/supabaseClient';

type CommunityDiscussion = {
	movie_slug: string;
	movie_title: string;
	last_activity: string;
	message_count: number;
	last_author_name: string;
};

type DiscussionVisual = {
	posterSrc: string;
	title: string;
	year: number;
	facts: string;
};

const list = document.querySelector<HTMLUListElement>('[data-community-discussion-list]');
const visualCatalog = readVisualCatalog();
const discussionVisuals = new Map<string, DiscussionVisual>(
	list
		? [...list.children].map((item) => {
			const element = item as HTMLElement;
			return [
				element.dataset.communityDiscussionSlug ?? '',
				{
					posterSrc: element.querySelector<HTMLImageElement>('.community-discussion-list__poster')?.src ?? '',
					title: element.querySelector('strong')?.textContent?.trim() ?? '',
					year: Number.parseInt(element.dataset.communityDiscussionFacts?.match(/\d{4}/)?.[0] ?? '', 10),
					facts: element.dataset.communityDiscussionFacts ?? '',
				},
			];
		})
		: [],
);

if (list && isSupabaseConfigured && communitySupabase) {
	void refreshDiscussions();
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) void refreshDiscussions();
	});
	window.setInterval(() => {
		if (!document.hidden) void refreshDiscussions();
	}, 15000);
}

async function refreshDiscussions(): Promise<void> {
	if (!list || !communitySupabase) return;
	const { data, error } = await communitySupabase.rpc('list_community_discussions', { p_limit: 24 });
	if (error || !data?.length) return;
	const active = data as CommunityDiscussion[];
	active.forEach((discussion) => loadDiscussionVisual(discussion.movie_slug));
	const fallback = new Map(
		[...list.children].map((item) => [(item as HTMLElement).dataset.communityDiscussionSlug ?? '', item]),
	);
	const fragment = document.createDocumentFragment();
	for (const discussion of active) {
		fragment.append(createDiscussionItem(discussion));
		fallback.delete(discussion.movie_slug);
	}
	for (const item of fallback.values()) fragment.append(item);
	list.replaceChildren(fragment);
}

function readVisualCatalog(): Record<string, DiscussionVisual> {
	const source = document.querySelector<HTMLScriptElement>('#community-discussion-visuals');
	if (!source?.textContent) return {};
	try {
		return JSON.parse(source.textContent) as Record<string, DiscussionVisual>;
	} catch {
		return {};
	}
}

function loadDiscussionVisual(slug: string): void {
	if (discussionVisuals.get(slug)?.posterSrc) return;
	const visual = visualCatalog[slug];
	if (visual?.posterSrc) discussionVisuals.set(slug, visual);
}

function createDiscussionItem(discussion: CommunityDiscussion): HTMLLIElement {
	const item = document.createElement('li');
	item.dataset.communityDiscussionSlug = discussion.movie_slug;
	const visual = discussionVisuals.get(discussion.movie_slug);
	if (visual?.facts) item.dataset.communityDiscussionFacts = visual.facts;
	const link = document.createElement('a');
	link.href = new URL(`peliculas/${encodeURIComponent(discussion.movie_slug)}/`, window.location.href).pathname;
	if (visual?.posterSrc) {
		const poster = document.createElement('img');
		poster.className = 'community-discussion-list__poster';
		poster.src = visual.posterSrc;
		poster.alt = '';
		poster.dataset.cinepostaPoster = 'true';
		poster.dataset.posterSearchTitle = discussion.movie_title || visual.title;
		if (Number.isInteger(visual.year)) poster.dataset.posterSearchYear = String(visual.year);
		poster.loading = 'lazy';
		poster.decoding = 'async';
		poster.referrerPolicy = 'no-referrer';
		link.append(poster);
	} else {
		item.classList.add('community-discussion-list__item--without-poster');
	}
	const body = document.createElement('span');
	body.className = 'community-discussion-list__body';
	const title = document.createElement('strong');
	title.textContent = discussion.movie_title;
	const meta = document.createElement('span');
	meta.className = 'community-discussion-list__facts';
	const activityIsRecent = Date.now() - new Date(discussion.last_activity).getTime() < 24 * 60 * 60 * 1000;
	const lastAuthor = discussion.last_author_name?.trim() || 'alguien de la comunidad';
	if (activityIsRecent) {
		const indicator = document.createElement('span');
		indicator.className = 'community-discussion-list__activity';
		indicator.setAttribute('aria-label', 'Actividad reciente');
		const dot = document.createElement('span');
		dot.setAttribute('aria-hidden', 'true');
		indicator.append(dot, document.createTextNode(`Actividad reciente · último posteo por ${lastAuthor}`));
		meta.append(indicator);
	} else {
		meta.textContent = `${visual?.facts ? `${visual.facts} · ` : ''}${discussion.message_count} mensajes · último posteo por ${lastAuthor}`;
	}
	body.append(title, meta);
	link.append(body);
	item.append(link);
	return item;
}
