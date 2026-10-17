export const PostLocale = {
  PT_BR: 'pt-BR',
  EN: 'en',
} as const;

export type PostLocale = (typeof PostLocale)[keyof typeof PostLocale];

export const DEFAULT_LOCALE: PostLocale = PostLocale.PT_BR;
export const SUPPORTED_LOCALES: readonly PostLocale[] = [PostLocale.PT_BR, PostLocale.EN];

export function isValidLocale(locale: string): locale is PostLocale {
  return SUPPORTED_LOCALES.includes(locale as PostLocale);
}
