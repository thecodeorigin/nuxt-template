<script setup lang="ts">
import authV1LoginMaskDark from '@images/pages/auth-v1-login-mask-dark.png'
import authV1LoginMaskLight from '@images/pages/auth-v1-login-mask-light.png'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const authV1ThemeVerifyEmailMask = useGenerateImageVariant(authV1LoginMaskLight, authV1LoginMaskDark)

definePageMeta({
  layout: 'blank',
  public: true,
})

const route = useRoute()

const currentEmail = computed(() => route.query.email as string)

if (!currentEmail.value)
  navigateTo('/')

const canResendConfirmation = ref(false)
const resendInterval = ref(60)

function startInterval() {
  canResendConfirmation.value = false
  resendInterval.value = 60

  const interval = setInterval(() => {
    if (resendInterval.value > 0) {
      resendInterval.value--
    }
    else {
      canResendConfirmation.value = true
      clearInterval(interval)
    }
  }, 1000)
}

onMounted(startInterval)

async function resendConfirmation() {
  if (!canResendConfirmation.value)
    return

  try {
    loading()

    await $api('/auth/resend', {
      method: 'POST',
      body: {
        email: currentEmail.value,
        type: 'signup',
      },
    })

    startInterval()

    notify('Another confirmation email has been sent to your email address!')
  }
  catch {
    notify('An error has occured, please try again later', { type: 'error' })
  }
  finally {
    loading().hide()
  }
}
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
          Verify your email ✉️
        </h4>
        <p class="mb-5">
          Account activation link sent to your email address: <span class="text-high-emphasis font-weight-medium">{{ currentEmail }}</span> Please follow the link inside to continue.
        </p>

        <VBtn
          block
          class="mb-5"
          :disabled="!canResendConfirmation"
          @click="resendConfirmation"
        >
          Resend Confirmation {{ resendInterval ? `(${resendInterval})` : '' }}
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
@use "@core/scss/template/pages/page-auth.scss";
</style>
