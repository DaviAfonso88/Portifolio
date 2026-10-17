export interface RateLimiter {
  isAllowed(identifier: string, limit?: number, windowMs?: number): Promise<boolean>;
}
