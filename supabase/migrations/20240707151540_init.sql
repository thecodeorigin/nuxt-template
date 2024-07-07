create table "public"."faqs" (
    "id" uuid not null default gen_random_uuid(),
    "title" text,
    "icon" text,
    "subtitle" text,
    "questions" jsonb[] not null default '{}'::jsonb[]
);


alter table "public"."faqs" enable row level security;

CREATE UNIQUE INDEX faqs_pkey ON public.faqs USING btree (id);

alter table "public"."faqs" add constraint "faqs_pkey" PRIMARY KEY using index "faqs_pkey";

grant delete on table "public"."faqs" to "anon";

grant insert on table "public"."faqs" to "anon";

grant references on table "public"."faqs" to "anon";

grant select on table "public"."faqs" to "anon";

grant trigger on table "public"."faqs" to "anon";

grant truncate on table "public"."faqs" to "anon";

grant update on table "public"."faqs" to "anon";

grant delete on table "public"."faqs" to "authenticated";

grant insert on table "public"."faqs" to "authenticated";

grant references on table "public"."faqs" to "authenticated";

grant select on table "public"."faqs" to "authenticated";

grant trigger on table "public"."faqs" to "authenticated";

grant truncate on table "public"."faqs" to "authenticated";

grant update on table "public"."faqs" to "authenticated";

grant delete on table "public"."faqs" to "service_role";

grant insert on table "public"."faqs" to "service_role";

grant references on table "public"."faqs" to "service_role";

grant select on table "public"."faqs" to "service_role";

grant trigger on table "public"."faqs" to "service_role";

grant truncate on table "public"."faqs" to "service_role";

grant update on table "public"."faqs" to "service_role";

create policy "Enable read access for all users"
on "public"."faqs"
as permissive
for select
to public
using (true);




