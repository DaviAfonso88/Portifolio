import { describe, expect, it } from 'vitest';
import { PostLocale, PostStatus } from '@davidev/domain';
import {
  CreatePostUseCase,
  ListAdminPostsUseCase,
  ListPublishedPostsUseCase,
  MovePostToTrashUseCase,
  type PostRepository,
} from '@davidev/application';
import { buildApp } from '../app';
import { JwtTokenService } from '../services/jwt-token';

const CATEGORY_ID = '01918a20-0000-7000-8000-000000000011';
const TAG_ID = '01918a20-0000-7000-8000-000000000021';
const POST_WITH_TAG_ID = '01918a20-0001-7000-8000-000000000001';

const postWithTag = {
  id: POST_WITH_TAG_ID,
  locale: PostLocale.PT_BR,
  translationGroupId: '01918a20-0001-7000-8000-0000000000aa',
  slug: 'post-com-tag',
  title: 'Post com tag',
  excerpt: 'Resumo',
  content: 'Conteúdo',
  coverImageUrl: null,
  categoryId: CATEGORY_ID,
  tagIds: [TAG_ID],
  status: PostStatus.PUBLISHED,
  publishedAt: new Date(),
  currentVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createFakeRepo(overrides: Partial<PostRepository> = {}): PostRepository {
  return {
    isSlugTaken: async () => false,
    savePost: async () => undefined,
    saveVersion: async () => undefined,
    updatePost: async () => undefined,
    findAdminById: async () => postWithTag,
    listAdmin: async () => ({
      posts: [],
      total: 0,
      publishedCount: 0,
      draftCount: 0,
      trashCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
    ...overrides,
  } as unknown as PostRepository;
}

describe('Admin posts routes', () => {
  const tokenService = new JwtTokenService('test-secret-with-at-least-32-characters');
  const headers = {
    authorization: `Bearer ${tokenService.generateAccessToken({ id: 'admin', email: 'admin@test.local' } as never)}`,
  };

  async function buildTestApp(repo: PostRepository = createFakeRepo()) {
    const app = await buildApp({
      tokenService,
      listPublishedPostsUseCase: new ListPublishedPostsUseCase(repo),
      listAdminPostsUseCase: new ListAdminPostsUseCase(repo),
      createPostUseCase: new CreatePostUseCase(repo),
      movePostToTrashUseCase: new MovePostToTrashUseCase(repo),
    });
    await app.ready();
    return app;
  }

  const newPost = {
    title: 'Post novo',
    slug: 'post-novo',
    locale: 'pt-BR',
    excerpt: 'Resumo',
    content: 'Conteúdo',
    categoryId: CATEGORY_ID,
  };

  it('cria post com tag', async () => {
    const app = await buildTestApp();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/posts',
      headers,
      payload: { ...newPost, tagIds: [TAG_ID] },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().post.status).toBe(PostStatus.DRAFT);
  });

  it('publica na criação com publishImmediately', async () => {
    const app = await buildTestApp();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/posts',
      headers,
      payload: { ...newPost, publishImmediately: true },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().post.status).toBe(PostStatus.PUBLISHED);
  });

  it('move para a lixeira post com tag', async () => {
    const app = await buildTestApp();

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/posts/${POST_WITH_TAG_ID}/trash`,
      headers,
    });

    expect(res.statusCode).toBe(200);
  });

  it.each([
    ['status=TRASH', 'Status inválido.'],
    ['locale=fr', 'Idioma inválido.'],
  ])('rejeita filtro desconhecido %s em vez de devolver lista vazia', async (query, message) => {
    const app = await buildTestApp();

    const res = await app.inject({ method: 'GET', url: `/api/v1/admin/posts?${query}`, headers });

    expect(res.statusCode).toBe(400);
    expect(res.json().message).toBe(message);
  });

  it('não expõe a mensagem de erro do banco ao cliente', async () => {
    const app = await buildTestApp(
      createFakeRepo({
        listPublished: async () => {
          throw new Error('Failed query: select "password_hash" from "admin_user"');
        },
      })
    );

    const res = await app.inject({ method: 'GET', url: '/api/v1/posts?locale=pt-BR' });

    expect(res.statusCode).toBe(500);
    expect(res.json().message).toBe('Erro interno do servidor.');
    expect(res.body).not.toContain('admin_user');
  });

  it('mantém o formato dos erros de cliente, como JSON malformado', async () => {
    const app = await buildTestApp();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/posts',
      headers: { ...headers, 'content-type': 'application/json' },
      payload: '{ malformado',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().message).toBeDefined();
  });
});
