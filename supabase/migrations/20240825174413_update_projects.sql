alter table "public"."projects" drop constraint "public_projects_category_id_fkey";

alter table "public"."projects" drop column "category_id";

alter table "public"."projects" add column "is_voice_recognition" boolean default false;

alter table "public"."projects" add column "model" text default ''::text;

alter table "public"."projects" add column "source_downloadable" text default ''::text;

alter table "public"."projects" add column "source_duration" text default ''::text;

alter table "public"."projects" add column "source_thumbnail" text default ''::text;

alter table "public"."projects" add column "source_title" text default ''::text;

alter table "public"."projects" add column "source_url" text default ''::text;

alter table "public"."projects" add column "structure" json;

alter table "public"."projects" add column "subtitle" json[];

alter table "public"."projects" add column "summarize" text default ''::text;

alter table "public"."projects" add column "translate_from" text not null default ''::text;

alter table "public"."projects" add column "translate_to" text not null default ''::text;

alter table "public"."projects" alter column "user_id" set default auth.uid();



