import type { ContactMessage, UUIDv7 } from '@davidev/domain';

export interface ListContactMessagesParams {
  unnotifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ListContactMessagesResult {
  messages: ContactMessage[];
  total: number;
  unnotifiedCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContactMessageRepository {
  save(message: ContactMessage): Promise<void>;
  findById(id: UUIDv7): Promise<ContactMessage | null>;
  markEmailNotified(id: UUIDv7): Promise<void>;
  list(params?: ListContactMessagesParams): Promise<ListContactMessagesResult>;
  purgeOlderThan(cutoffDate: Date): Promise<number>;
}

