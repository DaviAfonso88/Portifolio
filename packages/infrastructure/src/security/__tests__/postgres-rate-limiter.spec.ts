import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostgresRateLimiter } from '../postgres-rate-limiter';
import type { DbClient } from '../../db/client';

describe('PostgresRateLimiter (T06.01, T06.02)', () => {
  let rateLimiter: PostgresRateLimiter;

  beforeEach(() => {
    rateLimiter = new PostgresRateLimiter(undefined, {
      salt: 'test-salt-secret',
      scope: 'test-scope',
    });
  });

  it('allows request within limit and blocks when exceeded', async () => {
    const ip = '192.168.1.100';
    const limit = 3;
    const windowMs = 1000;

    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(true); // hit 1
    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(true); // hit 2
    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(true); // hit 3
    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(false); // hit 4 (exceeded)
  });

  it('resets counter when window expires', async () => {
    const ip = '192.168.1.101';
    const limit = 2;
    const windowMs = 50;

    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(true);
    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(true);
    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    // Next window: should be allowed again
    expect(await rateLimiter.isAllowed(ip, limit, windowMs)).toBe(true);
  });

  it('maintains independent counts for different IP addresses', async () => {
    const ipA = '10.0.0.1';
    const ipB = '10.0.0.2';
    const limit = 2;

    expect(await rateLimiter.isAllowed(ipA, limit)).toBe(true);
    expect(await rateLimiter.isAllowed(ipA, limit)).toBe(true);
    expect(await rateLimiter.isAllowed(ipA, limit)).toBe(false);

    // ipB has its own independent counter
    expect(await rateLimiter.isAllowed(ipB, limit)).toBe(true);
    expect(await rateLimiter.isAllowed(ipB, limit)).toBe(true);
    expect(await rateLimiter.isAllowed(ipB, limit)).toBe(false);
  });

  it('handles high concurrency without race conditions (T06.02 DoD)', async () => {
    const ip = '203.0.113.195';
    const limit = 10;
    const totalRequests = 50;
    const windowMs = 60000;

    // Fire 50 simultaneous parallel requests
    const results = await Promise.all(
      Array.from({ length: totalRequests }, () =>
        rateLimiter.isAllowed(ip, limit, windowMs)
      )
    );

    const allowed = results.filter((res) => res === true).length;
    const blocked = results.filter((res) => res === false).length;

    // Must block at exact threshold: 10 allowed, 40 blocked
    expect(allowed).toBe(10);
    expect(blocked).toBe(40);
    expect(allowed + blocked).toBe(totalRequests);
  });

  it('invokes database atomic upsert when db client is provided', async () => {
    let mockHits = 0;
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockImplementation(async () => {
              mockHits += 1;
              return [{ hits: mockHits }];
            }),
          }),
        }),
      }),
    } as unknown as DbClient;

    const dbLimiter = new PostgresRateLimiter(mockDb, {
      salt: 'db-test-salt',
      scope: 'contact',
    });

    const isAllowed1 = await dbLimiter.isAllowed('198.51.100.42', 2, 60000);
    const isAllowed2 = await dbLimiter.isAllowed('198.51.100.42', 2, 60000);
    const isAllowed3 = await dbLimiter.isAllowed('198.51.100.42', 2, 60000);

    expect(isAllowed1).toBe(true); // hit 1
    expect(isAllowed2).toBe(true); // hit 2
    expect(isAllowed3).toBe(false); // hit 3 (limit was 2)
    expect(mockDb.insert).toHaveBeenCalledTimes(3);
  });
});
