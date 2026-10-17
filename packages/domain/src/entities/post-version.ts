import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';

export interface PostVersionProps {
  id?: UUIDv7;
  postId: UUIDv7;
  versionNumber: number;
  title: string;
  excerpt: string;
  content: string;
  contentHash: string;
  createdAt?: Date;
}

export class PostVersion {
  public readonly id: UUIDv7;
  public readonly postId: UUIDv7;
  public readonly versionNumber: number;
  public readonly title: string;
  public readonly excerpt: string;
  public readonly content: string;
  public readonly contentHash: string;
  public readonly createdAt: Date;

  constructor(props: PostVersionProps) {
    if (props.versionNumber < 1) {
      throw new Error('Version number must be at least 1.');
    }
    this.id = props.id ?? UUID.generate();
    this.postId = props.postId;
    this.versionNumber = props.versionNumber;
    this.title = props.title;
    this.excerpt = props.excerpt;
    this.content = props.content;
    this.contentHash = props.contentHash;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static createFromPost(post: {
    id: UUIDv7;
    currentVersion: number;
    title: string;
    excerpt: string;
    content: { text: string; contentHash: string };
  }): PostVersion {
    return new PostVersion({
      postId: post.id,
      versionNumber: post.currentVersion,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content.text,
      contentHash: post.content.contentHash,
      createdAt: new Date(),
    });
  }
}
