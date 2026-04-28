<script setup lang="ts">
import type { ImpersonationCandidate } from '~/api/useAuthApi'
import { useAuthApi } from '~/api/useAuthApi'

definePageMeta({ can: ['user:impersonate'] })
useHead({ title: 'Impersonation sandbox' })

const authApi = useAuthApi()
const authStore = useAuthStore()
const toast = useToast()

const candidates = ref<ImpersonationCandidate[]>([])
const loadError = ref<string | null>(null)
const busyId = ref<string | null>(null)
const isStopping = ref(false)

async function loadCandidates() {
  loadError.value = null
  try {
    candidates.value = await authApi.fetchImpersonationCandidates()
  }
  catch (err: unknown) {
    const error = err as { statusCode?: number, statusMessage?: string }
    loadError.value = error?.statusMessage ?? 'Failed to load users'
    candidates.value = []
  }
}

async function impersonate(user: ImpersonationCandidate) {
  busyId.value = user.id
  try {
    await authStore.startImpersonation(user.id)
    toast.add({ title: `Now impersonating ${user.name ?? user.primary_email}`, color: 'success' })
  }
  catch (err: unknown) {
    const error = err as { statusCode?: number, statusMessage?: string }
    toast.add({
      title: 'Impersonation failed',
      description: error?.statusMessage ?? 'Unknown error',
      color: 'error',
    })
  }
  finally {
    busyId.value = null
  }
}

async function stop() {
  isStopping.value = true
  try {
    await authStore.stopImpersonation()
    toast.add({ title: 'Stopped impersonation', color: 'success' })
  }
  catch (err: unknown) {
    const error = err as { statusCode?: number, statusMessage?: string }
    toast.add({
      title: 'Stop impersonation failed',
      description: error?.statusMessage ?? 'Unknown error',
      color: 'error',
    })
  }
  finally {
    isStopping.value = false
  }
}

await useAsyncData('impersonate-candidates', () => loadCandidates())
</script>

<template>
  <UContainer class="py-12 max-w-3xl">
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">
          Impersonation sandbox
        </h1>
        <p class="text-muted">
          Admins with the <code>user:impersonate</code> ability can sign in as
          any other user. The Redis session swaps to the target so every
          authorization check (server and client) reflects the impersonated
          user.
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">
                Current session
              </p>
              <p class="font-semibold text-highlighted" data-testid="current-user-name">
                {{ authStore.currentUser?.name ?? authStore.currentUser?.primary_email ?? 'Not signed in' }}
              </p>
              <p class="text-xs text-muted" data-testid="current-user-email">
                {{ authStore.currentUser?.primary_email }}
              </p>
            </div>
            <UBadge
              v-if="authStore.isImpersonating"
              color="warning"
              variant="soft"
              data-testid="impersonating-badge"
            >
              Impersonating
            </UBadge>
          </div>
        </template>

        <div v-if="authStore.currentUser" class="space-y-2">
          <div>
            <p class="text-xs text-muted">
              Abilities
            </p>
            <div class="flex flex-wrap gap-1 mt-1">
              <UBadge
                v-for="a in authStore.currentUser.abilities"
                :key="a"
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ a }}
              </UBadge>
              <span v-if="authStore.currentUser.abilities.length === 0" class="text-xs text-muted">
                (none)
              </span>
            </div>
          </div>
        </div>
      </UCard>

      <UCard
        v-if="authStore.isImpersonating && authStore.impersonator"
        data-testid="impersonator-card"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user-cog" class="size-4 text-warning" />
            <p class="font-semibold text-highlighted">
              Impersonator (real session)
            </p>
          </div>
        </template>

        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-medium" data-testid="impersonator-name">
              {{ authStore.impersonator.name }}
            </p>
            <p class="text-xs text-muted" data-testid="impersonator-email">
              {{ authStore.impersonator.primary_email }}
            </p>
          </div>
          <UButton
            color="warning"
            variant="solid"
            icon="i-lucide-log-out"
            :loading="isStopping"
            data-testid="stop-impersonation"
            @click="stop"
          >
            Stop impersonating
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <p class="font-semibold text-highlighted">
            Available users
          </p>
        </template>

        <div v-if="loadError" class="text-sm text-error" data-testid="candidates-error">
          {{ loadError }}
        </div>
        <div v-else-if="candidates.length === 0" class="text-center text-muted py-8">
          No other users to impersonate.
        </div>
        <ul v-else class="divide-y divide-default" data-testid="candidates-list">
          <li
            v-for="user in candidates"
            :key="user.id"
            class="flex items-center gap-3 py-3"
            :data-testid="`candidate-${user.primary_email}`"
          >
            <div class="flex-1">
              <p class="font-medium">
                {{ user.name ?? user.username ?? user.primary_email }}
              </p>
              <p class="text-xs text-muted">
                {{ user.primary_email }} · {{ user.abilities.length }} abilities
              </p>
            </div>
            <UButton
              size="sm"
              icon="i-lucide-user-check"
              :loading="busyId === user.id"
              :disabled="authStore.isImpersonating || !!user.is_suspended"
              :data-testid="`impersonate-${user.primary_email}`"
              @click="impersonate(user)"
            >
              Impersonate
            </UButton>
          </li>
        </ul>
      </UCard>
    </div>
  </UContainer>
</template>
