<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'
import pages404 from '@base/images/pages/404.png'

import miscMaskDark from '@base/images/misc/misc-mask-dark.png'
import miscMaskLight from '@base/images/misc/misc-mask-light.png'
import miscObj from '@base/images/pages/misc-404-object.png'
import { useGenerateImageVariant } from '@base/@core/composable/useGenerateImageVariant'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  error: NuxtError
}>()

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

const isDev = import.meta.env.DEV

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      :status-code="500"
      title="Oops! Something went wrong\."
      description="We are working on it and we\'ll get it fixed as soon as we can"
      class="mb-10"
    />

    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="isDev"
      style="max-inline-size: 80dvw; overflow-x: scroll;"
      v-html="error.stack"
    />
    <!-- eslint-enable -->

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="pages404"
        alt="Coming Soon"
        :height="$vuetify.display.xs ? 400 : 500"
        class="my-sm-5"
      />

      <VBtn
        class="mt-10"
        @click="handleError"
      >
        {{ $t('Back to Home') }}
      </VBtn>

      <VImg
        :src="authThemeMask"
        class="d-none d-md-block footer-coming-soon flip-in-rtl"
        cover
      />

      <VImg
        :src="miscObj"
        class="d-none d-md-block footer-coming-soon-obj"
        :max-width="212"
        height="165"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "@base/@core/scss/template/pages/misc.scss";
</style>
