import type { DomainEvent } from './domain-event';
import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';
import type { PostLocale } from '../enums/post-locale';
import type { Slug } from '../value-objects/slug';

export class PostPublishedEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'PostPublished';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly locale: PostLocale,
    public readonly slug: Slug,
    public readonly publishedAt: Date
  ) {}
}

export class PostContentUpdatedEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'PostContentUpdated';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly locale: PostLocale,
    public readonly versionNumber: number,
    public readonly contentHash: string
  ) {}
}

export class PostUnpublishedEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'PostUnpublished';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly locale: PostLocale,
    public readonly slug: Slug
  ) {}
}

export class PostMovedToTrashEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'PostMovedToTrash';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly locale: PostLocale
  ) {}
}

export class PostRestoredEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'PostRestored';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly locale: PostLocale,
    public readonly restoredStatus: string
  ) {}
}

export class PostPermanentlyDeletedEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'PostPermanentlyDeleted';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly locale: PostLocale
  ) {}
}

export class PostSlugChangedEvent implements DomainEvent {
  public readonly eventId: UUIDv7 = UUID.generate();
  public readonly eventName = 'PostSlugChanged';
  public readonly occurredAt: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly locale: PostLocale,
    public readonly previousSlug: Slug,
    public readonly newSlug: Slug
  ) {}
}
