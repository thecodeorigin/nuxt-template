<script setup lang="ts">
import { withQuery } from 'ufo'

const { t } = useI18n()
const route = useRoute()

const items = computed(() => [{
  label: t('Docs'),
  to: '/docs',
  active: route.path.startsWith('/docs'),
}, {
  label: t('Pricing'),
  to: '/pricing',
}, {
  label: t('Blog'),
  to: '/blog',
}])

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
      <UButton v-if="currentUser" :label="$t('Go to Dashboard')" color="neutral" variant="ghost" to="/app">
        <template #leading>
          <UAvatar
            :src="userAvatar"
            size="2xs"
          />
        </template>
      </UButton>
      <UButton
        v-else
        :label="$t('Sign in')"
        color="neutral"
        @click="navigateTo({ path: '/sign-in' }, { external: true })"
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

      <UButton v-if="currentUser" :label="$t('Go to Dashboard')" color="neutral" variant="ghost" to="/app">
        <template #leading>
          <UAvatar
            :src="userAvatar"
            size="2xs"
          />
        </template>
      </UButton>
      <UButton
        v-else
        :label="$t('Sign in')"
        color="neutral"
        block
        class="mb-3"
        @click="navigateTo({ path: '/sign-in' }, { external: true })"
      />
    </template>
  </UHeader>
</template>
