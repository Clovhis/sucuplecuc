const key=process.env.SOCIAL_LIBRARY_USAGE_KEY;
if(!key)throw Error('Falta SOCIAL_LIBRARY_USAGE_KEY; no afecta la publicación ya registrada.');
const response=await fetch('https://bftcrexcwktyiqsermni.supabase.co/functions/v1/cineposta-social-usage',{
 method:'POST',headers:{'x-social-usage-key':key},signal:AbortSignal.timeout(45000)
});
if(!response.ok)throw Error('Registro de uso no sincronizado: HTTP '+response.status);
console.log(await response.text());
