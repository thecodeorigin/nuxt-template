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
  id: any
  desc: string
  main_logo: string
  logo_dark: string
  logo_light: string
  rating: number
  name: string
  position: string
}

export interface DrawerConfig {
  isVisible: boolean
  type: 'add' | 'edit'
  reviewerId: any
}

export interface CustomerReviewSectionType {
  customer_review_emphasized_title?: EmphasizedTitle | null
  customer_review_title: string
  customer_review_title_desc: string
  customer_review_data: CustomerReview[] | null
}

// Interface for our team section
interface SocialLink {
  facebook: string
  twitterX: string
  linkedin: string
}
interface TeamData {
  id: any
  name: string
  position: string
  image: string
  backgroundColor: string
  borderColor: string
  social_networks: SocialLink
}

export interface TeamSectionType {
  our_team_emphasized_title: EmphasizedTitle | null
  our_team_title: string
  our_team_desc: string | null
  our_team_data: TeamData[] | null
}

// Interface for pricing section
interface Plan {
  title: string
  price: number
  features: string[]
  supportType: string
  supportMedium: string
  respondTime: string
  current: boolean
}

export interface PricingSectionType {
  pricing_emphasized_title?: EmphasizedTitle | null
  pricing_title: string
  pricing_title_desc: string
  pricing_data: Plan[] | null
}

// Interface for product stats
export interface ProductStatType {
  id: number
  title: string
  value: number
  color: string
  icon: string
}

export interface ProductStatsSectionType {
  product_stats: ProductStatType[] | null
}

// Interface for FAQ section
interface FAQ {
  question: string
  answer: string
}

export interface FAQSectionType {
  faq_emphasized_title?: EmphasizedTitle | null
  faq_title: string
  faq_title_desc: string
  faq_data: FAQ[] | null
}

// Interface for about us section

export interface ContactUsSectionType {
  contact_us_emphasized_title: EmphasizedTitle | null
  contact_us_title: string
  contact_us_title_desc: string
  contact_us_card_heading: string
  contact_us_card_emphasized_heading?: EmphasizedTitle | null
  contact_us_card_image: string
  contact_us_card_content: string
}
