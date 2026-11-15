import {test,expect,type Page} from '@playwright/test';
const id='11111111-1111-4111-8111-111111111111';
// Match preview-e2e.mjs for WebKit against local HTTP; production keeps its HTTPS policy.
test.beforeEach(async({page,baseURL})=>{
 if(!baseURL)return;const url=new URL('/juegos/cinecriptico/',baseURL);
 if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname))return;
 await page.route(url.href,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('; upgrade-insecure-requests','')});});
});
async function game(page:Page,{midnight=false,noProfile=false,movieSlug='vertigo-1958' as string|null,corruptPending=null as string|null,expiredSession=false}={}) {
 if(midnight)await page.clock.install({time:new Date('2026-11-15T02:59:59Z')});
 await page.addInitScript(({id,corruptPending,expiredSession})=>{
  const enc=(v:object)=>btoa(JSON.stringify(v)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const user={id,aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-11-14T03:00:00Z'};
  const expiry=expiredSession?Math.floor(Date.now()/1000)-3600:2100000000;
  localStorage.setItem('cineposta-trivia-auth-v1',JSON.stringify({access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:id,exp:expiry})}.test`,refresh_token:'test',expires_at:expiry,expires_in:3600,token_type:'bearer',user}));
  if(corruptPending!==null)localStorage.setItem(`cineposta-cryptic-pending:${id}`,corruptPending);
 },{id,corruptPending,expiredSession});
 let current:any=null,readCount=0,day='2026-11-14',failNext=false,failDashboard=false,dropResponse=false;
 let hold:Promise<void>|null=null,releaseHold=()=>{};const calls:any[]=[];
 let dashboardHold:Promise<void>|null=null,releaseDashboard=()=>{};
 const state=(owner=id)=>({day,available:true,serverNow:'2026-11-15T02:59:59Z',nextAt:midnight&&day==='2026-11-14'?'2026-11-15T03:00:00Z':'2026-11-16T03:00:00Z',clue:'Una pista de prueba, construida sólo para comprobar la interfaz.',letters:7,difficulty:8,game:owner===id?current:null,
  ...(owner===id&&current&&current.phase!=='playing'?{reveal:{answer:'FICCION',explanation:'Esta explicación usa una respuesta sintética; nunca forma parte del banco real de soluciones.',reference:'Referencia sintética para pruebas.',referenceUrl:'https://example.org/test',movieSlug}}:{})});
 await page.route('**/auth/v1/signup',async route=>{
  calls.push({fn:'signup'});const uid='22222222-2222-4222-8222-222222222222';
  const enc=(v:object)=>Buffer.from(JSON.stringify(v)).toString('base64url');
  await route.fulfill({json:{access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:uid,exp:2100000000})}.test`,refresh_token:'new-test',expires_at:2100000000,expires_in:3600,token_type:'bearer',user:{id:uid,aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-11-14T03:00:00Z'}}});
 });
 await page.route('**/auth/v1/token*',async route=>{
  calls.push({fn:'refreshSession'});const enc=(v:object)=>Buffer.from(JSON.stringify(v)).toString('base64url');
  await route.fulfill({json:{access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:id,exp:2100000000})}.test`,refresh_token:'renewed-test',expires_at:2100000000,expires_in:3600,token_type:'bearer',user:{id,aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-11-14T03:00:00Z'}}});
 });
 await page.route('**/rest/v1/rpc/*',async route=>{
  const fn=route.request().url().split('/').pop(),p=route.request().postDataJSON();calls.push({fn,...p});
  const token=route.request().headers().authorization?.split(' ')[1]??'';
  const owner=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).sub;
  if(fn==='get_cinecriptico_player')return route.fulfill({json:noProfile||owner!==id?null:{id,name:'MismaButaca',country:'AR',age:30}});
  if(fn==='claim_cinecriptico_player')return route.fulfill({json:{id,name:p.p_name,country:p.p_country,age:p.p_age}});
  if(fn==='cinecriptico_dashboard') {
   if(dashboardHold){const wait=dashboardHold;dashboardHold=null;await wait;}
   if(failDashboard)return route.fulfill({status:503,json:{message:'Dashboard unavailable'}});
   return route.fulfill({json:{day,solvedToday:current?.phase==='solved'?12:11,stats:{played:owner===id&&current?1:0,solved:owner===id&&current?.phase==='solved'?1:0,totalScore:owner===id?current?.score??0:0,bestScore:owner===id?current?.score??0:0,averageHints:owner===id?current?.hintsUsed??0:0,streak:0,bestStreak:0},daily:[{rank:1,name:'<img onerror=alert(1)>',score:1000}],historical:[{rank:1,name:'ButacaHistórica',score:4000}]}});
  }
  if(fn!=='cinecriptico_play')throw Error(`Unexpected RPC ${fn}`);
  if(!p.p_action||p.p_action==='state') {readCount++;if(midnight&&readCount>1){day='2026-11-15';current=null;}return route.fulfill({json:state(owner)});}
  if(failNext){failNext=false;return route.abort('failed');}
  if(hold){const wait=hold;hold=null;await wait;}
  if(p.p_action==='start'&&!current)current={id,phase:'playing',revision:0,mistakes:0,hintsUsed:0,score:0,hints:[],guesses:[]};
  if(p.p_action==='hint'){current.hintsUsed++;current.hints.push('Ayuda progresiva de prueba.');current.revision++;}
  if(p.p_action==='guess'){current.guesses.push(p.p_guess);current.revision++;if(p.p_guess.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase()==='FICCION'){current.phase='solved';current.score=1000-180*current.hintsUsed-100*current.mistakes;}else current.mistakes++;}
  if(p.p_action==='giveup'){current.phase='given_up';current.revision++;}
  if(dropResponse){dropResponse=false;return route.abort('failed');}
  await route.fulfill({json:state(owner)});
 });
 await page.goto('/juegos/cinecriptico/');
 await expect(page.locator('[data-start]')).toBeEnabled();
 return {calls,fail:()=>{failNext=true;},dashboardFailure:(value=true)=>{failDashboard=value;},dropCommittedResponse:()=>{dropResponse=true;},holdNextDashboard:()=>{dashboardHold=new Promise<void>(resolve=>{releaseDashboard=resolve;});return ()=>releaseDashboard();},holdNext:()=>{hold=new Promise<void>(resolve=>{releaseHold=resolve;});return ()=>releaseHold();}};
}

async function loseSession(page:Page) {
 await page.evaluate(()=>{localStorage.removeItem('cineposta-trivia-auth-v1');const channel=new BroadcastChannel('cineposta-trivia-auth-v1');channel.postMessage({event:'SIGNED_OUT',session:null});channel.close();});
 await expect(page.locator('[data-status]')).toContainText('Se perdió o cambió tu sesión');
}
test('shared session, game-scoped player, keyboard, hints, results and persistence',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const mock=await game(page);
 await expect(page.locator('[data-identity]')).toContainText('MismaButaca');
 await expect(page.locator('[data-solved]')).toHaveText('11');
 await expect(page.locator('[data-reveal]')).toBeHidden();
 await expect(page.locator('[data-ranking-list]')).toContainText('<img onerror=alert(1)>');
 await expect(page.locator('[data-ranking-list] img')).toHaveCount(0);
 await page.locator('[data-start]').click();
 await expect(page.locator('[data-answer-form]')).toBeVisible();
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.cryptic-orb img')).toHaveJSProperty('naturalWidth',1024);
 await page.locator('#cryptic-word').fill('ERRATAS');await page.locator('#cryptic-word').press('Enter');
 await expect(page.locator('[data-progress]')).toContainText('5/6');
 await page.locator('[data-hint]').click();await expect(page.locator('[data-hints]')).toContainText('Ayuda progresiva');
 await expect(page.locator('[data-hint]')).toBeEnabled();
 await page.reload();await expect(page.locator('[data-answer-form]')).toBeVisible();await expect(page.locator('[data-progress]')).toContainText('1/3');
 await page.locator('#cryptic-word').fill('fícción');await expect(page.locator('[data-cells]')).toHaveText('FICCION');await page.locator('#cryptic-word').press('Enter');
 await expect(page.locator('[data-reveal]')).toBeVisible();await expect(page.locator('[data-result]')).toContainText('720');
 await expect(page.locator('[data-solved]')).toHaveText('12');await expect(page.locator('[data-whatsapp]')).not.toHaveAttribute('href',/FICCION/i);
 await expect(page.locator('[data-source]')).toHaveCount(0);
 await expect(page.locator('[data-reveal] a[href*="example.org"]')).toHaveCount(0);
 await expect(page.locator('[data-movie]')).toHaveAttribute('href','/peliculas/vertigo-1958/');
 for(const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:950});
  const controls=await page.locator('.cryptic-share > *').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}));
  for(const control of controls){expect(control.height).toBeGreaterThanOrEqual(44);expect(control.left).toBeGreaterThanOrEqual(0);expect(control.right).toBeLessThanOrEqual(width);}
  for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++) {
   const a=controls[i],b=controls[j];expect(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top).toBe(true);
  }
  if(width===390)await page.locator('[data-reveal]').screenshot({path:`test-results/cinecriptico-result-${test.info().project.name}.png`});
 }
 await page.locator('[data-ranking="historical"]').click();await expect(page.locator('[data-ranking-list]')).toContainText('ButacaHistórica');
 expect(mock.calls.filter(c=>c.fn==='claim_trivia_player')).toHaveLength(0);
 expect(mock.calls.filter(c=>c.p_action==='guess').every(c=>!('score'in c))).toBe(true);
 // Firefox reports this SDK lock-contention exception even though auth recovers and
 // every persistence assertion above succeeds. Keep it visible as an annotation;
 // never swallow other errors or change the site's shared session implementation.
 const knownLock=/^Acquiring an exclusive Navigator LockManager lock "lock:cineposta-(?:community-anon-auth|trivia-auth-v1)" immediately failed$/;
 const sdkWarnings=test.info().project.name==='desktop-firefox'?errors.filter(e=>knownLock.test(e)):[];
 if(sdkWarnings.length)test.info().annotations.push({type:'supabase-sdk-warning',description:`${sdkWarnings.length} known Firefox lock-contention reports; auth/persistence passed. https://github.com/supabase/supabase-js/issues/936`});
 expect(errors.filter(e=>!sdkWarnings.includes(e))).toEqual([]);
});
test('nickname is reserved only in CineCríptico and surrender requires confirmation',async({page})=>{
 const mock=await game(page,{noProfile:true,movieSlug:null});await page.locator('[data-start]').click();
 await expect(page.locator('[data-profile]')).toContainText('cada juego reserva sus propios nombres');
 await page.getByLabel('Nickname',{exact:true}).fill('Clovhis');await page.getByLabel('Edad',{exact:true}).fill('31');
 await page.getByRole('button',{name:'Reservar nick y jugar'}).click();await expect(page.locator('[data-answer-form]')).toBeVisible();
 await page.locator('[data-giveup]').click();await expect(page.locator('[data-reveal]')).toBeHidden();await page.locator('[data-cancel-giveup]').click();await expect(page.locator('[data-confirm]')).toBeHidden();
 await page.locator('[data-giveup]').click();await page.locator('[data-confirm-giveup]').click();await expect(page.locator('[data-result]')).toContainText('0 puntos');
 await expect(page.locator('[data-movie]')).toBeHidden();
 expect(mock.calls.filter(c=>c.fn==='claim_cinecriptico_player')).toHaveLength(1);
 expect(mock.calls.filter(c=>c.fn==='claim_trivia_player'||c.fn==='get_trivia_player')).toHaveLength(0);
});
test('server midnight replaces challenge with page open',async({page})=>{
 await game(page,{midnight:true});await page.locator('[data-start]').click();
 await page.clock.runFor(1200);await expect(page.locator('[data-date]')).toContainText('15 de noviembre');
 await expect(page.locator('[data-start]')).toBeVisible();await expect(page.locator('[data-answer-form]')).toBeHidden();
});
test('network recovery retries the same request ID',async({page})=>{
 const mock=await game(page);await page.locator('[data-start]').click();await expect(page.locator('[data-hint]')).toBeEnabled();mock.fail();await page.locator('[data-hint]').click();
 await expect(page.locator('[data-reconnect]')).toBeVisible();await page.locator('[data-reconnect]').click();await expect(page.locator('[data-hints]')).toContainText('Ayuda progresiva');
 const attempts=mock.calls.filter(c=>c.p_action==='hint');expect(attempts).toHaveLength(2);expect(attempts[0].p_request_id).toBe(attempts[1].p_request_id);
});

test('lost session clears private UI, blocks stale responses and requires explicit new identity',async({page})=>{
 const mock=await game(page);await page.locator('[data-start]').click();await expect(page.locator('[data-hint]')).toBeEnabled();
 const release=mock.holdNext();await page.locator('[data-hint]').click();
 await expect.poll(()=>mock.calls.filter(c=>c.p_action==='hint').length).toBe(1);
 await loseSession(page);release();
 await expect(page.locator('[data-answer-form]')).toBeHidden();await expect(page.locator('[data-hints]')).toBeEmpty();
 await expect(page.locator('[data-identity]')).not.toContainText('MismaButaca');await expect(page.locator('[data-start]')).toBeDisabled();
 await page.locator('[data-reconnect]').click();await expect(page.locator('[data-new-session]')).toBeEnabled();
 expect(mock.calls.filter(c=>c.fn==='signup')).toHaveLength(0);
 await page.locator('[data-new-session]').click();await expect(page.locator('[data-start]')).toBeEnabled();
 expect(mock.calls.filter(c=>c.fn==='signup')).toHaveLength(1);await expect(page.locator('[data-identity]')).not.toContainText('MismaButaca');
 await page.locator('[data-start]').click();await expect(page.locator('[data-profile]')).toBeVisible();
 await expect(page.locator('[data-reveal]')).toBeHidden();
});

test('a dashboard outage never reports an accepted answer as lost',async({page})=>{
 const mock=await game(page);await page.locator('[data-start]').click();await expect(page.locator('[data-hint]')).toBeEnabled();
 mock.dashboardFailure();await page.locator('#cryptic-word').fill('FICCION');await page.locator('#cryptic-word').press('Enter');
 await expect(page.locator('[data-result]')).toContainText('1.000');await expect(page.locator('[data-status]')).toContainText('Tu resultado ya está guardado');
 await expect(page.locator('[data-dashboard-status]')).toBeVisible();await expect(page.locator('[data-reconnect]')).toBeHidden();
});

test('clearing auth storage without an event cannot submit under another identity',async({page})=>{
 const mock=await game(page);await page.locator('[data-start]').click();await expect(page.locator('[data-hint]')).toBeEnabled();
 await page.evaluate(()=>localStorage.removeItem('cineposta-trivia-auth-v1'));
 await page.locator('[data-hint]').click();await expect(page.locator('[data-status]')).toContainText('Se perdió o cambió tu sesión');
 expect(mock.calls.filter(c=>c.p_action==='hint')).toHaveLength(0);
 await expect(page.locator('[data-answer-form]')).toBeHidden();
});

test('corrupt pending storage cannot trap a player',async({page})=>{
 await game(page,{corruptPending:'{"p_action":"unexpected"}'});
 expect(await page.evaluate(id=>localStorage.getItem(`cineposta-cryptic-pending:${id}`),id)).toBeNull();
 await page.locator('[data-start]').click();await expect(page.locator('[data-answer-form]')).toBeVisible();
});

test('an expired access token refreshes without replacing the player',async({page})=>{
 const mock=await game(page,{expiredSession:true});await expect(page.locator('[data-identity]')).toContainText('MismaButaca');
 expect(mock.calls.some(c=>c.fn==='refreshSession')).toBe(true);expect(mock.calls.filter(c=>c.fn==='signup')).toHaveLength(0);
 await page.locator('[data-start]').click();await expect(page.locator('[data-answer-form]')).toBeVisible();
});

test('reload reconciles a committed hint whose response was lost, without spending another',async({page})=>{
 const mock=await game(page);await page.locator('[data-start]').click();await expect(page.locator('[data-hint]')).toBeEnabled();
 mock.dropCommittedResponse();await page.locator('[data-hint]').click();await expect(page.locator('[data-reconnect]')).toBeVisible();
 await page.reload();await expect(page.locator('[data-progress]')).toContainText('1/3');
 await expect(page.locator('[data-hint]')).toBeEnabled();expect(mock.calls.filter(c=>c.p_action==='hint')).toHaveLength(1);
 await page.locator('#cryptic-word').fill('FICCION');await page.locator('#cryptic-word').press('Enter');await expect(page.locator('[data-result]')).toContainText('820');
});

test('keyboard answer waits for a background refresh instead of being dropped',async({page})=>{
 const mock=await game(page);await page.locator('[data-start]').click();await expect(page.locator('[data-hint]')).toBeEnabled();
 const release=mock.holdNextDashboard();await page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await expect(page.locator('[data-hint]')).toBeDisabled();await page.locator('#cryptic-word').fill('FICCION');await page.locator('#cryptic-word').press('Enter');
 await expect(page.locator('[data-status]')).toContainText('Actualizando la partida');
 expect(mock.calls.filter(c=>c.p_action==='guess')).toHaveLength(0);release();
 await expect(page.locator('[data-result]')).toContainText('1.000');expect(mock.calls.filter(c=>c.p_action==='guess')).toHaveLength(1);
});
