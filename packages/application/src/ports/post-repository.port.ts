import type { Post, PostLocale, PostStatus, PostVersion, UUIDv7 } from '@davidev/domain';

export interface PublishedPostListItem {
  id: string;
  locale: PostLocale;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: {
    name: string;
    slug: string;
  };
  tags: {
    name: string;
    slug: string;
  }[];
  publishedAt: Date;
  updatedAt: Date;
  readingTimeMinutes: number;
  availableLocales: PostLocale[];
}

export interface PublishedPostDetail extends PublishedPostListItem {
  content: string;
  currentVersion: number;
  translationGroupId: string;
  translations: {
    locale: PostLocale;
    slug: string;
    title: string;
  }[];
}

export type GetPostBySlugResult =
  | {
      status: 'FOUND';
      post: PublishedPostDetail;
    }
  | {
      status: 'HISTORICAL_SLUG';
      canonicalSlug: string;
      canonicalLocale: PostLocale;
    }
  | {
      status: 'NOT_FOUND';
    };

export interface ListPublishedPostsParams {
  locale: PostLocale;
  categorySlug?: string;
  tagSlug?: string;
  page?: number;
  limit?: number;
}

export interface ListPublishedPostsResult {
  posts: PublishedPostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPostListItem {
  id: string;
  locale: PostLocale;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  tagIds: string[];
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  status: PostStatus;
  publishedAt: Date | null;
  currentVersion: number;
  translationGroupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPostDetail extends AdminPostListItem {
  content: string;
  contentHash: string;
  historicalSlugs?: string[];
}

export interface ListAdminPostsParams {
  status?: PostStatus;
  locale?: PostLocale;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListAdminPostsResult {
  posts: AdminPostListItem[];
  total: number;
  publishedCount: number;
  draftCount: number;
  trashCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostRepository {
  listPublished(params: ListPublishedPostsParams): Promise<ListPublishedPostsResult>;
  findBySlug(locale: PostLocale, slug: string): Promise<GetPostBySlugResult>;

  // Admin repository methods
  listAdmin(params: ListAdminPostsParams): Promise<ListAdminPostsResult>;
  findAdminById(id: UUIDv7): Promise<AdminPostDetail | null>;
  savePost(post: Post, currentSlug: string, tagIds: UUIDv7[]): Promise<void>;
  updatePost(
    post: Post,
    currentSlug: string,
    tagIds: UUIDv7[],
    previousSlugToArchive?: string | null
  ): Promise<void>;
  restorePost(id: UUIDv7): Promise<void>;
  deletePostPermanently(id: UUIDv7): Promise<void>;
  isSlugTaken(slug: string, locale: PostLocale, excludePostId?: UUIDv7): Promise<boolean>;
  findPostByTranslationGroupAndLocale(
    translationGroupId: UUIDv7,
    locale: PostLocale
  ): Promise<Post | null>;

  // Editorial Versioning (BR-005)
  saveVersion(version: PostVersion): Promise<void>;
  listVersions(
    postId: UUIDv7,
    page?: number,
    pageSize?: number
  ): Promise<ListPostVersionsResult>;
}

export interface PostVersionSummary {
  versionNumber: number;
  title: string;
  excerpt: string;
  createdAt: Date;
}

export interface ListPostVersionsResult {
  versions: PostVersionSummary[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}
