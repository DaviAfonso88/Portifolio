import {
  PostLocale,
  isValidLocale,
  ok,
  type Result,
} from '@davidev/domain';
import type { UseCase } from '../types/use-case';
import type {
  PostRepository,
  ListPublishedPostsParams,
  ListPublishedPostsResult,
} from '../ports/post-repository.port';

export interface ListPublishedPostsInput {
  locale: string;
  categorySlug?: string;
  tagSlug?: string;
  page?: number;
  limit?: number;
}

export class ListPublishedPostsUseCase
  implements UseCase<ListPublishedPostsInput, Result<ListPublishedPostsResult, string>>
{
  constructor(private readonly postRepository: PostRepository) {}

  public async execute(
    input: ListPublishedPostsInput
  ): Promise<Result<ListPublishedPostsResult, string>> {
    const locale: PostLocale = isValidLocale(input.locale)
      ? (input.locale as PostLocale)
      : PostLocale.PT_BR;

    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(50, Math.max(1, input.limit ?? 10));

    const params: ListPublishedPostsParams = {
      locale,
      categorySlug: input.categorySlug?.trim() || undefined,
      tagSlug: input.tagSlug?.trim() || undefined,
      page,
      limit,
    };

    const result = await this.postRepository.listPublished(params);
    return ok(result);
  }
}
