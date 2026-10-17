import { ShieldCheck } from 'lucide-react';
import { getDictionary } from '../../../lib/dictionary';

interface PrivacidadePageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacidadePage({ params }: PrivacidadePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
        {/* Aside: Navigation Index */}
        <aside className="md:col-span-3">
          <div className="sticky top-24 flex flex-col gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
              {locale === 'pt-BR' ? 'Nesta página' : 'On this page'}
            </span>
            {dict.privacy.sections.map((sec, idx) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`text-sm leading-[1.5] transition-colors pl-3 border-l-2 ${
                  idx === 0
                    ? 'border-accent text-accent font-medium'
                    : 'border-rule text-ink-2 hover:text-ink'
                }`}
              >
                {sec.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:col-span-9 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {dict.privacy.badge}
            </div>
            <h1 className="font-serif text-4xl md:text-[48px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
              {dict.privacy.headline}
            </h1>
            <div className="flex items-center gap-3 font-mono text-xs text-ink-3">
              <span>{dict.privacy.lastUpdated}</span>
              <span>·</span>
              <span>{dict.privacy.laws}</span>
            </div>
          </div>

          {/* Highlight Summary Box */}
          <div className="flex gap-3.5 rounded-[6px] border border-rule bg-surface-sunken p-5 md:p-6 text-ink">
            <ShieldCheck className="size-5 shrink-0 text-accent stroke-[1.5] mt-0.5" />
            <p className="text-base leading-[1.7] text-ink-2">
              <strong className="font-semibold text-ink">
                {dict.privacy.summaryTitle}:{' '}
              </strong>
              {dict.privacy.summaryText}
            </p>
          </div>

          {/* Retention Table */}
          <div className="rounded-[6px] border border-rule overflow-hidden">
            <div className="grid grid-cols-[1fr_180px] gap-4 bg-surface-sunken p-3.5 md:p-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
              <span>{dict.privacy.table.headers[0]}</span>
              <span>{dict.privacy.table.headers[1]}</span>
            </div>
            {dict.privacy.table.rows.map(([item, period]) => (
              <div
                key={item}
                className="grid grid-cols-[1fr_180px] gap-4 border-t border-rule/60 p-4 text-[15px] bg-surface"
              >
                <span className="text-ink">{item}</span>
                <span className="font-mono text-sm text-accent">{period}</span>
              </div>
            ))}
          </div>

          {/* Detailed Policy Sections */}
          <div className="flex flex-col gap-7 max-w-[68ch] text-base leading-[1.78] text-ink-2">
            {dict.privacy.sections.map((sec) => (
              <section key={sec.id} id={sec.id} className="flex flex-col gap-3 pt-2">
                <h2 className="text-2xl font-semibold text-ink">
                  {sec.title}
                </h2>
                {sec.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
