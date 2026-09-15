import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPagination, escapeRegex } from '../src/utils/query.js';

test('uses the default page size and first page', () => {
  assert.deepEqual(getPagination({}), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(getPagination({}, 12), { page: 1, limit: 12, skip: 0 });
});

test('clamps page and limit to safe values', () => {
  assert.deepEqual(getPagination({ page: '0', limit: '500' }), {
    page: 1,
    limit: 100,
    skip: 0,
  });
  assert.deepEqual(getPagination({ page: '3', limit: '10' }), {
    page: 3,
    limit: 10,
    skip: 20,
  });
  assert.deepEqual(getPagination({ page: 'abc', limit: '-5' }), {
    page: 1,
    limit: 1,
    skip: 0,
  });
});

test('escapes regex characters in search input', () => {
  const pattern = new RegExp(escapeRegex('t-shirt (xl)+'), 'i');
  assert.ok(pattern.test('T-Shirt (XL)+'));
  assert.ok(!pattern.test('t-shirt xl'));
});
