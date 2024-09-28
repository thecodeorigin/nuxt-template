<script lang="ts" setup>
import { HorizontalNavGroup, HorizontalNavLink } from '@materialize/@layouts/components'
import type { NavItem } from '@materialize/@layouts/types'

defineProps<{
  navItems: NavItem[]
}>()

function resolveNavItemComponent(item: NavItem) {
  if ('children' in item)
    return HorizontalNavGroup

  return HorizontalNavLink
}
</script>

<template>
  <ul class="nav-items">
    <Component
      :is="resolveNavItemComponent(item)"
      v-for="(item, index) in navItems"
      :key="index"
      :item="item"
    />
  </ul>
</template>

<style lang="scss">
.layout-wrapper.layout-nav-type-horizontal {
  .nav-items {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
