import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const getArgument = (name, fallback) => {
	const index = process.argv.indexOf(name);
	return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
};

const host = getArgument('--host', '127.0.0.1');
const port = Number(getArgument('--port', '43210'));
const distDirectory = path.resolve('dist');
const contentTypes = new Map([
	['.css', 'text/css; charset=utf-8'],
	['.html', 'text/html; charset=utf-8'],
	['.ico', 'image/x-icon'],
	['.js', 'text/javascript; charset=utf-8'],
	['.json', 'application/json; charset=utf-8'],
	['.mjs', 'text/javascript; charset=utf-8'],
	['.png', 'image/png'],
	['.svg', 'image/svg+xml'],
	['.webmanifest', 'application/manifest+json; charset=utf-8'],
	['.webp', 'image/webp'],
	['.xml', 'application/xml; charset=utf-8'],
]);

function requestedFile(url) {
	const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
	const relativePath = pathname === '/' ? '.' : `.${pathname}`;
	const candidate = path.resolve(distDirectory, relativePath);
	if (candidate !== distDirectory && !candidate.startsWith(`${distDirectory}${path.sep}`)) {
		return null;
	}
	return pathname.endsWith('/') ? path.join(candidate, 'index.html') : candidate;
}

const server = createServer(async (request, response) => {
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

		response.writeHead(200, {
			'cache-control': 'no-store',
			'content-type': contentType,
		});
		response.end(body);
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			response.writeHead(404).end('Not found');
			return;
		}
		console.error(error);
		response.writeHead(500).end('Internal server error');
	}
});

server.listen(port, host, () => {
	console.log(`E2E preview server listening on http://${host}:${port}`);
});
