export function applyCORS(req, res) {
  // Allow one or more origins via env (comma-separated)
  const allowedList = (process.env.ALLOW_ORIGIN || '*')
    .split(',')
    .map(s => s.trim());

  const requestOrigin = req.headers.origin;
  const isAllowed =
    allowedList.includes('*') ||
    (requestOrigin && allowedList.includes(requestOrigin));

  // Echo back the request origin when allowed (best practice)
  res.setHeader('Access-Control-Allow-Origin', isAllowed && requestOrigin ? requestOrigin : allowedList[0] || '*');
  res.setHeader('Vary', 'Origin');

  // Preflight allowances
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  // IMPORTANT: include Accept (browser sends it automatically)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  // Optional: cache preflight
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
