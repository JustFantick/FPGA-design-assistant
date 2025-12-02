import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIdentifier } from '@/lib/rateLimiter';

const API_PATHS = ['/api/analyze', '/api/generate-testbench'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!API_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const identifier = getClientIdentifier(request);
  const result = rateLimiter.checkLimit(identifier, pathname);

  if (!result.allowed) {
    const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: resetTimeSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetTimeSeconds.toString(),
          'X-RateLimit-Limit': process.env.RATE_LIMIT_MAX_REQUESTS || '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);

  response.headers.set('X-RateLimit-Limit', process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
