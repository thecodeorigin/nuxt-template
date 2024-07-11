<script setup lang="ts">
import authV1ForgotPasswordMaskDark from '@images/pages/auth-v1-forgot-password-mask-dark.png'
import authV1ForgotPasswordMaskLight from '@images/pages/auth-v1-forgot-password-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'

const form = ref({
  email: '',
})

const authV1ThemeForgotPasswordMask = useGenerateImageVariant(authV1ForgotPasswordMaskLight, authV1ForgotPasswordMaskDark)

definePageMeta({
  layout: 'blank',

})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-1 pa-sm-7"
      max-width="448"
    >
      <VCardItem class="justify-center pb-6">
        <VCardTitle>
          <NuxtLink to="/">
            <div class="app-logo">
              <VNodeRenderer :nodes="themeConfig.app.logo" />
              <h1 class="app-logo-title">
                {{ themeConfig.app.title }}
              </h1>
            </div>
          </NuxtLink>
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <h4 class="text-h4 mb-1">
          Forgot Password? 🔒
        </h4>
        <p class="mb-0">
          Enter your email and we'll send you instructions to reset your password
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                autofocus
                label="Email"
                type="email"
                placeholder="johndoe@email.com"
              />
            </VCol>

            <!-- reset password -->
            <VCol cols="12">
              <VBtn
                block
                type="submit"
              >
                Send Reset Link
              </VBtn>
            </VCol>

            <!-- back to login -->
            <VCol cols="12">
              <NuxtLink
                class="d-flex align-center justify-center"
                :to="{ name: 'pages-authentication-login-v1' }"
              >
                <VIcon
                  start
                  icon="ri-arrow-left-s-line"
                  size="20"
                  class="flip-in-rtl"
                />
                <span class="text-base">Back to login</span>
              </NuxtLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
    <VImg
      :src="authV1ThemeForgotPasswordMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
