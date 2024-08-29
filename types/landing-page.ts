interface EmphasizedTitle {
  text: string
  color: string
  variant: string
  font_size: string
  font_weight: string
  text_transform: string
  text_decoration: string
}

// Interface for hero section
export interface HeroSectionType {
  hero_title: string
  hero_title_desc: string
  hero_title_button: {
    btn_link: string
    btn_label: string
    btn_radius: number | string
    btn_rippled: boolean
    btn_variant: string
    btn_apend_icon: string
    btn_background: string
    btn_prepend_icon: string
  }
}

// Interface for feature section
interface Feature {
  name: string
  desc: string
  icon: string
}

export interface FeatureSectionType {
  feature_emphasized_title?: EmphasizedTitle
  feature_title: string
  feature_title_desc: string
  feature_data: Feature[]
}

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

export interface CustomerReviewSectionType {
  customer_review_emphasized_title?: EmphasizedTitle | null
  customer_review_title: string
  customer_review_title_desc: string | string[]
  customer_review_data: CustomerReview[] | null
}

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

// Interface for about us section
export interface ContactUsSectionType {
  contact_us_emphasized_title: EmphasizedTitle | null
  contact_us_title: string
  contact_us_title_desc: string | string[]
  contact_us_card_heading: string
  contact_us_card_emphasized_heading?: EmphasizedTitle | null
  contact_us_card_image: string
  contact_us_card_content: string
}

// Others
export interface DrawerConfig {
  isVisible: boolean
  type: 'add' | 'edit'
}
