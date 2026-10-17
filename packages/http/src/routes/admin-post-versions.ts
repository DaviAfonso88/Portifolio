import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UUID } from '@davidev/domain';
import {
  ListPostVersionsUseCase,
  type PostRepository,
} from '@davidev/application';

const versionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export interface AdminPostVersionsRoutesOptions {
  listPostVersionsUseCase?: ListPostVersionsUseCase;
  postRepository?: PostRepository;
}

export function registerAdminPostVersionsRoutes(
  app: FastifyInstance,
  options?: AdminPostVersionsRoutesOptions
): void {
  const listVersionsUseCase =
    options?.listPostVersionsUseCase ??
    (options?.postRepository ? new ListPostVersionsUseCase(options.postRepository) : undefined);

  // GET /api/v1/admin/posts/:id/versions
  app.get<{
    Params: { id: string };
    Querystring: { page?: number; pageSize?: number };
  }>(
    '/api/v1/admin/posts/:id/versions',
    {
      preHandler: (app as any).authenticateAdmin,
      schema: {
        description: 'Listar histórico de versões do post',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            pageSize: { type: 'integer', default: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['data', 'meta'],
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['versionNumber', 'title', 'excerpt', 'createdAt'],
                  properties: {
                    versionNumber: { type: 'integer' },
                    title: { type: 'string' },
                    excerpt: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
              meta: {
                type: 'object',
                required: ['page', 'pageSize', 'total', 'totalPages'],
                properties: {
                  page: { type: 'integer' },
                  pageSize: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!listVersionsUseCase) {
        return reply.status(500).send({
          code: 'SERVER_MISCONFIGURED',
          message: 'ListPostVersionsUseCase não configurado.',
        });
      }

      const { id } = request.params;
      const parsedQuery = versionsQuerySchema.safeParse(request.query);
      const query = parsedQuery.success
        ? parsedQuery.data
        : { page: 1, pageSize: 10 };

      try {
        const postId = UUID.create(id);
        const result = await listVersionsUseCase.execute({
          postId,
          page: query.page,
          pageSize: query.pageSize,
        });

        if (!result.success) {
          return reply.status(404).send({
            code: 'NOT_FOUND',
            message: result.error,
          });
        }

        return reply.status(200).send({
          data: result.versions.map((v) => ({
            versionNumber: v.versionNumber,
            title: v.title,
            excerpt: v.excerpt,
            createdAt: v.createdAt.toISOString(),
          })),
          meta: result.meta,
        });
      } catch (err) {
        return reply.status(400).send({
          code: 'INVALID_ID',
          message: 'ID do post inválido.',
        });
      }
    }
  );
}
