export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers });

  const TOKEN = process.env.META_ACCESS_TOKEN;
  if (!TOKEN) return new Response(JSON.stringify({ error: { message: 'No META_ACCESS_TOKEN' } }), { status: 500, headers });

  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  const method = url.searchParams.get('method') || 'GET';
  if (!path) return new Response(JSON.stringify({ error: { message: 'No path' } }), { status: 400, headers });

  const params = {};
  url.searchParams.forEach((v, k) => { if (k !== 'path' && k !== 'method') params[k] = v; });

  const graphUrl = `https://graph.facebook.com/v19.0/${path}`;

  try {
    let res;
    if (method === 'GET') {
      const qs = new URLSearchParams({ ...params, access_token: TOKEN });
      res = await fetch(`${graphUrl}?${qs}`);
    } else {
      let body = {};
      try { body = await req.json(); } catch(e) {}
      const ps = new URLSearchParams({ ...body, access_token: TOKEN });
      res = await fetch(graphUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: ps.toString() });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch(e) {
    return new Response(JSON.stringify({ error: { message: e.message } }), { status: 500, headers });
  }
}
