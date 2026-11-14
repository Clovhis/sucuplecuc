// Dedicated capability; never accepts caller-supplied assets or history URLs.
// Minimal runtime contract also lets the Astro workspace typecheck this server file.
declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (request: Request) => Promise<Response>): void };
const expected = '3e714175ce68a12b0f93f064e54d6ea03f23f764250138d2a36176199484b3b8';
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return new Response('POST required', {status: 405});
  const key = request.headers.get('x-social-usage-key') || '';
  if (hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))) !== expected) return new Response('Unauthorized', {status: 401});
  try {
    const response = await fetch('https://raw.githubusercontent.com/Clovhis/sucuplecuc/cineposta-instagram-state/history.json', {signal: AbortSignal.timeout(15000)});
    if (!response.ok) throw Error('History unavailable');
    const history = await response.json();
    if (history.version !== 1 || !Array.isArray(history.posts)) throw Error('Invalid history');
    const rows = new Map();
    for (const post of history.posts) {
      if (!['scheduled', 'sent'].includes(post.state) || !/^[a-f0-9]{24}$/.test(post.bufferPostId || '')) continue;
      if (!Number.isFinite(Date.parse(post.dueAt))) throw Error('Invalid usage date');
      for (const image of post.media || []) for (const asset_id of image.rights?.assetIds || []) {
        if (!/^[a-z0-9-]+$/.test(asset_id)) throw Error('Invalid asset ID');
        rows.set(`${asset_id}:${post.bufferPostId}`, {asset_id, channel: 'instagram', post_id: post.bufferPostId, used_at: post.dueAt});
      }
    }
    if (rows.size) {
      const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const result = await fetch(Deno.env.get('SUPABASE_URL') + '/rest/v1/social_media_asset_usage?on_conflict=asset_id,channel,post_id', {
        method: 'POST', headers: {apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates'},
        body: JSON.stringify([...rows.values()]), signal: AbortSignal.timeout(15000)
      });
      if (!result.ok) throw Error('Usage update failed: ' + result.status);
    }
    return Response.json({recorded: rows.size});
  } catch (error) {
    console.error(String(error));
    return new Response('Usage sync failed; publication history remains authoritative', {status: 502});
  }
});
