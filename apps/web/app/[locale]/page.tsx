import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getDictionary } from '../../lib/dictionary';
import { ProjectHighlightCard } from '../../components/public/project-highlight-card';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const featuredProjects = [
    {
      badge: locale === 'pt-BR' ? 'Produto · Este site' : 'Product · This site',
      title: dict.projects.items[0]?.title ?? 'DaviDev — Portfólio como Produto',
      description: dict.projects.items[0]?.problem ?? '',
      tags: dict.projects.items[0]?.stack ?? ['Next.js 15', 'Fastify', 'PostgreSQL', 'Hexagonal'],
      href: `/${locale}/projetos/${dict.projects.items[0]?.slug ?? 'davidev-portfolio-produto'}`,
    },
    {
      badge: locale === 'pt-BR' ? 'Web · Juventude' : 'Web · Youth Community',
      title: dict.projects.items[1]?.title ?? 'SaltWeb — Plataforma Web',
      description: dict.projects.items[1]?.problem ?? '',
      tags: dict.projects.items[1]?.stack ?? ['React', 'TypeScript', 'Tailwind CSS'],
      href: `/${locale}/projetos/${dict.projects.items[1]?.slug ?? 'saltweb'}`,
    },
    {
      badge: locale === 'pt-BR' ? 'IA · Full Stack' : 'AI · Full Stack',
      title: dict.projects.items[2]?.title ?? 'FIT.IA — Treino & Nutrição',
      description: dict.projects.items[2]?.problem ?? '',
      tags: dict.projects.items[2]?.stack ?? ['Node.js', 'Express', 'React', 'Tailwind CSS'],
      href: `/${locale}/projetos/${dict.projects.items[2]?.slug ?? 'fit-ia'}`,
    },
  ];

  const recentArticles = [
    {
      date: '2026-09-02',
      title:
        locale === 'pt-BR'
          ? 'Por que a arquitetura hexagonal se pagou num projeto de uma pessoa só'
          : 'Why hexagonal architecture paid off in a one-person project',
      category: locale === 'pt-BR' ? 'Arquitetura' : 'Architecture',
      href: `/${locale}/blog`,
    },
    {
      date: '2026-08-19',
      title:
        locale === 'pt-BR'
          ? 'Rate limiting em serverless: o bug que passa em todo teste local'
          : 'Rate limiting in serverless: the bug that slips past every local test',
      category: 'Backend',
      href: `/${locale}/blog`,
    },
    {
      date: '2026-07-30',
      title:
        locale === 'pt-BR'
          ? 'Reduzindo 60% do consumo de proxy em robôs de coleta'
          : 'Cutting 60% of proxy bandwidth in extraction bots',
      category: locale === 'pt-BR' ? 'Automação' : 'Automation',
      href: `/${locale}/blog`,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-rule px-5 md:px-20 py-12 md:py-24">
        <div className="mx-auto max-w-[1180px] grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 items-start">
          <div className="md:col-span-8 flex flex-col gap-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {dict.home.badge}
            </div>
            <h1 className="font-serif text-4xl md:text-[68px] leading-[1.08] md:leading-[1.06] tracking-[-0.02em] text-ink text-balance font-normal">
              {dict.home.headline}
            </h1>
            <p className="max-w-[60ch] text-base md:text-lg leading-[1.7] text-ink-2">
              {dict.home.subheadline}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/${locale}/projetos`}
                className="inline-flex h-[46px] items-center gap-2 rounded-[4px] bg-ink px-[22px] text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
              >
                {dict.home.ctaProjects}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`/${locale}/como-foi-construido`}
                className="inline-flex h-[46px] items-center rounded-[4px] border border-ink px-[22px] text-[15px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                {dict.home.ctaHowBuilt}
              </Link>
            </div>
          </div>

          {/* Stack Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-3.5 pt-1.5 md:border-l md:border-rule md:pl-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {dict.home.stackTitle}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dict.home.stackItems.map((tech) => (
                <span
                  key={tech}
                  className="rounded-[3px] border border-rule px-2.5 py-1 font-mono text-xs text-ink-2"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="my-2.5 h-[1px] bg-rule" />
            <div className="flex flex-col gap-1 font-mono text-xs leading-[1.9] text-ink-3">
              <div>
                <span className="text-ink-2">{dict.home.roleTitle}:</span> {dict.home.roleValue}
              </div>
              <div>
                <span className="text-ink-2">{dict.home.locationTitle}:</span> {dict.home.locationValue}
              </div>
              <div>
                <span className="text-ink-2">{dict.home.availabilityTitle}:</span> {dict.home.availabilityValue}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 01 — Em destaque */}
      <section className="border-b border-rule px-5 md:px-20 py-12 md:py-18">
        <div className="mx-auto max-w-[1180px] flex flex-col gap-9">
          <div className="flex items-baseline justify-between gap-6">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] tracking-[0.14em] text-accent font-semibold">
                {dict.home.featuredSectionNumber}
              </span>
              <h2 className="font-serif text-3xl md:text-[34px] tracking-tight text-ink font-normal">
                {dict.home.featuredTitle}
              </h2>
            </div>
            <Link
              href={`/${locale}/projetos`}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {dict.home.allProjectsLink}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((p) => (
              <ProjectHighlightCard
                key={p.title}
                badge={p.badge}
                title={p.title}
                description={p.description}
                tags={p.tags}
                href={p.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 02 — Escrito recentemente */}
      <section className="border-b border-rule px-5 md:px-20 py-12 md:py-18">
        <div className="mx-auto max-w-[1180px] flex flex-col gap-8">
          <div className="flex items-baseline justify-between gap-6">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] tracking-[0.14em] text-accent font-semibold">
                {dict.home.recentWritingNumber}
              </span>
              <h2 className="font-serif text-3xl md:text-[34px] tracking-tight text-ink font-normal">
                {dict.home.recentWritingTitle}
              </h2>
            </div>
            <Link
              href={`/${locale}/blog`}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {dict.home.allArticlesLink}
            </Link>
          </div>

          <div className="flex flex-col">
            {recentArticles.map((art, idx) => (
              <Link
                key={art.title}
                href={art.href}
                className={`group grid grid-cols-1 md:grid-cols-[132px_1fr_150px] gap-2 md:gap-7 items-baseline py-5 border-t border-rule transition-colors hover:bg-surface-sunken/40 ${
                  idx === recentArticles.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="font-mono text-xs text-ink-3">{art.date}</span>
                <span className="text-lg md:text-[19px] font-medium leading-[1.4] text-ink group-hover:text-accent transition-colors">
                  {art.title}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent md:text-right">
                  {art.category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — O diferencial */}
      <section className="px-5 md:px-20 py-12 md:py-18">
        <div className="mx-auto max-w-[1180px] rounded-[8px] bg-[#1C1A17] dark:bg-[#181614] p-7 md:p-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-[#FAF8F4]">
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#E07B54]">
              {dict.home.differentialNumber}
            </div>
            <h2 className="font-serif text-3xl md:text-[40px] leading-[1.15] text-[#FAF8F4] font-normal">
              {dict.home.differentialTitle}
            </h2>
            <p className="max-w-[58ch] text-base leading-[1.75] text-[#B5ADA3]">
              {dict.home.differentialBody}
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <Link
              href={`/${locale}/como-foi-construido`}
              className="inline-flex h-12 items-center gap-2 rounded-[4px] bg-[#FAF8F4] px-6 text-[15px] font-medium text-[#1C1A17] transition-opacity hover:opacity-90"
            >
              {dict.home.differentialCta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
