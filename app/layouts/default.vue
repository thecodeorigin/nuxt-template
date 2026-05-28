<script setup lang="ts">
import type { CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'
import type { RegistryNavItem } from '~/composables/useLayerRegistry'
import ImpersonateMenu from '#layers/auth/app/components/Impersonate/ImpersonateMenu.vue'
import OrganizationMenu from '#layers/auth/app/components/Organization/OrganizationMenu.vue'
import UserMenu from '#layers/auth/app/components/User/UserMenu.vue'
import { satisfiesAbility } from '#layers/auth/shared/ability'

const open = ref(false)
const colorMode = useColorMode()
const authStore = useAuthStore()
const registry = useLayerRegistry()

onMounted(() => {
  useCookieConsent().prompt()
})

function closeMenu() {
  open.value = false
}
function setTheme(pref: string) {
  colorMode.preference = pref
}

const abilities = computed(() => authStore.currentUser?.abilities ?? [])

function canShow(item: RegistryNavItem): boolean {
  if (!item.ability)
    return true
  const abs = Array.isArray(item.ability) ? item.ability : [item.ability]
  return abs.some(a => satisfiesAbility(abilities.value, a))
}

function toMenuItem(item: RegistryNavItem): NavigationMenuItem {
  return {
    label: item.label,
    icon: item.icon,
    to: item.to,
    type: item.type,
    defaultOpen: item.defaultOpen,
    children: item.children?.filter(canShow).map(toMenuItem),
    onSelect() {
      item.onSelect?.()
      if (!item.children?.length)
        closeMenu()
    },
  }
}

const links = computed<NavigationMenuItem[][]>(() => {
  const sorted = [...registry.navItems.value].sort((a, b) => a.priority - b.priority)

  const mainItems = sorted
    .filter(i => i.section === 'main' && canShow(i))
    .map(toMenuItem)

  const settingsChildren = sorted
    .filter(i => i.section === 'settings' && canShow(i))
    .map(toMenuItem)

  const settingsGroup: NavigationMenuItem = {
    label: 'Settings',
    icon: 'i-lucide-settings',
    defaultOpen: true,
    type: 'trigger',
    children: settingsChildren,
  }

  const subItems = sorted
    .filter(i => i.section === 'sub' && canShow(i))
    .map(toMenuItem)

  return [[...mainItems, settingsGroup], subItems]
})

const groups = computed(() => [{
  id: 'goto',
  label: 'Go to',
  items: links.value.flat().flatMap(i => (i.children?.length ? i.children : [i])) as CommandPaletteItem[],
}, {
  id: 'theme',
  label: 'Theme',
  items: [
    { label: 'System', icon: 'i-lucide-monitor', onSelect: () => setTheme('system') },
    { label: 'Light', icon: 'i-lucide-sun', onSelect: () => setTheme('light') },
    { label: 'Dark', icon: 'i-lucide-moon', onSelect: () => setTheme('dark') },
  ],
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{
        header: 'lg:border-b lg:border-default',
        footer: 'lg:border-t lg:border-default',
        body: 'gap-2 py-4',
      }"
    >
      <template #header="{ collapsed }">
        <OrganizationMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <ImpersonateMenu :collapsed="collapsed" />

        <ClientOnly>
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[0]"
            orientation="vertical"
            tooltip
            popover
          />

          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[1]"
            orientation="vertical"
            tooltip
            popover
            class="mt-auto"
          />
        </ClientOnly>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <ClientOnly>
      <component
        :is="overlay.component"
        v-for="overlay in registry.overlays.value"
        :key="overlay.id"
      />
    </ClientOnly>
  </UDashboardGroup>
</template>
