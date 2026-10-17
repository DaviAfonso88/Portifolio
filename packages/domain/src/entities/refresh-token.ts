import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';

export interface RefreshTokenProps {
  id?: UUIDv7;
  adminUserId: UUIDv7;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt?: Date;
}

export class RefreshToken {
  public readonly id: UUIDv7;
  public readonly adminUserId: UUIDv7;
  public readonly tokenHash: string;
  public readonly expiresAt: Date;
  public revokedAt: Date | null;
  public readonly createdAt: Date;

  constructor(props: RefreshTokenProps) {
    this.id = props.id ?? UUID.generate();
    this.adminUserId = props.adminUserId;
    this.tokenHash = props.tokenHash;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  public isExpired(): boolean {
    return Date.now() > this.expiresAt.getTime();
  }

  public isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  public isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  public revoke(): void {
    if (!this.revokedAt) {
      this.revokedAt = new Date();
    }
  }
}
