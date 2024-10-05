<script lang="ts" setup>
import NavBarI18n from '@base/@core/components/I18n.vue'
import { VNodeRenderer } from '@base/@layouts/components/VNodeRenderer'
import { themeConfig } from '@base/config'
import { HorizontalNavLayout } from '@base/@layouts'

// Components
import Footer from './Footer.vue'
import NavBarNotifications from './NavBarNotifications.vue'
import NavSearchBar from './NavSearchBar.vue'
import NavbarShortcuts from './NavbarShortcuts.vue'
import NavbarThemeSwitcher from './NavbarThemeSwitcher.vue'
import UserProfile from './UserProfile.vue'

const layoutStore = useLayoutStore()
</script>

<template>
  <HorizontalNavLayout :nav-items="layoutStore.horizontalLayoutItems">
    <!-- 👉 navbar -->
    <template #navbar>
      <NuxtLink
        to="/"
        class="app-logo"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />

        <h1 class="app-logo-title leading-normal">
          {{ themeConfig.app.title }}
        </h1>
      </NuxtLink>
      <VSpacer />

      <NavSearchBar />

      <NavBarI18n />

      <NavbarThemeSwitcher />
      <NavbarShortcuts />
      <NavBarNotifications class="me-2" />
      <UserProfile />
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </HorizontalNavLayout>
</template>

<style lang="scss" scoped>
.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    text-transform: capitalize;
  }
}
</style>
