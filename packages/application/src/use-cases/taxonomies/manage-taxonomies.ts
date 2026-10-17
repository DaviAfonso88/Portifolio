import {
  Category,
  Tag,
  SlugValueObject,
  UUID,
  type UUIDv7,
} from '@davidev/domain';
import type { UseCase } from '../../types/use-case';
import type { TaxonomyRepository } from '../../ports/taxonomy-repository.port';

export interface CreateCategoryInput {
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
}

export type CreateCategoryOutput =
  | { success: true; category: Category }
  | { success: false; error: string; code: 'INVALID_SLUG' | 'VALIDATION_ERROR' };

export class CreateCategoryUseCase
  implements UseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private readonly taxonomyRepo: TaxonomyRepository) {}

  public async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    try {
      const slugPt = SlugValueObject.create(input.slugPtBr);
      const slugEn = SlugValueObject.create(input.slugEn);

      const category = new Category({
        namePtBr: input.namePtBr,
        nameEn: input.nameEn,
        slugPtBr: slugPt,
        slugEn: slugEn,
      });

      await this.taxonomyRepo.createCategory(category);
      return { success: true, category };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        code: 'INVALID_SLUG',
      };
    }
  }
}

export interface UpdateCategoryInput {
  id: UUIDv7;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
}

export type UpdateCategoryOutput =
  | { success: true; category: Category }
  | { success: false; error: string; code: 'NOT_FOUND' | 'INVALID_SLUG' };

export class UpdateCategoryUseCase
  implements UseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private readonly taxonomyRepo: TaxonomyRepository) {}

  public async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const existing = await this.taxonomyRepo.findCategoryById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Categoria não encontrada.',
        code: 'NOT_FOUND',
      };
    }

    try {
      const slugPt = SlugValueObject.create(input.slugPtBr);
      const slugEn = SlugValueObject.create(input.slugEn);

      existing.namePtBr = input.namePtBr.trim();
      existing.nameEn = input.nameEn.trim();
      existing.slugPtBr = slugPt;
      existing.slugEn = slugEn;
      existing.updatedAt = new Date();

      await this.taxonomyRepo.updateCategory(existing);
      return { success: true, category: existing };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        code: 'INVALID_SLUG',
      };
    }
  }
}

export interface DeleteCategoryInput {
  id: UUIDv7;
}

export type DeleteCategoryOutput =
  | { success: true }
  | { success: false; error: string; code: 'NOT_FOUND' | 'RESOURCE_IN_USE' };

export class DeleteCategoryUseCase
  implements UseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private readonly taxonomyRepo: TaxonomyRepository) {}

  public async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const existing = await this.taxonomyRepo.findCategoryById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Categoria não encontrada.',
        code: 'NOT_FOUND',
      };
    }

    // BR-009: Categoria vinculada a pelo menos um post não pode ser excluída
    const postCount = await this.taxonomyRepo.getCategoryPostCount(input.id);
    if (postCount > 0) {
      return {
        success: false,
        error: `Categoria em uso por ${postCount} artigo(s) não pode ser excluída.`,
        code: 'RESOURCE_IN_USE',
      };
    }

    await this.taxonomyRepo.deleteCategory(input.id);
    return { success: true };
  }
}

export interface CreateTagInput {
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
}

export type CreateTagOutput =
  | { success: true; tag: Tag }
  | { success: false; error: string; code: 'INVALID_SLUG' | 'VALIDATION_ERROR' };

export class CreateTagUseCase implements UseCase<CreateTagInput, CreateTagOutput> {
  constructor(private readonly taxonomyRepo: TaxonomyRepository) {}

  public async execute(input: CreateTagInput): Promise<CreateTagOutput> {
    try {
      const slugPt = SlugValueObject.create(input.slugPtBr);
      const slugEn = SlugValueObject.create(input.slugEn);

      const tag = new Tag({
        namePtBr: input.namePtBr,
        nameEn: input.nameEn,
        slugPtBr: slugPt,
        slugEn: slugEn,
      });

      await this.taxonomyRepo.createTag(tag);
      return { success: true, tag };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        code: 'INVALID_SLUG',
      };
    }
  }
}

export interface UpdateTagInput {
  id: UUIDv7;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
}

export type UpdateTagOutput =
  | { success: true; tag: Tag }
  | { success: false; error: string; code: 'NOT_FOUND' | 'INVALID_SLUG' };

export class UpdateTagUseCase implements UseCase<UpdateTagInput, UpdateTagOutput> {
  constructor(private readonly taxonomyRepo: TaxonomyRepository) {}

  public async execute(input: UpdateTagInput): Promise<UpdateTagOutput> {
    const existing = await this.taxonomyRepo.findTagById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Tag não encontrada.',
        code: 'NOT_FOUND',
      };
    }

    try {
      const slugPt = SlugValueObject.create(input.slugPtBr);
      const slugEn = SlugValueObject.create(input.slugEn);

      existing.namePtBr = input.namePtBr.trim();
      existing.nameEn = input.nameEn.trim();
      existing.slugPtBr = slugPt;
      existing.slugEn = slugEn;
      existing.updatedAt = new Date();

      await this.taxonomyRepo.updateTag(existing);
      return { success: true, tag: existing };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        code: 'INVALID_SLUG',
      };
    }
  }
}

export interface DeleteTagInput {
  id: UUIDv7;
}

export type DeleteTagOutput =
  | { success: true }
  | { success: false; error: string; code: 'NOT_FOUND' | 'RESOURCE_IN_USE' };

export class DeleteTagUseCase implements UseCase<DeleteTagInput, DeleteTagOutput> {
  constructor(private readonly taxonomyRepo: TaxonomyRepository) {}

  public async execute(input: DeleteTagInput): Promise<DeleteTagOutput> {
    const existing = await this.taxonomyRepo.findTagById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Tag não encontrada.',
        code: 'NOT_FOUND',
      };
    }

    // BR-009: Tag vinculada a pelo menos um post não pode ser excluída
    const postCount = await this.taxonomyRepo.getTagPostCount(input.id);
    if (postCount > 0) {
      return {
        success: false,
        error: `Tag em uso por ${postCount} artigo(s) não pode ser excluída.`,
        code: 'RESOURCE_IN_USE',
      };
    }

    await this.taxonomyRepo.deleteTag(input.id);
    return { success: true };
  }
}
