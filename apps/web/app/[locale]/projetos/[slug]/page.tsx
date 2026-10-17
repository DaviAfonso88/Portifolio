import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Cpu } from 'lucide-react';
import { getDictionary } from '../../../../lib/dictionary';
import { SUPPORTED_LOCALES } from '@davidev/domain';

interface ProjetoDetalhePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  const slugs = getDictionary('pt-BR').projects.items.map((p) => p.slug);

  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export default async function ProjetoDetalhePage({
  params,
}: ProjetoDetalhePageProps) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);

  const project = dict.projects.items.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      {/* Breadcrumb Bar */}
      <div className="border-b border-rule/50 bg-paper px-5 md:px-20 py-4">
        <div className="mx-auto max-w-[1180px] flex items-center gap-2 font-mono text-xs text-ink-3">
          <Link
            href={`/${locale}/projetos`}
            className="hover:text-accent transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            {dict.nav.projects}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{project.title}</span>
        </div>
      </div>

      <main className="px-5 md:px-20 py-12 md:py-20">
        <div className="mx-auto max-w-[1180px] flex flex-col gap-14">
          {/* Section 1: Overview Header */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            <div className="md:col-span-8 flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-[3px] border border-success/30 bg-success/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-success">
                  {project.status}
                </span>
                <span className="font-mono text-[11px] text-ink-3">
                  {project.period}
                </span>
              </div>
              <h1 className="font-serif text-4xl md:text-[54px] leading-[1.08] tracking-[-0.02em] text-ink font-normal">
                {project.title}
              </h1>
              <p className="max-w-[60ch] text-lg md:text-[19px] leading-[1.7] text-ink-2">
                {project.summary}
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col gap-4 md:border-l md:border-rule md:pl-8">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                  {locale === 'pt-BR' ? 'Meu papel' : 'My Role'}
                </span>
                <span className="text-[15px] text-ink">{project.role}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                  Stack
                </span>
                <span className="text-[15px] text-ink font-mono text-sm">
                  {project.stack.join(' · ')}
                </span>
              </div>
              <div className="my-1 h-[1px] bg-rule" />
              <div className="font-mono text-[11px] text-ink-3/70 leading-relaxed">
                {locale === 'pt-BR'
                  ? 'Engenharia com foco em arquitetura limpa, resiliência e medição de desempenho.'
                  : 'Engineering focused on clean architecture, resilience, and measurable performance.'}
              </div>
            </div>
          </section>

          {/* Media/Diagram Hero Block */}
          <div className="aspect-[21/9] w-full rounded-[8px] border border-rule bg-surface-sunken flex flex-col items-center justify-center gap-3 text-ink-3/60">
            <Cpu className="size-10 stroke-[1.25]" />
            <span className="font-mono text-xs uppercase tracking-[0.1em]">
              {locale === 'pt-BR'
                ? 'Arquitetura e Fluxo do Sistema'
                : 'Architecture & System Flow'}
            </span>
          </div>

          {/* Section 2: O Problema & Desafio de Engenharia */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            <div className="md:col-span-3">
              <div className="sticky top-24 flex items-baseline gap-3.5">
                <span className="font-mono text-[11px] tracking-[0.14em] text-accent font-semibold">
                  01
                </span>
                <h2 className="text-xl font-semibold text-ink">
                  {locale === 'pt-BR' ? 'O problema' : 'The problem'}
                </h2>
              </div>
            </div>
            <div className="md:col-span-9 flex flex-col gap-4 text-base md:text-[17px] leading-[1.75] text-ink-2 max-w-[68ch]">
              <p>{project.problem}</p>
              {project.engineeringChallenge && (
                <p>{project.engineeringChallenge}</p>
              )}
            </div>
          </section>

          {/* Section 3: Decisões de Engenharia & Trade-offs */}
          {project.decisions && project.decisions.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
              <div className="md:col-span-3">
                <div className="sticky top-24 flex items-baseline gap-3.5">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-accent font-semibold">
                    02
                  </span>
                  <h2 className="text-xl font-semibold text-ink">
                    {locale === 'pt-BR' ? 'Decisões' : 'Decisions'}
                  </h2>
                </div>
              </div>
              <div className="md:col-span-9 flex flex-col gap-5">
                {project.decisions.map((dec) => (
                  <div
                    key={dec.title}
                    className="flex flex-col gap-3 rounded-[6px] border border-rule bg-surface p-6 md:p-[26px]"
                  >
                    <h3 className="text-[17px] font-semibold text-ink">
                      {dec.title}
                    </h3>
                    <p className="text-[15px] leading-[1.7] text-ink-2">
                      {dec.desc}
                    </p>
                    <p className="text-sm leading-[1.6] text-ink-3">
                      <strong className="font-semibold text-ink-2">
                        {locale === 'pt-BR' ? 'Trade-off:' : 'Trade-off:'}{' '}
                      </strong>
                      {dec.tradeoff}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 4: Resultado */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            <div className="md:col-span-3">
              <div className="sticky top-24 flex items-baseline gap-3.5">
                <span className="font-mono text-[11px] tracking-[0.14em] text-accent font-semibold">
                  03
                </span>
                <h2 className="text-xl font-semibold text-ink">
                  {locale === 'pt-BR' ? 'Resultado' : 'Outcome'}
                </h2>
              </div>
            </div>
            <div className="md:col-span-9 flex flex-col gap-4 text-base md:text-[17px] leading-[1.75] text-ink-2 max-w-[68ch]">
              <p>{project.result}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
