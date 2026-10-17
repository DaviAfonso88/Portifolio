import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { SubmitContactMessageUseCase } from '@davidev/application';
import { InMemoryRateLimiter, type RateLimiter } from '../services/rate-limiter';

export const contactBodySchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(120, 'Nome excede 120 caracteres'),
  email: z.string().trim().email('E-mail inválido').max(254, 'E-mail excede 254 caracteres'),
  subject: z.string().trim().max(160, 'Assunto excede 160 caracteres').optional().nullable(),
  message: z.string().trim().min(10, 'Mensagem deve ter no mínimo 10 caracteres').max(5000, 'Mensagem excede 5000 caracteres'),
  locale: z.enum(['pt-BR', 'en']).default('pt-BR'),
  captchaToken: z.string().min(1, 'Token de verificação é obrigatório'),
});

export type ContactBody = z.infer<typeof contactBodySchema>;

export interface ContactRoutesOptions {
  submitContactUseCase?: SubmitContactMessageUseCase;
  rateLimiter?: RateLimiter;
}

export function registerContactRoutes(
  app: FastifyInstance,
  options?: ContactRoutesOptions
): void {
  const rateLimiter = options?.rateLimiter || new InMemoryRateLimiter();

  app.post(
    '/api/v1/contact',
    {
      schema: {
        description: 'Submissão de formulário de contato com rate limit (3/hora por IP) e Turnstile',
        tags: ['Public'],
        body: {
          type: 'object',
          required: ['name', 'email', 'message', 'captchaToken'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 120 },
            email: { type: 'string', format: 'email', maxLength: 254 },
            subject: { type: 'string', maxLength: 160, nullable: true },
            message: { type: 'string', minLength: 10, maxLength: 5000 },
            locale: { type: 'string', enum: ['pt-BR', 'en'], default: 'pt-BR' },
            captchaToken: { type: 'string', minLength: 1 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              id: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          429: {
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
      // 1. Zod Validation
      const parseResult = contactBodySchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: parseResult.error.errors.map((e) => e.message).join('; '),
        });
      }

      const body = parseResult.data;
      const clientIp = request.ip || '127.0.0.1';

      // 2. Rate Limiting Check (3 per hour per IP)
      const allowed = await rateLimiter.isAllowed(clientIp, 3, 60 * 60 * 1000);
      if (!allowed) {
        return reply.status(429).send({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Limite de 3 mensagens por hora atingido para este IP.',
        });
      }

      // 3. Delegate to SubmitContactMessageUseCase if injected
      if (options?.submitContactUseCase) {
        const result = await options.submitContactUseCase.execute({
          name: body.name,
          email: body.email,
          subject: body.subject,
          message: body.message,
          locale: body.locale,
          captchaToken: body.captchaToken,
          clientIp,
        });

        if (!result.success) {
          return reply.status(400).send({
            error: result.error,
            message: 'Falha ao processar mensagem de contato.',
          });
        }

        return reply.status(201).send({
          success: true,
          id: result.data.id,
        });
      }

      // Fallback response if use case not yet wired in standalone mode
      return reply.status(201).send({
        success: true,
        id: 'mock-submitted-id',
      });
    }
  );
}
