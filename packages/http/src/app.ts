import Fastify, { type FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { registerContactRoutes, type ContactRoutesOptions } from './routes/contact';
import { registerPostsRoutes, type PostsRoutesOptions } from './routes/posts';
import { registerTaxonomiesRoutes, type TaxonomiesRoutesOptions } from './routes/taxonomies';
import { registerAuthRoutes, type AuthRoutesOptions } from './routes/auth';
import {
  registerAdminTaxonomiesRoutes,
  type AdminTaxonomiesRoutesOptions,
} from './routes/admin-taxonomies';
import {
  registerAdminPostsRoutes,
  type AdminPostsRoutesOptions,
} from './routes/admin-posts';
import {
  registerAdminMessagesRoutes,
  type AdminMessagesRoutesOptions,
} from './routes/admin-messages';
import {
  registerAdminPostVersionsRoutes,
  type AdminPostVersionsRoutesOptions,
} from './routes/admin-post-versions';

export type { FastifyInstance };

export interface BuildAppOptions
  extends ContactRoutesOptions,
    PostsRoutesOptions,
    TaxonomiesRoutesOptions,
    AuthRoutesOptions,
    AdminTaxonomiesRoutesOptions,
    AdminPostsRoutesOptions,
    AdminMessagesRoutesOptions,
    AdminPostVersionsRoutesOptions {}

export async function buildApp(options?: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV === 'test' ? false : true,
    trustProxy: true,
  });

  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body: string, done) => {
    if (!body || body.trim() === '') {
      done(null, {});
      return;
    }
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'davidev-cookie-secret-key-32-chars',
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'DaviDev API',
        description: 'API REST do Portfolio, Blog e CMS DaviDev',
        version: '1.0.0',
      },
      servers: [
        {
          url: '/api/v1',
          description: 'Ambiente Serverless Atual',
        },
      ],
      tags: [
        { name: 'System', description: 'Rotas de status e health check' },
        { name: 'Public', description: 'Rotas públicas de leitura do blog e contato' },
        { name: 'Admin', description: 'Rotas administrativas protegidas por token' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  // Swagger Documentation UI endpoint (T03.02)
  app.get('/api/docs', async (_req, reply) => {
    reply.type('text/html').send(`<!DOCTYPE html>
<html>
<head>
  <title>DaviDev API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
    });
  </script>
</body>
</html>`);
  });

  const getOpenApiSpec = () => {
    const spec = JSON.parse(JSON.stringify(app.swagger()));
    if (spec.paths) {
      if (spec.paths['/health'] && !spec.paths['/api/v1/health']) {
        spec.paths['/api/v1/health'] = spec.paths['/health'];
      }
    }
    return spec;
  };

  app.get('/api/v1/openapi.json', async (_req, reply) => {
    return reply.status(200).send(getOpenApiSpec());
  });

  app.get('/api/openapi.json', async (_req, reply) => {
    return reply.status(200).send(getOpenApiSpec());
  });


  // Health check endpoint required by T01.07
  app.get(
    '/api/v1/health',
    {
      schema: {
        description: 'Verificação de integridade da API serverless',
        tags: ['System'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              service: { type: 'string' },
              version: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.status(200).send({
        status: 'ok',
        service: 'davidev',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    }
  );

  // Register public contact endpoint
  registerContactRoutes(app, options);

  // Register public blog posts and taxonomies endpoints
  registerPostsRoutes(app, options);
  registerTaxonomiesRoutes(app, options);

  // Register auth endpoints (provides app.authenticateAdmin decorator)
  registerAuthRoutes(app, options);

  // Register Admin CMS endpoints
  registerAdminTaxonomiesRoutes(app, options);
  registerAdminPostsRoutes(app, options);
  registerAdminPostVersionsRoutes(app, options);
  registerAdminMessagesRoutes(app, options);

  return app;
}
