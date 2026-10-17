import { describe, it, expect, beforeEach } from 'vitest';
import {
  AdminUser,
  RefreshToken,
  EmailValueObject,
  UUID,
  type UUIDv7,
} from '@davidev/domain';
import {
  AdminLoginUseCase,
  RefreshSessionUseCase,
  LogoutUseCase,
  type AdminUserRepository,
  type RefreshTokenRepository,
  type PasswordHasher,
  type TokenService,
} from '../index';

class MockAdminUserRepo implements AdminUserRepository {
  public users: Map<string, AdminUser> = new Map();

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async findById(id: UUIDv7): Promise<AdminUser | null> {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  async create(user: AdminUser): Promise<void> {
    this.users.set(user.email.toString().toLowerCase(), user);
  }

  async update(user: AdminUser): Promise<void> {
    this.users.set(user.email.toString().toLowerCase(), user);
  }
}

class MockRefreshTokenRepo implements RefreshTokenRepository {
  public tokens: Map<string, RefreshToken> = new Map();

  async create(token: RefreshToken): Promise<void> {
    this.tokens.set(token.tokenHash, token);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.tokens.get(tokenHash) ?? null;
  }

  async revoke(id: UUIDv7): Promise<void> {
    for (const t of this.tokens.values()) {
      if (t.id === id) {
        t.revoke();
      }
    }
  }

  async revokeAllForUser(adminUserId: UUIDv7): Promise<void> {
    for (const t of this.tokens.values()) {
      if (t.adminUserId === adminUserId) {
        t.revoke();
      }
    }
  }
}

class MockHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    return `hashed_${plainText}`;
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return hash === `hashed_${plainText}`;
  }
}

class MockTokenService implements TokenService {
  private counter = 0;

  generateAccessToken(user: AdminUser): string {
    return `jwt_access_for_${user.email}`;
  }

  generateRefreshToken(userId: UUIDv7) {
    this.counter += 1;
    const raw = `raw_refresh_${this.counter}`;
    return {
      rawToken: raw,
      tokenHash: this.hashToken(raw),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  verifyAccessToken(token: string) {
    if (token.startsWith('jwt_access_for_')) {
      return {
        userId: UUID.create('01918a20-0000-7000-8000-000000000001'),
        email: 'davi@davidev.net.br',
      };
    }
    return null;
  }

  hashToken(rawToken: string): string {
    return `hash_of_${rawToken}`;
  }
}

describe('Auth Use Cases', () => {
  let userRepo: MockAdminUserRepo;
  let tokenRepo: MockRefreshTokenRepo;
  let hasher: MockHasher;
  let tokenService: MockTokenService;
  let testUser: AdminUser;

  beforeEach(() => {
    userRepo = new MockAdminUserRepo();
    tokenRepo = new MockRefreshTokenRepo();
    hasher = new MockHasher();
    tokenService = new MockTokenService();

    testUser = new AdminUser({
      id: UUID.create('01918a20-0000-7000-8000-000000000001'),
      email: EmailValueObject.create('davi@davidev.net.br'),
      passwordHash: 'hashed_correct_password',
    });
    userRepo.users.set('davi@davidev.net.br', testUser);
  });

  describe('AdminLoginUseCase', () => {
    it('authenticates valid credentials and generates tokens (AC-07.1, AC-07.2)', async () => {
      const login = new AdminLoginUseCase(userRepo, tokenRepo, hasher, tokenService);
      const result = await login.execute({
        email: 'davi@davidev.net.br',
        password: 'correct_password',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.accessToken).toBe('jwt_access_for_davi@davidev.net.br');
        expect(result.rawRefreshToken).toBe('raw_refresh_1');
        expect(result.user.email).toBe('davi@davidev.net.br');
        expect(tokenRepo.tokens.size).toBe(1);
      }
    });

    it('returns generic error on wrong password', async () => {
      const login = new AdminLoginUseCase(userRepo, tokenRepo, hasher, tokenService);
      const result = await login.execute({
        email: 'davi@davidev.net.br',
        password: 'wrong_password',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Credenciais inválidas');
      }
    });

    it('returns generic error on non-existent email', async () => {
      const login = new AdminLoginUseCase(userRepo, tokenRepo, hasher, tokenService);
      const result = await login.execute({
        email: 'unknown@davidev.net.br',
        password: 'any',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Credenciais inválidas');
      }
    });
  });

  describe('RefreshSessionUseCase', () => {
    it('rotates refresh token and issues new token pair (AC-07.3)', async () => {
      const login = new AdminLoginUseCase(userRepo, tokenRepo, hasher, tokenService);
      const loginRes = await login.execute({
        email: 'davi@davidev.net.br',
        password: 'correct_password',
      });

      expect(loginRes.success).toBe(true);
      if (!loginRes.success) return;

      const refresh = new RefreshSessionUseCase(userRepo, tokenRepo, tokenService);
      const refreshRes = await refresh.execute({
        rawRefreshToken: loginRes.rawRefreshToken,
      });

      expect(refreshRes.success).toBe(true);
      if (refreshRes.success) {
        expect(refreshRes.newRawRefreshToken).toBe('raw_refresh_2');
        expect(refreshRes.accessToken).toBeDefined();

        // Check that old token was revoked
        const oldHash = tokenService.hashToken(loginRes.rawRefreshToken);
        const oldToken = await tokenRepo.findByTokenHash(oldHash);
        expect(oldToken?.isRevoked()).toBe(true);
      }
    });

    it('detects revoked token reuse and revokes all user sessions (T06.04 preview)', async () => {
      const login = new AdminLoginUseCase(userRepo, tokenRepo, hasher, tokenService);
      const loginRes = await login.execute({
        email: 'davi@davidev.net.br',
        password: 'correct_password',
      });
      if (!loginRes.success) return;

      const refresh = new RefreshSessionUseCase(userRepo, tokenRepo, tokenService);
      // First refresh succeeds
      const refreshRes1 = await refresh.execute({
        rawRefreshToken: loginRes.rawRefreshToken,
      });
      expect(refreshRes1.success).toBe(true);

      // Reusing the first refresh token should fail and trigger revocation
      const reuseRes = await refresh.execute({
        rawRefreshToken: loginRes.rawRefreshToken,
      });
      expect(reuseRes.success).toBe(false);

      if (refreshRes1.success) {
        // Even the newly issued token was revoked as part of the family revocation
        const newHash = tokenService.hashToken(refreshRes1.newRawRefreshToken);
        const newToken = await tokenRepo.findByTokenHash(newHash);
        expect(newToken?.isRevoked()).toBe(true);
      }
    });

    it('rejects refresh when rawRefreshToken is empty or missing', async () => {
      const refresh = new RefreshSessionUseCase(userRepo, tokenRepo, tokenService);
      const res = await refresh.execute({ rawRefreshToken: '' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('INVALID_REFRESH_TOKEN');
      }
    });

    it('rejects refresh when token is not found in repository', async () => {
      const refresh = new RefreshSessionUseCase(userRepo, tokenRepo, tokenService);
      const res = await refresh.execute({ rawRefreshToken: 'non_existent_token' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('INVALID_REFRESH_TOKEN');
      }
    });

    it('rejects refresh when token is expired', async () => {
      const expiredToken = new RefreshToken({
        adminUserId: UUID.create('01918a20-0000-7000-8000-000000000001'),
        tokenHash: tokenService.hashToken('expired_raw_token'),
        expiresAt: new Date(Date.now() - 5000),
      });
      await tokenRepo.create(expiredToken);

      const refresh = new RefreshSessionUseCase(userRepo, tokenRepo, tokenService);
      const res = await refresh.execute({ rawRefreshToken: 'expired_raw_token' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('INVALID_REFRESH_TOKEN');
      }
    });

    it('rejects refresh if admin user no longer exists', async () => {
      const orphanedToken = new RefreshToken({
        adminUserId: UUID.generate(), // ID not in userRepo
        tokenHash: tokenService.hashToken('orphaned_raw_token'),
        expiresAt: new Date(Date.now() + 60000),
      });
      await tokenRepo.create(orphanedToken);

      const refresh = new RefreshSessionUseCase(userRepo, tokenRepo, tokenService);
      const res = await refresh.execute({ rawRefreshToken: 'orphaned_raw_token' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.code).toBe('USER_NOT_FOUND');
      }
    });
  });

  describe('LogoutUseCase', () => {
    it('revokes refresh token on logout (AC-07.4)', async () => {
      const login = new AdminLoginUseCase(userRepo, tokenRepo, hasher, tokenService);
      const loginRes = await login.execute({
        email: 'davi@davidev.net.br',
        password: 'correct_password',
      });
      if (!loginRes.success) return;

      const logout = new LogoutUseCase(tokenRepo, tokenService);
      await logout.execute({ rawRefreshToken: loginRes.rawRefreshToken });

      const hash = tokenService.hashToken(loginRes.rawRefreshToken);
      const token = await tokenRepo.findByTokenHash(hash);
      expect(token?.isRevoked()).toBe(true);
    });
  });
});
