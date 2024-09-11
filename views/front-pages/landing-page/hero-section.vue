<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { useTheme } from 'vuetify'
import darkBg from '@images/front-pages/backgrounds/hero-bg-dark.png'
import lightBg from '@images/front-pages/backgrounds/hero-bg.png'
import heroDashboardImgDark from '@images/front-pages/landing-page/hero-dashboard-dark.png'
import heroDashboardImgLight from '@images/front-pages/landing-page/hero-dashboard-light.png'
import heroElementsImgDark from '@images/front-pages/landing-page/hero-elements-dark.png'
import heroElementsImgLight from '@images/front-pages/landing-page/hero-elements-light.png'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import type { HeroButtonType } from '~/utils/types/landing-page'

const { heroData } = storeToRefs(useLandingPageStore())

const theme = useTheme()
const isDark = ref(theme.name)

const heroBgUrl = computed(() => {
  if (isDark.value === 'dark')
    return darkBg
  else
    return lightBg
})

const heroElementsImg = useGenerateImageVariant(heroElementsImgLight, heroElementsImgDark)
const heroDashboardImg = useGenerateImageVariant(heroDashboardImgLight, heroDashboardImgDark)

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
          <div class="mb-4 landing-page-title">
            {{ heroData?.hero_title }}
          </div>
          <div class="text-body-1 font-weight-medium text-high-emphasis pb-8">
            {{ heroData?.hero_title_desc }}
          </div>
          <VBtn
            :color="heroData?.hero_title_button?.btn_background"
            :prepend-icon="heroData?.hero_title_button?.btn_prepend_icon"
            :append-icon="heroData?.hero_title_button?.btn_apend_icon"
            :to="heroData?.hero_title_button?.btn_link"
            :variant="heroData?.hero_title_button?.btn_variant"
            :ripple="heroData?.hero_title_button?.btn_rippled"
            class="mt-6"
            size="large"
            rounded="rounded"
          >
            {{ heroData?.hero_title_button?.btn_label }}
          </VBtn>
        </div>

        <div class="position-relative hero-animation-img">
          <div class="hero-dashboard-img text-center">
            <NuxtLink
              to="/"
              target="_blank"
            >
              <img
                :src="heroDashboardImg"
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
@use "@layouts/styles/mixins" as layoutMixins;

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
  width: 100%;
  max-height: 800px;
  inset-block-start: 5rem;
  margin-block-end: -8rem;
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
