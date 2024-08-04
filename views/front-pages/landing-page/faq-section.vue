<script setup lang="ts">
import sittingGirlWithLaptop from '@images/front-pages/landing-page/sitting-girl-with-laptop.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageElement from '@images/svg/front-page-element.svg'
import type { FAQSectionType } from '@/types/landing-page'

defineProps({
  data: {
    type: Object as PropType<FAQSectionType>,
  },
})
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
          <span class="text-h5 d-inline-block mr-1">
            {{ data?.faq_title }}
          </span>

          <component
            :is="data?.faq_emphasized_title?.variant"
            v-if="data?.faq_emphasized_title"
            :style="{
              color: data?.faq_emphasized_title?.color,
              fontSize: `${data?.faq_emphasized_title?.font_size}px`,
              fontWeight: data?.faq_emphasized_title?.font_weight,
              textTransform: data?.faq_emphasized_title?.text_transform,
              textDecoration: data?.faq_emphasized_title?.text_decoration,
            }"
            class="d-inline-block "
          >
            {{ data?.faq_emphasized_title?.text }}
          </component>
        </div>

        <p v-for="(description, index) in data?.faq_title_desc" :key="index" class="text-body-1 font-weight-medium text-center mb-0">
          {{ description }}
        </p>
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

        <div>
          <VExpansionPanels class="py-4">
            <VExpansionPanel
              v-for="(faq, key) in data?.faq_data"
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
