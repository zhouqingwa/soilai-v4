import { handleGenerateIllustration } from '../server/api-handlers';
import { readBody, requestContext, sendError } from './_utils';

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const result = await handleGenerateIllustration(readBody(req), requestContext(req));
    return res.status(200).json(result);
  } catch (error) {
    console.error('generate-illustration failed:', error);
    return sendError(res, error);
  }
}
