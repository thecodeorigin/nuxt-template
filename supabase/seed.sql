SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5 (Debian 14.5-2.pgdg110+2)
-- Dumped by pg_dump version 15.7 (Ubuntu 15.7-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


INSERT INTO "public"."sys_roles" ("id", "name") VALUES
	('efb00008-11a4-41dd-b614-7bfad31bdf28', 'Admin'),
	('e162c391-8bb3-46df-b185-96a344446eca', 'Editor'),
	('f0a06918-2288-4d96-9743-13e5fd2c72c9', 'Reader');


INSERT INTO "public"."sys_permissions" ("id", "role_id", "action", "subject") VALUES
	('43a6c133-1324-40cf-b1d1-5d33fa1ff44f', 'efb00008-11a4-41dd-b614-7bfad31bdf28', 'manage', 'all'),
	('430849d7-28c7-46d6-8b99-100d2d92556a', 'e162c391-8bb3-46df-b185-96a344446eca', 'manage', 'Post'),
	('cc3b639a-e623-4dfe-85ad-35e3b1850e6f', 'f0a06918-2288-4d96-9743-13e5fd2c72c9', 'read', 'Post'),
	('b2b3d424-4864-4c97-8af7-0c83e79473bd', 'e162c391-8bb3-46df-b185-96a344446eca', 'manage', 'Category'),
	('21d71641-71d6-4cb4-9a0a-16b10cb418a5', 'f0a06918-2288-4d96-9743-13e5fd2c72c9', 'read', 'Category');


SELECT pg_catalog.setval('"public"."sys_notifications_id_seq"', 1, false);

RESET ALL;
