<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true })

const route = useRoute()
const error = computed(() => String(route.query.error ?? 'unknown_error'))

const messages: Record<string, string> = {
  token_exchange_failed: 'Sign-in failed. Please try again.',
  invalid_state: 'Your session expired. Please sign in again.',
  email_unverified: 'Please verify your email before signing in.',
  userinfo_invalid: 'Could not retrieve your account information.',
  access_denied: 'Access was denied.',
}

const message = computed(() => messages[error.value] ?? 'An unexpected error occurred.')
</script>

<template>
  <UCard class="w-full max-w-sm">
    <div class="flex flex-col items-center gap-4 p-2">
      <UIcon name="i-lucide-circle-x" class="text-error size-12" />
      <div class="text-center">
        <p class="text-highlighted font-semibold">
          Sign-in failed
        </p>
        <p class="text-muted mt-1 text-sm">
          {{ message }}
        </p>
      </div>
      <UButton :to="{ path: '/auth/login' }" block>
        Try again
      </UButton>
    </div>
  </UCard>
</template>
