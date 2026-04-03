import { RateLimiter } from '@/lib/rateLimiter';

describe('RateLimiter.checkLimit', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    jest.useFakeTimers();
    limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 });
  });

  afterEach(() => {
    limiter.destroy();
    jest.useRealTimers();
  });

  it('allows the first request and returns correct remaining count', () => {
    const result = limiter.checkLimit('user1', '/api/analyze');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('decrements remaining on each subsequent request', () => {
    limiter.checkLimit('user1', '/api/analyze');
    const second = limiter.checkLimit('user1', '/api/analyze');
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it('allows the last request within the limit', () => {
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    const third = limiter.checkLimit('user1', '/api/analyze');
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it('blocks the request that exceeds the limit', () => {
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    const over = limiter.checkLimit('user1', '/api/analyze');
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it('tracks different identifiers independently', () => {
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    const user2 = limiter.checkLimit('user2', '/api/analyze');
    expect(user2.allowed).toBe(true);
    expect(user2.remaining).toBe(2);
  });

  it('tracks different endpoints independently for the same identifier', () => {
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    const other = limiter.checkLimit('user1', '/api/generate-testbench');
    expect(other.allowed).toBe(true);
  });

  it('resets the window after windowMs has elapsed', () => {
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');
    limiter.checkLimit('user1', '/api/analyze');

    jest.advanceTimersByTime(1001);

    const afterReset = limiter.checkLimit('user1', '/api/analyze');
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(2);
  });
});
