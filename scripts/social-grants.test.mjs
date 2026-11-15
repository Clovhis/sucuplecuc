import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSourceGrant} from './lib/social-grants.mjs';
import {digest} from './lib/social-media.mjs';
import {appliesToMovie} from './lib/instagram-images.mjs';
const permission={territories:['worldwide'],organicInstagram:true,publicHosting:true,crop:true,overlay:true,expiresAt:null};
const raw='source permission';
const grant={id:'festival-press',status:'approved',issuer:'Festival',evidenceSha256:digest(raw),permission:{...permission,crop:false,overlay:false},sourcePrefixes:['https://example.test/official-kit/'],context:{festival:'Sundance',years:[2024]}};
const row={id:grant.id,status:'approved',metadata:grant,evidence_raw:raw,evidence_sha256:digest(raw)};
const asset={grantId:grant.id,packageUrl:'https://example.test/official-kit/film/',editorialContext:{festival:'Sundance',year:2024},permission,slugs:['film-2024'],kind:'portrait',person:'Known Actor'};
test('one package grant applies without broadening original photo permissions',()=>{
 const resolved=resolveSourceGrant(asset,row,'2026-11-15');assert.equal(resolved.permission.crop,false);assert.equal(resolved.permission.overlay,false);assert.equal(resolved.permission.organicInstagram,true);
 assert.equal(appliesToMovie(resolved,{slug:'other-2024',mainCast:['Known Actor']}),false);assert.equal(appliesToMovie(resolved,{slug:'film-2024'}),true);
});
test('source integrity, revocation and package scope cannot be bypassed by an approved photo',()=>{
 assert.throws(()=>resolveSourceGrant(asset,{...row,status:'restricted'},'2026-11-15'),/restringido/);
 assert.throws(()=>resolveSourceGrant(asset,{...row,evidence_raw:'changed'},'2026-11-15'),/alterada/);
 assert.throws(()=>resolveSourceGrant({...asset,packageUrl:'https://other.test/kit/'},row,'2026-11-15'),/paquete/);
 assert.throws(()=>resolveSourceGrant({...asset,editorialContext:null},row,'2026-11-15'),/contexto/);
});
test('expiry and Argentina review are checked centrally',()=>{
 assert.equal(resolveSourceGrant(asset,{...row,metadata:{...grant,permission:{...permission,expiresAt:'2026-11-14'}}},'2026-11-15'),null);
 assert.equal(resolveSourceGrant({...asset,reviewRegion:'AR'},row,'2026-11-15'),null);
 assert.ok(resolveSourceGrant({...asset,reviewRegion:'AR',argentinaReview:{status:'approved',evidenceUrl:'https://example.test/permission',summary:'Permiso y derechos de imagen revisados individualmente.'}},row,'2026-11-15'));
 assert.deepEqual(resolveSourceGrant(asset,{...row,metadata:{...grant,permission:{...permission,territories:['AR']}}},'2026-11-15').permission.territories,['AR']);
});
