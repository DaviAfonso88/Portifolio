import type { UseCase } from '../../types/use-case';
import type { ContactMessageRepository } from '../../ports/contact-message-repository.port';

export interface PurgeOldContactMessagesInput {
  retentionMonths?: number;
  cutoffDate?: Date;
}

export interface PurgeOldContactMessagesOutput {
  purgedCount: number;
  cutoffDate: Date;
}

/**
 * PurgeOldContactMessagesUseCase
 *
 * Implements policy P-003: Expurgo automático de mensagens de contato com mais de 24 meses.
 * Executed by daily maintenance cron job.
 */
export class PurgeOldContactMessagesUseCase
  implements UseCase<PurgeOldContactMessagesInput, PurgeOldContactMessagesOutput>
{
  constructor(private readonly contactRepo: ContactMessageRepository) {}

  public async execute(
    input: PurgeOldContactMessagesInput = {}
  ): Promise<PurgeOldContactMessagesOutput> {
    const months = input.retentionMonths ?? 24;
    let cutoff = input.cutoffDate;

    if (!cutoff) {
      cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);
    }

    const purgedCount = await this.contactRepo.purgeOlderThan(cutoff);

    return {
      purgedCount,
      cutoffDate: cutoff,
    };
  }
}
