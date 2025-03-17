<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
  label: 'Docs',
  to: '/docs',
  active: route.path.startsWith('/docs'),
}, {
  label: 'Pricing',
  to: '/pricing',
}, {
  label: 'Blog',
  to: '/blog',
}])

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
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <LogoPro class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UButton v-if="currentUser" label="Go to Dashboard" color="neutral" variant="ghost" to="/app">
        <template #leading>
          <UAvatar
            :src="userAvatar"
            size="2xs"
          />
        </template>
      </UButton>
      <UButton
        v-else
        label="Sign in"
        color="neutral"
        @click="authStore.signIn"
      />

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton v-if="currentUser" label="Go to Dashboard" color="neutral" variant="ghost" to="/app">
        <template #leading>
          <UAvatar
            :src="userAvatar"
            size="2xs"
          />
        </template>
      </UButton>
      <UButton
        v-else
        label="Sign in"
        color="neutral"
        block
        class="mb-3"
        @click="authStore.signIn"
      />
    </template>
  </UHeader>
</template>
