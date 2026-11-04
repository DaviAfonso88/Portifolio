import type { NextConfig } from 'next';

// O build não consulta o banco. Sem esta checagem, um deploy sem a variável ficaria verde e com o
// blog quebrado; recusado, ele mantém no ar a versão anterior.
if (process.env.VERCEL_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL é obrigatória em produção: defina a variável na Vercel antes do deploy.');
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@davidev/domain',
    '@davidev/application',
    '@davidev/infrastructure',
    '@davidev/http',
  ],
  serverExternalPackages: [
    '@neondatabase/serverless',
    'fastify',
    '@fastify/cookie',
    'bcryptjs',
    'jsonwebtoken',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
