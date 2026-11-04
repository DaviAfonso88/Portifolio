import {
  Post,
  PostVersion,
  PostLocale,
  PostStatus,
  MarkdownContent,
  SlugValueObject,
  UUID,
  type UUIDv7,
} from '@davidev/domain';
import type { UseCase } from '../../types/use-case';
import type {
  PostRepository,
  AdminPostDetail,
  ListAdminPostsParams,
  ListAdminPostsResult,
} from '../../ports/post-repository.port';

export interface CreatePostInput {
  locale: PostLocale;
  translationGroupId?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  categoryId: UUIDv7;
  tagIds?: UUIDv7[];
  publishImmediately?: boolean;
}

export type CreatePostOutput =
  | { success: true; post: Post; slug: string }
  | {
      success: false;
      error: string;
      code:
        | 'SLUG_CONFLICT'
        | 'TOO_MANY_TAGS'
        | 'TRANSLATION_EXISTS'
        | 'PUBLISH_REQUIREMENTS_NOT_MET'
        | 'VALIDATION_ERROR';
    };

export class CreatePostUseCase implements UseCase<CreatePostInput, CreatePostOutput> {
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(input: CreatePostInput): Promise<CreatePostOutput> {
    const tagIds = input.tagIds ?? [];

    // BR-010: Um post aceita no máximo 10 tags associadas
    if (tagIds.length > 10) {
      return {
        success: false,
        error: 'Um artigo aceita no máximo 10 tags associadas.',
        code: 'TOO_MANY_TAGS',
      };
    }

    let slug: string;
    try {
      slug = SlugValueObject.create(input.slug).toString();
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        code: 'VALIDATION_ERROR',
      };
    }

    // BR-003 & BR-013: Slug único por locale
    const isTaken = await this.postRepo.isSlugTaken(slug, input.locale);
    if (isTaken) {
      return {
        success: false,
        error: `O endereço "${slug}" já está em uso neste idioma ou foi arquivado como histórico.`,
        code: 'SLUG_CONFLICT',
      };
    }

    // Translation Group ID (generate new UUIDv7 if not linked)
    const translationGroupId: UUIDv7 = input.translationGroupId
      ? UUID.create(input.translationGroupId)
      : UUID.generate();

    // BR-011: Um grupo de tradução admite no máximo 1 post por locale
    if (input.translationGroupId) {
      const existingInGroup = await this.postRepo.findPostByTranslationGroupAndLocale(
        translationGroupId,
        input.locale
      );
      if (existingInGroup) {
        return {
          success: false,
          error: `Já existe um artigo no idioma ${input.locale} vinculado a este grupo de tradução.`,
          code: 'TRANSLATION_EXISTS',
        };
      }
    }

    // BR-001: Validações para publicação
    if (input.publishImmediately) {
      if (
        !input.title?.trim() ||
        !slug ||
        !input.excerpt?.trim() ||
        !input.content?.trim() ||
        !input.categoryId
      ) {
        return {
          success: false,
          error: 'Publicação exige título, slug, resumo, conteúdo e categoria preenchidos.',
          code: 'PUBLISH_REQUIREMENTS_NOT_MET',
        };
      }
    }

    let post: Post;
    try {
      post = new Post({
        locale: input.locale,
        translationGroupId,
        title: input.title,
        excerpt: input.excerpt,
        content: MarkdownContent.create(input.content || ''),
        coverImageUrl: input.coverImageUrl ?? null,
        categoryId: input.categoryId,
        status: input.publishImmediately ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        publishedAt: input.publishImmediately ? new Date() : null, // BR-002
      });
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        code: 'VALIDATION_ERROR',
      };
    }

    await this.postRepo.savePost(post, slug, tagIds);

    // BR-005: Salva versão inicial (v1) na primeira publicação
    if (input.publishImmediately) {
      const initialVersion = PostVersion.createFromPost(post);
      await this.postRepo.saveVersion(initialVersion);
    }

    return { success: true, post, slug };
  }
}

export interface UpdatePostInput {
  id: UUIDv7;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string | null;
  categoryId?: UUIDv7;
  tagIds?: UUIDv7[];
}

export type UpdatePostOutput =
  | { success: true; post: Post; slug: string }
  | {
      success: false;
      error: string;
      code:
        | 'NOT_FOUND'
        | 'SLUG_CONFLICT'
        | 'TOO_MANY_TAGS'
        | 'VALIDATION_ERROR'
        | 'INVALID_SLUG';
    };

export class UpdatePostUseCase implements UseCase<UpdatePostInput, UpdatePostOutput> {
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(input: UpdatePostInput): Promise<UpdatePostOutput> {
    const existing = await this.postRepo.findAdminById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Artigo não encontrado.',
        code: 'NOT_FOUND',
      };
    }

    const tagIds = input.tagIds !== undefined ? input.tagIds : existing.tagIds.map(UUID.create);
    if (tagIds.length > 10) {
      return {
        success: false,
        error: 'Um artigo aceita no máximo 10 tags associadas.',
        code: 'TOO_MANY_TAGS',
      };
    }

    let targetSlug = existing.slug;
    let previousSlugToArchive: string | null = null;

    if (input.slug && input.slug.trim().toLowerCase() !== existing.slug) {
      let normalizedSlug: string;
      try {
        normalizedSlug = SlugValueObject.create(input.slug).toString();
      } catch (err) {
        return {
          success: false,
          error: (err as Error).message,
          code: 'INVALID_SLUG',
        };
      }

      // BR-003 & BR-013: Verifica conflito com outros posts
      const isTaken = await this.postRepo.isSlugTaken(
        normalizedSlug,
        existing.locale,
        input.id
      );
      if (isTaken) {
        return {
          success: false,
          error: `O endereço "${normalizedSlug}" já está em uso ou foi arquivado como histórico.`,
          code: 'SLUG_CONFLICT',
        };
      }

      // BR-004: Se o artigo já está publicado, arquiva o slug anterior para redirecionamento 301
      if (existing.status === PostStatus.PUBLISHED) {
        previousSlugToArchive = existing.slug;
      }

      targetSlug = normalizedSlug;
    }

    const postEntity = new Post({
      id: UUID.create(existing.id),
      locale: existing.locale,
      translationGroupId: UUID.create(existing.translationGroupId),
      title: existing.title,
      excerpt: existing.excerpt,
      content: MarkdownContent.create(existing.content),
      coverImageUrl:
        input.coverImageUrl !== undefined ? input.coverImageUrl : existing.coverImageUrl,
      categoryId: input.categoryId !== undefined ? input.categoryId : UUID.create(existing.categoryId),
      status: existing.status,
      publishedAt: existing.publishedAt,
      currentVersion: existing.currentVersion,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const targetContent =
      input.content !== undefined
        ? MarkdownContent.create(input.content)
        : MarkdownContent.create(existing.content);

    const textChanged = postEntity.updateContent(
      targetContent,
      input.title,
      input.excerpt
    );

    await this.postRepo.updatePost(
      postEntity,
      targetSlug,
      tagIds,
      previousSlugToArchive
    );

    // BR-005 & AC-12.1: Se houve alteração textual em post publicado, salva nova versão
    if (textChanged && existing.status === PostStatus.PUBLISHED) {
      const newVersion = PostVersion.createFromPost(postEntity);
      await this.postRepo.saveVersion(newVersion);
    }

    return { success: true, post: postEntity, slug: targetSlug };
  }
}

export interface PublishPostInput {
  id: UUIDv7;
}

export type PublishPostOutput =
  | { success: true; post: Post }
  | {
      success: false;
      error: string;
      code: 'NOT_FOUND' | 'PUBLISH_REQUIREMENTS_NOT_MET';
    };

export class PublishPostUseCase implements UseCase<PublishPostInput, PublishPostOutput> {
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(input: PublishPostInput): Promise<PublishPostOutput> {
    const existing = await this.postRepo.findAdminById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Artigo não encontrado.',
        code: 'NOT_FOUND',
      };
    }

    // BR-001: Publicação exige title, slug, excerpt, content e category_id
    if (
      !existing.title?.trim() ||
      !existing.slug?.trim() ||
      !existing.excerpt?.trim() ||
      !existing.content?.trim() ||
      !existing.categoryId
    ) {
      return {
        success: false,
        error: 'Publicação exige título, slug, resumo, conteúdo e categoria preenchidos.',
        code: 'PUBLISH_REQUIREMENTS_NOT_MET',
      };
    }

    const post = new Post({
      id: UUID.create(existing.id),
      locale: existing.locale,
      translationGroupId: UUID.create(existing.translationGroupId),
      title: existing.title,
      excerpt: existing.excerpt,
      content: MarkdownContent.create(existing.content),
      coverImageUrl: existing.coverImageUrl,
      categoryId: UUID.create(existing.categoryId),
      status: existing.status,
      publishedAt: existing.publishedAt, // BR-002: imutabilidade se já possuía
      currentVersion: existing.currentVersion,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    post.publish(); // Sets publishedAt if null, status = PUBLISHED

    await this.postRepo.updatePost(
      post,
      existing.slug,
      existing.tagIds.map(UUID.create),
      null
    );

    // BR-005: Salva versão v1 se era rascunho
    if (existing.status === PostStatus.DRAFT) {
      const initialVersion = PostVersion.createFromPost(post);
      await this.postRepo.saveVersion(initialVersion);
    }

    return { success: true, post };
  }
}

export interface UnpublishPostInput {
  id: UUIDv7;
}

export type UnpublishPostOutput =
  | { success: true; post: Post }
  | { success: false; error: string; code: 'NOT_FOUND' };

export class UnpublishPostUseCase implements UseCase<UnpublishPostInput, UnpublishPostOutput> {
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(input: UnpublishPostInput): Promise<UnpublishPostOutput> {
    const existing = await this.postRepo.findAdminById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Artigo não encontrado.',
        code: 'NOT_FOUND',
      };
    }

    const post = new Post({
      id: UUID.create(existing.id),
      locale: existing.locale,
      translationGroupId: UUID.create(existing.translationGroupId),
      title: existing.title,
      excerpt: existing.excerpt,
      content: MarkdownContent.create(existing.content),
      coverImageUrl: existing.coverImageUrl,
      categoryId: UUID.create(existing.categoryId),
      status: existing.status,
      publishedAt: existing.publishedAt,
      currentVersion: existing.currentVersion,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    post.unpublish();

    await this.postRepo.updatePost(
      post,
      existing.slug,
      existing.tagIds.map(UUID.create),
      null
    );

    return { success: true, post };
  }
}

export interface MovePostToTrashInput {
  id: UUIDv7;
}

export type MovePostToTrashOutput =
  | { success: true }
  | { success: false; error: string; code: 'NOT_FOUND' };

export class MovePostToTrashUseCase
  implements UseCase<MovePostToTrashInput, MovePostToTrashOutput>
{
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(input: MovePostToTrashInput): Promise<MovePostToTrashOutput> {
    const existing = await this.postRepo.findAdminById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Artigo não encontrado.',
        code: 'NOT_FOUND',
      };
    }

    const post = new Post({
      id: UUID.create(existing.id),
      locale: existing.locale,
      translationGroupId: UUID.create(existing.translationGroupId),
      title: existing.title,
      excerpt: existing.excerpt,
      content: MarkdownContent.create(existing.content),
      coverImageUrl: existing.coverImageUrl,
      categoryId: UUID.create(existing.categoryId),
      status: existing.status,
      publishedAt: existing.publishedAt,
      currentVersion: existing.currentVersion,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    post.moveToTrash();

    await this.postRepo.updatePost(
      post,
      existing.slug,
      existing.tagIds.map(UUID.create),
      null
    );

    return { success: true };
  }
}

export interface RestorePostFromTrashInput {
  id: UUIDv7;
  toStatus?: PostStatus;
}

export type RestorePostFromTrashOutput =
  | { success: true }
  | { success: false; error: string; code: 'NOT_FOUND' | 'SLUG_TAKEN_ON_RESTORE' };

export class RestorePostFromTrashUseCase
  implements UseCase<RestorePostFromTrashInput, RestorePostFromTrashOutput>
{
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(
    input: RestorePostFromTrashInput
  ): Promise<RestorePostFromTrashOutput> {
    const existing = await this.postRepo.findAdminById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Artigo não encontrado.',
        code: 'NOT_FOUND',
      };
    }

    // BR-008: Restauração da lixeira é impedida se o slug tiver sido assumido por outro post
    const isTaken = await this.postRepo.isSlugTaken(
      existing.slug,
      existing.locale,
      input.id
    );
    if (isTaken) {
      return {
        success: false,
        error: `Não é possível restaurar o artigo porque o endereço "${existing.slug}" foi assumido por outro post.`,
        code: 'SLUG_TAKEN_ON_RESTORE',
      };
    }

    await this.postRepo.restorePost(input.id);
    return { success: true };
  }
}

export interface DeletePostPermanentlyInput {
  id: UUIDv7;
}

export type DeletePostPermanentlyOutput =
  | { success: true }
  | {
      success: false;
      error: string;
      code: 'NOT_FOUND' | 'INVALID_STATE_TRANSITION';
    };

export class DeletePostPermanentlyUseCase
  implements UseCase<DeletePostPermanentlyInput, DeletePostPermanentlyOutput>
{
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(
    input: DeletePostPermanentlyInput
  ): Promise<DeletePostPermanentlyOutput> {
    const existing = await this.postRepo.findAdminById(input.id);
    if (!existing) {
      return {
        success: false,
        error: 'Artigo não encontrado.',
        code: 'NOT_FOUND',
      };
    }

    // BR-007: Exclusão física definitiva só pode ser invocada para posts com status 'lixeira'
    if (existing.status !== PostStatus.TRASH) {
      return {
        success: false,
        error: 'Exclusão física definitiva só é permitida para artigos que já estejam na lixeira.',
        code: 'INVALID_STATE_TRANSITION',
      };
    }

    await this.postRepo.deletePostPermanently(input.id);
    return { success: true };
  }
}

export class ListAdminPostsUseCase
  implements UseCase<ListAdminPostsParams, ListAdminPostsResult>
{
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(params: ListAdminPostsParams): Promise<ListAdminPostsResult> {
    return this.postRepo.listAdmin(params);
  }
}

export class GetAdminPostUseCase
  implements UseCase<{ id: UUIDv7 }, AdminPostDetail | null>
{
  constructor(private readonly postRepo: PostRepository) {}

  public async execute(input: { id: UUIDv7 }): Promise<AdminPostDetail | null> {
    return this.postRepo.findAdminById(input.id);
  }
}
