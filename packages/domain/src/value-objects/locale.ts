import { DEFAULT_LOCALE, PostLocale, SUPPORTED_LOCALES, isValidLocale } from '../enums/post-locale';

export class LocaleValueObject {
  public readonly value: PostLocale;

  private constructor(value: PostLocale) {
    this.value = value;
  }

  public static create(value: string = DEFAULT_LOCALE): LocaleValueObject {
    if (!isValidLocale(value)) {
      throw new Error(
        `Invalid Locale: "${value}". Supported locales are: ${SUPPORTED_LOCALES.join(', ')}`
      );
    }
    return new LocaleValueObject(value);
  }

  public isDefault(): boolean {
    return this.value === DEFAULT_LOCALE;
  }

  public toString(): string {
    return this.value;
  }
}
