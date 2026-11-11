import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const getArgument = (name, fallback) => {
	const index = process.argv.indexOf(name);
	return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
};

const host = getArgument('--host', '127.0.0.1');
const port = Number(getArgument('--port', '43210'));
const contentTypes = new Map([
	['.css', 'text/css; charset=utf-8'],
	['.html', 'text/html; charset=utf-8'],
	['.ico', 'image/x-icon'],
	['.js', 'text/javascript; charset=utf-8'],
	['.json', 'application/json; charset=utf-8'],
	['.mjs', 'text/javascript; charset=utf-8'],
	['.png', 'image/png'],
	['.jpg', 'image/jpeg'],
	['.jpeg', 'image/jpeg'],
	['.avif', 'image/avif'],
	['.woff', 'font/woff'],
	['.woff2', 'font/woff2'],
	['.svg', 'image/svg+xml'],
	['.webmanifest', 'application/manifest+json; charset=utf-8'],
	['.webp', 'image/webp'],
	['.xml', 'application/xml; charset=utf-8'],
]);

export function createPreviewServer({ directory = path.resolve('dist') } = {}) {
const distDirectory = path.resolve(directory);
function requestedFile(url) {
	const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
	const relativePath = pathname === '/' ? '.' : `.${pathname}`;
	const candidate = path.resolve(distDirectory, relativePath);
	if (candidate !== distDirectory && !candidate.startsWith(`${distDirectory}${path.sep}`)) {
		return null;
	}
	return pathname.endsWith('/') ? path.join(candidate, 'index.html') : candidate;
}

return createServer(async (request, response) => {
	try {
		const file = requestedFile(request.url ?? '/');
		if (!file) {
			response.writeHead(400).end('Bad request');
			return;
		}

		const fileStats = await stat(file);
		if (!fileStats.isFile()) {
			response.writeHead(404).end('Not found');
			return;
		}

		const extension = path.extname(file).toLowerCase();
		const contentType = contentTypes.get(extension) ?? 'application/octet-stream';
		let body = await readFile(file);
		if (extension === '.html') {
			// WebKit upgrades localhost subresources under this policy, while the test server is HTTP.
			// The production artifact retains the directive; only the test response omits it.
			body = Buffer.from(body.toString('utf8').replace('; upgrade-insecure-requests', ''));
		}

		// The artifact is immutable during a test run. Match Pages asset caching
		// instead of downloading/decoding every shared font/image again after each
		// navigation. HTML stays fresh; exact dist bytes are pinned by the gate.
		const etag = '"' + createHash('sha256').update(body).digest('hex') + '"';
		const headers = {
			'cache-control': extension === '.html' ? 'no-store' : 'public, max-age=600, must-revalidate',
			'content-type': contentType,
			'etag': etag,
		};
		if (extension !== '.html' && request.headers['if-none-match'] === etag) {
			response.writeHead(304, headers).end();
			return;
		}
		response.writeHead(200, { ...headers, 'content-length': body.length });
		response.end(body);
	} catch (error) {
		if (error instanceof URIError) { response.writeHead(400).end('Bad request'); return; }
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			response.writeHead(404).end('Not found');
			return;
		}
		console.error(error);
		response.writeHead(500).end('Internal server error');
	}
});
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) createPreviewServer().listen(port, host, () => {
	console.log(`E2E preview server listening on http://${host}:${port}`);
});
