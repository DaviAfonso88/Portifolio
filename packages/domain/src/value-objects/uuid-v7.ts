import type { Brand } from '../types/result';

export type UUIDv7 = Brand<string, 'UUIDv7'>;

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Pure TypeScript UUIDv7 generator and validator with ZERO external dependencies (DEP-1).
 * Compliant with RFC 9562 (UUIDv7 based on Unix epoch millisecond timestamp).
 */
export class UUID {
  public static generate(): UUIDv7 {
    const timestamp = Date.now();
    const randomBytes = new Uint8Array(10);
    
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < randomBytes.length; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }

    // Timestamp 48 bits (6 bytes)
    const timeHex = timestamp.toString(16).padStart(12, '0');
    const p1 = timeHex.slice(0, 8);
    const p2 = timeHex.slice(8, 12);

    // Version 7: 0x7000 | (12 bits from randomBytes[0..1])
    const ver7 = ((7 << 12) | ((randomBytes[0] << 8 | randomBytes[1]) & 0x0fff))
      .toString(16)
      .padStart(4, '0');

    // Variant 2 (RFC 4122): 0x8000 | (14 bits from randomBytes[2..3])
    const varRFC = ((0x8000) | ((randomBytes[2] << 8 | randomBytes[3]) & 0x3fff))
      .toString(16)
      .padStart(4, '0');

    // Remaining 48 bits (6 bytes from randomBytes[4..9])
    let p5 = '';
    for (let i = 4; i < 10; i++) {
      p5 += randomBytes[i].toString(16).padStart(2, '0');
    }

    return `${p1}-${p2}-${ver7}-${varRFC}-${p5}`.toLowerCase() as UUIDv7;
  }

  public static isValid(value: string): value is UUIDv7 {
    return UUID_V7_REGEX.test(value);
  }

  public static create(value: string): UUIDv7 {
    // UUID.isValid, não this.isValid: create é passado solto em callbacks como .map(UUID.create).
    if (!UUID.isValid(value)) {
      throw new Error(`Invalid UUIDv7: "${value}"`);
    }
    return value.toLowerCase() as UUIDv7;
  }
}
