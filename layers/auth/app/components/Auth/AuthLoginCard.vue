<script setup lang="ts">
import { useAuthApi } from '#layers/auth/app/api/useAuthApi'

const config = useRuntimeConfig()
const isDemo = computed(() => Boolean(config.public.demoMode))
const isDev = import.meta.dev
const route = useRoute()

const SEED_EMAILS = ['admin@seed.local', 'alice@seed.local', 'bob@seed.local'] as const

const { devSeedUsers, devLogin, fetchAuthProviders, login } = useAuthApi()

const toast = useToast()
const busy = ref<'admin' | 'user' | null>(null)

// Which sign-in methods the (possibly self-hosted) backend has enabled.
const { data: providers } = useAsyncData('auth-providers', fetchAuthProviders, {
  default: () => ({ credential: false, thecodeorigin: false }),
})

// When OIDC is the only sign-in method, skip the login card and go straight to
// the IdP. Runs client-side so the SSR /auth/login renders as a public page
// first, letting the client recheck auth (and SPA-navigate to /dashboard) if the
// session was just created but hadn't propagated to KV when the SSR ran.
onMounted(() => {
  if (isDemo.value || isDev || route.query.error)
    return
  const p = providers.value
  if (p?.thecodeorigin && !p.credential)
    navigateTo('/api/auth/oidc', { external: true })
})

const credState = reactive({ email: '', password: '' })
const credBusy = ref(false)

async function signInCredential() {
  if (!credState.email || !credState.password)
    return
  credBusy.value = true
  try {
    await login(credState.email, credState.password)
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
      title: 'Sign-in failed',
      description:
        error?.data?.statusMessage
        ?? error?.data?.message
        ?? error?.statusMessage
        ?? error?.message
        ?? 'Invalid credentials',
      color: 'error',
    })
    credBusy.value = false
  }
}

const devState = reactive({ email: 'admin@seed.local' })
const devBusy = ref(false)

function isNotFound(err: unknown): boolean {
  return (err as { statusCode?: number, response?: { status?: number } })?.statusCode === 404
    || (err as { response?: { status?: number } })?.response?.status === 404
}

async function signInDev(email: string) {
  if (!email)
    return
  devBusy.value = true
  try {
    try {
      await devLogin(email)
    }
    catch (err) {
      // Seed users may not exist yet — provision the @seed.local trio and retry once.
      if (isNotFound(err)) {
        await devSeedUsers()
        await devLogin(email)
      }
      else {
        throw err
      }
    }
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
      title: 'Dev sign-in failed',
      description:
        error?.data?.statusMessage
        ?? error?.data?.message
        ?? error?.statusMessage
        ?? error?.message
        ?? `Status ${error?.statusCode ?? 'unknown'}`,
      color: 'error',
    })
    devBusy.value = false
  }
}

async function signInAsDemoAgent(agent: 'admin' | 'user') {
  busy.value = agent
  try {
    await $fetch('/api/auth/demo/login', {
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

    <div v-else class="space-y-3" data-testid="prod-block">
      <UForm
        v-if="providers.credential"
        :state="credState"
        class="space-y-3"
        data-testid="credential-form"
        @submit="signInCredential"
      >
        <UFormField label="Email" name="email">
          <UInput
            v-model="credState.email"
            type="email"
            placeholder="admin@yourdomain"
            autocomplete="username"
            class="w-full"
            data-testid="credential-email"
          />
        </UFormField>
        <UFormField label="Password" name="password">
          <UInput
            v-model="credState.password"
            type="password"
            autocomplete="current-password"
            class="w-full"
            data-testid="credential-password"
          />
        </UFormField>
        <UButton
          type="submit"
          block
          size="lg"
          color="primary"
          icon="i-lucide-log-in"
          :loading="credBusy"
          data-testid="credential-submit"
        >
          Sign in
        </UButton>
      </UForm>

      <USeparator v-if="providers.credential && providers.thecodeorigin" label="or" />

      <UButton
        v-if="providers.thecodeorigin"
        to="/api/auth/oidc"
        external
        block
        size="lg"
        icon="i-lucide-shield-check"
        color="primary"
        data-testid="signin-thecodeorigin"
      >
        Sign in with THECODEORIGIN
      </UButton>

      <p v-if="!providers.credential && !providers.thecodeorigin" class="text-sm text-muted text-center">
        No sign-in method is configured yet.
      </p>
    </div>

    <div v-if="isDev" class="space-y-3" data-testid="dev-login">
      <USeparator label="dev" />

      <UForm :state="devState" class="space-y-3" @submit="signInDev(devState.email)">
        <UFormField label="Seed user email" name="email" help="Dev backdoor — no password. Logs in as the seeded user so you can test CASL.">
          <UInput
            v-model="devState.email"
            type="email"
            placeholder="admin@seed.local"
            autocomplete="off"
            class="w-full"
            data-testid="dev-login-email"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          color="primary"
          icon="i-lucide-terminal"
          :loading="devBusy"
          data-testid="dev-login-submit"
        >
          Sign in (dev)
        </UButton>
      </UForm>

      <div class="flex flex-wrap gap-2 justify-center">
        <UButton
          v-for="email in SEED_EMAILS"
          :key="email"
          size="xs"
          color="neutral"
          variant="soft"
          :disabled="devBusy"
          @click="signInDev(email)"
        >
          {{ email }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
