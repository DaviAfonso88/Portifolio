import type { FastifyInstance } from 'fastify';
import { UUID, type UUIDv7 } from '@davidev/domain';
import type { ListContactMessagesUseCase, ContactMessageRepository } from '@davidev/application';

export interface AdminMessagesRoutesOptions {
  listContactMessagesUseCase?: ListContactMessagesUseCase;
  contactRepo?: ContactMessageRepository;
}

export function registerAdminMessagesRoutes(
  app: FastifyInstance,
  options?: AdminMessagesRoutesOptions
): void {
  // GET /api/v1/admin/messages
  app.get<{
    Querystring: {
      unnotifiedOnly?: string;
      page?: string;
      limit?: string;
    };
  }>(
    '/api/v1/admin/messages',
    {
      schema: {
        description: 'Lista mensagens de contato com paginação e filtro de pendência de e-mail (T04.09)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.listContactMessagesUseCase) {
        return reply.status(500).send({ error: 'ListContactMessagesUseCase não configurado.' });
      }

      const { unnotifiedOnly, page, limit } = request.query;
      const res = await options.listContactMessagesUseCase.execute({
        unnotifiedOnly: unnotifiedOnly === 'true',
        page: page ? Number.parseInt(page, 10) : 1,
        limit: limit ? Number.parseInt(limit, 10) : 20,
      });

      return reply.status(200).send(res);
    }
  );

  // GET /api/v1/admin/messages/:id
  app.get<{ Params: { id: string } }>(
    '/api/v1/admin/messages/:id',
    {
      schema: {
        description: 'Retorna os detalhes de uma mensagem de contato específica',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
      },
      preHandler: (app as any).authenticateAdmin,
    },
    async (request, reply) => {
      if (!options?.contactRepo) {
        return reply.status(500).send({ error: 'ContactMessageRepository não configurado.' });
      }

      const id = UUID.create(request.params.id);
      const msg = await options.contactRepo.findById(id);

      if (!msg) {
        return reply.status(404).send({ error: 'Mensagem não encontrada.' });
      }

      return reply.status(200).send({ message: msg });
    }
  );
}
