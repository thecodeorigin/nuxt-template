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
  <div class="landing-page-container">
    <div class="landing-page-header d-flex align-center justify-space-between mb-8">
      <VLabel class="text-h2 text-capitalize font-weight-bold">
        Landing page Editor
      </VLabel>

      <VBtn
        class="text-capitalize"
        type="submit"
        color="primary"
        variant="outlined"
        @click="handleNavigate"
      >
        Preview landing page
      </VBtn>
    </div>

    <form class="landing-page-editor">
      <client-only>
        <HeroSectionEditor />
      </client-only>

      <VDivider class="my-8" />
      <client-only>
        <FeatureSectionEditor />
      </client-only>

      <VDivider class="my-8" />
      <client-only>
        <ReviewSectionEditor />
      </client-only>

      <VDivider class="my-8" />
      <client-only>
        <OurTeamSectionEditor />
      </client-only>

      <VDivider class="my-8" />
      <client-only>
        <PricingSectionEditor />
      </client-only>

      <VDivider class="my-8" />
      <client-only>
        <ProductStatEditor />
      </client-only>

      <VDivider class="my-8" />

      <client-only>
        <FaqSectionEditor />
      </client-only>

      <VDivider class="my-8" />
      <client-only>
        <BannerSectionEditor />
      </client-only>

      <VDivider class="my-8" />
      <client-only>
        <ContactUsSectionEditor />
      </client-only>
    </form>
  </div>
</template>

<style lang="scss" scoped>

</style>
