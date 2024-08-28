<script setup lang="ts">
import logo2dark from '@images/front-pages/branding/logo-2-dark.png'
import logo2light from '@images/front-pages/branding/logo-2-light.png'
import logo2 from '@images/front-pages/branding/logo-2.png'

import { register } from 'swiper/element/bundle'

import sectionTitleIcon from '@images/pages/section-title-icon.png'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'

const { customerReviewData } = storeToRefs(useLandingPageStore())

register()

const brandLogo2 = useGenerateImageVariant(logo2light, logo2dark)
</script>

<template>
  <div class="customer-reviews">
    <!-- 👉 Headers  -->
    <div class="headers d-flex justify-center flex-column align-center mb-8">
      <div class="d-flex gap-x-3 mb-6">
        <img
          :src="sectionTitleIcon"
          alt="section title icon"
          height="24"
          width="25"
        >
        <div class="text-body-1 text-high-emphasis font-weight-medium">
          REAL CUSTOMERS REVIEWS
        </div>
      </div>

      <div class="mb-2 text-center text-h5">
        {{ customerReviewData?.customer_review_title }}
      </div>

      <p class="text-body-1 font-weight-medium text-center">
        {{ customerReviewData?.customer_review_title_desc }}
      </p>
    </div>

    <div class="swiper-reviews-carousel py-4 mb-6">
      <!-- eslint-disable vue/attribute-hyphenation -->
      <ClientOnly>
        <swiper-container
          slides-per-view="1"
          space-between="10"
          centered-slides="true"
          loop="true"
          autoplay-delay="3000"
          autoplay-disable-on-interaction="false"
          events-prefix="swiper-"
          :pagination="{
            clickable: 'true',
          }"
          :injectStyles="[
            `
          .swiper-pagination{
            position: static;
            margin-block: 1rem;
          },
          .swiper-pagination-bullet-active{
            width: 1rem;
          }

      `]"
          :breakpoints="{
            1400: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
            992: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
          }"
        >
          <swiper-slide
            v-for="(review, index) in customerReviewData?.customer_review_data"
            :key="index"
          >
            <VCard class="h-100 d-flex align-stretch">
              <VCardText class="pa-4 pa-sm-6 pa-md-8 d-flex flex-column justify-space-between align-center">
                <img
                  :src="review.main_logo ? review.main_logo : brandLogo2"
                  style="block-size: 1.75rem;"
                >

                <div class="text-body-1 text-high-emphasis text-center">
                  {{ review.desc }}
                </div>

                <div>
                  <VRating
                    :model-value="review.rating"
                    :size="8"
                    color="warning"
                  />
                </div>

                <div class="text-center">
                  <div class="text-body-1 text-high-emphasis font-weight-medium">
                    {{ review.name }}
                  </div>

                  <div class="text-body-2">
                    {{ review.position }}
                  </div>
                </div>
              </VCardText>
            </VCard>
          </swiper-slide>
        </swiper-container>
      </ClientOnly>
    </div>

    <!-- 👉 Brand-logo Swiper  -->
    <div class="swiper-brands-carousel mt-4">
      <ClientOnly>
        <swiper-container
          slides-per-view="1"
          loop="true"
          events-prefix="swiper-"
          :breakpoints="{
            992: {
              slidesPerView: 5,
            },
            768: {
              centeredSlides: true,
              slidesPerView: 3,
            },
            580: {
              centeredSlides: true,
              slidesPerView: 2,
            },
          }"
        >
          <swiper-slide
            v-for="(review, index) in customerReviewData?.customer_review_data"
            :key="index"
          >
            <VImg
              :src="review.logo_light && review.logo_dark ? useGenerateImageVariant(review.logo_light, review.logo_dark) : logo2"
              height="28"
            />
          </swiper-slide>
        </swiper-container>
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="scss">
@use "swiper/css/bundle";

swiper-container::part(bullet-active) {
  border-radius: 6px;
  background-color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
  inline-size: 38px;
}

swiper-container::part(bullet) {
  background-color: rgba(var(--v-theme-on-background));
}

swiper-container::part(pagination) {
  margin-block: 1.5rem;
}

.swiper-reviews-carousel {
  swiper-container {
    --swiper-pagination-bullet-width: 10px;
    --swiper-pagination-bullet-height: 10px;
    --swiper-pagination-bullet-horizontal-gap: 6px;

    .swiper {
      padding-block-end: 3rem;
    }
  }

  swiper-slide {
    block-size: auto;
    opacity: 0.5;
    padding-block: 1rem;
    padding-block-end: 1rem;
    transition: all 0.35s ease;

    &.swiper-slide-active {
      opacity: 1;
      padding-block: 0;
    }
  }

  .swiper-pagination {
    inset-block: 0 0 !important;
  }
}
</style>

<style lang="scss" scoped>
.customer-reviews {
  margin-block: 6.25rem;
}
</style>
