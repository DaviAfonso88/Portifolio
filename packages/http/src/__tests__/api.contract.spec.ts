import { describe, it, expect, beforeAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { buildApp } from '../app';
import type { FastifyInstance } from 'fastify';
import type {
  ListPublishedPostsUseCase,
  GetPostBySlugUseCase,
  SubmitContactMessageUseCase,
  AdminLoginUseCase,
} from '@davidev/application';

describe('Fastify REST API Contract Testing against openapi.yaml (T07.05)', () => {
  let app: FastifyInstance;
  let openapiDoc: any;

  const mockPostItem = {
    id: '01918a20-0000-7000-8000-000000000001',
    locale: 'pt-BR' as const,
    slug: 'arquitetura-hexagonal-nextjs-15',
    title: 'Arquitetura Hexagonal com Next.js 15',
    excerpt: 'Como desacoplar domínio de frameworks...',
    coverImageUrl: null,
    category: { name: 'Arquitetura', slug: 'arquitetura' },
    tags: [{ name: 'Next.js', slug: 'nextjs' }],
    publishedAt: new Date('2026-03-01T10:00:00Z'),
    updatedAt: new Date('2026-03-01T10:00:00Z'),
    readingTimeMinutes: 7,
    availableLocales: ['pt-BR' as const],
  };

  const mockPostDetail = {
    ...mockPostItem,
    content: '# Arquitetura Hexagonal\n\nConteúdo editorial...',
    currentVersion: 1,
    translationGroupId: '01918a20-0000-7000-8000-000000000002',
    translations: [],
  };

  beforeAll(async () => {
    // 1. Load and parse openapi.yaml
    const openapiPath = path.resolve(
      __dirname,
      '../../../../specs/001-davidev-portfolio/contracts/openapi.yaml'
    );
    const yamlContent = fs.readFileSync(openapiPath, 'utf8');
    openapiDoc = yaml.parse(yamlContent);

    // 2. Set up use cases for Fastify app
    const listPublishedPostsUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: {
          posts: [mockPostItem],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      }),
    } as unknown as ListPublishedPostsUseCase;

    const getPostBySlugUseCase = {
      execute: vi.fn().mockImplementation(async (params: any) => {
        if (params.slug === 'arquitetura-hexagonal-nextjs-15') {
          return {
            success: true,
            data: { status: 'FOUND', post: mockPostDetail },
          };
        }
        return { success: true, data: { status: 'NOT_FOUND' } };
      }),
    } as unknown as GetPostBySlugUseCase;

    const submitContactUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: { id: '01918a20-0000-7000-8000-000000000003' },
      }),
    } as unknown as SubmitContactMessageUseCase;

    const adminLoginUseCase = {
      execute: vi.fn().mockImplementation(async (input: any) => {
        if (input.email === 'admin@davidev.net.br' && input.password === 'correct_pw') {
          return {
            success: true,
            accessToken: 'jwt_token',
            rawRefreshToken: 'refresh_token',
            user: { id: '01918a20-0000-7000-8000-000000000004', email: 'admin@davidev.net.br' },
          };
        }
        return {
          success: false,
          error: 'Credenciais inválidas.',
          code: 'INVALID_CREDENTIALS',
        };
      }),
    } as unknown as AdminLoginUseCase;

    app = await buildApp({
      listPublishedPostsUseCase,
      getPostBySlugUseCase,
      submitContactUseCase,
      adminLoginUseCase,
    });
  });

  it('verifies openapi.yaml contract contains all core endpoints', () => {
    expect(openapiDoc.openapi).toMatch(/^3\.0\./);
    expect(openapiDoc.paths['/health']).toBeDefined();
    expect(openapiDoc.paths['/posts']).toBeDefined();
    expect(openapiDoc.paths['/posts/{locale}/{slug}']).toBeDefined();
    expect(openapiDoc.paths['/contact']).toBeDefined();
    expect(openapiDoc.paths['/auth/login']).toBeDefined();
  });

  it('matches GET /api/v1/health response contract (200 OK schema)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);

    const schema = openapiDoc.paths['/health'].get.responses['200'].content['application/json'].schema;
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('timestamp');
    expect(typeof body.status).toBe(schema.properties.status.type);
    expect(typeof body.version).toBe(schema.properties.version.type);
    expect(typeof body.timestamp).toBe('string');
  });

  it('matches GET /api/v1/posts response contract', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/posts?locale=pt-BR',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);

    expect(Array.isArray(body.posts)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.page).toBe('number');
    expect(typeof body.limit).toBe('number');
    expect(typeof body.totalPages).toBe('number');

    const post = body.posts[0];
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('slug');
    expect(post).toHaveProperty('excerpt');
    expect(post).toHaveProperty('category');
  });

  it('matches GET /api/v1/posts/{locale}/{slug} response contract', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/posts/pt-BR/arquitetura-hexagonal-nextjs-15',
    });

    expect(res.statusCode).toBe(200);
    const post = JSON.parse(res.payload);

    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('slug');
    expect(post).toHaveProperty('content');
    expect(post).toHaveProperty('publishedAt');
    expect(post.locale).toBe('pt-BR');
  });

  it('matches POST /api/v1/contact validation error contract on invalid body (400 Bad Request)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contact',
      payload: {
        name: '',
        email: 'invalid-email',
        message: 'short',
        captchaToken: 'token',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toBeDefined();
    expect(body.message).toBeDefined();
  });

  it('matches POST /api/v1/auth/login invalid credentials contract (401 Unauthorized)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'wrong@davidev.net.br',
        password: 'wrong_password',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBeDefined();
    expect(body.code).toBe('INVALID_CREDENTIALS');
  });
});
