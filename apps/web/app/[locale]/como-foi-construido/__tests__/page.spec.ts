import { describe, it, expect } from 'vitest';
import { generateStaticParams, generateMetadata } from '../page';

describe('ComoFoiConstruidoPage (T09.01 & T09.02)', () => {
  it('generates static params for all supported locales (pt-BR and en)', () => {
    const params = generateStaticParams();
    expect(params).toEqual([
      { locale: 'pt-BR' },
      { locale: 'en' },
    ]);
  });

  it('generates appropriate metadata for pt-BR locale', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: 'pt-BR' }),
    });

    expect(meta.title).toContain('Como este site foi construído');
    expect(meta.description).toContain('PRD antes do código');
    expect(meta.alternates?.canonical).toBe('https://davidev.net.br/pt-BR/como-foi-construido');
  });

  it('generates appropriate metadata for en locale', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });

    expect(meta.title).toContain('How this website was built');
    expect(meta.description).toContain('PRD before code');
    expect(meta.alternates?.canonical).toBe('https://davidev.net.br/en/como-foi-construido');
  });

  it('returns empty metadata object for invalid locale', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: 'invalid-locale' }),
    });

    expect(meta).toEqual({});
  });
});
