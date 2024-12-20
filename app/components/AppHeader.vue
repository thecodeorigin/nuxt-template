<script setup lang="ts">
import type { NavItem } from '@nuxt/content'
import { mapContentNavigation } from '#imports'

const navigation = inject<Ref<NavItem[]>>('navigation', ref([]))

const links = [{
  label: 'Docs',
  to: '/docs',
}, {
  label: 'Pricing',
  to: '/pricing',
}, {
  label: 'Blog',
  to: '/blog',
}]
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      Nuxt Template <UBadge
        label="SaaS"
        variant="subtle"
        class="mb-0.5"
      />
    </template>

    <template #right>
      <UButton
        label="Go to Application"
        color="gray"
        to="/app"
        external
      />
    </template>

    <template #panel>
      <UNavigationTree
        :links="mapContentNavigation(navigation)"
        default-open
      />
    </template>
  </UHeader>
</template>
