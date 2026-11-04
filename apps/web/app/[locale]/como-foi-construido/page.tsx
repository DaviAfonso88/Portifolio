import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLocale, SUPPORTED_LOCALES } from '@davidev/domain';
import { getDictionary } from '../../../lib/dictionary';
import { Info, ArrowUpRight } from 'lucide-react';

interface ComoFoiConstruidoPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: ComoFoiConstruidoPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const isPt = locale === 'pt-BR';
  const title = isPt
    ? 'Como este site foi construído: Arquitetura & Engenharia | DaviDev'
    : 'How this website was built: Architecture & Engineering | DaviDev';
  const description = isPt
    ? 'Estudo de caso transparente: PRD antes do código, arquitetura hexagonal, contratos OpenAPI e validação contínua com IA.'
    : 'Transparent case study: PRD before code, hexagonal architecture, OpenAPI contracts, and continuous verification with AI.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://davidev.net.br/${locale}/como-foi-construido`,
      languages: {
        'pt-BR': 'https://davidev.net.br/pt-BR/como-foi-construido',
        en: 'https://davidev.net.br/en/como-foi-construido',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://davidev.net.br/${locale}/como-foi-construido`,
      siteName: 'DaviDev',
      type: 'article',
    },
  };
}

export default async function ComoFoiConstruidoPage({
  params,
}: ComoFoiConstruidoPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const data = dict.howItWasBuilt;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 1. Dark Hero Section matching design/ComoFoiConstruido.dc.html */}
      <section className="border-b border-[#3A342E] bg-[#1C1A17] px-5 py-16 sm:px-8 md:px-20 md:py-24 text-[#FAF8F4]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12">
          <div className="flex flex-col gap-6 md:col-span-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#E07B54]">
              {data.badge}
            </div>
            <h1 className="font-serif text-4xl font-normal leading-[1.06] tracking-[-0.02em] text-[#FAF8F4] sm:text-5xl md:text-[62px]">
              {data.headline}
            </h1>
            <p className="max-w-[62ch] text-lg leading-[1.7] text-[#B5ADA3] md:text-[19px]">
              {data.intro}
            </p>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs leading-[1.9] text-[#8A827A] border-t border-[#3A342E] pt-6 md:col-span-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            {data.metrics.map((m) => (
              <div key={m.label} className="flex items-baseline gap-2">
                <span className="font-semibold text-[#E07B54] text-sm">
                  {m.count}
                </span>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Narrative Content matching design */}
      <main className="px-5 py-16 sm:px-8 md:px-20 md:py-24">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-16 md:gap-20">

          {/* Section 01: O fluxo */}
          <section className="flex flex-col gap-8">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs font-semibold tracking-[0.14em] text-accent">
                {data.flowNumber}
              </span>
              <h2 className="font-serif text-3xl font-normal text-ink md:text-[34px]">
                {data.flowTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {data.flowSteps.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-col gap-2.5 rounded-[6px] border border-rule bg-surface p-5 transition-colors hover:border-accent/40"
                >
                  <span className="font-mono text-[11px] font-medium text-accent">
                    {step.number}
                  </span>
                  <span className="text-[15px] font-semibold text-ink">
                    {step.title}
                  </span>
                  <span className="text-[13px] leading-[1.55] text-ink-3">
                    {step.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 rounded-[6px] border border-rule bg-surface-sunken p-5 md:p-6">
              <Info className="size-[18px] shrink-0 text-ink-3 mt-0.5" />
              <p className="text-[15px] leading-[1.7] text-ink-2">
                {data.flowNote}
              </p>
            </div>
          </section>

          {/* Section 02: Decisões que valeram um ADR */}
          <section className="flex flex-col gap-8">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs font-semibold tracking-[0.14em] text-accent">
                {data.adrsNumber}
              </span>
              <h2 className="font-serif text-3xl font-normal text-ink md:text-[34px]">
                {data.adrsTitle}
              </h2>
            </div>

            <div className="flex flex-col">
              {data.adrs.map((adr, index) => (
                <div
                  key={adr.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-7 py-6 border-t border-rule items-baseline ${
                    index === data.adrs.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <span className="font-mono text-xs font-medium text-accent md:col-span-2">
                    {adr.id}
                  </span>
                  <div className="flex flex-col gap-1.5 md:col-span-6">
                    <span className="text-[17px] font-semibold text-ink">
                      {adr.title}
                    </span>
                    <span className="text-sm leading-[1.6] text-ink-2">
                      {adr.description}
                    </span>
                  </div>
                  <div className="text-[13px] leading-[1.6] text-ink-3 md:col-span-4">
                    <strong className="font-semibold text-ink-2 mr-1">
                      {adr.costLabel}
                    </strong>
                    <span>{adr.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 03: O que eu errei no caminho */}
          <section className="flex flex-col gap-8">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs font-semibold tracking-[0.14em] text-accent">
                {data.mistakesNumber}
              </span>
              <h2 className="font-serif text-3xl font-normal text-ink md:text-[34px]">
                {data.mistakesTitle}
              </h2>
            </div>

            <p className="max-w-[68ch] text-[17px] leading-[1.75] text-ink-2">
              {data.mistakesIntro}
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.mistakes.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-2.5 rounded-[6px] border border-rule border-l-[3px] border-l-accent bg-surface p-6"
                >
                  <span className="text-base font-semibold text-ink">
                    {item.title}
                  </span>
                  <p className="text-sm leading-[1.7] text-ink-2">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 04: Os documentos estão abertos (T09.02) */}
          <section className="grid grid-cols-1 gap-8 rounded-[8px] border border-rule bg-surface-sunken p-8 md:grid-cols-12 md:p-10 items-center">
            <div className="flex flex-col gap-3 md:col-span-7">
              <h2 className="font-serif text-2xl font-normal text-ink md:text-[28px]">
                {data.openDocsTitle}
              </h2>
              <p className="text-[15px] leading-[1.7] text-ink-2 max-w-[50ch]">
                {data.openDocsIntro}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 items-start font-mono text-[13px] md:col-span-5">
              {data.openDocsLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover hover:underline transition-colors py-1"
                >
                  <span>{link.label}</span>
                  {link.isExternal && <ArrowUpRight className="size-3.5 opacity-70" />}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
