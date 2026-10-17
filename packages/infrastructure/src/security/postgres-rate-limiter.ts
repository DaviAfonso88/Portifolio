import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import type { RateLimiter } from '@davidev/application';
import type { DbClient } from '../db/client';
import { rateLimitCounters } from '../db/schema';

export interface PostgresRateLimiterOptions {
  salt?: string;
  scope?: string;
}

export class PostgresRateLimiter implements RateLimiter {
  private inMemoryStore = new Map<string, number>();
  private readonly salt: string;
  private readonly scope: string;

  constructor(
    private readonly db?: DbClient,
    options?: PostgresRateLimiterOptions
  ) {
    this.salt = options?.salt || process.env.RATE_LIMIT_SALT || 'davidev-rate-limit-salt';
    this.scope = options?.scope || 'default';
  }

  public async isAllowed(
    identifier: string,
    limit: number = 5,
    windowMs: number = 60 * 1000 // 1 minute default
  ): Promise<boolean> {
    const hits = await this.recordHit(identifier, windowMs);
    return hits <= limit;
  }

  public async recordHit(
    identifier: string,
    windowMs: number = 60 * 1000
  ): Promise<number> {
    const now = Date.now();
    const windowStartMs = Math.floor(now / windowMs) * windowMs;
    const windowStart = new Date(windowStartMs);

    // LGPD / GDPR: Never store raw IP address in database or memory.
    // Hash IP address with daily rotating date salt and system secret salt.
    const dateSalt = new Date().toISOString().slice(0, 10);
    const ipHash = createHash('sha256')
      .update(`${identifier}:${dateSalt}:${this.salt}`)
      .digest('hex')
      .slice(0, 32);

    const key = `${this.scope}:${ipHash}`;

    if (this.db) {
      try {
        const rows = await this.db
          .insert(rateLimitCounters)
          .values({
            key,
            windowStart,
            hits: 1,
          })
          .onConflictDoUpdate({
            target: [rateLimitCounters.key, rateLimitCounters.windowStart],
            set: { hits: sql`${rateLimitCounters.hits} + 1` },
          })
          .returning({ hits: rateLimitCounters.hits });

        if (rows.length > 0 && typeof rows[0].hits === 'number') {
          return rows[0].hits;
        }
      } catch (err) {
        console.warn('[PostgresRateLimiter] Database upsert failed, falling back to atomic in-memory store:', err);
      }
    }

    // Atomic in-memory fallback
    const memKey = `${key}:${windowStartMs}`;
    const current = (this.inMemoryStore.get(memKey) ?? 0) + 1;
    this.inMemoryStore.set(memKey, current);
    return current;
  }

  public clearMemory(): void {
    this.inMemoryStore.clear();
  }
}
