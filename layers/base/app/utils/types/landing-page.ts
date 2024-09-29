import type { InferSelectModel } from 'drizzle-orm'
import type { DRAWER_ACTION_TYPES } from '@base/constant/landingPageConstants'
import type { sysLandingPageTable } from '@base/server/db/schemas/sys_landing_page.schema'

export type LandingPage = InferSelectModel<typeof sysLandingPageTable>

// Interface for hero section
export interface HeroButtonType {
  btn_link: string
  btn_label: string
  btn_radius: string
  btn_rippled: boolean
  btn_variant: string
  btn_apend_icon: string
  btn_background: string
  btn_prepend_icon: string
}

export type HeroSectionType = Pick<LandingPage, 'hero_title' | 'hero_title_desc' | 'hero_main_img_dark' | 'hero_main_img_light' | 'hero_sub_img_dark' | 'hero_sub_img_light' | 'hero_title_button'>

// Interface for feature section
export interface Feature {
  name: string
  desc: string
  icon: string
}

export type FeatureSectionType = Pick<LandingPage, 'feature_title' | 'feature_title_desc' | 'feature_data'>

// Interface for customer review section
export interface CustomerReview {
  id: string
  desc: string
  main_logo: string | null
  logo_dark: string | null
  logo_light: string | null
  rating: number | null
  name: string
  position: string
}
export type CustomerReviewSectionType = Pick<LandingPage, 'customer_review_title' | 'customer_review_title_desc' | 'customer_review_data'>

// Interface for our team section
export type TeamSectionType = Pick<LandingPage, 'our_team_title' | 'our_team_desc' | 'our_team_data'>

interface SocialLink {
  facebook: string | null
  twitterX: string | null
  linkedin: string | null
}
export interface TeamData {
  id: any
  name: string
  position: string
  image: string | null
  background_color: string | null
  border_color: string | null
  social_networks: SocialLink
}

// Interface for pricing section
export interface PlanData {
  title: string
  price: number
  features: string[]
  support_type: string
  support_medium: string
  respond_time: string
}

export type PricingSectionType = Pick<LandingPage, 'pricing_title' | 'pricing_title_desc' | 'pricing_data'>

// Interface for product stats
export interface ProductStatType {
  id: string
  title: string
  value: number
  color: string
  icon: IconList
}
export type ProductStatsSectionType = Pick<LandingPage, 'product_stats'>

// Interface for FAQ section
export interface FAQ {
  question: string
  answer: string
}

export type FAQSectionType = Pick<LandingPage, 'faq_title' | 'faq_title_desc' | 'faq_data'>

// Interface for banner section
export type BannerSectionType = Pick<LandingPage, 'banner_title' | 'banner_title_desc' | 'banner_button' | 'banner_image'>

// Interface for about us section
export type ContactUsSectionType = Pick<LandingPage, 'contact_us_title' | 'contact_us_title_desc' | 'contact_us_card_content' | 'contact_us_card_heading' | 'contact_us_card_image' | 'contact_us_card_title'>

// Others
export interface DrawerConfig {
  isVisible: boolean
  type: 'add' | 'edit'
}

export interface ImageType {
  name: string | null
  url: string | null
}

export type DrawerActionTypes = typeof DRAWER_ACTION_TYPES[keyof typeof DRAWER_ACTION_TYPES] | undefined

export type IconList = 'Time Line' | 'Home' | 'Settings' | 'User' | 'Calendar' | 'Search' | 'Notification' | 'Camera' | 'Shopping Cart' | 'Heart' | 'Layout' | 'User Smile' | 'Right Arrow' | 'Left Arrow' | null

export interface Icons {
  name: IconList
}

export type LandingPageStatus = 'default' | 'success' | 'error' | 'loading'

export interface LandingPageStatusEmit {
  (e: 'update:sectionStatus', value: LandingPageStatus): void
}
