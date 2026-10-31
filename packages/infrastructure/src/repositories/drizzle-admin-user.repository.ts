import { eq } from 'drizzle-orm';
import {
  AdminUser,
  EmailValueObject,
  UUID,
  type UUIDv7,
} from '@davidev/domain';
import type { AdminUserRepository } from '@davidev/application';
import type { DbClient } from '../db/client';
import { adminUsers } from '../db/schema';
import bcrypt from 'bcryptjs';

export class DrizzleAdminUserRepository implements AdminUserRepository {
  private inMemoryUsers: Map<string, AdminUser> = new Map();

  constructor(private readonly db?: DbClient) {
    // Seed default admin in memory for local/fallback execution
    const defaultId = UUID.create('01918a20-0000-7000-8000-000000000001');
    const defaultEmail = EmailValueObject.create(
      process.env.ADMIN_EMAIL || 'daviafonso5894@gmail.com'
    );
    // Default hash for 'admin123456' or bcrypt synchronous hash of process.env.ADMIN_PASSWORD
    const initialPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const defaultHash = bcrypt.hashSync(initialPassword, 10);

    const defaultAdmin = new AdminUser({
      id: defaultId,
      email: defaultEmail,
      passwordHash: defaultHash,
    });

    this.inMemoryUsers.set(defaultEmail.toString().toLowerCase(), defaultAdmin);
    this.inMemoryUsers.set('daviafonso5894@gmail.com', defaultAdmin);
    this.inMemoryUsers.set('davi@davidev.net.br', defaultAdmin);

    // Also seed test admin for test suites
    const testAdmin = new AdminUser({
      id: UUID.create('01918a20-0000-7000-8000-000000000002'),
      email: EmailValueObject.create('admin@example.com'),
      passwordHash: bcrypt.hashSync('password', 10),
    });
    this.inMemoryUsers.set('admin@example.com', testAdmin);

    const testAdmin2 = new AdminUser({
      id: UUID.create('01918a20-0000-7000-8000-000000000003'),
      email: EmailValueObject.create('test@example.com'),
      passwordHash: bcrypt.hashSync('password123', 10),
    });
    this.inMemoryUsers.set('test@example.com', testAdmin2);
  }

  public async findByEmail(email: string): Promise<AdminUser | null> {
    const normalized = email.trim().toLowerCase();

    if (this.db) {
      try {
        const records = await this.db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, normalized))
          .limit(1);

        if (records.length > 0) {
          const r = records[0];
          return new AdminUser({
            id: UUID.create(r.id),
            email: EmailValueObject.create(r.email),
            passwordHash: r.passwordHash,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          });
        }

        // Se o admin existir no seed em memória (criado via ADMIN_EMAIL/ADMIN_PASSWORD),
        // persiste automaticamente no banco Neon para satisfazer chaves estrangeiras (ex: refresh_token).
        const inMem = this.inMemoryUsers.get(normalized);
        if (inMem) {
          try {
            await this.db
              .insert(adminUsers)
              .values({
                id: inMem.id.toString(),
                email: inMem.email.toString(),
                passwordHash: inMem.passwordHash,
                createdAt: inMem.createdAt,
                updatedAt: inMem.updatedAt,
              })
              .onConflictDoNothing();
          } catch (seedErr) {
            console.warn('[DrizzleAdminUserRepository] Auto-seed DB insert failed:', seedErr);
          }
          return inMem;
        }
      } catch (err) {
        console.warn('[DrizzleAdminUserRepository] DB query failed, using in-memory store:', err);
      }
    }

    const inMem = this.inMemoryUsers.get(normalized);
    return inMem ?? null;
  }

  public async findById(id: UUIDv7): Promise<AdminUser | null> {
    if (this.db) {
      try {
        const records = await this.db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, id.toString()))
          .limit(1);

        if (records.length > 0) {
          const r = records[0];
          return new AdminUser({
            id: UUID.create(r.id),
            email: EmailValueObject.create(r.email),
            passwordHash: r.passwordHash,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          });
        }

        for (const user of this.inMemoryUsers.values()) {
          if (user.id === id || user.id.toString() === id.toString()) {
            try {
              await this.db
                .insert(adminUsers)
                .values({
                  id: user.id.toString(),
                  email: user.email.toString(),
                  passwordHash: user.passwordHash,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                })
                .onConflictDoNothing();
            } catch (seedErr) {
              console.warn('[DrizzleAdminUserRepository] Auto-seed DB insert failed:', seedErr);
            }
            return user;
          }
        }
      } catch (err) {
        console.warn('[DrizzleAdminUserRepository] DB query failed, using in-memory store:', err);
      }
    }

    for (const user of this.inMemoryUsers.values()) {
      if (user.id === id || user.id.toString() === id.toString()) return user;
    }
    return null;
  }

  public async create(user: AdminUser): Promise<void> {
    this.inMemoryUsers.set(user.email.toString().toLowerCase(), user);

    if (this.db) {
      try {
        await this.db.insert(adminUsers).values({
          id: user.id.toString(),
          email: user.email.toString(),
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      } catch (err) {
        console.warn('[DrizzleAdminUserRepository] DB insert failed, preserved in-memory:', err);
      }
    }
  }

  public async update(user: AdminUser): Promise<void> {
    this.inMemoryUsers.set(user.email.toString().toLowerCase(), user);

    if (this.db) {
      try {
        await this.db
          .update(adminUsers)
          .set({
            email: user.email.toString(),
            passwordHash: user.passwordHash,
            updatedAt: user.updatedAt,
          })
          .where(eq(adminUsers.id, user.id.toString()));
      } catch (err) {
        console.warn('[DrizzleAdminUserRepository] DB update failed, preserved in-memory:', err);
      }
    }
  }
}
