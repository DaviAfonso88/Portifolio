import Link from 'next/link';
import { getDictionary } from '../../lib/dictionary';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="mt-auto border-t border-rule bg-paper px-5 md:px-20 py-11 pb-14 font-mono text-xs text-ink-2 leading-[1.9]">
      <div className="mx-auto max-w-[1180px] grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8">
        {/* Perfil & Atuação */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <div className="font-medium text-ink">{dict.footer.colophonTitle}</div>
          <div>{dict.footer.colophonLine1}</div>
          <div>{dict.footer.colophonLine2}</div>
          {dict.footer.colophonLine3 && <div>{dict.footer.colophonLine3}</div>}
        </div>

        {/* Contato & Redes */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <div className="font-medium text-ink">{dict.footer.contactTitle}</div>
          <a
            href={`mailto:${dict.footer.emailValue}`}
            className="text-ink-2 hover:text-accent transition-colors"
          >
            {dict.footer.emailLabel}
          </a>
          <a
            href={dict.footer.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-2 hover:text-accent transition-colors"
          >
            {dict.footer.linkedinLabel}
          </a>
          <a
            href={dict.footer.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-2 hover:text-accent transition-colors"
          >
            {dict.footer.githubLabel}
          </a>
        </div>

        {/* Políticas & Copyright */}
        <div className="md:col-span-3 flex flex-col gap-1.5 md:items-end">
          <Link
            href={`/${locale}/privacidade`}
            className="text-ink-2 hover:text-accent transition-colors"
          >
            {dict.footer.privacyPolicy}
          </Link>
          <a
            href={dict.footer.sourceCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-2 hover:text-accent transition-colors"
          >
            {dict.footer.sourceCode}
          </a>
          <div className="text-ink-3">{dict.footer.copyright}</div>
        </div>
      </div>
    </footer>
  );
}
