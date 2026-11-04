import type { Category, Tag, UUIDv7 } from '@davidev/domain';

export interface CategoryWithCount {
  id: string;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
  postCount: number;
}

export interface TagWithCount {
  id: string;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
  postCount: number;
}

export interface ListTaxonomyOptions {
  /** Conta só posts publicados, para exposição pública (BR-006). O padrão conta todos, como o BR-009. */
  publishedOnly?: boolean;
}

export interface TaxonomyRepository {
  listCategories(options?: ListTaxonomyOptions): Promise<CategoryWithCount[]>;
  listTags(options?: ListTaxonomyOptions): Promise<TagWithCount[]>;
  findCategoryById(id: UUIDv7): Promise<Category | null>;
  createCategory(category: Category): Promise<void>;
  updateCategory(category: Category): Promise<void>;
  deleteCategory(id: UUIDv7): Promise<void>;
  getCategoryPostCount(id: UUIDv7): Promise<number>;

  findTagById(id: UUIDv7): Promise<Tag | null>;
  createTag(tag: Tag): Promise<void>;
  updateTag(tag: Tag): Promise<void>;
  deleteTag(id: UUIDv7): Promise<void>;
  getTagPostCount(id: UUIDv7): Promise<number>;
}
