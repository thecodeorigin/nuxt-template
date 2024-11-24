<script setup lang="ts">
import authV1ResetPasswordMaskDark from '@base/images/pages/auth-v1-reset-password-mask-dark.png'
import authV1ResetPasswordMaskLight from '@base/images/pages/auth-v1-reset-password-mask-light.png'

const authV1ResetPasswordMask = useGenerateImageVariant(authV1ResetPasswordMaskLight, authV1ResetPasswordMaskDark)

definePageMeta({
  layout: 'blank',
  public: true,
})

const form = ref({
  newPassword: '',
  confirmPassword: '',
})

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const token = computed(() => route.query.token as string)

async function resetPassword() {
  if (!form.value.newPassword || !form.value.confirmPassword)
    return

  try {
    loading()

    await $api('/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: form.value.newPassword,
        confirmPassword: form.value.confirmPassword,
        type: 'reset',
      },
    })

    notifySuccess({
      content: t('Your password has been reset successfully!'),
    })

    navigateTo('/auth/login')

    useTrackEvent('auth:reset-password')
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
          Reset Password 🔒
        </h4>
        <p class="mb-0">
          Enter your email and we'll send you instructions to reset your password
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.newPassword"
                autofocus
                label="New Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <!-- Confirm Password -->
            <VCol cols="12">
              <VTextField
                v-model="form.confirmPassword"
                label="Confirm Password"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
              />
            </VCol>

            <!-- reset password -->
            <VCol cols="12">
              <VBtn
                block
                type="submit"
                @click="resetPassword"
              >
                Set New Password
              </VBtn>
            </VCol>

            <!-- back to login -->
            <VCol cols="12">
              <NuxtLink
                class="d-flex align-center justify-center"
                :to="{ name: 'auth-login' }"
              >
                <VIcon
                  start
                  size="20"
                  icon="ri-arrow-left-s-line"
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
      :src="authV1ResetPasswordMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@base/@core/scss/template/pages/page-auth";
</style>
