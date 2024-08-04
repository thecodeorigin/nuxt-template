export interface HeroSectionType {
  main_title: string
  main_title_desc: string[]
  main_title_button: {
    btn_link: string
    btn_label: string
    btn_radius: number
    btb_rippled: boolean
    btn_variant: string
    btn_apend_icon: string
    btn_background: string
    btn_prepend_icon: string
  }
}

// Interface for feature section
interface EmphasizedTitle {
  text: string
  color: string
  variant: string
  font_size: string
  font_weight: string
  text_transform: string
  text_decoration: string
}

interface Feature {
  name: string
  desc: string
  icon: string
}

export interface FeatureSectionType {
  feature_emphasized_title: EmphasizedTitle | null
  feature_title: string | null
  feature_title_desc: string | null
  feature_data: Feature[] | null
}

// Interface for customer review section
interface CustomerReview {
  desc: string
  main_logo: string
  logo_dark: string
  logo_light: string
  rating: number
  name: string
  position: string
}

export interface CustomerReviewSectionType {
  customer_review_emphasized_title: EmphasizedTitle | null
  customer_review_title: string
  customer_review_title_desc: string
  customer_review_data: CustomerReview[]
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
  our_team_desc: string
  our_team_data: TeamData[]
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
  pricing_emphasized_title: EmphasizedTitle | null
  pricing_title: string
  pricing_title_desc: string
  pricing_data: Plan[]
}

// Interface for product stats
export interface ProductStat {
  id: number
  title: string
  value: number
}

// Modify the array type as needed
export type ProductStatType = ProductStat[]
