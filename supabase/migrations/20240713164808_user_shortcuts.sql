create type "public"."user_status" as enum ('active', 'deactivated', 'pending');

create table "public"."user_shortcuts" (
    "id" uuid not null default gen_random_uuid(),
    "route" text not null,
    "user_id" uuid default gen_random_uuid()
);


alter table "public"."user_shortcuts" enable row level security;

alter table "public"."posts" add column "user_id" uuid default gen_random_uuid();

alter table "public"."sys_users" add column "organization" text;

alter table "public"."sys_users" add column "postcode" character varying;

alter table "public"."sys_users" add column "status" user_status default 'pending'::user_status;

CREATE UNIQUE INDEX user_shortcuts_pkey ON public.user_shortcuts USING btree (id);

alter table "public"."user_shortcuts" add constraint "user_shortcuts_pkey" PRIMARY KEY using index "user_shortcuts_pkey";

alter table "public"."posts" add constraint "public_posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES sys_users(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "public_posts_user_id_fkey";

alter table "public"."user_shortcuts" add constraint "public_user_shortcuts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES sys_users(id) ON DELETE CASCADE not valid;

alter table "public"."user_shortcuts" validate constraint "public_user_shortcuts_user_id_fkey";

grant delete on table "public"."user_shortcuts" to "anon";

grant insert on table "public"."user_shortcuts" to "anon";

grant references on table "public"."user_shortcuts" to "anon";

grant select on table "public"."user_shortcuts" to "anon";

grant trigger on table "public"."user_shortcuts" to "anon";

grant truncate on table "public"."user_shortcuts" to "anon";

grant update on table "public"."user_shortcuts" to "anon";

grant delete on table "public"."user_shortcuts" to "authenticated";

grant insert on table "public"."user_shortcuts" to "authenticated";

grant references on table "public"."user_shortcuts" to "authenticated";

grant select on table "public"."user_shortcuts" to "authenticated";

grant trigger on table "public"."user_shortcuts" to "authenticated";

grant truncate on table "public"."user_shortcuts" to "authenticated";

grant update on table "public"."user_shortcuts" to "authenticated";

grant delete on table "public"."user_shortcuts" to "service_role";

grant insert on table "public"."user_shortcuts" to "service_role";

grant references on table "public"."user_shortcuts" to "service_role";

grant select on table "public"."user_shortcuts" to "service_role";

grant trigger on table "public"."user_shortcuts" to "service_role";

grant truncate on table "public"."user_shortcuts" to "service_role";

grant update on table "public"."user_shortcuts" to "service_role";



