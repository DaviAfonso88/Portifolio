import {
  ContactMessage,
  EmailValueObject,
  isValidLocale,
  PostLocale,
  ok,
  fail,
  type Result,
} from '@davidev/domain';
import type { UseCase } from '../types/use-case';
import type { ContactMessageRepository } from '../ports/contact-message-repository.port';
import type { CaptchaVerificationService } from '../ports/captcha-service.port';
import type { EmailNotificationService } from '../ports/email-service.port';

export interface SubmitContactMessageInput {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  locale: string;
  captchaToken: string;
  clientIp?: string;
}

export interface SubmitContactMessageOutput {
  id: string;
}

export class SubmitContactMessageUseCase
  implements UseCase<SubmitContactMessageInput, Result<SubmitContactMessageOutput, string>>
{
  constructor(
    private readonly contactRepository: ContactMessageRepository,
    private readonly captchaService: CaptchaVerificationService,
    private readonly emailService: EmailNotificationService
  ) {}

  public async execute(
    input: SubmitContactMessageInput
  ): Promise<Result<SubmitContactMessageOutput, string>> {
    // 1. Verify Anti-spam CAPTCHA
    const isHuman = await this.captchaService.verify(input.captchaToken, input.clientIp);
    if (!isHuman) {
      return fail('CAPTCHA_VERIFICATION_FAILED');
    }

    // 2. Validate Email Value Object
    let email;
    try {
      email = EmailValueObject.create(input.email);
    } catch {
      return fail('INVALID_EMAIL');
    }

    // 3. Resolve and validate Locale
    const locale: PostLocale = isValidLocale(input.locale)
      ? (input.locale as PostLocale)
      : PostLocale.PT_BR;

    // 4. Instantiate ContactMessage Entity (validates boundaries: name 1-120, msg 10-5000)
    let contactMessage: ContactMessage;
    try {
      contactMessage = new ContactMessage({
        name: input.name,
        email,
        subject: input.subject,
        message: input.message,
        locale,
      });
    } catch (error: any) {
      return fail(error.message || 'INVALID_CONTACT_DATA');
    }

    // 5. Persist to repository FIRST (BR-012: Resilience against notification failure)
    try {
      await this.contactRepository.save(contactMessage);
    } catch {
      return fail('STORAGE_ERROR');
    }

    // 6. Attempt Email Notification (BR-012: Failure does not rollback persisted message)
    try {
      await this.emailService.sendContactAlert(contactMessage);
      contactMessage.markAsNotified();
      await this.contactRepository.markEmailNotified(contactMessage.id);
    } catch (emailError) {
      // Intentionally log and suppress email failure per BR-012
      console.warn(
        `[SubmitContactMessageUseCase] Failed to send email alert for contact ${contactMessage.id}:`,
        emailError
      );
    }

    return ok({ id: contactMessage.id.toString() });
  }
}
