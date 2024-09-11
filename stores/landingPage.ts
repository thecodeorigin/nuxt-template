import { pick } from 'lodash-es'
import type { Tables } from '@/server/types/supabase'

import type { BannerSectionType, ContactUsSectionType, CustomerReviewSectionType, FAQSectionType, FeatureSectionType, HeroSectionType, LandingPage, PricingSectionType, ProductStatsSectionType, TeamSectionType } from '~/utils/types/landing-page'

export const useLandingPageStore = defineStore('landing-page', () => {
type LandingPage = Tables<'sys_landing_page'>

const landingPageData = ref<LandingPage>()
const heroData = ref<HeroSectionType>()
const featureData = ref<FeatureSectionType>()
const customerReviewData = ref<CustomerReviewSectionType>()
const ourTeamData = ref<TeamSectionType>()
const pricingPlansData = ref<PricingSectionType>()
const productStatsData = ref<ProductStatsSectionType>()
const faqData = ref<FAQSectionType>()
const contactData = ref<ContactUsSectionType>()
const bannerData = ref<BannerSectionType>()

async function fetchLandingPageData() {
  try {
    const data = await $api('/api/pages/landing-page')
    landingPageData.value = data as LandingPage
  }
  catch (error) {
    console.error(error)
  }
}

watch(() => landingPageData.value, (data) => {
  if (data) {
    heroData.value = pick(data, ['hero_title', 'hero_title_desc', 'hero_title_button']) as HeroSectionType

    featureData.value = pick(data, ['feature_title', 'feature_emphasized_title', 'feature_title_desc', 'feature_data']) as FeatureSectionType

    customerReviewData.value = pick(data, ['customer_review_title', 'customer_review_data', 'customer_review_title_desc', 'customer_review_emphasized_title']) as CustomerReviewSectionType

    ourTeamData.value = pick(data, ['our_team_title', 'our_team_data', 'our_team_desc', 'our_team_emphasized_title']) as TeamSectionType

    pricingPlansData.value = pick(data, ['pricing_title', 'pricing_data', 'pricing_title_desc', 'pricing_emphasized_title']) as PricingSectionType

    productStatsData.value = pick(data, 'product_stats') as ProductStatsSectionType

    faqData.value = pick(data, ['faq_data', 'faq_title', 'faq_title_desc', 'faq_emphasized_title']) as FAQSectionType

    contactData.value = pick(data, ['contact_us_title', 'contact_us_title_desc', 'contact_us_card_heading', 'contact_us_card_title', 'contact_us_card_image', 'contact_us_card_content']) as ContactUsSectionType

    bannerData.value = pick(data, 'banner_title', 'banner_title_desc', 'banner_button', 'banner_image') as BannerSectionType
  }
})

onBeforeMount(fetchLandingPageData)

return {
  landingPageData,
  heroData,
  featureData,
  customerReviewData,
  ourTeamData,
  pricingPlansData,
  productStatsData,
  faqData,
  contactData,
  bannerData,
}
})
