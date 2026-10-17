import { describe, it, expect } from 'vitest';
import { ResendDnsChecker, type DnsResolver } from '../resend-dns-checker';

class MockDnsResolver implements DnsResolver {
  constructor(
    private readonly records: {
      txt?: Record<string, string[][]>;
      cname?: Record<string, string[]>;
      mx?: Record<string, { exchange: string; priority: number }[]>;
    }
  ) {}

  public async resolveTxt(domain: string): Promise<string[][]> {
    return this.records.txt?.[domain] || [];
  }

  public async resolveCname(domain: string): Promise<string[]> {
    return this.records.cname?.[domain] || [];
  }

  public async resolveMx(domain: string): Promise<{ exchange: string; priority: number }[]> {
    return this.records.mx?.[domain] || [];
  }
}

describe('ResendDnsChecker (T08.01)', () => {
  it('identifies fully configured domain with SPF, DKIM, DMARC, and MX records', async () => {
    const mockResolver = new MockDnsResolver({
      txt: {
        'davidev.net.br': [['v=spf1 include:amazonses.com ~all']],
        '_dmarc.davidev.net.br': [['v=DMARC1; p=reject; rua=mailto:dmarc-reports@davidev.net.br; pct=100']],
      },
      cname: {
        'resend._domainkey.davidev.net.br': ['dkim.resend.com'],
      },
      mx: {
        'bounces.davidev.net.br': [{ exchange: 'feedback-smtp.us-east-1.amazonses.com', priority: 10 }],
      },
    });

    const checker = new ResendDnsChecker(mockResolver);
    const result = await checker.checkDomain('davidev.net.br');

    expect(result.domain).toBe('davidev.net.br');
    expect(result.verified).toBe(true);
    expect(result.spf.valid).toBe(true);
    expect(result.dkim.valid).toBe(true);
    expect(result.dmarc.valid).toBe(true);
    expect(result.mx.valid).toBe(true);
    expect(result.score).toBe(100);
    expect(result.recommendations).toHaveLength(0);
    expect(result.sslReady).toBe(true);
  });

  it('detects missing records and generates precise recommendations', async () => {
    const mockResolver = new MockDnsResolver({
      txt: {},
      cname: {},
      mx: {},
    });

    const checker = new ResendDnsChecker(mockResolver);
    const result = await checker.checkDomain('davidev.net.br');

    expect(result.verified).toBe(false);
    expect(result.spf.valid).toBe(false);
    expect(result.dkim.valid).toBe(false);
    expect(result.dmarc.valid).toBe(false);
    expect(result.mx.valid).toBe(false);
    expect(result.score).toBe(0);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(4);
    expect(result.recommendations[0]).toContain('SPF');
    expect(result.recommendations[1]).toContain('DKIM');
    expect(result.recommendations[2]).toContain('DMARC');
    expect(result.recommendations[3]).toContain('MX');
  });

  it('accepts include:resend.com in SPF and quarantine policy in DMARC', async () => {
    const mockResolver = new MockDnsResolver({
      txt: {
        'davidev.net.br': [['v=spf1 include:resend.com ~all']],
        '_dmarc.davidev.net.br': [['v=DMARC1; p=quarantine; pct=100']],
      },
      cname: {
        'resend._domainkey.davidev.net.br': ['resend.domainkey.net'],
      },
      mx: {
        'bounces.davidev.net.br': [{ exchange: 'bounces.resend.com', priority: 10 }],
      },
    });

    const checker = new ResendDnsChecker(mockResolver);
    const result = await checker.checkDomain('davidev.net.br');

    expect(result.verified).toBe(true);
    expect(result.spf.valid).toBe(true);
    expect(result.dkim.valid).toBe(true);
    expect(result.dmarc.valid).toBe(true);
    expect(result.score).toBe(100);
  });
});
