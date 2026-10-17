import { describe, it, expect, vi } from 'vitest';
import { PurgeOldContactMessagesUseCase } from '../use-cases/contact/purge-old-contact-messages';
import type { ContactMessageRepository } from '../ports/contact-message-repository.port';

describe('PurgeOldContactMessagesUseCase (P-003)', () => {
  const createMockRepo = (purgedCount: number = 5): ContactMessageRepository => ({
    save: vi.fn(),
    findById: vi.fn(),
    markEmailNotified: vi.fn(),
    list: vi.fn(),
    purgeOlderThan: vi.fn(async () => purgedCount),
  });

  it('purges messages older than 24 months by default', async () => {
    const repo = createMockRepo(3);
    const useCase = new PurgeOldContactMessagesUseCase(repo);

    const before = new Date();
    const result = await useCase.execute();

    expect(result.purgedCount).toBe(3);
    expect(repo.purgeOlderThan).toHaveBeenCalledTimes(1);

    const passedCutoff = (repo.purgeOlderThan as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date;
    expect(passedCutoff).toBeInstanceOf(Date);

    // Should be approximately 24 months ago (~730 days)
    const diffDays = Math.round((before.getTime() - passedCutoff.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(720);
    expect(diffDays).toBeLessThanOrEqual(740);
  });

  it('allows custom retention period in months', async () => {
    const repo = createMockRepo(12);
    const useCase = new PurgeOldContactMessagesUseCase(repo);

    const before = new Date();
    const result = await useCase.execute({ retentionMonths: 6 });

    expect(result.purgedCount).toBe(12);
    const passedCutoff = (repo.purgeOlderThan as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date;

    const diffDays = Math.round((before.getTime() - passedCutoff.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(175);
    expect(diffDays).toBeLessThanOrEqual(190);
  });

  it('respects an explicit cutoffDate when provided', async () => {
    const repo = createMockRepo(1);
    const useCase = new PurgeOldContactMessagesUseCase(repo);
    const explicitDate = new Date('2024-01-01T00:00:00Z');

    const result = await useCase.execute({ cutoffDate: explicitDate });

    expect(result.purgedCount).toBe(1);
    expect(repo.purgeOlderThan).toHaveBeenCalledWith(explicitDate);
    expect(result.cutoffDate).toEqual(explicitDate);
  });
});
