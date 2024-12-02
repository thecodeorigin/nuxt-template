<script lang="ts" setup>
const { t } = useI18n()

const route = useRoute('settings-tab')

const activeTab = computed({
  get: () => route.params.tab,
  set: () => route.params.tab,
})

const config = useRuntimeConfig()

const tabs = computed(() => {
  const _tabs = [
    { title: t('Account'), icon: 'ri-group-line', tab: 'account' },
  ]

  if (config.public.features.credit)
    _tabs.push({ title: t('Credit'), icon: 'ri-coins-line', tab: 'credit' })

  if (config.public.features.subscription)
    _tabs.push({ title: t('Subscription'), icon: 'ri-time-line', tab: 'subscription' })

  return _tabs
})

definePageMeta({
  navActiveLink: 'settings-tab',
})
</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      class="v-tabs-pill"
    >
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
        :to="{ name: 'settings-tab', params: { tab: item.tab } }"
      >
        <VIcon
          start
          :icon="item.icon"
        />
        {{ item.title }}
      </VTab>
    </VTabs>

    <ClientOnly>
      <VWindow
        v-model="activeTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem value="account">
          <AccountSettingsAccount />
        </VWindowItem>

        <VWindowItem v-if="config.public.features.credit" value="credit">
          <LazyAccountSettingsCredit />
        </VWindowItem>

        <VWindowItem v-if="config.public.features.subscription" value="subscription">
          <LazyAccountSettingsSubscription />
        </VWindowItem>
      </VWindow>
    </ClientOnly>
  </div>
</template>
