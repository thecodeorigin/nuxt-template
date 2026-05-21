<script setup lang="ts">
import ImpersonateCandidateList from '#layers/auth/app/components/Impersonate/ImpersonateCandidateList.vue'
import ImpersonateStopButton from '#layers/auth/app/components/Impersonate/ImpersonateStopButton.vue'
import DashboardSessionCard from '~/components/Dashboard/DashboardSessionCard.vue'

definePageMeta({ can: ['user:impersonate'] })
useHead({ title: 'Impersonation sandbox' })

const authStore = useAuthStore()
</script>

<template>
  <UDashboardPanel id="impersonate-sandbox">
    <template #header>
      <UDashboardNavbar title="Impersonation sandbox">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6 max-w-3xl">
        <p class="text-sm text-muted">
          Admins with the <code>user:impersonate</code> ability can sign in as
          any other user. The KV session swaps to the target so every
          authorization check (server and client) reflects the impersonated
          user.
        </p>

        <DashboardSessionCard />
        <ImpersonateStopButton />
        <ImpersonateCandidateList v-if="!authStore.isImpersonating" />
      </div>
    </template>
  </UDashboardPanel>
</template>
