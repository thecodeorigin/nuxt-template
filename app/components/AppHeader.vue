<script setup lang="ts">
import type { NavItem } from '@nuxt/content'
import { mapContentNavigation } from '#imports'

const currentUser = useLogtoUser()

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

const userAvatar = computed(
  () => currentUser.value.picture
    || currentUser.value.identities.google.details.avatar
    || currentUser.value.identities.github.details.avatar
    || currentUser.value.identities.facebook.details.avatar
    || 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
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
      <UButton v-else label="Sign in" to="/sign-in" external />
    </template>

    <template #panel>
      <UNavigationTree
        :links="mapContentNavigation(navigation)"
        default-open
      />
    </template>
  </UHeader>
</template>
