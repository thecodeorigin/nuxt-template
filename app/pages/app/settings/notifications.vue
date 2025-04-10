<script setup lang="ts">
const formData = ref({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true,
})
const { t } = useI18n()
const sections = [
  {
    title: t('Notification channels'),
    description: t('Where can we notify you?'),
    fields: [
      {
        name: 'email' as const,
        label: t('Email'),
        description: t('Receive a daily email digest.'),
      },
      {
        name: 'desktop' as const,
        label: t('Desktop'),
        description: t('Receive desktop notifications.'),
      },
    ],
  },
  {
    title: t('Account updates'),
    description: t('Receive updates about Nuxt UI.'),
    fields: [
      {
        name: 'weekly_digest' as const,
        label: t('Weekly digest'),
        description: 'Receive a weekly digest of news.',
      },
      {
        name: 'product_updates' as const,
        label: t('Product updates'),
        description: t('Receive a monthly email with all new features and updates.'),
      },
      {
        name: 'important_updates' as const,
        label: t('Important updates'),
        description: t('Receive emails about important updates like security fixes, maintenance, etc.'),
      },
    ],
  },
]

async function onChange() {
  // Do something with data
  console.log(formData)
}
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard
      :title="section.title"
      :description="section.description"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-(--ui-border)' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch
          v-model="formData[field.name]"
          @update:model-value="onChange"
        />
      </UFormField>
    </UPageCard>
  </div>
</template>
