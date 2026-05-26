<script setup lang="ts">
const authStore = useAuthStore()

const canImpersonate = computed(
  () => (authStore.currentUser?.abilities ?? []).includes('user:impersonate'),
)
</script>

<template>
  <UCard>
    <template #header>
      <p class="font-semibold text-highlighted">
        Get started
      </p>
    </template>
    <ul class="space-y-2 text-sm">
      <li v-if="canImpersonate" class="flex items-center gap-2">
        <UIcon name="i-lucide-user-cog" class="size-4 text-muted" />
        <span class="text-muted">Use the dropdown at the top of the sidebar to impersonate any user.</span>
      </li>
    </ul>
  </UCard>
</template>
