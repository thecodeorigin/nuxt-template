alter table "public"."categories" add column "parent_id" uuid;

alter table "public"."projects" drop column "is_voice_recognition";

alter table "public"."projects" drop column "model";

alter table "public"."projects" drop column "source_downloadable";

alter table "public"."projects" drop column "source_duration";

alter table "public"."projects" drop column "source_thumbnail";

alter table "public"."projects" drop column "source_title";

alter table "public"."projects" drop column "source_url";

alter table "public"."projects" drop column "structure";

alter table "public"."projects" drop column "subtitle";

alter table "public"."projects" drop column "summarize";

alter table "public"."projects" drop column "translate_from";

alter table "public"."projects" drop column "translate_to";

alter table "public"."projects" add column "category_id" uuid default gen_random_uuid();

alter table "public"."projects" alter column "user_id" set default gen_random_uuid();

alter table "public"."categories" add constraint "public_categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "public_categories_parent_id_fkey";

alter table "public"."projects" add constraint "public_projects_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "public_projects_category_id_fkey";



