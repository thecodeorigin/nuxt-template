<script setup lang="ts">
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageVectorImg from '@images/svg/front-page-vector.svg'
import ListArrowIcon from '@images/svg/list-arrow-icon.svg'
import VectorIcon from '@images/svg/vector.svg'

import type { PricingSectionType } from '@/types/landing-page'

defineProps({
  data: {
    type: Object as PropType<PricingSectionType>,
  },
})
</script>

<template>
  <VContainer id="pricing-plan">
    <div class="pricing-plans d-flex flex-column gap-12">
      <!-- 👉 Headers  -->
      <div class="headers d-flex justify-center flex-column align-center">
        <Component
          :is="frontPageVectorImg"
          class="front-page-vector"
        />

        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div class="text-body-1 text-high-emphasis font-weight-medium">
            PRICING PLANS
          </div>
        </div>

        <div class="pricing-title-wrapper mb-2 text-center d-flex gap-1 align-end">
          <Component
            :is="data?.pricing_emphasized_title?.variant"
            v-if="data?.pricing_emphasized_title"
            :style="{
              color: data?.pricing_emphasized_title?.color,
              fontSize: `${data?.pricing_emphasized_title?.font_size}px`,
              fontWeight: data?.pricing_emphasized_title?.font_weight,
              textTransform: data?.pricing_emphasized_title?.text_transform,
              textDecoration: data?.pricing_emphasized_title?.text_decoration,
            }"
          >
            {{ data?.pricing_emphasized_title?.text }}
          </Component>

          <span class="pricing-title text-h5 d-inline-block">
            {{ data?.pricing_title }}
          </span>
        </div>

        <p v-for="(description, index) in data?.pricing_title_desc" :key="index" class="text-body-1 font-weight-medium text-center mb-0">
          {{ description }}
        </p>
      </div>

      <div class="w-75 mx-auto">
        <VSlider
          model-value="458+"
          max="1249"
          color="primary"
          thumb-label="always"
          class="mt-1"
        />
      </div>

      <VRow>
        <VCol
          v-for="(plan, index) in data?.pricing_data"
          :key="index"
        >
          <VCard
            flat
            border
            :style="plan.current ? 'border:2px solid rgb(var(--v-theme-primary))' : ''"
          >
            <VCardText class="pa-lg-8 text-no-wrap">
              <div class="d-flex flex-column gap-y-8">
                <div class="d-flex flex-column  gap-y-3">
                  <h4 class="text-h4 text-center">
                    {{ plan.title }}
                  </h4>

                  <div class="d-flex align-center gap-x-3">
                    <div class="d-flex">
                      <h5
                        class="text-h5"
                        style="margin-block-start: 0.35rem;"
                      >
                        $
                      </h5>
                      <div class="plan-price-text">
                        {{ plan.price }}
                      </div>
                    </div>
                    <div>
                      <div class="text-body-1 font-weight-medium text-high-emphasis">
                        Per month
                      </div>
                      <div class="text-body-2">
                        10% off for yearly subscription
                      </div>
                    </div>
                  </div>

                  <VectorIcon />
                </div>

                <div class="d-flex flex-column">
                  <VList class="card-list">
                    <VListItem
                      v-for="(item, i) in plan.features"
                      :key="i"
                    >
                      <template #prepend>
                        <Component
                          :is="ListArrowIcon"
                          class="me-3"
                        />
                      </template>
                      <h5 class="text-h5">
                        {{ item }}
                      </h5>
                    </VListItem>
                  </VList>

                  <VDivider class="my-4" />

                  <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                    <div>
                      <div class="text-body-1 font-weight-medium text-high-emphasis mb-1">
                        {{ plan.supportType }} Support
                      </div>
                      <div class="text-body-2">
                        {{ plan.supportMedium }}
                      </div>
                    </div>

                    <VChip
                      variant="tonal"
                      color="primary"
                      size="small"
                      class="font-weight-medium"
                    >
                      {{ plan.respondTime }}
                    </VChip>
                  </div>
                </div>

                <VBtn
                  block
                  :variant="plan.current ? 'elevated' : 'outlined'"
                  :to="{ name: 'pricing' }"
                >
                  Get Started
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style lang="scss">
.card-list {
  --v-card-list-gap: 12px;
}
</style>

<style lang="scss" scoped>
.plan-price-text {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 48px;
  font-weight: 700;
  line-height: 56px;
}

.pricing-plans {
  position: relative;
  margin-block: 5.25rem;
}

.front-page-vector {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
}
</style>
