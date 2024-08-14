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

--
-- Data for Name: sys_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_roles" ("id", "name") VALUES
	('efb00008-11a4-41dd-b614-7bfad31bdf28', 'Admin'),
	('e162c391-8bb3-46df-b185-96a344446eca', 'Editor'),
	('f0a06918-2288-4d96-9743-13e5fd2c72c9', 'Reader');


--
-- Data for Name: sys_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_users" ("id", "email", "phone", "full_name", "avatar_url", "created_at", "deleted_at", "role_id", "country", "language", "organization", "postcode", "status", "address", "city") VALUES
	('2fc2dd92-4b43-41d3-97bc-21d4b6b6d46c', 'panda.boojum8381@eagereverest.com', '', NULL, NULL, '2024-08-27 14:08:38.12561+00', NULL, 'e162c391-8bb3-46df-b185-96a344446eca', '', '', '', '', 'pending', '', ''),
	('e9b171fc-4fa4-42e0-8585-4ef16ebf7e70', 'nguyenhuunguyeny.ny@gmail.com', '', 'Nguyen Huu Nguyen Y', 'https://lh3.googleusercontent.com/a/ACg8ocKkgiFLInWInbH1OaNKO1mfZ3_yGFs-gnZU6GV_1WWhE-H-mHzU=s96-c', '2024-08-21 15:58:17.072941+00', NULL, 'e162c391-8bb3-46df-b185-96a344446eca', '', '', '', '', 'pending', '', ''),
	('499ca3dc-3309-466b-b720-7e1921b8fada', 'hoahaclao123@gmail.com', '', 'hoa nguyen', 'https://lh3.googleusercontent.com/a/ACg8ocIVwqBMcja4l_u8Tsk6kyC0K7YtZokpYFXF2CzPaSJtp8zyng=s96-c', '2024-08-03 13:12:40.803491+00', NULL, 'e162c391-8bb3-46df-b185-96a344446eca', '', '', '', '', 'pending', '', '');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "name", "slug", "description", "created_at", "updated_at", "image_url", "user_id", "parent_id") VALUES
	('7b4712a1-2326-4bcc-a71f-7e8f9a031c92', 'Uncategorized', 'uncategorized', NULL, '2024-08-29 15:06:05.230636+00', '2024-08-29 15:06:05.230636+00', NULL, 'e9b171fc-4fa4-42e0-8585-4ef16ebf7e70', NULL);


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stripe_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stripe_products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stripe_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stripe_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sys_faq_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sys_faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sys_landing_page; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_landing_page" ("id", "created_at", "hero_title", "hero_title_desc", "hero_title_button", "feature_emphasized_title", "feature_title", "feature_title_desc", "feature_data", "customer_review_title", "customer_review_emphasized_title", "customer_review_title_desc", "customer_review_data", "our_team_emphasized_title", "our_team_title", "our_team_desc", "our_team_data", "pricing_emphasized_title", "pricing_title", "pricing_title_desc", "pricing_data", "product_stats", "faq_emphasized_title", "faq_title", "faq_title_desc", "faq_data", "contact_us_emphasized_title", "contact_us_title", "contact_us_title_desc", "contact_us_card_heading", "contact_us_card_emphasized_heading", "contact_us_card_image", "contact_us_card_content", "hero_main_img_light", "hero_main_img_dark", "hero_sub_img_light", "hero_sub_img_dark") VALUES
	('df02f75c-afab-41ef-ab6d-e1aa04d7ec6d', '2024-07-29 16:06:06+00', '<p>Welcome <strong>to my page</strong>!!</p>', '<p>This is the hero section description, lorem ipsum longggggggggggg</p>', '{"btn_link": "/landing-page", "btn_label": "Hello world!!", "btn_radius": "xl", "btn_rippled": true, "btn_variant": "flat", "btn_apend_icon": "", "btn_background": "primary", "btn_prepend_icon": ""}', '{"text": "Emphasized Title", "color": "primary", "variant": "h2", "font_size": "16", "font_weight": "700", "text_transform": "none", "text_decoration": "none"}', 'This is a normal title', 'This is title feature', '{"{\"desc\": \"Code structure that all developers will easily understand and fall in love with.\", \"icon\": \"LaptopCharging\", \"name\": \"value1\"}","{\"desc\": \"Free updates for the next 12 months, including new demos and features.\", \"icon\": \"TransitionUp\", \"name\": \"value2\"}","{\"desc\": \"Start your project quickly without having to remove unnecessary features.\", \"icon\": \"GoogleDocs\", \"name\": \"value3\"}"}', 'This is a customer review title', '{"text": "Customer reviews emphasized Title", "color": "primary", "variant": "h2", "font_size": "16", "font_weight": "700", "text_transform": "none", "text_decoration": "none"}', '"this is a customer review title description"', '{"{\"id\": 1, \"desc\": \"value1\", \"name\": \"customer 1\", \"rating\": \"5\", \"position\": \"position 1\", \"logo_dark\": null, \"main_logo\": null, \"logo_light\": null}","{\"id\": 2, \"desc\": \"value2\", \"name\": \"customer 2\", \"rating\": \"5\", \"position\": \"position 2\", \"logo_dark\": null, \"main_logo\": null, \"logo_light\": null}","{\"id\": 3, \"desc\": \"value3\", \"name\": \"customer 3\", \"rating\": \"5\", \"position\": \"position 3\", \"logo_dark\": null, \"main_logo\": null, \"logo_light\": null}","{\"id\": 4, \"desc\": \"value4\", \"name\": \"customer 4\", \"rating\": \"4\", \"position\": \"position 4\", \"logo_dark\": null, \"main_logo\": null, \"logo_light\": null}"}', '{"text": "Our team emphasized Title", "color": "primary", "variant": "h2", "font_size": "16", "font_weight": "700", "text_transform": "none", "text_decoration": "none"}', 'This is our team title', 'this is our team title description', '{"{\"id\": \"1\", \"name\": \"Sophie Gilbert\", \"image\": \"teamPerson1\", \"position\": \"Project Manager\", \"borderColor\": \"rgba(144, 85, 253, 0.38)\", \"backgroundColor\": \"rgba(144, 85, 253, 0.16)\", \"social_networks\": {\"linkein\": \"https://www.linkedin.com/\", \"facebook\": \"https://www.facebook.com\", \"twitterX\": \"https://www.x.com\"}}","{\"id\": \"2\", \"name\": \"Nannie Ford\", \"image\": \"teamPerson2\", \"position\": \"Development Lead\", \"borderColor\": \"rgba(255, 76, 81,0.38)\", \"backgroundColor\": \"rgba(255, 76, 81, 0.16)\", \"social_networks\": {\"linkein\": \"https://www.linkedin.com/\", \"facebook\": \"https://www.facebook.com\", \"twitterX\": \"https://www.x.com\"}}","{\"id\": \"3\", \"name\": \"Chris Watkins\", \"image\": \"teamPerson3\", \"position\": \"Marketing Manager\", \"borderColor\": \"rgba(86, 202, 0,0.38)\", \"backgroundColor\": \"rgba(86, 202, 0, 0.16)\", \"social_networks\": {\"linkein\": \"https://www.linkedin.com/\", \"facebook\": \"https://www.facebook.com\", \"twitterX\": \"https://www.x.com\"}}","{\"id\": \"4\", \"name\": \"Paul Miles\", \"image\": \"teamPerson4\", \"position\": \"UI Designer\", \"borderColor\": \"rgba(22, 177, 255,0.38)\", \"backgroundColor\": \"rgba(22, 177, 255, 0.16)\", \"social_networks\": {\"linkein\": \"https://www.linkedin.com/\", \"facebook\": \"https://www.facebook.com\", \"twitterX\": \"https://www.x.com\"}}"}', '{"text": "Pricing emphasized Title", "color": "primary", "variant": "h2", "font_size": "30", "font_weight": "900", "text_transform": "none", "text_decoration": "none"}', 'This is pricing title', 'this is pricing title description"', '{"{\"price\": 20, \"title\": \"Basic Plan\", \"current\": false, \"features\": [\"Timeline\", \"Basic search\", \"Live chat widget\", \"Email marketing\", \"Custom Forms\", \"Traffic analytics\"], \"respondTime\": \"AVG. Time: 24h\", \"supportType\": \"Basic\", \"supportMedium\": \"Only Email\"}","{\"price\": 51, \"title\": \"Favourite Plan\", \"current\": true, \"features\": [\"Everything in basic\", \"Timeline with database\", \"Advanced search\", \"Marketing automation\", \"Advanced chatbot\", \"Campaign management\"], \"respondTime\": \"AVG. Time: 6h\", \"supportType\": \"Standard\", \"supportMedium\": \"Email & Chat\"}","{\"price\": 99, \"title\": \"Standard Plan\", \"current\": false, \"features\": [\"Campaign management\", \"Timeline with database\", \"Fuzzy search\", \"A/B testing sandbox\", \"Custom permissions\", \"Social media automation\"], \"respondTime\": \"Live Support\", \"supportType\": \"Exclusive\", \"supportMedium\": \"Email, Chat & Google Meet\"}"}', '{"{\"id\": \"1\", \"icon\": \"ri-layout-line\", \"color\": \"primary\", \"title\": \"Completed Sites\", \"value\": 137}","{\"id\": \"2\", \"icon\": \"ri-time-line\", \"color\": \"success\", \"title\": \"Working Hours\", \"value\": 1100}","{\"id\": \"3\", \"icon\": \"ri-user-smile-line\", \"color\": \"warning\", \"title\": \"Happy Customers\", \"value\": 137}","{\"id\": \"4\", \"icon\": \"ri-award-line\", \"color\": \"info\", \"title\": \"Awards Winning\", \"value\": 23}"}', '{"text": "FAQ emphasized Title", "color": "primary", "variant": "h2", "font_size": "30", "font_weight": "900", "text_transform": "none", "text_decoration": "none"}', 'This is FAQ title', 'this is faq title description', '{"{\"answer\": \"Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping. Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder. Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie.\", \"question\": \"Do you charge for each upgrade?\"}","{\"answer\": \"Regular license can be used for end products that do not charge users for access or service(access is free and there will be no monthly subscription fee). Single regular license can be used for single end product and end product can be used by you or your client. If you want to sell end product to multiple clients then you will need to purchase separate license for each client. The same rule applies if you want to use the same end product on multiple domains(unique setup). For more info on regular license you can check official description.\", \"question\": \"What is regular license?\"}","{\"answer\": \"Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis et aliquid quaerat possimus maxime! Mollitia reprehenderit neque repellat deleniti delectus architecto dolorum maxime, blanditiis earum ea, incidunt quam possimus cumque.\", \"question\": \"What is extended license?\"}","{\"answer\": \"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sequi molestias exercitationem ab cum nemo facere voluptates veritatis quia, eveniet veniam at et repudiandae mollitia ipsam quasi labore enim architecto non!\", \"question\": \"Which license is applicable for SASS application?\"}"}', '{"text": "About us emphasized Title", "color": "primary", "variant": "h2", "font_size": "30", "font_weight": "900", "text_transform": "none", "text_decoration": "none"}', 'This is About us title', 'this is about us title description"', 'Let''s contact with us', '{"text": "About us emphasized Card", "color": "primary", "variant": "h2", "font_size": "30", "font_weight": "900", "text_transform": "none", "text_decoration": "none"}', 'ConnectImg', 'Card content', '', '', '', '');


--
-- Data for Name: sys_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sys_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_permissions" ("id", "role_id", "action", "subject") VALUES
	('43a6c133-1324-40cf-b1d1-5d33fa1ff44f', 'efb00008-11a4-41dd-b614-7bfad31bdf28', 'manage', 'all'),
	('430849d7-28c7-46d6-8b99-100d2d92556a', 'e162c391-8bb3-46df-b185-96a344446eca', 'manage', 'Post'),
	('cc3b639a-e623-4dfe-85ad-35e3b1850e6f', 'f0a06918-2288-4d96-9743-13e5fd2c72c9', 'read', 'Post'),
	('b2b3d424-4864-4c97-8af7-0c83e79473bd', 'e162c391-8bb3-46df-b185-96a344446eca', 'manage', 'Category'),
	('21d71641-71d6-4cb4-9a0a-16b10cb418a5', 'f0a06918-2288-4d96-9743-13e5fd2c72c9', 'read', 'Category');


--
-- Data for Name: sys_shortcuts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_devices; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_shortcuts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: sys_faq_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."sys_faq_categories_id_seq"', 1, false);


--
-- Name: user_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."user_devices_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
