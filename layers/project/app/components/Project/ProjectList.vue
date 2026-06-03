<script setup lang="ts">
import type { Project } from '@nuxthub/db/schema'
import ProjectItem from '#layers/project/app/components/Project/ProjectItem.vue'

defineProps<{
  projects: Project[]
  loading?: boolean
}>()

const emit = defineEmits<{ edit: [Project], delete: [Project] }>()
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-16 rounded-lg" />
    </div>
    <div v-else-if="projects.length === 0" class="text-center py-12 text-muted">
      <UIcon name="i-lucide-folder-kanban" class="size-10 mx-auto mb-3 opacity-40" />
      <p>No projects yet</p>
    </div>
    <div v-else class="space-y-3">
      <ProjectItem
        v-for="project in projects"
        :key="project.id"
        :project="project"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
