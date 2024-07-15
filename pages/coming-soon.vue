<script setup lang="ts">
import miscMaskDark from '@images/misc/misc-mask-dark.png'
import miscMaskLight from '@images/misc/misc-mask-light.png'
import miscComingSoonObj from '@images/pages/misc-coming-soon-object.png'
import miscComingSoon from '@images/pages/misc-coming-soon.png'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

definePageMeta({
  layout: 'blank',

})

const email = ref('')
</script>

<template>
  <div class="misc-wrapper">
    <div>
      <!-- 👉 Title and subtitle -->
      <div class="text-center mb-10">
        <h4 class="text-h4 mb-2">
          We are launching soon 🚀
        </h4>
        <p class="text-body-1">
          Our website is opening soon. Please register to get notified when it's ready!
        </p>
      </div>

      <!-- 👉 Email input -->
      <VForm
        class="d-flex align-center justify-center flex-wrap gap-4"
        @submit.prevent="() => {}"
      >
        <VTextField
          v-model="email"
          autofocus
          placeholder="Enter your email or username"
          class="misc-email-input"
          density="compact"
        />
        <VBtn type="submit">
          Notify
        </VBtn>
      </VForm>
    </div>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 mt-10">
      <VImg
        :src="miscComingSoon"
        alt="Coming Soon"
        :height="$vuetify.display.xs ? 400 : 500"
      />
      <VImg
        :src="authThemeMask"
        class="d-none d-md-block footer-coming-soon flip-in-rtl"
        cover
      />

      <VImg
        :src="miscComingSoonObj"
        class="d-none d-md-block footer-coming-soon-obj"
        :max-width="173"
        height="158"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
