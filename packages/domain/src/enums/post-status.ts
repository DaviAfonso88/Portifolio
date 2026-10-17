export const PostStatus = {
  DRAFT: 'rascunho',
  PUBLISHED: 'publicado',
  TRASH: 'lixeira',
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

export function isValidPostStatus(status: string): status is PostStatus {
  return Object.values(PostStatus).includes(status as PostStatus);
}
