import type { HomeMovieRecord } from '../types/home-catalog';
import { getPlatformPresentation } from '../lib/platforms';

// Keep the existing MovieCard classes/semantics; create only the requested page.
// textContent and attributes keep catalog strings out of HTML interpolation.
export function createHomeMovieCard(entry: HomeMovieRecord): HTMLElement {
	const node = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] => {
		const element = document.createElement(tag);
		element.className = className;
		if (text !== undefined) element.textContent = text;
		return element;
	};
	const image = (className: string, src: string, alt: string, width: number, height: number): HTMLImageElement => {
		const img = node('img', className);
		img.src = src; img.alt = alt; img.width = width; img.height = height;
		img.loading = 'lazy'; img.decoding = 'async';
		return img;
	};
	const card = node('article', `movie-card movie-card--${entry.card.verdictClass}`);
	Object.assign(card.dataset, {
		movieCard: '', movieSearch: entry.searchable, movieTitle: entry.title, movieYear: entry.year,
		movieScore: entry.score === null ? '' : String(entry.score), movieGenres: entry.genres.join(','),
		movieSubgenres: entry.subgenres.join(','), moviePrimaryGenre: entry.primaryGenre,
		moviePlatforms: entry.platforms.join(','), movieReleaseTimestamp: String(entry.releaseTimestamp),
		movieRecentPremiere: String(entry.recentPremiere), movieAbsoluteCinema: String(entry.score === 10),
		movieUrl: entry.url, moviePosterUrl: entry.posterUrl, movieMeta: entry.meta, movieCast: entry.cast,
	});
	const link = node('a', 'movie-card__link');
	link.href = entry.url;
	link.setAttribute('aria-label', `Ver detalle de ${entry.title}`);
	const media = node('div', 'movie-card__poster-wrap');
	const poster = image('movie-card__poster', entry.posterUrl, `Poster de ${entry.title}`, 480, 720);
	poster.referrerPolicy = 'no-referrer';
	Object.assign(poster.dataset, { moviePoster: '', cinepostaPoster: 'true', posterSearchTitle: entry.title, posterSearchYear: entry.year });
	media.append(poster);
	const base = import.meta.env.BASE_URL;
	if (entry.score === 10) media.append(image('absolute-cinema-sticker movie-sticker movie-card__absolute-cinema-sticker', `${base}AbsoluteCinema.png`, 'Absolute Cinema', 1254, 1254));
	if (entry.card.cult) media.append(image('cult-movie-sticker movie-sticker movie-card__cult-movie-sticker', `${base}DeCulto.png`, 'De culto', 1254, 1254));
	media.append(node('span', `badge movie-card__badge ${entry.card.verdictClass}`, entry.card.verdictLabel));
	const body = node('div', 'movie-card__body');
	const header = node('div', 'movie-card__header');
	header.append(node('h2', '', entry.title));
	const footer = node('div', 'movie-card__footer');
	const meta = node('div', 'movie-card__meta');
	meta.append(node('p', 'movie-card__year', entry.year));
	const genres = node('div', `movie-card__genres${entry.card.genreLabels.length > 1 ? ' movie-card__genres--multiple' : ''}`);
	genres.setAttribute('aria-label', 'Géneros');
	genres.append(...entry.card.genreLabels.map((label) => node('p', 'movie-card__cta', label)));
	footer.append(meta, genres, node('p', 'movie-card__audience-rating', entry.card.audienceRating));
	const labels = [...new Set(entry.card.platformLabels)].slice(0, 2);
	if (labels.length) {
		const group = node('span', `platform-badge-group platform-badge-group--tile platform-badge-group--count-${labels.length} movie-card__platform-mark`);
		for (const label of labels) {
			const p = getPlatformPresentation(label, { mode: 'tile' });
			const badge = node('span', `platform-mark platform-mark--tile${p.variant === 'default' ? '' : ` platform-chip--${p.variant}`} platform-badge-group__item`);
			const styled = p.variant !== 'default' || p.accessibilityLabel !== p.displayLabel;
			if (styled) badge.setAttribute('aria-label', `Plataforma: ${p.accessibilityLabel}`);
			if (p.variant === 'cine') badge.append(node('span', 'platform-chip__cine-label', p.displayLabel));
			else if (p.isKnownPlatform && p.asset) badge.append(image(`platform-chip__logo${p.asset.wide ? ' platform-chip__logo--wide' : ''}`, p.asset.src, '', 96, 32));
			else if (p.variant === 'other-platforms') {
				const stacked = node('span', 'platform-mark__label platform-label--stacked');
				stacked.setAttribute('aria-hidden', 'true');
				stacked.append(node('span', '', 'Otras'), node('span', '', 'plataformas'));
				badge.append(stacked);
			} else badge.append(node('span', 'platform-mark__label', p.displayLabel));
			if (styled) badge.append(node('span', 'u-visually-hidden', p.accessibilityLabel));
			group.append(badge);
		}
		footer.append(group);
	}
	body.append(header, footer);
	link.append(media, body);
	card.append(link);
	return card;
}
