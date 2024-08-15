revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

alter table "public"."projects" drop constraint "public_projects_category_id_fkey";

alter table "public"."projects" drop constraint "public_projects_user_id_fkey";

alter table "public"."projects" drop constraint "projects_pkey";

drop index if exists "public"."projects_pkey";

drop table "public"."projects";

create table "public"."sys_landing_page" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "hero_title" text not null,
    "hero_title_desc" text,
    "hero_title_button" jsonb,
    "feature_emphasized_title" jsonb,
    "feature_title" text,
    "feature_title_desc" text,
    "feature_data" jsonb[],
    "customer_review_title" text,
    "customer_review_emphasized_title" jsonb,
    "customer_review_title_desc" text,
    "customer_review_data" jsonb[],
    "our_team_emphasized_title" jsonb,
    "our_team_title" text,
    "our_team_desc" text,
    "our_team_data" jsonb[],
    "pricing_emphasized_title" jsonb,
    "pricing_title" text,
    "pricing_title_desc" text,
    "pricing_data" jsonb[],
    "product_stats" jsonb[],
    "faq_emphasized_title" jsonb,
    "faq_title" text,
    "faq_title_desc" text,
    "faq_data" jsonb[],
    "contact_us_emphasized_title" jsonb,
    "contact_us_title" text,
    "contact_us_title_desc" text,
    "contact_us_card_heading" text,
    "contact_us_card_emphasized_heading" jsonb,
    "contact_us_card_image" text,
    "contact_us_card_content" text,
    "hero_main_img_light" text not null default 'heroElementsImgLight'::text,
    "hero_main_img_dark" text not null default 'heroElementsImgDark'::text,
    "hero_sub_img_light" text not null default 'heroDashboardImgLight'::text,
    "hero_sub_img_dark" text not null default 'heroDashboardImgDark'::text
);


alter table "public"."sys_landing_page" enable row level security;

create table "public"."team_members" (
    "id" uuid not null default uuid_generate_v4(),
    "team_data" jsonb
);


CREATE UNIQUE INDEX sys_landing_page_main_title_key ON public.sys_landing_page USING btree (hero_title);

CREATE UNIQUE INDEX sys_landing_page_pkey ON public.sys_landing_page USING btree (id);

CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

alter table "public"."sys_landing_page" add constraint "sys_landing_page_pkey" PRIMARY KEY using index "sys_landing_page_pkey";

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

alter table "public"."sys_landing_page" add constraint "sys_landing_page_main_title_key" UNIQUE using index "sys_landing_page_main_title_key";

grant delete on table "public"."sys_landing_page" to "anon";

grant insert on table "public"."sys_landing_page" to "anon";

grant references on table "public"."sys_landing_page" to "anon";

grant select on table "public"."sys_landing_page" to "anon";

grant trigger on table "public"."sys_landing_page" to "anon";

grant truncate on table "public"."sys_landing_page" to "anon";

grant update on table "public"."sys_landing_page" to "anon";

grant delete on table "public"."sys_landing_page" to "authenticated";

grant insert on table "public"."sys_landing_page" to "authenticated";

grant references on table "public"."sys_landing_page" to "authenticated";

grant select on table "public"."sys_landing_page" to "authenticated";

grant trigger on table "public"."sys_landing_page" to "authenticated";

grant truncate on table "public"."sys_landing_page" to "authenticated";

grant update on table "public"."sys_landing_page" to "authenticated";

grant delete on table "public"."sys_landing_page" to "service_role";

grant insert on table "public"."sys_landing_page" to "service_role";

grant references on table "public"."sys_landing_page" to "service_role";

grant select on table "public"."sys_landing_page" to "service_role";

grant trigger on table "public"."sys_landing_page" to "service_role";

grant truncate on table "public"."sys_landing_page" to "service_role";

grant update on table "public"."sys_landing_page" to "service_role";

grant delete on table "public"."team_members" to "anon";

grant insert on table "public"."team_members" to "anon";

grant references on table "public"."team_members" to "anon";

grant select on table "public"."team_members" to "anon";

grant trigger on table "public"."team_members" to "anon";

grant truncate on table "public"."team_members" to "anon";

grant update on table "public"."team_members" to "anon";

grant delete on table "public"."team_members" to "authenticated";

grant insert on table "public"."team_members" to "authenticated";

grant references on table "public"."team_members" to "authenticated";

grant select on table "public"."team_members" to "authenticated";

grant trigger on table "public"."team_members" to "authenticated";

grant truncate on table "public"."team_members" to "authenticated";

grant update on table "public"."team_members" to "authenticated";

grant delete on table "public"."team_members" to "service_role";

grant insert on table "public"."team_members" to "service_role";

grant references on table "public"."team_members" to "service_role";

grant select on table "public"."team_members" to "service_role";

grant trigger on table "public"."team_members" to "service_role";

grant truncate on table "public"."team_members" to "service_role";

grant update on table "public"."team_members" to "service_role";



