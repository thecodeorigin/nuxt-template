<script setup lang="ts">
import UserBioPanel from '@base/components/users/UserBioPanel.vue'
import UserTabBillingsPlans from '@base/components/users/UserTabBillingsPlans.vue'
import UserTabConnections from '@base/components/users/UserTabConnections.vue'
import UserTabNotifications from '@base/components/users/UserTabNotifications.vue'
import UserTabOverview from '@base/components/users/UserTabOverview.vue'
import UserTabSecurity from '@base/components/users/UserTabSecurity.vue'
import { useUserStore } from '@base/stores/admin/user'

const route = useRoute('admin-users-id')

const userTab = ref(null)

const tabs = [
  { icon: 'ri-group-line', title: 'Overview' },
  { icon: 'ri-lock-2-line', title: 'Security' },
  { icon: 'ri-bookmark-line', title: 'Billing & Plan' },
  { icon: 'ri-notification-4-line', title: 'Notifications' },
  { icon: 'ri-link-m', title: 'Connections' },
]

const userStore = useUserStore()

const { data } = useLazyAsyncData('user', () => userStore.fetchUser(route.params.id))
</script>

<template>
  <VRow
    v-if="data?.data"
  >
    <VCol
      cols="12"
      md="5"
      lg="4"
    >
      <UserBioPanel
        :user="data.data"
      />
    </VCol>

    <VCol
      cols="12"
      md="7"
      lg="8"
    >
      <VTabs
        v-model="userTab"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.icon"
        >
          <VIcon
            start
            :icon="tab.icon"
          />
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>

      <VWindow
        v-model="userTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <UserTabOverview />
        </VWindowItem>

        <VWindowItem>
          <UserTabSecurity />
        </VWindowItem>

        <VWindowItem>
          <UserTabBillingsPlans />
        </VWindowItem>

        <VWindowItem>
          <UserTabConnections />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
  <div v-else>
    <VAlert
      type="error"
      variant="tonal"
    >
      User with ID  {{ route.params.id }} not found!
    </VAlert>
  </div>
</template>
