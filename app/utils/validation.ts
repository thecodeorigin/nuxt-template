import { z } from 'zod'

const emphasizedTitleSchema = z.object({
  text: z.string(),
  color: z.string(),
  variant: z.string(),
  font_size: z.string(),
  font_weight: z.string(),
  text_transform: z.string(),
  text_decoration: z.string(),
})

const titleSchema = z.string()
  .min(2, { message: 'Title is 2 or more characters long' })
  .max(300, { message: 'Title is 300 or less characters long' })

const descriptionSchema = z.string()
  .min(2, { message: 'Description is 2 or more characters long' })
  .max(500, { message: 'Description is 500 or less characters long' })

const labelSchema = z.string()
  .min(2, { message: 'Label is 2 or more characters long' })
  .max(20, { message: 'Label is 20 or less characters long' })

const contentSchema = z.string()
  .min(2, { message: 'Content is 2 or more characters long' })

// 👉 Hero Schema
export const heroSchema = z.object({
  hero_title: titleSchema,
  hero_title_desc: descriptionSchema,
  hero_main_img_light: z.string().nullable(),
  hero_main_img_dark: z.string().nullable(),
  hero_title_button: z.object({
    btn_link: z.string().nullable(),
    btn_label: labelSchema,
    btn_radius: z.union([z.string(), z.number()]).nullable(),
    btn_rippled: z.boolean(),
    btn_variant: z.string().nullable(),
    btn_apend_icon: z.string().nullable(),
    btn_background: z.string().nullable(),
    btn_prepend_icon: z.string().nullable(),
  }).optional(),
})

// 👉 Feature Schema
export const featureSchema = z.object({
  feature_title: titleSchema,
  feature_title_desc: descriptionSchema,
  feature_emphasized_title: emphasizedTitleSchema.optional(),
  feature_data: z.array(z.object({
    name: z.string(),
    desc: z.string(),
    icon: z.string(),
  })),
})

// 👉 Customer Review Schema
export const customerReviewSchema = z.object({
  customer_review_emphasized_title: emphasizedTitleSchema.optional(),
  customer_review_title: titleSchema,
  customer_review_title_desc: descriptionSchema,
  customer_review_data: z.array(z.object({
    id: z.any(),
    desc: z.string(),
    main_logo: z.union([z.string(), z.null()]).optional(),
    logo_dark: z.union([z.string(), z.null()]).optional(),
    logo_light: z.union([z.string(), z.null()]).optional(),
    rating: z.number(),
    name: z.string(),
    position: z.string(),
  })),
})

// 👉 Our Team Schema
export const ourTeamSchema = z.object({
  our_team_title: titleSchema,
  our_team_desc: descriptionSchema,
  our_team_emphasized_title: emphasizedTitleSchema.optional(),
  our_team_data: z.array(z.object({
    id: z.any(),
    name: z.string(),
    position: z.string(),
    image: z.string().nullable(),
    background_color: z.union([z.string(), z.null()]).optional(),
    border_color: z.union([z.string(), z.null()]).optional(),
    social_networks: z.object({
      facebook: z.string().nullable(),
      twitterX: z.string().nullable(),
      linkedin: z.string().nullable(),
    }),
  })),
})

// 👉 Pricing Schema
export const pricingSchema = z.object({
  pricing_title: titleSchema,
  pricing_title_desc: descriptionSchema,
  pricing_data: z.array(
    z.object({
      title: z.string(),
      price: z.number(),
      features: z.array(z.string()),
      support_type: z.string(),
      support_medium: z.string(),
      respond_time: z.string(),
    }),
  ).refine((data) => {
    const titles = data.map(item => item.title)
    return new Set(titles).size === titles.length
  }, {
    message: 'All pricing titles must be unique.',
  }),
})

// 👉 Product Stat Schema
export const productStatSchema = z.object({
  title: titleSchema,
  value: z.number(),
  color: z.string(),
  icon: z.string(),
})

// 👉FAQ Schema
export const faqSchema = z.object({
  faq_title: titleSchema,
  faq_title_desc: descriptionSchema,
  faq_data: z.array(z.object({
    question: contentSchema,
    answer: contentSchema,
  })),
})

// 👉 Banner Schema
export const bannerSchema = z.object({
  banner_title: titleSchema,
  banner_title_desc: descriptionSchema,
  banner_button: z.string(),
  banner_image: z.string().nullable(),
})

// 👉 About us Schema
export const contactUsSchema = z.object({
  contact_us_title: titleSchema,
  contact_us_title_desc: descriptionSchema,
  contact_us_card_title: titleSchema,
  contact_us_card_heading: titleSchema,
  contact_us_card_content: descriptionSchema,
  contact_us_card_image: z.string().nullable(),
})
