<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { useTheme } from 'vuetify'
import darkBg from '@materialize/images/front-pages/backgrounds/hero-bg-dark.png'
import lightBg from '@materialize/images/front-pages/backgrounds/hero-bg.png'
import heroDashboardImgDark from '@materialize/images/front-pages/landing-page/hero-dashboard-dark.png'
import heroDashboardImgLight from '@materialize/images/front-pages/landing-page/hero-dashboard-light.png'
import heroElementsImgDark from '@materialize/images/front-pages/landing-page/hero-elements-dark.png'
import heroElementsImgLight from '@materialize/images/front-pages/landing-page/hero-elements-light.png'
import { useGenerateImageVariant } from '@materialize/@core/composable/useGenerateImageVariant'
import type { HeroButtonType } from '@utils/types/landing-page'

const { heroData } = storeToRefs(useLandingPageStore())

const theme = useTheme()
const isDark = ref(theme.name)

const heroButtonData = computed<HeroButtonType | null>(() => {
  return heroData.value?.hero_title_button as HeroButtonType | null
})

const heroBgUrl = computed(() => {
  if (isDark.value === 'dark')
    return darkBg
  else
    return lightBg
})

const heroMainImg = computed(() => {
  if (!heroData.value?.hero_main_img_dark && heroData.value?.hero_main_img_light) {
    return useGenerateImageVariant(heroDashboardImgLight, heroDashboardImgDark)
  }
  else {
    return useGenerateImageVariant(heroData.value?.hero_main_img_light as string, heroData.value?.hero_main_img_dark as string)
  }
})

const heroSubImg = computed(() => {
  if (!heroData.value?.hero_sub_img_dark && heroData.value?.hero_sub_img_light) {
    return useGenerateImageVariant(heroElementsImgLight, heroElementsImgDark)
  }
  else {
    return useGenerateImageVariant(heroData.value?.hero_sub_img_light as string, heroData.value?.hero_sub_img_dark as string)
  }
})

const { x, y } = useMouse({ touch: false })

const translateMouse = computed(() => (speed: number) => {
  if (typeof window !== 'undefined') {
    const positionX = computed (() => (window.innerWidth - (x.value * speed)) / 100)
    const positionY = computed (() => Math.max((window.innerHeight - (y.value * speed)) / 100, -40))

    return { transform: `translate(${positionX.value}px,${positionY.value}px` }
  }
})
</script>

<template>
  <section
    id="home"
    :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }"
  >
    <div
      id="landingHero"
      class="landing-hero"
      :style="{ backgroundImage: `url(${heroBgUrl})` }"
    >
      <VContainer>
        <div class="text-center pt-6 pb-16">
          <div class="mb-4 landing-page-title" v-html="heroData?.hero_title" />

          <div class="text-body-1 font-weight-medium text-high-emphasis pb-8" v-html="heroData?.hero_title_desc" />

          <VBtn
            :color="heroButtonData?.btn_background"
            :prepend-icon="heroButtonData?.btn_prepend_icon"
            :append-icon="heroButtonData?.btn_apend_icon"
            :to="heroButtonData?.btn_link"
            :variant="heroButtonData?.btn_variant"
            :ripple="heroButtonData?.btn_rippled"
            class="mt-6"
            size="large"
            :rounded="heroButtonData?.btn_radius"
          >
            {{ heroButtonData?.btn_label }}
          </VBtn>
        </div>

        <div class="position-relative hero-animation-img">
          <div class="hero-dashboard-img text-center">
            <NuxtLink
              to="/"
              target="_blank"
            >
              <img
                :src="heroSubImg.value"
                class="mx-auto cursor-pointer"
                :style="translateMouse(3)"
              >
            </NuxtLink>
          </div>

          <div class="hero-elements-img">
            <NuxtLink
              to="/"
              target="_blank"
            >
              <img
                class="cursor-pointer hero-image"
                :src="heroMainImg.value"
                :style="translateMouse(5)"
                target="_blank"
              >
            </NuxtLink>
          </div>
        </div>
      </VContainer>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@materialize/@layouts/styles/mixins" as layoutMixins;

section {
  display: block;
  padding-block-end: 6.25rem;
}

.landing-hero {
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
  padding-block-start: 5.5rem;
}

.hero-image {
  object-fit: contain;
}

.hero-dashboard-img {
  img {
    inline-size: 85%;
  }
}

.hero-elements-img {
  position: absolute;
  inline-size: 100%;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);

  @include layoutMixins.rtl {
    transform: translate(50%, -50%);
  }

  img {
    inline-size: 100%;
  }
}

.container {
  margin-inline: auto;
  max-inline-size: 85vw;
}

.feature-cards {
  margin-block-start: 6.25rem;
}

.landing-page-title {
  color: rgb(var(--v-theme-primary));
  font-size: 2.375rem;
  line-height: 2.75rem;
  word-wrap: break-word;
}

.hero-animation-img {
  inline-size: 100%;
  inset-block-start: 5rem;
  margin-block-end: -8rem;
  max-block-size: 800px;
}

@media (max-width: 960px) {
  .hero-animation-img {
    inset-block-start: 2rem;
    margin-block-end: -8rem;
  }
}

@media (max-width: 600px) {
  section {
    padding-block-end: 4.25rem;
  }

  .hero-animation-img {
    inset-block-start: 1rem;
    margin-block-end: -2rem;
  }

  .landing-page-title {
    font-size: 1.75rem;
    line-height: 2.25rem;
  }
}
</style>
