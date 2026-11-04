import { describe, it, expect, vi } from 'vitest';
import { SubmitContactMessageUseCase } from '../use-cases/submit-contact-message';
import type { ContactMessageRepository } from '../ports/contact-message-repository.port';
import type { CaptchaVerificationService } from '../ports/captcha-service.port';
import type { EmailNotificationService } from '../ports/email-service.port';
import { ContactMessage } from '@davidev/domain';

describe('SubmitContactMessageUseCase', () => {
  const createMockRepo = (): ContactMessageRepository => {
    const messages = new Map<string, ContactMessage>();
    return {
      save: vi.fn(async (msg: ContactMessage) => {
        messages.set(msg.id.toString(), msg);
      }),
      findById: vi.fn(async (id) => messages.get(id.toString()) ?? null),
      markEmailNotified: vi.fn(async (id) => {
        const msg = messages.get(id.toString());
        if (msg) msg.markAsNotified();
      }),
      list: vi.fn(async () => ({ messages: [], total: 0, unnotifiedCount: 0, page: 1, limit: 20, totalPages: 0 })),
      purgeOlderThan: vi.fn(async () => 0),
    };
  };


  const createMockCaptcha = (shouldPass: boolean = true): CaptchaVerificationService => ({
    verify: vi.fn(async () => shouldPass),
  });

  const createMockEmail = (shouldThrow: boolean = false): EmailNotificationService => ({
    sendContactAlert: vi.fn(async () => {
      if (shouldThrow) throw new Error('Resend API down');
    }),
  });

  it('successfully saves message and marks email notified when inputs are valid', async () => {
    const repo = createMockRepo();
    const captcha = createMockCaptcha(true);
    const email = createMockEmail(false);
    const useCase = new SubmitContactMessageUseCase(repo, captcha, email);

    const result = await useCase.execute({
      name: 'Rafael Lima',
      email: 'rafael.lima@example.com',
      subject: 'Oportunidade',
      message: 'Olá Davi, gostaria de conversar sobre um projeto de engenharia.',
      locale: 'pt-BR',
      captchaToken: 'valid-token',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBeDefined();
    }
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(email.sendContactAlert).toHaveBeenCalledTimes(1);
    expect(repo.markEmailNotified).toHaveBeenCalledTimes(1);
  });

  it('rejects submission if CAPTCHA verification fails', async () => {
    const repo = createMockRepo();
    const captcha = createMockCaptcha(false);
    const email = createMockEmail(false);
    const useCase = new SubmitContactMessageUseCase(repo, captcha, email);

    const result = await useCase.execute({
      name: 'Bot',
      email: 'bot@example.com',
      message: 'Spam message that should not pass captcha',
      locale: 'pt-BR',
      captchaToken: 'invalid-token',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('CAPTCHA_VERIFICATION_FAILED');
    }
    expect(repo.save).not.toHaveBeenCalled();
    expect(email.sendContactAlert).not.toHaveBeenCalled();
  });

  it('rejects submission if email is invalid', async () => {
    const repo = createMockRepo();
    const captcha = createMockCaptcha(true);
    const email = createMockEmail(false);
    const useCase = new SubmitContactMessageUseCase(repo, captcha, email);

    const result = await useCase.execute({
      name: 'Rafael Lima',
      email: 'not-an-email',
      message: 'Valid length message for testing invalid email.',
      locale: 'pt-BR',
      captchaToken: 'token',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('INVALID_EMAIL');
    }
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('preserves saved message even if email notification throws (BR-012)', async () => {
    const repo = createMockRepo();
    const captcha = createMockCaptcha(true);
    const email = createMockEmail(true); // Email service will throw
    const useCase = new SubmitContactMessageUseCase(repo, captcha, email);

    const result = await useCase.execute({
      name: 'Carlos Alberto',
      email: 'carlos@example.com',
      message: 'Mensagem válida enquanto o provedor de e-mail está instável.',
      locale: 'pt-BR',
      captchaToken: 'token',
    });

    // Per BR-012: The submission still succeeds because the message is safely stored in database
    expect(result.success).toBe(true);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(email.sendContactAlert).toHaveBeenCalledTimes(1);
    // Notice markEmailNotified was NOT called because email failed
    expect(repo.markEmailNotified).not.toHaveBeenCalled();
  });

  it('fails with STORAGE_ERROR and sends no email when the message cannot be saved', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.save).mockRejectedValueOnce(new Error('database unavailable'));
    const captcha = createMockCaptcha(true);
    const email = createMockEmail(false);
    const useCase = new SubmitContactMessageUseCase(repo, captcha, email);

    const result = await useCase.execute({
      name: 'Carlos Alberto',
      email: 'carlos@example.com',
      message: 'Mensagem válida enquanto o banco de dados está indisponível.',
      locale: 'pt-BR',
      captchaToken: 'token',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('STORAGE_ERROR');
    }
    expect(email.sendContactAlert).not.toHaveBeenCalled();
  });

  it('rejects submission with invalid email format', async () => {
    const repo = createMockRepo();
    const captcha = createMockCaptcha(true);
    const email = createMockEmail(false);
    const useCase = new SubmitContactMessageUseCase(repo, captcha, email);

    const result = await useCase.execute({
      name: 'Nome Valido',
      email: 'not-an-email',
      message: 'Mensagem com corpo longo o suficiente para passar no teste de tamanho.',
      locale: 'pt-BR',
      captchaToken: 'token',
    });

    expect(result.success).toBe(false);
  });

  it('delegates to repository in ListContactMessagesUseCase', async () => {
    const repo = createMockRepo();
    const { ListContactMessagesUseCase } = await import('../use-cases/contact/list-contact-messages');
    const listUseCase = new ListContactMessagesUseCase(repo);

    const res = await listUseCase.execute({ page: 1, limit: 10 });
    expect(res).toBeDefined();
    expect(repo.list).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });
});

