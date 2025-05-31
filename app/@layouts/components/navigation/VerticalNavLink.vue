<script lang="ts" setup>
import { useLayoutConfigStore } from '@base/@layouts/stores/config'
import type { NavItem } from '@base/@layouts/types'
import { getComputedNavLinkToProp, getDynamicI18nProps, isNavLinkActive } from '@base/@layouts/utils'
import { layoutConfig } from '@base/config'
import { NuxtLink } from '#components'

const props = defineProps<{
  item: NavItem
}>()

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

const { can } = useAbility()

const router = useRouter()

const visible = computed(() => {
  if (!props.item.scopes)
    return true

  return props.item.scopes.some((scope: string) => {
    const [action, subject] = scope.split(':') as [string, string]

    return can(action, subject)
  })
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
      :class="{ 'router-link-active router-link-exact-active': isNavLinkActive(item, router) }"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <!-- 👉 Title -->
        <i18n-t
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </i18n-t>

        <!-- 👉 Badge -->
        <i18n-t
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
        >
          {{ item.badgeContent }}
        </i18n-t>
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
