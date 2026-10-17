import { getDictionary } from '../../../lib/dictionary';

interface ExperienciasPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ExperienciasPage({ params }: ExperienciasPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-12">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-end">
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {dict.experiences.badge}
            </div>
            <h1 className="font-serif text-4xl md:text-[52px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
              {dict.experiences.headline}
            </h1>
          </div>
          <div className="md:col-span-5 md:border-l md:border-rule md:pl-7">
            <p className="text-[15px] leading-[1.7] text-ink-2">
              {dict.experiences.intro}
            </p>
          </div>
        </div>

        {/* Positions List */}
        <div className="flex flex-col">
          {dict.experiences.positions.map((pos, idx) => (
            <article
              key={`${pos.company}-${pos.period}`}
              className={`grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10 py-9 border-t border-rule ${
                idx === dict.experiences.positions.length - 1 ? 'border-b' : ''
              }`}
            >
              {/* Meta Left Column */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-accent font-medium">
                  {pos.period}
                </span>
                <span className="text-[15px] font-semibold leading-[1.4] text-ink">
                  {pos.company}
                </span>
                <span className="text-sm text-ink-3">{pos.role}</span>
                <span className="font-mono text-[11px] text-ink-3/70">
                  {pos.regime}
                </span>
              </div>

              {/* Description Right Column */}
              <div className="flex flex-col gap-4">
                <p className="text-base leading-[1.7] text-ink">
                  {pos.summary}
                </p>
                <ul className="flex flex-col gap-2.5 pl-4.5 list-disc text-[15px] leading-[1.65] text-ink-2 marker:text-ink-3">
                  {pos.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  {pos.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-[3px] border border-rule px-2.5 py-1 font-mono text-[11px] text-ink-2"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
