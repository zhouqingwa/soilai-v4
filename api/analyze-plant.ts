import { handleAnalyzePlant } from '../server/api-handlers.js';
import { readBody, requestContext, sendError } from './_utils.js';

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const result = await handleAnalyzePlant(readBody(req), requestContext(req));
    return res.status(200).json(result);
  } catch (error) {
    console.error('analyze-plant failed:', error);
    return sendError(res, error);
  }
}
