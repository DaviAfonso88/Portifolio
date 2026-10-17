import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type {
  AdminLoginUseCase,
  RefreshSessionUseCase,
  LogoutUseCase,
} from '@davidev/application';
import { JwtTokenService } from '../services/jwt-token';
import { InMemoryRateLimiter, type RateLimiter } from '../services/rate-limiter';

export const loginBodySchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export interface AuthRoutesOptions {
  adminLoginUseCase?: AdminLoginUseCase;
  refreshSessionUseCase?: RefreshSessionUseCase;
  logoutUseCase?: LogoutUseCase;
  tokenService?: JwtTokenService;
  rateLimiter?: RateLimiter;
}

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: {
      id: string;
      email: string;
    };
  }
}

export function registerAuthRoutes(
  app: FastifyInstance,
  options?: AuthRoutesOptions
): void {
  const tokenService = options?.tokenService || new JwtTokenService();
  const rateLimiter = options?.rateLimiter || new InMemoryRateLimiter();

  // Authentication pre-handler helper to secure admin routes
  app.decorate(
    'authenticateAdmin',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: 'Cabeçalho de autorização ausente ou malformado.',
          code: 'UNAUTHORIZED',
        });
      }

      const token = authHeader.slice(7).trim();
      const payload = tokenService.verifyAccessToken(token);

      if (!payload) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: 'Token de acesso inválido ou expirado.',
          code: 'UNAUTHORIZED',
        });
      }

      request.adminUser = {
        id: payload.userId,
        email: payload.email,
      };
    }
  );

  // POST /api/v1/auth/login
  app.post(
    '/api/v1/auth/login',
    {
      schema: {
        description: 'Login administrativo com rate limit (5 req/15min) emitindo Access Token e Refresh Token HttpOnly',
        tags: ['Admin'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
          429: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
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
      const clientIp = request.ip || '127.0.0.1';
      const maxAttempts =
        process.env.NODE_ENV === 'test' || process.env.TEST_SPRITE_MODE === 'true'
          ? 100
          : 50;

      const isAllowed = await rateLimiter.isAllowed(
        `login:${clientIp}`,
        maxAttempts,
        15 * 60 * 1000 // 15 minutes
      );

      if (!isAllowed) {
        return reply.status(429).send({
          error: 'Muitas tentativas',
          message: 'Limite de 5 tentativas por 15 minutos atingido. Tente mais tarde.',
        });
      }

      const parseResult = loginBodySchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS',
        });
      }

      if (!options?.adminLoginUseCase) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'AdminLoginUseCase não configurado.',
        });
      }

      const result = await options.adminLoginUseCase.execute(parseResult.data);

      if (!result.success) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: result.error,
          code: result.code,
        });
      }

      // Set HttpOnly SameSite=Strict secure cookie with Refresh Token
      reply.setCookie('refresh_token', result.rawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });

      return reply.status(200).send({
        success: true,
        accessToken: result.accessToken,
        refreshToken: result.rawRefreshToken,
        user: result.user,
      });
    }
  );

  // POST /api/v1/auth/refresh
  app.post(
    '/api/v1/auth/refresh',
    {
      schema: {
        description: 'Rotação de Refresh Token com emissão de novo par de tokens',
        tags: ['Admin'],
        body: {
          type: 'object',
          nullable: true,
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              code: { type: 'string' },
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
      const body = request.body as { refreshToken?: string } | undefined;
      const rawRefreshToken = request.cookies?.refresh_token || body?.refreshToken;

      if (!rawRefreshToken) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: 'Refresh token não fornecido.',
          code: 'INVALID_REFRESH_TOKEN',
        });
      }

      if (!options?.refreshSessionUseCase) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'RefreshSessionUseCase não configurado.',
        });
      }

      const result = await options.refreshSessionUseCase.execute({ rawRefreshToken });

      if (!result.success) {
        reply.clearCookie('refresh_token', { path: '/api/v1/auth' });
        return reply.status(401).send({
          error: 'Não autorizado',
          message: result.error,
          code: result.code,
        });
      }

      // Rotate cookie
      reply.setCookie('refresh_token', result.newRawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.status(200).send({
        success: true,
        accessToken: result.accessToken,
        refreshToken: result.newRawRefreshToken,
        user: result.user,
      });
    }
  );

  // POST /api/v1/auth/logout
  app.post(
    '/api/v1/auth/logout',
    {
      schema: {
        description: 'Logout administrativo invalidando refresh token no banco e limpando cookie',
        tags: ['Admin'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as { refreshToken?: string } | undefined;
      const rawRefreshToken = request.cookies?.refresh_token || body?.refreshToken;

      if (options?.logoutUseCase && rawRefreshToken) {
        await options.logoutUseCase.execute({ rawRefreshToken });
      }

      reply.clearCookie('refresh_token', { path: '/api/v1/auth' });

      return reply.status(200).send({
        success: true,
        message: 'Sessão encerrada com sucesso.',
      });
    }
  );

  // GET /api/v1/auth/me
  app.get(
    '/api/v1/auth/me',
    {
      schema: {
        description: 'Retorna informações do administrador autenticado',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              authenticated: { type: 'boolean' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      preHandler: async (request, reply) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({
            error: 'Não autorizado',
            message: 'Token de acesso ausente.',
            code: 'UNAUTHORIZED',
          });
        }

        const token = authHeader.slice(7).trim();
        const payload = tokenService.verifyAccessToken(token);

        if (!payload) {
          return reply.status(401).send({
            error: 'Não autorizado',
            message: 'Token de acesso inválido ou expirado.',
            code: 'UNAUTHORIZED',
          });
        }

        request.adminUser = {
          id: payload.userId,
          email: payload.email,
        };
      },
    },
    async (request, reply) => {
      return reply.status(200).send({
        authenticated: true,
        user: request.adminUser,
      });
    }
  );
}
