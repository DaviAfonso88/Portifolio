import type { DomainEvent } from './domain-event';
import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';
import type { PostLocale } from '../enums/post-locale';
import type { Email } from '../value-objects/email';

export class ContactMessageReceivedEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'ContactMessageReceived';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly name: string,
    public readonly email: Email,
    public readonly locale: PostLocale
  ) {}
}
