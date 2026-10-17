import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateApp } from '../../../lib/composition-root';

async function handler(request: NextRequest): Promise<NextResponse> {
  const app = await getOrCreateApp();
  const url = new URL(request.url);

  const headers: Record<string, string> = {};
  request.headers.forEach((val, key) => {
    headers[key] = val;
  });

  let payload: string | undefined = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      payload = await request.text();
    } catch {
      // payload remains undefined
    }
  }

  const injectRes = await app.inject({
    method: request.method as any,
    url: url.pathname + url.search,
    headers,
    payload,
  });

  const resHeaders = new Headers();
  for (const [key, val] of Object.entries(injectRes.headers)) {
    if (val !== undefined) {
      if (Array.isArray(val)) {
        val.forEach((v) => resHeaders.append(key, v));
      } else {
        resHeaders.set(key, String(val));
      }
    }
  }

  if (!resHeaders.has('Content-Security-Policy')) {
    resHeaders.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  }

  if (!resHeaders.has('Strict-Transport-Security')) {
    resHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  if (!resHeaders.has('X-Content-Type-Options')) {
    resHeaders.set('X-Content-Type-Options', 'nosniff');
  }
  if (!resHeaders.has('X-Frame-Options')) {
    resHeaders.set('X-Frame-Options', 'DENY');
  }

  return new NextResponse(new Uint8Array(injectRes.rawPayload), {
    status: injectRes.statusCode,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
