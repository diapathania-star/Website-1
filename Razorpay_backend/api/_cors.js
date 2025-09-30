export function applyCORS(req, res) {
  // 1) Which origin to allow
  const allowed = (process.env.ALLOW_ORIGIN || '*')
    .split(',')
    .map(s => s.trim());
  const origin = req.headers.origin;
  const ok = allowed.includes('*') || (origin && allowed.includes(origin));
  res.setHeader('Access-Control-Allow-Origin', ok && origin ? origin : allowed[0] || '*');
  res.setHeader('Vary', 'Origin');

  // 2) Methods
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

  // 3) Headers: echo back exactly what the browser asks for
  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Headers', reqHeaders || 'Content-Type, Accept');

  // 4) (Optional) cache the preflight for a day
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
