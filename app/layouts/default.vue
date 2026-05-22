<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import ImpersonateMenu from '#layers/auth/app/components/Impersonate/ImpersonateMenu.vue'
import OrganizationSwitcher from '#layers/auth/app/components/Organization/OrganizationSwitcher.vue'
import UserMenu from '#layers/auth/app/components/User/UserMenu.vue'

const open = ref(false)

const links = [[{
  label: 'Todos',
  icon: 'i-lucide-list-todo',
  to: '/todos',
  onSelect: () => {
    open.value = false
  },
}]] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div class="flex flex-col w-full gap-1">
          <OrganizationSwitcher :collapsed="collapsed" />
          <ImpersonateMenu :collapsed="collapsed" />
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
