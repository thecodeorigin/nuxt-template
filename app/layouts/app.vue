<script setup lang="ts">
const router = useRouter()
const { isHelpSlideoverOpen } = useDashboard()

const links = computed(() => createRouteTree(router.getRoutes()))

const footerLinks = [
  {
    label: 'Help & Support',
    icon: 'i-heroicons-question-mark-circle',
    click: () => isHelpSlideoverOpen.value = true,
  },
]

const groups = [{
  key: 'links',
  label: 'Go to',
  commands: links.value.map(link => ({ ...link, shortcuts: link.tooltip?.shortcuts })),
}]

const breadcrumbs = useBreadcrumbItems()

const { isNotificationsSlideoverOpen, hasUnreadNotification } = useDashboard()

const items = [
  [
    {
      label: 'New mail',
      icon: 'i-heroicons-paper-airplane',
      to: '/inbox',
    },
    {
      label: 'New user',
      icon: 'i-heroicons-user-plus',
      to: '/users',
    },
  ],
]
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel
      :width="250"
      :resizable="{ min: 200, max: 300 }"
      collapsible
    >
      <UDashboardNavbar
        class="!border-transparent"
        :ui="{ left: 'flex-1' }"
      >
        <template #left>
          <!-- <TeamsDropdown /> -->
          <span class="font-semibold">Nuxt Template</span>
          <UBadge
            label="SaaS"
            variant="subtle"
            class="mb-0.5"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardSidebar>
        <template #header>
          <UDashboardSearchButton />
        </template>

        <UDashboardSidebarLinks :links="links" />

        <div class="flex-1" />

        <UDashboardSidebarLinks :links="footerLinks" />

        <UDivider class="sticky bottom-0" />

        <template #footer>
          <!-- @base/components/UserDropdown.vue -->
          <UserDropdown />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <UDashboardPage>
      <UDashboardPanel grow>
        <UDashboardNavbar title="Home">
          <template #left>
            <UBreadcrumb :links="breadcrumbs" />
          </template>
          <template #right>
            <UTooltip
              text="Notifications"
              :shortcuts="['N']"
            >
              <UButton
                color="gray"
                variant="ghost"
                square
                @click="isNotificationsSlideoverOpen = true"
              >
                <UChip
                  color="red"
                  :show="hasUnreadNotification"
                  inset
                >
                  <UIcon
                    name="i-heroicons-bell"
                    class="w-5 h-5"
                  />
                </UChip>
              </UButton>
            </UTooltip>

            <UDropdown :items="items">
              <UButton
                icon="i-heroicons-plus"
                color="white"
                size="xs"
                variant="outline"
              >
                Create
              </UButton>
            </UDropdown>
          </template>
        </UDashboardNavbar>

        <slot />
      </UDashboardPanel>
    </UDashboardPage>

    <!-- @base/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- @base/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>
  </UDashboardLayout>
</template>
