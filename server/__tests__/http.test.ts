import { describe, it, expect } from 'vitest';
import { ApiError, toPublicError, assertString } from '../http.js';

describe('ApiError', () => {
  it('creates an error with status, code, and message', () => {
    const err = new ApiError(400, 'invalid_request', 'Bad request');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('invalid_request');
    expect(err.publicMessage).toBe('Bad request');
    expect(err.message).toBe('Bad request');
    expect(err.name).toBe('ApiError');
  });
});

describe('toPublicError', () => {
  it('returns ApiError details when given an ApiError', () => {
    const err = new ApiError(429, 'rate_limited', 'Too many requests');
    const result = toPublicError(err);
    expect(result.statusCode).toBe(429);
    expect(result.body).toEqual({ error: 'Too many requests', code: 'rate_limited' });
  });

  it('returns 500 for non-ApiError errors', () => {
    const result = toPublicError(new Error('Something broke'));
    expect(result.statusCode).toBe(500);
    expect(result.body.code).toBe('internal_error');
  });

  it('returns 500 for non-Error values', () => {
    const result = toPublicError('string error');
    expect(result.statusCode).toBe(500);
    expect(result.body.code).toBe('internal_error');
  });

  it('returns 500 for null/undefined', () => {
    expect(toPublicError(null).statusCode).toBe(500);
    expect(toPublicError(undefined).statusCode).toBe(500);
  });
});

describe('assertString', () => {
  it('returns the string when valid', () => {
    expect(assertString('hello', 'name')).toBe('hello');
  });

  it('trims and rejects empty strings', () => {
    expect(() => assertString('', 'name')).toThrow(ApiError);
    expect(() => assertString('   ', 'name')).toThrow(ApiError);
  });

  it('rejects non-string values', () => {
    expect(() => assertString(123 as any, 'name')).toThrow(ApiError);
    expect(() => assertString(null as any, 'name')).toThrow(ApiError);
    expect(() => assertString(undefined as any, 'name')).toThrow(ApiError);
    expect(() => assertString({} as any, 'name')).toThrow(ApiError);
  });

  it('rejects strings exceeding maxLength', () => {
    expect(() => assertString('a'.repeat(100), 'field', 10)).toThrow(ApiError);
  });

  it('includes the field name in the error message', () => {
    expect(() => assertString('', 'plantName')).toThrow(/plantName/);
  });

  it('throws ApiError with correct codes', () => {
    const emptyErr = tryCatch(() => assertString('', 'x'));
    expect(emptyErr.code).toBe('invalid_request');

    const largeErr = tryCatch(() => assertString('a'.repeat(100), 'x', 5));
    expect(largeErr.code).toBe('payload_too_large');
  });
});

function tryCatch(fn: () => void): ApiError {
  try { fn(); } catch (e) { return e as ApiError; }
  throw new Error('Expected an error');
}
