<script lang="ts" setup>
import { useConfigStore } from '@base/@core/stores/config'
import { AppContentLayoutNav } from '@base/@layouts/enums'
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@base/@layouts/utils'

const configStore = useConfigStore()

// ℹ️ This will switch to vertical nav when define breakpoint is reached when in horizontal nav layout
// Remove below composable usage if you are not using horizontal nav layout in your app
switchToVerticalNavOnLtOverlayNavBreakpoint()

const { layoutAttrs, injectSkinClasses } = useSkins()

injectSkinClasses()
</script>

<template>
  <div>
    <DefaultLayoutWithVerticalNav v-if="configStore.appContentLayoutNav === AppContentLayoutNav.Vertical" v-bind="layoutAttrs">
      <slot />
    </DefaultLayoutWithVerticalNav>
    <DefaultLayoutWithHorizontalNav v-else v-bind="layoutAttrs">
      <slot />
    </DefaultLayoutWithHorizontalNav>
  </div>
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@base/@layouts/styles/default-layout";
</style>
