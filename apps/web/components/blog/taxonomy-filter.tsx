import React from 'react';
import Link from 'next/link';
import type { CategoryWithCount, TagWithCount } from '@davidev/application';
import { X } from 'lucide-react';

export interface TaxonomyFilterProps {
  locale: string;
  categories: CategoryWithCount[];
  tags: TagWithCount[];
  currentCategory?: string;
  currentTag?: string;
  totalFiltered: number;
}

export function TaxonomyFilter({
  locale,
  categories,
  tags,
  currentCategory,
  currentTag,
  totalFiltered,
}: TaxonomyFilterProps) {
  const isPt = locale === 'pt-BR';

  function buildUrl(cat?: string, tag?: string): string {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return `/${locale}/blog${qs ? `?${qs}` : ''}`;
  }

  const activeLabel = currentCategory
    ? categories.find((c) => (isPt ? c.slugPtBr : c.slugEn) === currentCategory)?.namePtBr || currentCategory
    : currentTag
    ? tags.find((t) => (isPt ? t.slugPtBr : t.slugEn) === currentTag)?.namePtBr || currentTag
    : null;

  return (
    <div className="flex flex-col gap-4 border-y border-[#E4DFD7] dark:border-[#2C2723] py-5">
      {/* Categories Row */}
      <div className="flex items-center gap-3 md:gap-4 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 min-w-[76px]">
          {isPt ? 'Categoria' : 'Category'}
        </span>
        <div className="flex gap-2 flex-wrap items-center">
          <Link
            href={buildUrl(undefined, currentTag)}
            className={`h-8 inline-flex items-center px-3.5 rounded-full text-[13px] font-medium transition-colors ${
              !currentCategory
                ? 'bg-[#1C1A17] text-[#FAF8F4] dark:bg-[#FAF8F4] dark:text-[#1C1A17]'
                : 'border border-rule text-ink-2 hover:border-ink'
            }`}
          >
            {isPt ? 'Todas' : 'All'}
          </Link>

          {categories.map((cat) => {
            const slug = isPt ? cat.slugPtBr : cat.slugEn;
            const name = isPt ? cat.namePtBr : cat.nameEn;
            const isSelected = currentCategory?.toLowerCase() === slug.toLowerCase();

            return (
              <Link
                key={cat.id}
                href={buildUrl(isSelected ? undefined : slug, currentTag)}
                className={`h-8 inline-flex items-center px-3.5 rounded-full text-[13px] transition-colors ${
                  isSelected
                    ? 'bg-[#1C1A17] text-[#FAF8F4] dark:bg-[#FAF8F4] dark:text-[#1C1A17] font-medium'
                    : 'border border-rule text-ink-2 hover:border-ink'
                }`}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex items-center gap-3 md:gap-4 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 min-w-[76px]">
          Tags
        </span>
        <div className="flex gap-2 flex-wrap items-center">
          {tags.map((tag) => {
            const slug = isPt ? tag.slugPtBr : tag.slugEn;
            const name = isPt ? tag.namePtBr : tag.nameEn;
            const isSelected = currentTag?.toLowerCase() === slug.toLowerCase();

            return (
              <Link
                key={tag.id}
                href={buildUrl(currentCategory, isSelected ? undefined : slug)}
                className={`h-7 inline-flex items-center gap-1.5 px-2.5 rounded text-[12px] font-mono transition-colors ${
                  isSelected
                    ? 'border border-[#EBD9D1] bg-[#F9F1ED] dark:bg-[#2A1D18] dark:border-[#523328] text-[#A6482C] dark:text-[#E28366]'
                    : 'border border-rule text-ink-2 hover:border-ink'
                }`}
              >
                <span>{name}</span>
                {isSelected && <X className="w-3 h-3 text-[#A6482C] dark:text-[#E28366]" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filter Status Bar */}
      {(currentCategory || currentTag) && (
        <div className="flex items-center justify-between gap-4 pt-1 text-[13px] text-ink-3">
          <div>
            {isPt ? 'Filtrando por ' : 'Filtering by '}
            <strong className="text-[#1C1A17] dark:text-[#FAF8F4] font-medium">
              {activeLabel}
            </strong>
            {` — ${totalFiltered} ${
              totalFiltered === 1
                ? isPt ? 'artigo' : 'article'
                : isPt ? 'artigos' : 'articles'
            }`}
          </div>
          <Link
            href={`/${locale}/blog`}
            className="font-mono text-[11px] text-[#A6482C] dark:text-[#E28366] hover:underline"
          >
            {isPt ? 'Limpar filtros' : 'Clear filters'}
          </Link>
        </div>
      )}
    </div>
  );
}
