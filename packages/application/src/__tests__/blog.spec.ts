import { describe, it, expect, vi } from 'vitest';
import { ListPublishedPostsUseCase } from '../use-cases/list-published-posts';
import { GetPostBySlugUseCase } from '../use-cases/get-post-by-slug';
import type {
  PostRepository,
  PublishedPostListItem,
  PublishedPostDetail,
  GetPostBySlugResult,
} from '../ports/post-repository.port';
import { PostLocale } from '@davidev/domain';

describe('Blog Application Use Cases', () => {
  const mockPostItem: PublishedPostListItem = {
    id: '01a141ee-a22d-7a78-a24d-66b4f4fefe8f',
    locale: PostLocale.PT_BR,
    slug: 'arquitetura-hexagonal',
    title: 'Por que a arquitetura hexagonal se pagou',
    excerpt: 'Ports and adapters num blog pessoal.',
    coverImageUrl: null,
    category: { name: 'Arquitetura', slug: 'arquitetura' },
    tags: [{ name: 'hexagonal', slug: 'hexagonal' }],
    publishedAt: new Date('2026-09-02'),
    updatedAt: new Date('2026-09-02'),
    readingTimeMinutes: 9,
    availableLocales: [PostLocale.PT_BR, PostLocale.EN],
  };

  const mockPostDetail: PublishedPostDetail = {
    ...mockPostItem,
    content: '# Conteúdo do artigo\n\nTexto explicativo sobre arquitetura hexagonal.',
    currentVersion: 1,
    translationGroupId: '01a141ee-a22d-7a78-a24d-66b4f4fefe00',
    translations: [
      {
        locale: PostLocale.EN,
        slug: 'why-hexagonal-architecture-paid-off',
        title: 'Why hexagonal architecture paid off',
      },
    ],
  };

  const createMockPostRepo = (): PostRepository => ({
    listPublished: vi.fn(async (params) => {
      // BR-006: only published posts
      return {
        posts: [mockPostItem],
        total: 1,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        totalPages: 1,
      };
    }),
    findBySlug: vi.fn(async (locale, slug): Promise<GetPostBySlugResult> => {
      if (slug === 'arquitetura-hexagonal') {
        return {
          status: 'FOUND',
          post: mockPostDetail,
        };
      }
      if (slug === 'slug-antigo-arquitetura') {
        // BR-004: historical slug resolves to canonical current slug
        return {
          status: 'HISTORICAL_SLUG',
          canonicalSlug: 'arquitetura-hexagonal',
          canonicalLocale: PostLocale.PT_BR,
        };
      }
      return {
        status: 'NOT_FOUND',
      };
    }),
    listAdmin: vi.fn(),
    findAdminById: vi.fn(),
    savePost: vi.fn(),
    updatePost: vi.fn(),
    restorePost: vi.fn(),
    deletePostPermanently: vi.fn(),
    isSlugTaken: vi.fn(),
    findPostByTranslationGroupAndLocale: vi.fn(),
    saveVersion: vi.fn(),
    listVersions: vi.fn(),
  });

  describe('ListPublishedPostsUseCase', () => {
    it('returns published posts for given locale and pagination (BR-006)', async () => {
      const repo = createMockPostRepo();
      const useCase = new ListPublishedPostsUseCase(repo);

      const result = await useCase.execute({
        locale: 'pt-BR',
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.posts).toHaveLength(1);
        expect(result.data.posts[0].slug).toBe('arquitetura-hexagonal');
        expect(result.data.total).toBe(1);
      }
      expect(repo.listPublished).toHaveBeenCalledTimes(1);
    });

    it('falls back to pt-BR if an invalid locale is provided', async () => {
      const repo = createMockPostRepo();
      const useCase = new ListPublishedPostsUseCase(repo);

      const result = await useCase.execute({
        locale: 'invalid-locale',
      });

      expect(result.success).toBe(true);
      expect(repo.listPublished).toHaveBeenCalledWith(
        expect.objectContaining({ locale: PostLocale.PT_BR })
      );
    });
  });

  describe('GetPostBySlugUseCase', () => {
    it('returns post detail when active slug is found (BR-006)', async () => {
      const repo = createMockPostRepo();
      const useCase = new GetPostBySlugUseCase(repo);

      const result = await useCase.execute({
        locale: 'pt-BR',
        slug: 'arquitetura-hexagonal',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('FOUND');
        if (result.data.status === 'FOUND') {
          expect(result.data.post.title).toBe('Por que a arquitetura hexagonal se pagou');
          expect(result.data.post.content).toContain('Conteúdo do artigo');
        }
      }
    });

    it('returns HISTORICAL_SLUG with canonical target for 301 redirection (BR-004)', async () => {
      const repo = createMockPostRepo();
      const useCase = new GetPostBySlugUseCase(repo);

      const result = await useCase.execute({
        locale: 'pt-BR',
        slug: 'slug-antigo-arquitetura',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('HISTORICAL_SLUG');
        if (result.data.status === 'HISTORICAL_SLUG') {
          expect(result.data.canonicalSlug).toBe('arquitetura-hexagonal');
          expect(result.data.canonicalLocale).toBe(PostLocale.PT_BR);
        }
      }
    });

    it('returns error when post is not found or is unpublished draft (BR-006)', async () => {
      const repo = createMockPostRepo();
      const useCase = new GetPostBySlugUseCase(repo);

      const result = await useCase.execute({
        locale: 'pt-BR',
        slug: 'post-rascunho-invisivel',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('POST_NOT_FOUND');
      }
    });
  });
});
