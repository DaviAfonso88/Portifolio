import { eq, desc, isNull, and, lt } from 'drizzle-orm';

import {
  ContactMessage,
  EmailValueObject,
  PostLocale,
  UUID,
  type UUIDv7,
} from '@davidev/domain';
import type {
  ContactMessageRepository,
  ListContactMessagesParams,
  ListContactMessagesResult,
} from '@davidev/application';
import type { DbClient } from '../db/client';
import { contactMessages } from '../db/schema';

// Seed messages matching design/AdminMensagens.dc.html
const SEED_MESSAGES: ContactMessage[] = [
  new ContactMessage({
    id: UUID.create('01918a20-0001-7000-8000-000000000010'),
    name: 'Rafael Lima',
    email: EmailValueObject.create('rafael.lima@empresa.com.br'),
    subject: 'Vaga de backend sênior',
    message: 'Vi o artigo sobre rate limiting em serverless e o case dos robôs. Temos uma oportunidade remota para atuar com arquitetura distribuída e gostaríamos de conversar.',
    locale: PostLocale.PT_BR,
    emailNotifiedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    createdAt: new Date(Date.now() - 3600000 * 2),
  }),
  new ContactMessage({
    id: UUID.create('01918a20-0002-7000-8000-000000000020'),
    name: 'Camila Duarte',
    email: EmailValueObject.create('camila.duarte@techrecruiting.io'),
    subject: 'Sem assunto',
    message: 'Olá! Trabalho com recrutamento técnico internacional e gostaria de entender se você tem interesse em posições no exterior focadas em TypeScript e Next.js.',
    locale: PostLocale.PT_BR,
    emailNotifiedAt: new Date(Date.now() - 86400000), // yesterday
    createdAt: new Date(Date.now() - 86400000),
  }),
  new ContactMessage({
    id: UUID.create('01918a20-0003-7000-8000-000000000030'),
    name: 'Marcos Vieira',
    email: EmailValueObject.create('marcos.vieira@industria.com'),
    subject: 'Projeto de automação — orçamento',
    message: 'Preciso de um robô para consolidar dados de fornecedores e emitir relatórios semanais. Qual a estimativa de prazo para um escopo similar ao case apresentado?',
    locale: PostLocale.PT_BR,
    emailNotifiedAt: null, // NOT NOTIFIED per design
    createdAt: new Date(Date.now() - 86400000 * 3),
  }),
];

function toContactMessage(row: typeof contactMessages.$inferSelect): ContactMessage {
  return new ContactMessage({
    id: UUID.create(row.id),
    name: row.name,
    email: EmailValueObject.create(row.email),
    subject: row.subject,
    message: row.message,
    locale: row.locale as PostLocale,
    emailNotifiedAt: row.emailNotifiedAt,
    createdAt: row.createdAt,
  });
}

/**
 * Com banco, os erros chegam a quem chamou: uma mensagem não salva não pode virar sucesso para o
 * visitante, nem o painel pode trocar a lista real por dados de exemplo.
 * A memória e as mensagens de exemplo só existem sem banco, em desenvolvimento e testes.
 */
export class DrizzleContactMessageRepository implements ContactMessageRepository {
  private inMemoryMessages: ContactMessage[] = [...SEED_MESSAGES];

  constructor(private readonly db?: DbClient) {}

  public async save(message: ContactMessage): Promise<void> {
    if (!this.db) {
      this.inMemoryMessages.unshift(message);
      return;
    }

    await this.db.insert(contactMessages).values({
      id: message.id.toString(),
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      locale: message.locale,
      emailNotifiedAt: message.emailNotifiedAt,
      createdAt: message.createdAt,
    });
  }

  public async findById(id: UUIDv7): Promise<ContactMessage | null> {
    if (!this.db) {
      return this.inMemoryMessages.find((m) => m.id === id) ?? null;
    }

    const [row] = await this.db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id.toString()))
      .limit(1);

    return row ? toContactMessage(row) : null;
  }

  public async markEmailNotified(id: UUIDv7): Promise<void> {
    if (!this.db) {
      const mem = this.inMemoryMessages.find((m) => m.id === id);
      if (mem) {
        mem.emailNotifiedAt = new Date();
      }
      return;
    }

    await this.db
      .update(contactMessages)
      .set({ emailNotifiedAt: new Date() })
      .where(eq(contactMessages.id, id.toString()));
  }

  public async list(
    params: ListContactMessagesParams = {}
  ): Promise<ListContactMessagesResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;

    if (this.db) {
      let query = this.db.select().from(contactMessages);
      if (params.unnotifiedOnly) {
        query = query.where(isNull(contactMessages.emailNotifiedAt)) as any;
      }

      const rows = await query.orderBy(desc(contactMessages.createdAt));
      const allRows = await this.db.select().from(contactMessages);
      const unnotifiedCount = allRows.filter((r) => r.emailNotifiedAt === null).length;

      const total = rows.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginatedRows = rows.slice((page - 1) * limit, page * limit);

      return {
        messages: paginatedRows.map(toContactMessage),
        total,
        unnotifiedCount,
        page,
        limit,
        totalPages,
      };
    }

    let filtered = [...this.inMemoryMessages];
    if (params.unnotifiedOnly) {
      filtered = filtered.filter((m) => m.emailNotifiedAt === null);
    }

    const unnotifiedCount = this.inMemoryMessages.filter((m) => m.emailNotifiedAt === null).length;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      messages: paginated,
      total,
      unnotifiedCount,
      page,
      limit,
      totalPages,
    };
  }

  public async purgeOlderThan(cutoffDate: Date): Promise<number> {
    if (!this.db) {
      const initialLen = this.inMemoryMessages.length;
      this.inMemoryMessages = this.inMemoryMessages.filter((m) => m.createdAt >= cutoffDate);
      return initialLen - this.inMemoryMessages.length;
    }

    const deleted = await this.db
      .delete(contactMessages)
      .where(lt(contactMessages.createdAt, cutoffDate))
      .returning({ id: contactMessages.id });
    return deleted.length;
  }
}

