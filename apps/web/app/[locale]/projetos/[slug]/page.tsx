import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getDictionary } from '../../../../lib/dictionary';
import { formatStack, ProjectStatus } from '../../../../components/public/project-row';
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

export async function generateMetadata({ params }: ProjetoDetalhePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getDictionary(locale).projects.items.find((p) => p.slug === slug);

  if (!project) return {};
  return { title: project.title, description: project.summary };
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
      <h2 className="md:col-span-3 text-xl font-semibold text-ink">{title}</h2>
      <div className="md:col-span-9 max-w-[68ch] text-base md:text-[17px] leading-[1.7] text-ink-2">
        {children}
      </div>
    </section>
  );
}

export default async function ProjetoDetalhePage({ params }: ProjetoDetalhePageProps) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);
  const { labels } = dict.projects;

  const project = dict.projects.items.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="px-5 md:px-20 py-8 md:py-14">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-12 md:gap-14">
        <Link
          href={`/${locale}/projetos`}
          className="inline-flex items-center gap-1.5 self-start text-sm text-ink-3 hover:text-accent transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {dict.nav.projects}
        </Link>

        <header className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          <div className="md:col-span-8 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <ProjectStatus status={project.status} isLive={project.isLive} />
              <span className="text-sm text-ink-3">{project.kind}</span>
              <span className="font-mono text-xs text-ink-3">{project.period}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-[56px] leading-[1.08] tracking-[-0.02em] text-ink text-balance font-normal">
              {project.title}
            </h1>
            <p className="max-w-[60ch] text-lg md:text-[19px] leading-[1.65] text-ink-2">{project.summary}</p>
          </div>

          <dl className="md:col-span-4 flex flex-col gap-5 md:border-l md:border-rule md:pl-8">
            <div className="flex flex-col gap-1">
              <dt className="text-[13px] text-ink-3">{labels.role}</dt>
              <dd className="text-[15px] leading-[1.5] text-ink">{project.role}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[13px] text-ink-3">{labels.stack}</dt>
              <dd className="font-mono text-[13px] leading-[1.7] text-ink">{formatStack(project.stack)}</dd>
            </div>
          </dl>
        </header>

        {project.flow.length > 0 && (
          <section aria-label={labels.flow} className="border-y border-rule py-6">
            <ol className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-x-3 gap-y-2.5">
              {project.flow.map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-[15px] leading-[1.4] text-ink">
                  {step}
                  {index < project.flow.length - 1 && (
                    <ArrowRight aria-hidden="true" className="hidden md:block size-3.5 shrink-0 text-ink-3" />
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <DetailSection title={labels.problem}>
          <p>{project.problem}</p>
        </DetailSection>

        <DetailSection title={labels.delivered}>
          <ul className="flex flex-col gap-2.5 pl-5 list-disc marker:text-ink-3">
            {project.delivered.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>

        {project.decisions.length > 0 && (
          <DetailSection title={labels.decisions}>
            <div className="flex flex-col gap-6">
              {project.decisions.map((decision) => (
                <div key={decision.title} className="flex flex-col gap-1.5">
                  <h3 className="text-[17px] font-semibold text-ink">{decision.title}</h3>
                  <p>{decision.desc}</p>
                  <p className="text-[15px] text-ink-3">
                    <strong className="font-semibold text-ink-2">{labels.tradeoff}</strong> {decision.tradeoff}
                  </p>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        <DetailSection title={labels.result}>
          <p className="text-ink">{project.result}</p>
          {project.isPrivate && <p className="mt-3 text-[15px] text-ink-3">{labels.privateNote}</p>}
        </DetailSection>

        {project.links.length > 0 && (
          <DetailSection title={labels.links}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
              {project.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('/') ? (
                    <Link href={link.href} className="text-accent underline-offset-4 hover:underline">
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </DetailSection>
        )}
      </div>
    </div>
  );
}
