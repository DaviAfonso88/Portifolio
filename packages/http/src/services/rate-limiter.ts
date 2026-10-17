import { createHash } from 'node:crypto';

import type { RateLimiter } from '@davidev/application';

export type { RateLimiter };

export class InMemoryRateLimiter implements RateLimiter {
  private records = new Map<string, { count: number; expiresAt: number }>();

  public async isAllowed(
    identifier: string,
    limit: number = 3,
    windowMs: number = 60 * 60 * 1000 // 1 hour default
  ): Promise<boolean> {
    // Hash IP address with daily salt to protect user privacy per LGPD/GDPR
    const dateSalt = new Date().toISOString().slice(0, 10);
    const hash = createHash('sha256')
      .update(`${identifier}:${dateSalt}`)
      .digest('hex')
      .slice(0, 32);

    const now = Date.now();
    const existing = this.records.get(hash);

    if (!existing || now > existing.expiresAt) {
      this.records.set(hash, { count: 1, expiresAt: now + windowMs });
      return true;
    }

    if (existing.count >= limit) {
      return false;
    }

    existing.count += 1;
    return true;
  }
}
