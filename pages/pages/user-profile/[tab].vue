<script lang="ts" setup>
import UserProfileHeader from '@/views/pages/user-profile/UserProfileHeader.vue'
import UserConnections from '@/views/pages/user-profile/connections/index.vue'
import UserProfile from '@/views/pages/user-profile/profile/index.vue'
import UserProjects from '@/views/pages/user-profile/projects/index.vue'
import UserTeam from '@/views/pages/user-profile/team/index.vue'

definePageMeta({
  navActiveLink: 'pages-user-profile-tab',
  key: 'tab',

})

const route = useRoute('pages-user-profile-tab')

const activeTab = computed({
  get: () => route.params.tab,
  set: () => route.params.tab,
})

// tabs
const tabs = [
  { title: 'Profile', icon: 'ri-user-line', tab: 'profile' },
  { title: 'Team', icon: 'ri-team-line', tab: 'teams' },
  { title: 'Projects', icon: 'ri-computer-line', tab: 'projects' },
  { title: 'Connections', icon: 'ri-link', tab: 'connections' },
]
</script>

<template>
  <div>
    <UserProfileHeader class="mb-6" />

    <VTabs
      v-model="activeTab"
      class="v-tabs-pill"
    >
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
        :to="{ name: 'pages-user-profile-tab', params: { tab: item.tab } }"
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
        <!-- Profile -->
        <VWindowItem value="profile">
          <UserProfile />
        </VWindowItem>

        <!-- Teams -->
        <VWindowItem value="teams">
          <UserTeam />
        </VWindowItem>

        <!-- Projects -->
        <VWindowItem value="projects">
          <UserProjects />
        </VWindowItem>

        <!-- Connections -->
        <VWindowItem value="connections">
          <UserConnections />
        </VWindowItem>
      </VWindow>
    </ClientOnly>
  </div>
</template>
