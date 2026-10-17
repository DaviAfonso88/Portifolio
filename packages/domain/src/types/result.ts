declare const __brand: unique symbol;

/**
 * Nominal / Branded Type Utility
 * Ensures compile-time distinction between primitive types like IDs, Slugs, and Emails.
 */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function fail<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}
