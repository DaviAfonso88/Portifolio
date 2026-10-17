import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DaviDev — Portfolio, Blog & Engenharia de Software';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface OpenGraphImageProps {
  params: Promise<{ locale: string }>;
}

export default async function Image({ params }: OpenGraphImageProps) {
  const { locale } = await params;

  const isPt = locale === 'pt-BR';
  const headline = isPt
    ? 'Construo sistemas — e mostro como foram construídos.'
    : 'I build systems — and show how they were made.';
  const subline = isPt
    ? 'Arquitetura Hexagonal · Backend · TypeScript & .NET · PostgreSQL'
    : 'Hexagonal Architecture · Backend · TypeScript & .NET · PostgreSQL';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAF8F4',
          padding: '80px',
          fontFamily: 'serif',
          color: '#1C1A17',
          border: '12px solid #E4DFD7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 32, letterSpacing: '-0.02em', fontWeight: 600 }}>
            davidev
          </span>
          <span
            style={{
              fontSize: 16,
              fontFamily: 'monospace',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#A6482C',
            }}
          >
            {isPt ? 'Engenharia de Software' : 'Software Engineering'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 900,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 22,
              fontFamily: 'sans-serif',
              color: '#55504A',
              maxWidth: 800,
            }}
          >
            {subline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#857D74',
            borderTop: '1px solid #E4DFD7',
            paddingTop: 24,
          }}
        >
          <span>davidev.net.br</span>
          <span>{isPt ? 'PRD · ADRs · Hexagonal' : 'PRD · ADRs · Hexagonal'}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
