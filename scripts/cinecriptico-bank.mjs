import {writeFileSync} from 'node:fs';
import {auditBank,readPrivateBank,seedSQL,assertExternal} from './lib/cinecriptico-bank.mjs';
const args=process.argv.slice(2),path=args[0];
if(!path)throw Error('Usage: node scripts/cinecriptico-bank.mjs <external-bank.json> [--require-complete] [--sql <external-seed.sql>]');
const bank=readPrivateBank(path),report=auditBank(bank,{complete:args.includes('--require-complete')});
console.log(JSON.stringify({...report,missingCount:report.missing.length,missing:report.missing.length>20?[report.missing[0],report.missing.at(-1)]:report.missing},null,2));
if(!report.valid)process.exitCode=1;
else if(args.includes('--sql')) {
 const output=assertExternal(args[args.indexOf('--sql')+1]);
 writeFileSync(output,seedSQL(bank),{mode:0o600});
 console.log('Private seed written outside repository. Apply via a trusted administrative connection; never put it in Git.');
}
