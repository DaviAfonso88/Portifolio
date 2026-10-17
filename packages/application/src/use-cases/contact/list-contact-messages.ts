import type { UseCase } from '../../types/use-case';
import type {
  ContactMessageRepository,
  ListContactMessagesParams,
  ListContactMessagesResult,
} from '../../ports/contact-message-repository.port';

export class ListContactMessagesUseCase
  implements UseCase<ListContactMessagesParams, ListContactMessagesResult>
{
  constructor(private readonly contactRepo: ContactMessageRepository) {}

  public async execute(
    params: ListContactMessagesParams = {}
  ): Promise<ListContactMessagesResult> {
    return this.contactRepo.list(params);
  }
}
