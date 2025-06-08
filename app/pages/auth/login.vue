<script setup lang="ts">
import authV2LoginIllustrationBorderedDark from '@base/images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@base/images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@base/images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@base/images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@base/images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@base/images/pages/auth-v2-login-mask-light.png'

import { navigateTo } from '#imports'

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true,
)

const authThemeMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)

definePageMeta({
  layout: 'blank',
  auth: false,
  unauthenticatedOnly: true,
})

const config = useRuntimeConfig()
</script>

<template>
  <div>
    <NuxtLink to="/">
      <div class="auth-logo app-logo">
        <img
          :src="config.public.theme.appLogo"
          :alt="config.public.theme.appName"
          width="auto"
          height="24"
        >
        <h1 class="app-logo-title">
          {{ config.public.theme.appName }}
        </h1>
      </div>
    </NuxtLink>

    <VRow
      no-gutters
      class="auth-wrapper"
    >
      <VCol
        md="8"
        class="d-none d-md-flex align-center justify-center position-relative"
      >
        <div class="d-flex align-center justify-center pa-10">
          <img
            :src="authThemeImg"
            class="auth-illustration w-100"
            alt="auth-illustration"
          >
        </div>
        <VImg
          :src="authThemeMask"
          class="d-none d-md-flex auth-footer-mask"
          alt="auth-mask"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
        class="auth-card-v2 d-flex align-center justify-center"
        style="background-color: rgb(var(--v-theme-surface));"
      >
        <VCard
          flat
          :max-width="500"
          class="mt-12 mt-sm-0 pa-5 pa-lg-7"
        >
          <VCardText>
            <h4 class="text-h4 mb-1">
              {{ $t('Welcome to {appName} 👋🏻', { appName: config.public.theme.appName }) }}
            </h4>
            <p class="mb-0">
              {{ $t('Please sign-in to your account and start the adventure') }}
            </p>
          </VCardText>

          <VCardText>
            <VBtn
              block
              @click="navigateTo('/sign-in', { external: true })"
            >
              {{ $t('Sign In') }}
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@base/@core/scss/template/pages/page-auth.scss";
</style>
