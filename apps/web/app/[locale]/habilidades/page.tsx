import { getDictionary } from '../../../lib/dictionary';

interface HabilidadesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HabilidadesPage({ params }: HabilidadesPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-14">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-end">
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {dict.skills.badge}
            </div>
            <h1 className="font-serif text-4xl md:text-[52px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
              {dict.skills.headline}
            </h1>
          </div>
          <div className="md:col-span-5 md:border-l md:border-rule md:pl-7">
            <p className="text-[15px] leading-[1.7] text-ink-2">
              {dict.skills.intro}
            </p>
          </div>
        </div>

        {/* Skill Categories */}
        <div className="flex flex-col gap-12">
          {dict.skills.categories.map((cat) => (
            <section key={cat.number} className="flex flex-col">
              <div className="flex items-baseline gap-4 pb-4">
                <span className="font-mono text-[11px] tracking-[0.14em] text-accent font-semibold">
                  {cat.number}
                </span>
                <h2 className="text-[21px] font-semibold text-ink">
                  {cat.title}
                </h2>
              </div>

              <div className="flex flex-col">
                {cat.items.map((item, index) => (
                  <div
                    key={item.name}
                    className={`grid grid-cols-1 md:grid-cols-[210px_1fr] gap-2 md:gap-7 py-5 border-t border-rule items-baseline ${
                      index === cat.items.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <span className="font-mono text-sm text-ink font-medium">
                      {item.name}
                    </span>
                    <span className="text-[15px] leading-[1.65] text-ink-2">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
