import type { CaptchaVerificationService } from '@davidev/application';

export class TurnstileCaptchaService implements CaptchaVerificationService {
  constructor(private readonly secretKey?: string) {}

  public async verify(token: string, remoteIp?: string): Promise<boolean> {
    const secret = this.secretKey || process.env.TURNSTILE_SECRET_KEY;

    // In local development or testing without a configured secret, allow testing tokens
    if (!secret || secret === 'dummy-secret-key') {
      if (process.env.NODE_ENV === 'test' || token === 'valid-token' || token === 'dummy-token') {
        return true;
      }
      if (!secret) {
        console.warn('[TurnstileCaptchaService] No TURNSTILE_SECRET_KEY provided. Allowing in dev.');
        return true;
      }
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', secret);
      formData.append('response', token);
      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        console.error(`[TurnstileCaptchaService] HTTP status ${res.status} from Cloudflare.`);
        return false;
      }

      const data = (await res.json()) as { success: boolean };
      return data.success === true;
    } catch (error) {
      console.error('[TurnstileCaptchaService] Error verifying Turnstile token:', error);
      return false;
    }
  }
}
