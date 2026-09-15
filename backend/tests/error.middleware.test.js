import { test } from 'node:test';
import assert from 'node:assert/strict';
import multer from 'multer';
import { notFound, errorHandler } from '../src/middleware/error.middleware.js';

// Minimal stand-in for an Express response.
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

test('unknown routes get a JSON 404', () => {
  const res = mockResponse();
  notFound({ method: 'GET', originalUrl: '/api/nope' }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, 'Route not found: GET /api/nope');
});

test('upload errors become 400s', () => {
  const res = mockResponse();
  errorHandler(new multer.MulterError('LIMIT_FILE_SIZE'), {}, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test('errors with a status keep it and their message', () => {
  const error = Object.assign(new Error('Not allowed by CORS'), { status: 403 });
  const res = mockResponse();
  errorHandler(error, {}, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'Not allowed by CORS');
});

test('unexpected errors hide their details', (t) => {
  t.mock.method(console, 'error', () => {});
  const res = mockResponse();
  errorHandler(new Error('database password leaked'), {}, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Internal server error');
});
