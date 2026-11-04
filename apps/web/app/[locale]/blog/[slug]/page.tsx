import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { isValidLocale, PostLocale } from '@davidev/domain';
import { getBlogUseCases } from '../../../../lib/composition-root';
import { ArticleRenderer, extractArticleHeadings } from '../../../../components/blog/article-renderer';
import { ReadingProgressBar } from '../../../../components/blog/reading-progress-bar';
import { TableOfContents } from '../../../../components/blog/table-of-contents';
import { ShareButtons } from '../../../../components/blog/share-buttons';
import { Globe } from 'lucide-react';

// O layout raiz lê headers() para o nonce do CSP, então esta página nunca é estática. Sem esta
// declaração, um build sem artigos publicados registra a rota como estática e todo slug dá 500.
export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const blog = getBlogUseCases();
  const res = await blog.getPostBySlug.execute({
    locale: locale as PostLocale,
    slug,
  });

  if (!res.success || res.data.status !== 'FOUND') {
    return {
      title: 'Artigo não encontrado | DaviDev',
    };
  }

  const post = res.data.post;
  const baseUrl = 'https://davidev.net.br';
  const canonicalUrl = `${baseUrl}/${locale}/blog/${post.slug}`;

  const languages: Record<string, string> = {
    [locale]: canonicalUrl,
  };

  for (const translation of post.translations) {
    languages[translation.locale] = `${baseUrl}/${translation.locale}/blog/${translation.slug}`;
  }

  return {
    title: `${post.title} | DaviDev`,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: ['Davi'],
      tags: post.tags.map((t) => t.name),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { locale, slug } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const blog = getBlogUseCases();
  const res = await blog.getPostBySlug.execute({
    locale: locale as PostLocale,
    slug,
  });

  if (!res.success) {
    notFound();
  }

  const result = res.data;

  // BR-004: HTTP 301 Permanent Redirect for historical slugs
  if (result.status === 'HISTORICAL_SLUG') {
    permanentRedirect(`/${result.canonicalLocale}/blog/${result.canonicalSlug}`);
  }

  // BR-006: Invisibility of drafts & nonexistent posts returns 404
  if (result.status === 'NOT_FOUND') {
    notFound();
  }

  const post = result.post;
  const isPt = locale === 'pt-BR';

  const publishedDateFormatted = new Date(post.publishedAt).toLocaleDateString(
    isPt ? 'pt-BR' : 'en-US',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  const updatedDateFormatted = new Date(post.updatedAt).toLocaleDateString(
    isPt ? 'pt-BR' : 'en-US',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  const isDivergent =
    Boolean(post.updatedAt && post.publishedAt) &&
    new Date(post.updatedAt).getTime() > new Date(post.publishedAt).getTime() &&
    new Date(post.updatedAt).toDateString() !== new Date(post.publishedAt).toDateString();

  const headings = extractArticleHeadings(post.content);

  // Find translation in the other supported language
  const translation = post.translations.find((t) => t.locale !== locale);

  return (
    <>
      <ReadingProgressBar />

      <main className="px-6 md:px-20 py-12 md:py-16">
        <div className="max-w-[1180px] mx-auto flex flex-col gap-8 md:gap-10">
          {/* Breadcrumb matching design/Artigo.dc.html */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono text-[12px] text-ink-3"
          >
            <Link
              href={`/${locale}/blog`}
              className="text-ink-3 hover:text-ink"
            >
              Blog
            </Link>
            <span>/</span>
            <Link
              href={`/${locale}/blog?category=${post.category.slug}`}
              className="text-ink-3 hover:text-ink"
            >
              {post.category.name}
            </Link>
          </nav>

          {/* 12-Column Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Sidebar (3 columns) */}
            <aside className="lg:col-span-3 flex flex-col gap-7 order-2 lg:order-1 lg:sticky lg:top-8">
              <div className="flex flex-col gap-3 font-mono text-[12px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] tracking-[0.12em] uppercase text-ink-3">
                    {isPt ? 'Publicado' : 'Published'}
                  </span>
                  <span className="text-[#38332E] dark:text-[#D5CFC7]">
                    {publishedDateFormatted}
                  </span>
                </div>

                {/* Exibição de Atualizado apenas quando divergente (US-12, T05.03) */}
                {isDivergent && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] tracking-[0.12em] uppercase text-ink-3">
                      {isPt ? 'Atualizado' : 'Updated'}
                    </span>
                    <span className="text-[#38332E] dark:text-[#D5CFC7]">
                      {updatedDateFormatted}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] tracking-[0.12em] uppercase text-ink-3">
                    {isPt ? 'Leitura' : 'Reading'}
                  </span>
                  <span className="text-[#38332E] dark:text-[#D5CFC7]">
                    {post.readingTimeMinutes} {isPt ? 'minutos' : 'minutes'}
                  </span>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[10px] tracking-[0.12em] uppercase text-ink-3">
                      Tags
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag.slug}
                          href={`/${locale}/blog?tag=${tag.slug}`}
                          className="text-ink-2 border border-[#E4DFD7] dark:border-[#2C2723] px-2 py-0.5 rounded text-[11px] hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-[#E4DFD7] dark:bg-[#2C2723]" />

              {/* Table of Contents */}
              <TableOfContents headings={headings} locale={locale} />

              {translation && (
                <>
                  <div className="h-[1px] bg-[#E4DFD7] dark:bg-[#2C2723]" />
                  <Link
                    href={`/${translation.locale}/blog/${translation.slug}`}
                    className="flex items-center gap-2 text-[13px] text-ink-2 hover:text-[#A6482C] dark:hover:text-[#E28366] transition-colors"
                  >
                    <Globe className="w-4 h-4 text-ink-3" />
                    {translation.locale === 'en' ? 'Read in English' : 'Ler em português'}
                  </Link>
                </>
              )}
            </aside>

            {/* Main Article Content (9 columns) */}
            <article className="lg:col-span-9 flex flex-col gap-7 order-1 lg:order-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A6482C] dark:text-[#E28366]">
                  {post.category.name}
                </span>
                <span className="text-[#DDD6CB] dark:text-[#38332E]">·</span>
                <span className="font-mono text-[12px] text-ink-3">
                  {isPt ? 'Publicado em ' : 'Published on '}
                  {publishedDateFormatted}
                  {isDivergent && (
                    <>
                      {' · '}
                      <span className="text-[#38332E] dark:text-[#D5CFC7] font-medium">
                        {isPt ? 'Atualizado em ' : 'Updated on '}
                        {updatedDateFormatted}
                      </span>
                    </>
                  )}
                </span>
              </div>

              <h1 className="font-serif font-normal text-[38px] md:text-[52px] leading-[1.1] tracking-[-0.02em] text-[#1C1A17] dark:text-[#F3EFEA] max-w-3xl">
                {post.title}
              </h1>

              <p className="text-[19px] md:text-[20px] leading-[1.65] text-[#55504A] dark:text-[#BDB5AC] max-w-3xl">
                {post.excerpt}
              </p>

              {post.coverImageUrl && (
                <div className="w-full aspect-[21/9] bg-[#F0ECE4] dark:bg-[#201D1A] border border-[#E4DFD7] dark:border-[#2C2723] rounded-md overflow-hidden my-2">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Rendered Markdown Body */}
              <ArticleRenderer content={post.content} className="max-w-[68ch]" />

              {/* Share & Bottom Metadata */}
              <div className="flex items-center justify-between gap-6 border-t border-[#E4DFD7] dark:border-[#2C2723] pt-6 mt-6 flex-wrap">
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`/${locale}/blog?tag=${tag.slug}`}
                      className="font-mono text-[12px] text-[#55504A] dark:text-[#A29A90] border border-[#E4DFD7] dark:border-[#2C2723] px-2.5 py-1 rounded hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>

                <ShareButtons
                  title={post.title}
                  slug={post.slug}
                  locale={locale}
                />
              </div>

              {/* Back to Blog Button */}
              <div className="pt-4">
                <Link
                  href={`/${locale}/blog`}
                  className="inline-flex items-center gap-2 font-mono text-[13px] text-[#A6482C] dark:text-[#E28366] hover:underline"
                >
                  ← {isPt ? 'Voltar para todos os artigos' : 'Back to all articles'}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
