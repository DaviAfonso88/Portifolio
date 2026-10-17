import { RefreshToken, type UUIDv7 } from '@davidev/domain';
import type { UseCase } from '../../types/use-case';
import type { AdminUserRepository } from '../../ports/admin-user-repository.port';
import type { RefreshTokenRepository } from '../../ports/refresh-token-repository.port';
import type { TokenService } from '../../ports/token-service.port';

export interface RefreshSessionInput {
  rawRefreshToken: string;
}

export type RefreshSessionOutput =
  | {
      success: true;
      accessToken: string;
      newRawRefreshToken: string;
      user: {
        id: UUIDv7;
        email: string;
      };
    }
  | {
      success: false;
      error: string;
      code: 'INVALID_REFRESH_TOKEN' | 'USER_NOT_FOUND';
    };

export class RefreshSessionUseCase implements UseCase<RefreshSessionInput, RefreshSessionOutput> {
  constructor(
    private readonly adminUserRepo: AdminUserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly tokenService: TokenService
  ) {}

  public async execute(input: RefreshSessionInput): Promise<RefreshSessionOutput> {
    if (!input.rawRefreshToken) {
      return {
        success: false,
        error: 'Refresh token não fornecido.',
        code: 'INVALID_REFRESH_TOKEN',
      };
    }

    const tokenHash = this.tokenService.hashToken(input.rawRefreshToken);
    const existingToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!existingToken) {
      return {
        success: false,
        error: 'Sessão inválida ou expirada.',
        code: 'INVALID_REFRESH_TOKEN',
      };
    }

    // Reuse detection: if token is already revoked, invalidate all sessions of the user
    if (existingToken.isRevoked()) {
      await this.refreshTokenRepo.revokeAllForUser(existingToken.adminUserId);
      return {
        success: false,
        error: 'Tentativa de reuso de token revogado. Sessão encerrada.',
        code: 'INVALID_REFRESH_TOKEN',
      };
    }

    if (existingToken.isExpired()) {
      return {
        success: false,
        error: 'Sessão expirada. Faça login novamente.',
        code: 'INVALID_REFRESH_TOKEN',
      };
    }

    const user = await this.adminUserRepo.findById(existingToken.adminUserId);
    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado.',
        code: 'USER_NOT_FOUND',
      };
    }

    // Revoke current refresh token (rotation)
    await this.refreshTokenRepo.revoke(existingToken.id);

    // Issue new pair
    const accessToken = this.tokenService.generateAccessToken(user);
    const newRefreshTokenData = this.tokenService.generateRefreshToken(user.id);

    const newRefreshTokenEntity = new RefreshToken({
      adminUserId: user.id,
      tokenHash: newRefreshTokenData.tokenHash,
      expiresAt: newRefreshTokenData.expiresAt,
    });

    await this.refreshTokenRepo.create(newRefreshTokenEntity);

    return {
      success: true,
      accessToken,
      newRawRefreshToken: newRefreshTokenData.rawToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
