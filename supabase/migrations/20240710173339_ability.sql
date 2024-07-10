create type "public"."permission_action" as enum ('create', 'read', 'update', 'delete', 'manage');

create type "public"."permission_subject" as enum ('all', 'Post', 'Category', 'User');

create table "public"."sys_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "role_id" uuid,
    "action" permission_action not null default 'read'::permission_action,
    "subject" permission_subject not null
);


alter table "public"."sys_permissions" enable row level security;

create table "public"."sys_roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text
);


alter table "public"."sys_roles" enable row level security;

alter table "public"."sys_users" add column "role_id" uuid;

CREATE UNIQUE INDEX sys_permissions_pkey ON public.sys_permissions USING btree (id);

CREATE UNIQUE INDEX sys_roles_pkey ON public.sys_roles USING btree (id);

alter table "public"."sys_permissions" add constraint "sys_permissions_pkey" PRIMARY KEY using index "sys_permissions_pkey";

alter table "public"."sys_roles" add constraint "sys_roles_pkey" PRIMARY KEY using index "sys_roles_pkey";

alter table "public"."sys_permissions" add constraint "public_sys_permissions_role_id_fkey" FOREIGN KEY (role_id) REFERENCES sys_roles(id) ON DELETE CASCADE not valid;

alter table "public"."sys_permissions" validate constraint "public_sys_permissions_role_id_fkey";

alter table "public"."sys_users" add constraint "public_sys_users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES sys_roles(id) not valid;

alter table "public"."sys_users" validate constraint "public_sys_users_role_id_fkey";

grant delete on table "public"."sys_permissions" to "anon";

grant insert on table "public"."sys_permissions" to "anon";

grant references on table "public"."sys_permissions" to "anon";

grant select on table "public"."sys_permissions" to "anon";

grant trigger on table "public"."sys_permissions" to "anon";

grant truncate on table "public"."sys_permissions" to "anon";

grant update on table "public"."sys_permissions" to "anon";

grant delete on table "public"."sys_permissions" to "authenticated";

grant insert on table "public"."sys_permissions" to "authenticated";

grant references on table "public"."sys_permissions" to "authenticated";

grant select on table "public"."sys_permissions" to "authenticated";

grant trigger on table "public"."sys_permissions" to "authenticated";

grant truncate on table "public"."sys_permissions" to "authenticated";

grant update on table "public"."sys_permissions" to "authenticated";

grant delete on table "public"."sys_permissions" to "service_role";

grant insert on table "public"."sys_permissions" to "service_role";

grant references on table "public"."sys_permissions" to "service_role";

grant select on table "public"."sys_permissions" to "service_role";

grant trigger on table "public"."sys_permissions" to "service_role";

grant truncate on table "public"."sys_permissions" to "service_role";

grant update on table "public"."sys_permissions" to "service_role";

grant delete on table "public"."sys_roles" to "anon";

grant insert on table "public"."sys_roles" to "anon";

grant references on table "public"."sys_roles" to "anon";

grant select on table "public"."sys_roles" to "anon";

grant trigger on table "public"."sys_roles" to "anon";

grant truncate on table "public"."sys_roles" to "anon";

grant update on table "public"."sys_roles" to "anon";

grant delete on table "public"."sys_roles" to "authenticated";

grant insert on table "public"."sys_roles" to "authenticated";

grant references on table "public"."sys_roles" to "authenticated";

grant select on table "public"."sys_roles" to "authenticated";

grant trigger on table "public"."sys_roles" to "authenticated";

grant truncate on table "public"."sys_roles" to "authenticated";

grant update on table "public"."sys_roles" to "authenticated";

grant delete on table "public"."sys_roles" to "service_role";

grant insert on table "public"."sys_roles" to "service_role";

grant references on table "public"."sys_roles" to "service_role";

grant select on table "public"."sys_roles" to "service_role";

grant trigger on table "public"."sys_roles" to "service_role";

grant truncate on table "public"."sys_roles" to "service_role";

grant update on table "public"."sys_roles" to "service_role";



