import Link from 'next/link';
import { Mail, Linkedin, Github, Shield } from 'lucide-react';
import { getDictionary } from '../../../lib/dictionary';
import { ContactForm } from '../../../components/public/contact-form';

interface ContatoPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContatoPage({ params }: ContatoPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
        {/* Left Column: Direct Info & Channels */}
        <div className="md:col-span-5 flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-4xl md:text-[52px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
              {dict.contact.headline}
            </h1>
            <p className="max-w-[46ch] text-base md:text-[17px] leading-[1.75] text-ink-2">
              {dict.contact.intro}
            </p>
          </div>

          <div className="h-[1px] bg-rule" />

          {/* Direct Channels */}
          <div className="flex flex-col gap-1">
            <a
              href={`mailto:${dict.contact.emailValue}`}
              className="flex items-center gap-3.5 py-4 border-b border-rule/50 text-ink hover:text-accent transition-colors"
            >
              <Mail className="size-5 text-accent stroke-[1.5]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-medium leading-none">
                  {dict.contact.emailLabel}
                </span>
                <span className="font-mono text-xs text-ink-3">
                  {dict.contact.emailValue}
                </span>
              </div>
            </a>

            <a
              href={dict.footer.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 py-4 border-b border-rule/50 text-ink hover:text-accent transition-colors"
            >
              <Linkedin className="size-5 text-accent stroke-[1.5]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-medium leading-none">
                  {dict.contact.linkedinLabel}
                </span>
                <span className="font-mono text-xs text-ink-3">
                  {dict.contact.linkedinHandle}
                </span>
              </div>
            </a>

            <a
              href={dict.footer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 py-4 border-b border-rule/50 text-ink hover:text-accent transition-colors"
            >
              <Github className="size-5 text-accent stroke-[1.5]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-medium leading-none">
                  {dict.contact.githubLabel}
                </span>
                <span className="font-mono text-xs text-ink-3">
                  {dict.contact.githubHandle}
                </span>
              </div>
            </a>
          </div>

          {/* Privacy Notice Box */}
          <div className="flex gap-3 rounded-[6px] border border-rule bg-surface-sunken p-4.5">
            <Shield className="size-4.5 text-ink-3 shrink-0 mt-0.5 stroke-[1.5]" />
            <p className="text-[13px] leading-[1.65] text-ink-2">
              {dict.contact.privacyNotice}{' '}
              <Link
                href={`/${locale}/privacidade`}
                className="text-accent underline hover:opacity-80"
              >
                {dict.nav.privacy}
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-7">
          <ContactForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
