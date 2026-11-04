import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { isValidLocale, SUPPORTED_LOCALES } from '@davidev/domain';
import { getDictionary } from '../../../lib/dictionary';
import { primaryButton, secondaryButton } from '../../../components/public/button-classes';

interface ComoTrabalhoPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: ComoTrabalhoPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const { metaTitle, metaDescription } = getDictionary(locale).howIWork;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `https://davidev.net.br/${locale}/como-trabalho`,
      languages: {
        'pt-BR': 'https://davidev.net.br/pt-BR/como-trabalho',
        en: 'https://davidev.net.br/en/como-trabalho',
      },
    },
  };
}

const sectionTitle = 'font-serif text-3xl md:text-[40px] leading-[1.15] tracking-tight text-ink font-normal text-balance';

export default async function ComoTrabalhoPage({ params }: ComoTrabalhoPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const data = getDictionary(locale).howIWork;

  return (
    <div className="flex flex-col">
      <section className="bg-[#1C1A17] dark:bg-[#181614] px-5 md:px-20 py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] flex flex-col gap-6">
          <h1 className="font-serif text-[44px] md:text-[72px] leading-[1.06] tracking-[-0.02em] text-[#FAF8F4] text-balance font-normal">
            {data.headlineLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="max-w-[62ch] text-lg md:text-xl leading-[1.65] text-[#B5ADA3]">{data.intro}</p>
        </div>
      </section>

      <div className="px-5 md:px-20 py-14 md:py-20">
        <div className="mx-auto max-w-[1180px] flex flex-col gap-16 md:gap-24">
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className={sectionTitle}>{data.flowTitle}</h2>
              <p className="max-w-[62ch] text-base md:text-[17px] leading-[1.7] text-ink-2">{data.flowIntro}</p>
            </div>

            <ol className="flex flex-col border-b border-rule">
              {data.layers.map((layer, index) => (
                <li
                  key={layer.name}
                  className="grid grid-cols-[24px_1fr] md:grid-cols-[32px_240px_1fr] gap-x-3 md:gap-x-6 gap-y-2 py-6 border-t border-rule items-baseline"
                >
                  <span aria-hidden="true" className="font-mono text-xs font-medium text-accent">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[19px] font-semibold text-ink">{layer.name}</h3>
                    <span className="text-sm text-ink-3">{layer.question}</span>
                  </div>
                  <p className="col-start-2 md:col-start-3 max-w-[62ch] text-base leading-[1.7] text-ink-2">
                    {layer.description}
                  </p>
                </li>
              ))}
            </ol>

            <div className="rounded-[8px] bg-[#1C1A17] dark:bg-[#181614] p-7 md:p-12 flex flex-col gap-6">
              <h3 className="text-xl font-semibold text-[#FAF8F4]">{data.authorityTitle}</h3>
              <ol
                aria-label={data.authorityChainLabel}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 font-serif text-2xl md:text-[34px] leading-[1.25] text-[#FAF8F4]"
              >
                {data.authorityChain.map((link, index) => (
                  <Fragment key={link}>
                    <li>{link}</li>
                    {index < data.authorityChain.length - 1 && (
                      <ArrowRight aria-hidden="true" className="size-4 md:size-5 shrink-0 text-[#E07B54]" />
                    )}
                  </Fragment>
                ))}
              </ol>
              <p className="max-w-[66ch] text-base leading-[1.7] text-[#B5ADA3]">{data.authorityBody}</p>
            </div>
          </section>

          <section className="flex flex-col gap-8">
            <h2 className={sectionTitle}>{data.splitTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 border-t border-rule pt-8">
              <div className="flex flex-col gap-4 md:pr-14">
                <h3 className="text-xl font-semibold text-ink">{data.splitAiTitle}</h3>
                <ul className="flex flex-col gap-2.5 pl-5 list-disc marker:text-ink-3 text-base leading-[1.7] text-ink-2">
                  {data.splitAiItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4 md:border-l md:border-rule md:pl-14">
                <h3 className="text-xl font-semibold text-ink">{data.splitMeTitle}</h3>
                <ul className="flex flex-col gap-2.5 pl-5 list-disc marker:text-ink-3 text-base leading-[1.7] text-ink-2">
                  {data.splitMeItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
            <div className="md:col-span-5 flex flex-col gap-4">
              <h2 className={sectionTitle}>{data.studyTitle}</h2>
              {data.studyParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-base md:text-[17px] leading-[1.7] text-ink-2">
                  {paragraph}
                </p>
              ))}
              <a
                href={data.studyLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 self-start text-[15px] font-medium text-accent underline-offset-4 hover:underline"
              >
                {data.studyLink.label}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>

            <div className="md:col-span-7 flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-ink">{data.appliedTitle}</h3>
              <dl className="flex flex-col border-b border-rule">
                {data.applied.map((item) => (
                  <div key={item.topic} className="flex flex-col gap-1 py-4 border-t border-rule">
                    <dt className="text-[17px] leading-[1.45] text-ink">{item.topic}</dt>
                    <dd className="text-sm text-ink-3">{item.where}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[15px] leading-[1.7] text-ink-2">{data.appliedExtra}</p>
            </div>
          </section>

          <section className="flex flex-col gap-8">
            <h2 className={sectionTitle}>{data.proofTitle}</h2>
            <ul className="flex flex-col border-b border-rule">
              {data.proof.map((item) => (
                <li key={item.href} className="group relative grid grid-cols-1 md:grid-cols-[320px_1fr_auto] gap-x-8 gap-y-2 py-6 border-t border-rule items-baseline">
                  <Link
                    href={`/${locale}${item.href}`}
                    className="font-serif text-2xl md:text-[28px] leading-[1.2] text-ink transition-colors group-hover:text-accent after:absolute after:inset-0 after:content-['']"
                  >
                    {item.title}
                  </Link>
                  <p className="max-w-[60ch] text-base leading-[1.7] text-ink-2">{item.detail}</p>
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden md:block size-4 self-center text-accent transition-transform group-hover:translate-x-0.5"
                  />
                </li>
              ))}
            </ul>
            <p className="max-w-[72ch] text-base md:text-[17px] leading-[1.7] text-ink-2">{data.teachingBody}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/${locale}/como-foi-construido`} className={primaryButton}>
                {data.ctaBuilt}
                <ArrowRight className="size-4" />
              </Link>
              <Link href={`/${locale}/contato`} className={secondaryButton}>
                {data.ctaContact}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
