import Link from 'next/link';
import { ArrowRight, Code } from 'lucide-react';
import { getDictionary } from '../../../lib/dictionary';

interface ProjetosPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProjetosPage({ params }: ProjetosPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-12">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-end">
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {dict.projects.badge}
            </div>
            <h1 className="font-serif text-4xl md:text-[52px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
              {dict.projects.headline}
            </h1>
          </div>
          <div className="md:col-span-5 md:border-l md:border-rule md:pl-7">
            <p className="text-[15px] leading-[1.7] text-ink-2">
              {dict.projects.intro}
            </p>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-6">
          {dict.projects.items.map((project) => (
            <Link
              key={project.slug}
              href={`/${locale}/projetos/${project.slug}`}
              className="group grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-9 rounded-[6px] border border-rule bg-surface p-6 md:p-8 transition-all hover:border-ink-2 hover:shadow-sm"
            >
              {/* Media & Stack Column */}
              <div className="flex flex-col gap-4">
                <div className="aspect-[16/10] w-full rounded-[4px] border border-rule/60 bg-surface-sunken flex flex-col items-center justify-center gap-2 text-ink-3/70">
                  <Code className="size-6 stroke-[1.5]" />
                  <span className="font-mono text-[11px] tracking-[0.1em] uppercase">
                    {project.title}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-[3px] border border-rule px-2 py-1 font-mono text-[11px] text-ink-2"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Information Column */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-[3px] border border-success/30 bg-success/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-success">
                    {project.status}
                  </span>
                  <span className="font-mono text-[11px] text-ink-3">
                    {project.period}
                  </span>
                </div>

                <h2 className="text-2xl md:text-[26px] font-semibold leading-[1.3] text-ink group-hover:text-accent transition-colors">
                  {project.title}
                </h2>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-[92px_1fr] gap-1 md:gap-4 items-baseline">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
                      {locale === 'pt-BR' ? 'Problema' : 'Problem'}
                    </span>
                    <span className="text-[15px] leading-[1.65] text-ink">
                      {project.problem}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[92px_1fr] gap-1 md:gap-4 items-baseline">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
                      {locale === 'pt-BR' ? 'Resultado' : 'Result'}
                    </span>
                    <span className="text-[15px] leading-[1.65] text-ink">
                      {project.result}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[92px_1fr] gap-1 md:gap-4 items-baseline">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
                      {locale === 'pt-BR' ? 'Meu papel' : 'My role'}
                    </span>
                    <span className="text-[15px] leading-[1.65] text-ink">
                      {project.role}
                    </span>
                  </div>
                </div>

                <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {project.detailLink}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
