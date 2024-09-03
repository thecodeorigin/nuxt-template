alter table "public"."categories" add column "parent_id" uuid;

alter table "public"."projects" add column "category_id" uuid default gen_random_uuid();

alter table "public"."projects" alter column "user_id" set default gen_random_uuid();

alter table "public"."categories" add constraint "public_categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "public_categories_parent_id_fkey";

alter table "public"."projects" add constraint "public_projects_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "public_projects_category_id_fkey";



