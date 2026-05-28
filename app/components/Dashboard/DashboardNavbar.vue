<script setup lang="ts">
defineProps<{ title?: string }>()

const registry = useLayerRegistry()
const sortedNavbarItems = computed(() =>
  [...registry.navbarItems.value].sort((a, b) => a.priority - b.priority),
)
</script>

<template>
  <UDashboardNavbar :title="title">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #right>
      <slot name="right" />
      <ClientOnly>
        <component
          :is="item.component"
          v-for="item in sortedNavbarItems"
          :key="item.id"
        />
      </ClientOnly>
    </template>
  </UDashboardNavbar>
</template>
