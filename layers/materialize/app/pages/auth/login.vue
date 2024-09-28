<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'

import { P, match } from 'ts-pattern'

import { VForm } from 'vuetify/components/VForm'

import authV2LoginIllustrationBorderedDark from '@materialize/images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@materialize/images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@materialize/images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@materialize/images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@materialize/images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@materialize/images/pages/auth-v2-login-mask-light.png'
import { VNodeRenderer } from '@materialize/@layouts/components/VNodeRenderer'
import { themeConfig } from '@materialize/config'
import AuthProvider from '@materialize/views/pages/authentication/AuthProvider.vue'

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true,
)

const authThemeMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)

definePageMeta({
  layout: 'blank',
  unauthenticatedOnly: true,
})

const isPasswordVisible = ref(false)

const route = useRoute()

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})

const formRef = ref<VForm>()

const credentials = ref({
  email: '',
  password: '',
})

const rememberMe = ref(false)

const { signIn } = useAuth()

async function login(provider?: string) {
  try {
    loading()
    if (provider) {
      await signIn(provider, {
        callbackUrl: route.query.to ? String(route.query.to) : '/',
      })
    }
    else {
      const response = await signIn('credentials', {
        callbackUrl: route.query.to ? String(route.query.to) : '/',
        redirect: false,
        ...credentials.value,
      })

      match(response)
        .with({ error: P.string }, ({ error }) => {
          notify(error, { type: 'error' })
        })
        .with({ url: P.string }, ({ url }) => {
          navigateTo(url, { external: true })
        })
    }
  }
  catch (error: any) {
    notify(error.message)
  }
  finally {
    loading().hide()
  }
}
// UJ3K5SpX4KHUgn6gy%D*
function onSubmit() {
  formRef.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid)
        login()
    })
}
</script>

<template>
  <div>
    <NuxtLink to="/">
      <div class="auth-logo app-logo">
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h1 class="app-logo-title">
          {{ themeConfig.app.title }}
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
              Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}!</span> 👋🏻
            </h4>
            <p class="mb-0">
              Please sign-in to your account and start the adventure
            </p>
          </VCardText>

          <VCardText>
            <VForm
              ref="formRef"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <!-- email -->
                <VCol cols="12">
                  <VTextField
                    v-model="credentials.email"
                    label="Email"
                    placeholder="johndoe@email.com"
                    type="email"
                    autofocus
                    :rules="[requiredValidator, emailValidator]"
                    :error-messages="errors?.email"
                  />
                </VCol>

                <!-- password -->
                <VCol cols="12">
                  <VTextField
                    v-model="credentials.password"
                    label="Password"
                    placeholder="············"
                    :rules="[requiredValidator]"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :error-messages="errors?.password"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />

                  <div class="d-flex align-center flex-wrap justify-space-between my-6 gap-x-2">
                    <VCheckbox
                      v-model="rememberMe"
                      label="Remember me"
                    />
                    <NuxtLink
                      class="text-primary"
                      :to="{ name: 'auth-forgot-password' }"
                    >
                      Forgot Password?
                    </NuxtLink>
                  </div>

                  <VBtn
                    block
                    type="submit"
                  >
                    Login
                  </VBtn>
                </VCol>

                <!-- create account -->
                <VCol
                  cols="12"
                  class="text-body-1 text-center"
                >
                  <span class="d-inline-block">
                    New on our platform?
                  </span>
                  <NuxtLink
                    class="text-primary ms-1 d-inline-block text-body-1"
                    :to="{ name: 'auth-register' }"
                  >
                    Create an account
                  </NuxtLink>
                </VCol>

                <VCol
                  cols="12"
                  class="d-flex align-center"
                >
                  <VDivider />
                  <span class="mx-4 text-high-emphasis">or</span>
                  <VDivider />
                </VCol>

                <!-- auth providers -->
                <VCol
                  cols="12"
                  class="text-center"
                >
                  <AuthProvider @signin="login" />
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
@use "@materialize/@core/scss/template/pages/page-auth.scss";
</style>
