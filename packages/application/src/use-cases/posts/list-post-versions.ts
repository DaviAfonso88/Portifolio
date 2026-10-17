import type { UUIDv7 } from '@davidev/domain';
import type { UseCase } from '../../types/use-case';
import type { PostRepository, PostVersionSummary } from '../../ports/post-repository.port';

export interface ListPostVersionsInput {
  postId: UUIDv7;
  page?: number;
  pageSize?: number;
}

export type ListPostVersionsOutput =
  | {
      success: true;
      versions: PostVersionSummary[];
      meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }
  | {
      success: false;
      error: string;
      code: 'NOT_FOUND';
    };

export class ListPostVersionsUseCase
  implements UseCase<ListPostVersionsInput, ListPostVersionsOutput>
{
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(input: ListPostVersionsInput): Promise<ListPostVersionsOutput> {
    const existing = await this.postRepo.findAdminById(input.postId);
    if (!existing) {
      return {
        success: false,
        error: 'Artigo não encontrado.',
        code: 'NOT_FOUND',
      };
    }

    const page = input.page && input.page > 0 ? input.page : 1;
    const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 10;

    const result = await this.postRepo.listVersions(input.postId, page, pageSize);

    return {
      success: true,
      versions: result.versions,
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
}
