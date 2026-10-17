import type { FastifyInstance } from 'fastify';
import type { ListTaxonomiesUseCase } from '@davidev/application';

export interface TaxonomiesRoutesOptions {
  listTaxonomiesUseCase?: ListTaxonomiesUseCase;
}

export function registerTaxonomiesRoutes(
  app: FastifyInstance,
  options?: TaxonomiesRoutesOptions
): void {
  const listTaxonomiesUseCase = options?.listTaxonomiesUseCase;

  app.get(
    '/api/v1/categories',
    {
      schema: {
        description: 'Lista categorias com contagem de posts publicados',
        tags: ['Public'],
        response: {
          200: {
            type: 'object',
            properties: {
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    namePtBr: { type: 'string' },
                    nameEn: { type: 'string' },
                    slugPtBr: { type: 'string' },
                    slugEn: { type: 'string' },
                    postCount: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      if (!listTaxonomiesUseCase) {
        return reply.status(200).send({ categories: [] });
      }

      const result = await listTaxonomiesUseCase.execute();
      return reply.status(200).send({
        categories: result.success ? result.data.categories : [],
      });
    }
  );

  app.get(
    '/api/v1/tags',
    {
      schema: {
        description: 'Lista tags com contagem de posts publicados',
        tags: ['Public'],
        response: {
          200: {
            type: 'object',
            properties: {
              tags: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    namePtBr: { type: 'string' },
                    nameEn: { type: 'string' },
                    slugPtBr: { type: 'string' },
                    slugEn: { type: 'string' },
                    postCount: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      if (!listTaxonomiesUseCase) {
        return reply.status(200).send({ tags: [] });
      }

      const result = await listTaxonomiesUseCase.execute();
      return reply.status(200).send({
        tags: result.success ? result.data.tags : [],
      });
    }
  );
}
