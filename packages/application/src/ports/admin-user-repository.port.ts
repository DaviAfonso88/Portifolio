import type { AdminUser, UUIDv7 } from '@davidev/domain';

export interface AdminUserRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
  findById(id: UUIDv7): Promise<AdminUser | null>;
  create(user: AdminUser): Promise<void>;
  update(user: AdminUser): Promise<void>;
}
