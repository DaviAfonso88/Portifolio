import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { AdminUser, UUIDv7 } from '@davidev/domain';
import type {
  TokenService,
  TokenPayload,
  GeneratedRefreshToken,
} from '@davidev/application';

export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly accessExpiration: jwt.SignOptions['expiresIn'];
  private readonly refreshExpirationDays: number;

  constructor(
    secret = process.env.JWT_SECRET || 'davidev-insecure-default-secret-key-32chars',
    accessExpiration: jwt.SignOptions['expiresIn'] = '15m',
    refreshExpirationDays = 7
  ) {
    this.secret = secret;
    this.accessExpiration = accessExpiration;
    this.refreshExpirationDays = refreshExpirationDays;
  }

  public generateAccessToken(user: AdminUser): string {
    const payload = {
      userId: user.id,
      email: user.email,
      jti: crypto.randomUUID(),
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.accessExpiration,
      algorithm: 'HS256',
    });
  }

  public generateRefreshToken(userId: UUIDv7): GeneratedRefreshToken {
    const rawToken = jwt.sign(
      { jti: crypto.randomUUID(), sub: userId.toString(), type: 'refresh' },
      this.secret,
      { expiresIn: `${this.refreshExpirationDays}d`, algorithm: 'HS256' }
    );
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.refreshExpirationDays * 24 * 60 * 60 * 1000);

    return {
      rawToken,
      tokenHash,
      expiresAt,
    };
  }

  public verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as TokenPayload;

      if (!decoded.userId || !decoded.email) {
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  }

  public hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }
}
