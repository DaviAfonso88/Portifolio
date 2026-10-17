'use client';

import React, { useEffect, useState } from 'react';
import type { HeadingItem } from './article-renderer';

export interface TableOfContentsProps {
  headings: HeadingItem[];
  locale: string;
}

export function TableOfContents({ headings, locale }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const isPt = locale === 'pt-BR';

  return (
    <nav className="flex flex-col gap-2.5" aria-label={isPt ? 'Nesta página' : 'On this page'}>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
        {isPt ? 'Nesta página' : 'On this page'}
      </span>
      <div className="flex flex-col gap-1.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`text-[13px] md:text-[14px] leading-snug pl-3 border-l-2 transition-colors ${
                isActive
                  ? 'border-accent text-accent font-medium'
                  : 'border-rule text-ink-2 hover:text-ink'
              }`}
            >
              {heading.text}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
