<script lang="ts" setup>
import AccountSettingsAccount from '@/views/pages/account-settings/AccountSettingsAccount.vue'

const AccountSettingsBillingAndPlans = defineAsyncComponent(() => import('@/views/pages/account-settings/AccountSettingsBillingAndPlans.vue'))
// import AccountSettingsConnections from '@/views/pages/account-settings/AccountSettingsConnections.vue'
// import AccountSettingsNotification from '@/views/pages/account-settings/AccountSettingsNotification.vue'
// import AccountSettingsSecurity from '@/views/pages/account-settings/AccountSettingsSecurity.vue'

const route = useRoute('pages-account-settings-tab')

const activeTab = computed({
  get: () => route.params.tab,
  set: () => route.params.tab,
})

// tabs
const tabs = [
  { title: 'Account', icon: 'ri-group-line', tab: 'account' },
  // { title: 'Security', icon: 'ri-lock-line', tab: 'security' },
  { title: 'Billing & Plans', icon: 'ri-bookmark-line', tab: 'billing-plans' },
  // { title: 'Notifications', icon: 'ri-notification-3-line', tab: 'notification' },
  // { title: 'Connections', icon: 'ri-link', tab: 'connection' },
]

definePageMeta({
  navActiveLink: 'pages-account-settings-tab',
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
        :to="{ name: 'pages-account-settings-tab', params: { tab: item.tab } }"
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
        <!-- Account -->
        <VWindowItem value="account">
          <AccountSettingsAccount />
        </VWindowItem>

        <!-- Security -->
        <!-- <VWindowItem value="security">
          <AccountSettingsSecurity />
        </VWindowItem> -->

        <!-- Billing -->
        <VWindowItem value="billing-plans">
          <AccountSettingsBillingAndPlans />
        </VWindowItem>

        <!-- Notification -->
        <!-- <VWindowItem value="notification">
          <AccountSettingsNotification />
        </VWindowItem> -->

        <!-- Connections -->
        <!-- <VWindowItem value="connection">
          <AccountSettingsConnections />
        </VWindowItem> -->
      </VWindow>
    </ClientOnly>
  </div>
</template>
