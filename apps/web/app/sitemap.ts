import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, PostLocale } from '@davidev/domain';
import { getBlogUseCases } from '../lib/composition-root';

// A lista de artigos vem do banco. Gerado no build, o sitemap ficaria preso ao momento do deploy
// e ainda poderia reaproveitar o resultado de um build antigo, guardado no cache de fetch do Next.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://davidev.net.br';
  const lastModified = new Date();

  const publicRoutes = [
    '',
    '/sobre',
    '/habilidades',
    '/conhecimentos',
    '/experiencias',
    '/projetos',
    '/como-foi-construido',
    '/contato',
    '/privacidade',
    '/blog',
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static institutional pages in both locales with hreflang alternates
  for (const route of publicRoutes) {
    const isHome = route === '';
    const priority = isHome ? 1.0 : route === '/blog' || route === '/projetos' ? 0.9 : 0.7;

    for (const locale of SUPPORTED_LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified,
        changeFrequency: route === '/blog' ? 'daily' : 'monthly',
        priority,
        alternates: {
          languages: {
            'pt-BR': `${baseUrl}/pt-BR${route}`,
            en: `${baseUrl}/en${route}`,
          },
        },
      });
    }
  }

  // Blog published posts for each locale
  try {
    const blog = getBlogUseCases();

    for (const locale of SUPPORTED_LOCALES) {
      const postsRes = await blog.listPublishedPosts.execute({
        locale: locale as PostLocale,
        limit: 100,
      });

      if (postsRes.success) {
        for (const post of postsRes.data.posts) {
          const canonicalUrl = `${baseUrl}/${locale}/blog/${post.slug}`;
          const languages: Record<string, string> = {
            [locale]: canonicalUrl,
          };

          // If translations exist
          const detailRes = await blog.getPostBySlug.execute({
            locale: locale as PostLocale,
            slug: post.slug,
          });

          if (detailRes.success && detailRes.data.status === 'FOUND') {
            for (const tr of detailRes.data.post.translations) {
              languages[tr.locale] = `${baseUrl}/${tr.locale}/blog/${tr.slug}`;
            }
          }

          entries.push({
            url: canonicalUrl,
            lastModified: new Date(post.updatedAt || post.publishedAt),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
              languages,
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn('[sitemap] Failed to load published posts for sitemap:', err);
  }

  return entries;
}
