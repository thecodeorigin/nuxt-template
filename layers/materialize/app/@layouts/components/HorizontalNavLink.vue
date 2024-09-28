<script lang="ts" setup>
import type { NavItem } from '@materialize/@layouts/types'
import { getComputedNavLinkToProp, getDynamicI18nProps, isNavLinkActive } from '@materialize/@layouts/utils'
import { layoutConfig } from '@materialize/@layouts'
import { NuxtLink } from '#components'

interface Props {
  item: NavItem

  // ℹ️ We haven't added this prop in vertical nav because we don't need such differentiation in vertical nav for styling
  isSubItem?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubItem: false,
})

const { can } = useAbility()

const visible = computed(() => {
  if (!props.item.action || !props.item.subject)
    return true

  return can(props.item.action, props.item.subject)
})
</script>

<template>
  <li
    v-if="visible"
    class="nav-link"
    :class="[{
      'sub-item': props.isSubItem,
      'disabled': item.disable,
    }]"
  >
    <Component
      :is="item.to ? NuxtLink : 'a'"
      v-bind="getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': isNavLinkActive(item, $router) }"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        class="nav-item-icon"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
      />
      <Component
        :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
        class="nav-item-title"
        v-bind="getDynamicI18nProps(item.title, 'span')"
      >
        {{ item.title }}
      </Component>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-horizontal-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>
