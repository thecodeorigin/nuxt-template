<script lang="ts" setup>
import { useLayoutConfigStore } from '@materialize/@layouts/stores/config'
import type { NavItem } from '@materialize/@layouts/types'
import { getComputedNavLinkToProp, getDynamicI18nProps, isNavLinkActive } from '@materialize/@layouts/utils'
import { layoutConfig } from '@materialize/@layouts'
import { NuxtLink } from '#components'

const props = defineProps<{
  item: NavItem
}>()

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

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
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="item.to ? NuxtLink : 'a'"
      v-bind="getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': isNavLinkActive(item, $router) }"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <!-- 👉 Title -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </Component>

        <!-- 👉 Badge -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
        >
          {{ item.badgeContent }}
        </Component>
      </TransitionGroup>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>
