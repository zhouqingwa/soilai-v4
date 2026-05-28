export class ApiError extends Error {
  statusCode: number;
  code: string;
  publicMessage: string;

  constructor(statusCode: number, code: string, publicMessage: string) {
    super(publicMessage);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.publicMessage = publicMessage;
  }
}

export const toPublicError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: error.publicMessage,
        code: error.code,
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      error: 'Something went wrong. Please try again.',
      code: 'internal_error',
    },
  };
};

export const assertString = (value: unknown, fieldName: string, maxLength = 2000) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'invalid_request', `${fieldName} is required.`);
  }
  if (value.length > maxLength) {
    throw new ApiError(413, 'payload_too_large', `${fieldName} is too large.`);
  }
  return value;
};
