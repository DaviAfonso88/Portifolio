import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactMessage, EmailValueObject, PostLocale } from '@davidev/domain';
import { ResendEmailService } from '../resend.service';

describe('ResendEmailService', () => {
  const message = new ContactMessage({
    name: 'Ana Silva',
    email: EmailValueObject.create('ana.silva@empresa.com'),
    message: 'Mensagem para testar o envio do alerta.',
    locale: PostLocale.PT_BR,
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('falha sem a chave, para a mensagem não ficar marcada como notificada', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(new ResendEmailService().sendContactAlert(message)).rejects.toThrow(
      'RESEND_API_KEY not configured'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falha quando o Resend recusa o envio', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('domain is not verified', { status: 403 }))
    );

    await expect(
      new ResendEmailService('chave-de-teste', 'dono@teste.local').sendContactAlert(message)
    ).rejects.toThrow('Resend API failed with HTTP 403');
  });

  it('envia para o destinatário configurado', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await new ResendEmailService('chave-de-teste', 'dono@teste.local').sendContactAlert(message);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(JSON.parse(init.body as string).to).toEqual(['dono@teste.local']);
  });
});
