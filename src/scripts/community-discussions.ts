import { communitySupabase, isSupabaseConfigured } from '../lib/supabaseClient';

type CommunityDiscussion = {
	movie_slug: string;
	movie_title: string;
	last_activity: string;
	message_count: number;
};

const list = document.querySelector<HTMLUListElement>('[data-community-discussion-list]');

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

function createDiscussionItem(discussion: CommunityDiscussion): HTMLLIElement {
	const item = document.createElement('li');
	item.dataset.communityDiscussionSlug = discussion.movie_slug;
	const link = document.createElement('a');
	link.href = new URL(`peliculas/${encodeURIComponent(discussion.movie_slug)}/`, window.location.href).pathname;
	const title = document.createElement('strong');
	title.textContent = discussion.movie_title;
	const meta = document.createElement('span');
	const activityIsRecent = Date.now() - new Date(discussion.last_activity).getTime() < 24 * 60 * 60 * 1000;
	if (activityIsRecent) {
		const indicator = document.createElement('span');
		indicator.className = 'community-discussion-list__activity';
		indicator.setAttribute('aria-label', 'Actividad reciente');
		const dot = document.createElement('span');
		dot.setAttribute('aria-hidden', 'true');
		indicator.append(dot, document.createTextNode('Actividad reciente'));
		meta.append(indicator);
	} else {
		meta.textContent = `${discussion.message_count} mensajes`;
	}
	link.append(title, meta);
	item.append(link);
	return item;
}
