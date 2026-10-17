import type { ContactMessage } from '@davidev/domain';
import type { EmailNotificationService } from '@davidev/application';

export class ResendEmailService implements EmailNotificationService {
  constructor(
    private readonly apiKey?: string,
    private readonly alertRecipient?: string
  ) {}

  public async sendContactAlert(message: ContactMessage): Promise<void> {
    const key = this.apiKey || process.env.RESEND_API_KEY;
    const to = this.alertRecipient || process.env.CONTACT_ALERT_EMAIL || 'contato@davidev.net.br';

    if (!key) {
      console.warn('[ResendEmailService] RESEND_API_KEY not configured. Skipping email dispatch.');
      return;
    }

    const payload = {
      from: 'DaviDev Portfolio <noreply@davidev.net.br>',
      to: [to],
      subject: `[DaviDev Contato] ${message.subject || 'Nova mensagem de contato'} de ${message.name}`,
      text: `Nome: ${message.name}\nEmail: ${message.email}\nIdioma: ${message.locale}\nData: ${message.createdAt.toISOString()}\n\nMensagem:\n${message.message}`,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API failed with HTTP ${response.status}: ${errorText}`);
    }
  }
}
