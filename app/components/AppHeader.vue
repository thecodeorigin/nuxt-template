<script setup lang="ts">
import { withQuery } from 'ufo'
import type { NavItem } from '@nuxt/content'
import { mapContentNavigation } from '#imports'

const navigation = inject<Ref<NavItem[]>>('navigation', ref([]))

const links = [
  {
    label: 'Documentation',
    to: '/docs',
  },
  {
    label: 'Pricing',
    to: '/pricing',
  },
  {
    label: 'Blog',
    to: '/blog',
  },
]

const authStore = useAuthStore()

const currentUser = useLogtoUser()

const userAvatar = computed(
  () => currentUser?.picture
    || currentUser?.identities.google?.details.avatar
    || currentUser?.identities.github?.details.avatar
    || currentUser?.identities.facebook?.details.avatar
    || withQuery('https://ui-avatars.com/api', { name: currentUser?.name }),
)
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      Nuxt Template <UBadge
        label="SaaS"
        variant="subtle"
        class="mb-0.5"
      />
    </template>

    <template #right>
      <UButton v-if="currentUser" label="Go to Dashboard" color="gray" to="/app" external>
        <template #leading>
          <UAvatar
            :src="userAvatar"
            size="2xs"
          />
        </template>
      </UButton>
      <UButton v-else label="Sign in" @click="authStore.signIn" />
    </template>

    <template #panel>
      <UNavigationTree
        :links="mapContentNavigation(navigation)"
        default-open
      />
    </template>
  </UHeader>
</template>
