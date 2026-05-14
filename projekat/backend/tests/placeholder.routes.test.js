'use strict';

const request = require('supertest');

process.env.DB_URL = process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

jest.mock('../src/business/services/auth.service', () => ({}));
jest.mock('../src/business/services/admin.service', () => ({}));
jest.mock('../src/business/services/approval.service', () => ({}));

const app = require('../src/app');

describe('placeholder routes', () => {
  test.each([
  ['/api/applications', 'Applications module placeholder.'],
  ['/api/notifications', 'Notifications module placeholder.'],
])('GET %s returns 501 placeholder response', async (path, message) => {
  const res = await request(app).get(path);
  expect(res.status).toBe(501);
  expect(res.body).toEqual({ message });
});
});
