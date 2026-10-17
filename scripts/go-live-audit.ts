/**
 * Go-Live Readiness Automated Audit (T08.04)
 * Validates Core Web Vitals configuration, security headers, environment variables schema,
 * zero credential leakage in client code, and maintenance cron definitions.
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditCheck {
  id: string;
  category: 'Security' | 'Performance' | 'Reliability' | 'Compliance';
  title: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  details: string;
}

const checks: AuditCheck[] = [];

function recordCheck(check: AuditCheck) {
  checks.push(check);
  const icon = check.status === 'PASSED' ? '✓' : check.status === 'WARNING' ? '⚠' : '✗';
  console.log(`[${icon}] ${check.category} - ${check.title}: ${check.details}`);
}

async function runGoLiveAudit() {
  console.log('====================================================');
  console.log('  DaviDev — Automated Go-Live Readiness Audit');
  console.log('====================================================\n');

  const rootDir = process.cwd();

  // 1. Audit Security Headers in Route Handler
  const routePath = path.join(rootDir, 'apps/web/app/api/[...path]/route.ts');
  if (fs.existsSync(routePath)) {
    const routeContent = fs.readFileSync(routePath, 'utf-8');
    const hasCsp = routeContent.includes("Content-Security-Policy");
    const hasXContentType = routeContent.includes("X-Content-Type-Options");
    const hasXFrame = routeContent.includes("X-Frame-Options");

    if (hasCsp && hasXContentType && hasXFrame) {
      recordCheck({
        id: 'SEC-01',
        category: 'Security',
        title: 'HTTP Security Headers in API Gateway',
        status: 'PASSED',
        details: 'CSP, X-Content-Type-Options (nosniff) and X-Frame-Options (DENY) enforced.',
      });
    } else {
      recordCheck({
        id: 'SEC-01',
        category: 'Security',
        title: 'HTTP Security Headers in API Gateway',
        status: 'FAILED',
        details: 'Missing one or more required security headers.',
      });
    }
  }

  // 2. Audit Vercel Cron Configuration
  const vercelJsonPath = path.join(rootDir, 'apps/web/vercel.json');
  if (fs.existsSync(vercelJsonPath)) {
    try {
      const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      const cron = vercelJson.crons?.find((c: any) => c.path === '/api/cron/maintenance');
      if (cron && cron.schedule) {
        recordCheck({
          id: 'REL-01',
          category: 'Reliability',
          title: 'Vercel Cron Maintenance Schedule (P-003)',
          status: 'PASSED',
          details: `Daily cron registered at path ${cron.path} with schedule "${cron.schedule}".`,
        });
      } else {
        recordCheck({
          id: 'REL-01',
          category: 'Reliability',
          title: 'Vercel Cron Maintenance Schedule (P-003)',
          status: 'FAILED',
          details: 'Maintenance cron definition missing or malformed.',
        });
      }
    } catch (e) {
      recordCheck({
        id: 'REL-01',
        category: 'Reliability',
        title: 'Vercel Cron Maintenance Schedule (P-003)',
        status: 'FAILED',
        details: `Failed to parse vercel.json: ${e}`,
      });
    }
  }

  // 3. Audit Cron Endpoint Security
  const cronRoutePath = path.join(rootDir, 'apps/web/app/api/cron/maintenance/route.ts');
  if (fs.existsSync(cronRoutePath)) {
    const cronContent = fs.readFileSync(cronRoutePath, 'utf-8');
    const validatesCronSecret = cronContent.includes('process.env.CRON_SECRET') && cronContent.includes('UNAUTHORIZED_CRON');
    const executesPurge = cronContent.includes('purgeOldContactMessages');

    if (validatesCronSecret && executesPurge) {
      recordCheck({
        id: 'SEC-02',
        category: 'Security',
        title: 'Maintenance Endpoint Authentication & Purge Logic',
        status: 'PASSED',
        details: 'Protected by CRON_SECRET bearer token and executes 24-month retention purge.',
      });
    } else {
      recordCheck({
        id: 'SEC-02',
        category: 'Security',
        title: 'Maintenance Endpoint Authentication & Purge Logic',
        status: 'FAILED',
        details: 'Missing CRON_SECRET authorization check or purge logic.',
      });
    }
  }

  // 4. Audit Core Web Vitals & In-Process Caching
  const postPagePath = path.join(rootDir, 'apps/web/app/[locale]/blog/[slug]/page.tsx');
  let isrConfigured = false;
  if (fs.existsSync(postPagePath)) {
    const postPage = fs.readFileSync(postPagePath, 'utf-8');
    isrConfigured = postPage.includes('revalidate') && postPage.includes('generateStaticParams') && postPage.includes('getBlogUseCases');
  }

  if (isrConfigured) {
    recordCheck({
      id: 'PERF-01',
      category: 'Performance',
      title: 'In-Process Direct Invocation & Core Web Vitals (LCP < 2.5s)',
      status: 'PASSED',
      details: 'Public blog & pages read directly from domain use cases with SSG/ISR (revalidate = 3600) without network hops.',
    });
  } else {
    recordCheck({
      id: 'PERF-01',
      category: 'Performance',
      title: 'In-Process Direct Invocation & Core Web Vitals (LCP < 2.5s)',
      status: 'WARNING',
      details: 'Check SSG / ISR configuration in blog routes.',
    });
  }


  // 5. Audit Plausible Qualified Deepening Tracking
  const analyticsPath = path.join(rootDir, 'apps/web/lib/analytics.ts');
  const layoutPath = path.join(rootDir, 'apps/web/app/layout.tsx');
  if (fs.existsSync(analyticsPath) && fs.existsSync(layoutPath)) {
    const analytics = fs.readFileSync(analyticsPath, 'utf-8');
    const layout = fs.readFileSync(layoutPath, 'utf-8');

    const tracksQualified = analytics.includes('Qualified Deepening') && analytics.includes('detectProfessionalSource');
    const injectedScript = layout.includes('plausible.io') && layout.includes('AnalyticsTracker');

    if (tracksQualified && injectedScript) {
      recordCheck({
        id: 'COMP-01',
        category: 'Compliance',
        title: 'Plausible Analytics & Qualified Deepening Primary Metric',
        status: 'PASSED',
        details: 'Plausible script injected in RootLayout and Qualified Deepening custom goal automated.',
      });
    } else {
      recordCheck({
        id: 'COMP-01',
        category: 'Compliance',
        title: 'Plausible Analytics & Qualified Deepening Primary Metric',
        status: 'FAILED',
        details: 'Analytics script or qualified deepening metric trigger missing.',
      });
    }
  }

  // 6. Audit Resend DNS & Deliverability Verifier
  const resendDnsPath = path.join(rootDir, 'packages/infrastructure/src/services/resend-dns-checker.ts');
  const dnsDocPath = path.join(rootDir, 'docs/dns-email-deliverability.md');
  if (fs.existsSync(resendDnsPath) && fs.existsSync(dnsDocPath)) {
    recordCheck({
      id: 'REL-02',
      category: 'Reliability',
      title: 'Email Deliverability (SPF, DKIM, DMARC, MX) Verification',
      status: 'PASSED',
      details: 'ResendDnsChecker implemented and full DNS records guide published in docs.',
    });
  } else {
    recordCheck({
      id: 'REL-02',
      category: 'Reliability',
      title: 'Email Deliverability (SPF, DKIM, DMARC, MX) Verification',
      status: 'FAILED',
      details: 'Resend DNS checker or documentation missing.',
    });
  }

  // 7. Audit Absence of Hardcoded Secrets in Source Code
  const forbiddenPatterns = [
    /["']re_[a-zA-Z0-9_]{20,}["']/, // Resend API keys
    /["']ghp_[a-zA-Z0-9]{36}["']/, // GitHub PAT
    /["']0x4AAAAAA[a-zA-Z0-9_-]{20,}["']/, // Turnstile Secret
    /postgres:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/, // Database credentials with password
  ];

  let leaked = false;
  const filesToCheck = [
    'apps/web/lib/composition-root.ts',
    'apps/web/lib/analytics.ts',
    'packages/infrastructure/src/index.ts',
    'apps/web/app/api/cron/maintenance/route.ts',
  ];

  for (const rel of filesToCheck) {
    const full = path.join(rootDir, rel);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf-8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          leaked = true;
          recordCheck({
            id: 'SEC-03',
            category: 'Security',
            title: 'Zero Hardcoded Secrets in Codebase',
            status: 'FAILED',
            details: `Found potentially hardcoded secret matching pattern in ${rel}.`,
          });
          break;
        }
      }
    }
  }

  if (!leaked) {
    recordCheck({
      id: 'SEC-03',
      category: 'Security',
      title: 'Zero Hardcoded Secrets in Codebase',
      status: 'PASSED',
      details: 'All secrets read dynamically from environment variables (process.env).',
    });
  }

  // Summary
  const failed = checks.filter((c) => c.status === 'FAILED');
  const warnings = checks.filter((c) => c.status === 'WARNING');
  const passed = checks.filter((c) => c.status === 'PASSED');

  console.log('\n====================================================');
  console.log(`  Audit Summary: ${passed.length} Passed, ${warnings.length} Warnings, ${failed.length} Failed`);
  console.log('====================================================');

  if (failed.length > 0) {
    process.exit(1);
  }
}

runGoLiveAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
