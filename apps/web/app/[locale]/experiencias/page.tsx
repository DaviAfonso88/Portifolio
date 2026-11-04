import { getDictionary } from '../../../lib/dictionary';

interface ExperienciasPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ExperienciasPage({ params }: ExperienciasPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-10">
        <h1 className="font-serif text-4xl md:text-[56px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
          {dict.experiences.headline}
        </h1>

        <div className="flex flex-col border-b border-rule">
          {dict.experiences.positions.map((pos) => (
            <article
              key={`${pos.company}-${pos.period}`}
              className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-10 py-9 border-t border-rule"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[17px] font-semibold leading-[1.35] text-ink">{pos.role}</span>
                <span className="text-[15px] text-ink-2">{pos.company}</span>
                <span className="font-mono text-xs text-accent pt-1">{pos.period}</span>
                <span className="text-[13px] leading-[1.5] text-ink-3">{pos.regime}</span>
              </div>

              <div className="flex flex-col gap-4 max-w-[72ch]">
                <p className="text-base md:text-[17px] leading-[1.6] text-ink">{pos.summary}</p>
                {pos.highlights.length > 0 && (
                  <ul className="flex flex-col gap-2.5 pl-5 list-disc text-[15px] leading-[1.65] text-ink-2 marker:text-ink-3">
                    {pos.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                )}
                <p className="font-mono text-xs leading-[1.7] text-ink-3">{pos.technologies.join(' · ')}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="flex flex-col gap-6 pt-4">
          <h2 className="font-serif text-3xl md:text-[40px] tracking-tight text-ink font-normal">
            {dict.experiences.educationTitle}
          </h2>
          <div className="flex flex-col border-b border-rule">
            {dict.experiences.education.map((item) => (
              <div
                key={item.title}
                className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-10 py-5 border-t border-rule items-baseline"
              >
                <span className="font-mono text-xs text-ink-3">{item.period}</span>
                <span className="text-[17px] leading-[1.5] text-ink">
                  {item.title}
                  {item.institution && <span className="text-ink-2"> · {item.institution}</span>}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
