const checks = [
  { module: '../server/http', load: () => import('../server/http') },
  { module: '../server/memory-limit', load: () => import('../server/memory-limit') },
  { module: '../server/firebase-rest', load: () => import('../server/firebase-rest') },
  { module: '../server/usage', load: () => import('../server/usage') },
  { module: '../server/gemini', load: () => import('../server/gemini') },
  { module: '../server/paypal', load: () => import('../server/paypal') },
  { module: '../server/api-handlers', load: () => import('../server/api-handlers') },
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
