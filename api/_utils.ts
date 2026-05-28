import { toPublicError } from '../server/http';

export const requestContext = (req: any) => ({
  headers: req.headers || {},
  ip: req.headers?.['x-forwarded-for']?.split?.(',')?.[0] || req.socket?.remoteAddress,
});

export const readBody = (req: any) =>
  typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

export const sendError = (res: any, error: unknown) => {
  const publicError = toPublicError(error);
  return res.status(publicError.statusCode).json(publicError.body);
};
