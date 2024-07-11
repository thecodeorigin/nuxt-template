<script setup lang="ts">
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
import authV2VerifyEmailIllustrationBorderedDark from '@images/pages/auth-v2-verify-email-illustration-bordered-dark.png'
import authV2VerifyEmailIllustrationBorderedLight from '@images/pages/auth-v2-verify-email-illustration-bordered-light.png'
import authV2VerifyEmailIllustrationDark from '@images/pages/auth-v2-verify-email-illustration-dark.png'
import authV2VerifyEmailIllustrationLight from '@images/pages/auth-v2-verify-email-illustration-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'

const authV1ThemeVerifyEmailMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)
const authV2VerifyEmailIllustration = useGenerateImageVariant (authV2VerifyEmailIllustrationLight, authV2VerifyEmailIllustrationDark, authV2VerifyEmailIllustrationBorderedLight, authV2VerifyEmailIllustrationBorderedDark, true)

definePageMeta({
  layout: 'blank',

})
</script>

<template>
  <NuxtLink to="/">
    <div class="app-logo auth-logo">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="app-logo-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </NuxtLink>

  <VRow
    class="auth-wrapper"
    no-gutters
  >
    <VCol
      md="8"
      class="d-none d-md-flex align-center justify-center position-relative"
    >
      <div class="d-flex align-center justify-center pa-10">
        <img
          :src="authV2VerifyEmailIllustration"
          class="auth-illustration w-100"
          alt="auth-illustration"
        >
      </div>
      <VImg
        :src="authV1ThemeVerifyEmailMask"
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
            Verify your email ✉️
          </h4>
          <p class="mb-5">
            Account activation link sent to your email address: <span class="text-high-emphasis font-weight-medium">hello@example.com</span> Please follow the link inside to continue.
          </p>

          <VBtn
            block
            to="/"
            class="mb-5"
          >
            Skip for now
          </VBtn>

          <div class="d-flex align-center justify-center">
            <span class="me-1">Didn't get the mail? </span><a href="#">Resend</a>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
