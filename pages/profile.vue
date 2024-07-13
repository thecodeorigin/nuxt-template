<script setup lang="ts">
import UserBioPanel from '@/views/apps/user/view/UserBioPanel.vue'
import UserTabSecurity from '@/views/apps/user/view/UserTabSecurity.vue'
// import UserTabConnections from '@/views/apps/user/view/UserTabConnections.vue'
const UserTabBillingsPlans = defineAsyncComponent(() => import('@/views/apps/user/view/UserTabBillingsPlans.vue'))
const UserTabNotifications = defineAsyncComponent(() => import('@/views/apps/user/view/UserTabNotifications.vue'))
// import UserTabOverview from '@/views/apps/user/view/UserTabOverview.vue'

const userTab = ref(null)

const tabs = [
  // { icon: 'ri-group-line', title: 'Overview' },
  { icon: 'ri-lock-2-line', title: 'Security' },
  { icon: 'ri-bookmark-line', title: 'Billing & Plan' },
  { icon: 'ri-notification-4-line', title: 'Notifications' },
  // { icon: 'ri-link-m', title: 'Connections' },
]

const { currentUser } = useAuthStore()
</script>

<template>
  <VRow v-if="currentUser">
    <VCol
      cols="12"
      md="5"
      lg="4"
    >
      <UserBioPanel />
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
        <!-- <VWindowItem>
          <UserTabOverview />
        </VWindowItem> -->

        <VWindowItem>
          <UserTabSecurity />
        </VWindowItem>

        <VWindowItem>
          <UserTabBillingsPlans />
        </VWindowItem>

        <VWindowItem>
          <UserTabNotifications />
        </VWindowItem>

        <!-- <VWindowItem>
          <UserTabConnections />
        </VWindowItem> -->
      </VWindow>
    </VCol>
  </VRow>
  <div v-else>
    <VAlert
      type="error"
      variant="tonal"
    >
      Cannot get user data!
    </VAlert>
  </div>
</template>
