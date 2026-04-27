<script setup lang="ts">
useHead({ title: 'Nuxt template' })
</script>

<template>
  <UContainer class="py-16">
    <div class="text-center space-y-6 max-w-2xl mx-auto">
      <UBadge color="primary" variant="soft" size="lg">
        Nuxt 4 · Nuxt UI v4 · Drizzle · Pinia · Vitest · Playwright
      </UBadge>
      <h1 class="text-4xl font-bold text-highlighted">
        Vibe-code-friendly Nuxt template
      </h1>
      <p class="text-lg text-muted">
        Strict, safe, TDD-first. Open the todos slice for a complete reference
        feature using only Nuxt UI components.
      </p>
      <div class="flex gap-3 justify-center">
        <UButton to="/todos" size="lg" icon="i-lucide-list-todo" trailing-icon="i-lucide-arrow-right">
          View todos
        </UButton>
        <UButton
          to="https://ui.nuxt.com"
          target="_blank"
          variant="outline"
          size="lg"
          icon="i-lucide-external-link"
        >
          Nuxt UI docs
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
