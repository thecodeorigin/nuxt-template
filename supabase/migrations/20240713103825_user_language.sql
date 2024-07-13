alter table "public"."sys_users" add column "country" character varying;

alter table "public"."sys_users" add column "language" character varying default 'en'::character varying;



