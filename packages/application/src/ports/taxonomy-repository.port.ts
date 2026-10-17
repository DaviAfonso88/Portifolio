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

export interface TaxonomyRepository {
  listCategories(): Promise<CategoryWithCount[]>;
  listTags(): Promise<TagWithCount[]>;
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
