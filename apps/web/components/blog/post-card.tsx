import React from 'react';
import Link from 'next/link';
import type { PublishedPostListItem } from '@davidev/application';
import { Globe } from 'lucide-react';

export interface PostCardProps {
  post: PublishedPostListItem;
  locale: string;
}

export function PostCard({ post, locale }: PostCardProps) {
  const isPt = locale === 'pt-BR';
  const isCurrentLocale = post.locale === locale;

  // Format date
  const dateFormatted = new Date(post.publishedAt).toLocaleDateString(
    isPt ? 'pt-BR' : 'en-US',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  const hasUpdated =
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() >
    24 * 60 * 60 * 1000;

  // Single-language notice scenario: post is in English but currently on pt-BR (or vice versa)
  if (!isCurrentLocale) {
    const targetLocale = post.locale;
    const targetUrl = `/${targetLocale}/blog/${post.slug}`;
    const noticeText =
      targetLocale === 'en'
        ? 'Este artigo está disponível apenas em inglês.'
        : 'This article is only available in Portuguese.';
    const ctaText =
      targetLocale === 'en' ? 'Ler em inglês →' : 'Read in Portuguese →';

    return (
      <article className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-8 bg-[#FBFAF7] dark:bg-[#181614] border border-dashed border-[#DDD6CB] dark:border-[#3D3730] rounded-md p-6">
        <div className="w-full aspect-[16/10] bg-[#F0ECE4] dark:bg-[#201D1A] border border-[#E9E4DB] dark:border-[#2C2723] rounded flex items-center justify-center text-[#B3AAA0] font-mono text-[11px]">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <span>[CAPA]</span>
          )}
        </div>

        <div className="flex flex-col gap-3 justify-center">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#A6482C] dark:text-[#E28366]">
              {post.category.name}
            </span>
            <span className="text-[#D9D2C8] dark:text-[#3D3730]">·</span>
            <span className="font-mono text-[12px] text-ink-3">
              {dateFormatted}
            </span>
          </div>

          <h2 className="text-[22px] md:text-[24px] font-semibold leading-[1.3] text-ink-2">
            {post.title}
          </h2>

          <div className="flex items-center gap-2.5 bg-[#F4F0E9] dark:bg-[#221F1C] border border-[#E4DFD7] dark:border-[#332E29] rounded px-3.5 py-2.5 max-w-lg mt-1">
            <Globe className="w-4 h-4 text-ink-3 shrink-0" />
            <span className="text-[14px] text-ink-2">
              {noticeText}{' '}
              <Link
                href={targetUrl}
                className="text-[#A6482C] dark:text-[#E28366] font-medium hover:underline"
              >
                {ctaText}
              </Link>
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-8 bg-card border border-[#E4DFD7] dark:border-[#2C2723] rounded-md p-6 hover:border-[#C4BCB1] dark:hover:border-[#4A423B] transition-colors">
      <Link
        href={`/${locale}/blog/${post.slug}`}
        className="w-full aspect-[16/10] bg-[#F0ECE4] dark:bg-[#201D1A] border border-[#E9E4DB] dark:border-[#2C2723] rounded flex items-center justify-center text-ink-3 font-mono text-[11px] overflow-hidden group"
      >
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span>[CAPA]</span>
        )}
      </Link>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#A6482C] dark:text-[#E28366]">
            {post.category.name}
          </span>
          <span className="text-[#D9D2C8] dark:text-[#3D3730]">·</span>
          <span className="font-mono text-[12px] text-ink-3">
            {dateFormatted}
          </span>
          <span className="text-[#D9D2C8] dark:text-[#3D3730]">·</span>
          <span className="font-mono text-[12px] text-ink-3">
            {post.readingTimeMinutes} {isPt ? 'min de leitura' : 'min read'}
          </span>
          {hasUpdated && (
            <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-3 border border-[#E4DFD7] dark:border-[#2C2723] px-2 py-0.5 rounded">
              {isPt ? 'Atualizado' : 'Updated'}
            </span>
          )}
        </div>

        <h2 className="text-[22px] md:text-[25px] font-semibold leading-[1.3]">
          <Link
            href={`/${locale}/blog/${post.slug}`}
            className="text-[#1C1A17] dark:text-[#F3EFEA] hover:text-[#A6482C] dark:hover:text-[#E28366] transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-[15px] leading-[1.7] text-ink-2 max-w-3xl">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-1">
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/${locale}/blog?tag=${tag.slug}`}
                className="font-mono text-[11px] text-ink-3 border border-[#E4DFD7] dark:border-[#2C2723] px-2 py-0.5 rounded hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
