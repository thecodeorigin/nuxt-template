ALTER TABLE "sys_landing_page" ALTER COLUMN "banner_button" SET DEFAULT 'Get Started';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "banner_title" SET DEFAULT 'This is a banner title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "banner_title_desc" SET DEFAULT 'This is a banner description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "contact_us_card_content" SET DEFAULT 'This is a contact us card content';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "contact_us_card_heading" SET DEFAULT 'This is a contact us card heading';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "contact_us_card_title" SET DEFAULT 'This is a contact us card title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "contact_us_title" SET DEFAULT 'This is a contact us title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "contact_us_title_desc" SET DEFAULT 'This is a contact us description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "contact_us_title_desc" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "customer_review_data" SET DEFAULT '[{"id":"","desc":"","main_logo":null,"logo_dark":null,"logo_light":null,"name":"","position":"","rating":0}]'::jsonb;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "customer_review_title" SET DEFAULT 'This is a customer review title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "customer_review_title_desc" SET DEFAULT 'This is a customer review description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "customer_review_title_desc" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "faq_data" SET DEFAULT '[{"question":"","answer":""}]'::jsonb;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "faq_title" SET DEFAULT 'This is a faq title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "faq_title_desc" SET DEFAULT 'This is a faq description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "feature_data" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "feature_title" SET DEFAULT 'This is a feature title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "feature_title_desc" SET DEFAULT 'This is a feature description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "hero_title" SET DEFAULT 'This is a hero title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "hero_title_button" SET DEFAULT '[{"btn_link":"","btn_label":"","btn_radius":"","btn_rippled":false,"btn_variant":"flat","btn_apend_icon":"","btn_background":"","btn_prepend_icon":""}]'::jsonb;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "hero_title_desc" SET DEFAULT 'This is a hero description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "our_team_data" SET DEFAULT '[{"id":"","name":"","position":"","image":null,"background_color":"","border_color":"","social_networks":{"facebook":null,"twitterX":null,"linkedin":null}}]'::jsonb;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "our_team_desc" SET DEFAULT 'This is a our team description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "our_team_title" SET DEFAULT 'This is a our team title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "pricing_data" SET DEFAULT '[{"title":"","price":0,"features":[],"support_type":"","support_medium":"","respond_time":""}]'::jsonb;--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "pricing_title" SET DEFAULT 'This is a pricing title';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "pricing_title_desc" SET DEFAULT 'This is a pricing description';--> statement-breakpoint
ALTER TABLE "sys_landing_page" ALTER COLUMN "product_stats" SET DEFAULT '[{"id":"","title":"","value":0,"color":"","icon":null}]'::jsonb;