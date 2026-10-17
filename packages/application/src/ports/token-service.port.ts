import type { AdminUser, UUIDv7 } from '@davidev/domain';

export interface TokenPayload {
  userId: UUIDv7;
  email: string;
}

export interface GeneratedRefreshToken {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface TokenService {
  generateAccessToken(user: AdminUser): string;
  generateRefreshToken(userId: UUIDv7): GeneratedRefreshToken;
  verifyAccessToken(token: string): TokenPayload | null;
  hashToken(rawToken: string): string;
}
