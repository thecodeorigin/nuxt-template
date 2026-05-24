<script setup lang="ts">
const config = useRuntimeConfig()
const isDemo = computed(() => Boolean(config.public.demoMode))

const toast = useToast()
const busy = ref<'admin' | 'user' | null>(null)

async function signInAsDemoAgent(agent: 'admin' | 'user') {
  busy.value = agent
  try {
    await $fetch('/api/auth/demo-login', {
      method: 'POST',
      body: { agent },
      credentials: 'include',
    })
    window.location.href = '/dashboard'
  }
  catch (err: unknown) {
    const error = err as {
      statusCode?: number
      statusMessage?: string
      message?: string
      data?: { statusMessage?: string, message?: string }
    }
    toast.add({
      title: 'Demo sign-in failed',
      description:
        error?.data?.statusMessage
        ?? error?.data?.message
        ?? error?.statusMessage
        ?? error?.message
        ?? `Status ${error?.statusCode ?? 'unknown'}`,
      color: 'error',
    })
    busy.value = null
  }
}
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
          Welcome back. Choose how you'd like to sign in.
        </p>
      </div>
    </template>

    <div v-if="isDemo" class="space-y-3" data-testid="demo-block">
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-flask-conical"
        title="Demo mode"
        description="Sandbox deployment with seeded fake users. Do not use real credentials."
      />

      <UButton
        block
        size="lg"
        color="primary"
        icon="i-lucide-shield-check"
        :loading="busy === 'admin'"
        :disabled="busy !== null"
        data-testid="signin-admin-agent"
        @click="signInAsDemoAgent('admin')"
      >
        Sign in as Admin Agent
      </UButton>

      <UButton
        block
        size="lg"
        color="neutral"
        variant="outline"
        icon="i-lucide-user"
        :loading="busy === 'user'"
        :disabled="busy !== null"
        data-testid="signin-user-agent"
        @click="signInAsDemoAgent('user')"
      >
        Sign in as User Agent
      </UButton>

      <p class="text-xs text-muted text-center pt-2">
        Admin Agent has the <code>user:impersonate</code> ability.
        User Agent does not.
      </p>
    </div>

    <div v-else class="space-y-3 text-center">
      <UButton
        to="/api/auth/google"
        external
        block
        size="lg"
        icon="i-logos-google-icon"
        color="neutral"
        variant="outline"
      >
        Continue with Google
      </UButton>
      <UButton
        to="/api/auth/github"
        external
        block
        size="lg"
        icon="i-logos-github-icon"
        color="neutral"
        variant="outline"
      >
        Continue with GitHub
      </UButton>
    </div>
  </UCard>
</template>
