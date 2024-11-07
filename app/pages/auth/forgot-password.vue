<script setup lang="ts">
import authV2ForgotPasswordIllustrationBorderedDark from '@base/images/pages/auth-v2-forgot-password-illustration-bordered-dark.png'
import authV2ForgotPasswordIllustrationBorderedLight from '@base/images/pages/auth-v2-forgot-password-illustration-bordered-light.png'
import authV2ForgotPasswordIllustrationDark from '@base/images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@base/images/pages/auth-v2-forgot-password-illustration-light.png'
import authV2ForgotPasswordMaskDark from '@base/images/pages/auth-v2-forgot-password-mask-dark.png'
import authV2ForgotPasswordMaskLight from '@base/images/pages/auth-v2-forgot-password-mask-light.png'

const authThemeImg = useGenerateImageVariant(
  authV2ForgotPasswordIllustrationLight,
  authV2ForgotPasswordIllustrationDark,
  authV2ForgotPasswordIllustrationBorderedLight,
  authV2ForgotPasswordIllustrationBorderedDark,
  true,
)

const authThemeMask = useGenerateImageVariant(authV2ForgotPasswordMaskLight, authV2ForgotPasswordMaskDark)

const email = ref('')

definePageMeta({
  layout: 'blank',
  unauthenticatedOnly: true,
})

const { t } = useI18n()
const config = useRuntimeConfig()

async function sendResetLink() {
  if (!email.value)
    return
  try {
    loading()

    await $api('/auth/forgot-password', {
      method: 'POST',
      body: {
        email: email.value,
        type: 'reset',
      },
    })

    notifySuccess({
      content: t('An email has been sent to your email address with instructions to reset your password!'),
    })

    navigateTo('/auth/login')
  }
  catch (error: any) {
    notifyError({ content: error.message })
  }
  finally {
    loading.close()
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/">
      <div class="app-logo auth-logo">
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
      class="auth-wrapper"
      no-gutters
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
              {{ $t('Forgot Password? 🔒') }}
            </h4>
            <p class="mb-0">
              {{ $t('Enter your email and we\'ll send you instructions to reset your password') }}
            </p>
          </VCardText>

          <VCardText>
            <VForm @submit.prevent="() => {}">
              <VRow>
                <!-- email -->
                <VCol cols="12">
                  <VTextField
                    v-model="email"
                    autofocus
                    :label="$t('Email')"
                    placeholder="johndoe@email.com"
                    type="email"
                  />
                </VCol>

                <!-- Reset link -->
                <VCol cols="12">
                  <VBtn
                    block
                    type="submit"
                    @click="sendResetLink"
                  >
                    {{ $t('Send Reset Link') }}
                  </VBtn>
                </VCol>

                <!-- back to login -->
                <VCol cols="12">
                  <NuxtLink
                    class="d-flex align-center justify-center"
                    :to="{ name: 'auth-login' }"
                  >
                    <VIcon
                      icon="ri-arrow-left-s-line"
                      size="20"
                      class="me-2 flip-in-rtl"
                    />
                    <span>{{ $t('Back to login') }}</span>
                  </NuxtLink>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@base/@core/scss/template/pages/page-auth.scss";
</style>
