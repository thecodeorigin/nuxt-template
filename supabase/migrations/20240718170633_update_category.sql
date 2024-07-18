alter table "public"."categories" add column "image_url" text;

alter table "public"."categories" add column "user_id" uuid;

alter table "public"."categories" add constraint "public_categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES sys_users(id) not valid;

alter table "public"."categories" validate constraint "public_categories_user_id_fkey";



