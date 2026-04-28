<script setup lang="ts">
const authStore = useAuthStore()
const toast = useToast()
const isStopping = ref(false)

async function stop() {
  isStopping.value = true
  try {
    await authStore.stopImpersonation()
    toast.add({ title: 'Stopped impersonation', color: 'success' })
    await navigateTo('/sandbox/impersonate')
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
</script>

<template>
  <div
    v-if="authStore.isImpersonating && authStore.impersonator"
    class="bg-warning text-inverted px-4 py-2 flex items-center justify-between gap-4"
    data-testid="global-impersonation-banner"
  >
    <div class="flex items-center gap-2 text-sm">
      <UIcon name="i-lucide-user-cog" class="size-4" />
      <span>
        Impersonating
        <strong>{{ authStore.currentUser?.name ?? authStore.currentUser?.primary_email }}</strong>
        as <strong>{{ authStore.impersonator.name }}</strong>
      </span>
    </div>
    <UButton
      size="xs"
      color="neutral"
      variant="solid"
      icon="i-lucide-log-out"
      :loading="isStopping"
      data-testid="banner-stop-impersonation"
      @click="stop"
    >
      Stop
    </UButton>
  </div>
</template>
