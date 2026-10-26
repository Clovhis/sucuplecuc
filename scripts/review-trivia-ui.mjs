// Native Chromium CDP review, without Playwright. Isolated browser and marked temporary Auth users.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const base = process.env.TRIVIA_REVIEW_URL ?? 'http://localhost:4321';
const output = path.resolve(process.env.TRIVIA_REVIEW_OUTPUT ?? 'test-results/trivia-review');
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error('SUPABASE_ACCESS_TOKEN is required to clean up temporary test identities.');
const source = readFileSync(new URL('../src/lib/supabaseClient.ts', import.meta.url), 'utf8');
const endpoint = source.match(/DEFAULT_SUPABASE_URL = '([^']+)'/)[1];
const key = source.match(/DEFAULT_SUPABASE_ANON_KEY = '([^']+)'/)[1];
const ref = new URL(endpoint).hostname.split('.')[0];
const marker = randomUUID();
const temporaryRoot = path.resolve('.tmp');
const profile = path.join(temporaryRoot, `trivia-browser-${marker}`);
const executable = process.env.TRIVIA_REVIEW_BROWSER ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sizes = [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 600, height: 900 }, { width: 768, height: 1024 }, { width: 1024, height: 900 }, { width: 1440, height: 1000 }, { width: 844, height: 390 }];
const users = [];
const clients = [];
const report = { base, browser: 'Microsoft Edge / native CDP', sizes, checks: [], exceptions: [], network: [], completed: false };
let browser, socket;
let sequence = 0;
const pending = new Map();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function query(sql, parameters = []) {
	const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sql, parameters }) });
	if (!response.ok) throw new Error(`Database review request failed: ${response.status} ${(await response.text()).slice(0, 200)}`);
	return response.json();
}
function cdp(method, params = {}) {
	return new Promise((resolve, reject) => {
		const id = ++sequence;
		const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
		pending.set(id, { resolve, reject, timeout }); socket.send(JSON.stringify({ id, method, params }));
	});
}
async function evaluate(expression) {
	const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
	if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
	return result.result.value;
}
async function waitFor(expression, timeout = 15000) {
	const start = Date.now();
	while (Date.now() - start < timeout) { if (await evaluate(expression)) return; await delay(100); }
	throw new Error(`UI wait failed: ${expression}`);
}
async function click(selector, mobile = true) {
	const position = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Control unavailable');e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
	if (mobile) { await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: position.x, y: position.y }] }); await delay(70); await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
	else { await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...position, button: 'left', clickCount: 1 }); await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...position, button: 'left', clickCount: 1 }); }
}
async function fill(selector, text) {
	await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.focus();e.value='';e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
	await cdp('Input.insertText', { text });
}
async function viewport(size) {
	await cdp('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1, mobile: size.width <= 600 });
	await cdp('Emulation.setTouchEmulationEnabled', { enabled: size.width <= 600, maxTouchPoints: 1 });
	await delay(70);
}
async function inspect(stage, size, screenshot = true) {
	await viewport(size);
	await evaluate('window.scrollTo(0,0)');
	const check = await evaluate(`(()=>{
	 const visible=e=>e.getClientRects().length&&!e.closest('[hidden]')&&getComputedStyle(e).visibility!=='hidden';
	 const root=document.querySelector('[data-trivia]');
	 const overflow=[...root.querySelectorAll('*')].filter(visible).map(e=>({e,r:e.getBoundingClientRect()})).filter(({r})=>r.left< -1||r.right>innerWidth+1).map(({e,r})=>({tag:e.tagName,cls:e.className?.baseVal??e.className,left:Math.round(r.left),right:Math.round(r.right)}));
	 const controls=[...root.querySelectorAll('button,input,select,a,summary')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:e.textContent.trim().slice(0,40),width:r.width,height:r.height,font:parseFloat(getComputedStyle(e).fontSize)};});
	 const portraits=[...root.querySelectorAll('.trivia-clue-portrait')].filter(visible).map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
	 const poster=root.querySelector('.trivia-movie-reveal img');const posterRect=poster&&visible(poster)?poster.getBoundingClientRect():null;
	 return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow,controls,portraits,revealPoster:posterRect?{width:posterRect.width,height:posterRect.height}:null};
	})()`);
	report.checks.push({ stage, ...check });
	assert.ok(check.portraits.every((portrait) => portrait.width === 72 && portrait.height === 72), 'All clue portraits must keep the same frame size.');
	if(check.revealPoster)assert.ok(Math.abs(check.revealPoster.height/check.revealPoster.width-1.5)<0.02,'The revealed poster must keep its 2:3 ratio.');
	if (screenshot) {
		const metrics = await cdp('Page.getLayoutMetrics');
		const image = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: size.width, height: Math.min(metrics.cssContentSize.height, 12000), scale: 1 } });
		writeFileSync(path.join(output, `${stage}-${size.width}.png`), Buffer.from(image.data, 'base64'));
	}
}
async function inspectAll(stage) { for (const size of sizes) await inspect(stage, size); }
async function rpc(client, name, params = {}) { const response = await client.rpc(name, params); if (response.error) throw new Error(response.error.message); return response.data; }

try {
	mkdirSync(output, { recursive: true }); mkdirSync(profile, { recursive: true });
	for (let index = 0; index < 2; index++) {
		const client = createClient(endpoint, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }); clients.push(client);
		const { data, error } = await client.auth.signInAnonymously({ options: { data: { cineposta_trivia_review: marker } } });
		if (error) throw new Error(error.message); users.push(data.user.id);
	}
	const session = (await clients[0].auth.getSession()).data.session;
	const name = `QA${marker.replaceAll('-', '').slice(0, 22)}`;
	const occupied = `Ocupado${marker.slice(0, 8)}`;
	await rpc(clients[1], 'claim_trivia_player', { p_name: occupied, p_country: 'UY', p_age: 25 });
	browser = spawn(executable, ['--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
	for (let tries = 0; !existsSync(path.join(profile, 'DevToolsActivePort')); tries++) { if (tries > 150) throw new Error('Browser did not start'); await delay(100); }
	const port = readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
	const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
	socket = new WebSocket(pages.find((entry) => entry.type === 'page').webSocketDebuggerUrl);
	await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
	socket.addEventListener('message', (event) => { const response = JSON.parse(event.data); if (response.id && pending.has(response.id)) { const item = pending.get(response.id); pending.delete(response.id); clearTimeout(item.timeout); response.error ? item.reject(new Error(response.error.message)) : item.resolve(response.result); } else if (response.method === 'Runtime.exceptionThrown') report.exceptions.push(response.params.exceptionDetails.exception?.description ?? response.params.exceptionDetails.text); else if(response.method==='Network.responseReceived'&&response.params.response.status>=400)report.network.push({status:response.params.response.status,url:response.params.response.url.split('?')[0]}); else if(response.method==='Network.loadingFailed')report.network.push({error:response.params.errorText,type:response.params.type}); });
	await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
	await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
	await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `if(location.origin===${JSON.stringify(new URL(base).origin)})localStorage.setItem('cineposta-trivia-auth-v1',${JSON.stringify(JSON.stringify(session))});` });
	await viewport(sizes[1]); await cdp('Page.navigate', { url: `${base}/juegos/trivia/` });
	await waitFor("document.readyState==='complete'&&document.querySelector('[data-start]')"); await evaluate('document.fonts.ready');
	await inspectAll('landing'); await viewport(sizes[0]);
	await evaluate("window.__triviaReviewEvents=[];for(const name of ['pointerdown','pointerup','touchstart','touchend','click'])document.addEventListener(name,e=>window.__triviaReviewEvents.push({event:name,tag:e.target.tagName,start:e.target.hasAttribute?.('data-start')}),true);");
	await click('[data-start]');
	await waitFor("!document.querySelector('[data-player]').hidden&&!document.querySelector('[data-player-status]').textContent.includes('Buscando')");
	await fill('[data-player-name]', 'Hitler'); await waitFor("!document.querySelector('[data-nickname-error]').hidden&&document.querySelector('[data-player-submit]').disabled");
	await inspect('blocked-name', sizes[0]);
	await fill('[data-player-name]', occupied); await waitFor("document.querySelector('[data-nickname-error]').textContent.includes('dueño')");
	await fill('[data-player-name]', name);
	await evaluate("document.querySelector('[data-player-country]').value='AR';document.querySelector('[data-player-country]').dispatchEvent(new Event('change',{bubbles:true}));");
	await fill('[data-player-age]', '30'); await waitFor("!document.querySelector('[data-player-submit]').disabled");
	await inspectAll('profile'); await viewport(sizes[1]); await click('[data-player-submit]');
	await waitFor("!document.querySelector('[data-game]').hidden&&document.querySelectorAll('[data-choice]').length===3&&!document.querySelector('[data-choice]').disabled");
	let state = await rpc(clients[0], 'get_trivia_game');
	assert.equal(await evaluate("document.querySelectorAll('[data-choices] small').length"), 0);
	const deck = (await query('select questions from public.trivia_games where id=$1 and owner_id=$2',[state.id,users[0]]))[0].questions;
	assert.ok(deck.filter(q=>q.family==='story').length>=12);
	assert.ok(deck.filter(q=>q.family==='credits').length<=6);
	assert.ok(deck.every(q=>!/\b(?:18|19|20)\d{2}\b/.test(q.prompt)));
	report.questionMix = Object.fromEntries(['story','credits','extra'].map(f=>[f,deck.filter(q=>q.family===f).length]));
	await inspectAll('question'); await viewport(sizes[1]); await click('[data-use-hint]');
	await waitFor("document.querySelector('[data-hints-count]').textContent==='2/3'");
	const correct = async () => (await query("select questions->round->'answer'->>'slug' as answer from public.trivia_games where id=$1 and owner_id=$2", [state.id, users[0]]))[0].answer;
	await click(`[data-choice="${await correct()}"]`);
	await waitFor("!document.querySelector('[data-next]').hidden&&!document.querySelector('[data-next]').disabled");
	assert.ok(await evaluate("document.querySelector('[data-feedback]').textContent.includes('¡Esa es!')"));
	assert.equal(await evaluate("document.querySelectorAll('[data-choices] small').length"), 3);
	await inspectAll('correct');
	let pairReviewed = false, storyReviewed = state.question.kind === 'La historia';
	for (let round = 1; round < 20; round++) {
		await viewport(sizes[1]); await click('[data-next]');
		await waitFor(`document.querySelector('[data-round]').textContent.includes('${String(round + 1).padStart(2, '0')} /')&&!document.querySelector('[data-choice]').disabled`);
		state = await rpc(clients[0], 'get_trivia_game');
		assert.equal(await evaluate("document.querySelectorAll('[data-choices] small').length"), 0);
		if (!storyReviewed && state.question.kind === 'La historia') { await inspectAll('story-question'); storyReviewed=true; await viewport(sizes[1]); }
		if (!pairReviewed && state.question.people.length >= 2) { for (const size of [sizes[0],sizes[1],sizes[3]]) await inspect('two-people',size); pairReviewed=true; await viewport(sizes[1]); }
		if (round === 1) {
			const answer = await correct(); const wrong = state.question.options.find((option) => option.slug !== answer).slug;
			await click(`[data-choice="${wrong}"]`); await waitFor("!document.querySelector('[data-next]').hidden"); await inspect('incorrect', sizes[1]); continue;
		}
		if (round === 2) {
			await cdp('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
			await click('[data-choice]'); await waitFor("!document.querySelector('[data-game-connection]').hidden"); await inspect('offline', sizes[1]);
			await cdp('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
			await click('[data-retry-game]'); await waitFor("document.querySelector('[data-game-connection]').hidden&&!document.querySelector('[data-choice]').disabled");
			assert.equal((await rpc(clients[0], 'get_trivia_game')).deadlineMs, state.deadlineMs);
			await query("update public.trivia_games set deadline=clock_timestamp()-interval '1 second' where id=$1 and owner_id=$2", [state.id, users[0]]);
			await cdp('Page.reload'); await waitFor("!document.querySelector('[data-game]').hidden&&!document.querySelector('[data-next]').hidden"); await inspect('timeout-recovered', sizes[0]); continue;
		}
		await click(`[data-choice="${await correct()}"]`);
		await waitFor(round === 19 ? "!document.querySelector('[data-summary]').hidden" : "!document.querySelector('[data-next]').hidden&&!document.querySelector('[data-next]').disabled");
	}
	assert.ok(storyReviewed); assert.ok(pairReviewed);
	state = await rpc(clients[0], 'get_trivia_game');
	assert.equal(state.answers.filter((answer) => answer.correct).length, 18); assert.equal(state.bonus, 500); assert.equal(state.phase, 'finished');
	assert.equal(await evaluate("document.querySelectorAll('[data-results] .trivia-result').length"), 20);
	assert.equal(await evaluate("Number(document.querySelector('[data-final-points]').textContent.replace(/\\D/g,''))"), state.score);
	await inspectAll('summary');
	for (const result of state.answers) { const response = await fetch(new URL(urlPath(result.movie.slug), base)); assert.equal(response.status, 200); }
	await click('[data-replay]'); await waitFor("document.querySelector('[data-player-name]').readOnly"); assert.equal(await evaluate("document.querySelector('[data-player-name]').value"), name);
	report.completed = true;
} catch (error) {
	if (socket?.readyState === WebSocket.OPEN) {
		report.failure = { message: error.message, ui: await evaluate("({playerHidden:document.querySelector('[data-player]')?.hidden,gameHidden:document.querySelector('[data-game]')?.hidden,playerStatus:document.querySelector('[data-player-status]')?.textContent,gameError:document.querySelector('[data-game-error]')?.textContent,events:window.__triviaReviewEvents})") };
		const image = await cdp('Page.captureScreenshot', { format: 'png' }); writeFileSync(path.join(output, 'failure.png'), Buffer.from(image.data, 'base64'));
	}
	throw error;
} finally {
	try { if (socket?.readyState === WebSocket.OPEN) await cdp('Browser.close'); } catch { /* Closing the browser also closes CDP. */ }
	socket?.close();
	if (browser && browser.exitCode === null) { await Promise.race([new Promise((resolve) => browser.once('exit', resolve)), delay(3000)]); if (browser.exitCode === null) browser.kill(); }
	if (users.length) {
		const parameters = [JSON.stringify(users), marker];
		const owners = "select id from auth.users where id in(select value::uuid from jsonb_array_elements_text($1::jsonb)) and raw_user_meta_data->>'cineposta_trivia_review'=$2";
		for (const sql of [`delete from public.trivia_verified_scores where player_id in(select id from public.trivia_players where owner_id in(${owners}))`, `delete from public.trivia_seen_questions where player_id in(select id from public.trivia_players where owner_id in(${owners}))`, `delete from public.trivia_games where owner_id in(${owners})`, `delete from public.trivia_players where owner_id in(${owners})`, `delete from auth.users where id in(${owners})`]) await query(sql, parameters);
		const remaining=await query('select count(*)::int as n from auth.users where id in(select value::uuid from jsonb_array_elements_text($1::jsonb))',[JSON.stringify(users)]);assert.equal(remaining[0].n,0);
	}
	for (const client of clients) client.auth.stopAutoRefresh();
	assert.ok(profile.startsWith(`${temporaryRoot}${path.sep}`) && path.basename(profile).startsWith('trivia-browser-'));
	try { rmSync(profile, { recursive: true, force: true }); } catch { /* A delayed Edge exit may keep a profile lock briefly. */ }
	writeFileSync(path.join(output, 'review.json'), JSON.stringify(report, null, 2));
	console.log(JSON.stringify({ completed: report.completed, checks: report.checks.length, exceptions: report.exceptions, overflow: report.checks.filter((check) => check.overflow.length).map((check) => ({ stage: check.stage, width: check.width, elements: check.overflow })), smallControls: report.checks.filter((check) => check.width <= 1024).flatMap((check) => check.controls.filter((control) => control.height < 43 || control.width < 43 || (['INPUT','SELECT'].includes(control.tag) && control.font < 16)).map((control) => ({ stage: check.stage, viewport: check.width, ...control }))) }));
}
function urlPath(slug) { return `/peliculas/${encodeURIComponent(slug)}/`; }
