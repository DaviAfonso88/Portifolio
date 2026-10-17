import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';
import { Email } from '../value-objects/email';
import { PostLocale } from '../enums/post-locale';

export interface ContactMessageProps {
  id?: UUIDv7;
  name: string;
  email: Email;
  subject?: string | null;
  message: string;
  locale: PostLocale;
  emailNotifiedAt?: Date | null;
  createdAt?: Date;
}

export class ContactMessage {
  public readonly id: UUIDv7;
  public readonly name: string;
  public readonly email: Email;
  public readonly subject: string | null;
  public readonly message: string;
  public readonly locale: PostLocale;
  public emailNotifiedAt: Date | null;
  public readonly createdAt: Date;

  constructor(props: ContactMessageProps) {
    if (!props.name || props.name.trim().length > 120) {
      throw new Error('Name must be between 1 and 120 characters.');
    }
    if (!props.message || props.message.trim().length < 10 || props.message.trim().length > 5000) {
      throw new Error('Message must be between 10 and 5000 characters.');
    }

    this.id = props.id ?? UUID.generate();
    this.name = props.name.trim();
    this.email = props.email;
    this.subject = props.subject?.trim() ?? null;
    this.message = props.message.trim();
    this.locale = props.locale;
    this.emailNotifiedAt = props.emailNotifiedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  public markAsNotified(): void {
    this.emailNotifiedAt = new Date();
  }

  public isNotified(): boolean {
    return this.emailNotifiedAt !== null;
  }
}

