import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app';
import type {
  AdminLoginUseCase,
  RefreshSessionUseCase,
  LogoutUseCase,
} from '@davidev/application';
import { JwtTokenService } from '../services/jwt-token';
import { UUID } from '@davidev/domain';

describe('Fastify Auth Routes (T04.01)', () => {
  const tokenService = new JwtTokenService('test-secret-key-at-least-32-chars-long');

  it('POST /api/v1/auth/login retorna 200, emite accessToken e cookie HttpOnly (AC-07.1, AC-07.2)', async () => {
    const adminLoginUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        accessToken: 'jwt-access-token-mock',
        rawRefreshToken: 'raw-refresh-token-mock',
        user: {
          id: '01918a20-0000-7000-8000-000000000001',
          email: 'davi@davidev.net.br',
        },
      }),
    } as unknown as AdminLoginUseCase;

    const app = await buildApp({
      adminLoginUseCase,
      tokenService,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'davi@davidev.net.br',
        password: 'correct_password',
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json.success).toBe(true);
    expect(json.accessToken).toBe('jwt-access-token-mock');
    expect(json.user.email).toBe('davi@davidev.net.br');

    // Verify Set-Cookie header contains refresh_token with HttpOnly and SameSite=Strict
    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('refresh_token=raw-refresh-token-mock');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Strict');
  });

  it('POST /api/v1/auth/login com credenciais inválidas retorna 401', async () => {
    const adminLoginUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: false,
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS',
      }),
    } as unknown as AdminLoginUseCase;

    const app = await buildApp({
      adminLoginUseCase,
      tokenService,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'davi@davidev.net.br',
        password: 'wrong_password',
      },
    });

    expect(response.statusCode).toBe(401);
    const json = JSON.parse(response.payload);
    expect(json.message).toBe('Credenciais inválidas');
  });

  it('POST /api/v1/auth/refresh rotaciona o token e emite novo par (AC-07.3)', async () => {
    const refreshSessionUseCase = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        accessToken: 'new-jwt-access-token',
        newRawRefreshToken: 'new-raw-refresh-token',
        user: {
          id: '01918a20-0000-7000-8000-000000000001',
          email: 'davi@davidev.net.br',
        },
      }),
    } as unknown as RefreshSessionUseCase;

    const app = await buildApp({
      refreshSessionUseCase,
      tokenService,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      cookies: {
        refresh_token: 'old-refresh-token',
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json.accessToken).toBe('new-jwt-access-token');

    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toContain('refresh_token=new-raw-refresh-token');
  });

  it('POST /api/v1/auth/logout invalida cookie (AC-07.4)', async () => {
    const logoutUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as LogoutUseCase;

    const app = await buildApp({
      logoutUseCase,
      tokenService,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      cookies: {
        refresh_token: 'token-to-logout',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(logoutUseCase.execute).toHaveBeenCalled();
  });

  it('GET /api/v1/auth/me exige token Bearer válido', async () => {
    const app = await buildApp({ tokenService });

    // Without token
    const unauthResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });
    expect(unauthResponse.statusCode).toBe(401);

    // With valid token
    const validToken = tokenService.generateAccessToken({
      id: UUID.create('01918a20-0000-7000-8000-000000000001'),
      email: 'davi@davidev.net.br',
    } as any);

    const authResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    });

    expect(authResponse.statusCode).toBe(200);
    const json = JSON.parse(authResponse.payload);
    expect(json.authenticated).toBe(true);
    expect(json.user.email).toBe('davi@davidev.net.br');
  });
});
