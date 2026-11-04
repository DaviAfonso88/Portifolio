import { ok, type Result } from '@davidev/domain';
import type { UseCase } from '../types/use-case';
import type {
  TaxonomyRepository,
  CategoryWithCount,
  TagWithCount,
} from '../ports/taxonomy-repository.port';

export interface ListTaxonomiesOutput {
  categories: CategoryWithCount[];
  tags: TagWithCount[];
}

export class ListTaxonomiesUseCase
  implements UseCase<void, Result<ListTaxonomiesOutput, string>>
{
  constructor(private readonly taxonomyRepository: TaxonomyRepository) {}

  public async execute(): Promise<Result<ListTaxonomiesOutput, string>> {
    const [categories, tags] = await Promise.all([
      this.taxonomyRepository.listCategories({ publishedOnly: true }),
      this.taxonomyRepository.listTags({ publishedOnly: true }),
    ]);

    return ok({ categories, tags });
  }
}
