<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const authStore = useAuthStore()

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

const items = computed<DropdownMenuItem[][]>(() => ([
  [{
    type: 'label',
    label: user.value.name,
    avatar: user.value.avatar,
  }],
  [{
    label: 'Appearance',
    icon: 'i-lucide-sun-moon',
    children: [{
      label: 'Light',
      icon: 'i-lucide-sun',
      type: 'checkbox',
      checked: colorMode.value === 'light',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'light'
      },
    }, {
      label: 'Dark',
      icon: 'i-lucide-moon',
      type: 'checkbox',
      checked: colorMode.value === 'dark',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'dark'
      },
    }, {
      label: 'System',
      icon: 'i-lucide-laptop',
      type: 'checkbox',
      checked: colorMode.preference === 'system',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'system'
      },
    }],
  }],
  [{
    label: 'Documentation',
    icon: 'i-lucide-book-open',
    to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
    target: '_blank',
  }, {
    label: 'GitHub repository',
    icon: 'i-simple-icons-github',
    to: 'https://github.com/thecodeorigin/nuxt-template',
    target: '_blank',
  }, {
    label: 'Log out',
    icon: 'i-lucide-log-out',
    onSelect: () => { void logout() },
  }],
]))
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
