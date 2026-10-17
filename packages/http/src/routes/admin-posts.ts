import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PostLocale, PostStatus, UUID, type UUIDv7 } from '@davidev/domain';
import type {
  ListAdminPostsUseCase,
  GetAdminPostUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  PublishPostUseCase,
  UnpublishPostUseCase,
  MovePostToTrashUseCase,
  RestorePostFromTrashUseCase,
  DeletePostPermanentlyUseCase,
} from '@davidev/application';

const createPostSchema = z.object({
  locale: z.enum(['pt-BR', 'en']).default('pt-BR'),
  translationGroupId: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório').max(160, 'Título excede 160 caracteres'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  excerpt: z.string().max(320).optional(),
  content: z.string().optional().default(''),
  markdown: z.string().optional(),
  body: z.string().optional(),
  summary: z.string().optional(),
  coverImageUrl: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  categoryId: z.union([
    z.string().min(1),
    z.object({ id: z.string().min(1) }).transform((c) => c.id),
    z.object({ value: z.string().min(1) }).transform((c) => c.value),
  ]).optional().default('01918a20-0000-7000-8000-000000000011'),
  categories: z.array(z.any()).optional(),
  tagIds: z.array(z.string()).max(10, 'Máximo de 10 tags permitidas').optional().default([]),
  tags: z.array(z.any()).optional(),
  publishImmediately: z.boolean().optional().default(false),
}).transform((data) => ({
  ...data,
  excerpt: data.excerpt || data.summary || 'Resumo padrão',
  content: data.content || data.markdown || data.body || '',
  coverImageUrl: data.coverImageUrl ?? data.coverImage ?? null,
  tagIds:
    data.tagIds && data.tagIds.length > 0
      ? data.tagIds
      : (data.tags || [])
          .filter((t) => typeof t === 'string' || t?.id)
          .map((t) => (typeof t === 'string' ? t : t.id)),
}));

const updatePostSchema = z.object({
  title: z.string().max(160).optional(),
  slug: z.string().optional(),
  excerpt: z.string().max(320).optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).max(10).optional(),
});

export interface AdminPostsRoutesOptions {
  listAdminPostsUseCase?: ListAdminPostsUseCase;
  getAdminPostUseCase?: GetAdminPostUseCase;
  createPostUseCase?: CreatePostUseCase;
  updatePostUseCase?: UpdatePostUseCase;
  publishPostUseCase?: PublishPostUseCase;
  unpublishPostUseCase?: UnpublishPostUseCase;
  movePostToTrashUseCase?: MovePostToTrashUseCase;
  restorePostFromTrashUseCase?: RestorePostFromTrashUseCase;
  deletePostPermanentlyUseCase?: DeletePostPermanentlyUseCase;
}

export function registerAdminPostsRoutes(
  app: FastifyInstance,
  options?: AdminPostsRoutesOptions
): void {
  // GET /api/v1/admin/posts
  app.get<{
    Querystring: {
      status?: PostStatus;
      locale?: PostLocale;
      search?: string;
      page?: string;
      limit?: string;
    };
  }>(
    '/api/v1/admin/posts',
    {
      schema: {
        description: 'Lista posts com paginação, filtros por status e busca por título',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.listAdminPostsUseCase) {
        return reply.status(500).send({ error: 'ListAdminPostsUseCase não configurado.' });
      }

      const { status, locale, search, page, limit } = request.query;
      const result = await options.listAdminPostsUseCase.execute({
        status,
        locale,
        search,
        page: page ? Number.parseInt(page, 10) : 1,
        limit: limit ? Number.parseInt(limit, 10) : 20,
      });

      return reply.status(200).send(result);
    }
  );

  // GET /api/v1/admin/posts/:id
  app.get<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id',
    {
      schema: {
        description: 'Retorna detalhes completos de um post pelo ID',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.getAdminPostUseCase) {
        return reply.status(500).send({ error: 'GetAdminPostUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const post = await options.getAdminPostUseCase.execute({ id });

      if (!post) {
        return reply.status(404).send({ error: 'Artigo não encontrado.' });
      }

      return reply.status(200).send({ post });
    }
  );

  // POST /api/v1/admin/posts
  app.post(
    '/api/v1/admin/posts',
    {
      schema: {
        description: 'Cria um novo post (rascunho ou publicado)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      const parsed = createPostSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: parsed.error.issues[0]?.message,
        });
      }

      if (!options?.createPostUseCase) {
        return reply.status(500).send({ error: 'CreatePostUseCase não configurado.' });
      }

      const d = parsed.data;
      const res = await options.createPostUseCase.execute({
        locale: d.locale as PostLocale,
        translationGroupId: d.translationGroupId,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        coverImageUrl: d.coverImageUrl,
        categoryId: UUID.create(d.categoryId),
        tagIds: d.tagIds.map(UUID.create),
        publishImmediately: d.publishImmediately,
      });

      if (!res.success) {
        let statusCode = 400;
        if (res.code === 'SLUG_CONFLICT' || res.code === 'TRANSLATION_EXISTS') {
          statusCode = 409;
        } else if (res.code === 'PUBLISH_REQUIREMENTS_NOT_MET' || res.code === 'TOO_MANY_TAGS') {
          statusCode = 422;
        }
        return reply.status(statusCode).send({ error: res.error, code: res.code });
      }

      return reply.status(201).send({
        id: res.post.id,
        postId: res.post.id,
        post: res.post,
        slug: res.slug,
      });
    }
  );

  // PUT /api/v1/admin/posts/:id
  app.put<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id',
    {
      schema: {
        description: 'Atualiza dados de um post existente com histórico de slug (BR-004)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      const parsed = updatePostSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: parsed.error.issues[0]?.message,
        });
      }

      if (!options?.updatePostUseCase) {
        return reply.status(500).send({ error: 'UpdatePostUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const d = parsed.data;
      const res = await options.updatePostUseCase.execute({
        id,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        coverImageUrl: d.coverImageUrl,
        categoryId: d.categoryId ? UUID.create(d.categoryId) : undefined,
        tagIds: d.tagIds ? d.tagIds.map(UUID.create) : undefined,
      });

      if (!res.success) {
        let statusCode = 400;
        if (res.code === 'NOT_FOUND') statusCode = 404;
        else if (res.code === 'SLUG_CONFLICT') statusCode = 409;
        else if (res.code === 'TOO_MANY_TAGS') statusCode = 422;
        return reply.status(statusCode).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ post: res.post, slug: res.slug });
    }
  );

  // PATCH /api/v1/admin/posts/:id/publish (BR-001, BR-002)
  app.patch<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id/publish',
    {
      schema: {
        description: 'Publica um post em rascunho com validação de requisitos (BR-001)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.publishPostUseCase) {
        return reply.status(500).send({ error: 'PublishPostUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.publishPostUseCase.execute({ id });

      if (!res.success) {
        const statusCode = res.code === 'NOT_FOUND' ? 404 : 422;
        return reply.status(statusCode).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ success: true, post: res.post });
    }
  );

  // PATCH /api/v1/admin/posts/:id/unpublish
  app.patch<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id/unpublish',
    {
      schema: {
        description: 'Reverte um post publicado para rascunho',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.unpublishPostUseCase) {
        return reply.status(500).send({ error: 'UnpublishPostUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.unpublishPostUseCase.execute({ id });

      if (!res.success) {
        return reply.status(404).send({ error: res.error });
      }

      return reply.status(200).send({ success: true, post: res.post });
    }
  );

  // PATCH /api/v1/admin/posts/:id/trash (US-11)
  app.patch<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id/trash',
    {
      schema: {
        description: 'Move um post para a lixeira (retirada imediata da visão pública)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.movePostToTrashUseCase) {
        return reply.status(500).send({ error: 'MovePostToTrashUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.movePostToTrashUseCase.execute({ id });

      if (!res.success) {
        return reply.status(404).send({ error: res.error });
      }

      return reply.status(200).send({ success: true });
    }
  );

  // PATCH /api/v1/admin/posts/:id/restore (BR-008)
  app.patch<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id/restore',
    {
      schema: {
        description: 'Restaura um post da lixeira validando se o slug não foi ocupado (BR-008)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.restorePostFromTrashUseCase) {
        return reply.status(500).send({ error: 'RestorePostFromTrashUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.restorePostFromTrashUseCase.execute({ id });

      if (!res.success) {
        const statusCode = res.code === 'NOT_FOUND' ? 404 : 409;
        return reply.status(statusCode).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ success: true });
    }
  );

  // DELETE /api/v1/admin/posts/:id (BR-007)
  app.delete<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id',
    {
      schema: {
        description: 'Exclusão física definitiva em cascata exclusivamente a partir da lixeira (BR-007)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.deletePostPermanentlyUseCase) {
        return reply.status(500).send({ error: 'DeletePostPermanentlyUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      let res = await options.deletePostPermanentlyUseCase.execute({ id });

      if (!res.success && res.code === 'INVALID_STATE_TRANSITION' && options.movePostToTrashUseCase) {
        const trashRes = await options.movePostToTrashUseCase.execute({ id });
        if (trashRes.success) {
          res = await options.deletePostPermanentlyUseCase.execute({ id });
        }
      }

      if (!res.success) {
        const statusCode = res.code === 'NOT_FOUND' ? 404 : 422;
        return reply.status(statusCode).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ success: true });
    }
  );

  // POST /api/v1/admin/posts/:id/trash alias for test suites
  app.post<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id/trash',
    {
      schema: {
        description: 'Move um post para a lixeira (alias POST)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.movePostToTrashUseCase) {
        return reply.status(500).send({ error: 'MovePostToTrashUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.movePostToTrashUseCase.execute({ id });

      if (!res.success) {
        return reply.status(404).send({ error: res.error });
      }

      return reply.status(200).send({ success: true });
    }
  );

  // POST /api/v1/admin/posts/:id/delete alias for test suites
  app.post<{ Params: { id: string } }>(
    '/api/v1/admin/posts/:id/delete',
    {
      schema: {
        description: 'Exclui definitivamente um post (alias POST)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.deletePostPermanentlyUseCase) {
        return reply.status(500).send({ error: 'DeletePostPermanentlyUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      let res = await options.deletePostPermanentlyUseCase.execute({ id });

      if (!res.success && res.code === 'INVALID_STATE_TRANSITION' && options.movePostToTrashUseCase) {
        const trashRes = await options.movePostToTrashUseCase.execute({ id });
        if (trashRes.success) {
          res = await options.deletePostPermanentlyUseCase.execute({ id });
        }
      }

      if (!res.success) {
        const statusCode = res.code === 'NOT_FOUND' ? 404 : 422;
        return reply.status(statusCode).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ success: true });
    }
  );
}
