import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getDictionary } from '../../lib/dictionary';
import { ProfilePhoto } from '../../components/public/profile-photo';
import { ProjectRow } from '../../components/public/project-row';
import { primaryButton, secondaryButton } from '../../components/public/button-classes';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

const FEATURED_PROJECTS = 3;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const featured = dict.projects.items.slice(0, FEATURED_PROJECTS);

  return (
    <div className="flex flex-col">
      <section className="border-b border-rule px-5 md:px-20 py-14 md:py-24">
        <div className="mx-auto max-w-[1180px] grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          <div className="md:col-span-8 flex flex-col gap-7">
            <h1 className="font-serif text-[44px] md:text-[72px] leading-[1.06] tracking-[-0.02em] text-ink text-balance font-normal">
              {dict.home.headline}
            </h1>
            <p className="max-w-[56ch] text-lg md:text-xl leading-[1.6] text-ink-2">
              {dict.home.subheadline}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href={`/${locale}/projetos`} className={primaryButton}>
                {dict.home.ctaProjects}
                <ArrowRight className="size-4" />
              </Link>
              <Link href={`/${locale}/contato`} className={secondaryButton}>
                {dict.home.ctaContact}
              </Link>
            </div>
          </div>

          <aside className="md:col-span-4 flex flex-col gap-6 md:border-l md:border-rule md:pl-8">
            <ProfilePhoto alt={dict.home.photoAlt} size={144} className="size-24 md:size-36 shrink-0" />
            <dl className="flex flex-col gap-3.5">
              {dict.home.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5">
                  <dt className="text-[13px] text-ink-3">{fact.label}</dt>
                  <dd className="text-[15px] leading-[1.5] text-ink text-pretty">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="px-5 md:px-20 pt-14 md:pt-20">
        <div className="mx-auto max-w-[1180px] rounded-[8px] bg-[#1C1A17] dark:bg-[#181614] p-7 md:p-14 flex flex-col gap-8 text-[#FAF8F4]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 flex flex-col gap-4">
              <h2 className="font-serif text-3xl md:text-[44px] leading-[1.12] text-[#FAF8F4] font-normal text-balance">
                {dict.home.aiTitleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <p className="max-w-[62ch] text-base leading-[1.75] text-[#B5ADA3]">{dict.home.aiBody}</p>
            </div>
            <div className="md:col-span-4 flex md:justify-end">
              <Link
                href={`/${locale}/como-trabalho`}
                className="inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-[#FAF8F4] px-6 py-2.5 text-[15px] font-medium text-[#1C1A17] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07B54] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1A17]"
              >
                {dict.home.aiCta}
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            </div>
          </div>
          <ol className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-3 gap-y-2 border-t border-[#3A342E] pt-6">
            {dict.home.aiFlow.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-[15px] text-[#FAF8F4]">
                {step}
                {index < dict.home.aiFlow.length - 1 && (
                  <ArrowRight aria-hidden="true" className="hidden sm:block size-3.5 shrink-0 text-[#E07B54]" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 md:px-20 pt-14 md:pt-20">
        <div className="mx-auto max-w-[1180px] flex flex-col gap-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="font-serif text-3xl md:text-[40px] tracking-tight text-ink font-normal">
              {dict.home.featuredTitle}
            </h2>
            <Link href={`/${locale}/projetos`} className="text-sm text-accent hover:underline underline-offset-4">
              {dict.home.allProjectsLink}
            </Link>
          </div>

          <div className="flex flex-col border-b border-rule">
            {featured.map((project) => (
              <ProjectRow
                key={project.slug}
                project={project}
                href={`/${locale}/projetos/${project.slug}`}
                detailsLabel={dict.projects.labels.viewDetails}
                headingLevel="h3"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1180px] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl md:text-[40px] tracking-tight text-ink font-normal">
              {dict.home.contactTitle}
            </h2>
            <p className="text-base leading-[1.6] text-ink-2">{dict.home.contactBody}</p>
          </div>
          <Link href={`/${locale}/contato`} className={`${primaryButton} self-start md:self-auto shrink-0`}>
            {dict.home.ctaContact}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
