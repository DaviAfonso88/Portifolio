import React from 'react';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

export interface ArticleRendererProps {
  content: string;
  className?: string;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function extractArticleHeadings(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
      headings.push({
        id: slugifyHeading(text),
        text,
        level,
      });
    }
  }

  return headings;
}

// Custom sanitizer schema allowing standard styling, id attributes on headings, and safe elements
const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    h1: [...(defaultSchema.attributes?.h1 || []), 'id'],
    h2: [...(defaultSchema.attributes?.h2 || []), 'id'],
    h3: [...(defaultSchema.attributes?.h3 || []), 'id'],
    h4: [...(defaultSchema.attributes?.h4 || []), 'id'],
    code: [...(defaultSchema.attributes?.code || []), ['className', /^language-./]],
    pre: [...(defaultSchema.attributes?.pre || []), ['className']],
    th: [...(defaultSchema.attributes?.th || []), 'align', 'scope'],
    td: [...(defaultSchema.attributes?.td || []), 'align'],
  },
};

export function ArticleRenderer({ content, className = '' }: ArticleRendererProps) {
  return (
    <div
      className={`davidev-article-content prose dark:prose-invert max-w-none ${className}`}
      data-testid="article-renderer"
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, customSchema]]}
        urlTransform={(url) => {
          // Strict URL sanitization: block javascript:, data: (except images), vbscript:
          if (/^javascript:/i.test(url) || /^vbscript:/i.test(url)) {
            return '';
          }
          return defaultUrlTransform(url);
        }}
        components={{
          h2({ children, ...props }) {
            const text = String(children || '');
            const id = slugifyHeading(text);
            return (
              <h2
                id={id}
                className="scroll-mt-24 text-[26px] md:text-[28px] font-semibold leading-[1.3] tracking-tight mt-10 mb-4 text-[#1C1A17] dark:text-[#F3EFEA]"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            const text = String(children || '');
            const id = slugifyHeading(text);
            return (
              <h3
                id={id}
                className="scroll-mt-24 text-[20px] md:text-[22px] font-semibold leading-[1.35] tracking-tight mt-8 mb-3 text-[#1C1A17] dark:text-[#F3EFEA]"
                {...props}
              >
                {children}
              </h3>
            );
          },
          p({ children, ...props }) {
            return (
              <p
                className="text-[17px] md:text-[18px] leading-[1.78] text-[#2A2621] dark:text-[#D5CFC7] my-5"
                {...props}
              >
                {children}
              </p>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="my-7 pl-6 py-2 border-l-[3px] border-[#A6482C] text-[18px] md:text-[19px] leading-[1.7] text-[#38332E] dark:text-[#EDE9E3] bg-[#F7F4EE]/50 dark:bg-[#1E1B18]/50 rounded-r"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code
                  className="font-mono text-[14px] md:text-[15px] bg-[#F0ECE4] dark:bg-[#2A2621] border border-[#E9E4DB] dark:border-[#3A3530] px-1.5 py-0.5 rounded text-[#A6482C] dark:text-[#E28366]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className={`font-mono text-[13px] md:text-[14px] leading-[1.7] ${className || ''}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children, ...props }) {
            return (
              <div className="relative my-6 group">
                <pre
                  className="bg-[#1C1A17] text-[#EDE9E3] dark:bg-[#121110] border border-[#302B26] rounded-md p-5 md:p-6 overflow-x-auto font-mono text-[13px] md:text-[14px] leading-[1.7]"
                  {...props}
                >
                  {children}
                </pre>
              </div>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul className="my-5 pl-6 list-disc space-y-2 text-[17px] md:text-[18px] leading-[1.75] text-[#2A2621] dark:text-[#D5CFC7]" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="my-5 pl-6 list-decimal space-y-2 text-[17px] md:text-[18px] leading-[1.75] text-[#2A2621] dark:text-[#D5CFC7]" {...props}>
                {children}
              </ol>
            );
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-6 border border-[#E4DFD7] dark:border-[#2C2723] rounded-md">
                <table className="w-full text-left text-[15px] border-collapse" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }) {
            return (
              <thead className="bg-[#F0ECE4] dark:bg-[#201D1A] border-b border-[#E4DFD7] dark:border-[#2C2723] font-medium text-[#1C1A17] dark:text-[#FAF8F4]" {...props}>
                {children}
              </thead>
            );
          },
          th({ children, ...props }) {
            return (
              <th className="px-4 py-3 font-semibold text-[14px] uppercase tracking-wider text-[#55504A] dark:text-[#A29A90]" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="px-4 py-3 border-t border-[#EAE5DD] dark:border-[#282421] text-[#38332E] dark:text-[#D5CFC7]" {...props}>
                {children}
              </td>
            );
          },
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                className="text-[#A6482C] dark:text-[#D46C4E] underline underline-offset-2 hover:text-[#7E351F] dark:hover:text-[#F39174] transition-colors"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          hr() {
            return <hr className="my-10 border-t border-[#E4DFD7] dark:border-[#2C2723]" />;
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
