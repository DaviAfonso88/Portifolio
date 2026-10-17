import type { ContactMessage } from '@davidev/domain';

export interface EmailNotificationService {
  sendContactAlert(message: ContactMessage): Promise<void>;
}
