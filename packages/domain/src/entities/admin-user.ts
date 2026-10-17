import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';
import { Email } from '../value-objects/email';

export interface AdminUserProps {
  id?: UUIDv7;
  email: Email;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AdminUser {
  public readonly id: UUIDv7;
  public email: Email;
  public passwordHash: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: AdminUserProps) {
    this.id = props.id ?? UUID.generate();
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }
}
