<script setup lang="ts">
const { t } = useI18n()

const columns = [{
  label: t('Resources'),
  children: [{
    label: t('Help center'),
  }, {
    label: t('Docs'),
  }, {
    label: t('Roadmap'),
  }, {
    label: t('Changelog'),
  }],
}, {
  label: t('Features'),
  children: [{
    label: t('Affiliates'),
  }, {
    label: t('Portal'),
  }, {
    label: t('Jobs'),
  }, {
    label: t('Sponsors'),
  }],
}, {
  label: t('Company'),
  children: [{
    label: t('About'),
  }, {
    label: t('Pricing'),
  }, {
    label: t('Careers'),
  }, {
    label: t('Blog'),
  }],
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: t('Subscribed!'),
    description: t('You\'ve been subscribed to our newsletter.'),
  })
}
</script>

<template>
  <USeparator
    icon="i-simple-icons-nuxtdotjs"
    class="h-px"
  />
  <UFooter :ui="{ top: 'border-b border-[var(--ui-border)]' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                :label="$t('Subscribe to our newsletter')"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Enter your email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      :label="$t('Subscribe')"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-(--ui-text-muted) text-sm">
        {{ $t('Copyright © {0}. All rights reserved.', [new Date().getFullYear()]) }}
      </p>
    </template>

    <template #right>
      <UColorModeButton />
    </template>
  </UFooter>
</template>
