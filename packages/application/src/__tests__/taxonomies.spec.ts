import { describe, it, expect, beforeEach } from 'vitest';
import { Category, Tag, SlugValueObject, UUID, type UUIDv7 } from '@davidev/domain';
import {
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  CreateTagUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
  ListTaxonomiesUseCase,
  type TaxonomyRepository,
  type CategoryWithCount,
  type TagWithCount,
} from '../index';

class MockTaxonomyRepo implements TaxonomyRepository {
  public categories: Map<string, Category> = new Map();
  public tags: Map<string, Tag> = new Map();
  public categoryPostCounts: Map<string, number> = new Map();
  public tagPostCounts: Map<string, number> = new Map();

  async listCategories(): Promise<CategoryWithCount[]> {
    return Array.from(this.categories.values()).map((c) => ({
      ...c,
      postCount: this.categoryPostCounts.get(c.id.toString()) ?? 0,
    }));
  }

  async listTags(): Promise<TagWithCount[]> {
    return Array.from(this.tags.values()).map((t) => ({
      ...t,
      postCount: this.tagPostCounts.get(t.id.toString()) ?? 0,
    }));
  }

  async findCategoryById(id: UUIDv7): Promise<Category | null> {
    return this.categories.get(id.toString()) ?? null;
  }

  async findTagById(id: UUIDv7): Promise<Tag | null> {
    return this.tags.get(id.toString()) ?? null;
  }

  async createCategory(category: Category): Promise<void> {
    this.categories.set(category.id.toString(), category);
  }

  async updateCategory(category: Category): Promise<void> {
    this.categories.set(category.id.toString(), category);
  }

  async deleteCategory(id: UUIDv7): Promise<void> {
    this.categories.delete(id.toString());
  }

  async createTag(tag: Tag): Promise<void> {
    this.tags.set(tag.id.toString(), tag);
  }

  async updateTag(tag: Tag): Promise<void> {
    this.tags.set(tag.id.toString(), tag);
  }

  async deleteTag(id: UUIDv7): Promise<void> {
    this.tags.delete(id.toString());
  }

  async getCategoryPostCount(id: UUIDv7): Promise<number> {
    return this.categoryPostCounts.get(id.toString()) ?? 0;
  }

  async getTagPostCount(id: UUIDv7): Promise<number> {
    return this.tagPostCounts.get(id.toString()) ?? 0;
  }
}

describe('Taxonomy Use Cases (BR-009)', () => {
  let repo: MockTaxonomyRepo;
  let createCat: CreateCategoryUseCase;
  let updateCat: UpdateCategoryUseCase;
  let deleteCat: DeleteCategoryUseCase;
  let createTag: CreateTagUseCase;
  let updateTag: UpdateTagUseCase;
  let deleteTag: DeleteTagUseCase;
  let listTaxonomies: ListTaxonomiesUseCase;

  beforeEach(() => {
    repo = new MockTaxonomyRepo();
    createCat = new CreateCategoryUseCase(repo);
    updateCat = new UpdateCategoryUseCase(repo);
    deleteCat = new DeleteCategoryUseCase(repo);
    createTag = new CreateTagUseCase(repo);
    updateTag = new UpdateTagUseCase(repo);
    deleteTag = new DeleteTagUseCase(repo);
    listTaxonomies = new ListTaxonomiesUseCase(repo);
  });

  describe('Categories Management', () => {
    it('creates a category with valid bilingual slugs', async () => {
      const result = await createCat.execute({
        namePtBr: 'Engenharia de Software',
        nameEn: 'Software Engineering',
        slugPtBr: 'engenharia-de-software',
        slugEn: 'software-engineering',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.category.namePtBr).toBe('Engenharia de Software');
        expect(repo.categories.has(result.category.id.toString())).toBe(true);
      }
    });

    it('generates the slugs from the names when they are not provided', async () => {
      const result = await createCat.execute({
        namePtBr: 'Automação de Processos',
        nameEn: 'Process Automation',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.category.slugPtBr).toBe('automacao-de-processos');
        expect(result.category.slugEn).toBe('process-automation');
      }
    });

    it('fails when no slug can be generated from the name', async () => {
      const result = await createCat.execute({ namePtBr: '###', nameEn: 'Valid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_SLUG');
      }
    });

    it('keeps the current slugs when renaming a category, so public URLs do not change', async () => {
      const createRes = await createCat.execute({ namePtBr: 'Antigo', nameEn: 'Old' });
      if (!createRes.success) throw new Error(createRes.error);

      const updateRes = await updateCat.execute({
        id: createRes.category.id,
        namePtBr: 'Novo Nome',
        nameEn: 'New Name',
      });

      expect(updateRes.success).toBe(true);
      if (updateRes.success) {
        expect(updateRes.category.namePtBr).toBe('Novo Nome');
        expect(updateRes.category.slugPtBr).toBe('antigo');
        expect(updateRes.category.slugEn).toBe('old');
      }
    });

    it('returns error if slug is invalid during creation', async () => {
      const result = await createCat.execute({
        namePtBr: 'Engenharia',
        nameEn: 'Engineering',
        slugPtBr: 'Slug Invalido!',
        slugEn: 'engineering',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_SLUG');
      }
    });

    it('updates category successfully', async () => {
      const createRes = await createCat.execute({
        namePtBr: 'Antigo',
        nameEn: 'Old',
        slugPtBr: 'antigo',
        slugEn: 'old',
      });
      expect(createRes.success).toBe(true);
      if (!createRes.success) return;

      const updateRes = await updateCat.execute({
        id: createRes.category.id,
        namePtBr: 'Novo Nome',
        nameEn: 'New Name',
        slugPtBr: 'novo-nome',
        slugEn: 'new-name',
      });

      expect(updateRes.success).toBe(true);
      if (updateRes.success) {
        expect(updateRes.category.namePtBr).toBe('Novo Nome');
      }
    });

    it('returns NOT_FOUND if updating non-existent category', async () => {
      const result = await updateCat.execute({
        id: UUID.generate(),
        namePtBr: 'Inexistente',
        nameEn: 'NonExistent',
        slugPtBr: 'inexistente',
        slugEn: 'non-existent',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND');
      }
    });

    it('returns INVALID_SLUG if update has invalid slug', async () => {
      const createRes = await createCat.execute({
        namePtBr: 'Valido',
        nameEn: 'Valid',
        slugPtBr: 'valido',
        slugEn: 'valid',
      });
      if (!createRes.success) return;

      const result = await updateCat.execute({
        id: createRes.category.id,
        namePtBr: 'Nome',
        nameEn: 'Name',
        slugPtBr: 'slug com espaço',
        slugEn: 'valid-en',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_SLUG');
      }
    });

    it('deletes category if no posts are linked', async () => {
      const createRes = await createCat.execute({
        namePtBr: 'Temporaria',
        nameEn: 'Temp',
        slugPtBr: 'temporaria',
        slugEn: 'temp',
      });
      if (!createRes.success) return;

      const delRes = await deleteCat.execute({ id: createRes.category.id });
      expect(delRes.success).toBe(true);
      expect(repo.categories.has(createRes.category.id.toString())).toBe(false);
    });

    it('blocks category deletion if posts are linked (BR-009)', async () => {
      const cat = new Category({
        namePtBr: 'Arquitetura',
        nameEn: 'Architecture',
        slugPtBr: SlugValueObject.create('arquitetura'),
        slugEn: SlugValueObject.create('architecture'),
      });
      await repo.createCategory(cat);
      repo.categoryPostCounts.set(cat.id.toString(), 3); // 3 linked posts

      const delRes = await deleteCat.execute({ id: cat.id });
      expect(delRes.success).toBe(false);
      if (!delRes.success) {
        expect(delRes.code).toBe('RESOURCE_IN_USE');
      }
    });

    it('returns NOT_FOUND when deleting unexisting category', async () => {
      const delRes = await deleteCat.execute({ id: UUID.generate() });
      expect(delRes.success).toBe(false);
      if (!delRes.success) {
        expect(delRes.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Tags Management', () => {
    it('creates tag with valid bilingual slugs', async () => {
      const res = await createTag.execute({
        namePtBr: 'TypeScript',
        nameEn: 'TypeScript',
        slugPtBr: 'typescript',
        slugEn: 'typescript',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(repo.tags.has(res.tag.id.toString())).toBe(true);
      }
    });

    it('generates tag slugs from the names and keeps them when renaming', async () => {
      const createRes = await createTag.execute({ namePtBr: 'Segurança', nameEn: 'Security' });
      if (!createRes.success) throw new Error(createRes.error);
      expect(createRes.tag.slugPtBr).toBe('seguranca');
      expect(createRes.tag.slugEn).toBe('security');

      const updateRes = await updateTag.execute({
        id: createRes.tag.id,
        namePtBr: 'Segurança web',
        nameEn: 'Web security',
      });

      expect(updateRes.success).toBe(true);
      if (updateRes.success) {
        expect(updateRes.tag.namePtBr).toBe('Segurança web');
        expect(updateRes.tag.slugPtBr).toBe('seguranca');
        expect(updateRes.tag.slugEn).toBe('security');
      }
    });

    it('returns error if tag slug is invalid', async () => {
      const res = await createTag.execute({
        namePtBr: 'TypeScript',
        nameEn: 'TypeScript',
        slugPtBr: 'TypeScript com Maiúscula',
        slugEn: 'typescript',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('INVALID_SLUG');
      }
    });

    it('updates tag successfully', async () => {
      const createRes = await createTag.execute({
        namePtBr: 'Node',
        nameEn: 'Node',
        slugPtBr: 'node',
        slugEn: 'node',
      });
      if (!createRes.success) return;

      const updateRes = await updateTag.execute({
        id: createRes.tag.id,
        namePtBr: 'Node.js',
        nameEn: 'Node.js',
        slugPtBr: 'nodejs',
        slugEn: 'nodejs',
      });
      expect(updateRes.success).toBe(true);
      if (updateRes.success) {
        expect(updateRes.tag.namePtBr).toBe('Node.js');
      }
    });

    it('returns NOT_FOUND if updating non-existent tag', async () => {
      const result = await updateTag.execute({
        id: UUID.generate(),
        namePtBr: 'Inexistente',
        nameEn: 'NonExistent',
        slugPtBr: 'inexistente',
        slugEn: 'non-existent',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND');
      }
    });

    it('returns INVALID_SLUG if tag update has invalid slug', async () => {
      const createRes = await createTag.execute({
        namePtBr: 'Valida',
        nameEn: 'Valid',
        slugPtBr: 'valida',
        slugEn: 'valid',
      });
      if (!createRes.success) return;

      const result = await updateTag.execute({
        id: createRes.tag.id,
        namePtBr: 'Valida',
        nameEn: 'Valid',
        slugPtBr: 'valida',
        slugEn: 'INVALID SLUG',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_SLUG');
      }
    });

    it('deletes tag if no posts are linked', async () => {
      const createRes = await createTag.execute({
        namePtBr: 'Solta',
        nameEn: 'Unused',
        slugPtBr: 'solta',
        slugEn: 'unused',
      });
      if (!createRes.success) return;

      const delRes = await deleteTag.execute({ id: createRes.tag.id });
      expect(delRes.success).toBe(true);
      expect(repo.tags.has(createRes.tag.id.toString())).toBe(false);
    });

    it('blocks tag deletion if posts are linked (BR-009)', async () => {
      const tag = new Tag({
        namePtBr: 'Docker',
        nameEn: 'Docker',
        slugPtBr: SlugValueObject.create('docker'),
        slugEn: SlugValueObject.create('docker'),
      });
      await repo.createTag(tag);
      repo.tagPostCounts.set(tag.id.toString(), 2);

      const delRes = await deleteTag.execute({ id: tag.id });
      expect(delRes.success).toBe(false);
      if (!delRes.success) {
        expect(delRes.code).toBe('RESOURCE_IN_USE');
      }
    });

    it('returns NOT_FOUND when deleting unexisting tag', async () => {
      const delRes = await deleteTag.execute({ id: UUID.generate() });
      expect(delRes.success).toBe(false);
      if (!delRes.success) {
        expect(delRes.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('ListTaxonomiesUseCase', () => {
    it('returns categories and tags simultaneously', async () => {
      await createCat.execute({
        namePtBr: 'Cat1',
        nameEn: 'Cat1',
        slugPtBr: 'cat-1',
        slugEn: 'cat-1',
      });
      await createTag.execute({
        namePtBr: 'Tag1',
        nameEn: 'Tag1',
        slugPtBr: 'tag-1',
        slugEn: 'tag-1',
      });

      const result = await listTaxonomies.execute();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categories).toHaveLength(1);
        expect(result.data.tags).toHaveLength(1);
      }
    });
  });
});
