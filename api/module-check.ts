const checks = [
  { module: '../server/http.js', load: () => import('../server/http.js') },
  { module: '../server/memory-limit.js', load: () => import('../server/memory-limit.js') },
  { module: '../server/firebase-rest.js', load: () => import('../server/firebase-rest.js') },
  { module: '../server/usage.js', load: () => import('../server/usage.js') },
  { module: '../server/gemini.js', load: () => import('../server/gemini.js') },
  { module: '../server/paypal.js', load: () => import('../server/paypal.js') },
  { module: '../server/api-handlers.js', load: () => import('../server/api-handlers.js') },
];

export default async function handler(req: any, res: any) {
  if (req.query?.key !== 'module-check') {
    return res.status(404).json({ error: 'Not found' });
  }

  const results = [];

  for (const check of checks) {
    try {
      await check.load();
      results.push({ module: check.module, ok: true });
    } catch (error: any) {
      results.push({
        module: check.module,
        ok: false,
        name: error?.name || 'Error',
        message: error?.message || String(error),
      });
    }
  }

  return res.status(200).json({ ok: true, results });
}
