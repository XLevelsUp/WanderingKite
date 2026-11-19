import { NextRequest } from 'next/server';
import { isAllowedMediaUrl } from '@/lib/instagram-media';

// Same-origin relay for Instagram CDN files that send `Cross-Origin-Resource-Policy: same-origin` (the browser refuses to play those on our domain).

const PASS_HEADERS = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag'];

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('u') ?? '';
  if (!isAllowedMediaUrl(raw)) return new Response('Not allowed', { status: 400 });

  // Forward Range so video seeking/streaming works (browsers request byte ranges for <video>).
  const range = request.headers.get('range');
  const upstream = await fetch(raw, { headers: range ? { range } : {}, cache: 'no-store' }).catch(() => null);
  if (!upstream || (!upstream.ok && upstream.status !== 206)) return new Response('Upstream unavailable', { status: 502 });

  const headers = new Headers();
  PASS_HEADERS.forEach((h) => {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  });
  headers.set('cache-control', 'public, max-age=3600');
  return new Response(upstream.body, { status: upstream.status, headers });
}
