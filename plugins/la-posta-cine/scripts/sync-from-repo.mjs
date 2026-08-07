import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..', '..', '..');
const sourceSkills = resolve(repositoryRoot, 'skills');
const packagedSkills = resolve(scriptDirectory, '..', 'skills');

await mkdir(packagedSkills, { recursive: true });
await cp(sourceSkills, packagedSkills, { recursive: true, force: true });

const skillDirectories = await readdir(packagedSkills, { withFileTypes: true });
for (const skillDirectory of skillDirectories) {
	if (!skillDirectory.isDirectory()) continue;
	const agentManifest = resolve(packagedSkills, skillDirectory.name, 'agents', 'openai.yaml');
	try {
		const bytes = await readFile(agentManifest);
		let contents;
		try {
			contents = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
		} catch {
			contents = new TextDecoder('windows-1252').decode(bytes);
		}
		await writeFile(agentManifest, contents, 'utf8');
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}

const auditScript = resolve(packagedSkills, 'la-posta-cine-auditor', 'scripts', 'audit_recent_movies.cjs');
try {
	const contents = await readFile(auditScript, 'utf8');
	await writeFile(auditScript, contents.replace(/(?:\r?\n){2,}$/, '\n'), 'utf8');
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}

console.log(`Synced Cine Posta skills from ${sourceSkills}`);
