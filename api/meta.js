export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = process.env.META_ACCESS_TOKEN;
  const VER = 'v19.0';

  if (!TOKEN) return res.status(500).json({ error: { message: 'META_ACCESS_TOKEN not configured' } });

  const { path, method = 'GET', ...qparams } = req.query;
  if (!path) return res.status(400).json({ error: { message: 'path required' } });

  const baseUrl = `https://graph.facebook.com/${VER}/${path}`;

  try {
    let response;
    if (method === 'GET') {
      const params = new URLSearchParams({ ...qparams, access_token: TOKEN });
      response = await fetch(`${baseUrl}?${params}`);
    } else {
      const body = req.body || {};
      const params =
