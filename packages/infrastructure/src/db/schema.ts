import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  char,
  primaryKey,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Enums
export const postStatusEnum = pgEnum('post_status', ['rascunho', 'publicado', 'lixeira']);
export const postLocaleEnum = pgEnum('post_locale', ['pt-BR', 'en']);

// 1. Admin User
export const adminUsers = pgTable('admin_user', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 254 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Refresh Token
export const refreshTokens = pgTable(
  'refresh_token',
  {
    id: uuid('id').primaryKey(),
    adminUserId: uuid('admin_user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('idx_refresh_token_expires_at').on(t.expiresAt)]
);

// 3. Category
export const categories = pgTable('category', {
  id: uuid('id').primaryKey(),
  namePtBr: varchar('name_pt_br', { length: 60 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 60 }).notNull().unique(),
  slugPtBr: varchar('slug_pt_br', { length: 60 }).notNull().unique(),
  slugEn: varchar('slug_en', { length: 60 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Tag
export const tags = pgTable('tag', {
  id: uuid('id').primaryKey(),
  namePtBr: varchar('name_pt_br', { length: 40 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 40 }).notNull().unique(),
  slugPtBr: varchar('slug_pt_br', { length: 40 }).notNull().unique(),
  slugEn: varchar('slug_en', { length: 40 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Post
export const posts = pgTable(
  'post',
  {
    id: uuid('id').primaryKey(),
    locale: postLocaleEnum('locale').notNull(),
    translationGroupId: uuid('translation_group_id').notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    excerpt: varchar('excerpt', { length: 320 }).notNull(),
    content: text('content').notNull(),
    contentHash: char('content_hash', { length: 64 }).notNull(),
    coverImageUrl: text('cover_image_url'),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    status: postStatusEnum('status').default('rascunho').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    currentVersion: integer('current_version').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('uq_post_translation_locale').on(t.translationGroupId, t.locale),
    index('idx_post_public_listing').on(t.status, t.locale, t.publishedAt),
    index('idx_post_category').on(t.categoryId),
    index('idx_post_translation_group').on(t.translationGroupId),
  ]
);

// 6. Post Slug (Atual e Históricos)
export const postSlugs = pgTable(
  'post_slug',
  {
    id: uuid('id').primaryKey(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    locale: postLocaleEnum('locale').notNull(),
    slug: varchar('slug', { length: 160 }).notNull(),
    isCurrent: boolean('is_current').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    replacedAt: timestamp('replaced_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('uq_post_slug_locale').on(t.slug, t.locale),
    uniqueIndex('uq_post_slug_current')
      .on(t.postId, t.locale)
      .where(sql`${t.isCurrent} = true`),
  ]
);

// 7. Post Version (Apenas Conteúdo Textual)
export const postVersions = pgTable(
  'post_version',
  {
    id: uuid('id').primaryKey(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    excerpt: varchar('excerpt', { length: 320 }).notNull(),
    content: text('content').notNull(),
    contentHash: char('content_hash', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('uq_post_version_number').on(t.postId, t.versionNumber),
  ]
);

// 8. Post Tag (N:N)
export const postTags = pgTable(
  'post_tag',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.tagId], name: 'pk_post_tag' }),
    index('idx_post_tag_tag').on(t.tagId),
  ]
);

// 9. Contact Message
export const contactMessages = pgTable(
  'contact_message',
  {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    subject: varchar('subject', { length: 160 }),
    message: text('message').notNull(),
    locale: postLocaleEnum('locale').notNull(),
    emailNotifiedAt: timestamp('email_notified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('idx_contact_message_created').on(t.createdAt)]
);

// 10. Rate Limit Counter (Atomic Serverless Store)
export const rateLimitCounters = pgTable(
  'rate_limit_counter',
  {
    key: varchar('key', { length: 200 }).notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    hits: integer('hits').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.key, t.windowStart], name: 'pk_rate_limit_counter' }),
  ]
);

// Relations
export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  refreshTokens: many(refreshTokens),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [refreshTokens.adminUserId],
    references: [adminUsers.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  slugs: many(postSlugs),
  versions: many(postVersions),
  postTags: many(postTags),
}));

export const postSlugsRelations = relations(postSlugs, ({ one }) => ({
  post: one(posts, {
    fields: [postSlugs.postId],
    references: [posts.id],
  }),
}));

export const postVersionsRelations = relations(postVersions, ({ one }) => ({
  post: one(posts, {
    fields: [postVersions.postId],
    references: [posts.id],
  }),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));
