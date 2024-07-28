<script lang="ts" setup>
definePageMeta({
  sidebar: {
    title: 'Landing Page Editor',
    to: { name: 'landing-page-editor' },
    icon: { icon: 'ri-file-text-line' },
  },
})
</script>

<template>
  <form class="landing-page-editor">
    <LandingPageHeroSection />

    <VDivider class="my-6" />

    <LandingPageFeature />
  </form>
</template>

<style lang="scss" scoped>
.landing-page-editor {
  .landing-page-panel {
    :deep(.v-expansion-panel-text) {
      :deep(.v-expansion-panel-text__wrapper) {
        margin-top: 30px;
      }
    }
  }
}
</style>
