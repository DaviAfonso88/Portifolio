import {
  Post,
  PostVersion,
  Category,
  Tag,
  PostLocale,
  PostStatus,
  SlugValueObject,
  MarkdownContent,
  UUID,
  type UUIDv7,
} from '@davidev/domain';
import type {
  PostRepository,
  TaxonomyRepository,
  CategoryWithCount,
  TagWithCount,
  ListTaxonomyOptions,
  PublishedPostListItem,
  PublishedPostDetail,
  GetPostBySlugResult,
  ListPublishedPostsParams,
  ListPublishedPostsResult,
  AdminPostListItem,
  AdminPostDetail,
  ListAdminPostsParams,
  ListAdminPostsResult,
  ListPostVersionsResult,
} from '@davidev/application';

// Conteúdo de exemplo para testes e desenvolvimento sem banco. Nunca é exibido em produção.
const SEED_ARTICLES: PublishedPostDetail[] = [
  {
    id: '01918a20-0001-7000-8000-000000000001',
    locale: PostLocale.PT_BR,
    slug: 'por-que-a-arquitetura-hexagonal-se-pagou',
    title: 'Por que a arquitetura hexagonal se pagou num projeto de uma pessoa só',
    excerpt:
      'Pelos critérios normais, ports and adapters num blog com um administrador é complexidade excessiva. Foi, e ainda assim valeu, por um motivo que não é técnico.',
    content: `## O paradoxo do projeto solo

Pelos critérios normais de engenharia, adotar arquitetura hexagonal em um produto mantido por um único desenvolvedor soa como excesso de zelo. Mais interfaces, mais camadas de indireção, mais arquivos para navegar e manter.

No entanto, em sistemas que precisam perdurar sem supervisão constante, a separação estrita entre regras de negócio puras e detalhes de infraestrutura se paga rapidamente:

> O código de domínio é imutável perante trocas de banco, migrações de provedor de nuvem ou evolução de APIs.

### A separação que salva o fim de semana

Quando um teste unitário de caso de uso não depende de banco de dados, Docker ou rede, ele executa em menos de 10 milissegundos. Isso transforma o ciclo de feedback e previne regressões sutis que de outra forma só explodiriam em produção.`,
    coverImageUrl: null,
    category: { name: 'Arquitetura', slug: 'arquitetura' },
    tags: [
      { name: 'hexagonal', slug: 'hexagonal' },
      { name: 'testes', slug: 'testes' },
    ],
    publishedAt: new Date('2026-09-02T10:00:00Z'),
    updatedAt: new Date('2026-09-02T10:00:00Z'),
    readingTimeMinutes: 9,
    currentVersion: 1,
    translationGroupId: '01918a20-0001-7000-8000-0000000000aa',
    availableLocales: [PostLocale.PT_BR, PostLocale.EN],
    translations: [
      {
        locale: PostLocale.EN,
        slug: 'why-hexagonal-architecture-paid-off',
        title: 'Why hexagonal architecture paid off in a one-person project',
      },
    ],
  },
  {
    id: '01918a20-0002-7000-8000-000000000002',
    locale: PostLocale.PT_BR,
    slug: 'rate-limiting-em-serverless',
    title: 'Rate limiting em serverless: o bug que passa em todo teste local',
    excerpt:
      'Um contador em memória funciona perfeitamente na sua máquina e desaparece em produção, sem erro, sem log e sem nada que denuncie. É a falha mais silenciosa que encontrei.',
    content: `## O contador que some

A implementação ingênua de rate limiting guarda um \`Map\` em memória: chave é o IP, valor é a contagem na janela. Em um processo de longa duração isso funciona, pois o processo é um só e o mapa vive enquanto ele viver.

Em execução serverless, não existe "o processo". Cada requisição pode cair em uma instância diferente, criada agora e destruída em seguida. O contador que você incrementou na requisição anterior pode simplesmente não existir na próxima.

> O código está sintaticamente correto, os testes passam, o deploy sobe, e a proteção contra força bruta simplesmente não existe.

## Por que o teste local passa

Rodando localmente há um processo só. Seis requisições seguidas ao endpoint de contato batem no mesmo mapa, a sexta é bloqueada, o teste fica verde e a sensação é de dever cumprido.

O teste está medindo a coisa certa no ambiente errado. Ele prova que a lógica de contagem funciona; não prova que o *estado é compartilhado*, que é justamente a propriedade da qual o mecanismo depende.

## Store compartilhado sem Redis

A resposta reflexa é adicionar Redis. Para um sistema com volume de dezenas a centenas de visitas por mês, isso significa um provedor a mais para configurar, pagar e manter, resolvendo um problema de escala que não existe.

O PostgreSQL que já está no projeto resolve, com uma tabela e um upsert atômico:

\`\`\`sql
INSERT INTO rate_limit_counter (key, window_start, hits)
VALUES ($1, $2, 1)
ON CONFLICT (key, window_start)
DO UPDATE SET hits = rate_limit_counter.hits + 1
RETURNING hits;
\`\`\`

O incremento é atômico por construção: duas instâncias concorrentes não perdem contagem, porque o banco serializa a operação. E a chave guarda o IP hasheado, nunca em claro.`,
    coverImageUrl: null,
    category: { name: 'Backend', slug: 'backend' },
    tags: [
      { name: 'serverless', slug: 'serverless' },
      { name: 'postgres', slug: 'postgres' },
    ],
    publishedAt: new Date('2026-08-19T14:30:00Z'),
    updatedAt: new Date('2026-09-04T12:00:00Z'),
    readingTimeMinutes: 7,
    currentVersion: 2,
    translationGroupId: '01918a20-0002-7000-8000-0000000000bb',
    availableLocales: [PostLocale.PT_BR, PostLocale.EN],
    translations: [
      {
        locale: PostLocale.EN,
        slug: 'rate-limiting-in-serverless',
        title: 'Rate limiting in serverless: the bug that slips past local tests',
      },
    ],
  },
];

interface InMemoryAdminPostRecord {
  id: string;
  locale: PostLocale;
  translationGroupId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentHash: string;
  coverImageUrl: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  tagIds: string[];
  status: PostStatus;
  publishedAt: Date | null;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  historicalSlugs: string[];
}

interface InMemoryPostVersionRecord {
  id: string;
  postId: string;
  versionNumber: number;
  title: string;
  excerpt: string;
  content: string;
  contentHash: string;
  createdAt: Date;
}

/**
 * Guarda tudo na memória do processo: nada sobrevive a um restart ou é visto por outra instância.
 * Serve só para testes e desenvolvimento local sem DATABASE_URL.
 */
export class InMemoryPostRepository implements PostRepository, TaxonomyRepository {
  private inMemoryCategories: Map<string, Category> = new Map();
  private inMemoryTags: Map<string, Tag> = new Map();
  private inMemoryPosts: Map<string, InMemoryAdminPostRecord> = new Map();
  private inMemoryPostVersions: Map<string, InMemoryPostVersionRecord[]> = new Map();

  constructor() {
    this.seedInMemoryDefaults();
  }

  private seedInMemoryDefaults(): void {
    // Categories
    const catArq = new Category({
      id: UUID.create('01918a20-0000-7000-8000-000000000011'),
      namePtBr: 'Arquitetura',
      nameEn: 'Architecture',
      slugPtBr: SlugValueObject.create('arquitetura'),
      slugEn: SlugValueObject.create('architecture'),
    });
    const catBack = new Category({
      id: UUID.create('01918a20-0000-7000-8000-000000000012'),
      namePtBr: 'Backend',
      nameEn: 'Backend',
      slugPtBr: SlugValueObject.create('backend'),
      slugEn: SlugValueObject.create('backend'),
    });
    const catAuto = new Category({
      id: UUID.create('01918a20-0000-7000-8000-000000000013'),
      namePtBr: 'Automação',
      nameEn: 'Automation',
      slugPtBr: SlugValueObject.create('automacao'),
      slugEn: SlugValueObject.create('automation'),
    });
    const catProc = new Category({
      id: UUID.create('01918a20-0000-7000-8000-000000000014'),
      namePtBr: 'Processo',
      nameEn: 'Process',
      slugPtBr: SlugValueObject.create('processo'),
      slugEn: SlugValueObject.create('process'),
    });
    this.inMemoryCategories.set(catArq.id, catArq);
    this.inMemoryCategories.set(catBack.id, catBack);
    this.inMemoryCategories.set(catAuto.id, catAuto);
    this.inMemoryCategories.set(catProc.id, catProc);

    // Tags
    const tagNext = new Tag({
      id: UUID.create('01918a20-0000-7000-8000-000000000021'),
      namePtBr: 'nextjs',
      nameEn: 'nextjs',
      slugPtBr: SlugValueObject.create('nextjs'),
      slugEn: SlugValueObject.create('nextjs'),
    });
    const tagDrizzle = new Tag({
      id: UUID.create('01918a20-0000-7000-8000-000000000022'),
      namePtBr: 'drizzle',
      nameEn: 'drizzle',
      slugPtBr: SlugValueObject.create('drizzle'),
      slugEn: SlugValueObject.create('drizzle'),
    });
    const tagPg = new Tag({
      id: UUID.create('01918a20-0000-7000-8000-000000000023'),
      namePtBr: 'postgresql',
      nameEn: 'postgresql',
      slugPtBr: SlugValueObject.create('postgresql'),
      slugEn: SlugValueObject.create('postgresql'),
    });
    const tagHex = new Tag({
      id: UUID.create('01918a20-0000-7000-8000-000000000024'),
      namePtBr: 'hexagonal',
      nameEn: 'hexagonal',
      slugPtBr: SlugValueObject.create('hexagonal'),
      slugEn: SlugValueObject.create('hexagonal'),
    });
    const tagServ = new Tag({
      id: UUID.create('01918a20-0000-7000-8000-000000000025'),
      namePtBr: 'serverless',
      nameEn: 'serverless',
      slugPtBr: SlugValueObject.create('serverless'),
      slugEn: SlugValueObject.create('serverless'),
    });
    this.inMemoryTags.set(tagNext.id, tagNext);
    this.inMemoryTags.set(tagDrizzle.id, tagDrizzle);
    this.inMemoryTags.set(tagPg.id, tagPg);
    this.inMemoryTags.set(tagHex.id, tagHex);
    this.inMemoryTags.set(tagServ.id, tagServ);

    // Seed articles into in-memory admin posts
    for (const a of SEED_ARTICLES) {
      const cat = [...this.inMemoryCategories.values()].find(
        (c) => c.namePtBr.toLowerCase() === a.category.name.toLowerCase()
      ) ?? catBack;

      const matchedTagIds: string[] = [];
      for (const t of a.tags) {
        const foundTag = [...this.inMemoryTags.values()].find(
          (tag) => tag.namePtBr.toLowerCase() === t.name.toLowerCase()
        );
        if (foundTag) matchedTagIds.push(foundTag.id);
      }

      const md = MarkdownContent.create(a.content);
      this.inMemoryPosts.set(a.id, {
        id: a.id,
        locale: a.locale,
        translationGroupId: a.translationGroupId,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        contentHash: md.contentHash,
        coverImageUrl: a.coverImageUrl,
        categoryId: cat.id,
        categoryName: cat.namePtBr,
        categorySlug: cat.slugPtBr,
        tagIds: matchedTagIds,
        status: PostStatus.PUBLISHED,
        publishedAt: a.publishedAt,
        currentVersion: a.currentVersion,
        createdAt: a.publishedAt,
        updatedAt: a.updatedAt,
        historicalSlugs: [],
      });

      // Seed version records
      if (a.id === '01918a20-0002-7000-8000-000000000002') {
        this.inMemoryPostVersions.set(a.id, [
          {
            id: '01918a20-0002-7000-8000-0000000000v2',
            postId: a.id,
            versionNumber: 2,
            title: a.title,
            excerpt: a.excerpt,
            content: a.content,
            contentHash: md.contentHash,
            createdAt: new Date('2026-09-04T12:00:00Z'),
          },
          {
            id: '01918a20-0002-7000-8000-0000000000v1',
            postId: a.id,
            versionNumber: 1,
            title: 'Rate limiting em serverless: o bug que passa em todo teste local',
            excerpt: 'Um contador em memória funciona perfeitamente na sua máquina e desaparece em produção.',
            content: a.content,
            contentHash: md.contentHash,
            createdAt: new Date('2026-08-19T14:30:00Z'),
          },
        ]);
      } else {
        this.inMemoryPostVersions.set(a.id, [
          {
            id: `${a.id}-v1`,
            postId: a.id,
            versionNumber: 1,
            title: a.title,
            excerpt: a.excerpt,
            content: a.content,
            contentHash: md.contentHash,
            createdAt: a.publishedAt,
          },
        ]);
      }
    }

    // Seed trash posts matching design/AdminLixeira.dc.html
    const trash1Id = '01918a20-0004-7000-8000-000000000004';
    const mdTrash1 = MarkdownContent.create('Comparação detalhada de ORMs TypeScript...');
    this.inMemoryPosts.set(trash1Id, {
      id: trash1Id,
      locale: PostLocale.PT_BR,
      translationGroupId: '01918a20-0004-7000-8000-0000000000dd',
      title: 'Comparando ORMs de TypeScript em 2026',
      slug: 'comparando-orms-de-typescript-em-2026',
      excerpt: 'Drizzle vs Prisma vs Kysely vs TypeORM no ecossistema serverless moderno.',
      content: mdTrash1.text,
      contentHash: mdTrash1.contentHash,
      coverImageUrl: null,
      categoryId: catBack.id,
      categoryName: catBack.namePtBr,
      categorySlug: catBack.slugPtBr,
      tagIds: [tagDrizzle.id, tagPg.id],
      status: PostStatus.TRASH,
      publishedAt: new Date('2026-09-06T10:00:00Z'),
      currentVersion: 3,
      createdAt: new Date('2026-09-06T10:00:00Z'),
      updatedAt: new Date('2026-09-06T10:00:00Z'),
      historicalSlugs: ['orms-typescript-2026'],
    });

    const trash2Id = '01918a20-0005-7000-8000-000000000005';
    const mdTrash2 = MarkdownContent.create('Anotações sobre arquitetura de microsserviços...');
    this.inMemoryPosts.set(trash2Id, {
      id: trash2Id,
      locale: PostLocale.PT_BR,
      translationGroupId: '01918a20-0005-7000-8000-0000000000ee',
      title: 'Rascunho antigo sobre microserviços',
      slug: 'rascunho-antigo-sobre-microservicos',
      excerpt: 'sem versões · nunca publicado',
      content: mdTrash2.text,
      contentHash: mdTrash2.contentHash,
      coverImageUrl: null,
      categoryId: catArq.id,
      categoryName: catArq.namePtBr,
      categorySlug: catArq.slugPtBr,
      tagIds: [tagHex.id],
      status: PostStatus.TRASH,
      publishedAt: null,
      currentVersion: 1,
      createdAt: new Date('2026-08-28T10:00:00Z'),
      updatedAt: new Date('2026-08-28T10:00:00Z'),
      historicalSlugs: [],
    });

    // Seed draft post to test drafts tab
    const draftId = '01918a20-0006-7000-8000-000000000006';
    const mdDraft = MarkdownContent.create('Princípios de Zero-Trust em backend...');
    this.inMemoryPosts.set(draftId, {
      id: draftId,
      locale: PostLocale.PT_BR,
      translationGroupId: '01918a20-0006-7000-8000-0000000000ff',
      title: 'Zero-Trust no desenvolvimento web moderno',
      slug: 'zero-trust-desenvolvimento-web-moderno',
      excerpt: 'Como estruturar contratos e camadas defensivas desde a primeira linha.',
      content: mdDraft.text,
      contentHash: mdDraft.contentHash,
      coverImageUrl: null,
      categoryId: catBack.id,
      categoryName: catBack.namePtBr,
      categorySlug: catBack.slugPtBr,
      tagIds: [tagServ.id],
      status: PostStatus.DRAFT,
      publishedAt: null,
      currentVersion: 1,
      createdAt: new Date('2026-09-08T10:00:00Z'),
      updatedAt: new Date('2026-09-08T10:00:00Z'),
      historicalSlugs: [],
    });
  }

  // --- Public Reading Methods ---

  public async listPublished(
    params: ListPublishedPostsParams
  ): Promise<ListPublishedPostsResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;

    let allPublished = [...this.inMemoryPosts.values()].filter(
      (p) => p.status === PostStatus.PUBLISHED && p.locale === params.locale
    );

    if (params.categorySlug) {
      allPublished = allPublished.filter((p) => p.categorySlug === params.categorySlug);
    }
    if (params.tagSlug) {
      const tag = [...this.inMemoryTags.values()].find((t) => t.slugPtBr === params.tagSlug || t.slugEn === params.tagSlug);
      if (tag) {
        allPublished = allPublished.filter((p) => p.tagIds.includes(tag.id));
      }
    }

    const total = allPublished.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = allPublished.slice(start, start + limit);

    const postsList: PublishedPostListItem[] = paginated.map((p) => ({
      id: p.id,
      locale: p.locale,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      coverImageUrl: p.coverImageUrl,
      category: { name: p.categoryName, slug: p.categorySlug },
      tags: p.tagIds.map((tId) => {
        const tag = this.inMemoryTags.get(tId);
        return { name: tag?.namePtBr || '', slug: tag?.slugPtBr || '' };
      }),
      publishedAt: p.publishedAt || p.createdAt,
      updatedAt: p.updatedAt,
      readingTimeMinutes: 7,
      availableLocales: [p.locale],
    }));

    return {
      posts: postsList,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async findBySlug(
    locale: PostLocale,
    slug: string
  ): Promise<GetPostBySlugResult> {
    const normalizedSlug = slug.trim().toLowerCase();

    // Check current slug
    const current = [...this.inMemoryPosts.values()].find(
      (p) =>
        p.status === PostStatus.PUBLISHED &&
        p.locale === locale &&
        p.slug.toLowerCase() === normalizedSlug
    );

    if (current) {
      return {
        status: 'FOUND',
        post: {
          id: current.id,
          locale: current.locale,
          slug: current.slug,
          title: current.title,
          excerpt: current.excerpt,
          content: current.content,
          coverImageUrl: current.coverImageUrl,
          category: { name: current.categoryName, slug: current.categorySlug },
          tags: current.tagIds.map((tId) => {
            const tag = this.inMemoryTags.get(tId);
            return { name: tag?.namePtBr || '', slug: tag?.slugPtBr || '' };
          }),
          publishedAt: current.publishedAt || current.createdAt,
          updatedAt: current.updatedAt,
          readingTimeMinutes: 7,
          currentVersion: current.currentVersion,
          translationGroupId: current.translationGroupId,
          availableLocales: [current.locale],
          translations: [],
        },
      };
    }

    // Check historical slug
    const historical = [...this.inMemoryPosts.values()].find(
      (p) =>
        p.status === PostStatus.PUBLISHED &&
        p.locale === locale &&
        p.historicalSlugs.some((hs) => hs.toLowerCase() === normalizedSlug)
    );

    if (historical) {
      return {
        status: 'HISTORICAL_SLUG',
        canonicalSlug: historical.slug,
        canonicalLocale: historical.locale,
      };
    }

    return { status: 'NOT_FOUND' };
  }

  // --- TaxonomyRepository Methods ---

  public async listCategories(options: ListTaxonomyOptions = {}): Promise<CategoryWithCount[]> {
    const result: CategoryWithCount[] = [];
    for (const cat of this.inMemoryCategories.values()) {
      const count = [...this.inMemoryPosts.values()].filter(
        (p) =>
          p.categoryId === cat.id && (!options.publishedOnly || p.status === PostStatus.PUBLISHED)
      ).length;

      result.push({
        id: cat.id,
        namePtBr: cat.namePtBr,
        nameEn: cat.nameEn,
        slugPtBr: cat.slugPtBr,
        slugEn: cat.slugEn,
        postCount: count,
      });
    }
    return result;
  }

  public async listTags(options: ListTaxonomyOptions = {}): Promise<TagWithCount[]> {
    const result: TagWithCount[] = [];
    for (const tag of this.inMemoryTags.values()) {
      const count = [...this.inMemoryPosts.values()].filter(
        (p) =>
          p.tagIds.includes(tag.id) && (!options.publishedOnly || p.status === PostStatus.PUBLISHED)
      ).length;

      result.push({
        id: tag.id,
        namePtBr: tag.namePtBr,
        nameEn: tag.nameEn,
        slugPtBr: tag.slugPtBr,
        slugEn: tag.slugEn,
        postCount: count,
      });
    }
    return result;
  }

  public async findCategoryById(id: UUIDv7): Promise<Category | null> {
    return this.inMemoryCategories.get(id) ?? null;
  }

  public async createCategory(category: Category): Promise<void> {
    this.inMemoryCategories.set(category.id, category);
  }

  public async updateCategory(category: Category): Promise<void> {
    this.inMemoryCategories.set(category.id, category);
  }

  public async deleteCategory(id: UUIDv7): Promise<void> {
    this.inMemoryCategories.delete(id);
  }

  public async getCategoryPostCount(id: UUIDv7): Promise<number> {
    return [...this.inMemoryPosts.values()].filter((p) => p.categoryId === id).length;
  }

  public async findTagById(id: UUIDv7): Promise<Tag | null> {
    return this.inMemoryTags.get(id) ?? null;
  }

  public async createTag(tag: Tag): Promise<void> {
    this.inMemoryTags.set(tag.id, tag);
  }

  public async updateTag(tag: Tag): Promise<void> {
    this.inMemoryTags.set(tag.id, tag);
  }

  public async deleteTag(id: UUIDv7): Promise<void> {
    this.inMemoryTags.delete(id);
  }

  public async getTagPostCount(id: UUIDv7): Promise<number> {
    return [...this.inMemoryPosts.values()].filter((p) => p.tagIds.includes(id)).length;
  }

  // --- Admin PostRepository Methods ---

  public async listAdmin(params: ListAdminPostsParams = {}): Promise<ListAdminPostsResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;

    const all = [...this.inMemoryPosts.values()].filter(
      (p) => !params.locale || p.locale === params.locale
    );
    const publishedCount = all.filter((p) => p.status === PostStatus.PUBLISHED).length;
    const draftCount = all.filter((p) => p.status === PostStatus.DRAFT).length;
    const trashCount = all.filter((p) => p.status === PostStatus.TRASH).length;

    // Sem filtro explícito a lixeira fica de fora: ela tem tela própria.
    let filtered = all.filter((p) =>
      params.status ? p.status === params.status : p.status !== PostStatus.TRASH
    );

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }

    // Sort by updatedAt desc
    filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const postsList: AdminPostListItem[] = paginated.map((p) => {
      const cat = this.inMemoryCategories.get(p.categoryId);
      return {
        id: p.id,
        locale: p.locale,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        coverImageUrl: p.coverImageUrl,
        categoryId: p.categoryId,
        categoryName: cat?.namePtBr || p.categoryName,
        categorySlug: cat?.slugPtBr || p.categorySlug,
        tagIds: p.tagIds,
        tags: p.tagIds.map((tId) => {
          const t = this.inMemoryTags.get(tId);
          return { id: tId, name: t?.namePtBr || '', slug: t?.slugPtBr || '' };
        }),
        status: p.status,
        publishedAt: p.publishedAt,
        currentVersion: p.currentVersion,
        translationGroupId: p.translationGroupId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return {
      posts: postsList,
      total,
      publishedCount,
      draftCount,
      trashCount,
      page,
      limit,
      totalPages,
    };
  }

  public async findAdminById(id: UUIDv7): Promise<AdminPostDetail | null> {
    const p = this.inMemoryPosts.get(id);
    if (!p) return null;

    const cat = this.inMemoryCategories.get(p.categoryId);
    return {
      id: p.id,
      locale: p.locale,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      contentHash: p.contentHash,
      coverImageUrl: p.coverImageUrl,
      categoryId: p.categoryId,
      categoryName: cat?.namePtBr || p.categoryName,
      categorySlug: cat?.slugPtBr || p.categorySlug,
      tagIds: p.tagIds,
      tags: p.tagIds.map((tId) => {
        const t = this.inMemoryTags.get(tId);
        return { id: tId, name: t?.namePtBr || '', slug: t?.slugPtBr || '' };
      }),
      status: p.status,
      publishedAt: p.publishedAt,
      currentVersion: p.currentVersion,
      translationGroupId: p.translationGroupId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      historicalSlugs: p.historicalSlugs,
    };
  }

  public async savePost(post: Post, currentSlug: string, tagIds: UUIDv7[]): Promise<void> {
    const cat = this.inMemoryCategories.get(post.categoryId);
    const record: InMemoryAdminPostRecord = {
      id: post.id,
      locale: post.locale,
      translationGroupId: post.translationGroupId,
      title: post.title,
      slug: currentSlug,
      excerpt: post.excerpt,
      content: post.content.text,
      contentHash: post.content.contentHash,
      coverImageUrl: post.coverImageUrl,
      categoryId: post.categoryId,
      categoryName: cat?.namePtBr || 'Geral',
      categorySlug: cat?.slugPtBr || 'geral',
      tagIds: tagIds.map((t) => t.toString()),
      status: post.status,
      publishedAt: post.publishedAt,
      currentVersion: post.currentVersion,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      historicalSlugs: [],
    };

    this.inMemoryPosts.set(post.id, record);
  }

  public async updatePost(
    post: Post,
    currentSlug: string,
    tagIds: UUIDv7[],
    previousSlugToArchive?: string | null
  ): Promise<void> {
    const existing = this.inMemoryPosts.get(post.id);
    const cat = this.inMemoryCategories.get(post.categoryId);

    const historicalSlugs = existing ? [...existing.historicalSlugs] : [];
    if (previousSlugToArchive && !historicalSlugs.includes(previousSlugToArchive)) {
      historicalSlugs.push(previousSlugToArchive);
    }

    const record: InMemoryAdminPostRecord = {
      id: post.id,
      locale: post.locale,
      translationGroupId: post.translationGroupId,
      title: post.title,
      slug: currentSlug,
      excerpt: post.excerpt,
      content: post.content.text,
      contentHash: post.content.contentHash,
      coverImageUrl: post.coverImageUrl,
      categoryId: post.categoryId,
      categoryName: cat?.namePtBr || existing?.categoryName || 'Geral',
      categorySlug: cat?.slugPtBr || existing?.categorySlug || 'geral',
      tagIds: tagIds.map((t) => t.toString()),
      status: post.status,
      publishedAt: post.publishedAt,
      currentVersion: post.currentVersion,
      createdAt: existing ? existing.createdAt : post.createdAt,
      updatedAt: post.updatedAt,
      historicalSlugs,
    };

    this.inMemoryPosts.set(post.id, record);
  }

  public async restorePost(id: UUIDv7): Promise<void> {
    const existing = this.inMemoryPosts.get(id);
    if (existing) {
      // Restore to DRAFT or PUBLISHED based on whether it had publishedAt
      existing.status = existing.publishedAt ? PostStatus.PUBLISHED : PostStatus.DRAFT;
      existing.updatedAt = new Date();
    }
  }

  public async deletePostPermanently(id: UUIDv7): Promise<void> {
    this.inMemoryPosts.delete(id);
  }

  public async isSlugTaken(
    slug: string,
    locale: PostLocale,
    excludePostId?: UUIDv7
  ): Promise<boolean> {
    const normalized = slug.trim().toLowerCase();

    for (const post of this.inMemoryPosts.values()) {
      if (excludePostId && post.id === excludePostId) continue;
      if (post.locale !== locale) continue;

      if (post.slug.toLowerCase() === normalized) return true;
      if (post.historicalSlugs.some((hs) => hs.toLowerCase() === normalized)) return true;
    }

    return false;
  }

  public async findPostByTranslationGroupAndLocale(
    translationGroupId: UUIDv7,
    locale: PostLocale
  ): Promise<Post | null> {
    for (const p of this.inMemoryPosts.values()) {
      if (p.translationGroupId === translationGroupId && p.locale === locale) {
        return new Post({
          id: UUID.create(p.id),
          locale: p.locale,
          translationGroupId: UUID.create(p.translationGroupId),
          title: p.title,
          excerpt: p.excerpt,
          content: MarkdownContent.create(p.content),
          coverImageUrl: p.coverImageUrl,
          categoryId: UUID.create(p.categoryId),
          status: p.status,
          publishedAt: p.publishedAt,
          currentVersion: p.currentVersion,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      }
    }
    return null;
  }

  // --- Versioning Repository Methods (BR-005) ---

  public async saveVersion(version: PostVersion): Promise<void> {
    const record: InMemoryPostVersionRecord = {
      id: version.id,
      postId: version.postId,
      versionNumber: version.versionNumber,
      title: version.title,
      excerpt: version.excerpt,
      content: version.content,
      contentHash: version.contentHash,
      createdAt: version.createdAt,
    };

    const list = this.inMemoryPostVersions.get(version.postId) || [];
    const existingIndex = list.findIndex((v) => v.versionNumber === version.versionNumber);
    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }
    list.sort((a, b) => b.versionNumber - a.versionNumber);
    this.inMemoryPostVersions.set(version.postId, list);
  }

  public async listVersions(
    postId: UUIDv7,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ListPostVersionsResult> {
    const list = this.inMemoryPostVersions.get(postId) || [];
    const sorted = [...list].sort((a, b) => b.versionNumber - a.versionNumber);
    const total = sorted.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);

    return {
      versions: paginated.map((v) => ({
        versionNumber: v.versionNumber,
        title: v.title,
        excerpt: v.excerpt,
        createdAt: v.createdAt,
      })),
      total,
      totalPages,
      page,
      pageSize,
    };
  }
}
