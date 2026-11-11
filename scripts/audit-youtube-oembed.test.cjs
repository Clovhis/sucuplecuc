const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { analyzeYoutubeTitle, checkYoutubeOEmbed } = require('../skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs');

function fakeGet({ primaryError = null, primaryStatus = 200, alternateStatus = 200, alternateBody } = {}) {
	const urls = [];
	const get = (url, callback) => {
		urls.push(url);
		const request = new EventEmitter();
		request.setTimeout = () => request;
		request.destroy = (error) => queueMicrotask(() => request.emit('error', error));
		const host = new URL(url).hostname;

		if (host === 'www.youtube.com' && primaryError) {
			queueMicrotask(() => request.emit('error', primaryError));
			return request;
		}

		const response = new PassThrough();
		response.statusCode = host === 'www.youtube.com' ? primaryStatus : alternateStatus;
		queueMicrotask(() => {
			callback(response);
			if (response.statusCode === 200) {
				response.end(JSON.stringify(host === 'www.youtube.com'
					? { title: 'Touch Official Trailer 2024', author_name: 'Focus Features' }
					: alternateBody ?? { title: 'TOUCH - Official Trailer [HD] - Only In Theaters July 12', author_name: 'Focus Features' }));
			} else {
				response.end('');
			}
		});
		return request;
	};
	return { get, urls };
}

test('official no-cookie oEmbed is tried only after primary-host transport failure', async () => {
	const { get, urls } = fakeGet({ primaryError: new Error('proxy tunnel blocked') });
	const result = await checkYoutubeOEmbed('y5fXuZ3ns_c', get);

	assert.deepEqual(urls.map((url) => new URL(url).hostname), ['www.youtube.com', 'www.youtube-nocookie.com']);
	assert.equal(new URL(urls[1]).searchParams.get('url'), 'https://www.youtube.com/watch?v=y5fXuZ3ns_c');
	assert.equal(result.ok, true);
	assert.equal(result.title, 'TOUCH - Official Trailer [HD] - Only In Theaters July 12');
	assert.equal(result.authorName, 'Focus Features');
	assert.equal(result.sourceHost, 'www.youtube-nocookie.com');
});

test('HTTP not-found from primary host remains an error and does not fall back', async () => {
	const { get, urls } = fakeGet({ primaryStatus: 404 });
	const result = await checkYoutubeOEmbed('y5fXuZ3ns_c', get);

	assert.equal(urls.length, 1);
	assert.equal(result.ok, false);
	assert.equal(result.statusCode, 404);
});

test('fallback metadata still fails the existing exact-title and year checks when mismatched', async () => {
	const { get } = fakeGet({
		primaryError: new Error('proxy tunnel blocked'),
		alternateBody: { title: 'Unrelated Film Official Trailer 2010', author_name: 'Unknown Channel' },
	});
	const result = await checkYoutubeOEmbed('y5fXuZ3ns_c', get);
	const analysis = analyzeYoutubeTitle({ title: 'Touch', originalTitle: 'Snerting', year: 2024 }, result.title);

	assert.equal(result.ok, true);
	assert.equal(result.authorName, 'Unknown Channel');
	assert.equal(analysis.titleLooksRelated, false);
	assert.equal(analysis.yearMentioned, true);
	assert.equal(analysis.yearMatches, false);
});
