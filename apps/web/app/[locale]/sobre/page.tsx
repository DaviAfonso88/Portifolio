import Image from 'next/image';
import { getDictionary } from '../../../lib/dictionary';

interface SobrePageProps {
  params: Promise<{ locale: string }>;
}

export default async function SobrePage({ params }: SobrePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-10">
        {/* Left Column: Bio & Core Info */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
            {dict.about.badge}
          </div>
          <h1 className="font-serif text-4xl md:text-[52px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
            {dict.about.headline}
          </h1>

          <div className="flex flex-col gap-5 text-base md:text-[17px] leading-[1.75] text-ink-2 max-w-[62ch]">
            {dict.about.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="my-3 h-[1px] bg-rule" />

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                {dict.about.focusTitle}
              </span>
              <span className="text-[15px] text-ink">{dict.about.focusValue}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                {dict.about.baseTitle}
              </span>
              <span className="text-[15px] text-ink">{dict.about.baseValue}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                {dict.about.languagesTitle}
              </span>
              <span className="text-[15px] text-ink">{dict.about.languagesValue}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Photo & Trajectory */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Photo Frame */}
          <div className="relative aspect-[4/5] w-full rounded-[6px] border border-rule bg-surface-sunken overflow-hidden shadow-sm">
            <Image
              src="/images/perfil.png"
              alt="Davi Afonso"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>

          {/* Trajectory Timeline Card */}
          <div className="rounded-[6px] border border-rule bg-surface p-6 flex flex-col gap-3.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
              {dict.about.trajectoryTitle}
            </div>
            <div className="flex flex-col gap-3.5">
              {dict.about.milestones.map((m) => (
                <div
                  key={m.year}
                  className="grid grid-cols-[70px_1fr] gap-3.5 items-baseline"
                >
                  <span className="font-mono text-xs text-accent font-medium">
                    {m.year}
                  </span>
                  <span className="text-sm leading-[1.55] text-ink-2">
                    {m.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
