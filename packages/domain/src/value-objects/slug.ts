import type { Brand } from '../types/result';

export type Slug = Brand<string, 'Slug'>;

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_LENGTH = 160;

export class SlugValueObject {
  public static isValid(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    if (value.length < 1 || value.length > MAX_LENGTH) return false;
    return SLUG_REGEX.test(value);
  }

  public static create(value: string): Slug {
    const normalized = value.trim().toLowerCase();
    if (!this.isValid(normalized)) {
      throw new Error(
        `Invalid Slug: "${value}". Must be 1-160 lowercase characters matching pattern ^[a-z0-9]+(-[a-z0-9]+)*$`
      );
    }
    return normalized as Slug;
  }

  public static fromTitle(title: string): Slug {
    const slugified = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, MAX_LENGTH)
      .replace(/^-+|-+$/g, '');

    if (!slugified) {
      throw new Error(`Cannot generate slug from title: "${title}"`);
    }

    return slugified as Slug;
  }
}
