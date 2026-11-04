import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getDictionary } from '../../../lib/dictionary';
import { ProfilePhoto } from '../../../components/public/profile-photo';

interface SobrePageProps {
  params: Promise<{ locale: string }>;
}

export default async function SobrePage({ params }: SobrePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-14 md:gap-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
          <div className="md:col-span-7 flex flex-col gap-6">
            <h1 className="font-serif text-4xl md:text-[56px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
              {dict.about.headline}
            </h1>

            <div className="flex flex-col gap-5 text-base md:text-[17px] leading-[1.75] text-ink-2 max-w-[62ch]">
              {dict.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <Link
              href={`/${locale}/como-trabalho`}
              className="inline-flex items-center gap-1.5 self-start text-[15px] font-medium text-accent underline-offset-4 hover:underline"
            >
              {dict.about.methodLink}
              <ArrowRight className="size-4" />
            </Link>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-rule pt-6">
              <div className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-ink-3">{dict.about.baseTitle}</dt>
                <dd className="text-[15px] leading-[1.5] text-ink">{dict.about.baseValue}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-ink-3">{dict.about.languagesTitle}</dt>
                <dd className="text-[15px] leading-[1.5] text-ink">{dict.about.languagesValue}</dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-5 flex flex-col gap-8">
            <ProfilePhoto alt={dict.about.photoAlt} size={224} className="size-40 md:size-56 shrink-0" />

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-ink">{dict.about.trajectoryTitle}</h2>
              <div className="flex flex-col gap-3.5">
                {dict.about.milestones.map((milestone) => (
                  <div key={milestone.year} className="grid grid-cols-[52px_1fr] gap-3 items-baseline">
                    <span className="font-mono text-xs text-accent font-medium">{milestone.year}</span>
                    <span className="text-[15px] leading-[1.55] text-ink-2">{milestone.description}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="font-serif text-3xl md:text-[40px] tracking-tight text-ink font-normal">
            {dict.about.stackTitle}
          </h2>
          <dl className="flex flex-col border-b border-rule">
            {dict.about.stackGroups.map((group) => (
              <div
                key={group.title}
                className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-10 py-4 border-t border-rule items-baseline"
              >
                <dt className="text-[15px] font-semibold text-ink">{group.title}</dt>
                <dd className="text-[15px] leading-[1.6] text-ink-2">{group.items}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
