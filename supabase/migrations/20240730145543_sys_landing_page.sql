create table "public"."sys_landing_page" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "main_title" text not null,
    "main_title_desc" text[],
    "main_title_button" jsonb
);


alter table "public"."sys_landing_page" enable row level security;

CREATE UNIQUE INDEX sys_landing_page_main_title_key ON public.sys_landing_page USING btree (main_title);

CREATE UNIQUE INDEX sys_landing_page_pkey ON public.sys_landing_page USING btree (id);

alter table "public"."sys_landing_page" add constraint "sys_landing_page_pkey" PRIMARY KEY using index "sys_landing_page_pkey";

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



