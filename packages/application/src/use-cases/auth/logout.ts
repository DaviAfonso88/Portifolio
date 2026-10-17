import type { UseCase } from '../../types/use-case';
import type { RefreshTokenRepository } from '../../ports/refresh-token-repository.port';
import type { TokenService } from '../../ports/token-service.port';

export interface LogoutInput {
  rawRefreshToken?: string | null;
}

export interface LogoutOutput {
  success: true;
}

export class LogoutUseCase implements UseCase<LogoutInput, LogoutOutput> {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly tokenService: TokenService
  ) {}

  public async execute(input: LogoutInput): Promise<LogoutOutput> {
    if (input.rawRefreshToken) {
      const tokenHash = this.tokenService.hashToken(input.rawRefreshToken);
      const token = await this.refreshTokenRepo.findByTokenHash(tokenHash);
      if (token && !token.isRevoked()) {
        await this.refreshTokenRepo.revoke(token.id);
      }
    }

    return { success: true };
  }
}
