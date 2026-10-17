import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';
import { PostLocale } from '../enums/post-locale';
import { PostStatus } from '../enums/post-status';
import { MarkdownContent } from '../value-objects/markdown-content';

export interface PostProps {
  id?: UUIDv7;
  locale: PostLocale;
  translationGroupId: UUIDv7;
  title: string;
  excerpt: string;
  content: MarkdownContent;
  coverImageUrl?: string | null;
  categoryId: UUIDv7;
  status?: PostStatus;
  publishedAt?: Date | null;
  currentVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Post {
  public readonly id: UUIDv7;
  public readonly locale: PostLocale;
  public readonly translationGroupId: UUIDv7;
  public title: string;
  public excerpt: string;
  public content: MarkdownContent;
  public coverImageUrl: string | null;
  public categoryId: UUIDv7;
  public status: PostStatus;
  public publishedAt: Date | null;
  public currentVersion: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: PostProps) {
    if (!props.title || props.title.length > 160) {
      throw new Error('Title must be between 1 and 160 characters.');
    }
    if (!props.excerpt || props.excerpt.length > 320) {
      throw new Error('Excerpt must be between 1 and 320 characters.');
    }

    this.id = props.id ?? UUID.generate();
    this.locale = props.locale;
    this.translationGroupId = props.translationGroupId;
    this.title = props.title.trim();
    this.excerpt = props.excerpt.trim();
    this.content = props.content;
    this.coverImageUrl = props.coverImageUrl ?? null;
    this.categoryId = props.categoryId;
    this.status = props.status ?? PostStatus.DRAFT;
    this.publishedAt = props.publishedAt ?? null;
    this.currentVersion = props.currentVersion ?? 1;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public publish(): void {
    if (this.status === PostStatus.PUBLISHED) {
      return;
    }
    this.status = PostStatus.PUBLISHED;
    if (!this.publishedAt) {
      this.publishedAt = new Date();
    }
    this.updatedAt = new Date();
  }

  public unpublish(): void {
    if (this.status === PostStatus.DRAFT) {
      return;
    }
    this.status = PostStatus.DRAFT;
    this.updatedAt = new Date();
  }

  public moveToTrash(): void {
    this.status = PostStatus.TRASH;
    this.updatedAt = new Date();
  }

  public restore(toStatus: PostStatus = PostStatus.DRAFT): void {
    if (toStatus === PostStatus.TRASH) {
      throw new Error('Cannot restore post to trash status.');
    }
    this.status = toStatus;
    this.updatedAt = new Date();
  }

  public updateContent(newContent: MarkdownContent, title?: string, excerpt?: string): boolean {
    let textChanged = false;

    if (title && title.trim() !== this.title) {
      this.title = title.trim();
      textChanged = true;
    }
    if (excerpt && excerpt.trim() !== this.excerpt) {
      this.excerpt = excerpt.trim();
      textChanged = true;
    }

    const contentChanged = !this.content.hasSameHash(newContent);
    if (contentChanged) {
      this.content = newContent;
      textChanged = true;
    }

    if (textChanged) {
      // BR-005 & AC-12.1: Incrementa versão se publicado e houver alteração textual
      if (this.status === PostStatus.PUBLISHED) {
        this.currentVersion += 1;
      }
      this.updatedAt = new Date();
    }

    return textChanged;
  }
}
