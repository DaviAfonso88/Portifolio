import type { UUIDv7 } from '../value-objects/uuid-v7';

export interface DomainEvent {
  readonly eventId: UUIDv7;
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}
