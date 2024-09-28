<script setup lang="ts">
import { useConfigStore } from '@materialize/@core/stores/config'

import Footer from '@materialize/views/front-pages/front-page-footer.vue'
import Navbar from '@materialize/views/front-pages/front-page-navbar.vue'
import Banner from '@materialize/views/front-pages/landing-page/banner.vue'
import ContactUs from '@materialize/views/front-pages/landing-page/contact-us.vue'
import CustomersReview from '@materialize/views/front-pages/landing-page/customers-review.vue'
import FaqSection from '@materialize/views/front-pages/landing-page/faq-section.vue'
import Features from '@materialize/views/front-pages/landing-page/features.vue'
import HeroSection from '@materialize/views/front-pages/landing-page/hero-section.vue'
import OurTeam from '@materialize/views/front-pages/landing-page/our-team.vue'
import PricingPlans from '@materialize/views/front-pages/landing-page/pricing-plans.vue'
import ProductStats from '@materialize/views/front-pages/landing-page/product-stats.vue'

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
</script>

<template>
  <div class="landing-page-wrapper">
    <Navbar :active-id="activeSectionId" />

    <!-- 👉 Hero Section  -->
    <HeroSection ref="refHome" />

    <!-- 👉 Useful features  -->
    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <Features ref="refFeatures" />
    </div>

    <!-- 👉 Customer Review -->
    <CustomersReview />

    <!-- 👉 Our Team -->
    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <OurTeam ref="refTeam" />
    </div>

    <!-- 👉 Pricing Plans -->
    <PricingPlans />

    <!-- 👉 Product stats -->
    <ProductStats />

    <!-- 👉 FAQ Section -->
    <FaqSection ref="refFaq" />

    <!-- 👉 Banner  -->
    <Banner />

    <!-- 👉 Contact Us  -->
    <ContactUs ref="refContact" />

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
