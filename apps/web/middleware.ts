import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['pt-BR', 'en'];
const DEFAULT_LOCALE = 'pt-BR';

/**
 * Builds the CSP header value with the given nonce.
 * In development, 'unsafe-eval' is added for React Fast Refresh / hot-reload.
 */
function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';

  // T06.03 & T08.04 — Strict CSP with nonce-based inline script/style allowlisting
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://plausible.io https://unpkg.com${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://unpkg.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https://challenges.cloudflare.com https://plausible.io${isDev ? ' ws://localhost:3000 ws://localhost:3001' : ''};
    frame-src 'self' https://challenges.cloudflare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;

  return cspHeader.replace(/\s{2,}/g, ' ').trim();
}

/** Applies security headers to a response object. */
function applySecurityHeaders(response: NextResponse, csp: string): void {
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, internal paths, and api
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Generate cryptographic nonce for CSP (T06.03)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeaderValue = buildCspHeader(nonce);

  // Admin routes: apply CSP & headers, allow proceeding
  if (pathname.startsWith('/admin')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeaderValue);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    applySecurityHeaders(response, cspHeaderValue);
    return response;
  }

  // Check if pathname starts with a supported locale
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeaderValue);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    applySecurityHeaders(response, cspHeaderValue);
    return response;
  }

  // Redirect root or non-localized route to default locale
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  const targetLocale =
    localeCookie && SUPPORTED_LOCALES.includes(localeCookie)
      ? localeCookie
      : DEFAULT_LOCALE;

  const redirectUrl = new URL(`/${targetLocale}${pathname === '/' ? '' : pathname}`, request.url);
  const response = NextResponse.redirect(redirectUrl);
  applySecurityHeaders(response, cspHeaderValue);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
