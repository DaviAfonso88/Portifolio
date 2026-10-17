import { UUID, type UUIDv7 } from '../value-objects/uuid-v7';
import { Slug } from '../value-objects/slug';

export interface CategoryProps {
  id?: UUIDv7;
  namePtBr: string;
  nameEn: string;
  slugPtBr: Slug;
  slugEn: Slug;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category {
  public readonly id: UUIDv7;
  public namePtBr: string;
  public nameEn: string;
  public slugPtBr: Slug;
  public slugEn: Slug;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id ?? UUID.generate();
    this.namePtBr = props.namePtBr.trim();
    this.nameEn = props.nameEn.trim();
    this.slugPtBr = props.slugPtBr;
    this.slugEn = props.slugEn;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
