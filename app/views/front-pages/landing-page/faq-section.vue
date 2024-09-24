<script setup lang="ts">
import sittingGirlWithLaptop from '@images/front-pages/landing-page/sitting-girl-with-laptop.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageElement from '@images/svg/front-page-element.svg'

const { faqData } = storeToRefs(useLandingPageStore())
</script>

<template>
  <VContainer id="faq">
    <!-- 👉 Header  -->
    <div class="faq-section">
      <div class="headers d-flex justify-center flex-column align-center mt-12 mb-16">
        <Component
          :is="frontPageElement"
          class="front-page-element"
        />
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div
            class="text-body-1 text-high-emphasis font-weight-medium"
            style="letter-spacing: 0.15px !important;"
          >
            FAQ
          </div>
        </div>

        <div class="mb-2 text-center gap-1">
          <span class="text-h5 d-inline-block mr-1" v-html="faqData?.faq_title" />
        </div>

        <p class="text-body-1 font-weight-medium text-center mb-0" v-html="faqData?.faq_title_desc" />
      </div>

      <div
        class="d-flex align-center justify-space-between flex-wrap flex-md-nowrap pb-4"
        style="gap: 6.25rem;"
      >
        <VImg
          :src="sittingGirlWithLaptop"
          height="340"
          width="320"
          class="flip-in-rtl"
        />

        <div class="flex-grow-1">
          <VExpansionPanels class="py-4">
            <VExpansionPanel
              v-for="(faq, key) in faqData?.faq_data"
              :key="key"
            >
              <VExpansionPanelTitle>
                {{ faq.question }}
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                {{ faq.answer }}
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </div>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.faq-section {
  position: relative;
  margin-block: 5.25rem 4.25rem;
}

.front-page-element {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>
