<script setup lang="ts">
import type { ImpersonationCandidate } from '#layers/auth/app/api/useAuthApi'
import { useAuthApi } from '#layers/auth/app/api/useAuthApi'

const authApi = useAuthApi()
const authStore = useAuthStore()
const toast = useToast()

const candidates = ref<ImpersonationCandidate[]>([])
const loadError = ref<string | null>(null)
const busyId = ref<string | null>(null)

async function fetchCandidates() {
  loadError.value = null
  try {
    const page = await authApi.fetchImpersonationCandidates()
    candidates.value = page?.items ?? []
  }
  catch (err: unknown) {
    const error = err as { statusCode?: number, statusMessage?: string }
    loadError.value = error?.statusMessage ?? 'Failed to load users'
    candidates.value = []
  }
}

async function startImpersonation(candidate: ImpersonationCandidate) {
  busyId.value = candidate.id
  try {
    await authStore.startImpersonation(candidate.id)
    toast.add({ title: `Now impersonating ${candidate.name ?? candidate.primary_email}`, color: 'success' })
    if (import.meta.client)
      window.location.reload()
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({
      title: 'Impersonation failed',
      description: error?.data?.statusMessage ?? error?.statusMessage ?? 'Unknown error',
      color: 'error',
    })
  }
  finally {
    busyId.value = null
  }
}

useAsyncData('impersonate-candidates', () => fetchCandidates())
</script>

<template>
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
            {{ user.primary_email }}
          </p>
        </div>
        <UButton
          size="sm"
          icon="i-lucide-user-check"
          :loading="busyId === user.id"
          :disabled="authStore.isImpersonating || !!user.is_suspended"
          :data-testid="`impersonate-${user.primary_email}`"
          @click="startImpersonation(user)"
        >
          Impersonate
        </UButton>
      </li>
    </ul>
  </UCard>
</template>
