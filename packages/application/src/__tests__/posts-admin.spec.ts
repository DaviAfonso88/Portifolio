import { describe, it, expect, beforeEach } from 'vitest';
import {
  PostLocale,
  PostStatus,
  UUID,
} from '@davidev/domain';
import {
  CreatePostUseCase,
  UpdatePostUseCase,
  PublishPostUseCase,
  UnpublishPostUseCase,
  MovePostToTrashUseCase,
  RestorePostFromTrashUseCase,
  DeletePostPermanentlyUseCase,
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  DeleteTagUseCase,
  ListPostVersionsUseCase,
  type PostRepository,
  type TaxonomyRepository,
} from '../index';

class MockPostAndTaxonomyRepo implements PostRepository, TaxonomyRepository {
  public posts: Map<string, any> = new Map();
  public categories: Map<string, any> = new Map();
  public tags: Map<string, any> = new Map();
  public categoryPostCounts: Map<string, number> = new Map();
  public tagPostCounts: Map<string, number> = new Map();

  async listPublished() {
    return { posts: [], total: 0, page: 1, limit: 10, totalPages: 1 };
  }
  async findBySlug() {
    return { status: 'NOT_FOUND' as const };
  }
  async listAdmin() {
    return { posts: [], total: 0, publishedCount: 0, draftCount: 0, trashCount: 0, page: 1, limit: 10, totalPages: 1 };
  }
  async findAdminById(id: any) {
    return this.posts.get(id.toString()) ?? null;
  }
  async savePost(post: any, slug: string, tagIds: any[]) {
    this.posts.set(post.id.toString(), {
      id: post.id.toString(),
      locale: post.locale,
      translationGroupId: post.translationGroupId.toString(),
      title: post.title,
      slug,
      excerpt: post.excerpt,
      content: post.content.text,
      contentHash: post.content.contentHash,
      coverImageUrl: post.coverImageUrl,
      categoryId: post.categoryId.toString(),
      tagIds: tagIds.map((t) => t.toString()),
      status: post.status,
      publishedAt: post.publishedAt,
      currentVersion: post.currentVersion,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      historicalSlugs: [],
    });
  }
  async updatePost(post: any, slug: string, tagIds: any[], previousSlugToArchive?: string | null) {
    const existing = this.posts.get(post.id.toString());
    const hist = existing ? [...existing.historicalSlugs] : [];
    if (previousSlugToArchive && !hist.includes(previousSlugToArchive)) {
      hist.push(previousSlugToArchive);
    }
    this.posts.set(post.id.toString(), {
      ...existing,
      id: post.id.toString(),
      title: post.title,
      slug,
      excerpt: post.excerpt,
      content: post.content.text,
      contentHash: post.content.contentHash,
      status: post.status,
      publishedAt: post.publishedAt,
      currentVersion: post.currentVersion,
      updatedAt: post.updatedAt,
      tagIds: tagIds.map((t) => t.toString()),
      historicalSlugs: hist,
    });
  }
  async restorePost(id: any) {
    const p = this.posts.get(id.toString());
    if (p) p.status = PostStatus.DRAFT;
  }
  async deletePostPermanently(id: any) {
    this.posts.delete(id.toString());
  }
  async isSlugTaken(slug: string, locale: any, excludePostId?: any) {
    for (const p of this.posts.values()) {
      if (excludePostId && p.id === excludePostId.toString()) continue;
      if (p.locale !== locale) continue;
      if (p.status === PostStatus.TRASH) continue; // Post in trash does not block new active post
      if (p.slug.toLowerCase() === slug.toLowerCase()) return true;
      if (p.historicalSlugs.includes(slug.toLowerCase())) return true;
    }
    return false;
  }
  async findPostByTranslationGroupAndLocale(tgId: any, locale: any) {
    for (const p of this.posts.values()) {
      if (p.translationGroupId === tgId.toString() && p.locale === locale) return p;
    }
    return null;
  }

  public versions: Map<string, any[]> = new Map();

  async saveVersion(version: any) {
    const list = this.versions.get(version.postId.toString()) || [];
    list.push({
      versionNumber: version.versionNumber,
      title: version.title,
      excerpt: version.excerpt,
      content: version.content,
      contentHash: version.contentHash,
      createdAt: version.createdAt,
    });
    this.versions.set(version.postId.toString(), list);
  }

  async listVersions(postId: any, page: number = 1, pageSize: number = 10) {
    const list = this.versions.get(postId.toString()) || [];
    const sorted = [...list].sort((a, b) => b.versionNumber - a.versionNumber);
    return {
      versions: sorted,
      total: sorted.length,
      totalPages: 1,
      page,
      pageSize,
    };
  }

  async listCategories() { return []; }
  async listTags() { return []; }
  async findCategoryById(id: any) { return this.categories.get(id.toString()) ?? null; }
  async createCategory(c: any) { this.categories.set(c.id.toString(), c); }
  async updateCategory(c: any) { this.categories.set(c.id.toString(), c); }
  async deleteCategory(id: any) { this.categories.delete(id.toString()); }
  async getCategoryPostCount(id: any) { return this.categoryPostCounts.get(id.toString()) ?? 0; }

  async findTagById(id: any) { return this.tags.get(id.toString()) ?? null; }
  async createTag(t: any) { this.tags.set(t.id.toString(), t); }
  async updateTag(t: any) { this.tags.set(t.id.toString(), t); }
  async deleteTag(id: any) { this.tags.delete(id.toString()); }
  async getTagPostCount(id: any) { return this.tagPostCounts.get(id.toString()) ?? 0; }
}

describe('Post & Taxonomy Admin Use Cases', () => {
  let repo: MockPostAndTaxonomyRepo;
  const catId = UUID.create('01918a20-0000-7000-8000-000000000010');

  beforeEach(() => {
    repo = new MockPostAndTaxonomyRepo();
    repo.categories.set(catId.toString(), { id: catId, namePtBr: 'Backend' });
  });

  describe('CreatePostUseCase', () => {
    it('creates draft post with valid slug and tags (BR-003, BR-010)', async () => {
      const create = new CreatePostUseCase(repo);
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Artigo sobre Arquitetura Hexagonal',
        slug: 'artigo-arquitetura-hexagonal',
        excerpt: 'Resumo sobre o tema...',
        content: '# Introdução\n\nConteúdo aqui.',
        categoryId: catId,
        tagIds: [UUID.generate(), UUID.generate()],
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.post.status).toBe(PostStatus.DRAFT);
        expect(res.slug).toBe('artigo-arquitetura-hexagonal');
      }
    });

    it('rejects post with more than 10 tags (BR-010)', async () => {
      const create = new CreatePostUseCase(repo);
      const elevenTags = Array.from({ length: 11 }, () => UUID.generate());
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Artigo com muitas tags',
        slug: 'muitas-tags',
        excerpt: 'Resumo...',
        content: 'Conteúdo',
        categoryId: catId,
        tagIds: elevenTags,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('TOO_MANY_TAGS');
      }
    });

    it('rejects post when slug is already taken (BR-003, BR-013)', async () => {
      const create = new CreatePostUseCase(repo);
      await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Post 1',
        slug: 'slug-duplicado',
        excerpt: 'Resumo',
        content: 'Conteúdo',
        categoryId: catId,
      });

      const res2 = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Post 2',
        slug: 'slug-duplicado',
        excerpt: 'Resumo 2',
        content: 'Conteúdo 2',
        categoryId: catId,
      });

      expect(res2.success).toBe(false);
      if (!res2.success) {
        expect(res2.code).toBe('SLUG_CONFLICT');
      }
    });

    it('enforces required fields when publishImmediately is true (BR-001)', async () => {
      const create = new CreatePostUseCase(repo);
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: '',
        slug: 'slug-invalido',
        excerpt: '',
        content: '',
        categoryId: catId,
        publishImmediately: true,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('PUBLISH_REQUIREMENTS_NOT_MET');
      }
    });
  });

  describe('UpdatePostUseCase & PublishPostUseCase', () => {
    it('archives previous slug on published post when slug changes (BR-004)', async () => {
      const create = new CreatePostUseCase(repo);
      const createRes = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Título Inicial',
        slug: 'slug-original',
        excerpt: 'Resumo do artigo inicial',
        content: 'Conteúdo inicial',
        categoryId: catId,
        publishImmediately: true,
      });
      if (!createRes.success) return;

      const update = new UpdatePostUseCase(repo);
      const updateRes = await update.execute({
        id: createRes.post.id,
        slug: 'slug-atualizado',
      });

      expect(updateRes.success).toBe(true);
      const saved = await repo.findAdminById(createRes.post.id);
      expect(saved?.slug).toBe('slug-atualizado');
      expect(saved?.historicalSlugs).toContain('slug-original');
    });

    it('PublishPostUseCase transitions draft to published (BR-001, BR-002)', async () => {
      const create = new CreatePostUseCase(repo);
      const createRes = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Post em Rascunho',
        slug: 'post-em-rascunho',
        excerpt: 'Resumo do rascunho',
        content: 'Conteúdo do rascunho',
        categoryId: catId,
      });
      if (!createRes.success) return;

      const publish = new PublishPostUseCase(repo);
      const pubRes = await publish.execute({ id: createRes.post.id });
      expect(pubRes.success).toBe(true);
      if (pubRes.success) {
        expect(pubRes.post.status).toBe(PostStatus.PUBLISHED);
        expect(pubRes.post.publishedAt).toBeDefined();
      }
    });
  });

  describe('Trash, Restore & Permanent Deletion (US-11, BR-007, BR-008)', () => {
    it('moves post to trash and blocks permanent deletion if not in trash', async () => {
      const create = new CreatePostUseCase(repo);
      const createRes = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Post Ativo',
        slug: 'post-ativo',
        excerpt: 'Resumo',
        content: 'Conteúdo',
        categoryId: catId,
      });
      if (!createRes.success) return;

      const deletePermanent = new DeletePostPermanentlyUseCase(repo);
      // Attempting to delete draft directly fails (BR-007)
      const directDeleteRes = await deletePermanent.execute({ id: createRes.post.id });
      expect(directDeleteRes.success).toBe(false);
      if (!directDeleteRes.success) {
        expect(directDeleteRes.code).toBe('INVALID_STATE_TRANSITION');
      }

      // Moving to trash succeeds
      const moveToTrash = new MovePostToTrashUseCase(repo);
      const trashRes = await moveToTrash.execute({ id: createRes.post.id });
      expect(trashRes.success).toBe(true);

      // Now permanent deletion succeeds
      const permanentRes = await deletePermanent.execute({ id: createRes.post.id });
      expect(permanentRes.success).toBe(true);
      const after = await repo.findAdminById(createRes.post.id);
      expect(after).toBeNull();
    });

    it('RestorePostFromTrash blocks restore if slug was occupied (BR-008)', async () => {
      const create = new CreatePostUseCase(repo);
      const post1 = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Post 1',
        slug: 'slug-compartilhado',
        excerpt: 'Resumo',
        content: 'Conteúdo',
        categoryId: catId,
      });
      if (!post1.success) return;

      const moveToTrash = new MovePostToTrashUseCase(repo);
      await moveToTrash.execute({ id: post1.post.id });

      // Another post takes the slug while post1 is in trash
      const post2 = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Post 2',
        slug: 'slug-compartilhado',
        excerpt: 'Resumo 2',
        content: 'Conteúdo 2',
        categoryId: catId,
      });
      expect(post2.success).toBe(true);

      // Restoring post1 should be blocked (BR-008)
      const restore = new RestorePostFromTrashUseCase(repo);
      const restoreRes = await restore.execute({ id: post1.post.id });
      expect(restoreRes.success).toBe(false);
      if (!restoreRes.success) {
        expect(restoreRes.code).toBe('SLUG_TAKEN_ON_RESTORE');
      }
    });
  });

  describe('Taxonomy BR-009: Resource In Use Protection', () => {
    it('blocks category deletion if it has associated posts (BR-009)', async () => {
      repo.categoryPostCounts.set(catId.toString(), 3);
      const deleteCat = new DeleteCategoryUseCase(repo);
      const res = await deleteCat.execute({ id: catId });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('RESOURCE_IN_USE');
      }
    });

    it('blocks tag deletion if it has associated posts (BR-009)', async () => {
      const tagId = UUID.generate();
      repo.tags.set(tagId.toString(), { id: tagId, namePtBr: 'postgres' });
      repo.tagPostCounts.set(tagId.toString(), 2);

      const deleteTag = new DeleteTagUseCase(repo);
      const res = await deleteTag.execute({ id: tagId });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('RESOURCE_IN_USE');
      }
    });
  });

  describe('Editorial Versioning (BR-005, US-12, T05.01)', () => {
    it('creates version 1 when post is published immediately', async () => {
      const create = new CreatePostUseCase(repo);
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Post com versão inicial',
        slug: 'post-com-versao-inicial',
        excerpt: 'Resumo inicial',
        content: 'Conteúdo v1',
        categoryId: catId,
        publishImmediately: true,
      });

      expect(res.success).toBe(true);
      if (!res.success) return;

      expect(res.post.currentVersion).toBe(1);
      const postVersions = repo.versions.get(res.post.id.toString()) || [];
      expect(postVersions.length).toBe(1);
      expect(postVersions[0].versionNumber).toBe(1);
      expect(postVersions[0].title).toBe('Post com versão inicial');
    });

    it('creates new version only on textual changes after publication (BR-005, AC-12.1)', async () => {
      const create = new CreatePostUseCase(repo);
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Artigo publicado',
        slug: 'artigo-publicado',
        excerpt: 'Resumo original',
        content: 'Corpo original',
        categoryId: catId,
        publishImmediately: true,
      });
      if (!res.success) return;

      const postId = res.post.id;
      const update = new UpdatePostUseCase(repo);

      // Textual change: updating content
      const updateRes = await update.execute({
        id: postId,
        content: 'Corpo alterado e enriquecido com novos detalhes.',
      });

      expect(updateRes.success).toBe(true);
      if (!updateRes.success) return;
      expect(updateRes.post.currentVersion).toBe(2);

      const postVersions = repo.versions.get(postId.toString()) || [];
      expect(postVersions.length).toBe(2);
      expect(postVersions[1].versionNumber).toBe(2);
      expect(postVersions[1].content).toBe('Corpo alterado e enriquecido com novos detalhes.');
    });

    it('does NOT create a new version when only tags or cover image are updated (AC-12.2, T05.01 DoD)', async () => {
      const create = new CreatePostUseCase(repo);
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Artigo com tags',
        slug: 'artigo-com-tags',
        excerpt: 'Resumo',
        content: 'Conteúdo',
        categoryId: catId,
        publishImmediately: true,
      });
      if (!res.success) return;

      const postId = res.post.id;
      const initialVersionCount = (repo.versions.get(postId.toString()) || []).length;
      expect(initialVersionCount).toBe(1);

      const update = new UpdatePostUseCase(repo);
      // Modifying only coverImageUrl and tagIds
      const updateRes = await update.execute({
        id: postId,
        coverImageUrl: 'https://cdn.davidev.net.br/banner-novo.png',
        tagIds: [UUID.generate()],
      });

      expect(updateRes.success).toBe(true);
      if (!updateRes.success) return;
      expect(updateRes.post.currentVersion).toBe(1);

      const postVersionsAfter = repo.versions.get(postId.toString()) || [];
      expect(postVersionsAfter.length).toBe(1); // No new version!
    });

    it('does NOT create duplicate versions when saving with identical content hash (AC-12.3)', async () => {
      const create = new CreatePostUseCase(repo);
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Artigo Estável',
        slug: 'artigo-estavel',
        excerpt: 'Resumo Estável',
        content: 'Mesmo conteúdo idêntico',
        categoryId: catId,
        publishImmediately: true,
      });
      if (!res.success) return;

      const postId = res.post.id;
      const update = new UpdatePostUseCase(repo);

      // Update with identical title, excerpt, and content
      const updateRes = await update.execute({
        id: postId,
        title: 'Artigo Estável',
        excerpt: 'Resumo Estável',
        content: 'Mesmo conteúdo idêntico',
      });

      expect(updateRes.success).toBe(true);
      if (!updateRes.success) return;
      expect(updateRes.post.currentVersion).toBe(1);

      const postVersions = repo.versions.get(postId.toString()) || [];
      expect(postVersions.length).toBe(1);
    });

    it('does NOT create version records while post is in DRAFT status', async () => {
      const create = new CreatePostUseCase(repo);
      const res = await create.execute({
        locale: PostLocale.PT_BR,
        title: 'Rascunho inicial',
        slug: 'rascunho-inicial',
        excerpt: 'Resumo',
        content: 'Texto rascunho v1',
        categoryId: catId,
        publishImmediately: false,
      });
      if (!res.success) return;

      const postId = res.post.id;
      expect(repo.versions.get(postId.toString())?.length || 0).toBe(0);

      const update = new UpdatePostUseCase(repo);
      const updateRes = await update.execute({
        id: postId,
        content: 'Texto rascunho v2 alterado várias vezes',
      });

      expect(updateRes.success).toBe(true);
      if (!updateRes.success) return;
      expect(updateRes.post.currentVersion).toBe(1);
      expect(repo.versions.get(postId.toString())?.length || 0).toBe(0);

      // Now publish it
      const publish = new PublishPostUseCase(repo);
      const pubRes = await publish.execute({ id: postId });
      expect(pubRes.success).toBe(true);

      const postVersions = repo.versions.get(postId.toString()) || [];
      expect(postVersions.length).toBe(1);
      expect(postVersions[0].versionNumber).toBe(1);
    });

    it('lists versions chronologically with ListPostVersionsUseCase', async () => {
      const postId = UUID.generate();
      repo.posts.set(postId.toString(), {
        id: postId.toString(),
        locale: PostLocale.PT_BR,
        title: 'Post para listagem de versões',
      });

      repo.versions.set(postId.toString(), [
        { versionNumber: 1, title: 'v1', excerpt: 'e1', createdAt: new Date('2026-08-01') },
        { versionNumber: 2, title: 'v2', excerpt: 'e2', createdAt: new Date('2026-08-15') },
      ]);

      const listVersions = new ListPostVersionsUseCase(repo);
      const res = await listVersions.execute({ postId });

      expect(res.success).toBe(true);
      if (!res.success) return;

      expect(res.versions.length).toBe(2);
      expect(res.versions[0].versionNumber).toBe(2); // Descending
      expect(res.versions[1].versionNumber).toBe(1);
      expect(res.meta.total).toBe(2);
    });
  });

  describe('Translation Groups (BR-011) and Additional Post Operations', () => {
    it('enforces maximum 1 post per locale in translation_group_id (BR-011)', async () => {
      const translationGroupId = UUID.generate();
      const createPost = new CreatePostUseCase(repo);

      // Create first post in PT_BR
      const res1 = await createPost.execute({
        locale: PostLocale.PT_BR,
        title: 'Artigo em Português',
        slug: 'artigo-em-portugues',
        excerpt: 'Resumo em português',
        content: '# Conteúdo em português',
        categoryId: UUID.generate(),
        tagIds: [],
        translationGroupId,
      });
      expect(res1.success).toBe(true);

      // Create second post in EN with SAME translation group - succeeds
      const res2 = await createPost.execute({
        locale: PostLocale.EN,
        title: 'Article in English',
        slug: 'article-in-english',
        excerpt: 'Summary in english',
        content: '# Content in english',
        categoryId: UUID.generate(),
        tagIds: [],
        translationGroupId,
      });
      expect(res2.success).toBe(true);

      // Attempt to create another post in PT_BR with SAME translation group - rejected under BR-011
      const res3 = await createPost.execute({
        locale: PostLocale.PT_BR,
        title: 'Outro Artigo em Português no Mesmo Grupo',
        slug: 'outro-artigo-em-portugues',
        excerpt: 'Outro resumo',
        content: '# Outro conteúdo',
        categoryId: UUID.generate(),
        tagIds: [],
        translationGroupId,
      });

      expect(res3.success).toBe(false);
      if (!res3.success) {
        expect(res3.code).toBe('TRANSLATION_EXISTS');
      }
    });

    it('unpublishes a post transitioning back to draft status', async () => {
      const createPost = new CreatePostUseCase(repo);
      const res = await createPost.execute({
        locale: PostLocale.PT_BR,
        title: 'Post Publicado',
        slug: 'post-publicado',
        excerpt: 'Resumo',
        content: 'Conteudo',
        categoryId: UUID.generate(),
        tagIds: [],
        publishImmediately: true,
      });
      if (!res.success) return;

      const unpublish = new UnpublishPostUseCase(repo);
      const unpubRes = await unpublish.execute({ id: res.post.id });
      expect(unpubRes.success).toBe(true);
      if (unpubRes.success) {
        expect(unpubRes.post.status).toBe(PostStatus.DRAFT);
      }
    });

    it('returns NOT_FOUND when updating non-existent post', async () => {
      const update = new UpdatePostUseCase(repo);
      const res = await update.execute({
        id: UUID.generate(),
        title: 'Novo Titulo',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('NOT_FOUND');
      }
    });

    it('returns INVALID_SLUG when updating post with invalid slug', async () => {
      const createPost = new CreatePostUseCase(repo);
      const createRes = await createPost.execute({
        locale: PostLocale.PT_BR,
        title: 'Post Valido',
        slug: 'post-valido',
        excerpt: 'Resumo',
        content: 'Conteudo',
        categoryId: UUID.generate(),
        tagIds: [],
      });
      if (!createRes.success) return;

      const update = new UpdatePostUseCase(repo);
      const res = await update.execute({
        id: createRes.post.id,
        slug: 'Slug Invalido Com Espaço',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('INVALID_SLUG');
      }
    });

    it('returns NOT_FOUND when permanently deleting non-existent post', async () => {
      const del = new DeletePostPermanentlyUseCase(repo);
      const res = await del.execute({ id: UUID.generate() });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('NOT_FOUND');
      }
    });
  });
});
