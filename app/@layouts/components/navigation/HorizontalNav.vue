<script lang="ts" setup>
import type { NavItem } from '@base/@layouts/types'
import { HorizontalNavGroup, HorizontalNavLink } from '#components'

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
