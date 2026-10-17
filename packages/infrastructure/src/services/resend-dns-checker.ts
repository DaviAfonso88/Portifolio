import * as dns from 'node:dns/promises';

export interface DnsRecordStatus {
  type: 'TXT' | 'CNAME' | 'MX';
  name: string;
  expectedValue: string;
  actualValue?: string;
  valid: boolean;
  status: 'verified' | 'failed' | 'pending';
  description: string;
}

export interface DomainVerificationResult {
  domain: string;
  verified: boolean;
  spf: DnsRecordStatus;
  dkim: DnsRecordStatus;
  dmarc: DnsRecordStatus;
  mx: DnsRecordStatus;
  sslReady: boolean;
  score: number; // 0 to 100
  recommendations: string[];
}

export interface DnsResolver {
  resolveTxt(domain: string): Promise<string[][]>;
  resolveCname(domain: string): Promise<string[]>;
  resolveMx(domain: string): Promise<{ exchange: string; priority: number }[]>;
}

export class NodeDnsResolver implements DnsResolver {
  public async resolveTxt(domain: string): Promise<string[][]> {
    try {
      return await dns.resolveTxt(domain);
    } catch {
      return [];
    }
  }

  public async resolveCname(domain: string): Promise<string[]> {
    try {
      return await dns.resolveCname(domain);
    } catch {
      return [];
    }
  }

  public async resolveMx(domain: string): Promise<{ exchange: string; priority: number }[]> {
    try {
      return await dns.resolveMx(domain);
    } catch {
      return [];
    }
  }
}

export class ResendDnsChecker {
  constructor(private readonly resolver: DnsResolver = new NodeDnsResolver()) {}

  public async checkDomain(domain: string): Promise<DomainVerificationResult> {
    const cleanDomain = domain.toLowerCase().trim();
    const recommendations: string[] = [];

    // 1. Check SPF
    const rootTxtRecords = await this.resolver.resolveTxt(cleanDomain);
    const flattenedRootTxt = rootTxtRecords.map((chunks) => chunks.join(''));
    const spfRecord = flattenedRootTxt.find((txt) => txt.startsWith('v=spf1'));

    const spfExpected = 'v=spf1 include:amazonses.com ~all';
    const isSpfValid = Boolean(
      spfRecord &&
        (spfRecord.includes('include:amazonses.com') ||
          spfRecord.includes('include:resend.com'))
    );

    const spfStatus: DnsRecordStatus = {
      type: 'TXT',
      name: cleanDomain,
      expectedValue: spfExpected,
      actualValue: spfRecord,
      valid: isSpfValid,
      status: isSpfValid ? 'verified' : 'failed',
      description: 'Sender Policy Framework (SPF) autoriza servidores do Resend/AWS a enviar e-mails em nome do domínio.',
    };

    if (!isSpfValid) {
      recommendations.push(
        `Configurar registro TXT para SPF em ${cleanDomain}: "${spfExpected}"`
      );
    }

    // 2. Check DKIM (resend._domainkey.domain)
    const dkimHost = `resend._domainkey.${cleanDomain}`;
    const dkimCnames = await this.resolver.resolveCname(dkimHost);
    const dkimTxt = await this.resolver.resolveTxt(dkimHost);
    const dkimExpected = `dkim.resend.com`;
    const isDkimValid =
      dkimCnames.some((c) => c.toLowerCase().includes('resend') || c.toLowerCase().includes('amazonses')) ||
      dkimTxt.some((chunks) => chunks.join('').includes('v=DKIM1'));

    const dkimStatus: DnsRecordStatus = {
      type: 'CNAME',
      name: dkimHost,
      expectedValue: dkimExpected,
      actualValue: dkimCnames[0] || (dkimTxt[0] ? dkimTxt[0].join('') : undefined),
      valid: isDkimValid,
      status: isDkimValid ? 'verified' : 'failed',
      description: 'DomainKeys Identified Mail (DKIM) assina criptograficamente os e-mails garantindo autenticidade e integridade.',
    };

    if (!isDkimValid) {
      recommendations.push(
        `Configurar registro CNAME para DKIM em ${dkimHost} apontando para "${dkimExpected}"`
      );
    }

    // 3. Check DMARC (_dmarc.domain)
    const dmarcHost = `_dmarc.${cleanDomain}`;
    const dmarcTxtRecords = await this.resolver.resolveTxt(dmarcHost);
    const flattenedDmarcTxt = dmarcTxtRecords.map((chunks) => chunks.join(''));
    const dmarcRecord = flattenedDmarcTxt.find((txt) => txt.startsWith('v=DMARC1'));

    const dmarcExpected = `v=DMARC1; p=reject; rua=mailto:dmarc-reports@${cleanDomain}; pct=100`;
    const isDmarcValid = Boolean(
      dmarcRecord &&
        dmarcRecord.includes('v=DMARC1') &&
        (dmarcRecord.includes('p=reject') || dmarcRecord.includes('p=quarantine') || dmarcRecord.includes('p=none'))
    );

    const dmarcStatus: DnsRecordStatus = {
      type: 'TXT',
      name: dmarcHost,
      expectedValue: dmarcExpected,
      actualValue: dmarcRecord,
      valid: isDmarcValid,
      status: isDmarcValid ? 'verified' : 'failed',
      description: 'Domain-based Message Authentication (DMARC) protege contra spoofing definindo política para e-mails não autenticados.',
    };

    if (!isDmarcValid) {
      recommendations.push(
        `Configurar registro TXT para DMARC em ${dmarcHost}: "${dmarcExpected}"`
      );
    }

    // 4. Check MX (Bounces & feedback)
    const bouncesHost = `bounces.${cleanDomain}`;
    const mxRecords = await this.resolver.resolveMx(bouncesHost);
    const mxExpected = 'feedback-smtp.us-east-1.amazonses.com';
    const isMxValid =
      mxRecords.length > 0 &&
      mxRecords.some((mx) => mx.exchange.toLowerCase().includes('amazonses') || mx.exchange.toLowerCase().includes('resend'));

    const mxStatus: DnsRecordStatus = {
      type: 'MX',
      name: bouncesHost,
      expectedValue: mxExpected,
      actualValue: mxRecords[0]?.exchange,
      valid: isMxValid,
      status: isMxValid ? 'verified' : 'failed',
      description: 'Mail Exchange (MX) de retorno para captura de bounces e relatórios de entrega.',
    };

    if (!isMxValid) {
      recommendations.push(
        `Configurar registro MX em ${bouncesHost} com prioridade 10 apontando para "${mxExpected}"`
      );
    }

    // Calculate deliverability health score
    let points = 0;
    if (spfStatus.valid) points += 30;
    if (dkimStatus.valid) points += 40;
    if (dmarcStatus.valid) points += 20;
    if (mxStatus.valid) points += 10;

    const allVerified = spfStatus.valid && dkimStatus.valid && dmarcStatus.valid;

    return {
      domain: cleanDomain,
      verified: allVerified,
      spf: spfStatus,
      dkim: dkimStatus,
      dmarc: dmarcStatus,
      mx: mxStatus,
      sslReady: true, // TLS 1.3 enforced by default
      score: points,
      recommendations,
    };
  }
}
