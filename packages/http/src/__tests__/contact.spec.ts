import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app';
import type { SubmitContactMessageUseCase } from '@davidev/application';
import { ok, fail } from '@davidev/domain';

describe('POST /api/v1/contact', () => {
  const createMockUseCase = (success: boolean = true) => {
    return {
      execute: vi.fn(async () =>
        success ? ok({ id: '01a141ee-a22d-7a78-a24d-66b4f4fefe8f' }) : fail('CAPTCHA_VERIFICATION_FAILED')
      ),
    } as unknown as SubmitContactMessageUseCase;
  };

  it('returns 201 Created when payload is valid and captcha passes', async () => {
    const useCase = createMockUseCase(true);
    const app = await buildApp({ submitContactUseCase: useCase });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contact',
      payload: {
        name: 'Rafael Lima',
        email: 'rafael@example.com',
        subject: 'Conversa sobre arquitetura',
        message: 'Gostei muito do design editorial e da separação de camadas.',
        locale: 'pt-BR',
        captchaToken: 'valid-token',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.id).toBe('01a141ee-a22d-7a78-a24d-66b4f4fefe8f');
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('returns 400 Bad Request when validation fails (invalid email)', async () => {
    const useCase = createMockUseCase(true);
    const app = await buildApp({ submitContactUseCase: useCase });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contact',
      payload: {
        name: 'Rafael',
        email: 'not-an-email',
        message: 'Mensagem com tamanho suficiente para passar na validação de tamanho.',
        captchaToken: 'token',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.message).toBeDefined();
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('enforces rate limit of 3 requests per hour per IP (returns 429)', async () => {
    const useCase = createMockUseCase(true);
    const app = await buildApp({ submitContactUseCase: useCase });

    const validPayload = {
      name: 'Rafael',
      email: 'rafael@example.com',
      message: 'Mensagem para teste de rate limiting com tamanho válido.',
      captchaToken: 'valid-token',
    };

    // Requests 1, 2, 3 should succeed
    const res1 = await app.inject({ method: 'POST', url: '/api/v1/contact', payload: validPayload });
    const res2 = await app.inject({ method: 'POST', url: '/api/v1/contact', payload: validPayload });
    const res3 = await app.inject({ method: 'POST', url: '/api/v1/contact', payload: validPayload });

    expect(res1.statusCode).toBe(201);
    expect(res2.statusCode).toBe(201);
    expect(res3.statusCode).toBe(201);

    // Request 4 from same IP should be blocked with 429
    const res4 = await app.inject({ method: 'POST', url: '/api/v1/contact', payload: validPayload });
    expect(res4.statusCode).toBe(429);
    const body4 = res4.json();
    expect(body4.error).toBe('RATE_LIMIT_EXCEEDED');
  });
});
