import { describe, it, expect } from 'vitest';
import {
  UUID,
  SlugValueObject,
  EmailValueObject,
  LocaleValueObject,
  MarkdownContent,
  Post,
  PostStatus,
  PostLocale,
  PostSlug,
  Category,
  Tag,
  RefreshToken,
  AdminUser,
  ContactMessage,
  PostPublishedEvent,
  PostContentUpdatedEvent,
  PostUnpublishedEvent,
  PostMovedToTrashEvent,
  PostRestoredEvent,
  PostPermanentlyDeletedEvent,
  PostSlugChangedEvent,
  ContactMessageReceivedEvent,
} from '../index';

describe('Domain Package — Zero External Dependencies (DEP-1)', () => {
  describe('UUIDv7 Value Object', () => {
    it('should generate a valid RFC 9562 UUIDv7', () => {
      const id = UUID.generate();
      expect(UUID.isValid(id)).toBe(true);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should accept existing valid UUIDv7', () => {
      const valid = '01918a20-0000-7000-8000-000000000001';
      expect(UUID.create(valid)).toBe(valid);
    });

    it('should reject invalid UUIDs', () => {
      expect(UUID.isValid('not-a-uuid')).toBe(false);
      expect(UUID.isValid('12345678-1234-4234-8234-123456789012')).toBe(false); // v4 not v7
      expect(() => UUID.create('invalid-uuid-v7')).toThrow();
    });

    it('should work when passed as a bare callback, as in .map(UUID.create)', () => {
      const valid = '01918a20-0000-7000-8000-000000000001';
      expect([valid].map(UUID.create)).toEqual([valid]);
    });
  });

  describe('Slug Value Object', () => {
    it('should validate and create lowercase hyphenated slugs', () => {
      const slug = SlugValueObject.create('meu-artigo-tecnico');
      expect(slug).toBe('meu-artigo-tecnico');
    });

    it('should generate slug from title with diacritics', () => {
      const slug = SlugValueObject.fromTitle('Arquitetura Hexagonal & Engenharia de Software!');
      expect(slug).toBe('arquitetura-hexagonal-engenharia-de-software');
    });

    it('should reject invalid slugs', () => {
      expect(() => SlugValueObject.create('Slug Com Espaco')).toThrow();
      expect(() => SlugValueObject.create('slug_com_underscore')).toThrow();
      expect(() => SlugValueObject.create('-leading-hyphen')).toThrow();
      expect(() => SlugValueObject.create('trailing-hyphen-')).toThrow();
    });
  });

  describe('Email Value Object', () => {
    it('should accept valid emails and normalize to lowercase', () => {
      const email = EmailValueObject.create('Davi.Developer@Example.COM');
      expect(email).toBe('davi.developer@example.com');
    });

    it('should reject invalid emails', () => {
      expect(() => EmailValueObject.create('invalid-email')).toThrow();
      expect(() => EmailValueObject.create('@missing-local.com')).toThrow();
      expect(() => EmailValueObject.create('spaces in@email.com')).toThrow();
    });
  });

  describe('Locale Value Object', () => {
    it('should create default pt-BR locale and custom en locale', () => {
      const ptLocale = LocaleValueObject.create();
      expect(ptLocale.value).toBe(PostLocale.PT_BR);
      expect(ptLocale.isDefault()).toBe(true);
      expect(ptLocale.toString()).toBe('pt-BR');

      const enLocale = LocaleValueObject.create(PostLocale.EN);
      expect(enLocale.value).toBe(PostLocale.EN);
      expect(enLocale.isDefault()).toBe(false);
      expect(enLocale.toString()).toBe('en');
    });

    it('should throw when creating an invalid locale', () => {
      expect(() => LocaleValueObject.create('fr-FR')).toThrow(/Invalid Locale/);
      expect(() => LocaleValueObject.create('es')).toThrow(/Invalid Locale/);
    });
  });

  describe('MarkdownContent Value Object', () => {
    it('should calculate SHA-256 hash synchronously with pure algorithm', () => {
      const doc = MarkdownContent.create('# Hello World\nThis is content.');
      expect(doc.contentHash).toBeDefined();
      expect(doc.contentHash).toHaveLength(64);
      expect(doc.hasSameHash(doc.contentHash)).toBe(true);
    });

    it('should detect when content changes', () => {
      const doc1 = MarkdownContent.create('Version 1');
      const doc2 = MarkdownContent.create('Version 2');
      expect(doc1.contentHash).not.toBe(doc2.contentHash);
    });
  });

  describe('Post Aggregate Root', () => {
    it('should initialize with draft status and allow publishing and unpublishing', () => {
      const post = new Post({
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Post de Teste',
        excerpt: 'Resumo do artigo para testes',
        content: MarkdownContent.create('# Conteudo'),
        categoryId: UUID.generate(),
      });

      expect(post.status).toBe(PostStatus.DRAFT);
      expect(post.publishedAt).toBeNull();
      expect(post.currentVersion).toBe(1);

      post.publish();
      expect(post.status).toBe(PostStatus.PUBLISHED);
      expect(post.publishedAt).toBeInstanceOf(Date);

      // Publishing again is idempotent
      const initialPubDate = post.publishedAt;
      post.publish();
      expect(post.publishedAt).toEqual(initialPubDate);

      // Updating content after publish increments version (BR-005)
      const changed = post.updateContent(MarkdownContent.create('# Conteudo Alterado'), 'Novo Titulo', 'Novo Resumo');
      expect(changed).toBe(true);
      expect(post.currentVersion).toBe(2);
      expect(post.title).toBe('Novo Titulo');
      expect(post.excerpt).toBe('Novo Resumo');

      // Unpublish post returns to draft
      post.unpublish();
      expect(post.status).toBe(PostStatus.DRAFT);

      // Unpublishing already draft is idempotent
      post.unpublish();
      expect(post.status).toBe(PostStatus.DRAFT);
    });

    it('should manage trash lifecycle and disallow restoring to trash status', () => {
      const post = new Post({
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Post para lixeira',
        excerpt: 'Resumo breve',
        content: MarkdownContent.create('# Conteudo'),
        categoryId: UUID.generate(),
      });

      post.moveToTrash();
      expect(post.status).toBe(PostStatus.TRASH);

      post.restore(PostStatus.DRAFT);
      expect(post.status).toBe(PostStatus.DRAFT);

      expect(() => post.restore(PostStatus.TRASH)).toThrow('Cannot restore post to trash status.');
    });

    it('should reject invalid title or excerpt lengths', () => {
      expect(() => new Post({
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: '',
        excerpt: 'Resumo',
        content: MarkdownContent.create('corpo'),
        categoryId: UUID.generate(),
      })).toThrow();

      expect(() => new Post({
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'A'.repeat(200),
        excerpt: 'Resumo',
        content: MarkdownContent.create('corpo'),
        categoryId: UUID.generate(),
      })).toThrow();

      expect(() => new Post({
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Titulo',
        excerpt: '',
        content: MarkdownContent.create('corpo'),
        categoryId: UUID.generate(),
      })).toThrow();
    });
  });

  describe('PostSlug Entity', () => {
    it('should instantiate and allow archiving previous slugs', () => {
      const postId = UUID.generate();
      const slug = SlugValueObject.create('meu-artigo-inicial');
      const postSlug = new PostSlug({
        postId,
        locale: PostLocale.PT_BR,
        slug,
      });

      expect(postSlug.isCurrent).toBe(true);
      expect(postSlug.replacedAt).toBeNull();
      expect(postSlug.createdAt).toBeInstanceOf(Date);

      postSlug.archive();
      expect(postSlug.isCurrent).toBe(false);
      expect(postSlug.replacedAt).toBeInstanceOf(Date);
    });
  });

  describe('Taxonomies: Category and Tag Entities', () => {
    it('should instantiate Category with trimmed bilingual attributes', () => {
      const cat = new Category({
        namePtBr: '  Engenharia de Software  ',
        nameEn: '  Software Engineering  ',
        slugPtBr: SlugValueObject.create('engenharia-de-software'),
        slugEn: SlugValueObject.create('software-engineering'),
      });

      expect(cat.namePtBr).toBe('Engenharia de Software');
      expect(cat.nameEn).toBe('Software Engineering');
      expect(cat.id).toBeDefined();
      expect(cat.createdAt).toBeInstanceOf(Date);
      expect(cat.updatedAt).toBeInstanceOf(Date);
    });

    it('should instantiate Tag with trimmed bilingual attributes', () => {
      const tag = new Tag({
        namePtBr: '  Arquitetura  ',
        nameEn: '  Architecture  ',
        slugPtBr: SlugValueObject.create('arquitetura'),
        slugEn: SlugValueObject.create('architecture'),
      });

      expect(tag.namePtBr).toBe('Arquitetura');
      expect(tag.nameEn).toBe('Architecture');
      expect(tag.id).toBeDefined();
    });
  });

  describe('RefreshToken Entity', () => {
    it('should check expiration, revocation, and active validity', () => {
      const token = new RefreshToken({
        adminUserId: UUID.generate(),
        tokenHash: 'dummy-sha256-hash',
        expiresAt: new Date(Date.now() + 60000), // 1 min in future
      });

      expect(token.isValid()).toBe(true);
      expect(token.isExpired()).toBe(false);
      expect(token.isRevoked()).toBe(false);

      token.revoke();
      expect(token.isRevoked()).toBe(true);
      expect(token.isValid()).toBe(false);
      expect(token.revokedAt).toBeInstanceOf(Date);

      const expiredToken = new RefreshToken({
        adminUserId: UUID.generate(),
        tokenHash: 'dummy-expired-hash',
        expiresAt: new Date(Date.now() - 1000), // in the past
      });
      expect(expiredToken.isExpired()).toBe(true);
      expect(expiredToken.isValid()).toBe(false);
    });
  });

  describe('AdminUser and ContactMessage Entities', () => {
    it('should instantiate AdminUser entity with proper defaults', () => {
      const email = EmailValueObject.create('admin@davidev.net.br');
      const user = new AdminUser({
        email,
        passwordHash: 'hashed_pw',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should instantiate ContactMessage and support marking as notified', () => {
      const msg = new ContactMessage({
        name: 'Recrutador Técnico',
        email: EmailValueObject.create('recruiter@tech.com'),
        message: 'Gostaria de agendar uma conversa.',
        locale: PostLocale.PT_BR,
      });

      expect(msg.isNotified()).toBe(false);
      expect(msg.emailNotifiedAt).toBeNull();

      msg.markAsNotified();
      expect(msg.isNotified()).toBe(true);
      expect(msg.emailNotifiedAt).toBeInstanceOf(Date);
    });
  });

  describe('Domain Events', () => {
    it('should properly instantiate all domain events with timestamps and unique IDs', () => {
      const pubEvent = new PostPublishedEvent('p-1', PostLocale.PT_BR, SlugValueObject.create('meu-post'), new Date());
      expect(pubEvent.eventName).toBe('PostPublished');
      expect(pubEvent.aggregateId).toBe('p-1');
      expect(pubEvent.eventId).toBeDefined();

      const updateEvent = new PostContentUpdatedEvent('p-1', PostLocale.PT_BR, 2, 'hash123');
      expect(updateEvent.eventName).toBe('PostContentUpdated');
      expect(updateEvent.versionNumber).toBe(2);

      const unpubEvent = new PostUnpublishedEvent('p-1', PostLocale.PT_BR, SlugValueObject.create('meu-post'));
      expect(unpubEvent.eventName).toBe('PostUnpublished');

      const trashEvent = new PostMovedToTrashEvent('p-1', PostLocale.PT_BR);
      expect(trashEvent.eventName).toBe('PostMovedToTrash');

      const restoreEvent = new PostRestoredEvent('p-1', PostLocale.PT_BR, 'rascunho');
      expect(restoreEvent.eventName).toBe('PostRestored');

      const deleteEvent = new PostPermanentlyDeletedEvent('p-1', PostLocale.PT_BR);
      expect(deleteEvent.eventName).toBe('PostPermanentlyDeleted');

      const slugChangedEvent = new PostSlugChangedEvent(
        'p-1',
        PostLocale.PT_BR,
        SlugValueObject.create('slug-antigo'),
        SlugValueObject.create('slug-novo')
      );
      expect(slugChangedEvent.eventName).toBe('PostSlugChanged');

      const contactEvent = new ContactMessageReceivedEvent(
        'c-1',
        'Recrutador',
        EmailValueObject.create('admin@example.com'),
        PostLocale.PT_BR
      );
      expect(contactEvent.eventName).toBe('ContactMessageReceived');
    });
  });
});
