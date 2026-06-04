<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Project } from '@nuxthub/db/schema'
import { useAbility } from '@casl/vue'

const props = defineProps<{ project: Project }>()
const emit = defineEmits<{ edit: [Project], delete: [Project] }>()

const ability = useAbility()
const { currentUser } = storeToRefs(useAuthStore())

const canManage = computed(() =>
  ability.can('manage', 'project') || props.project.created_by === currentUser.value?.id,
)

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    { label: 'View', icon: 'i-lucide-eye', to: `/projects/${props.project.id}` },
    ...(canManage.value
      ? [
          { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => emit('edit', props.project) },
          { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => emit('delete', props.project) },
        ]
      : []),
  ],
])
</script>

<template>
  <div class="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-highlighted hover:underline truncate">
          {{ project.name }}
        </NuxtLink>
        <UBadge
          :color="project.status === 'active' ? 'success' : 'neutral'"
          variant="subtle"
          size="xs"
        >
          {{ project.status }}
        </UBadge>
      </div>
      <p v-if="project.description" class="text-sm text-muted mt-0.5 truncate">
        {{ project.description }}
      </p>
    </div>
    <UDropdownMenu :items="menuItems">
      <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
    </UDropdownMenu>
  </div>
</template>
