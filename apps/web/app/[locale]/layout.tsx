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
    ? 'DaviDev — Portfólio, Blog & Engenharia de Software'
    : 'DaviDev — Portfolio, Blog & Software Engineering';
  const description = isPt
    ? 'Construo sistemas — e mostro como foram construídos. Arquitetura, backend e automação em produção com processo 100% público.'
    : 'I build systems — and show how they were made. Architecture, backend, and automation in production with an entirely public process.';

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
