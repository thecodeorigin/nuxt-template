<script setup lang="ts">
import authV1LoginMaskDark from '@base/images/pages/auth-v1-login-mask-dark.png'
import authV1LoginMaskLight from '@base/images/pages/auth-v1-login-mask-light.png'
import { useGenerateImageVariant } from '@base/@core/composable/useGenerateImageVariant'

const authV1ThemeVerifyEmailMask = useGenerateImageVariant(authV1LoginMaskLight, authV1LoginMaskDark)

definePageMeta({
  layout: 'blank',
  public: true,
})

const { t } = useI18n()

const route = useRoute()

const token = computed(() => route.query.token as string)
const type = computed(() => route.query.type as string || 'signup')
const redirectTo = computed(() => route.query.redirect_to as string || '/')

if (!token.value)
  navigateTo('/')

async function handleVerify() {
  try {
    loading()

    await $api('/auth/verify', {
      method: 'POST',
      body: {
        type: type.value,
        token: token.value,
      },
    })

    notifySuccess({
      content: t('Another confirmation email has been sent to your email address!'),
    })

    window.location.href = redirectTo.value
  }
  catch (error: any) {
    notifyError({
      content: error.data.message || t('An error has occured, please try again later'),
    })
  }
  finally {
    loading().hide()
  }
}

const config = useRuntimeConfig()
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
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <h4 class="text-h4 mb-1">
          {{ $t('Verify your account ✉️') }}
        </h4>
        <p class="mb-5">
          {{ $t('Please click the button below to confirm your registration\.') }}
        </p>

        <VBtn
          block
          class="mb-5"
          @click="handleVerify"
        >
          {{ $t('Verify Registration') }}
        </VBtn>
      </VCardText>
    </VCard>
    <VImg
      :src="authV1ThemeVerifyEmailMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@base/@core/scss/template/pages/page-auth.scss";
</style>
