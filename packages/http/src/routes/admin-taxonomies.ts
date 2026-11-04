import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UUID, type UUIDv7 } from '@davidev/domain';
import type {
  TaxonomyRepository,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  CreateTagUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
} from '@davidev/application';

// Os limites acompanham as colunas de db/schema.ts: sem eles, o erro do banco chegaria cru à tela.
const taxonomyBodySchema = (maxLength: number) =>
  z.object({
    namePtBr: z
      .string()
      .trim()
      .min(1, 'Nome em português é obrigatório')
      .max(maxLength, `Nome em português excede ${maxLength} caracteres`),
    nameEn: z
      .string()
      .trim()
      .min(1, 'Nome em inglês é obrigatório')
      .max(maxLength, `Nome em inglês excede ${maxLength} caracteres`),
    // Opcionais: o caso de uso gera o slug na criação e mantém o atual na edição.
    slugPtBr: z
      .string()
      .trim()
      .min(1, 'Slug em português não pode ser vazio')
      .max(maxLength, `Slug em português excede ${maxLength} caracteres`)
      .optional(),
    slugEn: z
      .string()
      .trim()
      .min(1, 'Slug em inglês não pode ser vazio')
      .max(maxLength, `Slug em inglês excede ${maxLength} caracteres`)
      .optional(),
  });

const categoryBodySchema = taxonomyBodySchema(60);
const tagBodySchema = taxonomyBodySchema(40);

export interface AdminTaxonomiesRoutesOptions {
  taxonomyRepo?: TaxonomyRepository;
  createCategoryUseCase?: CreateCategoryUseCase;
  updateCategoryUseCase?: UpdateCategoryUseCase;
  deleteCategoryUseCase?: DeleteCategoryUseCase;
  createTagUseCase?: CreateTagUseCase;
  updateTagUseCase?: UpdateTagUseCase;
  deleteTagUseCase?: DeleteTagUseCase;
}

export function registerAdminTaxonomiesRoutes(
  app: FastifyInstance,
  options?: AdminTaxonomiesRoutesOptions
): void {
  // GET /api/v1/admin/categories
  app.get(
    '/api/v1/admin/categories',
    {
      schema: {
        description: 'Lista todas as categorias com contagem de artigos associados',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (_request, reply) => {
      if (!options?.taxonomyRepo) {
        return reply.status(500).send({ error: 'Taxonomy repository não configurado.' });
      }
      const categories = await options.taxonomyRepo.listCategories();
      return reply.status(200).send({ categories });
    }
  );

  // POST /api/v1/admin/categories
  app.post(
    '/api/v1/admin/categories',
    {
      schema: {
        description: 'Cria uma nova categoria bilíngue',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      const parsed = categoryBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: parsed.error.issues[0]?.message,
        });
      }

      if (!options?.createCategoryUseCase) {
        return reply.status(500).send({ error: 'CreateCategoryUseCase não configurado.' });
      }

      const res = await options.createCategoryUseCase.execute(parsed.data);
      if (!res.success) {
        return reply.status(400).send({ error: res.error, code: res.code });
      }

      return reply.status(201).send({ category: res.category });
    }
  );

  // PUT /api/v1/admin/categories/:id
  app.put<{ Params: { id: string } }>(
    '/api/v1/admin/categories/:id',
    {
      schema: {
        description: 'Atualiza os dados de uma categoria existente',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      const parsed = categoryBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: parsed.error.issues[0]?.message,
        });
      }

      if (!options?.updateCategoryUseCase) {
        return reply.status(500).send({ error: 'UpdateCategoryUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.updateCategoryUseCase.execute({
        id,
        ...parsed.data,
      });

      if (!res.success) {
        const status = res.code === 'NOT_FOUND' ? 404 : 400;
        return reply.status(status).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ category: res.category });
    }
  );

  // DELETE /api/v1/admin/categories/:id (BR-009)
  app.delete<{ Params: { id: string } }>(
    '/api/v1/admin/categories/:id',
    {
      schema: {
        description: 'Exclui uma categoria caso não possua artigos vinculados (BR-009)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.deleteCategoryUseCase) {
        return reply.status(500).send({ error: 'DeleteCategoryUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.deleteCategoryUseCase.execute({ id });

      if (!res.success) {
        const status = res.code === 'RESOURCE_IN_USE' ? 409 : 404;
        return reply.status(status).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ success: true });
    }
  );

  // GET /api/v1/admin/tags
  app.get(
    '/api/v1/admin/tags',
    {
      schema: {
        description: 'Lista todas as tags com contagem de artigos associados',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (_request, reply) => {
      if (!options?.taxonomyRepo) {
        return reply.status(500).send({ error: 'Taxonomy repository não configurado.' });
      }
      const tagsList = await options.taxonomyRepo.listTags();
      return reply.status(200).send({ tags: tagsList });
    }
  );

  // POST /api/v1/admin/tags
  app.post(
    '/api/v1/admin/tags',
    {
      schema: {
        description: 'Cria uma nova tag bilíngue',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      const parsed = tagBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: parsed.error.issues[0]?.message,
        });
      }

      if (!options?.createTagUseCase) {
        return reply.status(500).send({ error: 'CreateTagUseCase não configurado.' });
      }

      const res = await options.createTagUseCase.execute(parsed.data);
      if (!res.success) {
        return reply.status(400).send({ error: res.error, code: res.code });
      }

      return reply.status(201).send({ tag: res.tag });
    }
  );

  // PUT /api/v1/admin/tags/:id
  app.put<{ Params: { id: string } }>(
    '/api/v1/admin/tags/:id',
    {
      schema: {
        description: 'Atualiza os dados de uma tag existente',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      const parsed = tagBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Dados inválidos',
          message: parsed.error.issues[0]?.message,
        });
      }

      if (!options?.updateTagUseCase) {
        return reply.status(500).send({ error: 'UpdateTagUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.updateTagUseCase.execute({
        id,
        ...parsed.data,
      });

      if (!res.success) {
        const status = res.code === 'NOT_FOUND' ? 404 : 400;
        return reply.status(status).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ tag: res.tag });
    }
  );

  // DELETE /api/v1/admin/tags/:id (BR-009)
  app.delete<{ Params: { id: string } }>(
    '/api/v1/admin/tags/:id',
    {
      schema: {
        description: 'Exclui uma tag caso não possua artigos vinculados (BR-009)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.deleteTagUseCase) {
        return reply.status(500).send({ error: 'DeleteTagUseCase não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const res = await options.deleteTagUseCase.execute({ id });

      if (!res.success) {
        const status = res.code === 'RESOURCE_IN_USE' ? 409 : 404;
        return reply.status(status).send({ error: res.error, code: res.code });
      }

      return reply.status(200).send({ success: true });
    }
  );
}
