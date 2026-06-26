<script setup lang="ts">
const { signIn } = useAuth()
const route = useRoute()

const error = computed(() => {
  const e = route.query.error
  return typeof e === 'string' ? e : null
})

onMounted(() => {
  if (!error.value)
    void signIn('/')
})
</script>

<template>
  <UCard class="w-full max-w-md" data-testid="login-card">
    <template #header>
      <div class="text-center space-y-2">
        <UIcon name="i-lucide-log-in" class="size-8 mx-auto text-primary" />
        <h1 class="text-2xl font-semibold text-highlighted">
          Sign in
        </h1>
        <p class="text-sm text-muted">
          You will be redirected to sign in.
        </p>
      </div>
    </template>

    <div v-if="error" class="space-y-3">
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        title="Sign-in error"
        :description="error"
      />
      <UButton
        block
        size="lg"
        color="primary"
        icon="i-lucide-refresh-cw"
        @click="signIn('/')"
      >
        Try again
      </UButton>
    </div>
    <div v-else class="flex justify-center py-4">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>
  </UCard>
</template>
