<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const authStore = useAuthStore()
const toast = useToast()

const user = computed(() => ({
  name: authStore.currentUser?.name ?? authStore.currentUser?.primary_email ?? 'Guest',
  email: authStore.currentUser?.primary_email ?? '',
  avatar: authStore.currentUser?.avatar
    ? { src: authStore.currentUser.avatar, alt: authStore.currentUser.name ?? '' }
    : undefined,
}))

async function logout() {
  try {
    await authStore.logout()
  }
  finally {
    await navigateTo('/auth/login')
  }
}

async function stopImpersonation() {
  try {
    await authStore.stopImpersonation()
    toast.add({ title: 'Stopped impersonation', color: 'success' })
    if (import.meta.client)
      window.location.reload()
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({
      title: 'Stop impersonation failed',
      description: error?.data?.statusMessage ?? error?.statusMessage ?? 'Unknown error',
      color: 'error',
    })
  }
}

const items = computed<DropdownMenuItem[][]>(() => {
  const groups: DropdownMenuItem[][] = []

  groups.push([{
    type: 'label',
    label: user.value.name,
    avatar: user.value.avatar,
  }])

  if (authStore.isImpersonating) {
    groups.push([{
      label: `Back to ${authStore.impersonator?.name ?? authStore.impersonator?.primary_email ?? 'admin'}`,
      icon: 'i-lucide-shield',
      color: 'warning' as const,
      onSelect: () => { void stopImpersonation() },
    }])
  }

  groups.push([
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/settings',
    },
  ])

  groups.push([
    {
      label: 'Appearance',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'light'
          },
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'dark'
          },
        },
        {
          label: 'System',
          icon: 'i-lucide-laptop',
          type: 'checkbox',
          checked: colorMode.preference === 'system',
          onSelect(e: Event) {
            e.preventDefault()
            colorMode.preference = 'system'
          },
        },
      ],
    },
  ])

  groups.push([
    {
      label: 'Documentation',
      icon: 'i-lucide-book-open',
      to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
      target: '_blank',
    },
    {
      label: 'GitHub repository',
      icon: 'i-simple-icons-github',
      to: 'https://github.com/thecodeorigin/nuxt-template',
      target: '_blank',
    },
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: () => { void logout() },
    },
  ])

  return groups
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-56' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="user.avatar ? { avatar: user.avatar } : { icon: 'i-lucide-user' }"
      :label="collapsed ? undefined : user.name"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
      data-testid="user-menu-trigger"
    />
  </UDropdownMenu>
</template>
