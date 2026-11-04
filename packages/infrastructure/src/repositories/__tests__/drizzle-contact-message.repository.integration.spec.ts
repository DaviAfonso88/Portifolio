import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ContactMessage, EmailValueObject, PostLocale } from '@davidev/domain';
import type { DbClient } from '../../db/client';
import * as schema from '../../db/schema';
import { DrizzleContactMessageRepository } from '../drizzle-contact-message.repository';

const newMessage = (name: string, createdAt = new Date()) =>
  new ContactMessage({
    name,
    email: EmailValueObject.create('ana.silva@empresa.com'),
    message: 'Mensagem salva no banco durante o teste.',
    locale: PostLocale.PT_BR,
    createdAt,
  });

// Postgres real em processo, com as migrations do projeto.
describe('DrizzleContactMessageRepository on Postgres', () => {
  let client: PGlite;
  let db: DbClient;
  let repo: DrizzleContactMessageRepository;

  beforeAll(async () => {
    client = new PGlite();
    const pgliteDb = drizzle(client, { schema });
    await migrate(pgliteDb, {
      migrationsFolder: fileURLToPath(new URL('../../../migrations', import.meta.url)),
    });
    db = pgliteDb as unknown as DbClient;
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    await client.exec('DELETE FROM contact_message');
    repo = new DrizzleContactMessageRepository(db);
  });

  it('não mistura mensagens de exemplo com as do banco', async () => {
    const empty = await repo.list();
    expect(empty.total).toBe(0);
    expect(empty.messages).toEqual([]);

    const message = newMessage('Ana Silva');
    await repo.save(message);

    const { messages, total, unnotifiedCount } = await repo.list();
    expect(total).toBe(1);
    expect(unnotifiedCount).toBe(1);
    expect(messages[0].id).toBe(message.id);
    expect(await repo.findById(message.id)).not.toBeNull();
  });

  it('marca a notificação no banco', async () => {
    const message = newMessage('Bruno Lima');
    await repo.save(message);

    await repo.markEmailNotified(message.id);

    const found = await repo.findById(message.id);
    expect(found?.emailNotifiedAt).toBeInstanceOf(Date);
    expect((await repo.list({ unnotifiedOnly: true })).total).toBe(0);
  });

  it('expurga só o que passou da retenção', async () => {
    const old = newMessage('Antiga', new Date('2020-01-01T00:00:00Z'));
    const recent = newMessage('Recente');
    await repo.save(old);
    await repo.save(recent);

    expect(await repo.purgeOlderThan(new Date('2021-01-01T00:00:00Z'))).toBe(1);

    expect(await repo.findById(old.id)).toBeNull();
    expect(await repo.findById(recent.id)).not.toBeNull();
  });

  describe('com o banco fora do ar', () => {
    let brokenRepo: DrizzleContactMessageRepository;

    beforeEach(() => {
      const failure = () => {
        throw new Error('database unavailable');
      };
      brokenRepo = new DrizzleContactMessageRepository({
        insert: failure,
        select: failure,
        update: failure,
        delete: failure,
      } as unknown as DbClient);
    });

    it('propaga o erro ao salvar, em vez de responder sucesso', async () => {
      await expect(brokenRepo.save(newMessage('Ana'))).rejects.toThrow('database unavailable');
    });

    it('propaga o erro ao listar, em vez de mostrar mensagens de exemplo', async () => {
      await expect(brokenRepo.list()).rejects.toThrow('database unavailable');
    });

    it('propaga o erro ao expurgar, para o cron registrar a falha', async () => {
      await expect(brokenRepo.purgeOlderThan(new Date())).rejects.toThrow('database unavailable');
    });
  });
});
