create table "public"."user_payment_methods" (
    "id" uuid not null default gen_random_uuid(),
    "number" text not null,
    "placeholder" text not null,
    "cvv" numeric not null,
    "expires_at" date not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone
);


alter table "public"."user_payment_methods" enable row level security;

alter table "public"."sys_users" drop column "billing_address";

alter table "public"."sys_users" drop column "payment_method";

alter table "public"."sys_users" add column "address" text;

alter table "public"."sys_users" add column "city" text;

CREATE UNIQUE INDEX user_payment_methods_pkey ON public.user_payment_methods USING btree (id);

alter table "public"."user_payment_methods" add constraint "user_payment_methods_pkey" PRIMARY KEY using index "user_payment_methods_pkey";

alter table "public"."user_payment_methods" add constraint "public_user_payment_methods_user_id_fkey" FOREIGN KEY (user_id) REFERENCES sys_users(id) ON DELETE CASCADE not valid;

alter table "public"."user_payment_methods" validate constraint "public_user_payment_methods_user_id_fkey";

grant delete on table "public"."user_payment_methods" to "anon";

grant insert on table "public"."user_payment_methods" to "anon";

grant references on table "public"."user_payment_methods" to "anon";

grant select on table "public"."user_payment_methods" to "anon";

grant trigger on table "public"."user_payment_methods" to "anon";

grant truncate on table "public"."user_payment_methods" to "anon";

grant update on table "public"."user_payment_methods" to "anon";

grant delete on table "public"."user_payment_methods" to "authenticated";

grant insert on table "public"."user_payment_methods" to "authenticated";

grant references on table "public"."user_payment_methods" to "authenticated";

grant select on table "public"."user_payment_methods" to "authenticated";

grant trigger on table "public"."user_payment_methods" to "authenticated";

grant truncate on table "public"."user_payment_methods" to "authenticated";

grant update on table "public"."user_payment_methods" to "authenticated";

grant delete on table "public"."user_payment_methods" to "service_role";

grant insert on table "public"."user_payment_methods" to "service_role";

grant references on table "public"."user_payment_methods" to "service_role";

grant select on table "public"."user_payment_methods" to "service_role";

grant trigger on table "public"."user_payment_methods" to "service_role";

grant truncate on table "public"."user_payment_methods" to "service_role";

grant update on table "public"."user_payment_methods" to "service_role";



