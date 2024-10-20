<script lang="ts" setup>
const { t } = useI18n()

const route = useRoute('settings-tab')

const activeTab = computed({
  get: () => route.params.tab,
  set: () => route.params.tab,
})

// tabs
const tabs = [
  { title: t('Account'), icon: 'ri-group-line', tab: 'account' },
  { title: t('Billing & Plans'), icon: 'ri-bookmark-line', tab: 'billing-plans' },
]

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

        <VWindowItem value="billing-plans">
          <LazyAccountSettingsBillingAndPlans />
        </VWindowItem>
      </VWindow>
    </ClientOnly>
  </div>
</template>
