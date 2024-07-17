revoke delete on table "public"."sys_notifications" from "anon";

revoke insert on table "public"."sys_notifications" from "anon";

revoke references on table "public"."sys_notifications" from "anon";

revoke select on table "public"."sys_notifications" from "anon";

revoke trigger on table "public"."sys_notifications" from "anon";

revoke truncate on table "public"."sys_notifications" from "anon";

revoke update on table "public"."sys_notifications" from "anon";

revoke delete on table "public"."sys_notifications" from "authenticated";

revoke insert on table "public"."sys_notifications" from "authenticated";

revoke references on table "public"."sys_notifications" from "authenticated";

revoke select on table "public"."sys_notifications" from "authenticated";

revoke trigger on table "public"."sys_notifications" from "authenticated";

revoke truncate on table "public"."sys_notifications" from "authenticated";

revoke update on table "public"."sys_notifications" from "authenticated";

revoke delete on table "public"."sys_notifications" from "service_role";

revoke insert on table "public"."sys_notifications" from "service_role";

revoke references on table "public"."sys_notifications" from "service_role";

revoke select on table "public"."sys_notifications" from "service_role";

revoke trigger on table "public"."sys_notifications" from "service_role";

revoke truncate on table "public"."sys_notifications" from "service_role";

revoke update on table "public"."sys_notifications" from "service_role";

alter table "public"."sys_notifications" drop constraint "sys_notifications_user_id_fkey";

alter table "public"."sys_notifications" drop constraint "sys_notifications_pkey";

drop index if exists "public"."sys_notifications_pkey";

drop table "public"."sys_notifications";

create table "public"."sys_notifications" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text,
    "message" text,
    "action" jsonb,
    "read_at" timestamp with time zone,
    "user_id" uuid default gen_random_uuid()
);


alter table "public"."sys_notifications" enable row level security;

CREATE UNIQUE INDEX sys_notifications_pkey ON public.sys_notifications USING btree (id);

alter table "public"."sys_notifications" add constraint "sys_notifications_pkey" PRIMARY KEY using index "sys_notifications_pkey";

alter table "public"."sys_notifications" add constraint "public_sys_notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES sys_users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."sys_notifications" validate constraint "public_sys_notifications_user_id_fkey";

grant delete on table "public"."sys_notifications" to "anon";

grant insert on table "public"."sys_notifications" to "anon";

grant references on table "public"."sys_notifications" to "anon";

grant select on table "public"."sys_notifications" to "anon";

grant trigger on table "public"."sys_notifications" to "anon";

grant truncate on table "public"."sys_notifications" to "anon";

grant update on table "public"."sys_notifications" to "anon";

grant delete on table "public"."sys_notifications" to "authenticated";

grant insert on table "public"."sys_notifications" to "authenticated";

grant references on table "public"."sys_notifications" to "authenticated";

grant select on table "public"."sys_notifications" to "authenticated";

grant trigger on table "public"."sys_notifications" to "authenticated";

grant truncate on table "public"."sys_notifications" to "authenticated";

grant update on table "public"."sys_notifications" to "authenticated";

grant delete on table "public"."sys_notifications" to "service_role";

grant insert on table "public"."sys_notifications" to "service_role";

grant references on table "public"."sys_notifications" to "service_role";

grant select on table "public"."sys_notifications" to "service_role";

grant trigger on table "public"."sys_notifications" to "service_role";

grant truncate on table "public"."sys_notifications" to "service_role";

grant update on table "public"."sys_notifications" to "service_role";




