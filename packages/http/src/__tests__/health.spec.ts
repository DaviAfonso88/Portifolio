import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../app';
import type { FastifyInstance } from 'fastify';

describe('Fastify Serverless API — Health Check (T01.07)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  it('GET /api/v1/health should respond with status 200 and ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.body);
    expect(json.status).toBe('ok');
    expect(json.timestamp).toBeDefined();
  });
});
