import { and, asc, count, desc, eq, ilike, inArray, ne, or, sql, type SQL } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
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
  GetPostBySlugResult,
  ListPublishedPostsParams,
  ListPublishedPostsResult,
  AdminPostListItem,
  AdminPostDetail,
  ListAdminPostsParams,
  ListAdminPostsResult,
  ListPostVersionsResult,
} from '@davidev/application';
import type { DbClient } from '../db/client';
import { posts, postSlugs, categories, tags, postTags, postVersions } from '../db/schema';

const WORDS_PER_MINUTE = 200;
const POSTGRES_UNIQUE_VIOLATION = '23505';

const currentSlugJoin = and(eq(postSlugs.postId, posts.id), eq(postSlugs.isCurrent, true));
const categoryJoin = eq(categories.id, posts.categoryId);

// Evita trazer o corpo de cada artigo só para calcular o tempo de leitura da listagem.
const wordCountSql = sql<number>`coalesce(array_length(regexp_split_to_array(trim(${posts.content}), '\\s+'), 1), 0)`.mapWith(
  Number
);

const postListColumns = {
  id: posts.id,
  locale: posts.locale,
  translationGroupId: posts.translationGroupId,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImageUrl: posts.coverImageUrl,
  categoryId: posts.categoryId,
  status: posts.status,
  publishedAt: posts.publishedAt,
  currentVersion: posts.currentVersion,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  slug: postSlugs.slug,
  categoryNamePtBr: categories.namePtBr,
  categoryNameEn: categories.nameEn,
  categorySlugPtBr: categories.slugPtBr,
  categorySlugEn: categories.slugEn,
};

interface PostRow {
  id: string;
  locale: PostLocale;
  translationGroupId: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  categoryId: string;
  status: PostStatus;
  publishedAt: Date | null;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  categoryNamePtBr: string;
  categoryNameEn: string;
  categorySlugPtBr: string;
  categorySlugEn: string;
}

interface TagRow {
  postId: string;
  id: string;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
}

interface TranslationRow {
  translationGroupId: string;
  locale: PostLocale;
  slug: string;
  title: string;
}

function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeLikePattern(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&');
}

function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string } | null)?.code === POSTGRES_UNIQUE_VIOLATION;
}

function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

function toPublishedListItem(
  row: PostRow,
  wordCount: number,
  tagRows: TagRow[],
  translations: TranslationRow[]
): PublishedPostListItem {
  const isEnglish = row.locale === PostLocale.EN;
  return {
    id: row.id,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    category: {
      name: isEnglish ? row.categoryNameEn : row.categoryNamePtBr,
      slug: isEnglish ? row.categorySlugEn : row.categorySlugPtBr,
    },
    tags: tagRows.map((t) => ({
      name: isEnglish ? t.nameEn : t.namePtBr,
      slug: isEnglish ? t.slugEn : t.slugPtBr,
    })),
    publishedAt: row.publishedAt ?? row.createdAt,
    updatedAt: row.updatedAt,
    readingTimeMinutes: readingTimeMinutes(wordCount),
    availableLocales: translations.length > 0 ? translations.map((t) => t.locale) : [row.locale],
  };
}

function toAdminListItem(row: PostRow, tagRows: TagRow[]): AdminPostListItem {
  return {
    id: row.id,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    categoryId: row.categoryId,
    categoryName: row.categoryNamePtBr,
    categorySlug: row.categorySlugPtBr,
    tagIds: tagRows.map((t) => t.id),
    tags: tagRows.map((t) => ({ id: t.id, name: t.namePtBr, slug: t.slugPtBr })),
    status: row.status,
    publishedAt: row.publishedAt,
    currentVersion: row.currentVersion,
    translationGroupId: row.translationGroupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzlePostRepository implements PostRepository, TaxonomyRepository {
  constructor(private readonly db: DbClient) {}

  // --- Leitura pública ---

  public async listPublished(params: ListPublishedPostsParams): Promise<ListPublishedPostsResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;

    const conditions: (SQL | undefined)[] = [
      eq(posts.status, PostStatus.PUBLISHED),
      eq(posts.locale, params.locale),
    ];
    if (params.categorySlug) {
      conditions.push(
        or(eq(categories.slugPtBr, params.categorySlug), eq(categories.slugEn, params.categorySlug))
      );
    }
    if (params.tagSlug) {
      conditions.push(
        inArray(
          posts.id,
          this.db
            .select({ postId: postTags.postId })
            .from(postTags)
            .innerJoin(tags, eq(tags.id, postTags.tagId))
            .where(or(eq(tags.slugPtBr, params.tagSlug), eq(tags.slugEn, params.tagSlug)))
        )
      );
    }
    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({ ...postListColumns, wordCount: wordCountSql })
        .from(posts)
        .innerJoin(postSlugs, currentSlugJoin)
        .innerJoin(categories, categoryJoin)
        .where(where)
        .orderBy(desc(posts.publishedAt), desc(posts.id))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db
        .select({ total: count() })
        .from(posts)
        .innerJoin(categories, categoryJoin)
        .where(where),
    ]);

    const [tagsByPost, translationsByGroup] = await Promise.all([
      this.loadTags(rows.map((r) => r.id)),
      this.loadPublishedTranslations(rows.map((r) => r.translationGroupId)),
    ]);

    return {
      posts: rows.map((row) =>
        toPublishedListItem(
          row,
          row.wordCount,
          tagsByPost.get(row.id) ?? [],
          translationsByGroup.get(row.translationGroupId) ?? []
        )
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async findBySlug(locale: PostLocale, slug: string): Promise<GetPostBySlugResult> {
    const [match] = await this.db
      .select({ postId: postSlugs.postId, isCurrent: postSlugs.isCurrent })
      .from(postSlugs)
      .innerJoin(posts, eq(posts.id, postSlugs.postId))
      .where(
        and(
          eq(postSlugs.slug, slug.trim().toLowerCase()),
          eq(postSlugs.locale, locale),
          eq(posts.status, PostStatus.PUBLISHED)
        )
      )
      .limit(1);

    if (!match) return { status: 'NOT_FOUND' };

    if (!match.isCurrent) {
      const [current] = await this.db
        .select({ slug: postSlugs.slug })
        .from(postSlugs)
        .where(and(eq(postSlugs.postId, match.postId), eq(postSlugs.isCurrent, true)))
        .limit(1);
      if (!current) return { status: 'NOT_FOUND' };
      return { status: 'HISTORICAL_SLUG', canonicalSlug: current.slug, canonicalLocale: locale };
    }

    const [row] = await this.db
      .select({ ...postListColumns, content: posts.content })
      .from(posts)
      .innerJoin(postSlugs, currentSlugJoin)
      .innerJoin(categories, categoryJoin)
      .where(eq(posts.id, match.postId))
      .limit(1);
    if (!row) return { status: 'NOT_FOUND' };

    const [tagsByPost, translationsByGroup] = await Promise.all([
      this.loadTags([row.id]),
      this.loadPublishedTranslations([row.translationGroupId]),
    ]);
    const translations = translationsByGroup.get(row.translationGroupId) ?? [];

    return {
      status: 'FOUND',
      post: {
        ...toPublishedListItem(row, countWords(row.content), tagsByPost.get(row.id) ?? [], translations),
        content: row.content,
        currentVersion: row.currentVersion,
        translationGroupId: row.translationGroupId,
        translations: translations
          .filter((t) => t.locale !== row.locale)
          .map((t) => ({ locale: t.locale, slug: t.slug, title: t.title })),
      },
    };
  }

  // --- Administração de posts ---

  public async listAdmin(params: ListAdminPostsParams = {}): Promise<ListAdminPostsResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const localeFilter = params.locale ? eq(posts.locale, params.locale) : undefined;

    const conditions: (SQL | undefined)[] = [
      // Sem filtro explícito a lixeira fica de fora: ela tem tela própria.
      params.status ? eq(posts.status, params.status) : ne(posts.status, PostStatus.TRASH),
      localeFilter,
    ];
    const search = params.search?.trim();
    if (search) {
      const pattern = `%${escapeLikePattern(search)}%`;
      conditions.push(
        or(
          ilike(posts.title, pattern),
          ilike(posts.excerpt, pattern),
          ilike(postSlugs.slug, pattern)
        )
      );
    }
    const where = and(...conditions);

    const [rows, [{ total }], statusCounts] = await Promise.all([
      this.db
        .select(postListColumns)
        .from(posts)
        .innerJoin(postSlugs, currentSlugJoin)
        .innerJoin(categories, categoryJoin)
        .where(where)
        .orderBy(desc(posts.updatedAt), desc(posts.id))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db
        .select({ total: count() })
        .from(posts)
        .innerJoin(postSlugs, currentSlugJoin)
        .where(where),
      this.db
        .select({ status: posts.status, total: count() })
        .from(posts)
        .where(localeFilter)
        .groupBy(posts.status),
    ]);

    const tagsByPost = await this.loadTags(rows.map((r) => r.id));
    const countOf = (status: PostStatus) =>
      statusCounts.find((c) => c.status === status)?.total ?? 0;

    return {
      posts: rows.map((row) => toAdminListItem(row, tagsByPost.get(row.id) ?? [])),
      total,
      publishedCount: countOf(PostStatus.PUBLISHED),
      draftCount: countOf(PostStatus.DRAFT),
      trashCount: countOf(PostStatus.TRASH),
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async findAdminById(id: UUIDv7): Promise<AdminPostDetail | null> {
    const [row] = await this.db
      .select({ ...postListColumns, content: posts.content, contentHash: posts.contentHash })
      .from(posts)
      .innerJoin(postSlugs, currentSlugJoin)
      .innerJoin(categories, categoryJoin)
      .where(eq(posts.id, id))
      .limit(1);
    if (!row) return null;

    const [tagsByPost, historical] = await Promise.all([
      this.loadTags([row.id]),
      this.db
        .select({ slug: postSlugs.slug })
        .from(postSlugs)
        .where(and(eq(postSlugs.postId, id), eq(postSlugs.isCurrent, false))),
    ]);

    return {
      ...toAdminListItem(row, tagsByPost.get(row.id) ?? []),
      content: row.content,
      contentHash: row.contentHash,
      historicalSlugs: historical.map((h) => h.slug),
    };
  }

  public async savePost(post: Post, currentSlug: string, tagIds: UUIDv7[]): Promise<void> {
    const statements: BatchItem<'pg'>[] = [
      this.db.insert(posts).values({
        id: post.id,
        locale: post.locale,
        translationGroupId: post.translationGroupId,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content.text,
        contentHash: post.content.contentHash,
        coverImageUrl: post.coverImageUrl,
        categoryId: post.categoryId,
        status: post.status,
        publishedAt: post.publishedAt,
        currentVersion: post.currentVersion,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }),
      this.db.insert(postSlugs).values({
        id: UUID.generate(),
        postId: post.id,
        locale: post.locale,
        slug: currentSlug,
        isCurrent: true,
      }),
    ];
    if (tagIds.length > 0) {
      statements.push(
        this.db.insert(postTags).values(tagIds.map((tagId) => ({ postId: post.id, tagId })))
      );
    }

    await this.runAtomically(statements);
  }

  public async updatePost(
    post: Post,
    currentSlug: string,
    tagIds: UUIDv7[],
    previousSlugToArchive?: string | null
  ): Promise<void> {
    const slugRows = await this.db
      .select({ id: postSlugs.id, slug: postSlugs.slug, isCurrent: postSlugs.isCurrent })
      .from(postSlugs)
      .where(eq(postSlugs.postId, post.id));

    const statements: BatchItem<'pg'>[] = [
      this.db
        .update(posts)
        .set({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content.text,
          contentHash: post.content.contentHash,
          coverImageUrl: post.coverImageUrl,
          categoryId: post.categoryId,
          status: post.status,
          publishedAt: post.publishedAt,
          currentVersion: post.currentVersion,
          updatedAt: post.updatedAt,
        })
        .where(eq(posts.id, post.id)),
      this.db.delete(postTags).where(eq(postTags.postId, post.id)),
    ];
    if (tagIds.length > 0) {
      statements.push(
        this.db.insert(postTags).values(tagIds.map((tagId) => ({ postId: post.id, tagId })))
      );
    }

    const current = slugRows.find((r) => r.isCurrent);
    if (current?.slug !== currentSlug) {
      if (current) {
        // Só slug de post publicado vira redirecionamento (BR-004); o de rascunho nunca foi público.
        statements.push(
          previousSlugToArchive
            ? this.db
                .update(postSlugs)
                .set({ isCurrent: false, replacedAt: new Date() })
                .where(eq(postSlugs.id, current.id))
            : this.db.delete(postSlugs).where(eq(postSlugs.id, current.id))
        );
      }

      // Voltar para um slug antigo do próprio post reativa a linha: o índice único não aceita outra.
      const ownOldSlug = slugRows.find((r) => r.slug === currentSlug);
      statements.push(
        ownOldSlug
          ? this.db
              .update(postSlugs)
              .set({ isCurrent: true, replacedAt: null })
              .where(eq(postSlugs.id, ownOldSlug.id))
          : this.db.insert(postSlugs).values({
              id: UUID.generate(),
              postId: post.id,
              locale: post.locale,
              slug: currentSlug,
              isCurrent: true,
            })
      );
    }

    await this.runAtomically(statements);
  }

  public async restorePost(id: UUIDv7): Promise<void> {
    await this.db
      .update(posts)
      .set({
        status: sql`(case when ${posts.publishedAt} is null then 'rascunho' else 'publicado' end)::post_status`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));
  }

  public async deletePostPermanently(id: UUIDv7): Promise<void> {
    // post_slug, post_version e post_tag saem junto pelo ON DELETE CASCADE (BR-007).
    await this.db.delete(posts).where(eq(posts.id, id));
  }

  /**
   * Considera todo slug já registrado, inclusive histórico e de post na lixeira, como o índice
   * uq_post_slug_locale exige (BR-003, BR-013). O slug só é liberado na exclusão definitiva.
   */
  public async isSlugTaken(
    slug: string,
    locale: PostLocale,
    excludePostId?: UUIDv7
  ): Promise<boolean> {
    const rows = await this.db
      .select({ id: postSlugs.id })
      .from(postSlugs)
      .where(
        and(
          eq(postSlugs.slug, slug.trim().toLowerCase()),
          eq(postSlugs.locale, locale),
          excludePostId ? ne(postSlugs.postId, excludePostId) : undefined
        )
      )
      .limit(1);
    return rows.length > 0;
  }

  public async findPostByTranslationGroupAndLocale(
    translationGroupId: UUIDv7,
    locale: PostLocale
  ): Promise<Post | null> {
    const [row] = await this.db
      .select()
      .from(posts)
      .where(and(eq(posts.translationGroupId, translationGroupId), eq(posts.locale, locale)))
      .limit(1);
    if (!row) return null;

    return new Post({
      id: UUID.create(row.id),
      locale: row.locale,
      translationGroupId: UUID.create(row.translationGroupId),
      title: row.title,
      excerpt: row.excerpt,
      content: MarkdownContent.create(row.content),
      coverImageUrl: row.coverImageUrl,
      categoryId: UUID.create(row.categoryId),
      status: row.status,
      publishedAt: row.publishedAt,
      currentVersion: row.currentVersion,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  // --- Versionamento (BR-005) ---

  public async saveVersion(version: PostVersion): Promise<void> {
    const content = {
      title: version.title,
      excerpt: version.excerpt,
      content: version.content,
      contentHash: version.contentHash,
      createdAt: version.createdAt,
    };

    // Republicar um post que voltou a rascunho não incrementa a versão: a linha é regravada.
    await this.db
      .insert(postVersions)
      .values({
        id: version.id,
        postId: version.postId,
        versionNumber: version.versionNumber,
        ...content,
      })
      .onConflictDoUpdate({
        target: [postVersions.postId, postVersions.versionNumber],
        set: content,
      });
  }

  public async listVersions(
    postId: UUIDv7,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ListPostVersionsResult> {
    const where = eq(postVersions.postId, postId);

    const [versions, [{ total }]] = await Promise.all([
      this.db
        .select({
          versionNumber: postVersions.versionNumber,
          title: postVersions.title,
          excerpt: postVersions.excerpt,
          createdAt: postVersions.createdAt,
        })
        .from(postVersions)
        .where(where)
        .orderBy(desc(postVersions.versionNumber))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      this.db.select({ total: count() }).from(postVersions).where(where),
    ]);

    return {
      versions,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      page,
      pageSize,
    };
  }

  // --- Taxonomias ---

  public async listCategories(options: ListTaxonomyOptions = {}): Promise<CategoryWithCount[]> {
    return this.db
      .select({
        id: categories.id,
        namePtBr: categories.namePtBr,
        nameEn: categories.nameEn,
        slugPtBr: categories.slugPtBr,
        slugEn: categories.slugEn,
        postCount: count(posts.id),
      })
      .from(categories)
      .leftJoin(
        posts,
        and(
          eq(posts.categoryId, categories.id),
          options.publishedOnly ? eq(posts.status, PostStatus.PUBLISHED) : undefined
        )
      )
      .groupBy(categories.id)
      .orderBy(asc(categories.namePtBr));
  }

  public async listTags(options: ListTaxonomyOptions = {}): Promise<TagWithCount[]> {
    return this.db
      .select({
        id: tags.id,
        namePtBr: tags.namePtBr,
        nameEn: tags.nameEn,
        slugPtBr: tags.slugPtBr,
        slugEn: tags.slugEn,
        postCount: count(posts.id),
      })
      .from(tags)
      .leftJoin(postTags, eq(postTags.tagId, tags.id))
      .leftJoin(
        posts,
        and(
          eq(posts.id, postTags.postId),
          options.publishedOnly ? eq(posts.status, PostStatus.PUBLISHED) : undefined
        )
      )
      .groupBy(tags.id)
      .orderBy(asc(tags.namePtBr));
  }

  public async findCategoryById(id: UUIDv7): Promise<Category | null> {
    const [row] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!row) return null;
    return new Category({
      id: UUID.create(row.id),
      namePtBr: row.namePtBr,
      nameEn: row.nameEn,
      slugPtBr: SlugValueObject.create(row.slugPtBr),
      slugEn: SlugValueObject.create(row.slugEn),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public async createCategory(category: Category): Promise<void> {
    await this.withDuplicateMessage('Já existe uma categoria com esse nome ou endereço.', () =>
      this.db.insert(categories).values({
        id: category.id,
        namePtBr: category.namePtBr,
        nameEn: category.nameEn,
        slugPtBr: category.slugPtBr,
        slugEn: category.slugEn,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })
    );
  }

  public async updateCategory(category: Category): Promise<void> {
    await this.withDuplicateMessage('Já existe uma categoria com esse nome ou endereço.', () =>
      this.db
        .update(categories)
        .set({
          namePtBr: category.namePtBr,
          nameEn: category.nameEn,
          slugPtBr: category.slugPtBr,
          slugEn: category.slugEn,
          updatedAt: category.updatedAt,
        })
        .where(eq(categories.id, category.id))
    );
  }

  public async deleteCategory(id: UUIDv7): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  public async getCategoryPostCount(id: UUIDv7): Promise<number> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(posts)
      .where(eq(posts.categoryId, id));
    return total;
  }

  public async findTagById(id: UUIDv7): Promise<Tag | null> {
    const [row] = await this.db.select().from(tags).where(eq(tags.id, id)).limit(1);
    if (!row) return null;
    return new Tag({
      id: UUID.create(row.id),
      namePtBr: row.namePtBr,
      nameEn: row.nameEn,
      slugPtBr: SlugValueObject.create(row.slugPtBr),
      slugEn: SlugValueObject.create(row.slugEn),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public async createTag(tag: Tag): Promise<void> {
    await this.withDuplicateMessage('Já existe uma tag com esse nome ou endereço.', () =>
      this.db.insert(tags).values({
        id: tag.id,
        namePtBr: tag.namePtBr,
        nameEn: tag.nameEn,
        slugPtBr: tag.slugPtBr,
        slugEn: tag.slugEn,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      })
    );
  }

  public async updateTag(tag: Tag): Promise<void> {
    await this.withDuplicateMessage('Já existe uma tag com esse nome ou endereço.', () =>
      this.db
        .update(tags)
        .set({
          namePtBr: tag.namePtBr,
          nameEn: tag.nameEn,
          slugPtBr: tag.slugPtBr,
          slugEn: tag.slugEn,
          updatedAt: tag.updatedAt,
        })
        .where(eq(tags.id, tag.id))
    );
  }

  public async deleteTag(id: UUIDv7): Promise<void> {
    await this.db.delete(tags).where(eq(tags.id, id));
  }

  public async getTagPostCount(id: UUIDv7): Promise<number> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postTags)
      .where(eq(postTags.tagId, id));
    return total;
  }

  // --- Apoio ---

  /** O driver neon-http não tem db.transaction; db.batch envia tudo em uma única transação. */
  private async runAtomically(statements: BatchItem<'pg'>[]): Promise<void> {
    const [first, ...rest] = statements;
    await this.db.batch([first, ...rest]);
  }

  private async withDuplicateMessage(message: string, write: () => PromiseLike<unknown>): Promise<void> {
    try {
      await write();
    } catch (err) {
      if (isUniqueViolation(err)) throw new Error(message);
      throw err;
    }
  }

  private async loadTags(postIds: string[]): Promise<Map<string, TagRow[]>> {
    if (postIds.length === 0) return new Map();

    const rows = await this.db
      .select({
        postId: postTags.postId,
        id: tags.id,
        namePtBr: tags.namePtBr,
        nameEn: tags.nameEn,
        slugPtBr: tags.slugPtBr,
        slugEn: tags.slugEn,
      })
      .from(postTags)
      .innerJoin(tags, eq(tags.id, postTags.tagId))
      .where(inArray(postTags.postId, postIds))
      .orderBy(asc(tags.namePtBr));

    return groupBy(rows, (r) => r.postId);
  }

  /** Só traduções publicadas: rascunhos são invisíveis nas rotas públicas (BR-006). */
  private async loadPublishedTranslations(
    translationGroupIds: string[]
  ): Promise<Map<string, TranslationRow[]>> {
    if (translationGroupIds.length === 0) return new Map();

    const rows = await this.db
      .select({
        translationGroupId: posts.translationGroupId,
        locale: posts.locale,
        slug: postSlugs.slug,
        title: posts.title,
      })
      .from(posts)
      .innerJoin(postSlugs, currentSlugJoin)
      .where(
        and(
          inArray(posts.translationGroupId, translationGroupIds),
          eq(posts.status, PostStatus.PUBLISHED)
        )
      );

    return groupBy(rows, (r) => r.translationGroupId);
  }
}
