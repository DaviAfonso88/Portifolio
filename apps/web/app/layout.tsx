import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { AnalyticsTracker } from '../components/public/analytics-tracker';

export const metadata: Metadata = {
  title: 'DaviDev — Portfolio, Blog & Engenharia de Software',
  description: 'Portfolio e blog técnico de Davi, focado em arquitetura de software e sistemas web de alto desempenho.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script
          defer
          data-domain="davidev.net.br"
          src="https://plausible.io/js/script.tagged-events.js"
          strategy="afterInteractive"
          nonce={nonce}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/20 selection:text-accent">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

