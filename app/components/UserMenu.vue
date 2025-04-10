<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { withQuery } from 'ufo'

defineProps<{
  collapsed?: boolean
}>()

const { t } = useI18n()

const currentUser = useLogtoUser()

const userAvatar = computed(
  () => currentUser?.picture
    || currentUser?.identities.google?.details.avatar
    || currentUser?.identities.github?.details.avatar
    || currentUser?.identities.facebook?.details.avatar
    || withQuery('https://ui-avatars.com/api', { name: currentUser?.name }),
)

const userName = computed(() => currentUser?.name || currentUser?.email || currentUser?.username || '')

const userIdentity = computed(() => currentUser?.email || currentUser?.username)

const items = computed<DropdownMenuItem[][]>(() => ([
  [
    {
      type: 'label',
      label: userIdentity.value,
    },
  ],
  [
    {
      label: t('Profile'),
      icon: 'i-lucide-user',
      to: '/app/settings/profile',
    },
    {
      label: t('Billing'),
      icon: 'i-lucide-credit-card',
      to: '/app/settings/billing',
    },
    {
      label: t('Security'),
      icon: 'i-lucide-shield',
      to: '/app/settings/security',
    },
  ],
  [
    {
      label: t('Documentation'),
      icon: 'i-lucide-book-open',
      to: '/docs',
      target: '_blank',
    },
  ],
  [
    {
      label: t('Log out'),
      icon: 'i-lucide-log-out',
      onSelect() {
        navigateTo({ path: '/sign-out' }, { external: true })
      },
    },
  ],
]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      block
      color="neutral"
      variant="ghost"
      class="data-[state=open]:bg-(--ui-bg-elevated)"
      :avatar="{
        src: userAvatar,
        alt: userName,
      }"
      :label="collapsed ? undefined : userName"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :square="collapsed"
      :ui="{
        trailingIcon: 'text-(--ui-text-dimmed)',
      }"
    />

    <template #chip-leading="{ item }">
      <span
        :style="{ '--chip': `var(--color-${(item as any).chip}-400)` }"
        class="ms-0.5 size-2 rounded-full bg-(--chip)"
      />
    </template>
  </UDropdownMenu>
</template>
