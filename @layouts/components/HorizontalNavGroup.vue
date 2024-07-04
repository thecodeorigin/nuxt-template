<script lang="ts" setup>
import { layoutConfig } from '@layouts'
import { HorizontalNavLink, HorizontalNavPopper } from '@layouts/components'
import { canViewNavMenuGroup } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import type { NavGroup } from '@layouts/types'
import { getDynamicI18nProps, isNavGroupActive } from '@layouts/utils'

interface Props {
  item: NavGroup
  childrenAtEnd?: boolean

  // ℹ️ We haven't added this prop in vertical nav because we don't need such differentiation in vertical nav for styling
  isSubItem?: boolean
}

defineOptions({
  name: 'HorizontalNavGroup',
})

const props = withDefaults(defineProps<Props>(), {
  childrenAtEnd: false,
  isSubItem: false,
})

const route = useRoute()
const router = useRouter()
const configStore = useLayoutConfigStore()

const isGroupActive = ref(false)

/*
  Watch for route changes, more specifically route path. Do note that this won't trigger if route's query is updated.

  updates isActive & isOpen based on active state of group.
*/
watch(() => route.path, () => {
  const isActive = isNavGroupActive(props.item.children, router)

  isGroupActive.value = isActive
}, { immediate: true })
</script>

<template>
  <HorizontalNavPopper
    v-if="canViewNavMenuGroup(item)"
    :is-rtl="configStore.isAppRTL"
    class="nav-group"
    tag="li"
    content-container-tag="ul"
    :class="[{
      'active': isGroupActive,
      'children-at-end': childrenAtEnd,
      'sub-item': isSubItem,
      'disabled': item.disable,
    }]"
    :popper-inline-end="childrenAtEnd"
  >
    <div class="nav-group-label">
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        class="nav-item-icon"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
      />
      <Component
        :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
        v-bind="getDynamicI18nProps(item.title, 'span')"
        class="nav-item-title"
      >
        {{ item.title }}
      </Component>
      <Component
        v-bind="layoutConfig.icons.chevronDown"
        :is="layoutConfig.app.iconRenderer || 'div'"
        class="nav-group-arrow"
      />
    </div>

    <template #content>
      <Component
        :is="'children' in child ? 'HorizontalNavGroup' : HorizontalNavLink"
        v-for="child in item.children"
        :key="child.title"
        :item="child"
        children-at-end
        is-sub-item
      />
    </template>
  </HorizontalNavPopper>
</template>

<style lang="scss">
.layout-horizontal-nav {
  .nav-group {
    .nav-group-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .popper-content {
      z-index: 1;

      > div {
        overflow: hidden auto;
      }
    }
  }
}
</style>
