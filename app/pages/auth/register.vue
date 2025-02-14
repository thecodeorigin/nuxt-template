<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'

import authV2RegisterIllustrationBorderedDark from '@base/images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@base/images/pages/auth-v2-register-illustration-bordered-light.png'
import authV2RegisterIllustrationDark from '@base/images/pages/auth-v2-register-illustration-dark.png'
import authV2RegisterIllustrationLight from '@base/images/pages/auth-v2-register-illustration-light.png'
import authV2RegisterMaskDark from '@base/images/pages/auth-v2-register-mask-dark.png'
import authV2RegisterMaskLight from '@base/images/pages/auth-v2-register-mask-light.png'

import { confirmedValidator, emailValidator, requiredValidator } from '#imports'

const authThemeImg = useGenerateImageVariant(
  authV2RegisterIllustrationLight,
  authV2RegisterIllustrationDark,
  authV2RegisterIllustrationBorderedLight,
  authV2RegisterIllustrationBorderedDark,
  true,
)

const authThemeMask = useGenerateImageVariant(authV2RegisterMaskLight, authV2RegisterMaskDark)

definePageMeta({
  layout: 'blank',
  unauthenticatedOnly: true,
})

const { t } = useI18n()

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})

const acceptPrivacyPolicies = ref(false)

const isPasswordVisible = ref(false)

const formRef = ref<VForm>()

const credentials = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const { signIn } = useAuth()

async function login(provider?: string) {
  try {
    loading()

    useTrackEvent('auth:signup', {
      method: provider,
    })

    if (provider) {
      await signIn(provider, { callbackUrl: '/' })
    }
    else {
      await signIn('credentials', {
        callbackUrl: '/',
        ...credentials.value,
      })
    }
  }
  catch (error: any) {
    notifyError({
      content: error.data.message || t('An error has occured, please try again later'),
    })
  }
  finally {
    loading.close()
  }
}

async function signup() {
  try {
    loading()

    await $api('/auth/signup', {
      method: 'POST',
      body: {
        email: credentials.value.email,
        password: credentials.value.password,
      },
    })

    notifySuccess({
      content: t('Please confirm your email address before signin!'),
    })

    navigateTo('/auth/login')
  }
  catch (error: any) {
    notifyError({
      content: error.data.message || t('An error has occured, please try again later'),
    })
  }
  finally {
    loading.close()
  }
}

function onSubmit() {
  formRef.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid)
        signup()
    })
}

const termAndPolicyMessage = computed(() => t('I agree to {policyLink}', {
  policyLink: `<a href="#" class="text-primary">${t('privacy policy & terms')}</a>`,
}))

const config = useRuntimeConfig()
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
      no-gutters
      class="auth-wrapper"
    >
      <VCol
        md="8"
        class="d-none d-md-flex align-center justify-center position-relative"
      >
        <!-- here your illustrator -->
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
              {{ $t('Adventure starts here 🚀') }}
            </h4>
            <p class="mb-0">
              {{ $t('Getting subtitle from video with ease!') }}
            </p>
          </VCardText>

          <VCardText>
            <VForm
              ref="formRef"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <!-- auth providers -->
                <VCol
                  cols="12"
                  class="text-center"
                >
                  <AuthProvider @signin="login" />
                </VCol>

                <VCol cols="12">
                  <div class="d-flex align-center">
                    <VDivider />
                    <span class="mx-4 text-high-emphasis">{{ $t('or') }}</span>
                    <VDivider />
                  </div>
                </VCol>

                <!-- email -->
                <VCol cols="12">
                  <VTextField
                    v-model="credentials.email"
                    :label="$t('Email')"
                    placeholder="johndoe@email.com"
                    type="email"
                    autofocus
                    :rules="[requiredValidator, emailValidator]"
                    :error-messages="errors?.email && $t(errors.email)"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="credentials.password"
                    :label="$t('Password')"
                    placeholder="············"
                    :rules="[requiredValidator]"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :error-messages="errors?.password && $t(errors.password)"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="credentials.confirmPassword"
                    :label="$t('Confirm Password')"
                    placeholder="············"
                    :rules="[requiredValidator, confirmedValidator(credentials.confirmPassword, credentials.password)]"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :error-messages="errors?.confirmPassword && $t(errors?.confirmPassword)"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />
                </VCol>

                <VCol cols="12">
                  <div class="d-flex align-center my-6">
                    <VCheckbox
                      id="privacy-policy"
                      v-model="acceptPrivacyPolicies"
                      inline
                    />
                    <VLabel
                      for="privacy-policy"
                      style="opacity: 1;"
                    >
                      <span class="me-1 text-high-emphasis" v-html="termAndPolicyMessage" />
                    </VLabel>
                  </div>

                  <VBtn
                    block
                    type="submit"
                    :disabled="!acceptPrivacyPolicies"
                  >
                    {{ $t('Sign up') }}
                  </VBtn>
                </VCol>

                <!-- create account -->
                <VCol cols="12">
                  <div class="text-center text-base">
                    <span class="d-inline-block mr-1">
                      {{ $t('Already have an account?') }}
                    </span>
                    <NuxtLink
                      class="text-primary d-inline-block"
                      :to="{ name: 'auth-login' }"
                    >
                      {{ $t('Sign In instead') }}
                    </NuxtLink>
                  </div>
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
