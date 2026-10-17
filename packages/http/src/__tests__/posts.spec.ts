import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app';
import type {
  ListPublishedPostsUseCase,
  GetPostBySlugUseCase,
  ListTaxonomiesUseCase,
} from '@davidev/application';

describe('Fastify Blog Routes (T03.02)', () => {
  const mockPostItem = {
    id: 'post-1',
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
    translationGroupId: 'tg-1',
    translations: [],
  };

  it('GET /api/v1/posts deve retornar 200 com lista paginada', async () => {
    const listPostsUseCase = {
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

    const app = await buildApp({
      listPublishedPostsUseCase: listPostsUseCase,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/posts?locale=pt-BR&category=arquitetura',
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json.posts).toHaveLength(1);
    expect(json.posts[0].slug).toBe('arquitetura-hexagonal-nextjs-15');
    expect(listPostsUseCase.execute).toHaveBeenCalledWith({
      locale: 'pt-BR',
      categorySlug: 'arquitetura',
      tagSlug: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('GET /api/v1/posts/:locale/:slug deve retornar 200 quando post for encontrado', async () => {
    const getPostUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: {
          status: 'FOUND',
          post: mockPostDetail,
        },
      }),
    } as unknown as GetPostBySlugUseCase;

    const app = await buildApp({
      getPostBySlugUseCase: getPostUseCase,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/posts/pt-BR/arquitetura-hexagonal-nextjs-15',
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json.title).toBe('Arquitetura Hexagonal com Next.js 15');
    expect(json.content).toBeDefined();
  });

  it('GET /api/v1/posts/:locale/:slug deve retornar 301 com header Location para slug histórico (BR-004)', async () => {
    const getPostUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: {
          status: 'HISTORICAL_SLUG',
          canonicalSlug: 'novo-slug-arquitetura',
          canonicalLocale: 'pt-BR',
        },
      }),
    } as unknown as GetPostBySlugUseCase;

    const app = await buildApp({
      getPostBySlugUseCase: getPostUseCase,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/posts/pt-BR/slug-antigo-arquitetura',
    });

    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe('/api/v1/posts/pt-BR/novo-slug-arquitetura');
    const json = JSON.parse(response.payload);
    expect(json.redirected).toBe(true);
    expect(json.canonicalSlug).toBe('novo-slug-arquitetura');
  });

  it('GET /api/v1/posts/:locale/:slug deve retornar 404 para post inexistente ou rascunho (BR-006)', async () => {
    const getPostUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        error: 'POST_NOT_FOUND',
      }),
    } as unknown as GetPostBySlugUseCase;

    const app = await buildApp({
      getPostBySlugUseCase: getPostUseCase,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/posts/pt-BR/rascunho-secreto',
    });

    expect(response.statusCode).toBe(404);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Not Found');
  });

  it('GET /api/v1/categories e GET /api/v1/tags devem retornar 200 com lista de taxonomias', async () => {
    const listTaxonomiesUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: {
          categories: [
            {
              id: 'c1',
              namePtBr: 'Arquitetura',
              nameEn: 'Architecture',
              slugPtBr: 'arquitetura',
              slugEn: 'architecture',
              postCount: 5,
            },
          ],
          tags: [
            {
              id: 't1',
              namePtBr: 'Next.js',
              nameEn: 'Next.js',
              slugPtBr: 'nextjs',
              slugEn: 'nextjs',
              postCount: 3,
            },
          ],
        },
      }),
    } as unknown as ListTaxonomiesUseCase;

    const app = await buildApp({
      listTaxonomiesUseCase,
    });

    const catRes = await app.inject({
      method: 'GET',
      url: '/api/v1/categories',
    });
    expect(catRes.statusCode).toBe(200);
    const catJson = JSON.parse(catRes.payload);
    expect(catJson.categories).toHaveLength(1);
    expect(catJson.categories[0].namePtBr).toBe('Arquitetura');

    const tagRes = await app.inject({
      method: 'GET',
      url: '/api/v1/tags',
    });
    expect(tagRes.statusCode).toBe(200);
    const tagJson = JSON.parse(tagRes.payload);
    expect(tagJson.tags).toHaveLength(1);
    expect(tagJson.tags[0].namePtBr).toBe('Next.js');
  });
});
