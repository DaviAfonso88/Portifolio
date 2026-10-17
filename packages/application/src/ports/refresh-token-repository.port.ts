import type { RefreshToken, UUIDv7 } from '@davidev/domain';

export interface RefreshTokenRepository {
  create(token: RefreshToken): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: UUIDv7): Promise<void>;
  revokeAllForUser(adminUserId: UUIDv7): Promise<void>;
}
