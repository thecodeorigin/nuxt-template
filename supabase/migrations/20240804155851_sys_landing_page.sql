create table "public"."team_members" (
    "id" uuid not null default uuid_generate_v4(),
    "team_data" jsonb
);


alter table "public"."sys_landing_page" add column "contact_us_card_content" text;

alter table "public"."sys_landing_page" add column "contact_us_card_emphasized_heading" jsonb;

alter table "public"."sys_landing_page" add column "contact_us_card_heading" text;

alter table "public"."sys_landing_page" add column "contact_us_card_image" text;

alter table "public"."sys_landing_page" add column "contact_us_emphasized_title" jsonb;

alter table "public"."sys_landing_page" add column "contact_us_title" text;

alter table "public"."sys_landing_page" add column "contact_us_title_desc" text[];

alter table "public"."sys_landing_page" add column "customer_review_data" jsonb[];

alter table "public"."sys_landing_page" add column "customer_review_emphasized_title" jsonb;

alter table "public"."sys_landing_page" add column "customer_review_title" text;

alter table "public"."sys_landing_page" add column "customer_review_title_desc" text[];

alter table "public"."sys_landing_page" add column "faq_data" jsonb[];

alter table "public"."sys_landing_page" add column "faq_emphasized_title" jsonb;

alter table "public"."sys_landing_page" add column "faq_title" text;

alter table "public"."sys_landing_page" add column "faq_title_desc" text[];

alter table "public"."sys_landing_page" add column "feature_data" jsonb[];

alter table "public"."sys_landing_page" add column "feature_emphasized_title" jsonb;

alter table "public"."sys_landing_page" add column "feature_title" text;

alter table "public"."sys_landing_page" add column "feature_title_desc" text;

alter table "public"."sys_landing_page" add column "our_team_data" jsonb[];

alter table "public"."sys_landing_page" add column "our_team_desc" text[];

alter table "public"."sys_landing_page" add column "our_team_emphasized_title" jsonb;

alter table "public"."sys_landing_page" add column "our_team_title" text;

alter table "public"."sys_landing_page" add column "pricing_data" jsonb[];

alter table "public"."sys_landing_page" add column "pricing_emphasized_title" jsonb;

alter table "public"."sys_landing_page" add column "pricing_title" text;

alter table "public"."sys_landing_page" add column "pricing_title_desc" text[];

alter table "public"."sys_landing_page" add column "product_stats" jsonb[];

CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

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



