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

  const loader = loading()

  try {
    await $api('/auth/resend', {
      method: 'POST',
      body: {
        email: currentEmail.value,
        type: 'signup',
      },
    })

    startInterval()

    notifySuccess({
      content: t('Another confirmation email has been sent to your email address!'),
    })
  }
  catch {
    notifyError({
      content: t('An error has occured, please try again later'),
    })
  }
  finally {
    loader.hide()
  }
}

const verificationMessage = computed(() => t(
  'Account activation link sent to your email address: {email} Please follow the link inside to continue\.',
  {
    email: `<span class="text-high-emphasis font-weight-medium">${currentEmail.value}</span>`,
  },
))

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
          {{ $t('Verify your email ✉️') }}
        </h4>
        <p
          class="mb-5"
          v-html="verificationMessage"
        />

        <VBtn
          block
          class="mb-5"
          :disabled="!canResendConfirmation"
          @click="resendConfirmation"
        >
          {{ $t('Resend Confirmation {countdown}', { countdown: resendInterval ? `(${resendInterval})` : '' }) }}
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
