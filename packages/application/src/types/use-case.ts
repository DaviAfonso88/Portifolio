/**
 * Base UseCase interface for application layer
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput> | TOutput;
}
