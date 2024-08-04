<script setup lang="ts">
import { useConfigStore } from '@core/stores/config'
import { pick } from 'lodash-es'

import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import Banner from '@/views/front-pages/landing-page/banner.vue'
import ContactUs from '@/views/front-pages/landing-page/contact-us.vue'
import CustomersReview from '@/views/front-pages/landing-page/customers-review.vue'
import FaqSection from '@/views/front-pages/landing-page/faq-section.vue'
import Features from '@/views/front-pages/landing-page/features.vue'
import HeroSection from '@/views/front-pages/landing-page/hero-section.vue'
import OurTeam from '@/views/front-pages/landing-page/our-team.vue'
import PricingPlans from '@/views/front-pages/landing-page/pricing-plans.vue'
import ProductStats from '@/views/front-pages/landing-page/product-stats.vue'
import type { Tables } from '@/server/types/supabase'
import type { ContactUsSectionType, CustomerReviewSectionType, FAQSectionType, FeatureSectionType, HeroSectionType, PricingSectionType, ProductStatsSectionType, TeamSectionType } from '@/types/landing-page'

type LandingPage = Tables<'sys_landing_page'>

const store = useConfigStore()

store.skin = 'default'
definePageMeta({
  layout: 'blank',

})

const activeSectionId = ref()
const refHome = ref()
const refFeatures = ref()
const refTeam = ref()
const refContact = ref()
const refFaq = ref()

useIntersectionObserver(
  [refHome, refFeatures, refTeam, refContact, refFaq],
  ([{ isIntersecting, target }]) => {
    if (isIntersecting)
      activeSectionId.value = target.id
  },
  {
    threshold: 0.25,
  },
)

const landingPageData = ref<LandingPage>()
const heroSectionData = ref<HeroSectionType>()
const featureSectionData = ref<FeatureSectionType>()
const customerReviewSectionData = ref<CustomerReviewSectionType>()
const ourTeamSectionData = ref<TeamSectionType>()
const pricingPlansSectionData = ref<PricingSectionType>()
const ProductStatsData = ref<ProductStatsSectionType>()
const faqData = ref<FAQSectionType>()
const contactData = ref<ContactUsSectionType>()

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
    heroSectionData.value = pick(data, ['main_title', 'main_title_desc', 'main_title_button']) as HeroSectionType

    featureSectionData.value = pick(data, ['feature_title', 'feature_emphasized_title', 'feature_title_desc', 'feature_data']) as FeatureSectionType

    customerReviewSectionData.value = pick(data, ['customer_review_title', 'customer_review_data', 'customer_review_title_desc', 'customer_review_emphasized_title']) as CustomerReviewSectionType

    ourTeamSectionData.value = pick(data, ['our_team_title', 'our_team_data', 'our_team_desc', 'our_team_emphasized_title']) as TeamSectionType

    pricingPlansSectionData.value = pick(data, ['pricing_title', 'pricing_data', 'pricing_title_desc', 'pricing_emphasized_title']) as PricingSectionType

    ProductStatsData.value = pick(data, 'product_stats') as ProductStatsSectionType

    faqData.value = pick(data, ['faq_data', 'faq_title', 'faq_title_desc', 'faq_emphasized_title']) as FAQSectionType

    contactData.value = pick(data, ['contact_us_title', 'contact_us_emphasized_title', 'contact_us_title_desc', 'contact_us_card_heading', 'contact_us_card_emphasized_heading', 'contact_us_card_image', 'contact_us_card_content']) as ContactUsSectionType
  }
})

onBeforeMount(fetchLandingPageData)
</script>

<template>
  <div class="landing-page-wrapper">
    <Navbar :active-id="activeSectionId" />

    <!-- 👉 Hero Section  -->
    <HeroSection ref="refHome" :data="heroSectionData" />

    <!-- 👉 Useful features  -->
    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <Features ref="refFeatures" :data="featureSectionData" />
    </div>

    <!-- 👉 Customer Review -->
    <CustomersReview :data="customerReviewSectionData" />

    <!-- 👉 Our Team -->
    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <OurTeam ref="refTeam" :data="ourTeamSectionData" />
    </div>

    <!-- 👉 Pricing Plans -->
    <PricingPlans :data="pricingPlansSectionData" />

    <!-- 👉 Product stats -->
    <ProductStats :data="ProductStatsData" />

    <!-- 👉 FAQ Section -->
    <FaqSection ref="refFaq" :data="faqData" />

    <!-- 👉 Banner  -->
    <Banner />

    <!-- 👉 Contact Us  -->
    <ContactUs ref="refContact" :data="contactData" />

    <!-- 👉 Footer -->
    <Footer />
  </div>
</template>

<style lang="scss">
@media (max-width: 960px) and (min-width: 600px) {
  .landing-page-wrapper {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
