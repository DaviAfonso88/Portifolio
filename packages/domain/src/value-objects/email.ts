import type { Brand } from '../types/result';

export type Email = Brand<string, 'Email'>;

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const MAX_EMAIL_LENGTH = 254;

export class EmailValueObject {
  public static isValid(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    if (value.length > MAX_EMAIL_LENGTH) return false;
    return EMAIL_REGEX.test(value);
  }

  public static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!this.isValid(normalized)) {
      throw new Error(`Invalid Email address: "${value}"`);
    }
    return normalized as Email;
  }
}
