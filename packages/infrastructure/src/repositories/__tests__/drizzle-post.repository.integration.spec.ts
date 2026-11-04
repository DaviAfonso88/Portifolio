import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  Post,
  PostLocale,
  PostStatus,
  MarkdownContent,
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
  ListTaxonomiesUseCase,
} from '@davidev/application';
import type { DbClient } from '../../db/client';
import * as schema from '../../db/schema';
import { DrizzlePostRepository } from '../drizzle-post.repository';
import { DrizzleAdminUserRepository } from '../drizzle-admin-user.repository';

const CATEGORY_ID = UUID.create('01918a20-0000-7000-8000-000000000011');
const TAG_ID = UUID.create('01918a20-0000-7000-8000-000000000021');
const OTHER_TAG_ID = UUID.create('01918a20-0000-7000-8000-000000000022');

// Postgres real em processo, com as migrations do projeto: valida SQL, índices e chaves estrangeiras.
describe('DrizzlePostRepository on Postgres', () => {
  let client: PGlite;
  let db: DbClient;
  let repo: DrizzlePostRepository;

  const draftInput = (slug: string, overrides: Record<string, unknown> = {}) => ({
    locale: PostLocale.PT_BR,
    title: `Título ${slug}`,
    slug,
    excerpt: 'Resumo do artigo',
    content: 'palavra '.repeat(450),
    categoryId: CATEGORY_ID,
    tagIds: [TAG_ID],
    ...overrides,
  });

  async function createPost(slug: string, overrides: Record<string, unknown> = {}) {
    const res = await new CreatePostUseCase(repo).execute(draftInput(slug, overrides));
    if (!res.success) throw new Error(res.error);
    return res.post;
  }

  beforeAll(async () => {
    client = new PGlite();
    const pgliteDb = drizzle(client, { schema });
    await migrate(pgliteDb, {
      migrationsFolder: fileURLToPath(new URL('../../../migrations', import.meta.url)),
    });

    // Mesma semântica do db.batch do neon-http: tudo em uma transação.
    db = Object.assign(pgliteDb, {
      batch: async (queries: PromiseLike<unknown>[]) => {
        await client.exec('BEGIN');
        try {
          const results = [];
          for (const query of queries) results.push(await query);
          await client.exec('COMMIT');
          return results;
        } catch (err) {
          await client.exec('ROLLBACK');
          throw err;
        }
      },
    }) as unknown as DbClient;
    // Iniciar o Postgres em processo e aplicar as migrations passa de 10 s com a suíte em paralelo.
  }, 120_000);

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    await client.exec('TRUNCATE post, category, tag, admin_user CASCADE');
    await db.insert(schema.categories).values({
      id: CATEGORY_ID,
      namePtBr: 'Arquitetura',
      nameEn: 'Architecture',
      slugPtBr: 'arquitetura',
      slugEn: 'architecture',
    });
    await db.insert(schema.tags).values([
      { id: TAG_ID, namePtBr: 'servidor', nameEn: 'server', slugPtBr: 'servidor', slugEn: 'server' },
      { id: OTHER_TAG_ID, namePtBr: 'banco', nameEn: 'database', slugPtBr: 'banco', slugEn: 'database' },
    ]);
    repo = new DrizzlePostRepository(db);
  });

  describe('persistência', () => {
    it('mantém posts criados e excluídos entre instâncias, como em um cold start', async () => {
      const post = await createPost('sobrevive-ao-cold-start');

      const otherInstance = new DrizzlePostRepository(db);
      expect((await otherInstance.findAdminById(post.id))?.slug).toBe('sobrevive-ao-cold-start');

      await new MovePostToTrashUseCase(repo).execute({ id: post.id });
      expect((await otherInstance.findAdminById(post.id))?.status).toBe(PostStatus.TRASH);

      await new DeletePostPermanentlyUseCase(repo).execute({ id: post.id });
      expect(await otherInstance.findAdminById(post.id)).toBeNull();
    });

    it('não grava nada quando uma parte da operação falha', async () => {
      const post = new Post({
        locale: PostLocale.PT_BR,
        translationGroupId: UUID.generate(),
        title: 'Com tag inexistente',
        excerpt: 'Resumo',
        content: MarkdownContent.create('Conteúdo'),
        categoryId: CATEGORY_ID,
      });

      await expect(repo.savePost(post, 'tag-inexistente', [UUID.generate()])).rejects.toThrow();

      expect(await repo.findAdminById(post.id)).toBeNull();
      expect(await repo.isSlugTaken('tag-inexistente', PostLocale.PT_BR)).toBe(false);
    });
  });

  describe('leitura pública', () => {
    it('expõe só posts publicados, com categoria e tags no idioma e tempo de leitura real', async () => {
      await createPost('rascunho-invisivel');
      await createPost('artigo-publicado', { publishImmediately: true });
      await createPost('published-article', {
        locale: PostLocale.EN,
        publishImmediately: true,
        translationGroupId: UUID.generate(),
      });

      const pt = await repo.listPublished({ locale: PostLocale.PT_BR });
      expect(pt.total).toBe(1);
      expect(pt.posts[0]).toMatchObject({
        slug: 'artigo-publicado',
        category: { name: 'Arquitetura', slug: 'arquitetura' },
        tags: [{ name: 'servidor', slug: 'servidor' }],
        readingTimeMinutes: 3,
      });

      const en = await repo.listPublished({ locale: PostLocale.EN });
      expect(en.posts[0]).toMatchObject({
        category: { name: 'Architecture', slug: 'architecture' },
        tags: [{ name: 'server', slug: 'server' }],
      });

      expect((await repo.findBySlug(PostLocale.PT_BR, 'rascunho-invisivel')).status).toBe('NOT_FOUND');
    });

    it('filtra por categoria e tag e pagina o resultado', async () => {
      await createPost('com-tag', { publishImmediately: true });
      await createPost('com-outra-tag', { publishImmediately: true, tagIds: [OTHER_TAG_ID] });

      const byTag = await repo.listPublished({ locale: PostLocale.PT_BR, tagSlug: 'banco' });
      expect(byTag.posts.map((p) => p.slug)).toEqual(['com-outra-tag']);

      const byCategory = await repo.listPublished({ locale: PostLocale.PT_BR, categorySlug: 'arquitetura' });
      expect(byCategory.total).toBe(2);

      expect((await repo.listPublished({ locale: PostLocale.PT_BR, categorySlug: 'nao-existe' })).total).toBe(0);
      expect((await repo.listPublished({ locale: PostLocale.PT_BR, tagSlug: 'nao-existe' })).total).toBe(0);

      const paged = await repo.listPublished({ locale: PostLocale.PT_BR, page: 2, limit: 1 });
      expect(paged).toMatchObject({ total: 2, totalPages: 2, page: 2 });
      expect(paged.posts).toHaveLength(1);
    });

    it('lista traduções publicadas e omite as que ainda são rascunho (BR-006)', async () => {
      const original = await createPost('artigo-em-portugues', { publishImmediately: true });
      await createPost('article-in-english', {
        locale: PostLocale.EN,
        translationGroupId: original.translationGroupId,
      });

      const beforePublish = await repo.findBySlug(PostLocale.PT_BR, 'artigo-em-portugues');
      expect(beforePublish.status === 'FOUND' && beforePublish.post.translations).toEqual([]);

      const translated = await repo.listAdmin({ locale: PostLocale.EN });
      await new PublishPostUseCase(repo).execute({ id: UUID.create(translated.posts[0].id) });

      const afterPublish = await repo.findBySlug(PostLocale.PT_BR, 'artigo-em-portugues');
      expect(afterPublish.status === 'FOUND' && afterPublish.post.translations).toEqual([
        { locale: PostLocale.EN, slug: 'article-in-english', title: 'Título article-in-english' },
      ]);
    });
  });

  describe('lixeira', () => {
    it('tira o post do blog e da lista padrão, e o mantém na listagem da lixeira', async () => {
      const post = await createPost('vai-para-lixeira', { publishImmediately: true });

      const res = await new MovePostToTrashUseCase(repo).execute({ id: post.id });
      expect(res.success).toBe(true);

      expect((await repo.listPublished({ locale: PostLocale.PT_BR })).total).toBe(0);
      expect((await repo.findBySlug(PostLocale.PT_BR, 'vai-para-lixeira')).status).toBe('NOT_FOUND');

      const standard = await repo.listAdmin({});
      expect(standard.total).toBe(0);
      expect(standard.trashCount).toBe(1);

      const trash = await repo.listAdmin({ status: PostStatus.TRASH });
      expect(trash.posts.map((p) => p.id)).toEqual([post.id]);
    });

    it('restaura como publicado quem já foi publicado e como rascunho quem nunca foi', async () => {
      const published = await createPost('ja-publicado', { publishImmediately: true });
      const draft = await createPost('sempre-rascunho');

      for (const { id } of [published, draft]) {
        await new MovePostToTrashUseCase(repo).execute({ id });
        expect((await new RestorePostFromTrashUseCase(repo).execute({ id })).success).toBe(true);
      }

      expect((await repo.findAdminById(published.id))?.status).toBe(PostStatus.PUBLISHED);
      expect((await repo.findAdminById(draft.id))?.status).toBe(PostStatus.DRAFT);
    });

    it('apaga em cascata só a partir da lixeira e libera o slug (BR-007)', async () => {
      const post = await createPost('sera-apagado', { publishImmediately: true });

      const blocked = await new DeletePostPermanentlyUseCase(repo).execute({ id: post.id });
      expect(blocked).toMatchObject({ success: false, code: 'INVALID_STATE_TRANSITION' });

      await new MovePostToTrashUseCase(repo).execute({ id: post.id });
      expect((await new DeletePostPermanentlyUseCase(repo).execute({ id: post.id })).success).toBe(true);

      expect(await db.select().from(schema.postSlugs).where(eq(schema.postSlugs.postId, post.id))).toEqual([]);
      expect(await db.select().from(schema.postTags).where(eq(schema.postTags.postId, post.id))).toEqual([]);
      expect(await db.select().from(schema.postVersions).where(eq(schema.postVersions.postId, post.id))).toEqual([]);
      expect(await repo.isSlugTaken('sera-apagado', PostLocale.PT_BR)).toBe(false);
    });

    it('mantém o slug reservado enquanto o post está na lixeira', async () => {
      const post = await createPost('slug-na-lixeira');
      await new MovePostToTrashUseCase(repo).execute({ id: post.id });

      const res = await new CreatePostUseCase(repo).execute(draftInput('slug-na-lixeira'));
      expect(res).toMatchObject({ success: false, code: 'SLUG_CONFLICT' });
    });
  });

  describe('slugs', () => {
    it('arquiva o slug de post publicado e redireciona (BR-004), sem permitir reuso (BR-013)', async () => {
      const post = await createPost('slug-antigo', { publishImmediately: true });

      const res = await new UpdatePostUseCase(repo).execute({ id: post.id, slug: 'slug-novo' });
      expect(res.success).toBe(true);

      expect((await repo.findBySlug(PostLocale.PT_BR, 'slug-novo')).status).toBe('FOUND');
      expect(await repo.findBySlug(PostLocale.PT_BR, 'slug-antigo')).toEqual({
        status: 'HISTORICAL_SLUG',
        canonicalSlug: 'slug-novo',
        canonicalLocale: PostLocale.PT_BR,
      });
      expect((await repo.findAdminById(post.id))?.historicalSlugs).toEqual(['slug-antigo']);

      const reuse = await new CreatePostUseCase(repo).execute(draftInput('slug-antigo'));
      expect(reuse).toMatchObject({ success: false, code: 'SLUG_CONFLICT' });
    });

    it('deixa o próprio post voltar a um slug antigo', async () => {
      const post = await createPost('primeiro', { publishImmediately: true });
      await new UpdatePostUseCase(repo).execute({ id: post.id, slug: 'segundo' });

      const res = await new UpdatePostUseCase(repo).execute({ id: post.id, slug: 'primeiro' });
      expect(res.success).toBe(true);

      expect((await repo.findBySlug(PostLocale.PT_BR, 'primeiro')).status).toBe('FOUND');
      expect((await repo.findBySlug(PostLocale.PT_BR, 'segundo')).status).toBe('HISTORICAL_SLUG');
    });

    it('libera o slug de rascunho alterado, que nunca foi público', async () => {
      const post = await createPost('rascunho-antigo');
      await new UpdatePostUseCase(repo).execute({ id: post.id, slug: 'rascunho-novo' });

      expect(await repo.isSlugTaken('rascunho-antigo', PostLocale.PT_BR)).toBe(false);
      expect((await repo.findAdminById(post.id))?.historicalSlugs).toEqual([]);
    });

    it('permite o mesmo slug em outro idioma (BR-003)', async () => {
      await createPost('mesmo-slug');
      expect(await repo.isSlugTaken('mesmo-slug', PostLocale.EN)).toBe(false);
      await expect(
        createPost('mesmo-slug', { locale: PostLocale.EN, translationGroupId: UUID.generate() })
      ).resolves.toBeDefined();
    });
  });

  describe('edição e versões', () => {
    it('salva alterações e troca as tags de um post com tag', async () => {
      const post = await createPost('editado');

      const res = await new UpdatePostUseCase(repo).execute({
        id: post.id,
        title: 'Título novo',
        content: 'Conteúdo novo',
        tagIds: [OTHER_TAG_ID],
      });
      expect(res.success).toBe(true);

      const saved = await repo.findAdminById(post.id);
      expect(saved).toMatchObject({ title: 'Título novo', content: 'Conteúdo novo', tagIds: [OTHER_TAG_ID] });
    });

    it('preserva as tags ao publicar, despublicar e mover para a lixeira', async () => {
      const post = await createPost('com-tag-preservada');
      const { id } = post;

      expect((await new PublishPostUseCase(repo).execute({ id })).success).toBe(true);
      expect((await new UnpublishPostUseCase(repo).execute({ id })).success).toBe(true);
      expect((await new MovePostToTrashUseCase(repo).execute({ id })).success).toBe(true);

      expect((await repo.findAdminById(id))?.tagIds).toEqual([TAG_ID]);
    });

    it('registra versões novas e aceita republicar sem incrementar (BR-005)', async () => {
      const post = await createPost('versionado', { publishImmediately: true });
      await new UpdatePostUseCase(repo).execute({ id: post.id, content: 'Texto da versão 2' });

      const versions = await repo.listVersions(post.id);
      expect(versions.total).toBe(2);
      expect(versions.versions.map((v) => v.versionNumber)).toEqual([2, 1]);
      expect((await repo.findAdminById(post.id))?.currentVersion).toBe(2);

      await new UnpublishPostUseCase(repo).execute({ id: post.id });
      expect((await new PublishPostUseCase(repo).execute({ id: post.id })).success).toBe(true);
      expect((await repo.listVersions(post.id)).total).toBe(2);
    });
  });

  describe('listagem administrativa', () => {
    it('busca sem tratar % e _ como curingas e conta por idioma', async () => {
      await createPost('cem-por-cento', { title: 'Ganho de 100% real', publishImmediately: true });
      await createPost('outro-artigo', { title: 'Outro artigo' });
      await createPost('in-english', {
        locale: PostLocale.EN,
        translationGroupId: UUID.generate(),
        publishImmediately: true,
      });

      const found = await repo.listAdmin({ search: '100%' });
      expect(found.posts.map((p) => p.slug)).toEqual(['cem-por-cento']);
      expect((await repo.listAdmin({ search: '%' })).posts.map((p) => p.slug)).toEqual(['cem-por-cento']);

      const pt = await repo.listAdmin({ locale: PostLocale.PT_BR });
      expect(pt).toMatchObject({ total: 2, publishedCount: 1, draftCount: 1, trashCount: 0 });
    });
  });

  describe('taxonomias', () => {
    it('conta só publicados na exposição pública e todos no administrativo', async () => {
      const trashed = await createPost('na-lixeira');
      await new MovePostToTrashUseCase(repo).execute({ id: trashed.id });
      await createPost('um-rascunho');
      await createPost('um-publicado', { publishImmediately: true });

      const admin = await repo.listCategories();
      expect(admin[0].postCount).toBe(3);
      expect((await repo.listTags()).find((t) => t.id === TAG_ID)?.postCount).toBe(3);

      const publicResult = await new ListTaxonomiesUseCase(repo).execute();
      expect(publicResult.success && publicResult.data.categories[0].postCount).toBe(1);
      expect(publicResult.success && publicResult.data.tags.find((t) => t.id === TAG_ID)?.postCount).toBe(1);
    });

    it('bloqueia excluir categoria usada só por post na lixeira (BR-009)', async () => {
      const post = await createPost('prende-a-categoria');
      await new MovePostToTrashUseCase(repo).execute({ id: post.id });

      const res = await new DeleteCategoryUseCase(repo).execute({ id: CATEGORY_ID });
      expect(res).toMatchObject({ success: false, code: 'RESOURCE_IN_USE' });
    });

    it('explica a duplicidade sem expor a mensagem do banco', async () => {
      const res = await new CreateCategoryUseCase(repo).execute({
        namePtBr: 'Arquitetura',
        nameEn: 'Architecture 2',
        slugPtBr: 'arquitetura-2',
        slugEn: 'architecture-2',
      });
      expect(res).toMatchObject({
        success: false,
        error: 'Já existe uma categoria com esse nome ou endereço.',
      });
    });
  });

  describe('acesso ao painel com banco configurado', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      delete process.env.ADMIN_PASSWORD;
      delete process.env.TEST_SPRITE_MODE;
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it.each(['admin@example.com', 'test@example.com', 'daviafonso5894@gmail.com'])(
      'não aceita credenciais públicas de %s nem as grava no banco',
      async (email) => {
        const users = new DrizzleAdminUserRepository(db);

        expect(await users.findByEmail(email)).toBeNull();
        expect(await db.select().from(schema.adminUsers)).toEqual([]);
      }
    );

    it('mantém o admin definido por ADMIN_PASSWORD', async () => {
      process.env.ADMIN_PASSWORD = 'senha-definida-no-ambiente';
      process.env.ADMIN_EMAIL = 'dono@exemplo.test';

      const users = new DrizzleAdminUserRepository(db);
      const admin = await users.findByEmail('dono@exemplo.test');

      expect(admin?.email.toString()).toBe('dono@exemplo.test');
      expect(await users.findByEmail('admin@example.com')).toBeNull();
    });
  });
});
