<script setup lang="ts">
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import authV2RegisterMaskDark from '@images/pages/auth-v2-register-mask-dark.png'
import authV2RegisterMaskLight from '@images/pages/auth-v2-register-mask-light.png'
import authV2TwoStepsIllustrationBorderedDark from '@images/pages/auth-v2-two-steps-illustration-bordered-dark.png'
import authV2TwoStepsIllustrationBorderedLight from '@images/pages/auth-v2-two-steps-illustration-bordered-light.png'
import authV2TwoStepsIllustrationDark from '@images/pages/auth-v2-two-steps-illustration-dark.png'
import authV2TwoStepsIllustrationLight from '@images/pages/auth-v2-two-steps-illustration-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const authV2ThemeTwoStepMask = useGenerateImageVariant(authV2RegisterMaskLight, authV2RegisterMaskDark)
const authV2TwoStepsIllustration = useGenerateImageVariant (authV2TwoStepsIllustrationLight, authV2TwoStepsIllustrationDark, authV2TwoStepsIllustrationBorderedLight, authV2TwoStepsIllustrationBorderedDark, true)

const router = useRouter()
const otp = ref('')
const isOtpInserted = ref(false)

const onFinish = () => {
  isOtpInserted.value = true

  setTimeout(() => {
    isOtpInserted.value = false
    router.push('/')
  }, 2000)
}

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
      <!-- Here your illustrator -->
      <div class="d-flex align-center justify-center pa-10">
        <img
          :src="authV2TwoStepsIllustration"
          class="auth-illustration w-100"
          alt="auth-illustration"
        >
      </div>
      <VImg
        :src="authV2ThemeTwoStepMask"
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
            Two Step Verification 💬
          </h4>
          <p class="mb-1">
            We sent a verification code to your mobile. Enter the code from the mobile in the field below.
          </p>
          <h6 class="text-h6">
            ******1234
          </h6>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <!-- email -->
            <h6 class="text-body-1">
              Type your 6 digit security code
            </h6>
            <VOtpInput
              v-model="otp"
              :disabled="isOtpInserted"
              type="number"
              autofocus
              class="pa-0"
              @finish="onFinish"
            />

            <!-- reset password -->
            <VBtn
              :loading="isOtpInserted"
              :disabled="isOtpInserted"
              block
              type="submit"
              class="mt-3 mb-5"
            >
              Verify my account
            </VBtn>

            <!-- back to login -->
            <div class="d-flex justify-center align-center flex-wrap">
              <span class="me-1">Didn't get the code?</span>
              <a href="#">Resend</a>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.v-otp-input {
  .v-otp-input__content {
    padding-inline: 0;
  }
}
</style>
