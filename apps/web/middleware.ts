import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['pt-BR', 'en'];
const DEFAULT_LOCALE = 'pt-BR';

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

  // CSP policy per T06.03 & T08.04 (Strict CSP without unsafe-inline)
  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' https://challenges.cloudflare.com https://plausible.io https://unpkg.com`,
    `style-src 'self' https://fonts.googleapis.com https://unpkg.com`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `connect-src 'self' https://challenges.cloudflare.com https://plausible.io`,
    `frame-src 'self' https://challenges.cloudflare.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  // Admin routes: apply CSP & headers, allow proceeding
  if (pathname.startsWith('/admin')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('content-security-policy', cspHeader);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }


  // Check if pathname starts with a supported locale
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('content-security-policy', cspHeader);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
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
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;

}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
