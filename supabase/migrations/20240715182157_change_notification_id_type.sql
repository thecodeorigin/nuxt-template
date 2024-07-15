alter table "public"."sys_notifications" alter column "id" set default gen_random_uuid();

alter table "public"."sys_notifications" alter column "id" drop identity;

alter table "public"."sys_notifications" alter column "id" set data type uuid using "id"::uuid;



