<script setup lang="ts">
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'

import authV1RegisterMaskDark from '@images/pages/auth-v1-register-mask-dark.png'
import authV1RegisterMaskLight from '@images/pages/auth-v1-register-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const authV1ThemeTwoStepMask = useGenerateImageVariant(authV1RegisterMaskLight, authV1RegisterMaskDark)

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
    <VImg
      :src="authV1ThemeTwoStepMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.v-otp-input {
  .v-otp-input__content {
    padding-inline: 0;
  }
}
</style>
