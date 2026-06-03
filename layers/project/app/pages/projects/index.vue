<script setup lang="ts">
import type { Project } from '@nuxthub/db/schema'
import type { CreateProject, UpdateProject } from '#layers/project/shared/schemas/project'
import { useProjectApi } from '#layers/project/app/api/useProjectApi'
import ProjectForm from '#layers/project/app/components/Project/ProjectForm.vue'
import ProjectList from '#layers/project/app/components/Project/ProjectList.vue'
import { projectsKey } from '#layers/project/app/composables/useProjects'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['project:read', 'project:write', 'project:manage'] })
useHead({ title: 'Projects' })

const api = useProjectApi()
const toast = useToast()

const saving = ref(false)
const modalOpen = ref(false)
const editingProject = ref<Project | null>(null)

const { data: projects, status, error, refresh } = useAsyncData<Project[]>('projects', () => api.fetchProjects(), { default: (): Project[] => [] })
whenError(error)

const loading = computed(() => status.value === 'pending')

provide(projectsKey, {
  projects,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
})

async function fetchProjects() {
  await refresh()
}

function openCreate() {
  editingProject.value = null
  modalOpen.value = true
}

function openEdit(project: Project) {
  editingProject.value = project
  modalOpen.value = true
}

async function handleSubmit(values: CreateProject | UpdateProject) {
  saving.value = true
  try {
    const isEdit = !!editingProject.value
    if (editingProject.value) {
      await api.updateProject(editingProject.value.id, values as UpdateProject)
    }
    else {
      await api.createProject(values as CreateProject)
    }
    await refresh()
    modalOpen.value = false
    toast.add({ title: isEdit ? 'Project updated' : 'Project created', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    saving.value = false
  }
}

async function createProject(body: CreateProject) {
  return api.createProject(body)
}

async function updateProject(id: string, body: UpdateProject) {
  return api.updateProject(id, body)
}

async function deleteProject(id: string) {
  await api.deleteProject(id)
  await refresh()
}

async function handleDelete(project: Project) {
  try {
    await deleteProject(project.id)
    toast.add({ title: 'Project deleted', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel id="projects">
    <template #header>
      <DashboardNavbar title="Projects">
        <template #right>
          <UButton icon="i-lucide-plus" label="New project" @click="openCreate()" />
        </template>
      </DashboardNavbar>
    </template>
    <template #body>
      <div class="max-w-3xl mx-auto p-4">
        <ProjectList
          :projects="projects"
          :loading="loading"
          @edit="openEdit"
          @delete="handleDelete"
        />
      </div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="modalOpen"
    :title="editingProject ? 'Edit project' : 'New project'"
  >
    <template #body>
      <ProjectForm
        :initial-values="editingProject ? { ...editingProject, description: editingProject.description ?? undefined } : undefined"
        :loading="saving"
        @submit="handleSubmit"
        @cancel="modalOpen = false"
      />
    </template>
  </UModal>
</template>
