import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ListPublishedPostsUseCase, GetPostBySlugUseCase } from '@davidev/application';

export const listPostsQuerySchema = z.object({
  locale: z.enum(['pt-BR', 'en']).default('pt-BR'),
  category: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const getPostParamsSchema = z.object({
  locale: z.enum(['pt-BR', 'en']),
  slug: z.string().min(1),
});

export interface PostsRoutesOptions {
  listPublishedPostsUseCase?: ListPublishedPostsUseCase;
  getPostBySlugUseCase?: GetPostBySlugUseCase;
}

export function registerPostsRoutes(
  app: FastifyInstance,
  options?: PostsRoutesOptions
): void {
  const listPostsUseCase = options?.listPublishedPostsUseCase;
  const getPostUseCase = options?.getPostBySlugUseCase;

  app.get(
    '/api/v1/posts',
    {
      schema: {
        description: 'Lista posts publicados com paginação e filtros opcionais por categoria e tag (BR-006: rascunhos nunca são retornados)',
        tags: ['Public'],
        querystring: {
          type: 'object',
          properties: {
            locale: { type: 'string', enum: ['pt-BR', 'en'], default: 'pt-BR' },
            category: { type: 'string', description: 'Slug da categoria' },
            tag: { type: 'string', description: 'Slug da tag' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              posts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    locale: { type: 'string', enum: ['pt-BR', 'en'] },
                    slug: { type: 'string' },
                    title: { type: 'string' },
                    excerpt: { type: 'string' },
                    coverImageUrl: { type: 'string', nullable: true },
                    category: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        slug: { type: 'string' },
                      },
                    },
                    tags: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          slug: { type: 'string' },
                        },
                      },
                    },
                    publishedAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    readingTimeMinutes: { type: 'number' },
                    availableLocales: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!listPostsUseCase) {
        return reply.status(200).send({
          posts: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
      }

      const query = listPostsQuerySchema.parse(request.query);
      const result = await listPostsUseCase.execute({
        locale: query.locale,
        categorySlug: query.category,
        tagSlug: query.tag,
        page: query.page,
        limit: query.limit,
      });

      if (!result.success) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: result.error,
        });
      }

      return reply.status(200).send(result.data);
    }
  );

  app.get(
    '/api/v1/posts/:locale/:slug',
    {
      schema: {
        description: 'Obtém detalhes de um post publicado por slug. Redireciona com HTTP 301 caso o slug seja histórico (BR-004 e BR-006).',
        tags: ['Public'],
        params: {
          type: 'object',
          required: ['locale', 'slug'],
          properties: {
            locale: { type: 'string', enum: ['pt-BR', 'en'] },
            slug: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              locale: { type: 'string', enum: ['pt-BR', 'en'] },
              slug: { type: 'string' },
              title: { type: 'string' },
              excerpt: { type: 'string' },
              content: { type: 'string' },
              coverImageUrl: { type: 'string', nullable: true },
              currentVersion: { type: 'number' },
              translationGroupId: { type: 'string' },
              category: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                },
              },
              tags: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    slug: { type: 'string' },
                  },
                },
              },
              translations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    locale: { type: 'string' },
                    slug: { type: 'string' },
                    title: { type: 'string' },
                  },
                },
              },
              publishedAt: { type: 'string' },
              updatedAt: { type: 'string' },
              readingTimeMinutes: { type: 'number' },
              availableLocales: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
          301: {
            type: 'object',
            description: 'Redirecionamento permanente para slug canônico (BR-004)',
            properties: {
              redirected: { type: 'boolean' },
              canonicalSlug: { type: 'string' },
              canonicalLocale: { type: 'string' },
              canonicalUrl: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!getPostUseCase) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Post não encontrado',
        });
      }

      const params = getPostParamsSchema.parse(request.params);
      const result = await getPostUseCase.execute({
        locale: params.locale,
        slug: params.slug,
      });

      if (!result.success) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Post não encontrado ou não publicado',
        });
      }

      const postResult = result.data;

      if (postResult.status === 'NOT_FOUND') {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Post não encontrado ou não publicado',
        });
      }

      if (postResult.status === 'HISTORICAL_SLUG') {
        const canonicalUrl = `/api/v1/posts/${postResult.canonicalLocale}/${postResult.canonicalSlug}`;
        reply.header('Location', canonicalUrl);
        return reply.status(301).send({
          redirected: true,
          canonicalSlug: postResult.canonicalSlug,
          canonicalLocale: postResult.canonicalLocale,
          canonicalUrl,
        });
      }

      return reply.status(200).send(postResult.post);
    }
  );
}
