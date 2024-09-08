<script lang="ts" setup>
import type { LandingPageStatus } from '@/types/landing-page'

definePageMeta({
  sidebar: {
    title: 'Landing Page Editor',
    to: { name: 'landing-page-editor' },
    icon: { icon: 'ri-file-text-line' },
  },
})
const router = useRouter()
console.log('««««« router »»»»»', router)

const heroSectionStatus = ref<LandingPageStatus>('default')
const featureSectionStatus = ref<LandingPageStatus>('default')
const reviewSectionStatus = ref<LandingPageStatus>('default')
const ourTeamSectionStatus = ref<LandingPageStatus>('default')
const pricingSectionStatus = ref<LandingPageStatus>('default')
const productStatSectionStatus = ref<LandingPageStatus>('default')
const faqSectionStatus = ref<LandingPageStatus>('default')
const bannerSectionStatus = ref<LandingPageStatus>('default')
const contactUsSectionStatus = ref<LandingPageStatus>('default')

// function handleNavigateToHero() {
//   const heroSection = document.getElementById('hero-section')
//   if (heroSection) {
//     heroSection.scrollIntoView({ behavior: 'smooth' })
//   }
// }

// function handleNavigateToFeature() {
//   const featureSection = document.getElementById('feature-section')
//   if (featureSection) {
//     featureSection.scrollIntoView({ behavior: 'smooth' })
//   }
// }

function handleNavigate() {
  navigateTo('/landing-page', {
    open: {
      target: '_blank',
    },
  })
}
</script>

<template>
  <div class="landing-page-container">
    <div class="landing-page-header d-flex align-center justify-space-between mb-8">
      <VLabel class="text-h2 text-capitalize font-weight-bold">
        Landing page Editor
      </VLabel>
    </div>

    <VRow>
      <VCol col="12" md="9">
        <form class="landing-page-editor">
          <client-only>
            <HeroSectionEditor id="hero-section" />
          </client-only>

          <VDivider class="my-8" />
          <client-only>
            <FeatureSectionEditor id="feature-section" />
          </client-only>

          <VDivider class="my-8" />
          <client-only>
            <ReviewSectionEditor id="review-section" />
          </client-only>

          <VDivider class="my-8" />
          <client-only>
            <OurTeamSectionEditor id="our-team-section" />
          </client-only>

          <VDivider class="my-8" />
          <client-only>
            <PricingSectionEditor id="pricing-section" />
          </client-only>

          <VDivider class="my-8" />
          <client-only>
            <ProductStatEditor id="product-stat-section" />
          </client-only>

          <VDivider class="my-8" />

          <client-only>
            <FaqSectionEditor id="faq-section" />
          </client-only>

          <VDivider class="my-8" />
          <client-only>
            <BannerSectionEditor id="banner-section" />
          </client-only>

          <VDivider class="my-8" />
          <client-only>
            <ContactUsSectionEditor id="contact-us-section" />
          </client-only>
        </form>
      </VCol>

      <VCol col="12" md="3" class="d-none d-md-block">
        <VCard class="pa-4 d-flex flex-column editor-right">
          <div class="d-flex justify-space-between flex-column gap-4">
            <VCardTitle class="text-center mb-4">
              Save changes
            </VCardTitle>
            <VBtn
              type="submit"
            >
              Save
            </VBtn>

            <VBtn
              color="primary"
              variant="outlined"
              @click="handleNavigate"
            >
              Preview landing page
            </VBtn>
          </div>

          <VDivider class="my-4" />

          <div class="d-flex flex-column gap-2">
            <VCardTitle class="text-center mb-4">
              Changes status
            </VCardTitle>

            <!-- Hero sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#hero-section` }"
              class="status-container"
            >
              <span>
                Hero section
              </span>

              <VProgressCircular
                v-if="heroSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="heroSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="heroSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- Feature sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#feature-section` }"
              class="status-container"
            >
              <span>
                Feature section
              </span>

              <VProgressCircular
                v-if="heroSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="featureSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="featureSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- Review sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#review-section` }"
              class="status-container"
            >
              <span>
                Review section
              </span>

              <VProgressCircular
                v-if="reviewSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="reviewSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="reviewSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- Our team sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#our-team-section` }"
              class="status-container"
            >
              <span>
                Our team section
              </span>

              <VProgressCircular

                v-if="ourTeamSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="ourTeamSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="ourTeamSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- Pricing sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#pricing-section` }"
              class="status-container"
            >
              <span>
                Pricing section
              </span>

              <VProgressCircular

                v-if="pricingSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="pricingSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="pricingSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- Product stats sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#product-stats-section` }"
              class="status-container"
            >
              <span>
                Product stats section
              </span>

              <VProgressCircular

                v-if="productStatSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="productStatSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="productStatSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- Faq sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#faq-section` }"
              class="status-container"
            >
              <span>
                FAQ section
              </span>

              <VProgressCircular

                v-if="faqSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="faqSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="faqSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- Banner sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#banner-section` }"
              class="status-container"
            >
              <span>
                Banner section
              </span>

              <VProgressCircular

                v-if="bannerSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="bannerSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="bannerSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>

            <!-- contact us sections -->
            <NuxtLink
              :to="{ name: 'landing-page-editor', hash: `#contact-us-section` }"
              class="status-container"
            >
              <span>
                Contact us section
              </span>

              <VProgressCircular

                v-if="contactUsSectionStatus === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="contactUsSectionStatus === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="contactUsSectionStatus === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.editor-right{
  position: sticky;
  top: 70px;
}
.status-container {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;

  &:hover {
    color: var(--v-primary-base);
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}
</style>
