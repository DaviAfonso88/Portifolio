CREATE TYPE "public"."post_locale" AS ENUM('pt-BR', 'en');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('rascunho', 'publicado', 'lixeira');--> statement-breakpoint
CREATE TABLE "admin_user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(254) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name_pt_br" varchar(60) NOT NULL,
	"name_en" varchar(60) NOT NULL,
	"slug_pt_br" varchar(60) NOT NULL,
	"slug_en" varchar(60) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_name_pt_br_unique" UNIQUE("name_pt_br"),
	CONSTRAINT "category_name_en_unique" UNIQUE("name_en"),
	CONSTRAINT "category_slug_pt_br_unique" UNIQUE("slug_pt_br"),
	CONSTRAINT "category_slug_en_unique" UNIQUE("slug_en")
);
--> statement-breakpoint
CREATE TABLE "contact_message" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"subject" varchar(160),
	"message" text NOT NULL,
	"locale" "post_locale" NOT NULL,
	"email_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_slug" (
	"id" uuid PRIMARY KEY NOT NULL,
	"post_id" uuid NOT NULL,
	"locale" "post_locale" NOT NULL,
	"slug" varchar(160) NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"replaced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "post_tag" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "pk_post_tag" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "post_version" (
	"id" uuid PRIMARY KEY NOT NULL,
	"post_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"title" varchar(160) NOT NULL,
	"excerpt" varchar(320) NOT NULL,
	"content" text NOT NULL,
	"content_hash" char(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY NOT NULL,
	"locale" "post_locale" NOT NULL,
	"translation_group_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"excerpt" varchar(320) NOT NULL,
	"content" text NOT NULL,
	"content_hash" char(64) NOT NULL,
	"cover_image_url" text,
	"category_id" uuid NOT NULL,
	"status" "post_status" DEFAULT 'rascunho' NOT NULL,
	"published_at" timestamp with time zone,
	"current_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_counter" (
	"key" varchar(200) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"hits" integer NOT NULL,
	CONSTRAINT "pk_rate_limit_counter" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "refresh_token" (
	"id" uuid PRIMARY KEY NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_token_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name_pt_br" varchar(40) NOT NULL,
	"name_en" varchar(40) NOT NULL,
	"slug_pt_br" varchar(40) NOT NULL,
	"slug_en" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tag_name_pt_br_unique" UNIQUE("name_pt_br"),
	CONSTRAINT "tag_name_en_unique" UNIQUE("name_en"),
	CONSTRAINT "tag_slug_pt_br_unique" UNIQUE("slug_pt_br"),
	CONSTRAINT "tag_slug_en_unique" UNIQUE("slug_en")
);
--> statement-breakpoint
ALTER TABLE "post_slug" ADD CONSTRAINT "post_slug_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_version" ADD CONSTRAINT "post_version_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_contact_message_created" ON "contact_message" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_slug_locale" ON "post_slug" USING btree ("slug","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_slug_current" ON "post_slug" USING btree ("post_id","locale") WHERE "post_slug"."is_current" = true;--> statement-breakpoint
CREATE INDEX "idx_post_tag_tag" ON "post_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_version_number" ON "post_version" USING btree ("post_id","version_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_translation_locale" ON "post" USING btree ("translation_group_id","locale");--> statement-breakpoint
CREATE INDEX "idx_post_public_listing" ON "post" USING btree ("status","locale","published_at");--> statement-breakpoint
CREATE INDEX "idx_post_category" ON "post" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_post_translation_group" ON "post" USING btree ("translation_group_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_token_expires_at" ON "refresh_token" USING btree ("expires_at");