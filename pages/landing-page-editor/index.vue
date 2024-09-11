<script lang="ts" setup>
import type { LandingPageStatus } from '~/utils/types/landing-page'

 type SectionNames = 'hero' | 'feature' | 'review' | 'ourTeam' | 'pricing' | 'productStats' | 'faq' | 'banner' | 'contactUs'

type SectionStatuses = Record<SectionNames, LandingPageStatus>
type SectionLoadingStatuses = Record<SectionNames, boolean>

definePageMeta({
  sidebar: {
    title: 'Landing Page Editor',
    to: { name: 'landing-page-editor' },
    icon: { icon: 'ri-file-text-line' },
  },
})
const sectionStatuses = ref<SectionStatuses>({
  hero: 'default',
  feature: 'default',
  review: 'default',
  ourTeam: 'default',
  pricing: 'default',
  productStats: 'default',
  faq: 'default',
  banner: 'default',
  contactUs: 'default',
})

const sectionLoadingStatuses = ref<SectionLoadingStatuses>({
  hero: false,
  feature: false,
  review: false,
  ourTeam: false,
  pricing: false,
  productStats: false,
  faq: false,
  banner: false,
  contactUs: false,
})
const heroRef = ref()
const featureRef = ref()
const reviewRef = ref()
const ourTeamRef = ref()
const pricingRef = ref()
const productStatsRef = ref()
const faqRef = ref()
const bannerRef = ref()
const contactUsRef = ref()

const isAnySectionError = computed(() => {
  return Object.values(sectionStatuses.value).includes('error')
})
async function handleSectionResponse(section: keyof SectionStatuses, status: LandingPageStatus) {
  if (!status) {
    notify('Failed to update, please try again', {
      type: 'error',
      timeout: 5000,
    })
    return
  }
  sectionLoadingStatuses.value[section] = false
  sectionStatuses.value[section] = status
}

async function handleSubmitAllSections() {
  // Set all loading statuses to true
  Object.keys(sectionLoadingStatuses.value).forEach((key) => {
    sectionLoadingStatuses.value[key as keyof SectionLoadingStatuses] = true
  })

  heroRef.value?.onHeroSubmit()
  featureRef.value?.onFeatureSubmit()
  reviewRef.value?.onReviewSubmit()
  ourTeamRef.value?.onOurTeamSubmit()
  pricingRef.value?.onPricingSubmit()
  productStatsRef.value?.onProductStatsSubmit()
  faqRef.value?.onFaqSubmit()
  bannerRef.value?.onBannerSubmit()
  contactUsRef.value?.onContactSubmit()
}

function handleNavigate() {
  navigateTo('/landing-page', {
    open: {
      target: '_blank',
    },
  })
}

onMounted(() => {
  sectionStatuses.value = {
    hero: 'default',
    feature: 'default',
    review: 'default',
    ourTeam: 'default',
    pricing: 'default',
    productStats: 'default',
    faq: 'default',
    banner: 'default',
    contactUs: 'default',
  }
})
</script>

<template>
  <div class="landing-page-container">
    <div class="landing-page-header d-flex align-center justify-space-between mb-8">
      <VLabel class="text-h2 text-capitalize font-weight-bold">
        Landing page Editor
      </VLabel>
    </div>

    <VRow>
      <!-- 👉 editors -->
      <VCol col="12" md="9">
        <form class="landing-page-editor">
          <!-- Hero sections -->
          <client-only>
            <HeroSectionEditor
              id="hero-section"
              ref="heroRef"
              @update:section-status="(status) => handleSectionResponse('hero', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- Feature sections -->
          <client-only>
            <FeatureSectionEditor
              id="feature-section"
              ref="featureRef"
              @update:section-status="(status) => handleSectionResponse('feature', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- Review sections -->
          <client-only>
            <ReviewSectionEditor
              id="review-section"
              ref="reviewRef"
              @update:section-status="(status) => handleSectionResponse('review', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- Our Team sections -->
          <client-only>
            <OurTeamSectionEditor
              id="our-team-section"
              ref="ourTeamRef"
              @update:section-status="(status) => handleSectionResponse('ourTeam', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- Pricing sections -->
          <client-only>
            <PricingSectionEditor
              id="pricing-section"
              ref="pricingRef"
              @update:section-status="(status) => handleSectionResponse('pricing', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- Product Stats sections -->
          <client-only>
            <ProductStatEditor
              id="product-stats-section"
              ref="productStatsRef"
              @update:section-status="(status) => handleSectionResponse('productStats', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- FAQ sections -->
          <client-only>
            <FaqSectionEditor
              id="faq-section"
              ref="faqRef"
              @update:section-status="(status) => handleSectionResponse('faq', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- Banner sections -->
          <client-only>
            <BannerSectionEditor
              id="banner-section"
              ref="bannerRef"
              @update:section-status="(status) => handleSectionResponse('banner', status)"
            />
          </client-only>

          <VDivider class="my-8" />

          <!-- Contact Us sections -->
          <client-only>
            <ContactUsSectionEditor
              id="contact-us-section"
              ref="contactUsRef"
              @update:section-status="(status) => handleSectionResponse('contactUs', status)"
            />
          </client-only>
        </form>
      </VCol>

      <!-- 👉 PC editors status card -->
      <VCol col="12" md="3" class="d-none d-md-block">
        <VCard class="pa-4 d-flex flex-column editor-right">
          <div class="d-flex justify-space-between flex-column gap-4">
            <VCardTitle class="text-center mb-4">
              Save changes
            </VCardTitle>
            <VBtn
              type="submit"
              @click="handleSubmitAllSections"
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
                v-if="sectionStatuses.hero === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.hero === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.hero === 'error'" icon="ri-close-circle-line" class="text-error" />

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
                v-if="sectionStatuses.hero === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.feature === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.feature === 'error'" icon="ri-close-circle-line" class="text-error" />

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
                v-if="sectionStatuses.review === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.review === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.review === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                v-if="sectionStatuses.ourTeam === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.ourTeam === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.ourTeam === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                v-if="sectionStatuses.pricing === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.pricing === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.pricing === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                v-if="sectionStatuses.productStats === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.productStats === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.productStats === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                v-if="sectionStatuses.faq === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.faq === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.faq === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                v-if="sectionStatuses.banner === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.banner === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.banner === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                v-if="sectionStatuses.contactUs === 'loading'"
                indeterminate
                color="primary"
                size="20"
              />

              <VIcon v-else-if="sectionStatuses.contactUs === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

              <VIcon v-else-if="sectionStatuses.contactUs === 'error'" icon="ri-close-circle-line" class="text-error" />

              <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
            </NuxtLink>
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- 👉 TB and SP editors status card -->
    <VCard class="editor-mobile-right d-block d-md-none">
      <VRow>
        <VCol cols="12" sm="4" class="mobile-menu-status">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                :color="isAnySectionError ? 'error' : 'primary'"
                width="100%"
                v-bind="props"
              >
                Editor Status
              </v-btn>
            </template>
            <v-list>
              <!-- Hero sections -->
              <NuxtLink
                :to="{ name: 'landing-page-editor', hash: `#hero-section` }"
                class="status-container"
              >
                <span>
                  Hero section
                </span>

                <VProgressCircular
                  v-if="sectionStatuses.hero === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.hero === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.hero === 'error'" icon="ri-close-circle-line" class="text-error" />

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
                  v-if="sectionStatuses.hero === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.feature === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.feature === 'error'" icon="ri-close-circle-line" class="text-error" />

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
                  v-if="sectionStatuses.review === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.review === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.review === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                  v-if="sectionStatuses.ourTeam === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.ourTeam === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.ourTeam === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                  v-if="sectionStatuses.pricing === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.pricing === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.pricing === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                  v-if="sectionStatuses.productStats === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.productStats === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.productStats === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                  v-if="sectionStatuses.faq === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.faq === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.faq === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                  v-if="sectionStatuses.banner === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.banner === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.banner === 'error'" icon="ri-close-circle-line" class="text-error" />

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

                  v-if="sectionStatuses.contactUs === 'loading'"
                  indeterminate
                  color="primary"
                  size="20"
                />

                <VIcon v-else-if="sectionStatuses.contactUs === 'success'" icon="ri-checkbox-circle-line" class="text-success" />

                <VIcon v-else-if="sectionStatuses.contactUs === 'error'" icon="ri-close-circle-line" class="text-error" />

                <VIcon v-else icon="ri-arrow-right-s-line" class="text-primary" />
              </NuxtLink>
            </v-list>
          </v-menu>
        </VCol>

        <VCol cols="6" sm="4" class="mobile-submit-container">
          <VBtn
            type="submit"
            width="100%"
            @click="handleSubmitAllSections"
          >
            Save
          </VBtn>
        </VCol>

        <VCol cols="6" sm="4" class="mobile-preview-container">
          <VBtn
            color="primary"
            variant="outlined"
            width="100%"
            @click="handleNavigate"
          >
            Preview
          </VBtn>
        </VCol>
      </VRow>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
.landing-page-container {
  position: relative;
}

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

.editor-mobile-right {
  margin-top: 16px;
  padding: 16px;
  position: sticky;
  z-index: 999;
  bottom: 0;
  right: 0;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  width: 100%;
}

.mobile-menu-status {
  display: flex;
  justify-content: center;
  width: 100%;
}

.mobile-submit-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.mobile-preview-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
