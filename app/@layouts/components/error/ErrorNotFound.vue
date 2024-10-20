<script setup lang="ts">
import miscMaskLight from '@base/images/misc/misc-mask-light.png'
import pages404 from '@base/images/pages/404.png'

import miscMaskDark from '@base/images/misc/misc-mask-dark.png'
import miscObj from '@base/images/pages/misc-404-object.png'
import { useGenerateImageVariant } from '@base/@core/composable/useGenerateImageVariant'

const miscThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="404"
      :title="$t('Page Not Found')"
      :description="$t('We couldn\'t find the page you are looking for\.')"
      class="mb-10"
    />

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="pages404"
        alt="Not Found"
        :height="$vuetify.display.xs ? 400 : 500"
        class="my-sm-5"
      />

      <VBtn
        to="/"
        class="mt-10"
      >
        {{ $t('Back to Home') }}
      </VBtn>

      <VImg
        :src="miscThemeMask"
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
