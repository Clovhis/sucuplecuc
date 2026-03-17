import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { google } from 'googleapis';

const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const WRITE_SCOPE = 'https://www.googleapis.com/auth/webmasters';
const DEFAULT_SITE_URL = process.env.GSC_SITE_URL || 'https://www.cineposta.com.ar/';

function printUsage() {
	console.log(`Usage:
  node scripts/gsc.mjs sites
  node scripts/gsc.mjs submit-sitemap [--site <site-url>] [--sitemap <sitemap-url>]
  node scripts/gsc.mjs queries [--site <site-url>] [--days <n>] [--limit <n>]
  node scripts/gsc.mjs pages [--site <site-url>] [--days <n>] [--limit <n>]
  node scripts/gsc.mjs inspect --url <absolute-url> [--site <site-url>] [--language <code>]

Auth env:
  GSC_SITE_URL
  GSC_SERVICE_ACCOUNT_KEY_PATH
  GOOGLE_APPLICATION_CREDENTIALS
  GSC_SERVICE_ACCOUNT_KEY_JSON
`);
}

function parseArgs(argv) {
	const args = { _: [] };

	for (let index = 0; index < argv.length; index += 1) {
		const value = argv[index];
		if (!value.startsWith('--')) {
			args._.push(value);
			continue;
		}

		const key = value.slice(2);
		const nextValue = argv[index + 1];
		if (!nextValue || nextValue.startsWith('--')) {
			args[key] = true;
			continue;
		}

		args[key] = nextValue;
		index += 1;
	}

	return args;
}

function normalizeSiteUrl(value) {
	if (!value) {
		throw new Error('Missing Search Console site URL.');
	}

	return value.endsWith('/') ? value : `${value}/`;
}

async function loadServiceAccountCredentials() {
	if (process.env.GSC_SERVICE_ACCOUNT_KEY_JSON) {
		return JSON.parse(process.env.GSC_SERVICE_ACCOUNT_KEY_JSON);
	}

	let credentialsPath =
		process.env.GSC_SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;

	if (!credentialsPath) {
		const credentialsDir = path.resolve(process.cwd(), 'credentials');
		try {
			const entries = await fs.readdir(credentialsDir, { withFileTypes: true });
			const jsonFiles = entries
				.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
				.map((entry) => path.join(credentialsDir, entry.name));

			if (jsonFiles.length === 1) {
				credentialsPath = jsonFiles[0];
			}
		} catch {
			// Ignore auto-discovery failures and fall back to the explicit env vars error below.
		}
	}

	if (!credentialsPath) {
		throw new Error(
			'Missing credentials. Set GSC_SERVICE_ACCOUNT_KEY_PATH, GOOGLE_APPLICATION_CREDENTIALS, or GSC_SERVICE_ACCOUNT_KEY_JSON.',
		);
	}

	const raw = await fs.readFile(credentialsPath, 'utf8');
	return JSON.parse(raw);
}

async function createSearchConsoleClient({ writeAccess = false } = {}) {
	const credentials = await loadServiceAccountCredentials();
	const auth = new google.auth.GoogleAuth({
		credentials,
		scopes: [writeAccess ? WRITE_SCOPE : READONLY_SCOPE],
	});

	return google.searchconsole({
		version: 'v1',
		auth,
	});
}

function getDateRange(days) {
	const numericDays = Number(days);
	if (!Number.isFinite(numericDays) || numericDays < 1) {
		throw new Error(`Invalid --days value "${String(days)}".`);
	}

	const endDate = new Date();
	endDate.setUTCDate(endDate.getUTCDate() - 1);
	const startDate = new Date(endDate);
	startDate.setUTCDate(startDate.getUTCDate() - numericDays + 1);

	const format = (value) => value.toISOString().slice(0, 10);
	return {
		startDate: format(startDate),
		endDate: format(endDate),
	};
}

function toTable(rows) {
	return rows.map((row) => ({
		keys: row.keys ?? [],
		clicks: row.clicks ?? 0,
		impressions: row.impressions ?? 0,
		ctr: row.ctr ?? 0,
		position: row.position ?? 0,
	}));
}

async function listSites() {
	const client = await createSearchConsoleClient();
	const response = await client.sites.list();
	const entries = response.data.siteEntry ?? [];
	if (entries.length === 0) {
		console.log('No Search Console properties available for these credentials.');
		return;
	}

	console.table(
		entries.map((entry) => ({
			siteUrl: entry.siteUrl,
			permissionLevel: entry.permissionLevel,
		})),
	);
}

async function submitSitemap(args) {
	const siteUrl = normalizeSiteUrl(args.site || DEFAULT_SITE_URL);
	const sitemapUrl = args.sitemap || `${siteUrl}sitemap.xml`;
	const client = await createSearchConsoleClient({ writeAccess: true });

	await client.sitemaps.submit({
		siteUrl,
		feedpath: sitemapUrl,
	});

	console.log(`Submitted sitemap: ${sitemapUrl}`);
}

async function runSearchAnalytics(args, dimensions) {
	const siteUrl = normalizeSiteUrl(args.site || DEFAULT_SITE_URL);
	const limit = Number(args.limit || 25);
	const { startDate, endDate } = getDateRange(args.days || 28);
	const client = await createSearchConsoleClient();

	const response = await client.searchanalytics.query({
		siteUrl,
		requestBody: {
			startDate,
			endDate,
			dimensions,
			rowLimit: limit,
		},
	});

	console.log(`${dimensions.join(' + ')} from ${startDate} to ${endDate}`);
	console.table(toTable(response.data.rows ?? []));
}

async function inspectUrl(args) {
	const siteUrl = normalizeSiteUrl(args.site || DEFAULT_SITE_URL);
	const inspectionUrl = args.url;
	if (!inspectionUrl) {
		throw new Error('Missing --url for inspect command.');
	}

	const client = await createSearchConsoleClient();
	const response = await client.urlInspection.index.inspect({
		requestBody: {
			inspectionUrl,
			siteUrl,
			languageCode: args.language || 'es-AR',
		},
	});

	console.log(JSON.stringify(response.data, null, 2));
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const command = args._[0];

	switch (command) {
		case 'sites':
			await listSites();
			break;
		case 'submit-sitemap':
			await submitSitemap(args);
			break;
		case 'queries':
			await runSearchAnalytics(args, ['query']);
			break;
		case 'pages':
			await runSearchAnalytics(args, ['page']);
			break;
		case 'inspect':
			await inspectUrl(args);
			break;
		case 'help':
		case undefined:
			printUsage();
			break;
		default:
			throw new Error(`Unknown command "${command}".`);
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
