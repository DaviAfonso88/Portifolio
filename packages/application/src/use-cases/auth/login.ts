import { EmailValueObject, RefreshToken, type UUIDv7 } from '@davidev/domain';
import type { UseCase } from '../../types/use-case';
import type { AdminUserRepository } from '../../ports/admin-user-repository.port';
import type { RefreshTokenRepository } from '../../ports/refresh-token-repository.port';
import type { PasswordHasher } from '../../ports/password-hasher.port';
import type { TokenService } from '../../ports/token-service.port';

export interface AdminLoginInput {
  email: string;
  password: string;
}

export type AdminLoginOutput =
  | {
      success: true;
      accessToken: string;
      rawRefreshToken: string;
      user: {
        id: UUIDv7;
        email: string;
      };
    }
  | {
      success: false;
      error: string;
      code: 'INVALID_CREDENTIALS';
    };

export class AdminLoginUseCase implements UseCase<AdminLoginInput, AdminLoginOutput> {
  constructor(
    private readonly adminUserRepo: AdminUserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  public async execute(input: AdminLoginInput): Promise<AdminLoginOutput> {
    const genericError: AdminLoginOutput = {
      success: false,
      error: 'Credenciais inválidas',
      code: 'INVALID_CREDENTIALS',
    };

    if (!input.email || !input.password) {
      return genericError;
    }

    if (!EmailValueObject.isValid(input.email)) {
      return genericError;
    }

    const normalizedEmail = EmailValueObject.create(input.email);
    const user = await this.adminUserRepo.findByEmail(normalizedEmail);

    if (!user) {
      return genericError;
    }

    const isValidPassword = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      return genericError;
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshTokenData = this.tokenService.generateRefreshToken(user.id);

    const refreshTokenEntity = new RefreshToken({
      adminUserId: user.id,
      tokenHash: refreshTokenData.tokenHash,
      expiresAt: refreshTokenData.expiresAt,
    });

    await this.refreshTokenRepo.create(refreshTokenEntity);

    return {
      success: true,
      accessToken,
      rawRefreshToken: refreshTokenData.rawToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
