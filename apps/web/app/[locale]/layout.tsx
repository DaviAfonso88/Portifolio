import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale, SUPPORTED_LOCALES } from '@davidev/domain';
import { Header } from '../../components/public/header';
import { Footer } from '../../components/public/footer';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isPt = locale === 'pt-BR';
  const title = isPt
    ? 'Davi Afonso | Desenvolvedor Full Stack .NET e React | DaviDev'
    : 'Davi Afonso | Full Stack Developer, .NET and React | DaviDev';
  const description = isPt
    ? 'Desenvolvedor full stack em Lagoa Santa, MG. Crio sistemas web completos com .NET e React, uso agentes de IA dentro de um fluxo com PRD, arquitetura e testes, e curso pós-graduação em Arquitetura de Software com IA.'
    : 'Full stack developer based in Brazil. I build complete web systems with .NET and React, use AI agents inside a flow with a PRD, architecture and tests, and am taking a postgraduate course in Software Architecture with AI.';

  const baseUrl = 'https://davidev.net.br';

  return {
    title: {
      default: title,
      template: '%s | DaviDev',
    },
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'pt-BR': `${baseUrl}/pt-BR`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: 'DaviDev',
      locale: isPt ? 'pt_BR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
