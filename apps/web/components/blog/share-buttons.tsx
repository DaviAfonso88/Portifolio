'use client';

import React, { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';

export interface ShareButtonsProps {
  title: string;
  slug: string;
  locale: string;
}

export function ShareButtons({ title, slug, locale }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const isPt = locale === 'pt-BR';
  const url = typeof window !== 'undefined' ? window.location.href : `https://davidev.net.br/${locale}/blog/${slug}`;

  function handleCopy() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleTwitterShare() {
    const text = encodeURIComponent(`${title} por @davi_dev\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  function handleLinkedInShare() {
    const shareUrl = encodeURIComponent(url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-ink-3">
        {isPt ? 'Compartilhar' : 'Share'}
      </span>
      <button
        onClick={handleLinkedInShare}
        className="w-8 h-8 inline-flex items-center justify-center border border-[#E4DFD7] dark:border-[#2C2723] rounded text-[#55504A] dark:text-[#A29A90] hover:text-[#1C1A17] dark:hover:text-[#F3EFEA] hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
        aria-label="Compartilhar no LinkedIn"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.81a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
        </svg>
      </button>
      <button
        onClick={handleTwitterShare}
        className="w-8 h-8 inline-flex items-center justify-center border border-[#E4DFD7] dark:border-[#2C2723] rounded text-[#55504A] dark:text-[#A29A90] hover:text-[#1C1A17] dark:hover:text-[#F3EFEA] hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
        aria-label="Compartilhar no X (Twitter)"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      <button
        onClick={handleCopy}
        className="w-8 h-8 inline-flex items-center justify-center border border-[#E4DFD7] dark:border-[#2C2723] rounded text-[#55504A] dark:text-[#A29A90] hover:text-[#1C1A17] dark:hover:text-[#F3EFEA] hover:border-[#1C1A17] dark:hover:border-[#FAF8F4] transition-colors"
        aria-label={copied ? 'Link copiado!' : 'Copiar link'}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
        ) : (
          <Link2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
