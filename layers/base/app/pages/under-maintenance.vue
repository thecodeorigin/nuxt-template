<script setup lang="ts">
import miscMaskDark from '@base/images/misc/misc-mask-dark.png'
import miscMaskLight from '@base/images/misc/misc-mask-light.png'
import miscObj from '@base/images/pages/misc-under-maintenance-object.png'
import miscUnderMaintenance from '@base/images/pages/misc-under-maintenance.png'
import { useGenerateImageVariant } from '@base/@core/composable/useGenerateImageVariant'

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

definePageMeta({
  layout: 'blank',
  public: false,
})
</script>

<template>
  <div class="misc-wrapper">
    <div class="text-center mb-10">
      <!-- 👉 Title and subtitle -->
      <h4 class="text-h4 mb-2">
        Under Maintenance! 🚧
      </h4>
      <p class="text-body-1 mb-0">
        Sorry for the inconvenience but we're performing some maintenance at the moment
      </p>
    </div>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="miscUnderMaintenance"
        :height="$vuetify.display.xs ? 400 : 500"
        alt="Coming Soon"
        class="my-sm-5"
      />

      <VBtn
        to="/"
        class="mt-10"
      >
        Back to Home
      </VBtn>

      <VImg
        :src="authThemeMask"
        class="d-none d-md-block footer-coming-soon flip-in-rtl"
        cover
      />

      <VImg
        :src="miscObj"
        class="d-none d-md-block footer-coming-soon-obj"
        :max-width="173"
        height="170"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "@base/@core/scss/template/pages/misc.scss";
</style>
