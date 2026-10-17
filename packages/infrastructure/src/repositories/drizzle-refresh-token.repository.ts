import { eq, and } from 'drizzle-orm';
import { RefreshToken, UUID, type UUIDv7 } from '@davidev/domain';
import type { RefreshTokenRepository } from '@davidev/application';
import type { DbClient } from '../db/client';
import { refreshTokens } from '../db/schema';

export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  private inMemoryTokens: Map<string, RefreshToken> = new Map();

  constructor(private readonly db?: DbClient) {}

  public async create(token: RefreshToken): Promise<void> {
    this.inMemoryTokens.set(token.tokenHash, token);

    if (this.db) {
      try {
        await this.db.insert(refreshTokens).values({
          id: token.id.toString(),
          adminUserId: token.adminUserId.toString(),
          tokenHash: token.tokenHash,
          expiresAt: token.expiresAt,
          revokedAt: token.revokedAt,
          createdAt: token.createdAt,
        });
      } catch (err) {
        console.warn('[DrizzleRefreshTokenRepository] DB insert failed, preserved in-memory:', err);
      }
    }
  }

  public async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    if (this.db) {
      try {
        const records = await this.db
          .select()
          .from(refreshTokens)
          .where(eq(refreshTokens.tokenHash, tokenHash))
          .limit(1);

        if (records.length > 0) {
          const r = records[0];
          return new RefreshToken({
            id: UUID.create(r.id),
            adminUserId: UUID.create(r.adminUserId),
            tokenHash: r.tokenHash,
            expiresAt: r.expiresAt,
            revokedAt: r.revokedAt,
            createdAt: r.createdAt,
          });
        }
      } catch (err) {
        console.warn('[DrizzleRefreshTokenRepository] DB query failed, using in-memory store:', err);
      }
    }

    const inMem = this.inMemoryTokens.get(tokenHash);
    return inMem ?? null;
  }

  public async revoke(id: UUIDv7): Promise<void> {
    const now = new Date();

    for (const token of this.inMemoryTokens.values()) {
      if (token.id === id) {
        token.revoke();
      }
    }

    if (this.db) {
      try {
        await this.db
          .update(refreshTokens)
          .set({ revokedAt: now })
          .where(eq(refreshTokens.id, id.toString()));
      } catch (err) {
        console.warn('[DrizzleRefreshTokenRepository] DB update failed:', err);
      }
    }
  }

  public async revokeAllForUser(adminUserId: UUIDv7): Promise<void> {
    const now = new Date();

    for (const token of this.inMemoryTokens.values()) {
      if (token.adminUserId === adminUserId) {
        token.revoke();
      }
    }

    if (this.db) {
      try {
        await this.db
          .update(refreshTokens)
          .set({ revokedAt: now })
          .where(eq(refreshTokens.adminUserId, adminUserId.toString()));
      } catch (err) {
        console.warn('[DrizzleRefreshTokenRepository] DB update failed:', err);
      }
    }
  }
}
