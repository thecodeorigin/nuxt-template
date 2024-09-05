<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'
import pages404 from '@images/pages/404.png'

import miscMaskDark from '@images/misc/misc-mask-dark.png'
import miscMaskLight from '@images/misc/misc-mask-light.png'
import miscObj from '@images/pages/misc-404-object.png'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  error: NuxtError
}>()

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

const isDev = import.meta.env.DEV

const errToShow = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return {
        status: 404,
        title: 'Page Not Found',
        description: 'We couldn\'t find the page you are looking for.',
      }
    case 401:
      return {
        status: 401,
        title: 'You are not authorized! 🔐',
        description: 'You don\'t have permission to access this page. Go Home!',
      }
    default:
      if (isDev) {
        console.error(props.error)

        return {
          status: 500,
          title: props.error?.statusMessage,
          description: props.error?.message,
        }
      }
      else {
        return {
          status: 500,
          title: 'Oops! Something went wrong.',
          description: 'We are working on it and we\'ll get it fixed as soon as we can',
        }
      }
  }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout name="blank">
    <div class="misc-wrapper">
      <ErrorHeader
        :status-code="errToShow.status"
        :title="errToShow.title"
        :description="errToShow.description"
        class="mb-10"
      />

      <!-- eslint-disable vue/no-v-html -->
      <div
        v-if="errToShow.status === 500"
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
          :max-width="212"
          height="165"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
