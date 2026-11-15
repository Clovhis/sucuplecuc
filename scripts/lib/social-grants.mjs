import {digest} from './social-media.mjs';

// A source/package grant is reused, while every photo keeps its identity/credit.
// Conditions can narrow rights centrally; they never broaden an asset snapshot.
export function resolveSourceGrant(asset, row, today) {
 const grant=row?.metadata;
 if(!grant||row.id!==asset.grantId||grant.id!==row.id||row.status!=='approved'||grant.status!=='approved')throw Error('Permiso de fuente ausente o restringido.');
 if(digest(row.evidence_raw||'')!==row.evidence_sha256||grant.evidenceSha256!==row.evidence_sha256)throw Error('Evidencia de fuente alterada.');
 if(grant.permission.expiresAt&&grant.permission.expiresAt<today)return null;
 const belongs=(prefix)=>{try{const source=new URL(asset.packageUrl),allowed=new URL(prefix);return source.protocol==='https:'&&source.origin===allowed.origin&&source.pathname.startsWith(allowed.pathname);}catch{return false;}};
 if(!grant.sourcePrefixes?.some(belongs))throw Error('La fotografía no pertenece al paquete autorizado.');
 if(grant.slugs&&(!asset.slugs?.length||asset.slugs.some(slug=>!grant.slugs.includes(slug))))throw Error('Película fuera del permiso de fuente.');
 if(grant.context?.festival && (asset.editorialContext?.festival!==grant.context.festival||!grant.context.years.includes(asset.editorialContext.year)))throw Error('Falta el contexto editorial exigido por la fuente.');
 if(asset.reviewRegion==='AR'&&(asset.argentinaReview?.status!=='approved'||!/^https:\/\//.test(asset.argentinaReview.evidenceUrl||'')||!asset.argentinaReview.summary))return null;
 const original=asset.permission,source=grant.permission;
 const permission={...original};
 for(const key of ['organicInstagram','publicHosting','crop','overlay'])permission[key]=original[key]===true&&source[key]===true;
 permission.territories=original.territories?.includes('worldwide')?[...(source.territories||[])]:source.territories?.includes('worldwide')?[...(original.territories||[]) ]:(original.territories||[]).filter(t=>source.territories?.includes(t));
 permission.expiresAt=[original.expiresAt,source.expiresAt].filter(Boolean).sort()[0]||null;
 return {...asset,permission,sourceGrant:{id:grant.id,issuer:grant.issuer,evidenceSha256:grant.evidenceSha256}};
}
