<script setup lang="ts">
const authStore = useAuthStore()
const toast = useToast()
const isStopping = ref(false)

async function stopImpersonation() {
  isStopping.value = true
  try {
    await authStore.stopImpersonation()
    toast.add({ title: 'Stopped impersonation', color: 'success' })
    if (import.meta.client)
      window.location.reload()
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({
      title: 'Stop impersonation failed',
      description: error?.data?.statusMessage ?? error?.statusMessage ?? 'Unknown error',
      color: 'error',
    })
  }
  finally {
    isStopping.value = false
  }
}
</script>

<template>
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
        @click="stopImpersonation"
      >
        Stop impersonating
      </UButton>
    </div>
  </UCard>
</template>
