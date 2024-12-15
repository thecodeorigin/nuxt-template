<script setup lang="ts">
const authStore = useAuthStore()

const team = ref()

const organizations = computed(() => (
  [`${authStore.currentUser?.name}'s organization`].concat(authStore.currentUser?.organizations || [])
).map(org => ({
  label: org,
  click: () => {
    team.value = org
  },
})))

onBeforeMount(() => {
  team.value = organizations.value[0]
})

const actions = [
  {
    label: 'Create team',
    icon: 'i-heroicons-plus-circle',
    disabled: true,
  },
  {
    label: 'Manage teams',
    icon: 'i-heroicons-cog-8-tooth',
    disabled: true,
    tooltip: {
      text: 'Comming soon...',
    },
  },
]
</script>

<template>
  <UDropdown
    v-if="team"
    v-slot="{ open }"
    mode="click"
    class="w-full"
    :items="[organizations, actions]"
    :ui="{ width: 'w-full' }"
    :popper="{ strategy: 'absolute' }"
  >
    <UButton
      color="gray"
      variant="ghost"
      :class="[open && 'bg-gray-50 dark:bg-gray-800']"
      class="w-full"
    >
      <UAvatar icon="i-lucide-building-2" size="xs" />

      <span class="truncate text-gray-900 dark:text-white font-semibold">{{ team.label }}</span>
    </UButton>
  </UDropdown>
</template>
