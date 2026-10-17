import { getDictionary } from '../../../lib/dictionary';

interface ConhecimentosPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ConhecimentosPage({ params }: ConhecimentosPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-12">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-end">
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {dict.knowledge.badge}
            </div>
            <h1 className="font-serif text-4xl md:text-[52px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
              {dict.knowledge.headline}
            </h1>
          </div>
          <div className="md:col-span-5 md:border-l md:border-rule md:pl-7">
            <p className="text-[15px] leading-[1.7] text-ink-2">
              {dict.knowledge.intro}
            </p>
          </div>
        </div>

        {/* 2-Column Knowledge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dict.knowledge.items.map((k) => (
            <article
              key={k.title}
              className="flex flex-col gap-3.5 rounded-[6px] border border-rule bg-surface p-7 md:p-[30px]"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-ink">
                  {k.title}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent border border-accent/30 bg-accent/10 px-2 py-1 rounded-[3px]">
                  {k.tag}
                </span>
              </div>
              <p className="text-[15px] leading-[1.7] text-ink-2">
                {k.description}
              </p>
              <div className="my-1 h-[1px] bg-surface-sunken" />
              <p className="text-sm leading-[1.65] text-ink-3">
                <strong className="font-semibold text-ink-2">
                  {k.costLabel}:{' '}
                </strong>
                {k.cost}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
