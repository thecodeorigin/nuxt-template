<script lang="ts" setup>
const layoutStore = useLayoutStore()

const config = useRuntimeConfig()
</script>

<template>
  <HorizontalNavLayout :nav-items="layoutStore.horizontalLayoutItems">
    <!-- 👉 navbar -->
    <template #navbar>
      <NuxtLink
        to="/"
        class="app-logo"
      >
        <img
          :src="config.public.theme.appLogo"
          :alt="config.public.theme.appName"
          width="auto"
          height="24"
        >

        <h1 class="app-logo-title leading-normal">
          {{ config.public.theme.appName }}
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
  }
}
</style>
