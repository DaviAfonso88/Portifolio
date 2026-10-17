import {
  PostLocale,
  isValidLocale,
  ok,
  fail,
  type Result,
} from '@davidev/domain';
import type { UseCase } from '../types/use-case';
import type {
  PostRepository,
  GetPostBySlugResult,
} from '../ports/post-repository.port';

export interface GetPostBySlugInput {
  locale: string;
  slug: string;
}

export class GetPostBySlugUseCase
  implements UseCase<GetPostBySlugInput, Result<GetPostBySlugResult, string>>
{
  constructor(private readonly postRepository: PostRepository) {}

  public async execute(
    input: GetPostBySlugInput
  ): Promise<Result<GetPostBySlugResult, string>> {
    const locale: PostLocale = isValidLocale(input.locale)
      ? (input.locale as PostLocale)
      : PostLocale.PT_BR;

    const slug = input.slug?.trim();
    if (!slug) {
      return fail('INVALID_SLUG');
    }

    const result = await this.postRepository.findBySlug(locale, slug);

    if (result.status === 'NOT_FOUND') {
      return fail('POST_NOT_FOUND');
    }

    return ok(result);
  }
}
