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
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: sys_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_roles" ("id", "name") VALUES
	('efb00008-11a4-41dd-b614-7bfad31bdf28', 'Admin'),
	('e162c391-8bb3-46df-b185-96a344446eca', 'Editor'),
	('f0a06918-2288-4d96-9743-13e5fd2c72c9', 'Reader');


--
-- Data for Name: sys_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_users" ("id", "email", "phone", "full_name", "avatar_url", "billing_address", "payment_method", "created_at", "deleted_at", "role_id") VALUES
	('15e9dc17-b2fa-450c-8a94-30be5b74ef80', 'admin@demo.com', NULL, 'admin', NULL, NULL, NULL, '2024-07-13 08:09:30.342646+00', NULL, 'efb00008-11a4-41dd-b614-7bfad31bdf28');


--
-- Data for Name: stripe_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sys_faq_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_faq_categories" ("id", "title", "icon", "subtitle") VALUES
	(1, 'Payment', 'ri-bank-card-line', 'Get help with payment'),
	(2, 'Delivery', 'ri-shopping-cart-line', 'Get help with delivery'),
	(3, 'Cancellation & Return', 'ri-refresh-line', 'Get help with cancellation & return'),
	(4, 'My Order', 'ri-inbox-archive-line', 'Order details'),
	(5, 'Product & Services', 'ri-settings-4-line', 'Get help with product & services');


--
-- Data for Name: sys_faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sys_faqs" ("id", "question", "answer", "category_id") VALUES
	('d159009d-8ed9-4186-af2d-495b6856ac86', 'What should I do if I''m having trouble placing an order?', 'For any technical difficulties you are experiencing with our website, please contact us at our support portal, or you can call us toll-free at 1-000-000-000, or email us at order@companymail.com', 1),
	('4b5e0147-21fb-4012-bf0f-63896ac82e2d', 'Which license do I need for an end product that is only accessible to paying users?', 'If you have paying users or you are developing any SaaS products then you need an Extended License. For each products, you need a license. You can get free lifetime updates as well.', 1),
	('5ae5776e-6913-48c0-a935-9feb7b99e4aa', 'Does my subscription automatically renew?', 'No, This is not subscription based item.Pastry pudding cookie toffee bonbon jujubes jujubes powder topping. Jelly beans gummi bears sweet roll bonbon muffin liquorice. Wafer lollipop sesame snaps.', 1),
	('9c554116-1c39-4e66-9812-9a77c751ee11', 'How would you ship my order?', 'For large products, we deliver your product via a third party logistics company offering you the â€œroom of choiceâ€ scheduled delivery service. For small products, we offer free parcel delivery.', 2),
	('aec5f2ad-6a34-4558-9a3b-8389c4d97972', 'What is the delivery cost of my order?', 'The cost of scheduled delivery is $69 or $99 per order, depending on the destination postal code. The parcel delivery is free.', 2),
	('f5d36f62-849a-45a9-8eee-2765d22c40f7', 'What to do if my product arrives damaged?', 'We will promptly replace any product that is damaged in transit. Just contact our support team, to notify us of the situation within 48 hours of product arrival.', 2),
	('78f2ece9-7323-414e-9a77-96013d7d2465', 'Can I cancel my order?', 'Scheduled delivery orders can be cancelled 72 hours prior to your selected delivery date for full refund. Parcel delivery orders cannot be cancelled, however a free return label can be provided upon request.', 3),
	('a32e81d8-9e0e-4d0c-aa7f-2efc855932bf', 'Can I return my product?', 'You can return your product within 15 days of delivery, by contacting our support team, All merchandise returned must be in the original packaging with all original items.', 3),
	('e0666a35-8d6a-426b-8b5f-6ff3d849cf83', 'Where can I view status of return?', 'Locate the item from Your Orders. Select Return/Refund status', 3),
	('413c23f4-0b1d-4e62-a4f6-27dc8f6f12e7', 'Has my order been successful?', 'All successful order transactions will receive an order confirmation email once the order has been processed. If you have not received your order confirmation email within 24 hours, check your junk email or spam folder. Alternatively, log in to your account to check your order summary. If you do not have a account, you can contact our Customer Care Team on 1-000-000-000.', 4),
	('13262d59-867d-4c63-b447-a78e407928b6', 'My Promotion Code is not working, what can I do?', 'If you are having issues with a promotion code, please contact us at 1 000 000 000 for assistance.', 4),
	('6bf531ba-2bdf-4ce0-95cc-fcd9007cb7a5', 'How do I track my Orders?', 'If you have an account just sign into your account from here and select �My Orders�. If you have a a guest account track your order from here using the order number and the email address.', 4),
	('92e43647-c3e2-4740-9302-789e440ce923', 'Will I be notified once my order has shipped?', 'Yes, We will send you an email once your order has been shipped. This email will contain tracking and order information.', 5),
	('8677e8c4-9cb4-4445-972a-0397d6b2a12f', 'Where can I find warranty information?', 'We are committed to quality products. For information on warranty period and warranty services, visit our Warranty section here.', 5),
	('a7e8fb46-7c05-4ce9-97e3-7c767a62d095', 'How can I purchase additional warranty coverage?', 'For the peace of your mind, we offer extended warranty plans that add additional year(s) of protection to the standard manufacturer''s warranty provided by us. To purchase or find out more about the extended warranty program, visit Extended Warranty section here.', 5),
	('1c67f187-0b99-4cdc-ad65-e85f647c1c96', 'How do I pay for my order?', 'We accept Visa�, MasterCard�, American Express�, and PayPal�. Our servers encrypt all information submitted to them, so you can be confident that your credit card information will be kept safe and secure.', 1),
	('bdb34eaf-aaa7-4775-836f-e3d7a5eb654e', 'When is payment taken for my order?', 'Payment is taken during the checkout process when you pay for your order. The order number that appears on the confirmation screen indicates payment has been successfully processed.', 1);


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
-- Name: sys_faq_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."sys_faq_categories_id_seq"', 5, true);


--
-- Name: sys_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."sys_notifications_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
