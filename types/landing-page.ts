import type { DRAWER_ACTION_TYPES } from '@/constant/landingPageConstants'
import type { Tables } from '@/server/types/supabase'

export type LandingPage = Tables<'sys_landing_page'>

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

// type TeamSectionType = Pick<LandingPage, 'our_team_emphasized_title' | 'our_team_title' | 'our_team_desc' | 'our_team_data'>

// type PricingSectionType = Pick<LandingPage, 'pricing_emphasized_title' | 'pricing_title' | 'pricing_title_desc' | 'pricing_data'>

// type ProductStatsSectionType = Pick<LandingPage, 'product_stats'>

// type FAQSectionType = Pick<LandingPage, 'faq_emphasized_title' | 'faq_title' | 'faq_title_desc' | 'faq_data'>

// type ContactUsSectionType = Pick<LandingPage, 'contact_us_title' | 'contact_us_title_desc' | 'contact_us_card_content' | 'contact_us_card_heading' | 'contact_us_card_image' | 'contact_us_card_emphasized_heading'>

// type BannerSectionType = Pick<LandingPage, 'banner_title' | 'banner_title_desc' | 'banner_button'>

// Interface for our team section
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

export interface TeamSectionType {
  our_team_emphasized_title?: EmphasizedTitle | null
  our_team_title: string
  our_team_desc: string | null
  our_team_data: TeamData[] | null
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

export interface PricingSectionType {
  pricing_emphasized_title?: EmphasizedTitle | null
  pricing_title: string
  pricing_title_desc: string | string[]
  pricing_data: PlanData[] | null
}

// Interface for product stats
export interface ProductStatType {
  id: string
  title: string
  value: number
  color: string
  icon: IconList
}

export type IconList = 'Time Line' | 'Home' | 'Settings' | 'User' | 'Calendar' | 'Search' | 'Notification' | 'Camera' | 'Shopping Cart' | 'Heart' | 'Layout' | 'User Smile' | null

export interface ProductStatsSectionType {
  product_stats: ProductStatType[] | null
}

// Interface for FAQ section
export interface FAQ {
  question: string
  answer: string
}

export interface FAQSectionType {
  faq_emphasized_title?: EmphasizedTitle | null
  faq_title: string
  faq_title_desc: string | string[]
  faq_data: FAQ[] | null
}

export interface BannerSectionType {
  banner_title: string
  banner_title_desc: string
  banner_button: string
  banner_img: string | null
}

// Interface for about us section
export interface ContactUsSectionType {
  contact_us_title: string
  contact_us_title_desc: string | string[]
  contact_us_card_title: string
  contact_us_card_heading: string
  contact_us_card_image: string | null
  contact_us_card_content: string
}

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
