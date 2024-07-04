<script lang="ts" setup>
import { TransitionGroup } from 'vue'
import { layoutConfig } from '@layouts'
import { TransitionExpand, VerticalNavLink } from '@layouts/components'
import { canViewNavMenuGroup } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import { injectionKeyIsVerticalNavHovered } from '@layouts/symbols'
import type { NavGroup } from '@layouts/types'
import { getDynamicI18nProps, isNavGroupActive, openGroups } from '@layouts/utils'

defineOptions({
  name: 'VerticalNavGroup',
})

const props = defineProps<{
  item: NavGroup
}>()

const route = useRoute()
const router = useRouter()
const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

/*
  ℹ️ We provided default value `ref(false)` because inject will return `T | undefined`
  Docs: https://vuejs.org/api/composition-api-dependency-injection.html#inject
*/
const isVerticalNavHovered = inject(injectionKeyIsVerticalNavHovered, ref(false))

const isGroupActive = ref(false)
const isGroupOpen = ref(false)

/**
 * Checks if any of children group is open or not.
 * This is helpful in preventing closing inactive parent group when inactive child group is opened. (i.e. Do not close "Nav Levels" group if child "Nav Level 2.2" is opened/clicked)
 *
 * @param {NavGroup['children']} children  - Nav group children
 * @return {boolean} returns if any of children is open or not.
 */
const isAnyChildOpen = (children: NavGroup['children']): boolean => {
  return children.some(child => {
    let result = openGroups.value.includes(child.title)

    if ('children' in child)
      result = isAnyChildOpen(child.children) || result

    return result
  })
}

const collapseChildren = (children: NavGroup['children']) => {
  children.forEach(child => {
    if ('children' in child)
      collapseChildren(child.children)

    openGroups.value = openGroups.value.filter(group => group !== child.title)
  })
}

/*
  Watch for route changes, more specifically route path. Do note that this won't trigger if route's query is updated.

  updates isActive & isOpen based on active state of group.
*/
watch(
  () => route.path,
  () => {
    const isActive = isNavGroupActive(props.item.children, router)

    // Don't open group if vertical nav is collapsed and window size is more than overlay nav breakpoint
    isGroupOpen.value = isActive && !configStore.isVerticalNavMini(isVerticalNavHovered).value
    isGroupActive.value = isActive
  },
  { immediate: true },
)

/*
  Watch for isGroupOpen

    1. Find group index for adding/removing group from openGroups array
    2. update openGroups array for addition/removal of current group

  We need `immediate: true` because without it initially opened group is not added in openGroups array
*/
watch(isGroupOpen, (val: boolean) => {
  // Find group index for adding/removing group from openGroups array
  const grpIndex = openGroups.value.indexOf(props.item.title)

  // update openGroups array for addition/removal of current group

  // If group is opened => Add it to `openGroups` array
  if (val && grpIndex === -1) {
    openGroups.value.push(props.item.title)
  }

  // If group is closed remove itself and its children from the `openGroups`
  else if (!val && grpIndex !== -1) {
    openGroups.value.splice(grpIndex, 1)
    collapseChildren(props.item.children)
  }
}, { immediate: true })

/*
  Watch for openGroups

  It will help in making vertical nav adapting the behavior of accordion.
  If we open multiple groups without navigating to any route we must close the inactive or temporarily opened groups.

  😵‍💫 Gotchas:
    * If we open inactive group then it will auto close that group because we close groups based on active state.
      Goal of this watcher is auto close groups which are not active when openGroups array is updated.
      So, we have to find a way to do not close recently opened inactive group.
      For this we will fetch recently added group in openGroups array and won't perform closing operation if recently added group is current group
*/
watch(openGroups, val => {
  // Prevent closing recently opened inactive group.
  const lastOpenedGroup = val.at(-1)
  if (lastOpenedGroup === props.item.title)
    return

  const isActive = isNavGroupActive(props.item.children, router)

  // Goal of this watcher is to close inactive groups. So don't do anything for active groups.
  if (isActive)
    return

  // We won't close group if any of child group is open in current group
  if (isAnyChildOpen(props.item.children))
    return

  isGroupOpen.value = isActive
  isGroupActive.value = isActive
}, { deep: true })

// ℹ️ Previously instead of below watcher we were using two individual watcher for `isVerticalNavHovered`, `isVerticalNavCollapsed` & `isLessThanOverlayNavBreakpoint`
watch(
  configStore.isVerticalNavMini(isVerticalNavHovered),
  val => {
    isGroupOpen.value = val ? false : isGroupActive.value
  },
)

const isMounted = useMounted()
</script>

<template>
  <li
    v-if="canViewNavMenuGroup(item)"
    class="nav-group"
    :class="[
      {
        active: isGroupActive,
        open: isGroupOpen,
        disabled: item.disable,
      },
    ]"
  >
    <div
      class="nav-group-label"
      @click="isGroupOpen = !isGroupOpen"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <!--
        ℹ️ isMounted is workaround of nuxt's hydration issue:
        https://github.com/vuejs/core/issues/6715
      -->
      <Component
        :is="isMounted ? TransitionGroup : 'div'"
        name="transition-slide-x"
        v-bind="!isMounted ? { class: 'd-flex align-center flex-grow-1' } : undefined"
      >
        <!-- 👉 Title -->
        <Component
          :is=" layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-bind="getDynamicI18nProps(item.title, 'span')"
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
        >
          {{ item.title }}
        </Component>

        <!-- 👉 Badge -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
          v-show="!hideTitleAndBadge"
          v-if="item.badgeContent"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
        >
          {{ item.badgeContent }}
        </Component>
        <Component
          :is="layoutConfig.app.iconRenderer || 'div'"
          v-show="!hideTitleAndBadge"
          v-bind="layoutConfig.icons.chevronRight"
          key="arrow"
          class="nav-group-arrow"
        />
      </Component>
    </div>
    <TransitionExpand>
      <ul
        v-show="isGroupOpen"
        class="nav-group-children"
      >
        <Component
          :is="'children' in child ? 'VerticalNavGroup' : VerticalNavLink"
          v-for="child in item.children"
          :key="child.title"
          :item="child"
        />
      </ul>
    </TransitionExpand>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-group {
    &-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
}
</style>
