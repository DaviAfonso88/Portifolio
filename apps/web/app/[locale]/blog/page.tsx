import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isValidLocale, PostLocale } from '@davidev/domain';
import { getBlogUseCases } from '../../../lib/composition-root';
import { PostCard } from '../../../components/blog/post-card';
import { TaxonomyFilter } from '../../../components/blog/taxonomy-filter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation window

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isPt = locale === 'pt-BR';

  const title = isPt
    ? 'Blog Editorial — Notas de quem está construindo'
    : 'Editorial Blog — Notes from the builder';
  const description = isPt
    ? 'Escrevo sobre o que aparece no caminho: decisões de arquitetura, armadilhas de produção e o que deu errado antes de dar certo.'
    : 'Writing about what comes up along the way: architectural decisions, production pitfalls, and what failed before working.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://davidev.net.br/${locale}/blog`,
      languages: {
        'pt-BR': 'https://davidev.net.br/pt-BR/blog',
        en: 'https://davidev.net.br/en/blog',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function BlogPage(props: BlogPageProps) {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const categorySlug = searchParams.category?.trim();
  const tagSlug = searchParams.tag?.trim();

  const blog = getBlogUseCases();

  // In-process RSC execution for zero HTTP latency & LCP < 2.5s
  const [postsRes, taxonomiesRes] = await Promise.all([
    blog.listPublishedPosts.execute({
      locale: locale as PostLocale,
      categorySlug: categorySlug || undefined,
      tagSlug: tagSlug || undefined,
      page,
      limit: 10,
    }),
    blog.listTaxonomies.execute(),
  ]);

  const postsResult = postsRes.success
    ? postsRes.data
    : { posts: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  const taxonomiesResult = taxonomiesRes.success
    ? taxonomiesRes.data
    : { categories: [], tags: [] };

  const isPt = locale === 'pt-BR';

  function buildPageUrl(pageNum: number): string {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (tagSlug) params.set('tag', tagSlug);
    if (pageNum > 1) params.set('page', String(pageNum));
    const qs = params.toString();
    return `/${locale}/blog${qs ? `?${qs}` : ''}`;
  }

  return (
    <main className="px-6 md:px-20 py-12 md:py-20">
      <div className="max-w-[1180px] mx-auto flex flex-col gap-10">
        {/* Header Section matching design/Blog.dc.html */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-end">
          <div className="md:col-span-7 flex flex-col gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Blog
            </span>
            <h1 className="font-serif text-[42px] md:text-[52px] font-normal leading-[1.1] tracking-[-0.02em] text-[#1C1A17] dark:text-[#F3EFEA]">
              {isPt
                ? 'Notas de quem está construindo.'
                : 'Notes from the builder.'}
            </h1>
          </div>
          <div className="md:col-span-5 md:border-l border-[#E4DFD7] dark:border-[#2C2723] md:pl-7">
            <p className="text-[15px] leading-[1.7] text-[#55504A] dark:text-[#A29A90]">
              {isPt
                ? 'Escrevo sobre o que aparece no caminho: decisões de arquitetura, armadilhas de produção e o que deu errado antes de dar certo.'
                : 'Writing about what comes up along the way: architectural decisions, production pitfalls, and what failed before working.'}
            </p>
          </div>
        </div>

        {/* Taxonomy Filters */}
        <TaxonomyFilter
          locale={locale}
          categories={taxonomiesResult.categories}
          tags={taxonomiesResult.tags}
          currentCategory={categorySlug}
          currentTag={tagSlug}
          totalFiltered={postsResult.total}
        />

        {/* Articles List */}
        <section className="flex flex-col gap-6" aria-label={isPt ? 'Artigos do blog' : 'Blog articles'}>
          {postsResult.posts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#DDD6CB] dark:border-[#3D3730] rounded-md bg-[#FBFAF7] dark:bg-[#181614]">
              <p className="text-[16px] text-[#55504A] dark:text-[#A29A90] mb-4">
                {isPt
                  ? 'Nenhum artigo encontrado para os filtros selecionados.'
                  : 'No articles found matching the selected filters.'}
              </p>
              <Link
                href={`/${locale}/blog`}
                className="font-mono text-[13px] text-[#A6482C] dark:text-[#E28366] hover:underline"
              >
                {isPt ? 'Ver todos os artigos →' : 'View all articles →'}
              </Link>
            </div>
          ) : (
            postsResult.posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))
          )}
        </section>

        {/* Pagination Controls */}
        {postsResult.totalPages > 1 && (
          <nav
            aria-label={isPt ? 'Navegação de páginas' : 'Pagination'}
            className="flex items-center justify-between gap-6 border-t border-[#E4DFD7] dark:border-[#2C2723] pt-6"
          >
            <span className="font-mono text-[12px] text-ink-3">
              {isPt
                ? `Página ${postsResult.page} de ${postsResult.totalPages} · ${postsResult.total} artigos`
                : `Page ${postsResult.page} of ${postsResult.totalPages} · ${postsResult.total} articles`}
            </span>

            <div className="flex items-center gap-1.5">
              {postsResult.page > 1 ? (
                <Link
                  href={buildPageUrl(postsResult.page - 1)}
                  className="w-9 h-9 inline-flex items-center justify-center border border-[#E4DFD7] dark:border-[#2C2723] rounded text-[#55504A] dark:text-[#A29A90] hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
                  aria-label={isPt ? 'Página anterior' : 'Previous page'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <span
                  className="w-9 h-9 inline-flex items-center justify-center border border-[#EFEBE4] dark:border-[#24201D] rounded text-[#C4BCB1] dark:text-[#4A423B] cursor-not-allowed"
                  aria-disabled="true"
                >
                  <ChevronLeft className="w-4 h-4" />
                </span>
              )}

              {Array.from({ length: postsResult.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === postsResult.page;

                return (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={`w-9 h-9 inline-flex items-center justify-center rounded text-[14px] transition-colors ${
                      isCurrent
                        ? 'bg-[#1C1A17] text-[#FAF8F4] dark:bg-[#FAF8F4] dark:text-[#1C1A17] font-medium'
                        : 'border border-[#E4DFD7] dark:border-[#2C2723] text-[#55504A] dark:text-[#A29A90] hover:border-[#1C1A17] dark:hover:border-[#FAF8F4]'
                    }`}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {postsResult.page < postsResult.totalPages ? (
                <Link
                  href={buildPageUrl(postsResult.page + 1)}
                  className="w-9 h-9 inline-flex items-center justify-center border border-[#E4DFD7] dark:border-[#2C2723] rounded text-[#55504A] dark:text-[#A29A90] hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
                  aria-label={isPt ? 'Próxima página' : 'Next page'}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span
                  className="w-9 h-9 inline-flex items-center justify-center border border-[#EFEBE4] dark:border-[#24201D] rounded text-[#C4BCB1] dark:text-[#4A423B] cursor-not-allowed"
                  aria-disabled="true"
                >
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
          </nav>
        )}
      </div>
    </main>
  );
}
