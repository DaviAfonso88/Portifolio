import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';
import { PostLocale } from '../enums/post-locale';
import { Slug } from '../value-objects/slug';

export interface PostSlugProps {
  id?: UUIDv7;
  postId: UUIDv7;
  locale: PostLocale;
  slug: Slug;
  isCurrent?: boolean;
  createdAt?: Date;
  replacedAt?: Date | null;
}

export class PostSlug {
  public readonly id: UUIDv7;
  public readonly postId: UUIDv7;
  public readonly locale: PostLocale;
  public readonly slug: Slug;
  public isCurrent: boolean;
  public readonly createdAt: Date;
  public replacedAt: Date | null;

  constructor(props: PostSlugProps) {
    this.id = props.id ?? UUID.generate();
    this.postId = props.postId;
    this.locale = props.locale;
    this.slug = props.slug;
    this.isCurrent = props.isCurrent ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.replacedAt = props.replacedAt ?? null;
  }

  public archive(): void {
    this.isCurrent = false;
    this.replacedAt = new Date();
  }
}
