<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <UCard data-testid="session-card">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div>
          <p class="text-sm text-muted">
            Signed in as
          </p>
          <p class="text-xl font-semibold text-highlighted" data-testid="current-user-name">
            {{ authStore.currentUser?.name ?? authStore.currentUser?.primary_email }}
          </p>
          <p class="text-xs text-muted" data-testid="current-user-email">
            {{ authStore.currentUser?.primary_email }}
          </p>
        </div>
        <UBadge
          v-if="authStore.isImpersonating"
          color="warning"
          variant="soft"
          icon="i-lucide-user-cog"
          data-testid="impersonating-badge"
        >
          Impersonating
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <div>
        <p class="text-xs text-muted mb-1">
          Abilities
        </p>
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="ability in authStore.currentUser?.abilities ?? []"
            :key="ability"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ ability }}
          </UBadge>
          <span v-if="!authStore.currentUser?.abilities?.length" class="text-xs text-muted">
            (none)
          </span>
        </div>
      </div>

      <div v-if="authStore.isImpersonating && authStore.impersonator">
        <p class="text-xs text-muted mb-1">
          Real user
        </p>
        <p class="text-sm">
          {{ authStore.impersonator.name }}
          <span class="text-muted">· {{ authStore.impersonator.primary_email }}</span>
        </p>
      </div>
    </div>
  </UCard>
</template>
