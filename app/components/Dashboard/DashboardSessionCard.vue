<script setup lang="ts">
const { user, isImpersonating, impersonator, abilities } = useAuth()
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
            {{ user?.name ?? user?.email }}
          </p>
          <p class="text-xs text-muted" data-testid="current-user-email">
            {{ user?.email }}
          </p>
        </div>
        <UBadge
          v-if="isImpersonating"
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
            v-for="ability in abilities"
            :key="`${ability.action}:${ability.subject}`"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ ability.action }}:{{ ability.subject }}
          </UBadge>
          <span v-if="!abilities.length" class="text-xs text-muted">
            (none)
          </span>
        </div>
      </div>

      <div v-if="isImpersonating && impersonator">
        <p class="text-xs text-muted mb-1">
          Real user
        </p>
        <p class="text-sm">
          {{ impersonator.name }}
          <span class="text-muted">· {{ impersonator.email }}</span>
        </p>
      </div>
    </div>
  </UCard>
</template>
