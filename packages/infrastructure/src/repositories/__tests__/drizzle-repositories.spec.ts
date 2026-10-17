import { describe, it, expect, beforeEach } from 'vitest';
import {
  UUID,
  EmailValueObject,
  SlugValueObject,
  PostLocale,
  PostStatus,
  AdminUser,
  RefreshToken,
  ContactMessage,
  Post,
  MarkdownContent,
  Category,
  Tag,
  PostVersion,
} from '@davidev/domain';
import { DrizzleAdminUserRepository } from '../drizzle-admin-user.repository';
import { DrizzleRefreshTokenRepository } from '../drizzle-refresh-token.repository';
import { DrizzleContactMessageRepository } from '../drizzle-contact-message.repository';
import { DrizzlePostRepository } from '../drizzle-post.repository';

describe('Drizzle Repositories Integration & Integrity Tests (T07.02)', () => {
  describe('DrizzleAdminUserRepository', () => {
    let repo: DrizzleAdminUserRepository;

    beforeEach(() => {
      repo = new DrizzleAdminUserRepository();
    });

    it('creates and finds admin user by email (case-insensitive)', async () => {
      const email = EmailValueObject.create('admin.test@davidev.net.br');
      const user = new AdminUser({
        email,
        passwordHash: 'hashed_secret_123',
      });

      await repo.create(user);

      const found = await repo.findByEmail('ADMIN.TEST@davidev.net.br');
      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);
      expect(found?.email).toBe('admin.test@davidev.net.br');
    });

    it('finds admin user by UUIDv7 ID', async () => {
      const user = new AdminUser({
        email: EmailValueObject.create('uuid.test@davidev.net.br'),
        passwordHash: 'hash_pw',
      });
      await repo.create(user);

      const found = await repo.findById(user.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);

      const notFound = await repo.findById(UUID.generate());
      expect(notFound).toBeNull();
    });

    it('updates existing admin user details', async () => {
      const user = new AdminUser({
        email: EmailValueObject.create('update.test@davidev.net.br'),
        passwordHash: 'initial_hash',
      });
      await repo.create(user);

      user.passwordHash = 'updated_hash_456';
      await repo.update(user);

      const found = await repo.findById(user.id);
      expect(found?.passwordHash).toBe('updated_hash_456');
    });
  });

  describe('DrizzleRefreshTokenRepository', () => {
    let repo: DrizzleRefreshTokenRepository;
    const adminUserId = UUID.generate();

    beforeEach(() => {
      repo = new DrizzleRefreshTokenRepository();
    });

    it('creates and finds token by SHA-256 hash', async () => {
      const token = new RefreshToken({
        adminUserId,
        tokenHash: 'hash_sample_abc123',
        expiresAt: new Date(Date.now() + 86400000),
      });

      await repo.create(token);

      const found = await repo.findByTokenHash('hash_sample_abc123');
      expect(found).not.toBeNull();
      expect(found?.id).toBe(token.id);
      expect(found?.adminUserId).toBe(adminUserId);
      expect(found?.isValid()).toBe(true);
    });

    it('revokes an individual token by ID', async () => {
      const token = new RefreshToken({
        adminUserId,
        tokenHash: 'hash_to_revoke',
        expiresAt: new Date(Date.now() + 86400000),
      });
      await repo.create(token);

      await repo.revoke(token.id);

      const found = await repo.findByTokenHash('hash_to_revoke');
      expect(found?.isRevoked()).toBe(true);
      expect(found?.isValid()).toBe(false);
    });

    it('revokes all active tokens for an admin user (session family revocation)', async () => {
      const token1 = new RefreshToken({
        adminUserId,
        tokenHash: 'hash_family_1',
        expiresAt: new Date(Date.now() + 86400000),
      });
      const token2 = new RefreshToken({
        adminUserId,
        tokenHash: 'hash_family_2',
        expiresAt: new Date(Date.now() + 86400000),
      });
      const otherUserToken = new RefreshToken({
        adminUserId: UUID.generate(),
        tokenHash: 'hash_other_user',
        expiresAt: new Date(Date.now() + 86400000),
      });

      await repo.create(token1);
      await repo.create(token2);
      await repo.create(otherUserToken);

      // Invalidate whole family
      await repo.revokeAllForUser(adminUserId);

      const res1 = await repo.findByTokenHash('hash_family_1');
      const res2 = await repo.findByTokenHash('hash_family_2');
      const resOther = await repo.findByTokenHash('hash_other_user');

      expect(res1?.isRevoked()).toBe(true);
      expect(res2?.isRevoked()).toBe(true);
      expect(resOther?.isRevoked()).toBe(false); // Other user unaffected
    });
  });

  describe('DrizzleContactMessageRepository', () => {
    let repo: DrizzleContactMessageRepository;

    beforeEach(() => {
      repo = new DrizzleContactMessageRepository();
    });

    it('saves a message and retrieves it by ID', async () => {
      const msg = new ContactMessage({
        name: 'Ana Silva',
        email: EmailValueObject.create('ana.silva@empresa.com'),
        subject: 'Consultoria',
        message: 'Gostaria de solicitar uma consultoria para migração Next.js.',
        locale: PostLocale.PT_BR,
      });

      await repo.save(msg);

      const found = await repo.findById(msg.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Ana Silva');
      expect(found?.email.toString()).toBe('ana.silva@empresa.com');
      expect(found?.isNotified()).toBe(false);
    });

    it('marks a message as notified with timestamp', async () => {
      const msg = new ContactMessage({
        name: 'Bruno Lima',
        email: EmailValueObject.create('bruno@empresa.com'),
        message: 'Mensagem para teste de notificação.',
        locale: PostLocale.PT_BR,
      });
      await repo.save(msg);

      await repo.markEmailNotified(msg.id);

      const found = await repo.findById(msg.id);
      expect(found?.isNotified()).toBe(true);
      expect(found?.emailNotifiedAt).toBeInstanceOf(Date);
    });

    it('lists contact messages with pagination and filter for unnotified', async () => {
      const resultAll = await repo.list({ page: 1, limit: 10 });
      expect(resultAll.total).toBeGreaterThanOrEqual(3); // Seed messages present
      expect(resultAll.messages.length).toBeGreaterThan(0);

      // Filter unnotified
      const unnotifiedOnly = await repo.list({ unnotifiedOnly: true });
      expect(unnotifiedOnly.messages.every((m) => m.emailNotifiedAt === null)).toBe(true);
    });

    it('purges messages older than cutoffDate (P-003 retention policy)', async () => {
      // Create one fresh message and one old message (3 years ago)
      const freshMsg = new ContactMessage({
        name: 'Cliente Atual',
        email: EmailValueObject.create('atual@empresa.com'),
        message: 'Mensagem recente',
        locale: PostLocale.PT_BR,
        createdAt: new Date(),
      });
      const oldMsg = new ContactMessage({
        name: 'Cliente Antigo',
        email: EmailValueObject.create('antigo@empresa.com'),
        message: 'Mensagem de 3 anos atrás',
        locale: PostLocale.PT_BR,
        createdAt: new Date(Date.now() - 365 * 3 * 24 * 3600 * 1000), // 3 years ago
      });

      await repo.save(freshMsg);
      await repo.save(oldMsg);

      const cutoff24m = new Date();
      cutoff24m.setMonth(cutoff24m.getMonth() - 24);

      const purgedCount = await repo.purgeOlderThan(cutoff24m);
      expect(purgedCount).toBeGreaterThanOrEqual(1);

      // Old message should no longer exist
      const foundOld = await repo.findById(oldMsg.id);
      expect(foundOld).toBeNull();

      // Fresh message should still exist
      const foundFresh = await repo.findById(freshMsg.id);
      expect(foundFresh).not.toBeNull();
    });
  });


  describe('DrizzlePostRepository & Taxonomies', () => {
    let repo: DrizzlePostRepository;

    beforeEach(() => {
      repo = new DrizzlePostRepository();
    });

    it('creates category and tag taxonomies and tracks post associations (BR-009)', async () => {
      const cat = new Category({
        namePtBr: 'Arquitetura de Software',
        nameEn: 'Software Architecture',
        slugPtBr: SlugValueObject.create('arquitetura-de-software'),
        slugEn: SlugValueObject.create('software-architecture'),
      });
      await repo.createCategory(cat);

      const tag = new Tag({
        namePtBr: 'Next.js',
        nameEn: 'Next.js',
        slugPtBr: SlugValueObject.create('nextjs'),
        slugEn: SlugValueObject.create('nextjs'),
      });
      await repo.createTag(tag);

      // Counts should be 0 before posts
      expect(await repo.getCategoryPostCount(cat.id)).toBe(0);
      expect(await repo.getTagPostCount(tag.id)).toBe(0);

      const categories = await repo.listCategories();
      expect(categories.some((c) => c.namePtBr === 'Arquitetura de Software')).toBe(true);

      const tags = await repo.listTags();
      expect(tags.some((t) => t.namePtBr === 'Next.js')).toBe(true);
    });

    it('saves draft post and checks slug availability (BR-003, BR-013)', async () => {
      const postId = UUID.generate();
      const catId = UUID.generate();
      const slug = 'artigo-inedito-drizzle';

      expect(await repo.isSlugTaken(slug, PostLocale.PT_BR)).toBe(false);

      const post = new Post({
        id: postId,
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Artigo Inédito Drizzle',
        excerpt: 'Resumo do artigo para testes de integridade.',
        content: MarkdownContent.create('# Conteúdo completo'),
        categoryId: catId,
      });

      await repo.savePost(post, slug, []);

      // Now slug is taken
      expect(await repo.isSlugTaken(slug, PostLocale.PT_BR)).toBe(true);
      // But not taken when excluding self (editing own post)
      expect(await repo.isSlugTaken(slug, PostLocale.PT_BR, postId)).toBe(false);
    });

    it('finds post by slug and handles historical redirect (BR-004)', async () => {
      const postId = UUID.generate();
      const catId = UUID.generate();
      const initialSlug = 'slug-original';
      const updatedSlug = 'slug-atualizado';

      const post = new Post({
        id: postId,
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Post com Redirecionamento',
        excerpt: 'Resumo',
        content: MarkdownContent.create('# Conteudo'),
        categoryId: catId,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      // Save initial post
      await repo.savePost(post, initialSlug, []);

      // Update post slug archiving the previous slug
      await repo.updatePost(post, updatedSlug, [], initialSlug);

      // Finding by current slug returns active post
      const currentRes = await repo.findBySlug(PostLocale.PT_BR, updatedSlug);
      expect(currentRes.status).toBe('FOUND');
      if (currentRes.status === 'FOUND') {
        expect(currentRes.post.id).toBe(postId.toString());
      }

      // Finding by historical slug returns 301 redirect info (BR-004)
      const historicalRes = await repo.findBySlug(PostLocale.PT_BR, initialSlug);
      expect(historicalRes.status).toBe('HISTORICAL_SLUG');
      if (historicalRes.status === 'HISTORICAL_SLUG') {
        expect(historicalRes.canonicalSlug).toBe(updatedSlug);
      }
    });

    it('tracks versions across textual edits (BR-005)', async () => {
      const postId = UUID.generate();
      const post = new Post({
        id: postId,
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Post Versionado',
        excerpt: 'Resumo v1',
        content: MarkdownContent.create('# Conteúdo v1'),
        categoryId: UUID.generate(),
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      const v1 = PostVersion.createFromPost(post);
      await repo.saveVersion(v1);

      post.updateContent(MarkdownContent.create('# Conteúdo v2 alterado'));
      const v2 = PostVersion.createFromPost(post);
      await repo.saveVersion(v2);

      const res = await repo.listVersions(postId);
      expect(res.versions).toHaveLength(2);
      expect(res.versions[0].versionNumber).toBe(2); // Newest first
      expect(res.versions[1].versionNumber).toBe(1);
    });

    it('moves post to trash, restores it, and deletes permanently (BR-007, BR-008)', async () => {
      const postId = UUID.generate();
      const post = new Post({
        id: postId,
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Post Lixeira Ciclo',
        excerpt: 'Resumo',
        content: MarkdownContent.create('# Conteudo'),
        categoryId: UUID.generate(),
      });
      await repo.savePost(post, 'post-lixeira-ciclo', []);

      // Move to trash
      post.moveToTrash();
      await repo.updatePost(post, 'post-lixeira-ciclo', []);

      let adminPost = await repo.findAdminById(postId);
      expect(adminPost?.status).toBe(PostStatus.TRASH);

      // Restore
      await repo.restorePost(postId);
      adminPost = await repo.findAdminById(postId);
      expect(adminPost?.status).toBe(PostStatus.DRAFT);

      // Delete permanently
      await repo.deletePostPermanently(postId);
      adminPost = await repo.findAdminById(postId);
      expect(adminPost).toBeNull();
    });
  });
});
